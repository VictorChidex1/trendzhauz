# Multi-Tier TTL Caching Architecture

## 1. Overview

This document describes the multi-tier Time-To-Live (TTL) cache system for the Trendzhauz platform.

The caching system stores data in browser `localStorage`. It reduces Firestore database read operations and provides fast page loading times.

---

## 2. Technical Requirements

- The cache system must use TypeScript.
- The cache system must isolate keys using the prefix `tz_cache_`.
- The cache system must enforce three different TTL time windows based on data type.
- The cache system must handle browser storage limit errors without application failures.

---

## 3. Data Structure and Configuration

The caching configuration is defined in [`src/utils/queryCache.ts`](file:///Users/mac/Documents/Vibe%20Coding/trendzhauz/src/utils/queryCache.ts).

### 3.1 Cache Entry Object

Every cache record in `localStorage` uses the `CacheEntry<T>` interface:

```typescript
interface CacheEntry<T> {
  data: T;          // The serialized data payload
  timestamp: number; // Unix timestamp in milliseconds
}
```

### 3.2 Multi-Tier TTL Map

The system uses three TTL tiers defined in the `TTL` constant object:

| TTL Tier Constant | Duration Value | Milliseconds | Target Components |
| :--- | :--- | :--- | :--- |
| `TTL.HOMEPAGE` | 30 Minutes | `1,800,000` | Hero Slides, Trending Posts, Editor Picks |
| `TTL.LISTS` | 15 Minutes | `900,000` | Latest Stories Feed, Category Lists, Reviews Pages |
| `TTL.ARTICLE` | 2 Hours | `7,200,000` | Single Post Article Detail Views |

---

## 4. Core Utility Functions

The module [`src/utils/queryCache.ts`](file:///Users/mac/Documents/Vibe%20Coding/trendzhauz/src/utils/queryCache.ts) provides five main functions:

### 4.1 `getCachedData<T>(key: string): T | null`
- Reads the raw JSON string from `localStorage` using key `tz_cache_${key}`.
- Parses the string into a `CacheEntry<T>` object.
- Returns `entry.data` if successful.
- Returns `null` if the item does not exist or if JSON parsing fails.

### 4.2 `isCacheFresh(key: string, ttl: number = DEFAULT_TTL): boolean`
- Retrieves the stored entry from `localStorage`.
- Calculates the elapsed time: `Date.now() - entry.timestamp`.
- Returns `true` if elapsed time is less than `ttl`.
- Returns `false` if the entry does not exist or if the timestamp expired.

### 4.3 `setCachedData<T>(key: string, data: T): void`
- Creates a new `CacheEntry<T>` containing `data` and `Date.now()`.
- Serializes the entry to a JSON string.
- Writes the string to `localStorage`.
- Catches errors silently if `localStorage` is full or disabled.

### 4.4 `clearCachedData(key: string): void`
- Removes the specified key from `localStorage`.

### 4.5 `pruneExpiredCache(defaultMaxAge = TTL.ARTICLE): void`
- Scans all items in `localStorage`.
- Filters keys starting with `tz_cache_`.
- Calculates entry age against `defaultMaxAge`.
- Deletes entries older than `defaultMaxAge` or corrupted JSON payloads.

---

## 5. Hook and Component Integration

### 5.1 Application Startup Pruning
In [`src/App.tsx`](file:///Users/mac/Documents/Vibe%20Coding/trendzhauz/src/App.tsx), the root application calls `pruneExpiredCache()` inside a `useEffect` hook on initial mount:

```typescript
useEffect(() => {
  pruneExpiredCache();
}, []);
```

This procedure removes stale entries automatically when users start the application.

### 5.2 Homepage Data Hooks
In [`src/hooks/useBlogData.ts`](file:///Users/mac/Documents/Vibe%20Coding/trendzhauz/src/hooks/useBlogData.ts):
- `useHeroSlides`: Evaluates `isCacheFresh("hero_slides", TTL.HOMEPAGE)`.
- `useTrendingPosts`: Evaluates `isCacheFresh("trending", TTL.HOMEPAGE)`.
- `useEditorPicks`: Evaluates `isCacheFresh("editor_picks", TTL.HOMEPAGE)`.
- `useLatestStories`: Evaluates `isCacheFresh("latest_stories_p1", TTL.LISTS)`.

### 5.3 Reviews Feed Hook
In [`src/hooks/useReviews.ts`](file:///Users/mac/Documents/Vibe%20Coding/trendzhauz/src/hooks/useReviews.ts):
- Evaluates `isCacheFresh(cacheKeyCount, TTL.LISTS)` for category total counts.
- Evaluates `isCacheFresh(cacheKeyPage1, TTL.LISTS)` for review page items.

---

## 6. Error Handling and Storage Safety

1. **Storage Quota Protection**:
   All write functions use `try...catch` blocks. If browser storage is full (`QuotaExceededError`), the system catches the error. The application continues without crashing.

2. **Database Fallback**:
   When cache validation returns `false` or cache reads return `null`, hooks automatically fetch fresh data from Firestore.

---

## 7. Verification

The implementation was validated using the following steps:
1. Run `npm run lint` to verify code quality.
2. Run `npm run build` to verify TypeScript type checking.
3. Commit and push code changes to the repository.
