import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          {/* Logo & Brand Identity */}
          <div className="text-center sm:text-left">
            <Link 
              to="/" 
              className="font-sans text-lg font-black tracking-tighter text-foreground uppercase"
            >
              Trendz<span className="text-brand font-black">hauz</span>
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Premium Music & Entertainment Blog for DJ Davisy.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Link to="/" className="hover:text-brand transition-colors">Home</Link>
            <Link to="/category/reviews" className="hover:text-brand transition-colors">Reviews</Link>
            <Link to="/category/music" className="hover:text-brand transition-colors">Music</Link>
            <Link to="/links" className="hover:text-brand transition-colors">Bio Links</Link>
            <Link to="/admin" className="hover:text-brand transition-colors">CMS Admin</Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center">
          <p className="text-xs text-muted-foreground/80">
            &copy; {currentYear} TRENDZHAUZ. All rights reserved. Powered by Serverless Cloud Engine.
          </p>
        </div>
      </div>
    </footer>
  );
}
