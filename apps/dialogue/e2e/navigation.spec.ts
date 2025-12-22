import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to About page', async ({ page }) => {
    await page.goto('/');

    // Click About link (adjust selector as needed)
    const aboutLink = page.getByRole('link', { name: /about/i });
    await aboutLink.click();

    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText(/about/i);
  });

  test('should navigate back to home from About', async ({ page }) => {
    await page.goto('/about');

    // Click home/logo link
    const homeLink = page.getByRole('link', { name: /home|dialogue/i }).first();
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });

  test('should have working navigation for both languages', async ({ page }) => {
    // Test English navigation
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Test Korean navigation
    await page.goto('/ko');
    await expect(page).toHaveURL('/ko');

    await page.goto('/ko/about');
    await expect(page).toHaveURL('/ko/about');
  });
});
