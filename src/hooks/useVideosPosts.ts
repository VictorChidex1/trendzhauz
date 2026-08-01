/**
 * Videos category list: thin wrapper over the shared cursor-pagination
 * + SWR cache hook. Server-side pagination (12) with persisted cursors.
 * The playable video URL is extracted from the post content on read.
 */

import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useCursorPaginatedPosts } from "@/hooks/useCursorPaginatedPosts";
import { getMillis, formatDateLabel } from "@/utils/date";
import { findFirstEmbedUrl } from "@/utils/mediaUrl";

const PAGE_SIZE_DEFAULT = 12;

export interface VideoListPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImageUrl: string;
  isEditorPick: boolean;
  authorName?: string;
  views: number;
  createdAtMs: number;
  createdAtLabel: string;
  videoUrl: string | null;
  category: string;
  status: string;
}

function docToVideoPost(docSnap: QueryDocumentSnapshot): VideoListPost {
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
    authorName: data.authorName ? String(data.authorName) : undefined,
    views: typeof data.views === "number" ? data.views : 0,
    createdAtMs: ms,
    createdAtLabel: formatDateLabel(ms),
    videoUrl: findFirstEmbedUrl(String(data.content || "")),
    category: String(data.category || "Videos"),
    status: String(data.status || "published"),
  };
}

export function useVideosPosts(pageSize = PAGE_SIZE_DEFAULT) {
  return useCursorPaginatedPosts<VideoListPost>({
    cachePrefix: "videos",
    pageSize,
    baseFilters: { status: "published", category: "Videos" },
    orderFields: ["createdAt"],
    mapDoc: docToVideoPost,
    errorMessage: "Could not load videos. Check your connection or try again.",
  });
}
