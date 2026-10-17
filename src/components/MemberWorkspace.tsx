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

  // User's submissions
  const userSubmissions = submissions.filter(s => s.submittedByUserId === currentUser.id);

  // User's archived submissions (either isArchived === true or elapsed >= 30 mins)
  const now = Date.now();
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
            Role: <span className="text-pink-400 font-semibold">{currentUser.title}</span> • Username: <span className="font-mono text-zinc-300">@{currentUser.username}</span>
          </p>
        </div>

        {/* Tab switch between Tasks and Archive */}
        <div className="flex items-center space-x-2 bg-black/80 p-1.5 rounded-2xl border border-pink-900/40">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeSubTab === 'tasks'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Assigned Tasks ({memberTasks.length})
          </button>

          <button
            onClick={() => setActiveSubTab('archive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeSubTab === 'archive'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Account Archive ({archivedSubmissions.length})
          </button>
        </div>
      </div>

      {/* View 1: Assigned Tasks with 1-Day Testing Rule */}
      {activeSubTab === 'tasks' ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>
                <strong>1-Day Testing Window Rule:</strong> Each task has 1 day (24 hours) for system testing and validation. If 1 day passes without completion, the task turns <strong>RED</strong> and is locked so it cannot be answered.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memberTasks.map(task => {
              const isExpired =
                task.status === 'Expired' ||
                (task.testingExpiresAt &&
                  new Date(task.testingExpiresAt).getTime() < now &&
                  task.status !== 'Completed');

              const hasSubmitted = userSubmissions.some(s => s.taskId === task.id);

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xl ${
                    isExpired
                      ? 'bg-red-950/30 border-red-600 hover:border-red-500 shadow-red-950/40'
                      : 'bg-zinc-950 hover:bg-black border-pink-900/40 hover:border-pink-500 hover:shadow-pink-950/40'
                  }`}
                >
                  <div>
                    {/* Header: Phase badge & 1-day status */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-500/30">
                          {task.code}
                        </span>
                        <span className="text-[11px] font-bold text-pink-300">
                          {task.modulePhase} Phase
                        </span>
                      </div>

                      {isExpired ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                          ⚠️ 1-DAY EXPIRED &amp; LOCKED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900 text-zinc-300">
                          {task.status}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mt-1">
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
                          className={`h-full rounded-full transition-all ${
                            isExpired
                              ? 'bg-red-600'
                              : 'bg-gradient-to-r from-pink-500 to-rose-500'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 1-Day Testing Notice */}
                    <div className="mt-4 pt-3 border-t border-zinc-900">
                      {isExpired ? (
                        <p className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Task turned RED: 1-day testing window elapsed. Inputs are locked!</span>
                        </p>
                      ) : (
                        <p className="text-xs text-pink-300/90 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-pink-400 flex-shrink-0" />
                          <span>1-day testing countdown active. Click to submit deliverables.</span>
                        </p>
                      )}
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
                        No submissions yet
                      </span>
                    )}

                    <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
                      <span>Open Task</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View 2: Account Archive (Locked Submissions past 30 minutes) */
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-pink-400" />
              <span>
                <strong>Account Archive:</strong> All submissions where 30 minutes have passed are permanently locked and cannot be edited or modified.
              </span>
            </div>
            <span className="font-mono text-pink-400 font-bold">
              {archivedSubmissions.length} Archived Records
            </span>
          </div>

          {archivedSubmissions.length === 0 ? (
            <div className="bg-zinc-950 border border-pink-900/30 rounded-3xl p-12 text-center text-zinc-400">
              <Archive className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
              <p className="text-sm font-semibold text-white">
                No archived submissions in your account yet.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Your submitted deliverables automatically move here 30 minutes after submission as a permanent proof of work.
              </p>
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
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-900/40 cursor-pointer"
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
