import { expect, test } from '@playwright/test';

/**
 * Dialogue App - SEO Meta Length Optimization Tests
 *
 * Google 검색 결과 표시 기준:
 * - Title: 30-60자 (한글 기준 약간 짧게)
 * - Description: 50-160자
 *
 * 검증 항목:
 * - 메타 설명 길이 최적화
 * - 제목 길이 최적화
 * - OG/Twitter 메타 길이
 * - 다국어별 차이 검증
 */

test.describe('SEO Meta Length Optimization', () => {
  const languages = ['', '/ko'];
  const routes = ['/', '/about'];

  test.describe('메타 설명(Description) 길이 검증', () => {
    for (const lang of languages) {
      for (const route of routes) {
        test(`${lang}${route} - 메타 설명 30-200자`, async ({ page }) => {
          await page.goto(`${lang}${route}`);

          const description = await page.getAttribute('meta[name="description"]', 'content');

          expect(description, `${lang}${route}: description missing`).toBeDefined();

          const length = description?.length || 0;

          // 최소 30자 (충분한 정보 제공)
          expect(
            length,
            `${lang}${route}: description too short (${length})`,
          ).toBeGreaterThanOrEqual(30);

          // 최대 200자 (검색 결과 잘림 방지)
          expect(length, `${lang}${route}: description too long (${length})`).toBeLessThanOrEqual(
            200,
          );
        });
      }
    }
  });

  test.describe('제목(Title) 길이 검증', () => {
    for (const lang of languages) {
      for (const route of routes) {
        test(`${lang}${route} - 제목 10-80자`, async ({ page }) => {
          await page.goto(`${lang}${route}`);

          const title = await page.title();

          expect(title, `${lang}${route}: title missing`).toBeDefined();

          const length = title.length;

          // 최소 10자 (의미 있는 제목)
          expect(length, `${lang}${route}: title too short (${length})`).toBeGreaterThanOrEqual(10);

          // 최대 80자 (검색 결과 잘림 방지)
          expect(length, `${lang}${route}: title too long (${length})`).toBeLessThanOrEqual(80);
        });
      }
    }
  });

  test.describe('제목 구조 검증', () => {
    for (const lang of languages) {
      for (const route of routes) {
        test(`${lang}${route} - 브랜드명 포함`, async ({ page }) => {
          await page.goto(`${lang}${route}`);

          const title = await page.title();

          // 브랜드명이나 앱 이름 포함 확인
          expect(title).toMatch(/Dialogue|대화/i);
        });
      }
    }
  });

  test.describe('OG 메타 길이 검증', () => {
    for (const lang of languages) {
      test(`${lang}/ - OG title 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');

        if (ogTitle) {
          // OG title은 95자 이내 권장
          expect(ogTitle.length, `${lang}/: og:title too long`).toBeLessThanOrEqual(95);
        }
      });

      test(`${lang}/ - OG description 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');

        if (ogDescription) {
          // OG description은 250자 이내 권장
          expect(ogDescription.length, `${lang}/: og:description too long`).toBeLessThanOrEqual(
            250,
          );
        }
      });
    }
  });

  test.describe('Twitter Card 메타 길이 검증', () => {
    for (const lang of languages) {
      test(`${lang}/ - Twitter title 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const twitterTitle = await page.getAttribute('meta[name="twitter:title"]', 'content');

        if (twitterTitle) {
          // Twitter title은 70자 이내 권장
          expect(twitterTitle.length, `${lang}/: twitter:title too long`).toBeLessThanOrEqual(70);
        }
      });

      test(`${lang}/ - Twitter description 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const twitterDescription = await page.getAttribute(
          'meta[name="twitter:description"]',
          'content',
        );

        if (twitterDescription) {
          // Twitter description은 200자 이내 권장
          expect(
            twitterDescription.length,
            `${lang}/: twitter:description too long`,
          ).toBeLessThanOrEqual(200);
        }
      });
    }
  });

  test.describe('Edge Cases', () => {
    test('모든 메타 태그가 문자열 (빈 값 아님)', async ({ page }) => {
      await page.goto('/');

      const description = await page.getAttribute('meta[name="description"]', 'content');
      const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
      const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');

      if (description) expect(description.trim().length).toBeGreaterThan(0);
      if (ogTitle) expect(ogTitle.trim().length).toBeGreaterThan(0);
      if (ogDescription) expect(ogDescription.trim().length).toBeGreaterThan(0);
    });

    test('특수 문자 처리 (HTML 엔티티)', async ({ page }) => {
      await page.goto('/');

      const description = await page.getAttribute('meta[name="description"]', 'content');

      // HTML 엔티티가 이스케이프되지 않은 상태로 포함되면 안 됨
      if (description) {
        expect(description).not.toMatch(/&(?:amp|lt|gt|quot|apos);/);
      }
    });

    test('줄바꿈 문자 없음', async ({ page }) => {
      await page.goto('/');

      const description = await page.getAttribute('meta[name="description"]', 'content');
      const title = await page.title();

      if (description) {
        expect(description).not.toContain('\n');
        expect(description).not.toContain('\r');
      }

      expect(title).not.toContain('\n');
      expect(title).not.toContain('\r');
    });
  });

  test.describe('다국어별 차이 검증', () => {
    test('영어와 한국어 메타 길이 비교', async ({ page }) => {
      await page.goto('/');
      const enDescription = await page.getAttribute('meta[name="description"]', 'content');
      const _enTitle = await page.title();

      await page.goto('/ko');
      const koDescription = await page.getAttribute('meta[name="description"]', 'content');
      const _koTitle = await page.title();

      // 둘 다 존재해야 함
      expect(enDescription).toBeDefined();
      expect(koDescription).toBeDefined();

      // 영어와 한국어 메타가 다를 수 있음 (번역)
      // 하지만 둘 다 적절한 길이여야 함
      if (enDescription && koDescription) {
        expect(enDescription.length).toBeGreaterThanOrEqual(30);
        expect(koDescription.length).toBeGreaterThanOrEqual(30);
      }
    });
  });
});
