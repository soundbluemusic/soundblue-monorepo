// ========================================
// Countries Dictionary - 국가명 사전 (한↔영)
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 국가명 조회 함수
// ========================================

import { externalEnToKoWords, externalKoToEnWords } from './external';

/**
 * 국가명 조회 함수 (한→영)
 * external 사전에서 국가명을 조회
 */
export function lookupCountryKoToEn(korean: string): string | null {
  return externalKoToEnWords[korean] ?? null;
}

/**
 * 국가명 조회 함수 (영→한)
 * external 사전에서 국가명을 조회
 */
export function lookupCountryEnToKo(english: string): string | null {
  const lower = english.toLowerCase();
  return externalEnToKoWords[lower] ?? null;
}

// 하위 호환성을 위한 빈 객체 export (기존 import 유지)
// 실제 데이터는 words.ts에서 external을 통해 통합됨
export const koToEnCountries: Record<string, string> = {};
export const enToKoCountries: Record<string, string> = {};
