// ========================================
// Phonetics Rules - 음운 규칙
// 맞춤법 제3장 (소리에 관한 것) 구현
// ========================================

import { compose, decompose, splitDoubleJong } from '../jamo';

// ========================================
// 두음법칙 (맞춤법 제10~12항)
// ========================================

/**
 * 두음법칙 제10항: ㄴ계 두음법칙
 * 한자음 '녀, 뇨, 뉴, 니'가 단어 첫머리에 올 때
 * → '여, 요, 유, 이'로 적음
 *
 * 예: 녀자→여자, 뇨도→요도, 뉴대륙→유대륙, 니승→이승
 * 예외: 냥(兩), 년(年) - 의존명사는 본음 유지
 */
const INITIAL_LAW_N_VOWELS: Record<string, string> = {
  녀: '여',
  뇨: '요',
  뉴: '유',
  니: '이',
};

/**
 * 두음법칙 제11항: ㄹ계 두음법칙 (ㅑ,ㅕ,ㅛ,ㅠ,ㅣ 앞)
 * 한자음 '랴, 려, 례, 료, 류, 리'가 단어 첫머리에 올 때
 * → '야, 여, 예, 요, 유, 이'로 적음
 *
 * 예: 려행→여행, 료리→요리, 류행→유행, 리유→이유
 * 추가: 렬→열, 률→율 (모음/ㄴ 뒤에서)
 */
const INITIAL_LAW_R_Y_VOWELS: Record<string, string> = {
  랴: '야',
  려: '여',
  례: '예',
  료: '요',
  류: '유',
  리: '이',
  렬: '열',
  률: '율',
};

/**
 * 두음법칙 제12항: ㄹ계 두음법칙 (ㅏ,ㅐ,ㅗ,ㅚ,ㅜ,ㅡ 앞)
 * 한자음 '라, 래, 로, 뢰, 루, 르'가 단어 첫머리에 올 때
 * → '나, 내, 노, 뇌, 누, 느'로 적음
 *
 * 예: 락원→낙원, 래일→내일, 로동→노동, 루각→누각
 */
const INITIAL_LAW_R_N_VOWELS: Record<string, string> = {
  라: '나',
  래: '내',
  로: '노',
  뢰: '뇌',
  루: '누',
  르: '느',
};

/**
 * 두음법칙 예외 단어 (의존명사 등)
 * 이 단어들은 두음법칙을 적용하지 않음
 */
const INITIAL_LAW_EXCEPTIONS = new Set([
  '냥', // 兩 (의존명사)
  '년', // 年 (의존명사: 몇 년)
  '리', // 里, 理 (의존명사: 몇 리, 그럴 리가)
]);

/**
 * 두음법칙 적용 (단어 첫머리)
 * 맞춤법 제10~12항 통합 처리
 *
 * @param text 입력 텍스트
 * @param applyToWordStart 단어 첫머리에만 적용할지 (기본값: true)
 * @returns 두음법칙 적용된 텍스트
 *
 * @example
 * applyInitialLaw('녀자') // → '여자'
 * applyInitialLaw('려행') // → '여행'
 * applyInitialLaw('락원') // → '낙원'
 * applyInitialLaw('대한민국') // → '대한민국' (변화 없음)
 */
export function applyInitialLaw(text: string, applyToWordStart = true): string {
  if (!text) return text;

  // 단어 단위로 분리
  const words = text.split(/(\s+)/);

  return words
    .map((word) => {
      // 공백은 그대로
      if (/^\s+$/.test(word)) return word;

      // 예외 단어 체크
      if (INITIAL_LAW_EXCEPTIONS.has(word)) return word;

      const chars = [...word];
      const result: string[] = [];

      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (!char) continue;

        // 단어 첫머리 또는 모든 위치 적용
        const isWordStart = i === 0;
        const shouldApply = !applyToWordStart || isWordStart;

        if (shouldApply) {
          // 제10항: ㄴ계
          if (INITIAL_LAW_N_VOWELS[char]) {
            result.push(INITIAL_LAW_N_VOWELS[char]);
            continue;
          }

          // 제11항: ㄹ계 (ㅑ,ㅕ,ㅛ,ㅠ,ㅣ)
          if (INITIAL_LAW_R_Y_VOWELS[char]) {
            result.push(INITIAL_LAW_R_Y_VOWELS[char]);
            continue;
          }

          // 제12항: ㄹ계 (ㅏ,ㅐ,ㅗ,ㅚ,ㅜ,ㅡ)
          if (INITIAL_LAW_R_N_VOWELS[char]) {
            result.push(INITIAL_LAW_R_N_VOWELS[char]);
            continue;
          }
        }

        result.push(char);
      }

      return result.join('');
    })
    .join('');
}

/**
 * 두음법칙 역변환 (표준어 → 한자 원음)
 * 번역 시 한자어 원형 복원에 사용
 *
 * @param text 표준어 텍스트
 * @returns 한자 원음 형태
 *
 * @example
 * reverseInitialLaw('여자') // → '녀자'
 * reverseInitialLaw('여행') // → '려행'
 * reverseInitialLaw('낙원') // → '락원'
 */
export function reverseInitialLaw(text: string): string {
  if (!text) return text;

  // 역변환 맵 생성
  const reverseNMap: Record<string, string> = {};
  for (const [from, to] of Object.entries(INITIAL_LAW_N_VOWELS)) {
    reverseNMap[to] = from;
  }

  const reverseRYMap: Record<string, string> = {};
  for (const [from, to] of Object.entries(INITIAL_LAW_R_Y_VOWELS)) {
    reverseRYMap[to] = from;
  }

  const reverseRNMap: Record<string, string> = {};
  for (const [from, to] of Object.entries(INITIAL_LAW_R_N_VOWELS)) {
    reverseRNMap[to] = from;
  }

  const words = text.split(/(\s+)/);

  return words
    .map((word) => {
      if (/^\s+$/.test(word)) return word;

      const chars = [...word];
      if (chars.length === 0) return word;

      const firstChar = chars[0];
      if (!firstChar) return word;

      // ㄹ계 (ㅑ,ㅕ,ㅛ,ㅠ,ㅣ) 먼저 체크 - 더 일반적
      if (reverseRYMap[firstChar]) {
        chars[0] = reverseRYMap[firstChar];
        return chars.join('');
      }

      // ㄴ계 체크
      if (reverseNMap[firstChar]) {
        chars[0] = reverseNMap[firstChar];
        return chars.join('');
      }

      // ㄹ계 (ㅏ,ㅐ,ㅗ,ㅚ,ㅜ,ㅡ) 체크
      if (reverseRNMap[firstChar]) {
        chars[0] = reverseRNMap[firstChar];
        return chars.join('');
      }

      return word;
    })
    .join('');
}

/**
 * 열/률 규칙 적용 (제11항 붙임)
 * 모음이나 ㄴ 받침 뒤에서는 '렬→열', '률→율'
 * 그 외에서는 '렬→렬', '률→률' 유지
 *
 * @param prevChar 앞 글자
 * @param currentChar 현재 글자 ('렬' 또는 '률')
 * @returns 변환된 글자
 *
 * @example
 * applyRyeolYul('비', '률') // → '율' (비율)
 * applyRyeolYul('백', '률') // → '률' (백분률→실제로는 율이지만 원칙)
 * applyRyeolYul('선', '률') // → '율' (선율)
 */
export function applyRyeolYul(prevChar: string | undefined, currentChar: string): string {
  if (currentChar !== '렬' && currentChar !== '률') {
    return currentChar;
  }

  // 앞 글자가 없으면 (단어 첫머리) 두음법칙 적용
  if (!prevChar) {
    return currentChar === '렬' ? '열' : '율';
  }

  const prev = decompose(prevChar);
  if (!prev) return currentChar;

  // 모음으로 끝나거나 (받침 없음) ㄴ 받침이면 두음법칙 적용
  if (prev.jong === '' || prev.jong === 'ㄴ') {
    return currentChar === '렬' ? '열' : '율';
  }

  // 그 외에는 본음 유지 (실제로는 두음법칙이 적용되지만, 맞춤법상 표기는 다름)
  return currentChar;
}

/**
 * 경음화 (된소리되기)
 * 받침 ㄱ,ㄷ,ㅂ + ㄱ,ㄷ,ㅂ,ㅅ,ㅈ → 된소리
 * '학교' → [학꾜], '식당' → [식땅]
 */
export function applyFortition(text: string): string {
  const chars = [...text];
  const result: string[] = [];

  // 경음화 대상 초성
  const fortitionTargets: Record<string, string> = {
    ㄱ: 'ㄲ',
    ㄷ: 'ㄸ',
    ㅂ: 'ㅃ',
    ㅅ: 'ㅆ',
    ㅈ: 'ㅉ',
  };

  // 경음화 유발 받침
  const triggerJong = ['ㄱ', 'ㄷ', 'ㅂ'];

  for (let i = 0; i < chars.length; i++) {
    const currentChar = chars[i];
    const nextChar = chars[i + 1];
    if (!currentChar) continue;

    const current = decompose(currentChar);
    const next = nextChar ? decompose(nextChar) : null;

    result.push(currentChar);

    if (current && next) {
      // 겹받침의 경우 마지막 자음 확인
      let effectiveJong = current.jong;
      const doubled = splitDoubleJong(current.jong);
      if (doubled) {
        effectiveJong = doubled[1];
      }

      const newCho = fortitionTargets[next.cho];
      if (triggerJong.includes(effectiveJong) && newCho) {
        // 다음 글자 된소리화
        const newNext = compose({
          ...next,
          cho: newCho,
        });
        if (newNext) {
          chars[i + 1] = newNext;
        }
      }
    }
  }

  return result.join('');
}

/**
 * 비음화
 * ㄱ,ㄷ,ㅂ + ㄴ,ㅁ → ㅇ,ㄴ,ㅁ
 * '국물' → [궁물], '작년' → [장년]
 */
export function applyNasalization(text: string): string {
  const chars = [...text];
  const result: string[] = [];

  // 비음화 변환
  const nasalChange: Record<string, string> = {
    ㄱ: 'ㅇ',
    ㄷ: 'ㄴ',
    ㅂ: 'ㅁ',
  };

  // 비음
  const nasals = ['ㄴ', 'ㅁ'];

  for (let i = 0; i < chars.length; i++) {
    const currentChar = chars[i];
    const nextChar = chars[i + 1];
    if (!currentChar) continue;

    const current = decompose(currentChar);
    const next = nextChar ? decompose(nextChar) : null;

    const newJong = current ? nasalChange[current.jong] : undefined;
    if (current && next && newJong && nasals.includes(next.cho)) {
      // 현재 글자 받침 비음화
      const newCurrent = compose({
        ...current,
        jong: newJong,
      });
      result.push(newCurrent ?? currentChar);
    } else {
      result.push(currentChar);
    }
  }

  return result.join('');
}

/**
 * 유음화
 * ㄴ + ㄹ, ㄹ + ㄴ → ㄹㄹ
 * '신라' → [실라], '설날' → [설랄]
 */
export function applyLiquidization(text: string): string {
  const chars = [...text];
  const result: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const currentChar = chars[i];
    const nextChar = chars[i + 1];
    if (!currentChar) continue;

    const current = decompose(currentChar);
    const next = nextChar ? decompose(nextChar) : null;

    if (current && next) {
      // ㄴ + ㄹ → ㄹㄹ
      if (current.jong === 'ㄴ' && next.cho === 'ㄹ') {
        const newCurrent = compose({ ...current, jong: 'ㄹ' });
        result.push(newCurrent ?? currentChar);
        continue;
      }

      // ㄹ + ㄴ → ㄹㄹ
      if (current.jong === 'ㄹ' && next.cho === 'ㄴ') {
        result.push(currentChar);
        const newNext = compose({ ...next, cho: 'ㄹ' });
        if (newNext) {
          chars[i + 1] = newNext;
        }
        continue;
      }
    }

    result.push(currentChar);
  }

  return result.join('');
}

/**
 * 구개음화
 * ㄷ,ㅌ + 이 → ㅈ,ㅊ + 이
 * '굳이' → [구지], '같이' → [가치]
 */
export function applyPalatalization(text: string): string {
  const chars = [...text];
  const result: string[] = [];

  const palatalChange: Record<string, string> = {
    ㄷ: 'ㅈ',
    ㅌ: 'ㅊ',
  };

  for (let i = 0; i < chars.length; i++) {
    const currentChar = chars[i];
    const nextChar = chars[i + 1];
    if (!currentChar) continue;

    const current = decompose(currentChar);
    const next = nextChar ? decompose(nextChar) : null;

    const newCho = current ? palatalChange[current.jong] : undefined;
    if (current && next && newCho && next.jung === 'ㅣ') {
      // 받침 제거, 다음 글자 초성 변경
      const newCurrent = compose({ ...current, jong: '' });
      const newNext = compose({ ...next, cho: newCho });

      result.push(newCurrent ?? currentChar);
      if (newNext) {
        chars[i + 1] = newNext;
      }
      continue;
    }

    result.push(currentChar);
  }

  return result.join('');
}

/**
 * 음절 끝소리 규칙 (받침 대표음)
 * 겹받침 및 특수 받침 → 7개 대표음 (ㄱ,ㄴ,ㄷ,ㄹ,ㅁ,ㅂ,ㅇ)
 */
export function applyFinalConsonantRule(jong: string): string {
  const representative: Record<string, string> = {
    // ㄱ 계열
    ㄱ: 'ㄱ',
    ㄲ: 'ㄱ',
    ㅋ: 'ㄱ',
    ㄳ: 'ㄱ',
    ㄺ: 'ㄱ',

    // ㄴ 계열
    ㄴ: 'ㄴ',
    ㄵ: 'ㄴ',
    ㄶ: 'ㄴ',

    // ㄷ 계열
    ㄷ: 'ㄷ',
    ㅅ: 'ㄷ',
    ㅆ: 'ㄷ',
    ㅈ: 'ㄷ',
    ㅊ: 'ㄷ',
    ㅌ: 'ㄷ',
    ㅎ: 'ㄷ',

    // ㄹ 계열
    ㄹ: 'ㄹ',
    ㄼ: 'ㄹ',
    ㄽ: 'ㄹ',
    ㄾ: 'ㄹ',
    ㄿ: 'ㄹ',
    ㅀ: 'ㄹ',

    // ㅁ 계열
    ㅁ: 'ㅁ',
    ㄻ: 'ㅁ',

    // ㅂ 계열
    ㅂ: 'ㅂ',
    ㅍ: 'ㅂ',
    ㅄ: 'ㅂ',

    // ㅇ
    ㅇ: 'ㅇ',
  };

  return representative[jong] ?? jong;
}
