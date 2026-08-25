import { Router } from 'express';
import {
  login,
  logout,
  me,
  listSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from '../controller/adminController.js';
import { getFormSchema, updateFormSchema } from '../controller/formSchemaController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);

router.get('/me', requireAdmin, me);

router.get('/submissions', requireAdmin, listSubmissions);
router.get('/submissions/:id', requireAdmin, getSubmission);
router.put('/submissions/:id', requireAdmin, updateSubmission);
router.delete('/submissions/:id', requireAdmin, deleteSubmission);

router.get('/batches', requireAdmin, listBatches);
router.post('/batches', requireAdmin, createBatch);
router.put('/batches/:id', requireAdmin, updateBatch);
router.delete('/batches/:id', requireAdmin, deleteBatch);

router.get('/form-schema', requireAdmin, getFormSchema);
router.put('/form-schema', requireAdmin, updateFormSchema);

export default router;
