// ========================================
// Fuzzy Matcher - 고수준 퍼지 매칭 API
// ========================================

import { isHangul } from '@soundblue/hangul';
import type { FuzzyMatchOptions, FuzzyMatchResult } from '../types';
import { calculateKeyboardSimilarity, jamoEditDistance } from './jamo-edit-distance';

/**
 * 텍스트가 한국어인지 확인
 */
export function isKoreanText(text: string): boolean {
  for (const char of text) {
    if (isHangul(char)) return true;
  }
  return false;
}

/**
 * 영어 편집 거리 계산 (Levenshtein)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    const row = dp[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j <= n; j++) {
    const firstRow = dp[0];
    if (firstRow) firstRow[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const currentRow = dp[i];
      const prevRow = dp[i - 1];
      if (!currentRow || !prevRow) continue;

      if (str1[i - 1] === str2[j - 1]) {
        currentRow[j] = prevRow[j - 1] ?? 0;
      } else {
        const deleteVal = (prevRow[j] ?? 0) + 1;
        const insertVal = (currentRow[j - 1] ?? 0) + 1;
        const substituteVal = (prevRow[j - 1] ?? 0) + 1;
        currentRow[j] = Math.min(deleteVal, insertVal, substituteVal);
      }
    }
  }

  const lastRow = dp[m];
  return lastRow ? (lastRow[n] ?? 0) : 0;
}

/**
 * 퍼지 매칭 수행
 */
export function fuzzyMatch(
  input: string,
  target: string,
  options: FuzzyMatchOptions = {},
): FuzzyMatchResult {
  const { maxDistance = 2, caseSensitive = false, locale } = options;

  // 대소문자 처리
  const normalizedInput = caseSensitive ? input : input.toLowerCase();
  const normalizedTarget = caseSensitive ? target : target.toLowerCase();

  // 언어 감지 또는 옵션 사용
  const isKorean = locale === 'ko' || (locale !== 'en' && isKoreanText(normalizedInput));

  // 편집 거리 계산
  let distance: number;
  let similarity: number;

  if (isKorean) {
    distance = jamoEditDistance(normalizedInput, normalizedTarget);
    similarity = calculateKeyboardSimilarity(normalizedInput, normalizedTarget);
  } else {
    distance = levenshteinDistance(normalizedInput, normalizedTarget);
    const maxLen = Math.max(normalizedInput.length, normalizedTarget.length);
    similarity = maxLen > 0 ? Math.max(0, 1 - distance / maxLen) : 0;
  }

  return {
    text: target,
    distance,
    similarity,
    isMatch: distance <= maxDistance,
  };
}

/**
 * 후보 목록에서 가장 유사한 항목 찾기
 */
export function findBestMatch(
  input: string,
  candidates: string[],
  options: FuzzyMatchOptions = {},
): FuzzyMatchResult | null {
  if (candidates.length === 0) return null;

  let bestMatch: FuzzyMatchResult | null = null;

  for (const candidate of candidates) {
    const result = fuzzyMatch(input, candidate, options);

    if (result.isMatch) {
      if (!bestMatch || result.similarity > bestMatch.similarity) {
        bestMatch = result;
      }
    }
  }

  return bestMatch;
}

/**
 * 후보 목록에서 유사한 모든 항목 찾기
 */
export function findAllMatches(
  input: string,
  candidates: string[],
  options: FuzzyMatchOptions = {},
): FuzzyMatchResult[] {
  const results: FuzzyMatchResult[] = [];

  for (const candidate of candidates) {
    const result = fuzzyMatch(input, candidate, options);
    if (result.isMatch) {
      results.push(result);
    }
  }

  // 유사도 높은 순으로 정렬
  return results.sort((a, b) => b.similarity - a.similarity);
}
