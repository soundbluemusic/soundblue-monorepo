export {
  getSharedDb,
  type Preference,
  resetDbInstance,
  SharedDatabase,
} from './database';

export {
  getAllPreferences,
  getPreference,
  migrateFromLocalStorage,
  removePreference,
  setPreference,
} from './preferences';
