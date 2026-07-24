export type PostCategory =
  | "reviews"
  | "music"
  | "news"
  | "events"
  | "culture"
  | "lifestyle";

export type PostStatus = "published" | "draft";

export interface ReviewMetadata {
  artistName: string;
  albumOrTrackTitle: string;
  rating: number;
  maxRating: number;
  verdict: string;
  releaseYear?: string;
  genre?: string;
  scoreBreakdown?: {
    production?: number;
    lyricism?: number;
    innovation?: number;
    replayValue?: number;
    originality?: number;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  content: string;
  coverImage?: string;
  coverImageUrl?: string;
  category: PostCategory | string;
  status: PostStatus | string;
  authorUid?: string;
  authorName?: string;
  authorEmail?: string;
  tags?: string[];
  readTime?: string;
  featured?: boolean;
  reviewMeta?: ReviewMetadata;
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
  genre?: string;
  scoreBreakdown?: {
    production?: number;
    lyricism?: number;
    innovation?: number;
    replayValue?: number;
    originality?: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: PostCategory;
  status: PostStatus;
  tags?: string[];
  readTime?: string;
  featured?: boolean;
  reviewMeta?: ReviewMetadata;
}

export interface HeroSlide {
  category: string;
  badge?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  meta?: string;
  ctaText?: string;
  time?: string;
  slug: string;
  link?: string;
}

export interface StoryCard {
  id: string;
  category: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: string;
  slug: string;
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
  genre?: string;
  scoreBreakdown?: {
    production?: number;
    lyricism?: number;
    innovation?: number;
    replayValue?: number;
    originality?: number;
  };
}

export interface TrendingPost {
  number?: string;
  rank?: number;
  category?: string;
  title: string;
  readTime?: string;
  slug: string;
  coverImageUrl?: string;
  createdAt?: string;
}

export interface EditorPick {
  category?: string;
  badge?: string;
  title: string;
  imageUrl?: string;
  coverImageUrl?: string;
  readTime?: string;
  slug: string;
  createdAt?: string;
}
