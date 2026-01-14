/**
 * @soundblue/storage - LocalStorage Wrapper Tests
 * Tests for localStorage utility functions
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '../src/index.browser';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

describe('@soundblue/storage localStorage wrapper', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: localStorageMock });
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getLocalStorage', () => {
    it('should return stored value', () => {
      localStorageMock.setItem('test', JSON.stringify('stored-value'));
      const result = getLocalStorage('test', 'default');
      expect(result).toBe('stored-value');
    });

    it('should return default value when key not found', () => {
      const result = getLocalStorage('non-existent', 'default-value');
      expect(result).toBe('default-value');
    });

    it('should handle complex objects', () => {
      const data = { theme: 'dark', settings: { volume: 80 } };
      localStorageMock.setItem('settings', JSON.stringify(data));
      const result = getLocalStorage('settings', {});
      expect(result).toEqual(data);
    });

    it('should return default on JSON parse error', () => {
      localStorageMock.setItem('invalid', 'not-valid-json');
      const result = getLocalStorage('invalid', 'default');
      expect(result).toBe('default');
    });

    it('should handle arrays', () => {
      const data = [1, 2, 3, 'four'];
      localStorageMock.setItem('array', JSON.stringify(data));
      const result = getLocalStorage('array', []);
      expect(result).toEqual(data);
    });
  });

  describe('setLocalStorage', () => {
    it('should store string value', () => {
      setLocalStorage('key', 'value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key', JSON.stringify('value'));
    });

    it('should store object value', () => {
      const data = { a: 1, b: 'two' };
      setLocalStorage('object', data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('object', JSON.stringify(data));
    });

    it('should store null value', () => {
      setLocalStorage('null-key', null);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('null-key', 'null');
    });

    it('should not throw on storage error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => setLocalStorage('key', 'value')).not.toThrow();
    });
  });

  describe('removeLocalStorage', () => {
    it('should remove existing key', () => {
      localStorageMock.setItem('to-remove', JSON.stringify('value'));
      removeLocalStorage('to-remove');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('to-remove');
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => removeLocalStorage('non-existent')).not.toThrow();
    });

    it('should not throw on error', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      expect(() => removeLocalStorage('key')).not.toThrow();
    });
  });

  describe('SSR safety (window undefined)', () => {
    beforeEach(() => {
      vi.stubGlobal('window', undefined);
    });

    it('getLocalStorage should return default when window undefined', () => {
      const result = getLocalStorage('key', 'default');
      expect(result).toBe('default');
    });

    it('setLocalStorage should not throw when window undefined', () => {
      expect(() => setLocalStorage('key', 'value')).not.toThrow();
    });

    it('removeLocalStorage should not throw when window undefined', () => {
      expect(() => removeLocalStorage('key')).not.toThrow();
    });
  });
});
