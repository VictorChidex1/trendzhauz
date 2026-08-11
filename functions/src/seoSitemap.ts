import { onRequest } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) initializeApp();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const SITE_URL = "https://trendzhauz.com";

const STATIC_ROUTES = [
  "/",
  "/music",
  "/reviews",
  "/videos",
  "/news",
  "/advertise",
  "/contact",
  "/links",
  "/privacy",
  "/terms",
];

const PUBLIC_CATEGORIES = ["Music", "Videos", "Reviews", "News"];

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedXml: string | null = null;
let cachedAt = 0;

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function buildSitemap(): Promise<string> {
  const now = Date.now();

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  // ── Static routes ──
  for (const path of STATIC_ROUTES) {
    lines.push("  <url>");
    lines.push(`    <loc>${SITE_URL}${path}</loc>`);
    lines.push("  </url>");
  }

  // ── Published articles ──
  const allPublished = await db
    .collection("posts")
    .where("status", "==", "published")
    .get();

  for (const doc of allPublished.docs) {
    const data = doc.data();

    const created = data.createdAt?.toDate?.() as Date | undefined;
    if (!created || created.getTime() > now) continue;

    if (!data.slug || !data.category) continue;
    if (!PUBLIC_CATEGORIES.includes(data.category)) continue;

    const loc = `${SITE_URL}/${data.category.toLowerCase()}/${data.slug}`;
    const lastmodDate = data.updatedAt?.toDate?.() ?? created;
    const lastmod = lastmodDate instanceof Date ? lastmodDate.toISOString() : null;

    lines.push("  <url>");
    lines.push(`    <loc>${xmlEscape(loc)}</loc>`);
    if (lastmod) {
      lines.push(`    <lastmod>${lastmod}</lastmod>`);
    }
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return lines.join("\n");
}

export const seoSitemap = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
    concurrency: 80,
    invoker: "public",
  },
  async (_req, res) => {
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=300, s-maxage=900");

    const now = Date.now();

    if (cachedXml && now - cachedAt < CACHE_TTL_MS) {
      res.send(cachedXml);
      return;
    }

    try {
      const xml = await buildSitemap();
      cachedXml = xml;
      cachedAt = now;
      res.send(xml);
    } catch (err) {
      console.error("seoSitemap error:", err);
      // On error, serve cached XML if available (stale is better than nothing)
      if (cachedXml) {
        res.send(cachedXml);
        return;
      }
      res.status(500).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><error>Failed to generate sitemap</error>");
    }
  },
);
