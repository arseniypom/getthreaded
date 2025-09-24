import mongoose, { Schema, Document, Model } from 'mongoose';
import type { UserProfile, GeneratedStrategy } from '@/lib/strategy-types';

export interface IStrategyGeneration extends Document {
  userProfile: UserProfile;
  generatedStrategy: GeneratedStrategy;
  metadata: {
    model: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Schema for the age range
const AgeRangeSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
}, { _id: false });

// Schema for voice quadrant
const VoiceQuadrantSchema = new Schema({
  casual: { type: Number, required: true },
  professional: { type: Number, required: true },
  bold: { type: Number, required: true },
  thoughtful: { type: Number, required: true },
}, { _id: false });

// Schema for voice non-negotiables
const VoiceNonNegotiablesSchema = new Schema({
  emojiUsage: { type: String, enum: ['never', 'strategic', 'liberally'], required: true },
  humorStyle: { type: String, enum: ['dry-wit', 'self-deprecating', 'observational', 'none'], required: true },
  controversyComfort: { type: String, enum: ['avoid', 'careful', 'embrace'], required: true },
  personalSharing: { type: String, enum: ['private', 'selective', 'open-book'], required: true },
  ctaStyle: { type: String, enum: ['soft-nudge', 'direct-ask', 'let-them-come'], required: true },
}, { _id: false });

// Schema for boundaries
const ContentBoundariesSchema = new Schema({
  noPoliticsReligion: { type: Boolean },
  noSpecificNumbers: { type: Boolean },
  textOnly: { type: Boolean },
}, { _id: false });

const OperationalConstraintsSchema = new Schema({
  noDMs: { type: Boolean },
  noSwearing: { type: Boolean },
  preferQA: { type: Boolean },
  noWeekends: { type: Boolean },
}, { _id: false });

const NicheSpecificSchema = new Schema({
  noClientDetails: { type: Boolean },
  noFinancialAdvice: { type: Boolean },
  noMedicalClaims: { type: Boolean },
}, { _id: false });

// Schema for user profile
const UserProfileSchema = new Schema({
  personal: {
    name: { type: String, required: true },
    handle: { type: String, required: true },
    journeyStage: { type: String, enum: ['just-starting', 'building', 'scaling', 'pivoting'], required: true },
    context: { type: String, required: true },
    goals: {
      primary: { type: String },
      timeframe: { type: String, enum: ['1-month', '3-months', '6-months'] },
    },
  },
  niches: {
    primary: { type: String, required: true },
    secondary: { type: String },
  },
  pillars: [{ type: String }],
  voice: {
    matrix: VoiceQuadrantSchema,
    signatureMoves: [{ type: String, enum: ['hook-master', 'storyteller', 'myth-buster', 'data-dropper', 'pattern-spotter', 'straight-shooter'] }],
    nonNegotiables: VoiceNonNegotiablesSchema,
  },
  audience: {
    demographics: {
      ageRange: AgeRangeSchema,
      genderMix: { type: String, enum: ['primarily-male', 'mixed', 'primarily-female'], required: true },
      location: { type: String },
    },
    psychographics: {
      dailyReality: [{ type: String, enum: ['career-focused', 'family-first', 'lifelong-learner', 'side-hustle', 'wellness-warrior', 'digital-native', 'corporate-climber', 'creative-soul'] }],
    },
  },
  boundaries: {
    contentBoundaries: ContentBoundariesSchema,
    operationalConstraints: OperationalConstraintsSchema,
    nicheSpecific: NicheSpecificSchema,
  },
}, { _id: false });

// Schema for post template examples
const PostExampleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { _id: false });

// Schema for post templates
const PostTemplateSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  structure: { type: String, required: true },
  examples: [PostExampleSchema],
}, { _id: false });

// Schema for action priorities
const ActionSchema = new Schema({
  priority: { type: Number, required: true },
  action: { type: String, required: true },
}, { _id: false });

// Schema for weekly strategy
const WeeklyStrategySchema = new Schema({
  weeks: { type: String, required: true },
  focus: { type: String, required: true },
}, { _id: false });

// Schema for weekly schedule
const WeeklyScheduleSchema = new Schema({
  day: { type: String, required: true },
  pillar: { type: String, required: true },
  postType: { type: String, required: true },
}, { _id: false });

// Schema for audience portraits
const AudiencePortraitSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

// Schema for generated strategy
const GeneratedStrategySchema = new Schema({
  aboutMe: {
    mainGoal: { type: String, required: true },
    mission: { type: String, required: true },
    values: [{ type: String }],
  },
  aboutAudience: {
    pains: [{ type: String }],
    desires: [{ type: String }],
    portraits: [AudiencePortraitSchema],
  },
  personalInsights: [{ type: String }],
  postingStrategy: {
    actions: [ActionSchema],
    weeklyStrategy: [WeeklyStrategySchema],
    weeklySchedule: [WeeklyScheduleSchema],
  },
  posts: {
    pillars: [{ type: String }],
    templates: [PostTemplateSchema],
  },
  tipsAndTricks: {
    personalized: [{ type: String }],
    general: [{ type: String }],
  },
  personalChallenge: {
    description: { type: String, required: true },
    steps: [{ type: String }],
    expectedResults: { type: String, required: true },
  },
}, { _id: false });

// Main strategy generation schema
const StrategyGenerationSchema = new Schema<IStrategyGeneration>({
  userProfile: { type: UserProfileSchema, required: true },
  generatedStrategy: { type: GeneratedStrategySchema, required: true },
  metadata: {
    model: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
});

// Pre-save middleware to update the updatedAt field
StrategyGenerationSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Indexes for better query performance
StrategyGenerationSchema.index({ 'metadata.createdAt': -1 });
StrategyGenerationSchema.index({ 'userProfile.personal.handle': 1 });

let StrategyGeneration: Model<IStrategyGeneration>;

try {
  StrategyGeneration = mongoose.model<IStrategyGeneration>('StrategyGeneration');
} catch {
  StrategyGeneration = mongoose.model<IStrategyGeneration>('StrategyGeneration', StrategyGenerationSchema);
}

export default StrategyGeneration;