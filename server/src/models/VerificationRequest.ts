import { Schema, model, Document, Types } from 'mongoose';

export type VerificationDocType = 'AADHAAR' | 'VOTER_ID' | 'DRIVING_LICENSE' | 'LABOUR_CARD';
export type VerificationDocStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IVerificationRequest extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  documentType: VerificationDocType;
  documentNumberMasked: string; // e.g., "XXXX-XXXX-1234"
  documentFileUrl: string; // Secure path, restricted from public queries
  selfieFileUrl?: string;
  status: VerificationDocStatus;
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const verificationRequestSchema = new Schema<IVerificationRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['AADHAAR', 'VOTER_ID', 'DRIVING_LICENSE', 'LABOUR_CARD'],
      required: true,
    },
    documentNumberMasked: {
      type: String,
      required: true,
      trim: true,
    },
    documentFileUrl: {
      type: String,
      required: true,
      select: false, // Hidden by default from standard queries
    },
    selfieFileUrl: {
      type: String,
      select: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const VerificationRequest = model<IVerificationRequest>(
  'VerificationRequest',
  verificationRequestSchema
);
