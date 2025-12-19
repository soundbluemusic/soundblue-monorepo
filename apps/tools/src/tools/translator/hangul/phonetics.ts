// ========================================
// Phonetics - 음운 규칙
// ========================================

import { compose, decompose, splitDoubleJong } from './jamo';

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

/**
 * 모든 음운 규칙 적용 (발음 변환)
 */
export function toPronunciation(text: string): string {
  let result = text;

  // 순서가 중요: 연음 → 경음화 → 비음화 → 유음화 → 구개음화
  result = applyFortition(result);
  result = applyNasalization(result);
  result = applyLiquidization(result);
  result = applyPalatalization(result);

  return result;
}

/**
 * ㅏ/ㅓ 선택 (모음조화)
 * 양성모음(ㅏ,ㅗ) → 아, 음성모음 → 어
 */
export function selectAOrEo(stem: string): 'ㅏ' | 'ㅓ' {
  // 마지막 모음 확인
  for (let i = stem.length - 1; i >= 0; i--) {
    const char = stem[i];
    if (!char) continue;
    const jamo = decompose(char);
    if (jamo) {
      const vowel = jamo.jung;
      // 양성 모음
      if (['ㅏ', 'ㅗ', 'ㅑ', 'ㅛ'].includes(vowel)) {
        return 'ㅏ';
      }
      // 음성 모음
      return 'ㅓ';
    }
  }

  return 'ㅓ'; // 기본값
}
