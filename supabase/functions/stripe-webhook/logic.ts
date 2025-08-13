/**
 * Pure logic helpers for Stripe webhook processing.
 * These are free of I/O to allow deterministic unit testing.
 */

export type StripeSubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused" // future-proof/custom
  | string;

/** Whether the subscription should be considered subscribed. */
export function isSubscribed(status: StripeSubscriptionStatus | null | undefined): boolean {
  if (!status) return false;
  return status === "active" || status === "trialing";
}

/** Convert unix seconds to ISO string or null. */
export function toIsoFromUnixSeconds(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds || unixSeconds <= 0) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

/** Safely extract the first price id from a subscription-like object. */
export function getFirstPriceId(sub: { items?: { data?: Array<{ price?: { id?: string | null } | null }> } | null } | null | undefined): string | null {
  const id = sub?.items?.data?.[0]?.price?.id ?? null;
  return id ?? null;
}

/** Build a simple idempotency key from event type and id. */
export function composeIdempotencyKey(eventType?: string | null, eventId?: string | null): string | null {
  if (!eventType || !eventId) return null;
  return `${eventType}:${eventId}`;
}

/**
 * Attempt to pick an email from possible sources.
 */
export function coalesceEmail(
  customerDetailsEmail?: string | null,
  sessionEmail?: string | null,
  customerObjectEmail?: string | null,
): string | null {
  return customerDetailsEmail ?? sessionEmail ?? customerObjectEmail ?? null;
}
