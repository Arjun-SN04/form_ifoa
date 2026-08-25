import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  formSchemaSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  promotionBatch: { type: String, required: true },
  answers: { type: mongoose.Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Submission', submissionSchema);
