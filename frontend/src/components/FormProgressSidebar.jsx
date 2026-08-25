export function FormProgressSidebar({ sections, currentActiveId, onSectionClick }) {
  const trackableSections = sections.filter((s) => s.trackable !== false);
  const totalSections = trackableSections.length;
  const completedSections = trackableSections.filter((s) => s.isCompleted).length;
  const overallPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <aside className="sticky top-20 flex flex-col gap-5">
      {/* Overall Progress Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Form Completion
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {overallPercentage}%
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ifoa-navy/5 text-ifoa-navy">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ifoa-navy via-blue-600 to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.max(overallPercentage, 4)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{completedSections} of {totalSections} steps complete</span>
            <span className="font-semibold text-slate-700">
              {overallPercentage === 100 ? 'Ready to Review' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Sections Steps List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        <div className="px-3 pt-2 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Form Structure
          </p>
        </div>

        <nav className="space-y-1" aria-label="Form Sections Progress">
          {sections.map((section, idx) => {
            const isCompleted = section.isCompleted && section.trackable !== false;
            const isActive = currentActiveId === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionClick(section.id)}
                className={`group flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all select-none ${
                  isActive
                    ? 'bg-slate-50 border border-slate-200/80 shadow-xs'
                    : 'hover:bg-slate-50/70 border border-transparent'
                }`}
              >
                {/* Step Indicator */}
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isActive
                      ? 'bg-ifoa-navy text-white ring-2 ring-ifoa-navy/20'
                      : 'border border-slate-300 bg-white text-slate-500 group-hover:border-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Title and details */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span
                    className={`text-xs font-bold leading-snug transition-colors ${
                      isActive
                        ? 'text-ifoa-navy'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {section.title}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {section.subtitle || (isCompleted ? 'Completed' : 'Pending details')}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Academy Trust Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">EASA Compliant</p>
            <p className="text-[11px] text-slate-500">Official Flight Dispatcher Training</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default FormProgressSidebar;
