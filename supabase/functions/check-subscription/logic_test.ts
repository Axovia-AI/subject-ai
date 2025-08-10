import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { determineTier, toIsoFromUnixSeconds } from "./logic.ts";

Deno.test("determineTier maps cents to tiers", () => {
  assertEquals(determineTier(undefined), null);
  assertEquals(determineTier(null as unknown as number), null);
  assertEquals(determineTier(0), null);
  assertEquals(determineTier(999), "Basic");
  assertEquals(determineTier(1000), "Premium");
  assertEquals(determineTier(1999), "Premium");
  assertEquals(determineTier(2000), "Enterprise");
});

Deno.test("toIsoFromUnixSeconds handles null/invalid and converts properly", () => {
  assertEquals(toIsoFromUnixSeconds(undefined), null);
  assertEquals(toIsoFromUnixSeconds(null as unknown as number), null);
  assertEquals(toIsoFromUnixSeconds(0), null);
  const ts = 1_700_000_000; // fixed value for determinism
  const iso = toIsoFromUnixSeconds(ts)!;
  // Round-trip check: parse to date and back to seconds (approx)
  const back = Math.floor(new Date(iso).getTime() / 1000);
  assertEquals(back, ts);
});
