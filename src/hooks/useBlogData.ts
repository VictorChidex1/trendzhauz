import * as React from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type {
  Post,
  HeroSlide,
  StoryCard,
  TrendingPost,
  EditorPick,
} from "../types/post";

// ─────────────────────────────────────────────
// FALLBACK MOCK DATA (shown when Firestore is empty)
// ─────────────────────────────────────────────

const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    category: "Music",
    title: "Exclusive Launch: DJ Davisy's Summer Heat Mix Performance",
    description:
      "Go behind the scenes of the high-contrast studio session and stream the full high-definition set now.",
    link: "/category/music",
    image: "/assets/DJ-Davisy-Grime-Trap-Mixtape.jpg",
    meta: "By DJ Davisy · 6 Min Read",
    ctaText: "Stream Music",
    slug: "dj-davisy-summer-heat-mix",
  },
  {
    category: "Reviews",
    title: "Review: Burna Boy's Live Orchestral Showcase in London",
    description:
      "An editorial analysis of the historic night at the Royal Albert Hall where Afrobeats fused with classical orchestration.",
    link: "/category/reviews",
    image: "/assets/live_concert_orchestral.png",
    meta: "By Editorial Team · 5 Min Read",
    ctaText: "Read Review",
    slug: "burna-boy-orchestral-showcase",
  },
  {
    category: "Videos",
    title: "Davido's 'No. 11': A Masterclass in Global Afrobeats",
    description:
      "An editorial analysis of the visual storytelling and cultural impact of the latest major music video release from the Afrobeats titan.",
    link: "/category/videos",
    image: "/assets/Davido-No11-Gimme-Dat-Ting-Official-Music-Video.jpg",
    meta: "By Video Desk · 4 Min Read",
    ctaText: "Watch Mix",
    slug: "davido-no11-gimme-dat-ting",
  },
];

const FALLBACK_BASE_STORIES = [
  {
    category: "Reviews",
    title:
      "Wizkid & Asake's Real Vol.1 Climbs to No. 2 on Audiomack's 2026 Nigerian Projects List",
    description:
      "Wizkid and Asake continue to dominate the streaming landscape as their collaborative EP, Real Vol.1, has officially become the second most-streamed Nigerian project of 2026 on Audiomack.",
    coverImageUrl: "/assets/Wizkid-Asake-Real-Vol.-1-EP.webp",
    createdAt: "Jul 18, 2026",
    slug: "wizkid-asake-real-vol1-audiomack",
  },
  {
    category: "Music",
    title:
      "Blaqbonez's \u201cChanel ft. Asake\u201d Becomes His Most Streamed Spotify Song",
    description:
      "Blaqbonez has reached a new career milestone as his hit collaboration with Asake, Chanel, has officially become his most streamed song on Spotify.",
    coverImageUrl: "/assets/Blaqbonez-Chanel.jpg",
    createdAt: "Jul 17, 2026",
    slug: "blaqbonez-chanel-asake",
  },
  {
    category: "News",
    title:
      "Burna Boy Reaches 17 Million Spotify Followers, Remains Africa's Most Followed Artist",
    description:
      "Over the years, Burna Boy has consistently broken barriers for African music on streaming platforms, setting new benchmarks with his albums, singles, and international collaborations.",
    coverImageUrl: "/assets/Burna-Boy.webp",
    createdAt: "Jul 16, 2026",
    slug: "burna-boy-17-million-spotify-followers",
  },
  {
    category: "Videos",
    title: "Davido & No11 \u2013 Gimme Dat Ting (Official Music Video)",
    description:
      "The official music video for Davido and NO11\u2019s infectious collaboration, Gimme Dat Ting, is finally here.",
    coverImageUrl:
      "/assets/Davido-No11-Gimme-Dat-Ting-Official-Music-Video.jpg",
    createdAt: "Jul 15, 2026",
    slug: "davido-no11-gimme-dat-ting",
  },
];

const FALLBACK_STORIES: StoryCard[] = Array.from({ length: 24 }).map(
  (_, i) => ({
    ...FALLBACK_BASE_STORIES[i % FALLBACK_BASE_STORIES.length],
    id: `fallback-${i + 1}`,
  })
);

const FALLBACK_TRENDING: TrendingPost[] = [
  {
    rank: 1,
    title:
      "Rema's 'Calm Down' Becomes First Afrobeats Song to Cross 2 Billion Streams",
    coverImageUrl: "/assets/crowd_concert.png",
    createdAt: "Jul 15, 2026",
    slug: "rema-2-billion",
  },
  {
    rank: 2,
    title: "Burna Boy Announces Epic New Stadium Tour Across North America",
    coverImageUrl: "/assets/live_concert_orchestral.png",
    createdAt: "Jul 14, 2026",
    slug: "burna-stadium-tour",
  },
  {
    rank: 3,
    title:
      "Olamide Drops Surprise EP 'Unruly' Featuring Young Jonn and Fireboy DML",
    coverImageUrl: "/assets/Olamide-Unruly.png",
    createdAt: "Jul 13, 2026",
    slug: "olamide-unruly",
  },
  {
    rank: 4,
    title: "DJ Davisy's Top 50 Summer Club Mix Playlist: Listen Now",
    coverImageUrl: "/assets/DJ-Davisy-Grime-Trap-Mixtape.jpg",
    createdAt: "Jul 12, 2026",
    slug: "dj-davisy-summer-mix",
  },
  {
    rank: 5,
    title: "Tems Earns Historic Diamond Certification for Summer Hit Single",
    coverImageUrl: "/assets/afrobeats_performance.png",
    createdAt: "Jul 11, 2026",
    slug: "tems-diamond-certification",
  },
];

const FALLBACK_EDITOR_PICKS: EditorPick[] = [
  {
    category: "Reviews",
    title: "Review: Fireboy DML's 'Adore' Showcases Artistic Maturity",
    coverImageUrl: "/assets/Fireboy-DML.jpg",
    createdAt: "Jul 17, 2026",
    slug: "fireboy-adore-review",
  },
  {
    category: "Reviews",
    title: "Review: Omah Lay's Dark Afrobeats Production Rules the Night",
    coverImageUrl: "/assets/live_concert_orchestral.png",
    createdAt: "Jul 16, 2026",
    slug: "omah-lay-review",
  },
  {
    category: "Reviews",
    title: "Review: Seyi Vibez's 'Lagos Memoirs' EP Review",
    coverImageUrl: "/assets/crowd_concert.png",
    createdAt: "Jul 15, 2026",
    slug: "seyi-vibez-review",
  },
];

// ─────────────────────────────────────────────
// HELPER: Format Firestore Timestamp to readable string
// ─────────────────────────────────────────────
function formatDate(timestamp: Post["createdAt"]): string {
  if (!timestamp || !timestamp.toDate) return "Unknown Date";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
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

// ─────────────────────────────────────────────
// HOOK 1: useHeroSlides
// Fetches the latest published post from each of the 4 categories (parallel fetch).
// ─────────────────────────────────────────────
export function useHeroSlides() {
  const [slides, setSlides] = React.useState<HeroSlide[]>(FALLBACK_HERO_SLIDES);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const categories = ["Music", "Reviews", "Videos", "News"];

    async function fetchSlides() {
      try {
        const promises = categories.map((cat) => {
          const q = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            where("category", "==", cat.toLowerCase()),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          return getDocs(q);
        });

        const snapshots = await Promise.all(promises);
        const liveSlides: HeroSlide[] = [];

        snapshots.forEach((snap, idx) => {
          if (!snap.empty) {
            const doc = snap.docs[0];
            const data = doc.data() as Post;
            liveSlides.push({
              category: categories[idx],
              title: data.title,
              description: data.description,
              link: `/category/${categories[idx].toLowerCase()}`,
              image: data.coverImageUrl,
              meta: `By ${data.authorName} · ${Math.ceil(
                data.content.length / 1500
              )} Min Read`,
              ctaText: CTA_MAP[categories[idx]] || "Read Story",
              slug: data.slug,
            });
          }
        });

        if (!cancelled) {
          // Only use live data if we got at least 2 slides
          if (liveSlides.length >= 2) {
            setSlides(liveSlides);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch hero slides:", error);
        if (!cancelled) setLoading(false);
      }
    }

    fetchSlides();
    return () => {
      cancelled = true;
    };
  }, []);

  return { slides, loading };
}

// ─────────────────────────────────────────────
// HOOK 2: useLatestStories
// Fetches published posts ordered by createdAt desc, with cursor pagination (12 per page).
// ─────────────────────────────────────────────
export function useLatestStories(postsPerPage = 12) {
  const [stories, setStories] = React.useState<StoryCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalEstimate, setTotalEstimate] = React.useState(0);
  const [usingFallback, setUsingFallback] = React.useState(false);

  // Cache document cursors for each page boundary
  const cursorCache = React.useRef<Map<number, DocumentSnapshot>>(new Map());

  // On mount, estimate total published posts count
  React.useEffect(() => {
    let cancelled = false;

    async function countPosts() {
      try {
        // Firestore doesn't have a native count on free tier,
        // so we fetch IDs only to estimate
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("createdAt", "desc"),
          limit(100) // Cap at 100 for estimation
        );
        const snap = await getDocs(q);

        if (!cancelled) {
          if (snap.empty) {
            // No posts in Firestore — use fallback data
            setUsingFallback(true);
            setStories(FALLBACK_STORIES.slice(0, postsPerPage));
            setTotalEstimate(FALLBACK_STORIES.length);
            setLoading(false);
          } else {
            setTotalEstimate(snap.size);
            // Cache the cursors for pagination
            snap.docs.forEach((doc, idx) => {
              // Store cursor at the end of each page boundary
              if ((idx + 1) % postsPerPage === 0) {
                cursorCache.current.set(
                  Math.floor(idx / postsPerPage) + 2,
                  doc
                );
              }
            });
          }
        }
      } catch (error) {
        console.error("Failed to count posts:", error);
        if (!cancelled) {
          setUsingFallback(true);
          setStories(FALLBACK_STORIES.slice(0, postsPerPage));
          setTotalEstimate(FALLBACK_STORIES.length);
          setLoading(false);
        }
      }
    }

    countPosts();
    return () => {
      cancelled = true;
    };
  }, [postsPerPage]);

  // Fetch actual page data
  React.useEffect(() => {
    if (usingFallback) {
      // Paginate fallback data locally
      const start = (currentPage - 1) * postsPerPage;
      setStories(FALLBACK_STORIES.slice(start, start + postsPerPage));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPage() {
      setLoading(true);
      try {
        let q;
        const cursor = cursorCache.current.get(currentPage);

        if (currentPage === 1 || !cursor) {
          // First page or no cached cursor: start from the beginning
          q = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
            limit(postsPerPage)
          );
        } else {
          // Use startAfter cursor for subsequent pages
          q = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
            startAfter(cursor),
            limit(postsPerPage)
          );
        }

        const snap = await getDocs(q);

        if (!cancelled) {
          if (snap.empty && currentPage === 1) {
            // Database is empty — fallback
            setUsingFallback(true);
            setStories(FALLBACK_STORIES.slice(0, postsPerPage));
            setTotalEstimate(FALLBACK_STORIES.length);
          } else {
            const pageStories: StoryCard[] = snap.docs.map(
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
                };
              }
            );
            setStories(pageStories);

            // Cache last doc as cursor for next page
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
        console.error("Failed to fetch stories page:", error);
        if (!cancelled) {
          setUsingFallback(true);
          const start = (currentPage - 1) * postsPerPage;
          setStories(FALLBACK_STORIES.slice(start, start + postsPerPage));
          setTotalEstimate(FALLBACK_STORIES.length);
          setLoading(false);
        }
      }
    }

    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [currentPage, postsPerPage, usingFallback]);

  const totalPages = Math.ceil(totalEstimate / postsPerPage);

  return { stories, loading, currentPage, setCurrentPage, totalPages };
}

// ─────────────────────────────────────────────
// HOOK 3: useTrendingPosts
// Fetches top 5 published posts sorted by views desc, then createdAt desc (cold-start safe).
// ─────────────────────────────────────────────
export function useTrendingPosts() {
  const [posts, setPosts] = React.useState<TrendingPost[]>(FALLBACK_TRENDING);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchTrending() {
      try {
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("views", "desc"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const snap = await getDocs(q);

        if (!cancelled) {
          if (!snap.empty) {
            const livePosts: TrendingPost[] = snap.docs.map((doc, idx) => {
              const data = doc.data() as Post;
              return {
                rank: idx + 1,
                title: data.title,
                coverImageUrl: data.coverImageUrl,
                createdAt: formatDate(data.createdAt),
                slug: data.slug,
              };
            });
            setPosts(livePosts);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch trending posts:", error);
        if (!cancelled) setLoading(false);
      }
    }

    fetchTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading };
}

// ─────────────────────────────────────────────
// HOOK 4: useEditorPicks
// Fetches top 3 published posts where isEditorPick == true, sorted by createdAt desc.
// ─────────────────────────────────────────────
export function useEditorPicks() {
  const [picks, setPicks] = React.useState<EditorPick[]>(FALLBACK_EDITOR_PICKS);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchPicks() {
      try {
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          where("isEditorPick", "==", true),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const snap = await getDocs(q);

        if (!cancelled) {
          if (!snap.empty) {
            const livePicks: EditorPick[] = snap.docs.map((doc) => {
              const data = doc.data() as Post;
              return {
                category: data.category,
                title: data.title,
                coverImageUrl: data.coverImageUrl,
                createdAt: formatDate(data.createdAt),
                slug: data.slug,
              };
            });
            setPicks(livePicks);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch editor picks:", error);
        if (!cancelled) setLoading(false);
      }
    }

    fetchPicks();
    return () => {
      cancelled = true;
    };
  }, []);

  return { picks, loading };
}
