/**
 * Phase F — on-publish article HTML snapshots.
 *
 * On publish/edit, writeArticleSnapshot() builds a crawler-ready HTML
 * file (metadata + first ~300 words + Article/Review JSON-LD) and stores
 * it in Cloud Storage under article-html/{category}/{slug}.html.
 *
 * seoGateway reads the snapshot first for bot article requests, falling
 * back to the Firestore builder only when the snapshot is missing. This
 * removes one Firestore read + HTML-build CPU from every bot article hit.
 *
 * Snapshots are served only through the gateway (Admin SDK bypasses
 * Storage rules), so no public read rule is needed for article-html/.
 */
import { getStorage } from "firebase-admin/storage";
import { buildArticleSnapshotHtml, type ArticleSnapshotPost } from "./config";

const SITE_URL = "https://trendzhauz.com";
const PREFIX = "article-html";

function snapshotPath(category: string, slug: string): string {
  return `${PREFIX}/${category.toLowerCase()}/${slug}.html`;
}

function toSnapshotPost(
  data: FirebaseFirestore.DocumentData,
): ArticleSnapshotPost {
  return {
    title: String(data.title || ""),
    description: String(data.description || ""),
    slug: String(data.slug || ""),
    category: String(data.category || "news"),
    coverImageUrl: data.coverImageUrl ? String(data.coverImageUrl) : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    authorName: data.authorName ? String(data.authorName) : undefined,
    content: data.content ? String(data.content) : undefined,
    rating: typeof data.rating === "number" ? data.rating : undefined,
    verdict: data.verdict ? String(data.verdict) : undefined,
    artistName: data.artistName ? String(data.artistName) : undefined,
    projectTitle: data.projectTitle ? String(data.projectTitle) : undefined,
    projectType: data.projectType ? String(data.projectType) : undefined,
  };
}

export async function writeArticleSnapshot(
  post: FirebaseFirestore.DocumentData,
): Promise<void> {
  const slug = String(post.slug || "");
  const category = String(post.category || "news");
  if (!slug) return;

  const html = buildArticleSnapshotHtml(toSnapshotPost(post), SITE_URL);

  try {
    await getStorage()
      .bucket()
      .file(snapshotPath(category, slug))
      .save(html, {
        contentType: "text/html; charset=utf-8",
        metadata: { cacheControl: "public, max-age=60, s-maxage=3600" },
      });
    console.log(`✅ [article-snapshot] wrote ${snapshotPath(category, slug)}`);
  } catch (err) {
    console.error("❌ [article-snapshot] failed to write snapshot:", err);
  }
}

export async function deleteArticleSnapshot(
  category: string,
  slug: string,
): Promise<void> {
  if (!category || !slug) return;

  try {
    const file = getStorage().bucket().file(snapshotPath(category, slug));
    const [exists] = await file.exists();
    if (!exists) return;
    await file.delete();
    console.log(`🗑  [article-snapshot] deleted ${snapshotPath(category, slug)}`);
  } catch (err) {
    console.error("❌ [article-snapshot] failed to delete snapshot:", err);
  }
}

export async function getArticleSnapshot(
  category: string,
  slug: string,
): Promise<string | null> {
  if (!category || !slug) return null;

  try {
    const [buf] = await getStorage()
      .bucket()
      .file(snapshotPath(category, slug))
      .download();
    return buf.toString("utf-8");
  } catch {
    return null;
  }
}
