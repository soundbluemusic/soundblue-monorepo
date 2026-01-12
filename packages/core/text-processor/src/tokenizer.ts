// ========================================
// @soundblue/text-processor - Tokenizer Utilities
// Language-agnostic tokenization and scattered letter detection
// ========================================

import type { TextError } from './types';

/**
 * Token representing a word or character sequence
 */
export interface Token {
  /** The token text */
  text: string;
  /** Start position in original text (0-based, inclusive) */
  start: number;
  /** End position in original text (0-based, exclusive) */
  end: number;
}

/**
 * Scattered letters detection result
 */
export interface ScatteredLettersResult {
  /** Whether scattered letters pattern was detected */
  detected: boolean;
  /** The reconstructed word (if detected) */
  reconstructed: string;
  /** Original scattered text */
  original: string;
  /** Start position */
  start: number;
  /** End position */
  end: number;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Tokenize English text into words
 *
 * @param text - Input text
 * @returns Array of tokens with positions
 *
 * @example
 * tokenizeEnglish('Hello world');
 * // [{ text: 'Hello', start: 0, end: 5 }, { text: 'world', start: 6, end: 11 }]
 */
export function tokenizeEnglish(text: string): Token[] {
  const tokens: Token[] = [];
  // Match word characters (letters, apostrophes for contractions)
  const regex = /[a-zA-Z]+(?:'[a-zA-Z]+)?/g;
  let match: RegExpExecArray | null = regex.exec(text);

  while (match !== null) {
    tokens.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    match = regex.exec(text);
  }

  return tokens;
}

/**
 * Tokenize Korean text into words/morphemes
 * Korean doesn't use spaces consistently, so this is a simple word-boundary approach
 *
 * @param text - Input text
 * @returns Array of tokens with positions
 */
export function tokenizeKorean(text: string): Token[] {
  const tokens: Token[] = [];
  // Match Korean characters and mixed Korean-English
  const regex = /[가-힣]+|[a-zA-Z]+/g;
  let match: RegExpExecArray | null = regex.exec(text);

  while (match !== null) {
    tokens.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    match = regex.exec(text);
  }

  return tokens;
}

/**
 * Detect scattered letters pattern (e.g., "h e l l o" → "hello")
 * This detects when single letters are separated by spaces
 *
 * @param text - Input text to analyze
 * @param spellChecker - Optional function to validate reconstructed word
 * @returns Array of detected scattered letter patterns
 *
 * @example
 * detectScatteredLetters('I said h e l l o to you');
 * // [{ detected: true, reconstructed: 'hello', original: 'h e l l o', ... }]
 */
export function detectScatteredLetters(
  text: string,
  spellChecker?: (word: string) => boolean,
): ScatteredLettersResult[] {
  const results: ScatteredLettersResult[] = [];

  // Pattern: 2+ single letters separated by single spaces
  // Matches patterns like "h e l l o" or "w o r l d"
  const scatteredPattern = /\b([a-zA-Z])((?:\s[a-zA-Z]){2,})\b/g;
  let match: RegExpExecArray | null = scatteredPattern.exec(text);

  while (match !== null) {
    const fullMatch = match[0];
    const start = match.index;
    const end = start + fullMatch.length;

    // Reconstruct the word by removing spaces
    const reconstructed = fullMatch.replace(/\s/g, '');

    // Calculate confidence based on:
    // - Length of reconstructed word (longer = more confident)
    // - Spell checker validation (if provided)
    let confidence = 0.7; // Base confidence

    // Longer words are more likely intentional
    if (reconstructed.length >= 4) {
      confidence += 0.1;
    }
    if (reconstructed.length >= 6) {
      confidence += 0.1;
    }

    // Validate with spell checker if provided
    if (spellChecker) {
      if (spellChecker(reconstructed)) {
        confidence = Math.min(confidence + 0.15, 1.0);
      } else {
        confidence = Math.max(confidence - 0.3, 0.3);
      }
    }

    results.push({
      detected: true,
      reconstructed,
      original: fullMatch,
      start,
      end,
      confidence,
    });

    match = scatteredPattern.exec(text);
  }

  return results;
}

/**
 * Convert scattered letters detection results to TextError format
 *
 * @param results - Scattered letters detection results
 * @returns Array of TextError objects
 */
export function scatteredLettersToErrors(results: ScatteredLettersResult[]): TextError[] {
  return results.map((result) => ({
    type: 'spacing' as const,
    start: result.start,
    end: result.end,
    original: result.original,
    suggestions: [result.reconstructed],
    message: `Scattered letters detected: "${result.original}" → "${result.reconstructed}"`,
    confidence: result.confidence,
  }));
}

/**
 * Check if a token should be ignored for spell checking
 *
 * @param token - Token to check
 * @param options - Ignore options
 * @returns true if token should be ignored
 */
export function shouldIgnoreToken(
  token: Token,
  options: {
    ignoreShortWords?: boolean;
    minWordLength?: number;
    ignoreNumbers?: boolean;
    ignoreAllCaps?: boolean;
    maxAcronymLength?: number;
  } = {},
): boolean {
  const {
    ignoreShortWords = true,
    minWordLength = 2,
    ignoreNumbers = true,
    ignoreAllCaps = true,
    maxAcronymLength = 4,
  } = options;

  const { text } = token;

  // Ignore short words
  if (ignoreShortWords && text.length < minWordLength) {
    return true;
  }

  // Ignore words with numbers
  if (ignoreNumbers && /\d/.test(text)) {
    return true;
  }

  // Ignore all-uppercase words (likely acronyms)
  if (ignoreAllCaps && text === text.toUpperCase() && text.length <= maxAcronymLength) {
    return true;
  }

  return false;
}
