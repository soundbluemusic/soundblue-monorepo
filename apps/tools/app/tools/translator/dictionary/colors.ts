// ========================================
// Colors Dictionary - 색상 사전 (한↔영)
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 색상 조회 함수
// ========================================

import { externalEnToKoWords, externalKoToEnWords } from './external';

// 색상 관련 키워드 필터링을 위한 패턴
const _COLOR_KEYWORDS_KO = [
  '색',
  '빨강',
  '주황',
  '노랑',
  '초록',
  '파랑',
  '보라',
  '분홍',
  '갈색',
  '검정',
  '흰색',
  '회색',
  '핑크',
  '블루',
  '레드',
  '그린',
  '옐로우',
  '퍼플',
  '골드',
  '실버',
];

/**
 * 색상 조회 함수 (한→영)
 * external 사전에서 색상 관련 단어를 조회
 */
export function lookupColorKoToEn(korean: string): string | null {
  // 직접 매칭
  const direct = externalKoToEnWords[korean];
  if (direct) return direct;

  // '색' 접미사 제거 후 재시도
  if (korean.endsWith('색') && korean.length > 1) {
    const withoutSuffix = korean.slice(0, -1);
    const result = externalKoToEnWords[withoutSuffix];
    if (result) return result;
  }

  return null;
}

/**
 * 색상 조회 함수 (영→한)
 * external 사전에서 색상 관련 단어를 조회
 */
export function lookupColorEnToKo(english: string): string | null {
  const lower = english.toLowerCase();
  return externalEnToKoWords[lower] ?? null;
}

// 하위 호환성을 위한 빈 객체 export (기존 import 유지)
// 실제 데이터는 words.ts에서 external을 통해 통합됨
export const koToEnColors: Record<string, string> = {};
export const enToKoColors: Record<string, string> = {};
