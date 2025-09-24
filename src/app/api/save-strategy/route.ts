import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StrategyGeneration from '@/lib/models/strategy-generation';
import { UserProfile, GeneratedStrategy } from '@/lib/strategy-types';
import { OPENAI_MODEL } from '@/lib/constants';

interface SaveStrategyRequest {
  userId: string;
  userProfile: UserProfile;
  generatedStrategy: GeneratedStrategy;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveStrategyRequest = await request.json();
    const { userId, userProfile, generatedStrategy } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User profile is required' },
        { status: 400 }
      );
    }

    if (!generatedStrategy) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Generated strategy is required' },
        { status: 400 }
      );
    }

    // Validate user profile has minimum required fields
    if (!userProfile.personal?.name || !userProfile.personal?.handle || !userProfile.personal?.journeyStage) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User profile is missing required personal information' },
        { status: 400 }
      );
    }

    if (!userProfile.niches?.primary) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User profile is missing required niche information' },
        { status: 400 }
      );
    }

    if (!userProfile.audience?.demographics?.ageRange || !userProfile.audience?.demographics?.genderMix) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User profile is missing required audience demographics' },
        { status: 400 }
      );
    }

    // Validate generated strategy has minimum required fields
    if (!generatedStrategy.aboutMe || !generatedStrategy.aboutAudience || !generatedStrategy.postingStrategy) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Generated strategy is missing required sections' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already has a strategy
    const existingStrategy = await StrategyGeneration.findOne({ userId });

    if (existingStrategy) {
      // Update existing strategy instead of creating a new one
      existingStrategy.userProfile = userProfile;
      existingStrategy.generatedStrategy = generatedStrategy;
      existingStrategy.metadata.model = OPENAI_MODEL;
      existingStrategy.metadata.updatedAt = new Date();

      const updatedStrategy = await existingStrategy.save();

      return NextResponse.json({
        success: true,
        message: 'Strategy updated successfully',
        id: updatedStrategy._id,
        createdAt: updatedStrategy.metadata.createdAt,
        updatedAt: updatedStrategy.metadata.updatedAt,
        isUpdate: true
      }, { status: 200 });
    }

    // Create new strategy generation document
    const strategyDoc = new StrategyGeneration({
      userId,
      userProfile,
      generatedStrategy,
      metadata: {
        model: OPENAI_MODEL,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // Save to database
    const savedStrategy = await strategyDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Strategy saved successfully',
      id: savedStrategy._id,
      createdAt: savedStrategy.metadata.createdAt,
      isUpdate: false
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving strategy:', error);

    // Handle MongoDB validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Invalid data format provided' },
        { status: 400 }
      );
    }

    // Handle MongoDB duplicate key errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Conflict', message: 'Strategy with this data already exists' },
        { status: 409 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to save strategy' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve saved strategies (for future use)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const handle = url.searchParams.get('handle');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    await connectToDatabase();

    let query = {};
    if (handle) {
      query = { 'userProfile.personal.handle': handle };
    }

    const strategies = await StrategyGeneration
      .find(query)
      .sort({ 'metadata.createdAt': -1 })
      .limit(limit)
      .skip(skip)
      .select('userProfile.personal.name userProfile.personal.handle userProfile.niches.primary metadata.createdAt')
      .lean();

    const total = await StrategyGeneration.countDocuments(query);

    return NextResponse.json({
      success: true,
      strategies,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });

  } catch (error) {
    console.error('Error retrieving strategies:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to retrieve strategies' },
      { status: 500 }
    );
  }
}