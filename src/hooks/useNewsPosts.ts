/**
 * News category list: thin wrapper over the shared cursor-pagination
 * + SWR cache hook. Server-side pagination (12) with persisted cursors.
 */

import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useCursorPaginatedPosts } from "@/hooks/useCursorPaginatedPosts";
import { getMillis, formatDateLabel } from "@/utils/date";

const PAGE_SIZE_DEFAULT = 12;

export interface NewsListPost {
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
  category: string;
  status: string;
}

function docToNewsPost(docSnap: QueryDocumentSnapshot): NewsListPost {
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
    category: String(data.category || "News"),
    status: String(data.status || "published"),
  };
}

export function useNewsPosts(pageSize = PAGE_SIZE_DEFAULT) {
  return useCursorPaginatedPosts<NewsListPost>({
    cachePrefix: "news",
    pageSize,
    baseFilters: { status: "published", category: "News" },
    orderFields: ["createdAt"],
    mapDoc: docToNewsPost,
    errorMessage: "Could not load news posts. Check your connection or try again.",
  });
}
