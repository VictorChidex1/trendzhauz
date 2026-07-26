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
        setLoading(false);
      },
      (error) => {
        console.error("useReviews onSnapshot error:", error);
        setAllReviews([]);
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
