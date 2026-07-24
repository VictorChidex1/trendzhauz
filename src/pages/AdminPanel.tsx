import * as React from "react";
import {
  Search,
  PlusCircle,
  FileText,
  Star,
  CheckCircle,
  Clock,
  Menu,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/types/post";
import { fetchPosts, deletePost } from "@/services/posts";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PostEditorModal } from "@/components/admin/PostEditorModal";

export default function AdminPanel() {
  const { profile, logout, isAdmin } = useAuth();

  // Sidebar & Navigation State
  const [activeTab, setActiveTab] = React.useState<"overview" | "posts" | "reviews">("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Posts State
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  // Modal State
  const [isEditorModalOpen, setIsEditorModalOpen] = React.useState(false);
  const [postToEdit, setPostToEdit] = React.useState<Post | null>(null);

  // Delete Confirmation State
  const [deletingPostId, setDeletingPostId] = React.useState<string | null>(null);

  // Load Posts from Firestore
  const loadPosts = React.useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (err) {
      console.error("Error loading posts in AdminPanel:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle Edit Post Modal Open
  const handleOpenEdit = (post: Post) => {
    setPostToEdit(post);
    setIsEditorModalOpen(true);
  };

  // Handle Create New Post Modal Open
  const handleOpenCreate = () => {
    setPostToEdit(null);
    setIsEditorModalOpen(true);
  };

  // Handle Delete Post Trigger
  const handleDelete = async (postId: string) => {
    if (!isAdmin) {
      alert("Only Super-Admin users are authorized to delete articles.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this article?")) {
      return;
    }

    setDeletingPostId(postId);
    try {
      await deletePost(postId);
      await loadPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete article. Please try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  // Calculate Statistics
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;
  const reviewPosts = posts.filter((p) => p.category === "reviews").length;

  // Filtered Posts List based on active tab, search, and category
  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (activeTab === "reviews" && post.category !== "reviews") return false;

      // Category dropdown filter
      if (filterCategory !== "all" && post.category !== filterCategory) return false;

      // Status dropdown filter
      if (filterStatus !== "all" && post.status !== filterStatus) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesTitle = post.title?.toLowerCase().includes(queryLower);
        const matchesAuthor = post.authorName?.toLowerCase().includes(queryLower);
        const matchesArtist = post.reviewMeta?.artistName?.toLowerCase().includes(queryLower);
        return matchesTitle || matchesAuthor || matchesArtist;
      }

      return true;
    });
  }, [posts, activeTab, filterCategory, filterStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={handleOpenCreate}
        profile={profile}
        onLogout={logout}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Envelope */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-zinc-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900">
                Editorial Control Panel
              </h1>
              <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                Manage articles, music reviews, and publication status for TrendzHauz.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadPosts}
              className="p-2 text-zinc-500 hover:text-brand transition-colors rounded-md hover:bg-zinc-100"
              title="Refresh articles list"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingPosts ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-2 px-3.5 rounded-md transition-all shadow-xs flex items-center space-x-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Article</span>
            </button>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          {/* Overview Tab Dashboard View */}
          {activeTab === "overview" && (
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
                    onClick={() => setActiveTab("posts")}
                    className="text-xs font-black uppercase tracking-widest text-brand hover:underline"
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
                      onClick={handleOpenCreate}
                      className="bg-brand text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-md"
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
                              src={post.coverImage || "/assets/placeholder-cover.jpg"}
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
                            onClick={() => handleOpenEdit(post)}
                            className="p-1 text-zinc-400 hover:text-zinc-800"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Posts & Reviews Management Table View */}
          {(activeTab === "posts" || activeTab === "reviews") && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden space-y-4 p-6">
              {/* Header & Filter Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                    {activeTab === "reviews" ? "Music Reviews" : "All Articles"}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title or author..."
                      className="bg-zinc-50 border border-zinc-300 rounded-md pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand w-48 sm:w-60"
                    />
                  </div>

                  {activeTab !== "reviews" && (
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-brand"
                    >
                      <option value="all">All Categories</option>
                      <option value="music">Music</option>
                      <option value="reviews">Reviews</option>
                      <option value="news">News</option>
                      <option value="events">Events</option>
                      <option value="culture">Culture</option>
                    </select>
                  )}

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-brand"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
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
                    onClick={() => {
                      setSearchQuery("");
                      setFilterCategory("all");
                      setFilterStatus("all");
                    }}
                    className="text-xs font-black uppercase text-brand hover:underline"
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
                                  src={post.coverImage || "/assets/placeholder-cover.jpg"}
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
                                {post.reviewMeta && (
                                  <p className="text-[10px] text-amber-600 font-bold">
                                    ★ {post.reviewMeta.rating}/5 · {post.reviewMeta.artistName}
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
                                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <a
                                href={`/post/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded hover:bg-zinc-100"
                                title="Preview Live Post"
                              >
                                <Eye className="h-4 w-4" />
                              </a>

                              <button
                                onClick={() => handleOpenEdit(post)}
                                className="p-1.5 text-zinc-600 hover:text-brand rounded hover:bg-zinc-100 transition-colors"
                                title="Edit Article"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  disabled={deletingPostId === post.id}
                                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                  title="Delete Article (Super-Admin)"
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
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Article Modal */}
      <PostEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        postToEdit={postToEdit}
        authorProfile={profile}
        onSuccess={loadPosts}
      />
    </div>
  );
}
