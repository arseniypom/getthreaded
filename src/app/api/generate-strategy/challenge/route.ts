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

    const systemPrompt = `You are an expert social media strategist. Generate a personalized 30-day challenge based on the user's journey stage and goals.`

    const userPrompt = `Based on this profile, generate a 30-day challenge:

Profile:
- Journey Stage: ${profile.personal?.journeyStage}
- Goals: ${profile.personal?.goals?.primary}, ${profile.personal?.goals?.secondary || ''}
- Timeframe: ${profile.personal?.goals?.timeframe}

Generate as JSON:
{
  "description": "30-day challenge for ${profile.personal?.journeyStage?.replace('-', ' ')} stage",
  "steps": [
    "Step 1: Specific action",
    "Step 2: Another specific action",
    "Step 3: Third specific action",
    "Step 4: Final specific action"
  ],
  "expectedResults": "Concrete expected outcome based on their goals and stage"
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

    const personalChallenge = JSON.parse(content)
    return NextResponse.json({ personalChallenge })

  } catch (error) {
    console.error('Challenge generation error:', error)

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
      { error: 'Failed to generate challenge' },
      { status: 500 }
    )
  }
}