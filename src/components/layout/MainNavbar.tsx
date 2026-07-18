import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Reviews", path: "/category/reviews" },
  { name: "Music", path: "/category/music" },
  { name: "Entertainment", path: "/category/entertainment" },
  { name: "News", path: "/category/news" },
  { name: "Bio Links", path: "/links" },
];

export function MainNavbar() {
  const { toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/assets/TrendzHauz logo white.jpg" 
              alt="TrendzHauz Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold tracking-wide uppercase">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `transition-colors hover:text-brand ${
                  isActive ? "text-brand" : "text-foreground/80"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Action Controls (Theme Toggle & Mobile Menu Switch) */}
        <div className="flex items-center space-x-4">
          
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-9 w-9 rounded-md border border-border bg-transparent hover:bg-muted text-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Admin Login Shortcut */}
          <Link to="/admin" className="hidden sm:inline-block">
            <Button variant="outline" size="sm" className="font-semibold uppercase tracking-wider text-xs">
              CMS Panel
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden h-9 w-9 rounded-md border border-border text-foreground"
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

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 transition-colors duration-300">
          <nav className="flex flex-col space-y-2 text-sm font-bold uppercase tracking-wider">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-md transition-colors hover:bg-muted hover:text-brand ${
                    isActive ? "text-brand bg-muted/50" : "text-foreground/90"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <Link 
              to="/admin" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2"
            >
              <Button className="w-full font-bold uppercase tracking-wider text-xs bg-brand text-brand-foreground hover:bg-brand/90">
                CMS Panel
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
