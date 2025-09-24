import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/security/rate-limiter';

// Cache security patterns for better performance
const suspiciousPatterns = [
  /\.\./,                    // Path traversal
  /<script/i,                // XSS attempts
  /union.*select/i,          // SQL injection
  /javascript:/i,            // JavaScript protocol
  /vbscript:/i,              // VBScript protocol
  /data:text\/html/i,        // Data URI HTML
  /on\w+\s*=/i,             // Event handlers
];

const blockedUserAgents = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /openvas/i,
  /vega/i,
  /w3af/i,
  /burp/i,
  /nmap/i
];

export async function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Rate limiting for scrape API
  if (request.nextUrl.pathname === '/api/scrape-threads' && request.method === 'POST') {
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Optimized security checks
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.url;

  // Check for blocked user agents first (most critical)
  if (blockedUserAgents.some(pattern => pattern.test(userAgent))) {
    console.error('[SECURITY] Blocked request from security scanner:', {
      userAgent,
      ip: (request as unknown as { ip?: string }).ip || 'unknown',
      url: request.url
    });

    return new NextResponse('Forbidden', { status: 403 });
  }

  // Check for suspicious patterns (less critical, log only)
  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(url) || pattern.test(userAgent)
  );

  if (isSuspicious) {
    console.warn('[SECURITY] Suspicious request detected:', {
      url: request.url,
      userAgent,
      ip: (request as unknown as { ip?: string }).ip || 'unknown',
      method: request.method,
      timestamp: new Date().toISOString()
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};