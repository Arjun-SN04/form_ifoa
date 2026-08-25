import { useEffect, useState } from 'react';
import { adminGetFormSchema, adminUpdateFormSchema } from '../../api/client.js';

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: 'Aa' },
  { value: 'email', label: 'Email Address', icon: '@' },
  { value: 'tel', label: 'Phone Number (with flag)', icon: '📞' },
  { value: 'country', label: 'Country (with flag)', icon: '🌍' },
  { value: 'date', label: 'Date Picker', icon: '📅' },
  { value: 'textarea', label: 'Long Text (Textarea)', icon: '¶' },
  { value: 'select', label: 'Dropdown (Single choice)', icon: '▾' },
  { value: 'radio', label: 'Radio Pills (Single choice)', icon: '◉' },
  { value: 'checkbox', label: 'Checkbox (Yes/No toggle)', icon: '☑' },
  { value: 'checkboxGroup', label: 'Checkbox Group (Multi-choice)', icon: '⚏' },
  { value: 'staticText', label: 'Notice / Info Text Block', icon: 'ℹ' },
  { value: 'promotionBatch', label: 'Promotion Batch (Dynamic intake)', icon: '🎓' },
];

const OPTION_TYPES = ['select', 'radio', 'checkboxGroup'];

export const PREVIEW_SCHEMA_STORAGE_KEY = 'ifoa_preview_schema';

const slugify = (text) =>
  text
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .map((word, i) => (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join('') || `field${Date.now()}`;

const slugifySection = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `section-${Date.now()}`;

function move(array, index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= array.length) return array;
  const copy = [...array];
  [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
  return copy.map((item, i) => ({ ...item, order: i }));
}

function ActionButton({ onClick, title, children, disabled, variant = 'default' }) {
  const variants = {
    default: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300',
    primary: 'border-blue-200 bg-blue-50 text-ifoa-navy hover:bg-blue-100',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold shadow-2xs transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

function FieldEditor({ field, onChange, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, index }) {
  const set = (key) => (e) => onChange({ ...field, [key]: e.target.value });
  const setOptions = (raw) => onChange({ ...field, options: raw.split(',').map((s) => s.trim()).filter(Boolean) });

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs space-y-3">
      {/* Top Field Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500">
            {index + 1}
          </span>
          <input
            type="text"
            value={field.label}
            onChange={set('label')}
            placeholder="Field Label (e.g. Passport Number)"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Field Type Select */}
          <select
            value={field.type}
            onChange={set('type')}
            className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-ifoa-navy focus:bg-white focus:outline-none cursor-pointer"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Reorder & Delete */}
          <div className="flex items-center gap-1">
            <ActionButton onClick={onMoveUp} title="Move Field Up" disabled={!canMoveUp}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </ActionButton>
            <ActionButton onClick={onMoveDown} title="Move Field Down" disabled={!canMoveDown}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </ActionButton>
            <ActionButton onClick={onDelete} title="Delete Field" variant="danger">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Field Settings / Metadata */}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
          id: {field.id}
        </span>

        {field.type !== 'staticText' && field.type !== 'promotionBatch' && (
          <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
            <input
              type="checkbox"
              checked={!!field.required}
              onChange={(e) => onChange({ ...field, required: e.target.checked })}
              className="h-4 w-4 rounded-md border-slate-300 text-ifoa-navy focus:ring-ifoa-navy accent-ifoa-navy cursor-pointer"
            />
            <span>Mandatory Field</span>
          </label>
        )}
      </div>

      {/* Placeholder config */}
      {field.type !== 'staticText' && field.type !== 'checkbox' && field.type !== 'promotionBatch' && (
        <div>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={set('placeholder')}
            placeholder="Placeholder helper text (e.g. e.g. John Doe)..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/15"
          />
        </div>
      )}

      {/* Options for Select / Radio / CheckboxGroup */}
      {OPTION_TYPES.includes(field.type) && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-900">
            Selectable Options (comma-separated)
          </label>
          <input
            type="text"
            value={(field.options || []).join(', ')}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="e.g. Option 1, Option 2, Option 3"
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
          />
        </div>
      )}

      {/* Static text content block */}
      {field.type === 'staticText' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Static Notice / Policy Content
          </label>
          <textarea
            value={field.content || ''}
            onChange={set('content')}
            rows={3}
            placeholder="Enter announcement, legal disclaimer or instructions..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
          />
        </div>
      )}
    </div>
  );
}

function SectionEditor({ section, onChange, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, index }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateField = (idx, newField) => {
    const fields = [...section.fields];
    fields[idx] = newField;
    onChange({ ...section, fields });
  };

  const deleteField = (idx) => {
    onChange({ ...section, fields: section.fields.filter((_, i) => i !== idx) });
  };

  const moveField = (idx, direction) => {
    onChange({ ...section, fields: move(section.fields, idx, direction) });
  };

  const addField = () => {
    const label = 'New Field';
    onChange({
      ...section,
      fields: [
        ...section.fields,
        { id: slugify(`${label}${section.fields.length}`), label, type: 'text', required: false, order: section.fields.length },
      ],
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-sm">
      {/* Section Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-slate-50/70 to-white px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ifoa-navy text-xs font-bold text-white shadow-2xs">
              {index + 1}
            </span>
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={section.title}
                onChange={(e) => onChange({ ...section, title: e.target.value })}
                placeholder="Section Title (e.g. Student Information)"
                className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-extrabold text-slate-900 hover:border-slate-200 focus:border-ifoa-navy focus:bg-white focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={section.description || ''}
                onChange={(e) => onChange({ ...section, description: e.target.value })}
                placeholder="Section subtitle / instructions (optional)..."
                className="w-full rounded-md border border-transparent bg-transparent px-2 py-0.5 text-xs text-slate-500 hover:border-slate-200 focus:border-ifoa-navy focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-500 mr-1">
              {section.fields.length} {section.fields.length === 1 ? 'Field' : 'Fields'}
            </span>

            <ActionButton onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? 'Collapse Section' : 'Expand Section'}>
              <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </ActionButton>

            <ActionButton onClick={onMoveUp} title="Move Section Up" disabled={!canMoveUp}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </ActionButton>

            <ActionButton onClick={onMoveDown} title="Move Section Down" disabled={!canMoveDown}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </ActionButton>

            <ActionButton onClick={onDelete} title="Delete Section" variant="danger">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Section Fields Area */}
      {isExpanded && (
        <div className="bg-slate-50/40 p-5 space-y-4">
          <div className="space-y-3">
            {section.fields.map((field, idx) => (
              <FieldEditor
                key={field.id}
                field={field}
                index={idx}
                onChange={(f) => updateField(idx, f)}
                onDelete={() => deleteField(idx)}
                onMoveUp={() => moveField(idx, -1)}
                onMoveDown={() => moveField(idx, 1)}
                canMoveUp={idx > 0}
                canMoveDown={idx < section.fields.length - 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addField}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-3 text-xs font-bold text-slate-600 hover:border-ifoa-navy hover:text-ifoa-navy hover:bg-slate-50/80 transition-all cursor-pointer shadow-2xs"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Field to {section.title || 'Section'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function FormBuilderPage() {
  const [sections, setSections] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetFormSchema().then((schema) => setSections(schema.sections));
  }, []);

  if (!sections) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="h-8 w-8 animate-spin text-ifoa-navy" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-3 text-xs font-semibold text-slate-500">Loading form builder schema...</p>
      </div>
    );
  }

  const updateSection = (idx, newSection) => {
    const next = [...sections];
    next[idx] = newSection;
    setSections(next);
  };

  const deleteSection = (idx) => {
    if (!confirm(`Delete section "${sections[idx].title}"? This will remove all its fields.`)) return;
    setSections(sections.filter((_, i) => i !== idx));
  };

  const moveSection = (idx, direction) => setSections(move(sections, idx, direction));

  const addSection = () => {
    const title = 'New Section';
    setSections([
      ...sections,
      { id: slugifySection(`${title}-${sections.length}`), title, description: '', order: sections.length, fields: [] },
    ]);
  };

  const handlePreview = () => {
    try {
      sessionStorage.setItem(
        PREVIEW_SCHEMA_STORAGE_KEY,
        JSON.stringify({ sections: sections.map((s, i) => ({ ...s, order: i })) })
      );
      window.open('/?preview=1', '_blank');
    } catch {
      alert('Could not open preview — your browser may be blocking storage or popups.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await adminUpdateFormSchema(sections.map((s, i) => ({ ...s, order: i })));
      setMessage('Form schema saved successfully. Changes are live on the public enrollment form.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.errors?.join(' ') || err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Title & Save Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Form Schema Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Customize form sections, fields, labels, and validation rules in real-time
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-ifoa-navy px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-ifoa-navy-light disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save & Publish Form</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-xs">
          {error}
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-5">
        {sections.map((section, idx) => (
          <SectionEditor
            key={section.id}
            section={section}
            index={idx}
            onChange={(s) => updateSection(idx, s)}
            onDelete={() => deleteSection(idx)}
            onMoveUp={() => moveSection(idx, -1)}
            onMoveDown={() => moveSection(idx, 1)}
            canMoveUp={idx > 0}
            canMoveDown={idx < sections.length - 1}
          />
        ))}
      </div>

      {/* Add New Section Button */}
      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-bold text-slate-600 hover:border-ifoa-navy hover:text-ifoa-navy hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add New Form Section</span>
      </button>
    </div>
  );
}
