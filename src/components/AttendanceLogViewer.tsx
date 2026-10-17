import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
  RefreshCw,
  Users,
} from 'lucide-react';
import { AttendanceRecord, UserAccount } from '../types';

interface AttendanceLogViewerProps {
  attendanceRecords: AttendanceRecord[];
  users: UserAccount[];
  currentUser: UserAccount;
}

export const AttendanceLogViewer: React.FC<AttendanceLogViewerProps> = ({
  attendanceRecords,
  users,
  currentUser,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter records
  const filteredRecords = attendanceRecords.filter(r => {
    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesUser = selectedUserFilter === 'ALL' || r.userId === selectedUserFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesUser && matchesSearch;
  });

  // Calculate roster for selected date
  const rosterStatus = users.map(user => {
    const record = attendanceRecords.find(a => a.userId === user.id && a.date === selectedDate);
    return {
      user,
      isPresent: !!record,
      record,
    };
  });

  const presentCount = rosterStatus.filter(r => r.isPresent).length;
  const absentCount = users.length - presentCount;
  const attendancePercentage = Math.round((presentCount / users.length) * 100);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Record ID,User Name,User Role,Log Date,Login Timestamp,IP Address,Status,Notes'];
    const rows = attendanceRecords.map(
      r =>
        `"${r.id}","${r.userName}","${r.userRole}","${r.date}","${r.timestamp}","${r.ipAddress}","${r.status}","${(r.notes || '').replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `capstone_attendance_log_${selectedDate || todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border border-pink-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>ADMIN ATTENDANCE MONITORING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Member Login Attendance Tracker</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-mono flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Real-Time
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl">
              Official log tracking every Capstone member's login timestamp, session clock-in, and verification records for active work.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-850 border border-pink-900/50 hover:border-pink-500/60 shadow-lg shadow-black/50 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-pink-400" />
              <span>Export Log (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Black & Pink) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Members</span>
            <Users className="w-4 h-4 text-pink-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{users.length}</span>
            <span className="text-xs text-zinc-400">Registered</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-emerald-900/40 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Clocked In Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{presentCount}</span>
            <span className="text-xs text-emerald-400/80">Verified</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Pending Login</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">{absentCount}</span>
            <span className="text-xs text-zinc-400">Not Logged Yet</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">Turnout Rate</span>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{attendancePercentage}%</span>
            <span className="text-xs text-pink-400 font-mono">Compliance</span>
          </div>
        </div>
      </div>

      {/* Date Roster Cards */}
      <div className="bg-zinc-950 border border-pink-900/40 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-zinc-900">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span>Team Attendance Roster for Date: {selectedDate}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Turnout: <strong className="text-pink-400">{presentCount} of {users.length}</strong> Capstone Members Logged In ({attendancePercentage}%)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-zinc-400">Filter Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-black border border-pink-900/60 text-xs text-white rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-pink-500 font-mono"
            />
          </div>
        </div>

        {/* 7 Members Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {rosterStatus.map(({ user, isPresent, record }) => (
            <div
              key={user.id}
              className={`p-4 rounded-2xl border transition ${
                isPresent
                  ? 'bg-emerald-950/15 border-emerald-500/40 text-emerald-200 shadow-md shadow-emerald-950/20'
                  : 'bg-black border-zinc-900 text-zinc-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-11 h-11 rounded-xl object-cover ring-2 ${
                    isPresent ? 'ring-emerald-500' : 'ring-zinc-800 opacity-60'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    {user.role === 'Admin' && (
                      <span className="text-[9px] bg-pink-600 text-white px-1.5 py-0.2 rounded font-extrabold ml-1">
                        PL
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">{user.title.split('(')[0]}</p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-xs">
                {isPresent ? (
                  <>
                    <span className="inline-flex items-center text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Logged In ({record?.timestamp})
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {record?.ipAddress}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center text-zinc-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-500/70" />
                      Not Logged In Today
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-medium font-mono">Pending</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="bg-zinc-950 border border-pink-900/40 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-900 bg-black/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-pink-400" />
              <span>Official Auto-Attendance Authentication Logbook</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Immutable timestamp audit entries recorded on user session authentication
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search member, IP..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-black border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>

            {/* Member Filter */}
            <select
              value={selectedUserFilter}
              onChange={e => setSelectedUserFilter(e.target.value)}
              className="bg-black border border-zinc-800 text-xs rounded-xl px-3 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
            >
              <option value="ALL">All 7 Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black text-zinc-400 uppercase text-[10px] font-mono tracking-wider border-b border-zinc-900">
              <tr>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Log Date</th>
                <th className="py-3.5 px-4">Login Timestamp</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Proof Status</th>
                <th className="py-3.5 px-4">Session Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                    No attendance records found matching current date and filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span>{record.userName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.userRole === 'Admin'
                            ? 'bg-pink-950 text-pink-300 border border-pink-500/40'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        {record.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-mono">{record.date}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-mono font-bold">
                      {record.timestamp}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                      {record.ipAddress}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate text-[11px]">
                      {record.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
