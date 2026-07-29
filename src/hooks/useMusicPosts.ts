/**
 * Music category list: server-side pagination (12) + SWR localStorage cache.
 * Uses getDocs (not full-category onSnapshot) to minimize Firestore reads.
 */

import * as React from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  startAfter,
  Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import {
  getCachedData,
  isCacheFresh,
  setCachedData,
  TTL,
} from "@/utils/queryCache";

const PAGE_SIZE_DEFAULT = 12;
const CACHE_COUNT = "music_count";
const CACHE_PAGE = (page: number) => `music_p${page}`;

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

function getMillis(val: unknown): number {
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

function formatDateLabel(ms: number): string {
  if (!ms) return "Recent";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function musicListQuery(pageSize: number, cursor?: DocumentSnapshot) {
  const now = Timestamp.now();
  const base = [
    where("status", "==", "published"),
    where("category", "==", "Music"),
    where("createdAt", "<=", now),
    orderBy("createdAt", "desc"),
  ];

  if (cursor) {
    return query(
      collection(db, "posts"),
      ...base,
      startAfter(cursor),
      limit(pageSize)
    );
  }

  return query(collection(db, "posts"), ...base, limit(pageSize));
}

function musicCountQuery() {
  const now = Timestamp.now();
  return query(
    collection(db, "posts"),
    where("status", "==", "published"),
    where("category", "==", "Music"),
    where("createdAt", "<=", now),
    orderBy("createdAt", "desc")
  );
}

export function useMusicPosts(pageSize = PAGE_SIZE_DEFAULT) {
  const cachedPage1 = React.useMemo(() => getCachedData<MusicListPost[]>(CACHE_PAGE(1)), []);
  const cachedCount = React.useMemo(() => getCachedData<number>(CACHE_COUNT), []);

  const [posts, setPosts] = React.useState<MusicListPost[]>(
    cachedPage1 && typeof cachedCount === "number" ? cachedPage1 : []
  );
  const [totalCount, setTotalCount] = React.useState(
    typeof cachedCount === "number" ? cachedCount : 0
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(
    !(cachedPage1 && typeof cachedCount === "number")
  );
  const [error, setError] = React.useState<string | null>(null);

  const cursorForPage = React.useRef<Map<number, DocumentSnapshot>>(new Map());
  const pageMemory = React.useRef<Map<number, MusicListPost[]>>(new Map());

  React.useEffect(() => {
    if (cachedPage1) {
      pageMemory.current.set(1, cachedPage1);
    }
  }, [cachedPage1]);

  React.useEffect(() => {
    if (isCacheFresh(CACHE_COUNT, TTL.LISTS) && typeof cachedCount === "number") {
      return;
    }

    let cancelled = false;
    async function loadCount() {
      try {
        const snap = await getCountFromServer(musicCountQuery());
        if (cancelled) return;
        const count = snap.data().count;
        setTotalCount(count);
        setCachedData(CACHE_COUNT, count);
      } catch (err) {
        console.error("useMusicPosts count failed:", err);
        if (!cancelled) {
          setError("Could not load music catalog count.");
        }
      }
    }

    void loadCount();
    return () => {
      cancelled = true;
    };
  }, [cachedCount]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      if (pageMemory.current.has(currentPage)) {
        setPosts(pageMemory.current.get(currentPage)!);
        setLoading(false);
        setError(null);
        return;
      }

      if (
        currentPage === 1 &&
        isCacheFresh(CACHE_PAGE(1), TTL.LISTS) &&
        cachedPage1
      ) {
        setPosts(cachedPage1);
        pageMemory.current.set(1, cachedPage1);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (currentPage > 1 && !cursorForPage.current.has(currentPage)) {
          let walkPage = 1;
          let walkCursor: DocumentSnapshot | undefined = cursorForPage.current.get(1);

          while (walkPage < currentPage) {
            if (pageMemory.current.has(walkPage) && cursorForPage.current.has(walkPage + 1)) {
              walkCursor = cursorForPage.current.get(walkPage + 1);
              walkPage += 1;
              continue;
            }

            const walkSnap = await getDocs(
              musicListQuery(pageSize, walkPage === 1 ? undefined : walkCursor)
            );
            if (walkSnap.empty) break;

            const pageItems = walkSnap.docs.map(docToMusicPost);
            pageMemory.current.set(walkPage, pageItems);
            if (walkPage === 1) {
              setCachedData(CACHE_PAGE(1), pageItems);
            }

            const last = walkSnap.docs[walkSnap.docs.length - 1];
            cursorForPage.current.set(walkPage + 1, last);
            walkCursor = last;

            if (walkSnap.docs.length < pageSize) break;
            walkPage += 1;
          }
        }

        const cursor =
          currentPage > 1 ? cursorForPage.current.get(currentPage) : undefined;

        if (currentPage > 1 && !cursor) {
          if (!cancelled) {
            setCurrentPage(1);
            setLoading(false);
          }
          return;
        }

        const snap = await getDocs(
          musicListQuery(pageSize, currentPage === 1 ? undefined : cursor)
        );

        if (cancelled) return;

        const items = snap.docs.map(docToMusicPost);
        pageMemory.current.set(currentPage, items);
        setPosts(items);

        if (currentPage === 1) {
          setCachedData(CACHE_PAGE(1), items);
        }

        if (snap.docs.length === pageSize) {
          cursorForPage.current.set(
            currentPage + 1,
            snap.docs[snap.docs.length - 1]
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("useMusicPosts page fetch failed:", err);
        if (!cancelled) {
          setError(
            "Could not load music posts. Check your connection or try again."
          );
          setPosts([]);
          setLoading(false);
        }
      }
    }

    void loadPage();
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageSize, cachedPage1]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = React.useCallback(
    (page: number) => {
      const next = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(next);
    },
    [totalPages]
  );

  return {
    posts,
    loading,
    error,
    currentPage,
    setCurrentPage: goToPage,
    totalPages,
    totalCount,
    pageSize,
  };
}
