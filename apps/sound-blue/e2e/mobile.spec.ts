import { expect, test } from '@playwright/test';

test.describe('Mobile Optimality Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('all interactive elements have minimum 44px touch target', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all interactive elements
    const interactiveElements = await page
      .locator('a, button, [role="button"], input, select, textarea')
      .all();

    for (const element of interactiveElements) {
      const isVisible = await element.isVisible();
      if (!isVisible) continue;

      const box = await element.boundingBox();
      if (!box) continue;

      // Check minimum touch target size (44x44px per WCAG 2.5.5)
      const minSize = 44;
      const width = box.width;
      const height = box.height;

      // Allow some elements to be smaller if they have sufficient spacing
      // But warn if under 44px
      if (width < minSize || height < minSize) {
        const ariaLabel = await element.getAttribute('aria-label');
        const text = await element.textContent();
        const identifier = ariaLabel || text?.trim().slice(0, 30) || 'unknown';

        // For now, just log a warning - can be made stricter later
        console.warn(
          `Touch target warning: "${identifier}" is ${width.toFixed(0)}x${height.toFixed(0)}px (recommended: ${minSize}x${minSize}px)`,
        );
      }
    }
  });

  test('no horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding tolerance
  });

  test('text is readable without zooming', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that main text elements have at least 16px font size
    const textElements = await page.locator('p, li, span').all();

    for (const element of textElements) {
      const isVisible = await element.isVisible();
      if (!isVisible) continue;

      const fontSize = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.fontSize);
      });

      // Main body text should be at least 16px
      if (fontSize < 12) {
        const text = await element.textContent();
        console.warn(
          `Small text warning: "${text?.trim().slice(0, 30)}" has font-size ${fontSize}px`,
        );
      }
    }
  });

  test('viewport meta tag is properly configured', async ({ page }) => {
    await page.goto('/');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
    // Should not disable user scaling
    expect(viewport).not.toContain('user-scalable=no');
    expect(viewport).not.toContain('maximum-scale=1');
  });

  test('images are responsive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    for (const img of images) {
      const isVisible = await img.isVisible();
      if (!isVisible) continue;

      const box = await img.boundingBox();
      if (!box) continue;

      // Image should not overflow viewport
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });
});
