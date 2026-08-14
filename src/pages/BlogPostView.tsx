import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, limit, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { Post } from "@/types/post";
import {
  Calendar,
  User,
  Star,
  ArrowLeft,
  ArrowRight,
  Share2,
  Clock,
  Flame,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";
import { useTrendingPosts, useEditorPicks } from "@/hooks/useBlogData";
import { PageSeo } from "@/components/seo/PageSeo";
import { getArticleSchema, getBreadcrumbSchema } from "@/seo/schemas";
import { ArticleSkeleton } from "@/components/ui/skeletons";
import { getCachedData, setCachedData } from "@/utils/queryCache";

export default function BlogPostView() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const articleCacheKey = `article:${(slug || "").trim().toLowerCase()}`;
  const [post, setPost] = React.useState<Post | null>(() =>
    getCachedData<Post>(articleCacheKey)
  );
  const [relatedPosts, setRelatedPosts] = React.useState<Post[]>([]);
  const [relatedLoading, setRelatedLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(() => post === null);
  const [error, setError] = React.useState<string | null>(null);

  const { posts: trendingPosts } = useTrendingPosts();
  const { picks: editorPicks } = useEditorPicks();

  React.useEffect(() => {
    if (!slug) return;
    const currentSlug = slug.trim().toLowerCase();
    const cacheKey = `article:${currentSlug}`;
    let cancelled = false;

    window.scrollTo({ top: 0, behavior: "smooth" });

    async function loadRelated(loadedPost: Post, postId: string) {
      if (cancelled) return;
      setRelatedLoading(true);
      try {
        let related: Post[] = [];

        // Query 1: same category, newest first
        const sameCatQuery = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          where("category", "==", loadedPost.category || "News"),
          orderBy("createdAt", "desc"),
          limit(3),
        );
        const sameCatSnap = await getDocs(sameCatQuery);
        related = sameCatSnap.docs
          .map((d) => ({ ...(d.data() as Post), id: d.id }))
          .filter((p) => p.id !== postId)
          .slice(0, 3);

        // Query 2: if not enough, fill from any category
        if (related.length < 3) {
          const existingIds = new Set(related.map((r) => r.id));
          existingIds.add(postId);
          const anyCatQuery = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
            limit(6),
          );
          const anyCatSnap = await getDocs(anyCatQuery);
          const others = anyCatSnap.docs
            .map((d) => ({ ...(d.data() as Post), id: d.id }))
            .filter((p) => !existingIds.has(p.id))
            .slice(0, 3 - related.length);
          related = [...related, ...others];
        }

        if (!cancelled) {
          setRelatedPosts(related);
        }
      } catch (relErr) {
        console.error("Error loading related posts:", relErr);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    }

    async function loadPost() {
      setError(null);
      const cachedPost = getCachedData<Post>(cacheKey);
      if (cachedPost) {
        setPost(cachedPost);
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        // Primary: query published post by exact slug match (satisfies Firestore public read rules for unauthenticated visitors)
        let q = query(
          collection(db, "posts"),
          where("slug", "==", currentSlug),
          where("status", "==", "published"),
          limit(1),
        );
        let snap = await getDocs(q);

        // Fallback: If not found, it may be a draft/scheduled post being previewed by a logged-in admin/writer.
        // Query without status filter (allowed by Firestore security rules when user is authenticated as writer/admin).
        if (snap.empty) {
          try {
            const draftQuery = query(
              collection(db, "posts"),
              where("slug", "==", currentSlug),
              limit(1),
            );
            const draftSnap = await getDocs(draftQuery);
            if (!draftSnap.empty) {
              snap = draftSnap;
            }
          } catch {
            // Ignore permission error if an unauthenticated user queries a non-existent slug
          }
        }

        if (!cancelled) {
          if (!snap.empty) {
            const docSnap = snap.docs[0];
            const loadedPost = { ...(docSnap.data() as Post), id: docSnap.id };
            setPost(loadedPost);
            setLoading(false);
            setCachedData(cacheKey, loadedPost);

            // Auto view counting: +1 for every public open of a published post.
            if (loadedPost.status === "published") {
              const postRef = doc(db, "posts", docSnap.id);
              updateDoc(postRef, { views: increment(1) }).catch(() => {
                // Ignore permission errors (e.g. authenticated writers viewing own draft)
              });
            }

            // Fetch related posts with targeted limit(3) queries
            void loadRelated(loadedPost, docSnap.id);
          } else {
            setError("Article not found.");
            setLoading(false);
          }
        }
      } catch (err: unknown) {
        console.error("Error loading article:", err);
        if (!cancelled) {
          setError(
            "Failed to load article. Please check your internet connection.",
          );
          setLoading(false);
        }
      }
    }

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-black uppercase text-foreground mb-2">
          {error ? "Something Went Wrong" : "Story Not Found"}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {error ||
            "The article you are looking for might have been moved or removed."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-brand/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>
      </div>
    );
  }

  // Format the category for breadcrumb display
  const displayCategory = post.category || category || "News";
  const categoryPath = `/${displayCategory.toLowerCase()}`;

  const formattedDate = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  const readTime = Math.max(1, Math.ceil((post.content || "").length / 1500));

  const postPath = `/${displayCategory.toLowerCase()}/${post.slug}`;
  const postImage = post.coverImageUrl || post.coverImage;

  return (
    <article className="flex-1 flex flex-col w-full bg-background transition-colors duration-300">
      <PageSeo
        type="article"
        title={post.title}
        description={post.description}
        path={postPath}
        image={postImage}
        publishedTime={post.createdAt?.toDate?.()?.toISOString()}
        modifiedTime={post.updatedAt?.toDate?.()?.toISOString()}
        authorName={post.authorName}
        section={displayCategory}
        jsonLd={[
          getArticleSchema({
            title: post.title,
            description: post.description || "",
            image: postImage || "",
            path: postPath,
            publishedTime: post.createdAt?.toDate?.()?.toISOString(),
            modifiedTime: post.updatedAt?.toDate?.()?.toISOString(),
            authorName: post.authorName,
            section: displayCategory,
          }),
          getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: displayCategory, url: categoryPath },
            { name: post.title, url: postPath },
          ]),
        ]}
      />
      {/* Secret Draft Preview Banner */}
      {post.status === "draft" && (
        <div className="w-full bg-amber-500 text-black px-4 py-3 flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-black uppercase tracking-wider text-center">
            Secret Draft Preview Mode — This article is not live yet
          </p>
        </div>
      )}

      {/* Hero Header */}
      <div className="w-full bg-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            to={categoryPath}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {displayCategory}
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest bg-brand text-white px-3 py-1 rounded-sm">
              {displayCategory}
            </span>
            {post.isEditorPick && (
              <span className="text-[11px] font-black uppercase tracking-widest bg-amber-500 text-black px-3 py-1 rounded-sm inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Editor's Pick
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase text-white leading-tight">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-base sm:text-lg text-zinc-300 font-medium leading-relaxed">
              {post.description}
            </p>
          )}

          {/* Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400 font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-white font-bold">
                <User className="w-4 h-4 text-brand" />{" "}
                {post.authorName || "Victor Chidex"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {readTime} Min Read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {post.views?.toLocaleString() || 0} Views
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-300 font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area & Sticky Right Editorial Sidebar */}
      <div className="max-w-7xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Primary Article Content & Recommendations */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* Cover Image — Natural Editorial Display */}
            {post.coverImageUrl && (
              <div className="w-full max-h-[750px] flex items-center justify-center rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 shadow-lg">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-auto h-auto max-w-full max-h-[750px] object-contain mx-auto"
                />
              </div>
            )}

            {/* Music Review Scorecard Banner (if Review category) */}
            {post.category === "Reviews" &&
              (post.rating !== undefined || post.verdict) && (
                <div className="bg-zinc-900 text-white rounded-xl p-6 border border-zinc-800 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand">
                        Official Review Verdict
                      </span>
                      <h3 className="text-xl font-black uppercase text-white mt-1">
                        {post.artistName ? `${post.artistName} — ` : ""}
                        {post.projectTitle || post.title}
                      </h3>
                    </div>

                    {post.rating !== undefined && (
                      <div className="flex items-center gap-3 bg-brand/20 border border-brand/40 px-4 py-2 rounded-lg">
                        <span className="text-xs font-bold text-brand uppercase tracking-wider">
                          Score
                        </span>
                        <span className="text-3xl font-black text-brand">
                          {post.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {post.verdict && (
                    <p className="text-sm text-zinc-300 italic border-l-2 border-brand pl-4 py-1">
                      "{post.verdict}"
                    </p>
                  )}
                </div>
              )}

            {/* TipTap Rich Text Article Body (with inline music embed hydration) */}
            <ArticleRenderer content={post.content} />

            {/* Related Stories & Read More CTA Section */}
            {(relatedPosts.length > 0 || relatedLoading) && (
              <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand">
                      Continue Reading
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                      More in {displayCategory}
                    </h3>
                  </div>
                  <Link
                    to={categoryPath}
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand hover:underline"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedLoading && relatedPosts.length === 0
                    ? Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="space-y-3 animate-pulse">
                          <div className="aspect-[16/10] w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                          <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                          <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                        </div>
                      ))
                    : relatedPosts.map((rel) => (
                        <ArticleCard
                          key={rel.id}
                          title={rel.title}
                          category={rel.category}
                          slug={rel.slug}
                          coverImageUrl={rel.coverImageUrl}
                          description={rel.description}
                          createdAt={
                            rel.createdAt?.toDate
                              ? rel.createdAt.toDate().toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Recent"
                          }
                        />
                      ))}
                </div>

                {/* Bottom CTA button for mobile and desktop prominence */}
                <div className="pt-4 flex justify-center">
                  <Link
                    to={categoryPath}
                    className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand text-white font-black text-xs uppercase tracking-widest rounded-md hover:bg-brand/90 transition-all shadow-md hover:shadow-lg"
                  >
                    Explore All {displayCategory} Stories{" "}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Footer Back Button */}
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <Link
                to={categoryPath}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to {displayCategory}
              </Link>
            </div>
          </div>

          {/* Right Column: Sticky Editorial Sidebar (Trending Now & Editor Picks) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 pb-12">
            {/* Trending Now Section */}
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand" /> Trending Now
              </h3>
            </div>

            <div className="flex flex-col gap-6">
              {trendingPosts.slice(0, 5).map((post, idx) => (
                <a
                  key={post.rank}
                  href={`/${(post.category || "news").toLowerCase()}/${post.slug}`}
                  className="group flex gap-4 items-start relative"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 shadow-md">
                    <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
                    <div className="absolute top-0 left-0 bg-brand text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-br-md shadow-sm z-10">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {post.views?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.createdAt}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Editor Picks Section */}
            {editorPicks.length > 0 && (
              <div className="mt-12 space-y-8">
                <div className="border-b border-border pb-4">
                  <h3 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" /> Editor's Picks
                  </h3>
                </div>
                <div className="flex flex-col gap-6">
                  {editorPicks.map((pick, index) => (
                    <a
                      key={index}
                      href={`/${(pick.category || "reviews").toLowerCase()}/${pick.slug}`}
                      className="group flex flex-col gap-3"
                    >
                      <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-zinc-800 shadow-md">
                        <img src={pick.coverImageUrl} alt={pick.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <div className="absolute bottom-2 left-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">
                          {pick.category || "News"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                          {pick.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {pick.createdAt}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
