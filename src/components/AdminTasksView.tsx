import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { TaskItem, UserAccount } from '../types';

interface AdminTasksViewProps {
  tasks: TaskItem[];
  users: UserAccount[];
  currentUser: UserAccount;
  onSelectTask: (task: TaskItem) => void;
  onOpenCreateTask: () => void;
  onResetTaskTimer: (taskId: string) => Promise<void>;
}

export const AdminTasksView: React.FC<AdminTasksViewProps> = ({
  tasks,
  users,
  currentUser,
  onSelectTask,
  onOpenCreateTask,
  onResetTaskTimer,
}) => {
  const [filterPhase, setFilterPhase] = useState<string>('ALL');
  const now = Date.now();

  const filteredTasks = tasks.filter(t => {
    if (filterPhase !== 'ALL' && t.modulePhase !== filterPhase) return false;
    return true;
  });

  const allPhases = Array.from(new Set(tasks.map(t => t.modulePhase)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border border-pink-900/50 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-600 text-white shadow-sm">
              TASK &amp; MODULE REGISTRY
            </span>
            <span className="text-xs text-pink-400 font-mono">
              1-Day Testing Rule Enforced
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Capstone System Tasks ({tasks.length} Modules)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tracks each development phase: Index, Dashboard, Admin, Staff, Database, Testing, and Documentation.
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Append New Task</span>
        </button>
      </div>

      {/* 1-Day Rule Banner */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-pink-400" />
          <span>
            <strong>1-Day System Testing Rule:</strong> For each task (e.g. Task 1: Index, Task 4: Staff), members have 1 day (24 hours) to test the system. If 1 day passes without completion, <strong>it turns RED and is permanently locked</strong>.
          </span>
        </div>

        <select
          value={filterPhase}
          onChange={e => setFilterPhase(e.target.value)}
          className="bg-black border border-pink-900/50 rounded-xl px-3 py-1.5 text-xs text-pink-300"
        >
          <option value="ALL">All Module Phases</option>
          {allPhases.map(p => (
            <option key={p} value={p}>
              {p} Phase
            </option>
          ))}
        </select>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => {
          const isExpired =
            task.status === 'Expired' ||
            (task.testingExpiresAt &&
              new Date(task.testingExpiresAt).getTime() < now &&
              task.status !== 'Completed');

          const assignees = users.filter(u => task.assigneeIds.includes(u.id));

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xl ${
                isExpired
                  ? 'bg-red-950/25 border-red-600 hover:border-red-500 shadow-red-950/40'
                  : 'bg-zinc-950 hover:bg-black border-pink-900/35 hover:border-pink-500 hover:shadow-pink-950/40'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-500/30">
                    {task.code}
                  </span>

                  {isExpired ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm animate-pulse">
                      ⚠️ 1-DAY EXPIRED &amp; LOCKED
                    </span>
                  ) : task.status === 'Completed' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900 text-pink-300 border border-pink-900/30">
                      {task.status}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-1">
                  {task.name}
                </h3>
                <span className="text-[11px] font-semibold text-pink-400 block mt-0.5">
                  Phase: {task.modulePhase}
                </span>

                <p className="text-xs text-zinc-400 line-clamp-2 mt-2">
                  {task.description}
                </p>

                {/* Progress Bar */}
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

                {/* 1-Day Testing Notice */}
                <div className="mt-4 pt-3 border-t border-zinc-900">
                  {isExpired ? (
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Task turned RED (1-day expired, locked)</span>
                      </p>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onResetTaskTimer(task.id);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-500/30"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-pink-300/80 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                      <span>1-day testing countdown active</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Assignees Avatars */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  {assignees.map(a => (
                    <img
                      key={a.id}
                      src={a.avatar}
                      alt={a.name}
                      title={`${a.name} (@${a.username})`}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-black"
                    />
                  ))}
                </div>

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
  );
};
