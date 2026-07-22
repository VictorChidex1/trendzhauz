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

// RICH MOCK REVIEWS FOR FALLBACK

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
    verdict:
      "A dazzling, rhythm-heavy collaboration showcasing two of Afrobeats' finest forces in peak synergy.",
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
    verdict:
      "A sprawling, emotional journey that reinforces Burna Boy's unmatched global songwriting capability.",
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
    verdict:
      "A smooth, vocally brilliant pop effort showing Fireboy DML's romantic lyricism in its finest form.",
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
    verdict:
      "A groundbreaking record that shifts the emotional boundaries of modern Afrobeats.",
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
    verdict:
      "A high-octane experimental project that showcases Seyi Vibez's relentless artistic drive.",
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
    verdict:
      "A potent, synth-heavy statement that proves Rema is one of the most adventurous stars of the decade.",
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
  sortBy: "newest" | "highest-rated" = "newest"
) {
  // Construct dynamic keys for cache
  const cacheKeyPage1 = `reviews_p1_${projectTypeFilter.toLowerCase()}_${sortBy}`;
  const cacheKeyCount = `reviews_count_${projectTypeFilter.toLowerCase()}`;

  const cachedPage1 = getCachedData<StoryCard[]>(cacheKeyPage1);
  const cachedCount = getCachedData<number>(cacheKeyCount);

  const [reviews, setReviews] = React.useState<StoryCard[]>(
    cachedPage1 && cachedCount ? cachedPage1 : []
  );
  const [loading, setLoading] = React.useState<boolean>(
    !(cachedPage1 && cachedCount)
  );
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalEstimate, setTotalEstimate] = React.useState<number>(
    cachedCount || 0
  );
  const [usingFallback, setUsingFallback] = React.useState<boolean>(false);

  // Pagination cursor cache
  const cursorCache = React.useRef<Map<number, DocumentSnapshot>>(new Map());
  // In-memory cache for visited pages
  const localPageCache = React.useRef<Map<number, StoryCard[]>>(new Map());

  // Reset caches and currentPage if filters or sorting change
  React.useEffect(() => {
    cursorCache.current.clear();
    localPageCache.current.clear();
    setCurrentPage(1);

    const freshPage1 = getCachedData<StoryCard[]>(cacheKeyPage1);
    const freshCount = getCachedData<number>(cacheKeyCount);

    if (freshPage1 && freshCount) {
      setReviews(freshPage1);
      setTotalEstimate(freshCount);
      localPageCache.current.set(1, freshPage1);
      setLoading(false);
    } else {
      setReviews([]);
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

  // 1. Get the total reviews count under this filter configuration
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
            // No reviews found — default to filtered mock fallback
            setUsingFallback(true);
            const filteredMock = MOCK_REVIEWS.filter(
              (r) =>
                projectTypeFilter === "All" ||
                r.projectType === projectTypeFilter
            );
            setReviews(filteredMock.slice(0, postsPerPage));
            setTotalEstimate(filteredMock.length);
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
          const filteredMock = MOCK_REVIEWS.filter(
            (r) =>
              projectTypeFilter === "All" || r.projectType === projectTypeFilter
          );
          setReviews(filteredMock.slice(0, postsPerPage));
          setTotalEstimate(filteredMock.length);
          setLoading(false);
        }
      }
    }

    countReviews();
    return () => {
      cancelled = true;
    };
  }, [projectTypeFilter, postsPerPage, cacheKeyCount, cacheKeyPage1]);

  // 2. Fetch page reviews under current filters and page cursor
  React.useEffect(() => {
    if (usingFallback) {
      const filteredMock = MOCK_REVIEWS.filter(
        (r) =>
          projectTypeFilter === "All" || r.projectType === projectTypeFilter
      );
      const start = (currentPage - 1) * postsPerPage;
      setReviews(filteredMock.slice(start, start + postsPerPage));
      setLoading(false);
      return;
    }

    // Serve from memory page cache if visited
    if (localPageCache.current.has(currentPage)) {
      setReviews(localPageCache.current.get(currentPage)!);
      setLoading(false);
      return;
    }

    // Skip network call if page 1 is fresh
    if (currentPage === 1 && isCacheFresh(cacheKeyPage1, TTL.LISTS) && cachedPage1) {
      setReviews(cachedPage1);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchReviewsPage() {
      setLoading(true);
      try {
        let cursor = cursorCache.current.get(currentPage);

        // On-demand locator: find closest cached cursor
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

        // Build current page query
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
            const filteredMock = MOCK_REVIEWS.filter(
              (r) =>
                projectTypeFilter === "All" ||
                r.projectType === projectTypeFilter
            );
            setReviews(filteredMock.slice(0, postsPerPage));
            setTotalEstimate(filteredMock.length);
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
                };
              }
            );

            localPageCache.current.set(currentPage, pageReviews);
            setReviews(pageReviews);

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
          const filteredMock = MOCK_REVIEWS.filter(
            (r) =>
              projectTypeFilter === "All" || r.projectType === projectTypeFilter
          );
          const start = (currentPage - 1) * postsPerPage;
          setReviews(filteredMock.slice(start, start + postsPerPage));
          setTotalEstimate(filteredMock.length);
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

  const totalPages = Math.ceil(totalEstimate / postsPerPage);

  return {
    reviews,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalEstimate,
  };
}
