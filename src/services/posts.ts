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
    .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing dashes
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
 * Create a new Post document in Firestore
 */
export async function createPost(
  input: CreatePostInput,
  author: UserProfile
): Promise<string> {
  try {
    const finalSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);

    const newPostData = {
      title: input.title.trim(),
      slug: finalSlug,
      excerpt: input.excerpt.trim(),
      content: input.content,
      coverImage: input.coverImage.trim() || "/assets/placeholder-cover.jpg",
      category: input.category,
      status: input.status,
      authorUid: author.uid,
      authorName: author.displayName || "TrendzHauz Editor",
      authorEmail: author.email,
      tags: input.tags || [],
      readTime: input.readTime || "4 min read",
      featured: input.featured ?? false,
      ...(input.category === "reviews" && input.reviewMeta
        ? { reviewMeta: input.reviewMeta }
        : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), newPostData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * Update an existing Post document in Firestore
 */
export async function updatePost(
  postId: string,
  input: Partial<CreatePostInput>
): Promise<void> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);

    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.slug !== undefined) updateData.slug = slugify(input.slug);
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt.trim();
    if (input.content !== undefined) updateData.content = input.content;
    if (input.coverImage !== undefined) updateData.coverImage = input.coverImage.trim();
    if (input.category !== undefined) updateData.category = input.category;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.readTime !== undefined) updateData.readTime = input.readTime;
    if (input.featured !== undefined) updateData.featured = input.featured;
    if (input.reviewMeta !== undefined) updateData.reviewMeta = input.reviewMeta;

    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

/**
 * Delete a Post document from Firestore
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
