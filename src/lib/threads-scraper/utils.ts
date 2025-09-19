import { config } from './config';

/**
 * Sleep for a random amount of time with jitter
 */
export async function randomDelay(): Promise<number> {
  const { minDelay, maxDelay, jitterPercent } = config.rateLimit;
  const baseDelay = Math.random() * (maxDelay - minDelay) + minDelay;
  const jitter = baseDelay * (jitterPercent / 100) * (Math.random() - 0.5) * 2;
  const finalDelay = Math.round(baseDelay + jitter);

  await new Promise(resolve => setTimeout(resolve, finalDelay));
  return finalDelay;
}

/**
 * Get a random user agent
 */
export function getRandomUserAgent(): string {
  const agents = config.browser.userAgents;
  return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Extract @username from any Threads URL
 */
export function handleFromUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const segs = u.pathname.split('/').filter(Boolean);
    const at = segs.find(s => s.startsWith('@'));
    if (!at) throw new Error('No Threads handle in URL');
    return at.slice(1);
  } catch {
    // If it's not a URL, assume it's already a handle
    if (raw.startsWith('@')) return raw.slice(1);
    return raw;
  }
}

/**
 * Depth-first walk to find objects in nested JSON
 */
export function* walk(o: unknown): Generator<unknown, void, unknown> {
  if (o && typeof o === 'object') {
    yield o;
    for (const v of Array.isArray(o) ? o : Object.values(o)) {
      yield* walk(v);
    }
  }
}

/**
 * Extract post ID from URL or string
 */
export function extractPostId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/post\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number | null): string | null {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return date.toISOString();
}

/**
 * Clean and normalize text content
 */
export function cleanText(text: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .trim();
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = config.scraping.maxRetries
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1} failed:`, error instanceof Error ? error.message : error);
      if (i < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError!;
}