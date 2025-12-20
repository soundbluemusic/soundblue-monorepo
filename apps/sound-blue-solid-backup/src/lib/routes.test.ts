/**
 * @fileoverview Tests for route type utilities
 */

import { describe, expect, it } from 'vitest';
import {
  createLocalizedPath,
  getBasePath,
  isAppRoute,
  isExternalUrl,
  isKoreanRoute,
  isPageRoute,
  PAGE_ROUTES,
} from './routes';

describe('routes utilities', () => {
  // ============================================================================
  // PAGE_ROUTES Tests
  // ============================================================================

  describe('PAGE_ROUTES', () => {
    it('should contain all expected routes', () => {
      expect(PAGE_ROUTES).toContain('/');
      expect(PAGE_ROUTES).toContain('/about');
      expect(PAGE_ROUTES).toContain('/news');
      expect(PAGE_ROUTES).toContain('/blog');
      expect(PAGE_ROUTES).toContain('/built-with');
      expect(PAGE_ROUTES).toContain('/chat');
      expect(PAGE_ROUTES).toContain('/privacy');
      expect(PAGE_ROUTES).toContain('/terms');
      expect(PAGE_ROUTES).toContain('/license');
      expect(PAGE_ROUTES).toContain('/sitemap');
      expect(PAGE_ROUTES).toContain('/sound-recording');
      expect(PAGE_ROUTES).toContain('/offline');
    });

    it('should have the expected number of routes', () => {
      // as const provides compile-time immutability, not runtime freezing
      expect(PAGE_ROUTES.length).toBe(12);
    });
  });

  // ============================================================================
  // isPageRoute Tests
  // ============================================================================

  describe('isPageRoute', () => {
    it('should return true for valid page routes', () => {
      expect(isPageRoute('/')).toBe(true);
      expect(isPageRoute('/about')).toBe(true);
      expect(isPageRoute('/news')).toBe(true);
      expect(isPageRoute('/blog')).toBe(true);
      expect(isPageRoute('/built-with')).toBe(true);
      expect(isPageRoute('/chat')).toBe(true);
      expect(isPageRoute('/privacy')).toBe(true);
      expect(isPageRoute('/terms')).toBe(true);
      expect(isPageRoute('/license')).toBe(true);
      expect(isPageRoute('/sitemap')).toBe(true);
      expect(isPageRoute('/sound-recording')).toBe(true);
      expect(isPageRoute('/offline')).toBe(true);
    });

    it('should return false for invalid routes', () => {
      expect(isPageRoute('/invalid')).toBe(false);
      expect(isPageRoute('/ko')).toBe(false);
      expect(isPageRoute('/ko/about')).toBe(false);
      expect(isPageRoute('')).toBe(false);
      expect(isPageRoute('about')).toBe(false);
      expect(isPageRoute('/About')).toBe(false);
    });
  });

  // ============================================================================
  // isKoreanRoute Tests
  // ============================================================================

  describe('isKoreanRoute', () => {
    it('should return true for /ko', () => {
      expect(isKoreanRoute('/ko')).toBe(true);
    });

    it('should return true for valid Korean routes', () => {
      expect(isKoreanRoute('/ko/')).toBe(true);
      expect(isKoreanRoute('/ko/about')).toBe(true);
      expect(isKoreanRoute('/ko/news')).toBe(true);
      expect(isKoreanRoute('/ko/blog')).toBe(true);
      expect(isKoreanRoute('/ko/sitemap')).toBe(true);
    });

    it('should return false for English routes', () => {
      expect(isKoreanRoute('/')).toBe(false);
      expect(isKoreanRoute('/about')).toBe(false);
      expect(isKoreanRoute('/news')).toBe(false);
    });

    it('should return false for invalid Korean routes', () => {
      expect(isKoreanRoute('/ko/invalid')).toBe(false);
      expect(isKoreanRoute('/korean')).toBe(false);
      expect(isKoreanRoute('/ko-KR/about')).toBe(false);
    });
  });

  // ============================================================================
  // isAppRoute Tests
  // ============================================================================

  describe('isAppRoute', () => {
    it('should return true for English routes', () => {
      expect(isAppRoute('/')).toBe(true);
      expect(isAppRoute('/about')).toBe(true);
      expect(isAppRoute('/news')).toBe(true);
    });

    it('should return true for Korean routes', () => {
      expect(isAppRoute('/ko')).toBe(true);
      expect(isAppRoute('/ko/about')).toBe(true);
      expect(isAppRoute('/ko/news')).toBe(true);
    });

    it('should return false for invalid routes', () => {
      expect(isAppRoute('/invalid')).toBe(false);
      expect(isAppRoute('/en/about')).toBe(false);
      expect(isAppRoute('')).toBe(false);
    });
  });

  // ============================================================================
  // isExternalUrl Tests
  // ============================================================================

  describe('isExternalUrl', () => {
    it('should return true for https URLs', () => {
      expect(isExternalUrl('https://example.com')).toBe(true);
      expect(isExternalUrl('https://soundbluemusic.com')).toBe(true);
      expect(isExternalUrl('https://tools.soundbluemusic.com')).toBe(true);
    });

    it('should return true for http URLs', () => {
      expect(isExternalUrl('http://example.com')).toBe(true);
      expect(isExternalUrl('http://localhost:3000')).toBe(true);
    });

    it('should return false for internal paths', () => {
      expect(isExternalUrl('/about')).toBe(false);
      expect(isExternalUrl('/')).toBe(false);
      expect(isExternalUrl('/ko/about')).toBe(false);
    });

    it('should return false for other protocols', () => {
      expect(isExternalUrl('ftp://example.com')).toBe(false);
      expect(isExternalUrl('mailto:test@example.com')).toBe(false);
      expect(isExternalUrl('javascript:void(0)')).toBe(false);
    });
  });

  // ============================================================================
  // getBasePath Tests
  // ============================================================================

  describe('getBasePath', () => {
    it('should return path as-is for English routes', () => {
      expect(getBasePath('/')).toBe('/');
      expect(getBasePath('/about')).toBe('/about');
      expect(getBasePath('/news')).toBe('/news');
    });

    it('should strip /ko prefix from Korean routes', () => {
      expect(getBasePath('/ko')).toBe('/');
      expect(getBasePath('/ko/')).toBe('/');
      expect(getBasePath('/ko/about')).toBe('/about');
      expect(getBasePath('/ko/news')).toBe('/news');
    });

    it('should handle trailing slashes', () => {
      expect(getBasePath('/about/')).toBe('/about');
      expect(getBasePath('/ko/about/')).toBe('/about');
    });

    it('should preserve root path', () => {
      expect(getBasePath('/')).toBe('/');
      expect(getBasePath('/ko')).toBe('/');
    });
  });

  // ============================================================================
  // createLocalizedPath Tests
  // ============================================================================

  describe('createLocalizedPath', () => {
    it('should create English paths when isKorean is false', () => {
      expect(createLocalizedPath('/', false)).toBe('/');
      expect(createLocalizedPath('/about', false)).toBe('/about/');
      expect(createLocalizedPath('/news', false)).toBe('/news/');
    });

    it('should create Korean paths when isKorean is true', () => {
      expect(createLocalizedPath('/', true)).toBe('/ko/');
      expect(createLocalizedPath('/about', true)).toBe('/ko/about/');
      expect(createLocalizedPath('/news', true)).toBe('/ko/news/');
    });

    it('should handle paths without leading slash', () => {
      expect(createLocalizedPath('/about', false)).toBe('/about/');
      expect(createLocalizedPath('/about', true)).toBe('/ko/about/');
    });

    it('should add trailing slash', () => {
      expect(createLocalizedPath('/about', false)).toMatch(/\/$/);
      expect(createLocalizedPath('/about', true)).toMatch(/\/$/);
    });
  });
});
