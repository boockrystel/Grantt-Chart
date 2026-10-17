import React, { useState } from 'react';
import { X, Plus, Calendar, Layers, Check, Users, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { UserAccount, TaskPriority, TaskItem } from '../types';

interface TaskRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  existingTasksCount: number;
  defaultAssigneeId?: string | null;
  onCreateTask: (taskData: {
    name: string;
    modulePhase: string;
    description: string;
    startDate: string;
    dueDate: string;
    priority: TaskPriority;
    assigneeIds: string[];
  }) => Promise<void>;
}

export const TaskRegistryModal: React.FC<TaskRegistryModalProps> = ({
  isOpen,
  onClose,
  users,
  existingTasksCount,
  defaultAssigneeId,
  onCreateTask,
}) => {
  if (!isOpen) return null;

  const nextNumber = existingTasksCount + 1;
  const [taskName, setTaskName] = useState(`Task ${nextNumber}: `);
  const [modulePhase, setModulePhase] = useState('Staff');
  const [customPhase, setCustomPhase] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-10-18');
  const [dueDate, setDueDate] = useState('2026-10-28');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(() =>
    defaultAssigneeId ? [defaultAssigneeId] : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!taskName.trim() || taskName.trim() === `Task ${nextNumber}:`) {
      setErrorMsg('Please enter a valid task name.');
      return;
    }
    if (!startDate || !dueDate) {
      setErrorMsg('Please specify both start and due dates.');
      return;
    }
    if (new Date(dueDate) < new Date(startDate)) {
      setErrorMsg('Due date cannot precede the start date.');
      return;
    }
    if (selectedAssignees.length === 0) {
      setErrorMsg('Please assign at least one Capstone member.');
      return;
    }

    try {
      setIsSubmitting(true);
      const finalPhase = modulePhase === 'Custom' ? customPhase.trim() || 'Custom Phase' : modulePhase;

      await onCreateTask({
        name: taskName.trim(),
        modulePhase: finalPhase,
        description: description.trim() || 'Capstone development requirement.',
        startDate,
        dueDate,
        priority,
        assigneeIds: selectedAssignees,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to append task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-black border border-pink-900/60 rounded-3xl w-full max-w-2xl shadow-2xl shadow-pink-950/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-900 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-600/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Admin Task Registry (Append Module)
              </h3>
              <p className="text-xs text-pink-300/80">
                A 1-day testing countdown is automatically applied to newly registered tasks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Module Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
              Task Name / Module Title <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="e.g. Task 8: Security Audit & Penetration Testing"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          {/* Phase Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                Module Phase Category <span className="text-pink-500">*</span>
              </label>
              <select
                value={modulePhase}
                onChange={e => setModulePhase(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-zinc-200 focus:ring-2 focus:ring-pink-500"
              >
                <option value="Index">Index Phase</option>
                <option value="Dashboard">Dashboard Phase</option>
                <option value="Admin">Admin Phase</option>
                <option value="Staff">Staff Phase</option>
                <option value="Database">Database &amp; API Phase</option>
                <option value="Data Gathering">Data Gathering Phase</option>
                <option value="Documentation">Documentation Phase</option>
                <option value="Custom">Custom Phase...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                Priority Level <span className="text-pink-500">*</span>
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-zinc-200 focus:ring-2 focus:ring-pink-500"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Milestone</option>
              </select>
            </div>
          </div>

          {modulePhase === 'Custom' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                Custom Phase Name
              </label>
              <input
                type="text"
                value={customPhase}
                onChange={e => setCustomPhase(e.target.value)}
                placeholder="e.g. Stakeholder Acceptance Testing"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
              Description &amp; Acceptance Requirements
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Key specifications, deliverables, and architecture goals..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                Start Date <span className="text-pink-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-white focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                Due Date <span className="text-pink-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-white focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
              Assign to Capstone Members <span className="text-pink-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-zinc-950 rounded-2xl border border-zinc-800">
              {users.map(u => {
                const isSelected = selectedAssignees.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleAssignee(u.id)}
                    className={`flex items-center space-x-2.5 p-2 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-pink-950/60 border-pink-500/60 text-white'
                        : 'bg-black border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-pink-600 border-pink-500 text-white'
                          : 'border-zinc-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-pink-500/50"
                    />
                    <div className="truncate text-xs">
                      <span className="font-bold block truncate">{u.name}</span>
                      <span className="text-[10px] text-pink-400/80 block truncate">
                        @{u.username} • {u.title.split('(')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-900 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg shadow-pink-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Appending...' : 'Append to Task Registry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
