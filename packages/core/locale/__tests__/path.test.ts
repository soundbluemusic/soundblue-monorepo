/**
 * @soundblue/locale - Path Utilities Tests
 * Tests for locale path manipulation functions
 */
import { describe, expect, it } from 'vitest';
import {
  buildLocalizedPath,
  getLocaleFromPath,
  getLocalizedPath,
  getOppositeLocale,
  isKoreanPath,
  isValidLocale,
  parseLocalePath,
  removeLocaleFromPath,
} from '../src/path';

describe('@soundblue/locale path utilities', () => {
  describe('isValidLocale', () => {
    it('should return true for valid locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('ko')).toBe(true);
    });

    it('should return false for invalid locales', () => {
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('jp')).toBe(false);
      expect(isValidLocale('')).toBe(false);
      expect(isValidLocale('english')).toBe(false);
    });
  });

  describe('getLocaleFromPath', () => {
    it('should detect Korean locale', () => {
      expect(getLocaleFromPath('/ko')).toBe('ko');
      expect(getLocaleFromPath('/ko/')).toBe('ko');
      expect(getLocaleFromPath('/ko/about')).toBe('ko');
      expect(getLocaleFromPath('/ko/tools/translator')).toBe('ko');
    });

    it('should default to English', () => {
      expect(getLocaleFromPath('/')).toBe('en');
      expect(getLocaleFromPath('/about')).toBe('en');
      expect(getLocaleFromPath('/tools/translator')).toBe('en');
    });

    it('should not match partial paths like /korean', () => {
      expect(getLocaleFromPath('/korean')).toBe('en');
      expect(getLocaleFromPath('/korean-food')).toBe('en');
    });
  });

  describe('buildLocalizedPath', () => {
    it('should build Korean path', () => {
      expect(buildLocalizedPath('/about', 'ko')).toBe('/ko/about');
      expect(buildLocalizedPath('/', 'ko')).toBe('/ko/');
    });

    it('should build English path', () => {
      expect(buildLocalizedPath('/about', 'en')).toBe('/en/about');
    });

    it('should replace existing locale', () => {
      expect(buildLocalizedPath('/ko/about', 'en')).toBe('/en/about');
      expect(buildLocalizedPath('/en/about', 'ko')).toBe('/ko/about');
    });
  });

  describe('removeLocaleFromPath', () => {
    it('should remove Korean locale prefix', () => {
      expect(removeLocaleFromPath('/ko/about')).toBe('/about');
      expect(removeLocaleFromPath('/ko')).toBe('/');
      expect(removeLocaleFromPath('/ko/')).toBe('/');
    });

    it('should remove English locale prefix', () => {
      expect(removeLocaleFromPath('/en/about')).toBe('/about');
    });

    it('should keep paths without locale prefix', () => {
      expect(removeLocaleFromPath('/about')).toBe('/about');
      expect(removeLocaleFromPath('/')).toBe('/');
    });

    it('should handle paths without leading slash', () => {
      expect(removeLocaleFromPath('about')).toBe('/about');
    });
  });

  describe('getOppositeLocale', () => {
    it('should return opposite locale', () => {
      expect(getOppositeLocale('en')).toBe('ko');
      expect(getOppositeLocale('ko')).toBe('en');
    });
  });

  describe('getLocalizedPath', () => {
    it('should return path without prefix for English', () => {
      expect(getLocalizedPath('/about', 'en')).toBe('/about');
      expect(getLocalizedPath('/', 'en')).toBe('/');
      expect(getLocalizedPath('/ko/about', 'en')).toBe('/about');
    });

    it('should add /ko prefix for Korean', () => {
      expect(getLocalizedPath('/about', 'ko')).toBe('/ko/about');
      expect(getLocalizedPath('/', 'ko')).toBe('/ko');
      expect(getLocalizedPath('/en/about', 'ko')).toBe('/ko/about');
    });

    it('should not match partial paths like /english-spell-checker', () => {
      expect(getLocalizedPath('/english-spell-checker', 'ko')).toBe('/ko/english-spell-checker');
      expect(getLocalizedPath('/en/about', 'en')).toBe('/about');
    });
  });

  describe('parseLocalePath', () => {
    it('should parse Korean paths', () => {
      expect(parseLocalePath('/ko/about')).toEqual({
        locale: 'ko',
        basePath: '/about',
      });
      expect(parseLocalePath('/ko')).toEqual({
        locale: 'ko',
        basePath: '/',
      });
    });

    it('should parse English paths', () => {
      expect(parseLocalePath('/about')).toEqual({
        locale: 'en',
        basePath: '/about',
      });
      expect(parseLocalePath('/')).toEqual({
        locale: 'en',
        basePath: '/',
      });
    });
  });

  describe('isKoreanPath', () => {
    it('should return true for Korean paths', () => {
      expect(isKoreanPath('/ko')).toBe(true);
      expect(isKoreanPath('/ko/')).toBe(true);
      expect(isKoreanPath('/ko/about')).toBe(true);
    });

    it('should return false for non-Korean paths', () => {
      expect(isKoreanPath('/')).toBe(false);
      expect(isKoreanPath('/about')).toBe(false);
      expect(isKoreanPath('/korean')).toBe(false);
      expect(isKoreanPath('/korean-food')).toBe(false);
    });
  });
});
