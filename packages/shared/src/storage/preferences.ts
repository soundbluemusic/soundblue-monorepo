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
 * Stores a preference value in IndexedDB.
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

  try {
    await getSharedDb().preferences.put({
      key,
      value,
      updatedAt: Date.now(),
    });
  } catch {
    // Storage unavailable - fail silently
  }
}

/**
 * Removes a preference from IndexedDB.
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
 * Migrates data from localStorage to IndexedDB.
 * After successful migration, removes the localStorage entry.
 *
 * @param keys - Array of localStorage keys to migrate
 *
 * @example
 * ```typescript
 * // Migrate existing localStorage data on app startup
 * await migrateFromLocalStorage(['theme', 'locale', 'sidebar-collapsed']);
 * ```
 */
export async function migrateFromLocalStorage(keys: string[]): Promise<void> {
  if (typeof window === 'undefined') return;

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // Check if already migrated to IndexedDB
        const existing = await getPreference(key);
        if (existing === null) {
          await setPreference(key, value);
        }
        // Remove from localStorage after successful migration
        localStorage.removeItem(key);
      }
    } catch {
      // Continue with next key if one fails
    }
  }
}
