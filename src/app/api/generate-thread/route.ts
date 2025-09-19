import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ThreadResponse, GenerateThreadRequest, ThreadPost } from '@/lib/types';
import { SEI_SYSTEM_PROMPT, OPENAI_MODEL, MAX_CHAR_LIMIT } from '@/lib/constants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateThreadRequest;

    if (!body.idea || body.idea.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Idea is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'Configuration Error', message: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const userPrompt = `Create a thread about: ${body.idea}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: SEI_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from AI');
    }

    const thread: ThreadPost[] = parsedResponse.thread.map((post: { id?: number; content: string }, index: number) => ({
      id: post.id || index + 1,
      content: post.content.slice(0, MAX_CHAR_LIMIT),
      characterCount: post.content.length,
    }));

    const response: ThreadResponse = {
      thread,
      totalPosts: thread.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating thread:', error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Authentication Error', message: 'Invalid API key' },
          { status: 401 }
        );
      } else if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate Limit', message: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to generate thread' },
      { status: 500 }
    );
  }
}