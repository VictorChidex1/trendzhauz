/**
 * Single-document listener over aggregations/homepage.
 * The homepage reads this ONE doc instead of firing multiple unbounded
 * queries on posts — ~1 read per visitor regardless of post count.
 * Falls back to direct queries elsewhere when the doc is missing/stale.
 */

import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";
import {
  getCachedData,
  getCachedMeta,
  setCachedData,
} from "@/utils/queryCache";
import { getMillis } from "@/utils/date";
import type {
  HeroSlide,
  TrendingPost,
  EditorPick,
  StoryCard,
} from "@/types/post";

export interface HomepageAggregation {
  heroSlides?: HeroSlide[];
  trending?: TrendingPost[];
  editorPicks?: EditorPick[];
  latestStories?: StoryCard[];
  paginatedCursor?: unknown;
  postCount?: number;
  lastAggregatedAt?: unknown;
}

const CACHE_KEY = "aggregation";
// 60-min schedule + 15-min grace before we treat the doc as stale.
const MAX_AGE_MS = 75 * 60 * 1000;

export function useHomepageAggregation() {
  const [data, setData] = React.useState<HomepageAggregation | null>(() => {
    return getCachedData<HomepageAggregation>(CACHE_KEY) ?? null;
  });
  const [lastUpdated, setLastUpdated] = React.useState<number>(() => {
    const meta = getCachedMeta<HomepageAggregation>(CACHE_KEY);
    return meta ? meta.timestamp : 0;
  });
  const [loading, setLoading] = React.useState<boolean>(
    () => getCachedData<HomepageAggregation>(CACHE_KEY) === null
  );

  React.useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "aggregations/homepage"),
      (snapshot) => {
        if (snapshot.exists()) {
          const aggregation = snapshot.data() as HomepageAggregation;
          setData(aggregation);
          setLastUpdated(getMillis(aggregation.lastAggregatedAt));
          setCachedData(CACHE_KEY, aggregation);
        } else {
          setData(null);
          setLastUpdated(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Homepage aggregation listener error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const isFresh =
    lastUpdated > 0 && Date.now() - lastUpdated < MAX_AGE_MS;

  return { data, loading, isFresh };
}
