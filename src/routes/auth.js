import express from 'express';
import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { signJwt } from '../middleware/jwt.js';

const router = express.Router();

// POST /auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const user = req.body;
    const existing = await db().collection('users').findOne({ email: user.email });
    if (existing) return res.status(400).json({ detail: 'Email already registered' });
    const hash = await bcrypt.hash(user.password, 10);
    const doc = { ...user, password: hash, role: 'user' };
    const result = await db().collection('users').insertOne(doc);
    return res.json({
      id: result.insertedId.toString(),
      email: user.email,
      mobile: user.mobile,
      gender: user.gender,
      role: 'user',
    });
  } catch (err) { next(err); }
});

// POST /auth/login (JWT-only)
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const dbUser = await db().collection('users').findOne({ email });
    if (!dbUser || !(await bcrypt.compare(password, dbUser.password))) {
      return res.status(400).json({ detail: 'Invalid email or password' });
    }
    const token = signJwt({
      sub: dbUser._id.toString(),
      role: dbUser.role,
      email: dbUser.email,
    });
    return res.json({ token, role: dbUser.role });
  } catch (err) { next(err); }
});

// Removed duplicate login-jwt (now /auth/login returns JWT)

// Removed session to token endpoint in JWT-only mode

// POST /auth/create-admin
router.post('/create-admin', async (req, res, next) => {
  try {
    if (req.session.role !== 'super_admin') return res.status(403).json({ detail: 'Super Admin only' });
    const newAdmin = req.body;
    const existing = await db().collection('users').findOne({ email: newAdmin.email });
    if (existing) return res.status(400).json({ detail: 'Email already registered' });
    const hash = await bcrypt.hash(newAdmin.password, 10);
    const doc = { ...newAdmin, password: hash, role: 'admin' };
    const result = await db().collection('users').insertOne(doc);
    return res.json({
      id: result.insertedId.toString(),
      username: newAdmin.username,
      email: newAdmin.email,
      mobile: newAdmin.mobile,
      gender: newAdmin.gender,
      role: 'admin',
    });
  } catch (err) { next(err); }
});

// No-op logout in JWT-only (client should drop token; for refresh, revoke)
router.post('/logout', async (_req, res) => {
  return res.json({ message: 'Client should discard JWT' });
});

export default router;


