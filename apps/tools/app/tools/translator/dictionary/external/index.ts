// ========================================
// External Dictionary - 외부 사전 (D1에서 자동 생성)
// Source: Cloudflare D1 (Context App)
// Generated: 2026-01-19T18:25:13.871Z
// ========================================
// ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요!
// ⚠️ This file is auto-generated. Do not edit directly!
// Run: pnpm sync:context-d1
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
