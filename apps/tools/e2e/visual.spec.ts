import { expect, test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe('Desktop (1280x800)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('homepage visual snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('metronome page visual snapshot', async ({ page }) => {
      await page.goto('/metronome');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('metronome-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('drum-machine page visual snapshot', async ({ page }) => {
      await page.goto('/drum-machine');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('drum-machine-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('qr page visual snapshot', async ({ page }) => {
      await page.goto('/qr');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('qr-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('translator page visual snapshot', async ({ page }) => {
      await page.goto('/translator');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('translator-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('about page visual snapshot', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('about-desktop.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  });

  test.describe('Tablet (768x1024)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('homepage visual snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('metronome page visual snapshot', async ({ page }) => {
      await page.goto('/metronome');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('metronome-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('drum-machine page visual snapshot', async ({ page }) => {
      await page.goto('/drum-machine');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('drum-machine-tablet.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  });

  test.describe('Mobile (375x667)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('homepage visual snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('metronome page visual snapshot', async ({ page }) => {
      await page.goto('/metronome');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('metronome-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });

    test('translator page visual snapshot', async ({ page }) => {
      await page.goto('/translator');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('translator-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  });

  test.describe('4K (3840x2160)', () => {
    test.use({ viewport: { width: 3840, height: 2160 } });

    test('homepage visual snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-4k.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  });

  test.describe('Small Mobile (320x568)', () => {
    test.use({ viewport: { width: 320, height: 568 } });

    test('homepage visual snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('homepage-small-mobile.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  });
});
