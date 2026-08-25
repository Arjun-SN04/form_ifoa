import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Submission from '../models/Submission.js';
import TrainingBatch from '../models/TrainingBatch.js';
import { validateAnswers, findPromotionBatchFieldId } from '../utils/validateAnswers.js';

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 12 * 60 * 60 * 1000,
};

export async function login(req, res) {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  const valid = hash && (await bcrypt.compare(password, hash));
  if (!valid) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({ message: 'Logged in' });
}

export function logout(req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: COOKIE_OPTIONS.sameSite, secure: COOKIE_OPTIONS.secure });
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  res.json({ authenticated: true });
}

export async function listSubmissions(req, res) {
  const submissions = await Submission.find({}).sort({ submittedAt: -1 });
  res.json(submissions);
}

export async function getSubmission(req, res) {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }
  res.json(submission);
}

export async function updateSubmission(req, res) {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  const { answers } = req.body;
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ message: 'answers is required' });
  }

  const errors = validateAnswers(submission.formSchemaSnapshot, answers);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const batchRef = findPromotionBatchFieldId(submission.formSchemaSnapshot);
  const promotionBatch = batchRef ? answers[batchRef.sectionId]?.[batchRef.fieldId] : undefined;

  submission.answers = answers;
  if (promotionBatch) submission.promotionBatch = promotionBatch;

  try {
    await submission.save();
  } catch (err) {
    return res.status(400).json({ message: 'Validation failed', errors: [err.message] });
  }

  res.json(submission);
}

export async function deleteSubmission(req, res) {
  const submission = await Submission.findByIdAndDelete(req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }
  res.json({ message: 'Deleted' });
}

export async function listBatches(req, res) {
  const batches = await TrainingBatch.find({}).sort({ label: 1 });
  res.json(batches);
}

export async function createBatch(req, res) {
  const { label } = req.body;
  if (!label) {
    return res.status(400).json({ message: 'Label is required' });
  }
  try {
    const batch = await TrainingBatch.create({ label });
    res.status(201).json(batch);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: `Batch "${label}" already exists.` });
    }
    res.status(400).json({ message: err.message });
  }
}

export async function updateBatch(req, res) {
  const batch = await TrainingBatch.findById(req.params.id);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }
  if (req.body.label !== undefined) batch.label = req.body.label;
  if (req.body.isActive !== undefined) batch.isActive = req.body.isActive;
  await batch.save();
  res.json(batch);
}

export async function deleteBatch(req, res) {
  const batch = await TrainingBatch.findByIdAndDelete(req.params.id);
  if (!batch) {
    return res.status(404).json({ message: 'Batch not found' });
  }
  res.json({ message: 'Deleted' });
}
