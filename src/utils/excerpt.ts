/**
 * Deterministic auto-excerpt generation for TrendzHauz posts.
 * Produces rules-safe descriptions (10–1000 chars) without an LLM.
 */

const MIN_LEN = 10;
const MAX_LEN = 160;
const HARD_MAX = 1000;

/**
 * Strip HTML tags and collapse whitespace from TipTap / rich content.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncate at a word boundary near maxLen, appending ellipsis when clipped.
 */
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const clipped = (lastSpace > maxLen * 0.6 ? slice.slice(0, lastSpace) : slice).trim();
  return clipped.endsWith(".") ? clipped : `${clipped}…`;
}

/**
 * Ensure the string meets Firestore description min length without inventing content.
 */
function ensureMinLength(text: string, fallback: string): string {
  let result = text.trim();
  if (result.length >= MIN_LEN) {
    return result.slice(0, HARD_MAX);
  }

  const base = fallback.trim() || "TrendzHauz editorial story";
  if (base.length >= MIN_LEN) {
    return base.slice(0, HARD_MAX);
  }

  // Pad short titles so rules (min 10) never reject the write
  const padded = `${base} — full story on TrendzHauz`;
  return padded.slice(0, HARD_MAX);
}

export interface GenerateExcerptOptions {
  title: string;
  contentHtml: string;
  artistName?: string;
  projectTitle?: string;
  rating?: number;
  category?: string;
}

/**
 * Build a short description from body (preferred) or title / review metadata.
 */
export function generateExcerpt(options: GenerateExcerptOptions): string {
  const { title, contentHtml, artistName, projectTitle, rating, category } = options;
  const plain = stripHtml(contentHtml);

  let bodyExcerpt = "";
  if (plain.length >= 40) {
    bodyExcerpt = truncateAtWord(plain, MAX_LEN);
  }

  if (
    (category === "Reviews" || category === "Music") &&
    artistName?.trim() &&
    !bodyExcerpt
  ) {
    const ratingPart =
      rating !== undefined && rating !== null && !Number.isNaN(Number(rating))
        ? ` (${Number(rating).toFixed(1)}/10)`
        : "";
    const project = projectTitle?.trim() || title.trim();
    const head = `${artistName.trim()} — ${project}${ratingPart}.`;
    bodyExcerpt = plain.length > 0
      ? truncateAtWord(`${head} ${plain}`, MAX_LEN)
      : head;
  }

  if (!bodyExcerpt) {
    bodyExcerpt = title.trim();
  }

  return ensureMinLength(bodyExcerpt, title);
}
