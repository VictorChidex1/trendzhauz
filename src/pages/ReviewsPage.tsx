import * as React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, SlidersHorizontal, Calendar, Award } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import type { StoryCard } from "@/types/post";

// Simple container variants for staggered list entry
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

export default function ReviewsPage() {
  const [projectTypeFilter, setProjectTypeFilter] = React.useState<
    "All" | "Album" | "EP" | "Single" | "Mixtape"
  >("All");
  const [sortBy, setSortBy] = React.useState<"newest" | "highest-rated">(
    "newest"
  );

  const {
    reviews,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalEstimate,
  } = useReviews(12, projectTypeFilter, sortBy);

  // Scroll to top of window on page change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Find the spotlight featured review (highest rated or first published depending on sort)
  const spotlightReview: StoryCard | null =
    reviews.length > 0 ? reviews[0] : null;
  const remainingReviews = reviews.length > 1 ? reviews.slice(1) : reviews;

  // Render a mini SVG rating ring
  const RatingRing = ({ rating }: { rating: number }) => {
    const score = rating || 0;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    // Rating scale is 0 to 10, map to 0 - 1 progress fraction
    const progress = score / 10;
    const strokeDashoffset = circumference - progress * circumference;

    const isHigh = score >= 8.0;

    return (
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/10 text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:scale-105 group-hover:border-brand/40">
        <svg
          viewBox="0 0 44 44"
          className="absolute inset-0 h-full w-full -rotate-90"
        >
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-zinc-800/40"
            strokeWidth="2.5"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            className={`${
              isHigh ? "stroke-brand" : "stroke-zinc-400"
            } transition-all duration-300`}
            strokeWidth="2.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs font-black relative z-10 leading-none">
          {score.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col w-full bg-background transition-colors duration-300 pb-20">
      {/* ── SPOTLIGHT BILLBOARD (Hero Banner) ── */}
      {spotlightReview && currentPage === 1 && (
        <section className="relative w-full min-h-[580px] md:h-[65vh] md:min-h-[500px] bg-zinc-950 overflow-hidden flex items-end pt-24 md:pt-0">
          {/* Background Widescreen Project Cover Image */}
          <div className="absolute inset-0 w-full h-full transform-gpu">
            <img
              src={spotlightReview.coverImageUrl}
              alt={spotlightReview.title}
              className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent" />
            {/* Ambient orange brand glows */}
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 md:pb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center space-x-2 bg-brand text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-md">
                <Flame className="h-3 w-3 fill-current" />
                <span>Featured Review</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tighter leading-none">
                {spotlightReview.artistName}{" "}
                <span className="text-zinc-400 font-extralight block sm:inline">
                  /
                </span>{" "}
                {spotlightReview.projectTitle}
              </h1>

              {/* Description */}
              {spotlightReview.description && (
                <p className="text-zinc-200 text-sm sm:text-base font-semibold max-w-xl leading-relaxed">
                  {spotlightReview.description}
                </p>
              )}

              {spotlightReview.verdict && (
                <p className="text-zinc-100 text-xs sm:text-sm font-medium max-w-lg italic border-l-2 border-brand pl-3">
                  "{spotlightReview.verdict}"
                </p>
              )}

              <div className="flex items-center space-x-4 pt-2">
                <Link
                  to={`/post/${spotlightReview.slug}`}
                  className="bg-white hover:bg-brand hover:text-white text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-sm transition-all duration-300 shadow-lg inline-block"
                >
                  Read Full Review
                </Link>
                <div className="text-zinc-400 text-xs font-semibold">
                  Published {spotlightReview.createdAt}
                </div>
              </div>
            </div>

            {/* Large Score Plate */}
            <div className="flex flex-col items-center justify-center self-start md:self-end bg-zinc-950/70 backdrop-blur-xl border border-white/10 p-6 rounded-md shadow-[0_0_50px_-12px_rgba(249,115,22,0.25)] text-center min-w-[140px]">
              <div className="text-[10px] font-black tracking-widest text-zinc-200 uppercase mb-2">
                Score
              </div>
              <div className="text-5xl font-black tracking-tighter text-brand leading-none mb-1 drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]">
                {spotlightReview.rating?.toFixed(1)}
              </div>
              <div className="text-[9px] font-black tracking-widest text-zinc-300 uppercase">
                {spotlightReview.projectType || "ALBUM"} REVIEW
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FILTER & SORT CONTROLS ── */}
      <section className="sticky top-20 z-40 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-background/95 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <div className="flex items-center space-x-1 p-1 bg-zinc-100 dark:bg-zinc-900/60 rounded-md border border-zinc-200/40 dark:border-zinc-800/40">
              {(["All", "Album", "EP", "Single", "Mixtape"] as const).map(
                (type) => {
                  const isActive = projectTypeFilter === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setProjectTypeFilter(type)}
                      className={`relative px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors duration-200 cursor-pointer ${
                        isActive
                          ? "text-white dark:text-zinc-950"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <span className="relative z-10">{type === "All" ? "All" : `${type}s`}</span>
                      {isActive && (
                        <motion.span
                          layoutId="active-review-filter-tab"
                          className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-sm"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Sort Toggles & Total Counter */}
          <div className="flex items-center justify-between md:justify-end gap-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Total: {totalEstimate} Reviews
            </div>

            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "highest-rated")
                }
                className="bg-transparent border-0 text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-0 cursor-pointer pr-8"
              >
                <option value="newest" className="bg-background">
                  Newest Reviews
                </option>
                <option value="highest-rated" className="bg-background">
                  Highest Rated
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── GRID CONTENT ── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12">
        <AnimatePresence mode="wait">
          {loading ? (
            // SHIMMER LOADING PLACEHOLDER
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-4 animate-pulse">
                  <div className="aspect-[16/10] w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                  <div className="space-y-2">
                    <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                    <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                    <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            // RENDERED REVIEW CARDS
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {/* If on page 1, render the remaining reviews (excluding spotlight hero). Otherwise render all. */}
              {(currentPage === 1 && spotlightReview
                ? remainingReviews
                : reviews
              ).map((review) => {
                const isHighRating = (review.rating || 0) >= 8.0;

                return (
                  <motion.article
                    key={review.id}
                    variants={itemVariants}
                    whileHover={{ y: -6 }}
                    className="group flex flex-col bg-background border border-zinc-200/50 dark:border-zinc-800/40 rounded-sm overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] dark:hover:border-zinc-700/60 transition-all duration-300"
                  >
                    {/* Cover Art Wrapper */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                      <img
                        src={review.coverImageUrl}
                        alt={review.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out opacity-90"
                        loading="lazy"
                      />

                      {/* Top Right Floating SVG Score Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <RatingRing rating={review.rating || 0} />
                      </div>

                      {/* Cover Hover Overlay */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                    </div>

                    {/* Meta & Typography info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-brand">
                          <span>{review.projectType || "ALBUM"}</span>
                          <span className="text-zinc-300 dark:text-zinc-700">
                            ·
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {review.createdAt}
                          </span>
                        </div>

                        <Link
                          to={`/post/${review.slug}`}
                          className="block group"
                        >
                          <h3 className="text-sm font-black uppercase tracking-tight text-foreground group-hover:text-brand transition-colors duration-200 line-clamp-1">
                            {review.artistName}
                          </h3>
                          <h2 className="text-base font-extrabold uppercase text-foreground leading-tight group-hover:text-brand transition-colors duration-200 mt-1 line-clamp-2">
                            {review.projectTitle}
                          </h2>
                        </Link>

                        <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                          {review.description}
                        </p>
                      </div>

                      {/* Small Editorial Footer inside card */}
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between">
                        <Link
                          to={`/post/${review.slug}`}
                          className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-brand transition-colors"
                        >
                          Read Review →
                        </Link>
                        {isHighRating && (
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand bg-brand/5 border border-brand/10 px-2 py-0.5 rounded-sm">
                            <Award className="h-3 w-3" />
                            Must Read
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty Search/Filter State */}
        {!loading && reviews.length === 0 && (
          <div className="w-full text-center py-20 bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-sm">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-base font-black uppercase tracking-tight text-foreground">
              No Reviews Found
            </h3>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
              Try adjusting your project type filter or check back later.
            </p>
          </div>
        )}

        {/* ── PAGINATION CONTROLS ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-16">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-zinc-200/80 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-sm text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 text-[10px] font-black uppercase rounded-sm transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-brand text-white"
                      : "border border-zinc-200/80 dark:border-zinc-800 text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-zinc-200/80 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-sm text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
