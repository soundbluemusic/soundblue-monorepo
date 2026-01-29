import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

/**
 * 프로덕션 스모크 테스트
 * @production 태그로 프로덕션 환경에서만 실행
 */

test.describe('Production Smoke Tests @production @smoke', () => {
  const isProduction = !!process.env.PRODUCTION_TEST;
  const waitForReady = async (page: Page) => {
    if (isProduction) {
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);
      return;
    }
    await page.waitForLoadState('networkidle');
  };

  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // HTML이 비어있지 않은지 확인 (SSR 검증)
    const html = await page.content();
    expect(html.length).toBeGreaterThan(1000);
    expect(html).toContain('</html>');
  });

  test('page has valid meta tags', async ({ page }) => {
    await page.goto('/');

    // 필수 메타태그 확인
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
  });

  test('page is not SPA (has server-rendered content)', async ({ page }) => {
    await page.goto('/');

    // SPA의 빈 root div가 없는지 확인
    const emptyRoot = await page.locator('#root:empty').count();
    expect(emptyRoot).toBe(0);

    // 실제 콘텐츠가 있는지 확인
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(50);
  });

  test('assets load correctly', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        const url = response.url();
        if (url.includes('.js') || url.includes('.css')) {
          failedRequests.push(`${response.status()}: ${url}`);
        }
      }
    });

    await page.goto('/');
    await waitForReady(page);

    expect(failedRequests).toHaveLength(0);
  });

  test('no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await waitForReady(page);

    expect(errors).toHaveLength(0);
  });

  test('Korean locale works', async ({ page }) => {
    // /ko 경로로 이동
    const response = await page.goto('/ko');
    expect(response?.status()).toBe(200);

    // HTML lang 속성 또는 한글 콘텐츠 확인
    const html = await page.content();
    const hasKorean = /[\u3131-\uD79D]/.test(html);
    expect(hasKorean).toBe(true);
  });
});
