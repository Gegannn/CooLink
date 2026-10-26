import { Schema, model, Document, Types } from 'mongoose';

export type JobStatus =
  | 'POSTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'DISPUTED';
export type WageType = 'DAILY' | 'HOURLY' | 'FIXED';

export interface IJob extends Document {
  _id: Types.ObjectId;
  employerId: Types.ObjectId;
  title: string;
  description: string;
  requiredSkillId: Types.ObjectId;
  workersNeeded: number;
  workersHired: number;
  wageOffer: number;
  wageType: WageType;
  startDate: Date;
  durationDays: number;
  startTime: string; // e.g. "08:00 AM"
  locality: string;
  district: string;
  landmark?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: JobStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requiredSkillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    workersNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    workersHired: {
      type: Number,
      default: 0,
    },
    wageOffer: {
      type: Number,
      required: true,
      min: 100,
    },
    wageType: {
      type: String,
      enum: ['DAILY', 'HOURLY', 'FIXED'],
      default: 'DAILY',
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    durationDays: {
      type: Number,
      default: 1,
      min: 1,
    },
    startTime: {
      type: String,
      default: '08:00 AM',
    },
    locality: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      default: 'Malappuram',
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
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
    status: {
      type: String,
      enum: ['POSTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      default: 'POSTED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'DISPUTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ location: '2dsphere' });
jobSchema.index({ status: 1, startDate: 1, requiredSkillId: 1 });

export const Job = model<IJob>('Job', jobSchema);
