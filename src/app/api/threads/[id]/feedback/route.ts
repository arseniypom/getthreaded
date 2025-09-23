import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ThreadGeneration from '@/lib/models/thread-generation';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Thread ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const thread = await ThreadGeneration.findByIdAndUpdate(
      id,
      {
        'feedback.liked': null,
        'feedback.likedAt': null,
      },
      { new: true }
    );

    if (!thread) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Thread not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: thread.feedback,
    }, { status: 200 });
  } catch (error) {
    console.error('Error removing feedback:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to remove feedback' },
      { status: 500 }
    );
  }
}