import * as React from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  getCountFromServer,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { Post, StoryCard } from "../types/post";
import {
  getCachedData,
  isCacheFresh,
  setCachedData,
  TTL,
} from "../utils/queryCache";

// RICH MOCK REVIEWS FOR FALLBACK (COMPLETE WITH GENRE & SCORE BREAKDOWNS)
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
  {
    id: "review-fallback-3",
    category: "Reviews",
    title: "Fireboy DML - 'Adore': A Modern Afropop Rhapsody",
    description:
      "Fireboy DML delivers a sonic love letter. We review the songwriting, clean melodies, and lush instrumentation.",
    coverImageUrl: "/assets/live_concert_orchestral.png",
    createdAt: "Jul 12, 2026",
    slug: "fireboy-dml-adore-review",
    artistName: "Fireboy DML",
    projectTitle: "Adore",
    projectType: "Single",
    rating: 8.2,
    genre: "R&B",
    verdict:
      "A smooth, vocally brilliant pop effort showing Fireboy DML's romantic lyricism in its finest form.",
    scoreBreakdown: {
      production: 8.5,
      lyricism: 8.6,
      replayValue: 8.0,
      originality: 7.8,
    },
  },
  {
    id: "review-fallback-4",
    category: "Reviews",
    title: "Omah Lay - 'Boy Alone': A Masterclass in Dark Afrobeats",
    description:
      "An editorial analysis of Omah Lay's debut LP, exploring its melancholic themes, deep basslines, and sheer vulnerability.",
    coverImageUrl: "/assets/crowd_concert.png",
    createdAt: "Jul 09, 2026",
    slug: "omah-lay-boy-alone-review",
    artistName: "Omah Lay",
    projectTitle: "Boy Alone",
    projectType: "Album",
    rating: 9.3,
    genre: "Afrobeats",
    verdict:
      "A groundbreaking record that shifts the emotional boundaries of modern Afrobeats.",
    scoreBreakdown: {
      production: 9.5,
      lyricism: 9.3,
      replayValue: 9.6,
      originality: 8.8,
    },
  },
  {
    id: "review-fallback-5",
    category: "Reviews",
    title: "Seyi Vibez - 'Lagos Memoirs': Neo-Apala Experimental Sounds",
    description:
      "Seyi Vibez captures the raw spirit of mainland Lagos on this EP. Read our track-by-track breakdown and review.",
    coverImageUrl: "/assets/DJ-Davisy-Grime-Trap-Mixtape.jpg",
    createdAt: "Jul 05, 2026",
    slug: "seyi-vibez-lagos-memoirs-review",
    artistName: "Seyi Vibez",
    projectTitle: "Lagos Memoirs",
    projectType: "EP",
    rating: 7.9,
    genre: "Street-Pop",
    verdict:
      "A high-octane experimental project that showcases Seyi Vibez's relentless artistic drive.",
    scoreBreakdown: {
      production: 7.8,
      lyricism: 7.5,
      replayValue: 8.2,
      originality: 8.1,
    },
  },
  {
    id: "review-fallback-6",
    category: "Reviews",
    title: "Rema - 'Ravage': Rave Lord's Dark Synth Mixtape",
    description:
      "We review Rema's short-form project, analyzing the trap drums, industrial synths, and his signature Indian-scale vocal runs.",
    coverImageUrl: "/assets/live_concert_orchestral.png",
    createdAt: "Jun 28, 2026",
    slug: "rema-ravage-review",
    artistName: "Rema",
    projectTitle: "Ravage",
    projectType: "Mixtape",
    rating: 8.5,
    genre: "Amapiano",
    verdict:
      "A potent, synth-heavy statement that proves Rema is one of the most adventurous stars of the decade.",
    scoreBreakdown: {
      production: 8.8,
      lyricism: 8.0,
      replayValue: 8.6,
      originality: 8.6,
    },
  },
  {
    id: "review-fallback-7",
    category: "Reviews",
    title: "Odumodublvck - 'Eziokwu': Grime & Drill Meets Nigerian Highlife",
    description:
      "An aggressive, energetic masterpiece blending UK Drill 808s with raw Nigerian street hip-hop culture.",
    coverImageUrl: "/assets/DJ-Davisy-Grime-Trap-Mixtape.jpg",
    createdAt: "Jun 20, 2026",
    slug: "odumodublvck-eziokwu-review",
    artistName: "Odumodublvck",
    projectTitle: "Eziokwu",
    projectType: "Mixtape",
    rating: 8.8,
    genre: "Hip-Hop",
    verdict:
      "A thunderous, culture-shifting tape that cements Odumodublvck as the leader of modern Nigerian hip-hop.",
    scoreBreakdown: {
      production: 9.0,
      lyricism: 8.4,
      replayValue: 9.1,
      originality: 8.7,
    },
  },
];

// Helper to format Firestore date
function formatDate(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
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
  // Construct dynamic keys for cache
  const cacheKeyPage1 = `reviews_p1_${projectTypeFilter.toLowerCase()}_${sortBy}`;
  const cacheKeyCount = `reviews_count_${projectTypeFilter.toLowerCase()}`;

  const cachedPage1 = getCachedData<StoryCard[]>(cacheKeyPage1);
  const cachedCount = getCachedData<number>(cacheKeyCount);

  const [rawReviews, setRawReviews] = React.useState<StoryCard[]>(
    cachedPage1 && cachedCount ? cachedPage1 : []
  );
  const [loading, setLoading] = React.useState<boolean>(
    !(cachedPage1 && cachedCount)
  );
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [, setTotalEstimate] = React.useState<number>(
    cachedCount || 0
  );
  const [usingFallback, setUsingFallback] = React.useState<boolean>(false);

  // Pagination cursor cache
  const cursorCache = React.useRef<Map<number, DocumentSnapshot>>(new Map());
  // In-memory cache for visited pages
  const localPageCache = React.useRef<Map<number, StoryCard[]>>(new Map());

  // Reset caches and currentPage if base filters change
  React.useEffect(() => {
    cursorCache.current.clear();
    localPageCache.current.clear();
    setCurrentPage(1);

    const freshPage1 = getCachedData<StoryCard[]>(cacheKeyPage1);
    const freshCount = getCachedData<number>(cacheKeyCount);

    if (freshPage1 && freshCount) {
      setRawReviews(freshPage1);
      setTotalEstimate(freshCount);
      localPageCache.current.set(1, freshPage1);
      setLoading(false);
    } else {
      setRawReviews([]);
      setTotalEstimate(0);
      setLoading(true);
    }
  }, [projectTypeFilter, sortBy, cacheKeyPage1, cacheKeyCount]);

  // Sync state if cached value loads asynchronously
  React.useEffect(() => {
    if (cachedPage1 && currentPage === 1) {
      localPageCache.current.set(1, cachedPage1);
    }
  }, [cachedPage1, currentPage]);

  // 1. Count total reviews in Firestore
  React.useEffect(() => {
    if (isCacheFresh(cacheKeyCount, TTL.LISTS) && isCacheFresh(cacheKeyPage1, TTL.LISTS)) {
      return;
    }

    let cancelled = false;

    async function countReviews() {
      try {
        let q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          where("category", "==", "Reviews")
        );

        if (projectTypeFilter !== "All") {
          q = query(q, where("projectType", "==", projectTypeFilter));
        }

        const countSnap = await getCountFromServer(q);

        if (!cancelled) {
          const count = countSnap.data().count;
          if (count === 0) {
            setUsingFallback(true);
            setRawReviews(MOCK_REVIEWS);
            setTotalEstimate(MOCK_REVIEWS.length);
            setLoading(false);
          } else {
            setTotalEstimate(count);
            setCachedData(cacheKeyCount, count);
          }
        }
      } catch (error) {
        console.error("Failed to query reviews count:", error);
        if (!cancelled) {
          setUsingFallback(true);
          setRawReviews(MOCK_REVIEWS);
          setTotalEstimate(MOCK_REVIEWS.length);
          setLoading(false);
        }
      }
    }

    countReviews();
    return () => {
      cancelled = true;
    };
  }, [projectTypeFilter, postsPerPage, cacheKeyCount, cacheKeyPage1]);

  // 2. Fetch page reviews from Firestore
  React.useEffect(() => {
    if (usingFallback) {
      setRawReviews(MOCK_REVIEWS);
      setLoading(false);
      return;
    }

    if (localPageCache.current.has(currentPage)) {
      setRawReviews(localPageCache.current.get(currentPage)!);
      setLoading(false);
      return;
    }

    if (currentPage === 1 && isCacheFresh(cacheKeyPage1, TTL.LISTS) && cachedPage1) {
      setRawReviews(cachedPage1);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchReviewsPage() {
      setLoading(true);
      try {
        let cursor = cursorCache.current.get(currentPage);

        if (!cursor && currentPage > 1) {
          let prevPage = currentPage - 1;
          while (prevPage > 1 && !cursorCache.current.has(prevPage)) {
            prevPage--;
          }
          const prevCursor = cursorCache.current.get(prevPage);
          const skipCount = (currentPage - prevPage) * postsPerPage;

          let tempQ = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            where("category", "==", "Reviews")
          );

          if (projectTypeFilter !== "All") {
            tempQ = query(tempQ, where("projectType", "==", projectTypeFilter));
          }

          if (sortBy === "highest-rated") {
            tempQ = query(
              tempQ,
              orderBy("rating", "desc"),
              orderBy("createdAt", "desc")
            );
          } else {
            tempQ = query(tempQ, orderBy("createdAt", "desc"));
          }

          tempQ = query(
            tempQ,
            ...(prevCursor ? [startAfter(prevCursor)] : []),
            limit(skipCount)
          );

          const tempSnap = await getDocs(tempQ);

          tempSnap.docs.forEach((doc, idx) => {
            const docPage = prevPage + Math.floor((idx + 1) / postsPerPage);
            if ((idx + 1) % postsPerPage === 0 && docPage < currentPage) {
              cursorCache.current.set(docPage + 1, doc);
            }
          });

          if (tempSnap.docs.length === skipCount) {
            cursor = tempSnap.docs[tempSnap.docs.length - 1];
            cursorCache.current.set(currentPage, cursor);
          }
        }

        let q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          where("category", "==", "Reviews")
        );

        if (projectTypeFilter !== "All") {
          q = query(q, where("projectType", "==", projectTypeFilter));
        }

        if (sortBy === "highest-rated") {
          q = query(q, orderBy("rating", "desc"), orderBy("createdAt", "desc"));
        } else {
          q = query(q, orderBy("createdAt", "desc"));
        }

        if (currentPage > 1 && cursor) {
          q = query(q, startAfter(cursor), limit(postsPerPage));
        } else {
          q = query(q, limit(postsPerPage));
        }

        const snap = await getDocs(q);

        if (!cancelled) {
          if (snap.empty && currentPage === 1) {
            setUsingFallback(true);
            setRawReviews(MOCK_REVIEWS);
            setTotalEstimate(MOCK_REVIEWS.length);
          } else {
            const pageReviews: StoryCard[] = snap.docs.map(
              (doc: QueryDocumentSnapshot) => {
                const data = doc.data() as Post;
                return {
                  id: doc.id,
                  category: data.category,
                  title: data.title,
                  description: data.description,
                  coverImageUrl: data.coverImageUrl,
                  createdAt: formatDate(data.createdAt),
                  slug: data.slug,
                  artistName: data.artistName,
                  projectTitle: data.projectTitle,
                  projectType: data.projectType,
                  rating: data.rating,
                  verdict: data.verdict,
                  genre: data.genre || "Afrobeats",
                  scoreBreakdown: data.scoreBreakdown || {
                    production: (data.rating || 8) + 0.2 > 10 ? 10 : (data.rating || 8) + 0.2,
                    lyricism: (data.rating || 8) - 0.3,
                    replayValue: (data.rating || 8) + 0.1 > 10 ? 10 : (data.rating || 8) + 0.1,
                    originality: (data.rating || 8) - 0.1,
                  },
                };
              }
            );

            localPageCache.current.set(currentPage, pageReviews);
            setRawReviews(pageReviews);

            if (currentPage === 1) {
              setCachedData(cacheKeyPage1, pageReviews);
            }

            if (snap.docs.length === postsPerPage) {
              cursorCache.current.set(
                currentPage + 1,
                snap.docs[snap.docs.length - 1]
              );
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch reviews page:", error);
        if (!cancelled) {
          setUsingFallback(true);
          setRawReviews(MOCK_REVIEWS);
          setTotalEstimate(MOCK_REVIEWS.length);
          setLoading(false);
        }
      }
    }

    fetchReviewsPage();
    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    postsPerPage,
    projectTypeFilter,
    sortBy,
    usingFallback,
    cacheKeyPage1,
  ]);

  // 3. APPLY CLIENT-SIDE LIVE IN-MEMORY FILTERS (Score Range, Genre, Inline Search)
  const filteredReviews = React.useMemo(() => {
    return rawReviews.filter((review) => {
      // Format Filter
      if (
        projectTypeFilter !== "All" &&
        review.projectType !== projectTypeFilter
      ) {
        return false;
      }

      // Genre Filter
      if (genreFilter !== "All") {
        const reviewGenre = (review.genre || "").toLowerCase();
        if (!reviewGenre.includes(genreFilter.toLowerCase())) {
          return false;
        }
      }

      // Inline Live Search Query (Artist Name or Project Title)
      if (searchQuery.trim() !== "") {
        const queryTerm = searchQuery.toLowerCase().trim();
        const artist = (review.artistName || "").toLowerCase();
        const project = (review.projectTitle || "").toLowerCase();
        const title = (review.title || "").toLowerCase();

        const matches =
          artist.includes(queryTerm) ||
          project.includes(queryTerm) ||
          title.includes(queryTerm);

        if (!matches) return false;
      }

      return true;
    });
  }, [rawReviews, projectTypeFilter, genreFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / postsPerPage));

  return {
    reviews: filteredReviews,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalEstimate: filteredReviews.length,
  };
}
