// Hooks (PWA)
export {
  useOnlineStatus,
  onOnlineStatusChange,
  getOnlineStatus,
  type OnlineStatus,
  type UseOnlineStatusReturn,
  useServiceWorker,
  checkForUpdates,
  skipWaiting,
  onUpdateAvailable,
  getServiceWorkerState,
  type ServiceWorkerState,
  type UseServiceWorkerReturn,
} from './hooks';

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

// i18n Provider & utilities
export {
  I18nProvider,
  useI18n,
  type Locale,
  type I18nConfig,
  type I18nContextValue,
  type I18nProviderProps,
  DEFAULT_I18N_CONFIG,
  getLocaleFromPath,
  getPathWithoutLocale,
  getLocalizedPath,
} from './providers/I18nProvider';

// Legacy i18n utilities (deprecated - use I18nProvider instead)
export {
  type BaseLocale,
  type I18nPathConfig,
  DEFAULT_I18N_CONFIG as LEGACY_I18N_CONFIG,
  createLocalizedPathBuilder,
  hasLocalePrefix,
  getOppositeLocale,
} from './utils/i18n';

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

// Constants
export {
  BREAKPOINTS,
  type BreakpointKey,
  isBelowBreakpoint,
  isAtOrAboveBreakpoint,
  getCurrentBreakpoint,
  getMediaQuery,
} from './constants';

// Components
export { Footer, type FooterProps, type FooterLink, OfflineIndicator } from './components';

// Types
export type {
  Branded,
  StorageKeyBrand,
  UrlPathBrand,
  Success,
  Failure,
  Result,
  MessageRole,
  Message,
  LegacyMessageType,
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
  createMessage,
  isMessage,
  isMessageArray,
  legacyTypeToRole,
  roleToLegacyType,
} from './types';
