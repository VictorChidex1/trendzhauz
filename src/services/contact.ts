import { httpsCallable, type HttpsCallableResult } from "firebase/functions";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  type Timestamp,
} from "firebase/firestore";
import { db, functions } from "@/services/firebase";

export type ContactSubject = "advertising" | "partnership" | "general";
export type ContactSourcePage = "advertise" | "contact";

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  sourcePage: ContactSourcePage;
  /** Honeypot — hidden in the form; bots fill it, humans never do. */
  website?: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  sourcePage: ContactSourcePage;
  isRead: boolean;
  createdAt: Timestamp | null;
}

interface SendContactMessageResponse {
  success: boolean;
}

const CONTACT_MESSAGES_COLLECTION = "contactMessages";

/**
 * Submit a contact/advertising inquiry through the sendContactMessage
 * Cloud Function. The Resend API key never touches the browser — all
 * validation, rate limiting, and email delivery happen server-side.
 */
export async function sendContactMessage(
  input: ContactMessageInput
): Promise<void> {
  const callable = httpsCallable<
    ContactMessageInput,
    SendContactMessageResponse
  >(functions, "sendContactMessage");

  const result: HttpsCallableResult<SendContactMessageResponse> =
    await callable(input);

  if (!result.data?.success) {
    throw new Error("Message could not be sent.");
  }
}

/**
 * Load all contact/advertising inquiries for the Admin Inbox,
 * newest first. Super-admin only (enforced by Firestore rules).
 */
export async function fetchContactMessages(): Promise<ContactMessageRecord[]> {
  try {
    const q = query(
      collection(db, CONTACT_MESSAGES_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((messageDoc) => ({
      id: messageDoc.id,
      ...(messageDoc.data() as Omit<ContactMessageRecord, "id">),
    }));
  } catch (err) {
    console.error("Error loading contact messages:", err);
    throw err;
  }
}

/**
 * Delete an inquiry from the Admin Inbox (spam cleanup).
 * Super-admin only (enforced by Firestore rules).
 */
export async function deleteContactMessage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CONTACT_MESSAGES_COLLECTION, id));
  } catch (err) {
    console.error("Error deleting contact message:", err);
    throw err;
  }
}
