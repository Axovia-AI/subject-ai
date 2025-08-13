import { test, expect } from '@playwright/test';

// Helper: skip auth-redirect test in CI when VITE_E2E build bypasses auth
const isE2EBypass = (process.env.VITE_E2E === 'true');

// Assumes dev server or preview serves '/' with Pricing section and E2E bypass enabled in CI
// Verifies that annual toggle changes the checkout payload to "<Plan>:annual" and request is made
test('annual billing sends <plan>:annual to create-checkout and opens URL', async ({ page }) => {
  // Intercept checkout call and validate body
  let observedPlanName: string | undefined;
  const checkoutUrl = 'https://example.com/checkout-annual';
  await page.route('**/functions/v1/create-checkout', async (route) => {
    const req = route.request();
    try {
      const body = JSON.parse(req.postData() || '{}');
      observedPlanName = body?.planName;
    } catch { /* ignore */ }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: checkoutUrl })
    });
  });

  await page.goto('/#pricing');
  // Ensure pricing controls are visible before interacting (more stable than heading roles)
  await expect(page.getByTestId('billing-monthly')).toBeVisible({ timeout: 20000 });

  // Switch to annual
  await page.getByTestId('billing-annual').click();

  // Click a known non-popular plan button (Starter)
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Get Started with Starter' }).click(),
  ]);

  // Assert payload includes annual suffix
  expect(observedPlanName).toBeDefined();
  expect(observedPlanName).toContain(':annual');

  // Assert the checkout popup navigates to the fulfilled URL
  await popup.waitForLoadState('domcontentloaded');
  expect(popup.url()).toBe(checkoutUrl);
  await popup.close();
});

// Verifies monthly (default) path sends "<Plan>:monthly" and opens URL
test('monthly billing sends <plan>:monthly to create-checkout and opens URL', async ({ page }) => {
  let observedPlanName: string | undefined;
  const checkoutUrl = 'https://example.com/checkout-monthly';
  await page.route('**/functions/v1/create-checkout', async (route) => {
    const req = route.request();
    try {
      const body = JSON.parse(req.postData() || '{}');
      observedPlanName = body?.planName;
    } catch { /* ignore */ }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: checkoutUrl })
    });
  });

  await page.goto('/#pricing');
  // Ensure pricing controls are visible before interacting (more stable than heading roles)
  await expect(page.getByTestId('billing-monthly')).toBeVisible({ timeout: 20000 });
  // Ensure monthly is selected
  await page.getByTestId('billing-monthly').click();

  // Click Starter CTA
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Get Started with Starter' }).click(),
  ]);

  // Assert payload includes monthly suffix
  expect(observedPlanName).toBeDefined();
  expect(observedPlanName).toContain(':monthly');

  // Assert the checkout popup navigates to the fulfilled URL
  await popup.waitForLoadState('domcontentloaded');
  expect(popup.url()).toBe(checkoutUrl);
});

// Validate unauthenticated users are redirected to /auth when not in E2E bypass
// Skipped when VITE_E2E=true (CI build)
(isE2EBypass ? test.skip : test)('unauthenticated CTA redirects to /auth when not in E2E bypass', async ({ page }) => {
  await page.goto('/');
  // Ensure monthly selected to avoid any surprises
  await page.getByTestId('billing-monthly').click();

  // Click Starter CTA
  const [nav] = await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: 'Get Started with Starter' }).click(),
  ]);

  expect(page.url()).toContain('/auth');
});
