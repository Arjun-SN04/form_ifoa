import mongoose from 'mongoose';

const requiredIfSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    equals: { type: String, required: true },
  },
  { _id: false }
);

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: '' },
    type: {
      type: String,
      required: true,
      enum: [
        'text',
        'email',
        'tel',
        'date',
        'textarea',
        'select',
        'radio',
        'checkbox',
        'checkboxGroup',
        'staticText',
        'promotionBatch',
      ],
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    options: { type: [String], default: undefined },
    content: { type: String, default: undefined },
    order: { type: Number, default: 0 },
    requiredIf: { type: requiredIfSchema, default: undefined },
    visibleIf: { type: requiredIfSchema, default: undefined },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    fields: { type: [fieldSchema], default: [] },
  },
  { _id: false }
);

const formSchemaSchema = new mongoose.Schema({
  sections: { type: [sectionSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('FormSchema', formSchemaSchema);
