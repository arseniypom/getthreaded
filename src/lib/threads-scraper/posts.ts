import { Page } from 'playwright';
import { walk, extractPostId, formatTimestamp, cleanText, randomDelay } from './utils';
import { config } from './config';
import { ThreadsPost, ThreadsMedia } from './types';

/**
 * Extract posts from hydration data
 */
function extractPostsFromHydration(jsonBlobs: string[]): ThreadsPost[] {
  const posts: ThreadsPost[] = [];
  const seenIds = new Set<string>();

  for (const blob of jsonBlobs) {
    let data: unknown;
    try {
      data = JSON.parse(blob);
    } catch {
      continue;
    }

    // Look for post objects in the hydration data
    for (const obj of walk(data)) {
      if (obj && typeof obj === 'object') {
        const objTyped = obj as Record<string, unknown>;

        // Check if this looks like a threads data container
        if (objTyped.data &&
            typeof objTyped.data === 'object' &&
            objTyped.data !== null &&
            'data' in objTyped.data &&
            typeof (objTyped.data as Record<string, unknown>).data === 'object' &&
            (objTyped.data as Record<string, unknown>).data !== null &&
            'edges' in ((objTyped.data as Record<string, unknown>).data as Record<string, unknown>)) {

          const edges = ((objTyped.data as Record<string, unknown>).data as Record<string, unknown>).edges;
          if (Array.isArray(edges)) {
            for (const edge of edges) {
              if (edge && typeof edge === 'object' && 'node' in edge) {
                const node = (edge as Record<string, unknown>).node;
                if (node && typeof node === 'object' && 'thread_items' in node) {
                  const threadItems = (node as Record<string, unknown>).thread_items;
                  if (Array.isArray(threadItems) && threadItems[0] &&
                      typeof threadItems[0] === 'object' && 'post' in threadItems[0]) {
                    const postData = (threadItems[0] as Record<string, unknown>).post;
                    if (postData && typeof postData === 'object') {
                      const post = normalizePost(postData as Record<string, unknown>);
                      if (post && !seenIds.has(post.id)) {
                        seenIds.add(post.id);
                        posts.push(post);
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Also check for individual post objects
        if ('code' in objTyped && 'caption' in objTyped &&
            ('taken_at' in objTyped || 'created_at' in objTyped)) {
          const post = normalizePost(objTyped);
          if (post && !seenIds.has(post.id)) {
            seenIds.add(post.id);
            posts.push(post);
          }
        }
      }
    }
  }

  return posts;
}

/**
 * Normalize a single post object
 */
function normalizePost(p: Record<string, unknown>): ThreadsPost | null {
  if (!p) return null;

  // Extract media
  const media: ThreadsMedia[] = [];

  if (p.image_versions2 && typeof p.image_versions2 === 'object' &&
      'candidates' in p.image_versions2 && Array.isArray((p.image_versions2 as Record<string, unknown>).candidates)) {
    const candidates = (p.image_versions2 as Record<string, unknown>).candidates as unknown[];
    if (candidates[0] && typeof candidates[0] === 'object') {
      const firstCandidate = candidates[0] as Record<string, unknown>;
      media.push({
        type: 'image',
        url: firstCandidate.url as string,
        width: firstCandidate.width as number,
        height: firstCandidate.height as number
      });
    }
  }

  if (p.video_versions && Array.isArray(p.video_versions) && p.video_versions[0] &&
      typeof p.video_versions[0] === 'object') {
    const firstVideo = p.video_versions[0] as Record<string, unknown>;
    media.push({
      type: 'video',
      url: firstVideo.url as string,
      width: firstVideo.width as number,
      height: firstVideo.height as number
    });
  }

  if (p.carousel_media && Array.isArray(p.carousel_media)) {
    for (const item of p.carousel_media) {
      if (item && typeof item === 'object' && 'image_versions2' in item &&
          typeof (item as Record<string, unknown>).image_versions2 === 'object' &&
          (item as Record<string, unknown>).image_versions2 !== null &&
          'candidates' in ((item as Record<string, unknown>).image_versions2 as Record<string, unknown>)) {
        const candidates = ((item as Record<string, unknown>).image_versions2 as Record<string, unknown>).candidates;
        if (Array.isArray(candidates) && candidates[0] && typeof candidates[0] === 'object') {
          const firstCandidate = candidates[0] as Record<string, unknown>;
          media.push({
            type: 'image',
            url: firstCandidate.url as string,
            width: firstCandidate.width as number,
            height: firstCandidate.height as number
          });
        }
      }
    }
  }

  // Helper function to safely access nested properties
  const getNestedProperty = (obj: Record<string, unknown>, path: string[]): unknown => {
    let current = obj;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key] as Record<string, unknown>;
      } else {
        return null;
      }
    }
    return current;
  };

  const captionText = getNestedProperty(p, ['caption', 'text']) as string | null;
  const textPostAppInfo = p.text_post_app_info as Record<string, unknown> | null;
  const replyToAuthor = textPostAppInfo && getNestedProperty(textPostAppInfo, ['reply_to_author']) as Record<string, unknown> | null;
  const user = p.user as Record<string, unknown> | null;

  return {
    id: (p.id || p.pk || p.code || null) as string,
    code: (p.code || extractPostId(p.id as string) || null) as string | null,
    text: cleanText(captionText || (p.text as string) || ''),
    timestamp: formatTimestamp((p.taken_at || p.created_at || p.device_timestamp) as number),
    like_count: (p.like_count ?? textPostAppInfo?.direct_reply_count ?? null) as number | null,
    reply_count: (textPostAppInfo?.reply_count ?? null) as number | null,
    repost_count: (textPostAppInfo?.repost_count ?? p.reshare_count ?? null) as number | null,
    quote_count: (textPostAppInfo?.quote_count ?? null) as number | null,
    media: media.length > 0 ? media : null,
    is_reply: !!(textPostAppInfo && 'reply_to_author' in textPostAppInfo),
    reply_to: (replyToAuthor?.username ?? null) as string | null,
    has_audio: !!p.has_audio,
    url: p.code && user?.username ? `https://www.threads.net/@${user.username}/post/${p.code}` : null
  };
}

/**
 * Scrape posts by scrolling and loading more
 */
export async function scrapePosts(page: Page, limit: number = config.scraping.defaultPostLimit): Promise<ThreadsPost[]> {
  const actualLimit = Math.min(limit, config.scraping.maxPostLimit);
  const posts: ThreadsPost[] = [];
  const seenIds = new Set<string>();
  let noNewPostsCount = 0;
  const maxNoNewPosts = 3;

  console.log(`Scraping up to ${actualLimit} posts...`);

  // Initial load - get posts from hydration data
  const initialBlobs = await page.$$eval(
    config.threads.selectors.hydrationScript,
    nodes => nodes.map(n => n.textContent || '')
  );

  const initialPosts = extractPostsFromHydration(initialBlobs);
  for (const post of initialPosts) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      posts.push(post);
    }
  }

  console.log(`Found ${posts.length} posts from initial load`);

  // Try to scroll and load more posts
  while (posts.length < actualLimit && noNewPostsCount < maxNoNewPosts) {
    const previousCount = posts.length;

    // Scroll down
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await randomDelay();

    // Check for "Load more" button
    try {
      const loadMoreButton = await page.$('[aria-label*="Load more"]');
      if (loadMoreButton) {
        await loadMoreButton.click();
        await randomDelay();
      }
    } catch {
      // No load more button, continue
    }

    // Try to extract more posts from any dynamically loaded content
    try {
      // Look for post containers in the DOM
      const domPosts = await page.$$eval('[data-pressable-container="true"]', elements => {
        return elements.map(el => {
          const textEl = el.querySelector('[dir="auto"] span');
          const linkEl = el.querySelector('a[href*="/post/"]') as HTMLAnchorElement;
          const timeEl = el.querySelector('time');

          if (!linkEl) return null;

          const postId = linkEl.href.match(/\/post\/([A-Za-z0-9_-]+)/)?.[1];
          if (!postId) return null;

          return {
            id: postId,
            code: postId,
            text: textEl?.textContent || '',
            url: linkEl.href,
            timestamp: timeEl?.getAttribute('datetime') || null
          };
        }).filter(Boolean);
      });

      for (const post of domPosts) {
        if (post && !seenIds.has(post.id)) {
          seenIds.add(post.id);
          posts.push({
            ...post,
            like_count: null,
            reply_count: null,
            repost_count: null,
            quote_count: null,
            media: null,
            is_reply: false,
            reply_to: null,
            has_audio: false
          });
        }
      }
    } catch {
      // Continue if DOM extraction fails
    }

    // Check if we got new posts
    if (posts.length === previousCount) {
      noNewPostsCount++;
      console.log(`No new posts found (attempt ${noNewPostsCount}/${maxNoNewPosts})`);
    } else {
      noNewPostsCount = 0;
      console.log(`Found ${posts.length} posts so far...`);
    }

    // Small delay between scrolls
    await new Promise(resolve => setTimeout(resolve, config.scraping.scrollTimeout));
  }

  return posts.slice(0, actualLimit);
}

export { extractPostsFromHydration, normalizePost };