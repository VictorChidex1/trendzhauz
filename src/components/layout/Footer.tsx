import * as React from "react";
import { Link } from "react-router-dom";

const footerLinks = {
  Content: [
    { name: "Home", path: "/" },
    { name: "Reviews", path: "/category/reviews" },
    { name: "Music", path: "/category/music" },
    { name: "Videos", path: "/category/videos" },
    { name: "News", path: "/category/news" },
  ],
  Platform: [{ name: "Bio Links", path: "/links" }],
};

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/trendzhauzmedia/",
    icon: InstagramIcon,
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/trendzhauz",
    icon: FacebookIcon,
  },
  {
    name: "Twitter",
    url: "https://www.instagram.com/trendzhauzmedia/", // Temporary Instagram fallback until X profile is ready
    icon: TwitterIcon,
  },
];

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

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
              TrendzHauz Media is your destination for premium music reviews,
              entertainment news, and exclusive African music culture coverage.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center space-x-2 pt-1">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-brand dark:hover:text-brand border border-zinc-200/60 dark:border-zinc-800/60 transition-all duration-200 hover:scale-105"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            &copy; {currentYear} TRENDZHAUZ MEDIA. All rights reserved.
          </p>

          {/* Bottom Social Row */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-zinc-400 hover:text-brand dark:text-zinc-600 dark:hover:text-brand transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
            Built with ❤️ by CV Digital
          </p>
        </div>
      </div>
    </footer>
  );
}
