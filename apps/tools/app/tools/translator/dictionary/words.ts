// ========================================
// Words Dictionary - 단어 사전 (한→영)
// 기본 어휘 + 도메인 사전 통합
// i18n 사전 자동 통합 (사이트 성장 = 번역기 성장)
// 외부 사전 통합 (public-monorepo/data/context) - LAZY LOADING
// 문맥 기반 다중 번역 지원 (차 → tea/car/difference)
//
// 순수 어휘 데이터는 data/dictionaries/*.json에서 관리
// prebuild 시 generated/*.ts로 변환되어 import됨
//
// 성능 최적화: 외부 사전(920KB)은 lazy loading
// - 초기 로딩 시 외부 사전 제외한 기본 사전만 로드
// - 첫 번역 요청 시 외부 사전 비동기 로드
// ========================================

import { enToKoColors, koToEnColors } from './colors';
import { enToKoCountries, koToEnCountries } from './countries';
import { ALL_DOMAINS_EN_KO, ALL_DOMAINS_KO_EN } from './domains';
// 외부 사전 (lazy loading - 동기 조회 함수만 import)
import {
  getExternalEnToKoWords,
  getExternalKoToEnWords,
  isExternalWordsCached,
  loadExternalWords,
  lookupExternalEnToKo,
  lookupExternalKoToEn,
} from './external';
// JSON에서 생성된 순수 어휘 데이터 (Single Source of Truth: data/dictionaries/)
import { jsonEnToKoWords, jsonKoToEnWords } from './generated';
import {
  CATEGORY_KEYWORDS,
  MULTI_TRANSLATION_WORDS,
  type WordCategory,
  type WordTranslation,
} from './word-types';

// ========================================
// 기본 사전 (외부 사전 제외 - 즉시 로드)
// ========================================

const baseKoToEnWords: Record<string, string> = {
  // 도메인 사전
  ...ALL_DOMAINS_KO_EN,
  // 기본 사전 (JSON에서 생성됨)
  ...jsonKoToEnWords,
  // 국가/색상 (높은 우선순위)
  ...koToEnCountries,
  ...koToEnColors,
};

const baseEnToKoWords: Record<string, string> = {
  // 도메인 사전
  ...ALL_DOMAINS_EN_KO,
  // 기본 사전 역방향 생성
  ...Object.fromEntries(Object.entries(jsonKoToEnWords).map(([ko, en]) => [en.toLowerCase(), ko])),
  ...enToKoCountries,
  ...enToKoColors,
  // 수동 영→한 사전이 최우선 (JSON에서 생성됨)
  ...jsonEnToKoWords,
};

// ========================================
// 통합 사전 (기본 + 외부 lazy merge)
// ========================================

// 캐시된 병합 사전
const _mergedKoToEnWords: Record<string, string> | null = null;
const _mergedEnToKoWords: Record<string, string> | null = null;

/**
 * 한→영 통합 사전 반환
 * 외부 사전이 로드되지 않았으면 기본 사전만 반환
 */
export const koToEnWords: Record<string, string> = new Proxy(baseKoToEnWords, {
  get(target, prop: string) {
    // 외부 사전 캐시됐으면 외부에서 먼저 조회
    if (isExternalWordsCached()) {
      const external = lookupExternalKoToEn(prop);
      if (external) return external;
    }
    return target[prop];
  },
  has(target, prop: string) {
    if (isExternalWordsCached() && lookupExternalKoToEn(prop)) return true;
    return prop in target;
  },
  ownKeys(target) {
    if (isExternalWordsCached()) {
      const externalKeys = Object.keys(getExternalKoToEnWords());
      return [...new Set([...externalKeys, ...Object.keys(target)])];
    }
    return Object.keys(target);
  },
  getOwnPropertyDescriptor(target, prop: string) {
    const externalValue = isExternalWordsCached() ? lookupExternalKoToEn(prop) : null;
    if (externalValue) {
      return { enumerable: true, configurable: true, value: externalValue };
    }
    if (prop in target) {
      return { enumerable: true, configurable: true, value: target[prop] };
    }
    return undefined;
  },
});

/**
 * 영→한 통합 사전 반환
 */
export const enToKoWords: Record<string, string> = new Proxy(baseEnToKoWords, {
  get(target, prop: string) {
    // 외부 사전 캐시됐으면 외부에서 먼저 조회
    if (isExternalWordsCached()) {
      const external = lookupExternalEnToKo(prop);
      if (external) return external;
    }
    return target[prop];
  },
  has(target, prop: string) {
    if (isExternalWordsCached() && lookupExternalEnToKo(prop)) return true;
    return prop in target;
  },
  ownKeys(target) {
    if (isExternalWordsCached()) {
      const externalKeys = Object.keys(getExternalEnToKoWords());
      return [...new Set([...externalKeys, ...Object.keys(target)])];
    }
    return Object.keys(target);
  },
  getOwnPropertyDescriptor(target, prop: string) {
    const externalValue = isExternalWordsCached() ? lookupExternalEnToKo(prop) : null;
    if (externalValue) {
      return { enumerable: true, configurable: true, value: externalValue };
    }
    if (prop in target) {
      return { enumerable: true, configurable: true, value: target[prop] };
    }
    return undefined;
  },
});

// 외부 사전 로드 함수 re-export (번역 시작 시 호출용)
export { loadExternalWords, isExternalWordsCached };

// ========================================
// 문맥 기반 단어 조회 (Context-Aware Lookup)
// 다중 번역 단어는 문맥 분석, 아니면 기존 사전 사용
// ========================================

/**
 * 문장에서 카테고리 점수 계산
 */
function analyzeCategoryContext(text: string): Record<WordCategory, number> {
  const scores: Record<WordCategory, number> = {
    food: 0,
    transportation: 0,
    math: 0,
    music: 0,
    art: 0,
    sports: 0,
    travel: 0,
    work: 0,
    family: 0,
    emotions: 0,
    greetings: 0,
    shopping: 0,
    'daily-life': 0,
    'time-date': 0,
    culture: 0,
    physics: 0,
    space: 0,
    numbers: 0,
    'adjectives-basic': 0,
    'verbs-basic': 0,
    general: 0,
  };

  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword) || lowerText.includes(keyword.toLowerCase())) {
        scores[category as WordCategory] += 1;
      }
    }
  }

  return scores;
}

/**
 * 다중 번역 단어에서 문맥에 맞는 번역 선택
 */
function selectMultiTranslationLocal(korean: string, sentenceContext: string): string | null {
  const multiWord = MULTI_TRANSLATION_WORDS.find((w) => w.korean === korean);
  if (!multiWord) return null;

  const categoryScores = analyzeCategoryContext(sentenceContext);

  let bestTranslation: WordTranslation | null = null;
  let bestScore = -Infinity;

  for (const translation of multiWord.translations) {
    let score = 0;

    // 1. 카테고리 점수
    score += categoryScores[translation.category] * 3;

    // 2. contextHints 매칭 점수
    if (translation.contextHints) {
      for (const hint of translation.contextHints) {
        if (sentenceContext.includes(hint)) {
          score += 2;
        }
      }
    }

    // 3. 우선순위 가중치
    score += (translation.priority ?? 0) * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestTranslation = translation;
    }
  }

  return bestTranslation?.english ?? multiWord.translations[0].english;
}

/**
 * 문맥 기반 한→영 단어 조회
 *
 * 조회 우선순위:
 * 1. 다중 번역 단어 (MULTI_TRANSLATION_WORDS) → 문맥 분석
 * 2. 기존 사전 (koToEnWords) → 1:1 매핑
 * 3. 원문 반환
 *
 * @param korean 한국어 단어
 * @param sentenceContext 전체 문장 (문맥 분석용, 옵션)
 * @returns 영어 번역
 */
export function lookupKoToEn(korean: string, sentenceContext?: string): string {
  // 1. 다중 번역 단어인 경우 문맥 분석
  if (sentenceContext) {
    const contextResult = selectMultiTranslationLocal(korean, sentenceContext);
    if (contextResult) {
      return contextResult;
    }
  }

  // 2. 기존 사전 조회
  const dictResult = koToEnWords[korean];
  if (dictResult) {
    return dictResult;
  }

  // 3. 원문 반환
  return korean;
}
