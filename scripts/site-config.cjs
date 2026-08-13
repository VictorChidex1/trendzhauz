/**
 * Shared site configuration for Node build scripts (CommonJS).
 *
 * The Cloud Functions keep their own single constant in
 * functions/src/seo/config.ts, and the frontend reads VITE_SITE_URL.
 * Each runtime world owns one source of truth for the canonical domain.
 */
module.exports = {
  SITE_URL: "https://trendzhauzmedia.com",
};
