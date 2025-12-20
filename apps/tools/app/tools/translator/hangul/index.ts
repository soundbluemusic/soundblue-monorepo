// ========================================
// Hangul Module - 한글 처리 모듈
// ========================================

// 불규칙 활용
export {
  applyIrregular,
  getIrregularType,
  type IrregularType,
  irregularStems,
  restoreIrregular,
} from './irregulars';
// 자모 분해/조합
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
  type Jamo,
  JONG_LIST,
  JUNG_LIST,
  removeBatchim,
  splitDoubleJong,
} from './jamo';
// 음운 규칙
export {
  applyFinalConsonantRule,
  applyFortition,
  applyLiquidization,
  applyNasalization,
  applyPalatalization,
  selectAOrEo,
  toPronunciation,
} from './phonetics';
// 음절 분석
export {
  analyzeSyllables,
  applyLiaison,
  choToJong,
  combineSyllables,
  countSyllables,
  findSyllableBoundaries,
  type Syllable,
} from './syllable';
