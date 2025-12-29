// ========================================
// @soundblue/hangul - Korean Hangul Processing Utilities
// 한글 처리 유틸리티
// ========================================

// Distance (거리)
export {
  calculateKeyboardSimilarity,
  decomposeToJamos,
  isAdjacentKey,
  isDoubleConsonantMistake,
  jamoEditDistance,
  keyboardDistance,
  similarity,
} from './distance';
// Irregulars (불규칙)
export { applyIrregular, getIrregularType, irregularStems, restoreIrregular } from './irregulars';
// Jamo (자모)
export {
  CHO,
  CHO_LIST,
  COMPLEX_CONSONANTS,
  COMPLEX_VOWELS,
  changeBatchim,
  // Compose
  compose,
  DOUBLE_CONSONANTS,
  DOUBLE_JONG,
  // Decompose
  decompose,
  decomposeAll,
  extractCho,
  getBatchim,
  // Constants
  HANGUL_BASE,
  HANGUL_END,
  // Batchim
  hasBatchim,
  hasLastBatchim,
  isConsonant,
  // Validators
  isHangul,
  isJamo,
  isVowel,
  JONG,
  JONG_COUNT,
  JONG_LIST,
  JUNG,
  JUNG_COUNT,
  JUNG_LIST,
  removeBatchim,
  SIMPLE_CONSONANTS,
  SIMPLE_VOWELS,
  SYLLABLE_PER_CHO,
  splitDoubleJong,
} from './jamo';

// Phonetics (음운)
export {
  applyFinalConsonantRule,
  applyFortition,
  applyLiquidization,
  applyNasalization,
  applyPalatalization,
  selectAOrEo,
  toPronunciation,
} from './phonetics';
// Syllable (음절)
export {
  analyzeSyllables,
  applyLiaison,
  choToJong,
  combineSyllables,
  countSyllables,
  findSyllableBoundaries,
} from './syllable';
// Types
export type { ChoType, IrregularType, Jamo, JongType, JungType, Syllable } from './types';
