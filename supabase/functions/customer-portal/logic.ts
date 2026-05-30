/**
 * Pure logic helpers for the customer-portal Edge Function.
 */

/** Allowed origin patterns to prevent open redirect attacks */
const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/([a-z0-9-]+\.)?subjectai\.com$/,
  /^https:\/\/subject-ai[a-z0-9-]*\.vercel\.app$/,
];

/**
 * Check if an origin is in our allowlist.
 */
export function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.some(pattern => pattern.test(origin));
}

/**
 * Build a safe return URL given an origin header.
 * Fallback to localhost preview if origin missing, invalid, or not in allowlist.
 * This prevents open redirect attacks where an attacker could send a malicious Origin header.
 */
export function buildReturnUrl(originHeader?: string | null, path: string = "/dashboard"): string {
  const fallback = "http://localhost:3000";
  // Only use the origin if it's a valid HTTP(S) URL AND in our allowlist
  const base = (originHeader && /^https?:\/\//.test(originHeader) && isAllowedOrigin(originHeader))
    ? originHeader
    : fallback;
  // Ensure single slash join
  const normalized = base.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
  return normalized;
}
