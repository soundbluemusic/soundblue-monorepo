import { expect, test } from '@playwright/test';

/**
 * i18n (국제화) 테스트
 * 다국어 지원이 올바르게 동작하는지 확인합니다.
 */

const apps = [
  { name: 'sound-blue', url: 'http://localhost:3000', koPath: '/ko' },
  { name: 'tools', url: 'http://localhost:3001', koPath: '/ko' },
  { name: 'dialogue', url: 'http://localhost:3002', koPath: '/ko' },
];

for (const app of apps) {
  test.describe(`${app.name} i18n 테스트`, () => {
    test('영어 페이지 로드', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // html lang 속성 확인
      const lang = await page.locator('html').getAttribute('lang');
      expect(['en', 'en-US']).toContain(lang);

      // 페이지에 텍스트가 있는지 확인
      const body = await page.locator('body').textContent();
      expect(body!.length).toBeGreaterThan(0);
    });

    test('한국어 페이지 로드', async ({ page }) => {
      await page.goto(`${app.url}${app.koPath}`);
      await page.waitForLoadState('networkidle');

      // html lang 속성 확인
      const lang = await page.locator('html').getAttribute('lang');
      expect(['ko', 'ko-KR']).toContain(lang);

      // 한글이 포함되어 있는지 확인
      const body = await page.locator('body').textContent();
      const hasKorean = /[가-힣]/.test(body!);
      expect(hasKorean).toBe(true);
    });

    test('언어 전환 링크 존재', async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // 언어 전환 링크/버튼 찾기
      const langSwitcher = page.locator(
        '[data-testid="lang-switcher"], [aria-label*="language"], [aria-label*="언어"], a[href*="/ko"], button:has-text("한국어"), button:has-text("KO")',
      );

      const count = await langSwitcher.count();
      // 언어 전환 UI가 존재해야 함
      expect(count).toBeGreaterThan(0);
    });

    test('번역 키가 노출되지 않음', async ({ page }) => {
      // 영어 페이지
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      let body = await page.locator('body').textContent();

      // 일반적인 번역 키 패턴 체크
      expect(body).not.toMatch(/\{\{.*\}\}/); // {{key}}
      expect(body).not.toMatch(/\$t\(/); // $t(key)
      expect(body).not.toMatch(/i18n\./); // i18n.key
      expect(body).not.toMatch(/^[a-z]+\.[a-z]+\.[a-z]+$/m); // common.button.submit 형태

      // 한국어 페이지
      await page.goto(`${app.url}${app.koPath}`);
      await page.waitForLoadState('networkidle');

      body = await page.locator('body').textContent();

      expect(body).not.toMatch(/\{\{.*\}\}/);
      expect(body).not.toMatch(/\$t\(/);
      expect(body).not.toMatch(/i18n\./);
    });

    test('날짜/숫자 형식 로케일 적용', async ({ page }) => {
      // 영어 페이지에서 날짜 형식 확인
      await page.goto(app.url);
      await page.waitForLoadState('networkidle');

      // 페이지에 날짜가 있다면 로케일에 맞는 형식인지 확인
      // (이 테스트는 앱에 날짜가 표시되는 경우에만 의미있음)
      const dateElements = page.locator('[data-date], time, .date');
      const count = await dateElements.count();

      if (count > 0) {
        const dateText = await dateElements.first().textContent();
        // 최소한 숫자가 포함되어 있어야 함
        expect(dateText).toMatch(/\d/);
      }
    });

    test('RTL 언어 미지원 확인 (현재는 LTR만)', async ({ page }) => {
      await page.goto(app.url);

      // dir 속성이 rtl이 아닌지 확인
      const dir = await page.locator('html').getAttribute('dir');
      expect(dir).not.toBe('rtl');
    });
  });
}
