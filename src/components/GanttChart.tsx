import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Plus,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { TaskItem, UserAccount, TaskStatus } from '../types';

interface GanttChartProps {
  tasks: TaskItem[];
  users: UserAccount[];
  currentUser: UserAccount;
  onSelectTask: (task: TaskItem) => void;
  onOpenTaskRegistry: () => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  users,
  currentUser,
  onSelectTask,
  onOpenTaskRegistry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');

  const isAdmin = currentUser.role === 'Admin';

  // Compute timeline bounds
  const { minDate, maxDate, totalDays, datesList } = useMemo(() => {
    if (tasks.length === 0) {
      const now = new Date();
      return {
        minDate: new Date(now.getFullYear(), now.getMonth(), 1),
        maxDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        totalDays: 30,
        datesList: [],
      };
    }

    let min = new Date('2026-10-01');
    let max = new Date('2026-11-05');

    tasks.forEach(t => {
      const s = new Date(t.startDate);
      const d = new Date(t.dueDate);
      if (s < min) min = s;
      if (d > max) max = d;
    });

    // Add small buffer
    const paddedMin = new Date(min);
    paddedMin.setDate(paddedMin.getDate() - 2);
    const paddedMax = new Date(max);
    paddedMax.setDate(paddedMax.getDate() + 4);

    const diffMs = paddedMax.getTime() - paddedMin.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const list: Date[] = [];
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(paddedMin);
      d.setDate(d.getDate() + i);
      list.push(d);
    }

    return {
      minDate: paddedMin,
      maxDate: paddedMax,
      totalDays: diffDays,
      datesList: list,
    };
  }, [tasks]);

  // Unique phases
  const allPhases = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => set.add(t.modulePhase));
    return Array.from(set);
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.modulePhase.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPhase = selectedPhase === 'ALL' || t.modulePhase === selectedPhase;
      const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
      const matchesAssignee =
        selectedAssignee === 'ALL' || t.assigneeIds.includes(selectedAssignee);

      return matchesSearch && matchesPhase && matchesStatus && matchesAssignee;
    });
  }, [tasks, searchTerm, selectedPhase, selectedStatus, selectedAssignee]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const inReview = tasks.filter(t => t.status === 'In Review').length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;
    const avgProgress = total > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0;

    return { total, completed, inProgress, inReview, notStarted, avgProgress };
  }, [tasks]);

  // Today marker calculation
  const today = new Date('2026-10-17'); // Local simulation anchor aligned with prompt time
  const todayOffsetDays = Math.max(
    0,
    Math.round((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const todayLeftPercent = (todayOffsetDays / totalDays) * 100;

  // Helpers
  const getTaskLeftAndWidth = (startDate: string, dueDate: string) => {
    const start = new Date(startDate);
    const end = new Date(dueDate);

    const startOffset = Math.max(0, Math.round((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${Math.min(100, Math.max(0, leftPercent))}%`,
      width: `${Math.min(100, Math.max(2, widthPercent))}%`,
    };
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/40">
            <Clock className="w-3 h-3 mr-1 text-blue-400" />
            In Progress
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <FileText className="w-3 h-3 mr-1 text-purple-400" />
            Under QA Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            Not Started
          </span>
        );
    }
  };

  const getBarColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'from-emerald-600 to-teal-500 border-emerald-400/60 shadow-emerald-950/50';
      case 'In Progress':
        return 'from-indigo-600 to-blue-500 border-indigo-400/60 shadow-indigo-950/50';
      case 'In Review':
        return 'from-purple-600 to-pink-500 border-purple-400/60 shadow-purple-950/50';
      default:
        return 'from-slate-700 to-slate-800 border-slate-600 shadow-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Total Capstone Modules</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-white">{metrics.total}</span>
            <span className="text-xs text-slate-400">Phases</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-900/40 p-3.5 rounded-xl">
          <p className="text-xs text-emerald-400 font-medium">Completed</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-300">{metrics.completed}</span>
            <span className="text-xs text-emerald-500 font-medium">
              {Math.round((metrics.completed / (metrics.total || 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-blue-900/40 p-3.5 rounded-xl">
          <p className="text-xs text-blue-400 font-medium">Active In Progress</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-blue-300">{metrics.inProgress}</span>
            <span className="text-xs text-blue-500 font-medium">Working</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-purple-900/40 p-3.5 rounded-xl">
          <p className="text-xs text-purple-400 font-medium">Under QA Audit</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-purple-300">{metrics.inReview}</span>
            <span className="text-xs text-purple-400 font-medium">Reviewing</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Not Started</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-300">{metrics.notStarted}</span>
            <span className="text-xs text-slate-500 font-medium">Queued</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-indigo-900/50 p-3.5 rounded-xl">
          <p className="text-xs text-indigo-400 font-medium">Overall Progress</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-indigo-300">{metrics.avgProgress}%</span>
            <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden self-center">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${metrics.avgProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks (e.g., Task 1: Index, Dashboard, Admin)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Phase filter */}
            <select
              value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Module Phases</option>
              {allPhases.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Assignee filter */}
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All 7 Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name.split(',')[0]} ({u.role})
                </option>
              ))}
            </select>

            {isAdmin && (
              <button
                onClick={onOpenTaskRegistry}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Tip banner for clicking tasks */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              <strong>Interactive Table Trigger:</strong> Click on any task bar or row to open its dedicated table view, submit enhancements, improvements, suggestions, and proof screenshot attachments.
            </span>
          </div>
          <span className="hidden lg:inline text-slate-400 text-[11px]">
            Showing {filteredTasks.length} of {tasks.length} modules
          </span>
        </div>
      </div>

      {/* Main Gantt Timeline View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header split: Left tasks column, Right Timeline scale */}
        <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-950/70 text-xs font-semibold text-slate-400">
          <div className="col-span-12 lg:col-span-4 p-3 border-r border-slate-800/80 flex items-center justify-between">
            <span className="uppercase tracking-wider">Module Phase / Task Hierarchy</span>
            <span className="text-[11px] text-slate-400">Assignees &amp; Progress</span>
          </div>
          <div className="hidden lg:block lg:col-span-8 p-3 overflow-hidden relative">
            <div className="flex items-center justify-between text-slate-300 text-xs">
              <span>{minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="font-bold text-indigo-400">OCTOBER - NOVEMBER 2026 (CAPSTONE SPRINT TIMELINE)</span>
              <span>{maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {/* Timeline week markers */}
            <div className="grid grid-cols-5 text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
              <div>Week 1 (Oct 1 - Oct 7)</div>
              <div>Week 2 (Oct 8 - Oct 14)</div>
              <div>Week 3 (Oct 15 - Oct 21)</div>
              <div>Week 4 (Oct 22 - Oct 28)</div>
              <div>Week 5 (Oct 29 - Nov 4)</div>
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-slate-800/60">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-300">No Capstone tasks match your filter.</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting search filters or append a new module.</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const { left, width } = getTaskLeftAndWidth(task.startDate, task.dueDate);
              const assignees = users.filter(u => task.assigneeIds.includes(u.id));
              const isOverdue = task.status !== 'Completed' && new Date(task.dueDate) < today;

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="grid grid-cols-12 group hover:bg-slate-800/50 transition cursor-pointer"
                >
                  {/* Left Column: Task Name, Phase badge, Assignees & Status */}
                  <div className="col-span-12 lg:col-span-4 p-3.5 border-r border-slate-800/80 flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-500/30">
                            {task.code}
                          </span>
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                            {task.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(task.status)}
                        {isOverdue && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 rounded">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      {/* Assignee Avatar Stack */}
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {assignees.map(a => (
                          <img
                            key={a.id}
                            src={a.avatar}
                            alt={a.name}
                            title={`${a.name} (${a.title})`}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-slate-900"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Gantt Timeline Bar */}
                  <div className="col-span-12 lg:col-span-8 p-3.5 flex items-center relative min-h-[64px] bg-slate-900/40">
                    {/* Background date grid lines */}
                    <div className="absolute inset-0 grid grid-cols-5 pointer-events-none opacity-20 divide-x divide-slate-700">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>

                    {/* Today marker vertical dashed line */}
                    {todayLeftPercent >= 0 && todayLeftPercent <= 100 && (
                      <div
                        className="absolute top-0 bottom-0 z-10 pointer-events-none border-l-2 border-dashed border-rose-500/70"
                        style={{ left: `${todayLeftPercent}%` }}
                        title="Today (Oct 17, 2026)"
                      >
                        <span className="absolute -top-1 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded">
                          TODAY
                        </span>
                      </div>
                    )}

                    {/* Horizontal Task Gantt Bar */}
                    <div
                      className="relative h-10 rounded-xl shadow-lg border flex items-center px-3 z-20 transition-all transform group-hover:scale-[1.01]"
                      style={{
                        marginLeft: left,
                        width: width,
                      }}
                    >
                      {/* Gradient background with progress fill */}
                      <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getBarColor(
                          task.status
                        )} opacity-90 overflow-hidden`}
                      >
                        {/* Inner progress fill bar */}
                        <div
                          className="h-full bg-white/20 transition-all border-r border-white/40"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>

                      {/* Content inside Gantt bar */}
                      <div className="relative z-10 w-full flex items-center justify-between text-white text-xs font-medium drop-shadow">
                        <span className="truncate pr-2 font-semibold">
                          {task.name} ({task.progress}%)
                        </span>
                        <span className="text-[10px] text-white/90 whitespace-nowrap bg-black/30 px-1.5 py-0.5 rounded">
                          {task.startDate.slice(5)} → {task.dueDate.slice(5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
