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

    const systemPrompt = `You are an expert social media strategist. Generate the "About Me" section of a personalized content strategy based on the user profile. Be specific and actionable.`

    const userPrompt = `Based on this profile, generate mission, values, and goals:

Profile:
- Name: ${profile.personal?.name}
- Journey Stage: ${profile.personal?.journeyStage}
- Primary Goal: ${profile.personal?.goals?.primary || 'Build authority'}
- Niches: ${profile.niches?.primary}, ${profile.niches?.secondary || ''}
- Pillars: ${profile.pillars?.join(', ')}
- Target Audience: ${profile.audience?.demographics?.ageRange?.min}-${profile.audience?.demographics?.ageRange?.max} years old

Generate as JSON:
{
  "mainGoal": "specific main goal",
  "mission": "compelling mission statement",
  "values": ["value1", "value2", "value3"]
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

    const aboutMe = JSON.parse(content)
    return NextResponse.json({ aboutMe })

  } catch (error) {
    console.error('About Me generation error:', error)

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
      { error: 'Failed to generate About Me section' },
      { status: 500 }
    )
  }
}