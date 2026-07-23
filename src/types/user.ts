import type { Timestamp } from "firebase/firestore";

/**
 * Supported User Roles in the TrendzHauz CMS
 */
export type UserRole = "super-admin" | "writer";

/**
 * User Profile document structure stored in Firestore under `/users/{uid}`
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: Timestamp;
}

/**
 * Interface returned by the useAuth custom hook
 */
export interface UseAuthResult {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isWriter: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}
