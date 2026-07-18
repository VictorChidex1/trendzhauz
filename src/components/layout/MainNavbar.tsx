import * as React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Reviews", path: "/category/reviews" },
  { name: "Music", path: "/category/music" },
  { name: "Entertainment", path: "/category/entertainment" },
  { name: "News", path: "/category/news" },
  { name: "Bio Links", path: "/links" },
];

export function MainNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-background/90 backdrop-blur-lg transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center"
            >
              <img
                src="/assets/Trendzhauz-logo.png"
                alt="TrendzHauz Logo"
                className="h-14 w-auto object-contain dark:invert dark:hue-rotate-180 transition-all duration-300"
              />
            </motion.div>
          </Link>
        </div>

        {/* Desktop Navigation Links with sliding background bar */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-bold tracking-widest uppercase">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="relative px-4 py-2 text-foreground/75 hover:text-brand transition-colors duration-200"
              >
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-tab"
                    className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 rounded-sm -z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Action Controls (Theme Toggle & Mobile Menu Switch) */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle Button with Rotate & Scale Morph */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative h-9 w-9 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-foreground"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "light" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-[1.1rem] w-[1.1rem]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-[1.1rem] w-[1.1rem]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden h-9 w-9 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu with AnimatePresence slide and stagger links */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-zinc-200/50 dark:border-zinc-800/50 bg-background overflow-hidden"
          >
            <nav className="flex flex-col space-y-1 px-4 py-4 text-xs font-bold uppercase tracking-widest">
              {navItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" &&
                    location.pathname.startsWith(item.path));

                return (
                  <motion.div
                    key={item.name}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-3 px-4 rounded-sm transition-colors ${
                        isActive
                          ? "text-brand bg-zinc-100 dark:bg-zinc-900"
                          : "text-foreground/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-brand"
                      }`}
                    >
                      {item.name}
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
