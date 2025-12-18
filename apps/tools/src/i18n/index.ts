/**
 * @fileoverview I18n module for Tools app
 *
 * Re-exports i18n utilities from shared package and app-specific context.
 */

// App-specific context and hooks
export {
  LanguageProvider,
  useLanguage,
  useTranslations,
  useIntlTranslations,
  type Locale,
  type Messages,
  type LanguageContextValue,
} from './context';

// Shared utilities (from utils to avoid router dependency in tests)
export {
  getLocaleFromPath,
  getPathWithoutLocale,
  getLocalizedPath,
  DEFAULT_I18N_CONFIG,
} from '@soundblue/shared/utils';

// Constants
export const locales = ['en', 'ko'] as const;
export const defaultLocale = 'en' as const;

// Legacy type alias
import type { Locale as LocaleType, Messages as MessagesType } from './context';
export type Language = LocaleType;
export type Translations = MessagesType;
