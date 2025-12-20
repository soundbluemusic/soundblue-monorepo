// ========================================
// WSD Module - 중의성 해소 모듈
// ========================================

export {
  type ContextWindow,
  disambiguate,
  disambiguateAll,
  extractContext,
  getWordSense,
  SIGNAL_WEIGHTS,
  scoreSense,
  type WsdResult,
} from './context-scorer';
export {
  type ContextDataSource,
  type ContextMeaningEntry,
  convertToPolysemy,
  DEFAULT_CONTEXT_SOURCE,
  exportPolysemyDictAsCode,
  mergePolysemy,
  type SyncResult,
  syncContextData,
} from './context-sync';
export {
  getSenses,
  isPolysemous,
  type Polysemy,
  polysemyDict,
  polysemyMap,
  type Sense,
} from './polysemy-dict';
export {
  exportWeightsAsCode,
  type OptimizationResult,
  optimizeWeights,
  runWsdTests,
  type WeightConfig,
  WSD_TEST_CASES,
  type WsdTestCase,
} from './weight-optimizer';
