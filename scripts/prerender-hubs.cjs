/**
 * Phase E predeploy helper — generates pre-rendered static HTML for every
 * public hub route so visitors receive visible content and page-specific
 * metadata before React boots.
 *
 * Runs automatically during `firebase deploy --only hosting` because
 * it is listed in firebase.json hosting.predeploy after npm run build.
 *
 * How it works:
 * 1. Reads the existing `dist/index.html` produced by Vite.
 * 2. For each hub route, replaces the generic <title> with a route-specific
 *    title and injects page-specific description, OG/Twitter tags, canonical
 *    URL, JSON-LD, and a visible skeleton <h1>/<p> before the React root.
 * 3. Writes each route's HTML as `dist/{route}/index.html`.
 *
 * Firebase Hosting serves these static files directly (exact file matches
 * take priority over configured rewrites), so the seoGateway Function is
 * never invoked for pre-rendered hub routes.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST_HTML = path.join(ROOT, "dist", "index.html");

if (!fs.existsSync(DIST_HTML)) {
  console.error("❌ dist/index.html not found. Run `npm run build` first.");
  process.exit(1);
}

const SITE_NAME = "TrendzHauz Media";
const OG_LOCALE = "en_NG";
const LOGO_URL = "/assets/Trendzhauz-logo.png";

const HUBS = [
  {
    route: "music",
    title: "Music | " + SITE_NAME,
    description:
      "Stream the latest Afrobeats, hip-hop, and global hits — new music drops, trending singles, and exclusive mixes from TrendzHauz Media.",
    collectionName: "Music — TrendzHauz Media",
  },
  {
    route: "reviews",
    title: "Reviews | " + SITE_NAME,
    description:
      "In-depth album and project reviews with honest verdicts — ratings, score breakdowns, and final calls from TrendzHauz Media.",
    collectionName: "Reviews — TrendzHauz Media",
  },
  {
    route: "videos",
    title: "Videos | " + SITE_NAME,
    description:
      "Watch the freshest music videos, live sessions, and behind-the-scenes clips from your favorite African and global artists.",
    collectionName: "Videos — TrendzHauz Media",
  },
  {
    route: "news",
    title: "News | " + SITE_NAME,
    description:
      "Breaking entertainment news, artist updates, and African music culture stories from TrendzHauz Media.",
    collectionName: "News — TrendzHauz Media",
  },
  {
    route: "advertise",
    title: "Advertise With Us | " + SITE_NAME,
    description:
      "Promote your brand with TrendzHauz Media — sponsored posts, banner placements, video partnerships, and audio campaigns that reach African music fans worldwide.",
  },
  {
    route: "contact",
    title: "Contact Us | " + SITE_NAME,
    description:
      "Get in touch with the TrendzHauz Media team — partnerships, submissions, feedback, or general inquiries.",
  },
  {
    route: "links",
    title: "Links | " + SITE_NAME,
    description:
      "All the essential TrendzHauz Media links in one place — music, videos, social channels, and more.",
  },
  {
    route: "privacy",
    title: "Privacy Policy | " + SITE_NAME,
    description:
      "Learn how TrendzHauz Media collects, uses, and protects your personal data — our privacy commitment to every visitor.",
  },
  {
    route: "terms",
    title: "Terms of Service | " + SITE_NAME,
    description:
      "Terms and conditions governing your use of TrendzHauz Media — including content usage, intellectual property, and user responsibilities.",
  },
];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCollectionSchema(name, siteUrl) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: siteUrl,
    inLanguage: "en-NG",
  });
}

function buildWebPageSchema(name, siteUrl, description) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url: siteUrl,
    description,
    inLanguage: "en-NG",
  });
}

// Read the built SPA shell once — all hub pages share the same JS/CSS assets.
const sourceHtml = fs.readFileSync(DIST_HTML, "utf-8");

// Strip the old SEO metadata block (between the Primary SEO Metadata comment
// and the Web App Manifest comment) so we can inject clean route-specific tags.
const oldSeoBlock = /<!-- Primary SEO Metadata -->[\s\S]*?<!-- Web App Manifest/;
const cleanHtml = sourceHtml.replace(oldSeoBlock, "<!-- Web App Manifest");

let written = 0;

for (const hub of HUBS) {
  const routePath = "/" + hub.route;
  const canonical = "https://trendzhauz.com" + routePath;

  // JSON-LD: CollectionPage for content hubs, WebPage for marketing/legal
  let jsonLd = "";
  if (hub.collectionName) {
    jsonLd = buildCollectionSchema(hub.collectionName, canonical);
  } else {
    jsonLd = buildWebPageSchema(hub.title, canonical, hub.description);
  }

  // Build route-specific SEO metadata block
  const seoBlock = `<!-- Primary SEO Metadata -->
<title>${escapeHtml(hub.title)}</title>
<meta name="description" content="${escapeHtml(hub.description)}">
<meta
  name="keywords"
  content="DJ Davisy, Trendzhauz, African music, Afrobeats, Music reviews, Entertainment news, Mixtapes, Nigeria"
/>
<meta name="author" content="DJ Davisy / CV Digital" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:title" content="${escapeHtml(hub.title)}" />
<meta property="og:description" content="${escapeHtml(hub.description)}" />
<meta property="og:image" content="${escapeHtml("https://trendzhauz.com" + LOGO_URL)}" />
<meta property="og:locale" content="${OG_LOCALE}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content="${escapeHtml(hub.title)}" />
<meta property="twitter:description" content="${escapeHtml(hub.description)}" />
<meta property="twitter:image" content="${escapeHtml("https://trendzhauz.com" + LOGO_URL)}" />

<script type="application/ld+json">${jsonLd}</script>`;

  let outHtml = cleanHtml.replace(
    "<!-- Web App Manifest",
    seoBlock + "\n\n    <!-- Web App Manifest",
  );

  // Inject a visible skeleton before the React root so the browser can
  // paint content immediately (improves FCP). React replaces it on mount.
  const skeleton = `\n<h1 style="font-family:system-ui;text-align:center;padding:2rem 1rem;color:inherit">${escapeHtml(hub.title)}</h1>
<p style="font-family:system-ui;text-align:center;max-width:600px;margin:0 auto 2rem;padding:0 1rem;color:inherit;opacity:0.7">${escapeHtml(hub.description)}</p>`;

  outHtml = outHtml.replace('<div id="root">', `<div id="root">${skeleton}`);

  // Write to dist/{route}/index.html
  const outDir = path.join(ROOT, "dist", hub.route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), outHtml, "utf-8");
  written++;
  console.log(`  ✅ ${hub.route}`);
}

console.log(`\n✅ Phase E: ${written} hub routes pre-rendered into dist/*/index.html`);
