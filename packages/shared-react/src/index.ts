// Providers

// Constants
export {
  BREAKPOINTS,
  type BreakpointKey,
  getCurrentBreakpoint,
  getMediaQuery,
  isAtOrAboveBreakpoint,
  isBelowBreakpoint,
} from './constants';

// Hooks
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
// Shared i18n types and constants (framework-independent)
export type {
  I18nConfig as SharedI18nConfig,
  I18nMessages,
  Locale as SharedLocale,
  LocaleDirection,
  TranslationDictionary,
} from './i18n';
export {
  COMMON_TRANSLATION_KEYS,
  DEFAULT_LOCALE,
  getLocaleDirection,
  getLocaleWithFallback,
  getOppositeLocale as getOppositeSharedLocale,
  isValidLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_DATE_FORMATS,
  LOCALE_NAMES,
  LOCALE_NUMBER_FORMATS,
  LOCALE_QUERY_PARAM,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  useParaglideI18n,
} from './i18n';
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
  type ResolvedTheme,
  type Theme,
  type ThemeContextValue,
  ThemeProvider,
  type ThemeProviderProps,
  useI18n,
  useTheme,
} from './providers';
// Storage
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
export {
  createMessage,
  type Failure,
  failure,
  isMessage,
  isMessageArray,
  type LegacyMessageType,
  legacyTypeToRole,
  type Message,
  type MessageRole,
  type Result,
  roleToLegacyType,
  type Success,
  success,
} from './types';
// Utils
export {
  type BaseLocale,
  cn,
  createLocalizedPathBuilder,
  getOppositeLocale,
  getRawStorageItem,
  getStorageItem,
  getValidatedStorageItem,
  hasLocalePrefix,
  type I18nPathConfig,
  removeStorageItem,
  setRawStorageItem,
  setStorageItem,
} from './utils';
