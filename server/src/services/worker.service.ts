import { WorkerProfile, IWorkerProfile, AvailabilityStatus, AvailabilityWindow } from '../models/WorkerProfile';
import { User } from '../models/User';
import { Review } from '../models/Review';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { fuzzCoordinates } from '../utils/geoFuzzer';

export interface WorkerSearchFilters {
  skillId?: string;
  locality?: string;
  minRating?: number;
  minExperience?: number;
  maxWage?: number;
  availableOnly?: boolean;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

export class WorkerService {
  public async getProfileByUserId(userId: string): Promise<IWorkerProfile | null> {
    return WorkerProfile.findOne({ userId })
      .populate('primarySkillId')
      .populate('secondarySkills')
      .populate('userId', 'fullName phone email isPhoneVerified verificationStatus preferredLanguage');
  }

  public async updateProfile(
    userId: string,
    data: {
      avatarUrl?: string;
      primarySkillId: string;
      secondarySkills?: string[];
      experienceYears: number;
      dailyWageMin: number;
      dailyWageMax: number;
      hourlyWage?: number;
      locality: string;
      district?: string;
      location?: [number, number]; // [lng, lat]
      languages?: string[];
      bio?: string;
    }
  ): Promise<IWorkerProfile> {
    const user = await User.findById(userId);
    if (!user || user.role !== 'WORKER') {
      throw new BadRequestError('Only worker accounts can maintain a worker profile.');
    }

    const coordinates = data.location || [75.9938, 10.9987];
    const fuzzed = fuzzCoordinates(coordinates);

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          avatarUrl: data.avatarUrl,
          primarySkillId: data.primarySkillId,
          secondarySkills: data.secondarySkills || [],
          experienceYears: data.experienceYears,
          dailyWageMin: data.dailyWageMin,
          dailyWageMax: data.dailyWageMax,
          hourlyWage: data.hourlyWage,
          locality: data.locality,
          district: data.district || 'Malappuram',
          location: {
            type: 'Point',
            coordinates,
          },
          fuzzedLocation: {
            type: 'Point',
            coordinates: fuzzed,
          },
          languages: data.languages || ['Malayalam'],
          bio: data.bio,
        },
      },
      { new: true, upsert: true }
    )
      .populate('primarySkillId')
      .populate('secondarySkills');

    return profile;
  }

  public async updateAvailability(
    userId: string,
    availability: {
      status: AvailabilityStatus;
      availableFor?: AvailabilityWindow;
      customDate?: string | Date;
    }
  ): Promise<IWorkerProfile> {
    const profile = await WorkerProfile.findOne({ userId });
    if (!profile) {
      throw new NotFoundError('Worker profile not found. Please complete profile setup first.');
    }

    profile.availability = {
      status: availability.status,
      availableFor: availability.availableFor || 'TODAY',
      customDate: availability.customDate ? new Date(availability.customDate) : undefined,
      updatedAt: new Date(),
    };

    await profile.save();
    return profile;
  }

  public async searchWorkers(filters: WorkerSearchFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters.skillId) {
      query.$or = [
        { primarySkillId: filters.skillId },
        { secondarySkills: filters.skillId },
      ];
    }

    if (filters.locality) {
      query.locality = { $regex: new RegExp(filters.locality, 'i') };
    }

    if (filters.minRating && filters.minRating > 0) {
      query.averageRating = { $gte: Number(filters.minRating) };
    }

    if (filters.minExperience && filters.minExperience > 0) {
      query.experienceYears = { $gte: Number(filters.minExperience) };
    }

    if (filters.maxWage && filters.maxWage > 0) {
      query.dailyWageMin = { $lte: Number(filters.maxWage) };
    }

    if (filters.availableOnly) {
      query['availability.status'] = 'AVAILABLE';
    }

    // Query active workers with populated user data
    const profiles = await WorkerProfile.find(query)
      .populate('primarySkillId')
      .populate('secondarySkills')
      .populate({
        path: 'userId',
        select: 'fullName phone isPhoneVerified verificationStatus status',
        match: {
          status: 'ACTIVE',
          ...(filters.verifiedOnly ? { verificationStatus: 'VERIFIED' } : {}),
        },
      })
      .exec();

    // Filter out profiles whose user failed populate (e.g. suspended, or not verified if filter requested)
    const validProfiles = profiles.filter((p) => p.userId != null);

    // Intelligent Ranking Algorithm:
    // 1. Availability Status: AVAILABLE (score 100), BUSY (score 20), NOT_AVAILABLE (score 0)
    // 2. Verified Status: VERIFIED (+30)
    // 3. Rating: averageRating * 15
    // 4. Experience: experienceYears * 2
    // 5. Completed Jobs: completedJobsCount * 1
    const rankedProfiles = validProfiles.sort((a, b) => {
      const getScore = (item: typeof a) => {
        let score = 0;
        if (item.availability.status === 'AVAILABLE') score += 100;
        else if (item.availability.status === 'BUSY') score += 20;

        const u = item.userId as unknown as { verificationStatus?: string };
        if (u?.verificationStatus === 'VERIFIED') score += 30;

        score += (item.averageRating || 0) * 15;
        score += Math.min(item.experienceYears || 0, 20) * 2;
        score += Math.min(item.completedJobsCount || 0, 50);

        return score;
      };

      return getScore(b) - getScore(a);
    });

    const total = rankedProfiles.length;
    const paginated = rankedProfiles.slice(skip, skip + limit);

    // Sanitize output for public listing (use fuzzedLocation, mask phone numbers for privacy)
    const sanitizedResults = paginated.map((p) => {
      const u = p.userId as unknown as {
        _id: string;
        fullName: string;
        phone: string;
        isPhoneVerified: boolean;
        verificationStatus: string;
      };

      return {
        _id: p._id,
        workerId: u?._id,
        fullName: u?.fullName,
        maskedPhone: u?.phone ? `${u.phone.slice(0, 2)}******${u.phone.slice(-2)}` : '',
        avatarUrl: p.avatarUrl,
        primarySkill: p.primarySkillId,
        secondarySkills: p.secondarySkills,
        experienceYears: p.experienceYears,
        dailyWageMin: p.dailyWageMin,
        dailyWageMax: p.dailyWageMax,
        hourlyWage: p.hourlyWage,
        locality: p.locality,
        district: p.district,
        approxLocation: p.fuzzedLocation,
        availability: p.availability,
        completedJobsCount: p.completedJobsCount,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        languages: p.languages,
        bio: p.bio,
        isPhoneVerified: u?.isPhoneVerified,
        verificationStatus: u?.verificationStatus,
      };
    });

    return {
      results: sanitizedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getWorkerPublicProfile(workerId: string) {
    const profile = await WorkerProfile.findOne({ userId: workerId })
      .populate('primarySkillId')
      .populate('secondarySkills')
      .populate('userId', 'fullName phone isPhoneVerified verificationStatus createdAt');

    if (!profile) {
      throw new NotFoundError('Worker profile not found.');
    }

    const reviews = await Review.find({ targetUserId: workerId })
      .populate('reviewerId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(20);

    const u = profile.userId as unknown as {
      _id: string;
      fullName: string;
      phone: string;
      isPhoneVerified: boolean;
      verificationStatus: string;
      createdAt: Date;
    };

    return {
      profile: {
        _id: profile._id,
        workerId: u?._id,
        fullName: u?.fullName,
        maskedPhone: u?.phone ? `${u.phone.slice(0, 2)}******${u.phone.slice(-2)}` : '',
        avatarUrl: profile.avatarUrl,
        primarySkill: profile.primarySkillId,
        secondarySkills: profile.secondarySkills,
        experienceYears: profile.experienceYears,
        dailyWageMin: profile.dailyWageMin,
        dailyWageMax: profile.dailyWageMax,
        hourlyWage: profile.hourlyWage,
        locality: profile.locality,
        district: profile.district,
        approxLocation: profile.fuzzedLocation,
        availability: profile.availability,
        completedJobsCount: profile.completedJobsCount,
        averageRating: profile.averageRating,
        totalReviews: profile.totalReviews,
        languages: profile.languages,
        bio: profile.bio,
        isPhoneVerified: u?.isPhoneVerified,
        verificationStatus: u?.verificationStatus,
        memberSince: u?.createdAt,
      },
      reviews,
    };
  }
}

export const workerService = new WorkerService();
