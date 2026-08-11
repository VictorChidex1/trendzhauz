import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import {
  isBot,
  buildStaticBotHtml,
  buildArticleBotHtml,
  build404Html,
} from "./seo/config";

// Admin SDK is initialized by index.ts.
// Call getFirestore() lazily inside the handler.
function getDb() {
  return getFirestore();
}

// In-memory cache: path → HTML (5-minute TTL)
const cache = new Map<string, { html: string; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// SPA shell template — generated at deploy time by the predeploy script.
// Fall back to a minimal shell if the template hasn't been generated yet.
// eslint-disable-next-line @typescript-eslint/no-require-imports
let SPA_SHELL: string;
try {
  SPA_SHELL = require("./templates/spa-shell").SPA_SHELL;
} catch {
  SPA_SHELL = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>TrendzHauz Media</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`;
}

const SITE_URL = "https://trendzhauz.com";

function setCacheHeaders(res: { set: (k: string, v: string) => void }): void {
  res.set("Cache-Control", "public, max-age=300, s-maxage=900");
}

function getCacheKey(path: string, isArticle: boolean): string {
  return isArticle ? `article:${path}` : `static:${path}`;
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

    // ── Human visitors → SPA shell ──
    if (!isBot(userAgent)) {
      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=0");
      res.send(SPA_SHELL);
      return;
    }

    // ── Bot: check memory cache ──
    const segments = path.split("/").filter(Boolean);
    const isArticle = segments.length === 2;
    const cacheKey = getCacheKey(path, isArticle);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      res.set("Content-Type", "text/html; charset=utf-8");
      setCacheHeaders(res);
      res.send(cached.html);
      return;
    }

    // ── Bot: static routes ──
    if (!isArticle || segments.length < 2) {
      const html = buildStaticBotHtml(path, SITE_URL);
      cache.set(cacheKey, { html, ts: Date.now() });
      res.set("Content-Type", "text/html; charset=utf-8");
      setCacheHeaders(res);
      res.send(html);
      return;
    }

    // ── Bot: article route ──
    const [, slug] = segments;

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
        cache.set(cacheKey, { html, ts: Date.now() });
        res.set("Content-Type", "text/html; charset=utf-8");
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
          coverImageUrl: data.coverImageUrl ? String(data.coverImageUrl) : undefined,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          authorName: data.authorName ? String(data.authorName) : undefined,
          content: data.content ? String(data.content) : undefined,
        },
        SITE_URL,
      );

      cache.set(cacheKey, { html, ts: Date.now() });
      res.set("Content-Type", "text/html; charset=utf-8");
      setCacheHeaders(res);
      res.send(html);
    } catch (err) {
      console.error("seoGateway article error:", err);
      // Serve cached HTML if available (stale is better than SPA shell for bots)
      if (cached) {
        res.set("Content-Type", "text/html; charset=utf-8");
        setCacheHeaders(res);
        res.send(cached.html);
        return;
      }
      res.set("Content-Type", "text/html; charset=utf-8");
      res.status(500).send(
        "<!DOCTYPE html><html><head><title>TrendzHauz Media</title></head><body><h1>Error</h1></body></html>",
      );
    }
  },
);
