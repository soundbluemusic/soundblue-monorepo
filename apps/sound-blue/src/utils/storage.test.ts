import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRawStorageItem,
  getStorageItem,
  removeStorageItem,
  setRawStorageItem,
  setStorageItem,
} from './storage';

interface LocalStorageMock {
  getItem: Mock<(key: string) => string | null>;
  setItem: Mock<(key: string, value: string) => void>;
  removeItem: Mock<(key: string) => void>;
  clear: () => void;
}

function createLocalStorageMock(): LocalStorageMock {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: (): void => {
      store = {};
    },
  };
}

describe('storage utilities', () => {
  // Mock localStorage
  const localStorageMock: LocalStorageMock = createLocalStorageMock();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getStorageItem', () => {
    it('should return default value when item does not exist', () => {
      expect(getStorageItem('sb-theme', 'light')).toBe('light');
    });

    it('should return parsed JSON value when item exists', () => {
      localStorageMock.setItem('sb-theme', JSON.stringify('dark'));
      expect(getStorageItem('sb-theme', 'light')).toBe('dark');
    });

    it('should return default value when JSON parsing fails', () => {
      localStorageMock.setItem('sb-theme', 'invalid-json{');
      expect(getStorageItem('sb-theme', 'light')).toBe('light');
    });

    it('should handle complex objects', () => {
      const obj = { foo: 'bar', nested: { a: 1 } };
      localStorageMock.setItem('sb-language', JSON.stringify(obj));
      expect(getStorageItem('sb-language', {})).toEqual(obj);
    });
  });

  describe('setStorageItem', () => {
    it('should store JSON stringified value', () => {
      setStorageItem('sb-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-theme', '"dark"');
    });

    it('should handle complex objects', () => {
      const obj = { foo: 'bar' };
      setStorageItem('sb-language', obj);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-language', '{"foo":"bar"}');
    });
  });

  describe('removeStorageItem', () => {
    it('should remove item from localStorage', () => {
      localStorageMock.setItem('sb-theme', '"dark"');
      removeStorageItem('sb-theme');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sb-theme');
    });
  });

  describe('getRawStorageItem', () => {
    it('should return null when item does not exist', () => {
      expect(getRawStorageItem('sb-theme')).toBeNull();
    });

    it('should return raw string value', () => {
      localStorageMock.setItem('sb-theme', 'dark');
      expect(getRawStorageItem('sb-theme')).toBe('dark');
    });
  });

  describe('setRawStorageItem', () => {
    it('should store raw string value', () => {
      setRawStorageItem('sb-theme', 'dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-theme', 'dark');
    });
  });

  // ========================================
  // Boundary Value Tests
  // ========================================
  describe('Boundary Value Tests', () => {
    describe('Empty and null values', () => {
      it('should handle empty string as stored value', () => {
        localStorageMock.setItem('sb-theme', '""');
        expect(getStorageItem('sb-theme', 'default')).toBe('');
      });

      it('should handle empty string in raw storage', () => {
        setRawStorageItem('sb-theme', '');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-theme', '');
      });

      it('should return default for null JSON value', () => {
        localStorageMock.setItem('sb-theme', 'null');
        expect(getStorageItem('sb-theme', 'default')).toBeNull();
      });

      it('should handle undefined in object', () => {
        const obj = { a: 1, b: undefined };
        setStorageItem('sb-language', obj);
        // JSON.stringify removes undefined values
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-language', '{"a":1}');
      });
    });

    describe('Large data handling', () => {
      it('should handle very long strings', () => {
        const longString = 'a'.repeat(10000);
        setRawStorageItem('sb-theme', longString);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-theme', longString);
      });

      it('should handle deeply nested objects', () => {
        const deepObject = { l1: { l2: { l3: { l4: { l5: 'deep' } } } } };
        setStorageItem('sb-language', deepObject);
        expect(localStorageMock.setItem).toHaveBeenCalled();
        const stored = getStorageItem('sb-language', {});
        expect(stored).toEqual(deepObject);
      });

      it('should handle large arrays', () => {
        const largeArray = Array.from({ length: 1000 }, (_, i) => i);
        setStorageItem('sb-chat-history', largeArray);
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });

    describe('Special characters', () => {
      it('should handle special characters in strings', () => {
        const specialChars = '한글 日本語 🎵 <script>alert("xss")</script>';
        setRawStorageItem('sb-theme', specialChars);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-theme', specialChars);
      });

      it('should handle newlines and tabs', () => {
        const multiline = 'line1\nline2\ttabbed';
        setStorageItem('sb-language', multiline);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'sb-language',
          '"line1\\nline2\\ttabbed"',
        );
      });

      it('should handle quotes in strings', () => {
        const quoted = 'He said "Hello"';
        setStorageItem('sb-language', quoted);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'sb-language',
          '"He said \\"Hello\\""',
        );
      });
    });

    describe('Type edge cases', () => {
      it('should handle boolean values', () => {
        setStorageItem('sb-language', true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-language', 'true');
        localStorageMock.setItem('sb-language', 'true');
        expect(getStorageItem('sb-language', false)).toBe(true);
      });

      it('should handle number zero', () => {
        setStorageItem('sb-language', 0);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-language', '0');
        localStorageMock.setItem('sb-language', '0');
        expect(getStorageItem('sb-language', 999)).toBe(0);
      });

      it('should handle negative numbers', () => {
        setStorageItem('sb-language', -42);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-language', '-42');
      });

      it('should handle floating point numbers', () => {
        setStorageItem('sb-language', 123.456);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-language', '123.456');
      });

      it('should handle empty array', () => {
        setStorageItem('sb-chat-history', []);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-chat-history', '[]');
      });

      it('should handle empty object', () => {
        setStorageItem('sb-language', {});
        expect(localStorageMock.setItem).toHaveBeenCalledWith('sb-language', '{}');
      });
    });

    describe('Error handling', () => {
      it('should handle localStorage.getItem throwing', () => {
        localStorageMock.getItem.mockImplementationOnce(() => {
          throw new Error('Storage access denied');
        });
        expect(getStorageItem('sb-theme', 'fallback')).toBe('fallback');
      });

      it('should handle localStorage.setItem throwing (quota exceeded)', () => {
        localStorageMock.setItem.mockImplementationOnce(() => {
          throw new Error('QuotaExceededError');
        });
        // Should not throw
        expect(() => setStorageItem('sb-theme', 'value')).not.toThrow();
      });

      it('should handle localStorage.removeItem throwing', () => {
        localStorageMock.removeItem.mockImplementationOnce(() => {
          throw new Error('Storage error');
        });
        // Should not throw
        expect(() => removeStorageItem('sb-theme')).not.toThrow();
      });

      it('should handle malformed JSON gracefully', () => {
        localStorageMock.setItem('sb-language', '{invalid:json}');
        expect(getStorageItem('sb-language', { default: true })).toEqual({ default: true });
      });

      it('should handle truncated JSON gracefully', () => {
        localStorageMock.setItem('sb-language', '{"incomplete":');
        expect(getStorageItem('sb-language', null)).toBeNull();
      });
    });
  });
});
