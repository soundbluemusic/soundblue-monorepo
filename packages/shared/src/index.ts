// Utils
export { cn } from './utils/cn';
export {
  getValidatedStorageItem,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getRawStorageItem,
  setRawStorageItem,
} from './utils/storage';

// Storage (IndexedDB)
export {
  SharedDatabase,
  getSharedDb,
  resetDbInstance,
  type Preference,
  getPreference,
  setPreference,
  removePreference,
  getAllPreferences,
  migrateFromLocalStorage,
} from './storage';

// Types
export type {
  Branded,
  StorageKeyBrand,
  UrlPathBrand,
  Success,
  Failure,
  Result,
} from './types';

export {
  ok,
  err,
  unwrap,
  unwrapOr,
  isDefined,
  isNonEmptyString,
  isNonEmptyArray,
  hasProperty,
  assert,
  assertDefined,
  assertNever,
} from './types';
