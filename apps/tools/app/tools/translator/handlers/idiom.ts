// ========================================
// Idiom Handler - 관용어/숙어 처리
// ========================================
// 양방향 통합: ko-en, en-ko 모두 처리
// 기존 matchKoIdioms, matchEnIdioms 함수 활용

import { matchEnIdioms, matchKoIdioms } from '../dictionary';
import { registerHandler } from '../pipeline';
import type { TranslationContext, TranslationDirection } from '../types';

/**
 * 관용어/숙어 패턴 처리 (양방향)
 *
 * ko-en: "눈이 높다" → "have high standards"
 * en-ko: "break the ice" → "분위기를 부드럽게 하다"
 *
 * 전체 문장이 관용어인 경우에만 처리
 * 부분 매칭은 다른 핸들러에서 처리하도록 넘김
 */
export function handleIdiom(
  text: string,
  direction: TranslationDirection,
  _context?: TranslationContext,
): string | null {
  if (direction === 'ko-en') {
    const result = matchKoIdioms(text);
    // 전체 문장이 관용어인 경우에만 처리
    if (result.found && result.isFullMatch) {
      return result.result;
    }
    return null;
  }

  // en-ko
  const result = matchEnIdioms(text);
  // 매칭된 관용어가 있고, 전체가 변환된 경우
  if (result.found && result.result !== text.toLowerCase()) {
    // 원본과 다르면 변환된 것
    return result.result;
  }
  return null;
}

// ========================================
// 핸들러 등록
// ========================================

registerHandler({
  name: 'idiom',
  priority: 100, // 가장 높은 우선순위 (관용어는 먼저 처리)
  fn: handleIdiom,
});
