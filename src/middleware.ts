import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/security/rate-limiter';

export async function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Apply security headers to all responses
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval/inline
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests"
    ].join('; '),

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Content Type Options
    'X-Content-Type-Options': 'nosniff',

    // Frame Options
    'X-Frame-Options': 'DENY',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()'
    ].join(', '),

    // Cross-Origin Policies
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',

    // Remove server information
    'Server': 'Web Server',

    // Cache control for sensitive routes
    ...(request.nextUrl.pathname.startsWith('/api/') && {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })
  };

  // Apply headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Special handling for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Rate limiting for API routes
    if (request.nextUrl.pathname === '/api/scrape-threads' && request.method === 'POST') {
      const rateLimitResponse = await rateLimitMiddleware(request);
      if (rateLimitResponse) {
        // Apply security headers to rate limit response as well
        Object.entries(securityHeaders).forEach(([key, value]) => {
          rateLimitResponse.headers.set(key, value);
        });
        return rateLimitResponse;
      }
    }

    // Additional API security headers
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
    response.headers.set('X-API-Version', '1.0');
  }

  // Security logging for suspicious requests
  const suspiciousPatterns = [
    /\.\./,                    // Path traversal
    /<script/i,                // XSS attempts
    /union.*select/i,          // SQL injection
    /javascript:/i,            // JavaScript protocol
    /vbscript:/i,              // VBScript protocol
    /data:text\/html/i,        // Data URI HTML
    /on\w+\s*=/i,             // Event handlers
  ];

  const userAgent = request.headers.get('user-agent') || '';
  const url = request.url;
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

    // You might want to block these requests or add additional monitoring
    // For now, we'll just log them
  }

  // Block requests with suspicious user agents
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

  if (blockedUserAgents.some(pattern => pattern.test(userAgent))) {
    console.error('[SECURITY] Blocked request from security scanner:', {
      userAgent,
      ip: (request as unknown as { ip?: string }).ip || 'unknown',
      url: request.url
    });

    return new NextResponse('Forbidden', {
      status: 403,
      headers: securityHeaders
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