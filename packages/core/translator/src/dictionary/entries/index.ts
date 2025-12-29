// ========================================
// Dictionary Index - 사전 통합 export
// ========================================

// === Morphology (형태소 관련) ===
// 연결어미 (아서, 면서, 고 등)
export {
  type ConnectiveEndingInfo,
  connectiveEndingList,
  connectiveEndings,
  extractConnectiveEnding,
  restoreStemFromConnective,
} from '../morphology/korean-connective';
// 축약형 어미 (가요, 와요, 해요 등)
export {
  type ContractedEndingInfo,
  contractedFormList,
  contractedForms,
  tryExtractContracted,
} from '../morphology/korean-contracted';
// 서술격 조사 (이다/아니다)
export {
  type CopulaInfo,
  copulaList,
  copulas,
  selectBeVerb,
  tryExtractCopula,
} from '../morphology/korean-copulas';
// 형태소 (조사/어미)
export { endingList, endings, particleList, particles } from '../morphology/korean-morphemes';
// 패턴 사전
export { enToKoPatterns, koToEnPatterns } from '../morphology/patterns';
// 복합어 분석
export {
  compoundWords,
  isCompoundWord,
  prefixPatterns,
  suffixPatterns,
  tryDecomposeCompound,
} from './compound-words';
// === Other Dictionaries ===
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
// 의성어/의태어
export {
  koOnomatopoeia,
  mimetics,
  onomatopoeia,
  onomatopoeiaList,
  translateOnomatopoeia,
} from './onomatopoeia';
// 구동사 (영→한)
export {
  phrasalVerbList,
  phrasalVerbs,
  translatePhrasalVerbs,
} from './phrasal-verbs';
// 통합 사전 (i18n + 수동 사전)
export { enToKoSentences, koToEnSentences } from './sentences';
export { enToKoWords, koToEnWords } from './words';
