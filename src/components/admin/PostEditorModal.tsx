import * as React from "react";
import {
  X,
  Loader2,
  FileEdit,
  PlusCircle,
  Image as ImageIcon,
  Star,
  Upload,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
} from "lucide-react";
import type {
  Post,
  CreatePostInput,
  PostCategory,
  PostStatus,
} from "@/types/post";
import type { UserProfile } from "@/types/user";
import { createPost, updatePost, slugify } from "@/services/posts";
import { TipTapEditor } from "@/components/admin/TipTapEditor";

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit?: Post | null;
  authorProfile: UserProfile | null;
  onSuccess: () => void;
}

export function PostEditorModal({
  isOpen,
  onClose,
  postToEdit,
  authorProfile,
  onSuccess,
}: PostEditorModalProps) {
  const isEditing = Boolean(postToEdit);

  // Form State
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [category, setCategory] = React.useState<PostCategory>("Music");
  const [status, setStatus] = React.useState<PostStatus>("published");
  const [isEditorPick, setIsEditorPick] = React.useState(false);

  // Image Upload Mode State ("url" vs "upload")
  const [imageMode, setImageMode] = React.useState<"url" | "upload">("url");
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Schedule & Backdate Date State
  const [publishTiming, setPublishTiming] = React.useState<"now" | "custom">("now");
  const [customPublishDate, setCustomPublishDate] = React.useState("");

  // Review & Track Specific Metadata State
  const [artistName, setArtistName] = React.useState("");
  const [projectTitle, setProjectTitle] = React.useState("");
  const [projectType, setProjectType] = React.useState("Album");
  const [rating, setRating] = React.useState<number>(8.5);
  const [verdict, setVerdict] = React.useState("Essential Listen");

  // UI Status State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Populate form when editing an existing post or reset when creating new
  React.useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || "");
      setSlug(postToEdit.slug || "");
      setDescription(postToEdit.description || postToEdit.excerpt || "");
      setContent(postToEdit.content || "");
      setCoverImageUrl(postToEdit.coverImageUrl || postToEdit.coverImage || "");
      setCategory((postToEdit.category as PostCategory) || "Music");
      setStatus((postToEdit.status as PostStatus) || "published");
      setIsEditorPick(postToEdit.isEditorPick ?? false);

      // Populate review metadata
      setArtistName(postToEdit.artistName || postToEdit.reviewMeta?.artistName || "");
      setProjectTitle(postToEdit.projectTitle || postToEdit.reviewMeta?.albumOrTrackTitle || "");
      setProjectType(postToEdit.projectType || "Album");
      setRating(postToEdit.rating ?? postToEdit.reviewMeta?.rating ?? 8.5);
      setVerdict(postToEdit.verdict || postToEdit.reviewMeta?.verdict || "Essential Listen");

      // Format timestamp for datetime-local input if present
      if (postToEdit.createdAt) {
        try {
          const dateObj = postToEdit.createdAt?.toDate
            ? postToEdit.createdAt.toDate()
            : new Date(postToEdit.createdAt);
          if (!isNaN(dateObj.getTime())) {
            const formattedDate = dateObj.toISOString().slice(0, 16);
            setCustomPublishDate(formattedDate);
            setPublishTiming("custom");
          }
        } catch {
          setPublishTiming("now");
        }
      } else {
        setPublishTiming("now");
      }
    } else {
      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setContent("");
      setCoverImageUrl("");
      setCategory("Music");
      setStatus("published");
      setIsEditorPick(false);
      setImageMode("url");
      setPublishTiming("now");

      // Default custom date to current local datetime
      const nowFormatted = new Date().toISOString().slice(0, 16);
      setCustomPublishDate(nowFormatted);

      setArtistName("");
      setProjectTitle("");
      setProjectType("Album");
      setRating(8.5);
      setVerdict("Essential Listen");
    }
    setErrorMessage(null);
  }, [postToEdit, isOpen]);

  // Handle Title input change and auto-slugify
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditing || !slug) {
      setSlug(slugify(newTitle));
    }
  };

  // Process Local Image File Upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (.jpg, .png, .webp).");
      return;
    }

    // Convert file to base64 Data URL for instant local preview and storage
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCoverImageUrl(e.target.result as string);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (title.trim().length < 3) {
      setErrorMessage("Title must be at least 3 characters long.");
      return;
    }

    if (content.trim().length < 1) {
      setErrorMessage("Article content body cannot be empty.");
      return;
    }

    if (!authorProfile) {
      setErrorMessage("Missing author credentials. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePostInput = {
        title: title.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(title),
        description: description.trim() || title.trim(),
        content: content,
        category: category,
        coverImageUrl: coverImageUrl.trim() || "/assets/placeholder-cover.jpg",
        status: status,
        isEditorPick: isEditorPick,
        ...(category === "Reviews" || category === "Music" || artistName.trim()
          ? {
              artistName: artistName.trim(),
              projectTitle: projectTitle.trim() || title.trim(),
              projectType: projectType,
              rating: Number(rating),
              verdict: verdict.trim() || "Essential Listen",
            }
          : {}),
      };

      if (isEditing && postToEdit) {
        await updatePost(postToEdit.id, payload);
      } else {
        await createPost(payload, authorProfile);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving post:", err);
      setErrorMessage(err.message || "Failed to save post. Please verify fields and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      {/* WordPress-Scale Widescreen Modal Container */}
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-6xl w-[94vw] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-zinc-900">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand/10 text-brand rounded-lg">
              {isEditing ? (
                <FileEdit className="h-5 w-5" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900">
                {isEditing ? "Edit Article Studio" : "Create New Article Studio"}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {isEditing
                  ? `Editing "${postToEdit?.title}"`
                  : "WordPress-grade editorial workspace with TipTap rich text & image management."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-md hover:bg-zinc-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g., Wizkid Drops 'Morayo' — Full Album Breakdown"
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-bold shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-4 py-3 text-xs text-zinc-900 font-bold focus:outline-none focus:border-brand focus:bg-white transition-colors shadow-xs"
              >
                <option value="Music">Music</option>
                <option value="Videos">Videos</option>
                <option value="Reviews">Reviews</option>
                <option value="News">News</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="wizkid-morayo-album-review"
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
              />
            </div>
          </div>

          {/* Music Review Metadata (Shown for Reviews & Music categories) */}
          {(category === "Reviews" || category === "Music") && (
            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-4">
              <div className="flex items-center space-x-2 text-amber-900 text-xs font-black uppercase tracking-wider">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span>Music Review / Album Metadata</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g., Burna Boy"
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., Higher"
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-medium"
                  >
                    <option value="Album">Album</option>
                    <option value="EP">EP</option>
                    <option value="Single">Single</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Rating (0.0 – 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-bold"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2 md:col-span-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Verdict Badge Text
                  </label>
                  <input
                    type="text"
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value)}
                    placeholder="e.g., Essential Listen"
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Computer File Drag-and-Drop Image Upload Zone & URL Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Cover Image Media *
              </label>

              <div className="flex items-center bg-zinc-100 p-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-3 py-1 rounded transition-colors ${
                    imageMode === "url"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Paste Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`px-3 py-1 rounded transition-colors ${
                    imageMode === "upload"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Upload from Computer
                </button>
              </div>
            </div>

            {imageMode === "url" ? (
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    required={!coverImageUrl}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
                  />
                </div>
                {coverImageUrl && (
                  <div className="h-10 w-16 rounded border border-zinc-200 overflow-hidden bg-zinc-100 shrink-0">
                    <img
                      src={coverImageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/placeholder-cover.jpg";
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-brand bg-brand/5"
                    : coverImageUrl
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100/80 hover:border-zinc-400"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />

                {coverImageUrl ? (
                  <div className="flex items-center justify-between max-w-md mx-auto bg-white p-3 rounded-lg border border-zinc-200 shadow-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={coverImageUrl}
                        alt="Uploaded preview"
                        className="h-12 w-16 object-cover rounded border border-zinc-200"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600 inline" />
                          <span>Image Ready</span>
                        </span>
                        <p className="text-[10px] text-zinc-400">Click box to replace file</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverImageUrl("");
                      }}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-10 w-10 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mx-auto text-brand">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        Drag & Drop image from computer here, or{" "}
                        <span className="text-brand hover:underline">Browse</span>
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Supports JPG, PNG, WEBP, GIF files
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description Excerpt */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
              Short Description / Excerpt * (Min 10 chars)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary hook for search engines and home feed cards..."
              rows={2}
              required
              minLength={10}
              maxLength={1000}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs resize-none"
            />
          </div>

          {/* TipTap Widescreen Editor */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
              Article Content Body (TipTap Editor) *
            </label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your full story, album review, or news report with rich formatting..."
            />
          </div>

          {/* Schedule & Backdate Date Picker Section */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-zinc-800 text-xs font-black uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-brand" />
                <span>Publication Timing (Schedule & Backdate)</span>
              </div>

              <div className="flex items-center space-x-4 text-xs font-medium">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value="now"
                    checked={publishTiming === "now"}
                    onChange={() => setPublishTiming("now")}
                    className="text-brand focus:ring-brand"
                  />
                  <span>Publish Immediately</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="timing"
                    value="custom"
                    checked={publishTiming === "custom"}
                    onChange={() => setPublishTiming("custom")}
                    className="text-brand focus:ring-brand"
                  />
                  <span>Schedule / Backdate</span>
                </label>
              </div>
            </div>

            {publishTiming === "custom" && (
              <div className="pt-2 flex items-center space-x-3">
                <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  type="datetime-local"
                  value={customPublishDate}
                  onChange={(e) => setCustomPublishDate(e.target.value)}
                  className="bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-brand"
                />
                <span className="text-[11px] text-zinc-500 font-medium">
                  Set a past date to backdate archived stories or a future date to schedule publication.
                </span>
              </div>
            )}
          </div>

          {/* Editor Pick & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-4 py-2.5 text-xs text-zinc-900 font-bold"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="isEditorPick"
                checked={isEditorPick}
                onChange={(e) => setIsEditorPick(e.target.checked)}
                className="h-4 w-4 text-brand border-zinc-300 rounded focus:ring-brand cursor-pointer"
              />
              <label htmlFor="isEditorPick" className="text-xs font-bold text-zinc-800 cursor-pointer">
                Feature as Editor's Pick
              </label>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-3 px-8 rounded-lg transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? "Update Article" : "Publish Article"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
