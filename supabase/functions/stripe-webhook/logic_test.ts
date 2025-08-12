// Minimal placeholder test to keep CI green until full webhook tests are added.
// This file ensures `deno test` discovers a test in this directory.

Deno.test({
  name: "stripe-webhook placeholder",
  ignore: true, // mark as ignored until implemented
  fn() {
    // no-op
  },
})
