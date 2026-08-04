/**
 * Shared server-side cursor pagination + SWR localStorage cache.
 *
 * Replaces the bespoke pagination logic that used to live inside
 * useMusicPosts, and powers the server-side (default) mode of useReviews.
 *
 * How it works
 * ------------
 * - Page items are cached under `tz_cache_{prefix}_p{n}`.
 * - The total count is cached under `tz_cache_{prefix}_count`.
 * - Cursor boundaries (the sort values + document id that START each page)
 *   are persisted under `tz_cache_{prefix}_boundaries`, so jumping to a deep
 *   page costs ONE fetch instead of walking page-by-page from the top.
 * - SWR: any cached page is rendered instantly. A background refetch happens
 *   when the cache is stale, on window focus (throttled to 60s), and when
 *   another tab clears/refreshes the same cache prefix (storage event).
 *   Refetched data only replaces the view when the doc-id list changed,
 *   so identical refetches never cause flicker.
 * - Ordering uses `__name__` (document id) as the final tie-breaker, so
 *   pagination is fully deterministic and no composite index is needed for it.
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
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import {
  getCachedData,
  getCachedMeta,
  isCacheFresh,
  setCachedData,
  TTL,
} from "@/utils/queryCache";
import { getMillis } from "@/utils/date";

type OrderField = "createdAt" | "rating";

interface CursorValue {
  /** Sort values in the same order as orderFields (epoch ms for createdAt, raw number for rating). */
  values: number[];
  /** Document id — the __name__ tie-break value. */
  id: string;
}

export interface UseCursorPaginatedOptions<T> {
  /** Cache key prefix, e.g. "music" or "reviews". */
  cachePrefix: string;
  pageSize: number;
  /** Equality filters, e.g. { status: "published", category: "Music" }. */
  baseFilters: Record<string, unknown>;
  /** Sort fields, all descending: ["createdAt"] or ["rating", "createdAt"]. */
  orderFields: OrderField[];
  /** Maps a Firestore doc snapshot to the rendered item type. */
  mapDoc: (doc: QueryDocumentSnapshot) => T;
  errorMessage: string;
  /** When false the hook stops fetching (used to pause the list while a filtered view is active). */
  enabled?: boolean;
}

const PAGE_CACHE_TTL = TTL.LISTS;

function cursorToStartAfter(cv: CursorValue, orderFields: OrderField[]) {
  const args = orderFields.map((field, i) =>
    field === "createdAt" ? Timestamp.fromMillis(cv.values[i]) : cv.values[i]
  );
  return startAfter(...args, cv.id);
}

function boundaryFromDoc(
  doc: QueryDocumentSnapshot,
  orderFields: OrderField[]
): CursorValue {
  const data = doc.data();
  return {
    values: orderFields.map((field) =>
      field === "createdAt" ? getMillis(data.createdAt) : Number(data.rating ?? 0)
    ),
    id: doc.id,
  };
}

export function useCursorPaginatedPosts<T extends { id: string }>({
  cachePrefix,
  pageSize,
  baseFilters,
  orderFields,
  mapDoc,
  errorMessage,
  enabled = true,
}: UseCursorPaginatedOptions<T>) {
  const filtersKey = JSON.stringify(baseFilters);
  const orderFieldsKey = orderFields.join(",");
  const enabledRef = React.useRef(enabled);
  enabledRef.current = enabled;

  // Keys are stable for the lifetime of the hook instance.
  const cacheKeysRef = React.useRef({
    page: (page: number) => `${cachePrefix}_p${page}`,
    count: `${cachePrefix}_count`,
    boundaries: `${cachePrefix}_boundaries`,
  });
  const cacheKey = cacheKeysRef.current.page;
  const countKey = cacheKeysRef.current.count;
  const boundariesKey = cacheKeysRef.current.boundaries;

  const cachedPage1 = React.useMemo(() => getCachedData<T[]>(cacheKey(1)), [cacheKey]);
  const cachedCount = React.useMemo(() => getCachedData<number>(countKey), [countKey]);

  const [posts, setPosts] = React.useState<T[]>(
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

  const pageMemoryRef = React.useRef<Map<number, T[]>>(new Map());
  const cursorForPageRef = React.useRef<Map<number, CursorValue>>(new Map());
  const pageFetchSeqRef = React.useRef(0);
  const countFetchSeqRef = React.useRef(0);
  const lastFocusRefetchRef = React.useRef(0);
  const currentPageRef = React.useRef(currentPage);
  currentPageRef.current = currentPage;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Hydrate session refs from localStorage (page 1 items + persisted boundaries).
  React.useEffect(() => {
    if (cachedPage1) pageMemoryRef.current.set(1, cachedPage1);
    const boundaries = getCachedData<Record<string, CursorValue>>(boundariesKey);
    if (boundaries) {
      for (const [page, cv] of Object.entries(boundaries)) {
        cursorForPageRef.current.set(Number(page), cv);
      }
    }
  }, [cachedPage1, boundariesKey]);

  const persistBoundaries = React.useCallback(() => {
    const obj: Record<string, CursorValue> = {};
    for (const [page, cv] of cursorForPageRef.current) obj[String(page)] = cv;
    setCachedData(boundariesKey, obj);
  }, [boundariesKey]);

  const listQuery = React.useCallback(
    (size: number, cursor?: CursorValue) => {
      const filters = JSON.parse(filtersKey) as Record<string, unknown>;
      const order = orderFieldsKey.split(",") as OrderField[];
      const constraints: QueryConstraint[] = [
        ...Object.entries(filters).map(([field, value]) =>
          where(field, "==", value)
        ),
        ...order.map((field) => orderBy(field, "desc")),
        orderBy("__name__", "desc"),
      ];
      if (cursor) constraints.push(cursorToStartAfter(cursor, order));
      constraints.push(limit(size));
      return query(collection(db, "posts"), ...constraints);
    },
    [filtersKey, orderFieldsKey]
  );

  const countQuery = React.useCallback(() => {
    const filters = JSON.parse(filtersKey) as Record<string, unknown>;
    const constraints: QueryConstraint[] = [
      ...Object.entries(filters).map(([field, value]) =>
        where(field, "==", value)
      ),
    ];
    return query(collection(db, "posts"), ...constraints);
  }, [filtersKey]);

  const boundaryForCurrentOrder = React.useCallback(
    (doc: QueryDocumentSnapshot) =>
      boundaryFromDoc(doc, orderFieldsKey.split(",") as OrderField[]),
    [orderFieldsKey]
  );

  const walkToPage = React.useCallback(
    async (targetPage: number, seq: number) => {
      let walkPage = 1;
      while (walkPage < targetPage) {
        if (cursorForPageRef.current.has(walkPage + 1)) {
          walkPage += 1;
          continue;
        }
        const cursor = cursorForPageRef.current.get(walkPage);
        const snap = await getDocs(listQuery(pageSize, cursor));
        if (seq !== pageFetchSeqRef.current) return;
        if (snap.empty) return;
        const items = snap.docs.map(mapDoc);
        pageMemoryRef.current.set(walkPage, items);
        if (walkPage === 1) setCachedData(cacheKey(1), items);
        cursorForPageRef.current.set(
          walkPage + 1,
          boundaryForCurrentOrder(snap.docs[snap.docs.length - 1])
        );
        persistBoundaries();
        walkPage += 1;
        if (snap.docs.length < pageSize) return;
      }
    },
    [boundaryForCurrentOrder, cacheKey, listQuery, mapDoc, pageSize, persistBoundaries]
  );

  const loadPage = React.useCallback(
    async (page: number, force = false) => {
      if (!enabledRef.current) return;
      const seq = ++pageFetchSeqRef.current;

      const fromMemory = pageMemoryRef.current.get(page);
      const cacheMeta = getCachedMeta<T[]>(cacheKey(page));
      const fresh = cacheMeta
        ? Date.now() - cacheMeta.timestamp < PAGE_CACHE_TTL
        : false;

      // SWR: serve from memory or localStorage instantly.
      if (fromMemory) {
        setPosts(fromMemory);
        setLoading(false);
        setError(null);
      } else if (cacheMeta) {
        pageMemoryRef.current.set(page, cacheMeta.data);
        setPosts(cacheMeta.data);
        setLoading(false);
        setError(null);
      }

      // Fresh cache is authoritative — nothing else to do.
      if (fresh && !force) return;
      if (!fromMemory && !cacheMeta) setLoading(true);

      try {
        if (page > 1 && !cursorForPageRef.current.has(page)) {
          await walkToPage(page, seq);
          if (seq !== pageFetchSeqRef.current) return;
        }

        const cursor =
          page > 1 ? cursorForPageRef.current.get(page) : undefined;

        if (page > 1 && !cursor) {
          // Walked to the end of the catalog — the page does not exist yet.
          // The clamp effect will land on totalPages once the count settles.
          setLoading(false);
          return;
        }

        const snap = await getDocs(listQuery(pageSize, cursor));
        if (seq !== pageFetchSeqRef.current) return;

        const items = snap.docs.map(mapDoc);
        pageMemoryRef.current.set(page, items);
        setPosts((prev) =>
          prev.length === items.length &&
          prev.every((p, i) => p.id === items[i].id)
            ? prev
            : items
        );
        setCachedData(cacheKey(page), items);

        if (snap.docs.length === pageSize) {
          cursorForPageRef.current.set(
            page + 1,
            boundaryForCurrentOrder(snap.docs[snap.docs.length - 1])
          );
          persistBoundaries();
        }

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error(`${cachePrefix} page fetch failed:`, err);
        if (seq === pageFetchSeqRef.current) {
          setError(errorMessage);
          setLoading(false);
        }
      }
    },
    [boundaryForCurrentOrder, cacheKey, cachePrefix, errorMessage, listQuery, mapDoc, pageSize, persistBoundaries, walkToPage]
  );

  const loadCount = React.useCallback(
    async (force = false) => {
      if (!enabledRef.current) return;
      if (!force && isCacheFresh(countKey, PAGE_CACHE_TTL)) return;
      const seq = ++countFetchSeqRef.current;
      try {
        const snap = await getCountFromServer(countQuery());
        if (seq !== countFetchSeqRef.current) return;
        const count = snap.data().count;
        setTotalCount(count);
        setCachedData(countKey, count);
      } catch (err) {
        console.error(`${cachePrefix} count failed:`, err);
        if (seq === countFetchSeqRef.current) setError(errorMessage);
      }
    },
    [cachePrefix, countKey, countQuery, errorMessage]
  );

  const revalidate = React.useCallback(() => {
    void loadCount(true);
    void loadPage(currentPageRef.current, true);
  }, [loadCount, loadPage]);

  // Reset in-memory pagination state when the ordering changes (sort toggle).
  // Skipped on mount so persisted boundaries survive hydration.
  const prevOrderFieldsKeyRef = React.useRef(orderFieldsKey);
  React.useEffect(() => {
    if (prevOrderFieldsKeyRef.current === orderFieldsKey) return;
    prevOrderFieldsKeyRef.current = orderFieldsKey;
    pageMemoryRef.current.clear();
    cursorForPageRef.current.clear();
    setCurrentPage(1);
  }, [orderFieldsKey]);

  // Load the current page whenever it changes (or the query shape changes).
  React.useEffect(() => {
    if (!enabledRef.current) return;
    void loadPage(currentPage);
  }, [currentPage, loadPage, enabled]);

  // Load the count once per mount, unless a fresh cached count exists.
  React.useEffect(() => {
    if (!enabledRef.current) return;
    void loadCount(true);
  }, [loadCount, enabled]);

  // Clamp to the last page when the count shrinks (e.g. a post was deleted).
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Focus revalidation — throttled to one refetch per 60 seconds.
  React.useEffect(() => {
    if (!enabledRef.current) return;
    const onFocus = () => {
      const now = Date.now();
      if (now - lastFocusRefetchRef.current < 60_000) return;
      lastFocusRefetchRef.current = now;
      revalidate();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [revalidate, enabled]);

  // Cross-tab: another tab cleared/refreshed our prefix keys → revalidate.
  React.useEffect(() => {
    if (!enabledRef.current) return;
    const prefix = `tz_cache_${cachePrefix}_`;
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.key.startsWith(prefix)) return;
      revalidate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [cachePrefix, revalidate, enabled]);

  const goToPage = React.useCallback(
    (page: number | ((prev: number) => number)) => {
      const next =
        typeof page === "function" ? page(currentPageRef.current) : page;
      const clamped = Math.min(Math.max(1, next), totalPages);
      setCurrentPage(clamped);
    },
    [totalPages]
  );

  const resetPage = React.useCallback(() => setCurrentPage(1), []);

  return {
    posts,
    loading,
    error,
    currentPage,
    setCurrentPage: goToPage,
    totalPages,
    totalCount,
    pageSize,
    resetPage,
  };
}
