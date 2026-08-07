import * as React from "react";
import { UniversalMusicPlayer } from "@/components/blog/UniversalMusicPlayer";

/**
 * ArticleRenderer — HTML-to-React Parser with Music Embed Hydration
 *
 * Replaces raw `dangerouslySetInnerHTML` rendering with a component that:
 *  1. Splits the TipTap HTML content at `<div data-type="music-embed" ...>` boundaries
 *  2. Renders plain HTML segments as standard prose blocks
 *  3. Replaces music-embed divs with live <UniversalMusicPlayer /> React components
 *
 * This approach avoids heavy third-party HTML parsers by using a lightweight
 * regex-based splitter that specifically targets our custom TipTap node output.
 */

interface ArticleRendererProps {
  /** The raw TipTap HTML content string from Firestore */
  content: string;
  /** Optional additional Tailwind classes for prose styling */
  className?: string;
}

/**
 * Regex to match our custom music-embed nodes in the serialized HTML.
 * Uses a lookahead to match regardless of attribute order — TipTap's
 * mergeAttributes does not guarantee data-type comes before data-src.
 * Also handles self-closing tags (<div ... />) and standard close tags.
 */
const MUSIC_EMBED_REGEX =
  /<div\s+(?=[^>]*data-type="music-embed")[^>]*data-src="([^"]+)"[^>]*(?:\/>|><\/div>)/g;

interface ContentSegment {
  type: "html" | "music-embed";
  value: string;
}

/**
 * Splits the HTML content string into alternating segments of
 * plain HTML and music-embed URLs.
 */
function splitContent(html: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  // Reset regex state (global flag means stateful)
  MUSIC_EMBED_REGEX.lastIndex = 0;

  let match = MUSIC_EMBED_REGEX.exec(html);
  while (match !== null) {
    // Push any HTML content before this match
    if (match.index > lastIndex) {
      const htmlChunk = html.slice(lastIndex, match.index).trim();
      if (htmlChunk) {
        segments.push({ type: "html", value: htmlChunk });
      }
    }

    // Push the music embed URL
    segments.push({ type: "music-embed", value: match[1] });

    lastIndex = match.index + match[0].length;
    match = MUSIC_EMBED_REGEX.exec(html);
  }

  // Push any remaining HTML after the last embed
  if (lastIndex < html.length) {
    const remaining = html.slice(lastIndex).trim();
    if (remaining) {
      segments.push({ type: "html", value: remaining });
    }
  }

  return segments;
}

export function ArticleRenderer({ content, className = "" }: ArticleRendererProps) {
  const segments = React.useMemo(() => splitContent(content || ""), [content]);

  // Fast path: no music embeds found → render plain HTML directly (same as before)
  if (segments.length === 1 && segments[0].type === "html") {
    return (
      <div
        className={`prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4 font-body text-base sm:text-lg ${className}`}
        dangerouslySetInnerHTML={{ __html: segments[0].value }}
      />
    );
  }

  // Render segmented content: alternating HTML blocks and music players
  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "music-embed") {
          return (
            <UniversalMusicPlayer
              key={`embed-${index}`}
              url={segment.value}
            />
          );
        }

        return (
          <div
            key={`html-${index}`}
            className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4 font-body text-base sm:text-lg"
            dangerouslySetInnerHTML={{ __html: segment.value }}
          />
        );
      })}
    </div>
  );
}
