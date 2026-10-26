import mongoose from 'mongoose';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../.mongo-bin');
process.env.MONGOMS_VERSION = '5.0.28';

import { User } from '../src/models/User';
import { Skill } from '../src/models/Skill';
import { WorkerProfile } from '../src/models/WorkerProfile';
import { Job } from '../src/models/Job';
import { WorkRequest } from '../src/models/WorkRequest';
import { workRequestService } from '../src/services/workRequest.service';
import { jobService } from '../src/services/job.service';

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
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Skill.deleteMany({});
  await WorkerProfile.deleteMany({});
  await Job.deleteMany({});
  await WorkRequest.deleteMany({});
});

describe('Phase 3, 5 & 6: Concurrency, Atomic Booking & Job Lifecycle State Machine Tests', () => {
  test('Atomic Booking: Prevents double-booking when two requests arrive for same worker', async () => {
    // 1. Create a worker
    const workerUser = await User.create({
      phone: '9847111222',
      passwordHash: 'hash',
      fullName: 'Suresh Mason',
      role: 'WORKER',
      isPhoneVerified: true,
    });

    const skill = await Skill.create({
      name: 'Masonry',
      nameMl: 'മേസ്തിരി പണി',
      category: 'CONSTRUCTION',
    });

    await WorkerProfile.create({
      userId: workerUser._id,
      primarySkillId: skill._id,
      experienceYears: 6,
      dailyWageMin: 900,
      dailyWageMax: 1100,
      locality: 'Kottakkal',
      district: 'Malappuram',
      location: { type: 'Point', coordinates: [75.9938, 10.9987] },
      fuzzedLocation: { type: 'Point', coordinates: [75.995, 10.999] },
      availability: {
        status: 'AVAILABLE',
        availableFor: 'TODAY',
        updatedAt: new Date(),
      },
    });

    // 2. Create two employers
    const employer1 = await User.create({
      phone: '9847333444',
      passwordHash: 'hash',
      fullName: 'Contractor Ali',
      role: 'EMPLOYER',
      isPhoneVerified: true,
    });

    const employer2 = await User.create({
      phone: '9847555666',
      passwordHash: 'hash',
      fullName: 'House Owner Thomas',
      role: 'EMPLOYER',
      isPhoneVerified: true,
    });

    const bookingDate = new Date();

    // Employer 1 sends request
    const req1 = await workRequestService.createWorkRequest(employer1._id.toString(), {
      workerId: workerUser._id.toString(),
      offeredWage: 1000,
      jobDate: bookingDate,
      locality: 'Kottakkal',
      instructions: 'Compound wall plastering',
    });

    // Employer 2 sends request
    const req2 = await workRequestService.createWorkRequest(employer2._id.toString(), {
      workerId: workerUser._id.toString(),
      offeredWage: 1100,
      jobDate: bookingDate,
      locality: 'Kottakkal',
      instructions: 'Kitchen tile work',
    });

    // Worker accepts Request 1 -> ATOMIC RESERVATION LOCK
    const accepted1 = await workRequestService.acceptWorkRequest(
      workerUser._id.toString(),
      req1._id.toString()
    );
    expect(accepted1.status).toBe('ACCEPTED');

    // Verify worker's availability is atomically locked to BUSY
    const updatedProfile = await WorkerProfile.findOne({ userId: workerUser._id });
    expect(updatedProfile?.availability.status).toBe('BUSY');

    // Worker attempts to accept Request 2 for the same day -> Must fail with conflict error!
    await expect(
      workRequestService.acceptWorkRequest(workerUser._id.toString(), req2._id.toString())
    ).rejects.toThrow();

    // Verify Request 2 was automatically cancelled due to conflicting accepted booking
    const checkReq2 = await WorkRequest.findById(req2._id);
    expect(checkReq2?.status).toBe('CANCELLED');
  });

  test('Job Lifecycle State Machine: Blocks invalid transitions', async () => {
    const employer = await User.create({
      phone: '9847777888',
      passwordHash: 'hash',
      fullName: 'Babu Contractor',
      role: 'EMPLOYER',
      isPhoneVerified: true,
    });

    const skill = await Skill.create({
      name: 'Electrical',
      nameMl: 'ഇലക്ട്രിക്കൽ',
      category: 'MAINTENANCE',
    });

    const job = await jobService.createJob(employer._id.toString(), {
      title: 'Wiring for 2BHK house',
      description: 'Full house conduit wiring',
      requiredSkillId: skill._id.toString(),
      wageOffer: 1200,
      startDate: new Date(),
      locality: 'Tirur',
    });

    expect(job.status).toBe('POSTED');

    // Valid transition: POSTED -> CANCELLED
    const cancelledJob = await jobService.updateJobStatus(
      employer._id.toString(),
      job._id.toString(),
      'CANCELLED'
    );
    expect(cancelledJob.status).toBe('CANCELLED');

    // Invalid transition: CANCELLED -> IN_PROGRESS must throw BadRequestError
    await expect(
      jobService.updateJobStatus(employer._id.toString(), job._id.toString(), 'IN_PROGRESS')
    ).rejects.toThrow();
  });
});
