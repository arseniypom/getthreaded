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

    const systemPrompt = `You are an expert social media strategist. Generate the "About Audience" section with audience insights based on the user profile. Be specific and create realistic audience portraits.`

    const userPrompt = `Based on this profile, generate audience insights and determine their pain points and desires from the context:

Profile Context:
- User's Goal: ${profile.personal?.goals?.primary}
- User's Journey Stage: ${profile.personal?.journeyStage}
- Content Niche: ${profile.niches?.primary}
- Content Pillars: ${profile.pillars?.join(', ') || 'Not specified'}

Audience Demographics:
- Target Age: ${profile.audience?.demographics?.ageRange?.min}-${profile.audience?.demographics?.ageRange?.max}
- Gender: ${profile.audience?.demographics?.genderMix}
- Location: ${profile.audience?.demographics?.location || 'Global'}
- Daily Reality: ${profile.audience?.psychographics?.dailyReality?.join(', ')}

Generate as JSON:
{
  "pains": ["specific pain 1", "specific pain 2", "specific pain 3"],
  "desires": ["deep desire 1", "deep desire 2", "deep desire 3"],
  "portraits": [
    {"name": "Name, age, role", "description": "Specific moment/scenario description"},
    {"name": "Name, age, role", "description": "Specific moment/scenario description"}
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

    const aboutAudience = JSON.parse(content)
    return NextResponse.json({ aboutAudience })

  } catch (error) {
    console.error('About Audience generation error:', error)

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
      { error: 'Failed to generate About Audience section' },
      { status: 500 }
    )
  }
}