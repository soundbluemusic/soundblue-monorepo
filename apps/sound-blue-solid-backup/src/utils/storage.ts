/**
 * @fileoverview Type-safe IndexedDB wrapper with SSR safety and Zod validation.
 *
 * This module provides a robust abstraction over IndexedDB (via Dexie.js) with:
 *
 * - **SSR Safety**: All functions check for `window` availability before accessing
 *   IndexedDB, making them safe to call during server-side rendering.
 *
 * - **Type Safety**: Uses TypeScript generics and a constrained `StorageKey` type
 *   to prevent typos and ensure consistent key usage across the application.
 *
 * - **Runtime Validation**: `getValidatedStorageItem` uses Zod schemas to validate
 *   data at runtime, ensuring corrupted/tampered data doesn't break the app.
 *
 * - **Silent Error Handling**: All IndexedDB operations are wrapped in try-catch
 *   blocks that fail silently. This handles edge cases like:
 *   - Private/incognito browsing modes with disabled storage
 *   - Storage quota exceeded errors
 *   - Corrupted JSON data during parsing
 *
 * ## Three API Styles
 *
 * This module provides three parallel APIs:
 *
 * 1. **Validated API** (`getValidatedStorageItem`): Uses Zod schemas to validate
 *    data at runtime. Recommended for complex data that needs guaranteed structure.
 *
 * 2. **Parsed API** (`getStorageItem`/`setStorageItem`): Automatically serializes
 *    and deserializes values using JSON. Use for complex data types (objects, arrays).
 *
 * 3. **Raw API** (`getRawStorageItem`/`setRawStorageItem`): Stores and retrieves
 *    plain strings without JSON transformation. Use for simple string values
 *    like theme names ('light', 'dark') where JSON quotes would be unnecessary.
 *
 * @example
 * ```tsx
 * // Validated API - for data requiring runtime validation
 * const messages = await getValidatedStorageItem('sb-chat-history', MessagesSchema, []);
 *
 * // Parsed API - for complex data
 * await setStorageItem('sb-language', { locale: 'ko', region: 'KR' });
 * const langSettings = await getStorageItem('sb-language', { locale: 'en' });
 *
 * // Raw API - for simple strings (theme preference)
 * await setRawStorageItem('sb-theme', 'dark');
 * const theme = await getRawStorageItem('sb-theme'); // 'dark' (not '"dark"')
 * ```
 *
 * @module utils/storage
 */

import Dexie, { type EntityTable } from 'dexie';
import type { z } from 'zod';

/**
 * Valid storage keys used throughout the application.
 *
 * Using a union type ensures type safety and prevents typos when
 * accessing storage. Add new keys here as needed.
 *
 * - `sb-theme`: User's theme preference ('light' | 'dark')
 * - `sb-language`: User's language preference
 * - `sb-chat-state`: Temporary chat state during language redirect
 * - `sb-chat-history`: Persistent chat message history
 */
export type StorageKey = 'sb-theme' | 'sb-language' | 'sb-chat-state' | 'sb-chat-history';

/**
 * Preference record stored in IndexedDB.
 */
interface Preference {
  key: string;
  value: string;
  updatedAt: number;
}

/**
 * Sound Blue app database class.
 */
class SoundBlueDatabase extends Dexie {
  preferences!: EntityTable<Preference, 'key'>;

  constructor() {
    super('soundblue-db');

    this.version(1).stores({
      preferences: 'key',
    });
  }
}

// Lazy initialization for SSR compatibility
let dbInstance: SoundBlueDatabase | null = null;

function getDb(): SoundBlueDatabase {
  if (typeof window === 'undefined') {
    throw new Error('Database is not available during SSR');
  }
  if (!dbInstance) {
    dbInstance = new SoundBlueDatabase();
  }
  return dbInstance;
}

/**
 * Internal: Get preference from IndexedDB
 */
async function getPreference(key: string): Promise<string | null> {
  try {
    const pref = await getDb().preferences.get(key);
    return pref?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Internal: Set preference in IndexedDB
 */
async function setPreference(key: string, value: string): Promise<void> {
  try {
    await getDb().preferences.put({ key, value, updatedAt: Date.now() });
  } catch {
    // Storage unavailable
  }
}

/**
 * Internal: Remove preference from IndexedDB
 */
async function removePreferenceFromDb(key: string): Promise<void> {
  try {
    await getDb().preferences.delete(key);
  } catch {
    // Storage unavailable
  }
}

/**
 * Migrates data from localStorage to IndexedDB.
 * Call this once on app startup.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  const keys: StorageKey[] = ['sb-theme', 'sb-language', 'sb-chat-state', 'sb-chat-history'];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        const existing = await getPreference(key);
        if (existing === null) {
          await setPreference(key, value);
        }
        localStorage.removeItem(key);
      }
    } catch {
      // Continue with next key
    }
  }
}

/**
 * Retrieves and validates a value from IndexedDB using a Zod schema.
 *
 * This is the safest way to retrieve complex data from IndexedDB as it:
 * - Handles SSR safely
 * - Parses JSON
 * - Validates the data structure with Zod
 * - Returns default value if validation fails
 *
 * @template T - The expected type (inferred from schema)
 * @param key - The storage key to retrieve
 * @param schema - Zod schema to validate against
 * @param defaultValue - Value to return if validation fails
 * @returns The validated value or defaultValue on any failure
 *
 * @example
 * ```tsx
 * const messages = await getValidatedStorageItem(
 *   'sb-chat-history',
 *   MessagesSchema,
 *   []
 * );
 * // messages is guaranteed to be Message[] with correct structure
 * ```
 */
export async function getValidatedStorageItem<T>(
  key: StorageKey,
  schema: z.ZodType<T>,
  defaultValue: T,
): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = await getPreference(key);
    if (item === null) return defaultValue;

    const parsed: unknown = JSON.parse(item);
    const result = schema.safeParse(parsed);

    return result.success ? result.data : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Retrieves a JSON-parsed value from IndexedDB with SSR safety.
 *
 * This function safely handles:
 * - Server-side rendering (returns defaultValue when window is undefined)
 * - Missing keys (returns defaultValue)
 * - Invalid JSON (returns defaultValue)
 * - IndexedDB errors (returns defaultValue)
 *
 * @template T - The expected type of the stored value
 * @param key - The storage key to retrieve
 * @param defaultValue - Value to return if key doesn't exist or on any error
 * @returns The parsed value from storage, or defaultValue on failure
 *
 * @example
 * ```tsx
 * // With object default
 * const prefs = await getStorageItem('sb-language', { locale: 'en' });
 *
 * // With primitive default
 * const count = await getStorageItem('sb-theme', 0);
 * ```
 */
export async function getStorageItem<T>(key: StorageKey, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = await getPreference(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Stores a JSON-serialized value in IndexedDB with SSR safety.
 *
 * The value is automatically serialized using `JSON.stringify()`.
 * Use `setRawStorageItem()` for plain string values to avoid JSON quotes.
 *
 * Fails silently if:
 * - Running on the server (SSR)
 * - IndexedDB is disabled (private browsing)
 * - Storage quota is exceeded
 * - Value cannot be serialized (circular references)
 *
 * @template T - The type of value to store
 * @param key - The storage key to set
 * @param value - The value to serialize and store
 *
 * @example
 * ```tsx
 * // Store an object
 * await setStorageItem('sb-language', { locale: 'ko', region: 'KR' });
 *
 * // Store a primitive (will be JSON-wrapped: "true", "42")
 * await setStorageItem('sb-theme', true);
 * ```
 */
export async function setStorageItem<T>(key: StorageKey, value: T): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await setPreference(key, JSON.stringify(value));
  } catch {
    // Silently fail if IndexedDB is not available or quota exceeded
  }
}

/**
 * Removes an item from IndexedDB with SSR safety.
 *
 * Safe to call even if the key doesn't exist. Fails silently on any error.
 *
 * @param key - The storage key to remove
 *
 * @example
 * ```tsx
 * // Clear user's theme preference (revert to system default)
 * await removeStorageItem('sb-theme');
 * ```
 */
export async function removeStorageItem(key: StorageKey): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await removePreferenceFromDb(key);
  } catch {
    // Silently fail if IndexedDB is not available
  }
}

/**
 * Retrieves a raw string value from IndexedDB without JSON parsing.
 *
 * Use this for simple string values like theme names where you don't want
 * the extra JSON quotes that `getStorageItem` would add.
 *
 * @param key - The storage key to retrieve
 * @returns The raw string value, or null if not found or on error
 *
 * @example
 * ```tsx
 * // Theme is stored as 'dark', not '"dark"'
 * const theme = await getRawStorageItem('sb-theme');
 * if (theme === 'dark') {
 *   document.documentElement.dataset.theme = 'dark';
 * }
 * ```
 */
export async function getRawStorageItem(key: StorageKey): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    return await getPreference(key);
  } catch {
    return null;
  }
}

/**
 * Stores a raw string value in IndexedDB without JSON serialization.
 *
 * Use this for simple string values like theme names to avoid unnecessary
 * JSON serialization overhead and quotes.
 *
 * @param key - The storage key to set
 * @param value - The raw string value to store
 *
 * @example
 * ```tsx
 * // Store theme as plain string 'dark' instead of '"dark"'
 * await setRawStorageItem('sb-theme', 'dark');
 *
 * // Later retrieve without JSON parsing
 * const theme = await getRawStorageItem('sb-theme'); // 'dark'
 * ```
 */
export async function setRawStorageItem(key: StorageKey, value: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await setPreference(key, value);
  } catch {
    // Silently fail if IndexedDB is not available or quota exceeded
  }
}
