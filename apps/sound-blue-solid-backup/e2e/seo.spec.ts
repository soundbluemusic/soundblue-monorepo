import { expect, test } from '@playwright/test';

test.describe('SEO Meta Tags', () => {
  test('home page should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Title
    await expect(page).toHaveTitle(/Sound Blue/);

    // Meta description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /music|artist|producer/i);

    // Canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /soundbluemusic\.com/);

    // OG tags
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image/);

    // Twitter card
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
  });

  test('should have hreflang alternate links', async ({ page }) => {
    await page.goto('/');

    // English alternate
    const enLink = page.locator('link[hreflang="en"]');
    await expect(enLink).toHaveAttribute('href', /soundbluemusic\.com/);

    // Korean alternate
    const koLink = page.locator('link[hreflang="ko"]');
    await expect(koLink).toHaveAttribute('href', /\/ko/);

    // x-default
    const defaultLink = page.locator('link[hreflang="x-default"]');
    await expect(defaultLink).toHaveAttribute('href', /.+/);
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    await page.goto('/');

    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify JSON-LD content is valid JSON
    const firstScript = await jsonLdScripts.first().textContent();
    expect(() => JSON.parse(firstScript || '{}')).not.toThrow();

    const jsonLd = JSON.parse(firstScript || '{}');
    expect(jsonLd['@context']).toBe('https://schema.org');
  });

  test('Korean pages should have Korean meta tags', async ({ page }) => {
    await page.goto('/ko');

    // Title should be in Korean context
    await expect(page).toHaveTitle(/Sound Blue/);

    // OG locale should be Korean
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'ko_KR');
  });
});

test.describe('SEO Content Structure', () => {
  test('each page should have exactly one h1', async ({ page }) => {
    const pages = ['/', '/privacy', '/terms', '/license', '/sitemap', '/sound-recording'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Page ${pagePath} should have exactly one h1`).toBe(1);
    }
  });

  test('pages should have descriptive titles', async ({ page }) => {
    const pageTests = [
      { path: '/privacy', expected: /Privacy|개인정보/ },
      { path: '/terms', expected: /Terms|이용약관/ },
      { path: '/license', expected: /License|라이선스/ },
      { path: '/sitemap', expected: /Sitemap|사이트맵/ },
    ];

    for (const { path, expected } of pageTests) {
      await page.goto(path);
      await expect(page).toHaveTitle(expected);
    }
  });
});

test.describe('Performance', () => {
  test('should load critical resources quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // DOM should be ready within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have render-blocking resources', async ({ page }) => {
    await page.goto('/');

    // Main content should be visible immediately
    await expect(page.locator('main')).toBeVisible({ timeout: 2000 });
  });
});
