import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  workRequestId?: Types.ObjectId;
  reviewerId: Types.ObjectId;
  targetUserId: Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  categoryRatings?: {
    punctuality?: number;
    workQuality?: number;
    paymentPromptness?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    workRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkRequest',
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    categoryRatings: {
      punctuality: { type: Number, min: 1, max: 5 },
      workQuality: { type: Number, min: 1, max: 5 },
      paymentPromptness: { type: Number, min: 1, max: 5 },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from the same reviewer for the same job
reviewSchema.index({ jobId: 1, reviewerId: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);
