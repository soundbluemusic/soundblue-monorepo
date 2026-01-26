import { expect, test } from '@playwright/test';

/**
 * Tools App - SEO Meta Tags Tests
 *
 * 검증 항목:
 * - 기본 메타 태그 (title, description, canonical)
 * - Open Graph 태그
 * - Twitter Card
 * - hreflang 다국어 링크
 * - JSON-LD 구조화된 데이터
 */

test.describe('SEO Meta Tags', () => {
  test('home page should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Title
    await expect(page).toHaveTitle(/Tools|도구/i);

    // Meta description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);

    // Canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /tools\.soundbluemusic\.com/);

    // OG tags
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');

    // Twitter card
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      /summary|summary_large_image/,
    );
  });

  test('should have hreflang alternate links', async ({ page }) => {
    await page.goto('/');

    // English alternate
    const enLink = page.locator('link[hreflang="en"]');
    await expect(enLink).toHaveAttribute('href', /tools\.soundbluemusic\.com/);

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
    await expect(page).toHaveTitle(/도구|Tools/i);

    // OG locale should be Korean
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'ko_KR');
  });

  test('tool pages should have proper meta tags', async ({ page }) => {
    const toolPages = ['/translator', '/metronome', '/qr-generator'];

    for (const toolPath of toolPages) {
      await page.goto(toolPath);

      // Each tool page should have title
      const title = await page.title();
      expect(title.length, `${toolPath} should have title`).toBeGreaterThan(0);

      // Each tool page should have description
      const description = await page.getAttribute('meta[name="description"]', 'content');
      expect(description, `${toolPath} should have description`).toBeTruthy();
    }
  });
});

test.describe('SEO Content Structure', () => {
  test('each page should have exactly one h1', async ({ page }) => {
    const pages = ['/', '/privacy', '/terms', '/sitemap'];

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
      { path: '/sitemap', expected: /Sitemap|사이트맵/ },
    ];

    for (const { path, expected } of pageTests) {
      await page.goto(path);
      await expect(page).toHaveTitle(expected);
    }
  });

  test('tool pages should have h1 with tool name', async ({ page }) => {
    const tools = [
      { path: '/translator', expected: /Translator|번역기/i },
      { path: '/metronome', expected: /Metronome|메트로놈/i },
      { path: '/qr-generator', expected: /QR/i },
    ];

    for (const { path, expected } of tools) {
      await page.goto(path);
      const h1 = page.locator('h1');
      await expect(h1).toContainText(expected);
    }
  });
});

test.describe('Performance', () => {
  test('should load critical resources quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    // DOM should be ready within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have render-blocking resources', async ({ page }) => {
    await page.goto('/');

    // Main content should be visible immediately
    await expect(page.locator('main')).toBeVisible({ timeout: 3000 });
  });
});
