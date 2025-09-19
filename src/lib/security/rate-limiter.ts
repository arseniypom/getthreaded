import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextRequest } from 'next/server';

// Rate limiter configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes block

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory({
  points: RATE_LIMIT_MAX_REQUESTS, // Number of requests
  duration: RATE_LIMIT_WINDOW_MS / 1000, // Per window in seconds
  blockDuration: BLOCK_DURATION_MS / 1000, // Block duration in seconds
});

// Track repeated violations for progressive penalties
const violationTracker = new Map<string, { count: number; lastViolation: number }>();

/**
 * Extracts client IP from Next.js request
 */
export function getClientIp(request: NextRequest): string {
  // Check common headers for real IP (when behind proxy/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwardedFor) {
    // Take the first IP from the list
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to request IP (may be proxy IP) - using geo for Next.js Edge
  return (request as unknown as { ip?: string }).ip || '127.0.0.1';
}

/**
 * Checks if the request should be rate limited
 */
export async function checkRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  error?: string;
}> {
  const clientIp = getClientIp(request);

  try {
    // Check rate limit
    const result = await rateLimiter.consume(clientIp);

    return {
      allowed: true,
      remaining: result.remainingPoints || 0,
      resetTime: new Date(Date.now() + result.msBeforeNext),
    };
  } catch (rateLimiterRes) {
    // Rate limit exceeded
    const violation = violationTracker.get(clientIp) || { count: 0, lastViolation: 0 };
    const now = Date.now();

    // Update violation tracking
    violation.count++;
    violation.lastViolation = now;
    violationTracker.set(clientIp, violation);

    // Progressive penalties for repeated violations
    const extraBlockTime = Math.min(violation.count * 5 * 60 * 1000, 60 * 60 * 1000); // Max 1 hour

    // Clean up old violation records (older than 24 hours)
    if (now - violation.lastViolation > 24 * 60 * 60 * 1000) {
      violationTracker.delete(clientIp);
    }

    const resetTime = new Date(Date.now() + ((rateLimiterRes as { msBeforeNext: number }).msBeforeNext || 0) + extraBlockTime);

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      error: `Rate limit exceeded. Too many requests from ${clientIp}. Try again later.`
    };
  }
}

/**
 * Middleware-friendly rate limit check
 */
export async function rateLimitMiddleware(request: NextRequest) {
  const result = await checkRateLimit(request);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toISOString(),
        },
      }
    );
  }

  return null; // Allow request to proceed
}

/**
 * Get rate limit status for a client
 */
export async function getRateLimitStatus(clientIp: string): Promise<{
  remaining: number;
  resetTime: Date;
  isBlocked: boolean;
}> {
  try {
    const result = await rateLimiter.get(clientIp);

    if (!result) {
      return {
        remaining: RATE_LIMIT_MAX_REQUESTS,
        resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
        isBlocked: false,
      };
    }

    return {
      remaining: result.remainingPoints || 0,
      resetTime: new Date(Date.now() + (result.msBeforeNext || 0)),
      isBlocked: result.remainingPoints === 0,
    };
  } catch {
    return {
      remaining: 0,
      resetTime: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
      isBlocked: true,
    };
  }
}

/**
 * Reset rate limit for a specific IP (admin function)
 */
export async function resetRateLimit(clientIp: string): Promise<void> {
  await rateLimiter.delete(clientIp);
  violationTracker.delete(clientIp);
}

/**
 * Get rate limiter statistics
 */
export function getRateLimiterStats() {
  return {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
    blockDurationMs: BLOCK_DURATION_MS,
    activeViolations: violationTracker.size,
  };
}