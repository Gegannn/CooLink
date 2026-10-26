import { Schema, model, Document } from 'mongoose';

export interface IOtpVerification extends Document {
  phone: string;
  otpHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const otpVerificationSchema = new Schema<IOtpVerification>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
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

// Compound index for querying active unverified OTP for a phone
otpVerificationSchema.index({ phone: 1, verified: 1, expiresAt: 1 });

export const OtpVerification = model<IOtpVerification>('OtpVerification', otpVerificationSchema);
