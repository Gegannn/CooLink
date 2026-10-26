import { Schema, model, Document, Types } from 'mongoose';

export type EmployerType = 'CONTRACTOR' | 'HOUSE_OWNER' | 'BUSINESS';

export interface IEmployerProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  employerType: EmployerType;
  companyName?: string;
  locality: string;
  district: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  jobsPostedCount: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const employerProfileSchema = new Schema<IEmployerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employerType: {
      type: String,
      enum: ['CONTRACTOR', 'HOUSE_OWNER', 'BUSINESS'],
      default: 'HOUSE_OWNER',
    },
    companyName: {
      type: String,
      trim: true,
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
    },
    location: {
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
    jobsPostedCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

employerProfileSchema.index({ location: '2dsphere' });

export const EmployerProfile = model<IEmployerProfile>('EmployerProfile', employerProfileSchema);
