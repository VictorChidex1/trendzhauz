import { Link } from "react-router-dom";

const footerLinks = {
  Content: [
    { name: "Home", path: "/" },
    { name: "Reviews", path: "/category/reviews" },
    { name: "Music", path: "/category/music" },
    { name: "Entertainment", path: "/category/entertainment" },
    { name: "News", path: "/category/news" },
  ],
  Platform: [
    { name: "Bio Links", path: "/links" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      {/* Main Footer Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/assets/Trendzhauz-logo.png"
                alt="TrendzHauz Logo"
                className="h-14 w-auto object-contain dark:invert dark:hue-rotate-180 transition-all duration-300"
              />
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-xs">
              DJ Davisy's editorial home for premium music reviews,
              entertainment news, and exclusive African music culture coverage.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-300">
                {category}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-zinc-500 hover:text-brand dark:hover:text-brand transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-zinc-200 dark:border-zinc-900 px-4 sm:px-6 lg:px-8 py-5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            &copy; {currentYear} TRENDZHAUZ. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            Powered by CV Digital
          </p>
        </div>
      </div>
    </footer>
  );
}
