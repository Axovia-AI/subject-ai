import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { resolvePriceIdFromEnv } from "./logic.ts";

Deno.test("resolvePriceIdFromEnv returns null when map missing", () => {
  // Clear env for this test run
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    Deno.env.delete("STRIPE_PRICE_MAP");
    assertEquals(resolvePriceIdFromEnv("Premium"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original);
  }
});

Deno.test("resolvePriceIdFromEnv resolves price id from plan name", () => {
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    Deno.env.set("STRIPE_PRICE_MAP", JSON.stringify({ "SubjectAI Premium": "price_123", "Basic": "price_basic" }));
    assertEquals(resolvePriceIdFromEnv("SubjectAI Premium"), "price_123");
    assertEquals(resolvePriceIdFromEnv("Basic"), "price_basic");
    assertEquals(resolvePriceIdFromEnv("Nonexistent"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original); else Deno.env.delete("STRIPE_PRICE_MAP");
  }
});
