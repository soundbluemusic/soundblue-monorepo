// ========================================
// Translator Engine - 고성능 번역 엔진
// 10,000+ 단어 규모 지원, SSG 최적화
// ========================================

// 서비스 어댑터 (기존 코드 마이그레이션용)
export {
  clearEngineCache,
  getAdapterState,
  getEngineStats,
  initializeNewEngine,
  setFallbackEnabled,
  setUseNewEngine,
  translateHybrid,
  translateHybridSync,
  translateWithNewEngine,
  translateWithNewEngineSync,
} from './adapter';
// 캐시
export { LRUCache } from './cache/lru-cache';
// 사전 인덱스
export { type DictionaryEntry, DictionaryIndex } from './dictionary/dictionary-index';
// 로더 및 초기화
export {
  type ChunkDefinition,
  createEngineFromLegacy,
  EngineLoader,
  getEngine,
  getEngineSync,
  initializeEngine,
} from './loader';
// 패턴 인덱스
export { type IndexedPattern, PatternIndex } from './patterns/pattern-index';
// 엔진 코어
export {
  type EngineConfig,
  type TranslateOptions,
  type TranslateResult,
  TranslatorEngine,
} from './translator-engine';
// Trie 자료구조
export { SuffixTrie } from './trie/suffix-trie';
