import * as React from "react";
import {
  X,
  Loader2,
  FileEdit,
  PlusCircle,
  Image as ImageIcon,
  Star,
  Calendar,
  Trash2,
  CheckCircle,
  RefreshCw,
  FolderOpen,
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
import { DateTimePicker } from "@/components/admin/DateTimePicker";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { generateExcerpt } from "@/utils/excerpt";

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit?: Post | null;
  authorProfile: UserProfile | null;
  onSuccess: () => void;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  try {
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (value as { toDate: () => Date }).toDate === "function"
    ) {
      return (value as { toDate: () => Date }).toDate();
    }
    const d = new Date(value as string | number | Date);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function PostEditorModal({
  isOpen,
  onClose,
  postToEdit,
  authorProfile,
  onSuccess,
}: PostEditorModalProps) {
  const isEditing = Boolean(postToEdit);

  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [descriptionTouched, setDescriptionTouched] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState("");
  const [category, setCategory] = React.useState<PostCategory>("Music");
  const [status, setStatus] = React.useState<PostStatus>("published");
  const [isEditorPick, setIsEditorPick] = React.useState(false);

  const [coverMediaOpen, setCoverMediaOpen] = React.useState(false);

  const [publishTiming, setPublishTiming] = React.useState<"now" | "custom">(
    "now"
  );
  const [customPublishDate, setCustomPublishDate] = React.useState<Date>(
    () => new Date()
  );

  const [artistName, setArtistName] = React.useState("");
  const [projectTitle, setProjectTitle] = React.useState("");
  const [projectType, setProjectType] = React.useState("Album");
  const [rating, setRating] = React.useState<number>(8.5);
  const [verdict, setVerdict] = React.useState("Essential Listen");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || "");
      setSlug(postToEdit.slug || "");
      setDescription(postToEdit.description || postToEdit.excerpt || "");
      setDescriptionTouched(true);
      setContent(postToEdit.content || "");
      setCoverImageUrl(postToEdit.coverImageUrl || postToEdit.coverImage || "");
      setCategory((postToEdit.category as PostCategory) || "Music");
      setStatus((postToEdit.status as PostStatus) || "published");
      setIsEditorPick(postToEdit.isEditorPick ?? false);

      setArtistName(
        postToEdit.artistName || postToEdit.reviewMeta?.artistName || ""
      );
      setProjectTitle(
        postToEdit.projectTitle ||
          postToEdit.reviewMeta?.albumOrTrackTitle ||
          ""
      );
      setProjectType(postToEdit.projectType || "Album");
      setRating(postToEdit.rating ?? postToEdit.reviewMeta?.rating ?? 8.5);
      setVerdict(
        postToEdit.verdict ||
          postToEdit.reviewMeta?.verdict ||
          "Essential Listen"
      );

      const existingDate = toDate(postToEdit.createdAt);
      if (existingDate) {
        setCustomPublishDate(existingDate);
        setPublishTiming("custom");
      } else {
        setCustomPublishDate(new Date());
        setPublishTiming("now");
      }
    } else {
      setTitle("");
      setSlug("");
      setDescription("");
      setDescriptionTouched(false);
      setContent("");
      setCoverImageUrl("");
      setCategory("Music");
      setStatus("published");
      setIsEditorPick(false);
      setPublishTiming("now");
      setCustomPublishDate(new Date());
      setArtistName("");
      setProjectTitle("");
      setProjectType("Album");
      setRating(8.5);
      setVerdict("Essential Listen");
    }
    setErrorMessage(null);
  }, [postToEdit, isOpen]);

  // Auto-generate excerpt while not manually overridden
  React.useEffect(() => {
    if (descriptionTouched) return;
    const auto = generateExcerpt({
      title,
      contentHtml: content,
      artistName,
      projectTitle,
      rating,
      category,
    });
    setDescription(auto);
  }, [
    title,
    content,
    artistName,
    projectTitle,
    rating,
    category,
    descriptionTouched,
  ]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditing || !slug) {
      setSlug(slugify(newTitle));
    }
  };

  const handleRegenerateExcerpt = () => {
    const auto = generateExcerpt({
      title,
      contentHtml: content,
      artistName,
      projectTitle,
      rating,
      category,
    });
    setDescription(auto);
    setDescriptionTouched(false);
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

    const safeDescription = generateExcerpt({
      title,
      contentHtml: content,
      artistName,
      projectTitle,
      rating,
      category,
    });
    const finalDescription =
      description.trim().length >= 10 ? description.trim() : safeDescription;

    if (finalDescription.length < 10) {
      setErrorMessage("Description must be at least 10 characters.");
      return;
    }

    if (coverImageUrl.trim().startsWith("data:")) {
      setErrorMessage(
        "Cover image must be a hosted URL. Use Media Library to upload to Firebase Storage."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePostInput = {
        title: title.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(title),
        description: finalDescription.slice(0, 1000),
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

      if (publishTiming === "custom") {
        payload.createdAt = customPublishDate;
      } else if (!isEditing) {
        // create uses serverTimestamp when createdAt omitted
      } else if (isEditing && publishTiming === "now") {
        // Keep existing createdAt on update unless custom timing is selected
      }

      if (isEditing && postToEdit) {
        await updatePost(postToEdit.id, payload);
      } else {
        await createPost(payload, authorProfile);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error saving post:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save post. Please verify fields and try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const descLen = description.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-6xl w-[94vw] max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-zinc-900">
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
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-2 rounded-md hover:bg-zinc-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
        >
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium">
              {errorMessage}
            </div>
          )}

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
                    <option value="Mixtape">Mixtape</option>
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

          {/* Cover image via Media Library */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Cover Image Media *
              </label>
              <button
                type="button"
                onClick={() => setCoverMediaOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-700 hover:bg-zinc-200"
              >
                <FolderOpen className="h-3.5 w-3.5 text-brand" />
                Media Library
              </button>
            </div>

            {coverImageUrl ? (
              <div className="flex items-center justify-between max-w-xl bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-14 w-20 object-cover rounded border border-zinc-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/placeholder-cover.jpg";
                    }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      Cover Ready
                    </span>
                    <p className="text-[10px] text-zinc-400 truncate max-w-xs sm:max-w-md">
                      {coverImageUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCoverMediaOpen(true)}
                    className="p-1.5 text-zinc-500 hover:text-brand rounded hover:bg-white"
                    title="Change image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl("")}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50"
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCoverMediaOpen(true)}
                className="w-full border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center hover:border-brand hover:bg-brand/5 transition-all"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-zinc-900">
                  Open Media Library
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Upload to Firebase Storage, pick an existing image, or paste a
                  URL
                </p>
              </button>
            )}
          </div>

          {/* Auto excerpt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Short Description / Excerpt * (Min 10 chars)
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold ${
                    descLen > 1000
                      ? "text-red-500"
                      : descLen < 10
                        ? "text-amber-600"
                        : "text-zinc-400"
                  }`}
                >
                  {descLen}/1000
                  {!descriptionTouched && (
                    <span className="ml-1 text-brand">· auto</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateExcerpt}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </button>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionTouched(true);
              }}
              placeholder="Auto-generated from article body; edit anytime…"
              rows={2}
              required
              minLength={10}
              maxLength={1000}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
              Article Content Body (TipTap Editor) *
            </label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              uploaderUid={authorProfile?.uid ?? null}
              placeholder="Write your full story, album review, or news report with rich formatting..."
            />
          </div>

          {/* Publication timing */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <DateTimePicker
                  value={customPublishDate}
                  onChange={setCustomPublishDate}
                />
                <span className="text-[11px] text-zinc-500 font-medium">
                  Past date = backdate. Future date = scheduled (hidden until
                  that time). Super-admins and post owners can change this later.
                </span>
              </div>
            )}
          </div>

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
              <label
                htmlFor="isEditorPick"
                className="text-xs font-bold text-zinc-800 cursor-pointer"
              >
                Feature as Editor&apos;s Pick
              </label>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
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

      <MediaLibraryModal
        isOpen={coverMediaOpen}
        onClose={() => setCoverMediaOpen(false)}
        onSelect={(url) => setCoverImageUrl(url)}
        uploaderUid={authorProfile?.uid ?? null}
        title="Cover Image"
      />
    </div>
  );
}
