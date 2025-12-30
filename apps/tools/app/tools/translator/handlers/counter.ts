// ========================================
// Counter Handler - 숫자+분류사 처리
// ========================================
// 양방향 통합: ko-en, en-ko 모두 처리
// 기존: handleCounterPattern + handleCounterPatternEnKo

import { enToKoWords, koToEnWords } from '../dictionary';
import type { TranslationContext, TranslationDirection } from '../types';

// ========================================
// 분류사 데이터
// ========================================

/** 한국어 분류사 → 영어 복수형 정보 */
const KOREAN_COUNTERS: Record<string, { singular: string; plural: string }> = {
  개: { singular: 'piece', plural: 'pieces' },
  마리: { singular: 'animal', plural: 'animals' },
  명: { singular: 'person', plural: 'people' },
  권: { singular: 'book', plural: 'books' },
  장: { singular: 'sheet', plural: 'sheets' },
  대: { singular: 'vehicle', plural: 'vehicles' },
  병: { singular: 'bottle', plural: 'bottles' },
  잔: { singular: 'cup', plural: 'cups' },
  그루: { singular: 'tree', plural: 'trees' },
  송이: { singular: 'flower', plural: 'flowers' },
  벌: { singular: 'suit', plural: 'suits' },
  켤레: { singular: 'pair', plural: 'pairs' },
  채: { singular: 'building', plural: 'buildings' },
};

/** 영어 명사 → 한국어 분류사 매핑 */
const NOUN_TO_COUNTER: Record<string, string> = {
  cat: '마리',
  dog: '마리',
  bird: '마리',
  fish: '마리',
  animal: '마리',
  person: '명',
  student: '명',
  teacher: '명',
  man: '명',
  woman: '명',
  child: '명',
  book: '권',
  paper: '장',
  ticket: '장',
  car: '대',
  bus: '대',
  bicycle: '대',
  bottle: '병',
  cup: '잔',
  glass: '잔',
  tree: '그루',
  flower: '송이',
};

// ========================================
// 유틸리티 함수
// ========================================

/** 영어 명사 복수형 변환 */
function pluralize(noun: string): string {
  if (noun.endsWith('y') && !/[aeiou]y$/.test(noun)) {
    return `${noun.slice(0, -1)}ies`;
  }
  if (noun.endsWith('s') || noun.endsWith('x') || noun.endsWith('ch') || noun.endsWith('sh')) {
    return `${noun}es`;
  }
  return `${noun}s`;
}

/** 영어 복수형 → 단수형 변환 */
function singularize(noun: string): string {
  const lower = noun.toLowerCase();
  if (lower.endsWith('ies')) {
    return `${lower.slice(0, -3)}y`;
  }
  if (
    lower.endsWith('ses') ||
    lower.endsWith('xes') ||
    lower.endsWith('ches') ||
    lower.endsWith('shes')
  ) {
    return lower.slice(0, -2);
  }
  if (lower.endsWith('s') && !lower.endsWith('ss')) {
    return lower.slice(0, -1);
  }
  return lower;
}

// ========================================
// 핸들러
// ========================================

/**
 * 숫자+분류사 패턴 처리 (양방향)
 *
 * ko-en: "사과 3개" → "3 apples"
 * en-ko: "3 apples" → "사과 3개"
 */
export function handleCounter(
  text: string,
  direction: TranslationDirection,
  _context?: TranslationContext,
): string | null {
  if (direction === 'ko-en') {
    return handleCounterKoEn(text);
  }
  return handleCounterEnKo(text);
}

/**
 * ko-en: 한국어 분류사 → 영어 복수형
 * "사과 3개" → "3 apples"
 */
function handleCounterKoEn(text: string): string | null {
  const counterKeys = Object.keys(KOREAN_COUNTERS).join('|');
  const pattern = new RegExp(`^(.+?)\\s*(\\d+)\\s*(${counterKeys})$`);
  const match = text.match(pattern);

  if (!match) return null;

  const [, nounKo, numStr, counter] = match;
  if (!nounKo || !numStr || !counter) return null;

  const num = Number.parseInt(numStr, 10);
  const nounEn = koToEnWords[nounKo.trim()] || nounKo.trim();
  const counterInfo = KOREAN_COUNTERS[counter];

  if (!counterInfo) return null;

  // 사람(명)은 특수 처리
  if (counter === '명') {
    if (num === 1) {
      return `1 ${counterInfo.singular}`;
    }
    return `${num} ${counterInfo.plural}`;
  }

  // 일반 분류사: 1=단수, 0/2+=복수
  if (num === 1) {
    return `1 ${nounEn}`;
  }
  return `${num} ${pluralize(nounEn)}`;
}

/**
 * en-ko: 영어 숫자+명사 → 한국어 분류사
 * "3 apples" → "사과 3개"
 */
function handleCounterEnKo(text: string): string | null {
  const match = text.match(/^(\d+)\s+(\w+)$/);
  if (!match) return null;

  const [, numStr, nounEn] = match;
  if (!numStr || !nounEn) return null;

  const num = Number.parseInt(numStr, 10);
  const singularNoun = singularize(nounEn);

  // 영어→한국어 명사 변환
  const nounKo = enToKoWords[singularNoun] || enToKoWords[nounEn.toLowerCase()];
  if (!nounKo) return null;

  // 분류사 결정
  const counter = NOUN_TO_COUNTER[singularNoun] || '개';

  return `${nounKo} ${num}${counter}`;
}

// ========================================
// 핸들러 등록
// ========================================

import { registerHandler } from '../pipeline';

registerHandler({
  name: 'counter',
  priority: 90, // 높은 우선순위 (간단한 패턴)
  fn: handleCounter,
});
