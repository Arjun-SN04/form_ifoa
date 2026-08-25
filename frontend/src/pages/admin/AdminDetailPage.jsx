import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  adminGetSubmission,
  adminUpdateSubmission,
  adminDeleteSubmission,
  adminListBatches,
} from '../../api/client.js';
import { openEnrollmentPdf, downloadEnrollmentPdf } from '../../pdf/generateEnrollmentPdf.jsx';
import { SubmissionSummary } from '../../components/SubmissionSummary.jsx';
import { DynamicSection } from '../../components/form/DynamicSection.jsx';
import { getSubmissionDisplayName } from '../../utils/formSchema.js';

export default function AdminDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [draftAnswers, setDraftAnswers] = useState(null);
  const [batches, setBatches] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = () =>
    adminGetSubmission(id).then((data) => {
      setSubmission(data);
      setDraftAnswers(data.answers);
    });

  useEffect(() => {
    load();
    adminListBatches().then(setBatches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!submission || !draftAnswers) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="h-8 w-8 animate-spin text-ifoa-navy" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-3 text-xs font-semibold text-slate-500">Loading submission details...</p>
      </div>
    );
  }

  const schema = { sections: submission.formSchemaSnapshot };
  const displayName = getSubmissionDisplayName(submission);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const updated = await adminUpdateSubmission(id, { answers: draftAnswers });
      setSubmission(updated);
      setDraftAnswers(updated.answers);
      setEditing(false);
      setSuccessMsg('Submission updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.errors?.join(' ') || err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftAnswers(submission.answers);
    setEditing(false);
    setError('');
  };

  const handleViewPdf = () => openEnrollmentPdf(submission);
  const handleDownloadPdf = () => downloadEnrollmentPdf(submission, `ifoa-enrollment-${id}.pdf`);

  const handleDelete = async () => {
    if (!confirm(`Delete this submission (${displayName})? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await adminDeleteSubmission(id);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
      setDeleting(false);
    }
  };

  const sortedSections = [...schema.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-6 pb-16">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/admin" className="hover:text-ifoa-navy hover:underline flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Submissions</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{displayName}</span>
      </div>

      {/* Header Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                ID: {id}
              </span>
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-ifoa-navy">
                Batch: {submission.promotionBatch || 'None'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{displayName}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submitted on{' '}
              {new Date(submission.submittedAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at {new Date(submission.submittedAt).toLocaleTimeString()}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleViewPdf}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>View PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </button>

            {!editing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-xs hover:bg-red-50 transition-all cursor-pointer disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}

            {editing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-ifoa-navy px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-ifoa-navy-light disabled:opacity-60 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ifoa-navy px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-ifoa-navy-light transition-all cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Submission</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-xs">
          {error}
        </div>
      )}

      {/* Main Detail / Edit Content */}
      {editing ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800">
            <strong>Editing Mode: </strong>
            <span>Update fields below and click Save Changes when finished.</span>
          </div>

          {sortedSections.map((section, idx) => (
            <DynamicSection
              key={section.id}
              section={section}
              stepNumber={idx + 1}
              batches={batches}
              value={draftAnswers[section.id]}
              onChange={(sectionAnswers) => setDraftAnswers({ ...draftAnswers, [section.id]: sectionAnswers })}
            />
          ))}

          {/* Floating Save Actions */}
          <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-md flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-ifoa-navy px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-ifoa-navy-light transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <SubmissionSummary schema={schema} answers={submission.answers} />
      )}
    </div>
  );
}
