import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminListSubmissions, adminDeleteSubmission } from '../../api/client.js';
import { openEnrollmentPdf, downloadEnrollmentPdf } from '../../pdf/generateEnrollmentPdf.jsx';
import { getSubmissionQuickInfo, getSubmissionSearchText } from '../../utils/formSchema.js';

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubmissions = () => {
    setLoading(true);
    adminListSubmissions()
      .then(setSubmissions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Unique batches for filter dropdown
  const uniqueBatches = useMemo(() => {
    const set = new Set(submissions.map((s) => s.promotionBatch).filter(Boolean));
    return Array.from(set);
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || getSubmissionSearchText(s).includes(q);
      const matchesBatch = selectedBatch === 'ALL' || s.promotionBatch === selectedBatch;

      return matchesSearch && matchesBatch;
    });
  }, [submissions, searchQuery, selectedBatch]);

  const handleDelete = async (s, name) => {
    if (!confirm(`Delete submission for "${name}"? This cannot be undone.`)) return;
    setDeletingId(s._id);
    try {
      await adminDeleteSubmission(s._id);
      setSubmissions((prev) => prev.filter((x) => x._id !== s._id));
    } finally {
      setDeletingId(null);
    }
  };

  // Summary Metrics
  const totalCount = submissions.length;
  const latestSubmission = submissions.length > 0 ? submissions[0]?.submittedAt : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Enrollment Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage, verify and review submitted student applications
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSubmissions}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg
            className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Submissions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-ifoa-navy">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Batches
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{uniqueBatches.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Latest Activity
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-800">
            {latestSubmission ? new Date(latestSubmission).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No submissions yet'}
          </p>
          {latestSubmission && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              {new Date(latestSubmission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, email, company..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-ifoa-navy focus:outline-none focus:ring-2 focus:ring-ifoa-navy/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <label htmlFor="batch-filter" className="text-xs font-semibold text-slate-500 shrink-0">
              Batch:
            </label>
            <select
              id="batch-filter"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 focus:border-ifoa-navy focus:outline-none focus:ring-2 focus:ring-ifoa-navy/15 cursor-pointer"
            >
              <option value="ALL">All Batches ({submissions.length})</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="h-8 w-8 animate-spin text-ifoa-navy" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No submissions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery || selectedBatch !== 'ALL'
                ? 'Try adjusting your search criteria or filter to find matching applications.'
                : 'No enrollment applications have been submitted yet.'}
            </p>
            {(searchQuery || selectedBatch !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBatch('ALL');
                }}
                className="mt-4 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="w-full text-left text-sm min-w-[780px]">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400 shadow-xs">
                <tr>
                  <th className="px-5 py-3.5">Student / Applicant</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Promotion Batch</th>
                  <th className="px-5 py-3.5">Submission Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((s) => {
                  const info = getSubmissionQuickInfo(s);
                  const initials =
                    info.name
                      .split(' ')
                      .map((p) => p[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'ST';

                  return (
                    <tr key={s._id} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-extrabold text-slate-700">
                            {initials}
                          </div>
                          <div>
                            <Link
                              to={`/admin/submissions/${s._id}`}
                              className="font-bold text-slate-900 group-hover:text-ifoa-navy transition-colors hover:underline"
                            >
                              {info.name}
                            </Link>
                            <p className="text-xs text-slate-400">
                              {info.citizenship ? `${info.citizenship} • ` : ''}
                              Passport: {info.passportNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {info.email ? (
                          <a
                            href={`mailto:${info.email}`}
                            className="font-medium text-slate-800 text-xs hover:text-ifoa-navy hover:underline transition-colors block"
                          >
                            {info.email}
                          </a>
                        ) : (
                          <p className="font-medium text-slate-400 text-xs">N/A</p>
                        )}
                        {info.phone ? (
                          <a
                            href={`tel:${info.phone.replace(/\s+/g, '')}`}
                            className="text-[11px] text-slate-400 mt-0.5 hover:text-slate-600 block"
                          >
                            {info.phone}
                          </a>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-0.5">—</p>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {s.promotionBatch || 'Unassigned'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-slate-800">
                          {new Date(s.submittedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(s.submittedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEnrollmentPdf(s)}
                            title="View PDF"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadEnrollmentPdf(s, `ifoa-enrollment-${s._id}.pdf`)}
                            title="Download PDF"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(s, info.name)}
                            disabled={deletingId === s._id}
                            title="Delete submission"
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                          <Link
                            to={`/admin/submissions/${s._id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-ifoa-navy px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-ifoa-navy-light transition-all"
                          >
                            <span>View</span>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
