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
  Mail,
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
  const [subscribed, setSubscribed] = React.useState(false);

  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (currentPage === 1) return;
    const timer = setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const nowMs = React.useMemo(() => Date.now(), []);

  const leadStory = posts[0] || null;
  const secondaryStories = posts.slice(1, 3);
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

          {/* The Buzz — lead story + just-in stories */}
          <section className="relative bg-zinc-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {leadStory && (
                <Link
                  to={`/news/${leadStory.slug}`}
                  className="lg:col-span-8 relative aspect-[16/9] rounded-2xl overflow-hidden group bg-zinc-900"
                >
                  <img
                    src={leadStory.coverImageUrl}
                    alt={leadStory.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 space-y-3">
                    <span className="inline-flex bg-brand text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg">
                      The Buzz
                    </span>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-tight group-hover:text-brand transition-colors line-clamp-3">
                      {leadStory.title}
                    </h1>
                    <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl line-clamp-2">
                      {leadStory.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand" />
                        Published {leadStory.createdAtLabel}
                      </span>
                      {leadStory.isEditorPick && (
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          Editor&apos;s Pick
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {secondaryStories.map((post) => (
                  <Link
                    key={post.id}
                    to={`/news/${post.slug}`}
                    className="group relative aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-900"
                  >
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-2">
                      <span className="inline-flex bg-zinc-900/80 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm border border-white/10">
                        Just In
                      </span>
                      <h3 className="font-black text-base sm:text-lg leading-snug group-hover:text-brand transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-brand" />
                        {post.createdAtLabel}
                      </p>
                    </div>
                  </Link>
                ))}
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
                                className="group relative"
                              >
                                <Link
                                  to={`/news/${post.slug}`}
                                  className="block aspect-square relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-3 shadow-md group-hover:shadow-xl transition-all duration-300"
                                >
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
                <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
                    No stories yet — chart buzz, drops &amp; tour news coming
                    soon.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                    Publish a News story from the CMS to see it here.
                  </p>
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

              <div className="mt-12 rounded-xl border border-border bg-gradient-to-br from-brand/10 via-transparent to-transparent p-6 space-y-4">
                <h3 className="text-lg font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand" /> The Drop
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get the hottest drops, chart moves and tour news in your
                  inbox — no spam, just heat.
                </p>
                {subscribed ? (
                  <p className="text-xs font-bold text-brand uppercase tracking-widest">
                    You&apos;re on the list — stay locked.
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubscribed(true);
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="w-full px-4 py-2.5 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                    <button
                      type="submit"
                      className="w-full bg-brand hover:bg-brand/90 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-md transition-colors"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
