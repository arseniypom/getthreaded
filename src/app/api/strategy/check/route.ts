import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StrategyGeneration from '@/lib/models/strategy-generation';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the most recent strategy for this user
    const existingStrategy = await StrategyGeneration
      .findOne({ userId })
      .sort({ 'metadata.createdAt': -1 })
      .lean();

    if (!existingStrategy) {
      return NextResponse.json({
        exists: false,
        strategy: null
      });
    }

    // Return the existing strategy
    return NextResponse.json({
      exists: true,
      strategy: {
        id: existingStrategy._id,
        userProfile: existingStrategy.userProfile,
        generatedStrategy: existingStrategy.generatedStrategy,
        createdAt: existingStrategy.metadata.createdAt,
        updatedAt: existingStrategy.metadata.updatedAt
      }
    });

  } catch (error) {
    console.error('Error checking for existing strategy:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to check for existing strategy' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to allow users to start over
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const strategyId = url.searchParams.get('strategyId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleteQuery: { userId: string; _id?: string } = { userId };

    // If strategyId is provided, delete specific strategy
    // Otherwise, delete all strategies for this user
    if (strategyId) {
      deleteQuery._id = strategyId;
    }

    const result = await StrategyGeneration.deleteMany(deleteQuery);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No strategies found to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} strategy(ies)`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to delete strategy' },
      { status: 500 }
    );
  }
}