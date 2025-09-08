import express from 'express';
import { db } from '../config/database.js';
import { jwtAuth } from '../middleware/jwt.js';

const router = express.Router();

function requireLoginJwt(req, res, next) {
  if (!req.jwt?.sub) return res.status(401).json({ detail: 'Login required' });
  next();
}

function generateBotResponse(text) {
  return `Bot reply to: ${text}`;
}

router.post('/message', jwtAuth, requireLoginJwt, async (req, res, next) => {
  try {
    const userId = req.jwt.sub;
    const text = req.body.text;
    const now = new Date();
    const userMsg = { role: 'user', text, time: now };
    const botText = generateBotResponse(text);
    const botMsg = { role: 'bot', text: botText, time: now };
    await db().collection('users_chat').updateOne(
      { user_id: userId },
      { $push: { messages: { $each: [userMsg, botMsg] } }, $set: { last_updated: now } },
      { upsert: true }
    );
    res.json({ status: 'saved', bot_response: botText });
  } catch (err) { next(err); }
});

router.get('/history', jwtAuth, requireLoginJwt, async (req, res, next) => {
  try {
    const userId = req.jwt.sub;
    const doc = await db().collection('users_chat').findOne({ user_id: userId }, { projection: { _id: 0, messages: 1 } });
    res.json({ messages: doc?.messages || [] });
  } catch (err) { next(err); }
});

export default router;


