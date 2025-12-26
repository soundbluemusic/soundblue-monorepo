// ========================================
// Jamo - 한글 자모 분해/조합
// ========================================

import {
  CHO_LIST,
  DOUBLE_JONG,
  HANGUL_BASE,
  HANGUL_END,
  JONG_COUNT,
  JONG_LIST,
  JUNG_LIST,
  SYLLABLE_PER_CHO,
} from './constants';

export interface Jamo {
  cho: string; // 초성
  jung: string; // 중성
  jong: string; // 종성 (없으면 빈 문자열)
}

// Export constants for backward compatibility
export { CHO_LIST, DOUBLE_JONG, JONG_LIST, JUNG_LIST };

/**
 * 한글 문자인지 확인
 */
export function isHangul(char: string): boolean {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= HANGUL_BASE && code <= HANGUL_END;
}

/**
 * 자모(낱자)인지 확인
 */
export function isJamo(char: string): boolean {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  // ㄱ-ㅎ: 0x3131-0x314E, ㅏ-ㅣ: 0x314F-0x3163
  return code >= 0x3131 && code <= 0x3163;
}

/**
 * 모음인지 확인
 */
export function isVowel(char: string): boolean {
  return JUNG_LIST.includes(char as (typeof JUNG_LIST)[number]);
}

/**
 * 자음인지 확인
 */
export function isConsonant(char: string): boolean {
  return (
    CHO_LIST.includes(char as (typeof CHO_LIST)[number]) ||
    JONG_LIST.includes(char as (typeof JONG_LIST)[number])
  );
}

/**
 * 한글 음절을 자모로 분해
 * '한' → { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' }
 */
export function decompose(char: string): Jamo | null {
  if (!isHangul(char)) return null;

  const code = char.charCodeAt(0) - HANGUL_BASE;
  const choIndex = Math.floor(code / SYLLABLE_PER_CHO);
  const jungIndex = Math.floor((code % SYLLABLE_PER_CHO) / JONG_COUNT);
  const jongIndex = code % JONG_COUNT;

  const cho = CHO_LIST[choIndex];
  const jung = JUNG_LIST[jungIndex];
  const jong = JONG_LIST[jongIndex];

  if (cho === undefined || jung === undefined || jong === undefined) {
    return null;
  }

  return { cho, jung, jong };
}

/**
 * 자모를 한글 음절로 조합
 * { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' } → '한'
 */
export function compose(jamo: Jamo): string | null {
  const choIndex = CHO_LIST.indexOf(jamo.cho as (typeof CHO_LIST)[number]);
  const jungIndex = JUNG_LIST.indexOf(jamo.jung as (typeof JUNG_LIST)[number]);
  const jongIndex = jamo.jong ? JONG_LIST.indexOf(jamo.jong as (typeof JONG_LIST)[number]) : 0;

  if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) {
    return null;
  }

  const code = HANGUL_BASE + choIndex * SYLLABLE_PER_CHO + jungIndex * JONG_COUNT + jongIndex;
  return String.fromCharCode(code);
}

/**
 * 받침 유무 확인
 * '집' → true, '나' → false
 */
export function hasBatchim(char: string): boolean {
  const jamo = decompose(char);
  return jamo !== null && jamo.jong !== '';
}

/**
 * 받침 가져오기
 * '집' → 'ㅂ', '나' → ''
 */
export function getBatchim(char: string): string {
  const jamo = decompose(char);
  return jamo?.jong ?? '';
}

/**
 * 문자열의 마지막 글자 받침 유무
 */
export function hasLastBatchim(text: string): boolean {
  if (!text) return false;
  const lastChar = text[text.length - 1];
  if (!lastChar) return false;
  return hasBatchim(lastChar);
}

/**
 * 받침 변경
 * ('한', 'ㄹ') → '할'
 */
export function changeBatchim(char: string, newJong: string): string | null {
  const jamo = decompose(char);
  if (!jamo) return null;

  return compose({ ...jamo, jong: newJong });
}

/**
 * 받침 제거
 * '한' → '하'
 */
export function removeBatchim(char: string): string | null {
  return changeBatchim(char, '');
}

/**
 * 겹받침 분리
 * 'ㄳ' → ['ㄱ', 'ㅅ']
 */
export function splitDoubleJong(jong: string): [string, string] | null {
  return DOUBLE_JONG[jong] ?? null;
}

/**
 * 문자열을 자모 단위로 완전 분해
 * '한글' → ['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ']
 */
export function decomposeAll(text: string): string[] {
  const result: string[] = [];

  for (const char of text) {
    const jamo = decompose(char);
    if (jamo) {
      result.push(jamo.cho, jamo.jung);
      if (jamo.jong) result.push(jamo.jong);
    } else {
      result.push(char);
    }
  }

  return result;
}

/**
 * 초성만 추출
 * '한글' → 'ㅎㄱ'
 */
export function extractCho(text: string): string {
  let result = '';

  for (const char of text) {
    const jamo = decompose(char);
    if (jamo) {
      result += jamo.cho;
    } else if (isJamo(char) && isConsonant(char)) {
      result += char;
    }
  }

  return result;
}
