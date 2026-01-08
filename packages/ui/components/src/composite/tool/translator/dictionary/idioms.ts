// ========================================
// Idioms Dictionary - 관용어/숙어 사전
// 한국어 ↔ 영어 관용어 번역
//
// 순수 어휘 데이터는 data/dictionaries/idioms/idioms.json에서 관리
// prebuild 시 generated/idioms.ts로 변환되어 import됨
// ========================================

// JSON에서 생성된 순수 관용어 데이터 (Single Source of Truth: data/dictionaries/)
import { jsonEnToKoIdioms as enToKoIdioms, jsonIdioms as idioms } from './generated';

/**
 * 관용어 카테고리
 */
export type IdiomCategory =
  | 'body' // 신체 관용어
  | 'animal' // 동물 관용어
  | 'food' // 음식 관용어
  | 'nature' // 자연 관용어
  | 'emotion' // 감정 관용어
  | 'action' // 행동 관용어
  | 'proverb' // 속담
  | 'idiom' // 일반 관용어
  | 'slang'; // 신조어/은어

/**
 * 관용어 엔트리 인터페이스
 */
export interface IdiomEntry {
  ko: string; // 한국어 관용어
  en: string; // 영어 번역
  literal?: string; // 직역 (참고용)
  category: IdiomCategory; // 분류
  variants?: string[]; // 변형 표현
}

// JsonIdiomEntry → IdiomEntry 변환 (category 타입 안전)
const typedIdioms: IdiomEntry[] = idioms.map((i) => ({
  ...i,
  category: (i.category as IdiomCategory) || 'idiom',
}));

// Re-export for backward compatibility
export { typedIdioms as idioms };

// ========================================
// 유틸리티 함수 및 인덱스
// ========================================

// O(1) 조회를 위한 Map 기반 인덱스
// key: 정규화된 관용어 문자열, value: IdiomEntry
const idiomMap = new Map<string, IdiomEntry>();
const variantToIdiomMap = new Map<string, IdiomEntry>();

// 초기화: 모든 idiom과 variant를 Map에 등록
for (const idiom of typedIdioms) {
  const normalizedKo = idiom.ko.replace(/\s+/g, ' ').trim();
  idiomMap.set(normalizedKo, idiom);
  if (idiom.variants) {
    for (const v of idiom.variants) {
      const normalizedV = v.replace(/\s+/g, ' ').trim();
      variantToIdiomMap.set(normalizedV, idiom);
    }
  }
}

// 길이로 정렬된 관용어 목록 (긴 것부터 매칭) - 부분 매칭용
// variants도 포함하여 모든 패턴을 길이순으로 정렬
interface IdiomPattern {
  pattern: string;
  idiom: IdiomEntry;
}
const allPatterns: IdiomPattern[] = [];
for (const idiom of typedIdioms) {
  allPatterns.push({ pattern: idiom.ko, idiom });
  if (idiom.variants) {
    for (const v of idiom.variants) {
      allPatterns.push({ pattern: v, idiom });
    }
  }
}
const sortedPatterns = allPatterns.sort((a, b) => b.pattern.length - a.pattern.length);

// 영→한 관용어 Map (O(1) 조회)
const enToKoIdiomMap = new Map<string, string>();
for (const [en, ko] of Object.entries(enToKoIdioms)) {
  enToKoIdiomMap.set(en.toLowerCase(), ko);
}

// 영→한 관용어 정렬 캐시 (긴 것부터) - 부분 매칭용
const sortedEnIdiomsCached = Object.entries(enToKoIdioms).sort(([a], [b]) => b.length - a.length);

// 정규화 함수 (공백 제거 등)
function normalizeForMatching(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// 한국어 종결어미 패턴 (속담 뒤에 붙는 일반적인 어미들)
const KOREAN_SENTENCE_ENDINGS = [
  '이야',
  '이다',
  '야',
  '다',
  '지',
  '네',
  '요',
  '죠',
  '잖아',
  '거든',
  '래',
  '더라',
  '니까',
  '는데',
  '인데',
];

// 정규식 캐시 (패턴별 한 번만 컴파일)
interface CachedPatternRegex {
  fullMatchRegex: RegExp;
  partialRegex: RegExp;
}
const regexCache = new Map<string, CachedPatternRegex>();
const endingPatternStr = KOREAN_SENTENCE_ENDINGS.join('|');

function getPatternRegexes(pattern: string): CachedPatternRegex {
  const cached = regexCache.get(pattern);
  if (cached) return cached;

  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexPattern = escapedPattern.replace(/\s+/g, '\\s*');

  const result: CachedPatternRegex = {
    fullMatchRegex: new RegExp(`^${flexPattern}(${endingPatternStr})?[.!?]?$`),
    partialRegex: new RegExp(flexPattern, 'g'),
  };
  regexCache.set(pattern, result);
  return result;
}

/**
 * 한→영 관용어 매칭
 * 문장 내에서 관용어를 찾아 번역
 * - 속담 뒤 종결어미 처리 (이야, 이다, 야 등)
 * - 속담이 문장 전체를 차지하면 영어 번역만 반환
 */
export function matchKoIdioms(text: string): {
  found: boolean;
  result: string;
  matched: IdiomEntry[];
  isFullMatch: boolean; // 속담이 문장 전체인지 여부
} {
  let result = normalizeForMatching(text);
  const matched: IdiomEntry[] = [];
  const matchedIdiomIds = new Set<string>(); // 중복 방지
  let isFullMatch = false;

  // sortedPatterns를 사용하여 긴 패턴부터 매칭 (variants 포함)
  for (const { pattern, idiom } of sortedPatterns) {
    // 이미 매칭된 관용구는 스킵
    if (matchedIdiomIds.has(idiom.ko)) continue;

    // 캐시된 정규식 사용 (성능 최적화)
    const { fullMatchRegex, partialRegex } = getPatternRegexes(pattern);

    // 1. 종결어미 포함 전체 문장 매칭 체크
    if (fullMatchRegex.test(result)) {
      // 속담이 문장 전체를 차지 → 영어 번역만 반환
      // 첫 글자 대문자로
      const enCapitalized = idiom.en.charAt(0).toUpperCase() + idiom.en.slice(1);
      result = enCapitalized;
      matched.push(idiom);
      matchedIdiomIds.add(idiom.ko);
      isFullMatch = true;
      break;
    }

    // 2. 부분 매칭 (캐시된 정규식 사용)
    partialRegex.lastIndex = 0; // 리셋 (이전 사용에서 lastIndex 변경될 수 있음)
    if (partialRegex.test(result)) {
      partialRegex.lastIndex = 0; // 리셋 (test() 호출 후 lastIndex 변경됨)
      result = result.replace(partialRegex, `{{${idiom.en}}}`);
      matched.push(idiom);
      matchedIdiomIds.add(idiom.ko);
    }
  }

  // 마커 제거 및 결과 정리 (부분 매칭일 때만)
  if (!isFullMatch) {
    result = result.replace(/\{\{/g, '').replace(/\}\}/g, '');
  }

  return {
    found: matched.length > 0,
    result,
    matched,
    isFullMatch,
  };
}

/**
 * 영→한 관용어 매칭
 */
export function matchEnIdioms(text: string): {
  found: boolean;
  result: string;
  matched: string[];
} {
  let result = text.toLowerCase();
  const matched: string[] = [];

  // 캐시된 정렬 사용 (성능 최적화 - 매 호출마다 정렬하지 않음)
  for (const [en, ko] of sortedEnIdiomsCached) {
    const enLower = en.toLowerCase();
    if (result.includes(enLower)) {
      // 정규식 특수 문자 이스케이프 (마침표, 물음표 등)
      const escapedEn = enLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedEn, 'gi'), ko);
      matched.push(en);
    }
  }

  return {
    found: matched.length > 0,
    result,
    matched,
  };
}

/**
 * 단일 관용어 조회 - O(1) Map 기반
 */
export function lookupKoIdiom(text: string): IdiomEntry | undefined {
  const normalized = normalizeForMatching(text);
  // Map에서 O(1) 조회 (이전: O(n) 선형 탐색)
  return idiomMap.get(normalized) ?? variantToIdiomMap.get(normalized);
}

/**
 * 영어 관용어 단일 조회 - O(1) Map 기반
 */
export function lookupEnIdiom(text: string): string | undefined {
  return enToKoIdiomMap.get(text.toLowerCase());
}

// 카테고리별 인덱스 (O(1) 조회)
const idiomsByCategory = new Map<IdiomCategory, IdiomEntry[]>();
for (const idiom of typedIdioms) {
  const existing = idiomsByCategory.get(idiom.category) ?? [];
  existing.push(idiom);
  idiomsByCategory.set(idiom.category, existing);
}

/**
 * 카테고리별 관용어 조회 - O(1) Map 기반
 */
export function getIdiomsByCategory(category: IdiomCategory): IdiomEntry[] {
  return idiomsByCategory.get(category) ?? [];
}

// Map 인덱스 export (외부에서 직접 접근 가능)
export { idiomMap, variantToIdiomMap, enToKoIdiomMap, idiomsByCategory };

// 영→한 관용어 Record (backward compatibility)
export { enToKoIdioms };
