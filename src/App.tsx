import React, { useState, useEffect, useCallback } from 'react';
import {
  UserAccount,
  TaskItem,
  TaskSubmission,
  AttendanceRecord,
  MemberBacklogSummary,
  EfficiencyLeaderboardItem,
  TaskPriority,
} from './types';
import { apiService } from './services/api';
import { PRECONFIGURED_USERS } from './data/seedData';
import { Sidebar } from './components/Sidebar';
import { IndexPortalView } from './components/IndexPortalView';
import { AdminDashboardOverview } from './components/AdminDashboardOverview';
import { AdminMembersView } from './components/AdminMembersView';
import { MemberWorkspace } from './components/MemberWorkspace';
import { TaskAnswerModal } from './components/TaskAnswerModal';
import { TaskRegistryModal } from './components/TaskRegistryModal';
import { QualityAuditHub } from './components/QualityAuditHub';
import { AttendanceLogViewer } from './components/AttendanceLogViewer';
import { ChangeProfilePictureModal } from './components/ChangeProfilePictureModal';
import {
  Menu,
  CheckCircle2,
  Bell,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Layers,
  Clock,
  ArrowRight,
  LogOut,
  Camera,
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => apiService.getActiveUser());
  const [showIndexPortal, setShowIndexPortal] = useState<boolean>(!apiService.getActiveUser());

  // Database collections (from Local Storage)
  const [allUsers, setAllUsers] = useState<UserAccount[]>(PRECONFIGURED_USERS);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [backlogMatrix, setBacklogMatrix] = useState<{
    totalUncompletedTasks: number;
    uncompletedTasks: TaskItem[];
    memberBacklog: MemberBacklogSummary[];
  }>({
    totalUncompletedTasks: 0,
    uncompletedTasks: [],
    memberBacklog: [],
  });
  const [efficiencyRanking, setEfficiencyRanking] = useState<EfficiencyLeaderboardItem[]>([]);

  // Navigation states: 'dashboard' | 'members' | 'archive' | 'attendance'
  const [activeNav, setActiveNav] = useState<'dashboard' | 'members' | 'archive' | 'attendance'>('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('user-2'); // Eugene Almira by default
  const [registryDefaultMemberId, setRegistryDefaultMemberId] = useState<string | null>(null);
  const [memberSubTab, setMemberSubTab] = useState<'tasks' | 'archive'>('tasks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskRegistryOpen, setIsTaskRegistryOpen] = useState(false);
  const [isChangePictureModalOpen, setIsChangePictureModalOpen] = useState(false);
  const [memberForPictureModal, setMemberForPictureModal] = useState<UserAccount | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5500);
  };

  // Load database from localStorage
  const loadData = useCallback(async () => {
    try {
      const [u, t, s, a, b, r] = await Promise.all([
        apiService.getUsers(),
        apiService.getTasks(),
        apiService.getSubmissions(),
        apiService.getAttendance(),
        apiService.getBacklogMatrix(),
        apiService.getEfficiencyRanking(),
      ]);
      setAllUsers(u);
      setTasks(t);
      setSubmissions(s);
      setAttendanceRecords(a);
      setBacklogMatrix(b);
      setEfficiencyRanking(r);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Login with userId
  const handleLogin = async (userId: string) => {
    const res = await apiService.loginUser(userId);
    setCurrentUser(res.user);
    setShowIndexPortal(false);
    if (res.user.role === 'Admin') {
      setActiveNav('dashboard');
      setSelectedMemberId('user-2');
    } else {
      setActiveNav('members');
      setSelectedMemberId(res.user.id);
    }
    triggerToast(
      res.isFirstToday
        ? `✅ Auto-Attendance Logged: ${res.user.name} clocked in at ${res.attendance.timestamp} for active work!`
        : `👋 Welcome back, ${res.user.name}! Session verified for today.`
    );
    await loadData();
  };

  // Handle Login with Username & Password
  const handleLoginWithCredentials = async (username: string, pass: string) => {
    const res = await apiService.loginWithCredentials(username, pass);
    setCurrentUser(res.user);
    setShowIndexPortal(false);
    if (res.user.role === 'Admin') {
      setActiveNav('dashboard');
      setSelectedMemberId('user-2');
    } else {
      setActiveNav('members');
      setSelectedMemberId(res.user.id);
    }
    triggerToast(
      res.isFirstToday
        ? `✅ Authenticated & Clocked In: ${res.user.name} logged in at ${res.attendance.timestamp}!`
        : `👋 Welcome back, ${res.user.name}! Credentials verified.`
    );
    await loadData();
  };

  // Handle Update Profile Picture for any member
  const handleUpdateProfilePicture = async (newAvatarUrl: string) => {
    const target = memberForPictureModal || currentUser;
    if (!target) return;
    const updated = await apiService.updateUserAvatar(target.id, newAvatarUrl);
    triggerToast(`✅ Profile picture updated for ${updated.name}!`);
    await loadData();
    if (currentUser?.id === target.id) {
      setCurrentUser(updated);
    }
  };

  // Handle Task Select
  const handleSelectTask = (task: TaskItem) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle Submit Answer & Proof of Work
  const handleSubmitTaskUpdate = async (
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
  ) => {
    const result = await apiService.submitTaskProgress(taskId, submissionData);
    triggerToast(
      `🚀 Deliverable submitted for ${result.task.name}! You have 30 minutes to make edits before it is permanently archived.`
    );
    await loadData();
    const updated = tasks.find(t => t.id === taskId);
    if (updated) setSelectedTask(updated);
  };

  // Handle Edit Answer within 30 mins
  const handleEditSubmission = async (
    submissionId: string,
    updates: {
      enhancements: string;
      improvements: string;
      otherSuggestions: string;
      attachmentUrl?: string;
      attachmentName?: string;
    }
  ) => {
    await apiService.editSubmission(submissionId, updates);
    triggerToast('✅ Submission changes saved! You are still within the 30-minute edit window.');
    await loadData();
  };

  // Reset 1-day testing timer (Demo feature)
  const handleResetTaskTimer = async (taskId: string) => {
    await apiService.resetTaskTestingWindow(taskId, 24);
    triggerToast('🔄 1-day testing window reset to 24 hours for demonstration.');
    await loadData();
  };

  // Handle Append Task (Task Registry)
  const handleCreateTask = async (taskData: {
    name: string;
    modulePhase: string;
    description: string;
    startDate: string;
    dueDate: string;
    priority: TaskPriority;
    assigneeIds: string[];
  }) => {
    const newTask = await apiService.createTask(taskData);
    triggerToast(`✨ "${newTask.name}" added with an active 1-day testing window!`);
    await loadData();
  };

  // Review Submission (Admin Audit)
  const handleReviewSubmission = async (
    submissionId: string,
    reviewData: {
      status: 'Approved' | 'Changes Requested';
      adminFeedback: string;
      reviewedBy: string;
      updateTaskToComplete?: boolean;
    }
  ) => {
    const updated = await apiService.reviewSubmission(submissionId, reviewData);
    triggerToast(`📋 Quality audit updated: Submission marked as ${updated.status}.`);
    await loadData();
  };

  const handleNudgeMember = (memberName: string) => {
    triggerToast(`🔔 Follow-up alert dispatched to ${memberName} for pending deliverables!`);
  };

  // Attendance for active user
  const todayStr = new Date().toISOString().split('T')[0];
  const currentUserTodayAttendance = currentUser
    ? attendanceRecords.find(a => a.userId === currentUser.id && a.date === todayStr) || null
    : null;

  const handleLogoutToIndex = () => {
    apiService.setActiveUser(null);
    setCurrentUser(null);
    setShowIndexPortal(true);
    triggerToast('👋 You have logged out. Please enter your credentials to log in.');
  };

  // If on the Index Portal page or unauthenticated
  if (showIndexPortal || !currentUser) {
    return (
      <IndexPortalView
        users={allUsers}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLoginWithCredentials={handleLoginWithCredentials}
      />
    );
  }

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-4 rounded-2xl shadow-2xl bg-zinc-950/95 border-2 border-pink-500/80 text-pink-200 shadow-pink-950/60 backdrop-blur-md flex items-center space-x-3 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-pink-400 flex-shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sidebar with Hamburger ("burger sa gilid") */}
      {currentUser && (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeNav={activeNav}
          onSelectNav={nav => {
            setActiveNav(nav);
            if (nav === 'archive') setMemberSubTab('archive');
          }}
          currentUser={currentUser}
          allUsers={allUsers}
          selectedMemberId={selectedMemberId}
          onSelectMember={memberId => {
            setSelectedMemberId(memberId);
            setActiveNav('members');
          }}
          todayAttendance={currentUserTodayAttendance}
          onLogoutToIndex={handleLogoutToIndex}
          onOpenChangePicture={() => {
            setMemberForPictureModal(currentUser);
            setIsChangePictureModalOpen(true);
          }}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Header Bar with Hamburger Button */}
        <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-pink-950/60 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-pink-400 hover:text-white hover:bg-zinc-900 border border-pink-900/40 transition cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                <span>Capstone Task System</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-950 text-pink-400 border border-pink-500/30">
                  Black &amp; Pink
                </span>
              </span>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {isAdmin
                  ? 'Admin Command Center (Cabildo, Kathlyn Joyce)'
                  : `Member Workspace (${currentUser?.name})`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Auto Attendance Badge */}
            {currentUserTodayAttendance && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-pink-900/50 text-pink-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Auto-Attendance Verified ({currentUserTodayAttendance.timestamp})</span>
              </div>
            )}

            <button
              onClick={() => setShowIndexPortal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 text-pink-300 hover:text-white transition cursor-pointer"
            >
              Index Gateway
            </button>

            {/* Profile Avatar / Change Picture */}
            {currentUser && (
              <button
                onClick={() => {
                  setMemberForPictureModal(currentUser);
                  setIsChangePictureModalOpen(true);
                }}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 hover:border-pink-500/60 transition cursor-pointer group"
                title="Change Profile Picture"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-pink-500"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Camera className="w-3.5 h-3.5 text-pink-300" />
                  </div>
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {currentUser.name.split(',')[0]}
                  </span>
                  <span className="text-[10px] text-pink-400 block leading-tight">
                    Change Picture
                  </span>
                </div>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Body Content based on Active Navigation */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Admin Views */}
          {isAdmin ? (
            <>
              {activeNav === 'dashboard' && (
                <AdminDashboardOverview
                  currentUser={currentUser}
                  users={allUsers}
                  tasks={tasks}
                  submissions={submissions}
                  backlogData={backlogMatrix}
                  rankingData={efficiencyRanking}
                  onSelectTask={handleSelectTask}
                  onNavigateToMembers={() => setActiveNav('members')}
                  onNavigateToTasks={() => setActiveNav('members')}
                  onNavigateToAttendance={() => setActiveNav('attendance')}
                  onNudgeMember={handleNudgeMember}
                />
              )}

              {activeNav === 'members' && (
                <AdminMembersView
                  users={allUsers}
                  tasks={tasks}
                  submissions={submissions}
                  currentUser={currentUser}
                  selectedMemberId={selectedMemberId}
                  onSelectMember={memberId => setSelectedMemberId(memberId)}
                  onSelectTask={handleSelectTask}
                  onOpenCreateTaskForMember={memberId => {
                    setRegistryDefaultMemberId(memberId);
                    setIsTaskRegistryOpen(true);
                  }}
                  onResetTaskTimer={handleResetTaskTimer}
                  onEditSubmission={handleEditSubmission}
                  onOpenChangePicture={() => {
                    const member = allUsers.find(u => u.id === selectedMemberId) || currentUser;
                    setMemberForPictureModal(member);
                    setIsChangePictureModalOpen(true);
                  }}
                />
              )}

              {activeNav === 'archive' && (
                <QualityAuditHub
                  submissions={submissions}
                  users={allUsers}
                  tasks={tasks}
                  currentUser={currentUser}
                  onReviewSubmission={handleReviewSubmission}
                />
              )}

              {activeNav === 'attendance' && (
                <AttendanceLogViewer
                  attendanceRecords={attendanceRecords}
                  users={allUsers}
                  currentUser={currentUser}
                />
              )}
            </>
          ) : (
            /* Member Views */
            <>
              {(activeNav === 'members' || activeNav === 'dashboard') && (
                <AdminMembersView
                  users={allUsers}
                  tasks={tasks}
                  submissions={submissions}
                  currentUser={currentUser!}
                  selectedMemberId={selectedMemberId}
                  onSelectMember={memberId => setSelectedMemberId(memberId)}
                  onSelectTask={handleSelectTask}
                  onOpenCreateTaskForMember={memberId => {
                    setRegistryDefaultMemberId(memberId);
                    setIsTaskRegistryOpen(true);
                  }}
                  onResetTaskTimer={handleResetTaskTimer}
                  onEditSubmission={handleEditSubmission}
                  onOpenChangePicture={() => {
                    setMemberForPictureModal(currentUser);
                    setIsChangePictureModalOpen(true);
                  }}
                />
              )}

              {activeNav === 'archive' && (
                <MemberWorkspace
                  currentUser={currentUser!}
                  tasks={tasks}
                  submissions={submissions}
                  onSelectTask={handleSelectTask}
                  activeSubTab="archive"
                  setActiveSubTab={setMemberSubTab}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Task Answer & 1-Day Testing / 30-Minute Lock Modal */}
      {currentUser && (
        <TaskAnswerModal
          task={selectedTask}
          currentUser={currentUser}
          submissions={submissions}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSubmitUpdate={handleSubmitTaskUpdate}
          onEditSubmission={handleEditSubmission}
          onResetTaskTestingTimer={handleResetTaskTimer}
        />
      )}

      {/* Task Registry Modal (Admin Dynamic Append) */}
      <TaskRegistryModal
        isOpen={isTaskRegistryOpen}
        onClose={() => {
          setIsTaskRegistryOpen(false);
          setRegistryDefaultMemberId(null);
        }}
        users={allUsers}
        existingTasksCount={tasks.length}
        defaultAssigneeId={registryDefaultMemberId}
        onCreateTask={handleCreateTask}
      />

      {/* Change Profile Picture Modal */}
      {(memberForPictureModal || currentUser) && (
        <ChangeProfilePictureModal
          isOpen={isChangePictureModalOpen}
          onClose={() => {
            setIsChangePictureModalOpen(false);
            setMemberForPictureModal(null);
          }}
          currentUser={memberForPictureModal || currentUser!}
          onUpdateAvatar={handleUpdateProfilePicture}
        />
      )}
    </div>
  );
}
