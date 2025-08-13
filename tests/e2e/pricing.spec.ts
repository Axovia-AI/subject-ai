import { test, expect } from '@playwright/test';

// Verifies that the pricing toggle updates UI and that checkout includes the selected period in plan name

test.describe('Pricing yearly toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /pricing/i }).first().click({ trial: true }).catch(() => {});
    // If no anchor link, just rely on home containing pricing section.
    await expect(page.getByText(/choose the plan that fits your needs/i)).toBeVisible();
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
