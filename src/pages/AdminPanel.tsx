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
  Users,
  UserPlus,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/types/post";
import type { UserProfile, UserRole } from "@/types/user";
import { fetchPosts, deletePost } from "@/services/posts";
import {
  fetchUsers,
  createUserProfile,
  updateUserRole,
  deleteUserProfile,
} from "@/services/users";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PostEditorModal } from "@/components/admin/PostEditorModal";
import { EditProfileModal } from "@/components/admin/EditProfileModal";

export default function AdminPanel() {
  const { profile, logout, isAdmin, refreshProfile } = useAuth();

  // Sidebar & Navigation State
  const [activeTab, setActiveTab] = React.useState<"overview" | "posts" | "reviews" | "team">("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Edit Profile Modal State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = React.useState(false);

  // Posts State
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  // Users State (Super-Admin)
  const [usersList, setUsersList] = React.useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);

  // New User Form State
  const [newUid, setNewUid] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newDisplayName, setNewDisplayName] = React.useState("");
  const [newRole, setNewRole] = React.useState<UserRole>("writer");
  const [isSubmittingUser, setIsSubmittingUser] = React.useState(false);
  const [userModalError, setUserModalError] = React.useState<string | null>(null);

  // Post Editor & Delete Modal State
  const [isEditorModalOpen, setIsEditorModalOpen] = React.useState(false);
  const [postToEdit, setPostToEdit] = React.useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = React.useState<Post | null>(null);
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

  // Load Users from Firestore (Super-Admin)
  const loadUsers = React.useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingUsers(true);
    try {
      const data = await fetchUsers();
      setUsersList(data);
    } catch (err) {
      console.error("Error loading users in AdminPanel:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isAdmin]);

  React.useEffect(() => {
    loadPosts();
    if (isAdmin) {
      loadUsers();
    }
  }, [loadPosts, loadUsers, isAdmin]);

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
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    const isOwner = postToDelete.authorId === profile?.uid;

    if (!isAdmin && !isOwner) {
      alert("You are only authorized to delete your own articles.");
      return;
    }

    setDeletingPostId(postToDelete.id);
    try {
      await deletePost(postToDelete.id);
      await loadPosts();
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete article. Please try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  // Handle Add User Form Submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError(null);

    if (!newUid.trim()) {
      setUserModalError("Please provide the User UID from Firebase Auth table.");
      return;
    }

    if (!newEmail.trim()) {
      setUserModalError("Please provide a valid email address.");
      return;
    }

    setIsSubmittingUser(true);
    try {
      await createUserProfile(newUid.trim(), {
        email: newEmail.trim(),
        displayName: newDisplayName.trim() || "Team Member",
        role: newRole,
      });

      // Reset form
      setNewUid("");
      setNewEmail("");
      setNewDisplayName("");
      setNewRole("writer");
      setIsAddUserModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error("Error provisioning user profile:", err);
      setUserModalError(err.message || "Failed to create user profile in Firestore.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Handle Role Toggle (Super-Admin)
  const handleRoleToggle = async (uid: string, currentRole: UserRole) => {
    const nextRole: UserRole = currentRole === "super-admin" ? "writer" : "super-admin";
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      await updateUserRole(uid, nextRole);
      await loadUsers();
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Failed to update user role.");
    }
  };

  // Handle Delete User Profile
  const handleDeleteUser = async (uid: string, userEmail: string) => {
    if (uid === profile?.uid) {
      alert("You cannot delete your own active super-admin profile.");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${userEmail} from team profiles?`)) {
      return;
    }

    try {
      await deleteUserProfile(uid);
      await loadUsers();
    } catch (err) {
      console.error("Failed to delete user profile:", err);
      alert("Failed to delete user profile.");
    }
  };

  // Calculate Statistics
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;
  const reviewPosts = posts.filter((p) => p.category === "Reviews").length;

  // Filtered Posts List based on active tab, search, and category
  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      // Tab filter removed for 'reviews'

      // Category dropdown filter
      if (filterCategory !== "all" && post.category !== filterCategory) return false;

      // Status dropdown filter
      if (filterStatus !== "all" && post.status !== filterStatus) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesTitle = post.title?.toLowerCase().includes(queryLower);
        const matchesAuthor = post.authorName?.toLowerCase().includes(queryLower);
        const matchesArtist = (post.artistName || post.reviewMeta?.artistName)?.toLowerCase().includes(queryLower);
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
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
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
                {activeTab === "team" ? "Team & Role Directory" : "Editorial Control Panel"}
              </h1>
              <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                {activeTab === "team"
                  ? "Manage writers, admins, and security permissions."
                  : "Manage articles, music reviews, and publication status for TrendzHauz."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadPosts();
                if (isAdmin) loadUsers();
              }}
              className="p-2 text-zinc-500 hover:text-brand transition-colors rounded-md hover:bg-zinc-100"
              title="Refresh dataset"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingPosts || isLoadingUsers ? "animate-spin" : ""}`} />
            </button>

            {activeTab === "team" && isAdmin ? (
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-2 px-3.5 rounded-md transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Team Member</span>
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-2 px-3.5 rounded-md transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Article</span>
              </button>
            )}
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
                      onClick={handleOpenCreate}
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
                            onClick={() => handleOpenEdit(post)}
                            className="p-1 text-zinc-400 hover:text-brand cursor-pointer transition-colors"
                            title="Edit Article"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {(isAdmin || post.authorId === profile?.uid) && (
                            <button
                              onClick={() => setPostToDelete(post)}
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
          )}

          {/* Posts Management Table View */}
          {activeTab === "posts" && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden space-y-4 p-6">
              {/* Header & Filter Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                    All Articles
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

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
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
                                onClick={() => handleOpenEdit(post)}
                                className="p-1.5 text-zinc-600 hover:text-brand rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                                title="Edit Article"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>

                              {(isAdmin || post.authorId === profile?.uid) && (
                                <button
                                  onClick={() => setPostToDelete(post)}
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
            </div>
          )}

          {/* Team Members Management Table View (Super-Admin) */}
          {activeTab === "team" && isAdmin && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 flex items-center space-x-2">
                    <Users className="h-4 w-4 text-brand" />
                    <span>Team Members & Roles</span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Manage system roles and provision writer permissions for TrendzHauz.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="bg-brand text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-md shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>+ Add Team Member</span>
                </button>
              </div>

              {isLoadingUsers ? (
                <div className="py-12 text-center text-xs text-zinc-400 font-medium">
                  Loading team profiles from Firestore...
                </div>
              ) : usersList.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-xs text-zinc-500 font-medium">
                    No team members found in Firestore.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50/50">
                        <th className="py-3 px-4">Member Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4 text-right">Role Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                      {usersList.map((userItem) => (
                        <tr key={userItem.uid} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-brand/10 text-brand rounded-full font-black text-xs flex items-center justify-center border border-brand/20">
                                {userItem.displayName ? userItem.displayName.charAt(0).toUpperCase() : "U"}
                              </div>
                              <span className="font-bold text-zinc-900">{userItem.displayName}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-zinc-600">{userItem.email}</td>

                          <td className="py-3 px-4">
                            <span
                              className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                                userItem.role === "super-admin"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {userItem.role === "super-admin" ? "SUPER ADMIN" : "WRITER"}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleRoleToggle(userItem.uid, userItem.role)}
                                className="text-[10px] font-bold text-zinc-600 hover:text-brand bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
                              >
                                Switch to {userItem.role === "super-admin" ? "Writer" : "Super Admin"}
                              </button>

                              {userItem.uid !== profile?.uid && (
                                <button
                                  onClick={() => handleDeleteUser(userItem.uid, userItem.email)}
                                  className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Remove Profile"
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

      {/* Add Team Member Modal (Super-Admin) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-zinc-900">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-brand/10 text-brand rounded-lg">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900">
                    Provision Team Member
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Link Firebase Auth UID with a Firestore role profile.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-md hover:bg-zinc-200/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              {userModalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs font-medium">
                  {userModalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                  Firebase User UID *
                </label>
                <input
                  type="text"
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  placeholder="e.g. 8ShWBOYaOAngH1ghC1UxZJ..."
                  required
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:border-brand"
                />
                <p className="text-[10px] text-zinc-400">
                  Copy from Firebase Console &gt; Authentication &gt; User UID
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. DJ Davisy"
                  required
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="trendzhauz@gmail.com"
                  required
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                  Role Permission *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-brand"
                >
                  <option value="writer">Writer (Can Create & Edit Own Posts)</option>
                  <option value="super-admin">Super Admin (Full System Access)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-black uppercase text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="bg-brand text-white font-black text-xs uppercase tracking-widest px-5 py-2 rounded-md shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Team Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        profile={profile}
        onProfileUpdated={() => {
          if (refreshProfile) refreshProfile();
        }}
        onLogout={logout}
      />

      {/* Delete Article Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden p-6 space-y-5">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tight text-red-900">
                Delete Article
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-zinc-900 font-bold">"{postToDelete.title}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold text-xs uppercase tracking-wider rounded-md hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePost}
                disabled={deletingPostId === postToDelete.id}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
              >
                {deletingPostId === postToDelete.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete Article
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
