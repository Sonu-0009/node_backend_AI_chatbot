import express from 'express';
import { db } from '../config/database.js';
import { docsToJson } from '../utils/json.js';
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

function isSuperAdmin(req) { return req.jwt?.role === 'super_admin'; }

// POST /forms/create
router.post('/create', jwtAuth, (req, res, next) => requireRoleJwt(req, res, next, ['admin']), async (req, res, next2) => {
  try {
    const now = new Date();
    const doc = {
      title: req.body.title,
      description: req.body.description,
      questions: (req.body.fields || req.body.questions || []).map((q, i) => ({ id: q.id || `q${i+1}`, ...q })),
      created_by: req.jwt.sub,
      created_at: now,
      updated_at: now,
    };
    const result = await db().collection('forms').insertOne(doc);
    res.json({ ...doc, _id: result.insertedId.toString() });
  } catch (err) { next2(err); }
});

// GET /forms/all (public)
router.get('/all', async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.search) filters.title = { $regex: String(req.query.search), $options: 'i' };
    const itemsRaw = await db().collection('forms').find(filters).sort({ _id: -1 }).toArray();
    res.json({ items: docsToJson(itemsRaw) });
  } catch (err) { next(err); }
});

// GET /forms
router.get('/', jwtAuth, (req, res, next) => requireRoleJwt(req, res, next, ['admin','super_admin']), async (req, res, next2) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.page_size || '10', 10), 1), 100);
    const filters = {};
    if (!isSuperAdmin(req)) filters.created_by = req.jwt.sub;
    if (req.query.search) filters.title = { $regex: String(req.query.search), $options: 'i' };
    const col = db().collection('forms');
    const total = await col.countDocuments(filters);
    const items = await col.find(filters).sort({ created_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
    res.json({ items: items.map(x => ({ ...x, _id: x._id.toString() })), pagination: { total, page, page_size: pageSize } });
  } catch (err) { next2(err); }
});

// GET /forms/:form_id
router.get('/:form_id', jwtAuth, (req, res, next) => requireRoleJwt(req, res, next, ['admin','super_admin']), async (req, res, next2) => {
  try {
    const { form_id } = req.params;
    const form = await db().collection('forms').findOne({ _id: new (await import('mongodb')).ObjectId(form_id) });
    if (!form) return res.status(404).json({ detail: 'Form not found' });
    if (!isSuperAdmin(req) && String(form.created_by) !== req.jwt.sub) return res.status(403).json({ detail: 'Not authorized for this form' });
    res.json({ ...form, _id: form._id.toString() });
  } catch (err) { next2(err); }
});

// DELETE /forms/:form_id
router.delete('/:form_id', jwtAuth, (req, res, next) => requireRoleJwt(req, res, next, ['admin']), async (req, res, next2) => {
  try {
    const { form_id } = req.params;
    const { ObjectId } = await import('mongodb');
    const form = await db().collection('forms').findOne({ _id: new ObjectId(form_id) });
    if (!form) return res.status(404).json({ detail: 'Form not found' });
    if (String(form.created_by) !== req.jwt.sub) return res.status(403).json({ detail: 'Not authorized for this form' });
    const resForms = await db().collection('forms').deleteOne({ _id: new ObjectId(form_id) });
    const resResponses = await db().collection('form_responses').deleteMany({ form_id });
    res.json({ deleted_form_count: resForms.deletedCount, deleted_response_count: resResponses.deletedCount });
  } catch (err) { next2(err); }
});

// GET /forms/:form_id/summary
router.get('/:form_id/summary', jwtAuth, (req, res, next) => requireRoleJwt(req, res, next, ['admin','super_admin']), async (req, res, next2) => {
  try {
    const { form_id } = req.params;
    const { ObjectId } = await import('mongodb');
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.page_size || '20', 10), 1), 200);
    const form = await db().collection('forms').findOne({ _id: new ObjectId(form_id) });
    if (!form) return res.status(404).json({ detail: 'Form not found' });
    if (!isSuperAdmin(req) && String(form.created_by) !== req.jwt.sub) return res.status(403).json({ detail: 'Not authorized for this form' });
    const total = await db().collection('form_responses').countDocuments({ form_id });
    const responses = await db().collection('form_responses').find({ form_id }).sort({ submitted_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
    res.json({ form: { ...form, _id: form._id.toString() }, responses: responses.map(r => ({ ...r, _id: r._id.toString() })), pagination: { total, page, page_size: pageSize } });
  } catch (err) { next2(err); }
});

export default router;


