/**
 * TrendzHauz — Scheduled Homepage Aggregation Cloud Function
 *
 * PURPOSE:
 * Instead of every frontend visitor running 3 separate Firestore queries
 * (trending, editor picks, latest stories), this function runs ONCE per hour
 * and pre-compiles the results into a single document: `aggregations/homepage`.
 *
 * RESULT:
 * 1,000 users/hour go from ~3,000 reads → ~1,001 reads (1 write + 1,000 single-doc reads).
 *
 * TRIGGER:
 * Google Cloud Scheduler fires this function every 60 minutes via Pub/Sub.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (uses default service account credentials)
initializeApp();
const db = getFirestore();

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
  title: string;
  coverImageUrl: string;
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
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
}

// ─── The Scheduled Function ───
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
    console.log("⏰ [aggregateHomepageData] Starting hourly aggregation...");

    try {
      const postsRef = db.collection("posts");

      // ── 1. TRENDING: Top 5 posts by views (descending) ──
      const trendingSnap = await postsRef
        .where("status", "==", "published")
        .orderBy("views", "desc")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

      const trending: AggregatedTrending[] = trendingSnap.docs.map(
        (doc, idx) => {
          const data = doc.data();
          return {
            rank: idx + 1,
            title: data.title,
            coverImageUrl: data.coverImageUrl,
            createdAt: formatTimestamp(data.createdAt),
            slug: data.slug,
          };
        }
      );

      console.log(`  ✅ Trending: ${trending.length} posts aggregated`);

      // ── 2. EDITOR PICKS: Top 3 posts where isEditorPick == true ──
      const editorSnap = await postsRef
        .where("status", "==", "published")
        .where("isEditorPick", "==", true)
        .orderBy("createdAt", "desc")
        .limit(3)
        .get();

      const editorPicks: AggregatedEditorPick[] = editorSnap.docs.map(
        (doc) => {
          const data = doc.data();
          return {
            category: data.category,
            title: data.title,
            coverImageUrl: data.coverImageUrl,
            createdAt: formatTimestamp(data.createdAt),
            slug: data.slug,
          };
        }
      );

      console.log(`  ✅ Editor Picks: ${editorPicks.length} posts aggregated`);

      // ── 3. LATEST STORIES: 12 most recent published posts ──
      const latestSnap = await postsRef
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .limit(12)
        .get();

      const latestStories: AggregatedLatestStory[] = latestSnap.docs.map(
        (doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            category: data.category,
            title: data.title,
            description: data.description,
            coverImageUrl: data.coverImageUrl,
            createdAt: formatTimestamp(data.createdAt),
            slug: data.slug,
            artistName: data.artistName || undefined,
            projectTitle: data.projectTitle || undefined,
            projectType: data.projectType || undefined,
            rating: data.rating || undefined,
            verdict: data.verdict || undefined,
          };
        }
      );

      console.log(
        `  ✅ Latest Stories: ${latestStories.length} posts aggregated`
      );

      // ── 4. HERO SLIDES: Latest post per category ──
      const categories = ["Music", "Reviews", "Videos", "News"];
      const ctaMap: Record<string, string> = {
        Music: "Stream Music",
        Reviews: "Read Review",
        Videos: "Watch Video",
        News: "Read Story",
      };

      // Re-use the latest stories snapshot to derive hero slides efficiently
      const allRecentSnap = await postsRef
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      const heroSlides: Array<Record<string, string>> = [];
      const allPosts = allRecentSnap.docs.map((doc) => doc.data());

      categories.forEach((cat) => {
        const found = allPosts.find(
          (p) => p.category?.toLowerCase() === cat.toLowerCase()
        );
        if (found) {
          const readTime = Math.ceil((found.content?.length || 0) / 1500);
          heroSlides.push({
            category: cat,
            title: found.title,
            description: found.description,
            link: `/category/${cat.toLowerCase()}`,
            image: found.coverImageUrl,
            meta: `By ${found.authorName} · ${readTime} Min Read`,
            ctaText: ctaMap[cat] || "Read Story",
            slug: found.slug,
          });
        }
      });

      console.log(`  ✅ Hero Slides: ${heroSlides.length} slides aggregated`);

      // ── 5. WRITE to aggregations/homepage ──
      await db.doc("aggregations/homepage").set({
        trending,
        editorPicks,
        latestStories,
        heroSlides,
        lastAggregatedAt: FieldValue.serverTimestamp(),
        postCount: latestSnap.size,
      });

      console.log(
        "🎉 [aggregateHomepageData] Successfully wrote aggregations/homepage"
      );
    } catch (error) {
      console.error("❌ [aggregateHomepageData] Aggregation failed:", error);
      throw error; // Re-throw so Cloud Functions marks this execution as failed
    }
  }
);
