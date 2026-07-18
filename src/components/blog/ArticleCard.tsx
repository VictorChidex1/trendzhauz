import { motion } from "framer-motion";

export interface ArticleCardProps {
  title?: string;
  category?: string;
  createdAt?: string;
  description?: string;
  slug?: string;
  coverImageUrl?: string;
  variants?: any;
}

export function ArticleCard({
  title = "African Soundwaves: How DJ Davisy is Redefining the Mix Landscape",
  category = "Music",
  createdAt = "Jul 18, 2026",
  description = "Explore the production tactics, software ecosystems, and local music trends forming the new wave of sound.",
  slug = "sample-post",
  coverImageUrl,
  variants,
}: ArticleCardProps) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -6 }}
      className="group flex flex-col gap-4 p-4 rounded-md border border-zinc-100 dark:border-zinc-900/60 bg-white/40 dark:bg-zinc-950/20 shadow-sm hover:shadow-md dark:hover:border-zinc-800 transition-all duration-300"
    >
      {/* Thumbnail image wrapper */}
      <div className="w-full aspect-[16/10] bg-zinc-100 dark:bg-zinc-900/60 rounded-sm overflow-hidden relative border border-zinc-200/20 dark:border-zinc-800/20">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Shimmer loading effect as fallback if no image */
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/10 dark:via-zinc-800/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}

        {/* Category tag */}
        <span className="absolute bottom-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-brand text-white px-2.5 py-1 rounded-sm shadow-sm">
          {category}
        </span>
      </div>

      {/* Card Meta Content */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {createdAt}
        </p>
        <a href={`/blog/${slug}`}>
          <h3 className="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-brand transition-colors duration-200 leading-snug">
            {title}
          </h3>
        </a>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
