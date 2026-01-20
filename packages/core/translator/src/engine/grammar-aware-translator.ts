// ========================================
// Grammar-Aware Translator - 문법 인식 번역기
// 9품사 + 7문장성분 + 5문장종류를 번역 파이프라인에 통합
// ========================================
//
// 이 모듈은 morpheme-analyzer와 sentence-parser의 분석 결과를
// 실제 번역에 활용합니다.
//

import {
  DETERMINER_TRANSLATIONS,
  INTERJECTION_TRANSLATIONS,
  type MorphemeAnalysis,
  NUMERAL_TRANSLATIONS,
} from '../analysis/syntax/morpheme-analyzer';
import {
  type Constituent,
  type ParsedSentence,
  parseSentence,
  type SentenceType,
} from '../analysis/syntax/sentence-parser';
import { translateStemKoToEn } from '../dictionary/entries/stems';
import { koToEnWords } from '../dictionary/entries/words';

// ========================================
// 타입 정의
// ========================================

export interface TranslationResult {
  original: string;
  translated: string;
  sentenceType: SentenceType;
  constituents: {
    subject?: string;
    verb?: string;
    object?: string;
    adverbials: string[];
    independents: string[];
  };
  debug?: {
    parsed: ParsedSentence;
  };
}

// ========================================
// 9품사별 번역 함수
// ========================================

/**
 * 품사별 단어 번역
 */
export function translateByPartOfSpeech(analysis: MorphemeAnalysis): string {
  const { stem, pos, original } = analysis;

  switch (pos) {
    // 1. 감탄사 (interjection) - 독립어로 처리
    case 'interjection':
      return INTERJECTION_TRANSLATIONS[stem] || INTERJECTION_TRANSLATIONS[original] || stem;

    // 2. 수사 (number/numeral)
    case 'number':
      return NUMERAL_TRANSLATIONS[stem] || stem;

    // 3. 관형사 (determiner)
    case 'determiner':
      return DETERMINER_TRANSLATIONS[stem] || stem;

    // 4. 대명사 (pronoun)
    case 'pronoun':
      return translatePronoun(stem);

    // 5. 부사 (adverb)
    case 'adverb':
      return koToEnWords[stem] || stem;

    // 6. 명사 (noun)
    case 'noun':
      return koToEnWords[stem] || stem;

    // 7. 동사/형용사 (verb/adjective) - 어간 번역
    case 'verb':
    case 'adjective':
      return translateStemKoToEn(stem) || koToEnWords[stem] || stem;

    default:
      return koToEnWords[stem] || stem;
  }
}

/**
 * 대명사 번역
 */
function translatePronoun(stem: string): string {
  const pronounMap: Record<string, string> = {
    나: 'I',
    저: 'I',
    너: 'you',
    당신: 'you',
    그: 'he',
    그녀: 'she',
    우리: 'we',
    저희: 'we',
    너희: 'you',
    그들: 'they',
    이것: 'this',
    그것: 'that',
    저것: 'that',
    걔: 'he/she',
    쟤: 'he/she',
    얘: 'he/she',
  };
  return pronounMap[stem] || stem;
}

// ========================================
// 7문장성분별 어순 변환
// ========================================

/**
 * 문장 성분을 영어 어순(SVO)으로 재배열
 */
export function rearrangeByConstituents(parsed: ParsedSentence): string[] {
  const parts: string[] = [];

  // 1. 독립어 (감탄사) - 문두에 배치
  for (const ind of parsed.independents) {
    const translated = translateConstituent(ind);
    if (translated) {
      parts.push(translated + (parsed.independents.length > 1 ? ',' : '!'));
    }
  }

  // 2. 시간/장소 부사어 (일부) - 문두에 배치 가능
  const frontAdverbials: string[] = [];
  const backAdverbials: string[] = [];

  for (const adv of parsed.adverbials) {
    const translated = translateConstituent(adv);
    if (translated) {
      // 시간 부사는 문두에
      const isTimeAdverb = isTimeExpression(adv);
      if (isTimeAdverb) {
        frontAdverbials.push(translated);
      } else {
        backAdverbials.push(translated);
      }
    }
  }

  // 3. 문두 부사어
  if (frontAdverbials.length > 0) {
    parts.push(...frontAdverbials);
  }

  // 4. 주어 (Subject)
  if (parsed.subject) {
    const subject = translateConstituent(parsed.subject);
    if (subject) {
      parts.push(subject);
    }
  } else if (parsed.subjectOmitted) {
    // 한국어 주어 생략 시 기본 주어 추가
    parts.push('I'); // 또는 문맥에 따라 결정
  }

  // 5. 서술어 (Verb) - 동사/형용사
  if (parsed.predicate) {
    const verb = translatePredicate(parsed.predicate, parsed);
    if (verb) {
      parts.push(verb);
    }
  }

  // 6. 목적어 (Object)
  if (parsed.object) {
    const obj = translateConstituent(parsed.object);
    if (obj) {
      parts.push(obj);
    }
  }

  // 7. 후치 부사어 (장소, 방향 등)
  if (backAdverbials.length > 0) {
    parts.push(...backAdverbials);
  }

  return parts;
}

/**
 * 시간 표현인지 확인
 */
function isTimeExpression(constituent: Constituent): boolean {
  const timeWords = new Set([
    '어제',
    '오늘',
    '내일',
    '지금',
    '아까',
    '방금',
    '항상',
    '늘',
    '자주',
    '가끔',
    '매일',
    '일찍',
    '늦게',
  ]);

  for (const token of constituent.tokens) {
    if (timeWords.has(token.stem)) {
      return true;
    }
  }
  return false;
}

/**
 * 문장 성분 번역
 */
function translateConstituent(constituent: Constituent): string {
  const translatedTokens: string[] = [];

  for (const token of constituent.tokens) {
    const translated = translateByPartOfSpeech(token);
    if (translated && translated !== token.stem) {
      translatedTokens.push(translated);
    } else {
      // 사전에 없으면 원본 사용
      translatedTokens.push(translated || token.stem);
    }
  }

  return translatedTokens.join(' ');
}

/**
 * 서술어 번역 (시제, 부정, 의문 처리)
 */
function translatePredicate(predicate: Constituent, parsed: ParsedSentence): string {
  const token = predicate.tokens[0];
  if (!token) return '';

  // 어간 번역
  let verb = translateByPartOfSpeech(token);

  // 형용사인 경우 be 동사 추가
  if (token.pos === 'adjective') {
    verb = `${conjugateBeVerb(parsed.tense)} ${verb}`;
  } else if (token.pos === 'verb') {
    // 동사 시제 활용
    verb = conjugateVerb(verb, parsed.tense);
  }

  // 부정 처리
  if (parsed.isNegative) {
    const base = getVerbBase(verb);
    if (parsed.negationType === 'could_not') {
      verb = `couldn't ${base}`;
    } else {
      verb = `didn't ${base}`;
    }
  }

  return verb;
}

/**
 * be 동사 활용
 */
function conjugateBeVerb(tense: string): string {
  switch (tense) {
    case 'past':
      return 'was';
    case 'future':
      return 'will be';
    case 'progressive':
      return 'is being';
    default:
      return 'is';
  }
}

/**
 * 동사 시제 활용
 */
function conjugateVerb(verb: string, tense: string): string {
  // 불규칙 과거형
  const irregularPast: Record<string, string> = {
    go: 'went',
    eat: 'ate',
    see: 'saw',
    come: 'came',
    take: 'took',
    make: 'made',
    get: 'got',
    give: 'gave',
    know: 'knew',
    think: 'thought',
    find: 'found',
    say: 'said',
    tell: 'told',
    feel: 'felt',
    leave: 'left',
    meet: 'met',
    sit: 'sat',
    stand: 'stood',
    hear: 'heard',
    run: 'ran',
    write: 'wrote',
    read: 'read',
    speak: 'spoke',
    break: 'broke',
    buy: 'bought',
    bring: 'brought',
    sleep: 'slept',
    win: 'won',
    lose: 'lost',
    send: 'sent',
    spend: 'spent',
    build: 'built',
  };

  switch (tense) {
    case 'past':
      return irregularPast[verb] || (verb.endsWith('e') ? `${verb}d` : `${verb}ed`);
    case 'future':
      return `will ${verb}`;
    case 'progressive':
      return `is ${verb.endsWith('e') ? `${verb.slice(0, -1)}ing` : `${verb}ing`}`;
    default:
      return verb;
  }
}

/**
 * 동사 원형 추출
 */
function getVerbBase(verb: string): string {
  // "will X", "is Xing" 등에서 원형 추출
  if (verb.startsWith('will ')) {
    return verb.slice(5);
  }
  if (verb.startsWith('is ')) {
    const rest = verb.slice(3);
    if (rest.endsWith('ing')) {
      return rest.slice(0, -3) + (rest.endsWith('ing') ? '' : 'e');
    }
    return rest;
  }
  return verb;
}

// ========================================
// 5문장종류별 생성
// ========================================

/**
 * 문장 종류에 따른 최종 문장 생성
 */
export function generateBySentenceType(
  parts: string[],
  sentenceType: SentenceType,
  parsed: ParsedSentence,
): string {
  let sentence = parts.filter((p) => p.trim()).join(' ');

  switch (sentenceType) {
    // 1. 평서문 (declarative)
    case 'declarative':
      sentence = `${capitalizeFirst(sentence)}.`;
      break;

    // 2. 의문문 (interrogative)
    case 'interrogative':
      sentence = convertToQuestion(parts, parsed);
      break;

    // 3. 명령문 (imperative)
    case 'imperative':
      sentence = convertToImperative(parts);
      break;

    // 4. 청유문 (cohortative)
    case 'cohortative':
      sentence = convertToCohortative(parts);
      break;

    // 5. 감탄문 (exclamatory)
    case 'exclamatory':
      sentence = `${capitalizeFirst(sentence)}!`;
      break;
  }

  return sentence;
}

/**
 * 의문문 생성
 */
function convertToQuestion(parts: string[], parsed: ParsedSentence): string {
  // 의문사가 있으면 그대로 유지
  const questionWords = ['what', 'where', 'when', 'who', 'why', 'how'];
  const hasQuestionWord = parts.some((p) => questionWords.includes(p.toLowerCase()));

  if (hasQuestionWord) {
    return `${capitalizeFirst(parts.join(' '))}?`;
  }

  // 일반 Yes/No 의문문: Do/Does/Did + S + V?
  const subject = parsed.subject ? translateConstituent(parsed.subject) : 'you';
  const verb = parsed.predicate ? translateByPartOfSpeech(parsed.predicate.tokens[0]!) : '';

  if (parsed.tense === 'past') {
    return `Did ${subject.toLowerCase()} ${verb}?`;
  }
  return `Do ${subject.toLowerCase()} ${verb}?`;
}

/**
 * 명령문 생성
 */
function convertToImperative(parts: string[]): string {
  // 주어 제거하고 동사로 시작
  const filtered = parts.filter((p) => !['I', 'you', 'we', 'they', 'he', 'she'].includes(p));
  return `${capitalizeFirst(filtered.join(' '))}.`;
}

/**
 * 청유문 생성
 */
function convertToCohortative(parts: string[]): string {
  const filtered = parts.filter((p) => !['I', 'we'].includes(p));
  return `Let's ${filtered.join(' ')}.`;
}

/**
 * 첫 글자 대문자
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// 메인 번역 함수
// ========================================

/**
 * 문법 인식 한→영 번역
 *
 * 1. 문장 파싱 (parseSentence) - 9품사/7성분/5종류 분석
 * 2. 문장 성분별 번역 (translateByPartOfSpeech)
 * 3. 영어 어순 재배열 (rearrangeByConstituents)
 * 4. 문장 종류별 생성 (generateBySentenceType)
 */
export function translateKoToEnGrammarAware(text: string): TranslationResult {
  // 1. 문장 파싱
  const parsed = parseSentence(text);

  // 2. 어순 재배열 및 번역
  const parts = rearrangeByConstituents(parsed);

  // 3. 문장 종류별 최종 생성
  const translated = generateBySentenceType(parts, parsed.sentenceType, parsed);

  return {
    original: text,
    translated,
    sentenceType: parsed.sentenceType,
    constituents: {
      subject: parsed.subject ? translateConstituent(parsed.subject) : undefined,
      verb: parsed.predicate ? translateConstituent(parsed.predicate) : undefined,
      object: parsed.object ? translateConstituent(parsed.object) : undefined,
      adverbials: parsed.adverbials.map(translateConstituent),
      independents: parsed.independents.map(translateConstituent),
    },
    debug: { parsed },
  };
}
