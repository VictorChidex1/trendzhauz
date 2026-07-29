import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  LogOut,
  ShieldCheck,
  X,
  ExternalLink,
  Edit2,
} from "lucide-react";
import type { UserProfile } from "@/types/user";

interface AdminSidebarProps {
  activeTab: "overview" | "posts" | "reviews" | "team";
  setActiveTab: (tab: "overview" | "posts" | "reviews" | "team") => void;
  onOpenCreateModal: () => void;
  onOpenEditProfile?: () => void;
  profile: UserProfile | null;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onOpenEditProfile,
  profile,
  onLogout,
  isOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const isSuperAdmin = profile?.role === "super-admin";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header Section */}
        <div className="p-5 space-y-6">
          {/* Logo & Mobile Close Button */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <img
                src="/assets/Trendzhauz-logo.png"
                alt="TrendzHauz Media"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-zinc-400 hover:text-zinc-700 p-1 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Create Action Button */}
          <button
            onClick={() => {
              onOpenCreateModal();
              onCloseMobile();
            }}
            className="w-full bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-3 px-4 rounded-md transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Article</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("overview");
                onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-colors ${
                activeTab === "overview"
                  ? "bg-zinc-100 text-brand"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("posts");
                onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-colors ${
                activeTab === "posts"
                  ? "bg-zinc-100 text-brand"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>All Articles</span>
            </button>


            {isSuperAdmin && (
              <button
                onClick={() => {
                  setActiveTab("team");
                  onCloseMobile();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-colors ${
                  activeTab === "team"
                    ? "bg-zinc-100 text-brand"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Team Members</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom User Info & Footer Actions */}
        <div className="p-4 border-t border-zinc-100 space-y-3">
          {/* Public Site Shortcut */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-brand px-2 py-1.5 transition-colors"
          >
            <span>View Live Site</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* User Profile Card */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3 flex items-center justify-between space-x-2 group">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="h-9 w-9 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center text-brand font-black text-xs shrink-0">
                {profile?.displayName
                  ? profile.displayName.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 truncate">
                  {profile?.displayName || "Editor User"}
                </p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-brand" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    {isSuperAdmin ? "SUPER ADMIN" : "WRITER"}
                  </span>
                </div>
              </div>
            </div>

            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="p-1.5 text-zinc-400 hover:text-brand hover:bg-brand/10 rounded transition-colors cursor-pointer shrink-0"
                title="Edit My Profile & Details"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Logout Action Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
