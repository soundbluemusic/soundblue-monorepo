/**
 * @fileoverview React hook for Paraglide i18n utilities
 *
 * Provides locale management utilities for React Router apps using Paraglide JS.
 * This hook offers toggleLanguage and localizedPath functions that integrate with
 * React Router's navigation system.
 *
 * @module @soundblue/shared-react/i18n/useParaglideI18n
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getLocaleFromPath, getLocalizedPath, getOppositeLocale } from './paraglide';
import type { Locale } from './types';

/**
 * Hook for Paraglide i18n utilities in React components.
 *
 * Provides functions for:
 * - Getting current locale from URL
 * - Toggling between languages
 * - Getting localized paths
 *
 * @returns Object with locale utilities
 *
 * @example
 * ```tsx
 * import * as m from '~/paraglide/messages';
 * import { useParaglideI18n } from '@soundblue/shared-react';
 *
 * function MyComponent() {
 *   const { locale, toggleLanguage, localizedPath } = useParaglideI18n();
 *
 *   return (
 *     <div>
 *       <p>{m['common.greeting']()}</p>
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
  const locale = useMemo(() => getLocaleFromPath(location.pathname) as Locale, [location.pathname]);

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
