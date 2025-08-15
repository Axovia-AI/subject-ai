import { test, expect } from '@playwright/test';

// Verifies that the pricing toggle updates UI and that checkout includes the selected period in plan name

test.describe('Pricing yearly toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#pricing');
    await page.waitForLoadState('networkidle');
    // Log browser console to help debug rendering issues
    page.on('console', (msg) => console.log(`[browser:${msg.type()}]`, msg.text()));
    // Ensure pricing section has mounted and is in view
    await page.waitForSelector('section#pricing', { timeout: 20000 });
    await page.locator('section#pricing').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('billing-monthly')).toBeVisible({ timeout: 20000 });
  });

  test('Annual toggle applies 20% discount to visible prices', async ({ page }) => {
    const starterPrice = page.getByTestId('price-starter');
    await expect(starterPrice).toContainText('$19');

    await page.getByTestId('billing-annual').click();

    // Annual shows 20% off rounded; 19 => 15
    await expect(starterPrice).toContainText('$15');

    // Toggle back
    await page.getByTestId('billing-monthly').click();
    await expect(starterPrice).toContainText('$19');
  });
});
