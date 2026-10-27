import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'WORKER' | 'EMPLOYER' | 'ADMIN';
export type VerificationStatus = 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface IUser extends Document {
  _id: Types.ObjectId;
  phone: string;
  email?: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  verificationStatus: VerificationStatus;
  status: UserStatus;
  preferredLanguage: 'en' | 'ml';
  refreshToken?: string;
  blockedUsers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return in default queries
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['WORKER', 'EMPLOYER', 'ADMIN'],
      default: 'WORKER',
      index: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'NOT_VERIFIED',
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'BANNED'],
      default: 'ACTIVE',
      index: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'ml'],
      default: 'en',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);
