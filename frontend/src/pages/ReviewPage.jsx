import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { submitForm } from '../api/client.js';
import { SubmissionSummary } from '../components/SubmissionSummary.jsx';
import { Header } from '../components/Header.jsx';
import { validateSchemaAnswers } from '../utils/formSchema.js';

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewNotice, setPreviewNotice] = useState('');

  const { schema, answers, previewMode } = location.state || {};

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  if (!schema || !answers) {
    return <Navigate to="/" replace />;
  }

  const handleConfirm = async () => {
    const validationErrors = validateSchemaAnswers(schema, answers);
    if (validationErrors.length > 0) {
      setError(`Cannot submit enrollment. Missing agreements or required fields:\n${validationErrors.join('\n')}`);
      return;
    }

    if (previewMode) {
      setError('');
      setPreviewNotice('Preview mode: this enrollment was not actually submitted.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { id } = await submitForm(answers);
      navigate(`/success/${id}`);
    } catch (err) {
      setError(err.response?.data?.errors?.join(' ') || err.response?.data?.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <Header />

      {previewMode && (
        <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-xs font-bold text-amber-950 shadow-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>PREVIEW MODE &mdash; showing unsaved Form Builder changes. Submissions are disabled.</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-slate-200/80 bg-white shadow-xs">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Step 2 of 2 &bull; Verification
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Review & Confirm Enrollment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Please carefully verify all submitted information before final registration.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 p-4.5 text-sm font-medium text-red-700 shadow-xs flex items-start gap-3">
            <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {previewNotice && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4.5 text-sm font-medium text-amber-800 shadow-xs flex items-start gap-3">
            <svg className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{previewNotice}</span>
          </div>
        )}

        <SubmissionSummary schema={schema} answers={answers} />

        {/* Action Bar */}
        <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/', { state: { schema, answers, previewMode } })}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-ifoa-navy px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-ifoa-navy-light hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting Enrollment...</span>
                </>
              ) : (
                <>
                  <span>{previewMode ? 'Confirm & Submit (Preview)' : 'Confirm & Submit Enrollment'}</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
