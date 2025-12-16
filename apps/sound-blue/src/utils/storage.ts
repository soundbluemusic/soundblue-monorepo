/**
 * @fileoverview Type-safe localStorage wrapper with SSR safety and Zod validation.
 *
 * This module provides a robust abstraction over the browser's localStorage API
 * with the following features:
 *
 * - **SSR Safety**: All functions check for `window` availability before accessing
 *   localStorage, making them safe to call during server-side rendering.
 *
 * - **Type Safety**: Uses TypeScript generics and a constrained `StorageKey` type
 *   to prevent typos and ensure consistent key usage across the application.
 *
 * - **Runtime Validation**: `getValidatedStorageItem` uses Zod schemas to validate
 *   data at runtime, ensuring corrupted/tampered data doesn't break the app.
 *
 * - **Silent Error Handling**: All localStorage operations are wrapped in try-catch
 *   blocks that fail silently. This handles edge cases like:
 *   - Private/incognito browsing modes with disabled storage
 *   - Storage quota exceeded errors
 *   - SecurityError when cookies are disabled
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
 * const messages = getValidatedStorageItem('sb-chat-history', MessagesSchema, []);
 *
 * // Parsed API - for complex data
 * setStorageItem('sb-language', { locale: 'ko', region: 'KR' });
 * const langSettings = getStorageItem('sb-language', { locale: 'en' });
 *
 * // Raw API - for simple strings (theme preference)
 * setRawStorageItem('sb-theme', 'dark');
 * const theme = getRawStorageItem('sb-theme'); // 'dark' (not '"dark"')
 * ```
 *
 * @module utils/storage
 */

import type { z } from 'zod';

/**
 * Valid storage keys used throughout the application.
 *
 * Using a union type ensures type safety and prevents typos when
 * accessing localStorage. Add new keys here as needed.
 *
 * - `sb-theme`: User's theme preference ('light' | 'dark')
 * - `sb-language`: User's language preference
 * - `sb-chat-state`: Temporary chat state during language redirect
 * - `sb-chat-history`: Persistent chat message history
 */
export type StorageKey = 'sb-theme' | 'sb-language' | 'sb-chat-state' | 'sb-chat-history';

/**
 * Retrieves and validates a value from localStorage using a Zod schema.
 *
 * This is the safest way to retrieve complex data from localStorage as it:
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
 * const messages = getValidatedStorageItem(
 *   'sb-chat-history',
 *   MessagesSchema,
 *   []
 * );
 * // messages is guaranteed to be Message[] with correct structure
 * ```
 */
export function getValidatedStorageItem<T>(
  key: StorageKey,
  schema: z.ZodType<T>,
  defaultValue: T,
): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    const parsed: unknown = JSON.parse(item);
    const result = schema.safeParse(parsed);

    return result.success ? result.data : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Retrieves a JSON-parsed value from localStorage with SSR safety.
 *
 * This function safely handles:
 * - Server-side rendering (returns defaultValue when window is undefined)
 * - Missing keys (returns defaultValue)
 * - Invalid JSON (returns defaultValue)
 * - localStorage errors (returns defaultValue)
 *
 * @template T - The expected type of the stored value
 * @param key - The storage key to retrieve
 * @param defaultValue - Value to return if key doesn't exist or on any error
 * @returns The parsed value from storage, or defaultValue on failure
 *
 * @example
 * ```tsx
 * // With object default
 * const prefs = getStorageItem('sb-language', { locale: 'en' });
 *
 * // With primitive default
 * const count = getStorageItem('sb-theme', 0);
 * ```
 */
export function getStorageItem<T>(key: StorageKey, defaultValue: T): T {
  // SSR safety check: localStorage is not available during server rendering
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    // Silently return default on JSON parse errors or storage access errors
    return defaultValue;
  }
}

/**
 * Stores a JSON-serialized value in localStorage with SSR safety.
 *
 * The value is automatically serialized using `JSON.stringify()`.
 * Use `setRawStorageItem()` for plain string values to avoid JSON quotes.
 *
 * Fails silently if:
 * - Running on the server (SSR)
 * - localStorage is disabled (private browsing)
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
 * setStorageItem('sb-language', { locale: 'ko', region: 'KR' });
 *
 * // Store a primitive (will be JSON-wrapped: "true", "42")
 * setStorageItem('sb-theme', true);
 * ```
 */
export function setStorageItem<T>(key: StorageKey, value: T): void {
  // SSR safety check: localStorage is not available during server rendering
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is not available or quota exceeded
  }
}

/**
 * Removes an item from localStorage with SSR safety.
 *
 * Safe to call even if the key doesn't exist. Fails silently on any error.
 *
 * @param key - The storage key to remove
 *
 * @example
 * ```tsx
 * // Clear user's theme preference (revert to system default)
 * removeStorageItem('sb-theme');
 * ```
 */
export function removeStorageItem(key: StorageKey): void {
  // SSR safety check: localStorage is not available during server rendering
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Retrieves a raw string value from localStorage without JSON parsing.
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
 * const theme = getRawStorageItem('sb-theme');
 * if (theme === 'dark') {
 *   document.documentElement.dataset.theme = 'dark';
 * }
 * ```
 */
export function getRawStorageItem(key: StorageKey): string | null {
  // SSR safety check: localStorage is not available during server rendering
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(key);
  } catch {
    // Silently return null on storage access errors
    return null;
  }
}

/**
 * Stores a raw string value in localStorage without JSON serialization.
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
 * setRawStorageItem('sb-theme', 'dark');
 *
 * // Later retrieve without JSON parsing
 * const theme = getRawStorageItem('sb-theme'); // 'dark'
 * ```
 */
export function setRawStorageItem(key: StorageKey, value: string): void {
  // SSR safety check: localStorage is not available during server rendering
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail if localStorage is not available or quota exceeded
  }
}
