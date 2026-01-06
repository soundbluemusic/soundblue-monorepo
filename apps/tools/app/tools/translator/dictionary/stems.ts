// ========================================
// Stems Dictionary - 어간 사전 1,000개
// 동사 500 + 형용사 300 + 명사 200 = 1,000개
//
// 순수 어휘 데이터는 data/dictionaries/words/stems.json에서 관리
// prebuild 시 generated/stems.ts로 변환되어 import됨
// ========================================

// JSON에서 생성된 순수 어간 데이터 (Single Source of Truth: data/dictionaries/)
import {
  jsonAdjectiveStems as ADJECTIVE_STEMS,
  jsonNounStems as NOUN_STEMS,
  jsonVerbStems as VERB_STEMS,
} from './generated';

// ========================================
// 양방향 매핑
// ========================================

function reverseMap(obj: Record<string, string>): Record<string, string> {
  const reversed: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    reversed[value] = key;
  }
  return reversed;
}

export const STEMS = {
  koToEn: { ...VERB_STEMS, ...ADJECTIVE_STEMS, ...NOUN_STEMS },
  enToKo: reverseMap({ ...VERB_STEMS, ...ADJECTIVE_STEMS, ...NOUN_STEMS }),
};

/**
 * 한→영 어간 번역
 */
export function translateStemKoToEn(stem: string): string | null {
  return STEMS.koToEn[stem] || null;
}

/**
 * 영→한 어간 번역
 */
export function translateStemEnToKo(stem: string): string | null {
  return STEMS.enToKo[stem] || null;
}

/**
 * 어간 존재 여부
 */
export function hasStem(stem: string, direction: 'ko-en' | 'en-ko'): boolean {
  if (direction === 'ko-en') {
    return stem in STEMS.koToEn;
  }
  return stem in STEMS.enToKo;
}

/**
 * 동사 여부 확인 (간단 휴리스틱)
 */
export function isVerb(stem: string): boolean {
  return stem in VERB_STEMS;
}

/**
 * 형용사 여부 확인
 */
export function isAdjective(stem: string): boolean {
  return stem in ADJECTIVE_STEMS;
}

/**
 * 명사 여부 확인
 */
export function isNoun(stem: string): boolean {
  return stem in NOUN_STEMS;
}
