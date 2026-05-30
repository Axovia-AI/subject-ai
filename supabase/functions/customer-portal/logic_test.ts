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

Deno.test("buildReturnUrl rejects non-localhost external origins to prevent open redirect", () => {
  // An attacker could send Origin: http://evil.com to redirect users to a malicious site
  // We should only allow origins that are localhost or match our expected domains
  const url = buildReturnUrl("http://evil.com", "/dashboard");
  // Should fallback to localhost since evil.com is not a trusted domain
  assertEquals(url, "http://localhost:3000/dashboard");
});

Deno.test("buildReturnUrl accepts known safe production domains", () => {
  const url = buildReturnUrl("https://subjectai.com", "/dashboard");
  assertEquals(url, "https://subjectai.com/dashboard");

  const vercelUrl = buildReturnUrl("https://subject-ai.vercel.app", "/dashboard");
  assertEquals(vercelUrl, "https://subject-ai.vercel.app/dashboard");
});
