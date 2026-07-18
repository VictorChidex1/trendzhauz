import { motion } from "framer-motion";

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

const cardGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 18,
    },
  },
} as const;

export default function BlogHome() {
  return (
    <div className="flex-1 flex flex-col w-full bg-background transition-colors duration-300">
      {/* ── Hero Banner ── Dynamic Theme & Staggered Motion */}
      <section className="w-full bg-zinc-50 dark:bg-zinc-950 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/50 dark:border-zinc-900 transition-colors duration-300">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto flex flex-col items-start gap-6"
        >
          {/* Category Label */}
          <motion.span
            variants={itemVariants}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-brand bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 px-3.5 py-1.5 rounded-sm"
          >
            Music · Videos · News
          </motion.span>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.95] max-w-4xl"
          >
            The Pulse of <span className="text-brand">African</span> Music
            Culture
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed"
          >
            TrendHauz's editorial home — blazing-fast reviews, exclusive drops,
            and entertainment news straight from the deck.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 mt-2"
          >
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="/category/music"
              className="inline-flex items-center gap-2 bg-brand text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-sm hover:bg-brand/90 shadow-sm transition-colors duration-200"
            >
              Explore Music
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="/category/reviews"
              className="inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
            >
              Latest Reviews
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Orange brand divider ── */}
      <div className="w-full h-[3px] bg-brand/90" />

      {/* ── Content Grid Area ── Animated Skeleton Cards */}
      <section className="w-full bg-background py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10 border-b border-zinc-200/60 dark:border-zinc-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-foreground">
              Latest Articles
            </h2>
            <a
              href="/category/music"
              className="text-xs font-bold uppercase tracking-widest text-brand hover:text-brand/80 transition-colors"
            >
              View All Posts →
            </a>
          </div>

          {/* Cards Grid */}
          <motion.div
            variants={cardGridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <motion.div
                key={n}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="group flex flex-col gap-4 p-4 rounded-md border border-zinc-100 dark:border-zinc-900/60 bg-white/40 dark:bg-zinc-950/20 shadow-sm hover:shadow-md dark:hover:border-zinc-800 transition-all duration-300"
              >
                {/* Thumbnail image wrapper */}
                <div className="w-full aspect-[16/10] bg-zinc-100 dark:bg-zinc-900/60 rounded-sm overflow-hidden relative border border-zinc-200/20 dark:border-zinc-800/20">
                  {/* Subtle shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/10 dark:via-zinc-800/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                  {/* Category tag */}
                  <span className="absolute bottom-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-brand text-white px-2.5 py-1 rounded-sm shadow-sm">
                    Music
                  </span>
                </div>

                {/* Card Meta Content */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Jul 18, 2026
                  </p>
                  <h3 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-brand transition-colors duration-200 leading-snug">
                    African Soundwaves: How DJ Davisy is Redefining the Mix
                    Landscape
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    Explore the production tactics, software ecosystems, and
                    local music trends forming the new wave of sound.
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
