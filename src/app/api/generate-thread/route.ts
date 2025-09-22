import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ThreadResponse, GenerateThreadRequest, ThreadPost } from '@/lib/types';
import { getSystemPrompt, OPENAI_MODEL, MAX_CHAR_LIMIT, SHORT_CHAR_LIMIT } from '@/lib/constants';

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

    // Get the appropriate system prompt based on settings
    const multiPost = body.multiPost ?? false;
    const longer = body.longer ?? false;
    const systemPrompt = getSystemPrompt(multiPost, longer);

    const userPrompt = `Create a ${multiPost ? 'thread' : 'post'} about: ${body.idea}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 1, // Default temperature for consistency
      max_completion_tokens: multiPost ? 4000 : 1500, // Increased limits for model output
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      // Check if the response was cut off due to token limit
      if (completion.choices[0]?.finish_reason === 'length') {
        throw new Error('Response was too long. Please try with a shorter idea or disable multi-post mode.');
      }
      throw new Error('No content received from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // Apply character limits based on settings
    const charLimit = longer ? MAX_CHAR_LIMIT : SHORT_CHAR_LIMIT;

    const thread: ThreadPost[] = parsedResponse.thread.map((post: { id?: number; content: string }, index: number) => ({
      id: post.id || index + 1,
      content: post.content.slice(0, charLimit),
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