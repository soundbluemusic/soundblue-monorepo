import { expect, test } from '@playwright/test';

// Increase timeout for tool pages that may be slow to load
test.setTimeout(60000);

test.describe('Tools Page', () => {
  test('should load tools workspace', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/tools/);
  });

  test('should display tool picker or workspace', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('Metronome Tool', () => {
  test('should load metronome page', async ({ page }) => {
    await page.goto('/tools/metronome', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/metronome/);
  });

  test('should have BPM control', async ({ page }) => {
    await page.goto('/tools/metronome', { waitUntil: 'domcontentloaded' });
    // Look for BPM-related elements
    const bpmElement = page.locator('text=/BPM|bpm/i').first();
    await expect(bpmElement).toBeVisible({ timeout: 15000 });
  });

  test('should have play/start button', async ({ page }) => {
    await page.goto('/tools/metronome', { waitUntil: 'domcontentloaded' });
    const playButton = page
      .locator('button')
      .filter({ hasText: /play|start|시작/i })
      .first();
    await expect(playButton).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Tuner Tool', () => {
  test('should load tuner page', async ({ page }) => {
    await page.goto('/tools/tuner', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/tuner/);
  });
});

test.describe('QR Generator Tool', () => {
  test('should load QR generator page', async ({ page }) => {
    await page.goto('/tools/qr-generator', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/qr-generator/);
  });

  test('should have text input', async ({ page }) => {
    await page.goto('/tools/qr-generator', { waitUntil: 'domcontentloaded' });
    const input = page.locator('input[type="text"], textarea').first();
    await expect(input).toBeVisible({ timeout: 15000 });
  });
});

test.describe('World Clock Tool', () => {
  test('should load world clock page', async ({ page }) => {
    await page.goto('/tools/world-clock', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/world-clock/);
  });
});
