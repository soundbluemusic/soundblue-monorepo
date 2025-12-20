/**
 * @fileoverview I18n module for Tools app
 *
 * Re-exports i18n utilities from shared package and app-specific context.
 */

// Shared utilities (from utils to avoid router dependency in tests)
export {
  DEFAULT_I18N_CONFIG,
  getLocaleFromPath,
  getLocalizedPath,
  getPathWithoutLocale,
} from '@soundblue/shared/utils';
// App-specific context and hooks
export {
  type LanguageContextValue,
  LanguageProvider,
  type Locale,
  type Messages,
  useIntlTranslations,
  useLanguage,
  useTranslations,
} from './context';

// Constants
export const locales = ['en', 'ko'] as const;
export const defaultLocale = 'en' as const;

// Legacy type alias
import type { Locale as LocaleType, Messages as MessagesType } from './context';
export type Language = LocaleType;
export type Translations = MessagesType;
