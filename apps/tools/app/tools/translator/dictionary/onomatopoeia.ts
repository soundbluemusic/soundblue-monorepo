// ========================================
// Onomatopoeia Dictionary - 의성어/의태어 사전
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 의성어/의태어 번역 함수
// ========================================

import { lookupExternalKoToEn } from './external';

// 의성어/의태어 패턴 (빈도가 높은 것들)
const ONOMATOPOEIA_PATTERNS = [
  // 반복 패턴 (ABAB)
  /(.{1,2})\1/,
  // 흔한 의성어/의태어 접미사
  /[글껄랄덜럴렁쿵탕팡앙]/,
];

/**
 * 의성어/의태어인지 판단
 */
export function isOnomatopoeia(word: string): boolean {
  // 2글자 이상 반복 패턴
  if (/^(.{1,2})\1+$/.test(word)) return true;
  // 흔한 패턴
  return ONOMATOPOEIA_PATTERNS.some((p) => p.test(word));
}

/**
 * 의성어/의태어 조회 (한→영, lazy loading)
 */
export function lookupOnomatopoeia(korean: string): string | null {
  return lookupExternalKoToEn(korean);
}

/**
 * 문장에서 의성어/의태어 번역
 * external 사전을 사용하여 의성어/의태어를 영어로 변환 (lazy loading)
 */
export function translateOnomatopoeia(text: string): string {
  let result = text;

  // 알려진 의성어/의태어 패턴을 external 사전에서 찾아 번역
  const words = text.split(/\s+/);
  for (const word of words) {
    const translation = lookupExternalKoToEn(word);
    if (translation && isOnomatopoeia(word)) {
      result = result.replace(new RegExp(word, 'g'), translation);
    }
  }

  return result;
}

// 하위 호환성을 위한 빈 객체 export
// 실제 데이터는 external에서 통합됨
export const onomatopoeia: Record<string, string> = {};
export const mimetics: Record<string, string> = {};
export const koOnomatopoeia: Record<string, string> = {};
export const onomatopoeiaList: string[] = [];
