/**
 * 한글 유틸리티 함수 모음
 * index.ts에서 분리됨 (Phase 2 리팩토링)
 *
 * 한글 조작과 관련된 순수 유틸리티 함수들:
 * - 받침 추가/제거
 * - 모음조화 적용
 * - 어미 연결
 */

// ============================================
// 기본 상수
// ============================================

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

// 종성(받침) 인덱스
const JONGSEONG_NIEUN = 4; // ㄴ
const JONGSEONG_RIEUL = 8; // ㄹ
const JONGSEONG_SSANG_SIOT = 20; // ㅆ

// ============================================
// 받침 관련 함수
// ============================================

/** 한국어 글자에서 받침 제거 (잤 → 자) */
export function removeKoreanFinal(char: string): string {
  if (char.length !== 1) return char;
  const code = char.charCodeAt(0);
  // Check if it's a Korean syllable (0xAC00 ~ 0xD7A3)
  if (code < HANGUL_START || code > HANGUL_END) return char;
  const offset = code - HANGUL_START;
  const final = offset % 28;
  if (final === 0) return char; // No final consonant
  // Reconstruct without final
  return String.fromCharCode(HANGUL_START + Math.floor(offset / 28) * 28);
}

/** 한국어 글자에 받침 ㄹ 추가 (아 → 알) */
export function addKoreanRieul(char: string): string {
  if (char.length !== 1) return char;
  const code = char.charCodeAt(0);
  // Check if it's a Korean syllable (0xAC00 ~ 0xD7A3)
  if (code < HANGUL_START || code > HANGUL_END) return char;
  const offset = code - HANGUL_START;
  const final = offset % 28;
  if (final !== 0) return char; // Already has final consonant
  // Add ㄹ (8) as final consonant
  return String.fromCharCode(code + JONGSEONG_RIEUL);
}

/** 한국어 글자에 받침 ㄴ 추가 (쓰 → 쓴) */
export function addKoreanNieun(char: string): string {
  if (char.length !== 1) return char;
  const code = char.charCodeAt(0);
  // Check if it's a Korean syllable (0xAC00 ~ 0xD7A3)
  if (code < HANGUL_START || code > HANGUL_END) return char;
  const offset = code - HANGUL_START;
  const final = offset % 28;
  if (final !== 0) return char; // Already has final consonant
  // Add ㄴ (4) as final consonant
  return String.fromCharCode(code + JONGSEONG_NIEUN);
}

/** 한국어 단어가 ㄹ 받침으로 끝나는지 확인 (갈 → true, 가 → false) */
export function hasRieulBatchim(word: string): boolean {
  if (word.length === 0) return false;
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return false;
  const offset = code - HANGUL_START;
  const final = offset % 28;
  return final === JONGSEONG_RIEUL;
}

/** 한국어 단어에서 ㄹ 받침 제거 (갈 → 가) */
export function removeRieulBatchim(word: string): string {
  if (word.length === 0) return word;
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return word;
  const offset = code - HANGUL_START;
  const final = offset % 28;
  if (final !== JONGSEONG_RIEUL) return word; // Not ㄹ batchim
  // Remove ㄹ
  const newChar = String.fromCharCode(code - JONGSEONG_RIEUL);
  return word.slice(0, -1) + newChar;
}

/** 한국어 단어가 ㄴ 받침으로 끝나는지 확인 (예쁜 → true, 예쁘 → false) */
export function hasNieunBatchim(word: string): boolean {
  if (word.length === 0) return false;
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return false;
  const offset = code - HANGUL_START;
  const final = offset % 28;
  return final === JONGSEONG_NIEUN;
}

/** 한국어 단어에서 ㄴ 받침 제거 (예쁜 → 예쁘) */
export function removeNieunBatchim(word: string): string {
  if (word.length === 0) return word;
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return word;
  const offset = code - HANGUL_START;
  const final = offset % 28;
  if (final !== JONGSEONG_NIEUN) return word; // Not ㄴ batchim
  // Remove ㄴ
  const newChar = String.fromCharCode(code - JONGSEONG_NIEUN);
  return word.slice(0, -1) + newChar;
}

// ============================================
// 어미 연결 함수
// ============================================

/**
 * 한국어 동사에서 -다 접미사 제거
 * 관형형 -ㄴ/은/운 접미사도 처리 (ㅂ 불규칙)
 */
export function removeKoDa(ko: string): string {
  // -다 접미사 제거
  if (ko.endsWith('다')) {
    return ko.slice(0, -1);
  }
  // 관형형 -ㄴ/은/운 접미사 제거 (어려운 → 어렵)
  // ㅂ 불규칙: 어려운 → 어렵
  if (ko.endsWith('운')) {
    // 어려운 → 어렵 (ㅂ 불규칙 역원)
    const stem = ko.slice(0, -1);
    // 마지막 글자에 ㅂ 받침 추가
    const lastChar = stem.charCodeAt(stem.length - 1);
    if (lastChar >= HANGUL_START && lastChar <= HANGUL_END) {
      const jongseong = (lastChar - HANGUL_START) % 28;
      if (jongseong === 0) {
        // 받침 없음 → ㅂ(17) 추가
        const newChar = String.fromCharCode(lastChar + 17);
        return stem.slice(0, -1) + newChar;
      }
    }
    return stem;
  }
  return ko;
}

/**
 * 한국어 동사 어간에 ㄴ 받침 붙이기
 * 예: 배우 + ㄴ → 배운
 */
export function attachKoNieun(stem: string): string {
  if (!stem) return stem;
  const lastChar = stem.charCodeAt(stem.length - 1);

  // 한글 범위 체크
  if (lastChar < HANGUL_START || lastChar > HANGUL_END) return stem + 'ㄴ';

  // 이미 받침이 있으면 ㄴ 을 붙일 수 없음
  const jongseong = (lastChar - HANGUL_START) % 28;
  if (jongseong !== 0) return stem + '은'; // 받침 있으면 -은 사용

  // 받침 없는 경우: ㄴ(니은=4) 받침 추가
  const newChar = String.fromCharCode(lastChar + JONGSEONG_NIEUN);
  return stem.slice(0, -1) + newChar;
}

/**
 * 한국어 동사 어간에 ㄹ 받침 붙이기
 * 예: 가 + ㄹ → 갈
 */
export function attachKoRieul(stem: string): string {
  if (!stem) return stem;
  const lastChar = stem.charCodeAt(stem.length - 1);

  // 한글 범위 체크
  if (lastChar < HANGUL_START || lastChar > HANGUL_END) return stem + 'ㄹ';

  // 이미 받침이 있으면 ㄹ 을 붙일 수 없음
  const jongseong = (lastChar - HANGUL_START) % 28;
  if (jongseong !== 0) return stem + '을'; // 받침 있으면 -을 사용

  // 받침 없는 경우: ㄹ(리을=8) 받침 추가
  const newChar = String.fromCharCode(lastChar + JONGSEONG_RIEUL);
  return stem.slice(0, -1) + newChar;
}

/**
 * 한국어 동사 어간에 -았/었 붙이기
 * 양성모음(ㅏ,ㅗ) → 았, 음성모음 → 었
 * 예: 가 → 갔, 도 → 도왔 (돕의 불규칙)
 */
export function attachKoPast(stem: string, baseVerb?: string): string {
  if (!stem) return stem;

  // 불규칙 동사 처리
  if (baseVerb === 'help' || stem === '도') {
    return '도왔'; // 돕 → 도왔 (ㅂ 불규칙)
  }

  const lastChar = stem.charCodeAt(stem.length - 1);

  // 한글 범위 체크
  if (lastChar < HANGUL_START || lastChar > HANGUL_END) return stem + '았';

  // 모음 추출 (중성)
  const jungseong = Math.floor(((lastChar - HANGUL_START) % 588) / 28);

  // 양성모음: ㅏ(0), ㅗ(8)
  const isYangseong = jungseong === 0 || jungseong === 8;

  // 받침 확인
  const jongseong = (lastChar - HANGUL_START) % 28;

  if (jongseong !== 0) {
    // 받침 있음
    return stem + (isYangseong ? '았' : '었');
  }

  // 받침 없음: 모음 축약
  // ㅏ + 았 → 았 (가 → 갔)
  // ㅗ + 았 → 왔 (오 → 왔)
  if (jungseong === 0) {
    // ㅏ: 가 → 갔
    const newChar = String.fromCharCode(lastChar + JONGSEONG_SSANG_SIOT);
    return stem.slice(0, -1) + newChar;
  }
  if (jungseong === 8) {
    // ㅗ: 오 → 왔
    const base = lastChar - HANGUL_START;
    const cho = Math.floor(base / 588);
    // ㅘ=9, ㅆ=20
    const newChar = String.fromCharCode(HANGUL_START + cho * 588 + 9 * 28 + JONGSEONG_SSANG_SIOT);
    return stem.slice(0, -1) + newChar;
  }

  return stem + (isYangseong ? '았' : '었');
}

/** 한국어 동사 어간에 과거분사 어미 ㄴ/은 붙이기 (쓰 → 쓴, 먹 → 먹은) */
export function attachKoreanPastParticiple(stem: string): string {
  if (!stem || stem.length === 0) return stem;
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  // Check if last char is a Korean syllable
  if (code < HANGUL_START || code > HANGUL_END) return stem + 'ㄴ';

  const offset = code - HANGUL_START;
  const final = offset % 28;

  if (final === 0) {
    // No batchim - add ㄴ directly (쓰 → 쓴)
    return stem.slice(0, -1) + addKoreanNieun(lastChar);
  }
  // Has batchim - add 은 (먹 → 먹은)
  return stem + '은';
}

/** 한국어 동사 어간에 아/어 연결어미 붙이기 (모음조화)
 * 양성모음 (ㅏ, ㅗ) → 아
 * 음성모음 → 어
 * 하 → 해
 */
export function attachAoEo(stem: string): string {
  if (!stem || stem.length === 0) return stem;

  // 하다 verbs → 해
  if (stem.endsWith('하')) return stem.slice(0, -1) + '해';

  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  // Check if last char is a Korean syllable
  if (code < HANGUL_START || code > HANGUL_END) return stem + '어';

  const offset = code - HANGUL_START;
  const jungIndex = Math.floor((offset % 588) / 28); // 중성 인덱스

  // 양성 모음: ㅏ(0), ㅗ(8)
  const positiveVowels = [0, 8];
  if (positiveVowels.includes(jungIndex)) {
    return stem + '아';
  }
  return stem + '어';
}

/** 한국어 문자열 끝에 ㄹ 받침 붙이기 (수영하 → 수영할, 읽 → 읽을) */
export function attachKoreanRieul(stem: string): string {
  if (!stem || stem.length === 0) return stem;
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);
  // Check if it's a Korean syllable
  if (code >= HANGUL_START && code <= HANGUL_END) {
    const jongseong = (code - HANGUL_START) % 28;
    if (jongseong === 0) {
      // No 받침: add ㄹ directly (가 → 갈, 하 → 할)
      return stem.slice(0, -1) + String.fromCharCode(code + JONGSEONG_RIEUL);
    }
    // Has 받침: append 을 (읽 → 읽을, 먹 → 먹을)
    return stem + '을';
  }
  return stem;
}

/**
 * 한국어 동사 어간에 ㄴ다/는다 붙이기
 * - 받침 없는 어간: ㄴ다 (가 → 간다, 뛰 → 뛴다)
 * - 받침 있는 어간: 는다 (먹 → 먹는다, 읽 → 읽는다)
 */
export function attachNda(stem: string): string {
  if (!stem || stem.length === 0) return stem;
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return `${stem}다`; // Not Korean syllable

  const jongseong = (code - HANGUL_START) % 28;
  if (jongseong === 0) {
    // No 받침: add ㄴ받침 + 다 (가 → 간다, 뛰 → 뛴다)
    const newCode = code + JONGSEONG_NIEUN;
    return stem.slice(0, -1) + String.fromCharCode(newCode) + '다';
  }
  // Has 받침: add 는다 (먹 → 먹는다)
  return `${stem}는다`;
}
