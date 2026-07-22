/**
 * TrendzHauz — Search Tokenizer & Text Splitter Utility
 *
 * PURPOSE:
 * Generates sanitized, tokenized search index arrays for Firestore documents.
 * This fuels the "Search Index" array pattern, allowing instant array-contains queries
 * across titles, artist names, project titles, and categories at zero extra infrastructure cost.
 */

// Common English and entertainment stop words to drop from search indexes
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "vs",
  "ft",
  "feat",
]);

/**
 * Normalizes a raw string by converting to lowercase, stripping diacritics/accents,
 * and replacing special characters with spaces.
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
    .replace(/[^\w\s]/g, " ");       // Convert non-alphanumeric chars to spaces
}

/**
 * Tokenizes a multi-field article string into a deduplicated array of search keywords.
 * Used when saving or updating a blog post document in Firestore.
 *
 * @param title - Main post title
 * @param artistName - Optional music artist name (e.g. "Wizkid & Asake")
 * @param projectTitle - Optional music project title (e.g. "Real Vol. 1")
 * @param category - Optional post category (e.g. "Reviews")
 * @returns Array of unique tokenized keywords for the searchIndex field
 */
export function generateSearchIndex(
  title: string,
  artistName?: string,
  projectTitle?: string,
  category?: string
): string[] {
  const combinedText = `${title || ""} ${artistName || ""} ${projectTitle || ""} ${category || ""}`;
  const normalized = normalizeText(combinedText);

  const rawTokens = normalized.split(/\s+/);

  const cleanTokens = rawTokens.filter((token) => {
    // Keep numbers or words longer than 1 character that are not stop words
    if (!token) return false;
    if (STOP_WORDS.has(token)) return false;
    return token.length > 1 || !isNaN(Number(token));
  });

  // Return deduplicated array
  return Array.from(new Set(cleanTokens));
}

/**
 * Sanitizes a raw user input search term for Firestore array-contains queries.
 *
 * @param input - Raw user search input (e.g. "  Burna Boy! ")
 * @returns Cleaned single token (e.g. "burna")
 */
export function sanitizeSearchInput(input: string): string {
  const normalized = normalizeText(input).trim();
  const firstWord = normalized.split(/\s+/)[0];
  return firstWord || "";
}
