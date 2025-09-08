import express from 'express';
import { db } from '../config/database.js';
import { jwtAuth } from '../middleware/jwt.js';

const router = express.Router();

function requireLoggedInJwt(req, res, next) {
  if (!req.jwt?.sub) return res.status(401).json({ detail: 'Login required' });
  next();
}

function requireRoleJwt(req, res, next, roles) {
  requireLoggedInJwt(req, res, () => {
    if (!roles.includes(req.jwt.role)) return res.status(403).json({ detail: `Requires role: ${roles}` });
    next();
  });
}

function normalizeAnswers(answers) {
  if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
    if ('id' in answers && 'answer' in answers && Object.keys(answers).length <= 3) {
      return { [answers.id]: answers.answer };
    }
    return answers;
  }
  if (Array.isArray(answers)) {
    const out = {};
    for (const item of answers) if (item && typeof item === 'object' && 'id' in item) out[item.id] = item.answer;
    return out;
  }
  return { value: answers };
}

async function findFormByAnyId(formId) {
  const { ObjectId } = await import('mongodb');
  try {
    if (typeof formId === 'string' && formId.length === 24) {
      const asObj = new ObjectId(formId);
      const doc = await db().collection('forms').findOne({ _id: asObj });
      if (doc) return { ...doc, _id: doc._id.toString() };
    }
  } catch {}
  const doc = await db().collection('forms').findOne({ id: formId });
  if (doc) return { ...doc, _id: doc._id.toString() };
  return null;
}

function validateAnswersAgainstForm(formDoc, answers) {
  const fmap = {};
  for (const f of (formDoc.questions || formDoc.fields || [])) if (f.id) fmap[f.id] = f;
  const normalized = Array.isArray(answers) ? answers.reduce((acc, it) => { if (it && it.id) acc[it.id] = it.answer; return acc; }, {}) : (answers && answers.id && answers.answer && Object.keys(answers).length <= 3 ? { [answers.id]: answers.answer } : answers);
  for (const [fid, ans] of Object.entries(normalized)) {
    if (!fmap[fid]) throw new Error(`Unknown field id: ${fid}`);
    const def = fmap[fid];
    const type = String(def.type || 'text').toLowerCase();
    const options = def.options || [];
    if (type === 'radio' && !options.includes(ans)) throw new Error(`Invalid option for '${fid}'`);
    if (type === 'checkbox') {
      if (!Array.isArray(ans) || ans.some(a => !options.includes(a))) throw new Error(`Invalid checkbox list for '${fid}'`);
    }
  }
}

router.post('/submit', jwtAuth, (req, res, next) => requireRoleJwt(req, res, next, ['user']), async (req, res, next2) => {
  try {
    const payload = req.body;
    const form = await findFormByAnyId(payload.form_id);
    if (!form) return res.status(404).json({ detail: 'Form not found' });
    const exists = await db().collection('form_responses').findOne({ form_id: form._id, user_id: req.jwt.sub });
    if (exists) return res.status(400).json({ detail: 'You have already submitted a response to this form' });
    try { validateAnswersAgainstForm(form, payload.answers); } catch (e) { return res.status(400).json({ detail: String(e.message || e) }); }
    const doc = {
      form_id: form._id,
      user_id: req.jwt.sub,
      answers: normalizeAnswers(payload.answers),
      category: payload.category ?? undefined,
      title: payload.title ?? undefined,
      submitted_at: payload.submitted_at ? new Date(payload.submitted_at) : new Date(),
    };
    const result = await db().collection('form_responses').insertOne(doc);
    res.json({ ...doc, _id: result.insertedId.toString() });
  } catch (err) { next2(err); }
});

router.post('/submit_public', async (req, res, next) => {
  try {
    const payload = req.body;
    const form = await findFormByAnyId(payload.form_id);
    if (!form) return res.status(404).json({ detail: 'Form not found' });
    const doc = {
      form_id: form._id,
      user_id: 'anonymous',
      answers: normalizeAnswers(payload.answers),
      category: payload.category ?? undefined,
      title: payload.title ?? undefined,
      submitted_at: payload.submitted_at ? new Date(payload.submitted_at) : new Date(),
    };
    const result = await db().collection('form_responses').insertOne(doc);
    res.json({ ...doc, _id: result.insertedId.toString() });
  } catch (err) { next(err); }
});

router.get('/:form_id/my', jwtAuth, (req, res, next) => requireRoleJwt(req, res, next, ['user']), async (req, res, next2) => {
  try {
    const { form_id } = req.params;
    const form = await findFormByAnyId(form_id);
    if (!form) return res.status(404).json({ detail: 'Form not found' });
    const items = await db().collection('form_responses').find({ form_id: form_id, user_id: req.jwt.sub }).sort({ submitted_at: -1 }).toArray();
    res.json({ items: items.map(r => ({ ...r, _id: r._id.toString() })) });
  } catch (err) { next2(err); }
});

export default router;


