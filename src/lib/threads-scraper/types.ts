export interface ThreadsProfile {
  username: string;
  full_name: string | null;
  follower_count: number | null;
  following_count: number | null;
  post_count: number | null;
  is_verified: boolean;
  biography: string | null;
  profile_pic_url: string | null;
  external_url: string | null;
}

export interface ThreadsPost {
  id: string;
  code: string | null;
  text: string | null;
  timestamp: string | null;
  like_count: number | null;
  reply_count: number | null;
  repost_count: number | null;
  quote_count: number | null;
  media: ThreadsMedia[] | null;
  is_reply: boolean;
  reply_to: string | null;
  has_audio: boolean;
  url: string | null;
}

export interface ThreadsMedia {
  type: 'image' | 'video';
  url: string;
  width: number;
  height: number;
}

export interface ScraperOptions {
  headless?: boolean;
  cacheEnabled?: boolean;
}

export interface PostOptions {
  limit?: number;
  noCache?: boolean;
}

export interface ProfileWithPosts {
  profile: ThreadsProfile;
  posts: ThreadsPost[];
}