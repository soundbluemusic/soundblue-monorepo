import { expect, test } from '@playwright/test';

// Increase timeout for navigation tests
test.setTimeout(60000);

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Start at home
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('/');

    // Go to tools
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/tools/);

    // Go to privacy
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/privacy/);

    // Go to terms
    await page.goto('/terms', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/terms/);

    // Go to sitemap
    await page.goto('/sitemap', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/sitemap/);
  });

  test('should handle 404 gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345', { waitUntil: 'domcontentloaded' });
    // Should either show 404 or redirect
    expect(response?.status()).toBeLessThan(500);
  });

  test('should support Korean language routes', async ({ page }) => {
    await page.goto('/ko', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/ko/);

    await page.goto('/ko/tools', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/ko\/tools/);
  });

  test('should support English language routes', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/en/);

    await page.goto('/en/tools', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/en\/tools/);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
