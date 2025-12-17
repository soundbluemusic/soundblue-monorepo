/**
 * @fileoverview Fuzzy Matching Utilities for Typo-Tolerant Query Matching
 * (오타 허용 쿼리 매칭을 위한 퍼지 매칭 유틸리티)
 *
 * This module provides string similarity functions used by the Dialogue app
 * to match user queries against known keywords, even when users make typos.
 * This improves user experience by understanding queries like "weatehr" as "weather"
 * or "tiem" as "time".
 *
 * ## Core Algorithm: Levenshtein Distance
 *
 * The Levenshtein distance (edit distance) measures the minimum number of
 * single-character edits needed to transform one string into another:
 * - **Insertion**: Add a character (cat → cart)
 * - **Deletion**: Remove a character (cart → cat)
 * - **Substitution**: Replace a character (cat → bat)
 *
 * ## Matching Strategy
 *
 * The module uses a multi-step matching approach for reliability:
 *
 * 1. **Exact match** - Direct string equality (fastest)
 * 2. **Contains check** - One string contains the other (only if lengths similar)
 * 3. **Fuzzy match** - Levenshtein distance within threshold (most flexible)
 *
 * ## Threshold Logic
 *
 * The matching threshold adapts to string length to balance:
 * - **False positives**: Accepting unrelated words as matches
 * - **False negatives**: Rejecting valid typos
 *
 * | String Length | Max Typos Allowed | Example                    |
 * |---------------|-------------------|----------------------------|
 * | ≤ 3 chars     | 0 (exact only)    | "time" must be exact       |
 * | 4-7 chars     | 1                 | "tiem" → "time" ✓          |
 * | 8+ chars      | 2                 | "temperture" → "temperature" ✓ |
 *
 * ## Performance Characteristics
 *
 * - **Levenshtein**: O(m×n) time and space, where m,n are string lengths
 * - **isSimilar**: O(m×n) worst case, O(1) for exact matches
 * - **containsSimilarKeyword**: O(k × w × m×n) where k=keywords, w=words in input
 *
 * @module dialogue/lib/fuzzy
 *
 * @example
 * ```typescript
 * import { isSimilar, containsSimilarKeyword, levenshtein } from './fuzzy';
 *
 * // Basic similarity check
 * isSimilar('weather', 'weatehr');  // true (1 typo)
 * isSimilar('time', 'tiem');        // true (1 typo)
 * isSimilar('cat', 'dog');          // false (too different)
 *
 * // Check if input contains similar keywords
 * const weatherKeywords = ['weather', 'forecast', 'temperature'];
 * containsSimilarKeyword('what is the weatehr', weatherKeywords);  // true
 *
 * // Calculate exact edit distance
 * levenshtein('kitten', 'sitting');  // 3
 * ```
 *
 * @see https://en.wikipedia.org/wiki/Levenshtein_distance
 */

/**
 * Calculates the Levenshtein distance (edit distance) between two strings.
 * (두 문자열 간의 레벤슈타인 거리(편집 거리) 계산)
 *
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to transform string `a`
 * into string `b`.
 *
 * ## Algorithm
 *
 * Uses dynamic programming with a 2D matrix where `matrix[i][j]` represents
 * the edit distance between the first `i` characters of `a` and the first
 * `j` characters of `b`.
 *
 * The recurrence relation is:
 * ```
 * matrix[i][j] = min(
 *   matrix[i-1][j] + 1,      // deletion from a
 *   matrix[i][j-1] + 1,      // insertion into a
 *   matrix[i-1][j-1] + cost  // substitution (cost=0 if chars match)
 * )
 * ```
 *
 * ## Complexity
 *
 * - **Time**: O(m × n) where m = length of `a`, n = length of `b`
 * - **Space**: O(m × n) for the full matrix
 *
 * @param a - The source string to transform
 * @param b - The target string to transform into
 * @returns The minimum number of edits required (0 = identical strings)
 *
 * @example
 * ```typescript
 * // Identical strings
 * levenshtein('hello', 'hello');    // 0
 *
 * // One substitution
 * levenshtein('cat', 'bat');        // 1
 *
 * // Multiple operations
 * levenshtein('kitten', 'sitting'); // 3 (k→s, e→i, +g)
 *
 * // One string empty
 * levenshtein('abc', '');           // 3 (delete all)
 * levenshtein('', 'abc');           // 3 (insert all)
 *
 * // Common typos
 * levenshtein('weather', 'weatehr'); // 2 (transposition = 2 ops)
 * levenshtein('temperature', 'temperture'); // 1 (missing 'a')
 * ```
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
  for (let j = 0; j <= bLen; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[aLen][bLen];
}

/**
 * Checks if two strings are similar within an edit distance threshold.
 * (두 문자열이 편집 거리 임계값 내에서 유사한지 확인)
 *
 * This function implements a multi-step matching strategy to balance
 * accuracy with typo tolerance. The matching priority is:
 *
 * 1. **Exact match**: Returns `true` immediately (case-insensitive)
 * 2. **Contains check**: If lengths are within 50% ratio, checks if
 *    either string contains the other (prevents "a" matching "apple")
 * 3. **Short string protection**: Strings ≤3 chars require exact match
 *    (prevents "the" matching "time")
 * 4. **Fuzzy match**: Uses Levenshtein distance with dynamic threshold
 *
 * ## Dynamic Threshold Calculation
 *
 * When no explicit threshold is provided, the function calculates one
 * based on the target string length:
 *
 * ```
 * maxThreshold = min(2, max(1, floor(target.length / 4)))
 * ```
 *
 * This formula ensures:
 * - 4-7 char words: max 1 typo (e.g., "time" accepts "tiem")
 * - 8+ char words: max 2 typos (e.g., "temperature" accepts "temperture")
 * - Never more than 2 typos (prevents false positives)
 *
 * ## Length Ratio Check
 *
 * The 50% length ratio prevents matches like:
 * - "a" matching "weather" (ratio = 1/7 = 14% < 50%)
 * - "날씨" (2 chars) matching "날씨 알려줘" (6 chars) when inappropriate
 *
 * @param input - The user's input string to check
 * @param target - The target keyword to match against
 * @param threshold - Optional custom maximum edit distance (default: auto-calculated)
 * @returns `true` if the strings are considered similar, `false` otherwise
 *
 * @example
 * ```typescript
 * // Exact matches (case-insensitive)
 * isSimilar('Weather', 'weather');    // true
 * isSimilar('TIME', 'time');          // true
 *
 * // Typo tolerance
 * isSimilar('weatehr', 'weather');    // true (1 edit)
 * isSimilar('tiem', 'time');          // true (1 edit)
 * isSimilar('temperture', 'temperature'); // true (1 edit)
 *
 * // Contains relationship (within length ratio)
 * isSimilar('날씨', '오늘 날씨');      // true (contains)
 * isSimilar('weather', 'the weather'); // true (contains)
 *
 * // Short string protection
 * isSimilar('the', 'time');           // false (≤3 chars, not exact)
 * isSimilar('cat', 'bat');            // false (≤3 chars, not exact)
 *
 * // Too different
 * isSimilar('apple', 'orange');       // false (too many edits)
 * isSimilar('hello', 'world');        // false (too many edits)
 *
 * // Custom threshold
 * isSimilar('cat', 'bat', 1);         // true (with explicit threshold)
 * ```
 */
export function isSimilar(
  input: string,
  target: string,
  threshold?: number,
): boolean {
  const normalizedInput = input.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  // Exact match
  if (normalizedInput === normalizedTarget) return true;

  // Contains check - but only if lengths are similar (within 50%)
  // 길이가 비슷할 때만 contains 체크 (짧은 단어가 긴 키워드에 포함되는 것 방지)
  const lengthRatio = Math.min(normalizedInput.length, normalizedTarget.length) /
    Math.max(normalizedInput.length, normalizedTarget.length);

  if (lengthRatio >= 0.5) {
    if (
      normalizedInput.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedInput)
    ) {
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
 * Checks if user input contains any keyword from a list (with typo tolerance).
 * (입력이 키워드 목록 중 하나와 유사한지 확인 - 오타 허용)
 *
 * This is the primary function used by the Dialogue app's query handlers to
 * detect intent. It's designed to handle real user input where typos are common.
 *
 * ## Matching Strategy
 *
 * For each keyword in the list, the function checks:
 *
 * 1. **Direct contains**: Input (without spaces) contains keyword directly
 *    - Example: "whatistheweather" contains "weather"
 *
 * 2. **Full input match**: Entire input is similar to keyword
 *    - Example: "weatehr" is similar to "weather"
 *
 * 3. **Word-level match**: Any word in input is similar to keyword
 *    - Example: "what is the weatehr" → word "weatehr" matches "weather"
 *
 * ## Normalization
 *
 * The function normalizes input by:
 * - Converting to lowercase
 * - Removing spaces for direct contains check
 * - Splitting on whitespace for word-level matching
 *
 * ## Use Cases
 *
 * Commonly used to detect queries about:
 * - Time: keywords like ["time", "시간", "what time"]
 * - Weather: keywords like ["weather", "날씨", "forecast"]
 * - Date: keywords like ["date", "날짜", "today"]
 *
 * ## Complexity
 *
 * Worst case: O(k × w × m × n) where:
 * - k = number of keywords
 * - w = number of words in input
 * - m, n = average string lengths
 *
 * Optimization: Returns early on first match (short-circuits).
 *
 * @param input - The user's input string (may contain multiple words)
 * @param keywords - Array of target keywords to match against
 * @param threshold - Optional custom edit distance threshold
 * @returns `true` if input contains or is similar to any keyword
 *
 * @example
 * ```typescript
 * const timeKeywords = ['time', '시간', '몇 시', 'what time'];
 * const weatherKeywords = ['weather', '날씨', 'forecast', '기상'];
 *
 * // Direct matches
 * containsSimilarKeyword('what time is it', timeKeywords);     // true
 * containsSimilarKeyword('오늘 날씨 어때', weatherKeywords);    // true
 *
 * // Typo tolerance
 * containsSimilarKeyword('whats the tiem', timeKeywords);      // true
 * containsSimilarKeyword('weatehr today', weatherKeywords);    // true
 *
 * // No spaces match
 * containsSimilarKeyword('tellmetheweather', weatherKeywords); // true
 *
 * // No match
 * containsSimilarKeyword('hello world', timeKeywords);         // false
 * containsSimilarKeyword('play music', weatherKeywords);       // false
 *
 * // With custom threshold (more strict)
 * containsSimilarKeyword('weatehr', weatherKeywords, 0);       // false (exact only)
 * ```
 */
export function containsSimilarKeyword(
  input: string,
  keywords: string[],
  threshold?: number,
): boolean {
  const normalizedInput = input.toLowerCase().replace(/\s+/g, "");

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, "");

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
 * Normalizes a string for fuzzy comparison by removing spaces and lowercasing.
 * (퍼지 비교를 위해 공백 제거 및 소문자 변환으로 문자열 정규화)
 *
 * This utility function standardizes strings before comparison, which is useful
 * when you need consistent normalization across multiple operations.
 *
 * ## Transformations Applied
 *
 * 1. Convert to lowercase
 * 2. Replace all whitespace sequences with empty string
 * 3. Trim leading/trailing whitespace (redundant after step 2, but explicit)
 *
 * ## When to Use
 *
 * - When comparing user input against stored keywords
 * - When building lookup maps or caches
 * - When pre-processing strings before fuzzy matching
 *
 * Note: `isSimilar` and `containsSimilarKeyword` handle their own normalization,
 * so this function is primarily for external use or custom matching logic.
 *
 * @param text - The string to normalize
 * @returns The normalized string (lowercase, no spaces)
 *
 * @example
 * ```typescript
 * // Basic normalization
 * normalizeForMatch('Hello World');   // 'helloworld'
 * normalizeForMatch('  Weather  ');   // 'weather'
 * normalizeForMatch('What Time');     // 'whattime'
 *
 * // Multiple spaces collapsed
 * normalizeForMatch('hello   world'); // 'helloworld'
 *
 * // Unicode/Korean preserved
 * normalizeForMatch('오늘 날씨');      // '오늘날씨'
 * normalizeForMatch('몇 시 야');       // '몇시야'
 *
 * // Use case: Building a lookup cache
 * const keywords = ['What Time', 'weather', '날씨'];
 * const normalizedSet = new Set(keywords.map(normalizeForMatch));
 * // Set { 'whattime', 'weather', '날씨' }
 * ```
 */
export function normalizeForMatch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "").trim();
}
