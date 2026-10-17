import React from 'react';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Bell,
  UserCheck,
} from 'lucide-react';
import {
  UserAccount,
  TaskItem,
  MemberBacklogSummary,
  EfficiencyLeaderboardItem,
  TaskSubmission,
} from '../types';

interface AdminDashboardOverviewProps {
  currentUser: UserAccount;
  users: UserAccount[];
  tasks: TaskItem[];
  submissions: TaskSubmission[];
  backlogData: {
    totalUncompletedTasks: number;
    uncompletedTasks: TaskItem[];
    memberBacklog: MemberBacklogSummary[];
  };
  rankingData: EfficiencyLeaderboardItem[];
  onSelectTask: (task: TaskItem) => void;
  onNavigateToMembers: () => void;
  onNavigateToTasks: () => void;
  onNavigateToAttendance: () => void;
  onNudgeMember: (name: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  currentUser,
  users,
  tasks,
  submissions,
  backlogData,
  rankingData,
  onSelectTask,
  onNavigateToMembers,
  onNavigateToTasks,
  onNavigateToAttendance,
  onNudgeMember,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const expiredTasks = tasks.filter(t => t.status === 'Expired').length;
  const totalSubmissions = submissions.length;

  const laggingMembers = backlogData.memberBacklog.filter(
    m => m.lagStatus === 'Lagging Behind' || m.lagStatus === 'Overdue' || m.lagStatus === 'Attention Needed'
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border border-pink-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>PROJECT LEADER COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Dashboard • {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl">
              Real-time monitoring hub for Capstone development phases, 1-day testing compliance, and member productivity leaderboards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onNavigateToAttendance}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Attendance Tracker</span>
            </button>
            <button
              onClick={onNavigateToTasks}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-pink-500/50 shadow-md transition cursor-pointer"
            >
              View All Tasks
            </button>
            <button
              onClick={onNavigateToMembers}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-pink-300 bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 transition cursor-pointer"
            >
              Members Directory
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards (Black & Pink) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Total Modules
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{totalTasks}</span>
            <span className="text-xs text-pink-400 font-mono font-bold">Phases</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Completed Modules
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-400">{completedTasks}</span>
            <span className="text-xs text-emerald-500 font-semibold">
              {Math.round((completedTasks / (totalTasks || 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
            Active in Progress
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-pink-400">{inProgressTasks}</span>
            <span className="text-xs text-zinc-400">Testing</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-red-900/40 p-5 rounded-3xl shadow-xl">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
            1-Day Expired (Red)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-red-400">{expiredTasks}</span>
            <span className="text-xs text-red-500 font-bold">Locked</span>
          </div>
        </div>
      </div>

      {/* Task Backlog Matrix Alert */}
      {laggingMembers.length > 0 && (
        <div className="p-4 rounded-3xl bg-pink-950/20 border border-pink-500/40 text-xs text-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-pink-600/20 flex items-center justify-center text-pink-400 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">
                Task Backlog Matrix: {laggingMembers.length} Member(s) Need Attention
              </span>
              <span className="text-zinc-400">
                Action needed on unstarted modules or 1-day expired testing countdowns.
              </span>
            </div>
          </div>
          <button
            onClick={onNavigateToMembers}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white transition cursor-pointer self-start sm:self-auto"
          >
            Audit Members
          </button>
        </div>
      )}

      {/* Split Grid: Backlog Matrix on Left, Efficiency Ranking on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Team Backlog Matrix Card */}
        <div className="lg:col-span-6 bg-zinc-950 border border-pink-900/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-pink-400" />
              <h3 className="text-base font-bold text-white">
                Member Backlog &amp; Lagging Status
              </h3>
            </div>
            <span className="text-xs text-zinc-500">6 Members Monitored</span>
          </div>

          <div className="space-y-3">
            {backlogData.memberBacklog
              .filter(m => m.user.role !== 'Admin')
              .map(item => (
                <div
                  key={item.user.id}
                  className="p-3.5 rounded-2xl bg-black border border-zinc-900 hover:border-pink-900/50 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-pink-500/50 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.user.name}
                        </h4>
                        <span className="text-[10px] text-pink-400 font-mono">
                          @{item.user.username}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {item.user.title.split('(')[0]}
                      </p>
                      <p className="text-[10px] text-pink-400/90 truncate mt-0.5">
                        {item.lagReason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onNudgeMember(item.user.name)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-900/40 cursor-pointer flex items-center gap-1"
                    >
                      <Bell className="w-3 h-3 text-pink-400" />
                      <span>Nudge</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right: Top Productivity Leaderboard */}
        <div className="lg:col-span-6 bg-zinc-950 border border-pink-900/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center space-x-2.5">
              <Trophy className="w-5 h-5 text-pink-400" />
              <h3 className="text-base font-bold text-white">
                Efficiency Leaderboard (Top Rankings)
              </h3>
            </div>
            <span className="text-xs text-pink-400 font-mono">Live Points</span>
          </div>

          <div className="space-y-3">
            {rankingData.slice(0, 5).map((rank, idx) => (
              <div
                key={rank.user.id}
                className="p-3.5 rounded-2xl bg-black border border-zinc-900 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-lg bg-pink-950/80 text-pink-400 font-mono font-black text-xs flex items-center justify-center border border-pink-500/30">
                    #{idx + 1}
                  </span>
                  <img
                    src={rank.user.avatar}
                    alt={rank.user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-zinc-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {rank.user.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {rank.completedCount} modules complete • {rank.totalSubmissions} proofs
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-pink-400">
                    {rank.productivityScore}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
