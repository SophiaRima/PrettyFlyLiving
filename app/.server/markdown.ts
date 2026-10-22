import { Marked } from "marked";

/** Escapes text for safe use inside HTML attributes and text nodes. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SAFE_PROTOCOL = /^(https?:|mailto:|tel:|\/|#)/i;

const marked = new Marked({
  gfm: true,
  renderer: {
    // Raw HTML in guide bodies is never rendered (AGENTS.md section 9).
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (!SAFE_PROTOCOL.test(href)) return label;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      // External venue links open in a new tab (AGENTS.md section 8).
      const external = /^https?:/i.test(href)
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return `<a href="${escapeHtml(href)}"${titleAttr}${external}>${label}</a>`;
    },
    image({ text }) {
      // Guide images come from the cover field; inline images are not supported.
      return escapeHtml(text);
    },
  },
});

/** Renders admin-written guide Markdown to safe HTML. */
export function renderGuideMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
