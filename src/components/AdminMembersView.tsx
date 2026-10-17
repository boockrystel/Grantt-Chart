import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  Plus,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  Layers,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  Check,
  Calendar,
  ExternalLink,
  Camera,
  Trash2,
} from 'lucide-react';
import { UserAccount, TaskItem, TaskSubmission } from '../types';
import { THIRTY_MINUTES_MS } from '../services/api';

interface AdminMembersViewProps {
  users: UserAccount[];
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  currentUser: UserAccount;
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  onSelectTask: (task: TaskItem) => void;
  onOpenCreateTaskForMember: (memberId: string) => void;
  onResetTaskTimer: (taskId: string) => Promise<void>;
  onOpenChangePicture?: () => void;
  onDeleteTask?: (taskId: string, taskName: string) => Promise<void>;
  onEditSubmission?: (
    submissionId: string,
    updates: {
      enhancements: string;
      improvements: string;
      otherSuggestions: string;
      attachmentUrl?: string;
      attachmentName?: string;
    }
  ) => Promise<void>;
}

export const AdminMembersView: React.FC<AdminMembersViewProps> = ({
  users,
  tasks,
  submissions,
  currentUser,
  selectedMemberId,
  onSelectMember,
  onSelectTask,
  onOpenCreateTaskForMember,
  onResetTaskTimer,
  onOpenChangePicture,
  onDeleteTask,
  onEditSubmission,
}) => {
  const isAdmin = currentUser.role === 'Admin';
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // If currentUser is a Member, enforce their own view: they see their assigned tasks
  const effectiveMemberId = isAdmin
    ? selectedMemberId || users[1]?.id || users[0]?.id
    : currentUser.id;
  const selectedMember = users.find(u => u.id === effectiveMemberId) || currentUser;

  // Active task modal for "pag pinindot ang task na box lalabas na ang pinasa nila"
  const [inspectedTask, setInspectedTask] = useState<TaskItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // When inspecting what was submitted:
  const inspectedSubmission = inspectedTask
    ? submissions.find(
        s => s.taskId === inspectedTask.id && s.submittedByUserId === selectedMember.id
      ) ||
      submissions.find(s => s.taskId === inspectedTask.id) // fallback if submitted by team
    : null;

  // 1-Day & 30-min timers calculation
  const now = Date.now();

  const [taskViewFilter, setTaskViewFilter] = useState<'active' | 'archived'>('active');

  // Tasks assigned to selected member
  const memberTasks = tasks.filter(t => t.assigneeIds.includes(selectedMember.id));

  const isTaskTimeFinished = (task: TaskItem) => {
    return (
      task.status === 'Expired' ||
      task.status === 'Completed' ||
      (task.testingExpiresAt && new Date(task.testingExpiresAt).getTime() <= now)
    );
  };

  const activeMemberTasks = memberTasks.filter(t => !isTaskTimeFinished(t));
  const archivedMemberTasks = memberTasks.filter(t => isTaskTimeFinished(t));
  const displayedTasks = taskViewFilter === 'active' ? activeMemberTasks : archivedMemberTasks;

  // Check 30-minute lock status for inspected submission
  const isSubmissionArchived = inspectedSubmission
    ? inspectedSubmission.isArchived ||
      now - new Date(inspectedSubmission.submittedAt).getTime() >= THIRTY_MINUTES_MS
    : false;

  const minutesRemainingIn30MinWindow = inspectedSubmission
    ? Math.max(
        0,
        Math.floor(
          (THIRTY_MINUTES_MS - (now - new Date(inspectedSubmission.submittedAt).getTime())) /
            (1000 * 60)
        )
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border border-pink-900/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/40 text-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/30 ring-2 ring-pink-500/30">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white shadow-sm">
                  {isAdmin ? 'ADMIN TASK MONITORING' : 'MY ASSIGNED TEAM TASKS'}
                </span>
                <span className="text-xs text-pink-400 font-mono">
                  1-Day Testing Window &amp; 30m Archive Rules Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isAdmin
                  ? `Capstone Team Tasks by Member`
                  : `Team Tasks • ${currentUser.name}`}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isAdmin
                  ? 'Audit and track each team member\'s module phases. Click any box to inspect submitted deliverables.'
                  : 'Your assigned Capstone development modules. Click any task box to inspect deliverables or submit progress.'}
              </p>
            </div>
          </div>

          {/* Admin-only: Member Dropdown Selector & Add Task button ("hindi dapat nakka pag add task ang member") */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative min-w-[280px]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1">
                  Select Member Dropdown:
                </label>
                <div className="relative">
                  <select
                    value={selectedMember.id}
                    onChange={e => onSelectMember(e.target.value)}
                    className="w-full appearance-none bg-black border-2 border-pink-600/70 hover:border-pink-500 rounded-2xl px-4 py-2.5 pr-10 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-950/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition cursor-pointer"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-zinc-950 text-white py-1">
                        {u.name} — {u.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-pink-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Only Admin can add tasks */}
              <button
                onClick={() => onOpenCreateTaskForMember(selectedMember.id)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-600/40 transition cursor-pointer self-start sm:self-end"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Member Profile Card */}
      <div className="bg-zinc-950 border border-pink-900/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <img
              src={selectedMember.avatar}
              alt={selectedMember.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-pink-500 shadow-lg shadow-pink-500/30"
            />
            {onOpenChangePicture && (
              <button
                type="button"
                onClick={onOpenChangePicture}
                title="Change Profile Picture"
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-pink-400 transition cursor-pointer"
              >
                <Camera className="w-6 h-6" />
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-black text-white">
                {selectedMember.name}
              </h3>
              {selectedMember.role === 'Admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-600 text-white shadow-sm">
                  Project Leader (Admin)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-pink-300 border border-pink-900/40">
                  Capstone Member
                </span>
              )}
            </div>
            <p className="text-xs text-pink-400 font-medium mt-0.5">
              {selectedMember.title} • Username: <span className="font-mono text-zinc-300">@{selectedMember.username}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-emerald-900/40 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Auto-Attendance: Logged Today</span>
              </div>

              {onOpenChangePicture && (
                <button
                  type="button"
                  onClick={onOpenChangePicture}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-pink-300 hover:text-white bg-pink-950/70 hover:bg-pink-900 border border-pink-500/40 px-3 py-1 rounded-xl shadow-sm cursor-pointer transition"
                >
                  <Camera className="w-3.5 h-3.5 text-pink-400" />
                  <span>Change Profile Picture</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-black/80 px-5 py-3 rounded-2xl border border-pink-900/30 text-xs">
          <div>
            <span className="text-zinc-400 block text-[11px]">Assigned Tasks:</span>
            <span className="text-base font-black text-pink-400">
              {memberTasks.length} Module Tasks
            </span>
          </div>
          <div className="h-8 w-px bg-zinc-800"></div>
          <div>
            <span className="text-zinc-400 block text-[11px]">Accomplished:</span>
            <span className="text-base font-black text-emerald-400">
              {submissions.filter(s => s.submittedByUserId === selectedMember.id).length} Submitted
            </span>
          </div>
        </div>
      </div>

      {/* Strict Requirement Notice: NO DATES DISPLAYED ON MEMBER TASK BOXES */}
      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0" />
          <span>
            <strong>Task Box Display Rule:</strong> Showing all tasks for <strong>{selectedMember.name}</strong> as clickable boxes without any dates displayed. When a task box is clicked, the submitted deliverables and screenshot proof will be shown.
          </span>
        </div>
      </div>

      {/* Sub-tab switcher: Active Tasks vs Archived Tasks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded-2xl border border-pink-900/40">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setTaskViewFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              taskViewFilter === 'active'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-zinc-400 hover:text-white bg-black/60'
            }`}
          >
            <span>Active Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/50 text-[10px] font-mono">
              {activeMemberTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTaskViewFilter('archived')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              taskViewFilter === 'archived'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-zinc-400 hover:text-white bg-black/60'
            }`}
          >
            <span>Archived (Time Ended)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/50 text-[10px] font-mono">
              {archivedMemberTasks.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 px-2">
          {taskViewFilter === 'active'
            ? 'Active testing window. Tasks automatically disappear and move to Archive when time ends.'
            : 'Archived records: testing time has finished or tasks are completed.'}
        </span>
      </div>

      {/* Grid of Member Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedTasks.length === 0 && (
          <div className="col-span-full bg-zinc-950 border border-pink-900/30 rounded-3xl p-10 text-center text-zinc-400">
            <Clock className="w-10 h-10 mx-auto text-pink-500/50 mb-2.5" />
            <h4 className="text-sm font-bold text-white">
              {taskViewFilter === 'active'
                ? 'No active tasks in progress.'
                : 'No archived tasks on record for this member.'}
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              {taskViewFilter === 'active'
                ? 'All assigned tasks for this member have either been completed or their testing time ended and moved to Archived.'
                : 'Tasks whose 1-day testing window elapsed will automatically appear in this archived list.'}
            </p>
          </div>
        )}

        {/* Render each task assigned to this member as a BOX */}
        {displayedTasks.map(task => {
          // Check 1-Day Testing Window status
          const isExpired =
            task.status === 'Expired' ||
            (task.testingExpiresAt &&
              new Date(task.testingExpiresAt).getTime() < now &&
              task.status !== 'Completed');

          // Check if this member has submitted deliverables
          const memberSub = submissions.find(
            s => s.taskId === task.id && s.submittedByUserId === selectedMember.id
          );
          const hasSubmitted = !!memberSub;

          return (
            <div
              key={task.id}
              onClick={() => {
                if (hasSubmitted) {
                  setInspectedTask(task);
                } else if (isExpired) {
                  // Alert user that 1-day testing period expired
                  setInspectedTask(task);
                } else {
                  // Not yet submitted and active: open form
                  onSelectTask(task);
                }
              }}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xl relative overflow-hidden group min-h-[220px] ${
                isExpired
                  ? 'bg-red-950/30 border-2 border-red-600 hover:border-red-500 shadow-red-950/50'
                  : hasSubmitted
                  ? 'bg-zinc-950 hover:bg-black border-pink-500/80 hover:border-pink-400 shadow-pink-950/40 ring-1 ring-pink-500/30'
                  : 'bg-zinc-950 hover:bg-black border-pink-900/40 hover:border-pink-500 hover:shadow-pink-950/40'
              }`}
            >
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/5 rounded-full blur-2xl group-hover:bg-pink-600/15 transition-all pointer-events-none"></div>

              <div>
                {/* Header: Module Phase and Status (NO DATES DISPLAYED!) */}
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-pink-400 bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                      {task.code}
                    </span>
                    {isAdmin && onDeleteTask && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setTaskToDelete(task);
                        }}
                        className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/60 border border-transparent hover:border-red-600/40 transition cursor-pointer"
                        title="Delete Task (Admin / Project Leader)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isExpired ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm animate-pulse">
                      ⚠️ 1-DAY EXPIRED &amp; LOCKED
                    </span>
                  ) : hasSubmitted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-500/50 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-pink-400" />
                      <span>Accomplished &amp; Submitted</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {task.status}
                    </span>
                  )}
                </div>

                {/* Task Title */}
                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition">
                  {task.name}
                </h3>
                <span className="text-xs font-semibold text-pink-400 block mt-0.5">
                  Module Phase: {task.modulePhase}
                </span>

                <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                  {task.description}
                </p>

                {/* Progress Bar (NO DATES DISPLAYED) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Progress Completion:</span>
                    <span className="font-bold text-pink-400">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isExpired
                          ? 'bg-red-600'
                          : 'bg-gradient-to-r from-pink-500 to-rose-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Indicator Bar */}
                <div className="mt-4 pt-3 border-t border-zinc-900">
                  {isExpired ? (
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Task turned RED (Locked, cannot answer)</span>
                      </p>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onResetTaskTimer(task.id);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-500/40"
                      >
                        Reset Demo
                      </button>
                    </div>
                  ) : hasSubmitted ? (
                    <div className="flex items-center space-x-2 text-xs text-pink-300">
                      {memberSub.attachmentUrl && (
                        <img
                          src={memberSub.attachmentUrl}
                          alt="Proof"
                          className="w-6 h-6 rounded object-cover ring-1 ring-pink-500/50"
                        />
                      )}
                      <span className="font-medium truncate">
                        Deliverable passed: {memberSub.enhancements.slice(0, 35)}...
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span>1-day testing window active</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Box Footer (NO DATES DISPLAYED) */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-pink-400 group-hover:translate-x-1 transition flex items-center gap-1">
                  <span>{hasSubmitted ? 'Inspect Deliverables' : 'Open Task View'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                {hasSubmitted && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Proof Attached
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* PLUS SIGN BOX AT THE END - ONLY VISIBLE TO ADMIN ON ACTIVE TASKS TAB */}
        {isAdmin && taskViewFilter === 'active' && (
          <div
            onClick={() => onOpenCreateTaskForMember(selectedMember.id)}
            className="border-2 border-dashed border-pink-500/60 hover:border-pink-400 bg-pink-950/20 hover:bg-pink-950/40 rounded-3xl p-6 min-h-[220px] flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-pink-950/60 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-pink-600/40 ring-2 ring-pink-400/50 group-hover:scale-110 transition duration-200">
              <Plus className="w-8 h-8 text-white stroke-[2.5]" />
            </div>

            <h4 className="text-base font-black text-white mt-4 group-hover:text-pink-300 transition">
              + Add New Task for {selectedMember.name.split(',')[0]}
            </h4>
            <p className="text-xs text-pink-300/80 mt-1 max-w-xs leading-relaxed">
              Append a new development phase or module (e.g. Index, Staff, Reports) pre-assigned to this member with a 1-day testing window.
            </p>

            <span className="mt-3 inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold bg-pink-600 text-white shadow-sm">
              <span>Click to Add Module</span>
            </span>
          </div>
        )}
      </div>

      {/* MODAL: "pag pinindot ang task na box lalabas na ang pinasa nila" */}
      {inspectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-black border border-pink-900/60 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl shadow-pink-950/60 overflow-hidden">
            {/* Modal Header (NO DATES DISPLAYED) */}
            <div className="p-5 sm:p-6 border-b border-zinc-900 bg-zinc-950/90 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-pink-400 bg-pink-950/80 border border-pink-500/40 px-2.5 py-0.5 rounded-full">
                    {inspectedTask.code}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                    {inspectedTask.modulePhase} Phase
                  </span>

                  {inspectedSubmission ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accomplished &amp; Submitted Deliverable</span>
                    </span>
                  ) : inspectedTask.status === 'Expired' ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-600">
                      ⚠️ 1-DAY EXPIRED &amp; LOCKED
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300">
                      {inspectedTask.status}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                  {inspectedTask.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Assigned Member: <strong className="text-pink-400">{selectedMember.name}</strong> ({selectedMember.title})
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {isAdmin && onDeleteTask && (
                  <button
                    type="button"
                    onClick={() => setTaskToDelete(inspectedTask)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-600/70 text-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-red-950/50"
                    title="Delete Task (Admin / Project Leader)"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete Task</span>
                  </button>
                )}
                <button
                  onClick={() => setInspectedTask(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Deliverables Submitted by the Member */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {inspectedSubmission ? (
                /* Member's Submitted Deliverables ("ang pinasa nila") */
                <div className="space-y-5">
                  {/* Banner with 30-Minute Archive Rule Status */}
                  {isSubmissionArchived ? (
                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <span className="text-white font-semibold">
                          Archived in Member's Account:
                        </span>
                        <span>30 minutes have elapsed since submission. Answers are permanently locked and cannot be modified.</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-400 font-mono">
                        LOCKED ARCHIVE
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-pink-950/50 border border-pink-500/60 text-xs text-pink-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-pink-400 flex-shrink-0" />
                        <span className="text-white font-bold">
                          30-Minute Edit Window Active:
                        </span>
                        <span>{minutesRemainingIn30MinWindow} minutes remaining before permanent lock.</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-pink-600 text-white font-bold text-[10px]">
                        EDITABLE BY AUTHOR
                      </span>
                    </div>
                  )}

                  {/* 3 Main Form Inputs: Enhancements, Improvements, Suggestions */}
                  <div className="space-y-4">
                    {/* Enhancements */}
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-pink-900/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span>Enhancements (Features to Add / Module Implementation)</span>
                      </span>
                      <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-line">
                        {inspectedSubmission.enhancements}
                      </p>
                    </div>

                    {/* Improvements */}
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-pink-900/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-400 block mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-pink-400" />
                        <span>Improvements (Code &amp; UI Optimization Performed)</span>
                      </span>
                      <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-line">
                        {inspectedSubmission.improvements}
                      </p>
                    </div>

                    {/* Other Suggestions */}
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Other Suggestions (System Feedback)
                      </span>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {inspectedSubmission.otherSuggestions || 'No extra suggestions noted.'}
                      </p>
                    </div>
                  </div>

                  {/* Attachment Screenshot Proof */}
                  {inspectedSubmission.attachmentUrl && (
                    <div className="bg-zinc-950 p-4 rounded-2xl border border-pink-900/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-300 block mb-2">
                        Attachment Field Proof (Progress Screenshot / Architecture Diagram)
                      </span>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black p-3 rounded-2xl border border-zinc-800">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={inspectedSubmission.attachmentUrl}
                            alt="Screenshot Proof"
                            onClick={() => setPreviewImage(inspectedSubmission.attachmentUrl)}
                            className="w-24 h-16 object-cover rounded-xl border border-pink-500 shadow-md cursor-pointer hover:opacity-80 transition"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {inspectedSubmission.attachmentName || 'progress_screenshot.png'}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Verified proof of progress attachment
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewImage(inspectedSubmission.attachmentUrl)}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30 transition cursor-pointer self-start sm:self-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Full Resolution</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quality Audit Feedback if Reviewed */}
                  {inspectedSubmission.adminFeedback && (
                    <div className="p-4 rounded-2xl bg-black border border-pink-900/50 text-xs">
                      <span className="font-bold text-pink-400 block mb-1">
                        Quality Audit Review Notes:
                      </span>
                      <p className="text-zinc-300">{inspectedSubmission.adminFeedback}</p>
                    </div>
                  )}
                </div>
              ) : inspectedTask.status === 'Expired' ? (
                /* Expired Alert */
                <div className="p-6 rounded-3xl bg-red-950/40 border-2 border-red-600 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto text-xl font-black">
                    !
                  </div>
                  <h4 className="text-base font-black text-white uppercase tracking-wider">
                    1-Day Testing Window Expired
                  </h4>
                  <p className="text-xs text-red-200 max-w-md mx-auto leading-relaxed">
                    This task reached the 1-day (24-hour) testing limit without completion. As per system rules, it has turned RED and is locked so members can no longer answer or submit deliverables.
                  </p>
                  <button
                    onClick={() => {
                      onResetTaskTimer(inspectedTask.id);
                      setInspectedTask(null);
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-500/40 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset 1-Day Timer (Demonstration)</span>
                  </button>
                </div>
              ) : (
                /* Active Task with No Submissions Yet */
                <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-850 text-center space-y-3">
                  <FileText className="w-12 h-12 text-zinc-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">
                    No deliverables submitted yet for this task
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    The 1-day testing period is currently active. The assigned member ({selectedMember.name}) can submit enhancements, improvements, suggestions, and screenshot proof.
                  </p>
                  <button
                    onClick={() => {
                      setInspectedTask(null);
                      onSelectTask(inspectedTask);
                    }}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-600/30 cursor-pointer"
                  >
                    <span>Open Submission Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer (NO DATES DISPLAYED) */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">
                System Rule: 1-Day Testing Window • 30-Minute Archive Lock
              </span>
              <button
                type="button"
                onClick={() => setInspectedTask(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Attachment Screenshot */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Enlarged screenshot"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl ring-2 ring-pink-500"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white font-bold text-xs bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-full cursor-pointer transition shadow-lg"
            >
              Close [ESC]
            </button>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal (Admin / Project Leader) */}
      {taskToDelete && (
        <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border-2 border-red-600/80 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-red-950/80 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-white">Delete Task?</h3>
              <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                Sigurado ka bang nais mong burahin ang module na{' '}
                <strong className="text-red-400">{taskToDelete.name}</strong>?
              </p>
              <p className="text-[11px] text-zinc-400 mt-2 bg-red-950/40 p-2.5 rounded-xl border border-red-900/40">
                ⚠️ Permanenteng mawawala ang task na ito at ang lahat ng deliverables na naipasa para dito.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteTask || !taskToDelete) return;
                  try {
                    setIsDeleting(true);
                    const name = taskToDelete.name;
                    const id = taskToDelete.id;
                    setTaskToDelete(null);
                    if (inspectedTask?.id === id) {
                      setInspectedTask(null);
                    }
                    await onDeleteTask(id, name);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/40 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Task'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
