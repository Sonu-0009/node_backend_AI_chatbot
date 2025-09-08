import { db } from '../config/database.js';

export async function findUserByEmail(email) {
  return db().collection('users').findOne({ email });
}

export async function createUser(doc) {
  const res = await db().collection('users').insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function listUsersSansPassword() {
  return db().collection('users').find({}, { projection: { password: 0 } }).toArray();
}


