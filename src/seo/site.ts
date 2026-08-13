/**
 * Site-wide SEO constants.
 *
 * SITE_URL is read from VITE_SITE_URL (set in .env / hosting env) so the
 * canonical domain is a single, one-line change at go-live.
 */
export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL || "https://trendzhauzmedia.com";

export const SITE_NAME = "TrendzHauz Media";

export const DEFAULT_TITLE =
  "TrendzHauz Media | Music Reviews, Entertainment News & Artist Features";

export const DEFAULT_DESCRIPTION =
  "Discover music reviews, breaking news, videos, and exclusive artist features from Nigeria-based TrendzHauz Media — your source for global entertainment and African music culture.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/Trendzhauz-logo.png`;

export const OG_LOCALE = "en_NG";

export const SOCIAL_LINKS = [
  "https://www.instagram.com/trendzhauzmedia/",
  "https://www.facebook.com/trendzhauz",
  "https://www.tiktok.com/@trendzhauzmedia",
];

/**
 * Staging/preview hosts that must never be indexed.
 * Auto-noindex kicks in when the current hostname contains one of these.
 */
export const STAGING_HOST_MARKERS = ["vercel.app", "localhost"];
