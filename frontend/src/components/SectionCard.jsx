export function SectionCard({
  id,
  title,
  stepNumber,
  description,
  icon,
  isCompleted,
  children,
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 mb-8 rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-sm"
    >
      <div className="rounded-t-2xl border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-white px-6 py-4.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stepNumber && (
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-ifoa-navy text-white'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </span>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {title}
              </h2>
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>

          {isCompleted && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          )}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

export default SectionCard;
