import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Base Mock Stories
const BASE_STORIES = [
  {
    category: "Reviews",
    title:
      "Wizkid & Asake’s Real Vol.1 Climbs to No. 2 on Audiomack’s 2026 Nigerian Projects List",
    description:
      "Wizkid and Asake continue to dominate the streaming landscape as their collaborative EP, Real Vol.1, has officially become the second most-streamed Nigerian project of 2026 on Audiomack.",
    coverImageUrl: "/assets/Wizkid-Asake-Real-Vol.-1-EP.webp",
    createdAt: "Jul 18, 2026",
    slug: "wizkid-asake-real-vol1-audiomack",
  },
  {
    category: "Music",
    title:
      "Blaqbonez’s “Chanel ft. Asake” Becomes His Most Streamed Spotify Song",
    description:
      "Blaqbonez has reached a new career milestone as his hit collaboration with Asake, Chanel, has officially become his most streamed song on Spotify.",
    coverImageUrl: "/assets/Blaqbonez-Chanel.jpg",
    createdAt: "Jul 17, 2026",
    slug: "blaqbonez-chanel-asake",
  },
  {
    category: "News",
    title:
      "Burna Boy Reaches 17 Million Spotify Followers, Remains Africa’s Most Followed Artist",
    description:
      "Over the years, Burna Boy has consistently broken barriers for African music on streaming platforms, setting new benchmarks with his albums, singles, and international collaborations. His Spotify following continues to climb as listeners around the world discover and revisit his music.",
    coverImageUrl: "/assets/Burna-Boy.webp",
    createdAt: "Jul 16, 2026",
    slug: "burna-boy-17-million-spotify-followers",
  },
  {
    category: "Videos",
    title: "Davido & No11 – Gimme Dat Ting (Official Music Video)",
    description:
      "The official music video for Davido and NO11‘s infectious collaboration, Gimme Dat Ting, is finally here.",
    coverImageUrl:
      "/assets/Davido-No11-Gimme-Dat-Ting-Official-Music-Video.jpg",
    createdAt: "Jul 15, 2026",
    slug: "davido-no11-gimme-dat-ting",
  },
];

// Generate 24 stories (duplicating the 4 base stories 6 times)
const MAIN_STORIES = Array.from({ length: 24 }).map((_, index) => {
  const baseStory = BASE_STORIES[index % BASE_STORIES.length];
  return {
    ...baseStory,
    id: `story-${index + 1}`,
  };
});

// Mock Data for Right Sidebar: Trending Now
const TRENDING_POSTS = [
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

// Mock Data for Right Sidebar: Editor Picks / Latest Reviews
const EDITOR_PICKS = [
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

// Framer Motion Grid Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;



export function LatestArticles() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const POSTS_PER_PAGE = 12;

  const totalPages = Math.ceil(MAIN_STORIES.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedStories = MAIN_STORIES.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Scroll to top of section on page change for good user experience
  const sectionRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  return (
    <section ref={sectionRef} className="w-full bg-background py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          {/* ── Left Column: Main Editorial Feed (2/3 width) ── */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-foreground">
                Latest Stories
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {/* Stories List */}
            <div className="flex flex-col gap-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-10"
                >
                  {paginatedStories.map((story) => (
                    <a
                      key={story.id}
                      href={`/blog/${story.slug}`}
                      className="group flex flex-col sm:flex-row gap-6 p-4 rounded-sm border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all duration-300"
                    >
                      {/* Thumbnail */}
                      <div className="w-full sm:w-60 aspect-[16/10] bg-zinc-100 dark:bg-zinc-900/60 rounded-sm overflow-hidden shrink-0 relative border border-zinc-200/20 dark:border-zinc-800/20">
                        <img
                          src={story.coverImageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute bottom-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-brand text-white px-2.5 py-1 rounded-sm shadow-sm">
                          {story.category}
                        </span>
                      </div>

                      {/* Metadata Content */}
                      <div className="flex flex-col justify-between py-1">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            {story.createdAt}
                          </p>
                          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-brand transition-colors duration-200 leading-snug">
                            {story.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {story.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand group-hover:translate-x-1 inline-flex items-center gap-1 transition-transform duration-200 mt-4 sm:mt-0">
                          Read Story →
                        </span>
                      </div>
                    </a>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 flex items-center justify-center text-xs font-black rounded-sm transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-brand text-white"
                          : "border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* ── Right Column: Sticky Sidebar Feed (1/3 width) ── */}
          <div className="lg:col-span-4 space-y-12 lg:sticky lg:top-24">
            {/* Trending Now Section */}
            <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-6 rounded-md border border-zinc-200/40 dark:border-zinc-900/60 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-5">
                Trending Now
              </h3>

              <div className="flex flex-col">
                {TRENDING_POSTS.map((post) => (
                  <a
                    key={post.rank}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4 items-center py-4 border-b border-zinc-100 dark:border-zinc-900/40 last:border-0"
                  >
                    {/* Image with Rank Badge */}
                    <div className="relative w-16 h-16 rounded-sm overflow-hidden shrink-0 border border-zinc-200/20 dark:border-zinc-800/20">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Absolute Rank Badge */}
                      <span className="absolute top-0 left-0 bg-brand text-white font-black text-[9px] w-5 h-5 flex items-center justify-center rounded-br-sm shadow-sm">
                        {post.rank}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-200 group-hover:text-brand transition-colors duration-200 leading-tight line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        {post.createdAt}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Editor Picks Section */}
            <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-6 rounded-md border border-zinc-200/40 dark:border-zinc-900/60 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-5">
                Editor Picks
              </h3>

              <div className="flex flex-col gap-5">
                {EDITOR_PICKS.map((pick, index) => (
                  <a
                    key={index}
                    href={`/blog/${pick.slug}`}
                    className="group flex gap-4 items-center"
                  >
                    {/* Cover image */}
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900/60 rounded-sm overflow-hidden shrink-0 relative border border-zinc-200/20 dark:border-zinc-800/20">
                      <img
                        src={pick.coverImageUrl}
                        alt={pick.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {/* Content */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-brand">
                        {pick.category}
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-200 group-hover:text-brand transition-colors duration-200 leading-tight line-clamp-2">
                        {pick.title}
                      </h4>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        {pick.createdAt}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
