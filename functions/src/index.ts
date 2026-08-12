/**
 * TrendzHauz Cloud Functions entry
 * - aggregateHomepageData (scheduled homepage aggregation)
 * - onPostChanged (instant aggregation refresh on post writes)
 * - requestPasswordReset (Resend-branded password reset emails)
 * - publishScheduled (auto-publish scheduled posts)
 * - seoSitemap (dynamic sitemap XML — Phase C)
 * - seoGateway (bot-specific HTML interceptor — Phase D)
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (uses default service account credentials)
initializeApp();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

// Custom password-reset email (Resend + Admin generatePasswordResetLink)
export { requestPasswordReset } from "./requestPasswordReset";

// Public contact / advertising form submissions (Resend + Firestore Inbox)
export { sendContactMessage } from "./sendContactMessage";

// Auto-publish scheduled posts
export { publishScheduled } from "./publishScheduled";

// Dynamic sitemap generation (Phase C)
export { seoSitemap } from "./seoSitemap";

// SEO bot gateway (Phase D)
export { seoGateway } from "./seoGateway";

// Preload cache writer (Phase E enhancement)
import { writePreloadCache } from "./seo/preload-hubs";

// ─── Helper: Format Firestore Timestamp to readable string ───
function formatTimestamp(ts: FirebaseFirestore.Timestamp | undefined): string {
  if (!ts || !ts.toDate) return "Unknown Date";
  const date = ts.toDate();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Aggregation Interfaces ───
interface AggregatedTrending {
  rank: number;
  category: string;
  title: string;
  coverImageUrl: string;
  views: number;
  createdAt: string;
  slug: string;
}

interface AggregatedEditorPick {
  category: string;
  title: string;
  coverImageUrl: string;
  createdAt: string;
  slug: string;
}

interface AggregatedLatestStory {
  id: string;
  category: string;
  title: string;
  description: string;
  coverImageUrl: string;
  createdAt: string;
  slug: string;
  authorName?: string;
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
}

// Homepage stores 36 latest stories → 3 client-side pages of 12.
const STORED_LATEST = 36;

// ─── Shared Aggregation Core ───
async function runAggregation(): Promise<void> {
  console.log("⏰ [runAggregation] Starting homepage aggregation...");

  const postsRef = db.collection("posts");
  const now = new Date();

  // Model A: exclude future-dated scheduled posts from public aggregates
  const isLive = (data: FirebaseFirestore.DocumentData): boolean => {
    const created = data.createdAt?.toDate?.() as Date | undefined;
    if (!created) return false;
    return created.getTime() <= now.getTime();
  };

  // ── 1. TRENDING: Top 5 posts by views (descending), live only ──
  const trendingSnap = await postsRef
    .where("status", "==", "published")
    .orderBy("views", "desc")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  const trending: AggregatedTrending[] = trendingSnap.docs
    .map((doc) => doc.data())
    .filter(isLive)
    .slice(0, 5)
    .map((data, idx) => ({
      rank: idx + 1,
      category: String(data.category || "News"),
      title: String(data.title || ""),
      coverImageUrl:
        String(data.coverImageUrl || "") || "/assets/placeholder-cover.jpg",
      views: typeof data.views === "number" ? data.views : 0,
      createdAt: formatTimestamp(data.createdAt),
      slug: String(data.slug || ""),
    }));

  console.log(`  ✅ Trending: ${trending.length} posts aggregated`);

  // ── 2. EDITOR PICKS: Top 3 posts where isEditorPick == true ──
  const editorSnap = await postsRef
    .where("status", "==", "published")
    .where("isEditorPick", "==", true)
    .orderBy("createdAt", "desc")
    .limit(12)
    .get();

  const editorPicks: AggregatedEditorPick[] = editorSnap.docs
    .map((doc) => doc.data())
    .filter(isLive)
    .slice(0, 3)
    .map((data) => ({
      category: String(data.category || "News"),
      title: String(data.title || ""),
      coverImageUrl:
        String(data.coverImageUrl || "") || "/assets/placeholder-cover.jpg",
      createdAt: formatTimestamp(data.createdAt),
      slug: String(data.slug || ""),
    }));

  console.log(`  ✅ Editor Picks: ${editorPicks.length} posts aggregated`);

  // ── 3. LATEST STORIES: 36 most recent published posts ──
  const latestSnap = await postsRef
    .where("status", "==", "published")
    .orderBy("createdAt", "desc")
    .limit(48)
    .get();

  const latestStories: AggregatedLatestStory[] = [];
  latestSnap.docs
    .filter((doc) => isLive(doc.data()))
    .slice(0, STORED_LATEST)
    .forEach((doc) => {
      const data = doc.data();
      const story: AggregatedLatestStory = {
        id: doc.id,
        category: String(data.category || "News"),
        title: String(data.title || ""),
        description: String(data.description || ""),
        coverImageUrl:
          String(data.coverImageUrl || "") || "/assets/placeholder-cover.jpg",
        createdAt: formatTimestamp(data.createdAt),
        slug: String(data.slug || ""),
      };
      if (data.authorName) story.authorName = String(data.authorName);
      if (data.artistName) story.artistName = String(data.artistName);
      if (data.projectTitle) story.projectTitle = String(data.projectTitle);
      if (data.projectType) story.projectType = String(data.projectType);
      if (typeof data.rating === "number") story.rating = data.rating;
      if (data.verdict) story.verdict = String(data.verdict);
      latestStories.push(story);
    });

  console.log(`  ✅ Latest Stories: ${latestStories.length} posts aggregated`);

  // ── 4. HERO SLIDES: Latest post per category ──
  const categories = ["Music", "Reviews", "Videos", "News"];
  const ctaMap: Record<string, string> = {
    Music: "Stream Music",
    Reviews: "Read Review",
    Videos: "Watch Video",
    News: "Read Story",
  };

  const allRecentSnap = await postsRef
    .where("status", "==", "published")
    .orderBy("createdAt", "desc")
    .limit(40)
    .get();

  const heroSlides: Array<Record<string, string>> = [];
  const allPosts = allRecentSnap.docs
    .map((doc) => doc.data())
    .filter(isLive);

  categories.forEach((cat) => {
    const found = allPosts.find(
      (p) => p.category?.toLowerCase() === cat.toLowerCase()
    );
    if (found) {
      const readTime = Math.ceil((found.content?.length || 0) / 1500);
      heroSlides.push({
        category: cat,
        title: String(found.title || ""),
        description: String(found.description || ""),
        link: `/${cat.toLowerCase()}/${String(found.slug || "")}`,
        image:
          String(found.coverImageUrl || "") || "/assets/placeholder-cover.jpg",
        meta: `By ${found.authorName || "TrendzHauz Editor"} · ${readTime} Min Read`,
        ctaText: ctaMap[cat] || "Read Story",
        slug: String(found.slug || ""),
      });
    }
  });

  console.log(`  ✅ Hero Slides: ${heroSlides.length} slides aggregated`);

  // ── 5. CURSOR for deep pagination (page 4+ queries) ──
  // Only present when more than STORED_LATEST published posts exist.
  const cursorDoc =
    latestSnap.size > STORED_LATEST ? latestSnap.docs[STORED_LATEST - 1] : null;
  const paginatedCursor =
    cursorDoc && cursorDoc.data().createdAt?.toDate
      ? (cursorDoc.data().createdAt as FirebaseFirestore.Timestamp)
      : undefined;

  // ── 6. WRITE to aggregations/homepage ──
  const writePayload: Record<string, unknown> = {
    trending,
    editorPicks,
    latestStories,
    heroSlides,
    lastAggregatedAt: FieldValue.serverTimestamp(),
    postCount: latestSnap.size,
  };
  if (paginatedCursor) writePayload.paginatedCursor = paginatedCursor;

  await db.doc("aggregations/homepage").set(writePayload);

  console.log(
    "🎉 [runAggregation] Successfully wrote aggregations/homepage"
  );
}

// ─── The Scheduled Function (hourly safety net) ───
export const aggregateHomepageData = onSchedule(
  {
    // Run every 60 minutes
    schedule: "every 60 minutes",
    // Use the same region as your Firestore database
    region: "us-central1",
    // Timeout and memory settings
    timeoutSeconds: 120,
    memory: "256MiB",
  },
  async () => {
    try {
      await runAggregation();
    } catch (error) {
      console.error("❌ [aggregateHomepageData] Aggregation failed:", error);
      throw error; // Re-throw so Cloud Functions marks this execution as failed
    }
  }
);

// ─── The Write Trigger (instant refresh on publish/edit/delete) ───
function isPublished(
  data: FirebaseFirestore.DocumentData | undefined
): boolean {
  return data?.status === "published";
}

// True when before/after differ ONLY in volatile fields (views/updatedAt).
// Auto view-increments and manual CMS view edits therefore cost zero recomputes.
function onlyVolatileFieldsChanged(
  before: FirebaseFirestore.DocumentData | undefined,
  after: FirebaseFirestore.DocumentData | undefined
): boolean {
  if (!before || !after) return false;
  const strip = (d: FirebaseFirestore.DocumentData): string => {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(d)) {
      if (key === "views" || key === "updatedAt") continue;
      copy[key] = value;
    }
    return JSON.stringify(copy);
  };
  return strip(before) === strip(after);
}

export const onPostChanged = onDocumentWritten(
  {
    document: "posts/{postId}",
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "256MiB",
  },
  async (event) => {
    if (!event.data) return;
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Gate: only touch published posts (draft-only writes cost nothing).
    if (!isPublished(before) && !isPublished(after)) return;

    // Strict guard: skip recompute when only views/updatedAt changed.
    if (onlyVolatileFieldsChanged(before, after)) return;

    try {
      await runAggregation();
      await writePreloadCache();
    } catch (error) {
      console.error("❌ [onPostChanged] Aggregation failed:", error);
      throw error;
    }
  }
);
