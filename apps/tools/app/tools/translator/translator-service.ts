// ========================================
// Translator Service - 번역 서비스
// 자소 기반 엔진 (core/jaso-engine.ts) 통합
// 오타 교정 파이프라인 통합
// NLP 모듈 (WSD, 연어, 주제 탐지) 통합
// ========================================

// Core engines preserved for reference but now using advanced functions
// import { translateEnToKo as coreTranslateEnToKo } from './core/en-to-ko';
// import { translateKoToEn as coreTranslateKoToEn } from './core/ko-to-en';

import {
  type ConnectiveEndingInfo,
  conjugateEnglishVerb,
  culturalExpressionList,
  culturalExpressions,
  endingList,
  endings,
  enToKoPatterns,
  enToKoSentences,
  enToKoWords,
  extractConnectiveEnding,
  irregularVerbs,
  koOnomatopoeia,
  koToEnPatterns,
  koToEnSentences,
  koToEnWords,
  matchEnIdioms,
  matchKoIdioms,
  onomatopoeiaList,
  particleList,
  particles,
  phrasalVerbList,
  phrasalVerbs,
  restoreStemFromConnective,
  selectBeVerb,
  tryDecomposeCompound,
  tryExtractContracted,
  tryExtractCopula,
} from './dictionary';
import { analyzeMorpheme, generateEnglish, parseSentence } from './grammar';
import {
  applyIrregular,
  decompose,
  getIrregularType,
  hasLastBatchim,
  isHangul,
  selectAOrEo,
} from './hangul';
import {
  disambiguate,
  extractContext,
  findCollocations,
  findVerbObjectCollocations,
  getTopDomain,
  isPolysemous,
  type WsdResult,
} from './nlp';
import type { Token, TranslationDirection } from './types';
import { type CorrectionResult, correctSpacingOnly, correctTypos } from './typo';

/**
 * 번역 옵션
 */
export interface TranslateOptions {
  /** 오타 교정 활성화 (기본: true) */
  autoCorrect?: boolean;
  /** 띄어쓰기 교정만 활성화 */
  spacingOnly?: boolean;
}

/**
 * 번역 결과 (교정 정보 포함)
 */
export interface TranslateResult {
  /** 번역 결과 */
  translated: string;
  /** 오타 교정 결과 (교정이 적용된 경우) */
  correction?: CorrectionResult;
  /** 원본 텍스트 */
  original: string;
  /** 교정된 입력 (있는 경우) */
  correctedInput?: string;
}

/**
 * 메인 번역 함수
 */
export function translate(input: string, direction: TranslationDirection): string {
  const result = translateWithCorrection(input, direction, { autoCorrect: true });
  return result.translated;
}

/**
 * 오타 교정 포함 번역 함수
 */
export function translateWithCorrection(
  input: string,
  direction: TranslationDirection,
  options: TranslateOptions = {},
): TranslateResult {
  const { autoCorrect = true, spacingOnly = false } = options;

  let textToTranslate = input;
  let correction: CorrectionResult | undefined;

  // 한→영 번역 시 오타 교정 적용
  if (direction === 'ko-en' && autoCorrect) {
    if (spacingOnly) {
      // 띄어쓰기만 교정
      textToTranslate = correctSpacingOnly(input);
    } else {
      // 전체 오타 교정
      correction = correctTypos(input);
      textToTranslate = correction.corrected;
    }
  }

  // 질문 여부 저장 (정규화 전)
  const isQuestion = /[?？]$/.test(textToTranslate.trim());
  const normalized = normalize(textToTranslate);

  if (!normalized) {
    return {
      translated: '',
      original: input,
      correctedInput: textToTranslate !== input ? textToTranslate : undefined,
      correction,
    };
  }

  // Use advanced translation engine with NLP, grammar analysis, idiom matching
  let translated =
    direction === 'ko-en'
      ? translateKoToEnAdvanced(normalized, isQuestion)
      : translateEnToKoAdvanced(normalized);

  // 질문이었으면 물음표 추가
  if (isQuestion && !translated.endsWith('?')) {
    translated = `${translated}?`;
  }

  return {
    translated,
    original: input,
    correctedInput: textToTranslate !== input ? textToTranslate : undefined,
    correction,
  };
}

/**
 * 텍스트 정규화
 */
function normalize(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?？！。]+$/, '');
}

/**
 * 과거형 변환 (불규칙 동사 지원)
 * eat → ate, go → went, play → played
 */
function getPastTense(verb: string): string {
  const lowerVerb = verb.toLowerCase();
  const irregular = irregularVerbs[lowerVerb];
  if (irregular) {
    return irregular.past;
  }

  // 규칙 동사: -ed 추가
  if (lowerVerb.endsWith('e')) {
    return `${lowerVerb}d`;
  }
  if (/[^aeiou]y$/.test(lowerVerb)) {
    return `${lowerVerb.slice(0, -1)}ied`;
  }
  // 단모음 + 단자음 → 자음 중복 + ed
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(lowerVerb)) {
    return `${lowerVerb}${lowerVerb[lowerVerb.length - 1] ?? ''}ed`;
  }
  return `${lowerVerb}ed`;
}

/**
 * 과거분사 변환 (불규칙 동사 지원)
 * eat → eaten, go → gone, play → played
 */
function getPastParticiple(verb: string): string {
  const lowerVerb = verb.toLowerCase();
  const irregular = irregularVerbs[lowerVerb];
  if (irregular) {
    return irregular.pp;
  }

  // 규칙 동사: -ed 추가
  if (lowerVerb.endsWith('e')) {
    return `${lowerVerb}d`;
  }
  if (/[^aeiou]y$/.test(lowerVerb)) {
    return `${lowerVerb.slice(0, -1)}ied`;
  }
  // 단모음 + 단자음 → 자음 중복 + ed
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(lowerVerb)) {
    return `${lowerVerb}${lowerVerb[lowerVerb.length - 1] ?? ''}ed`;
  }
  return `${lowerVerb}ed`;
}

/**
 * 한→영 번역 (고급 문법 분석 기반)
 * 문화 표현, 관용어, 패턴, NLP(WSD, 연어), 문법 분석 적용
 */
function translateKoToEnAdvanced(text: string, isQuestion: boolean = false): string {
  // 0. 문화 특수 표현 먼저 체크 (완전 일치)
  for (const expr of culturalExpressionList) {
    if (text === expr || text.replace(/\s+/g, '') === expr.replace(/\s+/g, '')) {
      const translation = culturalExpressions[expr];
      if (translation) return translation;
    }
  }

  // 1. 문장 완전 일치
  const sentence = koToEnSentences[text];
  if (sentence) {
    return sentence;
  }

  // 2. 관용어/숙어 매칭 (완전 일치)
  const idiomResult = matchKoIdioms(text);
  if (idiomResult.found && idiomResult.matched.length === 1) {
    // 입력이 관용어와 완전히 일치하면 바로 반환
    const normalized = text.replace(/\s+/g, ' ').trim();
    const matched = idiomResult.matched[0];
    if (matched && (matched.ko === normalized || matched.variants?.includes(normalized))) {
      return idiomResult.result;
    }
  }

  // 3. 패턴 매칭
  for (const pattern of koToEnPatterns) {
    // questionOnly 패턴은 질문일 때만 매칭
    if (pattern.questionOnly && !isQuestion) continue;

    const match = text.match(pattern.ko);
    if (match) {
      let result = pattern.en;
      for (let i = 1; i < match.length; i++) {
        const matchedGroup = match[i] ?? '';
        const translated = koToEnWords[matchedGroup] || matchedGroup;

        // $PP = past participle (eaten, not eated)
        if (result.includes(`$${i}PP`)) {
          const pp = getPastParticiple(translated);
          result = result.replace(`$${i}PP`, pp);
        }

        // $PAST = past tense (ate, not eated)
        if (result.includes(`$${i}PAST`)) {
          const past = getPastTense(translated);
          result = result.replace(`$${i}PAST`, past);
        }

        result = result.replace(`$${i}`, translated);
      }
      return result;
    }
  }

  // 4. 관용어가 포함된 문장 처리 (부분 매칭 후 나머지 번역)
  if (idiomResult.found) {
    return translateWithIdioms(text, idiomResult);
  }

  // 4.5. 동사-목적어 연어 체크 (NLP 우선 처리)
  // 연어가 발견되면 NLP 기반 번역 사용
  const tokens = text.split(' ');
  const verbObjectMatches = findVerbObjectCollocations(tokens);
  if (verbObjectMatches.length > 0) {
    return decomposeAndTranslateKoWithNlp(text);
  }

  // 4.6. 다의어 체크 (WSD 필요 문장은 NLP 경로로)
  // 배, 눈, 밤, 차, 말 등 다의어가 포함된 문장은 WSD 적용 필요
  if (hasPolysemousWords(tokens)) {
    return decomposeAndTranslateKoWithNlp(text);
  }

  // 4.7. 연결어미 체크 (연결어미가 있는 문장은 NLP 경로로)
  // 아서/어서, 면서, 면, 고, 니까 등 연결어미가 포함된 문장
  if (hasConnectiveEndings(tokens)) {
    return decomposeAndTranslateKoWithNlp(text);
  }

  // 5. 고급 문법 분석 기반 번역 (SOV→SVO 어순 변환, 시제, be동사, 관사)
  return translateWithGrammarAnalysis(text);
}

/**
 * 고급 문법 분석 기반 번역
 * 문장 구조 분석 → 어순 변환 → 영어 생성
 */
function translateWithGrammarAnalysis(text: string): string {
  try {
    // 1. 문장 구조 분석
    const parsed = parseSentence(text);

    // 2. 영어 문장 생성 (어순 변환 포함)
    const result = generateEnglish(parsed);

    // 결과가 원본과 같거나 너무 짧으면 기존 방식으로 fallback
    if (result === text || result.length < 2) {
      return decomposeAndTranslateKoWithNlp(text);
    }

    return result;
  } catch {
    // 오류 발생 시 기존 방식으로 fallback
    return decomposeAndTranslateKoWithNlp(text);
  }
}

/**
 * NLP 기반 한→영 번역 (연어, WSD, 주제 탐지 적용)
 */
function decomposeAndTranslateKoWithNlp(text: string): string {
  const tokens = text.split(' ');

  // 1. 주제/도메인 탐지
  const topDomain = getTopDomain(text);

  // 2. 연어 매칭 (일반 연어)
  const collocationMatches = findCollocations(tokens);

  // 연어로 처리된 토큰 인덱스 및 번역 결과 기록
  const collocationRanges = new Set<number>();
  const collocationTranslations = new Map<number, string>();

  for (const match of collocationMatches) {
    for (let i = match.startIndex; i <= match.endIndex; i++) {
      collocationRanges.add(i);
    }
    collocationTranslations.set(match.startIndex, match.collocation.en);
  }

  // 2.5. 동사-목적어 연어 매칭 (기존 연어에서 처리되지 않은 토큰들)
  const verbObjectMatches = findVerbObjectCollocations(tokens);
  for (const match of verbObjectMatches) {
    // 이미 일반 연어로 처리된 토큰은 건너뜀
    if (collocationRanges.has(match.objectIndex) || collocationRanges.has(match.verbIndex)) {
      continue;
    }
    // 동사-목적어 연어 추가
    collocationRanges.add(match.objectIndex);
    collocationRanges.add(match.verbIndex);
    collocationTranslations.set(match.objectIndex, match.en);
  }

  // 3. WSD 적용 (연어에 포함되지 않은 다의어만)
  // 조사 목록 (명사+조사인 경우 WSD 적용 건너뜀)
  const NOUN_PARTICLES_FOR_WSD = [
    '은',
    '는',
    '이',
    '가',
    '을',
    '를',
    '에',
    '에서',
    '로',
    '으로',
    '와',
    '과',
    '의',
    '도',
    '만',
  ];
  const wsdResults = new Map<number, WsdResult>();
  for (let i = 0; i < tokens.length; i++) {
    if (collocationRanges.has(i)) continue;

    const token = tokens[i];
    if (!token) continue;

    // 조사가 붙어있으면 명사이므로 WSD 적용 건너뜀
    // (다의어 동사는 어미가 붙지 조사가 붙지 않음)
    const hasNounParticle = NOUN_PARTICLES_FOR_WSD.some(
      (p) => token.endsWith(p) && token.length > p.length,
    );
    if (hasNounParticle) {
      continue;
    }

    const stem = extractStemForWsd(token);

    if (isPolysemous(stem)) {
      const context = extractContext(tokens, i, 3);
      const result = disambiguate(stem, context, topDomain);
      if (result) {
        wsdResults.set(i, result);
      }
    }
  }

  // 4. 형태소 분해 + 토큰 번역 (연어와 WSD 결과 적용)
  return translateTokensWithNlp(tokens, collocationRanges, collocationTranslations, wsdResults);
}

/**
 * 텍스트에 다의어가 포함되어 있는지 확인
 * WSD 적용이 필요한 문장을 NLP 경로로 라우팅하기 위함
 */
function hasPolysemousWords(tokens: string[]): boolean {
  // 조사 목록 (명사+조사인 경우 다의어 체크 건너뜀)
  const NOUN_PARTICLES = [
    '은',
    '는',
    '이',
    '가',
    '을',
    '를',
    '에',
    '에서',
    '로',
    '으로',
    '와',
    '과',
    '의',
    '도',
    '만',
  ];

  for (const token of tokens) {
    // 조사가 붙어있으면 명사이므로 다의어 체크 건너뜀
    // (다의어 동사는 어미가 붙지 조사가 붙지 않음)
    const hasNounParticle = NOUN_PARTICLES.some(
      (p) => token.endsWith(p) && token.length > p.length,
    );
    if (hasNounParticle) {
      continue;
    }

    const stem = extractStemForWsd(token);
    if (isPolysemous(stem)) {
      return true;
    }
  }
  return false;
}

/**
 * 텍스트에 연결어미가 포함되어 있는지 확인
 * 연결어미가 있는 문장은 NLP 경로로 라우팅
 */
function hasConnectiveEndings(tokens: string[]): boolean {
  for (const token of tokens) {
    if (extractConnectiveEnding(token)) {
      return true;
    }
  }
  return false;
}

/**
 * WSD용 어간 추출
 */
function extractStemForWsd(word: string): string {
  // 조사 제거
  const particles = [
    '을',
    '를',
    '이',
    '가',
    '은',
    '는',
    '에',
    '에서',
    '로',
    '으로',
    '와',
    '과',
    '도',
    '만',
    '의',
  ];
  for (const p of particles) {
    if (word.endsWith(p) && word.length > p.length) {
      return word.slice(0, -p.length);
    }
  }
  return word;
}

/**
 * NLP 결과를 적용한 토큰 번역
 */
function translateTokensWithNlp(
  tokens: string[],
  collocationRanges: Set<number>,
  collocationTranslations: Map<number, string>,
  wsdResults: Map<number, WsdResult>,
): string {
  const resultParts: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    // 연어 번역이 있는 경우
    if (collocationTranslations.has(i)) {
      let translation = collocationTranslations.get(i)!;

      // 동사 토큰에서 시제 및 연결어미 추출
      const verbToken = findVerbTokenInCollocation(tokens, i, collocationRanges);
      if (verbToken) {
        // 시제 적용 (형태소 분석으로 시제 확인)
        const morpheme = analyzeMorpheme(verbToken);
        if (morpheme.tense === 'past') {
          // 연어의 동사 부분을 과거형으로 변환
          // "eat rice" → "ate rice"
          translation = applyTenseToCollocation(translation, 'past');
        }

        // 연결어미 적용
        const connectiveResult = extractConnectiveEnding(verbToken);
        if (connectiveResult) {
          translation = applyConnectiveToTranslation(translation, connectiveResult.info);
        }
      }

      resultParts.push(translation);
      continue;
    }

    // 연어 범위에 포함된 토큰은 건너뜀
    if (collocationRanges.has(i)) {
      continue;
    }

    // WSD 결과가 있는 경우
    const currentToken = tokens[i];
    if (!currentToken) continue;

    if (wsdResults.has(i)) {
      const wsd = wsdResults.get(i)!;
      // 토큰에서 WSD 단어를 번역 결과로 치환
      const translated = translateSingleTokenWithWsd(currentToken, wsd);
      resultParts.push(translated);
      continue;
    }

    // 일반 형태소 분해 번역
    resultParts.push(translateSingleToken(currentToken));
  }

  // 결과 후처리 (a/an 처리, 중복 공백 제거)
  return postProcessEnglish(resultParts.join(' '));
}

/**
 * 연어에서 동사 토큰 찾기 (연결어미 추출용)
 */
function findVerbTokenInCollocation(
  tokens: string[],
  startIndex: number,
  collocationRanges: Set<number>,
): string | null {
  // 연어 범위에서 가장 마지막 토큰 찾기 (보통 동사)
  let lastIndex = startIndex;
  for (let i = startIndex; i < tokens.length; i++) {
    if (collocationRanges.has(i)) {
      lastIndex = i;
    } else {
      break;
    }
  }
  return tokens[lastIndex] ?? null;
}

/**
 * 연결어미를 번역에 적용
 */
function applyConnectiveToTranslation(translation: string, info: ConnectiveEndingInfo): string {
  if (info.position === 'before') {
    return `${info.en} ${translation}`;
  } else {
    return `${translation}, ${info.en}`;
  }
}

/**
 * 연어에 시제 적용
 * "eat rice" → "ate rice"
 */
function applyTenseToCollocation(translation: string, tense: 'past' | 'future'): string {
  // 연어의 첫 번째 단어(동사)를 시제에 맞게 변환
  const words = translation.split(' ');
  if (words.length === 0) return translation;

  const verb = words[0];
  if (!verb) return translation;

  if (tense === 'past') {
    words[0] = conjugateEnglishVerb(verb, 'past');
  } else if (tense === 'future') {
    words[0] = `will ${verb}`;
  }

  return words.join(' ');
}

/**
 * WSD 결과를 적용한 단일 토큰 번역
 */
function translateSingleTokenWithWsd(token: string, wsd: WsdResult): string {
  // 토큰에서 어간과 어미/조사 분리
  const stem = extractStemForWsd(token);
  const suffix = token.slice(stem.length);

  // WSD 영어 번역 사용
  let translated = wsd.sense.en;

  // 조사에 따른 전치사 추가
  if (suffix) {
    const prep = getPrepositionForParticle(suffix);
    if (prep) {
      translated = `${prep} ${translated}`;
    }
  }

  return translated;
}

/**
 * 단일 토큰 번역 (형태소 분해) - 고급 형태소 분석기 사용
 */
function translateSingleToken(token: string): string {
  // 0. 의성어/의태어 체크
  const onoTranslation = koOnomatopoeia[token];
  if (onoTranslation) {
    return onoTranslation;
  }
  // 의성어/의태어 부분 매칭
  for (const ono of onomatopoeiaList) {
    if (token.includes(ono)) {
      const onoMatch = koOnomatopoeia[ono];
      if (onoMatch) {
        return token.replace(ono, onoMatch);
      }
    }
  }

  // 1. 고급 형태소 분석기 사용
  const morpheme = analyzeMorpheme(token);

  // 서술어 (동사/형용사)
  if (morpheme.role === 'predicate' && morpheme.pos === 'verb') {
    const stem = morpheme.stem;
    let translated = koToEnWords[stem] || stem;

    // 시제 적용
    if (morpheme.tense === 'past') {
      translated = conjugateEnglishVerb(translated, 'past');
    }

    return translated;
  }

  // 명사+조사
  if (morpheme.particle) {
    const stem = morpheme.stem;
    let translated = koToEnWords[stem] || stem;

    // 조사에 따른 전치사 추가
    const prep = getPrepositionForParticle(morpheme.particle);
    if (prep) {
      translated = `${prep} ${translated}`;
    }

    return translated;
  }

  // 서술격 조사 확인 (fallback)
  const copulaResult = tryExtractCopula(token);
  if (copulaResult) {
    const noun = koToEnWords[copulaResult.noun] || copulaResult.noun;
    return noun;
  }

  // 축약형 어미 확인 (fallback)
  const contractedResult = tryExtractContracted(token);
  if (contractedResult) {
    let result = '';
    if (contractedResult.prefix) {
      result = koToEnWords[contractedResult.prefix] || contractedResult.prefix;
      result += ' ';
    }
    result += contractedResult.contracted.baseMeaning;
    return result;
  }

  // 연결어미 분리 (fallback)
  const connectiveResult = extractConnectiveEnding(token);
  if (connectiveResult) {
    return translateWithConnectiveEnding(
      connectiveResult.stem,
      connectiveResult.ending,
      connectiveResult.info,
    );
  }

  // 복합어 분해 (fallback)
  const compoundResult = tryDecomposeCompound(token);
  if (compoundResult) {
    if ('translation' in compoundResult) {
      return compoundResult.translation;
    }
    if ('parts' in compoundResult) {
      return compoundResult.parts.map((p) => koToEnWords[p] || p).join(' ');
    }
  }

  // 단어 그대로 번역
  return koToEnWords[morpheme.stem] || koToEnWords[token] || token;
}

/**
 * 연결어미가 있는 토큰 번역
 * @param stem 어간 (예: '고파', '먹으')
 * @param ending 연결어미 (예: '서', '며')
 * @param info 연결어미 정보
 */
function translateWithConnectiveEnding(
  stem: string,
  ending: string,
  info: ConnectiveEndingInfo,
): string {
  // 불규칙 활용 복원 시도
  const restoredStem = restoreStemFromConnective(stem, ending);

  // 어간 번역 (복원된 어간 우선, 원래 어간 fallback)
  let translatedStem = koToEnWords[restoredStem] || koToEnWords[stem] || restoredStem;

  // 동사 형태 변환 (verbForm에 따라)
  if (info.verbForm === 'gerund') {
    translatedStem = toGerund(translatedStem);
  } else if (info.verbForm === 'past') {
    translatedStem = conjugateEnglishVerb(translatedStem, 'past');
  }

  // 연결사 위치에 따라 조합
  if (info.position === 'before') {
    // "if hungry", "while eating"
    return `${info.en} ${translatedStem}`;
  } else {
    // "hungry, so", "eating and"
    return `${translatedStem}, ${info.en}`;
  }
}

/**
 * 영어 동사를 동명사(-ing) 형태로 변환
 */
function toGerund(verb: string): string {
  // 이미 ~ing로 끝나면 그대로
  if (verb.endsWith('ing')) {
    return verb;
  }

  // 불규칙 동명사
  const irregularGerunds: Record<string, string> = {
    be: 'being',
    die: 'dying',
    lie: 'lying',
    tie: 'tying',
  };

  if (irregularGerunds[verb]) {
    return irregularGerunds[verb];
  }

  // -e로 끝나면 e 제거 후 -ing
  if (verb.endsWith('e') && !verb.endsWith('ee') && !verb.endsWith('ye')) {
    return `${verb.slice(0, -1)}ing`;
  }

  // -ie로 끝나면 -ying
  if (verb.endsWith('ie')) {
    return `${verb.slice(0, -2)}ying`;
  }

  // CVC (자음+모음+자음)으로 끝나는 단음절 단어는 자음 중복
  const cvcPattern = /^[^aeiou]*[aeiou][^aeiouwxy]$/i;
  if (cvcPattern.test(verb)) {
    return `${verb + (verb[verb.length - 1] ?? '')}ing`;
  }

  // 기본: -ing 추가
  return `${verb}ing`;
}

/**
 * 조사에 따른 전치사 반환
 */
function getPrepositionForParticle(particle: string): string {
  const particlePrepositions: Record<string, string> = {
    에: 'at',
    에서: 'at',
    로: 'to',
    으로: 'to',
    에게: 'to',
    한테: 'to',
    께: 'to',
    와: 'with',
    과: 'with',
    의: 'of',
    보다: 'than',
    처럼: 'like',
    같이: 'like',
  };
  return particlePrepositions[particle] || '';
}

/**
 * 간단한 조사 분리
 */
function _tryExtractParticleSimple(word: string): { stem: string; particle: string } | null {
  for (const p of particleList) {
    if (word.endsWith(p) && word.length > p.length) {
      const stem = word.slice(0, -p.length);
      const lastChar = stem[stem.length - 1];
      if (stem && lastChar && isHangul(lastChar)) {
        return { stem, particle: p };
      }
    }
  }
  return null;
}

/**
 * 간단한 어미 분리
 */
function _tryExtractEndingSimple(word: string): { stem: string; ending: string } | null {
  for (const e of endingList) {
    if (word.endsWith(e) && word.length > e.length) {
      return { stem: word.slice(0, -e.length), ending: e };
    }
  }
  return null;
}

/**
 * 영어 후처리 (a/an, 공백 정리)
 */
function postProcessEnglish(text: string): string {
  // 중복 공백 제거
  let result = text.replace(/\s+/g, ' ').trim();

  // a/an 처리
  result = result.replace(/\ba ([aeiouAEIOU])/g, 'an $1');

  // 첫 글자 대문자
  if (result.length > 0) {
    result = (result[0] ?? '').toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * 관용어가 포함된 문장 번역
 */
function translateWithIdioms(
  text: string,
  idiomResult: { result: string; matched: { ko: string; en: string }[] },
): string {
  // 관용어를 마커로 치환
  let markedText = text;
  const markers: { marker: string; en: string }[] = [];

  for (let i = 0; i < idiomResult.matched.length; i++) {
    const idiom = idiomResult.matched[i];
    if (!idiom) continue;
    const marker = `__IDIOM_${i}__`;
    // 공백 유연 매칭
    const flexPattern = idiom.ko.replace(/\s+/g, '\\s*');
    markedText = markedText.replace(new RegExp(flexPattern), marker);
    markers.push({ marker, en: idiom.en });
  }

  // 마커 제외 부분을 형태소 분해로 번역
  const segments = markedText.split(/(__IDIOM_\d+__)/);
  const translatedSegments: string[] = [];

  for (const segment of segments) {
    if (segment.startsWith('__IDIOM_')) {
      // 마커를 영어 관용어로 치환
      const found = markers.find((m) => m.marker === segment);
      if (found) {
        translatedSegments.push(found.en);
      }
    } else if (segment.trim()) {
      // 나머지 텍스트는 형태소 분해로 번역
      translatedSegments.push(decomposeAndTranslateKo(segment.trim()));
    }
  }

  return translatedSegments.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * 영→한 번역 (고급 알고리즘)
 * 문장 매칭, 관용어, 구동사, 패턴 매칭, 문장 구조 분석 적용
 */
function translateEnToKoAdvanced(text: string): string {
  const lowerText = text.toLowerCase();

  // 1. 문장 완전 일치
  const sentence = enToKoSentences[lowerText];
  if (sentence) {
    return sentence;
  }

  // 2. 관용어/숙어 매칭
  const idiomResult = matchEnIdioms(text);
  if (idiomResult.found) {
    // 전체가 관용어면 바로 반환, 아니면 단어 번역 진행
    if (idiomResult.matched.length === 1) {
      const normalized = text.toLowerCase().trim();
      const firstMatched = idiomResult.matched[0];
      const matchedIdiom = firstMatched ? firstMatched.toLowerCase() : '';
      if (normalized === matchedIdiom) {
        return idiomResult.result;
      }
    }
    // 부분 관용어가 포함된 경우 결과 반환
    return idiomResult.result;
  }

  // 2.5. 구동사 매칭 (긴 것부터)
  let processedText = text;
  let hasPhrasalVerb = false;
  for (const pv of phrasalVerbList) {
    const pattern = new RegExp(`\\b${pv}\\b`, 'gi');
    if (pattern.test(processedText)) {
      const pvTranslation = phrasalVerbs[pv];
      if (pvTranslation) {
        processedText = processedText.replace(pattern, pvTranslation);
        hasPhrasalVerb = true;
      }
    }
  }
  if (hasPhrasalVerb) {
    // 구동사가 번역된 후 나머지 단어도 번역
    return translateEnWordsToKo(processedText);
  }

  // 3. 패턴 매칭
  for (const pattern of enToKoPatterns) {
    const match = text.match(pattern.ko);
    if (match) {
      let result = pattern.en;
      for (let i = 1; i < match.length; i++) {
        const matchedGroup = match[i] ?? '';
        const translated = enToKoWords[matchedGroup.toLowerCase()] || matchedGroup;
        result = result.replace(`$${i}`, translated);
      }
      return result;
    }
  }

  // 4. 단어별 번역 + 조사 자동 선택
  return translateEnWordsToKo(text);
}

/**
 * 한국어 형태소 분해 및 번역
 */
function decomposeAndTranslateKo(text: string): string {
  const segments = text.split(' ');
  const tokens: Token[] = [];
  let hasSubject = false;
  let hasObject = false;
  let isDescriptive = false; // 형용사/서술어 여부
  let detectedTense: 'present' | 'past' | 'future' = 'present';

  for (const segment of segments) {
    // 1. 서술격 조사 (입니다/이에요) 먼저 확인
    const copulaResult = tryExtractCopula(segment);
    if (copulaResult) {
      // 명사 번역
      const nounTranslated = koToEnWords[copulaResult.noun] || copulaResult.noun;
      tokens.push({
        text: copulaResult.noun,
        type: 'word',
        translated: nounTranslated,
      });
      tokens.push({
        text: copulaResult.copula,
        type: 'copula',
        translated: copulaResult.info.en,
        role: copulaResult.info.tense,
      });
      if (copulaResult.info.tense === 'past') {
        detectedTense = 'past';
      }
      continue;
    }

    // 2. 축약형 어미 확인 (가요, 와요, 해요 등)
    const contractedResult = tryExtractContracted(segment);
    if (contractedResult) {
      // 접두어가 있으면 먼저 처리 (예: "학교에" + "가요")
      if (contractedResult.prefix) {
        const prefixParticle = tryExtractParticle(contractedResult.prefix);
        if (prefixParticle) {
          tokens.push(prefixParticle.word);
          tokens.push(prefixParticle.particle);
        } else {
          const prefixTranslated = koToEnWords[contractedResult.prefix] || contractedResult.prefix;
          tokens.push({
            text: contractedResult.prefix,
            type: 'word',
            translated: prefixTranslated,
          });
        }
      }

      // 축약형 동사 토큰 추가
      const verbInfo = contractedResult.contracted;
      tokens.push({
        text: segment,
        type: 'stem',
        translated: verbInfo.baseMeaning,
        role: verbInfo.tense,
      });

      // 형용사 여부 기록
      if (verbInfo.isDescriptive) {
        isDescriptive = true;
      }

      // 시제 기록
      detectedTense = verbInfo.tense;
      continue;
    }

    // 3. 조사 분리 시도
    const particleResult = tryExtractParticle(segment);
    if (particleResult) {
      tokens.push(particleResult.word);
      tokens.push(particleResult.particle);
      if (particleResult.particle.role === 'topic' || particleResult.particle.role === 'subject') {
        hasSubject = true;
      }
      if (particleResult.particle.role === 'object') {
        hasObject = true;
      }
      continue;
    }

    // 4. 어미 분리 시도 (불규칙 활용 고려)
    const endingResult = tryExtractEnding(segment);
    if (endingResult) {
      tokens.push(endingResult.stem);
      tokens.push(endingResult.ending);
      if (endingResult.ending.role === 'past') {
        detectedTense = 'past';
      }
      continue;
    }

    // 5. 복합어 분해 시도
    const compoundResult = tryDecomposeCompound(segment);
    if (compoundResult) {
      if ('translation' in compoundResult) {
        // 단일 번역 (예: 한국사람 → Korean)
        tokens.push({ text: segment, type: 'word', translated: compoundResult.translation });
      } else if ('parts' in compoundResult) {
        // 분리 번역 (각 구성요소를 번역)
        for (const part of compoundResult.parts) {
          const translated = koToEnWords[part] || part;
          tokens.push({ text: part, type: 'word', translated });
        }
      }
      continue;
    }

    // 6. 단어 그대로 (복합어 분해 실패 시 전체 단어로 번역 시도)
    const translated = koToEnWords[segment] || segment;
    tokens.push({ text: segment, type: 'word', translated });
  }

  // 토큰 번역 및 조합 (SOV → SVO 어순 변환 포함)
  return translateTokens(tokens, hasSubject, hasObject, isDescriptive, detectedTense);
}

/**
 * 조사 추출 시도 (자모 분석 기반)
 */
function tryExtractParticle(word: string): { word: Token; particle: Token } | null {
  for (const p of particleList) {
    if (word.endsWith(p) && word.length > p.length) {
      const stem = word.slice(0, -p.length);

      // 빈 어간 방지
      if (!stem) continue;

      // 어간이 한글인지 확인
      const lastChar = stem[stem.length - 1];
      if (!lastChar || !isHangul(lastChar)) continue;

      const particleInfo = particles[p];
      if (!particleInfo) continue;
      return {
        word: { text: stem, type: 'word', role: particleInfo.role },
        particle: {
          text: p,
          type: 'particle',
          translated: particleInfo.en,
          role: particleInfo.role,
        },
      };
    }
  }
  return null;
}

/**
 * 어미 추출 시도 (불규칙 활용 복원 포함)
 */
function tryExtractEnding(word: string): { stem: Token; ending: Token } | null {
  for (const e of endingList) {
    if (word.endsWith(e) && word.length > e.length) {
      let stem = word.slice(0, -e.length);
      const endingInfo = endings[e];
      if (!endingInfo) continue;

      // 불규칙 활용 복원 시도
      stem = tryRestoreIrregularStem(stem, e);

      return {
        stem: { text: stem, type: 'stem' },
        ending: { text: e, type: 'ending', role: endingInfo.tense },
      };
    }
  }
  return null;
}

/**
 * 불규칙 활용 어간 복원 시도
 */
function tryRestoreIrregularStem(stem: string, _ending: string): string {
  if (!stem) return stem;

  const lastChar = stem[stem.length - 1] ?? '';
  const jamo = decompose(lastChar);
  if (!jamo) return stem;

  // 추후 불규칙 복원 로직 확장 가능
  return stem;
}

// 시간 표현 단어들
const TIME_WORDS = new Set([
  'today',
  'tomorrow',
  'yesterday',
  'now',
  'later',
  'always',
  'sometimes',
  'often',
  'never',
  'morning',
  'afternoon',
  'evening',
  'night',
]);

/**
 * 토큰 배열을 영어로 번역 (SOV → SVO 어순 변환 포함)
 */
function translateTokens(
  tokens: Token[],
  _hasSubject: boolean,
  hasObject: boolean,
  isDescriptive: boolean,
  detectedTense: 'present' | 'past' | 'future' = 'present',
): string {
  // 문장 구성요소 분리
  const subjects: string[] = [];
  const objects: string[] = [];
  const verbs: string[] = [];
  const timeExpressions: string[] = []; // 시간 표현 (문장 앞에)
  const locations: string[] = []; // 장소 표현 (문장 뒤에)
  let hasCopula = false;
  let copulaTense: string | undefined;
  let hasVerb = false;

  // 1차: 토큰 분석 및 역할별 분류
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    switch (token.type) {
      case 'word': {
        const translated = token.translated || koToEnWords[token.text] || token.text;

        // 시간 표현인지 확인
        if (TIME_WORDS.has(translated.toLowerCase())) {
          timeExpressions.push(translated);
          break;
        }

        // 역할에 따라 분류
        if (token.role === 'topic' || token.role === 'subject') {
          subjects.push(translated);
        } else if (token.role === 'object') {
          objects.push(translated);
        } else if (token.role === 'location' || token.role === 'direction') {
          // 장소/방향 표현은 locations에 추가
          locations.push(translated);
        } else {
          // 역할이 없는 단어는 subjects에 추가 (주어/보어 역할)
          subjects.push(translated);
        }
        break;
      }
      case 'stem': {
        // 동사/형용사 어간 - 시제 적용
        hasVerb = true;
        let translated = token.translated || koToEnWords[token.text] || token.text;

        // 축약형에서 온 경우 role에 시제가 있음
        const tenseToApply = token.role || detectedTense;
        if (tenseToApply === 'past') {
          translated = applyEnglishTense(translated, 'past');
        }

        verbs.push(translated);
        break;
      }
      case 'particle': {
        // 조사의 영어 표현 (at, to 등)은 이전 단어와 함께
        if (token.translated?.trim()) {
          // 장소/방향 조사 처리
          if (token.role === 'location' || token.role === 'direction') {
            // locations의 마지막 항목에 조사 추가
            const lastIndex = locations.length - 1;
            if (lastIndex >= 0 && locations[lastIndex]) {
              locations[lastIndex] = `${token.translated} ${locations[lastIndex]}`;
            }
          }
        }
        break;
      }
      case 'copula': {
        hasCopula = true;
        copulaTense = token.role;
        break;
      }
      case 'ending': {
        // 어미로 시제 적용
        const lastVerbIndex = verbs.length - 1;
        if (token.role && lastVerbIndex >= 0 && verbs[lastVerbIndex]) {
          verbs[lastVerbIndex] = applyEnglishTense(verbs[lastVerbIndex], token.role);
          hasVerb = true;
        }
        break;
      }
    }
  }

  // 2차: SVO 어순으로 재구성
  const result: string[] = [];

  // 시간 표현은 문장 앞에
  result.push(...timeExpressions);

  // 주어가 없으면 'I' 추가 (동사가 있는 경우)
  if (subjects.length === 0 && !hasCopula && hasVerb) {
    if (!isDescriptive || hasObject) {
      subjects.push('I');
    }
  }

  // 서술격 조사가 있으면 be 동사 처리
  if (hasCopula) {
    // 주어가 없으면 'I' 추가
    if (subjects.length === 0) {
      subjects.push('I');
    }

    // subjects에서 주어만 분리 (첫 번째가 주어, 나머지는 보어)
    const mainSubject = subjects[0] || 'I';
    const complements = subjects.slice(1);

    // be 동사 선택
    const beVerb = selectBeVerb(mainSubject, copulaTense === 'past' ? 'past' : 'present');

    // 주어 + be동사 + 보어 순으로 재구성
    result.push(mainSubject);
    result.push(beVerb);
    result.push(...complements);
    result.push(...verbs);
    result.push(...objects);
    result.push(...locations);
  } else {
    // 일반 문장: SVO 어순
    result.push(...subjects);
    result.push(...verbs);
    result.push(...objects);
    result.push(...locations);
  }

  return result.join(' ').trim();
}

/**
 * 영어 동사에 시제 적용 (불규칙 동사 지원)
 */
function applyEnglishTense(verb: string, tense: string): string {
  switch (tense) {
    case 'past':
      return conjugateEnglishVerb(verb, 'past');
    case 'future':
      return conjugateEnglishVerb(verb, 'future');
    default:
      return verb;
  }
}

/**
 * 영어 단어들을 한국어로 번역 (문장 구조 분석 포함)
 */
function translateEnWordsToKo(text: string): string {
  // 문장 구조 패턴 매칭 (관계대명사, 가정법, 수동태 등)
  let result = text;

  // 1. 수동태 패턴: "was/were + PP + by + noun"
  const passiveByPattern =
    /\b(was|were|is|are|has been|have been)\s+(\w+)\s+by\s+(?:the\s+)?(\w+)/gi;
  result = result.replace(passiveByPattern, (_, __, verb, agent) => {
    const agentKo = enToKoWords[agent.toLowerCase()] || agent;
    const verbKo = enToKoWords[verb.toLowerCase()] || verb;
    return `${agentKo}이/가 ${verbKo}`;
  });

  // 2. 수동태 패턴 (agent 없음): "has been postponed"
  const passivePattern = /\b(has been|have been|was|were|is|are)\s+(\w+ed)\b/gi;
  result = result.replace(passivePattern, (_, __, verb) => {
    const verbBase = verb.replace(/ed$/, '').replace(/ied$/, 'y');
    const verbKo = enToKoWords[verbBase.toLowerCase()] || enToKoWords[verb.toLowerCase()] || verb;
    return `${verbKo}되었다`;
  });

  // 3. 관계대명사 패턴: "The N who/that V" → "V하는 N"
  const relativeWhoPattern =
    /\b(?:the\s+)?(\w+)\s+who\s+(?:is\s+)?(\w+(?:ing)?)\s+(?:there\s+)?(?:is\s+)?(?:my\s+)?(\w+)/gi;
  result = result.replace(relativeWhoPattern, (_, noun, verb, complement) => {
    const nounKo = enToKoWords[noun.toLowerCase()] || noun;
    const verbKo = enToKoWords[verb.toLowerCase()] || verb;
    const complementKo = enToKoWords[complement.toLowerCase()] || complement;
    // "저기 서 있는 남자가 우리 아버지야" 형태로
    return `${verbKo} ${nounKo}가 ${complementKo}`;
  });

  // 4. 관계대명사 that 패턴: "The N that I V" → "내가 V한 N"
  const relativeThatPattern = /\b(?:the\s+)?(\w+)\s+that\s+I\s+(\w+)\s+(\w+)/gi;
  result = result.replace(relativeThatPattern, (_, noun, verb, time) => {
    const nounKo = enToKoWords[noun.toLowerCase()] || noun;
    const verbKo = enToKoWords[verb.toLowerCase()] || verb;
    const timeKo = enToKoWords[time.toLowerCase()] || time;
    return `${timeKo} 내가 ${verbKo} ${nounKo}`;
  });

  // 5. 가정법 패턴: "If I were you, I would V"
  const conditionalPattern = /\bif\s+I\s+were\s+you,?\s+I\s+would\s+(\w+)\b/gi;
  result = result.replace(conditionalPattern, (_, verb) => {
    const verbKo = enToKoWords[verb.toLowerCase()] || verb;
    return `내가 너라면 ${verbKo}할 거야`;
  });

  // 6. I wish I could 패턴
  const wishPattern = /\bI\s+wish\s+I\s+could\s+(\w+)\s+(\w+)\s*(\w*)/gi;
  result = result.replace(wishPattern, (_, verb, obj, adv) => {
    const verbKo = enToKoWords[verb.toLowerCase()] || verb;
    const objKo = enToKoWords[obj.toLowerCase()] || obj;
    const advKo = adv ? enToKoWords[adv.toLowerCase()] || adv : '';
    return `${objKo}를 ${advKo} ${verbKo}할 수 있으면 좋겠어`;
  });

  // 7. 기본 단어별 번역 (나머지)
  const words = result.split(/\s+/);
  const translatedWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    const lowerWord = word.toLowerCase().replace(/[.,!?]/g, '');

    // 이미 한국어로 번역된 부분은 그대로 유지
    if (/[\uAC00-\uD7AF]/.test(word)) {
      translatedWords.push(word);
      continue;
    }

    const translated = enToKoWords[lowerWord];
    if (translated !== undefined) {
      // 빈 문자열인 경우 (관사 등) 생략
      if (translated === '') continue;
      translatedWords.push(translated);
    } else {
      translatedWords.push(word);
    }
  }

  return translatedWords.join(' ').replace(/\s+/g, ' ').trim();
}

// ========================================
// 조사 자동 선택 유틸리티 (export)
// ========================================

/**
 * 받침에 따른 조사 자동 선택
 * @param word 단어
 * @param type 조사 종류
 */
export function selectParticle(word: string, type: 'subject' | 'object' | 'topic'): string {
  const hasBatchim = hasLastBatchim(word);

  switch (type) {
    case 'subject':
      return hasBatchim ? '이' : '가';
    case 'object':
      return hasBatchim ? '을' : '를';
    case 'topic':
      return hasBatchim ? '은' : '는';
    default:
      return '';
  }
}

/**
 * 단어에 적절한 조사 붙이기
 */
export function attachParticle(word: string, type: 'subject' | 'object' | 'topic'): string {
  return word + selectParticle(word, type);
}

/**
 * 동사 어간에 어미 붙이기 (불규칙 활용 적용)
 * @param stem 어간 (예: '듣', '돕')
 * @param ending 어미 (예: '어요', '았어요')
 */
export function conjugate(stem: string, ending: string): string {
  const irregularType = getIrregularType(stem);

  if (irregularType) {
    return applyIrregular(stem, ending);
  }

  // 정규 활용
  return stem + ending;
}

/**
 * 아/어 선택하여 어미 붙이기
 * @param stem 어간
 * @param suffix 어미 (아/어 제외한 부분, 예: '요', '서')
 */
export function conjugateWithVowelHarmony(stem: string, suffix: string): string {
  const vowel = selectAOrEo(stem);
  const ending = vowel === 'ㅏ' ? `아${suffix}` : `어${suffix}`;

  return conjugate(stem, ending);
}
