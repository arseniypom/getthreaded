import { z } from 'zod';

// Allowed domains for Threads scraping
const ALLOWED_DOMAINS = [
  'threads.net',
  'www.threads.net'
];

// Private IP ranges to block (SSRF prevention)
const PRIVATE_IP_RANGES = [
  /^127\./,           // localhost
  /^10\./,            // Private class A
  /^192\.168\./,      // Private class C
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private class B
  /^169\.254\./,      // Link-local
  /^::1$/,            // IPv6 localhost
  /^fc00:/,           // IPv6 private
  /^fe80:/            // IPv6 link-local
];

// Schema for validating handle input
export const handleSchema = z.string()
  .min(1, 'Handle cannot be empty')
  .max(100, 'Handle too long')
  .refine((handle) => {
    // Basic sanitization - no control characters
    return !/[\x00-\x1f\x7f]/.test(handle);
  }, 'Invalid characters in handle');

/**
 * Validates and normalizes a Threads handle or URL
 * Prevents SSRF attacks and ensures only Threads.net access
 */
export function validateAndNormalizeHandle(rawHandle: string): string {
  // Validate input schema
  const validatedInput = handleSchema.parse(rawHandle.trim());

  // If it looks like a URL, validate it strictly
  if (validatedInput.startsWith('http://') || validatedInput.startsWith('https://')) {
    return validateThreadsUrl(validatedInput);
  }

  // If it's a handle, normalize it
  return normalizeHandle(validatedInput);
}

/**
 * Validates that a URL is a legitimate Threads.net URL
 */
function validateThreadsUrl(url: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Check if domain is allowed
  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname.toLowerCase())) {
    throw new Error('Only Threads.net URLs are allowed');
  }

  // Prevent IP address URLs (SSRF protection)
  if (isIpAddress(parsedUrl.hostname)) {
    throw new Error('IP addresses are not allowed');
  }

  // Extract username from path
  const pathMatch = parsedUrl.pathname.match(/^\/@([a-zA-Z0-9_\.]+)/);
  if (!pathMatch) {
    throw new Error('Invalid Threads URL format');
  }

  return pathMatch[1]; // Return just the username
}

/**
 * Normalizes a handle (removes @ prefix, validates format)
 */
function normalizeHandle(handle: string): string {
  // Remove @ prefix if present
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

  // Validate handle format - only alphanumeric, underscore, and dot
  if (!/^[a-zA-Z0-9_\.]{1,30}$/.test(cleanHandle)) {
    throw new Error('Invalid handle format. Only letters, numbers, underscore, and dots are allowed');
  }

  // Additional security checks
  if (cleanHandle.includes('..')) {
    throw new Error('Invalid handle format');
  }

  return cleanHandle;
}

/**
 * Checks if a hostname is an IP address
 */
function isIpAddress(hostname: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;

  // IPv6 pattern (basic)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
    return true;
  }

  return false;
}

/**
 * Additional security check for private/internal IPs
 */
export function isPrivateOrLocalIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some(pattern => pattern.test(ip));
}

/**
 * Validates the final constructed URL before browser navigation
 */
export function validateFinalUrl(url: string): void {
  const parsedUrl = new URL(url);

  // Double-check domain is still allowed
  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname.toLowerCase())) {
    throw new Error('Unauthorized domain access attempted');
  }

  // Ensure it's HTTPS for security
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed');
  }
}

/**
 * Schema for validating API request body
 */
export const scrapeRequestSchema = z.object({
  handle: handleSchema,
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(30)
});