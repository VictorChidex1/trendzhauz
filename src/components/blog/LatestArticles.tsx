import { motion } from "framer-motion";

// Mock Data for Left Feed: Main Editorial Stories
const MAIN_STORIES = [
  {
    id: "story-1",
    category: "Reviews",
    title: "Review: Tems' Debut Album Is a Vocal Masterclass",
    description: "An in-depth review of Tems' highly anticipated debut studio LP, exploring its rich sonic palette, emotional depth, and genre-bending production.",
    coverImageUrl: "/assets/studio_recording.png",
    createdAt: "Jul 18, 2026",
    slug: "tems-album-review",
  },
  {
    id: "story-2",
    category: "Music",
    title: "Amapiano's Next Wave: Artists to Watch in 2026",
    description: "Highlighting the emerging producers and singers pushing the log-drum bassline to brand new experimental heights across African club scenes.",
    coverImageUrl: "/assets/amapiano_decks_hero.png",
    createdAt: "Jul 17, 2026",
    slug: "amapiano-next-wave",
  },
  {
    id: "story-3",
    category: "News",
    title: "Wizkid Hints at Surprise Collaboration Album",
    description: "The Starboy records boss teased a joint project with a major international artist during a late-night London studio session.",
    coverImageUrl: "/assets/dj_studio_performance.png",
    createdAt: "Jul 16, 2026",
    slug: "wizkid-collaboration",
  },
  {
    id: "story-4",
    category: "Videos",
    title: "Asake Redefines Visual Aesthetics in New Afrobeats Music Video",
    description: "A detailed breakdown of Asake's cinematic music video shot in Lagos, showcasing high-concept styling and traditional Yoruba motifs.",
    coverImageUrl: "/assets/afrobeats_performance.png",
    createdAt: "Jul 15, 2026",
    slug: "asake-visuals",
  },
];

// Mock Data for Right Sidebar: Trending Now
const TRENDING_POSTS = [
  {
    rank: 1,
    title: "Rema's 'Calm Down' Becomes First Afrobeats Song to Cross 2 Billion Streams",
    createdAt: "Jul 15, 2026",
    slug: "rema-2-billion",
  },
  {
    rank: 2,
    title: "Burna Boy Announces Epic New Stadium Tour Across North America",
    createdAt: "Jul 14, 2026",
    slug: "burna-stadium-tour",
  },
  {
    rank: 3,
    title: "Olamide Drops Surprise EP 'Unruly' Featuring Young Jonn and Fireboy DML",
    createdAt: "Jul 13, 2026",
    slug: "olamide-unruly",
  },
  {
    rank: 4,
    title: "DJ Davisy's Top 50 Summer Club Mix Playlist: Listen Now",
    createdAt: "Jul 12, 2026",
    slug: "dj-davisy-summer-mix",
  },
  {
    rank: 5,
    title: "Tems Earns Historic Diamond Certification for Summer Hit Single",
    createdAt: "Jul 11, 2026",
    slug: "tems-diamond-certification",
  },
];

// Mock Data for Right Sidebar: Editor Picks / Latest Reviews
const EDITOR_PICKS = [
  {
    category: "Reviews",
    title: "Review: Fireboy DML's 'Adore' Showcases Artistic Maturity",
    coverImageUrl: "/assets/studio_recording.png",
    createdAt: "Jul 17, 2026",
    slug: "fireboy-adore-review",
  },
  {
    category: "Reviews",
    title: "Review: Omah Lay's Dark Afrobeats Production Rules the Night",
    coverImageUrl: "/assets/live_concert_orchestral.png",
    createdAt: "Jul 16, 2026",
    slug: "omah-lay-review",
  },
  {
    category: "Reviews",
    title: "Review: Seyi Vibez's 'Lagos Memoirs' EP Review",
    coverImageUrl: "/assets/crowd_concert.png",
    createdAt: "Jul 15, 2026",
    slug: "seyi-vibez-review",
  },
];

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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
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
                Fresh Content
              </span>
            </div>

            {/* Stories List */}
            <div className="flex flex-col gap-10">
              {MAIN_STORIES.map((story) => (
                <motion.a
                  key={story.id}
                  href={`/blog/${story.slug}`}
                  variants={itemVariants}
                  className="group flex flex-col sm:flex-row gap-6 p-4 rounded-sm border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-60 aspect-[16/10] bg-zinc-100 dark:bg-zinc-900/60 rounded-sm overflow-hidden shrink-0 relative border border-zinc-200/20 dark:border-zinc-800/20">
                    <img
                      src={story.coverImageUrl}
                      alt={story.title}
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
                </motion.a>
              ))}
            </div>
          </div>

          {/* ── Right Column: Sticky Sidebar Feed (1/3 width) ── */}
          <div className="lg:col-span-4 space-y-12 lg:sticky lg:top-24">
            
            {/* Trending Now Section */}
            <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-6 rounded-md border border-zinc-200/40 dark:border-zinc-900/60 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-5">
                Trending Now
              </h3>
              
              <div className="flex flex-col">
                {TRENDING_POSTS.map((post) => (
                  <a
                    key={post.rank}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4 items-start py-4 border-b border-zinc-100 dark:border-zinc-900/40 last:border-0"
                  >
                    {/* Rank Number */}
                    <span className="font-black text-3xl sm:text-4xl text-brand/30 group-hover:text-brand w-10 shrink-0 leading-none transition-colors duration-200">
                      {post.rank.toString().padStart(2, "0")}
                    </span>
                    {/* Details */}
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-200 group-hover:text-brand transition-colors duration-200 leading-tight">
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
                {EDITOR_PICKS.map((pick, index) => (
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
