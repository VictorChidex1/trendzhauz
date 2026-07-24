import * as React from "react";
import {
  X,
  Loader2,
  FileEdit,
  PlusCircle,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import type {
  Post,
  CreatePostInput,
  PostCategory,
  PostStatus,
} from "@/types/post";
import type { UserProfile } from "@/types/user";
import { createPost, updatePost, slugify } from "@/services/posts";

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
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [category, setCategory] = React.useState<PostCategory>("music");
  const [status, setStatus] = React.useState<PostStatus>("published");
  const [tags, setTags] = React.useState("");
  const [readTime, setReadTime] = React.useState("4 min read");
  const [featured, setFeatured] = React.useState(false);

  // Review-Specific Metadata State
  const [artistName, setArtistName] = React.useState("");
  const [albumOrTrackTitle, setAlbumOrTrackTitle] = React.useState("");
  const [rating, setRating] = React.useState<number>(4.5);
  const [verdict, setVerdict] = React.useState("Essential Listen");

  // UI Status State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Populate form when editing an existing post or reset when creating new
  React.useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || "");
      setSlug(postToEdit.slug || "");
      setExcerpt(postToEdit.excerpt || "");
      setContent(postToEdit.content || "");
      setCoverImage(postToEdit.coverImage || "");
      setCategory((postToEdit.category as PostCategory) || "music");
      setStatus((postToEdit.status as PostStatus) || "published");
      setTags(Array.isArray(postToEdit.tags) ? postToEdit.tags.join(", ") : "");
      setReadTime(postToEdit.readTime || "4 min read");
      setFeatured(postToEdit.featured ?? false);

      if (postToEdit.reviewMeta) {
        setArtistName(postToEdit.reviewMeta.artistName || "");
        setAlbumOrTrackTitle(postToEdit.reviewMeta.albumOrTrackTitle || "");
        setRating(postToEdit.reviewMeta.rating || 4.5);
        setVerdict(postToEdit.reviewMeta.verdict || "Essential Listen");
      }
    } else {
      // Reset form
      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setCoverImage("");
      setCategory("music");
      setStatus("published");
      setTags("");
      setReadTime("4 min read");
      setFeatured(false);
      setArtistName("");
      setAlbumOrTrackTitle("");
      setRating(4.5);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !content.trim()) {
      setErrorMessage("Please provide at least a title and article body content.");
      return;
    }

    if (!authorProfile) {
      setErrorMessage("Missing author credentials. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: CreatePostInput = {
        title: title.trim(),
        slug: slug.trim() ? slugify(slug) : slugify(title),
        excerpt: excerpt.trim() || title.trim(),
        content: content,
        coverImage: coverImage.trim() || "/assets/placeholder-cover.jpg",
        category,
        status,
        tags: parsedTags,
        readTime,
        featured,
        ...(category === "reviews"
          ? {
              reviewMeta: {
                artistName: artistName.trim() || "Various Artists",
                albumOrTrackTitle: albumOrTrackTitle.trim() || title.trim(),
                rating: Number(rating),
                maxRating: 5,
                verdict: verdict.trim() || "Hot Drop",
              },
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
      setErrorMessage(err.message || "Failed to save post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand/10 text-brand rounded-md">
              {isEditing ? (
                <FileEdit className="h-5 w-5" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
                {isEditing ? "Edit Article" : "Create New Article"}
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                {isEditing
                  ? `Editing "${postToEdit?.title}"`
                  : "Publish a new story, music review, or news update to TrendzHauz."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-md hover:bg-zinc-200/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g., Wizkid Drops 'Morayo' — Full Album Breakdown"
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="wizkid-morayo-album-review"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
              >
                <option value="music">Music</option>
                <option value="reviews">Music Reviews</option>
                <option value="news">News</option>
                <option value="events">Events</option>
                <option value="culture">Culture</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
          </div>

          {/* Music Review Specific Metadata Fields */}
          {category === "reviews" && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-md space-y-4">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-black uppercase tracking-wider">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span>Music Review Metadata</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g., Burna Boy"
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Album / Single Title
                  </label>
                  <input
                    type="text"
                    value={albumOrTrackTitle}
                    onChange={(e) => setAlbumOrTrackTitle(e.target.value)}
                    placeholder="e.g., Higher"
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Star Rating (Out of 5)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900 font-bold"
                    />
                    <div className="flex items-center space-x-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            rating >= star
                              ? "fill-amber-400 text-amber-500"
                              : "text-zinc-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                    Review Verdict Badge
                  </label>
                  <input
                    type="text"
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value)}
                    placeholder="e.g., Essential Listen"
                    className="w-full bg-white border border-zinc-300 rounded-md px-3.5 py-2 text-xs text-zinc-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cover Image URL & Preview */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
              Cover Image URL
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-md pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
                />
              </div>

              {coverImage && (
                <div className="h-10 w-14 rounded border border-zinc-200 overflow-hidden bg-zinc-100 shrink-0">
                  <img
                    src={coverImage}
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
          </div>

          {/* Article Excerpt */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
              Summary Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief 1-2 sentence hook for search engines and home feed cards..."
              rows={2}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs resize-none"
            />
          </div>

          {/* Main Article Body Content */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
              Article Content (Markdown / Text) *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your full article here..."
              rows={8}
              required
              className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-brand focus:bg-white transition-colors font-medium shadow-xs"
            />
          </div>

          {/* Tags, Read Time, and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Afrobeats, Review, 2026"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="4 min read"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-700 block">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-md px-3.5 py-2.5 text-xs text-zinc-900 font-bold"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
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
            className="bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest py-2.5 px-6 rounded-md transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
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
