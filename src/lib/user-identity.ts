'use client';

const USER_ID_KEY = 'strategy_user_id';
const STRATEGY_ID_KEY = 'last_strategy_id';

/**
 * Get or create a unique user identifier for the current browser/device
 * This persists in localStorage across sessions
 */
export function getUserId(): string {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('getUserId can only be called on the client side');
  }

  try {
    // Try to get existing user ID from localStorage
    let userId = localStorage.getItem(USER_ID_KEY);

    if (!userId) {
      // Generate a new UUID if none exists
      userId = crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, userId);
    }

    return userId;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    // Fallback to a session-based ID if localStorage is unavailable
    // This will work in incognito mode but won't persist
    return sessionStorage.getItem(USER_ID_KEY) || generateAndStoreSessionId();
  }
}

/**
 * Generate and store a session-based ID as fallback
 */
function generateAndStoreSessionId(): string {
  const sessionId = crypto.randomUUID();
  try {
    sessionStorage.setItem(USER_ID_KEY, sessionId);
  } catch (error) {
    console.error('Error accessing sessionStorage:', error);
  }
  return sessionId;
}

/**
 * Save the last generated strategy ID for quick access
 */
export function saveStrategyId(strategyId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STRATEGY_ID_KEY, strategyId);
  } catch (error) {
    console.error('Error saving strategy ID:', error);
    // Try sessionStorage as fallback
    try {
      sessionStorage.setItem(STRATEGY_ID_KEY, strategyId);
    } catch (sessionError) {
      console.error('Error saving to sessionStorage:', sessionError);
    }
  }
}

/**
 * Get the last saved strategy ID if it exists
 */
export function getLastStrategyId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(STRATEGY_ID_KEY) || sessionStorage.getItem(STRATEGY_ID_KEY);
  } catch (error) {
    console.error('Error retrieving strategy ID:', error);
    return null;
  }
}

/**
 * Clear user data (useful for "Start Over" functionality)
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(STRATEGY_ID_KEY);
    sessionStorage.removeItem(USER_ID_KEY);
    sessionStorage.removeItem(STRATEGY_ID_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}

/**
 * Check if a user ID exists (without creating one)
 */
export function hasUserId(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return !!(localStorage.getItem(USER_ID_KEY) || sessionStorage.getItem(USER_ID_KEY));
  } catch (error) {
    console.error('Error checking user ID:', error);
    return false;
  }
}

/**
 * Get user ID without creating one if it doesn't exist
 */
export function getExistingUserId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(USER_ID_KEY) || sessionStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error getting existing user ID:', error);
    return null;
  }
}