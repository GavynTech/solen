const HTML_ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape HTML special chars — use on any user input inserted into email HTML. */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, c => HTML_ESCAPE_MAP[c]);
}

/**
 * Validate email format and extract the domain.
 * Returns the domain string (e.g. "acme.com") or null if invalid.
 */
export function sanitizeEmail(str) {
  if (typeof str !== 'string') return null;
  const trimmed = str.trim().toLowerCase();
  const match = trimmed.match(/^[^\s@]+@([a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+)$/);
  return match ? match[1] : null;
}

/**
 * Strip characters that could be used for prompt injection in LLM calls.
 * Use on company names passed into Perplexity / Claude prompts.
 */
export function sanitizeCompanyName(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[`"'\\]/g, '').trim().slice(0, 100);
}
