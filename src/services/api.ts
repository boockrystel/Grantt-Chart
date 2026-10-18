import {
  UserAccount,
  TaskItem,
  TaskSubmission,
  AttendanceRecord,
  MemberBacklogSummary,
  EfficiencyLeaderboardItem,
} from '../types';
import {
  PRECONFIGURED_USERS,
  INITIAL_TASKS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCE,
  COMPLETE_SQL_DDL,
} from '../data/seedData';

// Local storage database keys
const STORAGE_USERS = 'capstone_bp_users_v2';
const STORAGE_TASKS = 'capstone_bp_tasks_v2';
const STORAGE_SUBMISSIONS = 'capstone_bp_submissions_v2';
const STORAGE_ATTENDANCE = 'capstone_bp_attendance_v2';
const STORAGE_ACTIVE_USER = 'capstone_bp_active_user_v2';

// 30 minutes in milliseconds
export const THIRTY_MINUTES_MS = 30 * 60 * 1000;

// Helper to initialize local storage database if empty
function initializeLocalStorageDatabase() {
  const existingUsers = localStorage.getItem(STORAGE_USERS);
  if (!existingUsers) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(PRECONFIGURED_USERS));
  } else {
    try {
      const parsed: UserAccount[] = JSON.parse(existingUsers);
      if (!parsed[0]?.username) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(PRECONFIGURED_USERS));
      } else {
        // If stored avatars have old unsplash photo links, replace with clean SVG avatars
        const hasUnsplash = parsed.some(u => u.avatar && u.avatar.includes('unsplash.com'));
        if (hasUnsplash) {
          const updated = parsed.map(u => {
            if (u.avatar && u.avatar.includes('unsplash.com')) {
              const fresh = PRECONFIGURED_USERS.find(p => p.id === u.id);
              return fresh ? { ...u, avatar: fresh.avatar } : u;
            }
            return u;
          });
          localStorage.setItem(STORAGE_USERS, JSON.stringify(updated));

          const active = localStorage.getItem(STORAGE_ACTIVE_USER);
          if (active) {
            const activeUser: UserAccount = JSON.parse(active);
            if (activeUser.avatar && activeUser.avatar.includes('unsplash.com')) {
              const fresh = updated.find(u => u.id === activeUser.id);
              if (fresh) localStorage.setItem(STORAGE_ACTIVE_USER, JSON.stringify(fresh));
            }
          }
        }
      }
    } catch {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(PRECONFIGURED_USERS));
    }
  }
  if (!localStorage.getItem(STORAGE_TASKS)) {
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(INITIAL_TASKS));
  }
  if (!localStorage.getItem(STORAGE_SUBMISSIONS)) {
    localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
  }
  if (!localStorage.getItem(STORAGE_ATTENDANCE)) {
    localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
}

initializeLocalStorageDatabase();

export const apiService = {
  // Get active session user
  getActiveUser(): UserAccount | null {
    const raw = localStorage.getItem(STORAGE_ACTIVE_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setActiveUser(user: UserAccount | null) {
    if (user) {
      localStorage.setItem(STORAGE_ACTIVE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_USER);
    }
  },

  // Reset database to initial seed (for testing)
  resetDatabase() {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(PRECONFIGURED_USERS));
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  },

  // Get all 7 pre-configured users (synced with server across devices)
  async getUsers(): Promise<UserAccount[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          localStorage.setItem(STORAGE_USERS, JSON.stringify(data.users));
          // If active user is logged in, ensure their avatar and data match the server
          const active = this.getActiveUser();
          if (active) {
            const freshActive = data.users.find((u: UserAccount) => u.id === active.id);
            if (freshActive && freshActive.avatar !== active.avatar) {
              this.setActiveUser(freshActive);
            }
          }
          return data.users;
        }
      }
    } catch {
      // offline fallback
    }
    const local = localStorage.getItem(STORAGE_USERS);
    return local ? JSON.parse(local) : PRECONFIGURED_USERS;
  },

  // Update user profile picture (avatar) in localStorage and server
  async updateUserAvatar(userId: string, newAvatar: string): Promise<UserAccount> {
    let serverUser: UserAccount | null = null;
    try {
      const res = await fetch(`/api/users/${userId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: newAvatar }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          serverUser = data.user;
        }
      }
    } catch {
      // Offline fallback
    }

    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    const updated = serverUser || { ...users[index], avatar: newAvatar };
    users[index] = updated;
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

    const active = this.getActiveUser();
    if (active && active.id === userId) {
      this.setActiveUser(updated);
    }

    return updated;
  },

  // Authentication by Username / Email and Password
  async loginWithCredentials(
    usernameOrEmail: string,
    passwordInput: string
  ): Promise<{ user: UserAccount; attendance: AttendanceRecord; isFirstToday: boolean; message: string }> {
    const users = await this.getUsers();
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    const matchedUser = users.find(
      u =>
        u.username.toLowerCase() === cleanIdentifier ||
        u.email.toLowerCase() === cleanIdentifier
    );

    if (!matchedUser) {
      throw new Error('Account not found. Please enter a valid username or email.');
    }

    // Verify password (allows user-specific password or universal testing password)
    if (matchedUser.password !== cleanPassword && cleanPassword !== 'capstone2026') {
      throw new Error(`Incorrect password for ${matchedUser.username}. Try: "${matchedUser.password}"`);
    }

    return this.loginUser(matchedUser.id);
  },

  // Authentication & Auto-Attendance (runs immediately on login)
  async loginUser(userId: string): Promise<{ user: UserAccount; attendance: AttendanceRecord; isFirstToday: boolean; message: string }> {
    // Sync with server login endpoint
    let serverUser: UserAccount | null = null;
    let serverAtt: AttendanceRecord | null = null;
    let isFirstToday = false;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          serverUser = data.user;
          serverAtt = data.attendance;
          isFirstToday = !!data.isFirstToday;
        }
      }
    } catch {
      // offline fallback
    }

    const users = await this.getUsers();
    const user = serverUser || users.find(u => u.id === userId) || users[0];
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    let attendanceList: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_ATTENDANCE) || '[]');
    let record = serverAtt || attendanceList.find(a => a.userId === user.id && a.date === today);

    if (!record) {
      isFirstToday = true;
      record = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        date: today,
        timestamp: timeStr,
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 90 + 10),
        status: 'Present',
        notes: `Auto-Attendance Verified on Login (${timeStr}). Active proof of work session started.`,
      };
      attendanceList.unshift(record);
      localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(attendanceList));
    } else if (serverAtt && !attendanceList.some(a => a.id === serverAtt!.id)) {
      attendanceList.unshift(serverAtt);
      localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(attendanceList));
    }

    this.setActiveUser(user);

    return {
      user,
      attendance: record,
      isFirstToday,
      message: isFirstToday
        ? `Auto-attendance verified! Logged in as ${user.name} on ${today} at ${record.timestamp}.`
        : `Welcome back ${user.name}! Session active for today.`,
    };
  },

  // Get Attendance List
  async getAttendance(date?: string, userId?: string): Promise<AttendanceRecord[]> {
    try {
      const url = new URL('/api/attendance', window.location.origin);
      if (date) url.searchParams.set('date', date);
      if (userId) url.searchParams.set('userId', userId);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.records)) {
          localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(data.records));
          return data.records;
        }
      }
    } catch {}

    let list: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_ATTENDANCE) || '[]');
    if (date) list = list.filter(a => a.date === date);
    if (userId) list = list.filter(a => a.userId === userId);
    return list;
  },

  // Get Tasks with 1-day testing expiry evaluation (synced with server across devices)
  async getTasks(): Promise<TaskItem[]> {
    let tasks: TaskItem[] = [];
    let serverSuccess = false;
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks)) {
          tasks = data.tasks;
          serverSuccess = true;
        }
      }
    } catch {
      // offline fallback
    }

    if (!serverSuccess) {
      const local = localStorage.getItem(STORAGE_TASKS);
      tasks = local ? JSON.parse(local) : INITIAL_TASKS;
    }

    const now = Date.now();
    let hasChanges = false;

    // Evaluate 1-day testing expiration rule
    tasks = tasks.map(t => {
      // If task has testingExpiresAt and current time passed it, and not completed
      if (t.testingExpiresAt && t.status !== 'Completed') {
        const expiresMs = new Date(t.testingExpiresAt).getTime();
        if (now > expiresMs && t.status !== 'Expired') {
          hasChanges = true;
          return {
            ...t,
            status: 'Expired', // Turns red and cannot be answered anymore
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return t;
    });

    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    return tasks;
  },

  // Append new module / sub-task (Admin Task Registry)
  async createTask(newTaskData: {
    name: string;
    modulePhase: string;
    description: string;
    startDate: string;
    dueDate: string;
    priority: TaskItem['priority'];
    assigneeIds: string[];
    testingHoursWindow?: number; // defaults to 24 hours (1 day)
  }): Promise<TaskItem> {
    const hours = newTaskData.testingHoursWindow || 24;
    const testingExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    let serverTask: TaskItem | null = null;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTaskData,
          testingExpiresAt,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.task) {
          serverTask = data.task;
        }
      }
    } catch {}

    const tasks = await this.getTasks();
    const nextNumber = tasks.length + 1;

    const task: TaskItem = serverTask || {
      id: `task-${Date.now()}`,
      taskNumber: nextNumber,
      code: `TASK-${String(nextNumber).padStart(2, '0')}`,
      name: newTaskData.name.startsWith('Task ') ? newTaskData.name : `Task ${nextNumber}: ${newTaskData.name}`,
      modulePhase: newTaskData.modulePhase || 'Custom Module',
      description: newTaskData.description || 'Capstone development phase requirement.',
      startDate: newTaskData.startDate,
      dueDate: newTaskData.dueDate,
      testingExpiresAt, // 1 Day testing rule
      status: 'Not Started',
      progress: 0,
      priority: newTaskData.priority || 'Medium',
      assigneeIds: newTaskData.assigneeIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!tasks.some(t => t.id === task.id)) {
      tasks.push(task);
    }
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    return task;
  },

  // Update Task
  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    let serverTask: TaskItem | null = null;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.task) {
          serverTask = data.task;
        }
      }
    } catch {}

    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1 && !serverTask) throw new Error('Task not found');

    const updated = serverTask || { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    if (idx !== -1) {
      tasks[idx] = updated;
    } else {
      tasks.push(updated);
    }
    try {
      localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    } catch {}
    return updated;
  },

  // Delete Task (Admin / Project Leader action)
  async deleteTask(taskId: string): Promise<boolean> {
    // 1. Delete from backend server
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch {
      // offline fallback
    }

    // 2. Delete from local storage tasks
    const local = localStorage.getItem(STORAGE_TASKS);
    if (local) {
      try {
        const tasks: TaskItem[] = JSON.parse(local);
        const filtered = tasks.filter(t => t.id !== taskId);
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(filtered));
      } catch {}
    }

    // 3. Delete any submissions related to this task
    const subLocal = localStorage.getItem(STORAGE_SUBMISSIONS);
    if (subLocal) {
      try {
        const subs: TaskSubmission[] = JSON.parse(subLocal);
        const filteredSubs = subs.filter(s => s.taskId !== taskId);
        localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(filteredSubs));
      } catch {}
    }

    return true;
  },

  // Reset or extend a task's 1-day testing window (for testing/demo)
  async resetTaskTestingWindow(id: string, hours: number = 24): Promise<TaskItem> {
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    return this.updateTask(id, {
      testingExpiresAt: expiresAt,
      status: 'In Progress',
    });
  },

  // Submit Interactive Form Update (Enhancements, Improvements, Suggestions, Proof Attachment)
  // Enforces 1-day testing expiry check: If expired, cannot submit!
  async submitTaskProgress(
    taskId: string,
    submissionData: {
      submittedByUserId: string;
      submittedByName: string;
      enhancements: string;
      improvements: string;
      otherSuggestions: string;
      attachmentUrl: string;
      attachmentName: string;
      attachmentType: string;
      progressReported: number;
    }
  ): Promise<{ submission: TaskSubmission; task: TaskItem }> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    // Rule: if 1 day has passed without completing, it is locked ("hindi na masagutan")
    if (task.status === 'Expired') {
      throw new Error('Nalampasan na ang 1 day testing window para sa task na ito. Naka-lock na at hindi na masagutan.');
    }

    let serverSub: TaskSubmission | null = null;
    let serverTask: TaskItem | null = null;

    try {
      const res = await fetch(`/api/tasks/${taskId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.submission) {
          serverSub = data.submission;
          serverTask = data.task || null;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message) throw new Error(errData.message);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('30 minutes') || err.message.includes('required'))) {
        throw err;
      }
      // offline fallback
    }

    const now = new Date();
    const newSub: TaskSubmission = serverSub || {
      id: `sub-${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      modulePhase: task.modulePhase,
      submittedByUserId: submissionData.submittedByUserId,
      submittedByName: submissionData.submittedByName,
      enhancements: submissionData.enhancements.trim(),
      improvements: submissionData.improvements.trim(),
      otherSuggestions: (submissionData.otherSuggestions || '').trim(),
      attachmentUrl: submissionData.attachmentUrl,
      attachmentName: submissionData.attachmentName || 'proof_attachment.png',
      attachmentType: submissionData.attachmentType || 'image/png',
      progressReported: submissionData.progressReported,
      status: 'Pending Review',
      submittedAt: now.toISOString(),
      isArchived: false,
    };

    const submissions = await this.getSubmissions();
    const existingIdx = submissions.findIndex(
      s => s.taskId === taskId && s.submittedByUserId === submissionData.submittedByUserId
    );
    if (existingIdx !== -1) {
      submissions[existingIdx] = newSub;
    } else {
      submissions.unshift(newSub);
    }

    try {
      localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(submissions));
    } catch {}

    const updatedTask = serverTask || task;
    if (!serverTask && submissionData.progressReported > task.progress) {
      updatedTask.progress = submissionData.progressReported;
      if (updatedTask.progress >= 100) updatedTask.status = 'In Review';
      else if (updatedTask.progress > 0 && updatedTask.status === 'Not Started') updatedTask.status = 'In Progress';
      updatedTask.updatedAt = now.toISOString();
      const taskIdx = tasks.findIndex(t => t.id === taskId);
      if (taskIdx !== -1) tasks[taskIdx] = updatedTask;
      try {
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
      } catch {}
    }

    return { submission: newSub, task: updatedTask };
  },

  // Edit Submission within 30-minute window
  // Rule: After 30 mins, cannot be edited anymore and archived in member's acc
  async editSubmission(
    submissionId: string,
    updates: {
      enhancements: string;
      improvements: string;
      otherSuggestions: string;
      attachmentUrl?: string;
      attachmentName?: string;
    }
  ): Promise<TaskSubmission> {
    let serverSub: TaskSubmission | null = null;
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.submission) {
          serverSub = data.submission;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message) throw new Error(errData.message);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('30 minutes') || err.message.includes('archive'))) {
        throw err;
      }
    }

    const subs = await this.getSubmissions();
    const sub = subs.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const elapsed = Date.now() - new Date(sub.submittedAt).getTime();
    if (elapsed > THIRTY_MINUTES_MS || sub.isArchived) {
      sub.isArchived = true;
      try {
        localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(subs));
      } catch {}
      throw new Error('Lumipas na ang 30 minutes! Naka-archive na ang sagot mo at hindi na pwedeng galawin o i-edit.');
    }

    const updated = serverSub || {
      ...sub,
      enhancements: updates.enhancements.trim(),
      improvements: updates.improvements.trim(),
      otherSuggestions: updates.otherSuggestions.trim(),
      ...(updates.attachmentUrl ? { attachmentUrl: updates.attachmentUrl } : {}),
      ...(updates.attachmentName ? { attachmentName: updates.attachmentName } : {}),
    };

    const idx = subs.findIndex(s => s.id === submissionId);
    if (idx !== -1) subs[idx] = updated;
    try {
      localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(subs));
    } catch {}

    return updated;
  },

  // Get Submissions with real-time server sync & 30-minute auto-archive check
  async getSubmissions(taskId?: string, userId?: string, status?: string): Promise<TaskSubmission[]> {
    try {
      const url = new URL('/api/submissions', window.location.origin);
      if (taskId) url.searchParams.set('taskId', taskId);
      if (userId) url.searchParams.set('userId', userId);
      if (status) url.searchParams.set('status', status);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          try {
            localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(data.submissions));
          } catch {}
          return data.submissions;
        }
      }
    } catch {
      // offline fallback
    }

    let list: TaskSubmission[] = [];
    try {
      const local = localStorage.getItem(STORAGE_SUBMISSIONS);
      list = local ? JSON.parse(local) : INITIAL_SUBMISSIONS;
    } catch {
      list = INITIAL_SUBMISSIONS;
    }

    const now = Date.now();
    let changed = false;

    // Check 30-minute auto-archive rule
    list = list.map(sub => {
      if (!sub.isArchived) {
        const elapsed = now - new Date(sub.submittedAt).getTime();
        if (elapsed >= THIRTY_MINUTES_MS) {
          changed = true;
          return {
            ...sub,
            isArchived: true,
            archivedAt: new Date(new Date(sub.submittedAt).getTime() + THIRTY_MINUTES_MS).toISOString(),
          };
        }
      }
      return sub;
    });

    if (changed) {
      try {
        localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(list));
      } catch {}
    }

    if (taskId) list = list.filter(s => s.taskId === taskId);
    if (userId) list = list.filter(s => s.submittedByUserId === userId);
    if (status) list = list.filter(s => s.status === status);
    return list;
  },

  // Review Submission (Admin Audit Hub)
  async reviewSubmission(
    submissionId: string,
    reviewData: {
      status: 'Approved' | 'Changes Requested';
      adminFeedback: string;
      reviewedBy: string;
      updateTaskToComplete?: boolean;
    }
  ): Promise<TaskSubmission> {
    let serverSub: TaskSubmission | null = null;
    try {
      const res = await fetch(`/api/submissions/${submissionId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.submission) {
          serverSub = data.submission;
        }
      }
    } catch {}

    const subs = await this.getSubmissions();
    const sub = subs.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const updated = serverSub || {
      ...sub,
      status: reviewData.status,
      adminFeedback: reviewData.adminFeedback,
      reviewedBy: reviewData.reviewedBy,
      reviewedAt: new Date().toISOString(),
    };

    const idx = subs.findIndex(s => s.id === submissionId);
    if (idx !== -1) subs[idx] = updated;
    try {
      localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(subs));
    } catch {}

    if (reviewData.updateTaskToComplete && reviewData.status === 'Approved') {
      const tasks = await this.getTasks();
      const t = tasks.find(task => task.id === sub.taskId);
      if (t) {
        await this.updateTask(t.id, {
          status: 'Completed',
          progress: 100,
        });
      }
    }

    return updated;
  },

  // Admin Task Backlog Matrix (Live server calculation with fallback)
  async getBacklogMatrix(): Promise<{
    totalUncompletedTasks: number;
    uncompletedTasks: TaskItem[];
    memberBacklog: MemberBacklogSummary[];
  }> {
    try {
      const res = await fetch('/api/admin/backlog-matrix');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.memberBacklog) {
          return {
            totalUncompletedTasks: data.totalUncompletedTasks,
            uncompletedTasks: data.uncompletedTasks,
            memberBacklog: data.memberBacklog,
          };
        }
      }
    } catch {}

    const users = await this.getUsers();
    const tasks = await this.getTasks();
    const submissions = await this.getSubmissions();
    const today = new Date().toISOString().split('T')[0];
    const uncompletedTasks = tasks.filter(t => t.status !== 'Completed');

    const memberBacklog: MemberBacklogSummary[] = users.map(user => {
      const assignedTasks = tasks.filter(t => t.assigneeIds.includes(user.id));
      const completedTasks = assignedTasks.filter(t => t.status === 'Completed');
      const inProgressTasks = assignedTasks.filter(t => t.status === 'In Progress');
      const notStartedTasks = assignedTasks.filter(t => t.status === 'Not Started');
      const overdueTasks = assignedTasks.filter(
        t => (t.status === 'Expired' || t.status !== 'Completed') && t.dueDate < today
      );
      const userSubs = submissions.filter(s => s.submittedByUserId === user.id);

      let lagStatus: MemberBacklogSummary['lagStatus'] = 'On Track';
      let lagReason = 'All assigned modules on schedule';

      if (assignedTasks.some(t => t.status === 'Expired')) {
        lagStatus = 'Overdue';
        lagReason = 'May task na nag-expire ang 1 day testing window (Naka-red at locked)';
      } else if (overdueTasks.length > 0) {
        lagStatus = 'Overdue';
        lagReason = `${overdueTasks.length} module(s) past deadline: ${overdueTasks.map(t => t.name).join(', ')}`;
      } else if (notStartedTasks.length > 1 && userSubs.length === 0) {
        lagStatus = 'Lagging Behind';
        lagReason = `Multiple unstarted modules with 0 verified proof submissions`;
      } else if (notStartedTasks.length > 0) {
        lagStatus = 'Attention Needed';
        lagReason = `Has ${notStartedTasks.length} module(s) in Not Started state`;
      }

      return {
        user,
        assignedCount: assignedTasks.length,
        completedCount: completedTasks.length,
        inProgressCount: inProgressTasks.length,
        notStartedCount: notStartedTasks.length,
        overdueCount: overdueTasks.length,
        submissionsCount: userSubs.length,
        lagStatus,
        lagReason,
        overdueTasks,
        notStartedTasks,
      };
    });

    return {
      totalUncompletedTasks: uncompletedTasks.length,
      uncompletedTasks,
      memberBacklog,
    };
  },

  // Admin Efficiency Leaderboard (Live server calculation with fallback)
  async getEfficiencyRanking(): Promise<EfficiencyLeaderboardItem[]> {
    try {
      const res = await fetch('/api/admin/efficiency-ranking');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.ranking)) {
          return data.ranking;
        }
      }
    } catch {}

    const users = await this.getUsers();
    const tasks = await this.getTasks();
    const submissions = await this.getSubmissions();
    const attendance = await this.getAttendance();

    const ranking: EfficiencyLeaderboardItem[] = users.map(user => {
      const assigned = tasks.filter(t => t.assigneeIds.includes(user.id));
      const completed = assigned.filter(t => t.status === 'Completed').length;
      const userSubs = submissions.filter(s => s.submittedByUserId === user.id);
      const approved = userSubs.filter(s => s.status === 'Approved').length;
      const attendanceDays = new Set(attendance.filter(a => a.userId === user.id).map(a => a.date)).size;

      const productivityScore =
        completed * 30 + approved * 25 + userSubs.length * 10 + attendanceDays * 15;

      let efficiencyRating: EfficiencyLeaderboardItem['efficiencyRating'] = 'Active Progress';
      if (productivityScore >= 120) efficiencyRating = 'Elite Contributor';
      else if (productivityScore >= 70) efficiencyRating = 'Proficient';
      else if (productivityScore <= 30) efficiencyRating = 'Needs Push';

      return {
        user,
        assignedCount: assigned.length,
        completedCount: completed,
        totalSubmissions: userSubs.length,
        approvedSubmissions: approved,
        attendanceDays,
        productivityScore,
        efficiencyRating,
      };
    });

    ranking.sort((a, b) => b.productivityScore - a.productivityScore);
    return ranking;
  },

  async getSqlDdl(): Promise<string> {
    return COMPLETE_SQL_DDL;
  },
};
