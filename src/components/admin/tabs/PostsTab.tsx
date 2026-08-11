import { Search, Edit2, Trash2, Eye } from "lucide-react";
import type { Post } from "@/types/post";

interface PostsTabProps {
  filteredPosts: Post[];
  isLoadingPosts: boolean;
  hasMorePosts: boolean;
  isLoadingMorePosts: boolean;
  onLoadMore: () => void;
  isAdmin: boolean;
  currentUserId?: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  deletingPostId: string | null;
  onOpenEdit: (post: Post) => void;
  onRequestDelete: (post: Post) => void;
  onResetFilters: () => void;
}

export function PostsTab({
  filteredPosts,
  isLoadingPosts,
  hasMorePosts,
  isLoadingMorePosts,
  onLoadMore,
  isAdmin,
  currentUserId,
  searchQuery,
  onSearchQueryChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  deletingPostId,
  onOpenEdit,
  onRequestDelete,
  onResetFilters,
}: PostsTabProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden space-y-4 p-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 flex items-center space-x-2">
            <span>All Articles</span>
            <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full text-[10px] font-bold">
              {filteredPosts.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Filter, edit, preview, or remove articles.
          </p>
        </div>

        {/* Search Bar & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search title or author..."
              className="bg-zinc-50 border border-zinc-300 rounded-md pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand w-48 sm:w-60"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => onFilterCategoryChange(e.target.value)}
            className="bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-brand"
          >
            <option value="all">All Categories</option>
            <option value="Music">Music</option>
            <option value="Videos">Videos</option>
            <option value="Reviews">Reviews</option>
            <option value="News">News</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-brand"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      {isLoadingPosts ? (
        <div className="py-12 text-center text-xs text-zinc-400 font-medium">
          Loading articles from Firestore...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-xs text-zinc-500 font-medium">
            No articles match your search query or filters.
          </p>
          <button
            onClick={onResetFilters}
            className="text-xs font-black uppercase text-brand hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50/50">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium">
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-zinc-50/70 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3 min-w-[200px]">
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
                        <h4 className="font-bold text-zinc-900 truncate max-w-xs">
                          {post.title}
                        </h4>
                        {(post.rating || post.reviewMeta?.rating) && (
                          <p className="text-[10px] text-amber-600 font-bold">
                            ★ {post.rating || post.reviewMeta?.rating}/10 · {post.artistName || post.reviewMeta?.artistName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="capitalize font-bold text-brand bg-brand/10 px-2 py-0.5 rounded text-[10px]">
                      {post.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-zinc-700 font-medium">
                    {post.authorName || "Editor"}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                        post.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : post.status === "scheduled"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`/${post.category.toLowerCase()}/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded hover:bg-zinc-100"
                        title="Preview Live Post"
                      >
                        <Eye className="h-4 w-4" />
                      </a>

                      <button
                        onClick={() => onOpenEdit(post)}
                        className="p-1.5 text-zinc-600 hover:text-brand rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {(isAdmin || post.authorId === currentUserId) && (
                        <button
                          onClick={() => onRequestDelete(post)}
                          disabled={deletingPostId === post.id}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Button */}
      {hasMorePosts && !isLoadingPosts && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMorePosts}
            className="text-xs font-black uppercase tracking-widest text-brand border border-brand/30 rounded-md px-4 py-2 hover:bg-brand hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoadingMorePosts ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}
    </div>
  );
}
