'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThreadsPostData } from '@/components/threads-data-table';

export interface ProfileHistoryEntry {
  handle: string;
  displayName: string;
  posts: ThreadsPostData[];
  timestamp: number;
  lastRefreshed: number;
}

const STORAGE_KEY = 'threads_profile_history';
const MAX_HISTORY_ENTRIES = 10;
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function useProfileHistory() {
  const [history, setHistory] = useState<ProfileHistoryEntry[]>([]);
  const [refreshTimers, setRefreshTimers] = useState<Record<string, number>>({});

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProfileHistoryEntry[];
        // Filter out expired entries
        const validEntries = parsed.filter(
          entry => Date.now() - entry.timestamp < CACHE_EXPIRY_MS
        );
        setHistory(validEntries);

        // Update localStorage if we filtered anything
        if (validEntries.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validEntries));
        }
      }
    } catch (error) {
      console.error('Failed to load profile history:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save a new profile to history
  const saveProfile = useCallback((handle: string, posts: ThreadsPostData[]) => {
    try {
      setHistory(prev => {
        // Extract display name from handle (remove @ if present)
        const displayName = handle.startsWith('@') ? handle.slice(1) : handle;

        // Check if this profile already exists
        const existingIndex = prev.findIndex(entry => entry.handle === handle);

        const newEntry: ProfileHistoryEntry = {
          handle,
          displayName,
          posts,
          timestamp: Date.now(),
          lastRefreshed: Date.now(),
        };

        let updated: ProfileHistoryEntry[];

        if (existingIndex !== -1) {
          // Update existing entry
          updated = [...prev];
          updated[existingIndex] = newEntry;
        } else {
          // Add new entry, removing oldest if necessary
          updated = [newEntry, ...prev.slice(0, MAX_HISTORY_ENTRIES - 1)];
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        return updated;
      });

      // Update refresh timer for this profile
      setRefreshTimers(prev => ({
        ...prev,
        [handle]: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save profile to history:', error);
    }
  }, []);

  // Get a cached profile
  const getCachedProfile = useCallback((handle: string): ProfileHistoryEntry | null => {
    const entry = history.find(e => e.handle === handle);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
      return null;
    }

    return entry;
  }, [history]);

  // Check if refresh is allowed for a handle
  const canRefresh = useCallback((handle: string): { allowed: boolean; remainingMs?: number } => {
    const lastRefresh = refreshTimers[handle];
    if (!lastRefresh) {
      return { allowed: true };
    }

    const elapsed = Date.now() - lastRefresh;
    if (elapsed >= REFRESH_COOLDOWN_MS) {
      return { allowed: true };
    }

    return {
      allowed: false,
      remainingMs: REFRESH_COOLDOWN_MS - elapsed
    };
  }, [refreshTimers]);

  // Clear all history
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
      setRefreshTimers({});
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  // Remove a specific entry
  const removeEntry = useCallback((handle: string) => {
    try {
      setHistory(prev => {
        const updated = prev.filter(entry => entry.handle !== handle);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      setRefreshTimers(prev => {
        const updated = { ...prev };
        delete updated[handle];
        return updated;
      });
    } catch (error) {
      console.error('Failed to remove history entry:', error);
    }
  }, []);

  return {
    history,
    saveProfile,
    getCachedProfile,
    canRefresh,
    clearHistory,
    removeEntry,
  };
}