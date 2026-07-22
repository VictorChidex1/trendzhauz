// ─────────────────────────────────────────────
// Stale-While-Revalidate (SWR) localStorage Cache
// Provides TTL-based caching for serialized query results.
// Used to skip Firestore network calls when data is still fresh.
// ─────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = "tz_cache_";

/**
 * Centralized Time-To-Live (TTL) configuration constants in milliseconds.
 */
export const TTL = {
  HOMEPAGE: 30 * 60 * 1000,   // 30 Minutes (Hero Slides, Trending, Editor Picks)
  LISTS: 15 * 60 * 1000,      // 15 Minutes (Latest Stories, Reviews Pagination)
  ARTICLE: 2 * 60 * 60 * 1000, // 2 Hours (Single Article Detail View)
} as const;

const DEFAULT_TTL = TTL.LISTS;

/**
 * Retrieve cached data from localStorage.
 * Returns null if no cache exists or if parsing fails.
 */
export function getCachedData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Check if cached data is still within its TTL window.
 * Returns false if no cache exists or if the data has expired.
 */
export function isCacheFresh(key: string, ttl: number = DEFAULT_TTL): boolean {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return false;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp < ttl;
  } catch {
    return false;
  }
}

/**
 * Save data to localStorage with a current timestamp.
 * Fails silently if localStorage is full or unavailable.
 */
export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/**
 * Remove a specific cache entry from localStorage.
 */
export function clearCachedData(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // fail silently
  }
}

/**
 * Scans localStorage for stale Trendzhauz cache keys and removes expired entries
 * to keep local storage clean and prevent QuotaExceededError.
 */
export function pruneExpiredCache(defaultMaxAge = TTL.ARTICLE): void {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(CACHE_PREFIX)) {
        const raw = localStorage.getItem(fullKey);
        if (raw) {
          try {
            const entry: CacheEntry<unknown> = JSON.parse(raw);
            if (now - entry.timestamp > defaultMaxAge) {
              keysToRemove.push(fullKey);
            }
          } catch {
            keysToRemove.push(fullKey);
          }
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // fail silently if localStorage unavailable
  }
}

