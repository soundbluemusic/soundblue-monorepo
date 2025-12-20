import { getLocaleFromPath, getLocalizedPath } from '@soundblue/shared-react';
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { type Locale, translations } from './translations';

// Use a base type for translations that works across both locales
type TranslationStrings = {
  [K in keyof (typeof translations)['en']['app']]: string;
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationStrings;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const locale = useMemo(() => getLocaleFromPath(location.pathname) as Locale, [location.pathname]);

  const t = useMemo(() => translations[locale].app, [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      // Get current path without locale prefix
      const currentPath = location.pathname;
      const basePath = currentPath.replace(/^\/(ko|en)/, '') || '/';
      const newPath = getLocalizedPath(basePath, newLocale);
      navigate(newPath);
    },
    [location.pathname, navigate],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
