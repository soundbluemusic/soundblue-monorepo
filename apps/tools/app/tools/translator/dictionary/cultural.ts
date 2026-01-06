// ========================================
// Cultural Expressions Dictionary - 문화 특수 표현 사전
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 문화 특수 표현 번역 함수
// ========================================

import { externalKoToEnWords } from './external';

// 문화 특수 표현 패턴 키워드
const CULTURAL_KEYWORDS = [
  '수고',
  '고생',
  '맛있게',
  '잘 먹',
  '화이팅',
  '파이팅',
  '힘내',
  '안녕히',
  '조심히',
  '건강',
  '축하',
  '답답',
  '속상',
  '서운',
  '억울',
  '눈치',
  '정',
  '아이고',
  '어머',
  '세상에',
  '대박',
  '헐',
  '진짜',
  '정말',
  '형',
  '오빠',
  '누나',
  '언니',
  '선배',
  '후배',
];

/**
 * 문화 특수 표현인지 판단
 */
export function isCulturalExpression(text: string): boolean {
  return CULTURAL_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * 문화 특수 표현 조회 (한→영)
 */
export function lookupCultural(korean: string): string | null {
  return externalKoToEnWords[korean] ?? null;
}

/**
 * 문장에서 문화 표현 번역
 * external 사전을 사용하여 문화 특수 표현을 영어로 변환
 */
export function translateCultural(text: string): { translated: string; found: boolean } {
  let result = text;
  let found = false;

  // 문화 키워드를 포함한 표현 찾아서 번역
  for (const keyword of CULTURAL_KEYWORDS) {
    if (result.includes(keyword)) {
      // 키워드를 포함한 전체 표현 찾기
      const translation = externalKoToEnWords[keyword];
      if (translation) {
        result = result.replace(new RegExp(keyword, 'g'), translation);
        found = true;
      }
    }
  }

  return { translated: result, found };
}

// 하위 호환성을 위한 빈 객체 export
// 실제 데이터는 external에서 통합됨
export const culturalExpressions: Record<string, string> = {};
export const culturalExpressionList: string[] = [];
