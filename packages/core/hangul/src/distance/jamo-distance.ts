// ========================================
// Jamo Edit Distance - 자모 편집 거리
// ========================================

import { isHangul } from '../jamo';

/**
 * Initial consonants (초성) - 19 consonants
 */
const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

/**
 * Medial vowels (중성) - 21 vowels
 */
const JUNGSEONG = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];

/**
 * Final consonants (종성) - 28 consonants (including empty)
 */
const JONGSEONG = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

/**
 * Korean 2-beolsik keyboard layout position map
 */
const KEYBOARD_LAYOUT: Record<string, { row: number; col: number }> = {
  // 1행 (자음)
  ㅂ: { row: 0, col: 0 },
  ㅃ: { row: 0, col: 0 },
  ㅈ: { row: 0, col: 1 },
  ㅉ: { row: 0, col: 1 },
  ㄷ: { row: 0, col: 2 },
  ㄸ: { row: 0, col: 2 },
  ㄱ: { row: 0, col: 3 },
  ㄲ: { row: 0, col: 3 },
  ㅅ: { row: 0, col: 4 },
  ㅆ: { row: 0, col: 4 },
  // 1행 (모음)
  ㅛ: { row: 0, col: 5 },
  ㅕ: { row: 0, col: 6 },
  ㅑ: { row: 0, col: 7 },
  ㅐ: { row: 0, col: 8 },
  ㅒ: { row: 0, col: 8 },
  ㅔ: { row: 0, col: 9 },
  ㅖ: { row: 0, col: 9 },

  // 2행 (자음)
  ㅁ: { row: 1, col: 0 },
  ㄴ: { row: 1, col: 1 },
  ㅇ: { row: 1, col: 2 },
  ㄹ: { row: 1, col: 3 },
  ㅎ: { row: 1, col: 4 },
  // 2행 (모음)
  ㅗ: { row: 1, col: 5 },
  ㅓ: { row: 1, col: 6 },
  ㅏ: { row: 1, col: 7 },
  ㅣ: { row: 1, col: 8 },

  // 3행 (자음)
  ㅋ: { row: 2, col: 0 },
  ㅌ: { row: 2, col: 1 },
  ㅊ: { row: 2, col: 2 },
  ㅍ: { row: 2, col: 3 },
  // 3행 (모음)
  ㅠ: { row: 2, col: 4 },
  ㅜ: { row: 2, col: 5 },
  ㅡ: { row: 2, col: 6 },
};

/**
 * Adjacent key mapping for O(1) neighbor lookup
 */
const ADJACENT_KEYS: Record<string, Set<string>> = {
  // 자음
  ㅂ: new Set(['ㅈ', 'ㅁ']),
  ㅈ: new Set(['ㅂ', 'ㄷ', 'ㅁ', 'ㄴ']),
  ㄷ: new Set(['ㅈ', 'ㄱ', 'ㄴ', 'ㅇ']),
  ㄱ: new Set(['ㄷ', 'ㅅ', 'ㅇ', 'ㄹ']),
  ㅅ: new Set(['ㄱ', 'ㅛ', 'ㄹ', 'ㅎ']),
  ㅁ: new Set(['ㅂ', 'ㅈ', 'ㅋ']),
  ㄴ: new Set(['ㅈ', 'ㄷ', 'ㅁ', 'ㅇ', 'ㅋ', 'ㅌ']),
  ㅇ: new Set(['ㄷ', 'ㄱ', 'ㄴ', 'ㄹ', 'ㅌ', 'ㅊ']),
  ㄹ: new Set(['ㄱ', 'ㅅ', 'ㅇ', 'ㅎ', 'ㅊ', 'ㅍ']),
  ㅎ: new Set(['ㅅ', 'ㅛ', 'ㄹ', 'ㅗ', 'ㅍ', 'ㅠ']),
  ㅋ: new Set(['ㅁ', 'ㄴ']),
  ㅌ: new Set(['ㄴ', 'ㅇ', 'ㅋ', 'ㅊ']),
  ㅊ: new Set(['ㅇ', 'ㄹ', 'ㅌ', 'ㅍ']),
  ㅍ: new Set(['ㄹ', 'ㅎ', 'ㅊ', 'ㅠ']),

  // 모음
  ㅛ: new Set(['ㅅ', 'ㅕ', 'ㅎ', 'ㅗ']),
  ㅕ: new Set(['ㅛ', 'ㅑ', 'ㅗ', 'ㅓ']),
  ㅑ: new Set(['ㅕ', 'ㅐ', 'ㅓ', 'ㅏ']),
  ㅐ: new Set(['ㅑ', 'ㅔ', 'ㅏ', 'ㅣ']),
  ㅔ: new Set(['ㅐ', 'ㅣ']),
  ㅗ: new Set(['ㅎ', 'ㅛ', 'ㅕ', 'ㅓ', 'ㅠ', 'ㅜ']),
  ㅓ: new Set(['ㅗ', 'ㅕ', 'ㅑ', 'ㅏ', 'ㅜ', 'ㅡ']),
  ㅏ: new Set(['ㅓ', 'ㅑ', 'ㅐ', 'ㅣ', 'ㅡ']),
  ㅣ: new Set(['ㅏ', 'ㅐ', 'ㅔ']),
  ㅠ: new Set(['ㅍ', 'ㅎ', 'ㅗ', 'ㅜ']),
  ㅜ: new Set(['ㅠ', 'ㅗ', 'ㅓ', 'ㅡ']),
  ㅡ: new Set(['ㅜ', 'ㅓ', 'ㅏ']),
};

/**
 * Double consonant pairs for typo detection
 */
const DOUBLE_CONSONANT_PAIRS: [string, string][] = [
  ['ㄱ', 'ㄲ'],
  ['ㄷ', 'ㄸ'],
  ['ㅂ', 'ㅃ'],
  ['ㅅ', 'ㅆ'],
  ['ㅈ', 'ㅉ'],
];

/**
 * Calculates the Euclidean distance between two Jamo on the keyboard
 */
export function keyboardDistance(jamo1: string, jamo2: string): number {
  const pos1 = KEYBOARD_LAYOUT[jamo1];
  const pos2 = KEYBOARD_LAYOUT[jamo2];

  if (!pos1 || !pos2) return 2; // 레이아웃에 없으면 기본 거리

  return Math.sqrt((pos1.row - pos2.row) ** 2 + (pos1.col - pos2.col) ** 2);
}

/**
 * Checks if two Jamo are adjacent keys on the keyboard
 */
export function isAdjacentKey(jamo1: string, jamo2: string): boolean {
  return ADJACENT_KEYS[jamo1]?.has(jamo2) || false;
}

/**
 * Checks if two Jamo are a single/double consonant pair
 */
export function isDoubleConsonantMistake(jamo1: string, jamo2: string): boolean {
  return DOUBLE_CONSONANT_PAIRS.some(
    ([a, b]) => (jamo1 === a && jamo2 === b) || (jamo1 === b && jamo2 === a),
  );
}

/**
 * Decomposes Korean text into individual Jamo characters
 */
export function decomposeToJamos(text: string): string[] {
  const jamos: string[] = [];

  for (const char of text) {
    if (isHangul(char)) {
      const code = char.charCodeAt(0);

      // 완성형 한글 (가-힣)
      if (code >= 0xac00 && code <= 0xd7a3) {
        const syllableIndex = code - 0xac00;
        const cho = Math.floor(syllableIndex / 588);
        const jung = Math.floor((syllableIndex % 588) / 28);
        const jong = syllableIndex % 28;

        const choChar = CHOSEONG[cho];
        const jungChar = JUNGSEONG[jung];
        if (choChar) jamos.push(choChar);
        if (jungChar) jamos.push(jungChar);
        if (jong > 0) {
          const jongChar = JONGSEONG[jong];
          if (jongChar) jamos.push(jongChar);
        }
      }
      // 자모 (ㄱ-ㅎ, ㅏ-ㅣ)
      else {
        jamos.push(char);
      }
    } else {
      jamos.push(char);
    }
  }

  return jamos;
}

/**
 * Calculates keyboard-weighted Jamo edit distance between two Korean words
 */
export function jamoEditDistance(word1: string, word2: string): number {
  const jamos1 = decomposeToJamos(word1);
  const jamos2 = decomposeToJamos(word2);

  const m = jamos1.length;
  const n = jamos2.length;

  // DP 테이블 초기화
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

  // 편집 거리 계산
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const currentRow = dp[i];
      const prevRow = dp[i - 1];
      if (!currentRow || !prevRow) continue;

      if (jamos1[i - 1] === jamos2[j - 1]) {
        currentRow[j] = prevRow[j - 1] ?? 0;
      } else {
        const j1 = jamos1[i - 1] ?? '';
        const j2 = jamos2[j - 1] ?? '';

        // 대체 비용 계산
        let substituteCost = 1;

        // 쌍자음 실수는 비용 0.3
        if (isDoubleConsonantMistake(j1, j2)) {
          substituteCost = 0.3;
        }
        // 인접 키 오타는 비용 0.5
        else if (isAdjacentKey(j1, j2)) {
          substituteCost = 0.5;
        }
        // 키보드 거리가 가까우면 비용 감소
        else {
          const kbDist = keyboardDistance(j1, j2);
          if (kbDist < 1.5) {
            substituteCost = 0.6;
          } else if (kbDist < 2.5) {
            substituteCost = 0.8;
          }
        }

        const deleteVal = (prevRow[j] ?? 0) + 1;
        const insertVal = (currentRow[j - 1] ?? 0) + 1;
        const substituteVal = (prevRow[j - 1] ?? 0) + substituteCost;
        currentRow[j] = Math.min(deleteVal, insertVal, substituteVal);
      }
    }
  }

  const lastRow = dp[m];
  return lastRow ? (lastRow[n] ?? 0) : 0;
}
