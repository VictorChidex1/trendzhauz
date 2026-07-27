import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { Post } from "@/types/post";
import { Calendar, User, Star, ArrowLeft, ArrowRight, Share2, Clock } from "lucide-react";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";

export default function BlogPostView() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const [post, setPost] = React.useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) return;
    const currentSlug = slug.trim().toLowerCase();
    let cancelled = false;

    window.scrollTo({ top: 0, behavior: "smooth" });

    async function loadPost() {
      setLoading(true);
      setError(null);
      try {
        // Primary: query published post by exact slug match (satisfies Firestore public read rules for unauthenticated visitors)
        let q = query(
          collection(db, "posts"),
          where("slug", "==", currentSlug),
          where("status", "==", "published"),
          limit(1)
        );
        let snap = await getDocs(q);

        // Fallback: If not found, it may be a draft/scheduled post being previewed by a logged-in admin/writer.
        // Query without status filter (allowed by Firestore security rules when user is authenticated as writer/admin).
        if (snap.empty) {
          try {
            const draftQuery = query(
              collection(db, "posts"),
              where("slug", "==", currentSlug),
              limit(1)
            );
            const draftSnap = await getDocs(draftQuery);
            if (!draftSnap.empty) {
              snap = draftSnap;
            }
          } catch (draftErr) {
            // Ignore permission error if an unauthenticated user queries a non-existent slug
          }
        }

        if (!cancelled) {
          if (!snap.empty) {
            const docSnap = snap.docs[0];
            const loadedPost = { ...(docSnap.data() as Post), id: docSnap.id };
            setPost(loadedPost);

            // Fetch related posts in same category
            try {
              const relatedQuery = query(
                collection(db, "posts"),
                where("status", "==", "published"),
                where("category", "==", loadedPost.category || "News"),
                orderBy("createdAt", "desc"),
                limit(5)
              );
              const relatedSnap = await getDocs(relatedQuery);
              let related = relatedSnap.docs
                .map((d) => ({ ...(d.data() as Post), id: d.id }))
                .filter((p) => p.id !== docSnap.id)
                .slice(0, 3);

              // If fewer than 3 in same category, backfill with recent posts from any category
              if (related.length < 3) {
                const fallbackQuery = query(
                  collection(db, "posts"),
                  where("status", "==", "published"),
                  orderBy("createdAt", "desc"),
                  limit(6)
                );
                const fallbackSnap = await getDocs(fallbackQuery);
                const fallbackPosts = fallbackSnap.docs
                  .map((d) => ({ ...(d.data() as Post), id: d.id }))
                  .filter((p) => p.id !== docSnap.id && !related.some((r) => r.id === p.id));

                related = [...related, ...fallbackPosts].slice(0, 3);
              }
              if (!cancelled) {
                setRelatedPosts(related);
              }
            } catch (relErr) {
              console.error("Error loading related posts:", relErr);
            }
          } else {
            setError("Article not found.");
          }
          setLoading(false);
        }
      } catch (err: unknown) {
        console.error("Error loading article:", err);
        if (!cancelled) {
          setError("Failed to load article. Please check your internet connection.");
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
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">
          Loading Story...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-black uppercase text-foreground mb-2">
          Story Not Found
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          The article you are looking for might have been moved or removed.
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
  const categoryPath = `/category/${displayCategory.toLowerCase()}`;

  const formattedDate = post.createdAt?.toDate
    ? post.createdAt.toDate().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  const readTime = Math.max(1, Math.ceil((post.content || "").length / 1500));

  return (
    <article className="flex-1 flex flex-col w-full bg-background transition-colors duration-300">
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
                <User className="w-4 h-4 text-brand" /> {post.authorName || "Victor Chidex"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {readTime} Min Read
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
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

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Music Review Scorecard Banner (if Review category) */}
        {post.category === "Reviews" && (post.rating !== undefined || post.verdict) && (
          <div className="bg-zinc-900 text-white rounded-xl p-6 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand">
                  Official Review Verdict
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-1">
                  {post.artistName ? `${post.artistName} — ` : ""}{post.projectTitle || post.title}
                </h3>
              </div>

              {post.rating !== undefined && (
                <div className="flex items-center gap-3 bg-brand/20 border border-brand/40 px-4 py-2 rounded-lg">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">Score</span>
                  <span className="text-3xl font-black text-brand">{post.rating.toFixed(1)}</span>
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
        {relatedPosts.length > 0 && (
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
              {relatedPosts.map((rel) => (
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
                Explore All {displayCategory} Stories <ArrowRight className="w-4 h-4" />
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
    </article>
  );
}
