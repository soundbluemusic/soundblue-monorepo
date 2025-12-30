// ========================================
// @soundblue/storage - Shared Types
// Types shared between browser and noop implementations
// ========================================

/**
 * Preference record stored in IndexedDB
 */
export interface Preference {
  /** Unique key identifier */
  key: string;
  /** Stored value (JSON serialized) */
  value: string;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Cache entry with TTL
 */
export interface CacheEntry<T = unknown> {
  value: T;
  timestamp: number;
  ttl: number;
}

/**
 * Storage interface for preferences
 */
export interface IPreferenceStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Cache interface
 */
export interface ICache<T = unknown> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Database interface
 */
export interface IDatabase {
  isAvailable(): boolean;
  getPreference<T>(key: string): Promise<T | null>;
  setPreference<T>(key: string, value: T): Promise<void>;
  deletePreference(key: string): Promise<void>;
  clearPreferences(): Promise<void>;
}
