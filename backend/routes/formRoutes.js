import { Router } from 'express';
import { createSubmission, getSubmission, listActiveBatches } from '../controller/formController.js';
import { getFormSchema } from '../controller/formSchemaController.js';

const router = Router();

router.get('/batches', listActiveBatches);
router.get('/form-schema', getFormSchema);
router.post('/submissions', createSubmission);
router.get('/submissions/:id', getSubmission);

export default router;
