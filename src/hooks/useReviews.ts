import * as React from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { Post, StoryCard } from "../types/post";

// RICH MOCK REVIEWS FOR FALLBACK (SHOWN ONLY IF FIRESTORE IS EMPTY)
const MOCK_REVIEWS: StoryCard[] = [
  {
    id: "review-fallback-1",
    category: "Reviews",
    title: "Wizkid & Asake - 'Real Vol. 1': A Rhythm-Heavy Afrobeats Synergy",
    description:
      "An in-depth analysis of the collaborative project that blends Wizkid's cool R&B tempos with Asake's high-energy neo-Fuji choruses.",
    coverImageUrl: "/assets/Wizkid-Asake-Real-Vol.-1-EP.webp",
    createdAt: "Jul 18, 2026",
    slug: "wizkid-asake-real-vol1-review",
    artistName: "Wizkid & Asake",
    projectTitle: "Real Vol. 1",
    projectType: "EP",
    rating: 8.7,
    genre: "Afrobeats",
    verdict:
      "A dazzling, rhythm-heavy collaboration showcasing two of Afrobeats' finest forces in peak synergy.",
    scoreBreakdown: {
      production: 9.0,
      lyricism: 8.2,
      replayValue: 9.2,
      originality: 8.4,
    },
  },
  {
    id: "review-fallback-2",
    category: "Reviews",
    title: "Burna Boy - 'Love, Damini': The African Giant's Personal Chronicle",
    description:
      "We review Burna Boy's introspective studio album, analyzing how it explores personal struggle, loss, and celebration.",
    coverImageUrl: "/assets/Burna-Boy.webp",
    createdAt: "Jul 15, 2026",
    slug: "burna-boy-love-damini-review",
    artistName: "Burna Boy",
    projectTitle: "Love, Damini",
    projectType: "Album",
    rating: 9.1,
    genre: "Afrobeats",
    verdict:
      "A sprawling, emotional journey that reinforces Burna Boy's unmatched global songwriting capability.",
    scoreBreakdown: {
      production: 9.4,
      lyricism: 9.2,
      replayValue: 8.8,
      originality: 9.0,
    },
  },
];

// Helper to convert Firestore timestamp/Date to epoch millis
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

// Helper to format Firestore date
function formatDate(timestamp: unknown): string {
  const millis = getMillis(timestamp);
  if (!millis) return "Recent";
  return new Date(millis).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function useReviews(
  postsPerPage = 12,
  projectTypeFilter: "All" | "Album" | "EP" | "Single" | "Mixtape" = "All",
  sortBy: "newest" | "highest-rated" = "newest",
  genreFilter: "All" | "Afrobeats" | "Amapiano" | "Hip-Hop" | "Street-Pop" | "R&B" = "All",
  searchQuery = ""
) {
  const [allReviews, setAllReviews] = React.useState<StoryCard[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  React.useEffect(() => {
    // Single-field Firestore query for Category = Reviews & status = published
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      where("category", "==", "Reviews")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = Date.now();
        const livePosts = snapshot.docs
          .map((d) => ({ ...(d.data() as Post), id: d.id }))
          .filter((p) => {
            const t = getMillis(p.createdAt);
            return t === 0 || t <= now + 60000;
          });

        if (livePosts.length > 0) {
          const cards: StoryCard[] = livePosts.map((data) => ({
            id: data.id,
            category: data.category,
            title: data.title,
            description: data.description || (data.content || "").replace(/<[^>]*>/g, "").slice(0, 150) + "...",
            coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
            createdAt: formatDate(data.createdAt),
            rawCreatedAt: getMillis(data.createdAt),
            slug: data.slug,
            artistName: data.artistName,
            projectTitle: data.projectTitle,
            projectType: data.projectType,
            rating: data.rating,
            verdict: data.verdict,
            genre: data.genre || "Afrobeats",
            scoreBreakdown: data.scoreBreakdown || {
              production: Math.min(10, (data.rating || 8) + 0.2),
              lyricism: Math.max(0, (data.rating || 8) - 0.3),
              replayValue: Math.min(10, (data.rating || 8) + 0.1),
              originality: Math.max(0, (data.rating || 8) - 0.1),
            },
          }));
          setAllReviews(cards);
        } else {
          setAllReviews(MOCK_REVIEWS);
        }
        setLoading(false);
      },
      (error) => {
        console.error("useReviews onSnapshot error:", error);
        setAllReviews(MOCK_REVIEWS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter and Sort in memory
  const processedReviews = React.useMemo(() => {
    let list = [...allReviews];

    // Filter Project Type
    if (projectTypeFilter !== "All") {
      list = list.filter((r) => r.projectType === projectTypeFilter);
    }

    // Filter Genre
    if (genreFilter !== "All") {
      list = list.filter((r) =>
        (r.genre || "").toLowerCase().includes(genreFilter.toLowerCase())
      );
    }

    // Search Query
    if (searchQuery.trim() !== "") {
      const qTerm = searchQuery.toLowerCase().trim();
      list = list.filter((r) =>
        (r.title || "").toLowerCase().includes(qTerm) ||
        (r.artistName || "").toLowerCase().includes(qTerm) ||
        (r.projectTitle || "").toLowerCase().includes(qTerm)
      );
    }

    // Sort
    if (sortBy === "highest-rated") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      list.sort((a, b) => ((b as any).rawCreatedAt || 0) - ((a as any).rawCreatedAt || 0));
    }

    return list;
  }, [allReviews, projectTypeFilter, genreFilter, searchQuery, sortBy]);

  const totalEstimate = processedReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalEstimate / postsPerPage));
  const start = (currentPage - 1) * postsPerPage;
  const pageReviews = processedReviews.slice(start, start + postsPerPage);

  return {
    reviews: pageReviews,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalEstimate,
  };
}

