import * as React from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import type { UserProfile, UseAuthResult } from "../types/user";

export function useAuth(): UseAuthResult {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists()) {
            // Missing /users/{uid} → fail closed: no privileged role.
            setProfile(null);
          } else {
            const data = docSnap.data() as Partial<UserProfile>;
            const role =
              data.role === "super-admin" || data.role === "writer"
                ? data.role
                : null;

            if (role) {
              // Always force uid from Auth — Firestore user docs often omit the uid field
              // (document ID is the uid). Missing profile.uid broke Storage uploads.
              setProfile({
                uid: firebaseUser.uid,
                email: data.email || firebaseUser.email || "",
                displayName:
                  data.displayName ||
                  firebaseUser.displayName ||
                  "CMS User",
                role,
                createdAt: data.createdAt,
              });
            } else {
              // Unknown/invalid role → fail closed: no privileged role.
              setProfile(null);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user role profile from Firestore:", error);
          // Fail closed: never grant a role when the profile cannot be read.
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === "super-admin";
  const isWriter = profile?.role === "super-admin" || profile?.role === "writer";

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        setProfile(null);
        return;
      }
      const data = docSnap.data() as Partial<UserProfile>;
      const role =
        data.role === "super-admin" || data.role === "writer"
          ? data.role
          : null;
      setProfile(
        role
          ? {
              uid: auth.currentUser.uid,
              email: data.email || auth.currentUser.email || "",
              displayName:
                data.displayName || auth.currentUser.displayName || "CMS User",
              role,
              createdAt: data.createdAt,
            }
          : null
      );
    } catch (err) {
      console.error("Error refreshing profile:", err);
      setProfile(null);
    }
  };

  return {
    user,
    profile,
    loading,
    isAdmin,
    isWriter,
    login,
    logout,
    refreshProfile,
  };
}
