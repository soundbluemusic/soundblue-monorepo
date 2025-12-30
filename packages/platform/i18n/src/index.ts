// ========================================
// @soundblue/i18n
// Internationalization utilities
// ========================================

// Context and Provider
export {
  DEFAULT_LOCALE,
  LocaleProvider,
  type LocaleProviderProps,
  SUPPORTED_LOCALES,
  useLocaleContext,
} from './context';
// Hooks
export {
  useAlternateLocale,
  useDirection,
  useLocale,
  useLocaleFormat,
  useParaglideI18n,
  useSetLocale,
  useTranslation,
} from './hooks';
// Types
export * from './types';

// Utils
export {
  buildLocalizedPath,
  getBrowserLocale,
  getHrefLang,
  getHtmlLang,
  getLocaleDisplayName,
  getLocaleFromPath,
  getLocaleNativeName,
  getLocalizedPath,
  getOppositeLocale,
  isValidLocale,
  removeLocaleFromPath,
} from './utils';
