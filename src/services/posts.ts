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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import type { Post, CreatePostInput, PostCategory } from "@/types/post";
import type { UserProfile } from "@/types/user";

const POSTS_COLLECTION = "posts";

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
 * Fetch all posts from Firestore ordered by creation date
 */
export async function fetchPosts(): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy("createdAt", "desc")
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
      orderBy("createdAt", "desc")
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

    // Build payload matching exact firestore.rules required & optional fields
    const newPostData: Record<string, any> = {
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
      views: 0,
      createdAt: serverTimestamp(),
    };

    // Add optional review fields if provided
    if (input.artistName) newPostData.artistName = input.artistName.trim();
    if (input.projectTitle) newPostData.projectTitle = input.projectTitle.trim();
    if (input.projectType) newPostData.projectType = input.projectType.trim();
    if (input.rating !== undefined && input.rating !== null) {
      newPostData.rating = Number(input.rating);
    }
    if (input.verdict) newPostData.verdict = input.verdict.trim();

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), newPostData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * Update an existing Post document in Firestore matching firestore.rules update whitelist
 */
export async function updatePost(
  postId: string,
  input: Partial<CreatePostInput>
): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);

    const updateData: Record<string, any> = {};

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

    await updateDoc(postRef, updateData);
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
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}
