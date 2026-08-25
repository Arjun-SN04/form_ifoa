import mongoose from 'mongoose';

const trainingBatchSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true, trim: true },
  startDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('TrainingBatch', trainingBatchSchema);
