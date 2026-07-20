import type { Timestamp } from "firebase/firestore";

/**
 * Represents a blog post document stored in the Firestore "posts" collection.
 * This interface mirrors the schema enforced by firestore.rules.
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: "Music" | "Videos" | "Reviews" | "News";
  coverImageUrl: string;
  status: "draft" | "published";
  isEditorPick: boolean;
  views: number;
  createdAt: Timestamp;
  authorId: string;
  authorName: string;
  searchIndex: string[];
  artistName?: string;
  projectTitle?: string;
  projectType?: "Album" | "EP" | "Single" | "Mixtape";
  rating?: number;
  verdict?: string;
}

/**
 * Lightweight shape used by the Hero Slider component.
 */
export interface HeroSlide {
  category: string;
  title: string;
  description: string;
  link: string;
  image: string;
  meta: string;
  ctaText: string;
  slug: string;
}

/**
 * Lightweight shape used by the Trending Now sidebar.
 */
export interface TrendingPost {
  rank: number;
  title: string;
  coverImageUrl: string;
  createdAt: string;
  slug: string;
}

/**
 * Lightweight shape used by the Editor Picks sidebar.
 */
export interface EditorPick {
  category: string;
  title: string;
  coverImageUrl: string;
  createdAt: string;
  slug: string;
}

/**
 * Lightweight shape used by the Latest Stories feed.
 */
export interface StoryCard {
  id: string;
  category: string;
  title: string;
  description: string;
  coverImageUrl: string;
  createdAt: string;
  slug: string;
  artistName?: string;
  projectTitle?: string;
  projectType?: "Album" | "EP" | "Single" | "Mixtape";
  rating?: number;
  verdict?: string;
}
