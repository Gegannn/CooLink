import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../.mongo-bin');
process.env.MONGOMS_VERSION = '5.0.28';

import app from '../src/app';
import { User } from '../src/models/User';
import { OtpVerification } from '../src/models/OtpVerification';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '5.0.28',
      downloadDir: path.resolve(__dirname, '../.mongo-bin'),
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 300000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

beforeEach(async () => {
  await User.deleteMany({});
  await OtpVerification.deleteMany({});
});

describe('Phase 1: Real Authentication & OTP System Tests', () => {
  const sampleWorker = {
    phone: '9847123456',
    password: 'password123',
    fullName: 'Ravi Kumar',
    role: 'WORKER',
    email: 'ravi.kumar@example.com',
  };

  test('POST /api/auth/register - Successfully registers worker and issues OTP', async () => {
    const res = await request(app).post('/api/auth/register').send(sampleWorker);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.phone).toBe(sampleWorker.phone);
    expect(res.body.data.user.role).toBe('WORKER');
    expect(res.body.data.user.isPhoneVerified).toBe(false);
    expect(res.body.data.accessToken).toBeDefined();
    // Debug OTP returned in dev/test mode
    expect(res.body.data.debugOtp).toBeDefined();

    // Check user saved in DB
    const savedUser = await User.findOne({ phone: sampleWorker.phone });
    expect(savedUser).not.toBeNull();
    expect(savedUser?.isPhoneVerified).toBe(false);

    // Check OTP record in DB
    const otpDoc = await OtpVerification.findOne({ phone: sampleWorker.phone });
    expect(otpDoc).not.toBeNull();
    expect(otpDoc?.verified).toBe(false);
  });

  test('POST /api/auth/register - Prevents duplicate phone registration', async () => {
    await request(app).post('/api/auth/register').send(sampleWorker);
    const res = await request(app).post('/api/auth/register').send(sampleWorker);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register - Rejects Admin role without valid setup key', async () => {
    const res = await request(app).post('/api/auth/register').send({
      phone: '9847999888',
      password: 'password123',
      fullName: 'Fake Admin',
      role: 'ADMIN',
      adminSetupKey: 'wrong_key',
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('OTP Flow: Verify OTP successfully verifies worker phone', async () => {
    // 1. Register worker
    const regRes = await request(app).post('/api/auth/register').send(sampleWorker);
    const otp = regRes.body.data.debugOtp;
    expect(otp).toBeDefined();

    // 2. Submit wrong OTP
    const wrongRes = await request(app).post('/api/auth/verify-otp').send({
      phone: sampleWorker.phone,
      otp: '000000',
    });
    expect(wrongRes.status).toBe(400);

    // 3. Submit correct OTP
    const correctRes = await request(app).post('/api/auth/verify-otp').send({
      phone: sampleWorker.phone,
      otp,
    });
    expect(correctRes.status).toBe(200);
    expect(correctRes.body.success).toBe(true);

    // 4. Verify DB updated
    const verifiedUser = await User.findOne({ phone: sampleWorker.phone });
    expect(verifiedUser?.isPhoneVerified).toBe(true);
  });

  test('OTP Flow: Verify OTP successfully via Email address', async () => {
    // 1. Register worker with email
    const regRes = await request(app).post('/api/auth/register').send(sampleWorker);
    const otp = regRes.body.data.debugOtp;
    expect(otp).toBeDefined();
    expect(regRes.body.data.otpChannel).toBe('EMAIL');

    // 2. Submit correct OTP using email identifier
    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: sampleWorker.email,
      otp,
    });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);

    // 3. Verify user has isEmailVerified and isPhoneVerified in DB
    const verifiedUser = await User.findOne({ email: sampleWorker.email });
    expect(verifiedUser?.isEmailVerified).toBe(true);
    expect(verifiedUser?.isPhoneVerified).toBe(true);
  });

  test('POST /api/auth/login - Successfully authenticates and returns access token', async () => {
    await request(app).post('/api/auth/register').send(sampleWorker);

    // Login with wrong password
    const failRes = await request(app).post('/api/auth/login').send({
      phone: sampleWorker.phone,
      password: 'incorrectPassword',
    });
    expect(failRes.status).toBe(401);

    // Login with correct credentials
    const successRes = await request(app).post('/api/auth/login').send({
      phone: sampleWorker.phone,
      password: sampleWorker.password,
    });
    expect(successRes.status).toBe(200);
    expect(successRes.body.data.accessToken).toBeDefined();
    expect(successRes.body.data.user.phone).toBe(sampleWorker.phone);

    // Check refresh cookie is set
    const cookies = successRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/refreshToken/);
  });

  test('GET /api/auth/me - Access protected route with Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleWorker);
    const token = regRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.phone).toBe(sampleWorker.phone);
  });
});
