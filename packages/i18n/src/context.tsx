// ========================================
// @soundblue/i18n - Context
// Locale context provider
// ========================================

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import type { Locale, LocaleContextValue } from './types';

/**
 * Supported locales
 */
export const SUPPORTED_LOCALES: Locale[] = ['en', 'ko'];

/**
 * Default locale
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Locale context
 */
const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Locale provider props
 */
export interface LocaleProviderProps {
  children: ReactNode;
  /** Initial locale */
  initialLocale?: Locale;
  /** Callback when locale changes */
  onLocaleChange?: (locale: Locale) => void;
}

/**
 * Locale provider component
 */
export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  onLocaleChange,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const isSupported = useCallback((loc: string): loc is Locale => {
    return SUPPORTED_LOCALES.includes(loc as Locale);
  }, []);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (isSupported(newLocale)) {
        setLocaleState(newLocale);
        onLocaleChange?.(newLocale);
      }
    },
    [isSupported, onLocaleChange],
  );

  const getLocaleFromPath = useCallback(
    (path: string): Locale | null => {
      const segments = path.split('/').filter(Boolean);
      const firstSegment = segments[0];

      if (firstSegment && isSupported(firstSegment)) {
        return firstSegment;
      }

      return null;
    },
    [isSupported],
  );

  const value: LocaleContextValue = {
    locale,
    setLocale,
    isSupported,
    getLocaleFromPath,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Use locale context
 */
export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }

  return context;
}
