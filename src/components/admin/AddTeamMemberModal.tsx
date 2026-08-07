import * as React from "react";
import { X, Loader2, UserPlus } from "lucide-react";
import { createUserProfile } from "@/services/users";
import type { UserRole } from "@/types/user";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTeamMemberModal({ isOpen, onClose, onSuccess }: AddTeamMemberModalProps) {
  // New User Form State
  const [newUid, setNewUid] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newDisplayName, setNewDisplayName] = React.useState("");
  const [newRole, setNewRole] = React.useState<UserRole>("writer");
  const [isSubmittingUser, setIsSubmittingUser] = React.useState(false);
  const [userModalError, setUserModalError] = React.useState<string | null>(null);

  if (!isOpen) return null;

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
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error("Error provisioning user profile:", err);
      setUserModalError(err.message || "Failed to create user profile in Firestore.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  return (
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
            onClick={onClose}
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
              onClick={onClose}
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
  );
}
