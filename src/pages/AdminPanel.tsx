import * as React from "react";
import {
  Menu,
  RefreshCw,
  Users,
  UserPlus,
  PlusCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@/types/post";
import type { UserProfile, UserRole } from "@/types/user";
import type { AdminTab } from "@/types/admin";
import { fetchPosts, deletePost } from "@/services/posts";
import {
  fetchUsers,
  updateUserRole,
  deleteUserProfile,
} from "@/services/users";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PostEditorModal } from "@/components/admin/PostEditorModal";
import { EditProfileModal } from "@/components/admin/EditProfileModal";
import { LinktreeEditorModal } from "@/components/admin/LinktreeEditorModal";
import { AddTeamMemberModal } from "@/components/admin/AddTeamMemberModal";
import { DeletePostModal } from "@/components/admin/DeletePostModal";
import { SortableLinkRow } from "@/components/admin/SortableLinkRow";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { PostsTab } from "@/components/admin/tabs/PostsTab";
import type { LinktreeItem } from "@/types/linktree";
import { db } from "@/services/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function AdminPanel() {
  const { profile, logout, isAdmin, refreshProfile } = useAuth();

  // Sidebar & Navigation State
  const [activeTab, setActiveTab] = React.useState<AdminTab>("overview");
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

  // Post Editor & Delete Modal State
  const [isEditorModalOpen, setIsEditorModalOpen] = React.useState(false);
  const [postToEdit, setPostToEdit] = React.useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = React.useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = React.useState<string | null>(null);

  // Linktree State
  const [links, setLinks] = React.useState<LinktreeItem[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = React.useState(false);
  const [isLinktreeEditorOpen, setIsLinktreeEditorOpen] = React.useState(false);
  const [linkToEdit, setLinkToEdit] = React.useState<LinktreeItem | null>(null);
  const [deletingLinkId, setDeletingLinkId] = React.useState<string | null>(null);

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

  // Load Linktree Links
  const loadLinks = React.useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingLinks(true);
    try {
      const q = query(collection(db, "linktree"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinktreeItem[];
      setLinks(data);
    } catch (err) {
      console.error("Error loading linktree:", err);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [isAdmin]);

  React.useEffect(() => {
    loadPosts();
    if (isAdmin) {
      loadUsers();
      loadLinks();
    }
  }, [loadPosts, loadUsers, loadLinks, isAdmin]);

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

  // Handle Delete Linktree Item
  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    setDeletingLinkId(linkId);
    try {
      await deleteDoc(doc(db, "linktree", linkId));
      await loadLinks();
    } catch (err) {
      console.error("Failed to delete link:", err);
      alert("Failed to delete link.");
    } finally {
      setDeletingLinkId(null);
    }
  };

  // Handle Toggle Link Active Status
  const handleToggleLink = async (link: LinktreeItem) => {
    try {
      await updateDoc(doc(db, "linktree", link.id), {
        isActive: !link.isActive
      });
      await loadLinks();
    } catch (err) {
      console.error("Failed to toggle link:", err);
      alert("Failed to update link status.");
    }
  };

  // Handle Moving Link Order (Quick Actions)
  const handleMoveLink = async (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === links.length - 1) return;
    if (direction === 'top' && index === 0) return;
    if (direction === 'bottom' && index === links.length - 1) return;

    const newLinks = [...links];
    
    if (direction === 'top') {
      const [moved] = newLinks.splice(index, 1);
      newLinks.unshift(moved);
    } else if (direction === 'bottom') {
      const [moved] = newLinks.splice(index, 1);
      newLinks.push(moved);
    } else {
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    }

    setLinks(newLinks); // Optimistic UI update

    try {
      const updatePromises = newLinks.map((link, i) => 
        updateDoc(doc(db, "linktree", link.id), { order: i })
      );
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("Failed to reorder links:", err);
      alert("Failed to reorder links.");
      await loadLinks();
    }
  };

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      try {
        const updatePromises = newLinks.map((link, i) => 
          updateDoc(doc(db, "linktree", link.id), { order: i })
        );
        await Promise.all(updatePromises);
      } catch (err) {
        console.error("Failed to reorder links via drag:", err);
        alert("Failed to reorder links.");
        await loadLinks();
      }
    }
  };

  // Filtered Posts List based on search, and category
  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
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
  }, [posts, filterCategory, filterStatus, searchQuery]);

  return (
    <div className="min-h-[100svh] bg-slate-50 text-zinc-900 flex flex-col lg:flex-row">
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
            <OverviewTab
              posts={posts}
              isLoadingPosts={isLoadingPosts}
              isAdmin={isAdmin}
              currentUserId={profile?.uid}
              onOpenCreate={handleOpenCreate}
              onOpenEdit={handleOpenEdit}
              onRequestDelete={setPostToDelete}
              onViewAllPosts={() => setActiveTab("posts")}
            />
          )}

          {/* Posts Management Table View */}
          {activeTab === "posts" && (
            <PostsTab
              filteredPosts={filteredPosts}
              isLoadingPosts={isLoadingPosts}
              isAdmin={isAdmin}
              currentUserId={profile?.uid}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              filterCategory={filterCategory}
              onFilterCategoryChange={setFilterCategory}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              deletingPostId={deletingPostId}
              onOpenEdit={handleOpenEdit}
              onRequestDelete={setPostToDelete}
              onResetFilters={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterStatus("all");
              }}
            />
          )}

          {/* Bio Links Management Table View (Super-Admin) */}
          {activeTab === "linktree" && isAdmin && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-brand" />
                    <span>Bio Links Management</span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Manage the public Linktree shown on /links.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setLinkToEdit(null);
                    setIsLinktreeEditorOpen(true);
                  }}
                  className="bg-brand text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-md shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Add Link</span>
                </button>
              </div>

              {isLoadingLinks ? (
                <div className="py-12 text-center text-xs text-zinc-400 font-medium">
                  Loading links...
                </div>
              ) : links.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-xs text-zinc-500 font-medium">
                    No bio links found.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50/50">
                          <th className="py-3 pl-4 pr-2 w-8"></th>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Platform</th>
                          <th className="py-3 px-4">Order</th>
                          <th className="py-3 px-4">Clicks</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                        <SortableContext
                          items={links.map(l => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {links.map((link, index) => (
                            <SortableLinkRow
                              key={link.id}
                              link={link}
                              index={index}
                              totalLinks={links.length}
                              handleToggleLink={handleToggleLink}
                              handleMoveLink={handleMoveLink}
                              setLinkToEdit={setLinkToEdit}
                              setIsLinktreeEditorOpen={setIsLinktreeEditorOpen}
                              handleDeleteLink={handleDeleteLink}
                              deletingLinkId={deletingLinkId}
                            />
                          ))}
                        </SortableContext>
                      </tbody>
                    </table>
                  </DndContext>
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

      <LinktreeEditorModal
        isOpen={isLinktreeEditorOpen}
        onClose={() => setIsLinktreeEditorOpen(false)}
        itemToEdit={linkToEdit}
        onSuccess={loadLinks}
        linksLength={links.length}
      />

      {/* Create / Edit Article Modal */}
      <PostEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        postToEdit={postToEdit}
        authorProfile={profile}
        onSuccess={loadPosts}
      />

      {/* Add Team Member Modal (Super-Admin) */}
      <AddTeamMemberModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={loadUsers}
      />

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
        <DeletePostModal
          post={postToDelete}
          isDeleting={deletingPostId === postToDelete.id}
          onClose={() => setPostToDelete(null)}
          onConfirm={confirmDeletePost}
        />
      )}
    </div>
  );
}
