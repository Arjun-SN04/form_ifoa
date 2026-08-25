import { SectionCard } from './SectionCard.jsx';

function SummaryRow({ label, value, fullWidth = false }) {
  const isEmail = typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const isTel = typeof value === 'string' && /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/.test(value.trim());

  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800 break-words">
        {isEmail ? (
          <a
            href={`mailto:${value}`}
            className="text-ifoa-navy underline decoration-slate-300 hover:text-blue-700 hover:decoration-blue-500 transition-colors"
          >
            {value}
          </a>
        ) : isTel ? (
          <a
            href={`tel:${value.replace(/\s+/g, '')}`}
            className="text-slate-800 hover:text-ifoa-navy hover:underline transition-colors"
          >
            {value}
          </a>
        ) : (
          value || '—'
        )}
      </div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

function formatFieldValue(field, value) {
  if (field.type === 'checkbox') return value === true ? '✓ Accepted and Confirmed' : 'Not accepted';
  if (field.type === 'checkboxGroup') return Array.isArray(value) && value.length ? value.join(', ') : '';
  if (field.type === 'date' && value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  }
  return value;
}

export function SubmissionSummary({ schema, answers }) {
  const sections = [...schema.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => {
        const sectionAnswers = answers?.[section.id] || {};
        const fields = [...section.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        return (
          <SectionCard key={section.id} title={section.title} stepNumber={idx + 1} isCompleted={true}>
            <Grid>
              {fields.map((field) => {
                if (field.type === 'staticText') return null;
                const isWide = field.type === 'checkbox' || field.type === 'checkboxGroup' || field.type === 'textarea';
                return (
                  <SummaryRow
                    key={field.id}
                    label={field.label}
                    value={formatFieldValue(field, sectionAnswers[field.id])}
                    fullWidth={isWide}
                  />
                );
              })}
            </Grid>
          </SectionCard>
        );
      })}
    </div>
  );
}

export default SubmissionSummary;
