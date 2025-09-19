import { NextRequest, NextResponse } from 'next/server';
import { ThreadsScraper } from '@/lib/threads-scraper';
import { validateAndNormalizeHandle, scrapeRequestSchema, validateFinalUrl } from '@/lib/security/url-validator';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { withResourceControl, withScraperCleanup, shouldAllowNewOperation } from '@/lib/security/resource-manager';
import { createErrorResponse, logSecurityEvent, validateResponse } from '@/lib/security/error-handler';
import { config } from '@/lib/threads-scraper/config';

// Generate request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const clientIp = getClientIp(request);
  const startTime = Date.now();

  try {
    // 1. Rate limiting check
    const rateLimitResult = await checkRateLimit(request);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_exceeded', {
        clientIp,
        requestId,
        error: rateLimitResult.error
      }, 'medium');

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      );
    }

    // 2. System capacity check
    if (!shouldAllowNewOperation()) {
      logSecurityEvent('system_overload', {
        clientIp,
        requestId,
        message: 'System at capacity'
      }, 'high');

      return NextResponse.json(
        { error: 'System temporarily unavailable. Please try again later.' },
        { status: 503, headers: { 'Retry-After': '30' } }
      );
    }

    // 3. Input validation
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return createErrorResponse(new Error('Invalid JSON in request body'), requestId);
    }

    const validatedInput = scrapeRequestSchema.parse(requestBody);
    const { handle: rawHandle, limit } = validatedInput;

    // 4. URL/Handle security validation
    const normalizedHandle = validateAndNormalizeHandle(rawHandle);

    // 5. Validate final URL before scraping
    const finalUrl = `${config.threads.baseUrl}/@${normalizedHandle}`;
    validateFinalUrl(finalUrl);

    console.log(`[${requestId}] Scraping posts for handle: ${normalizedHandle} (limit: ${limit}) from IP: ${clientIp}`);

    // 6. Execute scraping with resource controls
    const result = await withResourceControl(async () => {
      return await withScraperCleanup(async () => {
        const scraper = new ThreadsScraper({ headless: true });

        const operation = async () => {
          // Get posts from the profile with timeout protection
          const posts = await scraper.getPosts(normalizedHandle, { limit });

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

          return formattedPosts;
        };

        return { scraper, operation };
      });
    }, requestId);

    const responseData = {
      success: true,
      posts: result,
      count: result.length,
      requestId
    };

    // 7. Validate response for information leakage
    validateResponse(responseData);

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Successfully scraped ${result.length} posts in ${duration}ms`);

    // 8. Log successful operation
    if (duration > 10000) { // Log slow operations
      logSecurityEvent('slow_operation', {
        clientIp,
        requestId,
        duration,
        handle: normalizedHandle,
        postCount: result.length
      }, 'low');
    }

    return NextResponse.json(responseData, {
      headers: {
        'X-Request-ID': requestId,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    // Log the error with context
    logSecurityEvent('scraping_error', {
      clientIp,
      requestId,
      duration,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'medium');

    return createErrorResponse(error, requestId);
  }
}