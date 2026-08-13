/**
 * Phase G core — blog cover image variant generation.
 *
 * Pure pipeline logic: naming, URL derivation, sharp conversion, and the
 * download/generate/upload orchestration used by both the Storage trigger
 * (image-variants.ts) and the one-off backfill script. This module must
 * stay free of firebase-functions imports so it can be required from
 * plain Node scripts and from the SEO config module.
 */
import { getStorage } from "firebase-admin/storage";
import sharp from "sharp";

const BLOG_COVERS_PREFIX = "blog-covers";

export const VARIANT_WIDTHS = [480, 1280] as const;
export const VARIANT_FORMATS = ["webp", "avif"] as const;
export type VariantWidth = (typeof VARIANT_WIDTHS)[number];
export type VariantFormat = (typeof VARIANT_FORMATS)[number];

const VARIANT_NAME_RE = /_\d+\.(?:webp|avif)$/i;
const PROCESSED_MARKER = "imageVariants";
const IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function isVariantName(fileName: string): boolean {
  return VARIANT_NAME_RE.test(fileName);
}

export function variantObjectName(
  baseName: string,
  width: VariantWidth,
  format: VariantFormat,
): string {
  return `${baseName}_${width}.${format}`;
}

function stripImageExtension(name: string): string {
  return name.replace(/\.(png|jpe?g|webp|gif|bmp|tif{1,2})$/i, "");
}

/**
 * Tokenless public media URL. blog-covers/ has `allow read: if true` in
 * storage.rules, so alt=media requests without a token are permitted.
 */
export function publicObjectUrl(bucket: string, objectPath: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    objectPath,
  )}?alt=media`;
}

/**
 * Derive the variant URL for a cover image URL. Returns null when the
 * URL is not a blog-covers object or is itself a variant (callers then
 * fall back to the original URL).
 */
export function deriveVariantUrl(
  coverUrl: string,
  width: VariantWidth,
  format: VariantFormat,
): string | null {
  let parsed: URL;
  try {
    parsed = new URL(coverUrl);
  } catch {
    return null;
  }
  if (parsed.hostname !== "firebasestorage.googleapis.com") return null;

  const match = parsed.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
  if (!match) return null;
  const bucket = match[1];

  let objectPath: string;
  try {
    objectPath = decodeURIComponent(match[2]);
  } catch {
    return null;
  }

  if (!objectPath.startsWith(`${BLOG_COVERS_PREFIX}/`)) return null;
  const fileName = objectPath.slice(BLOG_COVERS_PREFIX.length + 1);
  if (isVariantName(fileName)) return null;

  const variantPath = `${BLOG_COVERS_PREFIX}/${variantObjectName(
    stripImageExtension(fileName),
    width,
    format,
  )}`;
  return publicObjectUrl(bucket, variantPath);
}

export interface VariantOutput {
  objectPath: string;
  buffer: Buffer;
  contentType: string;
}

/**
 * Build the four optimized variants for a cover image buffer.
 * Never upscales: an image narrower than the requested width is stored
 * at its natural width under the requested variant name, so the variant
 * always exists.
 */
export async function generateVariants(
  baseName: string,
  input: Buffer,
): Promise<VariantOutput[]> {
  const outputs: VariantOutput[] = [];
  for (const width of VARIANT_WIDTHS) {
    for (const format of VARIANT_FORMATS) {
      const buffer = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .toFormat(
          format,
          format === "avif" ? { quality: 62 } : { quality: 82 },
        )
        .toBuffer();
      outputs.push({
        objectPath: `${BLOG_COVERS_PREFIX}/${variantObjectName(
          baseName,
          width,
          format,
        )}`,
        buffer,
        contentType: `image/${format}`,
      });
    }
  }
  return outputs;
}

/**
 * Download a cover object, generate its four variants, and upload them.
 * Idempotent: skips non-images, GIFs, variant objects, and objects that
 * were already processed (marked via custom metadata). Never throws —
 * errors are logged so Storage events do not retry-storm.
 */
export async function processBlogCoverObject(
  bucket: string,
  objectPath: string,
): Promise<void> {
  if (!objectPath.startsWith(`${BLOG_COVERS_PREFIX}/`)) return;
  const fileName = objectPath.slice(BLOG_COVERS_PREFIX.length + 1);
  if (isVariantName(fileName)) return;

  const bucketRef = getStorage().bucket(bucket);
  const file = bucketRef.file(objectPath);

  try {
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "";
    if (contentType && !contentType.startsWith("image/")) return;
    if (contentType === "image/gif") return;
    if (metadata.metadata && metadata.metadata[PROCESSED_MARKER] === "processed")
      return;

    const [input] = await file.download();
    const variants = await generateVariants(
      stripImageExtension(fileName),
      input,
    );

    for (const variant of variants) {
      await bucketRef.file(variant.objectPath).save(variant.buffer, {
        contentType: variant.contentType,
        metadata: { cacheControl: IMAGE_CACHE_CONTROL },
      });
    }

    await file.setMetadata({
      metadata: { [PROCESSED_MARKER]: "processed" },
    });
    console.log(
      `✅ [image-variants] processed ${objectPath} → ${variants.length} variants`,
    );
  } catch (err) {
    console.error(`❌ [image-variants] failed for ${objectPath}:`, err);
  }
}

/**
 * Remove the four derived variants for a deleted cover object.
 * Best-effort: missing variants are ignored.
 */
export async function deleteCoverVariants(
  bucket: string,
  objectPath: string,
): Promise<void> {
  if (!objectPath.startsWith(`${BLOG_COVERS_PREFIX}/`)) return;
  const fileName = objectPath.slice(BLOG_COVERS_PREFIX.length + 1);
  if (isVariantName(fileName)) return;

  const baseName = stripImageExtension(fileName);
  const bucketRef = getStorage().bucket(bucket);
  for (const width of VARIANT_WIDTHS) {
    for (const format of VARIANT_FORMATS) {
      const variantPath = `${BLOG_COVERS_PREFIX}/${variantObjectName(
        baseName,
        width,
        format,
      )}`;
      try {
        await bucketRef.file(variantPath).delete();
      } catch {
        // variant already gone — ignore
      }
    }
  }
}
