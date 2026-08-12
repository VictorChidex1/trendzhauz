/**
 * Reads preloaded aggregation data embedded in the HTML by the
 * build-time prerender script.
 *
 * The preloaded data is stored in aggregations/preloaded in Firestore
 * and refreshed by onPostChanged on every publish. The prerender
 * script fetches this document at build time and embeds it as:
 *
 *   <script id="__PRELOADED__" type="application/json">...</script>
 *
 * Hooks call getPreloadedData() synchronously on mount. If fresh data
 * exists, they render immediately and query Firestore in the background
 * for eventual consistency. If stale or missing, they fall back to the
 * normal Firestore query path.
 */
import type {
  HeroSlide,
  TrendingPost,
  EditorPick,
  StoryCard,
} from "@/types/post";

export interface PreloadedPayload {
  preloadedAt: string;
  heroSlides?: HeroSlide[];
  trending?: TrendingPost[];
  editorPicks?: EditorPick[];
  latestStories?: StoryCard[];
}

const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes — fall back to Firestore after this

export function getPreloadedData(): PreloadedPayload | null {
  if (typeof document === "undefined") return null;

  const el = document.getElementById("__PRELOADED__");
  if (!el || !el.textContent) return null;

  try {
    const data: PreloadedPayload = JSON.parse(el.textContent);
    const age = Date.now() - new Date(data.preloadedAt).getTime();
    if (age > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}
