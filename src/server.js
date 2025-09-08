import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
// JWT-only: no cookies/sessions

import { getDb } from './config/database.js';
import authRouter from './routes/auth.js';
import protectedRouter from './routes/protected.js';
import { jwtProtectedRouter } from './routes/protected.js';
import usersChatRouter from './routes/users_chat.js';
import guestChatRouter from './routes/guest_chat.js';
import formsRouter from './routes/forms.js';
import formResponsesRouter from './routes/form_responses.js';

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
// no cookie parser needed for JWT in Authorization header

// CORS
const origins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: origins.length ? origins : '*',
  credentials: true,
}));

// No session middleware (JWT-only)

// Routers
app.use('/auth', authRouter);
app.use('/protected', protectedRouter);
app.use('/protected-jwt', jwtProtectedRouter);
app.use('/users_chat', usersChatRouter);
app.use('/guest_chat', guestChatRouter);
app.use('/forms', formsRouter);
app.use('/form_responses', formResponsesRouter);

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 8000);

// Ensure DB connection first
getDb().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});

export default app;


