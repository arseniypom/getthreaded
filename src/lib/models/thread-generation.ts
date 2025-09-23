import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ThreadPost } from '@/lib/types';

export interface IThreadGeneration extends Document {
  input: {
    idea: string;
    multiPost: boolean;
    longer: boolean;
  };
  output: {
    thread: ThreadPost[];
    totalPosts: number;
  };
  metadata: {
    model: string;
    characterCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  feedback: {
    liked: boolean | null;
    likedAt: Date | null;
  };
}

const ThreadPostSchema = new Schema({
  id: { type: Number, required: true },
  content: { type: String, required: true },
  characterCount: { type: Number, required: true },
});

const ThreadGenerationSchema = new Schema<IThreadGeneration>({
  input: {
    idea: { type: String, required: true },
    multiPost: { type: Boolean, default: false },
    longer: { type: Boolean, default: false },
  },
  output: {
    thread: [ThreadPostSchema],
    totalPosts: { type: Number, required: true },
  },
  metadata: {
    model: { type: String, required: true },
    characterCount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  feedback: {
    liked: { type: Boolean, default: null },
    likedAt: { type: Date, default: null },
  },
});

ThreadGenerationSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

ThreadGenerationSchema.index({ 'metadata.createdAt': -1 });
ThreadGenerationSchema.index({ 'feedback.liked': 1, 'metadata.createdAt': -1 });

let ThreadGeneration: Model<IThreadGeneration>;

try {
  ThreadGeneration = mongoose.model<IThreadGeneration>('ThreadGeneration');
} catch {
  ThreadGeneration = mongoose.model<IThreadGeneration>('ThreadGeneration', ThreadGenerationSchema);
}

export default ThreadGeneration;