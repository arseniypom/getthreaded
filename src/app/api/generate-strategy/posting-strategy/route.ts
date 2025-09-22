import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { UserProfile } from '@/lib/strategy-types'
import { OPENAI_MODEL } from '@/lib/constants'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const body = await request.json() as { profile: UserProfile }
    const { profile } = body

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert social media strategist. Generate a comprehensive posting strategy including priority actions, weekly evolution plan, and daily schedule.`

    const userPrompt = `Based on this profile, generate posting strategy:

Profile:
- Journey Stage: ${profile.personal?.journeyStage}
- Pillars: ${profile.pillars?.join(', ')}
- Constraints: No weekends: ${profile.boundaries?.operationalConstraints?.noWeekends}, No DMs: ${profile.boundaries?.operationalConstraints?.noDMs}

Generate as JSON:
{
  "actions": [
    {"priority": 1, "action": "Most important specific action"},
    {"priority": 2, "action": "Second priority action"},
    {"priority": 3, "action": "Third priority action"},
    {"priority": 4, "action": "Fourth priority action"},
    {"priority": 5, "action": "Fifth priority action"}
  ],
  "weeklyStrategy": [
    {"weeks": "Week 1-2", "focus": "Specific focus area"},
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
}`

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 1,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const postingStrategy = JSON.parse(content)

    // Filter out weekends if needed
    if (profile.boundaries?.operationalConstraints?.noWeekends) {
      postingStrategy.weeklySchedule = postingStrategy.weeklySchedule.filter(
        (day: { day: string }) => !['Saturday', 'Sunday'].includes(day.day)
      )
    }

    return NextResponse.json({ postingStrategy })

  } catch (error) {
    console.error('Posting Strategy generation error:', error)

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate posting strategy' },
      { status: 500 }
    )
  }
}