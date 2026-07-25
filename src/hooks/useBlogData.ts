import * as React from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type {
  Post,
  HeroSlide,
  StoryCard,
  TrendingPost,
  EditorPick,
} from "../types/post";

// FALLBACK MOCK DATA (shown only if Firestore has 0 published posts)

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
    artistName: "Wizkid & Asake",
    projectTitle: "Real Vol. 1",
    projectType: "EP" as const,
    rating: 8.7,
    verdict: "A dazzling, rhythm-heavy collaboration showcasing two of Afrobeats' finest forces in peak synergy.",
  },
  {
    category: "Music",
    title:
      "Blaqbonez's “Chanel ft. Asake” Becomes His Most Streamed Spotify Song",
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
    title: "Davido & No11 – Gimme Dat Ting (Official Music Video)",
    description:
      "The official music video for Davido and NO11’s infectious collaboration, Gimme Dat Ting, is finally here.",
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

// HOOK 1: useHeroSlides (Real-Time Firestore Listener)
export function useHeroSlides() {
  const [slides, setSlides] = React.useState<HeroSlide[]>(FALLBACK_HERO_SLIDES);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
                link: `/blog/${found.slug}`,
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
                  link: `/blog/${p.slug}`,
                  image: p.coverImageUrl || "/assets/placeholder-cover.jpg",
                  meta: `By ${p.authorName || "TrendzHauz Editor"} · ${Math.max(1, Math.ceil((p.content || "").length / 1500))} Min Read`,
                  ctaText: CTA_MAP[p.category] || "Read Story",
                  slug: p.slug,
                });
              }
            });
          }

          if (liveSlides.length > 0) {
            setSlides(liveSlides);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Hero slides onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { slides, loading };
}

// HOOK 2: useLatestStories (Real-Time Firestore Listener)
export function useLatestStories(postsPerPage = 12) {
  const [allPosts, setAllPosts] = React.useState<StoryCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts = parsePublishedPosts(snapshot.docs);
        if (posts.length > 0) {
          const liveCards: StoryCard[] = posts.map((data) => ({
            id: data.id,
            category: data.category,
            title: data.title,
            description: data.description || (data.content || "").replace(/<[^>]*>/g, "").slice(0, 150) + "...",
            coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
            createdAt: formatDate(data.createdAt),
            slug: data.slug,
            artistName: data.artistName,
            projectTitle: data.projectTitle,
            projectType: data.projectType,
            rating: data.rating,
            verdict: data.verdict,
          }));
          setAllPosts(liveCards);
        } else {
          setAllPosts(FALLBACK_STORIES);
        }
        setLoading(false);
      },
      (error) => {
        console.error("useLatestStories onSnapshot error:", error);
        setAllPosts(FALLBACK_STORIES);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const totalEstimate = allPosts.length > 0 ? allPosts.length : FALLBACK_STORIES.length;
  const displayPosts = allPosts.length > 0 ? allPosts : FALLBACK_STORIES;
  const totalPages = Math.max(1, Math.ceil(totalEstimate / postsPerPage));

  const start = (currentPage - 1) * postsPerPage;
  const stories = displayPosts.slice(start, start + postsPerPage);

  return { stories, loading, currentPage, setCurrentPage, totalPages };
}

// HOOK 3: useTrendingPosts (Real-Time Firestore Listener)
export function useTrendingPosts() {
  const [posts, setPosts] = React.useState<TrendingPost[]>(FALLBACK_TRENDING);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const livePosts = parsePublishedPosts(snapshot.docs);
        if (livePosts.length > 0) {
          const ranked = livePosts
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5)
            .map((data, idx) => ({
              rank: idx + 1,
              title: data.title,
              coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
              createdAt: formatDate(data.createdAt),
              slug: data.slug,
            }));
          setPosts(ranked);
        }
        setLoading(false);
      },
      (error) => {
        console.error("useTrendingPosts onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { posts, loading };
}

// HOOK 4: useEditorPicks (Real-Time Firestore Listener)
export function useEditorPicks() {
  const [picks, setPicks] = React.useState<EditorPick[]>(FALLBACK_EDITOR_PICKS);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const livePosts = parsePublishedPosts(snapshot.docs);
        const editorOnly = livePosts.filter((p) => p.isEditorPick);
        const source = editorOnly.length > 0 ? editorOnly : livePosts;

        if (source.length > 0) {
          const livePicks: EditorPick[] = source.slice(0, 3).map((data) => ({
            category: data.category,
            title: data.title,
            coverImageUrl: data.coverImageUrl || "/assets/placeholder-cover.jpg",
            createdAt: formatDate(data.createdAt),
            slug: data.slug,
          }));
          setPicks(livePicks);
        }
        setLoading(false);
      },
      (error) => {
        console.error("useEditorPicks onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { picks, loading };
}
