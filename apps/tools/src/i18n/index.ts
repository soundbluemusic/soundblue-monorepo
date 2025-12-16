export { LanguageProvider, useIntlTranslations, useLanguage, useTranslations } from './context';
export {
  defaultLocale,
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
  type Locale,
  locales,
} from './request';

// Legacy exports for backwards compatibility
export type Language = 'ko' | 'en';
export type Translations = typeof import('../../messages/ko.json');
