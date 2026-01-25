/**
 * @soundblue/i18n - Utils Tests
 * Tests for browser-specific locale utilities
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBrowserLocale } from '../src/utils';

describe('@soundblue/i18n utils', () => {
  describe('getBrowserLocale', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should return "en" when navigator is undefined (SSR)', () => {
      vi.stubGlobal('navigator', undefined);
      const result = getBrowserLocale();
      expect(result).toBe('en');
    });

    it('should return "en" for English browser language', () => {
      vi.stubGlobal('navigator', { language: 'en-US' });
      const result = getBrowserLocale();
      expect(result).toBe('en');
    });

    it('should return "ko" for Korean browser language', () => {
      vi.stubGlobal('navigator', { language: 'ko-KR' });
      const result = getBrowserLocale();
      expect(result).toBe('ko');
    });

    it('should return "ko" for simple Korean locale', () => {
      vi.stubGlobal('navigator', { language: 'ko' });
      const result = getBrowserLocale();
      expect(result).toBe('ko');
    });

    it('should return default "en" for unsupported language', () => {
      vi.stubGlobal('navigator', { language: 'fr-FR' });
      const result = getBrowserLocale();
      expect(result).toBe('en');
    });

    it('should return default "en" for Japanese', () => {
      vi.stubGlobal('navigator', { language: 'ja-JP' });
      const result = getBrowserLocale();
      expect(result).toBe('en');
    });

    it('should handle empty language string', () => {
      vi.stubGlobal('navigator', { language: '' });
      const result = getBrowserLocale();
      expect(result).toBe('en');
    });

    it('should handle language with only region code', () => {
      vi.stubGlobal('navigator', { language: '-US' });
      const result = getBrowserLocale();
      expect(result).toBe('en');
    });
  });
});
