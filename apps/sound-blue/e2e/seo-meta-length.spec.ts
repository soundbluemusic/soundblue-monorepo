import { expect, test } from '@playwright/test';

/**
 * SEO Meta Length Optimization Tests
 *
 * 검증 항목:
 * - 메타 설명(description) 길이: 50-160자
 * - 제목(title) 길이: 30-60자
 * - 브랜드명 포함 여부
 */

test.describe('SEO Meta Length Optimization', () => {
  const routes = [
    '/',
    '/about',
    '/privacy',
    '/terms',
    '/license',
    '/sitemap',
    '/sound-recording',
    '/blog',
    '/news',
    '/chat',
    '/built-with',
  ];

  const languages = ['', '/ko'];

  test.describe('메타 설명(Description) 길이 검증', () => {
    for (const lang of languages) {
      for (const route of routes) {
        test(`${lang}${route} - 메타 설명 50-160자`, async ({ page }) => {
          await page.goto(`${lang}${route}`);

          const description = await page.getAttribute('meta[name="description"]', 'content');

          expect(description, `${lang}${route}: No description meta tag found`).not.toBeNull();

          const length = description?.length ?? 0;

          expect(
            length,
            `${lang}${route}: Description too short (${length} chars, min 50)`,
          ).toBeGreaterThanOrEqual(50);

          expect(
            length,
            `${lang}${route}: Description too long (${length} chars, max 160)`,
          ).toBeLessThanOrEqual(160);
        });
      }
    }
  });

  test.describe('제목(Title) 길이 검증', () => {
    for (const lang of languages) {
      for (const route of routes) {
        test(`${lang}${route} - 제목 30-60자`, async ({ page }) => {
          await page.goto(`${lang}${route}`);

          const title = await page.title();
          const length = title.length;

          expect(
            length,
            `${lang}${route}: Title too short (${length} chars, min 30)`,
          ).toBeGreaterThanOrEqual(30);

          expect(
            length,
            `${lang}${route}: Title too long (${length} chars, max 60)`,
          ).toBeLessThanOrEqual(60);
        });
      }
    }
  });

  test.describe('제목 구조 검증', () => {
    for (const lang of languages) {
      for (const route of routes) {
        test(`${lang}${route} - 브랜드명 포함 (| 구분자)`, async ({ page }) => {
          await page.goto(`${lang}${route}`);

          const title = await page.title();

          // 브랜드명 구분자 확인
          expect(title, `${lang}${route}: Missing brand separator '|'`).toContain('|');

          // "페이지명 | 사이트명" 형식 검증
          const parts = title.split('|').map((p) => p.trim());
          expect(parts.length, `${lang}${route}: Invalid title format`).toBeGreaterThanOrEqual(2);

          // 각 파트가 비어있지 않음
          parts.forEach((part, index) => {
            expect(part.length, `${lang}${route}: Empty title part ${index}`).toBeGreaterThan(0);
          });
        });
      }
    }
  });

  test.describe('OG 메타 길이 검증', () => {
    for (const lang of languages) {
      test(`${lang}/ - OG title 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');

        expect(ogTitle, `${lang}/: No OG title found`).not.toBeNull();

        const length = ogTitle?.length ?? 0;

        // OG title은 일반 title보다 약간 길어도 됨 (최대 70자)
        expect(length, `${lang}/: OG title too short (${length} chars)`).toBeGreaterThan(0);
        expect(length, `${lang}/: OG title too long (${length} chars, max 70)`).toBeLessThanOrEqual(
          70,
        );
      });

      test(`${lang}/ - OG description 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const ogDesc = await page.getAttribute('meta[property="og:description"]', 'content');

        expect(ogDesc, `${lang}/: No OG description found`).not.toBeNull();

        const length = ogDesc?.length ?? 0;

        expect(
          length,
          `${lang}/: OG description too short (${length} chars, min 50)`,
        ).toBeGreaterThanOrEqual(50);

        expect(
          length,
          `${lang}/: OG description too long (${length} chars, max 200)`,
        ).toBeLessThanOrEqual(200);
      });
    }
  });

  test.describe('Twitter Card 메타 길이 검증', () => {
    for (const lang of languages) {
      test(`${lang}/ - Twitter title 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const twitterTitle = await page.getAttribute('meta[name="twitter:title"]', 'content');

        if (twitterTitle) {
          const length = twitterTitle.length;
          expect(
            length,
            `${lang}/: Twitter title too long (${length} chars, max 70)`,
          ).toBeLessThanOrEqual(70);
        }
      });

      test(`${lang}/ - Twitter description 적절한 길이`, async ({ page }) => {
        await page.goto(`${lang}/`);

        const twitterDesc = await page.getAttribute('meta[name="twitter:description"]', 'content');

        if (twitterDesc) {
          const length = twitterDesc.length;
          expect(
            length,
            `${lang}/: Twitter description too long (${length} chars, max 200)`,
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
      const ogDesc = await page.getAttribute('meta[property="og:description"]', 'content');

      expect(description?.trim().length).toBeGreaterThan(0);
      expect(ogTitle?.trim().length).toBeGreaterThan(0);
      expect(ogDesc?.trim().length).toBeGreaterThan(0);
    });

    test('특수 문자 처리 (HTML 엔티티)', async ({ page }) => {
      await page.goto('/');

      const description = await page.getAttribute('meta[name="description"]', 'content');

      // HTML 엔티티가 디코딩되어 있어야 함
      expect(description).not.toContain('&lt;');
      expect(description).not.toContain('&gt;');
      expect(description).not.toContain('&amp;');
    });

    test('이모지 포함 시 길이 정확히 계산', async ({ page }) => {
      await page.goto('/');

      const title = await page.title();

      // JavaScript length는 이모지를 여러 글자로 카운트할 수 있음
      // 하지만 사용자에게 보이는 길이는 다를 수 있음
      // 여기서는 기본 length로 검증
      expect(title.length).toBeLessThanOrEqual(60);
    });
  });

  test.describe('다국어별 차이 검증', () => {
    test('영어와 한국어 메타 길이 비교', async ({ page }) => {
      await page.goto('/');
      const enDesc = await page.getAttribute('meta[name="description"]', 'content');
      const enDescLength = enDesc?.length ?? 0;

      await page.goto('/ko');
      const koDesc = await page.getAttribute('meta[name="description"]', 'content');
      const koDescLength = koDesc?.length ?? 0;

      // 두 언어 모두 유효한 범위 내
      expect(enDescLength).toBeGreaterThanOrEqual(50);
      expect(enDescLength).toBeLessThanOrEqual(160);
      expect(koDescLength).toBeGreaterThanOrEqual(50);
      expect(koDescLength).toBeLessThanOrEqual(160);

      // 한국어는 영어보다 짧을 수 있음 (한글 vs 알파벳)
      console.log(`EN description: ${enDescLength} chars`);
      console.log(`KO description: ${koDescLength} chars`);
    });

    test('모든 언어에서 일관된 title 구조', async ({ page }) => {
      const urls = ['/', '/ko'];

      for (const url of urls) {
        await page.goto(url);
        const title = await page.title();

        // 모두 브랜드 구분자 포함
        expect(title).toContain('|');
      }
    });
  });
});
