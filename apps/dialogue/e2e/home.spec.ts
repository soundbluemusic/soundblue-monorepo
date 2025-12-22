import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dialogue/);
  });

  test('should display main layout components', async ({ page }) => {
    await page.goto('/');

    // Check for header
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check for main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should be able to interact with chat interface', async ({ page }) => {
    await page.goto('/');

    // Look for chat input (adjust selector as needed)
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible();

    // Type a test message
    await chatInput.fill('Hello');
    await expect(chatInput).toHaveValue('Hello');
  });
});
