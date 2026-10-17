import React, { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Archive,
  LogOut,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Layers,
  Database,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { UserAccount, AttendanceRecord } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeNav: 'dashboard' | 'members' | 'archive' | 'schema';
  onSelectNav: (nav: 'dashboard' | 'members' | 'archive' | 'schema') => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  todayAttendance: AttendanceRecord | null;
  onLogoutToIndex: () => void;
  onSwitchUser: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeNav,
  onSelectNav,
  currentUser,
  allUsers,
  selectedMemberId,
  onSelectMember,
  todayAttendance,
  onLogoutToIndex,
  onSwitchUser,
}) => {
  const isAdmin = currentUser.role === 'Admin';
  // Keep Members dropdown open by default if activeNav is members
  const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(true);

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-black border-r border-pink-900/40 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding & Navigation */}
        <div className="overflow-y-auto flex-1">
          <div className="h-20 px-6 border-b border-pink-950 flex items-center justify-between bg-gradient-to-r from-black via-zinc-950 to-pink-950/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 ring-2 ring-pink-400/40">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
                  <span>CAPSTONE</span>
                  <span className="text-pink-500">PRO</span>
                </span>
                <p className="text-[10px] text-pink-300/80 font-mono tracking-widest uppercase">
                  Black &amp; Pink Edition
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onToggle}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-pink-400 hover:bg-zinc-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info badge */}
          <div className="p-4 mx-3 my-4 rounded-2xl bg-zinc-950 border border-pink-900/30 shadow-inner">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-pink-500 shadow-md shadow-pink-500/20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <p className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </p>
                  {isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                  ) : null}
                </div>
                <p className="text-[11px] text-pink-400 font-medium truncate mt-0.5">
                  @{currentUser.username} • {currentUser.title.split('(')[0]}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Auto-Attendance: Logged Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items (Dashboard, Members Dropdown, Archive, Schema) */}
          {/* Note: "Task" is removed from burger menu and relocated under each member per instruction */}
          <nav className="px-3 space-y-1.5">
            {isAdmin ? (
              <>
                {/* 1. Dashboard */}
                <button
                  onClick={() => {
                    onSelectNav('dashboard');
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeNav === 'dashboard'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
                      : 'text-zinc-300 hover:text-pink-300 hover:bg-zinc-950 border border-transparent hover:border-pink-900/30'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-pink-400" />
                  <span>Dashboard</span>
                </button>

                {/* 2. Members with DROPDOWN */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectNav('members');
                      setIsMembersDropdownOpen(!isMembersDropdownOpen);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      activeNav === 'members'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
                        : 'text-zinc-300 hover:text-pink-300 hover:bg-zinc-950 border border-transparent hover:border-pink-900/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span>Members</span>
                    </div>
                    {isMembersDropdownOpen ? (
                      <ChevronDown className="w-4 h-4 text-pink-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-pink-300" />
                    )}
                  </button>

                  {/* Dropdown Member Options */}
                  {isMembersDropdownOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-1 animate-in slide-in-from-top-1 fade-in duration-150">
                      {allUsers.map(user => {
                        const isSelected = selectedMemberId === user.id && activeNav === 'members';
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSelectNav('members');
                              onSelectMember(user.id);
                              if (window.innerWidth < 1024) onToggle();
                            }}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                              isSelected
                                ? 'bg-pink-950/80 border border-pink-500 text-white font-bold shadow-md shadow-pink-950/50'
                                : 'text-zinc-400 hover:text-pink-300 hover:bg-zinc-900/80 border border-transparent'
                            }`}
                          >
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className={`w-6 h-6 rounded-lg object-cover ring-1 ${
                                isSelected ? 'ring-pink-500' : 'ring-zinc-700'
                              }`}
                            />
                            <div className="min-w-0 flex-1 truncate">
                              <span className="block truncate">{user.name}</span>
                              <span className="text-[10px] text-zinc-500 block truncate">
                                @{user.username}
                              </span>
                            </div>
                            {user.role === 'Admin' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-600 text-white flex-shrink-0">
                                PL
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Audit & Archive */}
                <button
                  onClick={() => {
                    onSelectNav('archive');
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeNav === 'archive'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
                      : 'text-zinc-300 hover:text-pink-300 hover:bg-zinc-950 border border-transparent hover:border-pink-900/30'
                  }`}
                >
                  <Archive className="w-4 h-4 text-pink-400" />
                  <span>Quality Audit Hub</span>
                </button>
              </>
            ) : (
              /* Member Navigation */
              <>
                {/* 1. Members Dropdown for Member Side */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectNav('members');
                      setIsMembersDropdownOpen(!isMembersDropdownOpen);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      activeNav === 'members'
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
                        : 'text-zinc-300 hover:text-pink-300 hover:bg-zinc-950 border border-transparent hover:border-pink-900/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span>Team Members</span>
                    </div>
                    {isMembersDropdownOpen ? (
                      <ChevronDown className="w-4 h-4 text-pink-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-pink-300" />
                    )}
                  </button>

                  {isMembersDropdownOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-1 animate-in slide-in-from-top-1 fade-in duration-150">
                      {allUsers.map(user => {
                        const isSelected = selectedMemberId === user.id && activeNav === 'members';
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              onSelectNav('members');
                              onSelectMember(user.id);
                              if (window.innerWidth < 1024) onToggle();
                            }}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                              isSelected
                                ? 'bg-pink-950/80 border border-pink-500 text-white font-bold shadow-md shadow-pink-950/50'
                                : 'text-zinc-400 hover:text-pink-300 hover:bg-zinc-900/80 border border-transparent'
                            }`}
                          >
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className={`w-6 h-6 rounded-lg object-cover ring-1 ${
                                isSelected ? 'ring-pink-500' : 'ring-zinc-700'
                              }`}
                            />
                            <div className="min-w-0 flex-1 truncate">
                              <span className="block truncate">{user.name}</span>
                              <span className="text-[10px] text-zinc-500 block truncate">
                                @{user.username}
                              </span>
                            </div>
                            {user.id === currentUser.id && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-950 text-pink-300 border border-pink-500/40 flex-shrink-0">
                                You
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. My Account Archive */}
                <button
                  onClick={() => {
                    onSelectNav('archive');
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeNav === 'archive'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
                      : 'text-zinc-300 hover:text-pink-300 hover:bg-zinc-950 border border-transparent hover:border-pink-900/30'
                  }`}
                >
                  <Archive className="w-4 h-4 text-pink-400" />
                  <span>My Account Archive (30m Lock)</span>
                </button>
              </>
            )}

            {/* SQL DDL Tab */}
            <button
              onClick={() => {
                onSelectNav('schema');
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeNav === 'schema'
                  ? 'bg-zinc-900 text-pink-400 border border-pink-500/50'
                  : 'text-zinc-400 hover:text-pink-300 hover:bg-zinc-950'
              }`}
            >
              <Database className="w-4 h-4 text-pink-400" />
              <span>SQL Schema &amp; DDL</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-pink-950/80 bg-black space-y-2">
          <button
            onClick={onSwitchUser}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 text-pink-300 transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-pink-400" />
            <span>Switch Account</span>
          </button>

          <button
            onClick={onLogoutToIndex}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>Logout to Index Page</span>
          </button>
        </div>
      </aside>
    </>
  );
};
