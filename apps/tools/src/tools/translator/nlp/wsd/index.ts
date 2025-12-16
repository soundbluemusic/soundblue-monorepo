// ========================================
// WSD Module - 중의성 해소 모듈
// ========================================

export {
  type ContextWindow,
  disambiguate,
  disambiguateAll,
  extractContext,
  getWordSense,
  scoreSense,
  type WsdResult,
} from './context-scorer';

export {
  getSenses,
  isPolysemous,
  type Polysemy,
  polysemyDict,
  polysemyMap,
  type Sense,
} from './polysemy-dict';
