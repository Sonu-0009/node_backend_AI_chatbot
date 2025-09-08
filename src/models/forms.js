import { db } from '../config/database.js';
import { ObjectId } from 'mongodb';

function normalizeQuestions(questions) {
  return questions.map((q, i) => ({ id: q.id || `q${i+1}`, ...q }));
}

export async function createFormRepo({ title, description, fields, createdBy }) {
  const now = new Date();
  const doc = {
    title,
    description: description ?? null,
    questions: normalizeQuestions(fields),
    created_by: createdBy,
    created_at: now,
    updated_at: now,
  };
  const res = await db().collection('forms').insertOne(doc);
  return { ...doc, _id: res.insertedId.toString() };
}

export async function listFormsRepo(filters, { page, pageSize }) {
  const col = db().collection('forms');
  const total = await col.countDocuments(filters);
  const items = await col.find(filters).sort({ created_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
  return { total, items: items.map(f => ({ ...f, _id: f._id.toString() })) };
}

export async function getFormByIdRepo(formId) {
  const form = await db().collection('forms').findOne({ _id: new ObjectId(formId) });
  return form ? { ...form, _id: form._id.toString() } : null;
}

export async function deleteFormAndResponsesRepo(formId) {
  const { ObjectId } = await import('mongodb');
  const resForms = await db().collection('forms').deleteOne({ _id: new ObjectId(formId) });
  const resResponses = await db().collection('form_responses').deleteMany({ form_id: formId });
  return { deleted_form_count: resForms.deletedCount, deleted_response_count: resResponses.deletedCount };
}


