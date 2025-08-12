/**
 * Pure logic helpers for the customer-portal Edge Function.
 */

/**
 * Build a safe return URL given an origin header.
 * Fallback to localhost preview if origin missing or invalid.
 */
export function buildReturnUrl(originHeader?: string | null, path: string = "/dashboard"): string {
  const fallback = "http://localhost:3000";
  const base = (originHeader && /^https?:\/\//.test(originHeader)) ? originHeader : fallback;
  // Ensure single slash join
  const normalized = base.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
  return normalized;
}
