import { motion } from "framer-motion";
import { ArticleCard } from "./ArticleCard";

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

export function LatestArticles() {
  return (
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
            <ArticleCard key={n} variants={cardVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
