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

Deno.test("resolvePriceIdFromEnv returns null on invalid JSON map", () => {
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    Deno.env.set("STRIPE_PRICE_MAP", "not-json");
    assertEquals(resolvePriceIdFromEnv("Starter:monthly"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original); else Deno.env.delete("STRIPE_PRICE_MAP");
  }
});

Deno.test("resolvePriceIdFromEnv returns null for missing or unknown planName", () => {
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    Deno.env.set("STRIPE_PRICE_MAP", JSON.stringify({ "Basic": "price_basic" }));
    // @ts-expect-error testing undefined
    assertEquals(resolvePriceIdFromEnv(undefined), null);
    assertEquals(resolvePriceIdFromEnv("" as unknown as string), null);
    assertEquals(resolvePriceIdFromEnv("Unknown"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original); else Deno.env.delete("STRIPE_PRICE_MAP");
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

Deno.test("resolvePriceIdFromEnv supports monthly/annual plan keys", () => {
  const original = Deno.env.get("STRIPE_PRICE_MAP");
  try {
    const map = {
      "Starter:monthly": "price_month_starter",
      "Starter:annual": "price_year_starter",
      "Professional:monthly": "price_month_pro",
      "Professional:annual": "price_year_pro"
    };
    Deno.env.set("STRIPE_PRICE_MAP", JSON.stringify(map));
    assertEquals(resolvePriceIdFromEnv("Starter:monthly"), "price_month_starter");
    assertEquals(resolvePriceIdFromEnv("Starter:annual"), "price_year_starter");
    assertEquals(resolvePriceIdFromEnv("Professional:monthly"), "price_month_pro");
    assertEquals(resolvePriceIdFromEnv("Professional:annual"), "price_year_pro");
    assertEquals(resolvePriceIdFromEnv("Enterprise:monthly"), null);
  } finally {
    if (original) Deno.env.set("STRIPE_PRICE_MAP", original); else Deno.env.delete("STRIPE_PRICE_MAP");
  }
});
