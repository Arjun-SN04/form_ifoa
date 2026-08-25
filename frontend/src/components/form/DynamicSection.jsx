import { SectionCard } from '../SectionCard.jsx';
import { DynamicField } from './DynamicField.jsx';
import { isSectionComplete, isTrackableSection, isFieldVisible } from '../../utils/formSchema.js';

export function DynamicSection({ section, value = {}, onChange, batches, stepNumber, fieldErrors = {} }) {
  const setField = (fieldId) => (fieldValue) => {
    onChange({ ...value, [fieldId]: fieldValue });
  };

  const fields = [...section.fields]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((field) => isFieldVisible(field, value));

  return (
    <SectionCard
      id={`section-${section.id}`}
      stepNumber={stepNumber}
      title={section.title}
      description={section.description}
      isCompleted={isTrackableSection(section) && isSectionComplete(section, value)}
    >
      {fields.map((field) => (
        <DynamicField
          key={field.id}
          field={field}
          sectionId={section.id}
          value={value[field.id]}
          onChange={setField(field.id)}
          batches={batches}
          error={fieldErrors[`${section.id}.${field.id}`] || fieldErrors[field.id]}
        />
      ))}
    </SectionCard>
  );
}

export default DynamicSection;
