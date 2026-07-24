export type PostCategory = "Music" | "Videos" | "Reviews" | "News";

export type PostStatus = "draft" | "published";

export interface ReviewMetadata {
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
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
  description: string;
  excerpt?: string;
  content: string;
  category: PostCategory | string;
  coverImageUrl: string;
  coverImage?: string;
  searchIndex: string[];
  status: PostStatus | string;
  isEditorPick: boolean;
  authorId: string;
  authorName: string;
  views: number;
  createdAt: any;
  updatedAt?: any;
  // Optional review metadata fields matching firestore.rules
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
  genre?: string;
  reviewMeta?: any;
  scoreBreakdown?: {
    production?: number;
    lyricism?: number;
    innovation?: number;
    replayValue?: number;
    originality?: number;
  };
}

export interface CreatePostInput {
  title: string;
  slug?: string;
  description: string;
  content: string;
  category: PostCategory;
  coverImageUrl: string;
  status: PostStatus;
  isEditorPick?: boolean;
  artistName?: string;
  projectTitle?: string;
  projectType?: string;
  rating?: number;
  verdict?: string;
  /**
   * Optional publication timestamp (Model A schedule / backdate).
   * When omitted on create, serverTimestamp() is used.
   * When set on update, writers (own posts) and super-admins may reschedule.
   */
  createdAt?: Date;
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
