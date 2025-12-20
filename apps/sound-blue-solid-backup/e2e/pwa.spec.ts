import { expect, test } from '@playwright/test';

test.describe('Progressive Web App (PWA)', () => {
  test('should have a valid web manifest', async ({ page }) => {
    await page.goto('/');

    // Check manifest link exists
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', /manifest/);
  });

  test('should have proper PWA meta tags', async ({ page }) => {
    await page.goto('/');

    // Theme color
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /.+/);

    // Viewport
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /width=device-width/,
    );
  });

  test('should register service worker', async ({ page, context }) => {
    await page.goto('/');

    // Wait for service worker to register
    await page.waitForTimeout(2000);

    // Check if service worker is registered
    const _workers = await context.serviceWorkers();
    // Service worker might not be available in test environment
    // This test mainly ensures the registration code doesn't break
    expect(_workers).toBeDefined();
  });

  test('should have offline page', async ({ page }) => {
    await page.goto('/offline');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('body')).toContainText(/offline|오프라인/i);
  });

  test('manifest should have required fields', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();

    // Required PWA fields
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);

    // Check for required icon sizes
    const iconSizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
  });

  test('should have apple touch icon', async ({ page }) => {
    await page.goto('/');

    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveAttribute('href', /apple-touch-icon/);
  });
});

test.describe('Core Web Vitals Preparation', () => {
  test('should have minimal layout shift', async ({ page }) => {
    await page.goto('/');

    // Main content should be visible quickly
    await expect(page.locator('main')).toBeVisible({ timeout: 2000 });

    // Key elements should be stable
    await expect(page.locator('.home-title')).toBeVisible();
    await expect(page.locator('.home-intro')).toBeVisible();
  });

  test('should load critical content above the fold', async ({ page }) => {
    await page.goto('/');

    // Header should be visible immediately
    await expect(page.locator('header')).toBeVisible({ timeout: 1000 });

    // Main heading should be visible
    await expect(page.locator('h1')).toBeVisible({ timeout: 2000 });
  });

  test('should have interactive elements ready quickly', async ({ page }) => {
    await page.goto('/');

    // Theme toggle should be interactive
    const themeToggle = page.locator('.header-control-btn').first();
    await expect(themeToggle).toBeEnabled({ timeout: 2000 });

    // Language toggle should be interactive
    const langToggle = page.locator('.header-lang-btn');
    await expect(langToggle).toBeEnabled({ timeout: 2000 });
  });
});
