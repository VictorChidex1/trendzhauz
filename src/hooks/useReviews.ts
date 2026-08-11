/**
 * Reviews list: hybrid data source.
 *
 * DEFAULT MODE (no filters): server-side cursor pagination + SWR cache via
 * the shared useCursorPaginatedPosts hook. "Highest Rated" sorting is done
 * server-side with orderBy("rating", "desc").
 *
 * FILTERED MODE (format / genre / search active): server-side Firestore
 * queries with dynamic WHERE clauses + cursor pagination + getCountFromServer.
 * Genre and projectType are pushed to Firestore as equality filters.
 * Search uses searchIndex array-contains; when search is active, genre
 * and projectType are applied in-memory as secondary filters on the
 * server-fetched results to avoid combinatorial index explosion.
 */

import * as React from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  startAfter,
  orderBy,
  limit,
  type QueryDocumentSnapshot,
  type QueryConstraint,
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

  // ── Filtered Mode: server-side Firestore queries + cursor pagination ──
  const [filteredPosts, setFilteredPosts] = React.useState<StoryCard[]>([]);
  const [filteredPage, setFilteredPage] = React.useState(1);
  const [filteredTotalCount, setFilteredTotalCount] = React.useState(0);
  const [filteredLoading, setFilteredLoading] = React.useState(false);
  const pageCursors = React.useRef<Map<number, QueryDocumentSnapshot>>(new Map());

  const hasSearch = searchQuery.trim() !== "";

  // Build Firestore query constraints from the active filters.
  const listConstraints = React.useMemo((): QueryConstraint[] => {
    const c: QueryConstraint[] = [
      where("status", "==", "published"),
      where("category", "==", "Reviews"),
    ];

    // Push equality filters to Firestore only when NOT searching.
    // When search is active, genre/projectType are applied in-memory
    // on the server-fetched results (avoids combinatorial index explosion).
    if (!hasSearch) {
      if (genreFilter !== "All") c.push(where("genre", "==", genreFilter));
      if (projectTypeFilter !== "All") c.push(where("projectType", "==", projectTypeFilter));
    }

    if (hasSearch) {
      const token = searchQuery.trim().toLowerCase().split(/\s+/)[0];
      c.push(where("searchIndex", "array-contains", token));
    }

    if (sortBy === "highest-rated") {
      c.push(orderBy("rating", "desc"));
      c.push(orderBy("createdAt", "desc"));
    } else {
      c.push(orderBy("createdAt", "desc"));
    }

    return c;
  }, [hasSearch, genreFilter, projectTypeFilter, searchQuery, sortBy]);

  // Count query: same WHERE clauses, no ORDER BY, no LIMIT.
  const countConstraints = React.useMemo((): QueryConstraint[] => {
    return listConstraints.filter(
      (c) => c.type !== "orderBy" && c.type !== "limit"
    );
  }, [listConstraints]);

  // Reset to page 1 when filters change.
  React.useEffect(() => {
    if (isFiltered) {
      setFilteredPage(1);
      pageCursors.current.clear();
    }
  }, [isFiltered, genreFilter, projectTypeFilter, searchQuery, sortBy]);

  // Mode switch resets.
  const { resetPage: serverResetPage } = server;
  React.useEffect(() => {
    if (!isFiltered) serverResetPage();
  }, [isFiltered, serverResetPage]);

  // Fetch total count (runs once per filter combination).
  React.useEffect(() => {
    if (!isFiltered) {
      setFilteredTotalCount(0);
      return;
    }

    let cancelled = false;

    async function loadCount() {
      try {
        const q = query(collection(db, "posts"), ...countConstraints);
        const snap = await getCountFromServer(q);
        if (!cancelled) {
          const raw = snap.data().count;
          // When search is active + genre/projectType filters applied
          // in-memory, the Firestore count is an upper bound.
          setFilteredTotalCount(raw);
        }
      } catch (err) {
        console.error("useReviews getCountFromServer error:", err);
        if (!cancelled) setFilteredTotalCount(0);
      }
    }

    loadCount();
    return () => { cancelled = true; };
  }, [isFiltered, countConstraints]);

  // Fetch page data.
  React.useEffect(() => {
    if (!isFiltered) {
      setFilteredPosts([]);
      return;
    }

    let cancelled = false;
    setFilteredLoading(true);

    async function loadPage() {
      try {
        const constraints = [...listConstraints];
        if (filteredPage > 1) {
          const cursor = pageCursors.current.get(filteredPage - 1);
          if (cursor) constraints.push(startAfter(cursor));
        }
        constraints.push(limit(postsPerPage));

        const q = query(collection(db, "posts"), ...constraints);
        const snap = await getDocs(q);

        if (cancelled) return;

        const now = Date.now();
        let cards: StoryCard[] = snap.docs
          .map((d) => ({ ...(d.data() as Post), id: d.id }))
          .filter((p) => {
            const t = getMillis(p.createdAt);
            return t === 0 || t <= now + 60000;
          })
          .map(toStoryCard);

        // Cache the cursor for the next page.
        if (snap.docs.length > 0) {
          pageCursors.current.set(
            filteredPage,
            snap.docs[snap.docs.length - 1]
          );
        }

        // When search is active, apply genre/projectType in-memory
        // as secondary filters on the server-fetched results.
        if (hasSearch) {
          if (genreFilter !== "All") {
            cards = cards.filter(
              (c) => (c.genre || "").toLowerCase() === genreFilter.toLowerCase()
            );
          }
          if (projectTypeFilter !== "All") {
            cards = cards.filter((c) => c.projectType === projectTypeFilter);
          }
        }

        if (!cancelled) {
          setFilteredPosts(cards);
          setFilteredLoading(false);
        }
      } catch (err) {
        console.error("useReviews filtered query error:", err);
        if (!cancelled) {
          setFilteredPosts([]);
          setFilteredLoading(false);
        }
      }
    }

    loadPage();
    return () => { cancelled = true; };
  }, [isFiltered, listConstraints, filteredPage, postsPerPage, hasSearch, genreFilter, projectTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTotalCount / postsPerPage));

  if (isFiltered) {
    return {
      reviews: filteredPosts,
      loading: filteredLoading,
      currentPage: filteredPage,
      setCurrentPage: setFilteredPage,
      totalPages,
      totalEstimate: filteredTotalCount,
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
