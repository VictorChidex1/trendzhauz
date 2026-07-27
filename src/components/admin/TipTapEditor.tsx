import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@/components/admin/FontSizeExtension";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Music,
  Undo,
  Redo,
  RotateCcw,
} from "lucide-react";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { MusicEmbed } from "@/components/admin/MusicEmbedExtension";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Firebase Auth UID for Storage uploads (required for media library uploads) */
  uploaderUid?: string | null;
}

const FONT_SIZES = ["13px", "16px", "18px", "20px", "24px", "30px"];

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing your story or review here...",
  uploaderUid = null,
}: TipTapEditorProps) {
  const [mediaOpen, setMediaOpen] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      FontSize,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand underline font-semibold",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class:
            "rounded-lg max-h-96 w-auto my-4 border border-zinc-200 shadow-sm",
        },
      }),
      MusicEmbed,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-zinc-400 before:float-left before:pointer-events-none before:h-0 font-normal",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[450px] px-5 py-4 text-zinc-900 prose-headings:text-zinc-900 prose-p:text-zinc-900 prose-strong:text-zinc-900 prose-code:text-zinc-900 prose-blockquote:text-zinc-900 prose-li:text-zinc-900 leading-relaxed font-normal rounded-b-md",
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const currentFontSize =
    editor.getAttributes("textStyle").fontSize || "16px";

  const stepUpFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(currentFontSize);
    if (currentIndex === -1) {
      editor.chain().focus().setFontSize("18px").run();
    } else if (currentIndex < FONT_SIZES.length - 1) {
      const nextSize = FONT_SIZES[currentIndex + 1];
      if (nextSize === "16px") {
        editor.chain().focus().unsetFontSize().run();
      } else {
        editor.chain().focus().setFontSize(nextSize).run();
      }
    }
  };

  const stepDownFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(currentFontSize);
    if (currentIndex === -1) {
      editor.chain().focus().setFontSize("13px").run();
    } else if (currentIndex > 0) {
      const prevSize = FONT_SIZES[currentIndex - 1];
      if (prevSize === "16px") {
        editor.chain().focus().unsetFontSize().run();
      } else {
        editor.chain().focus().setFontSize(prevSize).run();
      }
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter destination URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImageFromUrl = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertMusicEmbed = () => {
    const url = window.prompt(
      "Paste the music link (Spotify, YouTube, Audiomack, or Apple Music):"
    );
    if (!url || !url.trim()) return;

    // Basic URL validation
    try {
      new URL(url.trim());
    } catch {
      window.alert("Please enter a valid URL.");
      return;
    }

    editor.chain().focus().setMusicEmbed({ src: url.trim() }).run();
  };

  return (
    <>
      <div className="border border-zinc-300 rounded-md bg-white focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20 transition-all shadow-xs">
        {/* Editor Toolbar - Sticky at top of scroll container */}
        <div className="bg-zinc-50/95 backdrop-blur-md border-b border-zinc-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-30 shadow-xs rounded-t-md">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bold")
                ? "bg-zinc-200 text-zinc-900 font-bold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("italic")
                ? "bg-zinc-200 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("strike")
                ? "bg-zinc-200 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("code")
                ? "bg-zinc-200 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Code snippet"
          >
            <Code className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-zinc-300 mx-1 self-center" />

          {/* Font Size Hybrid Controls (Option C: Steppers + Dropdown) */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded px-1 py-0.5 space-x-0.5">
            <button
              type="button"
              onClick={stepDownFontSize}
              className="p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 rounded transition-colors"
              title="Decrease Font Size (A-)"
            >
              <span className="text-xs font-bold font-mono">A-</span>
            </button>

            <select
              value={currentFontSize || "16px"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "16px" || !val) {
                  editor.chain().focus().unsetFontSize().run();
                } else {
                  editor.chain().focus().setFontSize(val).run();
                }
              }}
              className="bg-transparent text-xs font-semibold text-zinc-800 focus:outline-none cursor-pointer py-0.5 px-1 rounded hover:bg-zinc-200 transition-colors"
              title="Select Editorial Font Size"
            >
              <option value="13px">13px - Small</option>
              <option value="16px">16px - Normal</option>
              <option value="18px">18px - Medium</option>
              <option value="20px">20px - Large</option>
              <option value="24px">24px - XL</option>
              <option value="30px">30px - Huge</option>
            </select>

            <button
              type="button"
              onClick={stepUpFontSize}
              className="p-1 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 rounded transition-colors"
              title="Increase Font Size (A+)"
            >
              <span className="text-xs font-bold font-mono">A+</span>
            </button>

            {currentFontSize && currentFontSize !== "16px" && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetFontSize().run()}
                className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-0.5"
                title="Reset to Normal Size"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="w-px h-4 bg-zinc-300 mx-1 self-center" />

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-zinc-200 text-zinc-900 font-bold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-zinc-200 text-zinc-900 font-bold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-zinc-200 text-zinc-900 font-bold"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-zinc-300 mx-1 self-center" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("bulletList")
                ? "bg-zinc-200 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("orderedList")
                ? "bg-zinc-200 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("blockquote")
                ? "bg-zinc-200 text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors"
            title="Horizontal Line"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-zinc-300 mx-1 self-center" />

          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded transition-colors ${
              editor.isActive("link")
                ? "bg-zinc-200 text-brand"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
            title="Insert / Edit Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          {editor.isActive("link") && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Remove Link"
            >
              <Unlink className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMediaOpen(true)}
            className="p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors"
            title="Insert Image (Upload / Media Library / URL)"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={insertMusicEmbed}
            className="p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors"
            title="Embed Music Player (Spotify, YouTube, Audiomack, Apple Music)"
          >
            <Music className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-zinc-300 mx-1 self-center ml-auto" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>

      <MediaLibraryModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={insertImageFromUrl}
        uploaderUid={uploaderUid}
        title="Insert Image"
      />
    </>
  );
}
