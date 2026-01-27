import { expect, test } from '@playwright/test';

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

for (const app of apps) {
  test.describe(`${app.name} PWA Manifest 테스트`, () => {
    test('manifest.json 링크 존재', async ({ page }) => {
      await page.goto(app.url);

      const manifestLink = page.locator('link[rel="manifest"]');
      await expect(manifestLink).toHaveCount(1);
    });

    test('manifest.json 유효성', async ({ page, request }) => {
      await page.goto(app.url);

      const manifestLink = page.locator('link[rel="manifest"]');
      const href = await manifestLink.getAttribute('href');

      if (href) {
        const manifestUrl = new URL(href, app.url).toString();
        const response = await request.get(manifestUrl);
        expect(response.ok()).toBe(true);

        const manifest = await response.json();

        // 필수 필드 확인
        expect(manifest.name).toBeTruthy();
        expect(manifest.short_name).toBeTruthy();
        expect(manifest.icons).toBeTruthy();
        expect(manifest.start_url).toBeTruthy();
        expect(manifest.display).toBeTruthy();
      }
    });

    test('apple-touch-icon 존재', async ({ page }) => {
      await page.goto(app.url);

      const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
      const count = await appleTouchIcon.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('theme-color 메타태그 존재', async ({ page }) => {
      await page.goto(app.url);

      const themeColor = page.locator('meta[name="theme-color"]');
      await expect(themeColor).toHaveCount(1);
    });
  });
}
