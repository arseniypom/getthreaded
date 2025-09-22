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

    const systemPrompt = `You are an expert social media strategist. Generate post templates with placeholder structures and real-world examples tailored to the user's profile.`

    const userPrompt = `Based on this profile, generate post templates:

Profile:
- Niches: ${profile.niches?.primary}, ${profile.niches?.secondary || ''}
- Pillars: ${profile.pillars?.join(', ')}
- Voice Style: ${profile.voice?.signatureMoves?.join(', ')}
- Emoji Usage: ${profile.voice?.nonNegotiables?.emojiUsage}
- CTA Style: ${profile.voice?.nonNegotiables?.ctaStyle}

Generate 2-3 templates as JSON:
{
  "pillars": ${JSON.stringify(profile.pillars || [])},
  "templates": [
    {
      "id": "template1",
      "name": "Hook Master Template",
      "structure": "The biggest lie about [topic]?\\n\\nThat you need [common misconception].\\n\\nTruth: [Contrarian insight]\\n\\nHere's what actually works:\\n1. [Specific tip]\\n2. [Specific tip]\\n3. [Specific tip]\\n\\n[Engagement question]",
      "examples": [
        {"title": "Example 1", "content": "Filled example with real content tailored to ${profile.niches?.primary}"},
        {"title": "Example 2", "content": "Another filled example with different content"}
      ]
    }
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

    const posts = JSON.parse(content)
    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Post Templates generation error:', error)

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
      { error: 'Failed to generate post templates' },
      { status: 500 }
    )
  }
}