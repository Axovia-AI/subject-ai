import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  isSubscribed,
  toIsoFromUnixSeconds,
  getFirstPriceId,
  composeIdempotencyKey,
  coalesceEmail,
} from "./logic.ts";

Deno.test("isSubscribed only true for active or trialing", () => {
  assertEquals(isSubscribed("active"), true);
  assertEquals(isSubscribed("trialing"), true);
  assertEquals(isSubscribed("past_due"), false);
  assertEquals(isSubscribed("canceled"), false);
  assertEquals(isSubscribed(undefined), false);
});

Deno.test("toIsoFromUnixSeconds returns null for invalid and converts valid", () => {
  assertEquals(toIsoFromUnixSeconds(undefined), null);
  assertEquals(toIsoFromUnixSeconds(0), null);
  const ts = 1_700_000_000;
  const iso = toIsoFromUnixSeconds(ts)!;
  assertEquals(Math.floor(new Date(iso).getTime() / 1000), ts);
});

Deno.test("getFirstPriceId safely extracts first price id", () => {
  assertEquals(getFirstPriceId(null), null);
  assertEquals(getFirstPriceId({ items: { data: [] } }), null);
  assertEquals(getFirstPriceId({ items: { data: [{ price: { id: "price_123" } }] } }), "price_123");
});

Deno.test("composeIdempotencyKey builds key when both parts provided", () => {
  assertEquals(composeIdempotencyKey(undefined, "evt_1"), null);
  assertEquals(composeIdempotencyKey("checkout.session.completed", undefined), null);
  assertEquals(composeIdempotencyKey("checkout.session.completed", "evt_1"), "checkout.session.completed:evt_1");
});

Deno.test("coalesceEmail picks first non-null candidate", () => {
  assertEquals(coalesceEmail(null, null, null), null);
  assertEquals(coalesceEmail(undefined, "from_session@example.com", null), "from_session@example.com");
  assertEquals(coalesceEmail("from_details@example.com", "from_session@example.com", "from_customer@example.com"), "from_details@example.com");
});
