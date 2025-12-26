/**
 * Context 데이터 모듈
 *
 * public-monorepo/apps/context에서 동기화된 한국어 학습 데이터
 * 701개 단어, 20개 카테고리
 *
 * @example
 * ```ts
 * import { contextEntries, getEntryByKorean } from '@soundblue/shared-react/data/context';
 *
 * // 전체 엔트리
 * console.log(contextEntries.length); // 701
 *
 * // 한국어로 검색
 * const entry = getEntryByKorean('하다');
 * console.log(entry?.translations.en.word); // 'to do'
 * ```
 */

// JSON imports
import adjectivesBasic from './adjectives-basic.json';
import art from './art.json';
import culture from './culture.json';
import dailyLife from './daily-life.json';
import emotions from './emotions.json';
import family from './family.json';
import food from './food.json';
import greetings from './greetings.json';
import math from './math.json';
import music from './music.json';
import numbers from './numbers.json';
import physics from './physics.json';
import shopping from './shopping.json';
import space from './space.json';
import sports from './sports.json';
import timeDate from './time-date.json';
import transportation from './transportation.json';
import travel from './travel.json';
import type { ContextEntry, Language } from './types';
import verbsBasic from './verbs-basic.json';
import work from './work.json';

// 카테고리별 엔트리
export const contextCategories = {
  'adjectives-basic': adjectivesBasic as ContextEntry[],
  art: art as ContextEntry[],
  culture: culture as ContextEntry[],
  'daily-life': dailyLife as ContextEntry[],
  emotions: emotions as ContextEntry[],
  family: family as ContextEntry[],
  food: food as ContextEntry[],
  greetings: greetings as ContextEntry[],
  math: math as ContextEntry[],
  music: music as ContextEntry[],
  numbers: numbers as ContextEntry[],
  physics: physics as ContextEntry[],
  shopping: shopping as ContextEntry[],
  space: space as ContextEntry[],
  sports: sports as ContextEntry[],
  'time-date': timeDate as ContextEntry[],
  transportation: transportation as ContextEntry[],
  travel: travel as ContextEntry[],
  'verbs-basic': verbsBasic as ContextEntry[],
  work: work as ContextEntry[],
} as const;

// 전체 엔트리 (플랫 배열)
export const contextEntries: ContextEntry[] = Object.values(contextCategories).flat();

// 유틸리티 함수들

/**
 * 한국어 단어로 엔트리 검색
 */
export function getEntryByKorean(korean: string): ContextEntry | undefined {
  return contextEntries.find((e) => e.korean === korean);
}

/**
 * ID로 엔트리 검색
 */
export function getEntryById(id: string): ContextEntry | undefined {
  return contextEntries.find((e) => e.id === id);
}

/**
 * 카테고리별 엔트리 가져오기
 */
export function getEntriesByCategory(categoryId: string): ContextEntry[] {
  return contextEntries.filter((e) => e.categoryId === categoryId);
}

/**
 * 난이도별 엔트리 가져오기
 */
export function getEntriesByDifficulty(difficulty: ContextEntry['difficulty']): ContextEntry[] {
  return contextEntries.filter((e) => e.difficulty === difficulty);
}

/**
 * 품사별 엔트리 가져오기
 */
export function getEntriesByPartOfSpeech(
  partOfSpeech: ContextEntry['partOfSpeech'],
): ContextEntry[] {
  return contextEntries.filter((e) => e.partOfSpeech === partOfSpeech);
}

/**
 * 검색 (한국어, 영어, 로마자)
 */
export function searchEntries(query: string, locale: Language = 'ko'): ContextEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return contextEntries.filter((entry) => {
    const translation = entry.translations[locale];
    return (
      entry.korean.includes(q) ||
      entry.romanization.toLowerCase().includes(q) ||
      translation.word.toLowerCase().includes(q) ||
      translation.explanation.toLowerCase().includes(q) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}

/**
 * 한국어 → 영어 단어 매핑 (Translator용)
 */
export function getKoreanToEnglishMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of contextEntries) {
    map.set(entry.korean, entry.translations.en.word);
  }
  return map;
}

/**
 * 영어 → 한국어 단어 매핑 (Translator용)
 */
export function getEnglishToKoreanMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of contextEntries) {
    map.set(entry.translations.en.word.toLowerCase(), entry.korean);
  }
  return map;
}

// 타입 re-export
export type { ContextEntry, Language, LeveledExamples, Translation } from './types';
