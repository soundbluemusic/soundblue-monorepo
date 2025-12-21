import { getLocaleFromPath, getLocalizedPath } from '@soundblue/shared-react';
import { createContext, useContext } from 'react';
import en from '../../messages/en.json';
import ko from '../../messages/ko.json';

export type Locale = 'en' | 'ko';

export const translations = { en, ko } as const;

export type Translations = typeof en;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLanguage: () => void;
  localizedPath: (path: string) => string;
  t: Translations;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export { getLocaleFromPath, getLocalizedPath };
export { I18nProvider } from './provider';
