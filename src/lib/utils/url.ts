/**
 * Resolves the canonical site URL for authentication redirects, webhooks, and SEO.
 * Priority order:
 * 1. process.env.NEXT_PUBLIC_SITE_URL
 * 2. process.env.NEXT_PUBLIC_VERCEL_URL (prefixed with https://)
 * 3. window.location.origin (when running in browser)
 * 4. http://localhost:3000 (local dev fallback)
 *
 * Trailing slashes are consistently stripped.
 */
export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined) ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "http://localhost:3000");

  // Ensure protocol is present
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // Strip trailing slashes consistently
  return url.replace(/\/+$/, "");
}
