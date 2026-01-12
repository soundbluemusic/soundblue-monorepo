// ========================================
// Typo Correction Module - 오타 교정 모듈
// ========================================

// 빈번한 오타 사전
export {
  commonTypos,
  confusablePairs,
  correctAllCommonTypos,
  correctCommonTypo,
  isCommonTypo,
} from './common-typos';
// DP 기반 단어 분리
export {
  COMMON_VERB_STEMS,
  DP_COSTS,
  type DpSplitResult,
  dpWordSplit,
  getWordCost,
  isVerbStem,
  KOREAN_ENDINGS,
  KOREAN_PARTICLES,
  KOREAN_WORD_SET,
  MAX_WORD_LENGTH,
  SORTED_ENDINGS,
  SORTED_PARTICLES,
} from './dp-word-split';
// 자모 편집거리
export {
  calculateKeyboardSimilarity,
  decomposeToJamos,
  isAdjacentKey,
  isDoubleConsonantMistake,
  jamoEditDistance,
  keyboardDistance,
} from './jamo-edit-distance';
// 잘못 띄어쓴 텍스트 합치기
export { mergeWrongSpacing } from './merge-spacing';
// 통합 띄어쓰기 교정
export { correctSpacingFull, recoverSpacing } from './spacing-full';
// 띄어쓰기 규칙 (패턴 기반)
export {
  auxiliaryVerbPatterns,
  correctAuxiliaryVerbSpacing,
  correctDependencyNounSpacing,
  correctNounVerbSpacing,
  correctParticleSpacing,
  correctSpacing,
  dependencyNouns,
  particles,
} from './spacing-rules';
// 메인 교정기
export {
  type CandidateWord,
  type CorrectionDetail,
  type CorrectionResult,
  type CorrectionStats,
  correctSpacingOnly,
  correctTypos,
  extractTypoCandidates,
  findSimilarWords,
  getCorrectionStats,
  isTypo,
} from './typo-corrector';
