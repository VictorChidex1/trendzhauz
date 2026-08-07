import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { Post } from "@/types/post";

interface DeletePostModalProps {
  post: Post;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePostModal({ post, isDeleting, onClose, onConfirm }: DeletePostModalProps) {
  return (
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
            Are you sure you want to permanently delete <strong className="text-zinc-900 font-bold">"{post.title}"</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold text-xs uppercase tracking-wider rounded-md hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
          >
            {isDeleting ? (
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
  );
}
