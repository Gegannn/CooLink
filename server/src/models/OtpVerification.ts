import { Schema, model, Document } from 'mongoose';

export interface IOtpVerification extends Document {
  target: string;
  type: 'EMAIL' | 'SMS';
  phone?: string;
  email?: string;
  otpHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const otpVerificationSchema = new Schema<IOtpVerification>(
  {
    target: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['EMAIL', 'SMS'],
      default: 'EMAIL',
    },
    phone: {
      type: String,
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      index: true,
      sparse: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically delete document after expiry
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indices for querying active unverified OTP
otpVerificationSchema.index({ target: 1, verified: 1, expiresAt: 1 });
otpVerificationSchema.index({ phone: 1, verified: 1, expiresAt: 1 });
otpVerificationSchema.index({ email: 1, verified: 1, expiresAt: 1 });

export const OtpVerification = model<IOtpVerification>('OtpVerification', otpVerificationSchema);
