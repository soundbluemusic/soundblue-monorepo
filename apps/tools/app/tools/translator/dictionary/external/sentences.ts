// ========================================
// External Dictionary - 외부 사전 (D1에서 자동 생성)
// Source: Cloudflare D1 (Context App)
// Generated: 2026-01-20T12:38:13.152Z
// ========================================
// ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요!
// ⚠️ This file is auto-generated. Do not edit directly!
// Run: pnpm sync:context-d1
// ========================================

/**
 * 외부 문장 사전 통계
 */
export const EXTERNAL_SENTENCES_STATS = {
  koToEnCount: 80357,
  enToKoCount: 79915,
  generatedAt: '2026-01-20T12:38:13.152Z',
} as const;

// 문장 사전 캐시
let koToEnCache: Record<string, string> | null = null;
let enToKoCache: Record<string, string> | null = null;

/**
 * 한→영 문장 사전 로드 (lazy loading)
 */
export async function loadKoToEnSentences(): Promise<Record<string, string>> {
  if (koToEnCache) return koToEnCache;
  const response = await fetch('/data/sentences/ko-to-en.json');
  koToEnCache = await response.json();
  return koToEnCache!;
}

/**
 * 영→한 문장 사전 로드 (lazy loading)
 */
export async function loadEnToKoSentences(): Promise<Record<string, string>> {
  if (enToKoCache) return enToKoCache;
  const response = await fetch('/data/sentences/en-to-ko.json');
  enToKoCache = await response.json();
  return enToKoCache!;
}

/**
 * 한→영 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupKoToEnSentence(ko: string): string | null {
  return koToEnCache?.[ko] ?? null;
}

/**
 * 영→한 문장 조회 (동기, 캐시된 경우만)
 */
export function lookupEnToKoSentence(en: string): string | null {
  return enToKoCache?.[en.toLowerCase()] ?? null;
}

/**
 * 문장 사전 사전 로드 (앱 초기화 시 호출)
 */
export async function preloadSentences(): Promise<void> {
  await Promise.all([loadKoToEnSentences(), loadEnToKoSentences()]);
}

/**
 * 캐시 상태 확인
 */
export function isSentencesCached(): boolean {
  return koToEnCache !== null && enToKoCache !== null;
}
