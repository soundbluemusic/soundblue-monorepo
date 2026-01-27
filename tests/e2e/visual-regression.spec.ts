import { expect, test } from '@playwright/test';

/**
 * Visual Regression 테스트
 * 스크린샷을 비교하여 UI 변경을 감지합니다.
 *
 * 첫 실행 시 baseline 스크린샷이 생성되고,
 * 이후 실행 시 baseline과 비교하여 차이가 있으면 실패합니다.
 *
 * baseline 업데이트: pnpm exec playwright test --update-snapshots
 */

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 667 },
];

for (const app of apps) {
  test.describe(`${app.name} Visual Regression`, () => {
    for (const viewport of viewports) {
      test(`메인 페이지 - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(app.url);
        await page.waitForLoadState('networkidle');

        // 애니메이션 완료 대기
        await page.waitForTimeout(500);

        // 스크린샷 비교 (threshold: 허용 오차)
        await expect(page).toHaveScreenshot(`${app.name}-main-${viewport.name}.png`, {
          maxDiffPixelRatio: 0.01, // 1% 차이까지 허용
          animations: 'disabled',
        });
      });
    }

    test('다크모드 전환 시 UI', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // 다크모드 활성화 (시스템 설정 에뮬레이션)
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot(`${app.name}-dark-mode.png`, {
        maxDiffPixelRatio: 0.01,
        animations: 'disabled',
      });
    });
  });
}
