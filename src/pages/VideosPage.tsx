import * as React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ArrowRight,
  ArrowLeft,
  Video,
  Calendar,
  Flame,
  Eye,
} from "lucide-react";
import { UniversalMusicPlayer } from "@/components/blog/UniversalMusicPlayer";
import { useEditorPicks } from "@/hooks/useBlogData";
import {
  useVideosPosts,
} from "@/hooks/useVideosPosts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
} as const;

export default function VideosPage() {
  const {
    posts,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
  } = useVideosPosts(12);
  const { picks: videosEditorPicks } = useEditorPicks("videos");

  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (currentPage === 1) return;
    const timer = setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const heroPost = posts.find((p) => p.isEditorPick) || posts[0] || null;
  const trendingPosts = React.useMemo(
    () =>
      [...posts]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5),
    [posts]
  );

  const heroVideoUrl = heroPost ? heroPost.videoUrl : null;

  if (loading && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">
          Loading Videos...
        </p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
          Couldn&apos;t load videos
        </h2>
        <p className="text-sm text-muted-foreground font-medium">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white text-xs font-black uppercase tracking-widest rounded-md hover:bg-brand/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {heroPost && (
        <section className="relative w-full min-h-[600px] lg:min-h-[700px] flex flex-col group bg-zinc-950">
          <img
            src={heroPost.coverImageUrl}
            alt={heroPost.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 z-0 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-0" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end flex-1 pt-32 pb-12 lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8"
            >
              <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-brand text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg">
                    Latest Video
                  </span>
                  {heroPost.isEditorPick && (
                    <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" /> Editor&apos;s
                      Pick
                    </span>
                  )}
                </div>

                <Link
                  to={`/videos/${heroPost.slug}`}
                  className="block group/title"
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[1.1] group-hover/title:text-brand transition-colors">
                    {heroPost.title}
                  </h1>
                </Link>

                <p className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl line-clamp-3 leading-relaxed">
                  {heroPost.description}
                </p>

                <div className="pt-2">
                  <Link
                    to={`/videos/${heroPost.slug}`}
                    className="inline-flex bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-brand/20 items-center gap-2"
                  >
                    Watch Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {heroVideoUrl && (
                <div className="w-full lg:w-[560px] flex-shrink-0">
                  <div className="rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 bg-zinc-900/50 backdrop-blur-md">
                    <UniversalMusicPlayer
                      url={heroVideoUrl}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div ref={gridRef} className="lg:col-span-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-zinc-900 dark:border-white pb-4">
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                  <Video className="w-8 h-8 text-brand" /> New Videos
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {totalCount > 0
                    ? `${totalCount} ${totalCount === 1 ? "video" : "videos"} · Page ${currentPage} of ${totalPages}`
                    : null}
                </span>
              </div>

              {loading && posts.length > 0 && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Updating…
                </p>
              )}

              <AnimatePresence mode="wait">
                {posts.length > 0 ? (
                  <motion.div
                    key={currentPage}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
                  >
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={itemVariants}
                        className="group relative"
                      >
                        <Link
                          to={`/videos/${post.slug}`}
                          className="block aspect-video relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-3 shadow-md group-hover:shadow-xl transition-all duration-300"
                        >
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-brand/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 shadow-xl backdrop-blur-md">
                              <Play className="w-5 h-5 ml-1 fill-current" />
                            </div>
                          </div>
                          {post.isEditorPick && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-md">
                              Hot
                            </div>
                          )}
                        </Link>

                        <Link
                          to={`/videos/${post.slug}`}
                          className="block space-y-1"
                        >
                          <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-brand transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest">
                            {post.authorName || "TrendzHauz"}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
                      No new videos yet.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                      Publish a Videos story from the CMS to see it here.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {totalCount > 12 && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-8 border-t border-border">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-md border border-border bg-background text-foreground hover:border-brand hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        return Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis =
                          prev !== undefined && page - prev > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-1 text-muted-foreground text-xs">
                                …
                              </span>
                            )}
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[2.25rem] h-9 px-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${
                                page === currentPage
                                  ? "bg-brand text-white shadow-sm"
                                  : "border border-border text-foreground hover:border-brand hover:text-brand"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-md border border-border bg-background text-foreground hover:border-brand hover:text-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 pb-12">
              <div className="border-b border-border pb-4">
                <h3 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Flame className="w-5 h-5 text-brand" /> Trending in Videos
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">
                  From this page · sorted by views
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {trendingPosts.slice(0, 5).map((post, idx) => (
                  <Link
                    key={post.id}
                    to={`/videos/${post.slug}`}
                    className="group flex gap-4 items-start relative"
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 shadow-md">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
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
                          <Eye className="w-3 h-3" />{" "}
                          {post.views?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.createdAtLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {trendingPosts.length === 0 && (
                  <p className="text-sm text-muted-foreground font-medium italic">
                    Not enough data to show trending videos.
                  </p>
                )}
              </div>

              {videosEditorPicks.length > 0 && (
                <div className="mt-12 space-y-8">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-500" /> Editor&apos;s
                      Picks
                    </h3>
                  </div>
                  <div className="flex flex-col gap-6">
                    {videosEditorPicks.map((post) => (
                      <Link
                        key={post.slug}
                        to={`/videos/${post.slug}`}
                        className="group flex flex-col gap-3"
                      >
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-800 shadow-md">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          <div className="absolute bottom-2 left-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                            {post.category || "Videos"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {post.createdAt}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
