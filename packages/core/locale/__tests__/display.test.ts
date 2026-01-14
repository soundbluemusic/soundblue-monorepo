/**
 * @soundblue/locale - Display Utilities Tests
 * Tests for locale display name functions
 */
import { describe, expect, it } from 'vitest';
import {
  getHrefLang,
  getHtmlLang,
  getLocaleDisplayName,
  getLocaleNativeName,
  getTextDirection,
} from '../src/display';

describe('@soundblue/locale display utilities', () => {
  describe('getLocaleDisplayName', () => {
    it('should return English names in English', () => {
      expect(getLocaleDisplayName('en', 'en')).toBe('English');
      expect(getLocaleDisplayName('ko', 'en')).toBe('Korean');
    });

    it('should return Korean names in Korean', () => {
      expect(getLocaleDisplayName('en', 'ko')).toBe('영어');
      expect(getLocaleDisplayName('ko', 'ko')).toBe('한국어');
    });

    it('should use locale itself when inLocale not provided', () => {
      expect(getLocaleDisplayName('en')).toBe('English');
      expect(getLocaleDisplayName('ko')).toBe('한국어');
    });
  });

  describe('getLocaleNativeName', () => {
    it('should return native names', () => {
      expect(getLocaleNativeName('en')).toBe('English');
      expect(getLocaleNativeName('ko')).toBe('한국어');
    });
  });

  describe('getHtmlLang', () => {
    it('should return HTML lang attribute value', () => {
      expect(getHtmlLang('en')).toBe('en');
      expect(getHtmlLang('ko')).toBe('ko');
    });
  });

  describe('getHrefLang', () => {
    it('should return hreflang value', () => {
      expect(getHrefLang('en')).toBe('en');
      expect(getHrefLang('ko')).toBe('ko');
    });
  });

  describe('getTextDirection', () => {
    it('should return ltr for all supported locales', () => {
      expect(getTextDirection('en')).toBe('ltr');
      expect(getTextDirection('ko')).toBe('ltr');
    });
  });
});
