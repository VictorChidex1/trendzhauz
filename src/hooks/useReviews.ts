/**
 * Reviews list: hybrid data source.
 *
 * DEFAULT MODE (no filters): server-side cursor pagination + SWR cache via
 * the shared useCursorPaginatedPosts hook. "Highest Rated" sorting is done
 * server-side with orderBy("rating", "desc") — no full fetch.
 *
 * FILTERED MODE (format / genre / search active): falls back to a full
 * category onSnapshot fetch + in-memory filtering/sorting (existing
 * pipeline). This is intentionally Phase 1 — Phase 2 migrates the filters
 * to server-side queries.
 */

import * as React from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useCursorPaginatedPosts } from "./useCursorPaginatedPosts";
import { getMillis, formatDateLabel } from "../utils/date";
import type { Post, StoryCard } from "../types/post";

export type ProjectTypeFilter = "All" | "Album" | "EP" | "Single" | "Mixtape";
export type GenreFilter =
  | "All"
  | "Afrobeats"
  | "Amapiano"
  | "Hip-Hop"
  | "Street-Pop"
  | "R&B";

function toStoryCard(data: Post): StoryCard {
  return {
    id: data.id,
    category: data.category,
    title: data.title,
    description:
      data.description ||
      (data.content || "").replace(/<[^>]*>/g, "").slice(0, 150) + "...",
    coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
    createdAt: formatDateLabel(getMillis(data.createdAt)),
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
  };
}

function docToReviewCard(docSnap: QueryDocumentSnapshot): StoryCard {
  return toStoryCard({ ...(docSnap.data() as Post), id: docSnap.id });
}

export function useReviews(
  postsPerPage = 12,
  projectTypeFilter: ProjectTypeFilter = "All",
  sortBy: "newest" | "highest-rated" = "newest",
  genreFilter: GenreFilter = "All",
  searchQuery = ""
) {
  const isFiltered =
    projectTypeFilter !== "All" ||
    genreFilter !== "All" ||
    searchQuery.trim() !== "";

  // Server-side mode (paused while a filtered view is active).
  const server = useCursorPaginatedPosts<StoryCard>({
    cachePrefix: "reviews",
    pageSize: postsPerPage,
    baseFilters: { status: "published", category: "Reviews" },
    orderFields: sortBy === "highest-rated" ? ["rating", "createdAt"] : ["createdAt"],
    mapDoc: docToReviewCard,
    errorMessage: "Could not load reviews. Check your connection or try again.",
    enabled: !isFiltered,
  });

  // Filtered mode: full category snapshot + in-memory pipeline.
  const [allReviews, setAllReviews] = React.useState<StoryCard[]>([]);
  const [filteredLoading, setFilteredLoading] = React.useState(false);
  const [filteredPage, setFilteredPage] = React.useState(1);

  React.useEffect(() => {
    if (!isFiltered) {
      setAllReviews([]);
      return;
    }

    setFilteredLoading(true);

    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      where("category", "==", "Reviews")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const now = Date.now();
        const cards: StoryCard[] = snapshot.docs
          .map((d) => ({ ...(d.data() as Post), id: d.id }))
          .filter((p) => {
            const t = getMillis(p.createdAt);
            return t === 0 || t <= now + 60000;
          })
          .map(toStoryCard);
        setAllReviews(cards);
        setFilteredLoading(false);
      },
      (error) => {
        console.error("useReviews onSnapshot error:", error);
        setAllReviews([]);
        setFilteredLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isFiltered]);

  // Mode switch always lands on page 1.
  const { resetPage: serverResetPage } = server;
  React.useEffect(() => {
    if (isFiltered) {
      setFilteredPage(1);
    } else {
      serverResetPage();
    }
  }, [isFiltered, serverResetPage]);

  // Filter and Sort in memory (filtered mode only).
  const processedReviews = React.useMemo(() => {
    let list = [...allReviews];

    if (projectTypeFilter !== "All") {
      list = list.filter((r) => r.projectType === projectTypeFilter);
    }

    if (genreFilter !== "All") {
      list = list.filter((r) =>
        (r.genre || "").toLowerCase().includes(genreFilter.toLowerCase())
      );
    }

    if (searchQuery.trim() !== "") {
      const qTerm = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.title || "").toLowerCase().includes(qTerm) ||
          (r.artistName || "").toLowerCase().includes(qTerm) ||
          (r.projectTitle || "").toLowerCase().includes(qTerm)
      );
    }

    if (sortBy === "highest-rated") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      list.sort(
        (a, b) => (b.rawCreatedAt || 0) - (a.rawCreatedAt || 0)
      );
    }

    return list;
  }, [allReviews, projectTypeFilter, genreFilter, searchQuery, sortBy]);

  if (isFiltered) {
    const totalEstimate = processedReviews.length;
    const totalPages = Math.max(1, Math.ceil(totalEstimate / postsPerPage));
    const start = (filteredPage - 1) * postsPerPage;
    const pageReviews = processedReviews.slice(start, start + postsPerPage);

    return {
      reviews: pageReviews,
      loading: filteredLoading,
      currentPage: filteredPage,
      setCurrentPage: setFilteredPage,
      totalPages,
      totalEstimate,
    };
  }

  return {
    reviews: server.posts,
    loading: server.loading,
    currentPage: server.currentPage,
    setCurrentPage: server.setCurrentPage,
    totalPages: server.totalPages,
    totalEstimate: server.totalCount,
  };
}
