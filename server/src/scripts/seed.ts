import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env';
import { User } from '../models/User';
import { Skill } from '../models/Skill';
import { WorkerProfile } from '../models/WorkerProfile';
import { EmployerProfile } from '../models/EmployerProfile';
import { Job } from '../models/Job';
import { WorkRequest } from '../models/WorkRequest';
import { Review } from '../models/Review';
import { fuzzCoordinates } from '../utils/geoFuzzer';

export const seedDatabase = async () => {
  console.log('🌱 Starting CooLink Database Seeding...');

  let mongodInstance: MongoMemoryServer | null = null;
  if (mongoose.connection.readyState !== 1) {
    if (!env.MONGODB_URI || env.MONGODB_URI === 'in-memory') {
      mongodInstance = await MongoMemoryServer.create({
        binary: {
          version: '5.0.28',
          downloadDir: path.resolve(__dirname, '../../.mongo-bin'),
        },
      });
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      console.log(`Connected to seed database at: ${uri}`);
    } else {
      await mongoose.connect(env.MONGODB_URI);
    }
  }

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Skill.deleteMany({}),
    WorkerProfile.deleteMany({}),
    EmployerProfile.deleteMany({}),
    Job.deleteMany({}),
    WorkRequest.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log('🧹 Cleaned existing records.');

  // 1. Seed Skills (Trades)
  const skillsData = [
    { name: 'Masonry', nameMl: 'മേസ്തിരി പണി', icon: 'Hammer', category: 'CONSTRUCTION', defaultMinWage: 900, defaultMaxWage: 1200 },
    { name: 'Tile Work', nameMl: 'ടൈൽ വർക്ക്', icon: 'LayoutGrid', category: 'CONSTRUCTION', defaultMinWage: 1000, defaultMaxWage: 1300 },
    { name: 'Electrical', nameMl: 'ഇലക്ട്രിക്കൽ', icon: 'Zap', category: 'MAINTENANCE', defaultMinWage: 850, defaultMaxWage: 1200 },
    { name: 'Plumbing', nameMl: 'പ്ലംബിംഗ്', icon: 'Wrench', category: 'MAINTENANCE', defaultMinWage: 850, defaultMaxWage: 1200 },
    { name: 'Carpentry', nameMl: 'ആശാരി പണി', icon: 'Axe', category: 'CONSTRUCTION', defaultMinWage: 950, defaultMaxWage: 1300 },
    { name: 'Painting', nameMl: 'പെയിന്റിംഗ്', icon: 'Paintbrush', category: 'MAINTENANCE', defaultMinWage: 800, defaultMaxWage: 1100 },
    { name: 'Welding', nameMl: 'വെൽഡിംഗ്', icon: 'Flame', category: 'CONSTRUCTION', defaultMinWage: 900, defaultMaxWage: 1250 },
    { name: 'Construction Helper', nameMl: 'ഹെൽപ്പർ', icon: 'Users', category: 'CONSTRUCTION', defaultMinWage: 700, defaultMaxWage: 900 },
    { name: 'Cleaning & Housekeeping', nameMl: 'ക്ലീനിംഗ്', icon: 'Sparkles', category: 'CLEANING', defaultMinWage: 650, defaultMaxWage: 900 },
    { name: 'Gardening & Landscaping', nameMl: 'തോട്ടം പണി', icon: 'Trees', category: 'AGRICULTURE', defaultMinWage: 750, defaultMaxWage: 1000 },
  ];

  const skills = await Skill.insertMany(skillsData);
  const skillMap = new Map(skills.map((s) => [s.name, s._id]));
  console.log(`✅ Seeded ${skills.length} Kerala trades/skills.`);

  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);

  // 2. Seed Admin
  const admin = await User.create({
    phone: '9847000000',
    email: 'admin@coolink.in',
    passwordHash: adminPasswordHash,
    fullName: 'CooLink Administrator',
    role: 'ADMIN',
    isPhoneVerified: true,
    verificationStatus: 'VERIFIED',
    status: 'ACTIVE',
  });
  console.log(`✅ Seeded Admin: ${admin.email} (9847000000)`);

  // 3. Seed Employers
  const employersData = [
    {
      phone: '9847000001',
      email: 'moideen.contractor@example.com',
      fullName: 'Moideen Kutty (MK Builders)',
      employerType: 'CONTRACTOR' as const,
      companyName: 'MK Construction Group',
      locality: 'Kottakkal',
      district: 'Malappuram',
      location: [75.9938, 10.9987] as [number, number],
    },
    {
      phone: '9847000002',
      email: 'anita.thomas@example.com',
      fullName: 'Dr. Anita Thomas',
      employerType: 'HOUSE_OWNER' as const,
      locality: 'Tirur',
      district: 'Malappuram',
      location: [75.9234, 10.9142] as [number, number],
    },
    {
      phone: '9847000003',
      email: 'raghavan.contractor@example.com',
      fullName: 'K.P. Raghavan',
      employerType: 'CONTRACTOR' as const,
      companyName: 'Raghavan Infrastructure',
      locality: 'Manjeri',
      district: 'Malappuram',
      location: [76.1215, 11.1189] as [number, number],
    },
  ];

  const createdEmployers = [];
  for (const emp of employersData) {
    const user = await User.create({
      phone: emp.phone,
      email: emp.email,
      passwordHash: defaultPasswordHash,
      fullName: emp.fullName,
      role: 'EMPLOYER',
      isPhoneVerified: true,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
    });

    const profile = await EmployerProfile.create({
      userId: user._id,
      employerType: emp.employerType,
      companyName: emp.companyName,
      locality: emp.locality,
      district: emp.district,
      location: { type: 'Point', coordinates: emp.location },
      jobsPostedCount: 12,
      averageRating: 4.8,
      totalReviews: 8,
    });

    createdEmployers.push({ user, profile });
  }
  console.log(`✅ Seeded ${createdEmployers.length} realistic employers.`);

  // 4. Seed Workers
  const workersData = [
    {
      phone: '9847100001',
      fullName: 'Ravi Kumar',
      primarySkill: 'Masonry',
      secondarySkills: ['Tile Work'],
      experienceYears: 8,
      dailyWageMin: 950,
      dailyWageMax: 1150,
      locality: 'Kottakkal',
      district: 'Malappuram',
      location: [75.9938, 10.9987] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 127,
      averageRating: 4.85,
      totalReviews: 36,
      languages: ['Malayalam', 'Hindi', 'Tamil'],
      bio: 'Experienced mason with 8+ years in residential concrete, brick wall masonry, and plastering.',
      isVerified: true,
    },
    {
      phone: '9847100002',
      fullName: 'Suresh Babu',
      primarySkill: 'Tile Work',
      secondarySkills: ['Masonry'],
      experienceYears: 6,
      dailyWageMin: 1000,
      dailyWageMax: 1250,
      locality: 'Tirur',
      district: 'Malappuram',
      location: [75.9234, 10.9142] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 84,
      averageRating: 4.75,
      totalReviews: 24,
      languages: ['Malayalam'],
      bio: 'Precision floor tile, vitrified tile, and granite kitchen counter installation.',
      isVerified: true,
    },
    {
      phone: '9847100003',
      fullName: 'Faisal V.P.',
      primarySkill: 'Electrical',
      secondarySkills: [],
      experienceYears: 5,
      dailyWageMin: 900,
      dailyWageMax: 1200,
      locality: 'Malappuram',
      district: 'Malappuram',
      location: [76.0711, 11.051] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 96,
      averageRating: 4.92,
      totalReviews: 41,
      languages: ['Malayalam', 'English'],
      bio: 'Certified licensed wireman. Domestic concealed wiring, DB dressing, and inverter setup.',
      isVerified: true,
    },
    {
      phone: '9847100004',
      fullName: 'Manoharan K.',
      primarySkill: 'Plumbing',
      secondarySkills: [],
      experienceYears: 10,
      dailyWageMin: 900,
      dailyWageMax: 1200,
      locality: 'Manjeri',
      district: 'Malappuram',
      location: [76.1215, 11.1189] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 142,
      averageRating: 4.88,
      totalReviews: 50,
      languages: ['Malayalam'],
      bio: 'Master plumber for water tank pipeline fitting, CPVC/PVC lines, and sanitary installation.',
      isVerified: true,
    },
    {
      phone: '9847100005',
      fullName: 'Vijayan Nair',
      primarySkill: 'Carpentry',
      secondarySkills: [],
      experienceYears: 12,
      dailyWageMin: 1000,
      dailyWageMax: 1350,
      locality: 'Kottakkal',
      district: 'Malappuram',
      location: [75.9938, 10.9987] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 210,
      averageRating: 4.95,
      totalReviews: 64,
      languages: ['Malayalam'],
      bio: 'Traditional timber work, teak wood door frames, kitchen cupboards, and roofing carpentry.',
      isVerified: true,
    },
    {
      phone: '9847100006',
      fullName: 'Santhosh P.',
      primarySkill: 'Painting',
      secondarySkills: [],
      experienceYears: 4,
      dailyWageMin: 850,
      dailyWageMax: 1100,
      locality: 'Tirur',
      district: 'Malappuram',
      location: [75.9234, 10.9142] as [number, number],
      availability: { status: 'BUSY' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 52,
      averageRating: 4.65,
      totalReviews: 18,
      languages: ['Malayalam', 'Hindi'],
      bio: 'Interior putty finishing, exterior weather-proof painting, and wood polish.',
      isVerified: false,
    },
    {
      phone: '9847100007',
      fullName: 'Shaji M.',
      primarySkill: 'Welding',
      secondarySkills: [],
      experienceYears: 7,
      dailyWageMin: 950,
      dailyWageMax: 1250,
      locality: 'Kottakkal',
      district: 'Malappuram',
      location: [75.9938, 10.9987] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 73,
      averageRating: 4.78,
      totalReviews: 22,
      languages: ['Malayalam'],
      bio: 'Gate, truss work, handrail fabrication, and arc/argon welding.',
      isVerified: true,
    },
    {
      phone: '9847100008',
      fullName: 'Basheer K.',
      primarySkill: 'Construction Helper',
      secondarySkills: [],
      experienceYears: 3,
      dailyWageMin: 700,
      dailyWageMax: 850,
      locality: 'Malappuram',
      district: 'Malappuram',
      location: [76.0711, 11.051] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 45,
      averageRating: 4.6,
      totalReviews: 14,
      languages: ['Malayalam', 'Hindi'],
      bio: 'Reliable helper for concrete mixing, earth digging, material loading and unloading.',
      isVerified: true,
    },
    {
      phone: '9847100009',
      fullName: 'Sunitha Devi',
      primarySkill: 'Cleaning & Housekeeping',
      secondarySkills: [],
      experienceYears: 4,
      dailyWageMin: 700,
      dailyWageMax: 900,
      locality: 'Manjeri',
      district: 'Malappuram',
      location: [76.1215, 11.1189] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 60,
      averageRating: 4.9,
      totalReviews: 28,
      languages: ['Malayalam'],
      bio: 'Post-construction house cleaning, deep kitchen cleaning, floor scrubbing.',
      isVerified: true,
    },
    {
      phone: '9847100010',
      fullName: 'Raman Kutty',
      primarySkill: 'Gardening & Landscaping',
      secondarySkills: [],
      experienceYears: 9,
      dailyWageMin: 800,
      dailyWageMax: 1000,
      locality: 'Kottakkal',
      district: 'Malappuram',
      location: [75.9938, 10.9987] as [number, number],
      availability: { status: 'AVAILABLE' as const, availableFor: 'TODAY' as const },
      completedJobsCount: 115,
      averageRating: 4.82,
      totalReviews: 39,
      languages: ['Malayalam'],
      bio: 'Grass cutting, coconut tree pruning, garden soil preparation and planting.',
      isVerified: true,
    },
  ];

  const createdWorkers = [];
  for (const w of workersData) {
    const user = await User.create({
      phone: w.phone,
      passwordHash: defaultPasswordHash,
      fullName: w.fullName,
      role: 'WORKER',
      isPhoneVerified: true,
      verificationStatus: w.isVerified ? 'VERIFIED' : 'PENDING',
      status: 'ACTIVE',
    });

    const primarySkillId = skillMap.get(w.primarySkill)!;
    const secondarySkillIds = w.secondarySkills
      .map((s) => skillMap.get(s))
      .filter(Boolean);

    const fuzzed = fuzzCoordinates(w.location);

    const profile = await WorkerProfile.create({
      userId: user._id,
      primarySkillId,
      secondarySkills: secondarySkillIds,
      experienceYears: w.experienceYears,
      dailyWageMin: w.dailyWageMin,
      dailyWageMax: w.dailyWageMax,
      locality: w.locality,
      district: w.district,
      location: { type: 'Point', coordinates: w.location },
      fuzzedLocation: { type: 'Point', coordinates: fuzzed },
      availability: {
        status: w.availability.status,
        availableFor: w.availability.availableFor,
        updatedAt: new Date(),
      },
      completedJobsCount: w.completedJobsCount,
      averageRating: w.averageRating,
      totalReviews: w.totalReviews,
      languages: w.languages,
      bio: w.bio,
    });

    createdWorkers.push({ user, profile });
  }
  console.log(`✅ Seeded ${createdWorkers.length} authentic Kerala daily-wage workers.`);

  // 5. Seed Sample Jobs
  const sampleJobs = [
    {
      employerId: createdEmployers[0].user._id,
      title: 'Need 2 Experienced Masons for Villa Construction',
      description: 'Require skilled masons for second floor brickwork and column concreting.',
      requiredSkillId: skillMap.get('Masonry'),
      workersNeeded: 2,
      workersHired: 1,
      wageOffer: 1100,
      wageType: 'DAILY' as const,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      durationDays: 3,
      startTime: '08:00 AM',
      locality: 'Kottakkal',
      landmark: 'Near Ayurveda College',
      location: { type: 'Point', coordinates: [75.9938, 10.9987] },
      status: 'POSTED' as const,
    },
    {
      employerId: createdEmployers[1].user._id,
      title: 'Kitchen & Bathroom Plumbing Leakage Repair',
      description: 'Pipe leaking behind wall. Need experienced plumber with own tools.',
      requiredSkillId: skillMap.get('Plumbing'),
      workersNeeded: 1,
      workersHired: 1,
      wageOffer: 1000,
      wageType: 'DAILY' as const,
      startDate: new Date(),
      durationDays: 1,
      startTime: '09:00 AM',
      locality: 'Tirur',
      landmark: 'Opposite Railway Station',
      location: { type: 'Point', coordinates: [75.9234, 10.9142] },
      status: 'IN_PROGRESS' as const,
    },
    {
      employerId: createdEmployers[2].user._id,
      title: 'Commercial Showroom Conduit Wiring',
      description: 'Complete 3-phase commercial electrical wiring and switchboard fittings.',
      requiredSkillId: skillMap.get('Electrical'),
      workersNeeded: 2,
      workersHired: 0,
      wageOffer: 1200,
      wageType: 'DAILY' as const,
      startDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      durationDays: 4,
      startTime: '08:30 AM',
      locality: 'Manjeri',
      landmark: 'Court Road Junction',
      location: { type: 'Point', coordinates: [76.1215, 11.1189] },
      status: 'POSTED' as const,
    },
  ];

  const jobs = await Job.insertMany(sampleJobs);
  console.log(`✅ Seeded ${jobs.length} active jobs.`);

  // 6. Seed Sample Completed Job, WorkRequest & Reviews for Ravi Kumar (Mason)
  const completedJob = await Job.create({
    employerId: createdEmployers[0].user._id,
    title: 'Compound Wall Plastering and Gate Pillar Work',
    description: 'Plastering for 120ft compound wall and stone cladding on pillars.',
    requiredSkillId: skillMap.get('Masonry'),
    workersNeeded: 1,
    workersHired: 1,
    wageOffer: 1150,
    wageType: 'DAILY',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    durationDays: 2,
    locality: 'Kottakkal',
    location: { type: 'Point', coordinates: [75.9938, 10.9987] },
    status: 'COMPLETED',
    paymentStatus: 'PAID',
  });

  await WorkRequest.create({
    jobId: completedJob._id,
    employerId: createdEmployers[0].user._id,
    workerId: createdWorkers[0].user._id, // Ravi Kumar
    offeredWage: 1150,
    jobDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    locality: 'Kottakkal',
    status: 'COMPLETED',
    expiresAt: new Date(),
    acceptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  await Review.create({
    jobId: completedJob._id,
    reviewerId: createdEmployers[0].user._id,
    targetUserId: createdWorkers[0].user._id,
    rating: 5,
    comment: 'Ravi is one of the most punctual and skilled masons in Kottakkal. Clean plastering finish and finished right on time.',
    categoryRatings: { punctuality: 5, workQuality: 5, paymentPromptness: 5 },
  });

  // 7. Seed an active PENDING Work Request for Ravi Kumar to test Accept / Decline live
  await WorkRequest.create({
    employerId: createdEmployers[1].user._id, // Dr. Anita Thomas
    workerId: createdWorkers[0].user._id, // Ravi Kumar
    offeredWage: 1100,
    jobDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: '2 days',
    locality: 'Kottakkal',
    instructions: 'Need experienced mason for bathroom renovation and brick masonry. Materials ready on site.',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  console.log('🌟 Seeding Completed Successfully!');
  console.log('\nDemo Logins (Password: password123, Admin: adminpassword123):');
  console.log('------------------------------------------------------------');
  console.log('Worker (Ravi Kumar - Mason):       9847100001');
  console.log('Worker (Suresh Babu - Tile):       9847100002');
  console.log('Worker (Faisal - Electrician):     9847100003');
  console.log('Employer (MK Builders Contractor): 9847000001');
  console.log('Employer (Dr. Anita House Owner):  9847000002');
  console.log('Admin (CooLink Admin):             9847000000');
  console.log('------------------------------------------------------------\n');

  if (mongodInstance) {
    // If running as standalone script, keep open or close
  }
};

// Auto run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
