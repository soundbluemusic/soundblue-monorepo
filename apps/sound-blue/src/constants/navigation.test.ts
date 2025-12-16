import { describe, expect, it } from 'vitest';
import {
  EXTERNAL_NAV_ITEMS,
  isNavActive,
  NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
} from './navigation';

describe('navigation constants', () => {
  describe('NAV_ITEMS', () => {
    it('should have home and sitemap items', () => {
      expect(NAV_ITEMS.length).toBeGreaterThanOrEqual(2);
      expect(NAV_ITEMS.some((item) => item.labelKey === 'home')).toBe(true);
      expect(NAV_ITEMS.some((item) => item.labelKey === 'sitemap')).toBe(true);
    });

    it('should have valid paths', () => {
      for (const item of NAV_ITEMS) {
        expect(item.path).toMatch(/^\//);
      }
    });

    it('should have icons', () => {
      for (const item of NAV_ITEMS) {
        expect(item.icon).toBeDefined();
      }
    });
  });

  describe('EXTERNAL_NAV_ITEMS', () => {
    it('should have external URLs', () => {
      for (const item of EXTERNAL_NAV_ITEMS) {
        expect(item.url).toMatch(/^https?:\/\//);
      }
    });

    it('should have icons', () => {
      for (const item of EXTERNAL_NAV_ITEMS) {
        expect(item.icon).toBeDefined();
      }
    });
  });

  describe('PRIMARY_NAV_ITEMS', () => {
    it('should have 4 items for mobile bottom nav', () => {
      expect(PRIMARY_NAV_ITEMS.length).toBe(4);
    });

    it('should have home item', () => {
      expect(PRIMARY_NAV_ITEMS.some((item) => item.labelKey === 'home')).toBe(true);
    });

    it('should have about item', () => {
      expect(PRIMARY_NAV_ITEMS.some((item) => item.labelKey === 'about')).toBe(true);
    });

    it('should have news item', () => {
      expect(PRIMARY_NAV_ITEMS.some((item) => item.labelKey === 'news')).toBe(true);
    });

    it('should have chat item', () => {
      expect(PRIMARY_NAV_ITEMS.some((item) => item.labelKey === 'chat')).toBe(true);
    });

    it('should have valid paths', () => {
      for (const item of PRIMARY_NAV_ITEMS) {
        expect(item.path).toMatch(/^\//);
      }
    });

    it('should have icons', () => {
      for (const item of PRIMARY_NAV_ITEMS) {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe('function');
      }
    });
  });

  describe('SECONDARY_NAV_ITEMS', () => {
    it('should have 4 items for more menu', () => {
      expect(SECONDARY_NAV_ITEMS.length).toBe(4);
    });

    it('should have blog item', () => {
      expect(SECONDARY_NAV_ITEMS.some((item) => item.labelKey === 'blog')).toBe(true);
    });

    it('should have soundRecording item', () => {
      expect(SECONDARY_NAV_ITEMS.some((item) => item.labelKey === 'soundRecording')).toBe(true);
    });

    it('should have builtWith item', () => {
      expect(SECONDARY_NAV_ITEMS.some((item) => item.labelKey === 'builtWith')).toBe(true);
    });

    it('should have sitemap item', () => {
      expect(SECONDARY_NAV_ITEMS.some((item) => item.labelKey === 'sitemap')).toBe(true);
    });

    it('should have valid paths', () => {
      for (const item of SECONDARY_NAV_ITEMS) {
        expect(item.path).toMatch(/^\//);
      }
    });

    it('should have icons', () => {
      for (const item of SECONDARY_NAV_ITEMS) {
        expect(item.icon).toBeDefined();
        expect(typeof item.icon).toBe('function');
      }
    });
  });

  describe('isNavActive', () => {
    const mockLocalizedPath = (path: string) => path;
    const mockKoLocalizedPath = (path: string) => (path === '/' ? '/ko/' : `/ko${path}/`);

    it('should return true for exact match', () => {
      expect(isNavActive('/sitemap', '/sitemap', mockLocalizedPath)).toBe(true);
    });

    it('should return true for home path variations', () => {
      expect(isNavActive('/', '/', mockLocalizedPath)).toBe(true);
      expect(isNavActive('/', '/ko', mockLocalizedPath)).toBe(true);
      expect(isNavActive('/', '/ko/', mockLocalizedPath)).toBe(true);
    });

    it('should return false for non-matching paths', () => {
      expect(isNavActive('/sitemap', '/privacy', mockLocalizedPath)).toBe(false);
      expect(isNavActive('/sitemap', '/', mockLocalizedPath)).toBe(false);
    });

    it('should return true for nested paths', () => {
      expect(isNavActive('/sitemap', '/sitemap/', mockLocalizedPath)).toBe(true);
    });

    it('should work with Korean localized paths', () => {
      expect(isNavActive('/sitemap', '/ko/sitemap/', mockKoLocalizedPath)).toBe(true);
    });
  });
});
