import * as React from "react";
import { useTheme } from "@/hooks/theme-context";
import {
  parseSocialUrl,
  isSafeHttpsUrl,
  SOCIAL_PLATFORMS,
} from "@/lib/socialEmbed";
import type { SocialPlatform } from "@/lib/socialEmbed";

/**
 * SocialEmbed — Client-Side Social Post Hydrator
 *
 * Accepts a raw social media URL and:
 *  1. Parses/validates it against a strict host + scheme allowlist
 *  2. Renders the platform's <blockquote> markup
 *  3. Lazily loads the official embed script (once per platform, shared across
 *     all instances + SPA navigations via a module-level registry)
 *  4. Re-processes newly mounted nodes so they hydrate into native widgets
 *  5. Falls back to a safe card (link or non-clickable text) on any failure
 *
 * Supported: X (Twitter), Instagram, TikTok.
 */

interface SocialEmbedProps {
  /** The raw social media post URL stored in Firestore. */
  url: string;
  /** Optional additional Tailwind classes for the outer wrapper. */
  className?: string;
}

// ─── Module-level script registry (shared across instances + SPA navigations) ─

const scriptPromises = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
  const existing = scriptPromises.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromises.delete(src);
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });

  scriptPromises.set(src, promise);
  return promise;
}

// TikTok's embed.js exposes no re-process API, so a fresh script element is
// injected to force a re-scan of newly mounted blockquotes. Idempotent.
let tiktokRescanInFlight: Promise<void> | null = null;

function rescanTikTok(): Promise<void> {
  if (!tiktokRescanInFlight) {
    tiktokRescanInFlight = new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src = SOCIAL_PLATFORMS.tiktok.scriptUrl;
      script.async = true;
      script.onload = () => {
        script.remove();
        resolve();
      };
      script.onerror = () => {
        script.remove();
        resolve();
      };
      document.head.appendChild(script);
    }).finally(() => {
      tiktokRescanInFlight = null;
    });
  }
  return tiktokRescanInFlight;
}

function reprocess(platform: SocialPlatform): void {
  if (platform === "x") {
    const twttr = (
      window as Window & { twttr?: { widgets?: { load?: () => void } } }
    ).twttr;
    twttr?.widgets?.load?.();
  } else if (platform === "instagram") {
    const instgrm = (
      window as Window & { instgrm?: { Embeds?: { process?: () => void } } }
    ).instgrm;
    instgrm?.Embeds?.process?.();
  }
}

// ─── Safe fallback card (link or non-clickable text) ─────────────────────────

function EmbedFallback({
  url,
  label,
  color,
  clickable,
  className = "",
}: {
  url: string;
  label: string;
  color: string;
  clickable: boolean;
  className?: string;
}) {
  const body = (
    <>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <span className="text-lg font-bold" style={{ color }}>
          @
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color }}
        >
          {label}
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
          {url}
        </div>
      </div>
    </>
  );

  if (clickable) {
    return (
      <div className={`my-6 ${className}`}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-brand/50 hover:shadow-md transition-all group"
        >
          {body}
          <svg
            className="w-4 h-4 text-zinc-400 group-hover:text-brand transition-colors flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      <div className="flex items-center gap-3 px-5 py-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
        {body}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SocialEmbed({ url, className = "" }: SocialEmbedProps) {
  // Read the theme ONCE at construction so toggling dark/light never re-runs
  // the script load/re-process effect (avoids a re-hydration loop).
  const { theme } = useTheme();
  const initialTheme = React.useRef(theme).current;

  const parsed = React.useMemo(() => parseSocialUrl(url), [url]);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!parsed || parsed.isShortLink) return;

    const platform = parsed.platform;
    const scriptUrl = SOCIAL_PLATFORMS[platform].scriptUrl;
    let cancelled = false;

    async function hydrate() {
      if (platform === "tiktok") {
        await rescanTikTok();
        return;
      }
      try {
        await loadScriptOnce(scriptUrl);
        if (!cancelled) reprocess(platform);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [parsed]);

  // ── Unrecognized URL → non-clickable text card (never a live href) ─────
  if (!parsed) {
    return (
      <EmbedFallback
        url={url}
        label="Social Post"
        color="#f97316"
        clickable={false}
        className={className}
      />
    );
  }

  const config = SOCIAL_PLATFORMS[parsed.platform];

  // ── Script failure → safe card ─────────────────────────────────────────
  if (failed) {
    return (
      <EmbedFallback
        url={parsed.url}
        label={config.label}
        color={config.color}
        clickable={isSafeHttpsUrl(parsed.url)}
        className={className}
      />
    );
  }

  // ── TikTok short link → "Open on TikTok" card ──────────────────────────
  if (parsed.isShortLink) {
    return (
      <EmbedFallback
        url={parsed.url}
        label={config.label}
        color={config.color}
        clickable={isSafeHttpsUrl(parsed.url)}
        className={className}
      />
    );
  }

  // ── Valid embed → blockquote + native widget hydration ─────────────────
  return (
    <div className={`my-6 ${className}`}>
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {parsed.platform === "x" && (
        <blockquote className="twitter-tweet" data-theme={initialTheme}>
          <a href={parsed.url} target="_blank" rel="noopener noreferrer">
            View this post on X
          </a>
        </blockquote>
      )}

      {parsed.platform === "instagram" && (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`${parsed.url}/`}
          data-instgrm-version="14"
        >
          <a href={parsed.url} target="_blank" rel="noopener noreferrer">
            View this post on Instagram
          </a>
        </blockquote>
      )}

      {parsed.platform === "tiktok" && (
        <blockquote
          className="tiktok-embed"
          cite={parsed.url}
          data-video-id={parsed.id ?? undefined}
        >
          <section>
            <a href={parsed.url} target="_blank" rel="noopener noreferrer">
              View this video on TikTok
            </a>
          </section>
        </blockquote>
      )}
    </div>
  );
}
