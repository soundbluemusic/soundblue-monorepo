import { expect, test } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test.describe('Language Detection', () => {
    test('should default to English on root path', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).not.toHaveAttribute('lang', 'ko');
      await expect(page.locator('.home-intro')).toContainText(/hi, im sound blue/i);
    });

    test('should use Korean on /ko path', async ({ page }) => {
      await page.goto('/ko');
      await expect(page.locator('.home-intro')).toContainText(/안녕하세요/);
    });
  });

  test.describe('Language Switching', () => {
    test('should switch from English to Korean', async ({ page }) => {
      await page.goto('/');

      // Click language toggle
      await page.click('.header-lang-btn');
      await expect(page).toHaveURL('/ko/');

      // Content should be in Korean
      await expect(page.locator('.home-intro')).toContainText(/안녕하세요/);
    });

    test('should switch from Korean to English', async ({ page }) => {
      await page.goto('/ko');

      // Click language toggle
      await page.click('.header-lang-btn');
      await expect(page).toHaveURL('/');

      // Content should be in English
      await expect(page.locator('.home-intro')).toContainText(/hi, im sound blue/i);
    });

    test('should preserve page when switching language', async ({ page }) => {
      await page.goto('/privacy');
      await page.click('.header-lang-btn');
      await expect(page).toHaveURL('/ko/privacy/');

      await page.click('.header-lang-btn');
      await expect(page).toHaveURL('/privacy/');
    });
  });

  test.describe('Content Localization', () => {
    test('privacy page should have localized content', async ({ page }) => {
      await page.goto('/privacy');
      await expect(page.locator('h1')).toContainText('Privacy Policy');

      await page.goto('/ko/privacy');
      await expect(page.locator('h1')).toContainText('개인정보처리방침');
    });

    test('terms page should have localized content', async ({ page }) => {
      await page.goto('/terms');
      await expect(page.locator('h1')).toContainText('Terms of Service');

      await page.goto('/ko/terms');
      await expect(page.locator('h1')).toContainText('이용약관');
    });

    test('license page should have localized content', async ({ page }) => {
      await page.goto('/license');
      await expect(page.locator('h1')).toContainText('License');

      await page.goto('/ko/license');
      await expect(page.locator('h1')).toContainText('라이선스');
    });

    test('sitemap page should have localized content', async ({ page }) => {
      await page.goto('/sitemap');
      await expect(page.locator('h1')).toContainText('Sitemap');

      await page.goto('/ko/sitemap');
      await expect(page.locator('h1')).toContainText('사이트맵');
    });

    test('404 page should have localized content', async ({ page }) => {
      await page.goto('/nonexistent');
      await expect(page.locator('.not-found-title')).toContainText('Page Not Found');

      await page.goto('/ko/nonexistent');
      await expect(page.locator('.not-found-title')).toContainText('페이지를 찾을 수 없습니다');
    });
  });

  test.describe('Navigation Localization', () => {
    test('sidebar navigation should be localized', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });

      await page.goto('/');
      const homeLink = page.locator('.sidebar a[href="/"]').first();
      await expect(homeLink).toContainText('Home');

      await page.goto('/ko');
      const homeLinkKo = page.locator('.sidebar a[href="/ko/"]').first();
      await expect(homeLinkKo).toContainText('홈');
    });

    test('footer links should be localized', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.footer')).toContainText('Privacy');

      await page.goto('/ko');
      await expect(page.locator('.footer')).toContainText('개인정보처리방침');
    });
  });
});
