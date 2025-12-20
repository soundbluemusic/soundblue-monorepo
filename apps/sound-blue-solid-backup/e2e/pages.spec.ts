import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display artist name and tagline', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.home-title')).toContainText('Sound Blue');
    await expect(page.locator('.home-intro')).toBeVisible();
    await expect(page.locator('.home-description')).toBeVisible();
  });

  test('should have social links', async ({ page }) => {
    await page.goto('/');

    const youtubeLink = page.locator('a[href*="youtube.com"]');
    await expect(youtubeLink).toBeVisible();

    const discographyLink = page.locator('a[href*="soundblue.music"]');
    await expect(discographyLink).toBeVisible();
  });
});

test.describe('Privacy Page', () => {
  test('should display privacy policy content', async ({ page }) => {
    await page.goto('/privacy');

    await expect(page.locator('h1')).toContainText(/Privacy|개인정보/);
    await expect(page.locator('.prose')).toBeVisible();
  });
});

test.describe('Terms Page', () => {
  test('should display terms of service content', async ({ page }) => {
    await page.goto('/terms');

    await expect(page.locator('h1')).toContainText(/Terms|이용약관/);
    await expect(page.locator('.prose')).toBeVisible();
  });
});

test.describe('License Page', () => {
  test('should display license information', async ({ page }) => {
    await page.goto('/license');

    await expect(page.locator('h1')).toContainText(/License|라이선스/);
    await expect(page.locator('.prose')).toBeVisible();
  });

  test('should show copyright notice', async ({ page }) => {
    await page.goto('/license');

    await expect(page.locator('.prose')).toContainText('SoundBlueMusic');
  });
});

test.describe('Sitemap Page', () => {
  test('should display sitemap sections', async ({ page }) => {
    await page.goto('/sitemap');

    await expect(page.locator('h1')).toContainText(/Sitemap|사이트맵/);

    // Should have multiple sections
    const sections = page.locator('h2');
    await expect(sections).toHaveCount(4);
  });

  test('should have working internal links', async ({ page }) => {
    await page.goto('/sitemap');

    // Click on home link
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('404 Page', () => {
  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    await expect(page.locator('.not-found-code')).toContainText('404');
    await expect(page.locator('.not-found-title')).toBeVisible();
  });

  test('should have link back to home', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    const homeButton = page.locator('.not-found a, .not-found button').first();
    await homeButton.click();
    await expect(page).toHaveURL('/');
  });
});
