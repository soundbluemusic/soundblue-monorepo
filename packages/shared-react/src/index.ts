// ========================================
// @soundblue/shared-react
// MIGRATION NOTE: This package is being gradually migrated to:
// - @soundblue/i18n (i18n utilities)
// - @soundblue/storage (storage utilities)
// - @soundblue/seo (SEO/structured data)
// - @soundblue/pwa (PWA utilities)
// Continue using this package - re-exports are set up for compatibility.
// ========================================

// Components - UI
export {
  Button,
  type ButtonProps,
  ConfirmDialog,
  type ConfirmDialogProps,
  type ConfirmDialogVariant,
  KeyboardShortcutsModal,
  type KeyboardShortcutsModalProps,
  LoadingDots,
  type LoadingDotsProps,
  OnboardingTooltip,
  type OnboardingTooltipProps,
  type ShortcutGroup,
  Skeleton,
  type SkeletonProps,
  Spinner,
  type SpinnerProps,
  Toast,
  ToastContainer,
  type ToastContainerProps,
  type ToastPosition,
  type ToastProps,
} from './components/ui';

// Components - Structured Data for SEO

// Components - Share Button
export { ShareButton, type ShareButtonProps } from './components/ShareButton';
export {
  BreadcrumbStructuredData,
  MusicGroupStructuredData,
  OrganizationStructuredData,
  SoftwareApplicationStructuredData,
  WebSiteStructuredData,
} from './components/StructuredData';

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
  formatShortcut,
  getModifierSymbol,
  getOnlineStatus,
  getServiceWorkerState,
  type OnboardingStep,
  type OnlineStatus,
  onOnlineStatusChange,
  onUpdateAvailable,
  type RecentItem,
  type ServiceWorkerState,
  type ShareData,
  type Shortcut,
  skipWaiting,
  type UseKeyboardShortcutsOptions,
  type UseOnboardingOptions,
  type UseOnboardingReturn,
  type UseOnlineStatusReturn,
  type UseRecentItemsOptions,
  type UseRecentItemsReturn,
  type UseServiceWorkerReturn,
  type UseToastReturn,
  type UseUndoOptions,
  type UseUndoReturn,
  type UseWebShareReturn,
  useKeyboardShortcuts,
  useOnboarding,
  useOnlineStatus,
  useRecentItems,
  useServiceWorker,
  useToast,
  useUndo,
  useWebShare,
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
// NLP - Natural Language Processing
export * from './nlp';
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
// Storage - import from '@soundblue/shared-react/storage' to avoid bundling Dexie
// Stores
export {
  type Toast as ToastData,
  type ToastStore,
  type ToastType,
  type UndoAction,
  type UndoStore,
  useToastStore,
  useUndoStore,
} from './stores';
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
// Utils (storage utils excluded - use '@soundblue/shared-react/storage' for Dexie-based storage)
export {
  type BaseLocale,
  cn,
  createLocalizedPathBuilder,
  getOppositeLocale,
  hasLocalePrefix,
  type I18nPathConfig,
} from './utils';
