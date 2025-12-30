// ========================================
// Translation Pipeline - 번역 파이프라인
// ========================================
// 기존 translator-service.ts의 22개 if-else 체인을
// 우선순위 기반 파이프라인으로 단순화

import type { PipelineHandler, TranslationContext, TranslationDirection } from './types';

// ========================================
// Pipeline Registry - 핸들러 등록소
// ========================================

const handlers: PipelineHandler[] = [];

/**
 * 핸들러 등록
 */
export function registerHandler(handler: PipelineHandler): void {
  handlers.push(handler);
  // 우선순위 내림차순 정렬 (높은 것 먼저)
  handlers.sort((a, b) => b.priority - a.priority);
}

/**
 * 등록된 핸들러 목록 조회 (디버깅용)
 */
export function getHandlers(): readonly PipelineHandler[] {
  return handlers;
}

// ========================================
// Pipeline Executor - 파이프라인 실행
// ========================================

/**
 * 파이프라인 실행
 * - 우선순위 높은 핸들러부터 순서대로 실행
 * - null이 아닌 결과가 나오면 즉시 반환
 * - 모든 핸들러가 null이면 폴백 함수 실행
 */
export function executePipeline(
  text: string,
  direction: TranslationDirection,
  context?: TranslationContext,
  fallback?: (text: string, direction: TranslationDirection) => string,
): string {
  for (const handler of handlers) {
    // 비활성화된 핸들러 건너뜀
    if (handler.enabled === false) continue;

    const result = handler.fn(text, direction, context);
    if (result !== null) {
      return result;
    }
  }

  // 모든 핸들러가 실패하면 폴백
  if (fallback) {
    return fallback(text, direction);
  }

  // 폴백도 없으면 원본 반환
  return text;
}

// ========================================
// Legacy Fallback Registration
// ========================================
// 기존 translator-service.ts와의 순환 참조를 피하기 위해
// 폴백 핸들러는 외부에서 등록하도록 함

let legacyFallback: ((text: string, direction: TranslationDirection) => string) | null = null;

/**
 * 레거시 폴백 함수 등록
 * translator-service.ts에서 호출하여 기존 번역 함수를 등록
 */
export function setLegacyFallback(
  fn: (text: string, direction: TranslationDirection) => string,
): void {
  legacyFallback = fn;

  // 폴백 핸들러 등록 (가장 낮은 우선순위)
  registerHandler({
    name: 'legacy-fallback',
    priority: 0,
    fn: (text, direction) => {
      if (legacyFallback) {
        return legacyFallback(text, direction);
      }
      return null;
    },
  });
}
