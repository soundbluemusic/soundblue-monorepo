// Hooks (PWA)

// Components
export { Footer, type FooterLink, type FooterProps, OfflineIndicator } from './components';
// Constants
export {
  BREAKPOINTS,
  type BreakpointKey,
  getCurrentBreakpoint,
  getMediaQuery,
  isAtOrAboveBreakpoint,
  isBelowBreakpoint,
} from './constants';
export {
  checkForUpdates,
  getOnlineStatus,
  getServiceWorkerState,
  type OnlineStatus,
  onOnlineStatusChange,
  onUpdateAvailable,
  type ServiceWorkerState,
  skipWaiting,
  type UseOnlineStatusReturn,
  type UseServiceWorkerReturn,
  useOnlineStatus,
  useServiceWorker,
} from './hooks';

// i18n Provider & utilities
export {
  DEFAULT_I18N_CONFIG,
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
  type I18nConfig,
  type I18nContextValue,
  I18nProvider,
  type I18nProviderProps,
  type Locale,
  useI18n,
} from './providers/I18nProvider';
// Storage (IndexedDB)
export {
  getAllPreferences,
  getPreference,
  getSharedDb,
  migrateFromLocalStorage,
  type Preference,
  removePreference,
  resetDbInstance,
  SharedDatabase,
  setPreference,
} from './storage';
// Types
export type {
  Branded,
  Failure,
  LegacyMessageType,
  Message,
  MessageRole,
  Result,
  StorageKeyBrand,
  Success,
  UrlPathBrand,
} from './types';
export {
  assert,
  assertDefined,
  assertNever,
  createMessage,
  err,
  hasProperty,
  isDefined,
  isMessage,
  isMessageArray,
  isNonEmptyArray,
  isNonEmptyString,
  legacyTypeToRole,
  ok,
  roleToLegacyType,
  unwrap,
  unwrapOr,
} from './types';
// Utils
export { cn } from './utils/cn';
// Legacy i18n utilities (deprecated - use I18nProvider instead)
export {
  type BaseLocale,
  createLocalizedPathBuilder,
  DEFAULT_I18N_CONFIG as LEGACY_I18N_CONFIG,
  getOppositeLocale,
  hasLocalePrefix,
  type I18nPathConfig,
} from './utils/i18n';
export {
  getRawStorageItem,
  getStorageItem,
  getValidatedStorageItem,
  removeStorageItem,
  setRawStorageItem,
  setStorageItem,
} from './utils/storage';
