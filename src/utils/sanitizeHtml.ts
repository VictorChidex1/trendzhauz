import DOMPurify from "dompurify";

/**
 * sanitizeArticleHtml — DOMPurify hardening for article content.
 *
 * Article content is produced by the TipTap editor and rendered with
 * `dangerouslySetInnerHTML`. To prevent stored XSS (malicious <script>,
 * event-handler attributes, or `javascript:` links), every article HTML string
 * is passed through DOMPurify before it is saved and before it is rendered.
 *
 * Configuration notes:
 *  - `USE_PROFILES: { html: true }` — keep standard HTML tags (p, h1-h3, a, img,
 *    ul/ol, blockquote, span, etc.) while stripping <script>, <iframe>, <style>
 *    and event handlers.
 *  - DOMPurify keeps `data-*` attributes by default, so our embed markers
 *    (`data-type`, `data-src`) survive sanitization untouched.
 *  - DOMPurify treats inline `style` as URI-safe and does NOT inspect its value,
 *    so a `style="background: url(...)"` would otherwise pass through. The
 *    `afterSanitizeAttributes` hook below rewrites every `style` attribute to
 *    keep ONLY a `font-size` value (TipTap's FontSize extension), stripping
 *    `url()`, `expression()`, positioning tricks, and any other CSS property.
 */

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
};

let styleHookInstalled = false;

function installStyleHook(): void {
  if (styleHookInstalled || typeof window === "undefined") return;
  styleHookInstalled = true;

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (!node.hasAttribute("style")) return;

    const raw = node.getAttribute("style") || "";
    const match = raw.match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i);
    const value = match?.[1]?.trim();

    // Only a plain, safe font-size value survives (letters, digits, ".", "%",
    // spaces, hyphens). Anything else — `url()`, `expression()`, `position`,
    // etc. — drops the whole style attribute.
    if (value && /^[a-zA-Z0-9.% -]+$/.test(value)) {
      node.setAttribute("style", `font-size: ${value}`);
    } else {
      node.removeAttribute("style");
    }
  });
}

/**
 * Returns a sanitized copy of the given article HTML. Safe to call anywhere;
 * falls back to the input unchanged when no DOM is available (SSR safety).
 */
export function sanitizeArticleHtml(html: string): string {
  if (typeof window === "undefined") return html;
  installStyleHook();
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
