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
import { getLocaleFromPath as sharedGetLocaleFromPath, type I18nPathConfig } from "@soundblue/shared";
import { translations, Locale, TranslationKeys } from "./translations";
import { getSetting, setSetting, migrateSettingFromLocalStorage } from "~/stores/db";

type I18nContextType = {
  locale: () => Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys["app"];
};

const I18nContext = createContext<I18nContextType>();

const STORAGE_KEY = "dialogue-locale";

// Dialogue supports 2 locales
const DIALOGUE_I18N_CONFIG: I18nPathConfig = {
  locales: ["en", "ko"],
  defaultLocale: "en",
};

function getLocaleFromPath(pathname: string): Locale {
  return sharedGetLocaleFromPath(pathname, DIALOGUE_I18N_CONFIG) as Locale;
}

export const I18nProvider: ParentComponent = (props) => {
  const location = useLocation();
  const [locale, setLocaleState] = createSignal<Locale>("en");

  // Sync locale with URL path
  createEffect(() => {
    const pathLocale = getLocaleFromPath(location.pathname);
    setLocaleState(pathLocale);
  });

  onMount(async () => {
    // Migrate from localStorage if exists (one-time)
    await migrateSettingFromLocalStorage(STORAGE_KEY);
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Persist to IndexedDB (async, fire and forget)
    void setSetting(STORAGE_KEY, newLocale);
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
