import { FileText, Star, CheckCircle, Clock, Edit2, Trash2 } from "lucide-react";
import type { Post } from "@/types/post";

interface OverviewTabProps {
  posts: Post[];
  isLoadingPosts: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onOpenCreate: () => void;
  onOpenEdit: (post: Post) => void;
  onRequestDelete: (post: Post) => void;
  onViewAllPosts: () => void;
}

export function OverviewTab({
  posts,
  isLoadingPosts,
  isAdmin,
  currentUserId,
  onOpenCreate,
  onOpenEdit,
  onRequestDelete,
  onViewAllPosts,
}: OverviewTabProps) {
  // Calculate Statistics
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;
  const reviewPosts = posts.filter((p) => p.category === "Reviews").length;

  return (
    <div className="space-y-8">
      {/* Stat Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-black uppercase tracking-widest">
              Total Articles
            </span>
            <FileText className="h-4 w-4 text-brand" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">
            {totalPosts}
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-black uppercase tracking-widest">
              Published Live
            </span>
            <CheckCircle className="h-4 w-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">
            {publishedPosts}
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-black uppercase tracking-widest">
              Music Reviews
            </span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">
            {reviewPosts}
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-black uppercase tracking-widest">
              Drafts Pending
            </span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-900">
            {draftPosts}
          </p>
        </div>
      </div>

      {/* Recent Articles Summary Section */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">
              Recent Activity
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Latest stories created or edited by the team.
            </p>
          </div>

          <button
            onClick={onViewAllPosts}
            className="text-xs font-black uppercase tracking-widest text-brand hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {isLoadingPosts ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-medium">
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-zinc-500 font-medium">
              No articles created yet. Get started by creating your first story!
            </p>
            <button
              onClick={onOpenCreate}
              className="bg-brand text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-md cursor-pointer"
            >
              + Create First Article
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {posts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="py-3 flex items-center justify-between hover:bg-zinc-50/50 px-2 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-4">
                  <div className="h-10 w-12 rounded bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                    <img
                      src={post.coverImageUrl || post.coverImage || "/assets/placeholder-cover.jpg"}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/placeholder-cover.jpg";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-zinc-900 truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-500 mt-0.5">
                      <span className="capitalize font-semibold text-brand">
                        {post.category}
                      </span>
                      <span>·</span>
                      <span>By {post.authorName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      post.status === "published"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                    }`}
                  >
                    {post.status}
                  </span>

                  <button
                    onClick={() => onOpenEdit(post)}
                    className="p-1 text-zinc-400 hover:text-brand cursor-pointer transition-colors"
                    title="Edit Article"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  {(isAdmin || post.authorId === currentUserId) && (
                    <button
                      onClick={() => onRequestDelete(post)}
                      className="p-1 text-zinc-400 hover:text-red-600 cursor-pointer transition-colors"
                      title="Delete Article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
