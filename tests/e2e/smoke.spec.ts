import { test, expect } from '@playwright/test';

// Basic homepage smoke test
// Assumes app runs via `npm run e2e:serve` on port 5174 (see playwright.config.ts)

test('home page loads and shows key sections', async ({ page }) => {
  await page.goto('/');

  // Header exists
  await expect(page.getByRole('banner')).toBeVisible({ timeout: 10000 });

  // Pricing section appears (heuristic)
  await expect(page.getByText(/pricing/i)).toBeVisible();

  // Footer exists
  await expect(page.getByRole('contentinfo')).toBeVisible();
});
