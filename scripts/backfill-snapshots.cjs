/**
 * Phase F one-off backfill — regenerate every published article HTML snapshot
 * so it carries the current canonical domain (trendzhauzmedia.com).
 *
 * Why: snapshots are written at publish time with the SITE_URL that was
 * active then. After the domain migration, existing snapshots still contain
 * the old domain. This script overwrites them using the compiled Functions
 * code, which now reads SITE_URL from functions/src/seo/config.ts.
 *
 * Prerequisites:
 *   1. Run `npm --prefix functions run build` first (compiles the new SITE_URL
 *      into functions/lib/seo/*.js).
 *   2. Provide a credential via Application Default Credentials, e.g.
 *        export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
 *      or run `gcloud auth application-default login`.
 *
 * Run: node scripts/backfill-snapshots.cjs
 */
const admin = require("../functions/node_modules/firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: "trendzhauz-e84af.firebasestorage.app",
});

const db = admin.firestore();
const { writeArticleSnapshot } = require("../functions/lib/seo/article-snapshot.js");
const { SITE_URL } = require("../functions/lib/seo/config.js");

async function main() {
  const snap = await db
    .collection("posts")
    .where("status", "==", "published")
    .get();

  const posts = snap.docs.map((doc) => doc.data());
  let count = 0;
  for (const post of posts) {
    await writeArticleSnapshot(post);
    count++;
  }

  // ── Verification: confirm at least one snapshot now carries the new domain.
  const verifyPost = posts.find((p) => p.slug && p.category);
  if (verifyPost) {
    const category = String(verifyPost.category).toLowerCase();
    const slug = String(verifyPost.slug);
    try {
      const [buf] = await admin.storage()
        .bucket()
        .file(`article-html/${category}/${slug}.html`)
        .download();
      const html = buf.toString("utf-8");
      const ok = html.includes(SITE_URL);
      console.log(
        ok
          ? `✅ Verified sample snapshot ${category}/${slug} carries ${SITE_URL}.`
          : `❌ Sample snapshot ${category}/${slug} does NOT contain ${SITE_URL}. Check bucket name.`,
      );
    } catch (err) {
      console.error(`❌ Could not read back sample snapshot ${category}/${slug}:`, err.message);
    }
  }

  console.log(`✅ Backfill complete: processed ${count} published articles.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  });
