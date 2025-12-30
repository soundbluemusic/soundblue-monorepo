// ========================================
// @soundblue/storage - Noop Implementation
// For SSR/build time - provides empty implementations
// ========================================

import type { IDatabase } from './types';

export * from './types';

/**
 * Noop database class for SSR/build time.
 * All methods are safe to call but do nothing.
 */
class NoopDatabase implements IDatabase {
  isAvailable(): boolean {
    return false;
  }

  async getPreference<T>(_key: string): Promise<T | null> {
    return null;
  }

  async setPreference<T>(_key: string, _value: T): Promise<void> {
    // noop
  }

  async deletePreference(_key: string): Promise<void> {
    // noop
  }

  async clearPreferences(): Promise<void> {
    // noop
  }
}

// Singleton noop instance
const noopDb = new NoopDatabase();

/**
 * Gets a noop database instance for SSR.
 */
export function getSharedDb(_dbName?: string): NoopDatabase {
  return noopDb;
}

/**
 * Noop reset function.
 */
export function resetDbInstance(): void {
  // noop
}

// Re-export SharedDatabase type for compatibility
export type { NoopDatabase as SharedDatabase };

// ========================================
// LocalStorage noop wrappers
// ========================================

/**
 * Noop get from localStorage
 */
export function getLocalStorage<T>(_key: string, defaultValue: T): T {
  return defaultValue;
}

/**
 * Noop set to localStorage
 */
export function setLocalStorage<T>(_key: string, _value: T): void {
  // noop
}

/**
 * Noop remove from localStorage
 */
export function removeLocalStorage(_key: string): void {
  // noop
}

// ========================================
// Noop cache implementation
// ========================================

/**
 * Noop get from cache
 */
export function getCached<T>(_key: string): T | null {
  return null;
}

/**
 * Noop set to cache
 */
export function setCached<T>(_key: string, _value: T, _ttlMs?: number): void {
  // noop
}

/**
 * Noop clear expired cache
 */
export function clearExpiredCache(): void {
  // noop
}
