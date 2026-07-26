import * as React from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { Post, StoryCard } from "../types/post";
import { sanitizeSearchInput } from "../utils/textSplit";

export type SearchCategoryFilter = "All" | "Music" | "Reviews" | "Videos" | "News";

export interface UseSearchResult {
  results: StoryCard[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: SearchCategoryFilter;
  setSelectedCategory: (cat: SearchCategoryFilter) => void;
  clearSearch: () => void;
}

/**
 * Custom hook providing 300ms debounced Firestore token array search queries
 * with category filtering.
 *
 * @param initialQuery - Initial query string
 * @param initialCategory - Initial category filter (default: "All")
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @param maxResults - Maximum result items to return (default: 8)
 */
export function useSearch(
  initialQuery = "",
  initialCategory: SearchCategoryFilter = "All",
  debounceMs = 300,
  maxResults = 8
): UseSearchResult {
  const [searchTerm, setSearchTerm] = React.useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = React.useState<SearchCategoryFilter>(initialCategory);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<StoryCard[]>([]);
  const [loading, setLoading] = React.useState(false);

  // 1. Debounce input value by 300ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debounceMs]);

  // 2. Query Firestore when debounced query or selected category changes
  React.useEffect(() => {
    const cleanQuery = debouncedQuery.trim();
    if (!cleanQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    const token = sanitizeSearchInput(cleanQuery);
    if (!token) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function executeSearch() {
      setLoading(true);
      try {
        let q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          where("searchIndex", "array-contains", token),
          where("createdAt", "<=", Timestamp.now()),
          orderBy("createdAt", "desc"),
          limit(maxResults)
        );

        if (selectedCategory !== "All") {
          q = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            where("category", "==", selectedCategory),
            where("searchIndex", "array-contains", token),
            where("createdAt", "<=", Timestamp.now()),
            orderBy("createdAt", "desc"),
            limit(maxResults)
          );
        }

        const snap = await getDocs(q);

        if (!cancelled) {
          if (!snap.empty) {
            const firestoreResults: StoryCard[] = snap.docs.map(
              (doc: QueryDocumentSnapshot) => {
                const data = doc.data() as Post;
                return {
                  id: doc.id,
                  category: data.category,
                  title: data.title,
                  description: data.description,
                  coverImageUrl: data.coverImageUrl,
                  createdAt: data.createdAt?.toDate
                    ? data.createdAt.toDate().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Jul 2026",
                  slug: data.slug,
                  artistName: data.artistName,
                  projectTitle: data.projectTitle,
                  projectType: data.projectType,
                  rating: data.rating,
                  verdict: data.verdict,
                };
              }
            );
            setResults(firestoreResults);
          } else {
            // No results from Firestore — show empty
            setResults([]);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Firestore search error:", error);
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, selectedCategory, maxResults]);

  const clearSearch = React.useCallback(() => {
    setSearchTerm("");
    setDebouncedQuery("");
    setResults([]);
  }, []);

  return {
    results,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    clearSearch,
  };
}
