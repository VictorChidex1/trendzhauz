import { Node, mergeAttributes } from "@tiptap/core";
import { parseSocialUrl, SOCIAL_PLATFORMS } from "@/lib/socialEmbed";

/**
 * SocialEmbed — Custom TipTap Node Extension
 *
 * Registers a block-level, atomic node that stores a raw social media URL as a
 * `src` attribute. Serializes to:
 *
 *   <div data-type="social-embed" data-src="https://x.com/..."></div>
 *
 * Inside the editor it renders a styled preview card (platform name + truncated
 * URL + delete button). On the public page, `ArticleRenderer` replaces these
 * nodes with live <SocialEmbed /> widgets hydrated by each platform's official
 * embed script.
 */

// ─── TypeScript: register custom commands on the TipTap Commands interface ───
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    socialEmbed: {
      /**
       * Insert a social embed node at the current cursor position.
       * @param attrs.src — The raw social media post URL (X, Instagram, TikTok).
       */
      setSocialEmbed: (attrs: { src: string }) => ReturnType;
    };
  }
}

// ─── Editor preview detection (lightweight, shared parser) ───────────────────

interface PreviewInfo {
  name: string;
  color: string;
  isShortLink: boolean;
}

function detectPreview(url: string): PreviewInfo {
  const parsed = parseSocialUrl(url);
  if (!parsed) return { name: "Social Link", color: "#f97316", isShortLink: false };
  const config = SOCIAL_PLATFORMS[parsed.platform];
  if (parsed.isShortLink) {
    return {
      name: `${config.label} · Short Link`,
      color: "#f97316",
      isShortLink: true,
    };
  }
  return { name: config.label, color: config.color, isShortLink: false };
}

// ─── Node Extension ─────────────────────────────────────────────────────────

export const SocialEmbed = Node.create({
  name: "socialEmbed",

  group: "block",

  atom: true,

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

  // ── HTML Parsing (content → editor) — round-trip guarantee ──────────────
  parseHTML() {
    return [
      {
        tag: 'div[data-type="social-embed"]',
      },
    ];
  },

  // ── HTML Serialization (editor → content string) ────────────────────────
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "social-embed" }, HTMLAttributes),
    ];
  },

  // ── Custom Commands ─────────────────────────────────────────────────────
  addCommands() {
    return {
      setSocialEmbed:
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
      const preview = detectPreview(url);

      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-type", "social-embed-preview");
      wrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        margin: 12px 0;
        background: #fafafa;
        border: 1px solid #e4e4e7;
        border-left: 4px solid ${preview.color};
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

      const icon = document.createElement("div");
      icon.style.cssText = `
        width: 38px;
        height: 38px;
        border-radius: 8px;
        background: ${preview.color}18;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 18px;
        font-weight: 700;
        color: ${preview.color};
      `;
      icon.textContent = "@";

      const textContainer = document.createElement("div");
      textContainer.style.cssText = "flex: 1; min-width: 0;";

      const platformLabel = document.createElement("div");
      platformLabel.style.cssText = `
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: ${preview.color};
        margin-bottom: 2px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      platformLabel.textContent = `${preview.name} Embed`;

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

      const shortLinkNote = document.createElement("div");
      shortLinkNote.style.cssText = `
        font-size: 11px;
        color: #f97316;
        margin-top: 2px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      shortLinkNote.textContent =
        "Short link — will show a link card, not a live player.";

      textContainer.appendChild(platformLabel);
      textContainer.appendChild(urlDisplay);
      if (preview.isShortLink) {
        textContainer.appendChild(shortLinkNote);
      }

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
        deleteBtn.title = "Remove this social embed";

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
