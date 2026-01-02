// ========================================
// Context Analysis Module - 문맥 분석 모듈
// ========================================

// Anchor extraction (사전에서 자동 추출 - 수동 관리 불필요)
export {
  type AnchorMatch,
  clearAnchorCache,
  extractDomainAnchors,
  findAnchorsInText,
  getAnchorDomain,
  getAnchorStrength,
  getDomainAnchors,
  isAnchor,
} from './anchor-extractor';
// Clause splitting
export { assignDomainToClause, mergeShortClauses, splitIntoClauses } from './clause-splitter';
// Conflict detection
export {
  type ConflictInfo,
  detectConflicts,
  lookupWithDomain,
  mergeToTaggedDictionary,
} from './conflict-detector';
// Main exports
export {
  analyzeContext,
  breakDomainTie,
  type ContextAnalysisOptions,
  optimizeSingleDomain,
  translateWithContext,
  translateWordsWithContext,
} from './context-analyzer';
// Domain tagging
export {
  extractDomainFromPath,
  getParentDomain,
  isDomainMatch,
} from './domain-tagger';
// Domain voting
export {
  analyzeClauseDomains,
  decideDomain,
  getOverallDomain,
  isMultiDomain,
  voteForDomain,
} from './domain-voter';
// Polysemy resolution
export {
  getAllTranslations,
  getDefaultTranslation,
  getPolysemyStats,
  isPolysemousWord,
  type PolysemyResult,
  type PolysemyStats,
  resolvePolysemiesInClause,
  resolvePolysemiesInSentence,
  resolvePolysemyWithDomain,
} from './polysemy-resolver';
// Tagged dictionary
export {
  buildDomainWordMap,
  buildTaggedKoEnDictionary,
  getDomainsForWord,
  getDomainWordMap,
  getTaggedDictionary,
  isSingleDomainWord,
} from './tagged-dictionary-builder';
// Types
export type {
  Clause,
  ContextAnalysisResult,
  Domain,
  DomainVote,
  TaggedDictionary,
  TaggedEntry,
} from './types';
