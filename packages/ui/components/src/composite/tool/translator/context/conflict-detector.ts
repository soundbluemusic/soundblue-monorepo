// ========================================
// Conflict Detector - 충돌 단어 자동 감지
// ========================================

import type { Domain, TaggedDictionary, TaggedEntry } from './types';

/**
 * 도메인별 사전 엔트리
 */
interface DomainDictionaryEntry {
  domain: Domain;
  dictionary: Record<string, string>;
}

/**
 * 충돌 정보
 */
export interface ConflictInfo {
  word: string;
  entries: TaggedEntry[];
  isSemanticConflict: boolean; // 의미가 다른 충돌 (true) vs 단순 중복 (false)
}

/**
 * 여러 도메인 사전에서 충돌하는 단어들을 감지
 *
 * @param dictionaries - 도메인별 사전 배열
 * @returns 충돌 정보 배열
 *
 * @example
 * const conflicts = detectConflicts([
 *   { domain: 'technology.web', dictionary: { '속성': 'attribute' } },
 *   { domain: 'technology.oop', dictionary: { '속성': 'property' } },
 * ]);
 * // → [{ word: '속성', entries: [...], isSemanticConflict: true }]
 */
export function detectConflicts(dictionaries: DomainDictionaryEntry[]): ConflictInfo[] {
  // 단어별로 모든 번역을 수집
  const wordMap = new Map<string, TaggedEntry[]>();

  for (const { domain, dictionary } of dictionaries) {
    for (const [word, translation] of Object.entries(dictionary)) {
      const existing = wordMap.get(word) || [];
      existing.push({ domain, translation });
      wordMap.set(word, existing);
    }
  }

  // 2개 이상 도메인에서 나타나는 단어만 필터링
  const conflicts: ConflictInfo[] = [];

  for (const [word, entries] of wordMap) {
    if (entries.length > 1) {
      // 의미적 충돌 판별: 번역이 다르면 의미 충돌
      const uniqueTranslations = new Set(entries.map((e) => e.translation.toLowerCase()));
      const isSemanticConflict = uniqueTranslations.size > 1;

      conflicts.push({
        word,
        entries,
        isSemanticConflict,
      });
    }
  }

  return conflicts;
}

/**
 * 충돌을 태그된 사전 형태로 병합
 *
 * @param dictionaries - 도메인별 사전 배열
 * @returns 태그된 사전 (충돌 단어는 배열, 단일 단어는 문자열)
 *
 * @example
 * const tagged = mergeToDictionary([
 *   { domain: 'technology.web', dictionary: { '속성': 'attribute', '태그': 'tag' } },
 *   { domain: 'technology.oop', dictionary: { '속성': 'property', '클래스': 'class' } },
 * ]);
 * // → {
 * //   '속성': [
 * //     { domain: 'technology.web', translation: 'attribute' },
 * //     { domain: 'technology.oop', translation: 'property' }
 * //   ],
 * //   '태그': 'tag',
 * //   '클래스': 'class'
 * // }
 */
export function mergeToTaggedDictionary(dictionaries: DomainDictionaryEntry[]): TaggedDictionary {
  const result: TaggedDictionary = {};

  // 모든 단어 수집
  const wordMap = new Map<string, TaggedEntry[]>();

  for (const { domain, dictionary } of dictionaries) {
    for (const [word, translation] of Object.entries(dictionary)) {
      const existing = wordMap.get(word) || [];
      // 중복 방지 (같은 도메인, 같은 번역)
      const isDuplicate = existing.some(
        (e) => e.domain === domain && e.translation === translation,
      );
      if (!isDuplicate) {
        existing.push({ domain, translation });
        wordMap.set(word, existing);
      }
    }
  }

  // 결과 구성
  for (const [word, entries] of wordMap) {
    if (entries.length === 1) {
      // 단일 도메인: 문자열로 저장
      result[word] = entries[0].translation;
    } else {
      // 다중 도메인: 배열로 저장
      result[word] = entries;
    }
  }

  return result;
}

/**
 * 태그된 사전에서 특정 도메인에 맞는 번역 조회
 *
 * @param dictionary - 태그된 사전
 * @param word - 조회할 단어
 * @param domain - 현재 문맥 도메인
 * @returns 번역 문자열 또는 undefined
 */
export function lookupWithDomain(
  dictionary: TaggedDictionary,
  word: string,
  domain: Domain,
): string | undefined {
  const entry = dictionary[word];

  if (!entry) {
    return undefined;
  }

  // 단일 번역인 경우
  if (typeof entry === 'string') {
    return entry;
  }

  // 다중 번역인 경우: 도메인 매칭
  // 1. 정확히 일치하는 도메인
  const exactMatch = entry.find((e) => e.domain === domain);
  if (exactMatch) {
    return exactMatch.translation;
  }

  // 2. 상위 도메인 매칭 (technology.web → technology)
  const parentDomain = domain.split('.')[0] as Domain;
  const parentMatch = entry.find((e) => e.domain === parentDomain);
  if (parentMatch) {
    return parentMatch.translation;
  }

  // 3. 하위 도메인 매칭 (technology → technology.*)
  const childMatch = entry.find((e) => e.domain.startsWith(`${domain}.`));
  if (childMatch) {
    return childMatch.translation;
  }

  // 4. general 도메인 폴백
  const generalMatch = entry.find((e) => e.domain === 'general');
  if (generalMatch) {
    return generalMatch.translation;
  }

  // 5. 첫 번째 항목 반환 (최후의 폴백)
  return entry[0]?.translation;
}
