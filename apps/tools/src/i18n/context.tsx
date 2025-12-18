/**
 * @fileoverview I18n Provider wrapper for Tools app
 *
 * Re-exports shared I18nProvider with app-specific messages and types.
 * Maintains backward compatibility with existing useLanguage API.
 *
 * @module I18nContext
 */

import {
  I18nProvider as SharedI18nProvider,
  useI18n,
  type Locale,
} from '@soundblue/shared/providers';
import { createMemo, type ParentComponent } from 'solid-js';
import { isServer, getRequestEvent } from 'solid-js/web';
import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';

export type { Locale };

/**
 * Type-safe translation messages structure
 */
export type Messages = typeof koMessages;

/**
 * Translation messages for each locale
 */
const messages = {
  en: enMessages,
  ko: koMessages,
} as const;

/**
 * Default messages for SSR safety
 */
const defaultMessages = messages;

/**
 * Context value with backward-compatible naming
 */
export interface LanguageContextValue {
  /** Current locale signal */
  locale: () => Locale;
  /** Set locale */
  setLocale: (locale: Locale) => void;
  /** Toggle locale */
  toggleLocale: () => void;
  /** Legacy: alias for locale */
  language: () => Locale;
  /** Legacy: alias for setLocale */
  setLanguage: (lang: Locale) => void;
  /** Legacy: alias for toggleLocale */
  toggleLanguage: () => void;
  /** Translation messages accessor */
  t: () => Messages;
}

/**
 * Get pathname from request event (SSR) or window (client)
 */
function getPathname(): string {
  if (isServer) {
    try {
      const event = getRequestEvent();
      if (event?.request?.url) {
        const url = new URL(event.request.url);
        return url.pathname;
      }
    } catch {
      // Fallback
    }
    return '/';
  }
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

/**
 * Navigate to path (client-side only)
 */
function navigateTo(path: string): void {
  if (!isServer && typeof window !== 'undefined') {
    window.location.href = path;
  }
}

/**
 * I18n Provider for Tools app.
 *
 * @example
 * ```tsx
 * <LanguageProvider>
 *   <App />
 * </LanguageProvider>
 * ```
 */
export const LanguageProvider: ParentComponent = (props) => {
  // Create reactive pathname accessor
  const pathname = createMemo(() => getPathname());

  return (
    <SharedI18nProvider
      messages={messages}
      pathname={pathname}
      navigate={navigateTo}
    >
      {props.children}
    </SharedI18nProvider>
  );
};

/**
 * Hook to access internationalization context.
 *
 * Backward-compatible wrapper around useI18n.
 *
 * @returns Language context value with locale utilities
 *
 * @example
 * ```tsx
 * const { t, locale, toggleLocale } = useLanguage();
 * // or legacy API:
 * const { t, language, toggleLanguage } = useLanguage();
 * ```
 */
export function useLanguage(): LanguageContextValue {
  try {
    const ctx = useI18n<Messages>();

    return {
      locale: ctx.locale,
      setLocale: ctx.setLocale,
      toggleLocale: ctx.toggleLocale,
      // Legacy aliases
      language: ctx.locale,
      setLanguage: ctx.setLocale,
      toggleLanguage: ctx.toggleLocale,
      t: ctx.t,
    };
  } catch {
    // Fallback for SSR/hydration safety
    return {
      locale: () => 'en',
      setLocale: () => {},
      toggleLocale: () => {},
      language: () => 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: () => defaultMessages.en,
    };
  }
}

/**
 * Legacy compatibility - returns the full translations object
 */
export function useTranslations(): Messages {
  const { t } = useLanguage();
  return t();
}

/**
 * @deprecated Use useLanguage().t() instead
 * Kept for backwards compatibility
 */
export function useIntlTranslations() {
  const { t } = useLanguage();
  return t;
}
