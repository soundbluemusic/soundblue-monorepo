import { getLocaleFromPath, getLocalizedPath } from '@soundblue/shared-react';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { I18nContext, type Locale, translations } from './index';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const locale = useMemo(() => getLocaleFromPath(location.pathname) as Locale, [location.pathname]);

  const t = useMemo(() => translations[locale], [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      const currentPath = location.pathname;
      const basePath = currentPath.replace(/^\/(ko|en)/, '') || '/';
      const newPath = getLocalizedPath(basePath, newLocale);
      navigate(newPath);
    },
    [location.pathname, navigate],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
