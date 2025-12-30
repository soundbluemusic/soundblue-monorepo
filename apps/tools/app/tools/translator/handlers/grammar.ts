// ========================================
// Grammar Handler - 문법 분석 기반 폴백
// ========================================
// 다른 핸들러가 처리하지 못한 문장을 형태소 분석으로 처리
// 가장 낮은 우선순위 (priority: 10)

import { generateEnglish } from '../grammar/english-generator';
import { parseSentence } from '../grammar/sentence-parser';
import { registerHandler } from '../pipeline';
import type { TranslationContext, TranslationDirection } from '../types';

/**
 * 문법 분석 기반 번역 핸들러 (양방향)
 *
 * ko-en: 문장 파싱 → 영어 생성
 * en-ko: 현재는 null 반환 (추후 확장)
 *
 * 이 핸들러는 다른 패턴 기반 핸들러들이 실패했을 때
 * 마지막으로 문법 분석을 시도하는 폴백 역할
 */
export function handleGrammar(
  text: string,
  direction: TranslationDirection,
  _context?: TranslationContext,
): string | null {
  if (direction === 'ko-en') {
    return handleGrammarKoEn(text);
  }
  // en-ko는 현재 구현되지 않음 (기존 translateEnToKo가 처리)
  return null;
}

/**
 * ko-en: 문장 파싱 → 영어 생성
 */
function handleGrammarKoEn(text: string): string | null {
  // 문장 파싱 시도
  const parsed = parseSentence(text);

  // 토큰이 비어있으면 처리 불가
  if (parsed.tokens.length === 0) {
    return null;
  }

  // 영어 생성 시도
  const result = generateEnglish(parsed);

  // 결과가 없거나 원본과 같으면 실패
  if (!result.translation || result.translation === text || result.translation.trim() === '') {
    return null;
  }

  return result.translation;
}

// ========================================
// 핸들러 등록
// ========================================

registerHandler({
  name: 'grammar',
  priority: 10, // 가장 낮은 우선순위 (마지막 폴백)
  fn: handleGrammar,
});
