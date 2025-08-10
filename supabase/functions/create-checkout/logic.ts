/**
 * Pure logic helpers for the create-checkout Edge Function.
 * No network or platform-specific code here to keep tests fast and reliable.
 */

/** Resolve a Stripe Price ID from a plan name using STRIPE_PRICE_MAP secret. */
export function resolvePriceIdFromEnv(planName?: string): string | null {
  const raw = Deno.env.get("STRIPE_PRICE_MAP");
  if (!raw) return null;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    if (!planName) return null;
    return map[planName] ?? null;
  } catch (_err) {
    return null;
  }
}

