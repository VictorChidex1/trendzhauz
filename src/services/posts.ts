import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { clearCachedData, clearAllListCaches } from "@/utils/queryCache";
import type { Post, CreatePostInput, PostCategory } from "@/types/post";
import type { UserProfile } from "@/types/user";

const POSTS_COLLECTION = "posts";

/**
 * Invalidate the SWR localStorage caches for the server-side paginated lists.
 * Called after every successful write so the category pages never serve a
 * stale page 1 / count / cursor boundaries after a CMS edit.
 *
 * When the post's category is known, only that category's list is cleared.
 * When it isn't (delete, or an update that didn't change the category), every
 * list cache is swept generically — so new categories are covered automatically
 * without maintaining a hardcoded category list.
 */
function invalidateListCaches(category?: string): void {
  if (category) {
    const prefix = category.toLowerCase();
    clearCachedData(`${prefix}_p1`);
    clearCachedData(`${prefix}_count`);
    clearCachedData(`${prefix}_boundaries`);
    return;
  }
  clearAllListCaches();
}

/**
 * Utility helper to convert string titles into SEO-friendly URL slugs
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate lightweight search index token array for Firestore queries (max 50 items)
 */
export function generateSearchIndex(title: string): string[] {
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const tokens = new Set<string>();
  words.forEach((word) => {
    tokens.add(word);
    for (let i = 2; i <= word.length; i++) {
      tokens.add(word.substring(0, i));
    }
  });

  return Array.from(tokens).slice(0, 50);
}

/**
 * Fetch posts with optional cursor pagination for the admin panel.
 * Returns one extra doc to detect whether more pages exist.
 */
export async function fetchPosts(options?: {
  limit?: number;
  startAfter?: Timestamp;
}): Promise<{ posts: Post[]; hasMore: boolean }> {
  try {
    const pageSize = options?.limit ?? 100;
    if (options?.startAfter) {
      const q = query(
        collection(db, POSTS_COLLECTION),
        startAfter(options.startAfter),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1),
      );
      const snap = await getDocs(q);
      const allDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
      return { posts: allDocs.slice(0, pageSize), hasMore: allDocs.length > pageSize };
    }
    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(pageSize + 1),
    );
    const snap = await getDocs(q);
    const allDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
    return { posts: allDocs.slice(0, pageSize), hasMore: allDocs.length > pageSize };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

/**
 * Fetch posts filtered by category
 */
export async function fetchPostsByCategory(
  category: PostCategory
): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
      limit(500)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
      } as Post;
    });
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    throw error;
  }
}

/**
 * Create a new Post document in Firestore matching firestore.rules whitelist
 */
export async function createPost(
  input: CreatePostInput,
  author: UserProfile
): Promise<string> {
  try {
    const finalSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
    const searchIndex = generateSearchIndex(input.title);

    const createdAtValue =
      input.createdAt instanceof Date && !isNaN(input.createdAt.getTime())
        ? Timestamp.fromDate(input.createdAt)
        : serverTimestamp();

    // Build payload matching exact firestore.rules required & optional fields
    const newPostData: Record<string, unknown> = {
      title: input.title.trim(),
      slug: finalSlug,
      description: input.description.trim() || input.title.trim(),
      content: input.content,
      category: input.category,
      coverImageUrl: input.coverImageUrl.trim() || "/assets/placeholder-cover.jpg",
      searchIndex: searchIndex,
      status: input.status,
      isEditorPick: input.isEditorPick ?? false,
      authorId: author.uid,
      authorName: author.displayName || "TrendzHauz Editor",
      views: input.views ?? 0,
      createdAt: createdAtValue,
    };

    if (input.artistName) newPostData.artistName = input.artistName.trim();
    if (input.projectTitle) newPostData.projectTitle = input.projectTitle.trim();
    if (input.projectType) newPostData.projectType = input.projectType.trim();
    // Always store a numeric rating (default 0) so server-side
    // orderBy("rating") works for every review.
    newPostData.rating = Number(input.rating ?? 0);
    if (input.verdict) newPostData.verdict = input.verdict.trim();

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), newPostData);
    invalidateListCaches(input.category);
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * Update an existing Post document in Firestore matching firestore.rules update whitelist.
 * createdAt may be updated for reschedule/backdate (super-admin or owning writer).
 */
export async function updatePost(
  postId: string,
  input: Partial<CreatePostInput>
): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) {
      updateData.title = input.title.trim();
      updateData.searchIndex = generateSearchIndex(input.title);
    }
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.description !== undefined) updateData.description = input.description.trim();
    if (input.content !== undefined) updateData.content = input.content;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl.trim();
    if (input.status !== undefined) updateData.status = input.status;
    if (input.isEditorPick !== undefined) updateData.isEditorPick = input.isEditorPick;
    if (input.artistName !== undefined) updateData.artistName = input.artistName.trim();
    if (input.projectTitle !== undefined) updateData.projectTitle = input.projectTitle.trim();
    if (input.projectType !== undefined) updateData.projectType = input.projectType.trim();
    if (input.rating !== undefined && input.rating !== null) {
      updateData.rating = Number(input.rating);
    }
    if (input.verdict !== undefined) updateData.verdict = input.verdict.trim();
    if (input.views !== undefined) updateData.views = Number(input.views);
    if (input.createdAt instanceof Date && !isNaN(input.createdAt.getTime())) {
      updateData.createdAt = Timestamp.fromDate(input.createdAt);
    }

    await updateDoc(postRef, updateData);
    invalidateListCaches(input.category);
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

/**
 * Delete a Post document from Firestore (Super-Admin)
 */
export async function deletePost(postId: string): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postRef);
    invalidateListCaches();
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
