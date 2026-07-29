import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Eye, Calendar } from "lucide-react";
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
                      href={`/${story.category.toLowerCase()}/${story.slug}`}
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
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 pb-12">
            {/* Trending Now Section */}
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand" /> Trending Now
              </h3>
            </div>

            <div className="flex flex-col gap-6">
              {trendingPosts.slice(0, 5).map((post, idx) => (
                <a
                  key={post.rank}
                  href={`/${(post.category || "news").toLowerCase()}/${post.slug}`}
                  className="group flex gap-4 items-start relative"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 shadow-md">
                    <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
                    <div className="absolute top-0 left-0 bg-brand text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-br-md shadow-sm z-10">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {post.views?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.createdAt}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Editor Picks Section */}
            {editorPicks.length > 0 && (
              <div className="mt-12 space-y-8">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" /> Editor's Picks
                  </h3>
                </div>
                <div className="flex flex-col gap-6">
                  {editorPicks.map((pick, index) => (
                    <a
                      key={index}
                      href={`/${(pick.category || "reviews").toLowerCase()}/${pick.slug}`}
                      className="group flex flex-col gap-3"
                    >
                      <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-zinc-800 shadow-md">
                        <img src={pick.coverImageUrl} alt={pick.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <div className="absolute bottom-2 left-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                          {pick.category || "News"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                          {pick.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {pick.createdAt}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
