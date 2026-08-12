import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import {
  isBot,
  STATIC_SEO,
  buildStaticBotHtml,
  buildArticleBotHtml,
  build404Html,
} from "./seo/config";

function getDb() {
  return getFirestore();
}

const SITE_URL = "https://trendzhauz.com";
const SITE_NAME = "TrendzHauz Media";

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

// ── Preloaded aggregation cache (60s TTL — fresh per publish, cheap to refresh) ──
let cachedPreload: { json: string | null; ts: number } = {
  json: null,
  ts: 0,
};
const PRELOAD_CACHE_TTL_MS = 60 * 1000;

// ── Hub page HTML cache (path → HTML, 60s TTL) ──
const hubCache = new Map<string, { html: string; ts: number }>();
const HUB_CACHE_TTL_MS = 60 * 1000;

// ── Article page cache ──
const articleCache = new Map<
  string,
  { html: string; ts: number }
>();
const ARTICLE_CACHE_TTL_MS = 5 * 60 * 1000;

function setCacheHeaders(res: { set: (k: string, v: string) => void }): void {
  res.set("Cache-Control", "public, max-age=60, s-maxage=300");
}

async function getPreloadedJson(): Promise<string | null> {
  const now = Date.now();
  if (cachedPreload.json !== null && now - cachedPreload.ts < PRELOAD_CACHE_TTL_MS) {
    return cachedPreload.json;
  }
  try {
    const db = getDb();
    const snap = await db.doc("aggregations/preloaded").get();
    if (!snap.exists) {
      cachedPreload = { json: null, ts: now };
      return null;
    }
    const data = snap.data() || {};
    const stripped = {
      preloadedAt: data.preloadedAt,
      heroSlides: data.heroSlides,
      trending: data.trending,
      editorPicks: data.editorPicks,
      latestStories: data.latestStories,
    };
    const json = JSON.stringify(stripped);
    cachedPreload = { json, ts: now };
    return json;
  } catch (err) {
    console.error("seoGateway preload fetch error:", err);
    return cachedPreload.json; // serve stale if available
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectPreloadIntoSpashell(
  html: string,
  preloadedJson: string | null,
  title: string,
  description: string,
): string {
  // Strip any stale preload tag (template may carry one from build)
  const clean = html.replace(
    /<script id="__PRELOADED__"[^>]*>[\s\S]*?<\/script>/g,
    "",
  );

  const preloadTag = preloadedJson
    ? `<script id="__PRELOADED__" type="application/json">${preloadedJson}</script>`
    : "";

  const skeleton = `<h1 style="font-family:system-ui;text-align:center;padding:2rem 1rem;color:inherit">${escapeHtml(title)}</h1>
<p style="font-family:system-ui;text-align:center;max-width:600px;margin:0 auto 2rem;padding:0 1rem;color:inherit;opacity:0.7">${escapeHtml(description)}</p>`;

  return clean
    .replace("</head>", `${preloadTag}\n</head>`)
    .replace('<div id="root">', `<div id="root">${skeleton}`);
}

function injectPreloadIntoBotHtml(
  html: string,
  preloadedJson: string | null,
): string {
  if (!preloadedJson) return html;
  return html.replace(
    "</head>",
    `<script id="__PRELOADED__" type="application/json">${preloadedJson}</script>\n</head>`,
  );
}

const HUB_PATHS = [
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

function isHubRoute(path: string): boolean {
  return HUB_PATHS.includes(path);
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
    const path = req.path === "" ? "/" : req.path;
    const segments = path.split("/").filter(Boolean);
    const isArticle = segments.length === 2;

    // ── Human visitors ──
    if (!isBot(userAgent)) {
      res.set("Content-Type", "text/html; charset=utf-8");

      // Hub routes: inject preloaded JSON + visible skeleton
      if (isHubRoute(path)) {
        const preloadedJson = await getPreloadedJson();
        const hubMeta = STATIC_SEO[path];
        const title = hubMeta?.title ?? SITE_NAME;
        const description =
          hubMeta?.description ?? "TrendzHauz Media";
        const html = injectPreloadIntoSpashell(
          SPA_SHELL,
          preloadedJson,
          title,
          description,
        );
        setCacheHeaders(res);
        res.send(html);
        return;
      }

      // Other routes: plain SPA shell
      res.set("Cache-Control", "public, max-age=0");
      res.send(SPA_SHELL);
      return;
    }

    // ── Bot visitors ──
    res.set("Content-Type", "text/html; charset=utf-8");

    // Hub route cache check (shared human+bot cache key)
    if (isHubRoute(path) && !isArticle) {
      const cached = hubCache.get(path);
      if (cached && Date.now() - cached.ts < HUB_CACHE_TTL_MS) {
        setCacheHeaders(res);
        res.send(cached.html);
        return;
      }
    }

    // Article cache check
    if (isArticle) {
      const articleKey = `article:${path}`;
      const cached = articleCache.get(articleKey);
      if (cached && Date.now() - cached.ts < ARTICLE_CACHE_TTL_MS) {
        setCacheHeaders(res);
        res.send(cached.html);
        return;
      }
    }

    // ── Bot: hub/static route ──
    if (!isArticle || segments.length < 2) {
      const html = buildStaticBotHtml(path, SITE_URL);

      if (isHubRoute(path)) {
        const preloadedJson = await getPreloadedJson();
        const finalHtml = injectPreloadIntoBotHtml(html, preloadedJson);
        hubCache.set(path, { html: finalHtml, ts: Date.now() });
        setCacheHeaders(res);
        res.send(finalHtml);
        return;
      }

      setCacheHeaders(res);
      res.send(html);
      return;
    }

    // ── Bot: article route ──
    const [, slug] = segments;
    const articleKey = `article:${path}`;

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
        articleCache.set(articleKey, { html, ts: Date.now() });
        setCacheHeaders(res);
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

      articleCache.set(articleKey, { html, ts: Date.now() });
      setCacheHeaders(res);
      res.send(html);
    } catch (err) {
      console.error("seoGateway article error:", err);
      const cached = articleCache.get(articleKey);
      if (cached) {
        setCacheHeaders(res);
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
