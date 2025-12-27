// ========================================
// NLP Module - 자연어 처리 모듈
// ========================================

// Fuzzy matching
export {
  calculateKeyboardSimilarity,
  decomposeToJamos,
  findAllMatches,
  findBestMatch,
  fuzzyMatch,
  isAdjacentKey,
  isDoubleConsonantMistake,
  isKoreanText,
  jamoEditDistance,
  keyboardDistance,
  levenshteinDistance,
} from './fuzzy-match';

// Hangul processing
export {
  CHO_LIST,
  changeBatchim,
  compose,
  DOUBLE_JONG,
  decompose,
  decomposeAll,
  extractCho,
  getBatchim,
  hasBatchim,
  hasLastBatchim,
  isConsonant,
  isHangul,
  isJamo,
  isVowel,
  JONG_LIST,
  JUNG_LIST,
  removeBatchim,
  splitDoubleJong,
} from './hangul';
// Types
export type {
  FuzzyMatchOptions,
  FuzzyMatchResult,
  Jamo,
  TypoCorrectionResult,
} from './types';
