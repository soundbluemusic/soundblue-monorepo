/**
 * English Spell Checker Engine
 * 영어 맞춤법 검사 엔진
 *
 * nspell (Hunspell 호환) 라이브러리를 사용하여
 * 영어 철자 검사를 수행합니다.
 * 추가로 띄어쓰기, 문법 검사를 자체 구현합니다.
 *
 * Note: dictionary-en package uses Node.js fs API which is not browser-compatible.
 * Dictionary files are copied to public/dictionaries/ via prebuild script
 * and fetched at runtime for browser compatibility.
 */

// Dictionary file paths (copied to public folder by scripts/copy-dictionaries.ts)
const DICTIONARY_AFF_URL = '/dictionaries/en.aff';
const DICTIONARY_DIC_URL = '/dictionaries/en.dic';

import {
  applyCorrections,
  checkEnglishGrammar,
  detectScatteredLetters,
  scatteredLettersToErrors,
} from '@soundblue/text-processor';
import type {
  EnglishSpellCheckOptions,
  EnglishSpellCheckResult,
  EnglishSpellError,
  EnglishSpellErrorType,
} from '../types';

// Lazy-loaded spell checker instance
let spellChecker: {
  correct: (word: string) => boolean;
  suggest: (word: string) => string[];
} | null = null;

let isLoading = false;
let loadPromise: Promise<void> | null = null;

// Error state management
let loadError: Error | null = null;

/**
 * Get the current error state
 */
export function getSpellCheckerError(): Error | null {
  return loadError;
}

/**
 * Check if spell checker has an error
 */
export function hasSpellCheckerError(): boolean {
  return loadError !== null;
}

/**
 * Reset the spell checker (for retry)
 */
export function resetSpellChecker(): void {
  spellChecker = null;
  isLoading = false;
  loadPromise = null;
  loadError = null;
}

/**
 * Initialize the spell checker (lazy load)
 * Uses fetch to load dictionary files for browser compatibility
 */
async function initSpellChecker(): Promise<void> {
  if (spellChecker) return;
  if (loadError) throw loadError;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadError = null;

  loadPromise = (async () => {
    try {
      // Dynamic import nspell
      const nspellModule = await import('nspell');
      const nspell = nspellModule.default;

      // Fetch dictionary files from public folder
      const [affResponse, dicResponse] = await Promise.all([
        fetch(DICTIONARY_AFF_URL),
        fetch(DICTIONARY_DIC_URL),
      ]);

      if (!affResponse.ok) {
        throw new Error(
          `Failed to load dictionary: ${affResponse.status} ${affResponse.statusText}`,
        );
      }
      if (!dicResponse.ok) {
        throw new Error(
          `Failed to load dictionary: ${dicResponse.status} ${dicResponse.statusText}`,
        );
      }

      const [affText, dicText] = await Promise.all([affResponse.text(), dicResponse.text()]);

      // Create spell checker with text content
      spellChecker = nspell(affText, dicText);
    } catch (error) {
      loadError = error instanceof Error ? error : new Error('Failed to initialize spell checker');
      loadPromise = null;
      throw loadError;
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

// ========================================
// Spacing Check (띄어쓰기 검사)
// ========================================

/**
 * Check spacing errors
 */
function checkSpacing(text: string): EnglishSpellError[] {
  const errors: EnglishSpellError[] = [];

  // 1. Multiple spaces (이중 공백)
  const multipleSpaces = / {2,}/g;
  let match: RegExpExecArray | null = multipleSpaces.exec(text);
  while (match !== null) {
    errors.push({
      type: 'spacing',
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
      suggestions: [' '],
      message: 'Multiple spaces should be single space',
    });
    match = multipleSpaces.exec(text);
  }

  // 2. Space before punctuation (문장부호 앞 공백)
  const spaceBeforePunct = / +([.!?,;:])/g;
  match = spaceBeforePunct.exec(text);
  while (match !== null) {
    errors.push({
      type: 'spacing',
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
      suggestions: [match[1]],
      message: 'No space before punctuation',
    });
    match = spaceBeforePunct.exec(text);
  }

  // 3. Missing space after punctuation (문장부호 뒤 공백 없음)
  // Exclude URLs, numbers with decimals, abbreviations
  const missingSpaceAfterPunct = /([.!?])([A-Za-z])/g;
  match = missingSpaceAfterPunct.exec(text);
  while (match !== null) {
    // Skip common abbreviations like "Dr.", "Mr.", "vs."
    const before = text.slice(Math.max(0, match.index - 3), match.index + 1);
    if (!/(?:Dr|Mr|Ms|Mrs|vs|etc|e\.g|i\.e)\.$/i.test(before)) {
      errors.push({
        type: 'spacing',
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        suggestions: [`${match[1]} ${match[2]}`],
        message: 'Add space after punctuation',
      });
    }
    match = missingSpaceAfterPunct.exec(text);
  }

  // 4. Missing space after comma (쉼표 뒤 공백 없음)
  const missingSpaceAfterComma = /,([A-Za-z])/g;
  match = missingSpaceAfterComma.exec(text);
  while (match !== null) {
    errors.push({
      type: 'spacing',
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
      suggestions: [`, ${match[1]}`],
      message: 'Add space after comma',
    });
    match = missingSpaceAfterComma.exec(text);
  }

  return errors;
}

// ========================================
// Grammar Check (문법 검사)
// ========================================

// Vowel sounds for a/an rule (모음 소리)
const vowelSoundWords = new Set([
  // Words starting with silent 'h'
  'hour',
  'hours',
  'honest',
  'honestly',
  'honor',
  'honour',
  'heir',
  'heiress',
  // Acronyms pronounced with vowel sound
  'fbi',
  'html',
  'http',
  'mba',
  'mri',
  'nba',
  'sql',
]);

const consonantSoundWords = new Set([
  // Words starting with 'u' but consonant sound (like "you")
  'user',
  'users',
  'union',
  'unions',
  'united',
  'unit',
  'units',
  'university',
  'universities',
  'unique',
  'uniform',
  'uniforms',
  'universal',
  'useful',
  'usual',
  'usually',
  'utility',
  'utilities',
  'utensil',
  'utensils',
  // Words starting with 'eu'
  'european',
  'euro',
  'euros',
  // Words starting with 'ew'
  'ewe',
  'ewes',
  // One as "won"
  'one',
  'once',
]);

/**
 * Check if word starts with vowel sound
 */
function startsWithVowelSound(word: string): boolean {
  const lower = word.toLowerCase();

  // Check exception lists first
  if (vowelSoundWords.has(lower)) return true;
  if (consonantSoundWords.has(lower)) return false;

  // Default: check first letter
  return /^[aeiou]/i.test(word);
}

/**
 * Check grammar errors
 * Combines local checks with advanced grammar checks from text-processor
 */
function checkGrammar(text: string): EnglishSpellError[] {
  const errors: EnglishSpellError[] = [];

  // 1. a/an article agreement (관사 a/an 일치)
  // "a" before vowel sound
  const wrongA = /\b(a)\s+([a-zA-Z]+)/gi;
  let match: RegExpExecArray | null = wrongA.exec(text);
  while (match !== null) {
    const article = match[1];
    const nextWord = match[2];

    if (startsWithVowelSound(nextWord)) {
      const correctArticle = article === 'A' ? 'An' : 'an';
      errors.push({
        type: 'grammar',
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        suggestions: [`${correctArticle} ${nextWord}`],
        message: `Use "${correctArticle}" before vowel sounds`,
      });
    }
    match = wrongA.exec(text);
  }

  // "an" before consonant sound
  const wrongAn = /\b(an)\s+([a-zA-Z]+)/gi;
  match = wrongAn.exec(text);
  while (match !== null) {
    const article = match[1];
    const nextWord = match[2];

    if (!startsWithVowelSound(nextWord)) {
      const correctArticle = article === 'An' ? 'A' : 'a';
      errors.push({
        type: 'grammar',
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        suggestions: [`${correctArticle} ${nextWord}`],
        message: `Use "${correctArticle}" before consonant sounds`,
      });
    }
    match = wrongAn.exec(text);
  }

  // 2. Repeated words (반복 단어)
  const repeatedWords = /\b(\w+)\s+\1\b/gi;
  match = repeatedWords.exec(text);
  while (match !== null) {
    // Skip intentional repetitions like "very very"
    const word = match[1].toLowerCase();
    if (!['very', 'really', 'so', 'had', 'that'].includes(word)) {
      errors.push({
        type: 'grammar',
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        suggestions: [match[1]],
        message: 'Repeated word',
      });
    }
    match = repeatedWords.exec(text);
  }

  // 3. Capitalization after sentence end (문장 끝 뒤 대문자)
  const missingCapital = /([.!?]\s+)([a-z])/g;
  match = missingCapital.exec(text);
  while (match !== null) {
    errors.push({
      type: 'grammar',
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
      suggestions: [`${match[1]}${match[2].toUpperCase()}`],
      message: 'Capitalize first letter after sentence end',
    });
    match = missingCapital.exec(text);
  }

  // 4. First letter of text should be capitalized (첫 글자 대문자)
  const firstLetter = text.match(/^(\s*)([a-z])/);
  if (firstLetter) {
    errors.push({
      type: 'grammar',
      word: firstLetter[0],
      start: 0,
      end: firstLetter[0].length,
      suggestions: [`${firstLetter[1]}${firstLetter[2].toUpperCase()}`],
      message: 'Capitalize first letter',
    });
  }

  // 5. Advanced grammar checks from text-processor
  // Subject-verb agreement, tense consistency, articles, prepositions
  const advancedErrors = checkEnglishGrammar(text);

  // Convert TextError to EnglishSpellError and add to errors
  // Avoid duplicates by checking position overlap
  const existingPositions = new Set(errors.map((e) => `${e.start}-${e.end}`));

  for (const err of advancedErrors) {
    const posKey = `${err.start}-${err.end}`;
    if (!existingPositions.has(posKey)) {
      errors.push({
        type: 'grammar',
        word: err.original,
        start: err.start,
        end: err.end,
        suggestions: err.suggestions,
        message: err.message,
      });
      existingPositions.add(posKey);
    }
  }

  return errors;
}

// ========================================
// Main function (메인 함수)
// Note: applyCorrections is imported from @soundblue/text-processor
// ========================================

/**
 * Main spell check function
 */
export async function checkEnglishSpelling(
  text: string,
  options: EnglishSpellCheckOptions = {},
): Promise<EnglishSpellCheckResult> {
  const {
    maxSuggestions = 5,
    ignoreNumbers = true,
    checkSpacing: doCheckSpacing = true,
    checkGrammar: doCheckGrammar = true,
  } = options;

  // Initialize spell checker if needed
  await initSpellChecker();

  const allErrors: EnglishSpellError[] = [];

  // 0. Scattered letters check (분리된 글자 검사) - "h e llo" → "hello"
  // Must run before spelling check to avoid false positives on single letters
  // Capture spellChecker in a local variable for TypeScript null safety
  const checker = spellChecker;
  const scatteredResults = detectScatteredLetters(
    text,
    checker ? (word) => checker.correct(word) : undefined,
  );
  const scatteredTextErrors = scatteredLettersToErrors(scatteredResults);
  // Convert TextError to EnglishSpellError (original → word)
  const scatteredErrors: EnglishSpellError[] = scatteredTextErrors.map((e) => ({
    type: e.type as EnglishSpellErrorType,
    word: e.original,
    start: e.start,
    end: e.end,
    suggestions: e.suggestions,
    message: e.message,
  }));
  allErrors.push(...scatteredErrors);

  // Create a set of positions covered by scattered letters errors
  // to avoid duplicate spelling errors for the same range
  const scatteredRanges = new Set<string>();
  for (const error of scatteredErrors) {
    for (let i = error.start; i < error.end; i++) {
      scatteredRanges.add(String(i));
    }
  }

  // 1. Spelling check (철자 검사)
  if (spellChecker) {
    const tokens = tokenize(text);

    for (const token of tokens) {
      // Skip tokens that are part of scattered letters
      if (scatteredRanges.has(String(token.start))) {
        continue;
      }

      if (shouldIgnoreWord(token.word, { ignoreNumbers })) {
        continue;
      }

      const isCorrect = spellChecker.correct(token.word);

      if (!isCorrect) {
        const suggestions = spellChecker.suggest(token.word).slice(0, maxSuggestions);

        allErrors.push({
          type: 'spelling',
          word: token.word,
          start: token.start,
          end: token.end,
          suggestions,
          message: 'Misspelled word',
        });
      }
    }
  }

  // 2. Spacing check (띄어쓰기 검사)
  if (doCheckSpacing) {
    const spacingErrors = checkSpacing(text);
    allErrors.push(...spacingErrors);
  }

  // 3. Grammar check (문법 검사)
  if (doCheckGrammar) {
    const grammarErrors = checkGrammar(text);
    allErrors.push(...grammarErrors);
  }

  // Sort errors by position
  allErrors.sort((a, b) => a.start - b.start);

  // Build corrected text
  const corrected = applyCorrections(text, allErrors);

  // Calculate stats
  const tokens = tokenize(text);
  const stats = {
    totalWords: tokens.filter((t) => !shouldIgnoreWord(t.word, { ignoreNumbers })).length,
    spellingErrors: allErrors.filter((e) => e.type === 'spelling').length,
    spacingErrors: allErrors.filter((e) => e.type === 'spacing').length,
    grammarErrors: allErrors.filter((e) => e.type === 'grammar').length,
  };

  return {
    original: text,
    corrected,
    errors: allErrors,
    stats,
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
 * Returns a promise that resolves when ready or rejects on error
 */
export async function preloadSpellChecker(): Promise<void> {
  try {
    await initSpellChecker();
  } catch (error) {
    // Error is stored in loadError, re-throw for caller handling
    console.error('Spell checker preload failed:', error);
    throw error;
  }
}
