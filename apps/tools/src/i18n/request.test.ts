import { describe, expect, it } from 'vitest';
import {
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
} from '@soundblue/shared/utils';

// Test-specific constants (avoid loading context.tsx which depends on @solidjs/router)
const locales = ['en', 'ko'] as const;
const defaultLocale = 'en';

describe('i18n request utilities', () => {
  describe('locales configuration', () => {
    it('should have ko and en as available locales', () => {
      expect(locales).toContain('ko');
      expect(locales).toContain('en');
      expect(locales).toHaveLength(2);
    });

    it('should have en as default locale', () => {
      expect(defaultLocale).toBe('en');
    });
  });

  describe('getLocaleFromPath', () => {
    it('should return ko for Korean paths', () => {
      expect(getLocaleFromPath('/ko')).toBe('ko');
      expect(getLocaleFromPath('/ko/')).toBe('ko');
      expect(getLocaleFromPath('/ko/about')).toBe('ko');
      expect(getLocaleFromPath('/ko/tools/metronome')).toBe('ko');
    });

    it('should return en for English paths', () => {
      expect(getLocaleFromPath('/en')).toBe('en');
      expect(getLocaleFromPath('/en/')).toBe('en');
      expect(getLocaleFromPath('/en/about')).toBe('en');
      expect(getLocaleFromPath('/en/tools/metronome')).toBe('en');
    });

    it('should return default locale for paths without locale prefix', () => {
      expect(getLocaleFromPath('/')).toBe(defaultLocale);
      expect(getLocaleFromPath('/about')).toBe(defaultLocale);
      expect(getLocaleFromPath('/tools/metronome')).toBe(defaultLocale);
    });

    it('should handle empty path', () => {
      expect(getLocaleFromPath('')).toBe(defaultLocale);
    });

    it('should not match partial locale names', () => {
      expect(getLocaleFromPath('/korean')).toBe(defaultLocale);
      expect(getLocaleFromPath('/english')).toBe(defaultLocale);
    });
  });

  describe('getPathWithoutLocale', () => {
    it('should remove ko prefix', () => {
      expect(getPathWithoutLocale('/ko')).toBe('/');
      expect(getPathWithoutLocale('/ko/')).toBe('/');
      expect(getPathWithoutLocale('/ko/about')).toBe('/about');
      expect(getPathWithoutLocale('/ko/tools/metronome')).toBe('/tools/metronome');
    });

    it('should remove en prefix', () => {
      expect(getPathWithoutLocale('/en')).toBe('/');
      expect(getPathWithoutLocale('/en/')).toBe('/');
      expect(getPathWithoutLocale('/en/about')).toBe('/about');
      expect(getPathWithoutLocale('/en/tools/metronome')).toBe('/tools/metronome');
    });

    it('should return path unchanged if no locale prefix', () => {
      expect(getPathWithoutLocale('/')).toBe('/');
      expect(getPathWithoutLocale('/about')).toBe('/about');
      expect(getPathWithoutLocale('/tools/metronome')).toBe('/tools/metronome');
    });

    it('should not remove partial locale names', () => {
      expect(getPathWithoutLocale('/korean')).toBe('/korean');
      expect(getPathWithoutLocale('/english')).toBe('/english');
    });
  });

  describe('getLocalizedPath', () => {
    // Note: shared i18n utility adds trailing slash for consistency
    it('should add ko prefix for Korean locale', () => {
      expect(getLocalizedPath('/', 'ko')).toBe('/ko/');
      expect(getLocalizedPath('/about', 'ko')).toBe('/ko/about/');
      expect(getLocalizedPath('/tools/metronome', 'ko')).toBe('/ko/tools/metronome/');
    });

    it('should return path with trailing slash for default locale (en)', () => {
      expect(getLocalizedPath('/', 'en')).toBe('/');
      expect(getLocalizedPath('/about', 'en')).toBe('/about/');
      expect(getLocalizedPath('/tools/metronome', 'en')).toBe('/tools/metronome/');
    });

    it('should handle paths that already have locale prefix', () => {
      expect(getLocalizedPath('/ko/about', 'en')).toBe('/about/');
      expect(getLocalizedPath('/en/about', 'ko')).toBe('/ko/about/');
      expect(getLocalizedPath('/ko/about', 'ko')).toBe('/ko/about/');
    });

    it('should handle empty paths', () => {
      expect(getLocalizedPath('', 'ko')).toBe('/ko/');
      expect(getLocalizedPath('', 'en')).toBe('/');
    });
  });
});
