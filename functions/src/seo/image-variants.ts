/**
 * Phase G — Storage triggers for blog cover image variants.
 *
 * Wireframe around the pure pipeline in image-variants-core.ts:
 *
 *   processBlogCover          onObjectFinalized → generate AVIF/WebP
 *                            variants (480px & 1280px) for new covers
 *   cleanupBlogCoverVariants  onObjectDeleted   → remove derived variants
 *
 * Variant objects are skipped via the name-pattern guard, so the
 * pipeline never recurses. See image-variants-core.ts for details.
 */
import {
  onObjectFinalized,
  onObjectDeleted,
} from "firebase-functions/v2/storage";
import {
  processBlogCoverObject,
  deleteCoverVariants,
} from "./image-variants-core";

export const processBlogCover = onObjectFinalized(
  {
    region: "us-east1",
    timeoutSeconds: 300,
    memory: "512MiB",
    maxInstances: 10,
  },
  async (event) => {
    await processBlogCoverObject(event.bucket, event.data.name || "");
  },
);

export const cleanupBlogCoverVariants = onObjectDeleted(
  {
    region: "us-east1",
    timeoutSeconds: 120,
    memory: "256MiB",
  },
  async (event) => {
    await deleteCoverVariants(event.bucket, event.data.name || "");
    console.log(`🗑  [image-variants] removed variants for ${event.data.name}`);
  },
);
