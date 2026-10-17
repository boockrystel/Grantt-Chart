import React from 'react';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  CheckCircle2,
  CalendarCheck,
  FileSpreadsheet,
  Star,
  Sparkles,
} from 'lucide-react';
import { EfficiencyLeaderboardItem } from '../types';

interface EfficiencyRankingProps {
  rankingData: EfficiencyLeaderboardItem[];
}

export const EfficiencyRanking: React.FC<EfficiencyRankingProps> = ({ rankingData }) => {
  const topThree = rankingData.slice(0, 3);
  const remaining = rankingData.slice(3);

  const getBadgeColor = (rating: EfficiencyLeaderboardItem['efficiencyRating']) => {
    switch (rating) {
      case 'Elite Contributor':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
      case 'Proficient':
        return 'bg-blue-950 text-blue-300 border-blue-500/40';
      case 'Active Progress':
        return 'bg-purple-950 text-purple-300 border-purple-500/40';
      default:
        return 'bg-amber-950 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-900/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Live Member Efficiency &amp; Productivity Ranking
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Evaluates completed Capstone modules, verified code/UI enhancements, quality audit approvals, and daily attendance streaks.
              </p>
            </div>
          </div>
          <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Formula: (Completed×30) + (Approved×25) + (Subs×10) + (Days×15)</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {topThree.map((item, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          return (
            <div
              key={item.user.id}
              className={`rounded-2xl border p-5 relative overflow-hidden transition-all shadow-xl ${
                isFirst
                  ? 'bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 border-yellow-500/50 ring-1 ring-yellow-500/30 md:-translate-y-2'
                  : isSecond
                  ? 'bg-gradient-to-b from-slate-900 via-slate-800/40 to-slate-900 border-slate-600'
                  : 'bg-gradient-to-b from-slate-900 via-amber-900/10 to-slate-900 border-amber-800/40'
              }`}
            >
              {/* Podium Rank Badge */}
              <div className="absolute top-4 right-4">
                {isFirst && (
                  <span className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center justify-center font-bold text-sm shadow-lg">
                    🥇
                  </span>
                )}
                {isSecond && (
                  <span className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-200 border border-slate-400/40 flex items-center justify-center font-bold text-sm">
                    🥈
                  </span>
                )}
                {isThird && (
                  <span className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-600/40 flex items-center justify-center font-bold text-sm">
                    🥉
                  </span>
                )}
              </div>

              {/* Avatar & Info */}
              <div className="flex items-center space-x-3">
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className={`w-14 h-14 rounded-2xl object-cover ring-2 ${
                    isFirst
                      ? 'ring-yellow-400 shadow-lg shadow-yellow-500/20'
                      : 'ring-slate-600'
                  }`}
                />
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-yellow-400">
                    Rank #{index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate max-w-[170px]">
                    {item.user.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-[170px]">
                    {item.user.title}
                  </p>
                </div>
              </div>

              {/* Score Showcase */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Productivity Score:</span>
                <span className="text-2xl font-black text-white flex items-center gap-1">
                  <span>{item.productivityScore}</span>
                  <span className="text-xs text-indigo-400 font-semibold">pts</span>
                </span>
              </div>

              {/* Stat Pills */}
              <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-2 text-xs">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Completed</span>
                  <span className="font-bold text-emerald-400">{item.completedCount} modules</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Approved</span>
                  <span className="font-bold text-indigo-400">{item.approvedSubmissions} proofs</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Attendance</span>
                  <span className="font-bold text-teal-400">{item.attendanceDays} days</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Medal className="w-4 h-4 text-indigo-400" />
            <span>Capstone Team Leaderboard Ledger (7 Members)</span>
          </h3>
          <span className="text-xs text-slate-400">Real-time dynamic recalculation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Member Name &amp; Role</th>
                <th className="py-3 px-4 text-center">Modules Completed</th>
                <th className="py-3 px-4 text-center">Submissions Logged</th>
                <th className="py-3 px-4 text-center">PL Approved</th>
                <th className="py-3 px-4 text-center">Attendance Days</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-right">Productivity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankingData.map((item, idx) => (
                <tr
                  key={item.user.id}
                  className="hover:bg-slate-800/40 transition"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.user.avatar}
                        alt={item.user.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-white">{item.user.name}</div>
                        <div className="text-[11px] text-slate-400">{item.user.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-emerald-400">
                      {item.completedCount}
                    </span>{' '}
                    <span className="text-slate-500">/ {item.assignedCount}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-300">
                    {item.totalSubmissions}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-indigo-400">
                    {item.approvedSubmissions}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-teal-300">
                    {item.attendanceDays}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeColor(
                        item.efficiencyRating
                      )}`}
                    >
                      {item.efficiencyRating}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-white">
                    {item.productivityScore}{' '}
                    <span className="text-[10px] text-indigo-400 font-normal">pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
