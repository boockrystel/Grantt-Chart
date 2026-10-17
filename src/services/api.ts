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
      const parsed = JSON.parse(existingUsers);
      if (!parsed[0]?.username) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(PRECONFIGURED_USERS));
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

  // Get all 7 pre-configured users
  async getUsers(): Promise<UserAccount[]> {
    const local = localStorage.getItem(STORAGE_USERS);
    return local ? JSON.parse(local) : PRECONFIGURED_USERS;
  },

  // Update user profile picture (avatar) in localStorage
  async updateUserAvatar(userId: string, newAvatar: string): Promise<UserAccount> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], avatar: newAvatar };
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

    const active = this.getActiveUser();
    if (active && active.id === userId) {
      this.setActiveUser(users[index]);
    }
    return users[index];
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
    const users = await this.getUsers();
    const user = users.find(u => u.id === userId) || users[0];
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    let attendanceList: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_ATTENDANCE) || '[]');
    let record = attendanceList.find(a => a.userId === user.id && a.date === today);
    let isFirstToday = false;

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
    }

    this.setActiveUser(user);

    return {
      user,
      attendance: record,
      isFirstToday,
      message: isFirstToday
        ? `Auto-attendance verified! Logged in as ${user.name} on ${today} at ${timeStr}.`
        : `Welcome back ${user.name}! Session active for today.`,
    };
  },

  // Get Attendance List
  async getAttendance(date?: string, userId?: string): Promise<AttendanceRecord[]> {
    let list: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_ATTENDANCE) || '[]');
    if (date) list = list.filter(a => a.date === date);
    if (userId) list = list.filter(a => a.userId === userId);
    return list;
  },

  // Get Tasks with 1-day testing expiry evaluation
  async getTasks(): Promise<TaskItem[]> {
    const local = localStorage.getItem(STORAGE_TASKS);
    let tasks: TaskItem[] = local ? JSON.parse(local) : INITIAL_TASKS;

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

    if (hasChanges) {
      localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    }

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
    const tasks = await this.getTasks();
    const nextNumber = tasks.length + 1;
    const hours = newTaskData.testingHoursWindow || 24;
    const testingExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    const task: TaskItem = {
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

    tasks.push(task);
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    return task;
  },

  // Update Task
  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');

    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    return tasks[idx];
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

    const now = new Date();
    const newSub: TaskSubmission = {
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
      isArchived: false, // will become archived after 30 mins
    };

    const submissions = await this.getSubmissions();
    submissions.unshift(newSub);
    localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(submissions));

    if (submissionData.progressReported > task.progress) {
      task.progress = submissionData.progressReported;
      if (task.progress >= 100) task.status = 'In Review';
      else if (task.progress > 0 && task.status === 'Not Started') task.status = 'In Progress';
      task.updatedAt = now.toISOString();
      localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
    }

    return { submission: newSub, task };
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
    const subs = await this.getSubmissions();
    const sub = subs.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    const elapsed = Date.now() - new Date(sub.submittedAt).getTime();
    if (elapsed > THIRTY_MINUTES_MS || sub.isArchived) {
      sub.isArchived = true;
      localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(subs));
      throw new Error('Lumipas na ang 30 minutes! Naka-archive na ang sagot mo at hindi na pwedeng galawin o i-edit.');
    }

    sub.enhancements = updates.enhancements.trim();
    sub.improvements = updates.improvements.trim();
    sub.otherSuggestions = updates.otherSuggestions.trim();
    if (updates.attachmentUrl) sub.attachmentUrl = updates.attachmentUrl;
    if (updates.attachmentName) sub.attachmentName = updates.attachmentName;

    localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(subs));
    return sub;
  },

  // Get Submissions with 30-minute auto-archive check
  async getSubmissions(taskId?: string, userId?: string, status?: string): Promise<TaskSubmission[]> {
    let list: TaskSubmission[] = JSON.parse(localStorage.getItem(STORAGE_SUBMISSIONS) || '[]');
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
      localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(list));
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
    const subs = await this.getSubmissions();
    const sub = subs.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    sub.status = reviewData.status;
    sub.adminFeedback = reviewData.adminFeedback;
    sub.reviewedBy = reviewData.reviewedBy;
    sub.reviewedAt = new Date().toISOString();

    if (reviewData.updateTaskToComplete && reviewData.status === 'Approved') {
      const tasks = await this.getTasks();
      const t = tasks.find(task => task.id === sub.taskId);
      if (t) {
        t.status = 'Completed';
        t.progress = 100;
        t.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(tasks));
      }
    }

    localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(subs));
    return sub;
  },

  // Admin Task Backlog Matrix
  async getBacklogMatrix(): Promise<{
    totalUncompletedTasks: number;
    uncompletedTasks: TaskItem[];
    memberBacklog: MemberBacklogSummary[];
  }> {
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

  // Admin Efficiency Leaderboard
  async getEfficiencyRanking(): Promise<EfficiencyLeaderboardItem[]> {
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
