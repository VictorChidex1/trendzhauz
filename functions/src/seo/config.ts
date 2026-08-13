/**
 * Shared SEO gateway config — used by both the Firebase seoGateway Function
 * and the Vercel Edge Middleware.
 *
 * Pure TypeScript. No React, no firebase-admin imports at module level.
 * HTML builders accept metadata objects and return HTML strings.
 */

export const BOT_UA_PATTERNS = [
  "Googlebot",
  "Bingbot",
  "Facebookexternalhit",
  "Twitterbot",
  "WhatsApp",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "Applebot",
  "DuckDuckBot",
  "Pinterestbot",
];

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) =>
    ua.includes(pattern.toLowerCase()),
  );
}

// User-Agent substrings to reject immediately (runaway/abusive crawlers).
// Populate when a specific bot floods requests so we short-circuit before
// any Firestore/Storage work. Empty by default — costs nothing.
export const BLOCKED_UA_PATTERNS: string[] = [];

export function isBlockedBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BLOCKED_UA_PATTERNS.some((pattern) =>
    ua.includes(pattern.toLowerCase()),
  );
}

export interface SeoMeta {
  title: string;
  description: string;
  image?: string;
  canonicalPath: string;
  robots?: string;
  jsonLd?: Array<Record<string, unknown>>;
  visibleTitle?: string;
  visibleContent?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  section?: string;
}

export interface StaticSeoEntry {
  title: string;
  description: string;
}

export const SITE_URL = "https://trendzhauzmedia.com";

const SITE_NAME = "TrendzHauz Media";
const DEFAULT_DESCRIPTION =
  "Discover music reviews, breaking news, videos, and exclusive artist features from Nigeria-based TrendzHauz Media — your source for global entertainment and African music culture.";
const OG_LOCALE = "en_NG";

export const STATIC_SEO: Record<string, StaticSeoEntry> = {
  "/": {
    title:
      "TrendzHauz Media | Music Reviews, Entertainment News & Artist Features",
    description: DEFAULT_DESCRIPTION,
  },
  "/music": {
    title: "Music | " + SITE_NAME,
    description:
      "Stream the latest Afrobeats, hip-hop, and global hits — new music drops, trending singles, and exclusive mixes from TrendzHauz Media.",
  },
  "/reviews": {
    title: "Reviews | " + SITE_NAME,
    description:
      "In-depth album and project reviews with honest verdicts — ratings, score breakdowns, and final calls from TrendzHauz Media.",
  },
  "/videos": {
    title: "Videos | " + SITE_NAME,
    description:
      "Watch the freshest music videos, live sessions, and behind-the-scenes clips from your favorite African and global artists.",
  },
  "/news": {
    title: "News | " + SITE_NAME,
    description:
      "Breaking entertainment news, artist updates, and African music culture stories from TrendzHauz Media.",
  },
  "/advertise": {
    title: "Advertise With Us | " + SITE_NAME,
    description:
      "Promote your brand with TrendzHauz Media — sponsored posts, banner placements, video partnerships, and audio campaigns that reach African music fans worldwide.",
  },
  "/contact": {
    title: "Contact Us | " + SITE_NAME,
    description:
      "Get in touch with the TrendzHauz Media team — partnerships, submissions, feedback, or general inquiries.",
  },
  "/links": {
    title: "Links | " + SITE_NAME,
    description:
      "All the essential TrendzHauz Media links in one place — music, videos, social channels, and more.",
  },
  "/privacy": {
    title: "Privacy Policy | " + SITE_NAME,
    description:
      "Learn how TrendzHauz Media collects, uses, and protects your personal data.",
  },
  "/terms": {
    title: "Terms of Service | " + SITE_NAME,
    description:
      "Terms and conditions governing your use of TrendzHauz Media.",
  },
};

// Phase G: derive optimized og:image variants for crawler meta tags.
import { deriveVariantUrl } from "./image-variants-core";

/**
 * Reusable JSON-LD builders for the server-side gateway.
 * These duplicate the frontend schemas.ts logic but are self-contained
 * so the gateway has zero React or Vite imports.
 */
function buildOrgJsonLd(siteUrl: string, logoUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: logoUrl,
    areaServed: "NG",
    address: { "@type": "PostalAddress", addressCountry: "NG" },
  });
}

function buildWebSiteJsonLd(siteUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: "en-NG",
    publisher: { "@type": "Organization", name: SITE_NAME },
  });
}

function buildCollectionPageJsonLd(
  name: string,
  url: string,
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    inLanguage: "en-NG",
  });
}

function buildArticleJsonLd(meta: SeoMeta, siteUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    image: meta.image || "",
    url: siteUrl + meta.canonicalPath,
    datePublished: meta.publishedTime,
    dateModified: meta.modifiedTime || meta.publishedTime,
    inLanguage: "en-NG",
    author: {
      "@type": "Person",
      name: meta.authorName || "TrendzHauz Editor",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: siteUrl + "/assets/Trendzhauz-logo.png" },
    },
    articleSection: meta.section,
  });
}

function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
  siteUrl: string,
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl + item.url,
    })),
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildBotHtml(
  meta: SeoMeta,
  siteUrl: string,
): string {
  const logoUrl = siteUrl + "/assets/Trendzhauz-logo.png";
  const canonical = siteUrl + meta.canonicalPath;
  const title = meta.title;
  const description = meta.description;
  const robots = meta.robots || "index, follow";

  let jsonLdScripts = "";
  if (meta.jsonLd && meta.jsonLd.length > 0) {
    jsonLdScripts = meta.jsonLd
      .map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
      .join("\n");
  }

  const visibleTitle = meta.visibleTitle || title;
  const visibleContent = meta.visibleContent || description;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="${meta.section ? "article" : "website"}">
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(meta.image || logoUrl)}">
<meta property="og:locale" content="${OG_LOCALE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(meta.image || logoUrl)}">
${jsonLdScripts}
</head>
<body>
<h1>${escapeHtml(visibleTitle)}</h1>
<p>${escapeHtml(visibleContent)}</p>
<p><a href="${escapeHtml(canonical)}">Read on TrendzHauz Media</a></p>
</body>
</html>`;
}

export function buildStaticBotHtml(
  path: string,
  siteUrl: string,
): string {
  const entry = STATIC_SEO[path];
  if (!entry) {
    return buildBotHtml(
      {
        title: "TrendzHauz Media",
        description: DEFAULT_DESCRIPTION,
        canonicalPath: path,
      },
      siteUrl,
    );
  }

  const name = entry.title.replace(" | " + SITE_NAME, "");
  const jsonLd: Array<Record<string, unknown>> = [];
  const logoUrl = siteUrl + "/assets/Trendzhauz-logo.png";

  if (path === "/") {
    jsonLd.push(JSON.parse(buildOrgJsonLd(siteUrl, logoUrl)));
    jsonLd.push(JSON.parse(buildWebSiteJsonLd(siteUrl)));
  } else if (["/music", "/reviews", "/videos", "/news"].includes(path)) {
    jsonLd.push(
      JSON.parse(buildCollectionPageJsonLd(name, siteUrl + path)),
    );
  }

  return buildBotHtml(
    {
      title: entry.title,
      description: entry.description,
      canonicalPath: path,
      jsonLd,
    },
    siteUrl,
  );
}

export function buildArticleBotHtml(
  postData: {
    title: string;
    description: string;
    slug: string;
    category: string;
    coverImageUrl?: string;
    createdAt?: { toDate: () => Date };
    updatedAt?: { toDate: () => Date };
    authorName?: string;
    content?: string;
  },
  siteUrl: string,
): string {
  const categoryLower = (postData.category || "news").toLowerCase();
  const canonicalPath = `/${categoryLower}/${postData.slug}`;
  const image =
    deriveVariantUrl(postData.coverImageUrl || "", 1280, "webp") ??
    (postData.coverImageUrl || "");
  const created = postData.createdAt?.toDate?.();
  const updated = postData.updatedAt?.toDate?.();
  const publishedTime = created?.toISOString();
  const modifiedTime = updated?.toISOString();
  const excerpt = (postData.content || "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 300);

  const jsonLd = [
    JSON.parse(
      buildArticleJsonLd(
        {
          title: postData.title,
          description: postData.description,
          image,
          canonicalPath,
          publishedTime,
          modifiedTime,
          authorName: postData.authorName,
          section: postData.category,
        },
        siteUrl,
      ),
    ),
    JSON.parse(
      buildBreadcrumbJsonLd(
        [
          { name: "Home", url: "/" },
          { name: postData.category, url: `/${categoryLower}` },
          { name: postData.title, url: canonicalPath },
        ],
        siteUrl,
      ),
    ),
  ];

  return buildBotHtml(
    {
      title: postData.title + " | " + SITE_NAME,
      description: postData.description || "",
      image,
      canonicalPath,
      section: postData.category,
      publishedTime,
      modifiedTime,
      authorName: postData.authorName,
      jsonLd,
      visibleTitle: postData.title,
      visibleContent: excerpt || postData.description || "",
    },
    siteUrl,
  );
}

function excerptWords(content: string, maxWords: number): string {
  const text = (content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.split(" ").slice(0, maxWords).join(" ");
}

export interface ArticleSnapshotPost {
  title: string;
  description: string;
  slug: string;
  category: string;
  coverImageUrl?: string;
  createdAt?: { toDate: () => Date };
  updatedAt?: { toDate: () => Date };
  authorName?: string;
  content?: string;
  rating?: number;
  verdict?: string;
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
}

function buildReviewJsonLd(
  post: ArticleSnapshotPost,
  siteUrl: string,
  canonicalPath: string,
  image: string,
  publishedTime: string | undefined,
): string {
  const itemName = post.projectTitle || post.title;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Review",
    name: `Review: ${post.title}`,
    description: post.description,
    url: siteUrl + canonicalPath,
    datePublished: publishedTime,
    inLanguage: "en-NG",
    author: {
      "@type": "Person",
      name: post.authorName || "TrendzHauz Editor",
    },
    itemReviewed: {
      "@type": post.projectType === "Album" ? "MusicAlbum" : "MusicRecording",
      name: itemName,
      ...(post.artistName
        ? { byArtist: { "@type": "MusicGroup", name: post.artistName } }
        : {}),
      image,
      publisher: { "@type": "Organization", name: SITE_NAME },
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: post.rating,
      bestRating: 10,
      worstRating: 0,
    },
  });
}

export function buildArticleSnapshotHtml(
  post: ArticleSnapshotPost,
  siteUrl: string,
): string {
  const categoryLower = (post.category || "news").toLowerCase();
  const canonicalPath = `/${categoryLower}/${post.slug}`;
  const image =
    deriveVariantUrl(post.coverImageUrl || "", 1280, "webp") ??
    (post.coverImageUrl || "");
  const created = post.createdAt?.toDate?.();
  const updated = post.updatedAt?.toDate?.();
  const publishedTime = created?.toISOString();
  const modifiedTime = updated?.toISOString();
  const body = excerptWords(post.content || "", 300);
  const isReview =
    categoryLower === "reviews" && typeof post.rating === "number";

  const jsonLd: Array<Record<string, unknown>> = [];
  if (isReview) {
    jsonLd.push(
      JSON.parse(
        buildReviewJsonLd(
          post,
          siteUrl,
          canonicalPath,
          image,
          publishedTime,
        ),
      ),
    );
  } else {
    jsonLd.push(
      JSON.parse(
        buildArticleJsonLd(
          {
            title: post.title,
            description: post.description,
            image,
            canonicalPath,
            publishedTime,
            modifiedTime,
            authorName: post.authorName,
            section: post.category,
          },
          siteUrl,
        ),
      ),
    );
  }
  jsonLd.push(
    JSON.parse(
      buildBreadcrumbJsonLd(
        [
          { name: "Home", url: "/" },
          { name: post.category, url: `/${categoryLower}` },
          { name: post.title, url: canonicalPath },
        ],
        siteUrl,
      ),
    ),
  );

  const visibleContent = [body, post.verdict ? `Verdict: ${post.verdict}` : null]
    .filter(Boolean)
    .join("\n");

  return buildBotHtml(
    {
      title: post.title + " | " + SITE_NAME,
      description: post.description || "",
      image,
      canonicalPath,
      section: post.category,
      publishedTime,
      modifiedTime,
      authorName: post.authorName,
      jsonLd,
      visibleTitle: post.title,
      visibleContent: visibleContent || post.description || "",
    },
    siteUrl,
  );
}

export function build404Html(siteUrl: string): string {
  return buildBotHtml(
    {
      title: "404 — Page Not Found | " + SITE_NAME,
      description: "The page you are looking for does not exist.",
      canonicalPath: "/404",
      robots: "noindex, nofollow",
      visibleTitle: "404 — Page Not Found",
      visibleContent:
        "The page you are looking for does not exist or has been moved.",
    },
    siteUrl,
  );
}
