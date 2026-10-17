import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  AlertTriangle,
  Trophy,
  ClipboardCheck,
  Database,
  PlusCircle,
  UserCheck,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserAccount, AttendanceRecord } from '../types';

interface NavbarProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  todayAttendance: AttendanceRecord | null;
  activeTab: 'gantt' | 'backlog' | 'ranking' | 'audit' | 'attendance' | 'schema';
  setActiveTab: (tab: 'gantt' | 'backlog' | 'ranking' | 'audit' | 'attendance' | 'schema') => void;
  onSwitchUser: (user: UserAccount) => void;
  onOpenTaskRegistry: () => void;
  pendingAuditCount: number;
  laggingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  todayAttendance,
  activeTab,
  setActiveTab,
  onSwitchUser,
  onOpenTaskRegistry,
  pendingAuditCount,
  laggingCount,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = currentUser.role === 'Admin';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Banner: Auto-attendance verification & Project Info */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 px-4 py-2 border-b border-indigo-900/40 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            CAPSTONE 2026-2027
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="font-medium text-slate-200">
            Development Phase Tracking System &amp; Attendance Proof Hub
          </span>
        </div>

        {/* Real-time Attendance proof pill */}
        <div className="flex items-center gap-3">
          {todayAttendance ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium shadow-inner animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Attendance Proof Verified ({todayAttendance.timestamp})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Logging Auto-Attendance...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  CapstoneGantt
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 border border-indigo-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Project Leader Control Center' : 'Member Phase & Task Workspace'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('gantt')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'gantt'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Gantt Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab('backlog')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'backlog'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Backlog Matrix</span>
              {laggingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {laggingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ranking')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ranking'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Efficiency Ranking</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              <span>Quality Audit</span>
              {pendingAuditCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {pendingAuditCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Daily Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'schema'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>SQL DDL</span>
            </button>
          </nav>

          {/* Right Section: Add Module (Admin only) & User Switcher */}
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={onOpenTaskRegistry}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Append Module</span>
              </button>
            )}

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition cursor-pointer"
                title="Switch Capstone Account"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/50"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    {isAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentUser.title.split('(')[0]}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                      Switch Capstone Account (7 Presets)
                    </p>
                    <p className="text-xs text-indigo-300 mt-0.5">
                      Auto-attendance triggers immediately upon switching
                    </p>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                    {allUsers.map(user => {
                      const isSelected = user.id === currentUser.id;
                      const isUserAdmin = user.role === 'Admin';
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-900/40 text-white'
                              : 'hover:bg-slate-700/60 text-slate-200'
                          }`}
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-600 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium truncate text-white">
                                {user.name}
                              </p>
                              {isUserAdmin ? (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  PL (Admin)
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                                  Member
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {user.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-700/80">
                    <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Cabildo, Kathlyn Joyce holds full Admin PL rights</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 space-x-1 border-t border-slate-800 bg-slate-900/95 scrollbar-none">
        <button
          onClick={() => setActiveTab('gantt')}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'gantt' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          Gantt
        </button>
        <button
          onClick={() => setActiveTab('backlog')}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
            activeTab === 'backlog' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          Backlog
          {laggingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center">
              {laggingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'ranking' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          Efficiency
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          Audit Hub
          {pendingAuditCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-[10px] text-slate-950 flex items-center justify-center">
              {pendingAuditCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
            activeTab === 'schema' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          SQL DDL
        </button>
      </div>
    </header>
  );
};
