// ========================================
// @soundblue/i18n - Hooks
// i18n React hooks
// ========================================

import {
  getLocaleFromPath,
  getLocalizedPath,
  getOppositeLocale,
  type Locale,
} from '@soundblue/locale';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLocaleContext } from './context';
import type { TranslateOptions, TranslationMap } from './types';

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
 * 성능: RegExp 캐시 (매번 생성 방지)
 */
const regexpCache = new Map<string, RegExp>();

function getInterpolationRegexp(key: string): RegExp {
  let regexp = regexpCache.get(key);
  if (!regexp) {
    regexp = new RegExp(`\\{${key}\\}`, 'g');
    regexpCache.set(key, regexp);
  }
  return regexp;
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

      // Interpolation with cached RegExp
      if (options?.values) {
        for (const [k, v] of Object.entries(options.values)) {
          value = value.replace(getInterpolationRegexp(k), String(v));
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
 * 성능: Intl formatter 캐시 (locale+options별)
 */
const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateFormatCache = new Map<string, Intl.DateTimeFormat>();
const relativeTimeFormatCache = new Map<string, Intl.RelativeTimeFormat>();

function getCachedNumberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = locale + JSON.stringify(options || {});
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}

function getCachedDateFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(options || {});
  let formatter = dateFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatCache.set(key, formatter);
  }
  return formatter;
}

function getCachedRelativeTimeFormat(locale: string): Intl.RelativeTimeFormat {
  let formatter = relativeTimeFormatCache.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    relativeTimeFormatCache.set(locale, formatter);
  }
  return formatter;
}

/**
 * Use locale-aware formatting
 * 성능: Intl formatter 인스턴스 캐싱
 */
export function useLocaleFormat() {
  const { locale } = useLocaleContext();

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return getCachedNumberFormat(locale, options).format(value);
    },
    [locale],
  );

  const formatDate = useCallback(
    (date: Date | number, options?: Intl.DateTimeFormatOptions): string => {
      return getCachedDateFormat(locale, options).format(date);
    },
    [locale],
  );

  const formatRelativeTime = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
      return getCachedRelativeTimeFormat(locale).format(value, unit);
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
