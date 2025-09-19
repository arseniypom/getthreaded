export const config = {
  // Browser configuration
  browser: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
    ],
    locale: 'en-US',
    timeout: 45000,
  },

  // Rate limiting
  rateLimit: {
    minDelay: 1000,  // Minimum 1 second between requests
    maxDelay: 3000,  // Maximum 3 seconds
    jitterPercent: 20 // Add 20% random jitter
  },

  // Cache configuration
  cache: {
    ttl: 300, // Cache for 5 minutes (in seconds)
    checkperiod: 120 // Check for expired cache every 2 minutes
  },

  // Scraping limits
  scraping: {
    maxRetries: 3,
    defaultPostLimit: 30,
    maxPostLimit: 100,
    scrollTimeout: 3000,
    waitForSelector: 15000
  },

  // Threads specific
  threads: {
    baseUrl: 'https://www.threads.net',
    selectors: {
      hydrationScript: 'script[type="application/json"][data-sjs]',
      postContainer: '[data-e2e="post-item"]',
      loadMoreButton: '[aria-label*="Load more"]',
      postContent: '[data-e2e="post-text"]'
    }
  }
};