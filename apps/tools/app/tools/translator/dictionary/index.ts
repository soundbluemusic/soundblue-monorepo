// ========================================
// Dictionary Index - 사전 통합 export
// ========================================

// 복합어 분석
export {
  compoundWords,
  isCompoundWord,
  prefixPatterns,
  suffixPatterns,
  tryDecomposeCompound,
} from './compound-words';
// 연결어미 (아서, 면서, 고 등)
export {
  type ConnectiveEndingInfo,
  connectiveEndingList,
  connectiveEndings,
  extractConnectiveEnding,
  restoreStemFromConnective,
} from './connective-endings';
// 축약형 어미 (가요, 와요, 해요 등)
export {
  type ContractedEndingInfo,
  contractedFormList,
  contractedForms,
  tryExtractContracted,
} from './contracted-endings';
// 서술격 조사 (이다/아니다)
export {
  type CopulaInfo,
  copulaList,
  copulas,
  selectBeVerb,
  tryExtractCopula,
} from './copulas';
// 문화 특수 표현
export {
  culturalExpressionList,
  culturalExpressions,
  translateCultural,
} from './cultural';
// 영어 불규칙 동사
export {
  conjugateEnglishVerb,
  irregularVerbs,
  type VerbForms,
} from './english-verbs';
export { i18nEnToKoSentences, i18nKoToEnSentences } from './i18n-sentences';
// i18n 자동 생성 사전
export { i18nEnToKo, i18nKoToEn } from './i18n-words';
// 관용어/숙어
export {
  enToKoIdioms,
  getIdiomsByCategory,
  type IdiomCategory,
  type IdiomEntry,
  idioms,
  lookupKoIdiom,
  matchEnIdioms,
  matchKoIdioms,
} from './idioms';
export { endingList, endings, particleList, particles } from './morphemes';
// 의성어/의태어
export {
  koOnomatopoeia,
  mimetics,
  onomatopoeia,
  onomatopoeiaList,
  translateOnomatopoeia,
} from './onomatopoeia';
export { enToKoPatterns, koToEnPatterns } from './patterns';
// 구동사 (영→한)
export {
  phrasalVerbList,
  phrasalVerbs,
  translatePhrasalVerbs,
} from './phrasal-verbs';
// 통합 사전 (i18n + 수동 사전)
export { enToKoSentences, koToEnSentences } from './sentences';
export { enToKoWords, koToEnWords } from './words';
