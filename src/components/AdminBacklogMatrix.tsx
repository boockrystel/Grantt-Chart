import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  UserX,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  Bell,
  Sparkles,
  ShieldAlert,
  Layers,
  ChevronRight,
  Search,
} from 'lucide-react';
import { MemberBacklogSummary, TaskItem, UserAccount } from '../types';

interface AdminBacklogMatrixProps {
  backlogData: {
    totalUncompletedTasks: number;
    uncompletedTasks: TaskItem[];
    memberBacklog: MemberBacklogSummary[];
  };
  currentUser: UserAccount;
  onSelectTask: (task: TaskItem) => void;
  onNudgeMember: (memberName: string) => void;
}

export const AdminBacklogMatrix: React.FC<AdminBacklogMatrixProps> = ({
  backlogData,
  currentUser,
  onSelectTask,
  onNudgeMember,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'LAGGING' | 'OVERDUE'>('ALL');
  const [nudgeAlerts, setNudgeAlerts] = useState<{ [key: string]: boolean }>({});

  const { memberBacklog, uncompletedTasks } = backlogData;

  const handleSendNudge = (user: UserAccount) => {
    setNudgeAlerts(prev => ({ ...prev, [user.id]: true }));
    onNudgeMember(user.name);
    setTimeout(() => {
      setNudgeAlerts(prev => ({ ...prev, [user.id]: false }));
    }, 4000);
  };

  const laggingMembers = memberBacklog.filter(
    m => m.lagStatus === 'Lagging Behind' || m.lagStatus === 'Overdue' || m.lagStatus === 'Attention Needed'
  );

  const displayedMembers = memberBacklog.filter(m => {
    if (filterSeverity === 'LAGGING') return m.lagStatus === 'Lagging Behind';
    if (filterSeverity === 'OVERDUE') return m.lagStatus === 'Overdue';
    return true;
  });

  const getLagBadge = (status: MemberBacklogSummary['lagStatus']) => {
    switch (status) {
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-sm animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" />
            CRITICAL OVERDUE
          </span>
        );
      case 'Lagging Behind':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
            LAGGING BEHIND
          </span>
        );
      case 'Attention Needed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-950/80 text-yellow-300 border border-yellow-500/50">
            <Clock className="w-3.5 h-3.5 mr-1 text-yellow-400" />
            ATTENTION NEEDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            ON TRACK
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-900/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-rose-900/40 border border-rose-500/30 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Task Backlog Matrix &amp; Lagging Indicators
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Project Leader Monitoring Center: Explicit accountability tracking for Almira, Amponin, Booc, Catubay, Sunga, and Tapales.
                </p>
              </div>
            </div>
          </div>

          {/* Quick filter pills */}
          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterSeverity === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Members ({memberBacklog.length})
            </button>
            <button
              onClick={() => setFilterSeverity('LAGGING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterSeverity === 'LAGGING'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lagging Behind
            </button>
            <button
              onClick={() => setFilterSeverity('OVERDUE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterSeverity === 'OVERDUE'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overdue Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Lagging Behind Alert Banner */}
      {laggingMembers.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-white block">
                {laggingMembers.length} Team Member(s) Need Follow-up / Lagging Behind
              </span>
              <span className="text-amber-300/90">
                Action required to ensure Capstone deliverables don't slip past schedule.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-amber-950 px-2.5 py-1 rounded-full border border-amber-500/30">
            Automated Audit Active
          </span>
        </div>
      )}

      {/* Grid of Team Member Backlog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedMembers.map(item => {
          const isUserPL = item.user.role === 'Admin';
          const hasNudgeSent = nudgeAlerts[item.user.id];

          return (
            <div
              key={item.user.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                item.lagStatus === 'Overdue'
                  ? 'bg-gradient-to-b from-slate-900 to-rose-950/20 border-rose-500/40 shadow-rose-950/30 shadow-lg'
                  : item.lagStatus === 'Lagging Behind'
                  ? 'bg-gradient-to-b from-slate-900 to-amber-950/20 border-amber-500/40 shadow-amber-950/30 shadow-lg'
                  : item.lagStatus === 'Attention Needed'
                  ? 'bg-slate-900 border-yellow-500/30'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                {/* Member Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{item.user.name}</span>
                        {isUserPL && (
                          <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded">
                            PL
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">{item.user.title}</p>
                    </div>
                  </div>
                </div>

                {/* Lag Status Badge & Reason */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">
                      Accountability Status:
                    </span>
                    {getLagBadge(item.lagStatus)}
                  </div>
                  <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {item.lagReason}
                  </p>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-4 gap-2 text-center mt-3 pt-2">
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Assigned</span>
                    <span className="text-sm font-bold text-white">{item.assignedCount}</span>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Completed</span>
                    <span className="text-sm font-bold text-emerald-400">{item.completedCount}</span>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Not Started</span>
                    <span
                      className={`text-sm font-bold ${
                        item.notStartedCount > 0 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {item.notStartedCount}
                    </span>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Overdue</span>
                    <span
                      className={`text-sm font-bold ${
                        item.overdueCount > 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {item.overdueCount}
                    </span>
                  </div>
                </div>

                {/* Unstarted / Overdue Task List */}
                {(item.overdueTasks.length > 0 || item.notStartedTasks.length > 0) && (
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Pending Action Modules:
                    </span>
                    <div className="space-y-1">
                      {item.overdueTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask(t)}
                          className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 hover:bg-rose-900/40 text-xs text-rose-200 cursor-pointer transition"
                        >
                          <span className="font-semibold truncate">{t.name}</span>
                          <span className="text-[10px] text-rose-400 bg-rose-900/60 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                            Due {t.dueDate.slice(5)}
                          </span>
                        </div>
                      ))}
                      {item.notStartedTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask(t)}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer transition"
                        >
                          <span className="truncate">{t.name}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                            0% Started
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action: Send Alert / Nudge */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {item.submissionsCount} proof submission(s) logged
                </span>

                <button
                  onClick={() => handleSendNudge(item.user)}
                  disabled={hasNudgeSent}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    hasNudgeSent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>{hasNudgeSent ? 'Alert Dispatched!' : 'Send Proof Nudge'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master List of Uncompleted Modules */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Capstone System Modules Under Active Development ({uncompletedTasks.length} Pending)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          All modules in Index, Dashboard, Admin, Staff, Database, QA, or Documentation phases not yet marked 100% complete.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {uncompletedTasks.map(task => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-indigo-400 font-bold">{task.code}</span>
                <span className="text-slate-400">{task.modulePhase}</span>
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                {task.name}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-1 mt-1">{task.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Progress: {task.progress}%</span>
                <span className="text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
                  Open Table <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
