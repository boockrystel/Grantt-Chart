import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  Send,
  Sparkles,
  Filter,
  Search,
  Eye,
  Check,
  Lock,
} from 'lucide-react';
import { TaskSubmission, UserAccount, TaskItem } from '../types';

interface QualityAuditHubProps {
  submissions: TaskSubmission[];
  users: UserAccount[];
  tasks: TaskItem[];
  currentUser: UserAccount;
  onReviewSubmission: (
    submissionId: string,
    data: {
      status: 'Approved' | 'Changes Requested';
      adminFeedback: string;
      reviewedBy: string;
      updateTaskToComplete?: boolean;
    }
  ) => Promise<void>;
}

export const QualityAuditHub: React.FC<QualityAuditHubProps> = ({
  submissions,
  users,
  tasks,
  currentUser,
  onReviewSubmission,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [memberFilter, setMemberFilter] = useState<string>('ALL');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [markCompleteCheckbox, setMarkCompleteCheckbox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser.role === 'Admin';

  const filteredSubmissions = submissions.filter(s => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesMember = memberFilter === 'ALL' || s.submittedByUserId === memberFilter;
    return matchesStatus && matchesMember;
  });

  const handleOpenReview = (submission: TaskSubmission) => {
    setReviewingId(submission.id);
    setFeedbackNote(submission.adminFeedback || '');
    setMarkCompleteCheckbox(false);
  };

  const handleConfirmReview = async (
    submissionId: string,
    decision: 'Approved' | 'Changes Requested'
  ) => {
    try {
      setIsSubmitting(true);
      await onReviewSubmission(submissionId, {
        status: decision,
        adminFeedback:
          feedbackNote.trim() ||
          (decision === 'Approved'
            ? 'Verified by Project Leader. Quality audit passed.'
            : 'Revisions requested. Please review notes and re-upload proof.'),
        reviewedBy: currentUser.name,
        updateTaskToComplete: markCompleteCheckbox,
      });
      setReviewingId(null);
      setFeedbackNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-black via-zinc-950 to-pink-950/40 border border-pink-900/50 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Feedback &amp; Quality Audit Hub
            </h2>
            <p className="text-xs text-pink-300/80 mt-0.5">
              I-audit ang mga isinumiteng sagot, enhancements, improvements, suggestions, at screenshots ng mga miyembro.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-pink-900/40 text-xs rounded-xl px-3 py-2 text-pink-300 focus:ring-2 focus:ring-pink-500"
          >
            <option value="ALL">Lahat ng Audit Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Changes Requested">Changes Requested</option>
          </select>

          <select
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
            className="bg-zinc-950 border border-pink-900/40 text-xs rounded-xl px-3 py-2 text-pink-300 focus:ring-2 focus:ring-pink-500"
          >
            <option value="ALL">Lahat ng 7 Members</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name.split(',')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-zinc-950 border border-pink-900/30 rounded-3xl p-12 text-center text-zinc-400">
            <ClipboardCheck className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
            <p className="text-sm font-semibold text-white">Walang submission na natagpuan.</p>
          </div>
        ) : (
          filteredSubmissions.map(sub => {
            const submitter = users.find(u => u.id === sub.submittedByUserId);
            const isUnderReviewing = reviewingId === sub.id;

            return (
              <div
                key={sub.id}
                className="bg-zinc-950 border border-pink-900/30 hover:border-pink-500/50 rounded-3xl p-6 shadow-xl transition space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={submitter?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={sub.submittedByName}
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-pink-500"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">
                          {sub.submittedByName}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          ({submitter?.title || 'Capstone Member'})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5 text-xs text-pink-400">
                        <span className="font-bold text-white">{sub.taskName}</span>
                        <span>•</span>
                        <span>Phase: {sub.modulePhase}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {sub.status === 'Approved' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        Approved by PL
                      </span>
                    ) : sub.status === 'Changes Requested' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-950 text-red-300 border border-red-500/50">
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                        Revision Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-pink-950 text-pink-300 border border-pink-500/50 animate-pulse">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-pink-400" />
                        Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Content: Enhancements, Improvements, Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-black/90 p-4 rounded-2xl border border-pink-950">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block mb-1">
                      ✨ Enhancements
                    </span>
                    <p className="text-zinc-200">{sub.enhancements}</p>
                  </div>

                  <div className="bg-black/90 p-4 rounded-2xl border border-pink-950">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block mb-1">
                      ⚡ Improvements
                    </span>
                    <p className="text-zinc-200">{sub.improvements}</p>
                  </div>

                  <div className="bg-black/90 p-4 rounded-2xl border border-zinc-900">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      💡 Other Suggestions
                    </span>
                    <p className="text-zinc-300">{sub.otherSuggestions || 'Walang suggestions.'}</p>
                  </div>
                </div>

                {/* Screenshot Attachment Proof */}
                {sub.attachmentUrl && (
                  <div className="bg-black/60 p-3.5 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={sub.attachmentUrl}
                        alt="Proof screenshot"
                        onClick={() => setPreviewImage(sub.attachmentUrl)}
                        className="w-20 h-14 object-cover rounded-xl border border-pink-500/40 cursor-pointer hover:opacity-80 transition"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Attachment: {sub.attachmentName}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Claimed Progress: {sub.progressReported}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewImage(sub.attachmentUrl)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-pink-300 border border-pink-900/40 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tingnan Buong Larawan</span>
                    </button>
                  </div>
                )}

                {/* Admin Feedback Display */}
                {sub.adminFeedback && !isUnderReviewing && (
                  <div className="bg-pink-950/20 border border-pink-900/50 p-3.5 rounded-2xl text-xs space-y-1">
                    <span className="font-bold text-pink-400 block">
                      Project Leader Audit Note ({sub.reviewedBy || 'PL Cabildo'}):
                    </span>
                    <p className="text-zinc-200">{sub.adminFeedback}</p>
                  </div>
                )}

                {/* Review Controls for PL */}
                {isAdmin && (
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-end space-x-3">
                    {isUnderReviewing ? (
                      <div className="w-full space-y-3 bg-black p-4 rounded-2xl border border-pink-900/50">
                        <label className="block text-xs font-bold text-pink-300">
                          Audit Feedback para kay {sub.submittedByName}:
                        </label>
                        <textarea
                          rows={2}
                          value={feedbackNote}
                          onChange={e => setFeedbackNote(e.target.value)}
                          placeholder="I-type ang komento o tagubilin para sa miyembro..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={markCompleteCheckbox}
                              onChange={e => setMarkCompleteCheckbox(e.target.checked)}
                              className="rounded accent-pink-500"
                            />
                            <span>I-marka rin ang module bilang 100% Completed</span>
                          </label>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setReviewingId(null)}
                              className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 rounded-xl cursor-pointer"
                            >
                              Kanselahin
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleConfirmReview(sub.id, 'Changes Requested')}
                              className="px-3 py-1.5 text-xs font-bold text-red-300 bg-red-950/80 hover:bg-red-900 border border-red-700/50 rounded-xl cursor-pointer"
                            >
                              Request Changes
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleConfirmReview(sub.id, 'Approved')}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-md shadow-pink-600/30 cursor-pointer"
                            >
                              Approve &amp; Verify
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>I-audit / I-review ang Sagot</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Enlarged screenshot"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl ring-2 ring-pink-500"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white font-bold text-xs bg-pink-600 px-4 py-2 rounded-full cursor-pointer"
            >
              Isara [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
