import { MongoClient } from 'mongodb';
let MemoryServer = null;

let _client = null;
let _db = null;

export async function getDb() {
  if (_db) return _db;
  let uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGO_DB || 'Anuvadini';
  try {
    _client = new MongoClient(uri);
    await _client.connect();
  } catch (err) {
    // Fallback to in-memory Mongo for local testing
    const mod = await import('mongodb-memory-server');
    MemoryServer = mod.MongoMemoryServer;
    const ms = await MemoryServer.create();
    uri = ms.getUri();
    _client = new MongoClient(uri);
    await _client.connect();
  }
  _db = _client.db(dbName);

  // Indexes
  await _db.collection('users').createIndex({ email: 1 }, { unique: true });
  await _db.collection('users_chat').createIndex({ user_id: 1 }, { unique: true });
  await _db.collection('guest_chat').createIndex({ guest_id: 1 }, { unique: true });

  await _db.collection('forms').createIndex({ id: 1 }, { unique: true, sparse: true });
  await _db.collection('forms').createIndex({ is_active: 1 });
  await _db.collection('forms').createIndex({ created_by: 1 });
  await _db.collection('forms').createIndex({ title: 1 });

  await _db.collection('form_responses').createIndex({ form_id: 1 });
  await _db.collection('form_responses').createIndex({ user_id: 1 });
  await _db.collection('form_responses').createIndex({ form_id: 1, submitted_at: -1 });
  await _db.collection('form_responses').createIndex({ form_id: 1, user_id: 1 });

  return _db;
}

export function db() {
  if (!_db) throw new Error('Database not initialized. Call getDb() first.');
  return _db;
}


