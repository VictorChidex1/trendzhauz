import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  getMetadata,
  type FullMetadata,
} from "firebase/storage";
import { storage } from "@/services/firebase";

const BLOG_COVERS_PREFIX = "blog-covers";
const MAX_BYTES = 5 * 1024 * 1024;

export interface MediaItem {
  path: string;
  name: string;
  url: string;
  contentType?: string;
  size?: number;
  timeCreated?: string;
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "image";
}

/**
 * Validate image file against Storage rules (MIME + 5MB).
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file (JPG, PNG, WEBP, GIF).";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be under 5MB.";
  }
  return null;
}

/**
 * Upload an image to Firebase Storage under blog-covers/.
 * Path is flat (single segment) so existing storage.rules match.
 */
export async function uploadBlogCover(
  file: File,
  uploaderUid: string
): Promise<MediaItem> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const safeName = sanitizeFileName(file.name);
  const objectName = `${uploaderUid}_${Date.now()}_${safeName}`;
  const path = `${BLOG_COVERS_PREFIX}/${objectName}`;
  const storageRef = ref(storage, path);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      uploadedBy: uploaderUid,
      originalName: file.name.slice(0, 200),
    },
  });

  const url = await getDownloadURL(snapshot.ref);

  return {
    path,
    name: objectName,
    url,
    contentType: file.type,
    size: file.size,
    timeCreated: new Date().toISOString(),
  };
}

/**
 * List images already uploaded to blog-covers/ (WordPress-style media library).
 */
export async function listBlogCovers(): Promise<MediaItem[]> {
  const folderRef = ref(storage, BLOG_COVERS_PREFIX);

  try {
    const result = await listAll(folderRef);

    const settled = await Promise.all(
      result.items.map(async (itemRef): Promise<MediaItem | null> => {
        try {
          const [url, meta]: [string, FullMetadata] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef),
          ]);
          return {
            path: itemRef.fullPath,
            name: itemRef.name,
            url,
            contentType: meta.contentType,
            size: meta.size,
            timeCreated: meta.timeCreated,
          };
        } catch {
          return null;
        }
      })
    );

    const items: MediaItem[] = settled.filter(
      (item): item is MediaItem => item !== null
    );

    return items.sort((a, b) => {
      const ta = a.timeCreated ? Date.parse(a.timeCreated) : 0;
      const tb = b.timeCreated ? Date.parse(b.timeCreated) : 0;
      return tb - ta;
    });
  } catch (error) {
    console.error("Failed to list blog covers from Storage:", error);
    throw error;
  }
}
