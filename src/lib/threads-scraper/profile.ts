import { Page } from 'playwright';
import { walk, cleanText } from './utils';
import { config } from './config';
import { ThreadsProfile } from './types';

interface UserCandidate {
  score: number;
  obj: Record<string, unknown>;
}

/**
 * Heuristic: pick the richest user-like object from hydration JSON
 */
function pickUser(jsonBlobs: string[]): Record<string, unknown> | null {
  const candidates: UserCandidate[] = [];

  for (const blob of jsonBlobs) {
    let data: unknown;
    try {
      data = JSON.parse(blob);
    } catch {
      continue;
    }

    for (const obj of walk(data)) {
      if (obj && typeof obj === 'object') {
        const objTyped = obj as Record<string, unknown>;
        if (
          typeof objTyped.username === 'string' &&
          (typeof objTyped.follower_count === 'number' || 'biography' in objTyped)
        ) {
          const score =
            (objTyped.username ? 2 : 0) +
            (objTyped.full_name ? 1 : 0) +
            (objTyped.biography ? 1 : 0) +
            (typeof objTyped.follower_count === 'number' ? 1 : 0) +
            (objTyped.hd_profile_pic_versions ? 1 : 0) +
            (objTyped.thread_count ? 1 : 0) +
            (objTyped.following_count ? 1 : 0);
          candidates.push({ score, obj: objTyped });
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.obj || null;
}

/**
 * Normalize user data to consistent format
 */
function normalizeUser(u: Record<string, unknown>): ThreadsProfile | null {
  if (!u) return null;

  const pics = Array.isArray(u.hd_profile_pic_versions)
    ? u.hd_profile_pic_versions as Record<string, unknown>[]
    : [];
  const lastPic = pics.length && pics[pics.length - 1] && typeof pics[pics.length - 1] === 'object'
    ? (pics[pics.length - 1] as Record<string, unknown>).url as string
    : (u.profile_pic_url as string || null);

  const bioLinks = Array.isArray(u.bio_links) ? u.bio_links : [];
  const links = bioLinks
    .map((x: unknown) => x && typeof x === 'object' && 'url' in x ? (x as Record<string, unknown>).url : null)
    .filter((url): url is string => typeof url === 'string');

  return {
    username: u.username as string,
    full_name: cleanText(u.full_name as string),
    follower_count: typeof u.follower_count === 'number' ? u.follower_count : null,
    following_count: typeof u.following_count === 'number' ? u.following_count : null,
    post_count: typeof u.thread_count === 'number' ? u.thread_count : null,
    is_verified: !!u.is_verified,
    biography: cleanText(u.biography as string),
    profile_pic_url: lastPic,
    external_url: links.length > 0 ? links[0] : null
  };
}

/**
 * Scrape profile data from page
 */
export async function scrapeProfile(page: Page): Promise<ThreadsProfile> {
  // Wait for hydration data (these scripts are hidden, so we check for existence, not visibility)
  await page.waitForSelector(
    config.threads.selectors.hydrationScript,
    {
      timeout: config.scraping.waitForSelector,
      state: 'attached' // Check for existence in DOM, not visibility
    }
  );

  // Grab all hidden JSON scripts
  const blobs = await page.$$eval(
    config.threads.selectors.hydrationScript,
    nodes => nodes.map(n => n.textContent || '')
  );

  const user = pickUser(blobs);
  if (!user) {
    throw new Error('Could not locate profile data in hydration JSON');
  }

  const normalized = normalizeUser(user);
  if (!normalized) {
    throw new Error('Failed to normalize profile data');
  }

  return normalized;
}

export { pickUser, normalizeUser };