import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Key,
  User,
  AlertCircle,
} from 'lucide-react';
import { UserAccount } from '../types';

interface LoginModalProps {
  users: UserAccount[];
  isOpen: boolean;
  onLogin: (userId: string) => Promise<void>;
  onLoginWithCredentials?: (username: string, pass: string) => Promise<void>;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  isOpen,
  onLogin,
  onLoginWithCredentials,
  onClose,
  canDismiss = true,
}) => {
  if (!isOpen) return null;

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickLogin = async (userId: string) => {
    try {
      setIsLoggingIn(true);
      await onLogin(userId);
      if (onClose) onClose();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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
        if (onClose) onClose();
      } else {
        const matched = users.find(
          u =>
            (u.username && u.username.toLowerCase() === usernameInput.trim().toLowerCase()) ||
            u.email.toLowerCase() === usernameInput.trim().toLowerCase()
        );
        if (matched) {
          await onLogin(matched.id);
          if (onClose) onClose();
        } else {
          throw new Error('Account not found. Please verify your credentials.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-black border border-pink-900/60 rounded-3xl w-full max-w-2xl shadow-2xl shadow-pink-950/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border-b border-zinc-900 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 mx-auto flex items-center justify-center shadow-lg shadow-pink-600/40 mb-3 ring-2 ring-pink-400/40">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Switch Capstone Account
          </h2>
          <p className="text-xs text-pink-300/80 mt-1 max-w-md mx-auto">
            Switching into an account automatically logs their daily auto-attendance timestamp.
          </p>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 7 Accounts List */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-2.5">
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-pink-400 block mb-1">
            Choose a Member Profile:
          </span>

          {users.map(user => {
            const isAdmin = user.role === 'Admin';
            return (
              <button
                key={user.id}
                disabled={isLoggingIn}
                onClick={() => handleQuickLogin(user.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center space-x-3.5 group cursor-pointer ${
                  isAdmin
                    ? 'bg-gradient-to-r from-pink-950/40 via-zinc-900 to-black border-pink-500/50 hover:border-pink-400 shadow-md shadow-pink-950/30'
                    : 'bg-zinc-950 border-zinc-900 hover:border-pink-500 hover:bg-black'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-pink-500/50 group-hover:scale-105 transition flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-pink-300 transition truncate">
                      {user.name}
                    </span>
                    {isAdmin ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-600 text-white shadow-sm">
                        PL (Admin)
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        Member
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-pink-400/90 truncate mt-0.5">
                    {user.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                    User: <strong className="text-pink-300">{user.username}</strong> • Pass: <strong className="text-zinc-300">{user.password}</strong>
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-1 transition flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {canDismiss && onClose && (
          <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
