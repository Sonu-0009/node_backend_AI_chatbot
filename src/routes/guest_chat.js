import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

function generateBotResponse(text) {
  return `Bot reply to: ${text}`;
}

router.post('/message/:guest_id', async (req, res, next) => {
  try {
    const guestId = req.params.guest_id;
    const text = req.body.text;
    const now = new Date();
    const userMsg = { role: 'user', text, time: now };
    const botText = generateBotResponse(text);
    const botMsg = { role: 'bot', text: botText, time: now };
    await db().collection('guest_chat').updateOne(
      { guest_id: guestId },
      { $push: { messages: { $each: [userMsg, botMsg] } }, $set: { last_updated: now } },
      { upsert: true }
    );
    res.json({ status: 'saved', bot_response: botText });
  } catch (err) { next(err); }
});

router.get('/history/:guest_id', async (req, res, next) => {
  try {
    const guestId = req.params.guest_id;
    const doc = await db().collection('guest_chat').findOne({ guest_id: guestId }, { projection: { _id: 0, messages: 1 } });
    res.json({ messages: doc?.messages || [] });
  } catch (err) { next(err); }
});

export default router;



