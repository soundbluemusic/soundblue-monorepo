import { expect, test } from '@playwright/test';

/**
 * Advanced SEO Tests
 *
 * 검증 항목:
 * - Open Graph 이미지 크기 (width, height)
 * - Schema.org JSON-LD 구조화된 데이터
 * - Twitter Card 완전성
 * - Canonical URL 정확성
 * - 언어별 hreflang 태그
 */

/** Type for JSON-LD structured data */
interface JsonLdData {
  '@context'?: string;
  '@type'?: string;
  name?: string;
  url?: string;
  description?: string;
  logo?: string;
  sameAs?: string[];
  [key: string]: unknown;
}

test.describe('Advanced SEO - Open Graph', () => {
  const languages = ['', '/ko'];

  test.describe('Open Graph 이미지 크기', () => {
    for (const lang of languages) {
      test(`${lang || '/'}에서 OG 이미지 width/height 포함`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
        expect(ogImage, `${lang}/: og:image missing`).toBeDefined();

        const ogImageWidth = await page.getAttribute('meta[property="og:image:width"]', 'content');
        const ogImageHeight = await page.getAttribute(
          'meta[property="og:image:height"]',
          'content',
        );

        expect(ogImageWidth, `${lang}/: og:image:width missing`).toBeDefined();
        expect(ogImageHeight, `${lang}/: og:image:height missing`).toBeDefined();

        // 숫자 검증
        expect(Number(ogImageWidth)).toBeGreaterThan(0);
        expect(Number(ogImageHeight)).toBeGreaterThan(0);
      });

      test(`${lang || '/'}에서 OG 이미지 권장 크기 (1200x630+)`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogImageWidth = await page.getAttribute('meta[property="og:image:width"]', 'content');
        const ogImageHeight = await page.getAttribute(
          'meta[property="og:image:height"]',
          'content',
        );

        const width = Number(ogImageWidth);
        const height = Number(ogImageHeight);

        // Facebook/Twitter 권장: 1200x630 이상
        expect(width, `${lang}/: OG image width should be at least 1200px`).toBeGreaterThanOrEqual(
          1200,
        );
        expect(height, `${lang}/: OG image height should be at least 630px`).toBeGreaterThanOrEqual(
          630,
        );

        // 가로세로 비율 검증 (약 1.91:1)
        const ratio = width / height;
        expect(ratio, `${lang}/: OG image aspect ratio should be ~1.91:1`).toBeGreaterThan(1.5);
        expect(ratio).toBeLessThan(2.5);
      });

      test(`${lang || '/'}에서 OG 이미지 type 지정`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogImageType = await page.getAttribute('meta[property="og:image:type"]', 'content');

        if (ogImageType) {
          expect(ogImageType).toMatch(/image\/(jpeg|jpg|png|webp)/);
        }
      });

      test(`${lang || '/'}에서 OG 이미지 alt 텍스트`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogImageAlt = await page.getAttribute('meta[property="og:image:alt"]', 'content');

        if (ogImageAlt) {
          expect(ogImageAlt.length).toBeGreaterThan(0);
          expect(ogImageAlt.length).toBeLessThanOrEqual(200);
        }
      });
    }
  });

  test.describe('Open Graph 기타 속성', () => {
    test('og:site_name 존재', async ({ page }) => {
      await page.goto('/');

      const ogSiteName = await page.getAttribute('meta[property="og:site_name"]', 'content');

      if (ogSiteName) {
        expect(ogSiteName).toContain('Sound Blue');
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

    test('og:locale:alternate 태그로 다른 언어 명시', async ({ page }) => {
      await page.goto('/');

      const alternates = await page.$$('meta[property="og:locale:alternate"]');

      if (alternates.length > 0) {
        const koAlternate = await alternates[0]?.getAttribute('content');
        expect(koAlternate).toMatch(/ko_KR|ko/);
      }
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

  test('WebSite 타입의 필수 속성', async ({ page }) => {
    await page.goto('/');

    const jsonLdScript = await page.locator('script[type="application/ld+json"]').first();
    const content = await jsonLdScript.textContent();
    const jsonLd = JSON.parse(content || '{}');

    if (jsonLd['@type'] === 'WebSite') {
      expect(jsonLd.name, 'WebSite must have name').toBeDefined();
      expect(jsonLd.url, 'WebSite must have url').toBeDefined();

      if (jsonLd.description) {
        expect(jsonLd.description.length).toBeGreaterThan(0);
      }
    }
  });

  test('Organization 타입의 필수 속성 (있는 경우)', async ({ page }) => {
    await page.goto('/');

    const jsonLdScripts = await page.$$('script[type="application/ld+json"]');

    for (const script of jsonLdScripts) {
      const content = await script.textContent();
      const jsonLd = JSON.parse(content || '{}');

      if (jsonLd['@type'] === 'Organization') {
        expect(jsonLd.name, 'Organization must have name').toBeDefined();
        expect(jsonLd.url, 'Organization must have url').toBeDefined();

        if (jsonLd.logo) {
          expect(jsonLd.logo).toBeDefined();
        }

        if (jsonLd.sameAs) {
          expect(Array.isArray(jsonLd.sameAs)).toBe(true);
        }
      }
    }
  });

  test('MusicGroup 타입의 속성 (음악 관련 사이트)', async ({ page }) => {
    await page.goto('/');

    const jsonLdScripts = await page.$$('script[type="application/ld+json"]');

    for (const script of jsonLdScripts) {
      const content = await script.textContent();
      const jsonLd = JSON.parse(content || '{}');

      if (jsonLd['@type'] === 'MusicGroup') {
        expect(jsonLd.name).toBeDefined();
        expect(jsonLd.genre).toBeDefined();

        if (jsonLd.member) {
          expect(Array.isArray(jsonLd.member) || typeof jsonLd.member === 'object').toBe(true);
        }
      }
    }
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

  test('Twitter 이미지 크기 (선택사항)', async ({ page }) => {
    await page.goto('/');

    const twitterImageWidth = await page.getAttribute(
      'meta[name="twitter:image:width"]',
      'content',
    );
    const twitterImageHeight = await page.getAttribute(
      'meta[name="twitter:image:height"]',
      'content',
    );

    if (twitterImageWidth && twitterImageHeight) {
      const width = Number(twitterImageWidth);
      const height = Number(twitterImageHeight);

      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);

      // Twitter 권장: 최소 300x157
      expect(width).toBeGreaterThanOrEqual(300);
      expect(height).toBeGreaterThanOrEqual(157);
    }
  });

  test('Twitter 사이트 계정 (@username)', async ({ page }) => {
    await page.goto('/');

    const twitterSite = await page.getAttribute('meta[name="twitter:site"]', 'content');

    if (twitterSite) {
      expect(twitterSite).toMatch(/^@/);
    }
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

    expect(canonical, 'Canonical must include domain').toContain('soundbluemusic.com');
  });

  test('언어별 Canonical URL 정확성', async ({ page }) => {
    await page.goto('/');
    const enCanonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(enCanonical).toMatch(/soundbluemusic\.com\/?$/);

    await page.goto('/ko');
    const koCanonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(koCanonical).toMatch(/soundbluemusic\.com\/ko\/?$/);
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

  test('각 hreflang URL이 올바른 언어 경로', async ({ page }) => {
    await page.goto('/');

    const enTag = await page.$('link[rel="alternate"][hreflang="en"]');
    const koTag = await page.$('link[rel="alternate"][hreflang="ko"]');

    const enHref = await enTag?.getAttribute('href');
    const koHref = await koTag?.getAttribute('href');

    expect(enHref).toMatch(/soundbluemusic\.com\/?$/);
    expect(koHref).toMatch(/soundbluemusic\.com\/ko/);
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

  test('theme-color 메타 태그 존재 (PWA)', async ({ page }) => {
    await page.goto('/');

    const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content');

    if (themeColor) {
      // 유효한 색상 값 (hex, rgb 등)
      expect(themeColor).toMatch(/^#[0-9a-fA-F]{3,6}$|^rgb/);
    }
  });

  test('manifest 링크 존재 (PWA)', async ({ page }) => {
    await page.goto('/');

    const manifest = await page.$('link[rel="manifest"]');
    expect(manifest, 'Manifest link missing').not.toBeNull();

    const manifestHref = await manifest?.getAttribute('href');
    expect(manifestHref).toMatch(/\.webmanifest|\.json$/);
  });

  test('Apple touch icon 존재', async ({ page }) => {
    await page.goto('/');

    const appleTouchIcon = await page.$('link[rel="apple-touch-icon"]');
    expect(appleTouchIcon).not.toBeNull();
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
