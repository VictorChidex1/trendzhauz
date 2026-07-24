import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import type { UserProfile, UserRole } from "@/types/user";

const USERS_COLLECTION = "users";

/**
 * Fetch all user profiles from Firestore (Super-Admin)
 */
export async function fetchUsers(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        email: data.email || "",
        displayName: data.displayName || "Team Member",
        role: (data.role as UserRole) || "writer",
        createdAt: data.createdAt,
      } as UserProfile;
    });
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
}

/**
 * Create or provision a User Profile document in Firestore
 */
export async function createUserProfile(
  uid: string,
  input: {
    email: string;
    displayName: string;
    role: UserRole;
  }
): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid.trim());
    await setDoc(userRef, {
      email: input.email.trim().toLowerCase(),
      displayName: input.displayName.trim(),
      role: input.role,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * Update a user's role ("super-admin" <-> "writer")
 */
export async function updateUserRole(
  uid: string,
  newRole: UserRole
): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid.trim());
    await updateDoc(userRef, {
      role: newRole,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

/**
 * Delete a user profile document from Firestore
 */
export async function deleteUserProfile(uid: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid.trim());
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user profile:", error);
    throw error;
  }
}
