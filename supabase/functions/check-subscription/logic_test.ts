import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { toIsoFromUnixSeconds, mapPriceIdToTierFromEnv } from "./logic.ts";

Deno.test("mapPriceIdToTierFromEnv returns null when env missing or priceId not provided", () => {
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    Deno.env.delete("STRIPE_PRICE_MAP");
    assertEquals(mapPriceIdToTierFromEnv(undefined), null);
    assertEquals(mapPriceIdToTierFromEnv("price_123"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original);
  }
});

Deno.test("mapPriceIdToTierFromEnv resolves tier from price id using STRIPE_PRICE_MAP", () => {
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    // Map tiers to price IDs
    Deno.env.set(
      "STRIPE_PRICE_MAP",
      JSON.stringify({ "Basic": "price_basic", "Premium": "price_123", "Enterprise": "price_enterprise" }),
    );
    assertEquals(mapPriceIdToTierFromEnv("price_123"), "Premium");
    assertEquals(mapPriceIdToTierFromEnv("price_basic"), "Basic");
    assertEquals(mapPriceIdToTierFromEnv("price_unknown"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original); else Deno.env.delete("STRIPE_PRICE_MAP");
  }
});

Deno.test("mapPriceIdToTierFromEnv returns null on invalid JSON", () => {
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    Deno.env.set("STRIPE_PRICE_MAP", "not-json");
    assertEquals(mapPriceIdToTierFromEnv("price_123"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original); else Deno.env.delete("STRIPE_PRICE_MAP");
  }
});

Deno.test("toIsoFromUnixSeconds handles null/invalid and converts properly", () => {
  assertEquals(toIsoFromUnixSeconds(undefined), null);
  assertEquals(toIsoFromUnixSeconds(null as unknown as number), null);
  assertEquals(toIsoFromUnixSeconds(0), null);
  const ts = 1_700_000_000; // fixed value for determinism
  const iso = toIsoFromUnixSeconds(ts)!;
  const back = Math.floor(new Date(iso).getTime() / 1000);
  assertEquals(back, ts);
});
