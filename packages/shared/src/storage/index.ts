/**
 * @fileoverview Shared storage module exports
 *
 * Re-exports all storage-related utilities for convenient imports.
 *
 * @module @soundblue/shared/storage
 */

export { getSharedDb, type Preference, resetDbInstance, SharedDatabase } from './database';

export {
  getAllPreferences,
  getPreference,
  migrateFromLocalStorage,
  removePreference,
  setPreference,
} from './preferences';
