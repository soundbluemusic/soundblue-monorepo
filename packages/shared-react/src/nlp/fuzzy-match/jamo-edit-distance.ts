/**
 * @fileoverview Jamo Edit Distance - Korean Keyboard-Aware Edit Distance Algorithm
 * 자모 기반 편집 거리 - 한글 키보드 가중치 적용
 *
 * @description
 * This module implements a modified Levenshtein distance algorithm optimized for
 * Korean text by operating on the Jamo (자모) level rather than syllable level.
 *
 * ## Algorithm Overview (알고리즘 개요)
 *
 * Standard Levenshtein distance treats each Korean syllable (e.g., "가", "나") as a
 * single character. This module decomposes syllables into their constituent Jamo
 * (초성/중성/종성) before calculating distance, providing more accurate typo detection.
 *
 * **Example:**
 * - "가" → ['ㄱ', 'ㅏ'] (초성 + 중성)
 * - "강" → ['ㄱ', 'ㅏ', 'ㅇ'] (초성 + 중성 + 종성)
 *
 * ## Key Features (주요 기능)
 *
 * 1. **Jamo Decomposition**: Breaks Korean syllables into initial (초성),
 *    medial (중성), and final (종성) consonants/vowels
 *
 * 2. **Keyboard Distance Weighting**: Reduces edit cost for keys that are
 *    physically close on the Korean 2-beolsik (두벌식) keyboard layout
 *
 * 3. **Double Consonant Detection**: Recognizes ㄱ↔ㄲ, ㄷ↔ㄸ mistakes as
 *    common typos with reduced cost (0.3)
 *
 * 4. **Adjacent Key Detection**: Uses pre-computed adjacency map for O(1)
 *    lookup of neighboring keys (cost: 0.5)
 *
 * ## Cost Matrix (비용 표)
 *
 * | Operation                | Cost  | Example         |
 * |--------------------------|-------|-----------------|
 * | Exact match              | 0     | ㄱ = ㄱ         |
 * | Double consonant mistake | 0.3   | ㄱ ↔ ㄲ         |
 * | Adjacent key             | 0.5   | ㄱ ↔ ㅅ         |
 * | Near key (dist < 1.5)    | 0.6   | ㅂ ↔ ㄷ         |
 * | Medium key (dist < 2.5)  | 0.8   | ㅂ ↔ ㄱ         |
 * | Far key / Insert / Delete| 1.0   | ㅂ ↔ ㅊ         |
 *
 * ## Use Cases (사용 사례)
 *
 * - **Typo Correction**: Detecting and suggesting corrections for misspelled words
 * - **Fuzzy Search**: Finding matches despite minor spelling errors
 * - **Input Validation**: Identifying likely typos in user input
 *
 * @module jamo-edit-distance
 * @see {@link https://en.wikipedia.org/wiki/Levenshtein_distance} for base algorithm
 * @see {@link https://en.wikipedia.org/wiki/Korean_language_and_computers#Hangul_in_Unicode} for Jamo encoding
 */

import { isHangul } from '../hangul/jamo';

/**
 * Initial consonants (초성) - 19 consonants
 *
 * Unicode range: U+1100–U+1112 (Hangul Jamo block)
 * These are the consonants that can appear at the beginning of a Korean syllable.
 *
 * The order matches the standard Korean syllable composition formula:
 * syllable_code = 0xAC00 + (cho × 588) + (jung × 28) + jong
 *
 * @constant
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
 *
 * Unicode range: U+1161–U+1175 (Hangul Jamo block)
 * These are the vowels that form the middle part of a Korean syllable.
 *
 * Includes both simple vowels (ㅏ, ㅓ, ㅗ, etc.) and compound vowels (ㅘ, ㅙ, ㅝ, etc.)
 *
 * @constant
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
 *
 * Unicode range: U+11A8–U+11C2 (Hangul Jamo block)
 * These are the consonants that can appear at the end of a Korean syllable.
 *
 * Index 0 is empty string ('') representing no final consonant.
 * Includes compound consonants (ㄳ, ㄵ, ㄶ, etc.) that only appear in 종성 position.
 *
 * @constant
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
 * Korean 2-beolsik (두벌식) keyboard layout position map
 *
 * Maps each Jamo to its physical position on a standard Korean keyboard.
 * Used for calculating Euclidean distance between keys.
 *
 * ## Layout Visualization (키보드 레이아웃)
 *
 * ```
 * Row 0: ㅂ(ㅃ) ㅈ(ㅉ) ㄷ(ㄸ) ㄱ(ㄲ) ㅅ(ㅆ) | ㅛ   ㅕ   ㅑ   ㅐ(ㅒ) ㅔ(ㅖ)
 * Row 1: ㅁ    ㄴ    ㅇ    ㄹ    ㅎ    | ㅗ   ㅓ   ㅏ   ㅣ
 * Row 2: ㅋ    ㅌ    ㅊ    ㅍ          | ㅠ   ㅜ   ㅡ
 * ```
 *
 * Note: Shift variants (ㄲ, ㅆ, etc.) share positions with base characters.
 *
 * @constant
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
 * Adjacent key mapping for O(1) neighbor lookup (인접 키 매핑)
 *
 * Pre-computed adjacency map based on the 2-beolsik keyboard layout.
 * Two keys are considered adjacent if they share an edge on the keyboard.
 *
 * This enables fast typo detection: if two Jamo are adjacent, the substitution
 * is likely a typo rather than intentional, so we reduce the edit cost.
 *
 * @constant
 * @example
 * // Check if ㄱ and ㅅ are adjacent
 * ADJACENT_KEYS['ㄱ']?.has('ㅅ') // true - they're neighbors on row 0
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
 * Double consonant pairs for typo detection (쌍자음 쌍)
 *
 * These pairs represent single consonants and their tensed (쌍) counterparts.
 * Mistaking ㄱ for ㄲ (or vice versa) is extremely common since they share
 * the same key position—only Shift is different.
 *
 * This has the lowest substitution cost (0.3) in our algorithm.
 *
 * @constant
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
 * 두 자모 간의 키보드 유클리드 거리 계산
 *
 * Uses the 2-beolsik keyboard layout coordinates to compute physical distance.
 * This helps identify typos where a user hit a nearby key.
 *
 * @param jamo1 - First Jamo character (e.g., 'ㄱ')
 * @param jamo2 - Second Jamo character (e.g., 'ㅅ')
 * @returns Euclidean distance between the two keys, or 2 if either Jamo is not in the layout
 *
 * @example
 * // Adjacent keys (row 0, cols 3-4)
 * keyboardDistance('ㄱ', 'ㅅ'); // 1.0
 *
 * @example
 * // Same position (shift variant)
 * keyboardDistance('ㄱ', 'ㄲ'); // 0.0
 *
 * @example
 * // Distant keys
 * keyboardDistance('ㅂ', 'ㅊ'); // ~2.83
 */
export function keyboardDistance(jamo1: string, jamo2: string): number {
  const pos1 = KEYBOARD_LAYOUT[jamo1];
  const pos2 = KEYBOARD_LAYOUT[jamo2];

  if (!pos1 || !pos2) return 2; // 레이아웃에 없으면 기본 거리

  return Math.sqrt((pos1.row - pos2.row) ** 2 + (pos1.col - pos2.col) ** 2);
}

/**
 * Checks if two Jamo are adjacent keys on the keyboard
 * 두 자모가 키보드에서 인접한 키인지 확인
 *
 * Uses the pre-computed ADJACENT_KEYS map for O(1) lookup.
 * Adjacent keys indicate likely typos, warranting reduced edit cost.
 *
 * @param jamo1 - First Jamo character
 * @param jamo2 - Second Jamo character
 * @returns `true` if the keys are physically adjacent, `false` otherwise
 *
 * @example
 * isAdjacentKey('ㄱ', 'ㅅ'); // true - neighbors on row 0
 * isAdjacentKey('ㄱ', 'ㅊ'); // false - not adjacent
 * isAdjacentKey('ㅏ', 'ㅣ'); // true - neighbors on row 1
 */
export function isAdjacentKey(jamo1: string, jamo2: string): boolean {
  return ADJACENT_KEYS[jamo1]?.has(jamo2) || false;
}

/**
 * Checks if two Jamo are a single/double consonant pair
 * 두 자모가 단자음/쌍자음 쌍인지 확인
 *
 * Double consonant mistakes (e.g., typing ㄱ instead of ㄲ) are extremely common
 * because they share the same key—only Shift differs. This warrants the lowest
 * substitution cost (0.3) in our algorithm.
 *
 * @param jamo1 - First Jamo character
 * @param jamo2 - Second Jamo character
 * @returns `true` if jamo1 and jamo2 form a single/double pair
 *
 * @example
 * isDoubleConsonantMistake('ㄱ', 'ㄲ'); // true
 * isDoubleConsonantMistake('ㅅ', 'ㅆ'); // true
 * isDoubleConsonantMistake('ㄱ', 'ㄴ'); // false
 */
export function isDoubleConsonantMistake(jamo1: string, jamo2: string): boolean {
  return DOUBLE_CONSONANT_PAIRS.some(
    ([a, b]) => (jamo1 === a && jamo2 === b) || (jamo1 === b && jamo2 === a),
  );
}

/**
 * Decomposes Korean text into individual Jamo characters
 * 한글 텍스트를 개별 자모로 분해
 *
 * Converts complete Korean syllables (가-힣) into their constituent Jamo
 * (초성, 중성, 종성). Non-Hangul characters are passed through unchanged.
 *
 * ## Unicode Math (유니코드 계산)
 *
 * Korean syllables in Unicode follow a mathematical formula:
 * ```
 * syllable_code = 0xAC00 + (cho × 588) + (jung × 28) + jong
 * ```
 *
 * This function reverses that formula to extract each component.
 *
 * @param text - Text to decompose (can contain Korean and non-Korean characters)
 * @returns Array of Jamo characters and non-Korean characters
 *
 * @example
 * // Complete syllables with 종성
 * decomposeToJamos('강'); // ['ㄱ', 'ㅏ', 'ㅇ']
 *
 * @example
 * // Syllable without 종성
 * decomposeToJamos('가'); // ['ㄱ', 'ㅏ']
 *
 * @example
 * // Mixed text
 * decomposeToJamos('한글ABC'); // ['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ', 'A', 'B', 'C']
 *
 * @example
 * // Already decomposed Jamo (pass-through)
 * decomposeToJamos('ㄱㅏ'); // ['ㄱ', 'ㅏ']
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
 * 키보드 가중치가 적용된 자모 편집 거리 계산
 *
 * This is the main algorithm of this module. It computes a modified Levenshtein
 * distance at the Jamo level, with reduced costs for common typos.
 *
 * ## Algorithm (알고리즘)
 *
 * 1. Decompose both words into Jamo arrays
 * 2. Build a DP matrix for edit distance
 * 3. For substitutions, apply keyboard-aware costs:
 *    - Double consonant mistake (ㄱ↔ㄲ): 0.3
 *    - Adjacent key: 0.5
 *    - Near key (dist < 1.5): 0.6
 *    - Medium key (dist < 2.5): 0.8
 *    - Far key: 1.0
 * 4. Insert/delete operations always cost 1.0
 *
 * ## Complexity (복잡도)
 *
 * - Time: O(m × n) where m, n are Jamo counts of the two words
 * - Space: O(m × n) for the DP table
 *
 * @param word1 - First word (Korean or mixed)
 * @param word2 - Second word (Korean or mixed)
 * @returns Weighted edit distance (can be fractional due to weighted substitutions)
 *
 * @example
 * // Identical words
 * jamoEditDistance('안녕', '안녕'); // 0
 *
 * @example
 * // Double consonant typo (very low cost)
 * jamoEditDistance('사과', '싸과'); // 0.3
 *
 * @example
 * // Adjacent key typo
 * jamoEditDistance('사과', '다과'); // 0.5 (ㅅ→ㄷ adjacent)
 *
 * @example
 * // Multiple differences
 * jamoEditDistance('컴퓨터', '캄표타'); // ~1.9
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

/**
 * Calculates keyboard-aware similarity score between two Korean words
 * 키보드 인식 유사도 점수 계산 (0~1)
 *
 * Converts the edit distance into a normalized similarity score between 0 and 1,
 * where 1 means identical and 0 means completely different.
 *
 * ## Formula (공식)
 *
 * ```
 * similarity = max(0, 1 - (distance / maxLength))
 * ```
 *
 * Where `maxLength` is the Jamo count of the longer word.
 *
 * ## Use Cases (사용 사례)
 *
 * - Fuzzy search ranking (higher score = better match)
 * - Typo tolerance thresholds (e.g., accept if similarity > 0.8)
 * - Autocomplete suggestions (sort by similarity)
 *
 * @param word1 - First word (Korean or mixed)
 * @param word2 - Second word (Korean or mixed)
 * @returns Similarity score from 0.0 (no similarity) to 1.0 (identical)
 *
 * @example
 * // Identical words
 * calculateKeyboardSimilarity('안녕', '안녕'); // 1.0
 *
 * @example
 * // Minor typo (high similarity)
 * calculateKeyboardSimilarity('사과', '싸과'); // ~0.95
 *
 * @example
 * // Different words (low similarity)
 * calculateKeyboardSimilarity('사과', '바나나'); // ~0.2
 *
 * @example
 * // Empty string handling
 * calculateKeyboardSimilarity('', '안녕'); // 0
 */
export function calculateKeyboardSimilarity(word1: string, word2: string): number {
  const jamos1 = decomposeToJamos(word1);
  const jamos2 = decomposeToJamos(word2);

  if (jamos1.length === 0 || jamos2.length === 0) return 0;

  const maxLen = Math.max(jamos1.length, jamos2.length);
  const distance = jamoEditDistance(word1, word2);

  return Math.max(0, 1 - distance / maxLen);
}
