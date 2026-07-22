import * as React from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  Calendar,
  Award,
  Flame,
  Clock,
  Trash2,
  CornerDownLeft,
} from "lucide-react";
import { useSearch, type SearchCategoryFilter } from "@/hooks/useSearch";

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

const CATEGORY_CHIPS: SearchCategoryFilter[] = [
  "All",
  "Reviews",
  "Music",
  "Videos",
  "News",
];

const RECENT_SEARCHES_KEY = "tz_recent_searches";

// Utility helpers for localStorage Recent Searches
function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string): void {
  const clean = term.trim();
  if (!clean) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 5); // Keep top 5
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Fail silently
  }
}

function clearRecentSearchesStorage(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Fail silently
  }
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const {
    results,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    clearSearch,
  } = useSearch();

  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // 1. Lock body background scroll when search modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setRecentSearches(getRecentSearches());
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
      clearSearch();
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, clearSearch]);

  // Reset selected index when search results change
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [results, searchTerm]);

  // 2. Global mousedown listener for instant click-outside detection
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen, onClose]);

  // 3. Keyboard Listeners: ESC, ArrowUp, ArrowDown, Enter
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev < results.length - 1 ? prev + 1 : 0) : -1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev > 0 ? prev - 1 : results.length - 1) : -1
        );
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          const targetStory = results[selectedIndex];
          saveRecentSearch(searchTerm || targetStory.title);
          navigate(`/post/${targetStory.slug}`);
          onClose();
        } else if (searchTerm.trim()) {
          saveRecentSearch(searchTerm);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, searchTerm, navigate, onClose]);

  const handleSelectSearchTerm = (term: string) => {
    setSearchTerm(term);
    saveRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const handleClearHistory = () => {
    clearRecentSearchesStorage();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Uniform Full-Screen Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container Card */}
          <motion.div
            ref={modalRef}
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
                  type="button"
                  onClick={clearSearch}
                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Clear input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {/* Explicit Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-brand px-2.5 py-1 rounded-sm border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand/40 bg-zinc-100/50 dark:bg-zinc-900/50 transition-colors shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Category Quick Filter Segmented Bar */}
            <div className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-100/60 dark:bg-zinc-900/40 border-b border-zinc-200/40 dark:border-zinc-800/40 overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground shrink-0 mr-1">
                Filter:
              </span>
              {CATEGORY_CHIPS.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-brand text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Content Display Layer */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
              {/* State A: Empty Input -> Show Recent & Popular Searches */}
              {!searchTerm.trim() && (
                <div className="space-y-6 py-2">
                  {/* Recent Searches (Stored in localStorage) */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-brand" />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          onClick={handleClearHistory}
                          className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground hover:text-brand transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          Clear History
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectSearchTerm(term)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-foreground hover:border-brand hover:text-brand transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-brand" />
                      <span>Popular Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCH_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleSelectSearchTerm(tag)}
                          className="text-xs font-bold px-3 py-1.5 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-foreground hover:border-brand hover:text-brand transition-all cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* State B: Results Found */}
              {searchTerm.trim() !== "" && results.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>
                      {results.length} Result{results.length > 1 ? "s" : ""} Found
                    </span>
                    <span className="hidden sm:inline-block">
                      Use <kbd className="text-foreground font-black">↑ ↓</kbd> to navigate, <kbd className="text-foreground font-black">↵</kbd> to select
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {results.map((story, index) => {
                      const isHighlighted = selectedIndex === index;
                      return (
                        <Link
                          key={story.id}
                          to={`/post/${story.slug}`}
                          onClick={() => {
                            saveRecentSearch(searchTerm || story.title);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`group flex items-center gap-4 p-2.5 rounded-sm border transition-all duration-200 ${
                            isHighlighted
                              ? "bg-zinc-100/80 dark:bg-zinc-900/90 border-brand/50 shadow-sm"
                              : "border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                          }`}
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

                            <h4
                              className={`text-xs sm:text-sm font-extrabold uppercase tracking-tight transition-colors line-clamp-1 ${
                                isHighlighted ? "text-brand" : "text-foreground group-hover:text-brand"
                              }`}
                            >
                              {story.title}
                            </h4>

                            <p className="text-[10px] text-muted-foreground line-clamp-1 font-medium">
                              {story.description}
                            </p>
                          </div>

                          {/* Keyboard Select Indicator or Rating */}
                          <div className="flex items-center gap-2 shrink-0">
                            {story.rating && (
                              <div className="flex items-center gap-1 text-[10px] font-black bg-brand/10 border border-brand/20 text-brand px-2 py-1 rounded-sm">
                                <Award className="h-3 w-3" />
                                {story.rating.toFixed(1)}
                              </div>
                            )}

                            {isHighlighted && (
                              <CornerDownLeft className="h-3.5 w-3.5 text-brand hidden sm:block" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
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
                    Try searching for another artist, track, or review keyword under another category filter.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2">
                <span>Press <kbd className="font-black text-foreground">ESC</kbd> to exit</span>
                <span>·</span>
                <span className="hidden sm:inline">Use <kbd className="font-black text-foreground">↑↓</kbd> to navigate</span>
              </span>
              <span className="text-brand font-black">Trendzhauz Media Engine</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
