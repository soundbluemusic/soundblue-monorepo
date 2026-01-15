// ========================================
// Service Adapter - 기존 서비스와 새 엔진 연결
// 점진적 마이그레이션을 위한 어댑터
// ========================================

import type { TranslationDirection } from '../../types';
import { getEngine, getEngineSync } from '../loader';
import type { TranslateResult } from '../translator-engine';

/**
 * 어댑터 상태
 */
interface AdapterState {
  initialized: boolean;
  useNewEngine: boolean;
  fallbackEnabled: boolean;
}

const state: AdapterState = {
  initialized: false,
  useNewEngine: false,
  fallbackEnabled: true,
};

/**
 * 새 엔진 초기화
 * 앱 시작 시 호출하여 엔진을 미리 로드
 */
export async function initializeNewEngine(): Promise<void> {
  try {
    await getEngine();
    state.initialized = true;
    state.useNewEngine = true;
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error('Failed to initialize new engine:', error);
    state.useNewEngine = false;
  }
}

/**
 * 새 엔진 사용 여부 설정
 */
export function setUseNewEngine(use: boolean): void {
  state.useNewEngine = use;
}

/**
 * 폴백 활성화 여부 설정
 * true면 새 엔진 실패 시 기존 엔진으로 폴백
 */
export function setFallbackEnabled(enabled: boolean): void {
  state.fallbackEnabled = enabled;
}

/**
 * 어댑터 상태 조회
 */
export function getAdapterState(): Readonly<AdapterState> {
  return { ...state };
}

/**
 * 새 엔진으로 번역 (동기)
 * 엔진이 초기화되지 않았으면 null 반환
 */
export function translateWithNewEngineSync(
  text: string,
  direction: TranslationDirection,
): TranslateResult | null {
  const engine = getEngineSync();

  if (!engine || !state.useNewEngine) {
    return null;
  }

  try {
    return engine.translate(text, { direction });
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error('New engine translation failed:', error);
    return null;
  }
}

/**
 * 새 엔진으로 번역 (비동기)
 */
export async function translateWithNewEngine(
  text: string,
  direction: TranslationDirection,
): Promise<TranslateResult | null> {
  if (!state.useNewEngine) {
    return null;
  }

  try {
    const engine = await getEngine();
    return engine.translate(text, { direction });
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error('New engine translation failed:', error);
    return null;
  }
}

/**
 * 엔진 통계 조회
 */
export function getEngineStats(): {
  dictionaries: { koToEn: number; enToKo: number };
  cache: { size: number; hitRate: number };
} | null {
  const engine = getEngineSync();

  if (!engine) {
    return null;
  }

  const stats = engine.getStats();
  return {
    dictionaries: stats.dictionaries,
    cache: stats.cache,
  };
}

/**
 * 캐시 클리어
 */
export function clearEngineCache(): void {
  const engine = getEngineSync();
  engine?.clearCache();
}

/**
 * 하이브리드 번역 함수
 * 새 엔진 우선, 실패 시 기존 엔진으로 폴백
 *
 * @param text 번역할 텍스트
 * @param direction 번역 방향
 * @param legacyTranslate 기존 번역 함수 (폴백용)
 */
export async function translateHybrid(
  text: string,
  direction: TranslationDirection,
  legacyTranslate: (text: string, direction: TranslationDirection) => string,
): Promise<{ result: string; source: 'new' | 'legacy' }> {
  // 새 엔진 시도
  if (state.useNewEngine) {
    const newResult = await translateWithNewEngine(text, direction);

    if (newResult?.translated) {
      return { result: newResult.translated, source: 'new' };
    }
  }

  // 폴백
  if (state.fallbackEnabled) {
    const legacyResult = legacyTranslate(text, direction);
    return { result: legacyResult, source: 'legacy' };
  }

  return { result: text, source: 'legacy' };
}

/**
 * 동기 하이브리드 번역 함수
 */
export function translateHybridSync(
  text: string,
  direction: TranslationDirection,
  legacyTranslate: (text: string, direction: TranslationDirection) => string,
): { result: string; source: 'new' | 'legacy' } {
  // 새 엔진 시도
  if (state.useNewEngine && state.initialized) {
    const newResult = translateWithNewEngineSync(text, direction);

    if (newResult?.translated) {
      return { result: newResult.translated, source: 'new' };
    }
  }

  // 폴백
  if (state.fallbackEnabled) {
    const legacyResult = legacyTranslate(text, direction);
    return { result: legacyResult, source: 'legacy' };
  }

  return { result: text, source: 'legacy' };
}
