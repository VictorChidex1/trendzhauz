import { motion } from "framer-motion";

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

export function HeroSection() {
  return (
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
          The Pulse of <span className="text-brand">African</span> Music Culture
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
  );
}
