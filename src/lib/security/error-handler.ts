import { NextResponse } from 'next/server';

// Security-focused error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  RESOURCE = 'resource',
  NETWORK = 'network',
  FORBIDDEN = 'forbidden',
  SYSTEM = 'system'
}

interface ErrorDetails {
  category: ErrorCategory;
  userMessage: string;
  logMessage: string;
  statusCode: number;
  shouldLog: boolean;
}

/**
 * Analyzes errors and returns appropriate user-safe responses
 */
export function categorizeError(error: unknown): ErrorDetails {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // URL/Handle validation errors
  if (lowerMessage.includes('invalid url') ||
      lowerMessage.includes('invalid handle') ||
      lowerMessage.includes('only threads.net') ||
      lowerMessage.includes('invalid characters')) {
    return {
      category: ErrorCategory.VALIDATION,
      userMessage: 'Invalid profile URL or handle. Please check the format.',
      logMessage: `Validation error: ${errorMessage}`,
      statusCode: 400,
      shouldLog: false // Don't log user input errors
    };
  }

  // Rate limiting errors
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return {
      category: ErrorCategory.RATE_LIMIT,
      userMessage: 'Too many requests. Please wait before trying again.',
      logMessage: `Rate limit hit: ${errorMessage}`,
      statusCode: 429,
      shouldLog: true
    };
  }

  // Resource/timeout errors
  if (lowerMessage.includes('timeout') ||
      lowerMessage.includes('operation timeout') ||
      lowerMessage.includes('concurrent')) {
    return {
      category: ErrorCategory.RESOURCE,
      userMessage: 'Service temporarily unavailable. Please try again later.',
      logMessage: `Resource error: ${errorMessage}`,
      statusCode: 503,
      shouldLog: true
    };
  }

  // Network/scraping specific errors
  if (lowerMessage.includes('not found') || lowerMessage.includes('page not found')) {
    return {
      category: ErrorCategory.NETWORK,
      userMessage: 'Profile not found. Please check the username.',
      logMessage: `Profile not found: ${errorMessage}`,
      statusCode: 404,
      shouldLog: false
    };
  }

  if (lowerMessage.includes('private') || lowerMessage.includes('access denied')) {
    return {
      category: ErrorCategory.FORBIDDEN,
      userMessage: 'This profile is private or inaccessible.',
      logMessage: `Access denied: ${errorMessage}`,
      statusCode: 403,
      shouldLog: false
    };
  }

  if (lowerMessage.includes('blocked') || lowerMessage.includes('forbidden')) {
    return {
      category: ErrorCategory.FORBIDDEN,
      userMessage: 'Access to this resource is not allowed.',
      logMessage: `Blocked access: ${errorMessage}`,
      statusCode: 403,
      shouldLog: true
    };
  }

  // Network errors
  if (lowerMessage.includes('network') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('fetch')) {
    return {
      category: ErrorCategory.NETWORK,
      userMessage: 'Network error. Please check your connection and try again.',
      logMessage: `Network error: ${errorMessage}`,
      statusCode: 502,
      shouldLog: true
    };
  }

  // Default system error (sanitized)
  return {
    category: ErrorCategory.SYSTEM,
    userMessage: 'An unexpected error occurred. Please try again later.',
    logMessage: `System error: ${errorMessage}`,
    statusCode: 500,
    shouldLog: true
  };
}

/**
 * Creates a safe error response with proper logging
 */
export function createErrorResponse(error: unknown, requestId?: string): NextResponse {
  const errorDetails = categorizeError(error);
  const timestamp = new Date().toISOString();

  // Log error if needed (server-side only, detailed)
  if (errorDetails.shouldLog) {
    console.error(`[${timestamp}] ${errorDetails.category.toUpperCase()}:`, {
      requestId,
      message: errorDetails.logMessage,
      category: errorDetails.category,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp
    });
  }

  // Return sanitized response to user
  const responseBody: Record<string, unknown> = {
    error: errorDetails.userMessage,
    category: errorDetails.category,
    timestamp,
    ...(requestId && { requestId })
  };

  // Add retry information for certain error types
  if (errorDetails.category === ErrorCategory.RATE_LIMIT) {
    responseBody.retryAfter = 60; // seconds
  }

  if (errorDetails.category === ErrorCategory.RESOURCE) {
    responseBody.retryAfter = 30; // seconds
  }

  return NextResponse.json(responseBody, {
    status: errorDetails.statusCode,
    headers: {
      'Content-Type': 'application/json',
      // Security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      ...(errorDetails.category === ErrorCategory.RATE_LIMIT && {
        'Retry-After': '60'
      })
    }
  });
}

/**
 * Middleware for handling uncaught errors
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T,
  requestId?: string
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error, requestId);
    }
  }) as T;
}

/**
 * Sanitizes error messages for client consumption
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove file paths
  message = message.replace(/\/[^\s]+\.(js|ts|jsx|tsx)/g, '[file]');

  // Remove stack trace information
  message = message.replace(/\s+at\s+.*/g, '');

  // Remove internal error codes
  message = message.replace(/Error:\s*/g, '');

  // Truncate very long messages
  if (message.length > 200) {
    message = message.substring(0, 197) + '...';
  }

  return message.trim();
}

/**
 * Logs security events
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    type: 'security'
  };

  console.warn(`[SECURITY][${severity.toUpperCase()}] ${event}:`, logEntry);

  // In production, you might want to send this to a security monitoring service
  // e.g., DataDog, Splunk, or a custom security dashboard
}

/**
 * Validates that response doesn't leak sensitive information
 */
export function validateResponse(response: unknown): void {
  const responseStr = JSON.stringify(response);

  // Check for potential information leakage
  const sensitivePatterns = [
    /\/Users\/[^\/\s]+/g,     // File paths
    /\/home\/[^\/\s]+/g,      // Linux paths
    /C:\\[^\\s]+/g,           // Windows paths
    /password|secret|key|token/gi, // Credentials
    /localhost:\d+/g,         // Local addresses
    /127\.0\.0\.1/g,          // Localhost IP
    /192\.168\./g,            // Private IPs
  ];

  for (const pattern of sensitivePatterns) {
    if (pattern.test(responseStr)) {
      console.error('[SECURITY] Response contains potentially sensitive information:', {
        pattern: pattern.source,
        response: responseStr.substring(0, 200)
      });
    }
  }
}