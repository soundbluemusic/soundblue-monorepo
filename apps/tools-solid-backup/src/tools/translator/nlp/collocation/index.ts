// ========================================
// Collocation Module - 연어 모듈
// ========================================

export {
  type Collocation,
  type CollocationType,
  collocationIndex,
  collocations,
  getCollocationCandidates,
} from './collocation-dict';
export {
  applyCollocationTranslation,
  applyVerbObjectTranslation,
  type CollocationMatch,
  type CollocationTranslation,
  extractStem,
  findCollocations,
  findCollocationsInSentence,
  findVerbObjectCollocations,
  type VerbObjectMatch,
  type VerbObjectTranslation,
} from './matcher';
export {
  findCollocationsForObject,
  findVerbObjectCollocation,
  type VerbObjectPattern,
  verbObjectCollocations,
  verbStems,
} from './verb-object';
