/**
 * @fileoverview Shared storage module exports
 *
 * Re-exports all storage-related utilities for convenient imports.
 *
 * @module @soundblue/shared/storage
 */

export { SharedDatabase, getSharedDb, resetDbInstance, type Preference } from './database';

export {
  getPreference,
  setPreference,
  removePreference,
  getAllPreferences,
  migrateFromLocalStorage,
} from './preferences';
