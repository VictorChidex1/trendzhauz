import * as React from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  startAfter,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type {
  Post,
  HeroSlide,
  StoryCard,
  TrendingPost,
  EditorPick,
} from "../types/post";
import { useHomepageAggregation } from "./useHomepageAggregation";
import type { HomepageAggregation } from "./useHomepageAggregation";

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

// HELPER: Convert a raw published post doc into a StoryCard
function toStoryCard(docSnap: { id: string; data: () => Record<string, unknown> }): StoryCard {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    category: String(data.category || "News"),
    title: String(data.title || ""),
    description:
      String(data.description || "") ||
      (String(data.content || "").replace(/<[^>]*>/g, "").slice(0, 150) + "..."),
    coverImageUrl:
      String(data.coverImageUrl || "") || "/assets/placeholder-cover.jpg",
    createdAt: formatDate(data.createdAt),
    slug: String(data.slug || ""),
    artistName: data.artistName ? String(data.artistName) : undefined,
    projectTitle: data.projectTitle ? String(data.projectTitle) : undefined,
    projectType: data.projectType ? String(data.projectType) : undefined,
    rating: typeof data.rating === "number" ? data.rating : undefined,
    verdict: data.verdict ? String(data.verdict) : undefined,
    authorName: data.authorName ? String(data.authorName) : undefined,
  };
}

// HELPER: Convert a parsed published Post into a StoryCard
function postToStoryCard(post: Post): StoryCard {
  return {
    id: post.id,
    category: post.category,
    title: post.title,
    description:
      post.description ||
      (post.content || "").replace(/<[^>]*>/g, "").slice(0, 150) + "...",
    coverImageUrl: post.coverImageUrl || "/assets/placeholder-cover.jpg",
    createdAt: formatDate(post.createdAt),
    slug: post.slug,
    artistName: post.artistName,
    projectTitle: post.projectTitle,
    projectType: post.projectType,
    rating: post.rating,
    verdict: post.verdict,
    authorName: post.authorName,
  };
}

/**
 * Helper to process raw Firestore docs into sorted & scheduled-filtered Post objects
 */
function parsePublishedPosts(docs: Array<{ id: string; data: () => Record<string, unknown> }>): Post[] {
  const now = Date.now();
  return docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Post))
    .filter((post) => post.status === "published")
    .filter((post) => {
      const postTime = getMillis(post.createdAt);
      return postTime === 0 || postTime <= now + 60000; // include current/past posts
    })
    .sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
}

/**
 * Helper to build category-based article URL: /{category}/{slug}
 */
function articleUrl(category: string, slug: string): string {
  return `/${(category || "news").toLowerCase()}/${slug}`;
}

// HELPER: Build hero slides from the aggregation doc (fill up to 3 slides)
function buildHeroSlides(aggregation: HomepageAggregation): HeroSlide[] {
  const slides: HeroSlide[] = (aggregation.heroSlides || []).map((slide) => ({
    category: slide.category,
    title: slide.title,
    description: slide.description || "",
    link: slide.link || articleUrl(slide.category, slide.slug || ""),
    image: slide.image || "/assets/placeholder-cover.jpg",
    meta: slide.meta || "",
    ctaText: slide.ctaText || "Read Story",
    slug: slide.slug,
  }));

  const used = new Set(slides.map((s) => s.slug).filter(Boolean));
  const stories = aggregation.latestStories || [];

  if (slides.length < 3) {
    for (const story of stories) {
      if (slides.length >= 3) break;
      if (used.has(story.slug)) continue;
      slides.push({
        category: story.category,
        title: story.title,
        description: story.description || "",
        link: articleUrl(story.category, story.slug),
        image: story.coverImageUrl || "/assets/placeholder-cover.jpg",
        meta: `By ${story.authorName || "TrendzHauz Editor"}`,
        ctaText: CTA_MAP[story.category] || "Read Story",
        slug: story.slug,
      });
      used.add(story.slug);
    }
  }

  return slides;
}

// HOOK 1: useHeroSlides (aggregation doc, falls back to real-time query)
export function useHeroSlides() {
  const { data, isFresh } = useHomepageAggregation();
  const [slides, setSlides] = React.useState<HeroSlide[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (data && isFresh && (data.heroSlides || []).length > 0) {
      setSlides(buildHeroSlides(data));
      setLoading(false);
      return;
    }

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
  }, [data, isFresh]);

  return { slides, loading };
}

// HOOK 2: useLatestStories (36 from aggregation, page 4+ via cursor query)
export function useLatestStories(postsPerPage = 12) {
  const { data, isFresh } = useHomepageAggregation();
  const aggregationActive = Boolean(data && isFresh);

  const [allPosts, setAllPosts] = React.useState<StoryCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [deepPosts, setDeepPosts] = React.useState<StoryCard[]>([]);
  const [hasMore, setHasMore] = React.useState(false);
  const pageCursors = React.useRef<Record<number, unknown>>({});

  // Load the aggregation slice, or fall back to the real-time listener
  React.useEffect(() => {
    if (aggregationActive && data) {
      setAllPosts(data.latestStories || []);
      setDeepPosts([]);
      pageCursors.current = {};
      setHasMore(Boolean(data.paginatedCursor));
      setCurrentPage((p) => (p > 3 ? 3 : p));
      setLoading(false);
      return;
    }

    if (!aggregationActive) {
      setDeepPosts([]);
      pageCursors.current = {};
      const q = query(
        collection(db, "posts"),
        where("status", "==", "published")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setAllPosts(parsePublishedPosts(snapshot.docs).map(postToStoryCard));
          setHasMore(false);
          setLoading(false);
        },
        (error) => {
          console.error("useLatestStories onSnapshot error:", error);
          setAllPosts([]);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [aggregationActive, data]);

  // Deep pagination: pages 4+ are fetched from Firestore with a cursor
  React.useEffect(() => {
    if (!aggregationActive || currentPage < 4) return;

    let cancelled = false;
    const startAt =
      pageCursors.current[currentPage - 1] ?? data?.paginatedCursor ?? null;
    if (startAt == null) {
      setHasMore(false);
      return;
    }

    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      startAfter(startAt),
      limit(postsPerPage)
    );

    getDocs(q)
      .then((snapshot) => {
        if (cancelled) return;
        const cards = snapshot.docs.map(toStoryCard);
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        pageCursors.current[currentPage] = lastDoc
          ? lastDoc.data().createdAt
          : null;
        setDeepPosts(cards);
        setHasMore(snapshot.docs.length === postsPerPage);
        if (cards.length === 0) setCurrentPage(3);
        setLoading(false);
      })
      .catch((error) => {
        console.error("useLatestStories deep page error:", error);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [aggregationActive, currentPage, data, postsPerPage]);

  const storedPages = Math.max(1, Math.ceil(allPosts.length / postsPerPage));

  let totalPages: number;
  if (aggregationActive) {
    const base = Math.max(storedPages, currentPage);
    totalPages = hasMore ? base + 1 : base;
  } else {
    totalPages = storedPages;
  }

  const stories = aggregationActive
    ? currentPage >= 4
      ? deepPosts
      : allPosts.slice(
          (currentPage - 1) * postsPerPage,
          currentPage * postsPerPage
        )
    : allPosts.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
      );

  return { stories, loading, currentPage, setCurrentPage, totalPages };
}

// HOOK 3: useTrendingPosts (aggregation doc, falls back to real-time query)
export function useTrendingPosts() {
  const { data, isFresh } = useHomepageAggregation();
  const [posts, setPosts] = React.useState<TrendingPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (data && isFresh && (data.trending || []).length > 0) {
      setPosts(data.trending || []);
      setLoading(false);
      return;
    }

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
  }, [data, isFresh]);

  return { posts, loading };
}

// HOOK 4: useEditorPicks (aggregation when unfiltered; live query for category filters)
export function useEditorPicks(categoryFilter?: string) {
  const { data, isFresh } = useHomepageAggregation();
  const [picks, setPicks] = React.useState<EditorPick[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (
      !categoryFilter &&
      data &&
      isFresh &&
      (data.editorPicks || []).length > 0
    ) {
      setPicks(data.editorPicks || []);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const livePosts = parsePublishedPosts(snapshot.docs);
        const targetPosts = categoryFilter
          ? livePosts.filter((p) => (p.category || "").toLowerCase() === categoryFilter.toLowerCase())
          : livePosts;

        const editorOnly = targetPosts.filter((p) => p.isEditorPick);
        const source = editorOnly.length > 0 ? editorOnly : targetPosts;

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
  }, [data, isFresh, categoryFilter]);

  return { picks, loading };
}
