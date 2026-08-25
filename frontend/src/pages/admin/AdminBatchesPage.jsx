import { useEffect, useState } from 'react';
import {
  adminListBatches,
  adminCreateBatch,
  adminUpdateBatch,
  adminDeleteBatch,
} from '../../api/client.js';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [label, setLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    adminListBatches()
      .then(setBatches)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    setError('');
    setAdding(true);
    try {
      await adminCreateBatch(label.trim(), startDate || undefined);
      setLabel('');
      setStartDate('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add batch.');
    } finally {
      setAdding(false);
    }
  };

  const updateStartDate = async (batch, value) => {
    try {
      await adminUpdateBatch(batch._id, { startDate: value || null });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update batch start date.');
    }
  };

  const toggleActive = async (batch) => {
    try {
      await adminUpdateBatch(batch._id, { isActive: !batch.isActive });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update batch status.');
    }
  };

  const remove = async (batch) => {
    if (!confirm(`Are you sure you want to delete batch "${batch.label}"?`)) return;
    try {
      await adminDeleteBatch(batch._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete batch.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Training Batches
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure available course promotion intakes for student registration
        </p>
      </div>

      {/* Add Batch Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Create New Promotion Batch
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 2026-02 or Fall 2026"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-ifoa-navy focus:outline-none focus:ring-2 focus:ring-ifoa-navy/15 transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Training start date (optional, shown to students)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-ifoa-navy focus:outline-none focus:ring-2 focus:ring-ifoa-navy/15 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !label.trim()}
            className="flex items-center gap-2 rounded-xl bg-ifoa-navy px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-ifoa-navy-light disabled:opacity-50 transition-all cursor-pointer"
          >
            {adding ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Batch</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Batches Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Configured Batches ({batches.length})
          </span>
          <span className="text-xs text-slate-400">
            {batches.filter((b) => b.isActive).length} currently active on registration form
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="h-8 w-8 animate-spin text-ifoa-navy" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-3 text-xs font-semibold text-slate-500">Loading batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No batches created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Use the form above to add your first training batch intake.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400 shadow-xs">
                <tr>
                  <th className="px-5 py-3.5">Batch Label</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">Enrollment Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 text-sm">{b.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="date"
                        defaultValue={b.startDate ? b.startDate.slice(0, 10) : ''}
                        onBlur={(e) => {
                          const current = b.startDate ? b.startDate.slice(0, 10) : '';
                          if (e.target.value !== current) updateStartDate(b, e.target.value);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-ifoa-navy focus:outline-none focus:ring-2 focus:ring-ifoa-navy/15 transition-all"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          b.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {b.isActive ? 'Active (Open)' : 'Inactive (Hidden)'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(b)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                            b.isActive
                              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {b.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(b)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
