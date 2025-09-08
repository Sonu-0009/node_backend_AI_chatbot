import express from 'express';
import { db } from '../config/database.js';
import { jwtAuth } from '../middleware/jwt.js';

// JWT-only protected router
const router = express.Router();
export default router;
export const jwtProtectedRouter = router; // same router in JWT-only

function requireRoleJwt(role) {
  return (req, res, next) => {
    const r = req.jwt?.role;
    if (r !== role) return res.status(403).json({ detail: `${role} role required` });
    next();
  };
}

jwtProtectedRouter.get('/super-admin-data', jwtAuth, requireRoleJwt('super_admin'), (_req, res) => {
  res.json({ message: 'Confidential data for Super Admin (JWT)' });
});

jwtProtectedRouter.get('/me', jwtAuth, (req, res) => {
  res.json({ sub: req.jwt?.sub, email: req.jwt?.email, role: req.jwt?.role });
});

jwtProtectedRouter.get('/admin-stats', jwtAuth, requireRoleJwt('admin'), (_req, res) => {
  res.json({ message: 'Admin stats data (JWT)' });
});

jwtProtectedRouter.get('/all-users', jwtAuth, requireRoleJwt('super_admin'), async (_req, res, next2) => {
  try {
    const users = await db().collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.json({ users: users.map(u => ({ ...u, _id: u._id.toString() })) });
  } catch (err) { next2(err); }
});


