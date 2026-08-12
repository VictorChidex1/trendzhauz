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
        const unwrapped = unwrapFirestoreValue({ mapValue: { fields: doc.fields } });
        console.log("  ✅ Preloaded aggregation data fetched from Firestore.");
        return JSON.stringify(unwrapped);
      }
    }
  } catch (err) {
    console.warn("  ⚠️  Could not fetch preloaded data:", err.message);
  }
  return null;
}

// ── Hub routes are now served dynamically by the seoGateway Function
// (Phase E enhancement — on-publish preload injection at runtime).
// This script only enhances the static dist/index.html with preloaded
// aggregation data for the homepage.

// ── Read the built SPA shell once ──
const sourceHtml = fs.readFileSync(DIST_HTML, "utf-8");

async function main() {
  const preloadedJson = await fetchPreloadedData();

  // ── Homepage: inject preloaded aggregation data into dist/index.html ──
  // Hub routes are served dynamically by seoGateway; only dist/index.html
  // gets a static preload boost for maximum homepage CWV.
  if (preloadedJson) {
    const homeHtml = sourceHtml.replace(
      "</head>",
      `<script id="__PRELOADED__" type="application/json">${preloadedJson}</script>\n</head>`,
    );
    fs.writeFileSync(DIST_HTML, homeHtml, "utf-8");
    console.log("  ✅ Homepage: preloaded aggregation data injected into dist/index.html");
  } else {
    console.log("  ⚠️  Homepage: no preloaded data available — skipped.");
  }

  console.log(`\n✅ Phase E: homepage enhanced with preloaded data. Hub routes served by seoGateway.`);
}

main().catch((err) => {
  console.error("❌ Prerender failed:", err);
  process.exit(1);
});
