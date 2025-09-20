import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { UserProfile, GeneratedStrategy } from '@/lib/strategy-types'
import { OPENAI_MODEL } from '@/lib/constants'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  let profile: UserProfile | undefined

  try {
    const body = await request.json() as { profile: UserProfile }
    profile = body.profile

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert social media strategist specializing in creating personalized content strategies. Generate a comprehensive strategy based on the user profile provided. Be specific, actionable, and personalized.`

    const userPrompt = `Generate a personalized content strategy as a JSON object with this exact structure:

{
  "aboutMe": {
    "mainGoal": "${profile.personal?.goals?.primary || 'Build authority'}",
    "secondaryGoal": "${profile.personal?.goals?.secondary || ''}",
    "mission": "Generate mission statement based on profile",
    "values": ["value1", "value2", "value3"]
  },
  "aboutAudience": {
    "pains": ["pain1", "pain2", "pain3"],
    "desires": ["desire1", "desire2", "desire3"],
    "portraits": [
      {"name": "Name, age, role", "description": "Specific moment description"},
      {"name": "Name, age, role", "description": "Specific moment description"}
    ]
  },
  "personalInsights": [
    "Insight 1 with tactical implication",
    "Insight 2 with tactical implication",
    "Insight 3 with tactical implication"
  ],
  "postingStrategy": {
    "actions": [
      {"priority": 1, "action": "Most important action"},
      {"priority": 2, "action": "Second action"},
      {"priority": 3, "action": "Third action"},
      {"priority": 4, "action": "Fourth action"},
      {"priority": 5, "action": "Fifth action"}
    ],
    "weeklyStrategy": [
      {"weeks": "Week 1-2", "focus": "Foundation focus"},
      {"weeks": "Week 3-4", "focus": "Expansion focus"},
      {"weeks": "Week 5-6", "focus": "Optimization focus"}
    ],
    "weeklySchedule": [
      {"day": "Monday", "pillar": "${profile.pillars?.[0] || 'Main Topic'}", "postType": "Motivational"},
      {"day": "Tuesday", "pillar": "${profile.pillars?.[1] || 'Secondary Topic'}", "postType": "Teaching"},
      {"day": "Wednesday", "pillar": "Mixed", "postType": "Engagement"},
      {"day": "Thursday", "pillar": "${profile.pillars?.[2] || profile.pillars?.[0] || 'Core Topic'}", "postType": "Tactical"},
      {"day": "Friday", "pillar": "Mixed", "postType": "Reflection"}
    ]
  },
  "posts": {
    "pillars": ${JSON.stringify(profile.pillars || [])},
    "templates": [
      {
        "id": "template1",
        "name": "Hook Master Template",
        "structure": "Opening question\\n\\nPoint 1\\nPoint 2\\nPoint 3\\n\\nClosing CTA",
        "examples": [
          {"title": "Example 1", "content": "Specific example content"},
          {"title": "Example 2", "content": "Specific example content"},
          {"title": "Example 3", "content": "Specific example content"}
        ]
      }
    ]
  },
  "tipsAndTricks": {
    "personalized": [
      "Personalized tip 1 based on profile",
      "Personalized tip 2 based on profile"
    ],
    "general": [
      "General tip 1",
      "General tip 2",
      "General tip 3"
    ]
  },
  "personalChallenge": {
    "description": "30-day challenge for ${profile.personal?.journeyStage} stage",
    "steps": [
      "Step 1",
      "Step 2",
      "Step 3",
      "Step 4"
    ],
    "expectedResults": "Expected outcome based on journey stage"
  }
}

Profile to analyze:
${JSON.stringify(profile, null, 2)}

Generate specific, actionable content based on this profile. Be creative and personalized.`

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 1, // Default temperature for consistency with generate-thread
      response_format: { type: 'json_object' },
      max_completion_tokens: 4000
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      // Check if the response was cut off due to token limit
      if (completion.choices[0]?.finish_reason === 'length') {
        throw new Error('Response was too long. Please try with a simpler profile.')
      }
      throw new Error('No content received from OpenAI')
    }

    let strategy: GeneratedStrategy
    try {
      strategy = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      throw new Error('Invalid response format from AI')
    }

    // Validate the response has required fields
    if (!strategy.aboutMe || !strategy.aboutAudience || !strategy.postingStrategy) {
      throw new Error('Invalid strategy structure received from AI')
    }

    return NextResponse.json({ strategy })
  } catch (error) {
    console.error('Strategy generation error:', error)

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI configuration.' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }
      if (error.status === 503) {
        return NextResponse.json(
          { error: 'OpenAI service is temporarily unavailable. Please try again.' },
          { status: 503 }
        )
      }
    }

    // Return a fallback strategy structure if generation fails
    const fallbackStrategy: GeneratedStrategy = {
      aboutMe: {
        mainGoal: profile?.personal?.goals?.primary || 'Build your online presence',
        secondaryGoal: profile?.personal?.goals?.secondary,
        mission: `Help ${profile?.audience?.psychographics?.dailyReality?.[0]?.replace('-', ' ') || 'professionals'} achieve their goals through ${profile?.pillars?.[0] || 'valuable content'}`,
        values: ['Authenticity', 'Value', 'Consistency']
      },
      aboutAudience: {
        pains: profile?.audience?.psychographics?.painPoints?.map(p => p.replace('-', ' ')) || ['Time constraints', 'Information overload'],
        desires: profile?.audience?.psychographics?.aspirations?.map(a => a.replace('-', ' ')) || ['Growth', 'Freedom'],
        portraits: [
          {
            name: 'Sarah, 28, Manager',
            description: 'Scrolls LinkedIn during lunch looking for career inspiration'
          },
          {
            name: 'Mike, 35, Entrepreneur',
            description: 'Searches for actionable tips while commuting'
          }
        ]
      },
      personalInsights: [
        'Your audience craves authentic content that addresses their real struggles',
        'Consistency matters more than perfection for building trust',
        'Your unique perspective is your biggest differentiator'
      ],
      postingStrategy: {
        actions: [
          { priority: 1, action: 'Post consistently at the same time each day' },
          { priority: 2, action: 'Engage with every comment for 48 hours' },
          { priority: 3, action: 'Share personal stories mixed with insights' },
          { priority: 4, action: 'Test different formats to find what resonates' },
          { priority: 5, action: 'Build relationships with other creators' }
        ],
        weeklyStrategy: [
          { weeks: 'Week 1-2', focus: 'Establish consistency and find your voice' },
          { weeks: 'Week 3-4', focus: 'Double down on what works' },
          { weeks: 'Week 5-6', focus: 'Scale and optimize' }
        ],
        weeklySchedule: [
          { day: 'Monday', pillar: profile?.pillars?.[0] || 'Core Topic', postType: 'Motivational' },
          { day: 'Tuesday', pillar: profile?.pillars?.[1] || 'Secondary Topic', postType: 'Teaching' },
          { day: 'Wednesday', pillar: 'Mixed', postType: 'Engagement' },
          { day: 'Thursday', pillar: profile?.pillars?.[2] || profile?.pillars?.[0] || 'Core Topic', postType: 'Tactical' },
          { day: 'Friday', pillar: 'Mixed', postType: 'Reflection' }
        ]
      },
      posts: {
        pillars: profile?.pillars || ['Main Topic'],
        templates: [
          {
            id: 'hook-template',
            name: 'Hook Master',
            structure: 'Opening question\n\n3 key points\n\nActionable takeaway\n\nEngagement question',
            examples: [
              {
                title: 'Career Growth',
                content: 'What\'s holding you back from your next promotion?\n\n1. Lack of visibility\n2. Missing key skills\n3. Poor self-advocacy\n\nStart documenting your wins weekly.\n\nWhat\'s your biggest career challenge?'
              },
              {
                title: 'Productivity',
                content: 'Why do your mornings feel chaotic?\n\n1. No evening prep\n2. Decision fatigue\n3. Reactive mode\n\nPlan tomorrow tonight.\n\nWhat\'s your morning routine?'
              },
              {
                title: 'Mindset',
                content: 'The lie about overnight success?\n\n1. It takes years\n2. Failures are hidden\n3. Luck plays a role\n\nFocus on daily progress.\n\nWhat myth held you back?'
              }
            ]
          }
        ]
      },
      tipsAndTricks: {
        personalized: [
          `Use your ${profile?.voice?.signatureMoves?.[0]?.replace('-', ' ') || 'unique'} style to stand out`,
          `Your ${profile?.personal?.journeyStage?.replace('-', ' ') || 'current'} stage is perfect for experimenting`
        ],
        general: [
          'Post at the same time daily',
          'Repurpose top content after 30 days',
          'Track what resonates and double down'
        ]
      },
      personalChallenge: {
        description: `30-day challenge for ${profile?.personal?.journeyStage?.replace('-', ' ') || 'growth'}`,
        steps: [
          'Post once daily using your calendar',
          'Respond to every comment',
          'Track top 10 performing posts',
          'Refine strategy based on data'
        ],
        expectedResults: '2-3x engagement and clear content identity'
      }
    }

    return NextResponse.json({
      strategy: fallbackStrategy,
      warning: 'Using fallback strategy due to generation error'
    })
  }
}