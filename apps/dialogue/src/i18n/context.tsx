import {
  createContext,
  useContext,
  createSignal,
  ParentComponent,
  createMemo,
  onMount,
  createEffect,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import { translations, Locale, TranslationKeys } from "./translations";

type I18nContextType = {
  locale: () => Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys["app"];
};

const I18nContext = createContext<I18nContextType>();

const STORAGE_KEY = "dialogue-locale";

function getLocaleFromPath(pathname: string): Locale {
  const path = pathname.split("/")[1];
  if (path === "ko") return "ko";
  if (path === "ja") return "ja";
  return "en"; // Default to English
}

export const I18nProvider: ParentComponent = (props) => {
  const location = useLocation();
  const [locale, setLocaleState] = createSignal<Locale>("en");

  // Sync locale with URL path
  createEffect(() => {
    const pathLocale = getLocaleFromPath(location.pathname);
    setLocaleState(pathLocale);
  });

  onMount(() => {
    const pathLocale = getLocaleFromPath(window.location.pathname);
    setLocaleState(pathLocale);
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  };

  const t = createMemo(() => translations[locale()].app);

  return (
    <I18nContext.Provider value={{ locale, setLocale, get t() { return t(); } }}>
      {props.children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
