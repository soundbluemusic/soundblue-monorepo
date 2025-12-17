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
const DB_NAME = "dialogue-db";
const DB_VERSION = 1;
const SETTINGS_STORE = "settings";

// IndexedDB helper functions
let dbInstance: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Settings store (same as chat-store.ts)
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };
  });
}

async function getSetting<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") return null;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, "readonly");
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function setSetting<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SETTINGS_STORE, "readwrite");
      const store = tx.objectStore(SETTINGS_STORE);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Storage unavailable
  }
}

/**
 * Migrates locale from localStorage to IndexedDB (one-time migration)
 */
async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value !== null) {
      const existing = await getSetting<string>(STORAGE_KEY);
      if (existing === null) {
        await setSetting(STORAGE_KEY, value);
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Migration failed, continue anyway
  }
}

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

  onMount(async () => {
    // Migrate from localStorage if exists
    await migrateFromLocalStorage();

    const pathLocale = getLocaleFromPath(window.location.pathname);
    setLocaleState(pathLocale);
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Persist to IndexedDB (async, fire and forget)
    setSetting(STORAGE_KEY, newLocale);
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
