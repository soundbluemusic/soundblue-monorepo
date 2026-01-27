import { expect, test } from '@playwright/test';

/**
 * SEO 메타태그 테스트
 * 검색엔진 최적화에 필요한 메타태그들이 올바르게 설정되어 있는지 확인합니다.
 */

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000', expectedTitle: 'Sound Blue' },
  { name: 'tools', url: 'http://localhost:3001', expectedTitle: 'Tools' },
  { name: 'dialogue', url: 'http://localhost:3002', expectedTitle: 'Dialogue' },
];

for (const app of apps) {
  test.describe(`${app.name} SEO 메타태그`, () => {
    test('필수 메타태그 존재', async ({ page }) => {
      await page.goto(app.url);

      // title 태그
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(60); // 권장 길이

      // description 메타태그
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveCount(1);
      const descContent = await description.getAttribute('content');
      expect(descContent).toBeTruthy();
      expect(descContent!.length).toBeGreaterThan(50);
      expect(descContent!.length).toBeLessThanOrEqual(160); // 권장 길이

      // viewport 메타태그
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);

      // charset
      const charset = page.locator('meta[charset]');
      await expect(charset).toHaveCount(1);
    });

    test('Open Graph 메타태그', async ({ page }) => {
      await page.goto(app.url);

      // og:title
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveCount(1);

      // og:description
      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toHaveCount(1);

      // og:image
      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveCount(1);
      const imageUrl = await ogImage.getAttribute('content');
      expect(imageUrl).toMatch(/^https?:\/\//);

      // og:url
      const ogUrl = page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveCount(1);

      // og:type
      const ogType = page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveCount(1);
    });

    test('Twitter Card 메타태그', async ({ page }) => {
      await page.goto(app.url);

      // twitter:card
      const twitterCard = page.locator('meta[name="twitter:card"]');
      await expect(twitterCard).toHaveCount(1);
      const cardType = await twitterCard.getAttribute('content');
      expect(['summary', 'summary_large_image', 'app', 'player']).toContain(cardType);

      // twitter:title
      const twitterTitle = page.locator('meta[name="twitter:title"]');
      await expect(twitterTitle).toHaveCount(1);

      // twitter:description
      const twitterDescription = page.locator('meta[name="twitter:description"]');
      await expect(twitterDescription).toHaveCount(1);
    });

    test('Canonical URL', async ({ page }) => {
      await page.goto(app.url);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const href = await canonical.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
    });

    test('언어 설정', async ({ page }) => {
      await page.goto(app.url);

      // html lang 속성
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBeTruthy();
      expect(['en', 'ko', 'en-US', 'ko-KR']).toContain(htmlLang);
    });

    test('robots 메타태그 (인덱싱 허용)', async ({ page }) => {
      await page.goto(app.url);

      const robots = page.locator('meta[name="robots"]');
      const count = await robots.count();

      if (count > 0) {
        const content = await robots.getAttribute('content');
        // noindex가 없어야 함 (인덱싱 차단이 아닌 경우)
        expect(content).not.toContain('noindex');
      }
      // robots 메타태그가 없으면 기본적으로 인덱싱 허용
    });

    test('구조화된 데이터 (JSON-LD)', async ({ page }) => {
      await page.goto(app.url);

      const jsonLd = page.locator('script[type="application/ld+json"]');
      const count = await jsonLd.count();

      if (count > 0) {
        const content = await jsonLd.first().textContent();
        expect(() => JSON.parse(content!)).not.toThrow();

        const data = JSON.parse(content!);
        expect(data['@context']).toBe('https://schema.org');
        expect(data['@type']).toBeTruthy();
      }
    });
  });
}
