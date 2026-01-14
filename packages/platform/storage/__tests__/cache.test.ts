/**
 * @soundblue/storage - Memory Cache Tests
 * Tests for in-memory cache with TTL
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearExpiredCache, getCached, setCached } from '../src/index.browser';

describe('@soundblue/storage memory cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear cache before each test by setting expired entries
    clearExpiredCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('setCached and getCached', () => {
    it('should store and retrieve values', () => {
      setCached('test-key', 'test-value');
      const result = getCached<string>('test-key');
      expect(result).toBe('test-value');
    });

    it('should store complex objects', () => {
      const data = { name: 'test', items: [1, 2, 3], nested: { a: 'b' } };
      setCached('complex', data);
      const result = getCached<typeof data>('complex');
      expect(result).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const result = getCached<string>('non-existent');
      expect(result).toBeNull();
    });

    it('should use default TTL of 60 seconds', () => {
      setCached('ttl-test', 'value');

      // Should exist before TTL
      vi.advanceTimersByTime(59999);
      expect(getCached<string>('ttl-test')).toBe('value');

      // Should expire after TTL
      vi.advanceTimersByTime(2);
      expect(getCached<string>('ttl-test')).toBeNull();
    });

    it('should respect custom TTL', () => {
      setCached('custom-ttl', 'value', 5000);

      // Should exist before TTL
      vi.advanceTimersByTime(4999);
      expect(getCached<string>('custom-ttl')).toBe('value');

      // Should expire after TTL
      vi.advanceTimersByTime(2);
      expect(getCached<string>('custom-ttl')).toBeNull();
    });

    it('should overwrite existing values', () => {
      setCached('overwrite', 'original');
      setCached('overwrite', 'updated');
      expect(getCached<string>('overwrite')).toBe('updated');
    });
  });

  describe('clearExpiredCache', () => {
    it('should remove expired entries', () => {
      setCached('short-ttl', 'value1', 1000);
      setCached('long-ttl', 'value2', 10000);

      // Advance past short TTL
      vi.advanceTimersByTime(2000);
      clearExpiredCache();

      // Short TTL should be cleared, long TTL should remain
      expect(getCached<string>('short-ttl')).toBeNull();
      expect(getCached<string>('long-ttl')).toBe('value2');
    });

    it('should handle empty cache', () => {
      expect(() => clearExpiredCache()).not.toThrow();
    });
  });
});
