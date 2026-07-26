import * as React from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import type { UserProfile } from "@/types/user";
import { X, User, ShieldCheck, Save, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdated: () => void;
  onLogout: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onLogout,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Self-Account Deletion Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [deleteInputText, setDeleteInputText] = React.useState("");
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccess(false);

    const cleanName = displayName.trim();
    if (!cleanName) {
      setErrorMessage("Display name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Firebase Auth currentUser
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: cleanName,
        });
      }

      // 2. Update Firestore users/{uid} document
      const userRef = doc(db, "users", profile.uid);
      await updateDoc(userRef, {
        displayName: cleanName,
        bio: bio.trim(),
      });

      setSaveSuccess(true);
      onProfileUpdated();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (deleteInputText.trim().toUpperCase() !== "DELETE") {
      setDeleteError("Please type 'DELETE' exactly to confirm account removal.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const currentUser = auth.currentUser;
      const uid = profile.uid;

      // 1. Delete Firestore user document
      try {
        await deleteDoc(doc(db, "users", uid));
      } catch (docErr) {
        console.warn("Could not delete user doc (might already be deleted):", docErr);
      }

      // 2. Delete Auth user
      if (currentUser) {
        await currentUser.delete();
      }

      // 3. Trigger sign out and close
      onLogout();
      onClose();
    } catch (err: any) {
      console.error("Error deleting account:", err);
      if (err.code === "auth/requires-recent-login") {
        setDeleteError("Security requirement: Please sign out and sign in again before deleting your account.");
      } else {
        setDeleteError(err.message || "Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      {/* Main Edit Profile Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-brand" />
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
                Edit Admin Profile
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6 overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-semibold">
                Profile updated successfully!
              </div>
            )}

            {/* User Meta Card Header */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand/10 text-brand font-black text-sm rounded-full flex items-center justify-center border border-brand/20">
                  {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">{profile.email}</p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-brand" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {profile.role === "super-admin" ? "SUPER ADMIN" : "WRITER"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">
                Display Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  required
                />
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Bio / Editorial Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">
                Editorial Bio / Title
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Senior Afrobeats Editor & Review Specialist"
                rows={3}
                className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-zinc-300 text-zinc-700 font-bold text-xs uppercase tracking-wider rounded-md hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-brand/90 transition-all shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div className="pt-6 border-t border-red-100 space-y-3">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Danger Zone
                </span>
              </div>
              <div className="p-4 bg-red-50/60 border border-red-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-red-900">Delete Admin Profile</h4>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    Permanently delete your profile record and administrative privileges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Account
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden p-6 space-y-5">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tight text-red-900">
                Confirm Profile Deletion
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                This action is permanent and irreversible. You will lose all access to the TrendzHauz Editorial Control Panel.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-semibold text-center">
                {deleteError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 text-center">
                Type <span className="text-red-600 font-mono font-black">DELETE</span> below to confirm:
              </label>
              <input
                type="text"
                value={deleteInputText}
                onChange={(e) => setDeleteInputText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full text-center py-2.5 px-4 bg-zinc-50 border border-zinc-300 rounded-md text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500 uppercase tracking-widest"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setDeleteInputText("");
                  setDeleteError(null);
                }}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold text-xs uppercase tracking-wider rounded-md hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteInputText.trim().toUpperCase() !== "DELETE"}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-red-700 transition-colors shadow-md disabled:opacity-40"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
