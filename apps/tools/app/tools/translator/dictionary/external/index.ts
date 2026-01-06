// ========================================
// External Dictionary - 외부 사전 (Lazy Loading)
// Source: public-monorepo/data/context
// ========================================
// 성능 최적화: 920KB 외부 단어 사전을 lazy loading으로 변환
// 기존: 모듈 로드 시 즉시 파싱 (초기 로딩 지연)
// 개선: 첫 번역 요청 시에만 로드 (빠른 초기 로딩)
// ========================================

// 외부 단어 사전 통계 (동기 - 작은 객체)
export { EXTERNAL_WORDS_STATS } from './words';

// 문장 사전 (기존 lazy loading 유지)
export {
  EXTERNAL_SENTENCES_STATS,
  loadKoToEnSentences,
  loadEnToKoSentences,
  lookupKoToEnSentence,
  lookupEnToKoSentence,
  preloadSentences,
  isSentencesCached,
} from './sentences';

// ========================================
// 외부 단어 사전 Lazy Loading
// ========================================

// 캐시
let _externalKoToEnWords: Record<string, string> | null = null;
let _externalEnToKoWords: Record<string, string> | null = null;
let _loadPromise: Promise<void> | null = null;

/**
 * 외부 단어 사전 로드 (lazy loading)
 * 첫 호출 시에만 920KB 파일을 동적 import
 */
export async function loadExternalWords(): Promise<void> {
  if (_externalKoToEnWords && _externalEnToKoWords) return;

  if (!_loadPromise) {
    _loadPromise = import('./words').then((module) => {
      _externalKoToEnWords = module.externalKoToEnWords;
      _externalEnToKoWords = module.externalEnToKoWords;
    });
  }

  await _loadPromise;
}

/**
 * 한→영 외부 단어 조회 (동기, 캐시된 경우만)
 * 캐시 안 됐으면 null 반환 (기존 사전으로 fallback)
 */
export function lookupExternalKoToEn(ko: string): string | null {
  return _externalKoToEnWords?.[ko] ?? null;
}

/**
 * 영→한 외부 단어 조회 (동기, 캐시된 경우만)
 */
export function lookupExternalEnToKo(en: string): string | null {
  return _externalEnToKoWords?.[en.toLowerCase()] ?? null;
}

/**
 * 외부 단어 사전 캐시 상태 확인
 */
export function isExternalWordsCached(): boolean {
  return _externalKoToEnWords !== null && _externalEnToKoWords !== null;
}

/**
 * 외부 단어 사전 전체 반환 (동기, 캐시된 경우만)
 * 주의: 캐시 안 됐으면 빈 객체 반환
 */
export function getExternalKoToEnWords(): Record<string, string> {
  return _externalKoToEnWords ?? {};
}

export function getExternalEnToKoWords(): Record<string, string> {
  return _externalEnToKoWords ?? {};
}
