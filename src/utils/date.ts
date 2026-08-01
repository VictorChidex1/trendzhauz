// ─────────────────────────────────────────────
// Shared date/timestamp helpers.
// Hoisted out of useMusicPosts/useReviews so both
// hooks (and the cursor pagination layer) use one
// source of truth for coercion + formatting.
// ─────────────────────────────────────────────

import type { Timestamp } from "firebase/firestore";

/**
 * Coerce a Firestore value (Timestamp | Date | string | number) into epoch ms.
 * Returns 0 for anything unrecognizable so downstream code never gets NaN.
 */
export function getMillis(val: unknown): number {
  if (!val) return 0;
  if (
    typeof val === "object" &&
    val !== null &&
    "toDate" in val &&
    typeof (val as Timestamp).toDate === "function"
  ) {
    return (val as Timestamp).toDate().getTime();
  }
  if (val instanceof Date) return val.getTime();
  if (typeof val === "string" || typeof val === "number") {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Format an epoch-ms value as "Jan 5, 2026". Falls back to "Recent" for 0.
 */
export function formatDateLabel(ms: number): string {
  if (!ms) return "Recent";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
