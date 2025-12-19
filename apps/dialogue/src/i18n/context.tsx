/**
 * @fileoverview I18n Provider wrapper for Dialogue app
 *
 * Re-exports shared I18nProvider with app-specific translations.
 * Uses URL-based locale detection (no IndexedDB storage).
 *
 * @module I18nContext
 */

import {
  type Locale,
  I18nProvider as SharedI18nProvider,
  useI18n as useSharedI18n,
} from '@soundblue/shared';
import { createMemo, type ParentComponent } from 'solid-js';
import { getRequestEvent, isServer } from 'solid-js/web';
import { type TranslationKeys, translations } from './translations';

export type { Locale };

/**
 * App translations type
 */
type AppTranslations = TranslationKeys['app'];

/**
 * Messages structure for I18nProvider
 * Type assertion to satisfy Record<Locale, T> requirement
 */
const messages = {
  en: translations.en,
  ko: translations.ko,
} as { en: TranslationKeys; ko: TranslationKeys };

/**
 * I18n context type for Dialogue app
 */
export interface I18nContextType {
  locale: () => Locale;
  setLocale: (locale: Locale) => void;
  t: AppTranslations;
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
 * I18n Provider for Dialogue app.
 *
 * Uses URL-based locale detection for SEO.
 *
 * @example
 * ```tsx
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 * ```
 */
export const I18nProvider: ParentComponent = (props) => {
  // Create reactive pathname accessor
  const pathname = createMemo(() => getPathname());

  return (
    <SharedI18nProvider messages={messages} pathname={pathname} navigate={navigateTo}>
      {props.children}
    </SharedI18nProvider>
  );
};

/**
 * Hook to access internationalization context.
 *
 * @returns I18n context with locale and translations
 *
 * @example
 * ```tsx
 * const { locale, setLocale, t } = useI18n();
 * ```
 */
export function useI18n(): I18nContextType {
  try {
    const ctx = useSharedI18n<TranslationKeys>();

    return {
      locale: ctx.locale,
      setLocale: ctx.setLocale,
      get t() {
        return ctx.t().app;
      },
    };
  } catch {
    // Fallback for SSR safety
    return {
      locale: () => 'en',
      setLocale: () => {},
      get t() {
        return translations.en.app;
      },
    };
  }
}
