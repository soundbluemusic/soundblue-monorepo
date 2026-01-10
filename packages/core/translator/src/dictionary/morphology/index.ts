// ========================================
// Morphology Index - 형태소 관련 모듈 통합 export
// ========================================

// English Prefixes - 영어 접두사
export * from './english-prefixes';
// English Suffixes - 영어 접미사
export * from './english-suffixes';
// Korean Adverb Suffix - 부사화 접미사 규칙 (맞춤법 51항)
export {
  ADVERB_DICTIONARY,
  ADVERB_TRANSLATIONS,
  type AdverbSuffixType,
  createAdverb,
  extractStemFromAdverb,
  getAdverbSuffix,
  isValidAdverbSuffix,
} from './korean-adverb-suffix';
// Connective Endings - 연결어미
export {
  type ConnectiveEndingInfo,
  connectiveEndingList,
  connectiveEndings,
  extractConnectiveEnding,
  restoreStemFromConnective,
} from './korean-connective';
// Contracted Endings - 축약형 어미
export {
  type ContractedEndingInfo,
  contractedFormList,
  contractedForms,
  tryExtractContracted,
} from './korean-contracted';
// Copulas - 서술격 조사 (이다/아니다)
export {
  type CopulaInfo,
  copulaList,
  copulas,
  selectBeVerb,
  tryExtractCopula,
} from './korean-copulas';
// Korean Endings - 한글 어미 패턴
export { ENDINGS, type EndingPattern } from './korean-endings';
// Korean Morphemes - 형태소 (조사/어미)
export { endingList, endings, particleList, particles } from './korean-morphemes';
// Patterns - 패턴 사전
export { enToKoPatterns, koToEnPatterns } from './patterns';
