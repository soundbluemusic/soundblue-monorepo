/**
 * English Spell Checker Engine
 * 영어 맞춤법 검사 엔진
 *
 * nspell (Hunspell 호환) 라이브러리를 사용하여
 * 영어 철자 검사를 수행합니다.
 */

import type {
  EnglishSpellCheckOptions,
  EnglishSpellCheckResult,
  EnglishSpellError,
} from '../types';

// Lazy-loaded spell checker instance
let spellChecker: {
  correct: (word: string) => boolean;
  suggest: (word: string) => string[];
} | null = null;

let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Initialize the spell checker (lazy load)
 */
async function initSpellChecker(): Promise<void> {
  if (spellChecker) return;
  if (loadPromise) return loadPromise;

  isLoading = true;

  loadPromise = (async () => {
    try {
      // Dynamic import for code splitting
      const [nspellModule, dictionary] = await Promise.all([
        import('nspell'),
        import('dictionary-en'),
      ]);

      const nspell = nspellModule.default;

      // dictionary-en exports a function that takes a callback
      const { aff, dic } = await new Promise<{ aff: Buffer; dic: Buffer }>((resolve, reject) => {
        dictionary.default((err: Error | null, result: { aff: Buffer; dic: Buffer }) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      spellChecker = nspell(aff, dic);
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

/**
 * Check if spell checker is ready
 */
export function isSpellCheckerReady(): boolean {
  return spellChecker !== null;
}

/**
 * Check if spell checker is loading
 */
export function isSpellCheckerLoading(): boolean {
  return isLoading;
}

/**
 * Tokenize text into words with positions
 */
function tokenize(text: string): Array<{ word: string; start: number; end: number }> {
  const tokens: Array<{ word: string; start: number; end: number }> = [];
  // Match word characters (letters, apostrophes for contractions)
  const regex = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g;
  let match: RegExpExecArray | null = regex.exec(text);

  while (match !== null) {
    tokens.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    match = regex.exec(text);
  }

  return tokens;
}

/**
 * Check if a word should be ignored
 */
function shouldIgnoreWord(word: string, options: EnglishSpellCheckOptions): boolean {
  // Ignore very short words (1 letter)
  if (word.length <= 1) return true;

  // Ignore numbers if option is set
  if (options.ignoreNumbers && /\d/.test(word)) return true;

  // Ignore all-uppercase words (likely acronyms)
  if (word === word.toUpperCase() && word.length <= 4) return true;

  return false;
}

/**
 * Main spell check function
 */
export async function checkEnglishSpelling(
  text: string,
  options: EnglishSpellCheckOptions = {},
): Promise<EnglishSpellCheckResult> {
  const { maxSuggestions = 5, ignoreNumbers = true } = options;

  // Initialize spell checker if needed
  await initSpellChecker();

  if (!spellChecker) {
    return {
      original: text,
      errors: [],
      stats: { totalWords: 0, misspelledWords: 0 },
    };
  }

  const tokens = tokenize(text);
  const errors: EnglishSpellError[] = [];

  for (const token of tokens) {
    if (shouldIgnoreWord(token.word, { ignoreNumbers })) {
      continue;
    }

    const isCorrect = spellChecker.correct(token.word);

    if (!isCorrect) {
      const suggestions = spellChecker.suggest(token.word).slice(0, maxSuggestions);

      errors.push({
        word: token.word,
        start: token.start,
        end: token.end,
        suggestions,
      });
    }
  }

  return {
    original: text,
    errors,
    stats: {
      totalWords: tokens.filter((t) => !shouldIgnoreWord(t.word, { ignoreNumbers })).length,
      misspelledWords: errors.length,
    },
  };
}

/**
 * Check a single word
 */
export async function checkWord(word: string): Promise<{
  isCorrect: boolean;
  suggestions: string[];
}> {
  await initSpellChecker();

  if (!spellChecker) {
    return { isCorrect: true, suggestions: [] };
  }

  const isCorrect = spellChecker.correct(word);
  const suggestions = isCorrect ? [] : spellChecker.suggest(word).slice(0, 5);

  return { isCorrect, suggestions };
}

/**
 * Preload the spell checker (call on component mount)
 */
export function preloadSpellChecker(): void {
  initSpellChecker().catch(() => {
    // Silently ignore preload errors
  });
}
