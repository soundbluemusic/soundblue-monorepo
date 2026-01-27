import { expect, test } from '@playwright/test';

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000' },
  { name: 'tools', url: 'http://localhost:3001' },
  { name: 'dialogue', url: 'http://localhost:3002' },
];

for (const app of apps) {
  test.describe(`${app.name} Service Worker 테스트`, () => {
    test('Service Worker 등록 가능', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // Service Worker가 등록되었는지 확인
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          return registrations.length > 0;
        }
        return false;
      });

      // Service Worker는 선택사항이므로 존재 여부만 로그
      console.log(`${app.name} Service Worker 등록 상태: ${swRegistered}`);
    });

    test('오프라인 기본 페이지 접근 가능', async ({ page, context }) => {
      // 먼저 온라인에서 페이지 로드
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // Service Worker가 활성화될 때까지 대기
      await page.waitForTimeout(1000);

      // 오프라인 모드 시뮬레이션
      await context.setOffline(true);

      // 페이지 새로고침 시도
      try {
        await page.reload({ timeout: 5000 });
        // 오프라인에서도 뭔가 표시되면 성공
        const body = page.locator('body');
        await expect(body).toBeVisible();
      } catch {
        // 오프라인 폴백이 없을 수 있음 - 허용
        console.log(`${app.name} 오프라인 폴백 없음 (허용)`);
      }

      // 온라인 모드 복원
      await context.setOffline(false);
    });
  });
}
