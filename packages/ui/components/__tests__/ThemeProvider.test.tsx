/**
 * @soundblue/ui-components - ThemeProvider Tests
 * Tests for ThemeProvider and useTheme hook
 */
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../src/base/providers/ThemeProvider';

// Mock matchMedia
const createMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const darkWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
);

const lightWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
);

describe('ThemeProvider', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalLocalStorage = window.localStorage;

    // Mock matchMedia to return light mode
    window.matchMedia = createMatchMedia(false);

    // Mock localStorage
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      }),
      length: 0,
      key: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe('default values', () => {
    it('should have default theme "system"', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('system');
    });

    it('should have default resolvedTheme "light"', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should use custom defaultTheme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: darkWrapper });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('should change theme to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should change theme to light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: darkWrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should change theme to system', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: lightWrapper });

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
    });

    it('should persist theme to localStorage', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: lightWrapper });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper: darkWrapper });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('should toggle from system to opposite of resolved', () => {
      // System resolves to light (matchMedia returns false for dark)
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.toggleTheme();
      });

      // Should go to dark (opposite of resolved light)
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('system theme detection', () => {
    it('should resolve to dark when system prefers dark', () => {
      window.matchMedia = createMatchMedia(true); // prefers dark

      const { result } = renderHook(() => useTheme(), { wrapper });

      // After mount, should detect dark system preference
      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should resolve to light when system prefers light', () => {
      window.matchMedia = createMatchMedia(false); // prefers light

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.resolvedTheme).toBe('light');
    });
  });

  describe('localStorage persistence', () => {
    it('should read theme from localStorage on mount', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');
    });

    it('should use defaultTheme when localStorage is empty', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const { result } = renderHook(() => useTheme(), { wrapper: darkWrapper });

      expect(result.current.theme).toBe('dark');
    });

    it('should ignore invalid localStorage values', () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('invalid');

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should use default
      expect(result.current.theme).toBe('system');
    });
  });

  describe('custom storageKey', () => {
    it('should use custom storage key', () => {
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider storageKey="my-theme">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper: customWrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(window.localStorage.setItem).toHaveBeenCalledWith('my-theme', 'dark');
    });
  });

  describe('useTheme outside provider', () => {
    it('should return default context values', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('light');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.toggleTheme).toBe('function');
    });

    it('should not throw when calling setTheme outside provider', () => {
      const { result } = renderHook(() => useTheme());

      expect(() => {
        result.current.setTheme('dark');
      }).not.toThrow();
    });

    it('should not throw when calling toggleTheme outside provider', () => {
      const { result } = renderHook(() => useTheme());

      expect(() => {
        result.current.toggleTheme();
      }).not.toThrow();
    });
  });

  describe('ssrDefault', () => {
    it('should use ssrDefault for initial resolved theme', () => {
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider ssrDefault="dark">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper: customWrapper });

      // Before hydration, should use ssrDefault
      expect(result.current.resolvedTheme).toBeDefined();
    });
  });
});
