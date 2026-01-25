/**
 * @soundblue/pwa - PWA Config Tests
 * Tests for PWA configuration utilities
 */
import { describe, expect, it } from 'vitest';
import {
  createDefaultManifest,
  createDefaultWorkbox,
  createPWAConfig,
  DIALOGUE_PWA_CONFIG,
  MAIN_PWA_CONFIG,
  TOOLS_PWA_CONFIG,
} from '../src/config/pwa-config';

describe('@soundblue/pwa config', () => {
  describe('createDefaultManifest', () => {
    it('should create manifest with required fields', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(manifest.name).toBe('Test App');
      expect(manifest.short_name).toBe('Test');
      expect(manifest.display).toBe('standalone');
      expect(manifest.orientation).toBe('any');
      expect(manifest.scope).toBe('/');
    });

    it('should use default theme color', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(manifest.theme_color).toBe('#3b82f6');
      expect(manifest.background_color).toBe('#ffffff');
    });

    it('should use custom theme color', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
        themeColor: '#10b981',
        backgroundColor: '#000000',
      });

      expect(manifest.theme_color).toBe('#10b981');
      expect(manifest.background_color).toBe('#000000');
    });

    it('should include description when provided', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
        description: 'A test application',
      });

      expect(manifest.description).toBe('A test application');
    });

    it('should have default start_url', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(manifest.start_url).toBe('/');
    });

    it('should use custom start_url', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
        startUrl: '/app',
      });

      expect(manifest.start_url).toBe('/app');
    });

    it('should include standard icons', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(manifest.icons).toHaveLength(3);
      expect(manifest.icons?.[0]).toEqual({
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      });
      expect(manifest.icons?.[1]).toEqual({
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      });
      expect(manifest.icons?.[2]).toEqual({
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      });
    });

    it('should include categories', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(manifest.categories).toEqual(['music', 'entertainment', 'utilities']);
    });

    it('should set default lang to en', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(manifest.lang).toBe('en');
    });

    it('should use custom lang', () => {
      const manifest = createDefaultManifest({
        name: 'Test App',
        shortName: 'Test',
        lang: 'ko',
      });

      expect(manifest.lang).toBe('ko');
    });
  });

  describe('createDefaultWorkbox', () => {
    it('should create workbox with default patterns', () => {
      const workbox = createDefaultWorkbox();

      expect(workbox.globPatterns).toContain('**/*.{js,css,html,ico,png,svg,woff,woff2}');
    });

    it('should include additional patterns', () => {
      const workbox = createDefaultWorkbox({
        additionalPatterns: ['**/*.json', '**/*.mp3'],
      });

      expect(workbox.globPatterns).toContain('**/*.json');
      expect(workbox.globPatterns).toContain('**/*.mp3');
    });

    it('should set default navigate fallback', () => {
      const workbox = createDefaultWorkbox();

      expect(workbox.navigateFallback).toBe('/offline.html');
    });

    it('should use custom navigate fallback', () => {
      const workbox = createDefaultWorkbox({
        navigateFallback: '/404.html',
      });

      expect(workbox.navigateFallback).toBe('/404.html');
    });

    it('should exclude /api/ from navigate fallback', () => {
      const workbox = createDefaultWorkbox();

      expect(workbox.navigateFallbackDenylist).toEqual([/^\/api\//]);
    });

    it('should configure runtime caching for Google Fonts', () => {
      const workbox = createDefaultWorkbox();

      const googleFontsCache = workbox.runtimeCaching?.find(
        (cache) => cache.options?.cacheName === 'google-fonts-cache',
      );

      expect(googleFontsCache).toBeDefined();
      expect(googleFontsCache?.handler).toBe('CacheFirst');
    });

    it('should configure runtime caching for images', () => {
      const workbox = createDefaultWorkbox();

      const imagesCache = workbox.runtimeCaching?.find(
        (cache) => cache.options?.cacheName === 'images-cache',
      );

      expect(imagesCache).toBeDefined();
      expect(imagesCache?.handler).toBe('CacheFirst');
      expect(imagesCache?.options?.expiration?.maxEntries).toBe(100);
    });
  });

  describe('createPWAConfig', () => {
    it('should create complete PWA config', () => {
      const config = createPWAConfig({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(config.registerType).toBe('prompt');
      expect(config.manifest).toBeDefined();
      expect(config.workbox).toBeDefined();
    });

    it('should include default assets', () => {
      const config = createPWAConfig({
        name: 'Test App',
        shortName: 'Test',
      });

      expect(config.includeAssets).toContain('favicon.ico');
      expect(config.includeAssets).toContain('robots.txt');
      expect(config.includeAssets).toContain('apple-touch-icon.png');
    });

    it('should allow custom registerType', () => {
      const config = createPWAConfig({
        name: 'Test App',
        shortName: 'Test',
        registerType: 'autoUpdate',
      });

      expect(config.registerType).toBe('autoUpdate');
    });

    it('should allow custom includeAssets', () => {
      const config = createPWAConfig({
        name: 'Test App',
        shortName: 'Test',
        includeAssets: ['custom.ico'],
      });

      expect(config.includeAssets).toEqual(['custom.ico']);
    });
  });

  describe('preset configs', () => {
    it('should have TOOLS_PWA_CONFIG', () => {
      expect(TOOLS_PWA_CONFIG.manifest?.name).toBe('Sound Blue Tools');
      expect(TOOLS_PWA_CONFIG.manifest?.short_name).toBe('SB Tools');
      expect(TOOLS_PWA_CONFIG.manifest?.theme_color).toBe('#3b82f6');
    });

    it('should have MAIN_PWA_CONFIG', () => {
      expect(MAIN_PWA_CONFIG.manifest?.name).toBe('Sound Blue');
      expect(MAIN_PWA_CONFIG.manifest?.short_name).toBe('SoundBlue');
      expect(MAIN_PWA_CONFIG.manifest?.theme_color).toBe('#3b82f6');
    });

    it('should have DIALOGUE_PWA_CONFIG', () => {
      expect(DIALOGUE_PWA_CONFIG.manifest?.name).toBe('Dialogue');
      expect(DIALOGUE_PWA_CONFIG.manifest?.short_name).toBe('Dialogue');
      expect(DIALOGUE_PWA_CONFIG.manifest?.theme_color).toBe('#10b981');
    });
  });
});
