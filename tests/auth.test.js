const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('../src/routes/auth.routes');
const prisma = require('../src/db/prisma');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRoutes);

describe('Authentication & Workspace Setup Endpoints', () => {
  const testEmail = `test_${Date.now()}@example.com`;

  test('POST /api/v1/auth/signup creates user and workspace', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Test Founder',
        email: testEmail,
        password: 'password123',
        companyName: 'Test Corp',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.role).toBe('OWNER');
  });

  test('POST /api/v1/auth/login authenticates registered user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
  });
});
