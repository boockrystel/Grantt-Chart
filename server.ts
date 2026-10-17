import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial Seed Data for the 7 Pre-configured Capstone Accounts
export interface UserAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'Admin' | 'Member';
  title: string;
  email: string;
  avatar: string;
}

function getInitialAvatar(name: string, bg: string = '#ec4899', color: string = '#ffffff'): string {
  const parts = name.replace(/,/g, '').trim().split(/\s+/);
  const initials = parts.length >= 2 
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
    : (name.slice(0, 2).toUpperCase() || 'CP');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" rx="36" fill="${bg}"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="${color}" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PRECONFIGURED_USERS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Cabildo, Kathlyn Joyce',
    username: 'kathlyn.cabildo',
    password: 'pl_password2026',
    role: 'Admin',
    title: 'Project Leader (Admin)',
    email: 'cabildo.kj@capstone.edu',
    avatar: getInitialAvatar('Kathlyn Cabildo', '#be185d', '#ffffff'),
  },
  {
    id: 'user-2',
    name: 'Almira, Eugene',
    username: 'eugene.almira',
    password: 'backend_pass2026',
    role: 'Member',
    title: 'Back-end Developer (Member)',
    email: 'almira.e@capstone.edu',
    avatar: getInitialAvatar('Eugene Almira', '#831843', '#fbcfe8'),
  },
  {
    id: 'user-3',
    name: 'Amponin, John Alexis',
    username: 'alexis.amponin',
    password: 'data_pass2026',
    role: 'Member',
    title: 'Data Gatherer (Member)',
    email: 'amponin.ja@capstone.edu',
    avatar: getInitialAvatar('Alexis Amponin', '#4c0519', '#f472b6'),
  },
  {
    id: 'user-4',
    name: 'Booc, Krystel Kaye',
    username: 'krystel.booc',
    password: 'docs_pass2026',
    role: 'Member',
    title: 'Head Documentation (Member)',
    email: 'boockrystel@gmail.com',
    avatar: getInitialAvatar('Krystel Booc', '#db2777', '#ffffff'),
  },
  {
    id: 'user-5',
    name: 'Catubay, Mark Lawrence',
    username: 'lawrence.catubay',
    password: 'qa_pass2026',
    role: 'Member',
    title: 'Quality Assurance / System Analyst (Member)',
    email: 'catubay.ml@capstone.edu',
    avatar: getInitialAvatar('Lawrence Catubay', '#9d174d', '#ffffff'),
  },
  {
    id: 'user-6',
    name: 'Sunga, Aiman Charmount',
    username: 'aiman.sunga',
    password: 'data_pass2026',
    role: 'Member',
    title: 'Data Gatherer (Member)',
    email: 'sunga.ac@capstone.edu',
    avatar: getInitialAvatar('Aiman Sunga', '#701a75', '#ffffff'),
  },
  {
    id: 'user-7',
    name: 'Tapales, JohnRic',
    username: 'johnric.tapales',
    password: 'data_pass2026',
    role: 'Member',
    title: 'Data Gatherer (Member)',
    email: 'tapales.jr@capstone.edu',
    avatar: getInitialAvatar('JohnRic Tapales', '#500724', '#fbcfe8'),
  },
];

// Attendance Record Model
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // HH:MM:SS AM/PM
  ipAddress: string;
  status: 'Present' | 'Late' | 'Active Working';
  notes: string;
}

// Task Model for Gantt and Tracking
export interface TaskItem {
  id: string;
  taskNumber: number;
  code: string;
  name: string; // e.g. "Task 1: Index"
  modulePhase: 'Index' | 'Dashboard' | 'Admin' | 'Staff' | 'Database' | 'Security QA' | 'Documentation' | string;
  description: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Completed';
  progress: number; // 0 - 100
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigneeIds: string[]; // user IDs
  createdAt: string;
  updatedAt: string;
}

// Submission / Form Update Model
export interface TaskSubmission {
  id: string;
  taskId: string;
  taskName: string;
  modulePhase: string;
  submittedByUserId: string;
  submittedByName: string;
  enhancements: string; // Features to add
  improvements: string; // Code or UI optimization
  otherSuggestions: string; // System feedback
  attachmentUrl: string; // Base64 or URL
  attachmentName: string;
  attachmentType: string;
  progressReported: number;
  status: 'Pending Review' | 'Approved' | 'Changes Requested';
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
}

// Initial Database in Memory with Persistent Disk Snapshot
const DB_FILE = path.join(__dirname, '.capstone_data.json');

interface AppDatabase {
  users: UserAccount[];
  attendance: AttendanceRecord[];
  tasks: TaskItem[];
  submissions: TaskSubmission[];
}

function getInitialTasks(): TaskItem[] {
  return [
    {
      id: 'task-1',
      taskNumber: 1,
      code: 'TASK-01',
      name: 'Task 1: Index',
      modulePhase: 'Index',
      description: 'Landing page, public access gateway, university hero showcase, authentication navigation & system information portal.',
      startDate: '2026-10-01',
      dueDate: '2026-10-08',
      status: 'Completed',
      progress: 100,
      priority: 'High',
      assigneeIds: ['user-2', 'user-4'], // Almira, Booc
      createdAt: '2026-10-01T08:00:00.000Z',
      updatedAt: '2026-10-08T16:30:00.000Z',
    },
    {
      id: 'task-2',
      taskNumber: 2,
      code: 'TASK-02',
      name: 'Task 2: Dashboard',
      modulePhase: 'Dashboard',
      description: 'Interactive real-time analytics hub, project metrics, velocity gauges, student/staff summary widgets & quick actions.',
      startDate: '2026-10-06',
      dueDate: '2026-10-15',
      status: 'In Progress',
      progress: 75,
      priority: 'Critical',
      assigneeIds: ['user-2', 'user-5'], // Almira, Catubay
      createdAt: '2026-10-06T08:00:00.000Z',
      updatedAt: '2026-10-14T11:20:00.000Z',
    },
    {
      id: 'task-3',
      taskNumber: 3,
      code: 'TASK-03',
      name: 'Task 3: Admin',
      modulePhase: 'Admin',
      description: 'Role-based access control, system configuration panel, security audit log, member assignment control & approval matrix.',
      startDate: '2026-10-12',
      dueDate: '2026-10-22',
      status: 'In Progress',
      progress: 40,
      priority: 'Critical',
      assigneeIds: ['user-1', 'user-5'], // Cabildo, Catubay
      createdAt: '2026-10-12T08:00:00.000Z',
      updatedAt: '2026-10-16T09:00:00.000Z',
    },
    {
      id: 'task-4',
      taskNumber: 4,
      code: 'TASK-04',
      name: 'Task 4: Staff',
      modulePhase: 'Staff',
      description: 'Staff operational workflows, task intake pipelines, inventory/document verification views & reporting tools.',
      startDate: '2026-10-16',
      dueDate: '2026-10-26',
      status: 'Not Started',
      progress: 10,
      priority: 'High',
      assigneeIds: ['user-3', 'user-6', 'user-7'], // Amponin, Sunga, Tapales
      createdAt: '2026-10-16T08:00:00.000Z',
      updatedAt: '2026-10-16T08:00:00.000Z',
    },
    {
      id: 'task-5',
      taskNumber: 5,
      code: 'TASK-05',
      name: 'Task 5: Database & Security',
      modulePhase: 'Database',
      description: 'Normalized PostgreSQL schema, Row-Level Security policies, Supabase cloud sync & query optimization indexing.',
      startDate: '2026-10-18',
      dueDate: '2026-10-29',
      status: 'In Progress',
      progress: 30,
      priority: 'Critical',
      assigneeIds: ['user-2', 'user-5'], // Almira, Catubay
      createdAt: '2026-10-16T08:00:00.000Z',
      updatedAt: '2026-10-16T08:00:00.000Z',
    },
    {
      id: 'task-6',
      taskNumber: 6,
      code: 'TASK-06',
      name: 'Task 6: Field Data Gathering & Benchmarking',
      modulePhase: 'Data Gathering',
      description: 'Field research interview consolidation, stakeholder surveys, user persona validations & sample data generation.',
      startDate: '2026-10-04',
      dueDate: '2026-10-18',
      status: 'In Review',
      progress: 85,
      priority: 'Medium',
      assigneeIds: ['user-3', 'user-6', 'user-7'], // Amponin, Sunga, Tapales
      createdAt: '2026-10-04T08:00:00.000Z',
      updatedAt: '2026-10-15T15:00:00.000Z',
    },
    {
      id: 'task-7',
      taskNumber: 7,
      code: 'TASK-07',
      name: 'Task 7: Capstone Manuscript & Quality Audit',
      modulePhase: 'Documentation',
      description: 'Chapter 1 to 5 documentation formatting, system architecture diagrams, user manual & defense presentation deck.',
      startDate: '2026-10-10',
      dueDate: '2026-10-31',
      status: 'In Progress',
      progress: 60,
      priority: 'High',
      assigneeIds: ['user-4', 'user-1'], // Booc, Cabildo
      createdAt: '2026-10-10T08:00:00.000Z',
      updatedAt: '2026-10-16T14:30:00.000Z',
    },
  ];
}

function getInitialSubmissions(): TaskSubmission[] {
  return [
    {
      id: 'sub-1',
      taskId: 'task-1',
      taskName: 'Task 1: Index',
      modulePhase: 'Index',
      submittedByUserId: 'user-2',
      submittedByName: 'Almira, Eugene',
      enhancements: 'Added responsive navbar with university badge, quick portal route transitions, and auto-redirect to active session.',
      improvements: 'Optimized hero asset loading using WebP format, reduced bundle hydration time from 1.2s to 400ms.',
      otherSuggestions: 'Recommend enabling dark mode toggle for night research and defense panel viewing.',
      attachmentUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      attachmentName: 'index_module_screenshot.png',
      attachmentType: 'image/png',
      progressReported: 100,
      status: 'Approved',
      adminFeedback: 'Excellent UI layout and responsive structure. Approved by PL.',
      reviewedBy: 'Cabildo, Kathlyn Joyce',
      reviewedAt: '2026-10-08T17:00:00.000Z',
      submittedAt: '2026-10-08T16:25:00.000Z',
    },
    {
      id: 'sub-2',
      taskId: 'task-2',
      taskName: 'Task 2: Dashboard',
      modulePhase: 'Dashboard',
      submittedByUserId: 'user-5',
      submittedByName: 'Catubay, Mark Lawrence',
      enhancements: 'Integrated real-time progress gauge charts, task backlog cards, and status filter chips.',
      improvements: 'Refactored state listeners to prevent excessive re-renders during milestone updates.',
      otherSuggestions: 'We should link the efficiency leaderboard directly to individual task completion points.',
      attachmentUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      attachmentName: 'dashboard_metrics_preview.png',
      attachmentType: 'image/png',
      progressReported: 75,
      status: 'Approved',
      adminFeedback: 'Great analytical layout. Ensure accessibility contrast on chart labels.',
      reviewedBy: 'Cabildo, Kathlyn Joyce',
      reviewedAt: '2026-10-14T14:00:00.000Z',
      submittedAt: '2026-10-14T11:15:00.000Z',
    },
    {
      id: 'sub-3',
      taskId: 'task-6',
      taskName: 'Task 6: Field Data Gathering & Benchmarking',
      modulePhase: 'Data Gathering',
      submittedByUserId: 'user-3',
      submittedByName: 'Amponin, John Alexis',
      enhancements: 'Gathered 140 validated student survey responses across 3 engineering departments.',
      improvements: 'Categorized user pain points into 4 high-impact feature clusters for the Staff module.',
      otherSuggestions: 'Aiman and JohnRic have secondary interview recordings ready for transcription.',
      attachmentUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
      attachmentName: 'survey_data_clusters.png',
      attachmentType: 'image/png',
      progressReported: 85,
      status: 'Pending Review',
      submittedAt: '2026-10-15T14:50:00.000Z',
    },
    {
      id: 'sub-4',
      taskId: 'task-7',
      taskName: 'Task 7: Capstone Manuscript & Quality Audit',
      modulePhase: 'Documentation',
      submittedByUserId: 'user-4',
      submittedByName: 'Booc, Krystel Kaye',
      enhancements: 'Compiled Chapter 3 Research Methodology and updated Gantt chart diagram for Chapter 4.',
      improvements: 'Standardized citation formatting to IEEE/APA and aligned figure captions with rubric guidelines.',
      otherSuggestions: 'Need final database ERD from Eugene and security summary from Mark Lawrence before binding draft.',
      attachmentUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
      attachmentName: 'manuscript_draft_chapter3.png',
      attachmentType: 'image/png',
      progressReported: 60,
      status: 'Pending Review',
      submittedAt: '2026-10-16T14:10:00.000Z',
    },
  ];
}

function getInitialAttendance(): AttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'att-1',
      userId: 'user-1',
      userName: 'Cabildo, Kathlyn Joyce',
      userRole: 'Admin',
      date: today,
      timestamp: '07:45:12 AM',
      ipAddress: '192.168.1.101',
      status: 'Present',
      notes: 'PL Session Initiated - Admin Monitoring Active',
    },
    {
      id: 'att-2',
      userId: 'user-4',
      userName: 'Booc, Krystel Kaye',
      userRole: 'Member',
      date: today,
      timestamp: '08:12:44 AM',
      ipAddress: '192.168.1.104',
      status: 'Present',
      notes: 'Logged in for Manuscript Chapter 4 Documentation Proof',
    },
    {
      id: 'att-3',
      userId: 'user-2',
      userName: 'Almira, Eugene',
      userRole: 'Member',
      date: today,
      timestamp: '08:25:30 AM',
      ipAddress: '192.168.1.102',
      status: 'Present',
      notes: 'Logged in for Database Schema Migration & API refinement',
    },
  ];
}

// Load or Initialize DB
let db: AppDatabase;
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
    // Ensure all 7 users exist while PRESERVING user-customized profile pictures across restarts and devices!
    const existingMap = new Map((db.users || []).map((u: UserAccount) => [u.id, u]));
    db.users = PRECONFIGURED_USERS.map(pUser => {
      const existing = existingMap.get(pUser.id);
      return existing && existing.avatar ? { ...pUser, ...existing, avatar: existing.avatar } : pUser;
    });
  } else {
    db = {
      users: PRECONFIGURED_USERS,
      attendance: getInitialAttendance(),
      tasks: getInitialTasks(),
      submissions: getInitialSubmissions(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
} catch {
  db = {
    users: PRECONFIGURED_USERS,
    attendance: getInitialAttendance(),
    tasks: getInitialTasks(),
    submissions: getInitialSubmissions(),
  };
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

// ---------------- API ROUTES ----------------

// Get all pre-configured accounts
app.get('/api/users', (_req: Request, res: Response) => {
  res.json({ success: true, users: db.users });
});

// Update user avatar
app.put('/api/users/:id/avatar', (req: Request, res: Response) => {
  const { id } = req.params;
  const { avatar } = req.body;
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.avatar = avatar;
  saveDb();
  res.json({ success: true, user });
});

// Authentication & Auto-Attendance Logging Endpoint
// Attendance Rule: The exact moment a Member (or user) logs in, the system must automatically log their attendance for that calendar day
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { userId, email } = req.body;
  const user = db.users.find(u => u.id === userId || u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  // Check if attendance already logged for today
  let attendanceRecord = db.attendance.find(a => a.userId === user.id && a.date === dateStr);
  let isFirstToday = false;

  if (!attendanceRecord) {
    isFirstToday = true;
    attendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      date: dateStr,
      timestamp: timeStr,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      status: 'Present',
      notes: `Auto-Attendance Verified on Login (${timeStr}). Active proof of work session started.`,
    };
    db.attendance.unshift(attendanceRecord);
    saveDb();
  }

  res.json({
    success: true,
    user,
    attendance: attendanceRecord,
    isFirstToday,
    message: isFirstToday
      ? `Auto-attendance verified! Logged in as ${user.name} on ${dateStr} at ${timeStr}.`
      : `Welcome back ${user.name}! Session active for today.`,
  });
});

// Get Attendance History & Today's active records
app.get('/api/attendance', (req: Request, res: Response) => {
  const { date, userId } = req.query;
  let records = db.attendance;

  if (date) {
    records = records.filter(r => r.date === date);
  }
  if (userId) {
    records = records.filter(r => r.userId === userId);
  }

  res.json({ success: true, count: records.length, records });
});

// Get Tasks for Gantt Chart
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json({ success: true, tasks: db.tasks });
});

// Create New Task (Admin Task Registry)
app.post('/api/tasks', (req: Request, res: Response) => {
  const { name, modulePhase, description, startDate, dueDate, priority, assigneeIds } = req.body;

  if (!name || !startDate || !dueDate) {
    return res.status(400).json({ success: false, message: 'Missing required task details.' });
  }

  const nextNumber = db.tasks.length + 1;
  const newTask: TaskItem = {
    id: `task-${Date.now()}`,
    taskNumber: nextNumber,
    code: `TASK-${String(nextNumber).padStart(2, '0')}`,
    name: name.startsWith('Task ') ? name : `Task ${nextNumber}: ${name}`,
    modulePhase: modulePhase || 'Custom Module',
    description: description || 'Capstone development phase requirement.',
    startDate,
    dueDate,
    status: 'Not Started',
    progress: 0,
    priority: priority || 'Medium',
    assigneeIds: Array.isArray(assigneeIds) ? assigneeIds : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks.push(newTask);
  saveDb();

  res.json({ success: true, task: newTask, message: 'New module successfully appended to Gantt registry.' });
});

// Update Task Progress / Status
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = db.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const { status, progress, priority, assigneeIds, description, name, startDate, dueDate } = req.body;

  if (status !== undefined) task.status = status;
  if (progress !== undefined) task.progress = Number(progress);
  if (priority !== undefined) task.priority = priority;
  if (assigneeIds !== undefined) task.assigneeIds = assigneeIds;
  if (description !== undefined) task.description = description;
  if (name !== undefined) task.name = name;
  if (startDate !== undefined) task.startDate = startDate;
  if (dueDate !== undefined) task.dueDate = dueDate;

  task.updatedAt = new Date().toISOString();
  saveDb();

  res.json({ success: true, task, message: 'Task updated successfully.' });
});

// Delete Task (Admin / Project Leader action)
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const [removedTask] = db.tasks.splice(index, 1);
  // Remove related submissions
  db.submissions = db.submissions.filter(s => s.taskId !== id);
  saveDb();

  res.json({
    success: true,
    message: `Task "${removedTask.name}" has been permanently deleted.`,
    deletedTaskId: id,
  });
});

// Interactive Table Submission: Member adds Enhancements, Improvements, Suggestions, & Attachment
app.post('/api/tasks/:id/submissions', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = db.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const {
    submittedByUserId,
    submittedByName,
    enhancements,
    improvements,
    otherSuggestions,
    attachmentUrl,
    attachmentName,
    attachmentType,
    progressReported,
  } = req.body;

  if (!enhancements || !improvements || !attachmentUrl) {
    return res.status(400).json({
      success: false,
      message: 'Enhancements, Improvements, and Proof of Work Attachment (Screenshot/Diagram) are required.',
    });
  }

  const newSubmission: TaskSubmission = {
    id: `sub-${Date.now()}`,
    taskId: task.id,
    taskName: task.name,
    modulePhase: task.modulePhase,
    submittedByUserId: submittedByUserId || 'unknown',
    submittedByName: submittedByName || 'Capstone Team Member',
    enhancements: enhancements.trim(),
    improvements: improvements.trim(),
    otherSuggestions: (otherSuggestions || '').trim(),
    attachmentUrl,
    attachmentName: attachmentName || 'proof_attachment.png',
    attachmentType: attachmentType || 'image/png',
    progressReported: progressReported !== undefined ? Number(progressReported) : task.progress,
    status: 'Pending Review',
    submittedAt: new Date().toISOString(),
  };

  db.submissions.unshift(newSubmission);

  // Update task progress if provided and higher
  if (progressReported !== undefined && Number(progressReported) > task.progress) {
    task.progress = Number(progressReported);
    if (task.progress >= 100) {
      task.status = 'In Review';
    } else if (task.progress > 0 && task.status === 'Not Started') {
      task.status = 'In Progress';
    }
    task.updatedAt = new Date().toISOString();
  }

  saveDb();

  res.json({
    success: true,
    submission: newSubmission,
    task,
    message: 'Progress update, enhancements, and screenshot proof submitted for quality audit.',
  });
});

// Get Submissions for Audit Hub or Task Detail
app.get('/api/submissions', (req: Request, res: Response) => {
  const { taskId, userId, status } = req.query;
  let list = db.submissions;

  if (taskId) {
    list = list.filter(s => s.taskId === taskId);
  }
  if (userId) {
    list = list.filter(s => s.submittedByUserId === userId);
  }
  if (status) {
    list = list.filter(s => s.status === status);
  }

  res.json({ success: true, count: list.length, submissions: list });
});

// Admin Review / Audit Action
app.put('/api/submissions/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const submission = db.submissions.find(s => s.id === id);

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  const { status, adminFeedback, reviewedBy, updateTaskToComplete } = req.body;

  submission.status = status || 'Approved';
  submission.adminFeedback = adminFeedback || 'Reviewed and approved by Project Leader.';
  submission.reviewedBy = reviewedBy || 'Cabildo, Kathlyn Joyce';
  submission.reviewedAt = new Date().toISOString();

  // If approved and requested, also mark the task completed
  if (updateTaskToComplete && submission.status === 'Approved') {
    const task = db.tasks.find(t => t.id === submission.taskId);
    if (task) {
      task.status = 'Completed';
      task.progress = 100;
      task.updatedAt = new Date().toISOString();
    }
  }

  saveDb();

  res.json({ success: true, submission, message: `Submission marked as ${submission.status}.` });
});

// Admin Backlog Matrix & Lagging Indicators
app.get('/api/admin/backlog-matrix', (_req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const uncompletedTasks = db.tasks.filter(t => t.status !== 'Completed');

  // Map each member to their assigned tasks and lagging status
  const memberBacklog = db.users.map(user => {
    const assignedTasks = db.tasks.filter(t => t.assigneeIds.includes(user.id));
    const completedTasks = assignedTasks.filter(t => t.status === 'Completed');
    const inProgressTasks = assignedTasks.filter(t => t.status === 'In Progress');
    const notStartedTasks = assignedTasks.filter(t => t.status === 'Not Started');
    const overdueTasks = assignedTasks.filter(t => t.status !== 'Completed' && t.dueDate < today);
    const submissionsCount = db.submissions.filter(s => s.submittedByUserId === user.id).length;

    // Determine lagging status
    let lagStatus: 'On Track' | 'Attention Needed' | 'Lagging Behind' | 'Overdue';
    let lagReason = '';

    if (overdueTasks.length > 0) {
      lagStatus = 'Overdue';
      lagReason = `${overdueTasks.length} task(s) past due date (${overdueTasks.map(t => t.name).join(', ')})`;
    } else if (notStartedTasks.length > 1 && submissionsCount === 0) {
      lagStatus = 'Lagging Behind';
      lagReason = `Multiple unstarted modules with 0 verified proof submissions`;
    } else if (notStartedTasks.length > 0) {
      lagStatus = 'Attention Needed';
      lagReason = `Has ${notStartedTasks.length} task(s) in Not Started state`;
    } else {
      lagStatus = 'On Track';
      lagReason = `All assigned modules in active progress or completed`;
    }

    return {
      user,
      assignedCount: assignedTasks.length,
      completedCount: completedTasks.length,
      inProgressCount: inProgressTasks.length,
      notStartedCount: notStartedTasks.length,
      overdueCount: overdueTasks.length,
      submissionsCount,
      lagStatus,
      lagReason,
      overdueTasks,
      notStartedTasks,
    };
  });

  res.json({
    success: true,
    totalUncompletedTasks: uncompletedTasks.length,
    uncompletedTasks,
    memberBacklog,
  });
});

// Efficiency Ranking & Productivity Leaderboard
app.get('/api/admin/efficiency-ranking', (_req: Request, res: Response) => {
  const ranking = db.users.map(user => {
    const assigned = db.tasks.filter(t => t.assigneeIds.includes(user.id));
    const completed = assigned.filter(t => t.status === 'Completed').length;
    const userSubmissions = db.submissions.filter(s => s.submittedByUserId === user.id);
    const approvedSubmissions = userSubmissions.filter(s => s.status === 'Approved').length;
    const attendanceDays = new Set(db.attendance.filter(a => a.userId === user.id).map(a => a.date)).size;

    // Efficiency Score Formula:
    // (Completed Tasks * 30) + (Approved Submissions * 20) + (Total Submissions * 10) + (Attendance Days * 15)
    const productivityScore =
      (completed * 30) +
      (approvedSubmissions * 25) +
      (userSubmissions.length * 10) +
      (attendanceDays * 15);

    return {
      user,
      assignedCount: assigned.length,
      completedCount: completed,
      totalSubmissions: userSubmissions.length,
      approvedSubmissions,
      attendanceDays,
      productivityScore,
      efficiencyRating:
        productivityScore > 120
          ? 'Elite Contributor'
          : productivityScore > 70
          ? 'Proficient'
          : productivityScore > 30
          ? 'Active Progress'
          : 'Needs Push',
    };
  });

  // Sort by score descending
  ranking.sort((a, b) => b.productivityScore - a.productivityScore);

  res.json({ success: true, ranking });
});

// Normalized SQL Schema (DDL) Script API for Capstone Documentation & Supabase
app.get('/api/schema-ddl', (_req: Request, res: Response) => {
  const ddlScript = `-- =====================================================================
-- CAPSTONE GANTT CHART & TASK MANAGEMENT SYSTEM
-- Normalized PostgreSQL / Supabase Database Schema (DDL)
-- Generated for Project Leader: Cabildo, Kathlyn Joyce & Team
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Member')),
    title VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DAILY AUTO-ATTENDANCE LOGS TABLE
-- Records login timestamp immediately upon authentication as proof of active work
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    login_time TIME NOT NULL DEFAULT CURRENT_TIME,
    ip_address VARCHAR(45),
    status VARCHAR(50) DEFAULT 'Present' CHECK (status IN ('Present', 'Late', 'Active Working')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_daily_attendance UNIQUE (user_id, log_date)
);

-- 3. TASKS & GANTT MODULE PHASES TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_number INT NOT NULL,
    task_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    module_phase VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'In Review', 'Completed')),
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TASK ASSIGNEES (JUNCTION TABLE FOR MANY-TO-MANY)
CREATE TABLE IF NOT EXISTS public.task_assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_task_assignment UNIQUE (task_id, user_id)
);

-- 5. TASK SUBMISSIONS & QUALITY AUDIT FORMS TABLE
-- Stores Enhancements, Improvements, Suggestions, & Proof Attachments
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    enhancements TEXT NOT NULL,
    improvements TEXT NOT NULL,
    other_suggestions TEXT,
    attachment_url TEXT NOT NULL,
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(100),
    progress_reported INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending Review' CHECK (status IN ('Pending Review', 'Approved', 'Changes Requested')),
    admin_feedback TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SYSTEM AUDIT & NOTIFICATION LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id),
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_tasks_dates ON public.tasks(start_date, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON public.task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.task_submissions(submitted_by);

-- =====================================================================
-- PRE-CONFIGURED 7 CAPSTONE ACCOUNTS SEED SCRIPT
-- =====================================================================
INSERT INTO public.users (id, email, full_name, role, title, avatar_url)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'cabildo.kj@capstone.edu', 'Cabildo, Kathlyn Joyce', 'Admin', 'Project Leader (Admin)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
    ('22222222-2222-2222-2222-222222222222', 'almira.e@capstone.edu', 'Almira, Eugene', 'Member', 'Back-end Developer (Member)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    ('33333333-3333-3333-3333-333333333333', 'amponin.ja@capstone.edu', 'Amponin, John Alexis', 'Member', 'Data Gatherer (Member)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    ('44444444-4444-4444-4444-444444444444', 'boockrystel@gmail.com', 'Booc, Krystel Kaye', 'Member', 'Head Documentation (Member)', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
    ('55555555-5555-5555-5555-555555555555', 'catubay.ml@capstone.edu', 'Catubay, Mark Lawrence', 'Member', 'Quality Assurance / System Analyst (Member)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
    ('66666666-6666-6666-6666-666666666666', 'sunga.ac@capstone.edu', 'Sunga, Aiman Charmount', 'Member', 'Data Gatherer (Member)', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
    ('77777777-7777-7777-7777-777777777777', 'tapales.jr@capstone.edu', 'Tapales, JohnRic', 'Member', 'Data Gatherer (Member)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150')
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, title = EXCLUDED.title;

-- INITIAL CAPSTONE SYSTEM MODULES INSERTION
INSERT INTO public.tasks (id, task_number, task_code, name, module_phase, description, start_date, due_date, status, progress_percent, priority)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 1, 'TASK-01', 'Task 1: Index', 'Index', 'Landing page, public access gateway, university hero showcase, authentication navigation.', '2026-10-01', '2026-10-08', 'Completed', 100, 'High'),
    ('a2222222-2222-2222-2222-222222222222', 2, 'TASK-02', 'Task 2: Dashboard', 'Dashboard', 'Interactive real-time analytics hub, project metrics, velocity gauges, student/staff summary widgets.', '2026-10-06', '2026-10-15', 'In Progress', 75, 'Critical'),
    ('a3333333-3333-3333-3333-333333333333', 3, 'TASK-03', 'Task 3: Admin', 'Admin', 'Role-based access control, system configuration panel, security audit log, member assignment control.', '2026-10-12', '2026-10-22', 'In Progress', 40, 'Critical'),
    ('a4444444-4444-4444-4444-444444444444', 4, 'TASK-04', 'Task 4: Staff', 'Staff', 'Staff operational workflows, task intake pipelines, inventory/document verification views & reporting tools.', '2026-10-16', '2026-10-26', 'Not Started', 10, 'High'),
    ('a5555555-5555-5555-5555-555555555555', 5, 'TASK-05', 'Task 5: Database & Security', 'Database', 'Normalized PostgreSQL schema, Row-Level Security policies, Supabase cloud sync & query optimization.', '2026-10-18', '2026-10-29', 'In Progress', 30, 'Critical'),
    ('a6666666-6666-6666-6666-666666666666', 6, 'TASK-06', 'Task 6: Field Data Gathering & Benchmarking', 'Data Gathering', 'Field research interview consolidation, stakeholder surveys, user persona validations & sample data generation.', '2026-10-04', '2026-10-18', 'In Review', 85, 'Medium'),
    ('a7777777-7777-7777-7777-777777777777', 7, 'TASK-07', 'Task 7: Capstone Manuscript & Quality Audit', 'Documentation', 'Chapter 1 to 5 documentation formatting, system architecture diagrams, user manual & defense presentation.', '2026-10-10', '2026-10-31', 'In Progress', 60, 'High')
ON CONFLICT (task_code) DO NOTHING;
`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(ddlScript);
});

// Start Express server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Capstone Gantt & Task System backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
