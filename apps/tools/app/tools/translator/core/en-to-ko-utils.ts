// ========================================
// English to Korean Utilities - 영→한 유틸리티 함수
// ========================================

import { HANGUL_BASE, HANGUL_END } from '../hangul/constants';
import { ENGLISH_IRREGULAR_VERBS } from './en-to-ko-constants';

// =====================================
// 영어 동사 분석
// =====================================

/**
 * 영어 동사의 3인칭 단수형/과거형에서 기본형 추출
 */
export function getEnglishVerbBase(verb: string): { base: string; tense: 'present' | 'past' } {
  const lowerVerb = verb.toLowerCase();

  // 불규칙 동사 체크
  const irregularPast = ENGLISH_IRREGULAR_VERBS[lowerVerb];
  if (irregularPast) {
    return { base: irregularPast.base, tense: 'past' };
  }

  // 3인칭 단수 현재 (-s, -es, -ies)
  if (lowerVerb.endsWith('ies')) {
    return { base: `${lowerVerb.slice(0, -3)}y`, tense: 'present' };
  }
  if (lowerVerb.endsWith('es')) {
    // watches → watch, goes → go
    const withoutEs = lowerVerb.slice(0, -2);
    if (
      withoutEs.endsWith('ch') ||
      withoutEs.endsWith('sh') ||
      withoutEs.endsWith('x') ||
      withoutEs.endsWith('o') ||
      withoutEs.endsWith('s')
    ) {
      return { base: withoutEs, tense: 'present' };
    }
  }
  if (lowerVerb.endsWith('s') && !lowerVerb.endsWith('ss')) {
    return { base: lowerVerb.slice(0, -1), tense: 'present' };
  }

  // 규칙 과거형 (-ed)
  if (lowerVerb.endsWith('ed')) {
    // doubled consonant: stopped → stop
    if (
      lowerVerb.length > 4 &&
      lowerVerb[lowerVerb.length - 3] === lowerVerb[lowerVerb.length - 4]
    ) {
      return { base: lowerVerb.slice(0, -3), tense: 'past' };
    }
    // -ied: tried → try
    if (lowerVerb.endsWith('ied')) {
      return { base: `${lowerVerb.slice(0, -3)}y`, tense: 'past' };
    }
    // -ed: played → play
    return { base: lowerVerb.slice(0, -2), tense: 'past' };
  }

  return { base: lowerVerb, tense: 'present' };
}

// =====================================
// 한국어 받침 분석
// =====================================

/**
 * 단어의 마지막 글자에 받침이 있는지 확인
 */
export function hasFinalConsonant(word: string): boolean {
  if (!word) return false;
  const lastChar = word[word.length - 1];
  if (!lastChar) return false;
  const code = lastChar.charCodeAt(0);
  // 한글 범위 확인
  if (code >= HANGUL_BASE && code <= HANGUL_END) {
    const jongseong = (code - HANGUL_BASE) % 28;
    return jongseong !== 0;
  }
  // 한글이 아니면 받침 없음으로 처리
  return false;
}

/**
 * 주제 조사 선택 (은/는)
 */
export function selectTopicParticle(word: string): string {
  return hasFinalConsonant(word) ? '은' : '는';
}

/**
 * 목적격 조사 선택 (을/를)
 */
export function selectObjectParticle(word: string): string {
  return hasFinalConsonant(word) ? '을' : '를';
}

// =====================================
// 한국어 동사 활용
// =====================================

/**
 * 한국어 동사 활용형 생성
 */
export function conjugateKoreanVerb(
  stem: string,
  tense: 'present' | 'past',
  _isPlain = true,
): string {
  if (!stem) return stem;

  // 이미 활용된 형태면 그대로 반환 (는다, 었다, 았다로 끝나는 경우만)
  if (
    stem.endsWith('는다') ||
    stem.endsWith('ㄴ다') ||
    stem.endsWith('었다') ||
    stem.endsWith('았다')
  ) {
    return stem;
  }

  // 어간 추출 (사전에서 ~다 형태로 저장된 경우: 가다 → 가, 먹다 → 먹)
  const verbStem = stem.endsWith('다') ? stem.slice(0, -1) : stem;

  // 현재형 (평서문)
  if (tense === 'present') {
    // 형용사성 동사 (있다, 없다, 좋다 등)는 ~다 형태
    const stemForCheck = verbStem;
    if (
      stemForCheck.endsWith('있') ||
      stemForCheck.endsWith('없') ||
      stemForCheck.endsWith('좋') ||
      stemForCheck.endsWith('싫') ||
      stemForCheck.endsWith('재미있') ||
      stemForCheck.endsWith('재미없')
    ) {
      return `${verbStem}다`;
    }
    // 일반 동사는 ~ㄴ다/는다
    // 받침 유무에 따라 ㄴ다/는다 선택
    const lastChar = verbStem[verbStem.length - 1];
    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= HANGUL_END) {
        const jongseong = (code - HANGUL_BASE) % 28;
        if (jongseong === 0) {
          // 받침 없음: ~ㄴ다 (가→간다, 마시→마신다)
          // 마지막 글자에 ㄴ 받침 추가
          const newCode = code + 4; // ㄴ은 4번 받침
          const prefix = verbStem.slice(0, -1); // 마지막 글자 제외한 앞부분
          return `${prefix + String.fromCharCode(newCode)}다`;
        }
        // 받침 있음: ~는다 (먹→먹는다, 읽→읽는다)
        return `${verbStem}는다`;
      }
    }
    return `${verbStem}다`;
  }

  // 과거형
  if (tense === 'past') {
    // 어간 모음에 따라 았다/었다 선택 (모음 축약 적용)
    const lastChar = verbStem[verbStem.length - 1];
    const prefix = verbStem.slice(0, -1); // 마지막 글자 제외한 앞부분
    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= HANGUL_END) {
        const offset = code - HANGUL_BASE;
        const cho = Math.floor(offset / 588);
        const jung = Math.floor((offset % 588) / 28);
        const jong = offset % 28;

        // 양성모음 (ㅏ=0, ㅗ=8): 았다
        if (jung === 0 || jung === 8) {
          if (jong === 0) {
            // 받침 없는 양성모음은 모음 축약
            if (jung === 0) {
              // ㅏ → 축약 (가→갔다, 하→했다)
              // 하다 특수 처리: ㅏ + ㅕ → ㅐ (했다)
              if (cho === 18) {
                // ㅎ + ㅏ → ㅎ + ㅐ + ㅆ = 했
                const newCode = HANGUL_BASE + 18 * 588 + 1 * 28 + 20; // ㅎ + ㅐ + ㅆ
                return `${prefix + String.fromCharCode(newCode)}다`;
              }
              // 일반: ㅏ+ㅆ (가→갔다)
              const newCode = HANGUL_BASE + cho * 588 + 0 * 28 + 20; // ㅏ + ㅆ
              return `${prefix + String.fromCharCode(newCode)}다`;
            }
            // ㅗ → ㅘ+ㅆ (보→봤다, 오→왔다)
            // ㅘ = jung index 9
            const newCode = HANGUL_BASE + cho * 588 + 9 * 28 + 20; // ㅘ + ㅆ
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          return `${verbStem}았다`;
        }
        // 음성모음: 었다
        if (jong === 0) {
          // 받침 없는 음성모음: 축약 (ㅓ→ㅓ+ㅆ, ㅜ→ㅝ+ㅆ, ㅣ→ㅕ+ㅆ 등)
          if (jung === 4) {
            // ㅓ → ㅓ+ㅆ (서→섰다)
            const newCode = HANGUL_BASE + cho * 588 + 4 * 28 + 20;
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          if (jung === 13) {
            // ㅜ → ㅝ+ㅆ (주→줬다)
            const newCode = HANGUL_BASE + cho * 588 + 14 * 28 + 20; // ㅝ = 14
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          if (jung === 20) {
            // ㅣ → ㅕ+ㅆ (시→셨다, 하지만 보통 ㅣ+었다 = ㅕ+ㅆ)
            const newCode = HANGUL_BASE + cho * 588 + 6 * 28 + 20; // ㅕ = 6
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          // 기타 음성모음: 그냥 ㅆ 받침 추가
          const newCode = code + 20;
          return `${prefix + String.fromCharCode(newCode)}다`;
        }
        return `${verbStem}었다`;
      }
    }
    return `${verbStem}었다`;
  }

  return `${verbStem}다`;
}

// =====================================
// 한국어 형용사 활용
// =====================================

/**
 * 한국어 형용사 활용 (과거형)
 * 좋다 → 좋았다, 아름답다 → 아름다웠다
 */
export function conjugateKoreanAdjective(adj: string, tense: 'past' | 'present'): string {
  if (tense === 'present') return adj;

  // 이미 과거형이면 그대로 반환
  if (adj.endsWith('았다') || adj.endsWith('었다')) return adj;

  // 관형형 어미 제거 후 어간 추출
  let workingAdj = adj;

  // 관형형 어미 (ㄴ/은/운) 제거
  if (workingAdj.endsWith('은')) {
    // 좋은 → 좋, 높은 → 높
    workingAdj = `${workingAdj.slice(0, -1)}다`;
  } else if (workingAdj.endsWith('운')) {
    // ㅂ 불규칙: 아름다운 → 아름답다, 더운 → 덥다
    const base = workingAdj.slice(0, -1);
    const lastChar = base[base.length - 1];
    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= HANGUL_END) {
        // 마지막 글자에 ㅂ 받침 추가
        const newCode = code + 17; // ㅂ = 17
        workingAdj = `${base.slice(0, -1) + String.fromCharCode(newCode)}다`;
      }
    }
  } else if (workingAdj.endsWith('ㄴ')) {
    workingAdj = `${workingAdj.slice(0, -1)}다`;
  } else {
    // 관형형 ㄴ 받침이 붙은 경우 (예: 완벽한 → 완벽하+ㄴ)
    const lastChar = workingAdj[workingAdj.length - 1];
    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= HANGUL_END) {
        const jong = (code - HANGUL_BASE) % 28;
        if (jong === 4) {
          // ㄴ 받침 → 제거하고 다 추가 (완벽한 → 완벽하다)
          const newCode = code - 4; // ㄴ 받침 제거
          workingAdj = `${workingAdj.slice(0, -1) + String.fromCharCode(newCode)}다`;
        }
      }
    }
  }

  // 어간 추출 (다 제거)
  const stem = workingAdj.endsWith('다') ? workingAdj.slice(0, -1) : workingAdj;
  if (!stem) return adj;

  const lastChar = stem[stem.length - 1];
  if (!lastChar) return adj;
  const code = lastChar.charCodeAt(0);

  // 한글이 아니면 그대로 반환
  if (code < HANGUL_BASE || code > HANGUL_END) return adj;

  const offset = code - HANGUL_BASE;
  const cho = Math.floor(offset / 588);
  const jung = Math.floor((offset % 588) / 28);
  const jong = offset % 28;
  const prefix = stem.slice(0, -1);

  // ㅂ 불규칙 형용사 (아름답다 → 아름다웠다, 덥다 → 더웠다)
  if (jong === 17) {
    // 받침이 ㅂ인 경우
    // ㅂ을 제거하고 '웠다' 추가
    const newCode = HANGUL_BASE + cho * 588 + jung * 28; // 받침 제거
    return `${prefix + String.fromCharCode(newCode)}웠다`;
  }

  // 양성모음 (ㅏ=0, ㅗ=8): 았다
  if (jung === 0 || jung === 8) {
    if (jong === 0) {
      // 받침 없는 양성모음: 모음 축약
      if (jung === 0) {
        // 하다 특수 처리: ㅏ + ㅕ → ㅐ (했다)
        if (cho === 18) {
          // ㅎ + ㅏ → ㅎ + ㅐ + ㅆ = 했
          const newCode = HANGUL_BASE + 18 * 588 + 1 * 28 + 20; // ㅎ + ㅐ + ㅆ
          return `${prefix + String.fromCharCode(newCode)}다`;
        }
        // ㅏ → ㅏ+ㅆ (가다 → 갔다)
        const newCode = HANGUL_BASE + cho * 588 + 0 * 28 + 20;
        return `${prefix + String.fromCharCode(newCode)}다`;
      }
      // ㅗ → ㅘ+ㅆ
      const newCode = HANGUL_BASE + cho * 588 + 9 * 28 + 20;
      return `${prefix + String.fromCharCode(newCode)}다`;
    }
    return `${stem}았다`;
  }

  // 음성모음: 었다
  if (jong === 0) {
    // 받침 없는 음성모음: ㅓ+ㅆ, ㅜ→ㅝ+ㅆ 등
    if (jung === 4) {
      // ㅓ → ㅓ+ㅆ
      const newCode = HANGUL_BASE + cho * 588 + 4 * 28 + 20;
      return `${prefix + String.fromCharCode(newCode)}다`;
    }
    if (jung === 13) {
      // ㅜ → ㅝ+ㅆ
      const newCode = HANGUL_BASE + cho * 588 + 14 * 28 + 20;
      return `${prefix + String.fromCharCode(newCode)}다`;
    }
    if (jung === 20) {
      // ㅣ → ㅕ+ㅆ (예쁘다 제외 - 예쁘다는 ㅡ+ㅓ)
      const newCode = HANGUL_BASE + cho * 588 + 6 * 28 + 20;
      return `${prefix + String.fromCharCode(newCode)}다`;
    }
    // 그 외: ㅆ 받침 추가
    const newCode = code + 20;
    return `${prefix + String.fromCharCode(newCode)}다`;
  }

  return `${stem}었다`;
}

/**
 * 형용사를 한국어 관형형으로 변환
 * 예: 아름다운, 새로운, 좋은
 */
export function convertToKoreanModifier(adjective: string): string {
  // 이미 관형형이면 그대로 반환
  if (adjective.endsWith('운') || adjective.endsWith('은') || adjective.endsWith('ㄴ')) {
    return adjective;
  }

  // 형용사 + ㄴ/은 관형형 변환
  // 받침 유무 확인
  const lastChar = adjective[adjective.length - 1];
  if (lastChar) {
    const code = lastChar.charCodeAt(0);
    // 한글 범위 확인
    if (code >= HANGUL_BASE && code <= HANGUL_END) {
      const jongseong = (code - HANGUL_BASE) % 28;
      if (jongseong === 0) {
        // 받침 없음: ~ㄴ 추가 (예: 새로 → 새로운)
        return `${adjective}운`;
      }
      // 받침 있음: ~은 추가 (예: 좋 → 좋은)
      return `${adjective}은`;
    }
  }

  // 기본값: ~은
  return `${adjective}`;
}
