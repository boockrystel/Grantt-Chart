import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  Code2,
  Table,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { COMPLETE_SQL_DDL } from '../data/seedData';

export const DatabaseSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(COMPLETE_SQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([COMPLETE_SQL_DDL], { type: 'text/sql' });
    element.href = URL.createObjectURL(file);
    element.download = 'capstone_database_schema_ddl.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border border-pink-900/50 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Normalized PostgreSQL &amp; Supabase DDL
            </h2>
            <p className="text-xs text-pink-300/80 mt-0.5">
              3NF Schema DDL, constraints, Row-Level Security, at INSERT seed script para sa 7 Capstone accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-900/40 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Na-copy ang SQL!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-pink-400" />
                <span>Kopyahin ang SQL</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-md shadow-pink-600/30 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>I-download .sql</span>
          </button>
        </div>
      </div>

      {/* Relational Schema Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs mb-1.5">
            <Table className="w-4 h-4" />
            <span>1. public.users &amp; roles</span>
          </div>
          <p className="text-xs text-zinc-300">
            Naka-save ang 7 accounts: Cabildo (PL), Almira, Amponin, Booc, Catubay, Sunga, at Tapales.
          </p>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs mb-1.5">
            <Table className="w-4 h-4" />
            <span>2. public.attendance_logs</span>
          </div>
          <p className="text-xs text-zinc-300">
            Auto-attendance tracking kapag nag-login ang miyembro upang maging patunay sa bawat calendar day.
          </p>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs mb-1.5">
            <Table className="w-4 h-4" />
            <span>3. public.tasks &amp; assignees</span>
          </div>
          <p className="text-xs text-zinc-300">
            Gantt development phases (Task 1: Index, Task 2: Dashboard, Task 3: Admin, Task 4: Staff, etc.) na may 1-day testing countdown.
          </p>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs mb-1.5">
            <Table className="w-4 h-4" />
            <span>4. public.task_submissions</span>
          </div>
          <p className="text-xs text-zinc-300">
            Enhancements, improvements, suggestions, at proof attachments na may 30-min window bago permanente ma-archive.
          </p>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs mb-1.5">
            <Shield className="w-4 h-4" />
            <span>5. Row Level Security</span>
          </div>
          <p className="text-xs text-zinc-300">
            Supabase RLS policies para sa secure read/write permission sa authenticated members at PL audit.
          </p>
        </div>

        <div className="bg-zinc-950 border border-pink-900/30 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>6. Local Storage DB Mirror</span>
          </div>
          <p className="text-xs text-zinc-300">
            Naka-mirror sa browser Local Storage para sa agarang offline capability at zero latency.
          </p>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-zinc-950 border border-pink-900/40 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-black border-b border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-pink-400" />
            <span className="font-mono text-white font-bold">
              schema.sql (PostgreSQL / Supabase DDL)
            </span>
          </div>
          <span className="text-pink-400 font-mono text-[11px]">3NF Normalized</span>
        </div>

        <div className="p-5 overflow-x-auto max-h-[500px] bg-black">
          <pre className="text-xs font-mono text-pink-300/90 leading-relaxed select-all">
            {COMPLETE_SQL_DDL}
          </pre>
        </div>
      </div>
    </div>
  );
};
