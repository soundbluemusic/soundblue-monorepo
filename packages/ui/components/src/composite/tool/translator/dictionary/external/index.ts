// ========================================
// External Dictionary - 외부 사전 (자동 생성)
// Source: public-monorepo/data/context
// Generated: 2026-01-09T14:17:39.198Z
// ========================================
// ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요!
// ⚠️ This file is auto-generated. Do not edit directly!
// Run: pnpm sync:context-dict
// ========================================

// 외부 사전 통합 export
export {
  externalKoToEnWords,
  externalEnToKoWords,
  EXTERNAL_WORDS_STATS,
} from './words';

export {
  EXTERNAL_SENTENCES_STATS,
  loadKoToEnSentences,
  loadEnToKoSentences,
  lookupKoToEnSentence,
  lookupEnToKoSentence,
  preloadSentences,
  isSentencesCached,
} from './sentences';

import { externalKoToEnWords, externalEnToKoWords } from './words';

// 외부 사전 로딩 상태 (동기식 - 이미 로드됨)
let isLoaded = true;

// Lazy loading을 위한 getter 함수들
export function getExternalKoToEnWords(): Record<string, string> {
  return externalKoToEnWords;
}

export function getExternalEnToKoWords(): Record<string, string> {
  return externalEnToKoWords;
}

// 단어 조회 함수
export function lookupExternalKoToEn(word: string): string | null {
  return externalKoToEnWords[word] ?? null;
}

export function lookupExternalEnToKo(word: string): string | null {
  return externalEnToKoWords[word.toLowerCase()] ?? null;
}

// 외부 사전 로딩 상태 확인
export function isExternalWordsCached(): boolean {
  return isLoaded;
}

// 외부 사전 로딩 (이미 동기적으로 로드되어 있음)
export async function loadExternalWords(): Promise<void> {
  isLoaded = true;
}
