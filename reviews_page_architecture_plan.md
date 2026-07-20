# Standalone Reviews Page: Architectural Design & Implementation Plan

To build a premium, publication-grade Reviews Page at `/category/reviews`, we will design an editorial-style interface. Below is the proposed layout structure, database changes, data querying strategy, and step-by-step rollout.

---

## 1. Database Schema Extension (`src/types/post.ts`)

To support rich music reviews, we will extend the `Post` schema with optional fields (so we don't break existing non-review posts).

```typescript
export interface Post {
  // ... existing fields ...
  artistName?: string;       // e.g., "Fireboy DML"
  projectTitle?: string;     // e.g., "Adore"
  projectType?: "Album" | "EP" | "Single" | "Mixtape";
  rating?: number;           // e.g., 8.5 (on a 0.0 to 10.0 scale)
  verdict?: string;          // e.g., "A brilliant sophomore effort that solidifies his songwriting status."
}
```

---

## 2. Data Fetching & Query Hook (`src/hooks/useReviews.ts`)

We will build a custom hook `useReviews(postsPerPage, filterType, sortBy)` to handle review queries.

### Performance Specs:
*   **Firestore Filtering:** Query where `category == "Reviews"` and `status == "published"`.
*   **SWR Caching Layer:** Caches the first page and count locally in `localStorage` under `tz_cache_reviews_p1` with a **5-minute TTL** so repeat visits are instant and cost zero database reads.
*   **Cursor Pagination:** Seamless page cursor management (identical to our homepage cursor-caching pagination).
*   **Flexible Sorting:**
    *   `Newest` (default): `orderBy("createdAt", "desc")`
    *   `Highest Rated`: `orderBy("rating", "desc")`

---

## 3. UI/UX Design Layout (`src/pages/ReviewsPage.tsx`)

The design borrows elements from premium editorial outlets (like Pitchfork or Resident Advisor) while preserving the TrendzHauz visual aesthetic.

```
+--------------------------------------------------------------+
|                    [Hero Spotlight Block]                    |
|  +--------------------------------------------------------+  |
|  | [Artist Image Widescreen Background]                   |  |
|  |                                                        |  |
|  |  [ALBUM REVIEW]                                        |  |
|  |  ARTIST NAME - PROJECT TITLE                [ 9.2 ]    |  |
|  |  "A masterclass in contemporary Afrobeats..."          |  |
|  +--------------------------------------------------------+  |
+--------------------------------------------------------------+
|  [Filter Bar: All | Albums | EPs | Singles]    [Sort: New / Max] |
+--------------------------------------------------------------+
|                                                              |
|  [Review Card Grid]                                          |
|  +----------------------+ +----------------------+           |
|  | Cover Image  [ 8.5 ] | | Cover Image  [ 7.8 ] |           |
|  | Artist Name          | | Artist Name          |           |
|  | TITLE                | | TITLE                |           |
|  | "Verdict teaser..."  | | "Verdict teaser..."  |           |
|  +----------------------+ +----------------------+           |
|                                                              |
+--------------------------------------------------------------+
```

### Components to Build:

1.  **Spotlight Hero Section:**
    *   Renders the most recent review with a high score (e.g. 8.0+) as a featured billboard.
    *   Large, widescreen cover image with a radial dark vignette.
    *   A prominent custom score indicator.
2.  **Filter / Segmented Control Bar:**
    *   Horizontal scroll list of categories: `All Projects`, `Albums`, `EPs`, `Singles`, `Mixtapes`.
    *   Select dropdown to toggle between sorting by `Newest` or `Highest Rated`.
3.  **Review Card Grid:**
    *   Bespoke cards designed specifically for reviews.
    *   **The Score Badge:** In the card's top-right corner, we render a high-contrast pill shape containing the score (e.g., `8.5`) in bold typography. If the score is >= 8.0, the badge is accented in **TrendzHauz Orange**; if below, it's a sleek dark slate.
    *   **Typography:** Large bold project title, clean uppercase artist name, and a small tag indicating type (e.g. "ALBUM").
4.  **Pagination Controls:**
    *   A carbon copy of the homepage pagination buttons (Previous / Next) to ensure layout consistency.

---

## 4. Step-by-Step Implementation Plan

1.  **Phase 1: Types & Mock Data Updates**
    *   Extend `Post` interface in `src/types/post.ts`.
    *   Update `FALLBACK_STORIES` and fallback data in `src/hooks/useBlogData.ts` to include rating, artistName, projectTitle, and verdict details for the `Reviews` items so fallback/offline states display rating badges properly.
2.  **Phase 2: Create the custom `useReviews` Hook**
    *   Write `src/hooks/useReviews.ts` to implement cursor-pagination, rating/type filtering, sorting, and SWR localStorage caching.
3.  **Phase 3: Code `ReviewsPage.tsx`**
    *   Build `src/pages/ReviewsPage.tsx` using Tailwind CSS and Framer Motion for premium entering animations.
4.  **Phase 4: App Integration**
    *   Register the route `/category/reviews` in `src/App.tsx` to point to our new `ReviewsPage` component.

---

**Awaiting your feedback and approval to start implementing Phase 1 and Phase 2.**
