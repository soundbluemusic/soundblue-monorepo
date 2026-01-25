/**
 * @soundblue/i18n - Context Tests
 * Tests for LocaleProvider and useLocaleContext
 */
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LocaleProvider, useLocaleContext } from '../src/context';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
);

const wrapperWithKo = ({ children }: { children: ReactNode }) => (
  <LocaleProvider initialLocale="ko">{children}</LocaleProvider>
);

describe('@soundblue/i18n context', () => {
  describe('LocaleProvider', () => {
    it('should provide default locale "en"', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.locale).toBe('en');
    });

    it('should provide custom initial locale', () => {
      const { result } = renderHook(() => useLocaleContext(), {
        wrapper: wrapperWithKo,
      });
      expect(result.current.locale).toBe('ko');
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useLocaleContext());
      }).toThrow('useLocaleContext must be used within a LocaleProvider');
    });
  });

  describe('setLocale', () => {
    it('should change locale to ko', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });

      act(() => {
        result.current.setLocale('ko');
      });

      expect(result.current.locale).toBe('ko');
    });

    it('should change locale back to en', () => {
      const { result } = renderHook(() => useLocaleContext(), {
        wrapper: wrapperWithKo,
      });

      act(() => {
        result.current.setLocale('en');
      });

      expect(result.current.locale).toBe('en');
    });

    it('should call onLocaleChange callback', () => {
      const onLocaleChange = vi.fn();
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <LocaleProvider onLocaleChange={onLocaleChange}>{children}</LocaleProvider>
      );

      const { result } = renderHook(() => useLocaleContext(), {
        wrapper: customWrapper,
      });

      act(() => {
        result.current.setLocale('ko');
      });

      expect(onLocaleChange).toHaveBeenCalledWith('ko');
    });

    it('should not change to unsupported locale', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });

      act(() => {
        // @ts-expect-error - Testing invalid locale
        result.current.setLocale('fr');
      });

      // Should remain unchanged
      expect(result.current.locale).toBe('en');
    });
  });

  describe('isSupported', () => {
    it('should return true for "en"', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.isSupported('en')).toBe(true);
    });

    it('should return true for "ko"', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.isSupported('ko')).toBe(true);
    });

    it('should return false for unsupported locale', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.isSupported('fr')).toBe(false);
      expect(result.current.isSupported('ja')).toBe(false);
      expect(result.current.isSupported('')).toBe(false);
    });
  });

  describe('getLocaleFromPath', () => {
    it('should extract "ko" from Korean path', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.getLocaleFromPath('/ko/about')).toBe('ko');
    });

    it('should extract "en" from English path', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.getLocaleFromPath('/en/about')).toBe('en');
    });

    it('should return null for path without locale', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.getLocaleFromPath('/about')).toBe(null);
    });

    it('should return null for empty path', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.getLocaleFromPath('/')).toBe(null);
    });

    it('should return null for unsupported locale in path', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.getLocaleFromPath('/fr/about')).toBe(null);
    });

    it('should handle nested paths', () => {
      const { result } = renderHook(() => useLocaleContext(), { wrapper });
      expect(result.current.getLocaleFromPath('/ko/tools/translator')).toBe('ko');
    });
  });
});
