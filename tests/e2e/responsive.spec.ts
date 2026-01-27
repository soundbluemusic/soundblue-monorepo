import { expect, test } from '@playwright/test';

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1920, height: 1080 },
];

for (const app of apps) {
  test.describe(`${app.name} 반응형 테스트`, () => {
    for (const viewport of viewports) {
      test(`${viewport.name} (${viewport.width}x${viewport.height}) 레이아웃`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(app.url);
        await page.waitForLoadState('networkidle');

        // 페이지가 뷰포트에 맞게 렌더링되었는지 확인
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // 콘텐츠가 뷰포트를 넘지 않는지 확인
        const overflowX = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
        });
        expect(overflowX).toBe(true);
      });
    }

    test('뷰포트 리사이즈 시 레이아웃 유지', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // 데스크톱 → 모바일 리사이즈
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(100);
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(100);

      // 콘텐츠가 여전히 보이는지 확인
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });
}
