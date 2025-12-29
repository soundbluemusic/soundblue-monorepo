// ========================================
// Context-Aware Response - 문맥 기반 응답
// ========================================

import type { Entity } from '../entity/extractor';
import type { ContextSummary } from './context-manager';

/**
 * 문맥 참조 감지 결과
 */
export interface ContextReferenceResult {
  /** 문맥 참조 여부 */
  hasReference: boolean;
  /** 참조된 엔티티 */
  referencedEntity?: Entity;
  /** 참조 유형 */
  referenceType?: 'pronoun' | 'demonstrative' | 'temporal';
}

/**
 * 한국어 문맥 참조 패턴
 */
const KO_REFERENCE_PATTERNS = {
  pronoun: ['그것', '그거', '이것', '이거', '저것', '저거'],
  demonstrative: ['그', '이', '저', '그런', '이런', '저런'],
  temporal: ['아까', '방금', '이전에', '전에', '그때'],
};

/**
 * 영어 문맥 참조 패턴
 */
const EN_REFERENCE_PATTERNS = {
  pronoun: ['it', 'that', 'this', 'they', 'them'],
  demonstrative: ['the', 'that', 'this', 'those', 'these'],
  temporal: ['earlier', 'before', 'previously', 'just now', 'ago'],
};

/**
 * 문맥 참조 감지
 *
 * 입력에서 대명사, 지시어, 시간 표현을 찾아
 * 이전 대화의 엔티티를 참조하는지 확인
 *
 * @param input - 사용자 입력
 * @param contextSummary - 문맥 요약
 * @param locale - 언어 코드
 * @returns 문맥 참조 결과
 *
 * @example
 * ```typescript
 * const result = detectContextReference("그거 뭐야?", contextSummary, "ko");
 * if (result.hasReference && result.referencedEntity) {
 *   // 이전에 언급된 엔티티로 응답 생성
 * }
 * ```
 */
export function detectContextReference(
  input: string,
  contextSummary: ContextSummary,
  locale: string,
): ContextReferenceResult {
  const lowerInput = input.toLowerCase();
  const patterns = locale === 'ko' ? KO_REFERENCE_PATTERNS : EN_REFERENCE_PATTERNS;

  // 참조 패턴 검색
  let referenceType: ContextReferenceResult['referenceType'];

  for (const pronoun of patterns.pronoun) {
    if (lowerInput.includes(pronoun)) {
      referenceType = 'pronoun';
      break;
    }
  }

  if (!referenceType) {
    for (const demonstrative of patterns.demonstrative) {
      if (lowerInput.includes(demonstrative)) {
        referenceType = 'demonstrative';
        break;
      }
    }
  }

  if (!referenceType) {
    for (const temporal of patterns.temporal) {
      if (lowerInput.includes(temporal)) {
        referenceType = 'temporal';
        break;
      }
    }
  }

  // 참조가 없으면 반환
  if (!referenceType) {
    return { hasReference: false };
  }

  // 가장 최근 엔티티 찾기
  const referencedEntity =
    contextSummary.mentionedEntities[contextSummary.mentionedEntities.length - 1];

  return {
    hasReference: true,
    referencedEntity,
    referenceType,
  };
}

/**
 * 감정 추세에 따른 응답 톤 조정
 *
 * @param baseTone - 기본 톤
 * @param sentimentTrend - 감정 추세
 * @param locale - 언어 코드
 * @returns 조정된 응답 접두사
 */
export function getEmpatheticPrefix(
  sentimentTrend: ContextSummary['userSentimentTrend'],
  locale: string,
): string {
  if (sentimentTrend === 'declining') {
    return locale === 'ko'
      ? '걱정되시는 부분이 있으신 것 같네요. '
      : 'I understand this might be frustrating. ';
  }

  if (sentimentTrend === 'improving') {
    return locale === 'ko' ? '좋아지고 있네요! ' : "That's great! ";
  }

  return '';
}

/**
 * 문맥 기반 응답 향상
 *
 * 기존 응답에 문맥 정보를 추가하여 자연스러운 대화 흐름 생성
 *
 * @param baseResponse - 기본 응답
 * @param contextSummary - 문맥 요약
 * @param locale - 언어 코드
 * @returns 향상된 응답
 *
 * @example
 * ```typescript
 * const enhanced = enhanceResponseWithContext(
 *   "React는 UI 라이브러리입니다.",
 *   contextSummary,
 *   "ko"
 * );
 * // 감정 추세가 하락 중이면:
 * // "걱정되시는 부분이 있으신 것 같네요. React는 UI 라이브러리입니다."
 * ```
 */
export function enhanceResponseWithContext(
  baseResponse: string,
  contextSummary: ContextSummary,
  locale: string,
): string {
  // 감정 추세에 따른 접두사 추가
  const prefix = getEmpatheticPrefix(contextSummary.userSentimentTrend, locale);

  // 주제 연속성 확인 및 연결어 추가
  let connector = '';
  if (contextSummary.conversationTopic) {
    if (contextSummary.recentIntents.includes('question')) {
      connector = locale === 'ko' ? '관련해서 말씀드리면, ' : 'Regarding that, ';
    }
  }

  return prefix + connector + baseResponse;
}

/**
 * 엔티티 참조를 해결하여 응답 생성
 *
 * @param reference - 문맥 참조 결과
 * @param locale - 언어 코드
 * @returns 참조 해결 응답 또는 null
 */
export function resolveEntityReference(
  reference: ContextReferenceResult,
  locale: string,
): string | null {
  if (!reference.hasReference || !reference.referencedEntity) {
    return null;
  }

  const entity = reference.referencedEntity;

  if (locale === 'ko') {
    switch (entity.type) {
      case 'tech':
        return `아, ${entity.value}에 대해 물어보시는 거죠? `;
      case 'product':
        return `${entity.value} 말씀하시는 거죠? `;
      case 'url':
        return `${entity.value} 링크에 대해 더 알려드릴까요? `;
      case 'email':
        return `${entity.value} 이메일 관련해서요? `;
      case 'date':
        return `${entity.value} 날짜 관련해서요? `;
      default:
        return `${entity.value}에 대해 더 알려드릴까요? `;
    }
  }
  switch (entity.type) {
    case 'tech':
      return `Ah, you're asking about ${entity.value}? `;
    case 'product':
      return `You mean ${entity.value}? `;
    case 'url':
      return `About the link ${entity.value}? `;
    case 'email':
      return `Regarding the email ${entity.value}? `;
    case 'date':
      return `About the date ${entity.value}? `;
    default:
      return `About ${entity.value}? `;
  }
}
