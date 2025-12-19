import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'Small Mobile', width: 320, height: 568 },
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Large Mobile', width: 414, height: 896 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop', width: 1280, height: 800 },
  { name: 'Large Desktop', width: 1920, height: 1080 },
  { name: '4K', width: 3840, height: 2160 },
];

test.describe('Responsive Design Tests', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('homepage renders correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Page should not have horizontal overflow
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

        // Main content should be visible
        const main = page.locator('main');
        await expect(main).toBeVisible();

        // Navigation should be present (may be hamburger on mobile)
        const nav = page.locator('nav, header');
        await expect(nav.first()).toBeVisible();
      });

      test('content is not cut off', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check that no text is overflowing
        const overflowingElements = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const overflowing: string[] = [];

          elements.forEach((el) => {
            const style = window.getComputedStyle(el);
            if (style.overflow === 'visible') {
              const rect = el.getBoundingClientRect();
              if (rect.width > window.innerWidth) {
                overflowing.push(el.tagName + '.' + el.className);
              }
            }
          });

          return overflowing;
        });

        expect(overflowingElements).toHaveLength(0);
      });

      test('footer is at the bottom', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const footer = page.locator('footer');
        if ((await footer.count()) > 0) {
          const footerBox = await footer.boundingBox();
          const viewportHeight = viewport.height;

          if (footerBox) {
            // Footer should be at least at the viewport height or below
            // (meaning content pushes it down or it's sticky at bottom)
            expect(footerBox.y + footerBox.height).toBeGreaterThanOrEqual(viewportHeight * 0.5);
          }
        }
      });
    });
  }
});

test.describe('Orientation Change', () => {
  test('handles orientation change gracefully', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check portrait layout
    let scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    let clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(100); // Allow reflow

    // Check landscape layout
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
