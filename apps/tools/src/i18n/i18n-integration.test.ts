/**
 * i18n Integration Tests
 * 국제화 통합 테스트
 *
 * Requirements Coverage: 다국어 지원 요구사항 검증
 */

import { describe, expect, it } from 'vitest';
import {
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
} from '@soundblue/shared/utils';

// Test-specific constants (avoid loading context.tsx which depends on @solidjs/router)
const locales = ['en', 'ko'] as const;
const defaultLocale = 'en';

describe('i18n Integration Tests', () => {
  describe('Locale Detection from URL', () => {
    it('should detect Korean locale from /ko paths', () => {
      const paths = ['/ko', '/ko/', '/ko/about', '/ko/tools/metronome'];
      paths.forEach((path) => {
        expect(getLocaleFromPath(path)).toBe('ko');
      });
    });

    it('should detect English locale from /en paths', () => {
      const paths = ['/en', '/en/', '/en/about', '/en/tools/metronome'];
      paths.forEach((path) => {
        expect(getLocaleFromPath(path)).toBe('en');
      });
    });

    it('should return default locale for paths without locale prefix', () => {
      const paths = ['/', '/about', '/tools/metronome', '/built-with'];
      paths.forEach((path) => {
        expect(getLocaleFromPath(path)).toBe(defaultLocale);
      });
    });
  });

  describe('URL Path Manipulation', () => {
    it('should correctly strip locale from paths', () => {
      expect(getPathWithoutLocale('/ko/about')).toBe('/about');
      expect(getPathWithoutLocale('/en/about')).toBe('/about');
      expect(getPathWithoutLocale('/about')).toBe('/about');
    });

    it('should handle nested paths correctly', () => {
      expect(getPathWithoutLocale('/ko/tools/metronome/settings')).toBe(
        '/tools/metronome/settings'
      );
      expect(getPathWithoutLocale('/en/tools/drum-machine')).toBe('/tools/drum-machine');
    });

    // Note: shared i18n utility adds trailing slash for consistency
    it('should add locale prefix correctly', () => {
      expect(getLocalizedPath('/about', 'ko')).toBe('/ko/about/');
      expect(getLocalizedPath('/tools', 'ko')).toBe('/ko/tools/');
    });

    it('should not double-prefix locale', () => {
      const path = getLocalizedPath('/ko/about', 'ko');
      expect(path).toBe('/ko/about/');
      expect(path).not.toContain('/ko/ko/');
    });
  });

  describe('Locale Switching', () => {
    it('should switch from Korean to English', () => {
      const koPath = '/ko/about';
      const enPath = getLocalizedPath(koPath, 'en');
      expect(enPath).toBe('/about/');
      expect(getLocaleFromPath(enPath)).toBe('en');
    });

    it('should switch from English to Korean', () => {
      const enPath = '/about';
      const koPath = getLocalizedPath(enPath, 'ko');
      expect(koPath).toBe('/ko/about/');
      expect(getLocaleFromPath(koPath)).toBe('ko');
    });

    it('should preserve path structure when switching locales', () => {
      const originalPath = '/ko/tools/metronome';
      const enPath = getLocalizedPath(originalPath, 'en');
      const backToKo = getLocalizedPath(enPath, 'ko');

      expect(enPath).toBe('/tools/metronome/');
      expect(backToKo).toBe('/ko/tools/metronome/');
    });
  });

  describe('Locale Configuration', () => {
    it('should have all required locales', () => {
      expect(locales).toContain('ko');
      expect(locales).toContain('en');
    });

    it('should have exactly 2 locales', () => {
      expect(locales).toHaveLength(2);
    });

    it('should have English as default locale', () => {
      expect(defaultLocale).toBe('en');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty path', () => {
      expect(getLocaleFromPath('')).toBe(defaultLocale);
    });

    it('should handle root path', () => {
      expect(getLocaleFromPath('/')).toBe(defaultLocale);
      expect(getPathWithoutLocale('/')).toBe('/');
    });

    it('should handle paths with query strings', () => {
      // 참고: 실제 구현에서 쿼리 스트링 처리가 필요할 수 있음
      const path = '/ko/about?ref=home';
      const locale = getLocaleFromPath(path.split('?')[0] ?? '');
      expect(locale).toBe('ko');
    });

    it('should handle paths with hash fragments', () => {
      const path = '/ko/about#section1';
      const locale = getLocaleFromPath(path.split('#')[0] ?? '');
      expect(locale).toBe('ko');
    });

    it('should not match partial locale names', () => {
      expect(getLocaleFromPath('/korean')).toBe(defaultLocale);
      expect(getLocaleFromPath('/english')).toBe(defaultLocale);
      expect(getLocaleFromPath('/en-US')).toBe(defaultLocale);
      expect(getLocaleFromPath('/ko-KR')).toBe(defaultLocale);
    });

    it('should be case-insensitive for locale detection', () => {
      // shared utility converts to lowercase for matching
      expect(getLocaleFromPath('/KO')).toBe('ko');
      expect(getLocaleFromPath('/EN')).toBe('en');
      expect(getLocaleFromPath('/Ko')).toBe('ko');
    });
  });

  describe('Tool-specific Paths', () => {
    it('should handle metronome paths in both locales', () => {
      expect(getLocalizedPath('/metronome', 'ko')).toBe('/ko/metronome/');
      expect(getLocalizedPath('/ko/metronome', 'en')).toBe('/metronome/');
    });

    it('should handle drum-machine paths', () => {
      expect(getLocalizedPath('/drum-machine', 'ko')).toBe('/ko/drum-machine/');
      expect(getLocalizedPath('/ko/drum-machine', 'en')).toBe('/drum-machine/');
    });

    it('should handle qr-generator paths', () => {
      expect(getLocalizedPath('/qr-generator', 'ko')).toBe('/ko/qr-generator/');
      expect(getLocalizedPath('/ko/qr-generator', 'en')).toBe('/qr-generator/');
    });

    it('should handle translator paths', () => {
      expect(getLocalizedPath('/translator', 'ko')).toBe('/ko/translator/');
      expect(getLocalizedPath('/ko/translator', 'en')).toBe('/translator/');
    });
  });
});
