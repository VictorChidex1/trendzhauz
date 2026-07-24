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
import { sanitizeSearchInput, normalizeText } from "../utils/textSplit";

// Combined mock database fallback for local search testing
const MOCK_SEARCH_POOL: StoryCard[] = [
  {
    id: "search-mock-1",
    category: "Reviews",
    title: "Wizkid & Asake - Real Vol.1 EP Review",
    description: "Wizkid and Asake dominate the streaming landscape with Real Vol.1 EP.",
    coverImageUrl: "/assets/Wizkid-Asake-Real-Vol.-1-EP.webp",
    createdAt: "Jul 18, 2026",
    slug: "wizkid-asake-real-vol1-audiomack",
    artistName: "Wizkid & Asake",
    projectTitle: "Real Vol. 1",
    projectType: "EP",
    rating: 8.7,
    verdict: "A dazzling, rhythm-heavy collaboration showcasing two of Afrobeats' finest forces.",
  },
  {
    id: "search-mock-2",
    category: "Music",
    title: "Blaqbonez's 'Chanel ft. Asake' Hits New Spotify Record",
    description: "Blaqbonez reaches a new career milestone as Chanel becomes his most streamed song.",
    coverImageUrl: "/assets/Blaqbonez-Chanel.jpg",
    createdAt: "Jul 17, 2026",
    slug: "blaqbonez-chanel-asake",
  },
  {
    id: "search-mock-3",
    category: "News",
    title: "Burna Boy Reaches 17 Million Spotify Followers",
    description: "Burna Boy remains Africa's most followed artist on Spotify.",
    coverImageUrl: "/assets/Burna-Boy.webp",
    createdAt: "Jul 16, 2026",
    slug: "burna-boy-17-million-spotify-followers",
    artistName: "Burna Boy",
    rating: 9.1,
  },
  {
    id: "search-mock-4",
    category: "Videos",
    title: "Davido & No11 - Gimme Dat Ting (Official Music Video)",
    description: "The official music video for Davido and NO11's infectious collaboration.",
    coverImageUrl: "/assets/Davido-No11-Gimme-Dat-Ting-Official-Music-Video.jpg",
    createdAt: "Jul 15, 2026",
    slug: "davido-no11-gimme-dat-ting",
  },
  {
    id: "search-mock-5",
    category: "Reviews",
    title: "Fireboy DML - Adore: Modern Afropop Rhapsody",
    description: "Fireboy DML delivers a sonic love letter in his romantic project.",
    coverImageUrl: "/assets/Fireboy-DML.jpg",
    createdAt: "Jul 17, 2026",
    slug: "fireboy-adore-review",
    artistName: "Fireboy DML",
    projectTitle: "Adore",
    projectType: "Single",
    rating: 8.2,
  },
  {
    id: "search-mock-6",
    category: "Music",
    title: "DJ Davisy's Summer Heat Mix Performance",
    description: "Go behind the scenes of DJ Davisy's high-contrast studio session.",
    coverImageUrl: "/assets/DJ-Davisy-Grime-Trap-Mixtape.jpg",
    createdAt: "Jul 12, 2026",
    slug: "dj-davisy-summer-heat-mix",
  },
];

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
 * with category filtering and automatic local memory fallback.
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

  // 2. Query Firestore or memory fallback when debounced query or selected category changes
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
        // Model A: published + createdAt <= now + searchIndex token
        // orderBy createdAt required when using inequality on createdAt
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
            // Firestore returned empty results — perform local memory fallback search
            const normalizedQuery = normalizeText(cleanQuery);
            const memoryHits = MOCK_SEARCH_POOL.filter((item) => {
              const matchesCategory =
                selectedCategory === "All" ||
                item.category.toLowerCase() === selectedCategory.toLowerCase();
              if (!matchesCategory) return false;

              const itemText = normalizeText(
                `${item.title} ${item.description || ""} ${item.artistName || ""} ${item.category}`
              );
              return itemText.includes(normalizedQuery) || itemText.includes(token);
            }).slice(0, maxResults);

            setResults(memoryHits);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Firestore search error, defaulting to memory search:", error);
        if (!cancelled) {
          const normalizedQuery = normalizeText(cleanQuery);
          const memoryHits = MOCK_SEARCH_POOL.filter((item) => {
            const matchesCategory =
              selectedCategory === "All" ||
              item.category.toLowerCase() === selectedCategory.toLowerCase();
            if (!matchesCategory) return false;

            const itemText = normalizeText(
              `${item.title} ${item.description || ""} ${item.artistName || ""} ${item.category}`
            );
            return itemText.includes(normalizedQuery) || itemText.includes(token);
          }).slice(0, maxResults);

          setResults(memoryHits);
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
