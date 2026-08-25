export function emptyValueForField(field) {
  if (field.type === 'checkbox') return false;
  if (field.type === 'checkboxGroup') return [];
  return '';
}

export function buildEmptyAnswers(schema) {
  const answers = {};
  for (const section of schema.sections) {
    answers[section.id] = {};
    for (const field of section.fields) {
      if (field.type === 'staticText') continue;
      answers[section.id][field.id] = emptyValueForField(field);
    }
  }
  return answers;
}

export function isFieldEmpty(field, value) {
  if (field.type === 'checkbox') return value !== true;
  if (field.type === 'checkboxGroup') return !Array.isArray(value) || value.length === 0;
  return value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '');
}

function conditionMet(condition, sectionAnswers) {
  const refValue = sectionAnswers?.[condition.fieldId];
  if (Array.isArray(refValue)) return refValue.includes(condition.equals);
  return refValue === condition.equals;
}

export function isFieldRequired(field, sectionAnswers) {
  const isConsentOrAgreement =
    field.type === 'checkbox' &&
    (field.required ||
      field.id.toLowerCase().includes('terms') ||
      field.id.toLowerCase().includes('consent') ||
      field.id.toLowerCase().includes('acknowledgement') ||
      field.id.toLowerCase().includes('dataprocessing'));

  return Boolean(field.required || (field.requiredIf && conditionMet(field.requiredIf, sectionAnswers)) || isConsentOrAgreement);
}

export function isFieldVisible(field, sectionAnswers) {
  return !field.visibleIf || conditionMet(field.visibleIf, sectionAnswers);
}

// A section only reads as "Completed" once its required fields are filled.
// Marking a field optional in the Form Builder means it's okay to leave
// blank — it does NOT mean the section is done the moment it's rendered.
// So a section with zero required fields waits for at least one value
// before showing as complete, instead of appearing pre-checked with
// nothing filled in.
export function isSectionComplete(section, sectionAnswers = {}) {
  const fillableFields = section.fields.filter(
    (field) => field.type !== 'staticText' && isFieldVisible(field, sectionAnswers)
  );

  // Purely informational sections (only staticText) are not actionable completion steps
  if (fillableFields.length === 0) {
    return false;
  }

  const requiredFields = fillableFields.filter((field) => isFieldRequired(field, sectionAnswers));
  if (requiredFields.length > 0) {
    return requiredFields.every((field) => !isFieldEmpty(field, sectionAnswers[field.id]));
  }

  return fillableFields.some((field) => !isFieldEmpty(field, sectionAnswers[field.id]));
}

// A section only counts toward the "N of M sections complete" progress stat
// if it has at least one field a student actually fills in.
export function isTrackableSection(section) {
  return section.fields.some((field) => field.type !== 'staticText');
}

export function getSubmissionDisplayName(submission) {
  const sections = submission.formSchemaSnapshot || [];
  let firstName;
  let surname;
  let email;

  for (const section of sections) {
    for (const field of section.fields) {
      const val = submission.answers?.[section.id]?.[field.id];
      if (typeof val !== 'string' || !val) continue;
      if (field.id === 'firstName' && !firstName) firstName = val;
      if (field.id === 'surname' && !surname) surname = val;
      if (field.type === 'email' && !email) email = val;
    }
  }

  if (firstName || surname) return [firstName, surname].filter(Boolean).join(' ');
  if (email) return email;
  return `Submission ${String(submission._id).slice(-6)}`;
}

export function getSubmissionQuickInfo(submission) {
  const sections = submission.formSchemaSnapshot || [];
  const info = { name: getSubmissionDisplayName(submission), email: null, phone: null, citizenship: null, passportNumber: null };

  for (const section of sections) {
    for (const field of section.fields) {
      const val = submission.answers?.[section.id]?.[field.id];
      if (typeof val !== 'string' || !val) continue;
      if (field.type === 'email' && !info.email) info.email = val;
      if (field.type === 'tel' && !info.phone) info.phone = val;
      if (field.id === 'citizenship' && !info.citizenship) info.citizenship = val;
      if (field.id === 'passportNumber' && !info.passportNumber) info.passportNumber = val;
    }
  }

  return info;
}

export function getSubmissionSearchText(submission) {
  return JSON.stringify(submission.answers || {}).toLowerCase();
}

export function getDetailedValidationErrors(schema, answers) {
  const errors = [];
  
  const promotionField = schema.sections
    .flatMap((s) => s.fields.map((f) => ({ ...f, sectionId: s.id })))
    .find((f) => f.type === 'promotionBatch');
  if (promotionField && !answers?.[promotionField.sectionId]?.[promotionField.id]) {
    errors.push({
      sectionId: promotionField.sectionId,
      fieldId: promotionField.id,
      label: promotionField.label || 'Promotion Batch',
      message: 'Please select an available promotion batch.',
    });
  }

  for (const section of schema.sections) {
    const sectionAnswers = answers?.[section.id] || {};
    for (const field of section.fields) {
      if (field.type === 'staticText' || field.type === 'promotionBatch') continue;
      if (!isFieldVisible(field, sectionAnswers)) continue;
      if (isFieldRequired(field, sectionAnswers) && isFieldEmpty(field, sectionAnswers[field.id])) {
        const errorMsg = field.type === 'checkbox'
          ? `${section.title}: You must agree to and accept the ${field.label ? (field.label.length > 50 ? field.label.slice(0, 47) + '...' : field.label) : 'required agreement'}.`
          : `${section.title}: ${field.label || field.id} is required.`;

        errors.push({
          sectionId: section.id,
          fieldId: field.id,
          label: field.label || field.id,
          message: errorMsg,
        });
      }
    }
  }

  return errors;
}

export function validateSchemaAnswers(schema, answers) {
  return getDetailedValidationErrors(schema, answers).map((e) => e.message);
}
