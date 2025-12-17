/**
 * @fileoverview IndexedDB-based preference storage utilities
 *
 * Provides async functions for storing and retrieving user preferences
 * using IndexedDB via Dexie.js. All functions are SSR-safe.
 *
 * @module @soundblue/shared/storage/preferences
 */

import { getSharedDb, type Preference } from './database';

/**
 * Retrieves a preference value from IndexedDB.
 *
 * @param key - The preference key to retrieve
 * @returns The stored value, or null if not found
 *
 * @example
 * ```typescript
 * const theme = await getPreference('theme');
 * if (theme === 'dark') {
 *   applyDarkTheme();
 * }
 * ```
 */
export async function getPreference(key: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const pref = await getSharedDb().preferences.get(key);
    return pref?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Stores a preference value in both localStorage (sync cache) and IndexedDB.
 *
 * localStorage is used as a synchronous cache for FOUC prevention.
 * IndexedDB is the primary storage for durability.
 *
 * @param key - The preference key to store
 * @param value - The value to store
 *
 * @example
 * ```typescript
 * await setPreference('theme', 'dark');
 * await setPreference('locale', 'ko');
 * ```
 */
export async function setPreference(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Write to localStorage first (sync cache for FOUC prevention)
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (e.g., private browsing)
  }

  // 2. Write to IndexedDB (primary storage)
  try {
    await getSharedDb().preferences.put({
      key,
      value,
      updatedAt: Date.now(),
    });
  } catch {
    // IndexedDB unavailable - fail silently
  }
}

/**
 * Removes a preference from both localStorage and IndexedDB.
 *
 * @param key - The preference key to remove
 *
 * @example
 * ```typescript
 * await removePreference('theme'); // Reset to default
 * ```
 */
export async function removePreference(key: string): Promise<void> {
  if (typeof window === 'undefined') return;

  // Remove from localStorage (sync cache)
  try {
    localStorage.removeItem(key);
  } catch {
    // localStorage unavailable
  }

  // Remove from IndexedDB
  try {
    await getSharedDb().preferences.delete(key);
  } catch {
    // Storage unavailable - fail silently
  }
}

/**
 * Retrieves all preferences from IndexedDB.
 *
 * @returns Array of all stored preferences
 *
 * @example
 * ```typescript
 * const allPrefs = await getAllPreferences();
 * console.log(allPrefs); // [{ key: 'theme', value: 'dark', updatedAt: ... }]
 * ```
 */
export async function getAllPreferences(): Promise<Preference[]> {
  if (typeof window === 'undefined') return [];

  try {
    return await getSharedDb().preferences.toArray();
  } catch {
    return [];
  }
}

/**
 * Syncs data from localStorage to IndexedDB.
 * localStorage entries are kept as sync cache for FOUC prevention.
 *
 * @param keys - Array of localStorage keys to sync
 *
 * @example
 * ```typescript
 * // Sync localStorage data to IndexedDB on app startup
 * await migrateFromLocalStorage(['theme', 'locale', 'sidebar-collapsed']);
 * ```
 */
export async function migrateFromLocalStorage(keys: string[]): Promise<void> {
  if (typeof window === 'undefined') return;

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // Check if already exists in IndexedDB
        const existing = await getPreference(key);
        if (existing === null) {
          // Sync to IndexedDB (but keep localStorage as sync cache)
          await getSharedDb().preferences.put({
            key,
            value,
            updatedAt: Date.now(),
          });
        }
        // NOTE: Do NOT remove from localStorage - it's needed for FOUC prevention
      }
    } catch {
      // Continue with next key if one fails
    }
  }
}
