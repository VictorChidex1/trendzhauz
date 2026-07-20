import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);

  React.useEffect(() => {
    const handleScroll = (): void => {
      // Calculate current scroll progress as a fraction between 0 and 1
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setProgress(window.scrollY / totalScroll);
      }

      // Show button once scrolled past 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Use passive listener for butter-smooth scrolling performance on mobile & desktop
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Math variables for SVG circle dash computations (r = 20)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl dark:bg-white dark:text-zinc-950 transform-gpu cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand"
          style={{ willChange: "transform, opacity" }}
          aria-label="Scroll to Top"
        >
          {/* Radial Progress Ring */}
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            {/* Background thin circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-zinc-800/20 dark:stroke-zinc-200/20"
              strokeWidth="2.5"
              fill="transparent"
            />
            {/* Foreground progress indicator circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-brand transition-all duration-100 ease-out"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Accent Chevron Arrow */}
          <ArrowUp className="h-5 w-5 relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
