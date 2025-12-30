// ========================================
// @soundblue/i18n - Hooks
// i18n React hooks
// ========================================

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLocaleContext } from './context';
import type { Locale, TranslateOptions, TranslationMap } from './types';
import { getLocaleFromPath, getLocalizedPath, getOppositeLocale } from './utils';

/**
 * Use current locale
 */
export function useLocale(): Locale {
  const { locale } = useLocaleContext();
  return locale;
}

/**
 * Use locale setter
 */
export function useSetLocale(): (locale: Locale) => void {
  const { setLocale } = useLocaleContext();
  return setLocale;
}

/**
 * Use translation function with provided dictionary
 */
export function useTranslation(translations: Record<Locale, TranslationMap>) {
  const { locale } = useLocaleContext();

  const t = useCallback(
    (key: string, options?: TranslateOptions): string => {
      const dict = translations[locale] || translations.en;
      let value = dict[key];

      if (!value) {
        return options?.fallback ?? key;
      }

      // Interpolation
      if (options?.values) {
        for (const [k, v] of Object.entries(options.values)) {
          value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }

      return value;
    },
    [locale, translations],
  );

  return { t, locale };
}

/**
 * Use alternate locale
 */
export function useAlternateLocale(): Locale {
  const { locale } = useLocaleContext();
  return locale === 'en' ? 'ko' : 'en';
}

/**
 * Use locale-aware formatting
 */
export function useLocaleFormat() {
  const { locale } = useLocaleContext();

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return new Intl.NumberFormat(locale, options).format(value);
    },
    [locale],
  );

  const formatDate = useCallback(
    (date: Date | number, options?: Intl.DateTimeFormatOptions): string => {
      return new Intl.DateTimeFormat(locale, options).format(date);
    },
    [locale],
  );

  const formatRelativeTime = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
    },
    [locale],
  );

  return useMemo(
    () => ({
      formatNumber,
      formatDate,
      formatRelativeTime,
    }),
    [formatNumber, formatDate, formatRelativeTime],
  );
}

/**
 * Use direction (LTR/RTL)
 */
export function useDirection(): 'ltr' | 'rtl' {
  // Korean and English are both LTR
  return 'ltr';
}

/**
 * Hook for Paraglide i18n utilities in React components.
 * Provides URL-based locale management for React Router apps.
 *
 * @returns Object with locale utilities:
 *   - locale: Current locale from URL
 *   - toggleLanguage: Function to switch between locales
 *   - localizedPath: Function to get localized path for current locale
 *
 * @example
 * ```tsx
 * import { useParaglideI18n } from '@soundblue/i18n';
 *
 * function MyComponent() {
 *   const { locale, toggleLanguage, localizedPath } = useParaglideI18n();
 *
 *   return (
 *     <div>
 *       <button onClick={toggleLanguage}>Toggle Language</button>
 *       <a href={localizedPath('/about')}>About</a>
 *     </div>
 *   );
 * }
 * ```
 */
export function useParaglideI18n() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current locale from URL pathname
  const locale = useMemo(
    () => (getLocaleFromPath(location.pathname) ?? 'en') as Locale,
    [location.pathname],
  );

  /**
   * Toggle between English and Korean
   */
  const toggleLanguage = useCallback(() => {
    const newLocale = getOppositeLocale(locale);
    const currentPath = location.pathname;
    const basePath = currentPath.replace(/^\/(ko|en)/, '') || '/';
    const newPath = getLocalizedPath(basePath, newLocale);
    navigate(newPath);
  }, [locale, location.pathname, navigate]);

  /**
   * Get localized path for current locale
   */
  const localizedPath = useCallback((path: string) => getLocalizedPath(path, locale), [locale]);

  return {
    locale,
    toggleLanguage,
    localizedPath,
  };
}
