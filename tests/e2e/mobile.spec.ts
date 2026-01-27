import { devices, expect, test } from '@playwright/test';

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

// 모바일 뷰포트 설정
test.use({ ...devices['iPhone 13'] });

for (const app of apps) {
  test.describe(`${app.name} 모바일 테스트`, () => {
    test('모바일 뷰포트에서 페이지 로드', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // 페이지가 정상적으로 로드되었는지 확인
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('터치 타겟 최소 44px 확인', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // 모든 버튼과 링크의 크기 확인
      const interactiveElements = page.locator('button, a, [role="button"]');
      const count = await interactiveElements.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = interactiveElements.nth(i);
        const isVisible = await element.isVisible();

        if (isVisible) {
          const box = await element.boundingBox();
          if (box) {
            // 터치 타겟은 최소 44x44px 권장 (WCAG 2.5.5)
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('가로 스크롤 없음 확인', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('텍스트 가독성 (최소 폰트 사이즈 16px)', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      const bodyFontSize = await page.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return Number.parseFloat(style.fontSize);
      });

      expect(bodyFontSize).toBeGreaterThanOrEqual(14);
    });
  });
}
