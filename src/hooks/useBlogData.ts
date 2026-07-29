import * as React from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type {
  Post,
  HeroSlide,
  StoryCard,
  TrendingPost,
  EditorPick,
} from "../types/post";
import { setCachedData } from "../utils/queryCache";

// HELPER: Convert Firestore Timestamp / Date into epoch milliseconds
function getMillis(val: unknown): number {
  if (!val) return 0;
  if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as Timestamp).toDate === "function") {
    return (val as Timestamp).toDate().getTime();
  }
  if (val instanceof Date) return val.getTime();
  if (typeof val === "string" || typeof val === "number") {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// HELPER: Format Firestore Timestamp to readable string
function formatDate(timestamp: unknown): string {
  const millis = getMillis(timestamp);
  if (!millis) return "Recent";
  return new Date(millis).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// CTA text mapping per category
const CTA_MAP: Record<string, string> = {
  Music: "Stream Music",
  Reviews: "Read Review",
  Videos: "Watch Video",
  News: "Read Story",
};

/**
 * Helper to process raw Firestore docs into sorted & scheduled-filtered Post objects
 */
function parsePublishedPosts(docs: Array<{ id: string; data: () => Record<string, unknown> }>): Post[] {
  const now = Date.now();
  const posts = docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Post))
    .filter((post) => post.status === "published")
    .filter((post) => {
      const postTime = getMillis(post.createdAt);
      return postTime === 0 || postTime <= now + 60000; // include current/past posts
    })
    .sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));

  // Proactively seed published posts into localStorage cache so article navigation is instant (0ms)
  posts.forEach((post) => {
    if (post.slug) {
      setCachedData(`post_${post.slug.trim().toLowerCase()}`, post);
    }
  });

  return posts;
}

/**
 * Helper to build category-based article URL: /{category}/{slug}
 */
function articleUrl(category: string, slug: string): string {
  return `/${(category || "news").toLowerCase()}/${slug}`;
}

// HOOK 1: useHeroSlides (Real-Time Firestore Listener)
export function useHeroSlides() {
  const [slides, setSlides] = React.useState<HeroSlide[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts = parsePublishedPosts(snapshot.docs);
        if (posts.length > 0) {
          const categories = ["Music", "Reviews", "Videos", "News"];
          const liveSlides: HeroSlide[] = [];

          // Highlight top post per category or top overall posts
          categories.forEach((cat) => {
            const found = posts.find(
              (p) => p.category.toLowerCase() === cat.toLowerCase()
            );
            if (found) {
              liveSlides.push({
                category: cat,
                title: found.title,
                description: found.description || (found.content || "").replace(/<[^>]*>/g, "").slice(0, 140) + "...",
                link: articleUrl(found.category, found.slug),
                image: found.coverImageUrl || "/assets/placeholder-cover.jpg",
                meta: `By ${found.authorName || "TrendzHauz Editor"} · ${Math.max(1, Math.ceil((found.content || "").length / 1500))} Min Read`,
                ctaText: CTA_MAP[cat] || "Read Story",
                slug: found.slug,
              });
            }
          });

          // Fill up to 3 slides if available
          if (liveSlides.length < 3) {
            posts.slice(0, 3).forEach((p) => {
              if (!liveSlides.some((s) => s.slug === p.slug)) {
                liveSlides.push({
                  category: p.category,
                  title: p.title,
                  description: p.description || (p.content || "").replace(/<[^>]*>/g, "").slice(0, 140) + "...",
                  link: articleUrl(p.category, p.slug),
                  image: p.coverImageUrl || "/assets/placeholder-cover.jpg",
                  meta: `By ${p.authorName || "TrendzHauz Editor"} · ${Math.max(1, Math.ceil((p.content || "").length / 1500))} Min Read`,
                  ctaText: CTA_MAP[p.category] || "Read Story",
                  slug: p.slug,
                });
              }
            });
          }

          setSlides(liveSlides);
        } else {
          setSlides([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Hero slides onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { slides, loading };
}

// HOOK 2: useLatestStories (Real-Time Firestore Listener)
export function useLatestStories(postsPerPage = 12) {
  const [allPosts, setAllPosts] = React.useState<StoryCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts = parsePublishedPosts(snapshot.docs);
        const liveCards: StoryCard[] = posts.map((data) => ({
          id: data.id,
          category: data.category,
          title: data.title,
          description: data.description || (data.content || "").replace(/<[^>]*>/g, "").slice(0, 150) + "...",
          coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
          createdAt: formatDate(data.createdAt),
          slug: data.slug,
          artistName: data.artistName,
          projectTitle: data.projectTitle,
          projectType: data.projectType,
          rating: data.rating,
          verdict: data.verdict,
        }));
        setAllPosts(liveCards);
        setLoading(false);
      },
      (error) => {
        console.error("useLatestStories onSnapshot error:", error);
        setAllPosts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const totalPages = Math.max(1, Math.ceil(allPosts.length / postsPerPage));
  const start = (currentPage - 1) * postsPerPage;
  const stories = allPosts.slice(start, start + postsPerPage);

  return { stories, loading, currentPage, setCurrentPage, totalPages };
}

// HOOK 3: useTrendingPosts (Real-Time Firestore Listener)
export function useTrendingPosts() {
  const [posts, setPosts] = React.useState<TrendingPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const livePosts = parsePublishedPosts(snapshot.docs);
        const ranked = livePosts
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map((data, idx) => ({
            rank: idx + 1,
            category: data.category,
            title: data.title,
            coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
            createdAt: formatDate(data.createdAt),
            slug: data.slug,
            views: data.views || 0,
          }));
        setPosts(ranked);
        setLoading(false);
      },
      (error) => {
        console.error("useTrendingPosts onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { posts, loading };
}

// HOOK 4: useEditorPicks (Real-Time Firestore Listener)
export function useEditorPicks() {
  const [picks, setPicks] = React.useState<EditorPick[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const livePosts = parsePublishedPosts(snapshot.docs);
        const editorOnly = livePosts.filter((p) => p.isEditorPick);
        const source = editorOnly.length > 0 ? editorOnly : livePosts;

        const livePicks: EditorPick[] = source.slice(0, 3).map((data) => ({
          category: data.category,
          title: data.title,
          coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
          createdAt: formatDate(data.createdAt),
          slug: data.slug,
        }));
        setPicks(livePicks);
        setLoading(false);
      },
      (error) => {
        console.error("useEditorPicks onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { picks, loading };
}
