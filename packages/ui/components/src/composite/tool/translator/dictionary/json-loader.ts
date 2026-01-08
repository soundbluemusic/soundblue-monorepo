/**
 * JSON Dictionary Loader
 *
 * Loads pure vocabulary data from JSON files in /public/data/dictionaries/
 * This separates data from logic - JSON contains only word pairs,
 * while TypeScript files contain grammar rules and algorithms.
 */

// Cache for loaded dictionaries
const cache: Record<string, unknown> = {};

/**
 * Load JSON dictionary from public path
 */
async function loadJson<T>(path: string): Promise<T | null> {
  if (cache[path]) {
    return cache[path] as T;
  }

  try {
    const response = await fetch(`/data/dictionaries/${path}`);
    if (!response.ok) return null;
    const data = await response.json();
    cache[path] = data;
    return data as T;
  } catch {
    return null;
  }
}

/**
 * Word dictionary entry
 */
export interface WordDict {
  koToEn: Record<string, string>;
  enToKo: Record<string, string>;
}

/**
 * Stem entry
 */
export interface StemEntry {
  stem: string;
  en: string;
  type: 'verb' | 'adjective' | 'noun';
}

/**
 * Idiom entry
 */
export interface IdiomEntry {
  ko: string;
  en: string;
  literal?: string;
  category?: string;
  variants?: string[];
}

/**
 * Polysemy entry
 */
export interface PolysemyEntry {
  korean: string;
  translations: Array<{
    english: string;
    category: string;
    priority?: number;
    contextHints?: string[];
  }>;
}

/**
 * Domain dictionary entry
 */
export interface DomainDict {
  koToEn: Array<{ ko: string; en: string; domain: string }>;
  enToKo: Array<{ ko: string; en: string; domain: string }>;
}

/**
 * Load word dictionaries (ko-to-en, en-to-ko)
 */
export async function loadWordDicts(): Promise<WordDict> {
  const [koToEn, enToKo] = await Promise.all([
    loadJson<{ koToEn: Record<string, string> }>('words/ko-to-en.json'),
    loadJson<{ enToKo: Record<string, string> }>('words/en-to-ko.json'),
  ]);

  return {
    koToEn: koToEn?.koToEn ?? {},
    enToKo: enToKo?.enToKo ?? {},
  };
}

/**
 * Load stem dictionary
 */
export async function loadStems(): Promise<StemEntry[]> {
  const data = await loadJson<StemEntry[]>('words/stems.json');
  return data ?? [];
}

/**
 * Load idiom dictionary
 */
export async function loadIdioms(): Promise<IdiomEntry[]> {
  const data = await loadJson<IdiomEntry[]>('idioms/idioms.json');
  return data ?? [];
}

/**
 * Load polysemy dictionary
 */
export async function loadPolysemy(): Promise<PolysemyEntry[]> {
  const data = await loadJson<PolysemyEntry[]>('polysemy/polysemy.json');
  return data ?? [];
}

/**
 * Load domain dictionaries (all domains combined)
 */
export async function loadDomains(): Promise<DomainDict> {
  const data = await loadJson<DomainDict>('domains/all-domains.json');
  return data ?? { koToEn: [], enToKo: [] };
}

/**
 * Load color dictionary
 */
export async function loadColors(): Promise<WordDict> {
  const data = await loadJson<{ koToEn: Record<string, string> }>('words/colors.json');
  return {
    koToEn: data?.koToEn ?? {},
    enToKo: Object.fromEntries(Object.entries(data?.koToEn ?? {}).map(([k, v]) => [v, k])),
  };
}

/**
 * Load country dictionary
 */
export async function loadCountries(): Promise<WordDict> {
  const data = await loadJson<{ koToEn: Record<string, string> }>('words/countries.json');
  return {
    koToEn: data?.koToEn ?? {},
    enToKo: Object.fromEntries(Object.entries(data?.koToEn ?? {}).map(([k, v]) => [v, k])),
  };
}

/**
 * Load expression dictionaries
 */
export async function loadExpressions(): Promise<{
  onomatopoeia: Record<string, string>;
  cultural: Record<string, string>;
  compoundWords: Record<string, string>;
  phrasalVerbs: Record<string, string>;
}> {
  const [onomatopoeia, cultural, compoundWords, phrasalVerbs] = await Promise.all([
    loadJson<{ koToEn: Record<string, string> }>('expressions/onomatopoeia.json'),
    loadJson<{ koToEn: Record<string, string> }>('expressions/cultural.json'),
    loadJson<{ koToEn: Record<string, string> }>('expressions/compound-words.json'),
    loadJson<{ koToEn: Record<string, string> }>('expressions/phrasal-verbs.json'),
  ]);

  return {
    onomatopoeia: onomatopoeia?.koToEn ?? {},
    cultural: cultural?.koToEn ?? {},
    compoundWords: compoundWords?.koToEn ?? {},
    phrasalVerbs: phrasalVerbs?.koToEn ?? {},
  };
}

/**
 * Preload all dictionaries (call on app init)
 */
export async function preloadAllDictionaries(): Promise<void> {
  await Promise.all([
    loadWordDicts(),
    loadStems(),
    loadIdioms(),
    loadPolysemy(),
    loadDomains(),
    loadColors(),
    loadCountries(),
    loadExpressions(),
  ]);
}

/**
 * Clear cache (for testing or memory management)
 */
export function clearCache(): void {
  for (const key of Object.keys(cache)) {
    delete cache[key];
  }
}
