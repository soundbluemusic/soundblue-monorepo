// ========================================
// @soundblue/text-processor
// Common text processing utilities for language tools
// Pure functions (no browser APIs)
// ========================================

// Correction utilities
export { applyCorrections, filterOverlappingErrors, sortErrorsByPosition } from './corrections';
// English grammar utilities
export {
  checkArticles,
  checkEnglishGrammar,
  checkPrepositions,
  checkSubjectVerbAgreement,
  checkTenseConsistency,
} from './grammar-en';
// Statistics utilities
export { calculateStats, createEmptyStats, getErrorRate, getTotalErrors } from './stats';
export type { ScatteredLettersResult, Token } from './tokenizer';
// Tokenizer utilities
export {
  detectScatteredLetters,
  scatteredLettersToErrors,
  shouldIgnoreToken,
  tokenizeEnglish,
  tokenizeKorean,
} from './tokenizer';
// Types
export type {
  TextCheckOptions,
  TextCheckResult,
  TextCheckStats,
  TextError,
  TextErrorType,
  TextLanguage,
} from './types';
