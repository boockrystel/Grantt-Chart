export interface UserAccount {
  id: string;
  name: string;
  username: string; // e.g. kathlyn.cabildo, eugene.almira
  password: string; // pre-configured credentials
  role: 'Admin' | 'Member';
  title: string;
  email: string;
  avatar: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // e.g., 08:30:15 AM
  ipAddress: string;
  status: 'Present' | 'Late' | 'Active Working';
  notes: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'In Review' | 'Completed' | 'Expired';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskItem {
  id: string;
  taskNumber: number;
  code: string;
  name: string; // e.g. "Task 1: Index"
  modulePhase: string; // e.g. "Index", "Dashboard", "Admin", "Staff", etc.
  description: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  // 1-Day Testing Rule: Timestamp when the 24-hour testing window expires
  testingExpiresAt: string; // ISO string
  status: TaskStatus;
  progress: number; // 0 - 100
  priority: TaskPriority;
  assigneeIds: string[]; // references UserAccount.id
  createdAt: string;
  updatedAt: string;
}

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
  attachmentUrl: string; // Base64 data URL or remote image URL
  attachmentName: string;
  attachmentType: string;
  progressReported: number;
  status: 'Pending Review' | 'Approved' | 'Changes Requested';
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string; // ISO string
  // 30-minute rule: Once 30 mins elapse, cannot be edited anymore and archived in member's acc
  isArchived: boolean;
  archivedAt?: string;
}

export interface MemberBacklogSummary {
  user: UserAccount;
  assignedCount: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  overdueCount: number;
  submissionsCount: number;
  lagStatus: 'On Track' | 'Attention Needed' | 'Lagging Behind' | 'Overdue';
  lagReason: string;
  overdueTasks: TaskItem[];
  notStartedTasks: TaskItem[];
}

export interface EfficiencyLeaderboardItem {
  user: UserAccount;
  assignedCount: number;
  completedCount: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  attendanceDays: number;
  productivityScore: number;
  efficiencyRating: 'Elite Contributor' | 'Proficient' | 'Active Progress' | 'Needs Push';
}
