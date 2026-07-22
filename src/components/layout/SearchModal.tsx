import * as React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Calendar, Award, Flame } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCH_TAGS = [
  "Wizkid",
  "Asake",
  "Burna Boy",
  "DJ Davisy",
  "Fireboy DML",
  "Olamide",
  "Reviews",
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { results, loading, searchTerm, setSearchTerm, clearSearch } = useSearch();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input field when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-2xl bg-background border border-zinc-200 dark:border-zinc-800 rounded-md shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Input Bar Layer */}
            <div className="flex items-center px-4 border-b border-zinc-200/60 dark:border-zinc-800/80 py-3 gap-3 bg-zinc-50/50 dark:bg-zinc-950/40">
              <Search className="h-5 w-5 text-brand shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search music, reviews, news, artists..."
                className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground placeholder:font-normal focus:outline-none"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-brand shrink-0" />}
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-black uppercase text-muted-foreground bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-sm shrink-0">
                ESC
              </kbd>
            </div>

            {/* Content Display Layer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* State A: Empty Input -> Show Popular Search Tags */}
              {!searchTerm.trim() && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-brand" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className="text-xs font-bold px-3 py-1.5 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-foreground hover:border-brand hover:text-brand transition-all cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* State B: Results Found */}
              {searchTerm.trim() !== "" && results.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {results.length} Result{results.length > 1 ? "s" : ""} Found
                  </div>

                  <div className="flex flex-col gap-2">
                    {results.map((story) => (
                      <Link
                        key={story.id}
                        to={`/post/${story.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-4 p-2.5 rounded-sm border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all duration-200"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-12 rounded-sm overflow-hidden bg-zinc-950 shrink-0 border border-zinc-200/20 dark:border-zinc-800/20">
                          <img
                            src={story.coverImageUrl}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Story Content Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-brand">
                            <span>{story.category}</span>
                            <span className="text-muted-foreground font-normal">
                              ·
                            </span>
                            <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                              <Calendar className="h-2.5 w-2.5" />
                              {story.createdAt}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-foreground group-hover:text-brand transition-colors line-clamp-1">
                            {story.title}
                          </h4>

                          <p className="text-[10px] text-muted-foreground line-clamp-1 font-medium">
                            {story.description}
                          </p>
                        </div>

                        {/* Optional Rating Badge */}
                        {story.rating && (
                          <div className="shrink-0 flex items-center gap-1 text-[10px] font-black bg-brand/10 border border-brand/20 text-brand px-2 py-1 rounded-sm">
                            <Award className="h-3 w-3" />
                            {story.rating.toFixed(1)}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* State C: No Results Found */}
              {!loading && searchTerm.trim() !== "" && results.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <Search className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-bold uppercase tracking-tight text-foreground">
                    No Matching Stories Found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try searching for another artist, track, or review keyword.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Press <kbd className="font-black text-foreground">ESC</kbd> to exit</span>
              <span className="text-brand">Trendzhauz Media Engine</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
