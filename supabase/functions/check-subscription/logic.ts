/**
 * Pure logic helpers for the check-subscription Edge Function.
 */

export type SubscriptionTier = "Starter" | "Professional" | "Enterprise" | "Premium" | "Basic" | null;

/** Convert unix seconds to ISO string. */
export function toIsoFromUnixSeconds(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds || unixSeconds <= 0) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

/** Map a Stripe Price ID to a tier name using STRIPE_PRICE_MAP secret (inverse mapping). */
export function mapPriceIdToTierFromEnv(priceId?: string): string | null {
  const raw = Deno.env.get("STRIPE_PRICE_MAP");
  if (!raw || !priceId) return null;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    for (const [tier, id] of Object.entries(map)) {
      if (id === priceId) return tier;
    }
    return null;
  } catch (_err) {
    return null;
  }
}
