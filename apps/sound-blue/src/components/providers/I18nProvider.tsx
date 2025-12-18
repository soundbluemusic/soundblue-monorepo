/**
 * @fileoverview I18n Provider wrapper for Sound Blue
 *
 * Re-exports shared I18nProvider with app-specific messages and types.
 * Maintains backward compatibility with existing useLanguage API.
 *
 * @module I18nProvider
 */

import {
  I18nProvider as SharedI18nProvider,
  useI18n,
  type Locale,
} from '@soundblue/shared';
import type { Accessor, ParentComponent } from 'solid-js';
import enMessages from '../../../messages/en.json';
import koMessages from '../../../messages/ko.json';

/**
 * Supported language codes (alias for Locale)
 */
export type Language = Locale;

/**
 * Type-safe translation messages structure
 */
export type Messages = typeof enMessages;

/**
 * Translation messages for each locale
 */
const messages = {
  en: enMessages,
  ko: koMessages,
} as const;

/**
 * Context value with backward-compatible naming
 */
export interface LanguageContextValue {
  /** Current language signal */
  language: Accessor<Language>;
  /** Translation messages accessor */
  t: Accessor<Messages>;
  /** Programmatically change the language */
  setLanguage: (lang: Language) => void;
  /** Toggle between English and Korean */
  toggleLanguage: () => void;
  /** Generate a localized path for the current language */
  localizedPath: (path: string) => string;
  /** Current path without language prefix */
  basePath: Accessor<string>;
}

/**
 * I18n Provider for Sound Blue app.
 *
 * @example
 * ```tsx
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 * ```
 */
export const I18nProvider: ParentComponent = (props) => {
  return (
    <SharedI18nProvider messages={messages}>
      {props.children}
    </SharedI18nProvider>
  );
};

/**
 * Hook to access internationalization context.
 *
 * Backward-compatible wrapper around useI18n that provides
 * the same API as the original useLanguage hook.
 *
 * @returns Language context value with language utilities
 *
 * @example
 * ```tsx
 * const { t, language, localizedPath, toggleLanguage } = useLanguage();
 * ```
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useI18n<Messages>();

  return {
    language: ctx.locale,
    t: ctx.t,
    setLanguage: ctx.setLocale,
    toggleLanguage: ctx.toggleLocale,
    localizedPath: ctx.localizedPath,
    basePath: ctx.basePath,
  };
}
