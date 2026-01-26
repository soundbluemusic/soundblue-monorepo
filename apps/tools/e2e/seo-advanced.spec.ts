import { expect, test } from '@playwright/test';

/**
 * Tools App - Advanced SEO Tests
 *
 * 검증 항목:
 * - Open Graph 이미지 크기 (width, height)
 * - Schema.org JSON-LD 구조화된 데이터
 * - Twitter Card 완전성
 * - Canonical URL 정확성
 * - 언어별 hreflang 태그
 */

interface JsonLdData {
  '@context'?: string;
  '@type'?: string;
  name?: string;
  url?: string;
  description?: string;
  [key: string]: unknown;
}

test.describe('Advanced SEO - Open Graph', () => {
  const languages = ['', '/ko'];

  test.describe('Open Graph 이미지 속성', () => {
    for (const lang of languages) {
      test(`${lang || '/'}에서 OG 이미지 존재`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
        expect(ogImage, `${lang}/: og:image missing`).toBeDefined();
      });

      test(`${lang || '/'}에서 OG 이미지 크기 (있는 경우)`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogImageWidth = await page.getAttribute('meta[property="og:image:width"]', 'content');
        const ogImageHeight = await page.getAttribute(
          'meta[property="og:image:height"]',
          'content',
        );

        if (ogImageWidth && ogImageHeight) {
          const width = Number(ogImageWidth);
          const height = Number(ogImageHeight);

          expect(width).toBeGreaterThan(0);
          expect(height).toBeGreaterThan(0);

          // 권장: 1200x630 이상
          expect(width).toBeGreaterThanOrEqual(600);
          expect(height).toBeGreaterThanOrEqual(300);
        }
      });
    }
  });

  test.describe('Open Graph 기타 속성', () => {
    test('og:site_name 존재', async ({ page }) => {
      await page.goto('/');

      const ogSiteName = await page.getAttribute('meta[property="og:site_name"]', 'content');

      if (ogSiteName) {
        expect(ogSiteName.length).toBeGreaterThan(0);
      }
    });

    test('og:locale 언어별로 설정', async ({ page }) => {
      await page.goto('/');
      const enLocale = await page.getAttribute('meta[property="og:locale"]', 'content');
      expect(enLocale).toMatch(/en_US|en/);

      await page.goto('/ko');
      const koLocale = await page.getAttribute('meta[property="og:locale"]', 'content');
      expect(koLocale).toMatch(/ko_KR|ko/);
    });
  });
});

test.describe('Advanced SEO - Schema.org JSON-LD', () => {
  test('JSON-LD 스크립트 태그 존재', async ({ page }) => {
    await page.goto('/');

    const jsonLdScripts = await page.$$('script[type="application/ld+json"]');
    expect(jsonLdScripts.length, 'No JSON-LD script tags found').toBeGreaterThan(0);
  });

  test('JSON-LD가 유효한 JSON 형식', async ({ page }) => {
    await page.goto('/');

    const jsonLdScripts = await page.$$('script[type="application/ld+json"]');

    for (const script of jsonLdScripts) {
      const content = await script.textContent();

      let parsed: JsonLdData;
      try {
        parsed = JSON.parse(content || '{}') as JsonLdData;
      } catch (e) {
        throw new Error(`Invalid JSON-LD: ${(e as Error).message}`);
      }

      expect(parsed).toBeDefined();
    }
  });

  test('JSON-LD에 @context와 @type 포함', async ({ page }) => {
    await page.goto('/');

    const jsonLdScript = await page.locator('script[type="application/ld+json"]').first();
    const content = await jsonLdScript.textContent();
    const jsonLd = JSON.parse(content || '{}');

    expect(jsonLd['@context'], 'JSON-LD must have @context').toBe('https://schema.org');
    expect(jsonLd['@type'], 'JSON-LD must have @type').toBeDefined();
  });

  test('WebSite 또는 SoftwareApplication 타입', async ({ page }) => {
    await page.goto('/');

    const jsonLdScripts = await page.$$('script[type="application/ld+json"]');

    let hasValidType = false;
    for (const script of jsonLdScripts) {
      const content = await script.textContent();
      const jsonLd = JSON.parse(content || '{}');

      if (
        jsonLd['@type'] === 'WebSite' ||
        jsonLd['@type'] === 'SoftwareApplication' ||
        jsonLd['@type'] === 'WebApplication'
      ) {
        hasValidType = true;
        expect(jsonLd.name).toBeDefined();
        expect(jsonLd.url).toBeDefined();
      }
    }

    expect(hasValidType, 'Must have WebSite or SoftwareApplication type').toBe(true);
  });
});

test.describe('Advanced SEO - Twitter Card', () => {
  test('Twitter Card 타입 설정', async ({ page }) => {
    await page.goto('/');

    const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content');
    expect(twitterCard, 'twitter:card missing').toBeDefined();
    expect(twitterCard).toMatch(/summary|summary_large_image|app|player/);
  });

  test('Twitter Card 필수 메타 태그', async ({ page }) => {
    await page.goto('/');

    const twitterTitle = await page.getAttribute('meta[name="twitter:title"]', 'content');
    const twitterDescription = await page.getAttribute(
      'meta[name="twitter:description"]',
      'content',
    );
    const twitterImage = await page.getAttribute('meta[name="twitter:image"]', 'content');

    expect(
      twitterTitle || twitterDescription || twitterImage,
      'Twitter Card must have at least one meta tag',
    ).toBeTruthy();
  });
});

test.describe('Advanced SEO - Canonical URL', () => {
  test('Canonical URL이 절대 경로 (HTTPS)', async ({ page }) => {
    await page.goto('/');

    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');

    expect(canonical, 'Canonical URL missing').toBeDefined();
    expect(canonical, 'Canonical must be absolute URL with HTTPS').toMatch(/^https:\/\//);
  });

  test('Canonical URL에 도메인 포함', async ({ page }) => {
    await page.goto('/');

    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');

    expect(canonical, 'Canonical must include domain').toContain('tools.soundbluemusic.com');
  });

  test('언어별 Canonical URL 정확성', async ({ page }) => {
    await page.goto('/');
    const enCanonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(enCanonical).toMatch(/tools\.soundbluemusic\.com\/?$/);

    await page.goto('/ko');
    const koCanonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(koCanonical).toMatch(/tools\.soundbluemusic\.com\/ko\/?$/);
  });

  test('Canonical URL에 쿼리 파라미터 없음', async ({ page }) => {
    await page.goto('/');

    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');

    expect(canonical).not.toContain('?');
    expect(canonical).not.toContain('#');
  });
});

test.describe('Advanced SEO - hreflang', () => {
  test('모든 언어에 대한 hreflang 태그', async ({ page }) => {
    await page.goto('/');

    const hreflangTags = await page.$$('link[rel="alternate"][hreflang]');

    expect(hreflangTags.length, 'No hreflang tags found').toBeGreaterThanOrEqual(2);

    const hreflangs = await Promise.all(hreflangTags.map((tag) => tag.getAttribute('hreflang')));

    expect(hreflangs).toContain('en');
    expect(hreflangs).toContain('ko');
  });

  test('x-default hreflang 태그 존재', async ({ page }) => {
    await page.goto('/');

    const xDefault = await page.$('link[rel="alternate"][hreflang="x-default"]');
    expect(xDefault, 'x-default hreflang missing').not.toBeNull();
  });

  test('hreflang URL이 절대 경로', async ({ page }) => {
    await page.goto('/');

    const hreflangTags = await page.$$('link[rel="alternate"][hreflang]');

    for (const tag of hreflangTags) {
      const href = await tag.getAttribute('href');
      expect(href, 'hreflang href must be absolute URL').toMatch(/^https?:\/\//);
    }
  });
});

test.describe('Advanced SEO - 추가 검증', () => {
  test('viewport 메타 태그 존재', async ({ page }) => {
    await page.goto('/');

    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');

    expect(viewport).toBeDefined();
    expect(viewport).toContain('width=device-width');
  });

  test('charset 메타 태그 존재', async ({ page }) => {
    await page.goto('/');

    const charset = await page.$('meta[charset]');
    expect(charset).not.toBeNull();

    const charsetValue = await charset?.getAttribute('charset');
    expect(charsetValue?.toLowerCase()).toBe('utf-8');
  });

  test('manifest 링크 존재 (PWA)', async ({ page }) => {
    await page.goto('/');

    const manifest = await page.$('link[rel="manifest"]');
    expect(manifest, 'Manifest link missing').not.toBeNull();

    const manifestHref = await manifest?.getAttribute('href');
    expect(manifestHref).toMatch(/\.webmanifest|\.json$/);
  });
});

test.describe('Edge Cases', () => {
  test('중복 메타 태그 없음', async ({ page }) => {
    await page.goto('/');

    const metaTags = ['description', 'og:title', 'og:description', 'twitter:card'];

    for (const tag of metaTags) {
      const selector =
        tag.startsWith('og:') || tag.startsWith('twitter:')
          ? `meta[property="${tag}"], meta[name="${tag}"]`
          : `meta[name="${tag}"]`;

      const elements = await page.$$(selector);
      expect(elements.length, `Duplicate ${tag} meta tag`).toBeLessThanOrEqual(1);
    }
  });

  test('모든 필수 메타 태그가 head 안에 있음', async ({ page }) => {
    await page.goto('/');

    const headMetaTags = await page.$$('head meta');
    const bodyMetaTags = await page.$$('body meta');

    expect(headMetaTags.length).toBeGreaterThan(0);
    expect(bodyMetaTags.length, 'Meta tags should be in <head>, not <body>').toBe(0);
  });
});
