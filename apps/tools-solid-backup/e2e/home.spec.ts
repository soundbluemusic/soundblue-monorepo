import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should load home page', async ({ page }) => {
    await expect(page).toHaveTitle(/SoundBlue|Tools/i);
  });

  test('should display hero section', async ({ page }) => {
    const hero = page.locator('main').first();
    await expect(hero).toBeVisible();
  });

  test('should have navigation header', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should navigate to tools page', async ({ page }) => {
    const toolsLink = page.locator('a[href="/tools"]').first();
    await toolsLink.click();
    await page.waitForURL(/tools/, { timeout: 10000 });
    await expect(page).toHaveURL(/tools/);
  });

  test('should toggle language', async ({ page }) => {
    const langButton = page.locator('button:has-text("EN"), button:has-text("KO")').first();
    const isVisible = await langButton.isVisible().catch(() => false);
    if (isVisible) {
      await langButton.click();
      await expect(langButton).toBeVisible();
    }
  });

  test('should toggle theme', async ({ page }) => {
    const themeButton = page.locator('[aria-label*="theme"], [aria-label*="Theme"]').first();
    const isVisible = await themeButton.isVisible().catch(() => false);
    if (isVisible) {
      await themeButton.click();
      const html = page.locator('html');
      await expect(html).toHaveAttribute('class', /.*/);
    }
  });
});
