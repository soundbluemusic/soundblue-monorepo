import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display home page with artist info', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sound Blue');
    await expect(page.locator('.home-page')).toBeVisible();
  });

  test('should navigate to privacy page', async ({ page }) => {
    await page.click('a[href="/privacy"]');
    await expect(page).toHaveURL('/privacy');
    await expect(page.locator('h1')).toContainText(/Privacy|개인정보/);
  });

  test('should navigate to terms page', async ({ page }) => {
    await page.click('a[href="/terms"]');
    await expect(page).toHaveURL('/terms');
    await expect(page.locator('h1')).toContainText(/Terms|이용약관/);
  });

  test('should navigate to license page', async ({ page }) => {
    await page.click('a[href="/license"]');
    await expect(page).toHaveURL('/license');
    await expect(page.locator('h1')).toContainText(/License|라이선스/);
  });

  test('should navigate to sitemap page', async ({ page }) => {
    await page.click('a[href="/sitemap"]');
    await expect(page).toHaveURL('/sitemap');
    await expect(page.locator('h1')).toContainText(/Sitemap|사이트맵/);
  });

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route');
    await expect(page.locator('.not-found-code')).toContainText('404');
  });
});

test.describe('Korean Routes', () => {
  test('should navigate to Korean home page', async ({ page }) => {
    await page.goto('/ko');
    await expect(page.locator('h1')).toContainText('Sound Blue');
  });

  test('should navigate to Korean privacy page', async ({ page }) => {
    await page.goto('/ko/privacy');
    await expect(page.locator('h1')).toContainText('개인정보처리방침');
  });

  test('should navigate to Korean license page', async ({ page }) => {
    await page.goto('/ko/license');
    await expect(page.locator('h1')).toContainText('음원 라이선스');
  });
});

test.describe('Language Toggle', () => {
  test('should toggle between Korean and English', async ({ page }) => {
    await page.goto('/');

    // Find the language toggle button
    const toggle = page.locator('.header-lang-btn');
    await expect(toggle).toBeVisible();

    // Click to switch to Korean
    await toggle.click();
    await expect(page).toHaveURL('/ko');

    // Click again to switch back to English
    await toggle.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark theme', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('.header-control-btn').first();
    await expect(toggle).toBeVisible();

    // Get initial theme
    const initialTheme = await page.locator('html').getAttribute('data-theme');

    // Click to toggle theme
    await toggle.click();

    // Theme should change
    const newTheme = await page.locator('html').getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });
});

test.describe('Sidebar', () => {
  test('should show sidebar on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('should hide sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toBeVisible();
  });
});

test.describe('Bottom Navigation', () => {
  test('should show bottom nav on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).toBeVisible();
  });

  test('should hide bottom nav on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).not.toBeVisible();
  });
});
