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

    const systemPrompt = `You are an expert social media strategist. Generate 3 personalized insights with tactical implications based on the user's unique positioning and profile.`

    const userPrompt = `Based on this profile, generate strategic insights:

Profile:
- Journey Stage: ${profile.personal?.journeyStage}
- Niches: ${profile.niches?.primary}, ${profile.niches?.secondary || ''}
- Voice Style: ${profile.voice?.signatureMoves?.join(', ')}
- Audience Pain Points: ${profile.audience?.psychographics?.painPoints?.join(', ')}

Generate as JSON:
{
  "personalInsights": [
    "Insight 1 with specific tactical implication",
    "Insight 2 with specific tactical implication",
    "Insight 3 with specific tactical implication"
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

    const data = JSON.parse(content)
    return NextResponse.json({ personalInsights: data.personalInsights })

  } catch (error) {
    console.error('Insights generation error:', error)

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
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}