// ========================================
// Polysemy Resolver - 다의어 해소 모듈
// ========================================

import { lookupWithDomain } from './conflict-detector';
import { getTaggedDictionary } from './tagged-dictionary-builder';
import type { Clause, Domain, TaggedEntry } from './types';

/**
 * 다의어 해소 결과
 */
export interface PolysemyResult {
  word: string;
  translation: string;
  domain: Domain;
  confidence: number;
  alternatives: Array<{ translation: string; domain: Domain }>;
}

/**
 * 도메인 기반 다의어 해소
 *
 * @param word - 번역할 단어
 * @param domain - 현재 문맥 도메인
 * @returns 해소된 번역 결과
 *
 * @example
 * resolvePolysemyWithDomain("속성", "technology.web")
 * // → { word: "속성", translation: "attribute", domain: "technology.web", ... }
 *
 * resolvePolysemyWithDomain("속성", "technology.oop")
 * // → { word: "속성", translation: "property", domain: "technology.oop", ... }
 */
export function resolvePolysemyWithDomain(word: string, domain: Domain): PolysemyResult | null {
  const dictionary = getTaggedDictionary();
  const entry = dictionary[word];

  if (!entry) {
    return null;
  }

  // 단일 번역인 경우
  if (typeof entry === 'string') {
    return {
      word,
      translation: entry,
      domain: 'general',
      confidence: 1,
      alternatives: [],
    };
  }

  // 다중 번역인 경우 (다의어)
  const translation = lookupWithDomain(dictionary, word, domain);

  if (!translation) {
    return null;
  }

  // 대안 목록 생성 (선택된 번역 제외)
  const alternatives = entry
    .filter((e) => e.translation !== translation)
    .map((e) => ({ translation: e.translation, domain: e.domain }));

  // 신뢰도 계산: 정확한 도메인 매칭 > 상위 도메인 > 폴백
  const exactMatch = entry.find((e) => e.domain === domain);
  const confidence = exactMatch ? 1 : 0.7;

  return {
    word,
    translation,
    domain,
    confidence,
    alternatives,
  };
}

/**
 * 절 내의 모든 다의어 해소
 *
 * @param clause - 분석할 절
 * @param words - 번역할 단어 목록
 * @returns 단어별 해소 결과 맵
 */
export function resolvePolysemiesInClause(
  clause: Clause,
  words: string[],
): Map<string, PolysemyResult> {
  const results = new Map<string, PolysemyResult>();
  const domain = clause.domain || 'general';

  for (const word of words) {
    const result = resolvePolysemyWithDomain(word, domain);
    if (result) {
      results.set(word, result);
    }
  }

  return results;
}

/**
 * 문장 전체의 다의어 해소 (절별 도메인 적용)
 *
 * @param clauses - 도메인이 할당된 절 배열
 * @param wordsPerClause - 절별 단어 목록
 * @returns 절별 해소 결과
 */
export function resolvePolysemiesInSentence(
  clauses: Clause[],
  wordsPerClause: string[][],
): Map<string, PolysemyResult>[] {
  return clauses.map((clause, index) => {
    const words = wordsPerClause[index] || [];
    return resolvePolysemiesInClause(clause, words);
  });
}

/**
 * 단어가 다의어인지 확인
 */
export function isPolysemousWord(word: string): boolean {
  const dictionary = getTaggedDictionary();
  const entry = dictionary[word];
  return Array.isArray(entry) && entry.length > 1;
}

/**
 * 단어의 모든 가능한 번역 가져오기
 */
export function getAllTranslations(word: string): TaggedEntry[] {
  const dictionary = getTaggedDictionary();
  const entry = dictionary[word];

  if (!entry) {
    return [];
  }

  if (typeof entry === 'string') {
    return [{ domain: 'general', translation: entry }];
  }

  return entry;
}

/**
 * 기본 번역 가져오기 (도메인 없이)
 * general 도메인 우선, 없으면 첫 번째 항목
 */
export function getDefaultTranslation(word: string): string | null {
  const dictionary = getTaggedDictionary();
  const entry = dictionary[word];

  if (!entry) {
    return null;
  }

  if (typeof entry === 'string') {
    return entry;
  }

  // general 도메인 우선
  const generalEntry = entry.find((e) => e.domain === 'general');
  if (generalEntry) {
    return generalEntry.translation;
  }

  // 첫 번째 항목
  return entry[0]?.translation || null;
}

/**
 * 다의어 통계 정보
 */
export interface PolysemyStats {
  totalWords: number;
  polysemousWords: number;
  maxMeanings: number;
  byDomain: Record<Domain, number>;
}

/**
 * 사전의 다의어 통계 생성
 */
export function getPolysemyStats(): PolysemyStats {
  const dictionary = getTaggedDictionary();
  const stats: PolysemyStats = {
    totalWords: 0,
    polysemousWords: 0,
    maxMeanings: 0,
    byDomain: {} as Record<Domain, number>,
  };

  for (const [_word, entry] of Object.entries(dictionary)) {
    stats.totalWords++;

    if (Array.isArray(entry)) {
      if (entry.length > 1) {
        stats.polysemousWords++;
        stats.maxMeanings = Math.max(stats.maxMeanings, entry.length);
      }

      for (const e of entry) {
        stats.byDomain[e.domain] = (stats.byDomain[e.domain] || 0) + 1;
      }
    }
  }

  return stats;
}
