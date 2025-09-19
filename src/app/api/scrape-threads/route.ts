import { NextRequest, NextResponse } from 'next/server';
import { ThreadsScraper } from '@/lib/threads-scraper';

export async function POST(request: NextRequest) {
  try {
    const { handle, limit = 30 } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: 'Profile handle or URL is required' },
        { status: 400 }
      );
    }

    console.log(`Scraping posts for handle: ${handle} (limit: ${limit})`);

    const scraper = new ThreadsScraper({ headless: true });

    try {
      // Get posts from the profile
      const posts = await scraper.getPosts(handle, { limit });

      // Format the data for the frontend
      const formattedPosts = posts.map(post => ({
        id: post.id,
        text: post.text || '',
        likes: post.like_count || 0,
        reposts: post.repost_count || 0,
        replies: post.reply_count || 0,
        timestamp: post.timestamp,
        url: post.url
      }));

      console.log(`Successfully scraped ${formattedPosts.length} posts`);

      return NextResponse.json({
        success: true,
        posts: formattedPosts,
        count: formattedPosts.length
      });

    } finally {
      await scraper.close();
    }

  } catch (error) {
    console.error('Error scraping threads:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Handle specific error types
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Profile not found. Please check the handle or URL.' },
        { status: 404 }
      );
    }

    if (errorMessage.includes('private')) {
      return NextResponse.json(
        { error: 'This profile is private and cannot be scraped.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: `Failed to scrape posts: ${errorMessage}` },
      { status: 500 }
    );
  }
}