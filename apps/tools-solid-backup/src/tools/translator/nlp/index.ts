// ========================================
// NLP Module - 자연어 처리 모듈
// WSD, 연어, 주제 탐지 통합
// ========================================

// Collocation (연어)
export {
  applyCollocationTranslation,
  applyVerbObjectTranslation,
  type Collocation,
  type CollocationMatch,
  type CollocationTranslation,
  type CollocationType,
  collocationIndex,
  collocations,
  extractStem,
  findCollocations,
  findCollocationsForObject,
  findCollocationsInSentence,
  findVerbObjectCollocation,
  findVerbObjectCollocations,
  getCollocationCandidates,
  type VerbObjectMatch,
  // Verb-Object Collocations (동사-목적어 연어)
  type VerbObjectPattern,
  type VerbObjectTranslation,
  verbObjectCollocations,
  verbStems,
} from './collocation';
// Topic Detection (주제 탐지)
export {
  type DomainScore,
  detectDomains,
  domainKeywords,
  getDomainHint,
  getTopDomain,
  getTopDomains,
  hasDomain,
} from './topic';
// WSD (중의성 해소)
export {
  type ContextWindow,
  disambiguate,
  disambiguateAll,
  extractContext,
  getSenses,
  getWordSense,
  isPolysemous,
  type Polysemy,
  polysemyDict,
  polysemyMap,
  type Sense,
  scoreSense,
  type WsdResult,
} from './wsd';
