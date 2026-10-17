import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Archive,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  Sparkles,
  ChevronRight,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { TaskItem, UserAccount, TaskSubmission } from '../types';
import { THIRTY_MINUTES_MS } from '../services/api';

interface MemberWorkspaceProps {
  currentUser: UserAccount;
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  onSelectTask: (task: TaskItem) => void;
  activeSubTab: 'tasks' | 'archive';
  setActiveSubTab: (tab: 'tasks' | 'archive') => void;
}

export const MemberWorkspace: React.FC<MemberWorkspaceProps> = ({
  currentUser,
  tasks,
  submissions,
  onSelectTask,
  activeSubTab,
  setActiveSubTab,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter tasks assigned to current member
  const memberTasks = tasks.filter(t => t.assigneeIds.includes(currentUser.id));
  const now = Date.now();

  // Helper to determine if a task's testing time has ended/expired or task is completed
  const isTaskTimeFinished = (task: TaskItem) => {
    return (
      task.status === 'Expired' ||
      task.status === 'Completed' ||
      (task.testingExpiresAt && new Date(task.testingExpiresAt).getTime() <= now)
    );
  };

  // Active tasks for member dashboard: testing window is STILL ACTIVE
  const activeMemberTasks = memberTasks.filter(task => !isTaskTimeFinished(task));

  // Archived tasks: testing time has ended/expired or task completed
  const archivedMemberTasks = memberTasks.filter(task => isTaskTimeFinished(task));

  // User's submissions
  const userSubmissions = submissions.filter(s => s.submittedByUserId === currentUser.id);

  // User's archived submissions (either isArchived === true or elapsed >= 30 mins)
  const archivedSubmissions = userSubmissions.filter(
    s => s.isArchived || now - new Date(s.submittedAt).getTime() >= THIRTY_MINUTES_MS
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border border-pink-900/50 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-600 text-white shadow-sm">
              MEMBER WORKSPACE
            </span>
            <span className="text-xs text-pink-400 font-mono">
              Auto-Attendance Verified for Today
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Welcome, {currentUser.name}!
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Role: <span className="text-pink-400 font-semibold">{currentUser.title}</span> • Username:{' '}
            <span className="font-mono text-zinc-300">@{currentUser.username}</span>
          </p>
        </div>

        {/* Tab switch between Active Tasks and Account Archive */}
        <div className="flex items-center space-x-2 bg-black/80 p-1.5 rounded-2xl border border-pink-900/40">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'tasks'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Active Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {activeMemberTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('archive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'archive'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Account Archive</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {archivedMemberTasks.length + archivedSubmissions.length}
            </span>
          </button>
        </div>
      </div>

      {/* View 1: Active Assigned Tasks (Only tasks with active testing window) */}
      {activeSubTab === 'tasks' ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>
                <strong>1-Day Testing Window Rule:</strong> Tasks with active time remain here. Once the 24-hour testing window finishes, the task automatically leaves this active dashboard and moves to the <strong>Account Archive</strong>.
              </span>
            </div>
            <span className="text-[11px] font-mono text-pink-400 font-bold hidden sm:inline">
              {activeMemberTasks.length} Active Module(s)
            </span>
          </div>

          {activeMemberTasks.length === 0 ? (
            <div className="bg-zinc-950 border border-pink-900/30 rounded-3xl p-12 text-center text-zinc-400 shadow-xl">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
              <h3 className="text-base font-bold text-white">
                No active tasks on your current dashboard.
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                All your assigned tasks have either been completed or their testing time has ended and they have been automatically moved to the <strong>Account Archive</strong>.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('archive')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-pink-300 bg-zinc-900 hover:bg-zinc-850 border border-pink-500/40 cursor-pointer transition inline-flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>View Account Archive ({archivedMemberTasks.length})</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMemberTasks.map(task => {
                const hasSubmitted = userSubmissions.some(s => s.taskId === task.id);
                const expiresAtMs = task.testingExpiresAt ? new Date(task.testingExpiresAt).getTime() : 0;
                const hoursRemaining = expiresAtMs > now ? Math.max(0, Math.floor((expiresAtMs - now) / (1000 * 60 * 60))) : 0;
                const minutesRemaining = expiresAtMs > now ? Math.max(0, Math.floor(((expiresAtMs - now) % (1000 * 60 * 60)) / (1000 * 60))) : 0;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xl bg-zinc-950 hover:bg-black border-pink-900/40 hover:border-pink-500 hover:shadow-pink-950/40 group"
                  >
                    <div>
                      {/* Header: Phase badge & active timer */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-500/30">
                            {task.code}
                          </span>
                          <span className="text-[11px] font-bold text-pink-300">
                            {task.modulePhase} Phase
                          </span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-950 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-pink-400" />
                          <span>{hoursRemaining}h {minutesRemaining}m left</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-1 group-hover:text-pink-300 transition">
                        {task.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {task.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-zinc-400">Progress:</span>
                          <span className="font-bold text-pink-400">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all bg-gradient-to-r from-pink-500 to-rose-500"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Testing Window Active Notice */}
                      <div className="mt-4 pt-3 border-t border-zinc-900">
                        <p className="text-xs text-pink-300/90 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-pink-400 flex-shrink-0" />
                          <span>1-day testing countdown active. Click to submit deliverables.</span>
                        </p>
                      </div>
                    </div>

                    {/* Submission indicator */}
                    <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                      {hasSubmitted ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Deliverable proof submitted
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Pending submission
                        </span>
                      )}

                      <span className="text-xs font-bold text-pink-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                        <span>Open Task</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* View 2: Account Archive (Tasks with expired time + 30-min locked submissions) */
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-pink-400" />
              <span>
                <strong>Account Archive:</strong> Tasks automatically move here once their testing time has ended or when completed. Submissions past 30 minutes are also locked permanently here.
              </span>
            </div>
            <span className="font-mono text-pink-400 font-bold">
              {archivedMemberTasks.length} Archived Tasks • {archivedSubmissions.length} Locked Proofs
            </span>
          </div>

          {/* Section A: Archived Tasks (Time Ended or Completed) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>Archived Tasks (Testing Time Ended &amp; Completed)</span>
            </h3>

            {archivedMemberTasks.length === 0 ? (
              <div className="bg-zinc-950 border border-pink-900/30 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                No tasks have ended their testing time yet. Active tasks remain in your active dashboard.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {archivedMemberTasks.map(task => {
                  const isCompleted = task.status === 'Completed';
                  const memberSub = userSubmissions.find(s => s.taskId === task.id);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`rounded-3xl border p-6 flex flex-col justify-between transition shadow-xl cursor-pointer ${
                        isCompleted
                          ? 'bg-zinc-950 border-emerald-900/40 hover:border-emerald-500/60'
                          : 'bg-red-950/20 border-red-900/50 hover:border-red-500/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-mono font-bold text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-500/30">
                            {task.code}
                          </span>

                          {isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>COMPLETED • ARCHIVED</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>TIME ENDED • ARCHIVED</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white">
                          {task.name}
                        </h4>
                        <span className="text-xs text-pink-400 block mt-0.5">
                          Phase: {task.modulePhase}
                        </span>

                        <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-zinc-900">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-zinc-400">Final Recorded Progress:</span>
                            <span className="font-bold text-pink-400">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCompleted ? 'bg-emerald-500' : 'bg-red-600'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-zinc-900 text-[11px] text-zinc-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-zinc-400">
                            <Lock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Archived: Testing window closed. Locked from modifications.</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs">
                        {memberSub ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Deliverable on record
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">
                            No proof submitted before deadline
                          </span>
                        )}

                        <span className="text-pink-400 font-bold flex items-center gap-1 text-[11px]">
                          <span>Inspect Record</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: 30-Minute Locked Deliverable Submissions */}
          <div className="space-y-3 pt-4 border-t border-zinc-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>Archived Deliverable Submissions (30-Minute Edit Window Locked)</span>
            </h3>

            {archivedSubmissions.length === 0 ? (
              <div className="bg-zinc-950 border border-pink-900/30 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                No deliverable submissions have surpassed the 30-minute lock window yet.
              </div>
            ) : (
              <div className="space-y-4">
                {archivedSubmissions.map(sub => (
                  <div
                    key={sub.id}
                    className="bg-zinc-950 border border-pink-900/30 rounded-3xl p-6 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-zinc-500" />
                          <h4 className="text-base font-bold text-white">
                            {sub.taskName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-500/40">
                            {sub.modulePhase} Phase
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Permanently Archived (Non-editable official record)
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 self-start sm:self-auto font-mono">
                        LOCKED ARCHIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-black/90 p-3.5 rounded-2xl border border-pink-950">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block mb-1">
                          Enhancements (Features Added)
                        </span>
                        <p className="text-zinc-200">{sub.enhancements}</p>
                      </div>

                      <div className="bg-black/90 p-3.5 rounded-2xl border border-pink-950">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block mb-1">
                          Improvements (Optimization)
                        </span>
                        <p className="text-zinc-200">{sub.improvements}</p>
                      </div>

                      <div className="bg-black/90 p-3.5 rounded-2xl border border-zinc-900">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                          Other Suggestions
                        </span>
                        <p className="text-zinc-300">{sub.otherSuggestions || 'None'}</p>
                      </div>
                    </div>

                    {sub.attachmentUrl && (
                      <div className="bg-black/60 p-3 rounded-2xl border border-zinc-900 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={sub.attachmentUrl}
                            alt="Screenshot Proof"
                            onClick={() => setPreviewImage(sub.attachmentUrl)}
                            className="w-16 h-12 object-cover rounded-xl border border-pink-500/40 cursor-pointer hover:opacity-80 transition"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {sub.attachmentName}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Archived screenshot proof
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setPreviewImage(sub.attachmentUrl)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-pink-300 border border-pink-900/40 cursor-pointer"
                        >
                          Inspect Full
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
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
              className="absolute -top-12 right-0 text-white font-bold text-xs bg-pink-600 px-4 py-2 rounded-full cursor-pointer"
            >
              Close [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
