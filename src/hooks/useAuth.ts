import * as React from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
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

          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<UserProfile>;
            // Always force uid from Auth — Firestore user docs often omit the uid field
            // (document ID is the uid). Missing profile.uid broke Storage uploads.
            setProfile({
              uid: firebaseUser.uid,
              email: data.email || firebaseUser.email || "",
              displayName:
                data.displayName ||
                firebaseUser.displayName ||
                "CMS User",
              role: data.role === "super-admin" ? "super-admin" : "writer",
              createdAt: data.createdAt,
            });
          } else {
            // Fallback profile object if user is in Auth but doc is pending
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "CMS User",
              role: "writer",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user role profile from Firestore:", error);
          // Still allow authenticated session for uploads/auth-bound actions
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "CMS User",
            role: "writer",
          });
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

  return {
    user,
    profile,
    loading,
    isAdmin,
    isWriter,
    login,
    logout,
  };
}
