import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  jobId?: Types.ObjectId;
  lastMessage?: string;
  lastMessageSenderId?: Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    lastMessage: {
      type: String,
      trim: true,
    },
    lastMessageSenderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
