/**
 * @soundblue/storage - Noop Implementation Tests
 * Tests for SSG/build time implementation
 */
import { describe, expect, it } from 'vitest';
import {
  clearExpiredCache,
  getCached,
  getLocalStorage,
  getSharedDb,
  removeLocalStorage,
  resetDbInstance,
  setCached,
  setLocalStorage,
} from '../src/index.noop';

describe('@soundblue/storage noop implementation', () => {
  describe('NoopDatabase', () => {
    it('should return singleton instance', () => {
      const db1 = getSharedDb();
      const db2 = getSharedDb('different-name');
      expect(db1).toBe(db2);
    });

    it('should report not available', () => {
      const db = getSharedDb();
      expect(db.isAvailable()).toBe(false);
    });

    it('should return null for getPreference', async () => {
      const db = getSharedDb();
      const result = await db.getPreference<string>('test-key');
      expect(result).toBeNull();
    });

    it('should not throw on setPreference', async () => {
      const db = getSharedDb();
      await expect(db.setPreference('key', 'value')).resolves.not.toThrow();
    });

    it('should not throw on deletePreference', async () => {
      const db = getSharedDb();
      await expect(db.deletePreference('key')).resolves.not.toThrow();
    });

    it('should not throw on clearPreferences', async () => {
      const db = getSharedDb();
      await expect(db.clearPreferences()).resolves.not.toThrow();
    });

    it('should not throw on resetDbInstance', () => {
      expect(() => resetDbInstance()).not.toThrow();
    });
  });

  describe('localStorage noop wrappers', () => {
    it('should return default value for getLocalStorage', () => {
      const defaultValue = { theme: 'dark' };
      const result = getLocalStorage('any-key', defaultValue);
      expect(result).toBe(defaultValue);
    });

    it('should not throw on setLocalStorage', () => {
      expect(() => setLocalStorage('key', 'value')).not.toThrow();
    });

    it('should not throw on removeLocalStorage', () => {
      expect(() => removeLocalStorage('key')).not.toThrow();
    });
  });

  describe('cache noop implementation', () => {
    it('should return null for getCached', () => {
      const result = getCached<string>('any-key');
      expect(result).toBeNull();
    });

    it('should not throw on setCached', () => {
      expect(() => setCached('key', 'value')).not.toThrow();
      expect(() => setCached('key', 'value', 5000)).not.toThrow();
    });

    it('should not throw on clearExpiredCache', () => {
      expect(() => clearExpiredCache()).not.toThrow();
    });
  });
});
