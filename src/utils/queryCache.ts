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
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

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
export function isCacheFresh(key: string, ttl = DEFAULT_TTL): boolean {
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
