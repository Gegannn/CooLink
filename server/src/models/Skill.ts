import { Schema, model, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  nameMl: string;
  icon: string;
  category: 'CONSTRUCTION' | 'MAINTENANCE' | 'CLEANING' | 'AGRICULTURE' | 'OTHER';
  defaultMinWage: number;
  defaultMaxWage: number;
  isActive: boolean;
}

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameMl: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Wrench',
    },
    category: {
      type: String,
      enum: ['CONSTRUCTION', 'MAINTENANCE', 'CLEANING', 'AGRICULTURE', 'OTHER'],
      default: 'CONSTRUCTION',
    },
    defaultMinWage: {
      type: Number,
      default: 800,
    },
    defaultMaxWage: {
      type: Number,
      default: 1200,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Skill = model<ISkill>('Skill', skillSchema);
