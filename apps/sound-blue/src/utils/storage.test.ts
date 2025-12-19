import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRawStorageItem,
  getStorageItem,
  removeStorageItem,
  setRawStorageItem,
  setStorageItem,
} from './storage';

// Mock Dexie for IndexedDB
vi.mock('dexie', () => {
  let store: Record<string, { key: string; value: string; updatedAt: number }> = {};

  const mockTable = {
    get: vi.fn(async (key: string) => store[key] || undefined),
    put: vi.fn(async (item: { key: string; value: string; updatedAt: number }) => {
      store[item.key] = item;
    }),
    delete: vi.fn(async (key: string) => {
      delete store[key];
    }),
  };

  // Expose clear function for tests
  (mockTable as Record<string, unknown>)['clear'] = () => {
    store = {};
  };

  class MockDexie {
    preferences = mockTable;

    constructor() {}

    version() {
      return { stores: () => {} };
    }
  }

  return {
    default: MockDexie,
    __esModule: true,
    _mockTable: mockTable,
  };
});

// Get mock reference and clear function
import * as DexieMock from 'dexie';

const mockTable = (DexieMock as unknown as { _mockTable: { clear: () => void } })._mockTable;

describe('storage utilities', () => {
  beforeEach(() => {
    mockTable.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getStorageItem', () => {
    it('should return default value when item does not exist', async () => {
      const result = await getStorageItem('sb-theme', 'light');
      expect(result).toBe('light');
    });

    it('should return parsed JSON value when item exists', async () => {
      await setStorageItem('sb-theme', 'dark');
      const result = await getStorageItem('sb-theme', 'light');
      expect(result).toBe('dark');
    });

    it('should handle complex objects', async () => {
      const obj = { foo: 'bar', nested: { a: 1 } };
      await setStorageItem('sb-language', obj);
      const result = await getStorageItem('sb-language', {});
      expect(result).toEqual(obj);
    });
  });

  describe('setStorageItem', () => {
    it('should store JSON stringified value', async () => {
      await setStorageItem('sb-theme', 'dark');
      const result = await getStorageItem('sb-theme', 'light');
      expect(result).toBe('dark');
    });

    it('should handle complex objects', async () => {
      const obj = { foo: 'bar' };
      await setStorageItem('sb-language', obj);
      const result = await getStorageItem('sb-language', {});
      expect(result).toEqual(obj);
    });
  });

  describe('removeStorageItem', () => {
    it('should remove item from storage', async () => {
      await setStorageItem('sb-theme', 'dark');
      await removeStorageItem('sb-theme');
      const result = await getStorageItem('sb-theme', 'light');
      expect(result).toBe('light');
    });
  });

  describe('getRawStorageItem', () => {
    it('should return null when item does not exist', async () => {
      const result = await getRawStorageItem('sb-theme');
      expect(result).toBeNull();
    });

    it('should return raw string value', async () => {
      await setRawStorageItem('sb-theme', 'dark');
      const result = await getRawStorageItem('sb-theme');
      expect(result).toBe('dark');
    });
  });

  describe('setRawStorageItem', () => {
    it('should store raw string value', async () => {
      await setRawStorageItem('sb-theme', 'dark');
      const result = await getRawStorageItem('sb-theme');
      expect(result).toBe('dark');
    });
  });

  // ========================================
  // Boundary Value Tests
  // ========================================
  describe('Boundary Value Tests', () => {
    describe('Empty and null values', () => {
      it('should handle empty string as stored value', async () => {
        await setStorageItem('sb-theme', '');
        const result = await getStorageItem('sb-theme', 'default');
        expect(result).toBe('');
      });

      it('should handle empty string in raw storage', async () => {
        await setRawStorageItem('sb-theme', '');
        const result = await getRawStorageItem('sb-theme');
        expect(result).toBe('');
      });
    });

    describe('Large data handling', () => {
      it('should handle very long strings', async () => {
        const longString = 'a'.repeat(10000);
        await setRawStorageItem('sb-theme', longString);
        const result = await getRawStorageItem('sb-theme');
        expect(result).toBe(longString);
      });

      it('should handle deeply nested objects', async () => {
        const deepObject = { l1: { l2: { l3: { l4: { l5: 'deep' } } } } };
        await setStorageItem('sb-language', deepObject);
        const result = await getStorageItem('sb-language', {});
        expect(result).toEqual(deepObject);
      });

      it('should handle large arrays', async () => {
        const largeArray = Array.from({ length: 1000 }, (_, i) => i);
        await setStorageItem('sb-chat-history', largeArray);
        const result = await getStorageItem('sb-chat-history', []);
        expect(result).toEqual(largeArray);
      });
    });

    describe('Special characters', () => {
      it('should handle special characters in strings', async () => {
        const specialChars = '한글 日本語 🎵 <script>alert("xss")</script>';
        await setRawStorageItem('sb-theme', specialChars);
        const result = await getRawStorageItem('sb-theme');
        expect(result).toBe(specialChars);
      });

      it('should handle newlines and tabs', async () => {
        const multiline = 'line1\nline2\ttabbed';
        await setStorageItem('sb-language', multiline);
        const result = await getStorageItem('sb-language', '');
        expect(result).toBe(multiline);
      });

      it('should handle quotes in strings', async () => {
        const quoted = 'He said "Hello"';
        await setStorageItem('sb-language', quoted);
        const result = await getStorageItem('sb-language', '');
        expect(result).toBe(quoted);
      });
    });

    describe('Type edge cases', () => {
      it('should handle boolean values', async () => {
        await setStorageItem('sb-language', true);
        const result = await getStorageItem('sb-language', false);
        expect(result).toBe(true);
      });

      it('should handle number zero', async () => {
        await setStorageItem('sb-language', 0);
        const result = await getStorageItem('sb-language', 999);
        expect(result).toBe(0);
      });

      it('should handle negative numbers', async () => {
        await setStorageItem('sb-language', -42);
        const result = await getStorageItem('sb-language', 0);
        expect(result).toBe(-42);
      });

      it('should handle floating point numbers', async () => {
        await setStorageItem('sb-language', 123.456);
        const result = await getStorageItem('sb-language', 0);
        expect(result).toBe(123.456);
      });

      it('should handle empty array', async () => {
        await setStorageItem('sb-chat-history', []);
        const result = await getStorageItem('sb-chat-history', [1, 2, 3]);
        expect(result).toEqual([]);
      });

      it('should handle empty object', async () => {
        await setStorageItem('sb-language', {});
        const result = await getStorageItem('sb-language', { default: true });
        expect(result).toEqual({});
      });
    });
  });
});
