/**
 * @fileoverview Shared IndexedDB database using Dexie.js
 *
 * This module provides a centralized database for all SoundBlue apps
 * with SSR safety and lazy initialization.
 *
 * @module @soundblue/shared-react/storage/database
 */

import Dexie, { type EntityTable } from 'dexie';

/**
 * Preference record stored in IndexedDB.
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
 * Shared database class for all SoundBlue apps.
 * Uses Dexie.js for simplified IndexedDB operations.
 */
export class SharedDatabase extends Dexie {
  /** User preferences table */
  preferences!: EntityTable<Preference, 'key'>;

  constructor(dbName: string = 'soundblue-shared-db') {
    super(dbName);

    this.version(1).stores({
      preferences: 'key',
    });
  }
}

// Lazy initialization for SSR compatibility
let dbInstance: SharedDatabase | null = null;

/**
 * Gets the shared database instance.
 * Creates a new instance if one doesn't exist.
 *
 * @param dbName - Optional custom database name
 * @returns SharedDatabase instance
 * @throws Error if called during SSR
 *
 * @example
 * ```typescript
 * const db = getSharedDb();
 * const pref = await db.preferences.get('theme');
 * ```
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
