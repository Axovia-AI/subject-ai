import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildReturnUrl } from "./logic.ts";

Deno.test("buildReturnUrl uses origin when valid and joins path once", () => {
  const url = buildReturnUrl("https://example.com", "/dashboard");
  assertEquals(url, "https://example.com/dashboard");
});

Deno.test("buildReturnUrl falls back to localhost when origin missing", () => {
  const url = buildReturnUrl(undefined, "/dashboard");
  assertEquals(url, "http://localhost:3000/dashboard");
});

Deno.test("buildReturnUrl normalizes extra slash", () => {
  const url = buildReturnUrl("https://example.com/", "dashboard");
  assertEquals(url, "https://example.com/dashboard");
});
