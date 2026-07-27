import { Node, mergeAttributes } from "@tiptap/core";

/**
 * MusicEmbed — Custom TipTap Node Extension
 *
 * Registers a block-level, atomic (non-editable) node that stores a raw
 * music streaming URL as a `src` attribute. Serializes to:
 *
 *   <div data-type="music-embed" data-src="https://..."></div>
 *
 * Inside the editor, renders a styled preview card showing the detected
 * platform name, the URL, and a delete button. On the public-facing
 * BlogPostView, the ArticleRenderer replaces these nodes with live
 * <UniversalMusicPlayer /> iframe components.
 */

// ─── TypeScript: Register custom commands on the TipTap Commands interface ───
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    musicEmbed: {
      /**
       * Insert a music embed node at the current cursor position.
       * @param attrs.src — The raw canonical music URL (Spotify, YouTube, etc.)
       */
      setMusicEmbed: (attrs: { src: string }) => ReturnType;
    };
  }
}

// ─── Platform Detection (lightweight, editor-preview only) ───────────────────

interface PlatformInfo {
  name: string;
  color: string;
}

function detectPlatform(url: string): PlatformInfo {
  if (/spotify\.com/i.test(url)) return { name: "Spotify", color: "#1DB954" };
  if (/youtu(be\.com|\.be)/i.test(url)) return { name: "YouTube", color: "#FF0000" };
  if (/audiomack\.com/i.test(url)) return { name: "Audiomack", color: "#FFA200" };
  if (/music\.apple\.com/i.test(url)) return { name: "Apple Music", color: "#FC3C44" };
  return { name: "Music Link", color: "#f97316" };
}

// ─── Node Extension ─────────────────────────────────────────────────────────

export const MusicEmbed = Node.create({
  name: "musicEmbed",

  // Block-level node (sits between paragraphs, headings, etc.)
  group: "block",

  // Atomic = non-editable, treated as a single unit (like an image)
  atom: true,

  // ── Attributes ──────────────────────────────────────────────────────────
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-src"),
        renderHTML: (attributes: Record<string, string>) => ({
          "data-src": attributes.src,
        }),
      },
    };
  },

  // ── HTML Parsing (content → editor) ─────────────────────────────────────
  parseHTML() {
    return [
      {
        tag: 'div[data-type="music-embed"]',
      },
    ];
  },

  // ── HTML Serialization (editor → content string) ────────────────────────
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "music-embed" }),
    ];
  },

  // ── Custom Commands ─────────────────────────────────────────────────────
  addCommands() {
    return {
      setMusicEmbed:
        (attrs: { src: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },

  // ── Editor Node View (preview card inside the TipTap canvas) ────────────
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const url: string = node.attrs.src || "";
      const platform = detectPlatform(url);

      // ── Wrapper container ───────────────────────────────────────────
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-type", "music-embed-preview");
      wrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        margin: 12px 0;
        background: #fafafa;
        border: 1px solid #e4e4e7;
        border-left: 4px solid ${platform.color};
        border-radius: 8px;
        cursor: default;
        user-select: none;
        position: relative;
        transition: box-shadow 0.15s ease;
      `;
      wrapper.addEventListener("mouseenter", () => {
        wrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      });
      wrapper.addEventListener("mouseleave", () => {
        wrapper.style.boxShadow = "none";
      });

      // ── Platform icon badge ─────────────────────────────────────────
      const icon = document.createElement("div");
      icon.style.cssText = `
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: ${platform.color}18;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 18px;
      `;
      icon.textContent = "🎵";

      // ── Text: platform label + truncated URL ────────────────────────
      const textContainer = document.createElement("div");
      textContainer.style.cssText = "flex: 1; min-width: 0;";

      const platformLabel = document.createElement("div");
      platformLabel.style.cssText = `
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: ${platform.color};
        margin-bottom: 2px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      platformLabel.textContent = `${platform.name} Embed`;

      const urlDisplay = document.createElement("div");
      urlDisplay.style.cssText = `
        font-size: 12px;
        color: #71717a;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: ui-monospace, monospace;
      `;
      urlDisplay.textContent = url;

      textContainer.appendChild(platformLabel);
      textContainer.appendChild(urlDisplay);

      // ── Delete button (only when editor is editable) ────────────────
      wrapper.appendChild(icon);
      wrapper.appendChild(textContainer);

      if (editor.isEditable) {
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.style.cssText = `
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #e4e4e7;
          background: white;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.15s ease;
          font-family: system-ui, -apple-system, sans-serif;
        `;
        deleteBtn.textContent = "✕";
        deleteBtn.title = "Remove this music embed";

        deleteBtn.addEventListener("mouseenter", () => {
          deleteBtn.style.background = "#fef2f2";
        });
        deleteBtn.addEventListener("mouseleave", () => {
          deleteBtn.style.background = "white";
        });
        deleteBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof getPos === "function") {
            const pos = getPos();
            if (pos != null) {
              editor
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + node.nodeSize })
                .run();
            }
          }
        });

        wrapper.appendChild(deleteBtn);
      }

      return {
        dom: wrapper,
      };
    };
  },
});
