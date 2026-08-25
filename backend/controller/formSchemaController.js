import FormSchema from '../models/FormSchema.js';

async function getOrCreateSchema() {
  let schema = await FormSchema.findOne();
  if (!schema) {
    const { defaultFormSchema } = await import('../utils/defaultFormSchema.js');
    schema = await FormSchema.create(defaultFormSchema);
  }
  return schema;
}

export async function getFormSchema(req, res) {
  const schema = await getOrCreateSchema();
  res.json(schema);
}

export async function updateFormSchema(req, res) {
  const { sections } = req.body;
  if (!Array.isArray(sections)) {
    return res.status(400).json({ message: 'sections must be an array' });
  }

  let schema = await FormSchema.findOne();
  if (!schema) {
    schema = new FormSchema();
  }
  schema.sections = sections;
  schema.updatedAt = new Date();

  try {
    await schema.save();
  } catch (err) {
    return res.status(400).json({ message: 'Validation failed', errors: [err.message] });
  }

  res.json(schema);
}
