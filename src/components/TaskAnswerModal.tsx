import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Lock,
  Archive,
  Sparkles,
  Eye,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { TaskItem, UserAccount, TaskSubmission } from '../types';
import { THIRTY_MINUTES_MS } from '../services/api';

interface TaskAnswerModalProps {
  task: TaskItem | null;
  currentUser: UserAccount;
  submissions: TaskSubmission[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitUpdate: (
    taskId: string,
    data: {
      submittedByUserId: string;
      submittedByName: string;
      enhancements: string;
      improvements: string;
      otherSuggestions: string;
      attachmentUrl: string;
      attachmentName: string;
      attachmentType: string;
      progressReported: number;
    }
  ) => Promise<void>;
  onEditSubmission?: (
    submissionId: string,
    data: {
      enhancements: string;
      improvements: string;
      otherSuggestions: string;
      attachmentUrl?: string;
      attachmentName?: string;
    }
  ) => Promise<void>;
  onResetTaskTestingTimer?: (taskId: string) => Promise<void>;
  onDeleteTask?: (taskId: string, taskName: string) => Promise<void>;
}

export const TaskAnswerModal: React.FC<TaskAnswerModalProps> = ({
  task,
  currentUser,
  submissions,
  isOpen,
  onClose,
  onSubmitUpdate,
  onEditSubmission,
  onResetTaskTestingTimer,
  onDeleteTask,
}) => {
  if (!isOpen || !task) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find user's existing submission for this task
  const userSubmission = submissions.find(
    s => s.taskId === task.id && s.submittedByUserId === currentUser.id
  );

  // Form states
  const [enhancements, setEnhancements] = useState('');
  const [improvements, setImprovements] = useState('');
  const [otherSuggestions, setOtherSuggestions] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentType, setAttachmentType] = useState('image/png');
  const [progressReported, setProgressReported] = useState<number>(task.progress);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewLightbox, setPreviewLightbox] = useState<string | null>(null);

  // Live timer states for 1-day testing & 30-min archive
  const [testingTimeLeft, setTestingTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const [editTimeLeft, setEditTimeLeft] = useState<{ minutes: number; seconds: number; isLocked: boolean }>({
    minutes: 0,
    seconds: 0,
    isLocked: true,
  });

  // Calculate 1-Day Testing Window & 30-Min Lock Timers
  useEffect(() => {
    const calculateTimers = () => {
      const now = Date.now();

      // 1. Calculate 1-Day Testing window
      if (task.testingExpiresAt) {
        const expiresMs = new Date(task.testingExpiresAt).getTime();
        const diff = expiresMs - now;

        if (diff <= 0 || task.status === 'Expired') {
          setTestingTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTestingTimeLeft({ hours, minutes, seconds, isExpired: false });
        }
      }

      // 2. Calculate 30-minute lock after submission
      if (userSubmission) {
        const submittedMs = new Date(userSubmission.submittedAt).getTime();
        const elapsed = now - submittedMs;
        const remaining = THIRTY_MINUTES_MS - elapsed;

        if (remaining <= 0 || userSubmission.isArchived) {
          setEditTimeLeft({ minutes: 0, seconds: 0, isLocked: true });
        } else {
          const minutes = Math.floor(remaining / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setEditTimeLeft({ minutes, seconds, isLocked: false });
        }
      }
    };

    calculateTimers();
    const interval = setInterval(calculateTimers, 1000);
    return () => clearInterval(interval);
  }, [task, userSubmission]);

  // Load existing submission if any
  useEffect(() => {
    if (userSubmission) {
      setEnhancements(userSubmission.enhancements);
      setImprovements(userSubmission.improvements);
      setOtherSuggestions(userSubmission.otherSuggestions || '');
      setAttachmentUrl(userSubmission.attachmentUrl);
      setAttachmentName(userSubmission.attachmentName);
      setProgressReported(userSubmission.progressReported);
    } else {
      setEnhancements('');
      setImprovements('');
      setOtherSuggestions('');
      setAttachmentUrl('');
      setAttachmentName('');
      setProgressReported(task.progress || 25);
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [task, userSubmission]);

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentName(file.name);
    setAttachmentType(file.type);

    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        setAttachmentUrl(event.target.result as string);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Sample screenshot presets
  const insertSampleScreenshot = (type: 'ui' | 'code') => {
    const url =
      type === 'ui'
        ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80';
    setAttachmentUrl(url);
    setAttachmentName(`${task.modulePhase.toLowerCase()}_sample_proof.png`);
    setErrorMsg('');
  };

  const isTaskLockedByExpiry = testingTimeLeft.isExpired && task.status !== 'Completed';
  const isSubmissionLockedBy30Mins = !!userSubmission && editTimeLeft.isLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isTaskLockedByExpiry) {
      setErrorMsg('The 1-day testing period for this task has expired. It is locked and can no longer be answered.');
      return;
    }

    if (isSubmissionLockedBy30Mins) {
      setErrorMsg('The 30-minute editing window has elapsed. This submission is archived and permanently locked.');
      return;
    }

    if (!enhancements.trim() || !improvements.trim()) {
      setErrorMsg('Please specify both Enhancements and Improvements.');
      return;
    }

    if (!attachmentUrl) {
      setErrorMsg('A required file upload attachment (screenshot or diagram proof) is needed.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (userSubmission && !editTimeLeft.isLocked && onEditSubmission) {
        await onEditSubmission(userSubmission.id, {
          enhancements: enhancements.trim(),
          improvements: improvements.trim(),
          otherSuggestions: otherSuggestions.trim(),
          attachmentUrl,
          attachmentName,
        });
        setSuccessMsg('Your submission was successfully updated! Remember: it locks 30 minutes after initial submission.');
      } else {
        await onSubmitUpdate(task.id, {
          submittedByUserId: currentUser.id,
          submittedByName: currentUser.name,
          enhancements: enhancements.trim(),
          improvements: improvements.trim(),
          otherSuggestions: otherSuggestions.trim(),
          attachmentUrl,
          attachmentName: attachmentName || `${task.modulePhase}_proof.png`,
          attachmentType,
          progressReported: Number(progressReported),
        });
        setSuccessMsg('Task deliverables successfully submitted! You have 30 minutes to make any edits before it archives.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        className={`bg-black border ${
          isTaskLockedByExpiry ? 'border-red-600 shadow-red-950/60' : 'border-pink-900/50 shadow-pink-950/40'
        } rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-900 bg-zinc-950/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-pink-400 bg-pink-950/80 border border-pink-500/40 px-2.5 py-0.5 rounded-full">
                {task.code}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                {task.modulePhase} Phase
              </span>

              {isTaskLockedByExpiry ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-600 animate-pulse">
                  ⚠️ 1-DAY EXPIRED &amp; LOCKED
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300">
                  {task.status}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
              {task.name}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">{task.description}</p>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser.role === 'Admin' && onDeleteTask && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-600/70 text-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-red-950/50"
                title="Delete Task (Admin / Project Leader)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Delete Task</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1-Day Testing Rule Banner */}
        <div className="px-6 pt-4 pb-1">
          {isTaskLockedByExpiry ? (
            /* Expired Alert -> TURNS RED ("mag rered at hindi na masagutan") */
            <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-600 text-red-200 shadow-lg shadow-red-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  !
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    TASK TURNED RED: 1-DAY TESTING PERIOD EXPIRED!
                  </h4>
                  <p className="text-xs text-red-200 mt-0.5">
                    The 1-day testing period for this system module has expired. Inputs are locked and it can no longer be answered.
                  </p>
                </div>
              </div>

              {onResetTaskTestingTimer && (
                <button
                  type="button"
                  onClick={() => onResetTaskTestingTimer(task.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-pink-300 border border-pink-500/40 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset 1-Day Timer (Demo)</span>
                </button>
              )}
            </div>
          ) : (
            /* Active 1-Day Testing Countdown */
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-pink-900/40 text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-pink-400" />
                <span className="font-semibold text-white">
                  1-Day Testing Window Active:
                </span>
                <span className="text-pink-400 font-mono font-bold">
                  {testingTimeLeft.hours}h {testingTimeLeft.minutes}m {testingTimeLeft.seconds}s remaining
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Rule: If 1 day passes without completion, it turns RED and is permanently locked.
              </span>
            </div>
          )}

          {/* 30-Minute Edit Window Banner (if already submitted) */}
          {userSubmission && (
            <div className="mt-2.5">
              {isSubmissionLockedBy30Mins ? (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-zinc-400" />
                    <span className="text-white font-semibold">
                      Permanently Archived in Your Account:
                    </span>
                    <span>30 minutes have elapsed. Answers can no longer be edited or modified.</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 text-[10px] text-zinc-400 font-mono">
                    LOCKED ARCHIVE
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-pink-950/40 border border-pink-500/50 text-xs text-pink-200 flex items-center justify-between animate-pulse">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-pink-400" />
                    <span className="text-white font-bold">
                      30-Min Edit Window:
                    </span>
                    <span className="text-pink-300 font-mono font-bold">
                      {editTimeLeft.minutes}m {editTimeLeft.seconds}s remaining
                    </span>
                    <span className="hidden sm:inline">before permanent archive lock.</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-pink-600 text-white font-bold text-[10px]">
                    EDITABLE
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Field 1: Enhancements */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                Enhancements <span className="text-zinc-400 font-normal normal-case">(Features to add to this module)</span>
                <span className="text-pink-500 ml-1">*</span>
              </label>
              <textarea
                rows={3}
                disabled={isTaskLockedByExpiry || isSubmissionLockedBy30Mins}
                value={enhancements}
                onChange={e => setEnhancements(e.target.value)}
                placeholder="e.g. Added public gateway hero showcase, active session auto-redirection, role permission checks..."
                className="w-full bg-zinc-950 border border-zinc-800 disabled:border-red-900/50 disabled:bg-zinc-900/50 rounded-2xl p-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs sm:text-sm"
                required
              />
            </div>

            {/* Field 2: Improvements */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                Improvements <span className="text-zinc-400 font-normal normal-case">(Code or UI optimization performed)</span>
                <span className="text-pink-500 ml-1">*</span>
              </label>
              <textarea
                rows={3}
                disabled={isTaskLockedByExpiry || isSubmissionLockedBy30Mins}
                value={improvements}
                onChange={e => setImprovements(e.target.value)}
                placeholder="e.g. Optimized schema query indexing in localStorage, reduced layout shifts, cached state listeners..."
                className="w-full bg-zinc-950 border border-zinc-800 disabled:border-red-900/50 disabled:bg-zinc-900/50 rounded-2xl p-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs sm:text-sm"
                required
              />
            </div>

            {/* Field 3: Other Suggestions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Other Suggestions <span className="text-zinc-400 font-normal normal-case">(System feedback for PL and team)</span>
              </label>
              <textarea
                rows={2}
                disabled={isTaskLockedByExpiry || isSubmissionLockedBy30Mins}
                value={otherSuggestions}
                onChange={e => setOtherSuggestions(e.target.value)}
                placeholder="e.g. Schedule a 15-minute QA walk-through with Catubay Mark Lawrence before final evaluation..."
                className="w-full bg-zinc-950 border border-zinc-800 disabled:border-red-900/50 disabled:bg-zinc-900/50 rounded-2xl p-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xs sm:text-sm"
              />
            </div>

            {/* Field 4: Attachment Field (Required Screenshot) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Attachment Field <span className="text-pink-500">*</span>
                  <span className="text-zinc-400 font-normal normal-case ml-1">
                    (Screenshots of progress, diagrams, or documentation drafts)
                  </span>
                </label>

                {!isTaskLockedByExpiry && !isSubmissionLockedBy30Mins && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => insertSampleScreenshot('ui')}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-pink-400 border border-pink-900/50 cursor-pointer"
                    >
                      Preset UI
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSampleScreenshot('code')}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-pink-400 border border-pink-900/50 cursor-pointer"
                    >
                      Preset Code
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Box */}
              <div
                className={`border-2 border-dashed ${
                  isTaskLockedByExpiry
                    ? 'border-red-900 bg-red-950/20'
                    : 'border-zinc-800 hover:border-pink-500 bg-zinc-950/60'
                } rounded-2xl p-4 text-center transition`}
              >
                {attachmentUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900 p-3 rounded-xl border border-pink-900/40">
                    <div className="flex items-center space-x-3">
                      <img
                        src={attachmentUrl}
                        alt="Proof preview"
                        onClick={() => setPreviewLightbox(attachmentUrl)}
                        className="w-16 h-12 object-cover rounded-lg border border-pink-500 shadow cursor-pointer hover:opacity-80"
                      />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white truncate max-w-xs">
                          {attachmentName || 'screenshot_proof.png'}
                        </p>
                        <p className="text-[10px] text-pink-400">
                          Proof of work attachment ready
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewLightbox(attachmentUrl)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-pink-300 cursor-pointer"
                      >
                        Inspect Full
                      </button>
                      {!isTaskLockedByExpiry && !isSubmissionLockedBy30Mins && (
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentUrl('');
                            setAttachmentName('');
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/50 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                    <p className="text-xs font-semibold text-zinc-300">
                      Drag &amp; drop screenshot proof, or{' '}
                      <label className="text-pink-400 hover:text-pink-300 cursor-pointer underline">
                        browse files
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          disabled={isTaskLockedByExpiry || isSubmissionLockedBy30Mins}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      PNG, JPG, WebP screenshot of system module progress
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between gap-3">
              <div>
                {currentUser.role === 'Admin' && onDeleteTask && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3.5 py-2.5 text-xs font-bold text-red-300 hover:text-white bg-red-950/70 hover:bg-red-900 border border-red-600/60 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-950/40"
                    title="Delete Task (Admin / Project Leader)"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete Task</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>

                {isTaskLockedByExpiry ? (
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2.5 text-xs font-bold text-white bg-red-900/60 border border-red-600 rounded-xl cursor-not-allowed opacity-80"
                  >
                    Task Locked (1-Day Testing Window Expired)
                  </button>
                ) : isSubmissionLockedBy30Mins ? (
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2.5 text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl cursor-not-allowed opacity-80"
                  >
                    Permanently Archived (30 Mins Elapsed)
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg shadow-pink-600/30 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Submitting...'
                        : userSubmission
                        ? 'Save Changes (Within 30m)'
                        : 'Submit Deliverables & Proof'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal for TaskAnswerModal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border-2 border-red-600/80 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-red-950/80 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-white">Delete Task?</h3>
              <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                Sigurado ka bang nais mong burahin ang module na{' '}
                <strong className="text-red-400">{task.name}</strong>?
              </p>
              <p className="text-[11px] text-zinc-400 mt-2 bg-red-950/40 p-2.5 rounded-xl border border-red-900/40">
                ⚠️ Permanenteng mabubura ang task na ito mula sa system at sa lahat ng member dashboards.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!onDeleteTask || !task) return;
                  try {
                    setIsDeleting(true);
                    setShowDeleteConfirm(false);
                    await onDeleteTask(task.id, task.name);
                    onClose();
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/40 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Task'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for attachment */}
      {previewLightbox && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewLightbox(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={previewLightbox}
              alt="Screenshot Enlarged"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl ring-2 ring-pink-500"
            />
            <button
              onClick={() => setPreviewLightbox(null)}
              className="absolute -top-12 right-0 text-white font-bold text-xs bg-pink-600 px-4 py-2 rounded-full cursor-pointer"
            >
              Close [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
