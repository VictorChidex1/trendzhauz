import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Play, Eye } from "lucide-react";

// Mock Featured Stories Data
const SLIDES = [
  {
    category: "Music",
    title: "Exclusive Launch: DJ Davisy's Summer Heat Mix Performance",
    description:
      "Go behind the scenes of the high-contrast studio session and stream the full high-definition set now.",
    link: "/category/music",
    image: "/assets/DJ-Davisy-Grime-Trap-Mixtape.jpg",
    meta: "By DJ Davisy · 6 Min Read",
    ctaText: "Stream Mixtape",
  },
  {
    category: "Reviews",
    title: "Review: Burna Boy's Live Orchestral Showcase in London",
    description:
      "An editorial analysis of the historic night at the Royal Albert Hall where Afrobeats fused with classical orchestration.",
    link: "/category/reviews",
    image: "/assets/live_concert_orchestral.png",
    meta: "By Editorial Team · 5 Min Read",
    ctaText: "Read Review",
  },
  {
    category: "Videos",
    title: "Davido's 'No. 11': A Masterclass in Global Afrobeats",
    description:
      "An editorial analysis of the visual storytelling and cultural impact of the latest major music video release from the Afrobeats titan.",
    link: "/category/videos",
    image: "/assets/Davido-No11-Gimme-Dat-Ting-Official-Music-Video.jpg",
    meta: "By Video Desk · 4 Min Read",
    ctaText: "Watch Mix",
  },
];

// Animation Variants for Text Stagger Slide-ins
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const textItemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15,
    },
  },
} as const;

export function HeroSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const activeSlide = SLIDES[activeIndex];

  return (
    <section className="relative w-full border-b border-zinc-200/50 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-12 lg:py-20 items-center">
          {/* Left Column: Staggered Content Area */}
          <div className="lg:col-span-7 flex flex-col justify-center min-h-[380px] lg:min-h-[440px] z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4 sm:gap-6 items-start"
              >
                {/* Category tag */}
                <motion.span
                  variants={textItemVariants}
                  className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-brand bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 px-3.5 py-1.5 rounded-sm"
                >
                  {activeSlide.category}
                </motion.span>

                {/* Headline */}
                <motion.h1
                  variants={textItemVariants}
                  className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.95] max-w-2xl"
                >
                  {activeSlide.title}
                </motion.h1>

                {/* Author Metadata */}
                <motion.p
                  variants={textItemVariants}
                  className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
                >
                  {activeSlide.meta}
                </motion.p>

                {/* Description */}
                <motion.p
                  variants={textItemVariants}
                  className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed"
                >
                  {activeSlide.description}
                </motion.p>

                {/* Actions */}
                <motion.div
                  variants={textItemVariants}
                  className="flex flex-wrap items-center gap-4 mt-2"
                >
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={activeSlide.link}
                    className="inline-flex items-center gap-2 bg-brand text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-sm hover:bg-brand/90 shadow-sm transition-colors duration-200"
                  >
                    {activeSlide.ctaText}
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/category/music"
                    className="inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
                  >
                    All Stories
                  </motion.a>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: High-Impact Cinematic Photo Canvas */}
          <div className="lg:col-span-5 relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-square bg-zinc-200 dark:bg-zinc-900 rounded-sm overflow-hidden border border-zinc-200/40 dark:border-zinc-800/40 group shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out scale-100 group-hover:scale-105"
                />

                {/* Soft gradient overlay for dark mode depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 dark:from-zinc-950/80 dark:to-transparent" />

                {/* Floating Category Play Circle Indicator */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute bottom-4 right-4 bg-brand text-white p-3 rounded-full shadow-lg"
                >
                  {activeSlide.category === "Videos" ? (
                    <Play className="h-4 w-4 fill-white" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation & Instagram-Style Progress Bar Rows */}
        <div className="border-t border-zinc-200/50 dark:border-zinc-900/60 py-4 flex items-center justify-between gap-6">
          {/* Progress indicators */}
          <div className="flex-1 flex items-center gap-2 max-w-md">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                }}
                className="h-1 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative cursor-pointer"
              >
                {idx === activeIndex && (
                  <motion.div
                    key={idx} // Trigger motion restart on slide changes
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    onAnimationComplete={handleNext}
                    className="h-full bg-brand"
                  />
                )}
                {idx < activeIndex && (
                  <div className="absolute inset-0 bg-brand" />
                )}
              </button>
            ))}
          </div>

          {/* Simple Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full border border-zinc-300 dark:border-zinc-800 hover:border-brand dark:hover:border-brand text-zinc-600 dark:text-zinc-400 hover:text-brand dark:hover:text-brand transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-full border border-zinc-300 dark:border-zinc-800 hover:border-brand dark:hover:border-brand text-zinc-600 dark:text-zinc-400 hover:text-brand dark:hover:text-brand transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
