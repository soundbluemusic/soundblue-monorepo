// ========================================
// Hangul Jamo Engine - 한글 자소 분해/조합
// ========================================

export interface HangulJamo {
  cho: string; // 초성 ㄱㄴㄷ
  jung: string; // 중성 ㅏㅓㅗ
  jong: string; // 종성 (없으면 '')
}

// 유니코드 상수
const HANGUL_START = 0xac00; // '가'
const HANGUL_END = 0xd7a3; // '힣'

// 초성 19자
export const CHO_LIST = [
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
] as const;

// 중성 21자
export const JUNG_LIST = [
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
] as const;

// 종성 28자 (첫 번째는 받침 없음)
export const JONG_LIST = [
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
] as const;

/**
 * 한글 음절 하나를 자소로 분해
 * '먹' → {cho: 'ㅁ', jung: 'ㅓ', jong: 'ㄱ'}
 */
export function decomposeHangul(char: string): HangulJamo {
  const code = char.charCodeAt(0);

  // 한글 범위 체크
  if (code < HANGUL_START || code > HANGUL_END) {
    return { cho: '', jung: '', jong: '' };
  }

  const offset = code - HANGUL_START;
  const choIdx = Math.floor(offset / 588);
  const jungIdx = Math.floor((offset % 588) / 28);
  const jongIdx = offset % 28;

  return {
    cho: CHO_LIST[choIdx] || '',
    jung: JUNG_LIST[jungIdx] || '',
    jong: JONG_LIST[jongIdx] || '',
  };
}

/**
 * 자소를 한글 음절로 조합
 * {cho: 'ㅁ', jung: 'ㅓ', jong: 'ㄱ'} → '먹'
 */
export function composeHangul(jamo: HangulJamo): string {
  const choIdx = CHO_LIST.indexOf(jamo.cho as (typeof CHO_LIST)[number]);
  const jungIdx = JUNG_LIST.indexOf(jamo.jung as (typeof JUNG_LIST)[number]);
  const jongIdx = JONG_LIST.indexOf((jamo.jong || '') as (typeof JONG_LIST)[number]);

  if (choIdx === -1 || jungIdx === -1 || jongIdx === -1) {
    return '';
  }

  const code = HANGUL_START + choIdx * 588 + jungIdx * 28 + jongIdx;
  return String.fromCharCode(code);
}

/**
 * 전체 문자열을 자소 배열로 분해
 * '먹었다' → ['ㅁ','ㅓ','ㄱ','ㅇ','ㅓ','ㅆ','ㄷ','ㅏ']
 */
export function decomposeAll(text: string): string[] {
  const result: string[] = [];

  for (const char of text) {
    const jamo = decomposeHangul(char);
    if (jamo.cho) result.push(jamo.cho);
    if (jamo.jung) result.push(jamo.jung);
    if (jamo.jong) result.push(jamo.jong);
  }

  return result;
}

/**
 * 자소 배열을 한글 문자열로 조합
 * ['ㅁ','ㅓ','ㄱ','ㅇ','ㅓ','ㅆ','ㄷ','ㅏ'] → '먹었다'
 */
export function composeFromJaso(jasoArr: string[]): string {
  const result: string[] = [];
  let i = 0;

  while (i < jasoArr.length) {
    const cho = jasoArr[i];
    const jung = jasoArr[i + 1];
    const jong = jasoArr[i + 2];

    if (!cho || !jung) break;

    // 초성 + 중성만 있는 경우
    // biome-ignore lint/suspicious/noExplicitAny: Type narrowing for const array includes
    if (jong && !CHO_LIST.includes(jong as any)) {
      const char = composeHangul({ cho, jung, jong: '' });
      result.push(char);
      i += 2;
      continue;
    }

    // 종성이 다음 초성인지 확인
    const nextJung = jasoArr[i + 3];
    // biome-ignore lint/suspicious/noExplicitAny: Type narrowing for const array includes
    if (jong && nextJung && JUNG_LIST.includes(nextJung as any)) {
      // jong는 다음 음절의 초성
      const char = composeHangul({ cho, jung, jong: '' });
      result.push(char);
      i += 2;
    } else {
      // jong는 이 음절의 종성
      const char = composeHangul({ cho, jung, jong: jong || '' });
      result.push(char);
      i += jong ? 3 : 2;
    }
  }

  return result.join('');
}

/**
 * 한글 문자 여부 확인
 */
export function isHangul(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

/**
 * 받침(종성) 여부 확인
 */
export function hasFinalConsonant(char: string): boolean {
  const jamo = decomposeHangul(char);
  return jamo.jong !== '';
}

/**
 * 자소 패턴 매칭 (끝에서부터)
 * jasoArr의 끝이 pattern과 일치하는지 확인
 */
export function endsWithPattern(jasoArr: string[], pattern: string[]): boolean {
  if (pattern.length > jasoArr.length) return false;

  for (let i = 0; i < pattern.length; i++) {
    const arrIdx = jasoArr.length - pattern.length + i;
    if (jasoArr[arrIdx] !== pattern[i]) {
      return false;
    }
  }

  return true;
}

/**
 * 자소 패턴 제거 (끝에서부터)
 * ['ㅁ','ㅓ','ㄱ','ㅇ','ㅓ','ㅆ','ㄷ','ㅏ'] - ['ㅇ','ㅓ','ㅆ','ㄷ','ㅏ'] → ['ㅁ','ㅓ','ㄱ']
 */
export function removeEndingPattern(jasoArr: string[], pattern: string[]): string[] {
  if (!endsWithPattern(jasoArr, pattern)) {
    return jasoArr;
  }

  return jasoArr.slice(0, -pattern.length);
}
