import { chromium, Browser, BrowserContext, Page } from 'playwright';
import NodeCache from 'node-cache';
import { config } from './config';
import { handleFromUrl, getRandomUserAgent, randomDelay, retry } from './utils';
import { scrapeProfile } from './profile';
import { scrapePosts } from './posts';
import { ThreadsProfile, ThreadsPost, ScraperOptions, PostOptions, ProfileWithPosts } from './types';

// Initialize cache
const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkperiod
});

export class ThreadsScraper {
  private options: Required<ScraperOptions>;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor(options: ScraperOptions = {}) {
    this.options = {
      headless: options.headless ?? config.browser.headless,
      cacheEnabled: options.cacheEnabled ?? true,
    };
  }

  /**
   * Initialize browser instance
   */
  async init(): Promise<void> {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    this.context = await this.browser.newContext({
      viewport: config.browser.viewport,
      userAgent: getRandomUserAgent(),
      locale: config.browser.locale,
      permissions: [],
      offline: false,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      colorScheme: 'light'
    });

    // Additional anti-detection measures
    await this.context.addInitScript(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: PermissionDescriptor) => {
        if (parameters.name === 'notifications') {
          return Promise.resolve({
            state: Notification.permission,
            name: 'notifications',
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false
          } as PermissionStatus);
        }
        return originalQuery.call(window.navigator.permissions, parameters);
      };

      // Add chrome object
      const windowWithChrome = window as unknown as { chrome?: unknown };
      if (!windowWithChrome.chrome) {
        windowWithChrome.chrome = {
          runtime: {},
        };
      }

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });
    });
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    this.context = null;
    this.browser = null;
  }

  /**
   * Navigate to a Threads profile URL
   */
  private async navigateToProfile(handle: string): Promise<Page> {
    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    const username = handleFromUrl(handle);
    const url = `${config.threads.baseUrl}/@${username}`;
    const page = await this.context.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: config.browser.timeout
      });

      // Check if profile exists
      const title = await page.title();
      if (title.includes('Page not found') || title.includes('Sorry')) {
        throw new Error(`Profile @${username} not found`);
      }

      return page;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  /**
   * Get profile information
   */
  async getProfile(handle: string): Promise<ThreadsProfile> {
    const username = handleFromUrl(handle);
    const cacheKey = `profile:${username}`;

    // Check cache
    if (this.options.cacheEnabled) {
      const cached = cache.get<ThreadsProfile>(cacheKey);
      if (cached) {
        console.log(`Using cached profile for @${username}`);
        return cached;
      }
    }

    // Initialize browser if needed
    await this.init();

    // Add rate limiting
    await randomDelay();

    // Scrape profile with retry
    const profile = await retry(async () => {
      const page = await this.navigateToProfile(username);
      try {
        const data = await scrapeProfile(page);
        return data;
      } finally {
        await page.close();
      }
    });

    // Cache result
    if (this.options.cacheEnabled && profile) {
      cache.set(cacheKey, profile);
    }

    return profile;
  }

  /**
   * Get user posts
   */
  async getPosts(handle: string, options: PostOptions = {}): Promise<ThreadsPost[]> {
    const username = handleFromUrl(handle);
    const limit = options.limit ?? config.scraping.defaultPostLimit;
    const cacheKey = `posts:${username}:${limit}`;

    // Check cache
    if (this.options.cacheEnabled && !options.noCache) {
      const cached = cache.get<ThreadsPost[]>(cacheKey);
      if (cached) {
        console.log(`Using cached posts for @${username}`);
        return cached;
      }
    }

    // Initialize browser if needed
    await this.init();

    // Add rate limiting
    await randomDelay();

    // Scrape posts with retry
    const posts = await retry(async () => {
      const page = await this.navigateToProfile(username);
      try {
        const data = await scrapePosts(page, limit);
        return data;
      } finally {
        await page.close();
      }
    });

    // Cache result
    if (this.options.cacheEnabled && posts) {
      cache.set(cacheKey, posts);
    }

    return posts;
  }

  /**
   * Get both profile and posts in one go
   */
  async getProfileWithPosts(handle: string, options: PostOptions = {}): Promise<ProfileWithPosts> {
    const username = handleFromUrl(handle);
    const limit = options.limit ?? config.scraping.defaultPostLimit;

    // Initialize browser if needed
    await this.init();

    // Add rate limiting
    await randomDelay();

    // Scrape both in one page load
    const result = await retry(async () => {
      const page = await this.navigateToProfile(username);
      try {
        const [profile, posts] = await Promise.all([
          scrapeProfile(page),
          scrapePosts(page, limit)
        ]);

        return { profile, posts };
      } finally {
        await page.close();
      }
    });

    return result;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    cache.flushAll();
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      keys: cache.keys(),
      stats: cache.getStats()
    };
  }
}