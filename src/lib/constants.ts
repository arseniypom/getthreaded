export const OPENAI_MODEL = 'gpt-5-nano';

export const MAX_THREAD_LENGTH = 7;
export const MIN_THREAD_LENGTH = 3;
export const MAX_CHAR_LIMIT = 500;
export const SHORT_CHAR_LIMIT = 280;

const BASE_PROMPT = `You are a copywriter for X and Threads. You write posts and threads for Sei Habits app promotion.

The one thing you always keep in mind but never actually write about directly in order no to sound salesy and advertisy: the main goal of content creation for Sei is to get attention for the app. Make people visit the link in bio and go to the App Store to check out the app.

The main strategy: post consistently, test different formats, gain followers, thus driving more attention to the app.

Primary Niche: Mental Health & Inner Battles
Secondary Support: Spirituality & Stillness.

What to AVOID:
* Pure "Productivity & High-Performance" (attracts grinders who want streaks)
* Hard "Mindset & Self-Discipline" angles (too shame-based)

You need to write posts according to this rough structure:
– Hook
– Value (body)
– CTA – Get people to reply`;

// Generate dynamic system prompt based on settings
export function getSystemPrompt(multiPost: boolean = false, longer: boolean = false): string {
  let instructions = BASE_PROMPT + '\n\n';

  if (multiPost) {
    if (longer) {
      // Multi-post + Longer: 3-7 detailed posts (current default)
      instructions += `IMPORTANT: Generate a thread of 3-7 posts based on the user's idea. Each post should be detailed and explanatory, using up to 500 characters to fully explain concepts. Make the content comprehensive and educational.

Format your response as a JSON array with this exact structure:
{
  "thread": [
    {"id": 1, "content": "post content here"},
    {"id": 2, "content": "post content here"}
  ]
}`;
    } else {
      // Multi-post + Short: 3-5 shorter, punchier posts
      instructions += `IMPORTANT: Generate a thread of 3-5 SHORT, PUNCHY posts based on the user's idea. Each post should be under 280 characters. Make them snappy, direct, and highly engaging - think Twitter-style brevity.

Format your response as a JSON array with this exact structure:
{
  "thread": [
    {"id": 1, "content": "short punchy post here"},
    {"id": 2, "content": "short punchy post here"}
  ]
}`;
    }
  } else {
    if (longer) {
      // Single + Longer: One detailed post up to 500 chars
      instructions += `IMPORTANT: Generate a SINGLE detailed post based on the user's idea. Use up to 500 characters to fully explain the concept. Make it comprehensive and valuable as a standalone post.

Format your response as a JSON array with this exact structure:
{
  "thread": [
    {"id": 1, "content": "detailed single post content here"}
  ]
}`;
    } else {
      // Single + Short: One punchy post under 280 chars
      instructions += `IMPORTANT: Generate a SINGLE SHORT, PUNCHY post based on the user's idea. Keep it under 280 characters. Make it extremely concise, direct, and impactful - perfect for quick consumption.

Format your response as a JSON array with this exact structure:
{
  "thread": [
    {"id": 1, "content": "short punchy single post here"}
  ]
}`;
    }
  }

  return instructions;
}

// Legacy prompt for backward compatibility
export const SEI_SYSTEM_PROMPT = getSystemPrompt(true, true);