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
    const parsed = JSON.parse(raw) as unknown;

    // Case 1: Flat map { "Basic": "price_...", "Pro": "price_..." }
    if (isFlatTierMap(parsed)) {
      for (const [tier, id] of Object.entries(parsed)) {
        if (id === priceId) return tier;
      }
      return null;
    }

    // Case 2: Nested by mode { test: { tier: priceId }, live: { tier: priceId } }
    if (isNestedTierMap(parsed)) {
      const { test, live } = parsed;
      // Search both maps without needing to know mode
      for (const [tier, id] of Object.entries(test)) {
        if (id === priceId) return tier;
      }
      for (const [tier, id] of Object.entries(live)) {
        if (id === priceId) return tier;
      }
      return null;
    }

    // Unknown shape
    return null;
  } catch (_err) {
    return null;
  }
}

// Type guards
function isFlatTierMap(v: unknown): v is Record<string, string> {
  if (!v || typeof v !== "object") return false;
  // Ensure all values are strings
  for (const val of Object.values(v as Record<string, unknown>)) {
    if (typeof val !== "string") return false;
  }
  return true;
}

function isNestedTierMap(v: unknown): v is { test: Record<string, string>; live: Record<string, string> } {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  const t = obj["test"];
  const l = obj["live"];
  if (!t || !l || typeof t !== "object" || typeof l !== "object") return false;
  // Check values are strings in both maps
  for (const val of Object.values(t as Record<string, unknown>)) {
    if (typeof val !== "string") return false;
  }
  for (const val of Object.values(l as Record<string, unknown>)) {
    if (typeof val !== "string") return false;
  }
  return true;
}
