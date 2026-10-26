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
import { Review } from '../src/models/Review';
import { reviewService } from '../src/services/review.service';

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
  await Review.deleteMany({});
});

describe('Phase 7: Reviews & Ratings Integrity Tests', () => {
  test('Non-participant is blocked from submitting a review', async () => {
    const employer = await User.create({
      phone: '9847111001',
      passwordHash: 'hash',
      fullName: 'Employer One',
      role: 'EMPLOYER',
      isPhoneVerified: true,
    });

    const worker = await User.create({
      phone: '9847111002',
      passwordHash: 'hash',
      fullName: 'Worker One',
      role: 'WORKER',
      isPhoneVerified: true,
    });

    const outsider = await User.create({
      phone: '9847111003',
      passwordHash: 'hash',
      fullName: 'Outsider Random',
      role: 'EMPLOYER',
      isPhoneVerified: true,
    });

    const skill = await Skill.create({
      name: 'Plumbing',
      nameMl: 'പ്ലംബിംഗ്',
      category: 'MAINTENANCE',
    });

    const job = await Job.create({
      employerId: employer._id,
      title: 'Fix pipe leakage',
      description: 'Kitchen sink pipe broken',
      requiredSkillId: skill._id,
      wageOffer: 800,
      startDate: new Date(),
      locality: 'Manjeri',
      status: 'COMPLETED',
    });

    // Outsider tries to review worker -> must fail
    await expect(
      reviewService.submitReview(outsider._id.toString(), {
        jobId: job._id.toString(),
        targetUserId: worker._id.toString(),
        rating: 5,
        comment: 'Fake review attempt',
      })
    ).rejects.toThrow();
  });

  test('Valid participant can submit review, updates averageRating, and blocks duplicate review', async () => {
    const employer = await User.create({
      phone: '9847111004',
      passwordHash: 'hash',
      fullName: 'Real Employer',
      role: 'EMPLOYER',
      isPhoneVerified: true,
    });

    const worker = await User.create({
      phone: '9847111005',
      passwordHash: 'hash',
      fullName: 'Real Worker',
      role: 'WORKER',
      isPhoneVerified: true,
    });

    const skill = await Skill.create({
      name: 'Carpentry',
      nameMl: 'ആശാരി പണി',
      category: 'CONSTRUCTION',
    });

    await WorkerProfile.create({
      userId: worker._id,
      primarySkillId: skill._id,
      experienceYears: 4,
      dailyWageMin: 900,
      dailyWageMax: 1200,
      locality: 'Tirur',
      district: 'Malappuram',
      averageRating: 0,
      totalReviews: 0,
    });

    const job = await Job.create({
      employerId: employer._id,
      title: 'Wooden door framing',
      description: 'Door frame installation',
      requiredSkillId: skill._id,
      wageOffer: 1100,
      startDate: new Date(),
      locality: 'Tirur',
      status: 'COMPLETED',
    });

    // Worker was assigned and accepted
    await WorkRequest.create({
      jobId: job._id,
      employerId: employer._id,
      workerId: worker._id,
      offeredWage: 1100,
      jobDate: new Date(),
      locality: 'Tirur',
      status: 'COMPLETED',
      expiresAt: new Date(Date.now() + 3600000),
    });

    // Employer submits review
    const review = await reviewService.submitReview(employer._id.toString(), {
      jobId: job._id.toString(),
      targetUserId: worker._id.toString(),
      rating: 5,
      comment: 'Excellent carpentry work and on time!',
      categoryRatings: { punctuality: 5, workQuality: 5, paymentPromptness: 5 },
    });

    expect(review.rating).toBe(5);

    // Verify worker profile average rating updated
    const workerProfile = await WorkerProfile.findOne({ userId: worker._id });
    expect(workerProfile?.averageRating).toBe(5.0);
    expect(workerProfile?.totalReviews).toBe(1);

    // Duplicate review attempt from same employer for same job -> must reject with 409 Conflict
    await expect(
      reviewService.submitReview(employer._id.toString(), {
        jobId: job._id.toString(),
        targetUserId: worker._id.toString(),
        rating: 4,
        comment: 'Trying to review again',
      })
    ).rejects.toThrow();
  });
});
