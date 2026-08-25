const isEmpty = (field, value) => {
  if (field.type === 'checkbox') return value !== true;
  if (field.type === 'checkboxGroup') return !Array.isArray(value) || value.length === 0;
  return value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '');
};

const conditionMet = (condition, sectionAnswers) => {
  const refValue = sectionAnswers?.[condition.fieldId];
  if (Array.isArray(refValue)) return refValue.includes(condition.equals);
  return refValue === condition.equals;
};

export function findPromotionBatchFieldId(sections) {
  for (const section of sections) {
    const field = section.fields.find((f) => f.type === 'promotionBatch');
    if (field) return { sectionId: section.id, fieldId: field.id };
  }
  return null;
}

export function validateAnswers(sections, answers) {
  const errors = [];

  for (const section of sections) {
    const sectionAnswers = answers?.[section.id] || {};
    for (const field of section.fields) {
      if (field.type === 'staticText' || field.type === 'promotionBatch') continue;

      const isConsentOrAgreement =
        field.type === 'checkbox' &&
        (field.required ||
          field.id.toLowerCase().includes('terms') ||
          field.id.toLowerCase().includes('consent') ||
          field.id.toLowerCase().includes('acknowledgement') ||
          field.id.toLowerCase().includes('dataprocessing'));

      const isRequired = field.required || (field.requiredIf && conditionMet(field.requiredIf, sectionAnswers)) || isConsentOrAgreement;
      if (isRequired && isEmpty(field, sectionAnswers[field.id])) {
        const msg = field.type === 'checkbox'
          ? `${section.title}: You must agree to and accept the required agreement (${field.label ? (field.label.length > 50 ? field.label.slice(0, 47) + '...' : field.label) : field.id}).`
          : `${section.title}: ${field.label || field.id} is required.`;
        errors.push(msg);
      }
    }
  }

  return errors;
}
