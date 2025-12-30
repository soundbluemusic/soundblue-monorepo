// ========================================
// @soundblue/storage - Browser Implementation
// For runtime in browser environment
// ========================================

import Dexie, { type EntityTable } from 'dexie';
import type { IDatabase, Preference } from './types';

export * from './types';

/**
 * Shared database class for all SoundBlue apps.
 * Uses Dexie.js for simplified IndexedDB operations.
 */
export class SharedDatabase extends Dexie implements IDatabase {
  /** User preferences table */
  preferences!: EntityTable<Preference, 'key'>;

  constructor(dbName: string = 'soundblue-shared-db') {
    super(dbName);

    this.version(1).stores({
      preferences: 'key',
    });
  }

  isAvailable(): boolean {
    return true;
  }

  async getPreference<T>(key: string): Promise<T | null> {
    try {
      const pref = await this.preferences.get(key);
      if (!pref) return null;
      return JSON.parse(pref.value) as T;
    } catch {
      return null;
    }
  }

  async setPreference<T>(key: string, value: T): Promise<void> {
    await this.preferences.put({
      key,
      value: JSON.stringify(value),
      updatedAt: Date.now(),
    });
  }

  async deletePreference(key: string): Promise<void> {
    await this.preferences.delete(key);
  }

  async clearPreferences(): Promise<void> {
    await this.preferences.clear();
  }
}

// Lazy initialization for SSR compatibility
let dbInstance: SharedDatabase | null = null;

/**
 * Gets the shared database instance.
 * Creates a new instance if one doesn't exist.
 */
export function getSharedDb(dbName?: string): SharedDatabase {
  if (typeof window === 'undefined') {
    throw new Error('Database is not available during SSR');
  }
  if (!dbInstance) {
    dbInstance = new SharedDatabase(dbName);
  }
  return dbInstance;
}

/**
 * Resets the database instance.
 * Useful for testing or when switching databases.
 */
export function resetDbInstance(): void {
  dbInstance = null;
}

// ========================================
// LocalStorage wrapper
// ========================================

/**
 * Get value from localStorage
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Set value to localStorage
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or other error
  }
}

/**
 * Remove value from localStorage
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

// ========================================
// Simple cache implementation
// ========================================

const memoryCache = new Map<string, { value: unknown; expires: number }>();

/**
 * Get value from memory cache
 */
export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

/**
 * Set value to memory cache with TTL
 */
export function setCached<T>(key: string, value: T, ttlMs: number = 60000): void {
  memoryCache.set(key, {
    value,
    expires: Date.now() + ttlMs,
  });
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of memoryCache) {
    if (now > entry.expires) {
      memoryCache.delete(key);
    }
  }
}
