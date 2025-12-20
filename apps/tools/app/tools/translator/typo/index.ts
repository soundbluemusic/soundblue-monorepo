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
// 자모 편집거리
export {
  calculateKeyboardSimilarity,
  decomposeToJamos,
  isAdjacentKey,
  isDoubleConsonantMistake,
  jamoEditDistance,
  keyboardDistance,
} from './jamo-edit-distance';

// 띄어쓰기 규칙
export {
  auxiliaryVerbPatterns,
  correctAuxiliaryVerbSpacing,
  correctDependencyNounSpacing,
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
