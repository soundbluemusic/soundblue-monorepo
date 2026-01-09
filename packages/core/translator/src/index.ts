// ========================================
// @soundblue/translator - Korean-English Translation Engine
// Public API
// ========================================

// Context Analysis
export { analyzeContext, type ContextAnalysis } from './analysis/context/context-analyzer';
export { type GenerateEnglishResult, generateEnglish } from './analysis/syntax/english-generator';
// Grammar Analysis
export {
  ENDING_LIST,
  ENDINGS,
  type Formality,
  type MorphemeAnalysis,
  PARTICLE_LIST,
  PARTICLES,
  type Role,
  type Tense,
} from './analysis/syntax/morpheme-analyzer';
export { deromanize, romanize } from './analysis/syntax/romanization';
export {
  type Constituent,
  type ParsedSentence,
  parseSentence,
  type SentenceType,
  summarizeParsedSentence,
} from './analysis/syntax/sentence-parser';
export {
  correctDependencyNounSpacing,
  correctParticleSpacing,
  correctSpacing,
  dpWordSplit,
  recoverSpacing,
} from './correction/spacing-rules';
// Typo Correction
export {
  type CorrectionResult,
  type CorrectionStats,
  correctTypos,
  findSimilarWords,
  isTypo,
} from './correction/typo-corrector';
export { culturalExpressions, translateCultural } from './dictionary/entries/cultural';
export { idioms, lookupKoIdiom, matchEnIdioms, matchKoIdioms } from './dictionary/entries/idioms';
export { onomatopoeia, translateOnomatopoeia } from './dictionary/entries/onomatopoeia';
export { phrasalVerbs, translatePhrasalVerbs } from './dictionary/entries/phrasal-verbs';
// Dictionary Access
export { enToKoWords, koToEnWords } from './dictionary/entries/words';
// Morphology - Korean Connective Endings
export {
  type ConnectiveEndingInfo,
  connectiveEndingList,
  connectiveEndings,
  extractConnectiveEnding,
  restoreStemFromConnective,
} from './dictionary/morphology/korean-connective';
// Morphology - Korean Contracted Forms
export {
  type ContractedEndingInfo,
  contractedFormList,
  contractedForms,
  tryExtractContracted,
} from './dictionary/morphology/korean-contracted';
// Morphology - Korean Copulas
export {
  type CopulaInfo,
  copulaList,
  copulas,
  selectBeVerb,
  tryExtractCopula,
} from './dictionary/morphology/korean-copulas';
// Morphology - Korean Endings
export {
  type EndingPattern,
  getEnglishTense,
  matchEnding,
} from './dictionary/morphology/korean-endings';
// Morphology - Korean Morphemes
export {
  endingList,
  endings,
  particleList,
  particles,
} from './dictionary/morphology/korean-morphemes';
// Morphology - Patterns
export { enToKoPatterns, koToEnPatterns } from './dictionary/morphology/patterns';
// Detailed Translation (for advanced use)
export {
  type EnToKoResult,
  translateEnToKo,
  translateEnToKoDetailed,
  translateEnToKoMultiple,
} from './engine/en-to-ko';
// Core Translation Functions
export {
  autoTranslate,
  detectLanguage,
  type ExceptionResult,
  en2ko,
  getTranslationQuality,
  getTranslationStats,
  ko2en,
  type TranslationOptions,
  type TranslationResult,
  type TranslationStats,
  translate,
  translateBatch,
} from './engine/jaso-engine';
export {
  type KoToEnResult,
  translateKoToEn,
  translateKoToEnDetailed,
  translateKoToEnMultiple,
} from './engine/ko-to-en';
export { getEngine, getEngineSync, initializeEngine } from './engine/loader';
// Engine (for advanced integration)
export {
  type EngineConfig,
  type TranslateResult,
  TranslatorEngine,
} from './engine/translator-engine';
// NLP / WSD
export { type ContextWindow, disambiguate, extractContext } from './nlp/wsd/context-scorer';
export { getSenses as getPolysemySenses, isPolysemous } from './nlp/wsd/polysemy-dict';
// Types
export type {
  EndingInfo,
  ParticleInfo,
  PatternEntry,
  Token,
  TranslationDirection,
  TranslatorDictionary,
} from './types';
