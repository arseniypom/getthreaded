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

    const systemPrompt = `You are an expert social media strategist. Generate personalized tips based on the user's specific profile and general best practices.`

    const userPrompt = `Based on this profile, generate tips:

Profile:
- Journey Stage: ${profile.personal?.journeyStage}
- Voice Style: ${profile.voice?.signatureMoves?.[0]?.replace('-', ' ')}
- Constraints: ${JSON.stringify(profile.boundaries?.operationalConstraints || {})}

Generate as JSON:
{
  "personalized": [
    "Personalized tip 1 based on their specific profile",
    "Personalized tip 2 based on their journey stage"
  ],
  "general": [
    "Universal best practice 1",
    "Universal best practice 2",
    "Universal best practice 3"
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

    const tipsAndTricks = JSON.parse(content)
    return NextResponse.json({ tipsAndTricks })

  } catch (error) {
    console.error('Tips generation error:', error)

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
      { error: 'Failed to generate tips' },
      { status: 500 }
    )
  }
}