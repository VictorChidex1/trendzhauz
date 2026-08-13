/**
 * Phase G one-off backfill — generate AVIF/WebP variants (480px & 1280px)
 * for every existing blog cover so old posts get optimized og:images
 * without waiting for a re-upload.
 *
 * Uses the same compiled pipeline as the onObjectFinalized trigger
 * (functions/src/seo/image-variants-core.ts), so behavior is identical
 * to new uploads. Idempotent: originals already marked as processed are
 * skipped, and variant objects are ignored.
 *
 * Prerequisites:
 *   1. Run `npm --prefix functions run build` first (compiles the module
 *      into functions/lib/seo/image-variants-core.js).
 *   2. Provide a credential via Application Default Credentials, e.g.
 *        export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
 *      or run `gcloud auth application-default login`.
 *
 * Run: node scripts/backfill-image-variants.cjs
 */
const admin = require("../functions/node_modules/firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: "trendzhauz-e84af.firebasestorage.app",
});

const {
  processBlogCoverObject,
  isVariantName,
} = require("../functions/lib/seo/image-variants-core.js");

const BLOG_COVERS_PREFIX = "blog-covers/";

async function main() {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({ prefix: BLOG_COVERS_PREFIX });

  let processed = 0;
  let skippedVariants = 0;
  for (const file of files) {
    const fileName = file.name.slice(BLOG_COVERS_PREFIX.length);
    if (isVariantName(fileName)) {
      skippedVariants++;
      continue;
    }
    try {
      await processBlogCoverObject(bucket.name, file.name);
      processed++;
    } catch (err) {
      console.error(`❌ backfill failed for ${file.name}:`, err);
    }
  }

  console.log(
    `🎉 [backfill-image-variants] done: ${processed} originals processed, ${skippedVariants} variants skipped.`,
  );
}

main().catch((err) => {
  console.error("❌ [backfill-image-variants] fatal error:", err);
  process.exit(1);
});
