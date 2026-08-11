/**
 * Vercel Edge Middleware — Phase D SEO Gateway (preview environment)
 *
 * Detects crawler User-Agents and returns page-specific HTML with
 * correct title, description, OG/Twitter tags, canonical URL,
 * and JSON-LD structured data BEFORE React loads.
 *
 * Human visitors pass through to the SPA as normal.
 */

// ── Inlined SEO constants (cannot import from src/seo/site.ts because
//     that file uses import.meta.env.VITE_SITE_URL, which is unavailable
//     in Vercel Edge Runtime) ──

const SITE_NAME = "TrendzHauz Media";
const DEFAULT_DESCRIPTION =
  "Discover music reviews, breaking news, videos, and exclusive artist features from Nigeria-based TrendzHauz Media — your source for global entertainment and African music culture.";
const OG_LOCALE = "en_NG";

const BOT_UA_PATTERNS = [
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

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) =>
    ua.includes(pattern.toLowerCase()),
  );
}

interface SeoMeta {
  title: string;
  description: string;
}

const STATIC_SEO: Record<string, SeoMeta> = {
  "/": {
    title: "TrendzHauz Media | Music Reviews, Entertainment News & Artist Features",
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
      "Learn how TrendzHauz Media collects, uses, and protects your personal data — our privacy commitment to every visitor.",
  },
  "/terms": {
    title: "Terms of Service | " + SITE_NAME,
    description:
      "Terms and conditions governing your use of TrendzHauz Media — including content usage, intellectual property, and user responsibilities.",
  },
};

const DEFAULT_IMAGE = "/assets/Trendzhauz-logo.png";

function buildJsonLd(
  siteUrl: string,
  logoUrl: string,
  path: string,
): string {
  if (path === "/") {
    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      logo: logoUrl,
      areaServed: "NG",
      address: { "@type": "PostalAddress", addressCountry: "NG" },
    };
    const ws = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
      inLanguage: "en-NG",
      publisher: { "@type": "Organization", name: SITE_NAME },
    };
    return JSON.stringify(org) + JSON.stringify(ws);
  }
  if (["/music", "/reviews", "/videos", "/news"].includes(path)) {
    const cp = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: (STATIC_SEO[path]?.title ?? "").replace(
        " | " + SITE_NAME,
        "",
      ),
      url: siteUrl + path,
      inLanguage: "en-NG",
    };
    return JSON.stringify(cp);
  }
  return "";
}

function buildBotHtml(
  siteUrl: string,
  path: string,
  meta: SeoMeta | null,
): string {
  const logoUrl = siteUrl + DEFAULT_IMAGE;
  const canonical = siteUrl + path;
  const title = meta?.title ?? SITE_NAME;
  const description = meta?.description ?? DEFAULT_DESCRIPTION;
  const jsonLd = buildJsonLd(siteUrl, logoUrl, path);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(logoUrl)}">
<meta property="og:locale" content="${OG_LOCALE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(logoUrl)}">
${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<p><a href="${escapeHtml(canonical)}">Visit TrendzHauz Media</a></p>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function middleware(request: Request): Response | undefined {
  const userAgent = request.headers.get("user-agent");
  if (!isBot(userAgent)) return;

  const url = new URL(request.url);
  const path = url.pathname === "" ? "/" : url.pathname;
  const siteUrl = url.origin;

  const staticMeta = STATIC_SEO[path];
  if (staticMeta) {
    return new Response(buildBotHtml(siteUrl, path, staticMeta), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=900",
      },
    });
  }

  // Article fallback — show TrendzHauz branding
  return new Response(
    buildBotHtml(siteUrl, path, {
      title: path.replace(/^\//, "").replace(/-/g, " ") + " | " + SITE_NAME,
      description: DEFAULT_DESCRIPTION,
    }),
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=900",
      },
    },
  );
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|api|assets|favicon\\.ico|site\\.webmanifest).*)",
  ],
};
