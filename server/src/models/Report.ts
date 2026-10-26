import { Schema, model, Document, Types } from 'mongoose';

export type ReportReason =
  | 'FRAUD'
  | 'NON_PAYMENT'
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'UNSAFE_CONDITIONS'
  | 'NO_SHOW'
  | 'OTHER';

export type ReportStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface IReport extends Document {
  _id: Types.ObjectId;
  reporterId: Types.ObjectId;
  reportedUserId: Types.ObjectId;
  jobId?: Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    reason: {
      type: String,
      enum: [
        'FRAUD',
        'NON_PAYMENT',
        'HARASSMENT',
        'FAKE_PROFILE',
        'UNSAFE_CONDITIONS',
        'NO_SHOW',
        'OTHER',
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = model<IReport>('Report', reportSchema);
