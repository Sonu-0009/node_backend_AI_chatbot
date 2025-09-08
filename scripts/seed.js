import '../src/server.js';
import { getDb, db } from '../src/config/database.js';
import bcrypt from 'bcryptjs';

(async () => {
  await getDb();
  const users = db().collection('users');
  const forms = db().collection('forms');
  const plainUsers = [
    { email: 'super@example.com', password: 'p', role: 'super_admin', mobile: '000', gender: 'M' },
    { email: 'admin@example.com', password: 'p', role: 'admin', mobile: '111', gender: 'F' },
    { email: 'user@example.com', password: 'p', role: 'user', mobile: '222', gender: 'M' },
  ];
  for (const u of plainUsers) {
    const hash = await bcrypt.hash(u.password, 10);
    await users.updateOne(
      { email: u.email },
      { $set: { password: hash, role: u.role, mobile: u.mobile, gender: u.gender } },
      { upsert: true }
    );
  }
  const adminDoc = await users.findOne({ email: 'admin@example.com' });
  const now = new Date();
  const form = {
    title: 'Survey',
    description: 'Sample',
    created_by: adminDoc._id.toString(),
    questions: [{ id: 'q1', type: 'text', label: 'Name' }],
    created_at: now,
    updated_at: now,
  };
  const existsForm = await forms.findOne({ title: form.title, created_by: form.created_by });
  if (!existsForm) await forms.insertOne(form);
  console.log('Seed complete');
  process.exit(0);
})();

