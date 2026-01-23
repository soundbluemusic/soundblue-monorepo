/**
 * Custom hook for getting the current locale
 *
 * Normalizes the locale to 'ko' or 'en' for consistent usage across the app.
 * This eliminates the repeated pattern: `locale === 'ko' ? 'ko' : 'en'`
 */

import { useParaglideI18n } from '@soundblue/i18n';

export type SupportedLocale = 'ko' | 'en';

/**
 * Returns the current locale normalized to 'ko' or 'en'
 *
 * @returns The current locale as either 'ko' or 'en'
 *
 * @example
 * ```tsx
 * const locale = useCurrentLocale();
 * const texts = toolTexts[locale];
 * ```
 */
export function useCurrentLocale(): SupportedLocale {
  const { locale } = useParaglideI18n();
  return locale === 'ko' ? 'ko' : 'en';
}
