/**
 * Writes the latest aggregation data to aggregations/preloaded
 * so the build-time prerender script and React hooks can use it
 * for immediate page rendering before Firestore queries complete.
 *
 * Called from onPostChanged after runAggregation() succeeds.
 */
import { getFirestore, FieldValue } from "firebase-admin/firestore";

interface PreloadEntry {
  title: string;
  category: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  authorName?: string;
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
  views?: number;
  createdAt?: string;
}

interface PreloadPayload {
  heroSlides: PreloadEntry[];
  trending: PreloadEntry[];
  editorPicks: PreloadEntry[];
  latestStories: PreloadEntry[];
  preloadedAt: FirebaseFirestore.FieldValue;
}

export async function writePreloadCache(): Promise<void> {
  const db = getFirestore();

  try {
    const snap = await db.doc("aggregations/homepage").get();
    if (!snap.exists) {
      console.log("⏭  [writePreloadCache] No aggregation doc — skipping preload cache write.");
      return;
    }

    const data = snap.data() || {};

    const payload: PreloadPayload = {
      heroSlides: (data.heroSlides || []).slice(0, 4),
      trending: (data.trending || []).slice(0, 5),
      editorPicks: (data.editorPicks || []).slice(0, 3),
      latestStories: (data.latestStories || []).slice(0, 36),
      preloadedAt: FieldValue.serverTimestamp(),
    };

    await db.doc("aggregations/preloaded").set(payload);
    console.log("✅ [writePreloadCache] Preload cache written to aggregations/preloaded.");
  } catch (err) {
    console.error("❌ [writePreloadCache] Failed to write preload cache:", err);
    // Non-fatal — the site still works without preloaded data.
  }
}
