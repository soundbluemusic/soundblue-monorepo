import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

for (const app of apps) {
  test.describe(`${app.name} 접근성 테스트`, () => {
    test('메인 페이지 axe-core 검사 통과', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('키보드 네비게이션 가능', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // Tab 키로 첫 번째 포커스 가능 요소로 이동
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('페이지에 h1 태그 존재', async ({ page }) => {
      await page.goto(app.url);
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test('이미지에 alt 텍스트 존재', async ({ page }) => {
      await page.goto(app.url);
      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });
  });
}
