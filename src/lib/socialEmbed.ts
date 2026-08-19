/**
 * socialEmbed — Shared Social Media URL Parser & Allowlist
 *
 * Single source of truth used by BOTH the admin editor extension
 * (`SocialEmbedExtension.ts`) and the public renderer (`SocialEmbed.tsx`).
 *
 * Responsibilities:
 *   1. Detect the platform (X/Twitter, Instagram, TikTok) from a raw URL.
 *   2. Extract the post/video id (or flag TikTok short links).
 *   3. Normalize the URL to a canonical https form (query/hash stripped).
 *   4. Enforce a strict host + scheme allowlist so no dangerous URL is ever
 *      rendered as a live link on the public site.
 */

export type SocialPlatform = "x" | "instagram" | "tiktok";

export interface SocialPlatformConfig {
  platform: SocialPlatform;
  /** Human-readable label (editor preview + public badge). */
  label: string;
  /** Brand accent hex used for editor preview borders and labels. */
  color: string;
  /** Official embed script URL (loaded lazily, once, on the public page). */
  scriptUrl: string;
}

export interface ParsedSocialUrl {
  platform: SocialPlatform;
  /** Post/video id. `null` for TikTok short links (cannot embed client-side). */
  id: string | null;
  /** Normalized https URL (query string + hash stripped). */
  url: string;
  /** True when the URL is a TikTok short link (vm./vt.) requiring a fallback. */
  isShortLink: boolean;
}

export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformConfig> = {
  x: {
    platform: "x",
    label: "X (Twitter)",
    color: "#000000",
    scriptUrl: "https://platform.twitter.com/widgets.js",
  },
  instagram: {
    platform: "instagram",
    label: "Instagram",
    color: "#E1306C",
    scriptUrl: "https://www.instagram.com/embed.js",
  },
  tiktok: {
    platform: "tiktok",
    label: "TikTok",
    color: "#FE2C55",
    scriptUrl: "https://www.tiktok.com/embed.js",
  },
};

// ─── Post URL patterns ───────────────────────────────────────────────────────

const X_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([\w]+)\/status\/(\d+)/i;
const INSTAGRAM_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv|reels)\/([\w-]+)/i;
const TIKTOK_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([\w.-]+)\/video\/(\d+)/i;
const TIKTOK_SHORT_PATTERN =
  /^(?:https?:\/\/)?(?:vm|vt)\.tiktok\.com\/([\w-]+)/i;

// ─── Allowlist: the ONLY hosts a clickable embed link may ever point at ───────

const SAFE_HOSTS = new Set<string>([
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
]);

// ─── URL normalization ───────────────────────────────────────────────────────

function normalizeUrl(raw: string): string {
  let value = raw.trim();
  if (!/^https?:\/\//i.test(value)) {
    value = "https://" + value.replace(/^\/+/, "");
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    }
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
}

// ─── Parser ──────────────────────────────────────────────────────────────────

export function parseSocialUrl(input: string): ParsedSocialUrl | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  // TikTok short links are detected first — they carry no video id.
  const shortMatch = raw.match(TIKTOK_SHORT_PATTERN);
  if (shortMatch) {
    return {
      platform: "tiktok",
      id: null,
      url: normalizeUrl(raw),
      isShortLink: true,
    };
  }

  const xMatch = raw.match(X_PATTERN);
  if (xMatch) {
    return {
      platform: "x",
      id: xMatch[2],
      url: normalizeUrl(raw),
      isShortLink: false,
    };
  }

  const instagramMatch = raw.match(INSTAGRAM_PATTERN);
  if (instagramMatch) {
    return {
      platform: "instagram",
      id: instagramMatch[1],
      url: normalizeUrl(raw),
      isShortLink: false,
    };
  }

  const tiktokMatch = raw.match(TIKTOK_PATTERN);
  if (tiktokMatch) {
    return {
      platform: "tiktok",
      id: tiktokMatch[2],
      url: normalizeUrl(raw),
      isShortLink: false,
    };
  }

  return null;
}

/**
 * True ONLY when the URL is an `https:` link to one of the allowlisted hosts.
 * Use this before rendering any clickable anchor on the public site — it
 * rejects `javascript:`, `data:`, and foreign domains outright.
 */
export function isSafeHttpsUrl(input: string): boolean {
  const raw = (input || "").trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && SAFE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}
