import * as React from "react";
import { UniversalMusicPlayer } from "@/components/blog/UniversalMusicPlayer";
import { SocialEmbed } from "@/components/blog/SocialEmbed";

/**
 * ArticleRenderer — HTML-to-React Parser with Embed Hydration
 *
 * Replaces raw `dangerouslySetInnerHTML` rendering with a component that:
 *  1. Splits the TipTap HTML content at `<div data-type="music-embed" ...>` and
 *     `<div data-type="social-embed" ...>` boundaries
 *  2. Renders plain HTML segments as standard prose blocks
 *  3. Replaces music-embed divs with live <UniversalMusicPlayer /> and
 *     social-embed divs with live <SocialEmbed /> React components
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
 * Regex to match our custom music/social embed nodes in the serialized HTML.
 * Uses a lookahead to match regardless of attribute order — TipTap's
 * mergeAttributes does not guarantee data-type comes before data-src.
 * Also handles self-closing tags (<div ... />) and standard close tags.
 * Capture group 1 = data-type, capture group 2 = data-src.
 */
const EMBED_REGEX =
  /<div\s+(?=[^>]*data-type="(music-embed|social-embed)")[^>]*data-src="([^"]+)"[^>]*(?:\/>|><\/div>)/g;

type EmbedType = "music-embed" | "social-embed";

interface ContentSegment {
  type: "html" | EmbedType;
  value: string;
}

/**
 * Splits the HTML content string into alternating segments of
 * plain HTML, music-embed URLs, and social-embed URLs.
 */
function splitContent(html: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  // Reset regex state (global flag means stateful)
  EMBED_REGEX.lastIndex = 0;

  let match = EMBED_REGEX.exec(html);
  while (match !== null) {
    // Push any HTML content before this match
    if (match.index > lastIndex) {
      const htmlChunk = html.slice(lastIndex, match.index).trim();
      if (htmlChunk) {
        segments.push({ type: "html", value: htmlChunk });
      }
    }

    // Push the embed URL, differentiated by the matched data-type
    const embedType: EmbedType =
      match[1] === "social-embed" ? "social-embed" : "music-embed";
    segments.push({ type: embedType, value: match[2] });

    lastIndex = match.index + match[0].length;
    match = EMBED_REGEX.exec(html);
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

  // Fast path: no embeds found → render plain HTML directly (same as before)
  if (segments.length === 1 && segments[0].type === "html") {
    return (
      <div
        className={`prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4 font-body text-base sm:text-lg ${className}`}
        dangerouslySetInnerHTML={{ __html: segments[0].value }}
      />
    );
  }

  // Render segmented content: alternating HTML blocks and embedded players
  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "music-embed") {
          return (
            <UniversalMusicPlayer
              key={`music-${index}`}
              url={segment.value}
            />
          );
        }

        if (segment.type === "social-embed") {
          return <SocialEmbed key={`social-${index}`} url={segment.value} />;
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
