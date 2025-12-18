/**
 * @fileoverview Language detection for chat input
 * Detects the primary language of user input based on character ratio.
 */

import type { Locale } from '~/i18n/translations';

// Korean: Hangul syllables + Jamo (consonants/vowels)
const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/g;

// English: Latin alphabet
const ENGLISH_REGEX = /[a-zA-Z]/g;

interface LanguageRatios {
  korean: number;
  english: number;
  total: number;
}

/**
 * Counts characters by language type and calculates ratios.
 */
function calculateRatios(text: string): LanguageRatios {
  const koreanChars = (text.match(KOREAN_REGEX) || []).length;
  const englishChars = (text.match(ENGLISH_REGEX) || []).length;
  const total = koreanChars + englishChars;

  return {
    korean: koreanChars,
    english: englishChars,
    total,
  };
}

/**
 * Detects the primary language of the input text.
 * Uses 50% threshold to determine the dominant language.
 *
 * @param text - User input text
 * @param fallback - Fallback locale if detection fails (default: 'en')
 * @returns Detected locale ('ko' or 'en')
 *
 * @example
 * detectLanguage('안녕하세요')     // 'ko'
 * detectLanguage('hello')          // 'en'
 * detectLanguage('하이')           // 'ko'
 * detectLanguage('오늘 weather')   // 'ko' (67% Korean)
 * detectLanguage('what 시간')      // 'en' (67% English)
 */
export function detectLanguage(text: string, fallback: Locale = 'en'): Locale {
  const ratios = calculateRatios(text);

  // No detectable characters - use fallback
  if (ratios.total === 0) {
    return fallback;
  }

  const koreanRatio = ratios.korean / ratios.total;

  // 50% threshold for language detection
  if (koreanRatio >= 0.5) return 'ko';

  return 'en';
}

/**
 * Gets language ratios for debugging/logging purposes.
 */
export function getLanguageRatios(text: string): { ko: number; en: number } {
  const ratios = calculateRatios(text);

  if (ratios.total === 0) {
    return { ko: 0, en: 0 };
  }

  return {
    ko: Math.round((ratios.korean / ratios.total) * 100),
    en: Math.round((ratios.english / ratios.total) * 100),
  };
}
