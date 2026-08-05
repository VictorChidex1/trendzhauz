import * as React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Newspaper,
  Calendar,
  Flame,
  Eye,
  Zap,
  Share2,
  Check,
  TrendingUp,
} from "lucide-react";
import { useEditorPicks } from "@/hooks/useBlogData";
import { useNewsPosts } from "@/hooks/useNewsPosts";

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

function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/news/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="absolute top-2 right-2 bg-black/50 hover:bg-brand text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 z-20 shadow-lg border border-white/10"
      aria-label="Share article"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
    </button>
  );
}

type DayBucket = "Today" | "Yesterday" | "This Week" | "Earlier";

const BUCKET_ORDER: DayBucket[] = ["Today", "Yesterday", "This Week", "Earlier"];

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function bucketOf(ms: number, now: number): DayBucket {
  if (!ms) return "Earlier";
  const todayStart = startOfDay(now);
  if (ms >= todayStart) return "Today";
  if (ms >= todayStart - 86_400_000) return "Yesterday";
  if (ms >= todayStart - 6 * 86_400_000) return "This Week";
  return "Earlier";
}

export default function NewsPage() {
  const {
    posts,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
  } = useNewsPosts(12);
  const { picks: editorPicks } = useEditorPicks("news");

  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (currentPage === 1) return;
    const timer = setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const [nowMs, setNowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    const tick = () => setNowMs(Date.now());
    const id = window.setInterval(tick, 60_000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const leadStory = posts[0] || null;
  const tickerItems = posts.slice(0, 8);

  const trendingPosts = React.useMemo(
    () =>
      [...posts]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5),
    [posts]
  );

  const dayGroups = React.useMemo(() => {
    const groups = new Map<DayBucket, typeof posts>();
    BUCKET_ORDER.forEach((b) => groups.set(b, []));
    posts.forEach((post) => {
      const bucket = bucketOf(post.createdAtMs, nowMs);
      groups.get(bucket)?.push(post);
    });
    return BUCKET_ORDER.filter((b) => (groups.get(b)?.length ?? 0) > 0).map(
      (b) => ({ label: b, items: groups.get(b) ?? [] })
    );
  }, [posts, nowMs]);

  if (loading && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">
          Loading News...
        </p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
          Couldn&apos;t load news
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
    <div className="flex flex-col flex-1 w-full bg-background">
      {leadStory && (
        <section className="relative w-full min-h-[600px] lg:min-h-[700px] flex flex-col group bg-zinc-950">
          <img
            src={leadStory.coverImageUrl}
            alt={leadStory.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform transform-gpu duration-1000 lg:group-hover:scale-105 z-0 opacity-60"
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
                    Latest News
                  </span>
                  {leadStory.isEditorPick && (
                    <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" /> Editor&apos;s Pick
                    </span>
                  )}
                </div>

                <Link to={`/news/${leadStory.slug}`} className="block group/title">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[1.1] group-hover/title:text-brand transition-colors">
                    {leadStory.title}
                  </h1>
                </Link>

                <p className="text-zinc-300 text-sm sm:text-base md:text-lg max-w-2xl line-clamp-3 leading-relaxed">
                  {leadStory.description}
                </p>

                <p className="text-zinc-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand" />
                  Published {leadStory.createdAtLabel}
                </p>

                <div className="pt-2">
                  <Link
                    to={`/news/${leadStory.slug}`}
                    className="inline-flex bg-brand hover:bg-brand/90 text-white font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-brand/20 items-center gap-2"
                  >
                    Read Full Story <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <>
          {/* Breaking ticker */}
          <section className="relative z-20 border-b border-zinc-800 bg-zinc-950 text-white overflow-hidden">
            <div className="flex items-stretch">
              <div className="flex-shrink-0 flex items-center gap-2 bg-brand px-4 py-2.5">
                <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Breaking
                </span>
              </div>
              <div className="relative flex-1 overflow-hidden flex items-center">
                <div className="flex whitespace-nowrap animate-[news-ticker_40s_linear_infinite] motion-reduce:animate-none hover:[animation-play-state:paused] motion-reduce:overflow-x-auto">
                  {[...tickerItems, ...tickerItems].map((post, idx) => (
                    <Link
                      key={`${post.id}-${idx}`}
                      to={`/news/${post.slug}`}
                      className="inline-flex items-center gap-2 px-6 text-xs font-bold text-zinc-300 hover:text-brand transition-colors flex-shrink-0"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                      {post.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div ref={gridRef} className="lg:col-span-8 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-zinc-900 dark:border-white pb-4">
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                  <Newspaper className="w-8 h-8 text-brand" /> Latest News
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {totalCount > 0
                    ? `${totalCount} ${totalCount === 1 ? "story" : "stories"} · Page ${currentPage} of ${totalPages}`
                    : null}
                </span>
              </div>

              {loading && posts.length > 0 && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Updating…
                </p>
              )}

              {posts.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    className="space-y-12"
                  >
                    {dayGroups.map((group) => (
                      <div key={group.label} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xs font-black uppercase tracking-widest text-brand flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                            {group.label}
                          </h3>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
                          {group.items.map((post) => {
                            const isNewDrop =
                              post.createdAtMs > nowMs - 2 * 86_400_000;
                            return (
                              <motion.div
                                key={post.id}
                                variants={itemVariants}
                                className="group relative flex flex-col"
                              >
                                <div className="relative block">
                                  <Link
                                    to={`/news/${post.slug}`}
                                    className="block aspect-square relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] dark:shadow-none dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-hover:-translate-y-1 transition-all duration-300"
                                  >
                                    {/* inner ring for glossy magazine feel */}
                                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10 z-10 pointer-events-none" />
                                    <img
                                      src={post.coverImageUrl}
                                      alt={post.title}
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                      <div className="w-12 h-12 rounded-full bg-brand/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 shadow-xl backdrop-blur-md">
                                        <ArrowRight className="w-5 h-5" />
                                      </div>
                                    </div>
                                    {isNewDrop && (
                                      <div className="absolute top-2 left-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-md">
                                        New Drop
                                      </div>
                                    )}
                                    {!isNewDrop && post.isEditorPick && (
                                      <div className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-md">
                                        Hot
                                      </div>
                                    )}
                                  </Link>
                                  
                                  <ShareButton slug={post.slug} />
                                </div>

                                <Link
                                  to={`/news/${post.slug}`}
                                  className="block space-y-1"
                                >
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="h-2.5 w-2.5 text-brand" />
                                    {post.createdAtLabel}
                                  </p>
                                  <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-brand transition-colors leading-snug">
                                    {post.title}
                                  </h3>
                                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest">
                                    {post.authorName || "TrendzHauz Editor"}
                                  </p>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 p-12 sm:p-20 flex flex-col items-center justify-center text-center shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 via-zinc-900/50 to-zinc-950" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
                      <Zap className="w-8 h-8 text-brand animate-pulse" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-3">
                      Stay Tuned
                    </h3>
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs max-w-md leading-relaxed">
                      Our editors are currently tracking the hottest stories. Chart buzz, exclusive drops, and tour news will appear here shortly.
                    </p>
                  </div>
                </div>
              )}

              {totalPages > 1 && (
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
                  <Eye className="w-5 h-5 text-brand" /> Most Read
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">
                  From this page · sorted by views
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {trendingPosts.slice(0, 5).map((post, idx) => (
                  <Link
                    key={post.id}
                    to={`/news/${post.slug}`}
                    className="group flex gap-4 items-start relative"
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 shadow-md">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute top-0 left-0 bg-brand text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-br-md shadow-sm z-10">
                        {idx + 1}
                      </div>

                      {idx < 2 && (
                        <div className="absolute -bottom-2 -right-2 bg-background border border-border rounded-full p-1.5 shadow-lg z-20" title="Trending Up">
                          <TrendingUp className="w-3 h-3 text-brand" />
                        </div>
                      )}
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
                    Not enough data to show most-read news.
                  </p>
                )}
              </div>

              {editorPicks.length > 0 && (
                <div className="mt-12 space-y-8">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-500" /> Editor&apos;s
                      Picks
                    </h3>
                  </div>
                  <div className="flex flex-col gap-6">
                    {editorPicks.map((post) => (
                      <Link
                        key={post.slug}
                        to={`/${(post.category || "news").toLowerCase()}/${post.slug}`}
                        className="group flex flex-col gap-3"
                      >
                        <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-zinc-800 shadow-md">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          <div className="absolute bottom-2 left-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                            {post.category || "News"}
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
