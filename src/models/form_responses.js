import { db } from '../config/database.js';
import { ObjectId } from 'mongodb';

export async function findFormAnyIdRepo(formId) {
  try {
    if (typeof formId === 'string' && formId.length === 24) {
      const doc = await db().collection('forms').findOne({ _id: new ObjectId(formId) });
      if (doc) return { ...doc, _id: doc._id.toString() };
    }
  } catch {}
  const doc = await db().collection('forms').findOne({ id: formId });
  return doc ? { ...doc, _id: doc._id.toString() } : null;
}

export async function alreadySubmittedRepo(formId, userId) {
  const existing = await db().collection('form_responses').findOne({ form_id: formId, user_id: userId });
  return !!existing;
}

export async function insertResponseRepo(doc) {
  const res = await db().collection('form_responses').insertOne(doc);
  return { ...doc, _id: res.insertedId.toString() };
}

export async function listMySubmissionsRepo(formId, userId) {
  const items = await db().collection('form_responses').find({ form_id: formId, user_id: userId }).sort({ submitted_at: -1 }).toArray();
  return items.map(r => ({ ...r, _id: r._id.toString() }));
}


