/**
 * Fuzzy matching utilities for typo-tolerant query matching
 * 오타 허용 쿼리 매칭을 위한 퍼지 매칭 유틸리티
 */

/**
 * Calculate Levenshtein distance between two strings
 * 두 문자열 간의 편집 거리 계산
 */
export function levenshtein(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  // Early exits
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;
  if (a === b) return 0;

  // Create matrix
  const matrix: number[][] = [];

  for (let i = 0; i <= aLen; i++) {
    matrix[i] = [i];
  }
  const firstRow = matrix[0];
  if (firstRow) {
    for (let j = 0; j <= bLen; j++) {
      firstRow[j] = j;
    }
  }

  // Fill matrix
  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const prevRow = matrix[i - 1];
      const currentRow = matrix[i];
      const prevCell = currentRow?.[j - 1];
      const diagCell = prevRow?.[j - 1];
      const topCell = prevRow?.[j];

      if (currentRow && prevCell !== undefined && diagCell !== undefined && topCell !== undefined) {
        currentRow[j] = Math.min(
          topCell + 1, // deletion
          prevCell + 1, // insertion
          diagCell + cost, // substitution
        );
      }
    }
  }

  const lastRow = matrix[aLen];
  return lastRow?.[bLen] ?? 0;
}

/**
 * Check if two strings are similar within a threshold
 * 두 문자열이 임계값 내에서 유사한지 확인
 */
export function isSimilar(input: string, target: string, threshold?: number): boolean {
  const normalizedInput = input.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  // Exact match
  if (normalizedInput === normalizedTarget) return true;

  // Contains check - but only if lengths are similar (within 50%)
  // 길이가 비슷할 때만 contains 체크 (짧은 단어가 긴 키워드에 포함되는 것 방지)
  const lengthRatio =
    Math.min(normalizedInput.length, normalizedTarget.length) /
    Math.max(normalizedInput.length, normalizedTarget.length);

  if (lengthRatio >= 0.5) {
    if (normalizedInput.includes(normalizedTarget) || normalizedTarget.includes(normalizedInput)) {
      return true;
    }
  }

  // For very short strings (3 chars or less), require exact match
  // 매우 짧은 문자열은 정확한 매칭 필요
  if (normalizedTarget.length <= 3 || normalizedInput.length <= 3) {
    return false;
  }

  // Calculate dynamic threshold based on target length
  // Stricter threshold: only allow 1 typo for short words
  // 더 엄격한 임계값: 짧은 단어는 1개 오타만 허용
  const maxThreshold = threshold ?? Math.min(2, Math.max(1, Math.floor(target.length / 4)));
  const distance = levenshtein(normalizedInput, normalizedTarget);

  return distance <= maxThreshold;
}

/**
 * Check if input contains any similar keyword
 * 입력이 유사한 키워드를 포함하는지 확인
 */
export function containsSimilarKeyword(
  input: string,
  keywords: string[],
  threshold?: number,
): boolean {
  const normalizedInput = input.toLowerCase().replace(/\s+/g, '');

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, '');

    // Direct contains
    if (normalizedInput.includes(normalizedKeyword)) {
      return true;
    }

    // Fuzzy match for short inputs
    if (isSimilar(normalizedInput, normalizedKeyword, threshold)) {
      return true;
    }

    // Check each word in input
    const words = input.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (isSimilar(word, normalizedKeyword, threshold)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Remove spaces and normalize for comparison
 * 비교를 위해 공백 제거 및 정규화
 */
export function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '').trim();
}
