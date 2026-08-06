import { useState, useEffect } from "react";
import { X, Save, Link as LinkIcon } from "lucide-react";
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { LinktreeItem } from "@/types/linktree";

interface LinktreeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: LinktreeItem | null;
  onSuccess: () => void;
}

export function LinktreeEditorModal({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}: LinktreeEditorModalProps) {
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [iconType, setIconType] = useState("generic");
  const [order, setOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit && isOpen) {
      setTitle(itemToEdit.title);
      setTargetUrl(itemToEdit.targetUrl);
      setIconType(itemToEdit.iconType);
      setOrder(itemToEdit.order);
    } else if (isOpen) {
      setTitle("");
      setTargetUrl("");
      setIconType("generic");
      setOrder(0);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (itemToEdit) {
        // Update existing link
        const linkRef = doc(db, "linktree", itemToEdit.id);
        await updateDoc(linkRef, {
          title: title.trim(),
          targetUrl: targetUrl.trim(),
          iconType,
          order,
        });
      } else {
        // Create new link
        await addDoc(collection(db, "linktree"), {
          title: title.trim(),
          targetUrl: targetUrl.trim(),
          iconType,
          order,
          isActive: true,
          clickCount: 0,
          createdAt: serverTimestamp(),
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving linktree item:", err);
      setError("Failed to save bio link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-zinc-900">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand/10 text-brand rounded-lg">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900">
                {itemToEdit ? "Edit Bio Link" : "Create Bio Link"}
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                Manage how fans interact with your links.
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
              Link Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Listen on Spotify"
              className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
              Target URL
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Platform Icon
              </label>
              <select
                value={iconType}
                onChange={(e) => setIconType(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-brand"
              >
                <option value="generic">Generic Link</option>
                <option value="spotify">Spotify</option>
                <option value="apple">Apple Music</option>
                <option value="audiomack">Audiomack</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter / X</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Display Order
              </label>
              <input
                type="number"
                required
                min={0}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-md shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{itemToEdit ? "Update Link" : "Create Link"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
