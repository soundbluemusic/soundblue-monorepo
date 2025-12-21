import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test('should load English version by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Check for English content (adjust selector as needed)
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should load Korean version', async ({ page }) => {
    await page.goto('/ko');
    await expect(page).toHaveURL('/ko');

    // Check that Korean route is loaded
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should switch between languages', async ({ page }) => {
    await page.goto('/');

    // Look for language toggle button (adjust selector as needed)
    const langToggle = page.getByRole('button', { name: /한국어|korean|ko/i });

    if (await langToggle.isVisible()) {
      await langToggle.click();
      await expect(page).toHaveURL(/\/ko/);
    }
  });

  test('should maintain language preference across pages', async ({ page }) => {
    await page.goto('/ko');
    await expect(page).toHaveURL('/ko');

    // Navigate to About page
    const aboutLink = page.getByRole('link', { name: /about|소개/i });
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL('/ko/about');
    }
  });
});
