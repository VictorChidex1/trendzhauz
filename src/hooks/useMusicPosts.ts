/**
 * Music category list: thin wrapper over the shared cursor-pagination
 * + SWR cache hook. Server-side pagination (12) with persisted cursors.
 */

import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useCursorPaginatedPosts } from "@/hooks/useCursorPaginatedPosts";
import { getMillis, formatDateLabel } from "@/utils/date";

const PAGE_SIZE_DEFAULT = 12;

export interface MusicListPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImageUrl: string;
  isEditorPick: boolean;
  artistName?: string;
  authorName?: string;
  views: number;
  createdAtMs: number;
  createdAtLabel: string;
  category: string;
  status: string;
}

function docToMusicPost(docSnap: QueryDocumentSnapshot): MusicListPost {
  const data = docSnap.data();
  const ms = getMillis(data.createdAt);
  return {
    id: docSnap.id,
    title: String(data.title || ""),
    slug: String(data.slug || ""),
    description: String(data.description || ""),
    content: String(data.content || ""),
    coverImageUrl:
      String(data.coverImageUrl || data.coverImage || "") ||
      "/assets/placeholder-cover.jpg",
    isEditorPick: Boolean(data.isEditorPick),
    artistName: data.artistName ? String(data.artistName) : undefined,
    authorName: data.authorName ? String(data.authorName) : undefined,
    views: typeof data.views === "number" ? data.views : 0,
    createdAtMs: ms,
    createdAtLabel: formatDateLabel(ms),
    category: String(data.category || "Music"),
    status: String(data.status || "published"),
  };
}

export function useMusicPosts(pageSize = PAGE_SIZE_DEFAULT) {
  return useCursorPaginatedPosts<MusicListPost>({
    cachePrefix: "music",
    pageSize,
    baseFilters: { status: "published", category: "Music" },
    orderFields: ["createdAt"],
    mapDoc: docToMusicPost,
    errorMessage: "Could not load music posts. Check your connection or try again.",
  });
}
