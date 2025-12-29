// ========================================
// Similarity - 유사도 계산
// ========================================

import { decomposeToJamos, jamoEditDistance } from './jamo-distance';

/**
 * 두 문자열의 유사도 계산 (0~1)
 */
export function similarity(a: string, b: string): number {
  const jamos1 = decomposeToJamos(a);
  const jamos2 = decomposeToJamos(b);

  if (jamos1.length === 0 || jamos2.length === 0) return 0;

  const distance = jamoEditDistance(a, b);
  const maxLen = Math.max(jamos1.length, jamos2.length);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Calculates keyboard-aware similarity score between two Korean words
 * 키보드 인식 유사도 점수 계산 (0~1)
 */
export function calculateKeyboardSimilarity(word1: string, word2: string): number {
  return similarity(word1, word2);
}
