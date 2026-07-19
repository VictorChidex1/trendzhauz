import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useLatestStories,
  useTrendingPosts,
  useEditorPicks,
} from "../../hooks/useBlogData";

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
  const {
    stories,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useLatestStories(12);

  const { posts: trendingPosts } = useTrendingPosts();
  const { picks: editorPicks } = useEditorPicks();

  // Scroll to top of section on page change for good user experience (skipping initial mount)
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
                  {stories.map((story) => (
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
                          loading="lazy"
                          decoding="async"
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
                {trendingPosts.map((post) => (
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
                        loading="lazy"
                        decoding="async"
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
                {editorPicks.map((pick, index) => (
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
                        loading="lazy"
                        decoding="async"
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
