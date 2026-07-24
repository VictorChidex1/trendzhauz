import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
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
  Undo,
  Redo,
} from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing your story or review here...",
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand underline font-semibold",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-h-96 w-auto my-4 border border-zinc-200 shadow-sm",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-zinc-400 before:float-left before:pointer-events-none before:h-0 font-normal",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[380px] max-h-[600px] overflow-y-auto px-5 py-4 text-zinc-900 leading-relaxed font-normal",
      },
    },
  });

  // Keep editor content in sync if initial content changes externally
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

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

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-zinc-300 rounded-md overflow-hidden bg-white focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20 transition-all shadow-xs">
      {/* Editor Toolbar */}
      <div className="bg-zinc-50 border-b border-zinc-200 p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting Group */}
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

        {/* Heading Group */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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

        {/* Lists & Quotes */}
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

        {/* Media & Links */}
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
          onClick={addImage}
          className="p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors"
          title="Insert Image URL"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-zinc-300 mx-1 self-center ml-auto" />

        {/* History */}
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

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
