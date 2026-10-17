import React, { useState } from 'react';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  Key,
  User,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserAccount } from '../types';

interface IndexPortalViewProps {
  users: UserAccount[];
  onLogin: (userId: string) => Promise<void>;
  onLoginWithCredentials?: (username: string, pass: string) => Promise<void>;
  currentUser: UserAccount | null;
  onEnterDashboard: () => void;
}

export const IndexPortalView: React.FC<IndexPortalViewProps> = ({
  users,
  onLogin,
  onLoginWithCredentials,
  currentUser,
  onEnterDashboard,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Please enter both your username and password.');
      return;
    }

    try {
      setIsLoggingIn(true);
      if (onLoginWithCredentials) {
        await onLoginWithCredentials(usernameInput.trim(), passwordInput.trim());
      } else {
        const matched = users.find(
          u =>
            (u.username && u.username.toLowerCase() === usernameInput.trim().toLowerCase()) ||
            u.email.toLowerCase() === usernameInput.trim().toLowerCase()
        );
        if (matched) {
          await onLogin(matched.id);
        } else {
          throw new Error('User account not found. Please verify your username.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white flex flex-col justify-between">
      {/* Top Navbar on Index */}
      <nav className="border-b border-pink-950/60 bg-black/85 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 ring-2 ring-pink-500/40">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-white">
                CAPSTONE<span className="text-pink-500">GANTT</span>
              </span>
              <p className="text-[10px] text-pink-400 font-mono tracking-widest uppercase">
                Task 1: Index &amp; Public Access Gateway
              </p>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-600/30 transition cursor-pointer"
            >
              <span>Enter System Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-pink-400 font-mono">
              Auto-Attendance Verification Ready
            </span>
          )}
        </div>
      </nav>

      {/* Main Hero & Login Split View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: System Overview & Architecture Rules */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
            <span>CAPSTONE 2026 • BLACK &amp; PINK EDITION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Gantt Chart &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500">
              Task Management
            </span>{' '}
            System
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Tracks actual Capstone development phases: <strong>Task 1: Index</strong>, <strong>Task 2: Dashboard</strong>, <strong>Task 3: Admin</strong>, <strong>Task 4: Staff</strong>, Database, QA, and Manuscript Documentation.
          </p>

          {/* 3 Core System Architectural Rules */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-zinc-950 border border-pink-900/30">
              <Clock className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  1-Day Testing Window Rule
                </span>
                <span className="text-zinc-400">
                  Each module (e.g. Index, Staff) has a 1-day (24-hour) testing window. If 1 day elapses without completion, the task turns <strong>RED</strong> and is locked so members can no longer answer.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-zinc-950 border border-pink-900/30">
              <Lock className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  30-Minute Edit Window &amp; Account Archive
                </span>
                <span className="text-zinc-400">
                  Members have 30 minutes from submission to make edits. After 30 minutes, answers are permanently locked and moved to the member account's archive.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-zinc-950 border border-pink-900/30">
              <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Instant Auto-Attendance Proof
                </span>
                <span className="text-zinc-400">
                  The exact moment a member logs in, the system automatically logs their daily attendance timestamp as proof of active work.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Member Login with Username & Password */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-zinc-950 border border-pink-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-pink-950/40 relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 mx-auto flex items-center justify-center shadow-lg shadow-pink-600/40 mb-3 ring-2 ring-pink-400/40">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Member &amp; Admin Login
              </h2>
              <p className="text-xs text-pink-300/80 mt-1">
                Enter your individual username and password to log in and register daily auto-attendance.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Username & Password Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    placeholder="e.g. kathlyn.cabildo or eugene.almira"
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full bg-black border border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs sm:text-sm font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-pink-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-600/30 transition disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{isLoggingIn ? 'Verifying & Clocking in...' : 'Sign In & Verify Attendance'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>Authorized Capstone Development Team Access Only</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>
          Capstone Project Management System • Project Leader: Cabildo, Kathlyn Joyce • Black &amp; Pink Edition
        </p>
      </footer>
    </div>
  );
};
