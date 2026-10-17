import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Shield,
  Layers,
} from 'lucide-react';
import { TaskItem, UserAccount, TaskSubmission, TaskStatus } from '../types';

interface TaskInteractiveModalProps {
  task: TaskItem | null;
  users: UserAccount[];
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
  onUpdateTaskStatus?: (taskId: string, status: TaskStatus, progress: number) => Promise<void>;
}

export const TaskInteractiveModal: React.FC<TaskInteractiveModalProps> = ({
  task,
  users,
  currentUser,
  submissions,
  isOpen,
  onClose,
  onSubmitUpdate,
  onUpdateTaskStatus,
}) => {
  if (!isOpen || !task) return null;

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

  // Filter submissions for this specific task
  const taskSubmissions = submissions.filter(s => s.taskId === task.id);
  const assignees = users.filter(u => task.assigneeIds.includes(u.id));

  // Reset or preset form when task changes
  useEffect(() => {
    setEnhancements('');
    setImprovements('');
    setOtherSuggestions('');
    setAttachmentUrl('');
    setAttachmentName('');
    setProgressReported(task.progress);
    setErrorMsg('');
    setSuccessMsg('');
  }, [task]);

  // Handle file upload (drag & drop or input)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.endsWith('.pdf')) {
      setErrorMsg('Please upload an image file (PNG, JPG, WebP) or diagram/document.');
      return;
    }

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

  // Sample screenshot presets for instant review during Capstone evaluation
  const insertSampleScreenshot = (sampleType: 'ui' | 'code' | 'diagram') => {
    let url = '';
    let name = '';
    if (sampleType === 'ui') {
      url = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80';
      name = `${task.modulePhase.toLowerCase()}_ui_mockup_v2.png`;
    } else if (sampleType === 'code') {
      url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80';
      name = `${task.modulePhase.toLowerCase()}_controller_tests.png`;
    } else {
      url = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&auto=format&fit=crop&q=80';
      name = `${task.modulePhase.toLowerCase()}_erd_architecture.png`;
    }
    setAttachmentUrl(url);
    setAttachmentName(name);
    setAttachmentType('image/png');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!enhancements.trim()) {
      setErrorMsg('Please specify the Enhancements (Features to add).');
      return;
    }
    if (!improvements.trim()) {
      setErrorMsg('Please specify the Improvements (Code or UI optimization).');
      return;
    }
    if (!attachmentUrl) {
      setErrorMsg('A required file upload attachment (screenshot/diagram proof) is needed.');
      return;
    }

    try {
      setIsSubmitting(true);
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

      setSuccessMsg('✅ Task update and proof of work successfully submitted for Quality Audit!');
      setEnhancements('');
      setImprovements('');
      setOtherSuggestions('');
      setAttachmentUrl('');
      setAttachmentName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit task update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-500/40 px-2 py-0.5 rounded">
                {task.code}
              </span>
              <span className="text-xs uppercase font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {task.modulePhase} Phase
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {task.status} ({task.progress}%)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {task.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {task.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 divide-y divide-slate-800">
          {/* Section 1: Task Metadata Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Module Phase Details &amp; Assignments
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Timeline Window:</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {task.startDate} → {task.dueDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Priority Level:</span>
                <span
                  className={`font-semibold mt-0.5 block ${
                    task.priority === 'Critical'
                      ? 'text-rose-400'
                      : task.priority === 'High'
                      ? 'text-amber-400'
                      : 'text-slate-200'
                  }`}
                >
                  {task.priority} Priority
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Assigned Members:</span>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {assignees.map(a => (
                    <div
                      key={a.id}
                      className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-[11px] text-slate-200"
                    >
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Form Input Table (Enhancements, Improvements, Suggestions, Attachment) */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Submit Task Progress, Enhancements &amp; Proof</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Submissions automatically feed into the Project Leader's Quality Audit Hub and recalculate your Efficiency Score.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-400">Submitting as:</span>
                <span className="text-xs font-bold text-indigo-300 block">{currentUser.name}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Enhancements */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Enhancements <span className="text-indigo-400 font-normal">(Features to add to {task.modulePhase})</span>
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                <textarea
                  rows={2}
                  value={enhancements}
                  onChange={e => setEnhancements(e.target.value)}
                  placeholder="e.g., Added responsive landing banner, unified auth token validation, dynamic stats badge..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Field 2: Improvements */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Improvements <span className="text-indigo-400 font-normal">(Code or UI optimization performed)</span>
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                <textarea
                  rows={2}
                  value={improvements}
                  onChange={e => setImprovements(e.target.value)}
                  placeholder="e.g., Normalized schema queries with Supabase indexing; reduced layout shifts by 35%..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Field 3: Other Suggestions */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Other Suggestions <span className="text-slate-400 font-normal">(System feedback for PL &amp; Team)</span>
                </label>
                <textarea
                  rows={2}
                  value={otherSuggestions}
                  onChange={e => setOtherSuggestions(e.target.value)}
                  placeholder="e.g., Suggest scheduling a 15-minute QA walk-through with Catubay Mark Lawrence before defense..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Progress Slider */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">
                    Module Completion Percentage:
                  </span>
                  <span className="font-bold text-indigo-400 text-sm">
                    {progressReported}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressReported}
                  onChange={e => setProgressReported(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0% (Not Started)</span>
                  <span>50% (Halfway)</span>
                  <span>75% (QA Testing)</span>
                  <span>100% (Completed)</span>
                </div>
              </div>

              {/* Field 4: Required Attachment Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Attachment Field <span className="text-rose-400">*</span>
                    <span className="text-slate-400 font-normal ml-1">
                      (Screenshots of progress, diagrams, or documentation drafts)
                    </span>
                  </label>
                  {/* Quick sample insert buttons for testing */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Quick preset:</span>
                    <button
                      type="button"
                      onClick={() => insertSampleScreenshot('ui')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 cursor-pointer"
                    >
                      UI Screenshot
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSampleScreenshot('code')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 cursor-pointer"
                    >
                      Code Proof
                    </button>
                  </div>
                </div>

                {/* Upload Drag & Drop Area */}
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-950/40 transition">
                  {attachmentUrl ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      <div className="flex items-center space-x-3">
                        <img
                          src={attachmentUrl}
                          alt="Attachment preview"
                          onClick={() => setPreviewLightbox(attachmentUrl)}
                          className="w-16 h-12 object-cover rounded-lg border border-slate-600 shadow cursor-pointer hover:opacity-80"
                        />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-white truncate max-w-xs">
                            {attachmentName || 'proof_attachment.png'}
                          </p>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            File attached and ready for audit
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewLightbox(attachmentUrl)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
                        >
                          View Full
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentUrl('');
                            setAttachmentName('');
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700/50 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                      <p className="text-xs font-medium text-slate-300">
                        Drag and drop your screenshot/diagram proof, or{' '}
                        <label className="text-indigo-400 hover:text-indigo-300 cursor-pointer underline">
                          browse files
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Supported: PNG, JPG, WebP, SVG, PDF (Max 20MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording Proof...' : 'Submit to Quality Audit'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Submissions History & Audit Log for this task */}
          <div className="pt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Task Progress &amp; Audit Submission History</span>
              <span className="text-[11px] font-normal text-slate-400">
                {taskSubmissions.length} logged record(s)
              </span>
            </h3>

            {taskSubmissions.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                No submissions recorded yet for {task.name}. Submit the form above to add your proof of work!
              </div>
            ) : (
              <div className="space-y-3">
                {taskSubmissions.map(sub => (
                  <div
                    key={sub.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{sub.submittedByName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        {sub.status === 'Approved' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                            Approved by PL
                          </span>
                        ) : sub.status === 'Changes Requested' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                            <AlertCircle className="w-3 h-3 mr-1 text-rose-400" />
                            Revision Requested
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3 mr-1 text-amber-400" />
                            Pending Quality Audit
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] text-indigo-400 font-semibold block">
                          Features Added (Enhancements):
                        </span>
                        <p className="text-slate-300 mt-0.5 text-xs">{sub.enhancements}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-teal-400 font-semibold block">
                          Optimization (Improvements):
                        </span>
                        <p className="text-slate-300 mt-0.5 text-xs">{sub.improvements}</p>
                      </div>
                    </div>

                    {sub.otherSuggestions && (
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          Suggestions:
                        </span>
                        <p className="text-slate-300 mt-0.5 text-xs">{sub.otherSuggestions}</p>
                      </div>
                    )}

                    {/* Screenshot Proof thumbnail */}
                    {sub.attachmentUrl && (
                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        <div className="flex items-center space-x-2">
                          <img
                            src={sub.attachmentUrl}
                            alt="Attachment proof"
                            onClick={() => setPreviewLightbox(sub.attachmentUrl)}
                            className="w-12 h-9 object-cover rounded border border-slate-700 cursor-pointer hover:opacity-80"
                          />
                          <span className="text-[11px] text-slate-400 truncate max-w-xs">
                            {sub.attachmentName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewLightbox(sub.attachmentUrl)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Full Screenshot
                        </button>
                      </div>
                    )}

                    {/* Admin Feedback note if any */}
                    {sub.adminFeedback && (
                      <div className="bg-indigo-950/40 border border-indigo-900/50 p-2.5 rounded-lg text-[11px]">
                        <span className="font-semibold text-indigo-300 block">
                          Project Leader Audit Note ({sub.reviewedBy || 'PL Cabildo'}):
                        </span>
                        <p className="text-slate-200 mt-0.5">{sub.adminFeedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Image Inspection */}
      {previewLightbox && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewLightbox(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={previewLightbox}
              alt="Enlarged screenshot"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewLightbox(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-slate-800 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-700"
            >
              Close [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
