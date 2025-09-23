import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    // Check MongoDB connection
    await connectToDatabase();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'getthreaded',
      database: 'connected',
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'getthreaded',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}