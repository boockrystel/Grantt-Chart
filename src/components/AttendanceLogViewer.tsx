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
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter records
  const filteredRecords = attendanceRecords.filter(r => {
    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesUser = selectedUserFilter === 'ALL' || r.userId === selectedUserFilter;
    return matchesDate && matchesUser;
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
  const attendancePercentage = Math.round((presentCount / users.length) * 100);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Record ID,User Name,User Role,Log Date,Login Timestamp,IP Address,Status,Notes'];
    const rows = attendanceRecords.map(
      r =>
        `"${r.id}","${r.userName}","${r.userRole}","${r.date}","${r.timestamp}","${r.ipAddress}","${r.status}","${r.notes.replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `capstone_attendance_log_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-900/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Daily Auto-Attendance &amp; Proof of Work Audit
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Attendance Rule: System automatically logs each member's timestamp the exact moment they authenticate for the calendar day.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export Official Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Date Roster Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Team Attendance Roster for Date: {selectedDate}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Turnout: {presentCount} of {users.length} Capstone Members Verified ({attendancePercentage}%)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* 7 Members Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rosterStatus.map(({ user, isPresent, record }) => (
            <div
              key={user.id}
              className={`p-3.5 rounded-xl border transition ${
                isPresent
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-10 h-10 rounded-full object-cover ring-2 ${
                    isPresent ? 'ring-emerald-500' : 'ring-slate-700 opacity-60'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    {user.role === 'Admin' && (
                      <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.2 rounded font-semibold ml-1">
                        PL
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{user.title.split('(')[0]}</p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {isPresent ? (
                  <>
                    <span className="inline-flex items-center text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Verified ({record?.timestamp})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {record?.ipAddress}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Not Logged In Today
                    </span>
                    <span className="text-[10px] text-amber-500 font-medium">Pending Proof</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Official Auto-Attendance Authentication Logbook
            </h3>
            <p className="text-xs text-slate-400">
              Immutable timestamp audit entries recorded on user session creation
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedUserFilter}
              onChange={e => setSelectedUserFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-slate-200"
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
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Log Date</th>
                <th className="py-3 px-4">Login Timestamp</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Proof Status</th>
                <th className="py-3 px-4">Session Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-white">
                    {record.userName}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        record.userRole === 'Admin'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {record.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{record.date}</td>
                  <td className="py-3 px-4 text-emerald-400 font-mono font-bold">
                    {record.timestamp}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {record.ipAddress}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                    {record.notes}
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
