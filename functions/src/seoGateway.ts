import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import {
  isBot,
  isBlockedBot,
  STATIC_SEO,
  buildStaticBotHtml,
  buildArticleBotHtml,
  build404Html,
} from "./seo/config";
import { getArticleSnapshot } from "./seo/article-snapshot";

function getDb() {
  return getFirestore();
}

const SITE_URL = "https://trendzhauz.com";
const SITE_NAME = "TrendzHauz Media";

const CONTENT_HUB_PATHS = ["/music", "/reviews", "/videos", "/news"];

function isContentHub(path: string): boolean {
  return CONTENT_HUB_PATHS.includes(path);
}

// ── SPA shell template (generated at deploy) ──
// eslint-disable-next-line @typescript-eslint/no-require-imports
let SPA_SHELL: string;
try {
  SPA_SHELL = require("./templates/spa-shell").SPA_SHELL;
} catch {
  SPA_SHELL =
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' +
    SITE_NAME +
    "</title></head><body><div id=\"root\"></div><script type=\"module\" src=\"/src/main.tsx\"></script></body></html>";
}

// ── Cache bounds ──
const MAX_HUB_CACHE_ENTRIES = 20;
const MAX_ARTICLE_CACHE_ENTRIES = 200;

// ── Hub page HTML cache (content hubs only, key = `${path}:${bot|human}`) ──
const hubCache = new Map<string, { html: string; ts: number }>();
const HUB_CACHE_TTL_MS = 60 * 1000;

// ── Article page cache ──
const articleCache = new Map<string, { html: string; ts: number }>();
const ARTICLE_CACHE_TTL_MS = 5 * 60 * 1000;

function purgeExpired(
  map: Map<string, { html: string; ts: number }>,
  ttl: number,
  max: number,
): void {
  const now = Date.now();
  for (const [key, entry] of map) {
    if (now - entry.ts >= ttl) map.delete(key);
  }
  if (map.size > max) {
    const oldest = [...map.entries()]
      .sort((a, b) => a[1].ts - b[1].ts)
      .slice(0, map.size - max)
      .map(([k]) => k);
    for (const k of oldest) map.delete(k);
  }
}

function setCacheHeaders(
  res: { set: (k: string, v: string) => void },
  maxAgeSeconds: number,
  sMaxAgeSeconds = 300,
): void {
  res.set("Vary", "User-Agent");
  res.set(
    "Cache-Control",
    `public, max-age=${maxAgeSeconds}, s-maxage=${sMaxAgeSeconds}`,
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizePath(raw: string): string {
  const p = raw === "" ? "/" : raw;
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

// ── Inject full SEO head tags into SPA shell for content hub routes ──
function injectHubHead(
  html: string,
  path: string,
): string {
  const meta = STATIC_SEO[path];
  const title = meta?.title ?? SITE_NAME;
  const description =
    meta?.description ?? "TrendzHauz Media";

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(description)}">`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escapeHtml(title)}">`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${escapeHtml(SITE_URL + path)}">`,
    )
    .replace(
      /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="twitter:title" content="${escapeHtml(title)}">`,
    )
    .replace(
      /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="twitter:description" content="${escapeHtml(description)}">`,
    );
}

function injectSkeleton(
  html: string,
  title: string,
  description: string,
): string {
  const skeleton = `<h1 style="font-family:system-ui;text-align:center;padding:2rem 1rem;color:inherit">${escapeHtml(title)}</h1>
<p style="font-family:system-ui;text-align:center;max-width:600px;margin:0 auto 2rem;padding:0 1rem;color:inherit;opacity:0.7">${escapeHtml(description)}</p>`;
  return html.replace(
    '<div id="root">',
    `<div id="root">${skeleton}`,
  );
}

function buildHumanHubHtml(path: string): string {
  const meta = STATIC_SEO[path];
  const title = meta?.title ?? SITE_NAME;
  const description = meta?.description ?? "TrendzHauz Media";

  let html = injectHubHead(SPA_SHELL, path);
  html = injectSkeleton(html, title, description);
  return html;
}

export const seoGateway = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
    concurrency: 80,
    invoker: "public",
  },
  async (req, res) => {
    const userAgent = req.headers["user-agent"] || null;
    const path = normalizePath(req.path);
    const segments = path.split("/").filter(Boolean);
    const isArticle = segments.length === 2;
    const isBotReq = isBot(userAgent);

    res.set("Content-Type", "text/html; charset=utf-8");

    // ── Blocked crawlers: short-circuit before any Firestore/Storage work ──
    if (isBlockedBot(userAgent)) {
      res.status(429).send("Too Many Requests");
      return;
    }

    // ── Human visitors ──
    if (!isBotReq) {
      // Content hub: full SEO head tags + visible skeleton
      if (isContentHub(path)) {
        const cacheKey = `${path}:human`;
        const cached = hubCache.get(cacheKey);
        if (cached && Date.now() - cached.ts < HUB_CACHE_TTL_MS) {
          setCacheHeaders(res, 60);
          res.send(cached.html);
          return;
        }

        const html = buildHumanHubHtml(path);

        purgeExpired(hubCache, HUB_CACHE_TTL_MS, MAX_HUB_CACHE_ENTRIES);
        hubCache.set(cacheKey, { html, ts: Date.now() });
        setCacheHeaders(res, 60);
        res.send(html);
        return;
      }

      // Other routes: plain SPA shell
      res.set("Vary", "User-Agent");
      res.set("Cache-Control", "public, max-age=0");
      res.send(SPA_SHELL);
      return;
    }

    // ── Bot visitors ──
    // Content hub cache check
    if (isContentHub(path) && !isArticle) {
      const cacheKey = `${path}:bot`;
      const cached = hubCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < HUB_CACHE_TTL_MS) {
        setCacheHeaders(res, 60);
        res.send(cached.html);
        return;
      }
    }

    // Article cache check
    if (isArticle) {
      const articleKey = `article:${path}`;
      const cached = articleCache.get(articleKey);
      if (cached && Date.now() - cached.ts < ARTICLE_CACHE_TTL_MS) {
        setCacheHeaders(res, 60);
        res.send(cached.html);
        return;
      }
    }

    // ── Bot: content hub / static route ──
    if (!isArticle || segments.length < 2) {
      const html = buildStaticBotHtml(path, SITE_URL);

      if (isContentHub(path)) {
        const cacheKey = `${path}:bot`;
        purgeExpired(hubCache, HUB_CACHE_TTL_MS, MAX_HUB_CACHE_ENTRIES);
        hubCache.set(cacheKey, { html, ts: Date.now() });
        setCacheHeaders(res, 60);
        res.send(html);
        return;
      }

      // Non-hub static routes (shouldn't reach this in Hybrid — Hosting serves
      // static files for /advertise etc. first; safe fallback.)
      setCacheHeaders(res, 60);
      res.send(html);
      return;
    }

    // ── Bot: article route ──
    const [categorySegment, slug] = segments;
    const articleKey = `article:${path}`;

    // Phase F: serve the on-publish snapshot when available (cheap + fresh).
    try {
      const snapshotHtml = await getArticleSnapshot(categorySegment, slug);
      if (snapshotHtml) {
        purgeExpired(
          articleCache,
          ARTICLE_CACHE_TTL_MS,
          MAX_ARTICLE_CACHE_ENTRIES,
        );
        articleCache.set(articleKey, { html: snapshotHtml, ts: Date.now() });
        setCacheHeaders(res, 60, 3600);
        res.send(snapshotHtml);
        return;
      }
    } catch (err) {
      console.error("seoGateway snapshot read error:", err);
      // fall through to the Firestore builder below
    }

    try {
      const db = getDb();
      const snap = await db
        .collection("posts")
        .where("status", "==", "published")
        .where("slug", "==", slug)
        .limit(1)
        .get();

      if (snap.empty) {
        const html = build404Html(SITE_URL);
        purgeExpired(
          articleCache,
          ARTICLE_CACHE_TTL_MS,
          MAX_ARTICLE_CACHE_ENTRIES,
        );
        articleCache.set(articleKey, { html, ts: Date.now() });
        setCacheHeaders(res, 60);
        res.status(404).send(html);
        return;
      }

      const doc = snap.docs[0];
      const data = doc.data();
      const html = buildArticleBotHtml(
        {
          title: String(data.title || ""),
          description: String(data.description || ""),
          slug: String(data.slug || slug),
          category: String(data.category || "news"),
          coverImageUrl: data.coverImageUrl
            ? String(data.coverImageUrl)
            : undefined,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          authorName: data.authorName
            ? String(data.authorName)
            : undefined,
          content: data.content ? String(data.content) : undefined,
        },
        SITE_URL,
      );

      purgeExpired(
        articleCache,
        ARTICLE_CACHE_TTL_MS,
        MAX_ARTICLE_CACHE_ENTRIES,
      );
      articleCache.set(articleKey, { html, ts: Date.now() });
      setCacheHeaders(res, 60);
      res.send(html);
    } catch (err) {
      console.error("seoGateway article error:", err);
      const cached = articleCache.get(articleKey);
      if (cached) {
        setCacheHeaders(res, 60);
        res.send(cached.html);
        return;
      }
      res.status(500).send(
        '<!DOCTYPE html><html><head><title>' +
          SITE_NAME +
          "</title></head><body><h1>Error</h1></body></html>",
      );
    }
  },
);
