import { Schema, model, Document, Types } from 'mongoose';

export type WorkRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETED';

export interface IWorkRequest extends Document {
  _id: Types.ObjectId;
  jobId?: Types.ObjectId;
  employerId: Types.ObjectId;
  workerId: Types.ObjectId;
  offeredWage: number;
  jobDate: Date;
  duration: string; // e.g. "1 day", "2 days"
  locality: string;
  instructions?: string;
  status: WorkRequestStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledBy?: Types.ObjectId;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const workRequestSchema = new Schema<IWorkRequest>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    offeredWage: {
      type: Number,
      required: true,
      min: 100,
    },
    jobDate: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: String,
      default: '1 day',
    },
    locality: {
      type: String,
      required: true,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

workRequestSchema.index({ workerId: 1, status: 1 });
workRequestSchema.index({ employerId: 1, status: 1 });
workRequestSchema.index({ jobDate: 1, workerId: 1 });

export const WorkRequest = model<IWorkRequest>('WorkRequest', workRequestSchema);
