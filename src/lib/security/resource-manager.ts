import pLimit from 'p-limit';

// Configuration
const MAX_CONCURRENT_SCRAPERS = 3;
const SCRAPER_TIMEOUT_MS = 30 * 1000; // 30 seconds
const MAX_MEMORY_USAGE_MB = 500; // Per scraper instance

// Global concurrency limiter
const scraperLimit = pLimit(MAX_CONCURRENT_SCRAPERS);

// Track active scrapers for monitoring
const activeScraper = new Set<string>();
const scraperStats = {
  totalStarted: 0,
  totalCompleted: 0,
  totalFailed: 0,
  totalTimedOut: 0,
  currentActive: 0,
};

/**
 * Executes a scraping operation with resource controls
 */
export async function withResourceControl<T>(
  operation: () => Promise<T>,
  operationId?: string
): Promise<T> {
  const id = operationId || generateOperationId();

  return scraperLimit(async () => {
    // Track operation start
    activeScraper.add(id);
    scraperStats.totalStarted++;
    scraperStats.currentActive = activeScraper.size;

    console.log(`[ResourceManager] Starting operation ${id}, active: ${scraperStats.currentActive}`);

    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timeout after ${SCRAPER_TIMEOUT_MS}ms`));
        }, SCRAPER_TIMEOUT_MS);
      });

      // Race between operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      scraperStats.totalCompleted++;
      console.log(`[ResourceManager] Completed operation ${id}`);

      return result;

    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        scraperStats.totalTimedOut++;
        console.error(`[ResourceManager] Operation ${id} timed out`);
      } else {
        scraperStats.totalFailed++;
        console.error(`[ResourceManager] Operation ${id} failed:`, error);
      }
      throw error;

    } finally {
      // Clean up tracking
      activeScraper.delete(id);
      scraperStats.currentActive = activeScraper.size;

      console.log(`[ResourceManager] Cleaned up operation ${id}, active: ${scraperStats.currentActive}`);
    }
  });
}

/**
 * Wraps a scraper instance with resource monitoring and cleanup
 */
export async function withScraperCleanup<T>(
  scraperFactory: () => Promise<{ scraper: { close: () => Promise<void> }; operation: () => Promise<T> }>
): Promise<T> {
  let scraper: { close: () => Promise<void> } | null = null;

  try {
    const { scraper: scraperInstance, operation } = await scraperFactory();
    scraper = scraperInstance;

    // Monitor memory usage (basic check)
    const memoryCheck = setInterval(() => {
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > MAX_MEMORY_USAGE_MB * 1024 * 1024) {
        console.warn(`[ResourceManager] High memory usage detected: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
      }
    }, 5000);

    try {
      const result = await operation();
      clearInterval(memoryCheck);
      return result;
    } catch (error) {
      clearInterval(memoryCheck);
      throw error;
    }

  } finally {
    // Ensure scraper cleanup
    if (scraper) {
      try {
        await scraper.close();
        console.log('[ResourceManager] Scraper closed successfully');
      } catch (closeError) {
        console.error('[ResourceManager] Error closing scraper:', closeError);
      }
    }
  }
}

/**
 * Health check for resource manager
 */
export function getResourceHealth(): {
  healthy: boolean;
  stats: typeof scraperStats;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if too many operations are running
  if (scraperStats.currentActive >= MAX_CONCURRENT_SCRAPERS) {
    issues.push('Maximum concurrent scrapers reached');
  }

  // Check error rate
  const totalOperations = scraperStats.totalCompleted + scraperStats.totalFailed;
  if (totalOperations > 10) {
    const errorRate = scraperStats.totalFailed / totalOperations;
    if (errorRate > 0.5) {
      issues.push(`High error rate: ${Math.round(errorRate * 100)}%`);
    }
  }

  // Check timeout rate
  if (totalOperations > 5) {
    const timeoutRate = scraperStats.totalTimedOut / totalOperations;
    if (timeoutRate > 0.3) {
      issues.push(`High timeout rate: ${Math.round(timeoutRate * 100)}%`);
    }
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed > 1000 * 1024 * 1024) { // 1GB
    issues.push(`High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }

  return {
    healthy: issues.length === 0,
    stats: { ...scraperStats },
    issues
  };
}

/**
 * Circuit breaker for when system is under stress
 */
export function shouldAllowNewOperation(): boolean {
  const health = getResourceHealth();

  // Block new operations if system is unhealthy
  if (!health.healthy) {
    console.warn('[ResourceManager] Blocking new operations due to system stress:', health.issues);
    return false;
  }

  // Block if at capacity
  if (scraperStats.currentActive >= MAX_CONCURRENT_SCRAPERS) {
    return false;
  }

  return true;
}

/**
 * Force cleanup of all active operations (emergency function)
 */
export function emergencyCleanup(): void {
  console.warn('[ResourceManager] Emergency cleanup triggered');
  activeScraper.clear();
  scraperStats.currentActive = 0;

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
}

/**
 * Reset statistics (for testing or admin purposes)
 */
export function resetStats(): void {
  scraperStats.totalStarted = 0;
  scraperStats.totalCompleted = 0;
  scraperStats.totalFailed = 0;
  scraperStats.totalTimedOut = 0;
  scraperStats.currentActive = activeScraper.size;
}

/**
 * Generate unique operation ID
 */
function generateOperationId(): string {
  return `scraper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current configuration
 */
export function getResourceConfig() {
  return {
    maxConcurrent: MAX_CONCURRENT_SCRAPERS,
    timeoutMs: SCRAPER_TIMEOUT_MS,
    maxMemoryMb: MAX_MEMORY_USAGE_MB,
  };
}