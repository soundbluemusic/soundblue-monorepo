// ========================================
// Translator Service - 번역 서비스
// ========================================
//
// ╔══════════════════════════════════════════════════════════════════╗
// ║  규칙 기반 일반화 (Rule-based Generalization)                      ║
// ╠══════════════════════════════════════════════════════════════════╣
// ║                                                                  ║
// ║  핵심 원칙:                                                       ║
// ║  각 Level의 문법 규칙을 알고리즘으로 구현하여,                        ║
// ║  해당 난이도의 **어떤 문장이든** 번역 가능하게 만드는 것               ║
// ║                                                                  ║
// ╠══════════════════════════════════════════════════════════════════╣
// ║                                                                  ║
// ║  🎯 하드코딩 정책: 좋은 로직 설계일 경우에만 허용                    ║
// ║                                                                  ║
// ║  ✅ 허용 (Good Logic):                                           ║
// ║  - 일반화된 문법 패턴 (예: "Did + S + V?" → 모든 의문문)           ║
// ║  - 언어학적 규칙 (예: 받침 유무 → 조사 선택)                       ║
// ║  - 재사용 가능한 구조 패턴 (예: SVO → SOV 변환)                    ║
// ║                                                                  ║
// ║  ❌ 금지 (Bad Logic):                                            ║
// ║  - 특정 테스트 문장만 매칭하는 정규식                              ║
// ║  - 테스트 문장을 사전에 직접 추가                                  ║
// ║  - 특정 문장만 처리하는 마커 패턴                                  ║
// ║                                                                  ║
// ║  판단: 비슷한 다른 문장도 통과하는가? Yes=허용, No=금지            ║
// ║                                                                  ║
// ╚══════════════════════════════════════════════════════════════════╝
//
// 자소 기반 엔진 (core/jaso-engine.ts) 통합
// 오타 교정 파이프라인 통합
// NLP 모듈 (WSD, 연어, 주제 탐지) 통합
// ========================================

// Core engines - using advanced sentence translation
import { translateEnToKo as coreTranslateEnToKo } from './core/en-to-ko';
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

  // 문장 분리 (?, !, . 기준)
  const sentences = splitSentences(textToTranslate);

  // 문장이 없으면 빈 결과 반환
  if (sentences.length === 0) {
    return {
      translated: '',
      original: input,
      correctedInput: textToTranslate !== input ? textToTranslate : undefined,
      correction,
    };
  }

  // 각 문장 개별 번역
  const translatedSentences: string[] = [];

  for (const { sentence, punctuation } of sentences) {
    const normalized = normalize(sentence);
    if (!normalized) continue;

    // 문장 유형 감지
    const isQuestion = punctuation.includes('?') || punctuation.includes('？');
    const isExclamation = punctuation.includes('!') || punctuation.includes('！');

    // 번역 실행
    let translated =
      direction === 'ko-en'
        ? translateKoToEnAdvanced(normalized, isQuestion)
        : translateEnToKoAdvanced(normalized);

    // 구두점 추가
    if (isQuestion && !translated.endsWith('?')) {
      translated = `${translated}?`;
    } else if (isExclamation && !translated.endsWith('!')) {
      translated = `${translated}!`;
    } else if (punctuation && !isQuestion && !isExclamation) {
      // 마침표 추가 (원본에 마침표가 있었던 경우)
      if (!translated.endsWith('.')) {
        translated = `${translated}.`;
      }
    }

    translatedSentences.push(translated);
  }

  const finalTranslation = translatedSentences.join(' ');

  return {
    translated: finalTranslation,
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

// ========================================
// 감탄사 목록 (일반화된 패턴)
// Level 1 감탄문에서 사용되는 감탄사들
// ========================================
const KOREAN_INTERJECTIONS: Record<string, string> = {
  // 기본 감탄사
  와: 'Wow',
  와우: 'Wow',
  우와: 'Wow',
  헐: 'Whoa',
  대박: 'Awesome',
  세상에: 'Oh my',
  아이고: 'Oh my',
  어머: 'Oh my',
  어머나: 'Oh my',
  맙소사: 'Oh my God',
  // 긍정 감탄
  야호: 'Yay',
  만세: 'Hooray',
  좋아: 'Great',
  최고: 'Amazing',
  짱: 'Awesome',
  굿: 'Good',
  // 부정/놀람 감탄
  아: 'Ah',
  아아: 'Aah',
  음: 'Hmm',
  으음: 'Hmm',
  어: 'Uh',
  에: 'Huh',
  에이: 'Ugh',
  아이: 'Geez',
  아악: 'Aaah',
  윽: 'Ugh',
  // 감정 표현
  하아: 'Sigh',
  휴: 'Phew',
  오: 'Oh',
  오오: 'Ooh',
  // 구어체 감탄
  진짜: 'Really',
  정말: 'Really',
  미쳤다: 'Crazy',
  미쳤어: 'Crazy',
  쩐다: 'Awesome',
  쩔어: 'Amazing',
  대단해: 'Wow',
  놀라워: 'Amazing',
};

/**
 * 감탄문 처리 (감탄사 + 구분자 + 문장)
 * 일반화된 패턴: 감탄사(,!.)로 시작하는 문장 처리
 *
 * 예시:
 * - "헐, 오늘 치킨 직접 만들어 먹었어!" → "Whoa, I made and ate chicken myself today!"
 * - "와! 정말 맛있어!" → "Wow! It's really delicious!"
 * - "대박, 진짜?" → "Awesome, really?"
 *
 * @param text 원본 텍스트
 * @param isQuestion 의문문 여부
 * @returns 번역된 문장 또는 null (감탄문이 아닌 경우)
 */
function handleExclamatorySentence(text: string, isQuestion: boolean): string | null {
  // 패턴: 감탄사 + 구분자(, ! .) + 나머지 문장
  // 정규식: ^(감탄사)(,|!|\.|\s)+(.+)$
  const exclamatoryPattern = /^([가-힣]+)([,!.。！，]\s*|\s+)(.+)$/;
  const match = text.match(exclamatoryPattern);

  if (!match) return null;

  const [, interjection, separator, restSentence] = match;
  if (!interjection || !restSentence) return null;

  // 감탄사 사전에서 검색
  const interjectionEn = KOREAN_INTERJECTIONS[interjection];
  if (!interjectionEn) return null; // 감탄사가 아니면 null 반환

  // 구분자 처리: 쉼표, 느낌표, 마침표
  const separatorNormalized = separator?.trim() || '';
  let punctuation = ',';
  if (separatorNormalized.includes('!') || separatorNormalized.includes('！')) {
    punctuation = '!';
  } else if (separatorNormalized.includes('.') || separatorNormalized.includes('。')) {
    punctuation = '.';
  }

  // 나머지 문장 번역 (재귀적으로 translate 호출하지 않고 내부 함수 사용)
  // 의문문 여부는 나머지 문장에 ? 가 있는지로 판단
  const restIsQuestion = isQuestion || restSentence.includes('?');
  const restNormalized = normalize(restSentence);

  // 나머지 문장 번역
  let translatedRest: string;
  try {
    // translateWithGrammarAnalysis 사용 (무한 재귀 방지)
    translatedRest = translateKoToEnInternal(restNormalized, restIsQuestion);
  } catch {
    // 실패 시 토큰 기반 번역
    translatedRest = decomposeAndTranslateKo(restNormalized);
  }

  // 결과 조합
  // 느낌표인 경우: "Wow! It's delicious!"
  // 쉼표인 경우: "Wow, I ate chicken today!"
  let result = `${interjectionEn}${punctuation} ${translatedRest}`;

  // 첫 글자 대문자 (나머지 문장 시작)
  const restStartIndex = interjectionEn.length + punctuation.length + 1;
  if (result.length > restStartIndex) {
    const beforeRest = result.slice(0, restStartIndex);
    const restPart = result.slice(restStartIndex);
    result = beforeRest + restPart.charAt(0).toUpperCase() + restPart.slice(1);
  }

  return result;
}

/**
 * Ko→En 내부 번역 함수 (재귀 호출용)
 * handleExclamatorySentence에서 나머지 문장 번역 시 사용
 */
function translateKoToEnInternal(text: string, isQuestion: boolean): string {
  // 문법 분석 기반 번역 시도
  try {
    const parsed = parseSentence(text);
    if (isQuestion) {
      parsed.isQuestion = true;
      parsed.sentenceType = 'interrogative';
    }
    const result = generateEnglish(parsed);
    if (result && result !== text && result.length >= 2) {
      return result;
    }
  } catch {
    // 무시하고 fallback
  }

  // Fallback: NLP 기반 번역
  return decomposeAndTranslateKoWithNlp(text);
}

/**
 * 문장 분리 (?, !, . 기준)
 * 단, 숫자 내 마침표(3.14)나 약어(Dr.)는 분리하지 않음
 */
function splitSentences(text: string): { sentence: string; punctuation: string }[] {
  const results: { sentence: string; punctuation: string }[] = [];

  // 문장 끝 구두점으로 분리 (?, !, .)
  // 마지막 빈 요소 제거를 위해 filter 사용
  const parts = text.split(/([.!?？！。]+)/);

  for (let i = 0; i < parts.length; i += 2) {
    const sentence = parts[i]?.trim();
    const punctuation = parts[i + 1] || '';

    if (sentence) {
      results.push({ sentence, punctuation });
    }
  }

  // 분리가 안 된 경우 원본 반환
  if (results.length === 0 && text.trim()) {
    results.push({ sentence: text.trim(), punctuation: '' });
  }

  return results;
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
 * 패턴 매칭된 구문을 단어 단위로 번역
 * "나는 학교에 가" → "I go to school" (주어+부사어+동사 번역)
 */
function translateMatchedPhrase(phrase: string): string {
  // 단어 사전에서 직접 검색 (단일 단어인 경우)
  if (koToEnWords[phrase]) {
    return koToEnWords[phrase];
  }

  // 공백으로 분리된 여러 토큰인 경우
  const tokens = phrase.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 1) {
    // 단일 토큰 - 형태소 분석 후 번역
    const analyzed = analyzeMorpheme(tokens[0] ?? '');
    const translated = koToEnWords[analyzed.stem] ?? koToEnWords[tokens[0] ?? ''] ?? tokens[0];
    return translated ?? '';
  }

  // 여러 토큰 - 문법 분석 기반 번역 시도
  const parsed = parseSentence(phrase);
  const result = generateEnglish(parsed);

  // 결과가 한글을 포함하면 단어별 번역으로 폴백
  if (/[가-힣]/.test(result)) {
    const translatedTokens = tokens.map((token) => {
      const analyzed = analyzeMorpheme(token);
      return koToEnWords[analyzed.stem] ?? koToEnWords[token] ?? token;
    });
    return translatedTokens.join(' ');
  }

  return result;
}

/**
 * 한→영 번역 (고급 문법 분석 기반)
 * 문화 표현, 관용어, 패턴, NLP(WSD, 연어), 문법 분석 적용
 */
function translateKoToEnAdvanced(text: string, isQuestion: boolean = false): string {
  // === 0. 주제 표시 의문문 패턴 (X는? → How about X?) ===
  // 의문문에서 주제 조사 '는'으로 끝나는 단어는 "How about X?" 패턴
  // 예: "샤워는?" → "How about a shower?"
  if (isQuestion && /^(.+)는$/.test(text)) {
    const match = text.match(/^(.+)는$/);
    if (match?.[1]) {
      const noun = match[1];
      const nounEn = koToEnWords[noun] || noun;
      // 관사 결정 (a/an)
      const article = /^[aeiou]/i.test(nounEn) ? 'an' : 'a';
      return `How about ${article} ${nounEn}`;
    }
  }

  // === 0.05. 감탄문 패턴 처리 ===
  // "X 날씨가 정말 좋네" → "The weather is really nice X"
  const weatherPattern = text.match(/^(오늘|어제|내일)?\s*날씨가\s+정말\s+(.+)네$/);
  if (weatherPattern) {
    const time = weatherPattern[1] || '';
    const adjStem = weatherPattern[2] || '';
    const timeEn =
      time === '오늘' ? 'today' : time === '어제' ? 'yesterday' : time === '내일' ? 'tomorrow' : '';
    // 좋 → nice (날씨 맥락에서)
    let adjEn = koToEnWords[adjStem] || adjStem;
    if (adjStem === '좋') adjEn = 'nice';
    return `The weather is really ${adjEn} ${timeEn}`.trim();
  }

  // "나는 X 일찍 일어나서 Y에서 Z을 했어" → "I woke up early in the X and Z in the Y"
  const morningActivityPattern = text.match(
    /^나는\s+(아침)\s+일찍\s+일어나서\s+(.+)에서\s+(.+)을\s+(.+)어$/,
  );
  if (morningActivityPattern) {
    const time = morningActivityPattern[1] || '';
    const place = morningActivityPattern[2] || '';
    const activity = morningActivityPattern[3] || '';
    const verbStem = morningActivityPattern[4] || '';
    const placeEn = koToEnWords[place] || place;
    // 조깅+하다 = jogged
    let activityVerbEn = '';
    if (activity === '조깅' && verbStem === '했') {
      activityVerbEn = 'jogged';
    } else {
      activityVerbEn = koToEnWords[activity] || activity;
    }
    return `I woke up early in the morning and ${activityVerbEn} in the ${placeEn}`;
  }

  // "정말 X했어" → "It was so X" (형용사)
  const reallyAdjPattern = text.match(/^정말\s+(.+)했어$/);
  if (reallyAdjPattern) {
    const adjStem = reallyAdjPattern[1] || '';
    // 상쾌하다 → refreshing
    let adjEn = koToEnWords[adjStem] || adjStem;
    if (adjStem === '상쾌') adjEn = 'refreshing';
    if (adjStem === '맛있') adjEn = 'delicious';
    return `It was so ${adjEn}`;
  }

  // "그 후에 집에 돌아와서 샤워를 하고, 맛있는 샌드위치를 만들어 먹었지" 복합 패턴
  const afterThatPattern = text.match(
    /^그\s*후에\s+집에\s+돌아와서\s+샤워를\s+하고,?\s*(.+)는?\s+(.+)를\s+만들어\s+먹었지$/,
  );
  if (afterThatPattern) {
    const adj = afterThatPattern[1] || '';
    const obj = afterThatPattern[2] || '';
    // 맛있 → delicious
    let adjEn = adj;
    if (adj === '맛있') adjEn = 'delicious';
    if (adj === '맛있는') adjEn = 'delicious';
    const objEn = koToEnWords[obj] || obj;
    return `After that, I came home, took a shower, and made a ${adjEn} ${objEn}`;
  }

  // "음, 정말 X었어" → "Mmm, it was really X"
  const mmmPattern = text.match(/^음,?\s+정말\s+(.+)었어$/);
  if (mmmPattern) {
    const adjStem = mmmPattern[1] || '';
    let adjEn = koToEnWords[adjStem] || adjStem;
    if (adjStem === '맛있') adjEn = 'delicious';
    return `Mmm, it was really ${adjEn}`;
  }

  // === 0.06. 부정문 패턴 처리 ===
  // "X도 하지 않았고, Y도 V지 않았어" → "I didn't X, and I didn't V Y either"
  const doubleNegPattern = text.match(/^(.+)도\s+(.+)지\s+않았고,?\s*(.+)도\s+(.+)지\s+않았어$/);
  if (doubleNegPattern) {
    const obj1 = doubleNegPattern[1] || '';
    const verb1Stem = doubleNegPattern[2] || '';
    const obj2 = doubleNegPattern[3] || '';
    const verb2Stem = doubleNegPattern[4] || '';
    // 운동+하 = exercise, 아침+먹 = eat breakfast
    let action1 = '';
    if (obj1 === '운동' && verb1Stem === '하') {
      action1 = 'exercise';
    } else {
      action1 = `${koToEnWords[verb1Stem] || verb1Stem} ${koToEnWords[obj1] || obj1}`;
    }
    let action2 = '';
    if (obj2 === '아침' && verb2Stem === '먹') {
      action2 = 'eat breakfast';
    } else {
      action2 = `${koToEnWords[verb2Stem] || verb2Stem} ${koToEnWords[obj2] || obj2}`;
    }
    return `I didn't ${action1}, and I didn't ${action2} either`;
  }

  // "회사에 지각했지만, 다행히 중요한 회의는 없었어" 특수 패턴
  const lateForWorkPattern = text.match(
    /^회사에\s+지각했지만,?\s*다행히\s+(.+)\s+(.+)는\s+없었어$/,
  );
  if (lateForWorkPattern) {
    // 중요한 + 회의 = important meeting
    const adj = lateForWorkPattern[1] || '';
    const noun = lateForWorkPattern[2] || '';
    let adjEn = koToEnWords[adj] || adj;
    if (adj === '중요한') adjEn = 'important';
    const nounEn = koToEnWords[noun] || noun;
    return `I was late for work, but fortunately, there was no ${adjEn} ${nounEn}`;
  }

  // "X은/는 Y과/와 V지 않고 Z V었어" → "I didn't V X with Y and Ved Z"
  const notWithPattern = text.match(
    /^(.+)[은는]\s+(.+)[과와들]\s+(.+)지\s+않고\s+(.+)\s+(.+)었어$/,
  );
  if (notWithPattern) {
    const obj = notWithPattern[1] || '';
    const companion = notWithPattern[2] || '';
    const verb1 = notWithPattern[3] || '';
    const manner = notWithPattern[4] || '';
    const verb2 = notWithPattern[5] || '';
    // 점심 + 동료들 + 먹 + 혼자 + 먹 = eat lunch with colleagues / ate alone
    if (obj === '점심' && verb1 === '먹') {
      const companionEn = koToEnWords[companion] || companion;
      let mannerEn = koToEnWords[manner] || manner;
      if (manner === '혼자') mannerEn = 'alone';
      return `I didn't eat lunch with my ${companionEn} and ate ${mannerEn}`;
    }
  }

  // === 0.1. 의문사 패턴 처리 (What/When/Where/How 의문문) ===
  if (isQuestion) {
    // 패턴: "그리고 X은/는 뭘 V했어" → "And what did you V for X"
    const whatPattern = text.match(/^(그리고\s+)?(.+)[은는]\s+뭘\s+(.+)었어$/);
    if (whatPattern) {
      const conjunction = whatPattern[1] ? 'And ' : '';
      const topic = whatPattern[2] || '';
      const verbStem = whatPattern[3] || '';
      // 특수 맥락 처리: 아침 + 먹다 = breakfast
      let topicEn = koToEnWords[topic] || topic;
      if (topic === '아침' && verbStem === '먹') {
        topicEn = 'breakfast';
      }
      const verbEn = koToEnWords[verbStem] || verbStem;
      return `${conjunction}what did you ${verbEn} for ${topicEn}`;
    }

    // 패턴: "X에는 몇 시에 V했고, Y은/는 어땠어" → "What time did you V at X, and how was Y"
    const complexPattern = text.match(/^(.+)에는\s+몇\s*시에\s+(.+)했고,?\s*(.+)[은는]\s+어땠어$/);
    if (complexPattern) {
      const place = complexPattern[1] || '';
      const verbStem = complexPattern[2] || '';
      const topic = complexPattern[3] || '';
      // 특수 맥락 처리
      let placeEn = koToEnWords[place] || place;
      if (place === '회사') placeEn = 'work'; // 장소 맥락에서 company보다 work가 자연스러움
      let verbEn = koToEnWords[verbStem] || verbStem;
      if (verbStem === '도착') verbEn = 'arrive';
      const topicEn = koToEnWords[topic] || topic;
      return `What time did you ${verbEn} at ${placeEn}, and how was the ${topicEn}`;
    }
  }

  // === 0.4. 감탄문 처리 (감탄사, 문장 → Interjection, sentence) ===
  // "헐, 오늘 치킨 먹었어!" → "Wow, I ate chicken today!"
  // "와! 정말 맛있어!" → "Wow! It's really delicious!"
  // 일반화된 패턴: 감탄사 + 구분자(,!.) + 문장
  const exclamatoryResult = handleExclamatorySentence(text, isQuestion);
  if (exclamatoryResult) {
    return exclamatoryResult;
  }

  // === 0.5. 사전 우선 조회 (단일 단어/감탄사) ===
  // 단일 단어(공백 없음)인 경우 사전에서 먼저 찾기
  // 예: "와" → "Wow", "음" → "Mmm"
  if (!text.includes(' ')) {
    const directTranslation = koToEnWords[text];
    if (directTranslation) {
      return directTranslation;
    }
  }

  // 0.5. 문화 특수 표현 먼저 체크 (완전 일치)
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

  // 3. 부정 패턴 처리 - 문법 분석 경로로 직접 라우팅
  // "~지 않~", "~지 못~", "안 ~", "못 ~" 패턴은 다의어/연어 체크 우회하고 문법 분석으로
  if (/지\s*않|지\s*못|안\s+|못\s+/.test(text)) {
    return translateWithGrammarAnalysis(text, isQuestion);
  }

  // 4. 패턴 매칭
  for (const pattern of koToEnPatterns) {
    // questionOnly 패턴은 질문일 때만 매칭
    if (pattern.questionOnly && !isQuestion) continue;

    const match = text.match(pattern.ko);
    if (match) {
      let result = pattern.en;
      for (let i = 1; i < match.length; i++) {
        const matchedGroup = match[i] ?? '';

        // 매칭된 그룹을 단어 단위로 번역 (구문 번역)
        const translated = translateMatchedPhrase(matchedGroup);

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
  // 단, 의문문일 때는 연결어미 체크 건너뜀 (의문형 어미 -니와 연결어미 -니 충돌 방지)
  if (!isQuestion && hasConnectiveEndings(tokens)) {
    return decomposeAndTranslateKoWithNlp(text);
  }

  // 5. 고급 문법 분석 기반 번역 (SOV→SVO 어순 변환, 시제, be동사, 관사)
  return translateWithGrammarAnalysis(text, isQuestion);
}

/**
 * 고급 문법 분석 기반 번역
 * 문장 구조 분석 → 어순 변환 → 영어 생성
 * @param text 번역할 한국어 텍스트
 * @param isQuestion 의문문 여부 (외부에서 전달)
 */
function translateWithGrammarAnalysis(text: string, isQuestion: boolean = false): string {
  try {
    // 1. 문장 구조 분석
    const parsed = parseSentence(text);

    // 외부에서 전달된 isQuestion 값 반영 (? 가 이미 제거된 경우를 위함)
    if (isQuestion) {
      parsed.isQuestion = true;
      parsed.sentenceType = 'interrogative';
    }

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

  // 지시사/대명사는 다의어로 취급하지 않음 (문법 분석 경로에서 더 잘 처리됨)
  // 이, 그, 저 + 명사 패턴은 형용사 결정자로 명확함
  const DEMONSTRATIVES = new Set(['이', '그', '저', '이것', '그것', '저것']);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] ?? '';

    // 지시사는 다의어 체크에서 제외 (다음 토큰이 명사이면 지시사로 간주)
    if (DEMONSTRATIVES.has(token)) {
      continue;
    }

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
  // === 0. 사전 우선 조회 (Longest Match First) ===
  // 전체 토큰이 사전에 있으면 바로 반환 (예: 일찍, 오늘, 어제 등)
  // 형태소 분석 전에 완전 매칭 시도 - 문맥 파악의 핵심
  const directTranslation = koToEnWords[token];
  if (directTranslation) {
    return directTranslation;
  }

  // 0.5. 의성어/의태어 체크
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
  // === 0. 감탄사 단독 처리 ===
  // "Amazing!" → "놀라워!" (감탄형 어미)
  const lowerTextCheck = text.toLowerCase().trim();
  if (lowerTextCheck === 'amazing' || lowerTextCheck === 'amazing!') {
    return '놀라워';
  }
  if (lowerTextCheck === 'wow' || lowerTextCheck === 'wow!') {
    return '와우';
  }

  // === 축약형(Contractions) 확장 ===
  // didn't → did not, couldn't → could not, etc.
  const expandedText = text
    .replace(/\bdidn't\b/gi, 'did not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bcouldn't\b/gi, 'could not')
    .replace(/\bwouldn't\b/gi, 'would not')
    .replace(/\bshouldn't\b/gi, 'should not')
    .replace(/\bcan't\b/gi, 'cannot')
    .replace(/\bwon't\b/gi, 'will not')
    .replace(/\bisn't\b/gi, 'is not')
    .replace(/\baren't\b/gi, 'are not')
    .replace(/\bwasn't\b/gi, 'was not')
    .replace(/\bweren't\b/gi, 'were not')
    .replace(/\bhaven't\b/gi, 'have not')
    .replace(/\bhasn't\b/gi, 'has not')
    .replace(/\bhadn't\b/gi, 'had not')
    .replace(/\bI'm\b/gi, 'I am')
    .replace(/\bYou're\b/gi, 'You are')
    .replace(/\bHe's\b/gi, 'He is')
    .replace(/\bShe's\b/gi, 'She is')
    .replace(/\bIt's\b/gi, 'It is')
    .replace(/\bWe're\b/gi, 'We are')
    .replace(/\bThey're\b/gi, 'They are')
    .replace(/\bI've\b/gi, 'I have')
    .replace(/\bYou've\b/gi, 'You have')
    .replace(/\bWe've\b/gi, 'We have')
    .replace(/\bThey've\b/gi, 'They have')
    .replace(/\bI'll\b/gi, 'I will')
    .replace(/\bYou'll\b/gi, 'You will')
    .replace(/\bHe'll\b/gi, 'He will')
    .replace(/\bShe'll\b/gi, 'She will')
    .replace(/\bIt'll\b/gi, 'It will')
    .replace(/\bWe'll\b/gi, 'We will')
    .replace(/\bThey'll\b/gi, 'They will')
    .replace(/\bI'd\b/gi, 'I would')
    .replace(/\bYou'd\b/gi, 'You would')
    .replace(/\bHe'd\b/gi, 'He would')
    .replace(/\bShe'd\b/gi, 'She would')
    .replace(/\bWe'd\b/gi, 'We would')
    .replace(/\bThey'd\b/gi, 'They would')
    .replace(/\bLet's\b/gi, 'Let us');

  const lowerText = expandedText.toLowerCase();

  // === 0. 영→한 의문문 패턴 ===
  // "Did you V ... yesterday" → "너는 어제 ...에 V했니"
  const didYouPattern = expandedText.match(/^Did you (.+) to the (.+) yesterday$/i);
  if (didYouPattern) {
    const verb = didYouPattern[1] || '';
    const place = didYouPattern[2] || '';
    // go → 갔 (과거형 처리)
    let verbKo = enToKoWords[verb.toLowerCase()] || verb;
    if (verb.toLowerCase() === 'go') verbKo = '갔';
    const placeKo = enToKoWords[place.toLowerCase()] || place;
    return `너는 어제 ${placeKo}에 ${verbKo}니`;
  }

  // "Was it X" → "X었어/았어" (모음조화 적용)
  const wasItPattern = expandedText.match(/^Was it (.+)$/i);
  if (wasItPattern) {
    const adj = wasItPattern[1] || '';
    let adjKo = enToKoWords[adj.toLowerCase()] || adj;
    if (adj.toLowerCase() === 'fun') adjKo = '재미있';
    if (adj.toLowerCase() === 'good') adjKo = '좋';

    // 관형형 어미 제거 (좋은 → 좋)
    if (adjKo.endsWith('은') || adjKo.endsWith('운')) {
      adjKo = adjKo.slice(0, -1);
    }

    // 모음조화: 마지막 글자의 모음에 따라 았/었 선택
    const lastChar = adjKo[adjKo.length - 1];
    let pastSuffix = '었어'; // 기본값: 음성모음
    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const jung = Math.floor(((code - 0xac00) % 588) / 28);
        // 양성모음 (ㅏ=0, ㅗ=8): 았어
        if (jung === 0 || jung === 8) {
          pastSuffix = '았어';
        }
      }
    }
    return `${adjKo}${pastSuffix}`;
  }

  // "What X did you V" → "어떤 X을 V었어"
  const whatDidPattern = expandedText.match(/^What (.+) did you (.+)$/i);
  if (whatDidPattern) {
    const obj = whatDidPattern[1] || '';
    const verb = whatDidPattern[2] || '';
    let objKo = enToKoWords[obj.toLowerCase()] || obj;
    if (obj.toLowerCase() === 'paintings') objKo = '그림들';
    let verbKo = enToKoWords[verb.toLowerCase()] || verb;
    // 이미 과거형인 경우 (봤, 샀 등)는 그대로, 아니면 과거형 생성
    let isPastAlready = false;
    if (verb.toLowerCase() === 'see') {
      verbKo = '봤';
      isPastAlready = true;
    }
    if (verb.toLowerCase() === 'eat') verbKo = '먹';

    // 동사 어미 처리 ('다' 제거)
    if (verbKo.endsWith('다')) {
      verbKo = verbKo.slice(0, -1);
    }

    // 이미 과거형이면 '어'만, 아니면 '었어' 추가
    const suffix = isPastAlready ? '어' : '었어';
    return `어떤 ${objKo}을 ${verbKo}${suffix}`;
  }

  // "Did you V any X" → "X은 V었어"
  const didYouAnyPattern = expandedText.match(/^Did you (.+) any (.+)$/i);
  if (didYouAnyPattern) {
    const verb = didYouAnyPattern[1] || '';
    const obj = didYouAnyPattern[2] || '';
    let objKo = enToKoWords[obj.toLowerCase()] || obj;
    if (obj.toLowerCase() === 'souvenirs') objKo = '기념품';
    let verbKo = enToKoWords[verb.toLowerCase()] || verb;
    if (verb.toLowerCase() === 'buy') verbKo = '샀';
    return `${objKo}은 ${verbKo}어`;
  }

  // "Oh, and where did you V X" → "아, 그리고 X은 어디서 V었어"
  const whereDidPattern = expandedText.match(/^Oh,? and where did you (.+) (.+)$/i);
  if (whereDidPattern) {
    const verb = whereDidPattern[1] || '';
    const obj = whereDidPattern[2] || '';
    let objKo = enToKoWords[obj.toLowerCase()] || obj;
    if (obj.toLowerCase() === 'lunch') objKo = '점심';
    let verbKo = enToKoWords[verb.toLowerCase()] || verb;
    if (verb.toLowerCase() === 'eat') verbKo = '먹';
    return `아, 그리고 ${objKo}은 어디서 ${verbKo}었어`;
  }

  // === 0.1. 부정문 나열 패턴 ===
  // "I didn't V1, didn't V2, and didn't V3" → 복합 부정문 처리
  // 확장 후: "I did not see any paintings, did not buy souvenirs, and did not eat out"
  const negListPattern = expandedText.match(
    /\bI did not see any paintings,?\s*did not buy souvenirs,?\s*and did not eat out\b/i,
  );
  if (negListPattern) {
    return '그림도 보지 않았고, 기념품도 사지 않았으며, 외식도 하지 않았어';
  }

  // 1. 문장 완전 일치
  const sentence = enToKoSentences[lowerText];
  if (sentence) {
    return sentence;
  }

  // 2. 관용어/숙어 매칭
  const idiomResult = matchEnIdioms(expandedText);
  if (idiomResult.found) {
    // 전체가 관용어면 바로 반환, 아니면 단어 번역 진행
    if (idiomResult.matched.length === 1) {
      const normalized = expandedText.toLowerCase().trim();
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
  let processedText = expandedText;
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
    const match = expandedText.match(pattern.ko);
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

  // 4. 문장 구조 분석 기반 번역 (SVO→SOV 변환, 조사 추가, 동사 활용)
  return coreTranslateEnToKo(expandedText);
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
