/**
 * @fileoverview Shared IndexedDB module for Dialogue app
 *
 * This module provides a centralized database connection that is shared
 * across all stores (chat-store, i18n, etc.) to prevent multiple
 * concurrent connections and improve performance.
 */

const DB_NAME = 'dialogue-db';
const DB_VERSION = 1;
const CONVERSATIONS_STORE = 'conversations';
const SETTINGS_STORE = 'settings';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Gets the shared IndexedDB instance for the Dialogue app.
 * Uses singleton pattern to ensure only one connection is opened.
 *
 * @returns Promise resolving to the IDBDatabase instance
 */
export async function getDialogueDb(): Promise<IDBDatabase> {
  // Return existing instance if available
  if (dbInstance) return dbInstance;

  // Return pending promise if connection is in progress
  if (dbPromise) return dbPromise;

  // Open new connection
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection close
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Conversations store
      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
        const store = db.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
  });

  dbInstance = await dbPromise;
  return dbInstance;
}

/**
 * Gets a setting value from IndexedDB.
 *
 * @param key - The setting key to retrieve
 * @returns The setting value, or null if not found
 */
export async function getSetting<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  try {
    const db = await getDialogueDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

/**
 * Sets a setting value in IndexedDB.
 *
 * @param key - The setting key to store
 * @param value - The value to store
 */
export async function setSetting<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await getDialogueDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, 'readwrite');
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Storage unavailable
  }
}

/**
 * Migrates a key from localStorage to IndexedDB (one-time migration).
 *
 * @param key - The key to migrate
 */
export async function migrateSettingFromLocalStorage(key: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const value = localStorage.getItem(key);
    if (value !== null) {
      const existing = await getSetting<string>(key);
      if (existing === null) {
        await setSetting(key, value);
      }
      localStorage.removeItem(key);
    }
  } catch {
    // Migration failed, continue anyway
  }
}

// Export store names for reference
export { CONVERSATIONS_STORE, SETTINGS_STORE };
