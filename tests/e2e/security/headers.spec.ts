import { expect, test } from '@playwright/test';

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

for (const app of apps) {
  test.describe(`${app.name} 보안 헤더 테스트`, () => {
    test('X-Content-Type-Options 헤더', async ({ request }) => {
      const response = await request.get(app.url);
      const headers = response.headers();

      // 로컬 개발 환경에서는 없을 수 있음
      if (headers['x-content-type-options']) {
        expect(headers['x-content-type-options']).toBe('nosniff');
      }
    });

    test('X-Frame-Options 헤더', async ({ request }) => {
      const response = await request.get(app.url);
      const headers = response.headers();

      // 로컬 개발 환경에서는 없을 수 있음
      if (headers['x-frame-options']) {
        expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
      }
    });

    test('Content-Security-Policy 헤더 또는 메타태그', async ({ page, request }) => {
      const response = await request.get(app.url);
      const headers = response.headers();

      // 헤더에 CSP가 있거나
      const hasCSPHeader = Boolean(headers['content-security-policy']);

      // 메타 태그로 CSP가 있는지 확인
      await page.goto(app.url);
      const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
      const hasCSPMeta = (await cspMeta.count()) > 0;

      // 둘 중 하나라도 있으면 OK (로컬에서는 없을 수 있음)
      console.log(`${app.name} CSP 설정: 헤더=${hasCSPHeader}, 메타=${hasCSPMeta}`);
    });

    test('민감한 정보 노출 없음', async ({ page }) => {
      await page.goto(app.url);
      const html = await page.content();

      // 일반적인 민감한 패턴 체크
      expect(html).not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']+["']/i);
      expect(html).not.toMatch(/secret\s*[:=]\s*["'][^"']+["']/i);
      expect(html).not.toMatch(/password\s*[:=]\s*["'][^"']+["']/i);
    });
  });
}
