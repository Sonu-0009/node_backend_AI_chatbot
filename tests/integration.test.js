"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../src/app");
const database_1 = require("../src/config/database");
const app = (0, app_1.createApp)();
beforeAll(async () => {
    await (0, database_1.connectDatabase)();
});
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
});
let token = '';
let formId = '';
it('registers a user', async () => {
    const res = await (0, supertest_1.default)(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
});
it('logs in and gets a JWT', async () => {
    const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
});
it('blocks access to protected without token', async () => {
    const res = await (0, supertest_1.default)(app).get('/api/protected');
    expect(res.status).toBe(401);
});
it('allows access to protected with token', async () => {
    const res = await (0, supertest_1.default)(app).get('/api/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
});
it('creates a form', async () => {
    const res = await (0, supertest_1.default)(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Contact', description: 'contact form', fields: [{ name: 'email', type: 'string', required: true }] });
    expect(res.status).toBe(201);
    expect(res.body._id).toBeTruthy();
    formId = res.body._id;
});
it('lists forms', async () => {
    const res = await (0, supertest_1.default)(app)
        .get('/api/forms')
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
});
it('gets a form by id', async () => {
    const res = await (0, supertest_1.default)(app)
        .get(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
});
it('updates a form', async () => {
    const res = await (0, supertest_1.default)(app)
        .put(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Contact Updated' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Contact Updated');
});
it('submits a form response', async () => {
    const res = await (0, supertest_1.default)(app)
        .post(`/api/forms/${formId}/responses`)
        .send({ email: 'res@example.com' });
    expect(res.status).toBe(201);
});
it('lists form responses', async () => {
    const res = await (0, supertest_1.default)(app)
        .get(`/api/forms/${formId}/responses`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
});
it('guest chat post/list', async () => {
    const post = await (0, supertest_1.default)(app).post('/api/chat/guest').send({ name: 'Anon', message: 'Hello' });
    expect(post.status).toBe(201);
    const list = await (0, supertest_1.default)(app).get('/api/chat/guest');
    expect(list.status).toBe(200);
});
it('user chat post/list', async () => {
    const post = await (0, supertest_1.default)(app)
        .post('/api/chat/user')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Hi there' });
    expect(post.status).toBe(201);
    const list = await (0, supertest_1.default)(app)
        .get('/api/chat/user')
        .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
});
it('deletes a form', async () => {
    const res = await (0, supertest_1.default)(app)
        .delete(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
});
