import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'REQUEST_RECEIVED'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_REJECTED'
  | 'REQUEST_CANCELLED'
  | 'JOB_IN_PROGRESS'
  | 'JOB_COMPLETED'
  | 'NEW_REVIEW'
  | 'VERIFICATION_UPDATE'
  | 'SYSTEM_ALERT';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipientId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'REQUEST_RECEIVED',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED',
        'REQUEST_CANCELLED',
        'JOB_IN_PROGRESS',
        'JOB_COMPLETED',
        'NEW_REVIEW',
        'VERIFICATION_UPDATE',
        'SYSTEM_ALERT',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
