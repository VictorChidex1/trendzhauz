/**
 * Phase E Hybrid predeploy helper.
 *
 * Static hub routes (advertise, contact, links, privacy, terms) are
 * pre-rendered as dist/{route}/index.html with full page-specific SEO
 * metadata and visible skeletons.  Firebase Hosting serves these files
 * directly — the seoGateway Function is never invoked for them.
 *
 * Content hub routes (music, reviews, videos, news) are served
 * dynamically by the seoGateway Function (Approach 1 runtime injection)
 * so their responses stay fresh without a redeploy.
 *
 * Homepage (dist/index.html) receives the latest preloaded aggregation
 * JSON from Firestore so the React shell can paint immediately.
 *
 * Runs during `firebase deploy` via hosting.predeploy after npm run build.
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
const SITE_URL = "https://trendzhauz.com";

const STATIC_HUBS = [
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

function toSafeJson(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// ── Read .env for Firestore REST API access ──
let FIREBASE_API_KEY = "";
let FIREBASE_PROJECT_ID = "";
try {
  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(envPath)) {
    const envRaw = fs.readFileSync(envPath, "utf-8");
    for (const line of envRaw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      if (k === "VITE_FIREBASE_API_KEY") FIREBASE_API_KEY = v;
      if (k === "VITE_FIREBASE_PROJECT_ID") FIREBASE_PROJECT_ID = v;
    }
  }
} catch {
  // .env unavailable — skip preloading silently
}

// ── Unwrap Firestore REST value into plain JSON ──
function unwrapFirestoreValue(val) {
  if (val === null || val === undefined) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.timestampValue !== undefined) return val.timestampValue;
  if (val.nullValue !== undefined) return null;
  if (val.mapValue) {
    const obj = {};
    if (val.mapValue.fields) {
      for (const [k, v] of Object.entries(val.mapValue.fields)) {
        obj[k] = unwrapFirestoreValue(v);
      }
    }
    return obj;
  }
  if (val.arrayValue) {
    return (val.arrayValue.values || []).map(unwrapFirestoreValue);
  }
  return null;
}

function toIsoTimestamp(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (typeof val.toDate === "function") return val.toDate().toISOString();
  if (typeof val._seconds === "number")
    return new Date(val._seconds * 1000).toISOString();
  if (typeof val.seconds === "number")
    return new Date(val.seconds * 1000).toISOString();
  return new Date().toISOString();
}

// ── Fetch preloaded aggregation data from Firestore ──
async function fetchPreloadedData() {
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) return null;
  try {
    const url =
      "https://firestore.googleapis.com/v1/projects/" +
      FIREBASE_PROJECT_ID +
      "/databases/(default)/documents/aggregations/preloaded?key=" +
      FIREBASE_API_KEY;
    const res = await fetch(url);
    if (res.ok) {
      const doc = await res.json();
      if (doc.fields) {
        const unwrapped = unwrapFirestoreValue({
          mapValue: { fields: doc.fields },
        });
        if (unwrapped) {
          unwrapped.preloadedAt =
            toIsoTimestamp(unwrapped.preloadedAt) || new Date().toISOString();
        }
        console.log(
          "  ✅ Preloaded aggregation data fetched from Firestore.",
        );
        return toSafeJson(unwrapped);
      }
    }
  } catch (err) {
    console.warn("  ⚠️  Could not fetch preloaded data:", err.message);
  }
  return null;
}

// ── Read the built SPA shell once ──
const sourceHtml = fs.readFileSync(DIST_HTML, "utf-8");

// Strip the old SEO metadata block so we can inject clean route-specific tags.
const oldSeoBlock =
  /<!-- Primary SEO Metadata -->[\s\S]*?<!-- Web App Manifest/;
const baseHtml = sourceHtml.replace(oldSeoBlock, "<!-- Web App Manifest");

async function main() {
  // ═══════════════════════════════════════════════════════════
  // 1. Static hub routes (advertise, contact, links, privacy, terms)
  //    → Full SEO metadata + visible skeleton, served by Hosting.
  // ═══════════════════════════════════════════════════════════
  console.log("\n📄 Static hub pre-rendering:");
  let written = 0;

  for (const hub of STATIC_HUBS) {
    const routePath = "/" + hub.route;
    const canonical = SITE_URL + routePath;

    const jsonLd = buildWebPageSchema(hub.title, canonical, hub.description);

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
<meta property="og:image" content="${escapeHtml(SITE_URL + LOGO_URL)}" />
<meta property="og:locale" content="${OG_LOCALE}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content="${escapeHtml(hub.title)}" />
<meta property="twitter:description" content="${escapeHtml(hub.description)}" />
<meta property="twitter:image" content="${escapeHtml(SITE_URL + LOGO_URL)}" />

<script type="application/ld+json">${jsonLd}</script>`;

    let outHtml = baseHtml.replace(
      "<!-- Web App Manifest",
      seoBlock + "\n\n    <!-- Web App Manifest",
    );

    const skeleton = `<h1 style="font-family:system-ui;text-align:center;padding:2rem 1rem;color:inherit">${escapeHtml(hub.title)}</h1>
<p style="font-family:system-ui;text-align:center;max-width:600px;margin:0 auto 2rem;padding:0 1rem;color:inherit;opacity:0.7">${escapeHtml(hub.description)}</p>`;

    outHtml = outHtml.replace(
      '<div id="root">',
      `<div id="root">${skeleton}`,
    );

    const outDir = path.join(ROOT, "dist", hub.route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), outHtml, "utf-8");
    written++;
    console.log(`  ✅ ${hub.route}`);
  }
  console.log(
    `\n✅ ${written} static hub routes pre-rendered into dist/*/index.html`,
  );

  // ═══════════════════════════════════════════════════════════
  // 2. Homepage: inject preloaded aggregation data into
  //    dist/index.html for immediate React paint.
  // ═══════════════════════════════════════════════════════════
  console.log("\n🏠 Homepage preload inject:");
  const preloadedJson = await fetchPreloadedData();

  if (preloadedJson) {
    const homeHtml = sourceHtml.replace(
      "</head>",
      `<script id="__PRELOADED__" type="application/json">${preloadedJson}</script>\n</head>`,
    );
    fs.writeFileSync(DIST_HTML, homeHtml, "utf-8");
    console.log(
      "  ✅ Homepage: preloaded aggregation data injected into dist/index.html",
    );
  } else {
    console.log("  ⚠️  Homepage: no preloaded data available — skipped.");
  }

  // ═══════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════
  console.log(
    "\n---\n✅ Phase E Hybrid complete.\n" +
      "   • Static hubs: advertise, contact, links, privacy, terms → Hosting\n" +
      "   • Content hubs: music, reviews, videos, news → seoGateway (runtime injection)\n" +
      "   • Homepage: preload injected into dist/index.html",
  );
}

main().catch((err) => {
  console.error("❌ Prerender failed:", err);
  process.exit(1);
});
