import * as React from "react";

/**
 * UniversalMusicPlayer — Client-Side Dynamic Link Parser & Iframe Renderer
 *
 * Accepts a raw canonical music URL and:
 *  1. Pattern-matches against known streaming platform regexes
 *  2. Extracts the platform, content type, and content ID
 *  3. Transforms the URL into the correct embed/iframe URL
 *  4. Renders a responsive, lazy-loaded <iframe> with platform-specific styling
 *  5. Falls back to a styled external link if the platform is unrecognized
 *
 * Supported: Spotify, YouTube, Audiomack, Apple Music
 */

// ─── Types ───────────────────────────────────────────────────────────────────

interface UniversalMusicPlayerProps {
  /** The raw canonical music URL (e.g., https://open.spotify.com/track/abc123) */
  url: string;
  /** Optional additional Tailwind classes for the outer wrapper */
  className?: string;
}

type PlatformType = "spotify" | "youtube" | "audiomack" | "apple-music" | "unknown";

interface ParsedEmbed {
  platform: PlatformType;
  embedUrl: string;
  /** Human-readable platform name */
  label: string;
  /** Brand hex color for accent styling */
  color: string;
  /** Iframe aspect ratio — 16:9 for video, custom for audio-only */
  aspectRatio: string;
  /** Iframe height override (for fixed-height embeds like Spotify) */
  fixedHeight?: number;
}

// ─── Platform Parsers ────────────────────────────────────────────────────────

function parseSpotify(url: string): ParsedEmbed | null {
  // Matches: https://open.spotify.com/track/ID, /album/ID, /playlist/ID, /episode/ID
  const match = url.match(
    /open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i
  );
  if (!match) return null;

  const [, type, id] = match;
  // Spotify embed height varies by type: tracks are compact, albums/playlists are taller
  // We force 80px (mini player layout) across all Spotify embeds to completely eliminate white space.
  const fixedHeight = 80;

  return {
    platform: "spotify",
    embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    label: "Spotify",
    color: "#1DB954",
    aspectRatio: "auto",
    fixedHeight,
  };
}

function parseYouTube(url: string): ParsedEmbed | null {
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  let videoId: string | null = null;

  const longMatch = url.match(
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/i
  );
  if (longMatch) {
    videoId = longMatch[1];
  }

  if (!videoId) {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }

  if (!videoId) {
    const embedMatch = url.match(
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i
    );
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  if (!videoId) return null;

  return {
    platform: "youtube",
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    label: "YouTube",
    color: "#FF0000",
    aspectRatio: "16 / 9",
  };
}

function parseAudiomack(url: string): ParsedEmbed | null {
  // Matches: audiomack.com/ARTIST/song/SLUG or /album/SLUG or /playlist/SLUG
  const match = url.match(
    /audiomack\.com\/([^/]+)\/(song|album|playlist)\/([^/?#]+)/i
  );
  if (!match) return null;

  const [, artist, type, slug] = match;

  return {
    platform: "audiomack",
    embedUrl: `https://audiomack.com/embed/${type}/${artist}/${slug}`,
    label: "Audiomack",
    color: "#FFA200",
    aspectRatio: "auto",
    fixedHeight: type === "song" ? 252 : 400,
  };
}

function parseAppleMusic(url: string): ParsedEmbed | null {
  // Matches: music.apple.com/REGION/album/NAME/ID
  // Also: music.apple.com/REGION/playlist/NAME/ID
  const match = url.match(
    /music\.apple\.com\/([a-z]{2})\/(album|playlist)\/([^/?#]+)\/([^/?#]+)/i
  );
  if (!match) return null;

  const [, region, type, , id] = match;

  // Apple Music embed supports query param ?i=TRACK_ID for specific tracks within an album
  const trackParam = url.match(/[?&]i=(\d+)/);
  const trackSuffix = trackParam ? `?i=${trackParam[1]}` : "";

  return {
    platform: "apple-music",
    embedUrl: `https://embed.music.apple.com/${region}/${type}/${id}${trackSuffix}`,
    label: "Apple Music",
    color: "#FC3C44",
    aspectRatio: "auto",
    fixedHeight: type === "album" ? 450 : 175,
  };
}

// ─── Master Parser ───────────────────────────────────────────────────────────

function parseMusicUrl(url: string): ParsedEmbed {
  const parsers = [parseSpotify, parseYouTube, parseAudiomack, parseAppleMusic];

  for (const parser of parsers) {
    const result = parser(url);
    if (result) return result;
  }

  // Fallback: unrecognized platform
  return {
    platform: "unknown",
    embedUrl: url,
    label: "Music Link",
    color: "#f97316",
    aspectRatio: "auto",
  };
}

// ─── Platform SVG Icons ──────────────────────────────────────────────────────

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function AudiomackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M0 6v12h3.6V6zm4.8 3v9h3.6V9zm4.8-1.5v10.5H13V7.5zm4.8 3v7.5h3.6V10.5zm4.8-4.5v12H24V6z" />
    </svg>
  );
}

function AppleMusicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0 0 19.7.19a10.413 10.413 0 0 0-1.756-.12C17.033.01 16.12 0 13.803 0h-3.6c-2.322 0-3.235.01-4.143.07a10.413 10.413 0 0 0-1.756.12 5.022 5.022 0 0 0-1.874.69C1.31 1.613.567 2.613.25 3.924A9.23 9.23 0 0 0 .01 6.124C-.05 7.035 0 7.948 0 10.266v3.468c0 2.318-.01 3.231.07 4.142a9.23 9.23 0 0 0 .24 2.19c.317 1.31 1.062 2.31 2.18 3.043a5.022 5.022 0 0 0 1.874.69c.91.11 1.827.12 4.143.13h3.6c2.322 0 3.235-.01 4.143-.07a10.413 10.413 0 0 0 1.756-.12 5.022 5.022 0 0 0 1.874-.69c1.118-.734 1.863-1.734 2.18-3.043a9.23 9.23 0 0 0 .24-2.19c.06-.911.07-1.824.07-4.142v-3.468c-.06-2.318-.01-3.231-.07-4.142zM17.9 16.664a.915.915 0 0 1-.6.322 5.6 5.6 0 0 1-.864.066c-.335 0-.672-.046-1-.14a2.476 2.476 0 0 1-.864-.442 1.852 1.852 0 0 1-.634-.936 1.766 1.766 0 0 1 .066-1.19c.16-.39.442-.716.8-.936.36-.22.77-.362 1.2-.41.37-.05.74-.04 1.1.02V9.704l-5.8 1.25v6.03c0 .458-.04.916-.14 1.364a1.852 1.852 0 0 1-.6.322 5.6 5.6 0 0 1-.864.066c-.335 0-.672-.046-1-.14a2.476 2.476 0 0 1-.864-.442 1.852 1.852 0 0 1-.634-.936 1.766 1.766 0 0 1 .066-1.19c.16-.39.442-.716.8-.936.36-.22.77-.362 1.2-.41.37-.05.74-.04 1.1.02V8.056c0-.18.062-.356.18-.496a.762.762 0 0 1 .46-.262l6.6-1.42a.64.64 0 0 1 .534.1.614.614 0 0 1 .234.494v8.83c-.04.457-.1.915-.2 1.362z" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UniversalMusicPlayer({ url, className = "" }: UniversalMusicPlayerProps) {
  const parsed = React.useMemo(() => parseMusicUrl(url), [url]);

  // ── Fallback: unrecognized platform → styled external link ──────────
  if (parsed.platform === "unknown") {
    return (
      <div className={`my-6 ${className}`}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-brand/50 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🎵</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-widest text-brand mb-0.5">
              Listen Now
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
              {url}
            </div>
          </div>
          <svg
            className="w-4 h-4 text-zinc-400 group-hover:text-brand transition-colors flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    );
  }

  // ── Platform icon selector ──────────────────────────────────────────
  const PlatformIcon = {
    spotify: SpotifyIcon,
    youtube: YouTubeIcon,
    audiomack: AudiomackIcon,
    "apple-music": AppleMusicIcon,
  }[parsed.platform];

  // ── Render: responsive iframe with platform branding ────────────────
  return (
    <div className={`my-6 ${className}`}>
      {/* Platform badge header */}
      <div className="flex items-center gap-2 mb-2.5">
        {PlatformIcon && (
          <PlatformIcon className="w-4 h-4" />
        )}
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
          style={{ color: parsed.color }}
        >
          {parsed.label}
        </span>
      </div>

      {/* Iframe container */}
      <div
        className="w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm"
        style={
          parsed.fixedHeight
            ? { height: parsed.fixedHeight }
            : { aspectRatio: parsed.aspectRatio }
        }
      >
        <iframe
          src={parsed.embedUrl}
          title={`${parsed.label} embed`}
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: "12px", background: "transparent" }}
          loading="lazy"
          allowTransparency={true}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
        />
      </div>
    </div>
  );
}
