export type JourneyStage = 'just-starting' | 'building' | 'scaling' | 'pivoting'

export type VoiceQuadrant = {
  casual: number // 0-100
  professional: number // 0-100
  bold: number // 0-100
  thoughtful: number // 0-100
}

export type SignatureMove =
  | 'hook-master'
  | 'storyteller'
  | 'myth-buster'
  | 'data-dropper'
  | 'pattern-spotter'
  | 'straight-shooter'

export type EmojiUsage = 'never' | 'strategic' | 'liberally'
export type HumorStyle = 'dry-wit' | 'self-deprecating' | 'observational' | 'none'
export type ControversyComfort = 'avoid' | 'careful' | 'embrace'
export type PersonalSharing = 'private' | 'selective' | 'open-book'
export type CTAStyle = 'soft-nudge' | 'direct-ask' | 'let-them-come'

export type AudienceAge = {
  min: number
  max: number
}

export type GenderMix = 'primarily-male' | 'mixed' | 'primarily-female'

export type DailyReality =
  | 'career-focused'
  | 'family-first'
  | 'lifelong-learner'
  | 'side-hustle'
  | 'wellness-warrior'
  | 'digital-native'
  | 'corporate-climber'
  | 'creative-soul'

export type PainPoint =
  | 'no-time'
  | 'career-stuck'
  | 'info-overload'
  | 'imposter-syndrome'
  | 'work-life-balance'
  | 'financial-stress'
  | 'no-direction'
  | 'disconnected'

export type Aspiration =
  | 'freedom'
  | 'recognition'
  | 'security'
  | 'growth'
  | 'connection'
  | 'impact'


export const NICHE_OPTIONS = [
  'Mindset & Discipline',
  'Money, Business & Side Hustles',
  'Psychology & Human Behavior',
  'Life Advice & Perspective Shifts',
  'Science & Space Curiosity',
  'Productivity & High Performance',
  'Spirituality & Stillness',
  'Health, Fitness & Biohacking',
  'AI, Tech & Future Trends',
  'Controversial Opinions & Social Truths',
  'Philosophy & Deep Thinking',
  'Movies, TV & Hidden Lessons',
  'Digital Skills & Online Income',
  'History & Hidden Stories',
  'Human Nature & Dating Psychology',
  'Modern Society Critics',
  'Book Summaries & Life Lessons',
  'Travel & Global Curiosities',
  'Mental Health & Inner Battles',
  'Stoicism & Modern Life'
] as const

export type Niche = typeof NICHE_OPTIONS[number]

export const PILLAR_OPTIONS: Record<Niche, string[]> = {
  'Mindset & Discipline': [
    'Mental Toughness Training',
    'Daily Systems Building',
    'Failure Recovery Tactics'
  ],
  'Money, Business & Side Hustles': [
    'Income Stream Building',
    'Money Psychology Fixes',
    'Business Model Breakdowns'
  ],
  'Psychology & Human Behavior': [
    'Behavioral Pattern Decoding',
    'Emotional Intelligence Tactics',
    'Cognitive Bias Awareness'
  ],
  'Life Advice & Perspective Shifts': [
    'Reframing Techniques',
    'Decision-Making Frameworks',
    'Life Experiment Results'
  ],
  'Science & Space Curiosity': [
    'Mind-Blowing Discoveries',
    'Science Myth-Busting',
    'Future Predictions Analysis'
  ],
  'Productivity & High Performance': [
    'System Optimization Hacks',
    'Energy Management Tactics',
    'Focus Protocol Testing'
  ],
  'Spirituality & Stillness': [
    'Mindfulness Practices',
    'Inner Peace Techniques',
    'Wisdom Tradition Insights'
  ],
  'Health, Fitness & Biohacking': [
    'Evidence-Based Protocols',
    'Body Optimization Tests',
    'Workout Myth-Busting'
  ],
  'AI, Tech & Future Trends': [
    'Tool Tutorials & Reviews',
    'Future Impact Analysis',
    'Tech Skill Building'
  ],
  'Controversial Opinions & Social Truths': [
    'Sacred Cow Challenging',
    'Uncomfortable Statistics',
    'Alternative Perspectives'
  ],
  'Philosophy & Deep Thinking': [
    "Life's Big Questions",
    'Philosophical Frameworks',
    'Thought Experiments'
  ],
  'Movies, TV & Hidden Lessons': [
    'Character Psychology Analysis',
    'Life Lessons Extraction',
    'Storytelling Breakdowns'
  ],
  'Digital Skills & Online Income': [
    'Skill Stack Building',
    'Platform Growth Tactics',
    'Monetization Strategies'
  ],
  'History & Hidden Stories': [
    'Forgotten Events Analysis',
    'Historical Pattern Recognition',
    'Untold Perspectives'
  ],
  'Human Nature & Dating Psychology': [
    'Attraction Science Decoded',
    'Relationship Pattern Analysis',
    'Communication Tactics'
  ],
  'Modern Society Critics': [
    'Cultural Trend Analysis',
    'System Failure Exposés',
    'Social Experiment Results'
  ],
  'Book Summaries & Life Lessons': [
    'Key Concept Extraction',
    'Implementation Guides',
    'Author Philosophy Breakdowns'
  ],
  'Travel & Global Curiosities': [
    'Cultural Insight Stories',
    'Hidden Gem Discoveries',
    'Travel Life Hacks'
  ],
  'Mental Health & Inner Battles': [
    'Coping Strategy Toolbox',
    'Recovery Journey Insights',
    'Stigma-Breaking Truths'
  ],
  'Stoicism & Modern Life': [
    'Ancient Wisdom Applications',
    'Daily Stoic Practices',
    'Modern Challenge Solutions'
  ]
}

export type Timeframe = '1-month' | '3-months' | '6-months'

export interface UserProfile {
  // Step 1: Personal
  personal: {
    name: string
    handle: string
    journeyStage: JourneyStage
    context?: string
    goals?: {
      primary: string
      secondary?: string
      timeframe: Timeframe
    }
  }

  // Step 2: Discovery
  niches: {
    primary: Niche
    secondary?: Niche
  }

  // Step 3: Focus & Refinement
  pillars: string[] // 2-3 content pillars

  // Step 4: Voice
  voice: {
    matrix: VoiceQuadrant
    signatureMoves: SignatureMove[]
    nonNegotiables: {
      emojiUsage: EmojiUsage
      humorStyle: HumorStyle
      controversyComfort: ControversyComfort
      personalSharing: PersonalSharing
      ctaStyle: CTAStyle
    }
  }

  // Step 5: Audience Discovery
  audience: {
    demographics: {
      ageRange: AudienceAge
      genderMix: GenderMix
      location?: string
    }
    psychographics: {
      dailyReality: DailyReality[]
      painPoints: PainPoint[]
      aspirations: Aspiration[]
    }
  }

  // Step 6: Boundaries
  boundaries: {
    contentBoundaries: {
      noPoliticsReligion?: boolean
      noSpecificNumbers?: boolean
      textOnly?: boolean
    }
    operationalConstraints: {
      noDMs?: boolean
      noSwearing?: boolean
      preferQA?: boolean
      noWeekends?: boolean
    }
    nicheSpecific?: {
      noClientDetails?: boolean
      noFinancialAdvice?: boolean
      noMedicalClaims?: boolean
    }
  }
}

export interface GeneratedStrategy {
  aboutMe: {
    mainGoal: string
    secondaryGoal?: string
    mission: string
    values: string[]
  }
  aboutAudience: {
    pains: string[]
    desires: string[]
    portraits: {
      name: string
      description: string
    }[]
  }
  personalInsights: string[]
  postingStrategy: {
    actions: {
      priority: number
      action: string
    }[]
    weeklyStrategy: {
      weeks: string
      focus: string
    }[]
    weeklySchedule: {
      day: string
      pillar: string
      postType: string
    }[]
  }
  posts: {
    pillars: string[]
    templates: PostTemplate[]
  }
  tipsAndTricks: {
    personalized: string[]
    general: string[]
  }
  personalChallenge: {
    description: string
    steps: string[]
    expectedResults: string
  }
}

export interface PostTemplate {
  id: string
  name: string
  structure: string
  examples: {
    title: string
    content: string
  }[]
}

export interface StrategyDashboard {
  profile: UserProfile
  missionStatement: string
  weeklyCalendar: WeeklyPost[]
  firstWeekPosts: string[]
  growthFormula: {
    week1_2: string[]
    week3_4: string[]
    week5_8: string[]
  }
  contentFormulas: ContentFormula[]
  powerMoves: string[]
  quickWinTactics: string[]
  successMetrics: string[]
  thirtyDayChallenge: string
}

export interface WeeklyPost {
  day: string
  type: 'motivational' | 'teaching' | 'engagement' | 'tactical' | 'reflection'
  pillar: string
  format: string
  time?: string
}

export interface ContentFormula {
  name: string
  description: string
  structure: string[]
}