import { Schema, model, Document, Types } from 'mongoose';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
export type AvailabilityWindow = 'TODAY' | 'TOMORROW' | 'CUSTOM_DATE';

export interface IWorkerProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  avatarUrl?: string;
  primarySkillId: Types.ObjectId;
  secondarySkills: Types.ObjectId[];
  experienceYears: number;
  dailyWageMin: number;
  dailyWageMax: number;
  hourlyWage?: number;
  locality: string;
  district: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  fuzzedLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] - fuzzed by ~2km
  };
  availability: {
    status: AvailabilityStatus;
    availableFor: AvailabilityWindow;
    customDate?: Date;
    updatedAt: Date;
  };
  completedJobsCount: number;
  averageRating: number;
  totalReviews: number;
  languages: string[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workerProfileSchema = new Schema<IWorkerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    avatarUrl: {
      type: String,
    },
    primarySkillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    secondarySkills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    experienceYears: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
      index: true,
    },
    dailyWageMin: {
      type: Number,
      required: true,
      default: 800,
    },
    dailyWageMax: {
      type: Number,
      required: true,
      default: 1200,
    },
    hourlyWage: {
      type: Number,
    },
    locality: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      default: 'Malappuram',
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        default: [75.9938, 10.9987], // Default Kottakkal center
      },
    },
    fuzzedLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [75.9938, 10.9987],
      },
    },
    availability: {
      status: {
        type: String,
        enum: ['AVAILABLE', 'BUSY', 'NOT_AVAILABLE'],
        default: 'AVAILABLE',
        index: true,
      },
      availableFor: {
        type: String,
        enum: ['TODAY', 'TOMORROW', 'CUSTOM_DATE'],
        default: 'TODAY',
      },
      customDate: {
        type: Date,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    completedJobsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 5,
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    languages: {
      type: [String],
      default: ['Malayalam'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial indexes
workerProfileSchema.index({ location: '2dsphere' });
workerProfileSchema.index({ fuzzedLocation: '2dsphere' });

// Compound discovery indexes
workerProfileSchema.index({ 'availability.status': 1, primarySkillId: 1, averageRating: -1 });
workerProfileSchema.index({ locality: 1, 'availability.status': 1 });

export const WorkerProfile = model<IWorkerProfile>('WorkerProfile', workerProfileSchema);
