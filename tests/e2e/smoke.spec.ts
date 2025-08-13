import { test, expect } from '@playwright/test';

// Basic homepage smoke test
// Assumes app runs via `npm run e2e:serve` on port 5174 (see playwright.config.ts)

test('home page loads and shows key sections', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // Root app container is visible
  await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });
});
