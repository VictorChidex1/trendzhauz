/**
 * Finds the first playable embed URL (Spotify / YouTube / Apple Music)
 * inside a post's rich-text content.
 *
 * Hoisted out of MusicPage so both the Music and Videos category pages
 * share one source of truth for "where is the media link in this article?".
 * Priority order: Spotify → YouTube → Apple Music.
 */

export function findFirstEmbedUrl(content: string): string | null {
  const text = content || "";
  const spotifyMatch = text.match(
    /https:\/\/open\.spotify\.com\/[a-zA-Z0-9/-]+/
  );
  const youtubeMatch = text.match(
    /https:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/
  );
  const appleMatch = text.match(
    /https:\/\/music\.apple\.com\/[a-zA-Z0-9/.-]+/
  );
  return spotifyMatch?.[0] || youtubeMatch?.[0] || appleMatch?.[0] || null;
}
