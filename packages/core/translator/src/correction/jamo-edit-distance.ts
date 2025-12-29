// ========================================
// Jamo Edit Distance - 자모 기반 편집 거리
// Re-export from @soundblue/hangul/distance
// ========================================

// Re-export all from @soundblue/hangul/distance
export {
  decomposeToJamos,
  isAdjacentKey,
  isDoubleConsonantMistake,
  jamoEditDistance,
  keyboardDistance,
  similarity as calculateKeyboardSimilarity,
} from '@soundblue/hangul/distance';
