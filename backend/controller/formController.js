import Submission from '../models/Submission.js';
import TrainingBatch from '../models/TrainingBatch.js';
import FormSchema from '../models/FormSchema.js';
import { validateAnswers, findPromotionBatchFieldId } from '../utils/validateAnswers.js';

export async function createSubmission(req, res) {
  const { answers } = req.body;
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ message: 'answers is required' });
  }

  let schema = await FormSchema.findOne();
  if (!schema) {
    const { defaultFormSchema } = await import('../utils/defaultFormSchema.js');
    schema = await FormSchema.create(defaultFormSchema);
  }

  const errors = validateAnswers(schema.sections, answers);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const batchRef = findPromotionBatchFieldId(schema.sections);
  const promotionBatch = batchRef ? answers[batchRef.sectionId]?.[batchRef.fieldId] : undefined;
  if (!promotionBatch) {
    return res.status(400).json({ message: 'Validation failed', errors: ['Promotion batch is required.'] });
  }

  let submission;
  try {
    submission = await Submission.create({
      formSchemaSnapshot: schema.sections,
      promotionBatch,
      answers,
    });
  } catch (err) {
    return res.status(400).json({ message: 'Validation failed', errors: [err.message] });
  }

  res.status(201).json({ id: submission._id });
}

// Public — a student needs to fetch their own submission (schema snapshot + answers)
// after submitting to render the PDF client-side. Access control relies on the
// MongoDB ObjectId being unguessable, same model as the rest of this route.
export async function getSubmission(req, res) {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }
  res.json(submission);
}

export async function listActiveBatches(req, res) {
  const batches = await TrainingBatch.find({ isActive: true }).sort({ label: 1 });
  res.json(batches);
}
