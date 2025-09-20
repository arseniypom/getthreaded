# Strategy Builder - Data Structure Example

## Complete User Profile Data (End of Wizard)

This document shows the complete data structure collected through the strategy wizard and the personalized playbook generated from it.

### Final UserProfile Object

```typescript
{
  // Step 1: Personal Information
  personal: {
    name: "Alex Thompson",
    handle: "@alexthompson",  // Can be "pending" if user doesn't have one yet
    journeyStage: "building", // Options: 'just-starting' | 'building' | 'scaling' | 'pivoting'
    context: "Want to grow my coaching business, tired of posting without results"
  },

  // Step 2: Content Discovery
  niches: {
    primary: "Productivity & High Performance",
    secondary: "Mindset & Discipline"
  },

  // Step 3: Focus & Refinement
  pillars: [
    "System Optimization Hacks",
    "Energy Management Tactics",
    "Mental Toughness Training"
  ],

  // Step 4: Voice Configuration
  voice: {
    matrix: {
      casual: 30,        // 0-100 scale
      professional: 70,  // 0-100 scale
      bold: 75,         // 0-100 scale
      thoughtful: 25    // 0-100 scale
    },
    signatureMoves: [
      "hook-master",     // Opens with questions that stop the scroll
      "myth-buster",     // Challenges common beliefs
      "data-dropper"     // Backs claims with surprising stats
    ],
    nonNegotiables: {
      emojiUsage: "strategic",         // Options: 'never' | 'strategic' | 'liberally'
      humorStyle: "dry-wit",           // Options: 'dry-wit' | 'self-deprecating' | 'observational' | 'none'
      controversyComfort: "embrace",    // Options: 'avoid' | 'careful' | 'embrace'
      personalSharing: "selective",     // Options: 'private' | 'selective' | 'open-book'
      ctaStyle: "direct-ask"           // Options: 'soft-nudge' | 'direct-ask' | 'let-them-come'
    }
  },

  // Step 5: Audience Discovery
  audience: {
    demographics: {
      ageRange: { min: 25, max: 40 },
      genderMix: "mixed",              // Options: 'primarily-male' | 'mixed' | 'primarily-female'
      location: "Urban US"
    },
    psychographics: {
      dailyReality: [
        "career-focused",              // Career-focused achiever
        "side-hustle",                 // Side-hustle juggler
        "lifelong-learner"             // Lifelong learner
      ],
      painPoints: [
        "no-time",                     // Not enough time in the day
        "career-stuck",                // Feeling stuck in their career
        "info-overload"                // Information overload
      ],
      aspirations: [
        "freedom",                     // Freedom & flexibility
        "growth",                      // Growth & learning
        "impact"                       // Impact & meaning
      ]
    }
  },

  // Step 6: Boundaries & Constraints
  boundaries: {
    contentBoundaries: {
      noPoliticsReligion: true,       // Avoid divisive topics
      noSpecificNumbers: false,       // Can share revenue/prices
      textOnly: false                 // Can use photos/videos
    },
    operationalConstraints: {
      noDMs: true,                    // No DM strategy
      noSwearing: true,               // Keep it clean
      preferQA: false,                // Not Q&A focused
      noWeekends: true                // Monday-Friday only
    },
    nicheSpecific: {
      noFinancialAdvice: false,       // Based on niche selection
      noMedicalClaims: false,         // Based on niche selection
      noClientDetails: true           // For coaches/consultants
    }
  }
}
```

## Generated Strategy Dashboard

Based on the above profile data, the system generates:

### 1. Mission Statement
```
"I help career-focused professionals aged 25-40 who struggle with no time,
career stuck, and info overload achieve freedom and growth through
System Optimization Hacks and Energy Management Tactics delivered in a
professional and bold way."
```

### 2. Weekly Content Calendar

```javascript
[
  {
    day: "Monday",
    type: "Motivational Start",
    pillar: "System Optimization Hacks",
    format: "Hook + 3 points + CTA",
    style: "Expose"
  },
  {
    day: "Tuesday",
    type: "Teaching Tuesday",
    pillar: "Energy Management Tactics",
    format: "Problem → Solution → Implementation",
    style: "Educate"
  },
  {
    day: "Wednesday",
    type: "Engagement Day",
    pillar: "Mixed",
    format: "Discussion starter",
    style: "Engage"
  },
  {
    day: "Thursday",
    type: "Tactical Thursday",
    pillar: "Mental Toughness Training",
    format: "Step-by-step guide",
    style: "Educate"
  },
  {
    day: "Friday",
    type: "Reflection & Recap",
    pillar: "Mixed",
    format: "Week lessons + weekend challenge",
    style: "Expose"
  }
  // Note: No weekend posts due to noWeekends: true
]
```

### 3. First Week Post Examples

**Monday Post (hook-master style):**
```
"The biggest lie about productivity & high performance?

That you need [common misconception].

Truth: [Contrarian insight]

Here's what actually works:
1. [Specific tip]
2. [Specific tip]
3. [Specific tip]

What myth held you back the longest?"
```

**Tuesday Post (Teaching):**
```
"How to optimize your energy in 5 minutes:

Step 1: [Action]
Step 2: [Action]
Step 3: [Action]

I used this yesterday and [specific result].

Save this for when you need it."
```

### 4. Growth Formula

**Week 1-2: Foundation**
- Post at optimal times (commute, lunch, evening)
- Use hook-master style in 80% of posts
- Focus on System Optimization Hacks to establish expertise

**Week 3-4: Expansion**
- Add myth-buster approach
- Introduce Energy Management Tactics
- Start tracking: Which posts get most saves and comments

**Week 5-8: Optimization**
- Double down on what works
- Test "embrace" controversy level
- Build your "greatest hits" collection

### 5. Quick Win Tactics
- Batch create on Sunday: Write 5 posts in one sitting
- Use 60% evergreen, 40% timely content ratio
- Voice notes → transcribe → quick edit workflow
- Sunday prep, schedule entire week
- Repurpose winners after 30 days

### 6. Personal Guardrails
- ✓ No DMs → Use "Comment [word] below"
- ✓ No swearing → Keep it clean
- ✓ No weekends → Mon-Fri only
- ✓ No politics/religion topics
- ✓ No client details in examples

### 7. Success Metrics to Track

**Weekly:**
- Which pillar gets most engagement?
- What time gets most views?
- Which hook style works best?

**Monthly:**
- Top 5 performing posts
- Common themes in comments
- Follower growth rate
- Time per post (aim to decrease)

### 8. 30-Day Challenge

**For "building" stage:**
- Post once daily using the calendar
- Respond to every comment for 48 hours
- Save your top 10 performers
- After 30 days: Double down on what worked
- Expected result: 2-3x engagement, clear content identity

## Data Transformation Pipeline

```
User Input (6 Steps)
    ↓
UserProfile Object
    ↓
Strategy Dashboard Generator
    ↓
Personalized Playbook
    ├── Mission Statement
    ├── Weekly Calendar
    ├── Post Templates
    ├── Growth Formula
    ├── Quick Tactics
    └── Success Metrics
```

This complete data structure enables:
1. Highly personalized content strategies
2. Actionable daily guidance
3. Clear growth pathways
4. Measurable success metrics
5. Respect for personal boundaries