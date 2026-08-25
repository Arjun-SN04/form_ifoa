import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBatches, getFormSchema } from '../api/client.js';
import { Header } from '../components/Header.jsx';
import { FormProgressSidebar } from '../components/FormProgressSidebar.jsx';
import { DynamicSection } from '../components/form/DynamicSection.jsx';
import { buildEmptyAnswers, isSectionComplete, isTrackableSection, getDetailedValidationErrors } from '../utils/formSchema.js';
import { PREVIEW_SCHEMA_STORAGE_KEY } from './admin/FormBuilderPage.jsx';

function readPreviewSchema() {
  try {
    const raw = sessionStorage.getItem(PREVIEW_SCHEMA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function StudentFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPreview = Boolean(location.state?.previewMode) || new URLSearchParams(location.search).get('preview') === '1';

  const [schema, setSchema] = useState(() => {
    if (location.state?.schema) return location.state.schema;
    return isPreview ? readPreviewSchema() : null;
  });
  const [formData, setFormData] = useState(() => {
    if (location.state?.answers) return location.state.answers;
    if (isPreview) {
      const draft = readPreviewSchema();
      return draft ? buildEmptyAnswers(draft) : null;
    }
    return null;
  });
  const [batches, setBatches] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [loading, setLoading] = useState(() => !(location.state?.schema) && !(isPreview && readPreviewSchema()));

  useEffect(() => {
    getBatches()
      .then(setBatches)
      .catch(() => setBatches([]));

    if (schema) return;

    getFormSchema()
      .then((s) => {
        setSchema(s);
        setFormData((prev) => prev || buildEmptyAnswers(s));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sections = useMemo(() => {
    if (!schema || !formData) return [];
    return schema.sections
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((section) => ({
        id: `section-${section.id}`,
        title: section.title,
        subtitle: section.description,
        isCompleted: isSectionComplete(section, formData[section.id]),
        trackable: isTrackableSection(section),
        raw: section,
      }));
  }, [schema, formData]);

  useEffect(() => {
    if (sections.length === 0) return undefined;
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSectionId(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handleSectionClick = (sectionId) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSectionDataChange = (sectionId, sectionAnswers) => {
    setFormData((prev) => ({ ...prev, [sectionId]: sectionAnswers }));

    // Clear resolved errors for this section
    setFieldErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${sectionId}.`)) {
          delete next[key];
        }
      });
      return next;
    });
  };

  const handleReview = (e) => {
    e.preventDefault();
    const detailedErrors = getDetailedValidationErrors(schema, formData);
    if (detailedErrors.length > 0) {
      const errMap = {};
      detailedErrors.forEach((err) => {
        errMap[`${err.sectionId}.${err.fieldId}`] = `${err.label} is required`;
        errMap[err.fieldId] = `${err.label} is required`;
      });
      setFieldErrors(errMap);
      setErrors(detailedErrors.map((err) => err.message));

      // Locate the first missing mandatory field element in DOM
      const first = detailedErrors[0];
      const targetElement =
        document.getElementById(first.fieldId) ||
        document.getElementById(`field-wrap-${first.fieldId}`) ||
        document.getElementById(`section-${first.sectionId}`);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const focusable = targetElement.querySelector('input, select, textarea, button') || targetElement;
          focusable?.focus?.();
        }, 350);
      }
      return;
    }

    setFieldErrors({});
    setErrors([]);
    navigate('/review', { state: { schema, answers: formData, previewMode: isPreview } });
  };

  if (loading || !schema || !formData) {
    return (
      <div className="min-h-screen bg-slate-50/60">
        <Header />
        <div className="flex items-center justify-center py-24 text-slate-400">Loading enrollment form...</div>
      </div>
    );
  }

  const trackableSections = sections.filter((s) => s.trackable);
  const completedCount = trackableSections.filter((s) => s.isCompleted).length;
  const totalSections = trackableSections.length;
  const isAllComplete = completedCount === totalSections;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      <Header />

      {isPreview && (
        <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-xs font-bold text-amber-950 shadow-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>PREVIEW MODE &mdash; showing unsaved Form Builder changes. Submissions are disabled.</span>
        </div>
      )}

      <div className="border-b border-slate-200/80 bg-white shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                International Flight Operations Academy
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
                Official Enrollment Application
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Initial Training for Flight Dispatchers &bull; EASA Regulations Compliant
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</span>
                <span className="text-xs sm:text-sm font-extrabold text-ifoa-navy">
                  {completedCount} of {totalSections} Sections Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <form onSubmit={handleReview}>
          {errors.length > 0 && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-red-200 bg-red-50/90 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900">
                    Please complete all required fields before proceeding ({errors.length} item{errors.length > 1 ? 's' : ''}):
                  </h3>
                  <ul className="mt-2.5 list-disc space-y-1 pl-4 text-xs font-medium text-red-700">
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 lg:block">
              <FormProgressSidebar
                sections={sections}
                currentActiveId={activeSectionId ?? sections[0]?.id}
                onSectionClick={handleSectionClick}
              />
            </div>

            <div className="lg:col-span-8 space-y-2">
              {sections.map((s, idx) => (
                <DynamicSection
                  key={s.raw.id}
                  section={s.raw}
                  stepNumber={idx + 1}
                  batches={batches}
                  value={formData[s.raw.id]}
                  fieldErrors={fieldErrors}
                  onChange={(sectionAnswers) => handleSectionDataChange(s.raw.id, sectionAnswers)}
                />
              ))}

              <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-md">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    <span>
                      {isAllComplete
                        ? 'All sections complete! You can now review your enrollment.'
                        : `${totalSections - completedCount} more section${totalSections - completedCount > 1 ? 's' : ''} to complete`}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-ifoa-navy px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-ifoa-navy-light hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ifoa-navy/20 cursor-pointer"
                  >
                    <span>Review Enrollment</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
