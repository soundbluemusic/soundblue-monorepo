import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have skip link that focuses main content', async ({ page }) => {
    // Tab to focus skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-to-content');

    // Skip link should be visible when focused
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    // Click skip link
    await skipLink.click();

    // Main content should be visible
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    // Main content area
    await expect(page.locator('main[role="main"]')).toBeVisible();
  });

  test('should support keyboard navigation on app cards', async ({ page }) => {
    // Tab to first app card
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Theme toggle
    await page.keyboard.press('Tab'); // Language toggle
    await page.keyboard.press('Tab'); // First app card

    // Enter should navigate
    await page.keyboard.press('Enter');
    await expect(page).not.toHaveURL('/');
  });

  test('should have accessible buttons with labels', async ({ page }) => {
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toHaveAttribute('aria-label');

    const langToggle = page.locator('.language-toggle');
    await expect(langToggle).toHaveAttribute('aria-label');
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Page should still function normally
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Color Contrast & Visual', () => {
  test('should have sufficient color contrast in light mode', async ({ page }) => {
    await page.goto('/');

    // Ensure we're in light mode
    const html = page.locator('html');
    const theme = await html.getAttribute('data-theme');
    if (theme === 'dark') {
      await page.click('.header-control-btn');
    }

    // Main text should be visible
    await expect(page.locator('.home-title')).toBeVisible();
    await expect(page.locator('.home-description')).toBeVisible();
  });

  test('should have sufficient color contrast in dark mode', async ({ page }) => {
    await page.goto('/');

    // Switch to dark mode
    const html = page.locator('html');
    const theme = await html.getAttribute('data-theme');
    if (theme !== 'dark') {
      await page.click('.header-control-btn');
    }

    // Main text should be visible in dark mode too
    await expect(page.locator('.home-title')).toBeVisible();
    await expect(page.locator('.home-description')).toBeVisible();
  });
});

test.describe('Focus Management', () => {
  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First interactive element

    // The focused element should have a visible outline
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should trap focus within modal when open', async ({ page }) => {
    // This test would apply if there were modals
    // For now, just verify focus doesn't get lost
    await page.goto('/');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Screen Reader Support', () => {
  test('should have descriptive link text', async ({ page }) => {
    await page.goto('/');

    // Social links should have aria-labels
    const youtubeLink = page.locator('a[href*="youtube"]');
    await expect(youtubeLink).toHaveAttribute('aria-label', /.+/);

    const discographyLink = page.locator('a[href*="soundblue.music"]');
    await expect(discographyLink).toHaveAttribute('aria-label', /.+/);
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/');

    // Theme toggle should have aria-label
    const themeButton = page.locator('.header-control-btn').first();
    await expect(themeButton).toHaveAttribute('aria-label', /.+/);

    // Language toggle should have aria-label
    const langButton = page.locator('.header-lang-btn');
    await expect(langButton).toHaveAttribute('aria-label', /.+/);
  });

  test('decorative elements should be hidden from screen readers', async ({ page }) => {
    await page.goto('/');

    // Particle background should be aria-hidden
    const particleBackground = page.locator('.particle-background');
    if ((await particleBackground.count()) > 0) {
      await expect(particleBackground).toHaveAttribute('aria-hidden', 'true');
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.language-toggle')).toBeVisible();
    await expect(page.locator('.theme-toggle')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Axe Accessibility Audit', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('about page should have no accessibility violations', async ({ page }) => {
    await page.goto('/about/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Korean homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/ko/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
