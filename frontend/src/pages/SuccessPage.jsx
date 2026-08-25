import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmission } from '../api/client.js';
import { getEnrollmentPdfBlob, downloadEnrollmentPdf } from '../pdf/generateEnrollmentPdf.jsx';
import { Header } from '../components/Header.jsx';

export default function SuccessPage() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState('');
  const [submission, setSubmission] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let objectUrl;
    getSubmission(id)
      .then(async (data) => {
        setSubmission(data);
        const blob = await getEnrollmentPdfBlob(data);
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(() => setError('Could not load your submission. The link may be invalid.'));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const handleDownload = () => {
    if (submission) downloadEnrollmentPdf(submission, `IFOA-Enrollment-${id}.pdf`);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const studentName = submission?.student
    ? `${submission.student.firstName || ''} ${submission.student.surname || ''}`.trim()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 pb-24 font-sans text-slate-900">
      <Header />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-10 space-y-8">
        {/* Success Hero Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-lg transition-all">
          <div className="flex flex-col items-center text-center">
            {/* Animated / Polished Checkmark Badge */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 ring-8 ring-emerald-50/40 shadow-xs">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold tracking-wide uppercase text-emerald-700 border border-emerald-200/60 mb-2">
              Registration Confirmed
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Enrollment Submitted Successfully
            </h1>

            <p className="mt-2 max-w-lg text-xs sm:text-sm text-slate-500 leading-relaxed">
              Your official application for the International Flight Operations Academy has been registered. You can download or review your official signed PDF document below.
            </p>

            {/* Quick Reference Metadata Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs">
              {studentName && (
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-medium text-slate-700">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-bold text-slate-900">{studentName}</span>
                </div>
              )}

              {submission?.promotionBatch && (
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-medium text-slate-700">
                  <span className="text-slate-400">Batch:</span>
                  <span className="font-bold text-slate-900">{submission.promotionBatch}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-medium text-slate-700">
                <span className="text-slate-400">Ref ID:</span>
                <span className="font-mono font-bold text-slate-800">
                  {id.slice(0, 10)}...
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copy full reference ID"
                  className="ml-1 text-slate-400 hover:text-ifoa-navy transition-colors cursor-pointer"
                >
                  {copied ? (
                    <span className="text-[11px] font-bold text-emerald-600">Copied!</span>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!submission}
                className="flex items-center gap-2.5 rounded-xl bg-ifoa-navy px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-ifoa-navy-light hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Official PDF</span>
              </button>

              <Link
                to="/"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <span>Submit Another Application</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Important Next Steps Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Next Steps & Required Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5 space-y-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-ifoa-navy text-white text-[11px] font-bold">
                1
              </div>
              <p className="font-bold text-slate-800 text-sm">Download & Email Signed Form</p>
              <p className="text-slate-600 leading-relaxed">
                The enrollment form duly filled out and signed shall be emailed to{' '}
                <a
                  href="mailto:info@theIFOA.com"
                  className="font-bold text-ifoa-navy underline hover:text-blue-700 transition-colors"
                >
                  info@theIFOA.com
                </a>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4.5 space-y-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-[11px] font-bold">
                2
              </div>
              <p className="font-bold text-blue-950 text-sm">ID Document Submission</p>
              <p className="text-slate-600 leading-relaxed">
                Two copies of your Passport or Photo ID documents must be sent separately to{' '}
                <a
                  href="mailto:info@theIFOA.com"
                  className="font-bold text-ifoa-navy underline hover:text-blue-700 transition-colors"
                >
                  info@theIFOA.com
                </a>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5 space-y-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-ifoa-navy text-white text-[11px] font-bold">
                3
              </div>
              <p className="font-bold text-slate-800 text-sm">Invoice & Course Confirmation</p>
              <p className="text-slate-600 leading-relaxed">
                Our admissions team will review your batch registration and issue invoice payment confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* PDF Preview Frame */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 text-xs font-bold">
                PDF
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Official Enrollment Agreement
                </span>
                <span className="text-[11px] text-slate-400">Generated EASA Enrollment Document</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!submission}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="p-8 text-center text-sm font-semibold text-red-600">{error}</div>
          ) : pdfUrl ? (
            <iframe title="Enrollment PDF Document" src={pdfUrl} className="h-[800px] w-full bg-slate-100 border-none" />
          ) : (
            <div className="flex h-[500px] flex-col items-center justify-center text-slate-400">
              <svg className="h-8 w-8 animate-spin text-ifoa-navy" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-3 text-xs font-semibold text-slate-500">Rendering official PDF document...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
