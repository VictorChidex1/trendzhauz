import * as React from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Link2,
  FolderOpen,
  CheckCircle,
} from "lucide-react";
import {
  listBlogCovers,
  uploadBlogCover,
  validateImageFile,
  type MediaItem,
} from "@/services/media";

type MediaTab = "upload" | "library" | "url";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  uploaderUid: string | null;
  title?: string;
}

/**
 * WordPress-style media picker: Upload | Library (Firebase Storage) | URL.
 */
export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  uploaderUid,
  title = "Media Library",
}: MediaLibraryModalProps) {
  const [tab, setTab] = React.useState<MediaTab>("upload");
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [urlInput, setUrlInput] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadLibrary = React.useCallback(async () => {
    setLoadingLibrary(true);
    setError(null);
    try {
      const media = await listBlogCovers();
      setItems(media);
    } catch (err) {
      console.error(err);
      setError("Could not load media library. Check Storage permissions.");
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setUrlInput("");
    setTab("upload");
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && tab === "library") {
      void loadLibrary();
    }
  }, [isOpen, tab, loadLibrary]);

  const handleUpload = async (file: File) => {
    if (!uploaderUid) {
      setError("You must be signed in to upload images.");
      return;
    }
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const media = await uploadBlogCover(file, uploaderUid);
      onSelect(media.url);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUpload(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError("Enter a valid image URL.");
      return;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setError("Enter a valid absolute URL (https://…).");
      return;
    }
    onSelect(trimmed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/70 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-brand/10 p-2 text-brand">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900">
                {title}
              </h3>
              <p className="text-[11px] font-medium text-zinc-500">
                Upload, pick from Firebase Storage, or paste a URL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-200 bg-white px-4 pt-3">
          {(
            [
              { id: "upload", label: "Upload", icon: Upload },
              { id: "library", label: "Library", icon: ImageIcon },
              { id: "url", label: "URL", icon: Link2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-t-md px-3.5 py-2 text-[11px] font-black uppercase tracking-wider transition-colors ${
                tab === id
                  ? "border border-b-0 border-zinc-200 bg-white text-brand"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {tab === "upload" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
                isDragging
                  ? "border-brand bg-brand/5"
                  : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100/80"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = "";
                }}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-brand">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-xs font-bold">Uploading to Firebase Storage…</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-zinc-900">
                    Drag & drop an image, or{" "}
                    <span className="text-brand">browse</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    JPG, PNG, WEBP, GIF · Max 5MB · Stored in blog-covers/
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "library" && (
            <div>
              {loadingLibrary ? (
                <div className="flex flex-col items-center gap-2 py-16 text-zinc-500">
                  <Loader2 className="h-7 w-7 animate-spin text-brand" />
                  <p className="text-xs font-medium">Loading media library…</p>
                </div>
              ) : items.length === 0 ? (
                <div className="py-16 text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                  <p className="text-xs font-bold text-zinc-600">
                    No images in Storage yet
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Upload a file first — it will appear here for reuse.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab("upload")}
                    className="mt-4 text-[11px] font-black uppercase tracking-wider text-brand hover:underline"
                  >
                    Go to Upload
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {items.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-left transition-all hover:border-brand hover:shadow-md"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                        <span className="truncate text-[10px] font-medium text-zinc-500">
                          {item.name}
                        </span>
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-brand opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "url" && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-brand py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-brand/90"
              >
                Use This URL
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
