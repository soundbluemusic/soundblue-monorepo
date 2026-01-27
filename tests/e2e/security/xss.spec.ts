import { expect, test } from '@playwright/test';

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

const xssPayloads = [
  '<script>alert("xss")</script>',
  '"><script>alert("xss")</script>',
  "'-alert('xss')-'",
  '<img src=x onerror=alert("xss")>',
  'javascript:alert("xss")',
];

for (const app of apps) {
  test.describe(`${app.name} XSS 방지 테스트`, () => {
    test('URL 파라미터 XSS 방지', async ({ page }) => {
      for (const payload of xssPayloads) {
        const encodedPayload = encodeURIComponent(payload);
        const testUrl = `${app.url}?q=${encodedPayload}`;

        await page.goto(testUrl);

        // XSS가 실행되지 않았는지 확인
        const dialogAppeared = await Promise.race([
          page.waitForEvent('dialog', { timeout: 500 }).then(() => true),
          new Promise((resolve) => setTimeout(() => resolve(false), 500)),
        ]);

        expect(dialogAppeared).toBe(false);
      }
    });

    test('HTML 인젝션 방지', async ({ page }) => {
      await page.goto(app.url);

      // 페이지에서 실행되지 않아야 할 스크립트가 없는지 확인
      const unsafeScripts = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        let unsafe = false;
        for (const script of scripts) {
          if (script.textContent?.includes('alert(')) {
            unsafe = true;
          }
        }
        return unsafe;
      });

      expect(unsafeScripts).toBe(false);
    });

    test('innerHTML 직접 사용 검사', async ({ page }) => {
      await page.goto(app.url);
      const html = await page.content();

      // dangerouslySetInnerHTML 없이 사용된 innerHTML 패턴 (일반적 체크)
      // React에서는 dangerouslySetInnerHTML을 사용해야 하므로 이게 있으면 의도적
      // 여기서는 기본적인 스크립트 인젝션만 체크
      expect(html).not.toMatch(/<script>alert\(/);
    });
  });
}
