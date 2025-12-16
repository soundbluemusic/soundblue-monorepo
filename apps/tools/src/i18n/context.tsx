import { flatten, type Translator, translator } from '@solid-primitives/i18n';
import { useLocation, useNavigate } from '@solidjs/router';
import {
  createContext,
  createEffect,
  createSignal,
  type ParentComponent,
  useContext,
} from 'solid-js';
import { isServer } from 'solid-js/web';

// Import messages statically for client-side switching
import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';
import { defaultLocale, getLocaleFromPath, getLocalizedPath, type Locale } from './request';

// Flatten messages for translator
const dictionaries = {
  ko: flatten(koMessages),
  en: flatten(enMessages),
} as const;

type Messages = typeof koMessages;
type FlatDict = ReturnType<typeof flatten<Messages>>;

interface LanguageContextValue {
  locale: () => Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  // Legacy compatibility
  language: () => Locale;
  setLanguage: (lang: Locale) => void;
  toggleLanguage: () => void;
  t: () => Messages;
  // Translator function for flat key access
  tr: Translator<FlatDict>;
}

// Default values for SSR and hydration safety
const defaultMessages = {
  ko: koMessages,
  en: enMessages,
} as const;

// Create a safe default translator function that doesn't rely on reactive context
const defaultTranslator: Translator<FlatDict> = ((key: string) => {
  const dict = dictionaries[defaultLocale];
  return dict[key as keyof typeof dict] ?? key;
}) as Translator<FlatDict>;

const defaultContextValue: LanguageContextValue = {
  locale: () => defaultLocale,
  setLocale: () => {},
  toggleLocale: () => {},
  language: () => defaultLocale,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: () => defaultMessages[defaultLocale],
  tr: defaultTranslator,
};

// Initialize context with default value to prevent undefined during hydration
const LanguageContext = createContext<LanguageContextValue>(defaultContextValue);

export const LanguageProvider: ParentComponent = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [locale, setLocaleState] = createSignal<Locale>(defaultLocale);

  // Sync locale from URL path
  createEffect(() => {
    if (isServer) return;
    const urlLocale = getLocaleFromPath(location.pathname);
    setLocaleState(urlLocale);
  });

  // Navigate to localized path when locale changes (client-side navigation)
  const setLocale = (lang: Locale) => {
    if (isServer) return;
    const newPath = getLocalizedPath(location.pathname, lang);
    navigate(newPath);
  };

  const toggleLocale = () => {
    const next = locale() === 'ko' ? 'en' : 'ko';
    setLocale(next);
  };

  // Create translator using @solid-primitives/i18n
  const tr = translator(() => dictionaries[locale()]);

  const contextValue: LanguageContextValue = {
    locale,
    setLocale,
    toggleLocale,
    // Legacy compatibility
    language: locale,
    setLanguage: setLocale,
    toggleLanguage: toggleLocale,
    // Reuse defaultMessages defined at module level instead of creating new object
    t: () => defaultMessages[locale()],
    tr,
  };

  return <LanguageContext.Provider value={contextValue}>{props.children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  // Explicit fallback for hydration safety - useContext can return undefined during SSR/hydration
  return context ?? defaultContextValue;
}

// Re-export translator function for new code
export function useIntlTranslations() {
  const { tr } = useLanguage();
  return tr;
}

// Legacy compatibility - returns the full translations object like before
export function useTranslations() {
  const { t } = useLanguage();
  return t();
}
