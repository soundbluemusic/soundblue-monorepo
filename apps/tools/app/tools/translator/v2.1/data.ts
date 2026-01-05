/**
 * 번역기 v2 통합 데이터
 * v1의 사전 데이터 재사용 + 핵심 규칙 정의
 */

// 한글 처리 유틸리티
import { getBatchim, removeBatchim } from '@soundblue/hangul';
// v1 사전 재사용
import { enToKoWords, koToEnWords } from '../dictionary';
import type { Formality } from '../settings';

// ============================================
// 0. Formality별 매핑 타입
// ============================================

/** Formality별 번역 결과 매핑 */
export type FormalityMap = Record<Formality, string>;

// ============================================
// 1. 기본 단어 사전 (v1에서 가져옴)
// ============================================

/** 한→영 단어 사전 */
export const KO_EN: Record<string, string> = koToEnWords;

/**
 * 한국어 조사 패턴
 * 역변환 시 조사가 붙은 단어는 제외하여 기본형 우선
 */
const KOREAN_PARTICLES = /[을를이가은는도만에서로으로와과하고의]$/;

/**
 * KO_EN 역변환 시 기본형 우선 처리
 *
 * 문제: KO_EN에 '운동: exercise'와 '운동을: exercise'가 둘 다 있으면
 *       역변환 시 나중 것(운동을)이 앞것(운동)을 덮어씀
 *
 * 해결: 조사 없는 기본형을 우선하고, 같은 영어에 여러 한국어가 매핑되면
 *       더 짧은 것(조사 없는 기본형)을 선택
 */
function buildEnToKoFromKoEn(): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [ko, en] of Object.entries(KO_EN)) {
    const enLower = en.toLowerCase();

    // 조사가 붙은 단어는 건너뛰기 (기본형 우선)
    if (KOREAN_PARTICLES.test(ko)) {
      // 이미 매핑된 것이 있으면 덮어쓰지 않음
      if (result[enLower]) continue;
    }

    // 기존 매핑이 있으면 더 짧은 것 선택 (기본형이 대체로 더 짧음)
    const existing = result[enLower];
    if (existing && existing.length <= ko.length) {
      continue;
    }

    result[enLower] = ko;
  }

  return result;
}

/** 영→한 단어 사전 (KO_EN 역변환 + v1 사전 + 추가 매핑) */
// 우선순위: 추가 매핑 > enToKoWords > buildEnToKoFromKoEn (역변환)
// enToKoWords가 역변환보다 우선되어야 올바른 매핑 유지 (park→공원, open→열다)
export const EN_KO: Record<string, string> = {
  ...buildEnToKoFromKoEn(),
  ...enToKoWords,
  // 추가 매핑 (관사, be동사 등)
  the: '',
  a: '',
  an: '',
  am: '이다',
  is: '이다',
  are: '이다',
  was: '였다',
  were: '였다',
  did: '',
  do: '하다',
  does: '하다',
  have: '가지다',
  has: '가지다',
  had: '가졌다',
};

// ============================================
// 2. 조사 (한국어 특수)
// ============================================

/** 조사 정의: [조사, 역할, 영어 대응] */
export const PARTICLES: Array<[string, string, string]> = [
  // 주격 조사
  ['이', 'subject', ''],
  ['가', 'subject', ''],
  ['께서', 'subject', ''],

  // 목적격 조사
  ['을', 'object', ''],
  ['를', 'object', ''],

  // 보조사
  ['은', 'topic', ''],
  ['는', 'topic', ''],
  ['도', 'also', 'also'],
  ['만', 'only', 'only'],

  // 부사격 조사
  ['에', 'location', 'at/in/to'],
  ['에서', 'location', 'at/in'],
  ['로', 'direction', 'to'],
  ['으로', 'direction', 'to'],
  ['와', 'with', 'with'],
  ['과', 'with', 'with'],
  ['하고', 'with', 'with'],
  ['의', 'possessive', "'s"],
];

// ============================================
// 3. 어미 (한국어 활용)
// ============================================

/**
 * 종결어미 패턴: [어미, 시제, 문장유형, 격식]
 *
 * Phase 1: Ko→En 종결어미 분석
 * 긴 어미부터 매칭하도록 정렬 필요
 */
export const ENDINGS: Array<[string, string, string, string]> = [
  // ============================================
  // 1. 격식체 평서문 (formal-polite)
  // ============================================
  ['습니다', 'present', 'statement', 'formal-polite'],
  ['ㅂ니다', 'present', 'statement', 'formal-polite'],
  ['았습니다', 'past', 'statement', 'formal-polite'],
  ['었습니다', 'past', 'statement', 'formal-polite'],
  ['였습니다', 'past', 'statement', 'formal-polite'],
  ['했습니다', 'past', 'statement', 'formal-polite'],
  ['겠습니다', 'future', 'statement', 'formal-polite'],

  // ============================================
  // 2. 격식체 의문문 (formal-polite)
  // ============================================
  ['습니까', 'present', 'question', 'formal-polite'],
  ['ㅂ니까', 'present', 'question', 'formal-polite'],
  ['았습니까', 'past', 'question', 'formal-polite'],
  ['었습니까', 'past', 'question', 'formal-polite'],
  ['였습니까', 'past', 'question', 'formal-polite'],
  ['겠습니까', 'future', 'question', 'formal-polite'],

  // ============================================
  // 3. 비격식 존댓말 평서문 (polite)
  // ============================================
  ['아요', 'present', 'statement', 'polite'],
  ['어요', 'present', 'statement', 'polite'],
  ['여요', 'present', 'statement', 'polite'],
  ['해요', 'present', 'statement', 'polite'],
  ['았어요', 'past', 'statement', 'polite'],
  ['었어요', 'past', 'statement', 'polite'],
  ['였어요', 'past', 'statement', 'polite'],
  ['했어요', 'past', 'statement', 'polite'],
  ['겠어요', 'future', 'statement', 'polite'],
  ['ㄹ게요', 'future', 'statement', 'polite'],
  ['을게요', 'future', 'statement', 'polite'],
  ['ㄹ거예요', 'future', 'statement', 'polite'],
  ['을거예요', 'future', 'statement', 'polite'],

  // ============================================
  // 4. 비격식 존댓말 의문문 (polite)
  // ============================================
  ['아요?', 'present', 'question', 'polite'],
  ['어요?', 'present', 'question', 'polite'],
  ['나요?', 'present', 'question', 'polite'],
  ['세요?', 'present', 'question', 'polite'],
  ['았어요?', 'past', 'question', 'polite'],
  ['었어요?', 'past', 'question', 'polite'],
  ['ㄹ까요?', 'future', 'question', 'polite'],
  ['을까요?', 'future', 'question', 'polite'],

  // ============================================
  // 5. 해라체/평서형 (plain)
  // ============================================
  ['는다', 'present', 'statement', 'plain'],
  ['ㄴ다', 'present', 'statement', 'plain'],
  ['다', 'present', 'statement', 'plain'],
  ['았다', 'past', 'statement', 'plain'],
  ['었다', 'past', 'statement', 'plain'],
  ['였다', 'past', 'statement', 'plain'],
  ['했다', 'past', 'statement', 'plain'],
  ['겠다', 'future', 'statement', 'plain'],
  ['리라', 'future', 'statement', 'plain'],

  // ============================================
  // 6. 해라체 의문문 (plain)
  // ============================================
  ['느냐', 'present', 'question', 'plain'],
  ['냐', 'present', 'question', 'plain'],
  ['니', 'present', 'question', 'plain'],
  ['나', 'present', 'question', 'plain'],
  ['았느냐', 'past', 'question', 'plain'],
  ['었느냐', 'past', 'question', 'plain'],
  ['았니', 'past', 'question', 'plain'],
  ['었니', 'past', 'question', 'plain'],
  ['했니', 'past', 'question', 'plain'],

  // ============================================
  // 7. 반말 평서문 (informal)
  // ============================================
  ['아', 'present', 'statement', 'informal'],
  ['어', 'present', 'statement', 'informal'],
  ['야', 'present', 'statement', 'informal'],
  ['해', 'present', 'statement', 'informal'],
  ['았어', 'past', 'statement', 'informal'],
  ['었어', 'past', 'statement', 'informal'],
  ['였어', 'past', 'statement', 'informal'],
  ['했어', 'past', 'statement', 'informal'],
  ['겠어', 'future', 'statement', 'informal'],
  ['ㄹ게', 'future', 'statement', 'informal'],
  ['을게', 'future', 'statement', 'informal'],
  ['ㄹ거야', 'future', 'statement', 'informal'],
  ['을거야', 'future', 'statement', 'informal'],

  // ============================================
  // 8. 반말 의문문 (informal)
  // ============================================
  ['아?', 'present', 'question', 'informal'],
  ['어?', 'present', 'question', 'informal'],
  ['ㄹ까?', 'present', 'question', 'informal'],
  ['을까?', 'present', 'question', 'informal'],
  ['ㄹ래?', 'present', 'question', 'informal'],
  ['을래?', 'present', 'question', 'informal'],

  // ============================================
  // 9. 명령형 (imperative)
  // ============================================
  ['세요', 'present', 'imperative', 'polite'],
  ['십시오', 'present', 'imperative', 'formal-polite'],
  ['아라', 'present', 'imperative', 'plain'],
  ['어라', 'present', 'imperative', 'plain'],
  ['여라', 'present', 'imperative', 'plain'],
  ['하라', 'present', 'imperative', 'plain'],
  ['거라', 'present', 'imperative', 'plain'],
  ['아', 'present', 'imperative', 'informal'],
  ['어', 'present', 'imperative', 'informal'],

  // ============================================
  // 10. 청유형 (suggestion)
  // ============================================
  ['ㅂ시다', 'present', 'suggestion', 'formal-polite'],
  ['읍시다', 'present', 'suggestion', 'formal-polite'],
  ['자', 'present', 'suggestion', 'informal'],
  ['ㄹ까요', 'present', 'suggestion', 'polite'],
  ['을까요', 'present', 'suggestion', 'polite'],
  ['ㄹ까', 'present', 'suggestion', 'informal'],
  ['을까', 'present', 'suggestion', 'informal'],

  // ============================================
  // 11. 감탄형 (exclamation)
  // ============================================
  ['는구나', 'present', 'exclamation', 'plain'],
  ['구나', 'present', 'exclamation', 'plain'],
  ['네', 'present', 'exclamation', 'polite'],
  ['군요', 'present', 'exclamation', 'polite'],

  // ============================================
  // 12. 확인/동의 요청
  // ============================================
  ['지', 'present', 'question', 'informal'],
  ['잖아', 'present', 'statement', 'informal'],
  ['잖아요', 'present', 'statement', 'polite'],

  // ============================================
  // 13. 회상/전달
  // ============================================
  ['더라', 'past', 'statement', 'plain'],
  ['더라고', 'past', 'statement', 'informal'],
  ['더라고요', 'past', 'statement', 'polite'],

  // ============================================
  // 14. 약속/의지
  // ============================================
  ['마', 'present', 'imperative', 'informal'],
  ['지마', 'present', 'imperative', 'informal'],
  ['지마세요', 'present', 'imperative', 'polite'],

  // ============================================
  // 15. 부정문 패턴
  // ============================================
  ['지 않았어', 'past', 'statement', 'informal'],
  ['지 않았다', 'past', 'statement', 'plain'],
  ['지 않았어요', 'past', 'statement', 'polite'],
  ['지 않았습니다', 'past', 'statement', 'formal-polite'],
  ['지 않아', 'present', 'statement', 'informal'],
  ['지 않는다', 'present', 'statement', 'plain'],
  ['지 않아요', 'present', 'statement', 'polite'],
  ['지 않습니다', 'present', 'statement', 'formal-polite'],
  ['지 못했어', 'past', 'statement', 'informal'],
  ['지 못해', 'present', 'statement', 'informal'],
  ['지 못해요', 'present', 'statement', 'polite'],
];

/**
 * 종결어미 정렬 (긴 어미부터 매칭)
 * Phase 1: Ko→En 종결어미 분석
 */
export const SORTED_ENDINGS = [...ENDINGS].sort((a, b) => b[0].length - a[0].length);

/**
 * 종결어미 분석 결과
 */
export interface EndingAnalysis {
  /** 추출된 어간 */
  stem: string;
  /** 매칭된 어미 */
  ending: string;
  /** 시제 */
  tense: 'past' | 'present' | 'future';
  /** 문장 유형 */
  sentenceType: 'statement' | 'question' | 'imperative' | 'suggestion' | 'exclamation';
  /** 격식 수준 */
  politeness: 'formal-polite' | 'polite' | 'plain' | 'informal';
  /** 부정문 여부 */
  negated: boolean;
}

/**
 * 받침 흡수형 종결어미 패턴
 * 모음으로 끝나는 어간 + 받침이 붙는 어미 (간다=가+ㄴ다, 갑니다=가+ㅂ니다)
 *
 * 구조: [받침, 나머지어미, 시제, 문장유형, 격식]
 */
const CONTRACTED_ENDINGS: Array<[string, string, string, string, string]> = [
  // -ㄴ다 (간다, 온다) - 평서형 plain
  ['ㄴ', '다', 'present', 'statement', 'plain'],
  // -ㅂ니다 (갑니다, 옵니다) - 평서형 formal
  ['ㅂ', '니다', 'present', 'statement', 'formal-polite'],
  // -ㅂ니까 (갑니까, 옵니까) - 의문형 formal
  ['ㅂ', '니까', 'present', 'question', 'formal-polite'],
  ['ㅂ', '니까?', 'present', 'question', 'formal-polite'],
  // -ㅂ시다 (갑시다, 옵시다) - 청유형 formal
  ['ㅂ', '시다', 'present', 'suggestion', 'formal-polite'],
  // -ㄹ래 (갈래, 올래) - 의지/의향 informal
  ['ㄹ', '래', 'present', 'question', 'informal'],
  ['ㄹ', '래?', 'present', 'question', 'informal'],
  // -ㄹ까 (갈까, 올까) - 청유/의문 informal
  ['ㄹ', '까', 'present', 'suggestion', 'informal'],
  ['ㄹ', '까?', 'present', 'question', 'informal'],
  // -ㄹ게 (갈게, 올게) - 약속/의지 informal
  ['ㄹ', '게', 'future', 'statement', 'informal'],
  // -라 (가라, 와라) - 명령형 plain
  // Note: '라' 단독은 어미이므로 별도 처리 필요
];

/**
 * 받침 흡수형 종결어미 분석
 * 모음으로 끝나는 어간 + 받침이 붙는 패턴 (간다=가+ㄴ다)
 *
 * @param word 분석할 단어
 * @param negated 부정문 여부
 * @returns 분석 결과 또는 null
 */
function analyzeContractedEnding(word: string, negated: boolean): EndingAnalysis | null {
  if (word.length < 2) return null;

  for (const [batchim, suffix, tense, sentenceType, politeness] of CONTRACTED_ENDINGS) {
    // 나머지 어미와 일치하는지 확인
    const suffixClean = suffix.replace(/\?$/, '');
    if (!word.endsWith(suffix) && !word.endsWith(suffixClean)) continue;

    const matchedSuffix = word.endsWith(suffix) ? suffix : suffixClean;
    const prefixPart = word.slice(0, -matchedSuffix.length);

    if (prefixPart.length < 1) continue;

    // 마지막 글자의 받침 확인
    const lastChar = prefixPart[prefixPart.length - 1];
    if (!lastChar) continue;

    const lastBatchim = getBatchim(lastChar);
    if (lastBatchim !== batchim) continue;

    // 받침 제거하여 어간 추출
    const stemWithoutBatchim = removeBatchim(lastChar);
    if (!stemWithoutBatchim) continue;

    const stem = prefixPart.slice(0, -1) + stemWithoutBatchim;

    return {
      stem,
      ending: batchim + matchedSuffix,
      tense: tense as 'past' | 'present' | 'future',
      sentenceType: sentenceType as
        | 'statement'
        | 'question'
        | 'imperative'
        | 'suggestion'
        | 'exclamation',
      politeness: politeness as 'formal-polite' | 'polite' | 'plain' | 'informal',
      negated,
    };
  }

  return null;
}

/**
 * 한국어 동사/형용사의 종결어미를 분석
 *
 * @param word 분석할 단어 (예: "갑니다", "먹었어")
 * @returns 분석 결과 또는 null
 */
export function analyzeKoreanEnding(word: string): EndingAnalysis | null {
  // 부정문 체크
  let negated = false;
  let cleanWord = word;

  if (word.includes('지 않') || word.includes('지않')) {
    negated = true;
    cleanWord = word.replace(/지\s*않/, '');
  } else if (word.includes('지 못') || word.includes('지못')) {
    negated = true;
    cleanWord = word.replace(/지\s*못/, '');
  }

  // 1. 받침 흡수형 종결어미 우선 체크 (간다, 갑니다 등)
  const contractedResult = analyzeContractedEnding(cleanWord, negated);
  if (contractedResult) {
    return contractedResult;
  }

  // 2. 일반 종결어미 매칭 (긴 어미부터)
  for (const [ending, tense, type, politeness] of SORTED_ENDINGS) {
    // 물음표 제거한 버전도 체크
    const endingClean = ending.replace(/\?$/, '');

    if (cleanWord.endsWith(ending) || cleanWord.endsWith(endingClean)) {
      const matchedEnding = cleanWord.endsWith(ending) ? ending : endingClean;
      const stem = cleanWord.slice(0, -matchedEnding.length);

      if (stem.length > 0) {
        return {
          stem,
          ending: matchedEnding,
          tense: tense as 'past' | 'present' | 'future',
          sentenceType: type as
            | 'statement'
            | 'question'
            | 'imperative'
            | 'suggestion'
            | 'exclamation',
          politeness: politeness as 'formal-polite' | 'polite' | 'plain' | 'informal',
          negated,
        };
      }
    }
  }

  return null;
}

/**
 * 종결어미 정보를 영어 문장 형식으로 변환
 *
 * @param analysis 종결어미 분석 결과
 * @param verb 영어 동사 원형
 * @returns 영어 문장 또는 null
 */
export function endingToEnglish(
  analysis: EndingAnalysis,
  verb: string,
): { text: string; prefix?: string; suffix?: string } | null {
  const { sentenceType, tense, politeness, negated } = analysis;

  // 문장 유형별 영어 변환
  switch (sentenceType) {
    case 'statement':
      if (negated) {
        if (tense === 'past') return { text: `didn't ${verb}` };
        if (tense === 'future') return { text: `won't ${verb}` };
        return { text: `don't ${verb}` };
      }
      if (tense === 'past') return { text: verb }; // 과거형은 동사 활용 필요
      if (tense === 'future') return { text: `will ${verb}` };
      return { text: verb };

    case 'question':
      if (tense === 'past') return { prefix: 'Did', text: verb, suffix: '?' };
      if (tense === 'future') return { prefix: 'Will', text: verb, suffix: '?' };
      return { prefix: 'Do', text: verb, suffix: '?' };

    case 'imperative':
      if (negated) return { prefix: "Don't", text: verb, suffix: '!' };
      if (politeness === 'polite') return { prefix: 'Please', text: verb };
      return { text: verb.charAt(0).toUpperCase() + verb.slice(1), suffix: '!' };

    case 'suggestion':
      if (politeness === 'formal-polite' || politeness === 'polite') {
        return { prefix: "Let's", text: verb };
      }
      return { prefix: "Let's", text: verb };

    case 'exclamation':
      return { prefix: 'Oh,', text: `you ${verb}` };

    default:
      return null;
  }
}

// ============================================
// 4. 불규칙 동사
// ============================================

/**
 * 영어 불규칙 동사: [원형, 과거, 과거분사]
 *
 * 80개+ 불규칙 동사 완전 사전
 * - 기본 동사 (go, come, eat, ...)
 * - 빈도 높은 동사 (think, know, find, ...)
 * - 조동사/보조동사 관련 (can→could, will→would, ...)
 */
export const IRREGULAR_VERBS: Array<[string, string, string]> = [
  // ============================================
  // 기본 동사 (25개)
  // ============================================
  ['go', 'went', 'gone'],
  ['come', 'came', 'come'],
  ['eat', 'ate', 'eaten'],
  ['drink', 'drank', 'drunk'],
  ['see', 'saw', 'seen'],
  ['hear', 'heard', 'heard'],
  ['read', 'read', 'read'],
  ['write', 'wrote', 'written'],
  ['sleep', 'slept', 'slept'],
  ['wake', 'woke', 'woken'],
  ['make', 'made', 'made'],
  ['buy', 'bought', 'bought'],
  ['sell', 'sold', 'sold'],
  ['give', 'gave', 'given'],
  ['take', 'took', 'taken'],
  ['run', 'ran', 'run'],
  ['have', 'had', 'had'],
  ['do', 'did', 'done'],
  ['be', 'was/were', 'been'],
  ['get', 'got', 'gotten'],
  ['ride', 'rode', 'ridden'],
  ['hit', 'hit', 'hit'],
  ['catch', 'caught', 'caught'],
  ['hold', 'held', 'held'],
  ['fall', 'fell', 'fallen'],

  // ============================================
  // 인지/사고 동사 (15개)
  // ============================================
  ['think', 'thought', 'thought'],
  ['know', 'knew', 'known'],
  ['understand', 'understood', 'understood'],
  ['forget', 'forgot', 'forgotten'],
  ['remember', 'remembered', 'remembered'], // 규칙이지만 빈도 높음
  ['mean', 'meant', 'meant'],
  ['feel', 'felt', 'felt'],
  ['find', 'found', 'found'],
  ['believe', 'believed', 'believed'], // 규칙
  ['learn', 'learned/learnt', 'learned/learnt'],
  ['teach', 'taught', 'taught'],
  ['show', 'showed', 'shown'],
  ['tell', 'told', 'told'],
  ['say', 'said', 'said'],
  ['speak', 'spoke', 'spoken'],

  // ============================================
  // 이동/위치 동사 (15개)
  // ============================================
  ['sit', 'sat', 'sat'],
  ['stand', 'stood', 'stood'],
  ['lie', 'lay', 'lain'],
  ['lay', 'laid', 'laid'],
  ['rise', 'rose', 'risen'],
  ['fly', 'flew', 'flown'],
  ['swim', 'swam', 'swum'],
  ['drive', 'drove', 'driven'],
  ['leave', 'left', 'left'],
  ['meet', 'met', 'met'],
  ['bring', 'brought', 'brought'],
  ['send', 'sent', 'sent'],
  ['spend', 'spent', 'spent'],
  ['lend', 'lent', 'lent'],
  ['lead', 'led', 'led'],

  // ============================================
  // 행위 동사 (20개)
  // ============================================
  ['put', 'put', 'put'],
  ['set', 'set', 'set'],
  ['let', 'let', 'let'],
  ['cut', 'cut', 'cut'],
  ['shut', 'shut', 'shut'],
  ['cost', 'cost', 'cost'],
  ['hurt', 'hurt', 'hurt'],
  ['break', 'broke', 'broken'],
  ['choose', 'chose', 'chosen'],
  ['throw', 'threw', 'thrown'],
  ['grow', 'grew', 'grown'],
  ['blow', 'blew', 'blown'],
  ['draw', 'drew', 'drawn'],
  ['wear', 'wore', 'worn'],
  ['tear', 'tore', 'torn'],
  ['beat', 'beat', 'beaten'],
  ['begin', 'began', 'begun'],
  ['sing', 'sang', 'sung'],
  ['ring', 'rang', 'rung'],
  ['sink', 'sank', 'sunk'],

  // ============================================
  // 소유/획득 동사 (10개)
  // ============================================
  ['lose', 'lost', 'lost'],
  ['win', 'won', 'won'],
  ['keep', 'kept', 'kept'],
  ['pay', 'paid', 'paid'],
  ['build', 'built', 'built'],
  ['fight', 'fought', 'fought'],
  ['seek', 'sought', 'sought'],
  ['bind', 'bound', 'bound'],
  ['hang', 'hung', 'hung'],
  ['stick', 'stuck', 'stuck'],

  // ============================================
  // 조동사/보조동사 원형 (5개)
  // ============================================
  ['can', 'could', 'been able to'],
  ['will', 'would', 'willed'],
  ['shall', 'should', 'should'],
  ['may', 'might', 'might'],
  ['must', 'had to', 'had to'],
];

/** 불규칙 동사 빠른 조회용 맵 */
export const VERB_PAST = new Map(IRREGULAR_VERBS.map(([base, past]) => [base, past]));
export const VERB_BASE = new Map(
  IRREGULAR_VERBS.flatMap(([base, past]) =>
    past.includes('/') ? past.split('/').map((p) => [p, base]) : [[past, base]],
  ),
);

// ============================================
// 4.1 조동사 변환 규칙 (Modal Verbs)
// ============================================

/**
 * 조동사 → 한국어 표현 매핑
 *
 * 일반화 규칙:
 * - can/could: 능력/가능 → -ㄹ 수 있다
 * - must/should/have to: 의무/당위 → -해야 한다
 * - will/would: 미래/의지 → -ㄹ 것이다
 * - may/might: 추측/가능성 → -ㄹ지도 모른다
 *
 * 각 조동사는 시제와 극성(긍정/부정)에 따라 다른 표현 사용
 */
export interface ModalRule {
  /** 한국어 어미 (동사 어간 뒤에 붙음) */
  suffix: string;
  /** 부정형 어미 */
  negativeSuffix: string;
  /** 의미 카테고리 */
  meaning: 'ability' | 'obligation' | 'future' | 'possibility' | 'permission';
  /** 시제 (과거형 조동사인 경우) */
  tense?: 'past';
}

export const MODAL_RULES: Record<string, ModalRule> = {
  // 능력/가능
  can: {
    suffix: 'ㄹ 수 있다',
    negativeSuffix: 'ㄹ 수 없다',
    meaning: 'ability',
  },
  could: {
    suffix: 'ㄹ 수 있었다',
    negativeSuffix: 'ㄹ 수 없었다',
    meaning: 'ability',
    tense: 'past',
  },

  // 의무/당위
  must: {
    suffix: '해야 한다',
    negativeSuffix: '하면 안 된다',
    meaning: 'obligation',
  },
  should: {
    suffix: '해야 한다',
    negativeSuffix: '하지 않아야 한다',
    meaning: 'obligation',
  },
  'have to': {
    suffix: '해야 한다',
    negativeSuffix: '하지 않아도 된다',
    meaning: 'obligation',
  },
  'has to': {
    suffix: '해야 한다',
    negativeSuffix: '하지 않아도 된다',
    meaning: 'obligation',
  },
  'had to': {
    suffix: '해야 했다',
    negativeSuffix: '하지 않아도 됐다',
    meaning: 'obligation',
    tense: 'past',
  },

  // 미래/의지
  will: {
    suffix: 'ㄹ 것이다',
    negativeSuffix: '지 않을 것이다',
    meaning: 'future',
  },
  would: {
    suffix: 'ㄹ 것이다',
    negativeSuffix: '지 않을 것이다',
    meaning: 'future',
    tense: 'past',
  },

  // 추측/가능성
  may: {
    suffix: 'ㄹ지도 모른다',
    negativeSuffix: '지 않을지도 모른다',
    meaning: 'possibility',
  },
  might: {
    suffix: 'ㄹ지도 모른다',
    negativeSuffix: '지 않을지도 모른다',
    meaning: 'possibility',
    tense: 'past',
  },
};

/** 조동사 목록 (감지용) */
export const MODAL_VERBS = new Set(Object.keys(MODAL_RULES));

/**
 * 한국어 조동사 패턴 → 영어 조동사 매핑
 *
 * Ko→En 번역 시 사용
 * 패턴은 긴 것부터 매칭해야 함 (ㄹ 수 있었다 > ㄹ 수 있다)
 */
export const KO_MODAL_PATTERNS: Array<{
  pattern: RegExp;
  modal: string;
  negative: boolean;
}> = [
  // 능력/가능 (긴 패턴부터)
  { pattern: /ㄹ 수 없었/, modal: "couldn't", negative: true },
  { pattern: /ㄹ 수 있었/, modal: 'could', negative: false },
  { pattern: /ㄹ 수 없/, modal: "can't", negative: true },
  { pattern: /ㄹ 수 있/, modal: 'can', negative: false },

  // 의무/당위
  { pattern: /하면 안 된/, modal: 'must not', negative: true },
  { pattern: /해야 했/, modal: 'had to', negative: false },
  { pattern: /해야 한/, modal: 'must', negative: false },
  { pattern: /해야 해/, modal: 'should', negative: false },
  { pattern: /하지 않아도 되/, modal: "don't have to", negative: true },
  { pattern: /하지 않아도 됐/, modal: "didn't have to", negative: true },

  // 미래/의지
  { pattern: /ㄹ 것이/, modal: 'will', negative: false },
  { pattern: /지 않을 것이/, modal: "won't", negative: true },

  // 추측/가능성
  { pattern: /ㄹ지도 모른/, modal: 'might', negative: false },
  { pattern: /지 않을지도 모른/, modal: 'might not', negative: true },
];

/**
 * Phase 5: 의존명사 패턴 (Bound Noun Patterns)
 * Ko→En 번역에서 특수한 문법 구조 처리
 */
export const KO_BOUND_NOUN_PATTERNS: Array<{
  pattern: RegExp;
  english: string;
  type: 'experience' | 'ability' | 'nominalization' | 'probability';
}> = [
  // -ㄴ 적 있다 (경험): have + past participle
  { pattern: /ㄴ 적 있/, english: 'have {PP}', type: 'experience' },
  { pattern: /ㄴ 적 없/, english: 'have never {PP}', type: 'experience' },
  { pattern: /은 적 있/, english: 'have {PP}', type: 'experience' },
  { pattern: /은 적 없/, english: 'have never {PP}', type: 'experience' },

  // -ㄹ 줄 알다 (능력/방법): know how to
  { pattern: /ㄹ 줄 알/, english: 'know how to {V}', type: 'ability' },
  { pattern: /ㄹ 줄 모르/, english: "don't know how to {V}", type: 'ability' },
  { pattern: /을 줄 알/, english: 'know how to {V}', type: 'ability' },
  { pattern: /을 줄 모르/, english: "don't know how to {V}", type: 'ability' },

  // -는 것 (명사화): -ing / what/that
  { pattern: /는 것/, english: '{-ING}', type: 'nominalization' },
  { pattern: /ㄴ 것/, english: 'what {S} {PP}', type: 'nominalization' },
  { pattern: /ㄹ 것/, english: 'what {S} will {V}', type: 'nominalization' },

  // -ㄹ 것 같다 (추측): seem to / probably
  { pattern: /ㄹ 것 같/, english: 'seem to {V}', type: 'probability' },
  { pattern: /ㄴ 것 같/, english: 'seem to have {PP}', type: 'probability' },
  { pattern: /는 것 같/, english: 'seem to be {-ING}', type: 'probability' },
];

// ============================================
// 5. 한국어 동사 어간 사전 (규칙 기반 활용)
// ============================================

/**
 * 동사 어간 → 영어 원형 매핑
 *
 * 이전: 활용형마다 하드코딩 (갔→go, 먹었→eat, ...)
 * 현재: 어간만 등록, 활용은 모음조화 규칙으로 자동 처리
 *
 * 규칙:
 * - 양성모음(ㅏ,ㅗ) + 았 → 과거
 * - 음성모음(그 외) + 었 → 과거
 * - 하다 → 했 (축약)
 */
export const VERB_STEMS: Record<string, string> = {
  // ============================================
  // 기본 동사 (어간 → 영어)
  // ============================================
  가: 'go',
  오: 'come',
  먹: 'eat',
  마시: 'drink',
  보: 'watch',
  듣: 'listen',
  읽: 'read',
  쓰: 'write',
  자: 'sleep',
  만들: 'make',
  사: 'buy',
  팔: 'sell',
  주: 'give',
  하: 'do',
  해: 'do', // 하다의 활용형
  되: 'become',
  있: 'have',
  없: 'not have',
  걷: 'walk',
  뛰: 'run',
  앉: 'sit',
  서: 'stand',
  놀: 'play',
  배우: 'learn',
  가르치: 'teach',
  일하: 'work',

  // ============================================
  // 일상 동사 확장 (순수 동사 어간만)
  // 참고: [명사]+하다 형태는 알고리즘으로 처리
  // ============================================
  일어나: 'wake up',
  일어서: 'stand up',
  눕: 'lie down',
  깨: 'wake',
  씻: 'wash',
  돌아오: 'come back',
  돌아가: 'go back',

  // 감정/상태 동사 (형용사적 동사)
  기쁘: 'be happy',
  슬프: 'be sad',
  화나: 'be angry',
  무섭: 'be scared',
  피곤하: 'be tired',
  배고프: 'be hungry',
  목마르: 'be thirsty',
  아프: 'be sick',

  // 인지/사고 동사
  알: 'know',
  모르: 'not know',
  잊: 'forget',
  믿: 'believe',

  // 의사소통 동사
  묻: 'ask',
  부르: 'call',

  // 이동 동사 확장
  걸어가: 'walk to',
  뛰어가: 'run to',
  날아가: 'fly',
  떨어지: 'fall',
  올라가: 'go up',
  내려가: 'go down',
  들어가: 'go in',
  나가: 'go out',

  // 생활 동작 동사
  입: 'wear',
  벗: 'take off',
  신: 'put on (shoes)',
  열: 'open',
  닫: 'close',
  켜: 'turn on',
  끄: 'turn off',
  찾: 'find',
  잃어버리: 'lose',
  만나: 'meet',
  헤어지: 'part',

  // Phase 2A: 다의어 동사 추가
  타: 'ride', // 기본값 ride, POLYSEMY_RULES에서 문맥에 따라 take/play 등으로 변경
  치: 'hit', // 기본값 hit, POLYSEMY_RULES에서 문맥에 따라 play 등으로 변경
  잡: 'catch',
  들: 'hold',
  맞: 'be correct',
  빠지: 'fall',
  나오: 'come out',
  오르: 'go up',
  내리: 'go down',
  풀: 'solve',
  찍: 'take',

  // 기타 빈번히 사용되는 동사
  도와주: 'help',
  기다리: 'wait',
  보내: 'send',
  받: 'receive',
  바꾸: 'change',
  고치: 'fix',
  끝나: 'end',
  시작하: 'start',
  계속하: 'continue',
  멈추: 'stop',
  포기하: 'give up',
  도전하: 'challenge',
  성공하: 'succeed',
  실패하: 'fail',
  적응하: 'adapt',
};

/**
 * 불규칙 활용 동사 (ㄷ불규칙, ㅂ불규칙 등)
 * 이들은 어간 변화가 있어 별도 처리 필요
 *
 * 주의: KO_VERB_CONTRACTIONS보다 먼저 체크되어야 함 (들었 → 듣다 vs 들다 충돌 방지)
 */
export const IRREGULAR_KO_VERBS: Record<string, { stem: string; en: string; type: string }> = {
  // ============================================
  // ㄷ불규칙: ㄷ → ㄹ (모음 어미 앞)
  // 듣다→들어, 걷다→걸어, 묻다→물어, 싣다→실어
  // ============================================
  들었: { stem: '듣', en: 'hear', type: 'ㄷ' },
  들어: { stem: '듣', en: 'hear', type: 'ㄷ' },
  들으: { stem: '듣', en: 'hear', type: 'ㄷ' },
  걸었: { stem: '걷', en: 'walk', type: 'ㄷ' },
  걸어: { stem: '걷', en: 'walk', type: 'ㄷ' },
  걸으: { stem: '걷', en: 'walk', type: 'ㄷ' },
  물었: { stem: '묻', en: 'ask', type: 'ㄷ' },
  물어: { stem: '묻', en: 'ask', type: 'ㄷ' },
  물으: { stem: '묻', en: 'ask', type: 'ㄷ' },
  실었: { stem: '싣', en: 'load', type: 'ㄷ' },
  실어: { stem: '싣', en: 'load', type: 'ㄷ' },
  깨달았: { stem: '깨닫', en: 'realize', type: 'ㄷ' },
  깨달아: { stem: '깨닫', en: 'realize', type: 'ㄷ' },

  // ============================================
  // ㅂ불규칙: ㅂ → 우 (모음 어미 앞)
  // 돕다→도와, 춥다→추워, 덥다→더워, 아름답다→아름다워
  // ============================================
  도왔: { stem: '돕', en: 'help', type: 'ㅂ' },
  도와: { stem: '돕', en: 'help', type: 'ㅂ' },
  추웠: { stem: '춥', en: 'be cold', type: 'ㅂ' },
  추워: { stem: '춥', en: 'be cold', type: 'ㅂ' },
  더웠: { stem: '덥', en: 'be hot', type: 'ㅂ' },
  더워: { stem: '덥', en: 'be hot', type: 'ㅂ' },
  아름다웠: { stem: '아름답', en: 'be beautiful', type: 'ㅂ' },
  아름다워: { stem: '아름답', en: 'be beautiful', type: 'ㅂ' },
  가까웠: { stem: '가깝', en: 'be close', type: 'ㅂ' },
  가까워: { stem: '가깝', en: 'be close', type: 'ㅂ' },
  무거웠: { stem: '무겁', en: 'be heavy', type: 'ㅂ' },
  무거워: { stem: '무겁', en: 'be heavy', type: 'ㅂ' },
  가벼웠: { stem: '가볍', en: 'be light', type: 'ㅂ' },
  가벼워: { stem: '가볍', en: 'be light', type: 'ㅂ' },
  쉬웠: { stem: '쉽', en: 'be easy', type: 'ㅂ' },
  쉬워: { stem: '쉽', en: 'be easy', type: 'ㅂ' },
  어려웠: { stem: '어렵', en: 'be difficult', type: 'ㅂ' },
  어려워: { stem: '어렵', en: 'be difficult', type: 'ㅂ' },

  // ============================================
  // ㅅ불규칙: ㅅ 탈락 (모음 어미 앞)
  // 짓다→지어, 낫다→나아, 잇다→이어, 긋다→그어
  // ============================================
  지었: { stem: '짓', en: 'build', type: 'ㅅ' },
  지어: { stem: '짓', en: 'build', type: 'ㅅ' },
  나았: { stem: '낫', en: 'recover', type: 'ㅅ' },
  나아: { stem: '낫', en: 'recover', type: 'ㅅ' },
  이었: { stem: '잇', en: 'connect', type: 'ㅅ' },
  이어: { stem: '잇', en: 'connect', type: 'ㅅ' },
  그었: { stem: '긋', en: 'draw', type: 'ㅅ' },
  그어: { stem: '긋', en: 'draw', type: 'ㅅ' },

  // ============================================
  // ㅎ불규칙: ㅎ 탈락 (모음 어미 앞)
  // 하얗다→하얘, 노랗다→노래, 파랗다→파래
  // ============================================
  하얬: { stem: '하얗', en: 'be white', type: 'ㅎ' },
  하얘: { stem: '하얗', en: 'be white', type: 'ㅎ' },
  노랬: { stem: '노랗', en: 'be yellow', type: 'ㅎ' },
  노래: { stem: '노랗', en: 'be yellow', type: 'ㅎ' },
  파랬: { stem: '파랗', en: 'be blue', type: 'ㅎ' },
  파래: { stem: '파랗', en: 'be blue', type: 'ㅎ' },
  빨갰: { stem: '빨갛', en: 'be red', type: 'ㅎ' },
  빨개: { stem: '빨갛', en: 'be red', type: 'ㅎ' },
  까맸: { stem: '까맣', en: 'be black', type: 'ㅎ' },
  까매: { stem: '까맣', en: 'be black', type: 'ㅎ' },

  // ============================================
  // 르불규칙: 르 → ㄹ라/ㄹ러 (아/어 어미 앞)
  // 모르다→몰라, 부르다→불러, 자르다→잘라
  // ============================================
  몰랐: { stem: '모르', en: 'not know', type: '르' },
  몰라: { stem: '모르', en: 'not know', type: '르' },
  불렀: { stem: '부르', en: 'call', type: '르' },
  불러: { stem: '부르', en: 'call', type: '르' },
  잘랐: { stem: '자르', en: 'cut', type: '르' },
  잘라: { stem: '자르', en: 'cut', type: '르' },
  골랐: { stem: '고르', en: 'choose', type: '르' },
  골라: { stem: '고르', en: 'choose', type: '르' },
  빨랐: { stem: '빠르', en: 'be fast', type: '르' },
  빨라: { stem: '빠르', en: 'be fast', type: '르' },
  흘렀: { stem: '흐르', en: 'flow', type: '르' },
  흘러: { stem: '흐르', en: 'flow', type: '르' },
  올랐: { stem: '오르', en: 'climb', type: '르' },
  올라: { stem: '오르', en: 'climb', type: '르' },

  // ============================================
  // ㄹ탈락: ㄹ 탈락 (ㄴ,ㅂ,ㅅ 어미 앞)
  // 살다→사니/삽니다, 알다→아니/압니다
  // 참고: 활용형이 아닌 어간 변화이므로 tokenizer에서 규칙으로 처리
  // ============================================
};

/**
 * 축약형 활용 (모음 탈락/축약으로 규칙 적용 어려운 경우)
 * 최소한으로 유지 - 규칙으로 처리 불가능한 것만
 */
export const KO_VERB_CONTRACTIONS: Array<[string, string, string, string]> = [
  // 모음 축약 (ㅏ+ㅏ→ㅏ, ㅗ+ㅏ→ㅘ 등)
  ['갔', '가', 'go', 'past'],
  ['왔', '오', 'come', 'past'],
  ['봤', '보', 'see', 'past'],
  ['줬', '주', 'give', 'past'],
  ['샀', '사', 'buy', 'past'],
  ['잤', '자', 'sleep', 'past'],
  ['썼', '쓰', 'write', 'past'],
  ['됐', '되', 'become', 'past'],
  ['했', '하', 'do', 'past'],
  // Phase 2A: 다의어 동사 축약형
  ['탔', '타', 'ride', 'past'], // 타다 과거
  ['쳤', '치', 'hit', 'past'], // 치다 과거
  ['잡았', '잡', 'catch', 'past'],
  // 주의: '들었'은 IRREGULAR_KO_VERBS에서 듣다(hear)로 매핑 (ㄷ불규칙)
  // '들다(hold)'의 과거형은 '들었'이 아닌 별도 활용 필요
  ['맞았', '맞', 'be correct', 'past'],
  ['빠졌', '빠지', 'fall', 'past'],
  ['나왔', '나오', 'come out', 'past'],
  ['올랐', '오르', 'go up', 'past'],
  ['내렸', '내리', 'go down', 'past'],
  ['풀었', '풀', 'solve', 'past'],
  ['찍었', '찍', 'take', 'past'],
];

/** 활용형 → [어간, 영어, 시제] 빠른 조회 (축약형 + 불규칙) */
export const KO_VERB_MAP = new Map([
  ...KO_VERB_CONTRACTIONS.map(([conj, stem, en, tense]) => [conj, { stem, en, tense }] as const),
  ...Object.entries(IRREGULAR_KO_VERBS).map(
    ([conj, info]) => [conj, { stem: info.stem, en: info.en, tense: 'past' }] as const,
  ),
]);

// ============================================
// 6. 숫자/분류사
// ============================================

/** 분류사: [한국어, 영어 단수, 영어 복수] */
export const COUNTERS: Array<[string, string, string]> = [
  ['개', '', 's'],
  ['마리', '', 's'],
  ['명', 'person', 'people'],
  ['권', 'book', 'books'],
  ['잔', 'cup', 'cups'],
  ['병', 'bottle', 'bottles'],
  ['대', '', 's'],
];

/** 한국어 숫자 */
export const KO_NUMBERS: Record<string, number> = {
  하나: 1,
  둘: 2,
  셋: 3,
  넷: 4,
  다섯: 5,
  여섯: 6,
  일곱: 7,
  여덟: 8,
  아홉: 9,
  열: 10,
  한: 1,
  두: 2,
  세: 3,
  네: 4,
};

// ============================================
// 6. 관용구/숙어 (통문장)
// ============================================

/** 관용구: 통문장 매칭 */
export const IDIOMS_KO_EN: Record<string, string> = {
  // 속담
  '티끌 모아 태산': 'Every little bit counts',
  '눈 감아주다': 'let it slide',
  '발 뻗고 자다': 'sleep in peace',
  '야 진짜 대박': 'OMG',

  // === 인사 ===
  안녕: 'Hi',
  안녕하세요: 'Hello',
  안녕하십니까: 'Hello',
  '안녕히 가세요': 'Goodbye',
  '안녕히 계세요': 'Goodbye',
  '잘 가': 'Bye',
  '잘 가요': 'Bye',
  '좋은 아침': 'Good morning',
  '좋은 아침이에요': 'Good morning',
  '좋은 아침입니다': 'Good morning',
  반가워: 'Nice to meet you',
  반가워요: 'Nice to meet you',
  반갑습니다: 'Nice to meet you',
  '만나서 반갑습니다': 'Nice to meet you',
  '잘 지내': 'How are you',
  '잘 지내요': 'How are you',
  '어떻게 지내세요': 'How are you',

  // === 감사/사과 ===
  고마워: 'Thanks',
  고마워요: 'Thank you',
  감사합니다: 'Thank you',
  '정말 고마워': 'Thank you very much',
  '정말 감사합니다': 'Thank you very much',
  '대단히 감사합니다': 'Thank you very much',
  별말을: "You're welcome",
  천만에요: "You're welcome",
  미안해: 'Sorry',
  미안해요: "I'm sorry",
  죄송합니다: "I'm sorry",
  죄송해요: "I'm sorry",
  실례합니다: 'Excuse me',
  실례해요: 'Excuse me',

  // === 응답 ===
  응: 'Yes',
  네: 'Yes',
  예: 'Yes',
  아니: 'No',
  아니요: 'No',
  아닙니다: 'No',
  그래: 'Okay',
  그래요: 'Okay',
  알았어: 'Okay',
  알았어요: 'Okay',
  알겠습니다: 'Okay',
  물론: 'Of course',
  물론이죠: 'Of course',
  물론입니다: 'Of course',
  당연하지: 'Of course',
  당연하죠: 'Of course',

  // === 일상 표현 ===
  '잘 자': 'Good night',
  '잘 자요': 'Good night',
  '안녕히 주무세요': 'Good night',
  수고하세요: 'Take care',
  수고했어: 'Good job',
  수고했어요: 'Good job',
  수고하셨습니다: 'Good job',
  화이팅: 'Good luck',
  파이팅: 'Good luck',
  힘내: 'Cheer up',
  힘내요: 'Cheer up',
  힘내세요: 'Cheer up',
  축하해: 'Congratulations',
  축하해요: 'Congratulations',
  축하합니다: 'Congratulations',
};

/**
 * 영→한 관용구 사전 (Formality별)
 *
 * 각 관용구는 5가지 formality에 맞는 번역을 제공
 * - casual: 반말
 * - formal: 존댓말
 * - neutral: 기본 (상관없음)
 * - friendly: 친근체
 * - literal: 번역체
 */
export const IDIOMS_EN_KO: Record<string, FormalityMap> = {
  // === 인사 ===
  hello: {
    casual: '안녕',
    formal: '안녕하세요',
    neutral: '안녕하세요',
    friendly: '안녕~',
    literal: '인사드립니다',
  },
  hi: {
    casual: '안녕',
    formal: '안녕하세요',
    neutral: '안녕',
    friendly: '안녕~',
    literal: '인사드립니다',
  },
  'good morning': {
    casual: '좋은 아침',
    formal: '좋은 아침이에요',
    neutral: '좋은 아침이에요',
    friendly: '좋은 아침~',
    literal: '좋은 아침입니다',
  },
  'good afternoon': {
    casual: '안녕',
    formal: '안녕하세요',
    neutral: '안녕하세요',
    friendly: '안녕~',
    literal: '좋은 오후입니다',
  },
  'good evening': {
    casual: '안녕',
    formal: '안녕하세요',
    neutral: '안녕하세요',
    friendly: '안녕~',
    literal: '좋은 저녁입니다',
  },
  goodbye: {
    casual: '잘 가',
    formal: '안녕히 가세요',
    neutral: '안녕히 가세요',
    friendly: '잘 가~',
    literal: '작별 인사드립니다',
  },
  bye: {
    casual: '잘 가',
    formal: '안녕히 가세요',
    neutral: '잘 가요',
    friendly: '잘 가~',
    literal: '작별 인사드립니다',
  },
  'nice to meet you': {
    casual: '반가워',
    formal: '만나서 반갑습니다',
    neutral: '반가워요',
    friendly: '반가워~',
    literal: '만나 뵙게 되어 영광입니다',
  },
  'how are you': {
    casual: '잘 지내',
    formal: '어떻게 지내세요',
    neutral: '잘 지내요',
    friendly: '잘 지내~?',
    literal: '안녕하십니까',
  },

  // === 감사/사과 ===
  'thank you': {
    casual: '고마워',
    formal: '감사합니다',
    neutral: '고마워요',
    friendly: '고마워~',
    literal: '감사드립니다',
  },
  thanks: {
    casual: '고마워',
    formal: '감사합니다',
    neutral: '고마워요',
    friendly: '고마워~',
    literal: '감사드립니다',
  },
  'thank you very much': {
    casual: '정말 고마워',
    formal: '정말 감사합니다',
    neutral: '정말 고마워요',
    friendly: '정말 고마워~',
    literal: '대단히 감사드립니다',
  },
  "you're welcome": {
    casual: '별말을',
    formal: '천만에요',
    neutral: '천만에요',
    friendly: '별말을~',
    literal: '천만의 말씀입니다',
  },
  "i'm sorry": {
    casual: '미안해',
    formal: '죄송합니다',
    neutral: '미안해요',
    friendly: '미안~',
    literal: '사과드립니다',
  },
  sorry: {
    casual: '미안해',
    formal: '죄송합니다',
    neutral: '미안해요',
    friendly: '미안~',
    literal: '사과드립니다',
  },
  'excuse me': {
    casual: '잠깐',
    formal: '실례합니다',
    neutral: '실례해요',
    friendly: '잠깐~',
    literal: '실례를 무릅쓰고 말씀드립니다',
  },

  // === 응답 ===
  yes: {
    casual: '응',
    formal: '네',
    neutral: '네',
    friendly: '응~',
    literal: '예',
  },
  no: {
    casual: '아니',
    formal: '아니요',
    neutral: '아니요',
    friendly: '아니~',
    literal: '아닙니다',
  },
  okay: {
    casual: '알았어',
    formal: '알겠습니다',
    neutral: '알겠어요',
    friendly: '알았어~',
    literal: '알겠습니다',
  },
  ok: {
    casual: '알았어',
    formal: '알겠습니다',
    neutral: '알겠어요',
    friendly: '알았어~',
    literal: '알겠습니다',
  },
  'of course': {
    casual: '당연하지',
    formal: '물론이죠',
    neutral: '물론이에요',
    friendly: '당연하지~',
    literal: '물론입니다',
  },
  maybe: {
    casual: '아마',
    formal: '아마도요',
    neutral: '아마도요',
    friendly: '아마~',
    literal: '아마도 그럴 것입니다',
  },
  "i don't know": {
    casual: '몰라',
    formal: '모르겠습니다',
    neutral: '모르겠어요',
    friendly: '몰라~',
    literal: '알지 못합니다',
  },
  'i understand': {
    casual: '알았어',
    formal: '알겠습니다',
    neutral: '알겠어요',
    friendly: '알았어~',
    literal: '이해했습니다',
  },

  // === 일상 표현 ===
  'i love you': {
    casual: '사랑해',
    formal: '사랑합니다',
    neutral: '사랑해요',
    friendly: '사랑해~',
    literal: '사랑합니다',
  },
  'please help me': {
    casual: '도와줘',
    formal: '도와주세요',
    neutral: '도와주세요',
    friendly: '도와줘~',
    literal: '도움을 요청드립니다',
  },
  congratulations: {
    casual: '축하해',
    formal: '축하드립니다',
    neutral: '축하해요',
    friendly: '축하해~',
    literal: '축하드립니다',
  },
  'happy birthday': {
    casual: '생일 축하해',
    formal: '생일 축하드립니다',
    neutral: '생일 축하해요',
    friendly: '생일 축하해~',
    literal: '생신을 축하드립니다',
  },
  'happy new year': {
    casual: '새해 복 많이 받아',
    formal: '새해 복 많이 받으세요',
    neutral: '새해 복 많이 받으세요',
    friendly: '새해 복 많이 받아~',
    literal: '새해에 복을 많이 받으시길 바랍니다',
  },

  // === 숙어/관용구 ===
  'every little bit counts': {
    casual: '티끌 모아 태산',
    formal: '티끌 모아 태산이에요',
    neutral: '티끌 모아 태산',
    friendly: '티끌 모아 태산~',
    literal: '작은 것이 모여 큰 것이 됩니다',
  },
  'let it slide': {
    casual: '눈 감아줘',
    formal: '눈 감아주세요',
    neutral: '눈 감아줘요',
    friendly: '눈 감아줘~',
    literal: '넘어가 주세요',
  },
  'sleep in peace': {
    casual: '발 뻗고 자',
    formal: '편히 주무세요',
    neutral: '편히 자요',
    friendly: '발 뻗고 자~',
    literal: '평안히 주무시기 바랍니다',
  },
};

// ============================================
// 7. [명사]+하다 동사화 매핑 (Noun-to-Verb for 하다 pattern)
// ============================================

/**
 * 명사 + 하다 → 영어 동사 변환
 *
 * 대부분의 [명사]+하다는 명사 번역을 그대로 동사로 사용 가능
 * (exercise하다 → exercise, study하다 → study)
 *
 * 이 사전은 명사 번역과 동사 번역이 다른 특별한 경우만 정의
 * 예: 노래하다 → sing (not "song")
 *
 * 일반화된 패턴:
 * 1. NOUN_TO_VERB[명사]가 있으면 사용
 * 2. 없으면 KO_EN[명사]를 동사로 그대로 사용
 */
export const NOUN_TO_VERB: Record<string, string> = {
  // 명사 번역과 동사 번역이 다른 경우만 정의
  노래: 'sing', // song → sing
  전화: 'call', // phone → call
  춤: 'dance', // dance → dance (같지만 명시)
  요리: 'cook', // cooking/dish → cook
  청소: 'clean', // cleaning → clean
  빨래: 'do laundry', // laundry → do laundry
  설거지: 'do the dishes', // dishes → do the dishes
  운전: 'drive', // driving → drive
  수영: 'swim', // swimming → swim
  등산: 'hike', // hiking → hike
  쇼핑: 'shop', // shopping → shop
  말: 'speak', // word → speak
  인사: 'greet', // greeting → greet
  사인: 'sign', // signature → sign
  사랑: 'love', // love → love (같지만 명시)
  결혼: 'marry', // marriage → marry
  이혼: 'divorce', // divorce → divorce
  졸업: 'graduate', // graduation → graduate
  입학: 'enroll', // enrollment → enroll
  출발: 'depart', // departure → depart
  도착: 'arrive', // arrival → arrive
  시작: 'start', // start → start
  끝: 'end', // end → end
  질문: 'ask', // question → ask
  대답: 'answer', // answer → answer
  선택: 'choose', // choice → choose
  결정: 'decide', // decision → decide
  발표: 'present', // presentation → present
  연습: 'practice', // practice → practice
  준비: 'prepare', // preparation → prepare
  계획: 'plan', // plan → plan
  약속: 'promise', // promise → promise
  희망: 'hope', // hope → hope
  걱정: 'worry', // worry → worry
  기대: 'expect', // expectation → expect
  실망: 'disappoint', // disappointment → disappoint
  성공: 'succeed', // success → succeed
  실패: 'fail', // failure → fail
};

// ============================================
// 8. 동사-전치사 결합 (Verb + Preposition)
// ============================================

/**
 * 특정 동사가 목적어와 함께 쓰일 때 필요한 전치사
 *
 * 일반화된 규칙:
 * - listen + O → listen to O (듣다 + 목적어)
 * - look + O → look at O (보다 + 목적어, 주시할 때)
 * - wait + O → wait for O (기다리다 + 목적어)
 *
 * 이 패턴은 모든 해당 동사+목적어 조합에 적용됨
 */
export const VERB_PREPOSITIONS: Record<string, string> = {
  listen: 'to',
  look: 'at',
  wait: 'for',
  search: 'for',
  ask: 'for',
  care: 'about',
  think: 'about',
  talk: 'about',
  dream: 'about',
  worry: 'about',
  belong: 'to',
  refer: 'to',
  apologize: 'for',
  apply: 'for',
  depend: 'on',
  rely: 'on',
  insist: 'on',
  agree: 'with',
  deal: 'with',
};

// ============================================
// 9. 명사 문맥 힌트 매핑 (Noun Context Mapping)
// ============================================

/**
 * 명사의 문맥 기반 다의어 분기
 *
 * 일반화 규칙:
 * - 같은 한국어 명사도 주변 단어(동사, 형용사, 장소)에 따라 다른 영어로 번역
 * - default: 기본 번역 (힌트가 없을 때)
 * - hints: 주변 단어 → 번역 매핑
 *
 * 예시:
 * - "운동" + "헬스장" → "workout" (vs default "exercise")
 * - "운동" + "축구" → "sports" (vs default "exercise")
 *
 * 사용법:
 * 1. 문장의 모든 토큰 어간 수집
 * 2. NOUN_CONTEXT[명사]의 hints 키와 매칭
 * 3. 매칭되면 해당 번역 사용, 없으면 default 사용
 *
 * 이 패턴은 일반화된 알고리즘으로, 모든 유사 문장에 적용됨
 */
export interface NounContextRule {
  /** 기본 번역 (힌트 없을 때) */
  default: string;
  /** 문맥 힌트 → 번역 매핑 */
  hints: Record<string, string>;
}

export const NOUN_CONTEXT: Record<string, NounContextRule> = {
  // ============================================
  // 신체 활동 관련
  // ============================================
  운동: {
    default: 'exercise',
    hints: {
      // 장소 힌트
      헬스장: 'workout',
      체육관: 'workout',
      피트니스: 'workout',
      짐: 'workout',
      // 스포츠 힌트
      축구: 'sports',
      야구: 'sports',
      농구: 'sports',
      경기: 'sports',
      시합: 'sports',
      대회: 'sports',
      선수: 'sports',
      팀: 'sports',
      // 훈련 힌트
      훈련: 'training',
      코치: 'training',
      연습: 'training',
      강화: 'training',
      // 일반 건강
      건강: 'physical activity',
      다이어트: 'exercise',
    },
  },

  // ============================================
  // 학습/교육 관련
  // ============================================
  공부: {
    default: 'study',
    hints: {
      // 시험 관련
      시험: 'study',
      수능: 'study',
      고시: 'study',
      // 연구 관련
      연구: 'research',
      논문: 'research',
      박사: 'research',
      // 학습
      학교: 'study',
      학원: 'study',
      과목: 'study',
    },
  },

  수업: {
    default: 'class',
    hints: {
      // 학교 수업
      학교: 'class',
      학생: 'class',
      선생님: 'class',
      // 강의
      대학: 'lecture',
      교수: 'lecture',
      강의실: 'lecture',
      // 레슨
      피아노: 'lesson',
      기타: 'lesson',
      영어: 'lesson',
      개인: 'lesson',
    },
  },

  // ============================================
  // 음식/요리 관련
  // ============================================
  음식: {
    default: 'food',
    hints: {
      // 요리
      요리: 'dish',
      레시피: 'dish',
      맛있: 'dish',
      // 식사
      아침: 'meal',
      점심: 'meal',
      저녁: 'meal',
      식사: 'meal',
      // 음식 일반
      배고프: 'food',
      먹: 'food',
    },
  },

  // ============================================
  // 기타 다의어 명사
  // ============================================
  장소: {
    default: 'place',
    hints: {
      여행: 'destination',
      관광: 'destination',
      방문: 'location',
      위치: 'location',
      건물: 'site',
      공사: 'site',
    },
  },

  사람: {
    default: 'person',
    hints: {
      많: 'people',
      여러: 'people',
      모든: 'people',
      인간: 'human',
      인류: 'human',
    },
  },

  시간: {
    default: 'time',
    hints: {
      몇: 'hour',
      오래: 'time',
      순간: 'moment',
      찰나: 'moment',
      기간: 'period',
      동안: 'period',
    },
  },

  이야기: {
    default: 'story',
    hints: {
      책: 'story',
      소설: 'story',
      동화: 'story',
      대화: 'talk',
      상담: 'talk',
      논의: 'discussion',
      회의: 'discussion',
    },
  },

  문제: {
    default: 'problem',
    hints: {
      시험: 'question',
      문제집: 'question',
      풀: 'question',
      수학: 'question',
      사회: 'issue',
      환경: 'issue',
      정치: 'issue',
    },
  },

  일: {
    default: 'work',
    hints: {
      회사: 'work',
      직장: 'work',
      업무: 'work',
      사건: 'matter',
      어려운: 'matter',
      중요한: 'matter',
      하루: 'day',
      매일: 'day',
      오늘: 'day',
    },
  },
};

// ============================================
// 복합어/관용어 사전 (Ko→En)
// 띄어쓰기 유무와 상관없이 통째로 매칭
// ============================================

/**
 * 복합어/관용어 사전
 *
 * 형태: { pattern: translation }
 * pattern은 정규표현식 패턴으로 변환됨
 * - 공백을 \s*로 대체 (띄어쓰기 유무 모두 매칭)
 * - ㅂ불규칙 활용 포함
 */
export const COMPOUND_EXPRESSIONS: Record<string, string> = {
  // === 배고프다 계열 (ㅂ불규칙 형용사) ===
  // 기본형 + 활용형 모두 포함
  배고프다: "I'm hungry",
  배고파: "I'm hungry",
  배고파요: "I'm hungry",
  배고픕니다: "I'm hungry",
  '배가 고프다': "I'm hungry",
  '배가 고파': "I'm hungry",
  '배가 고파요': "I'm hungry",
  '배가 고픕니다': "I'm hungry",

  // === 목마르다 계열 (르불규칙 형용사) ===
  목마르다: "I'm thirsty",
  목말라: "I'm thirsty",
  목말라요: "I'm thirsty",
  목마릅니다: "I'm thirsty",
  '목이 마르다': "I'm thirsty",
  '목이 말라': "I'm thirsty",

  // === 배부르다 계열 (르불규칙 형용사) ===
  배부르다: "I'm full",
  배불러: "I'm full",
  배불러요: "I'm full",
  배부릅니다: "I'm full",
  '배가 부르다': "I'm full",
  '배가 불러': "I'm full",

  // === 피곤하다 계열 ===
  피곤하다: "I'm tired",
  피곤해: "I'm tired",
  피곤해요: "I'm tired",
  피곤합니다: "I'm tired",

  // === 아프다 계열 (ㅡ탈락) ===
  아프다: "I'm sick",
  아파: "I'm sick",
  아파요: "I'm sick",
  아픕니다: "I'm sick",
  '머리가 아프다': 'I have a headache',
  '머리가 아파': 'I have a headache',
  '배가 아프다': 'My stomach hurts',
  '배가 아파': 'My stomach hurts',
};

/**
 * 복합어 패턴 목록 (긴 것부터 정렬)
 * 긴 패턴이 먼저 매칭되어야 부분 매칭 방지
 */
export const COMPOUND_PATTERNS = Object.keys(COMPOUND_EXPRESSIONS).sort(
  (a, b) => b.length - a.length,
);

/**
 * 복합어 매칭 함수
 * @param text 입력 텍스트
 * @returns 매칭된 복합어 정보 또는 null
 */
export function matchCompoundExpression(
  text: string,
): { pattern: string; translation: string; remaining: string } | null {
  const normalized = text.trim();

  for (const pattern of COMPOUND_PATTERNS) {
    // 공백을 유연하게 매칭 (띄어쓰기 유무 모두)
    const regexPattern = pattern.replace(/\s+/g, '\\s*');
    const regex = new RegExp(`^${regexPattern}`, 'u');

    const match = normalized.match(regex);
    if (match) {
      const translation = COMPOUND_EXPRESSIONS[pattern];
      const remaining = normalized.slice(match[0].length).trim();
      return { pattern, translation: translation || '', remaining };
    }
  }

  return null;
}

// ============================================
// 영→한 전용 매핑 (index.ts에서 분리)
// ============================================

/** 영어 형용사 → 한국어 형용사 매핑 */
export const EN_ADJECTIVES: Record<string, string> = {
  tall: '높',
  big: '크',
  small: '작',
  good: '좋',
  bad: '나쁘',
  fast: '빠르',
  slow: '느리',
  expensive: '비싸',
  cheap: '싸',
  beautiful: '아름다',
  happy: '행복하',
  tired: '피곤하',
  important: '중요하',
  hot: '덥',
  cold: '차',
  nice: '좋',
  hurt: '아프',
  sick: '아프',
  sad: '슬프',
  angry: '화나',
  hungry: '배고프',
  thirsty: '목마르',
  busy: '바쁘',
  free: '한가하',
  easy: '쉽',
  hard: '어렵',
  difficult: '어렵',
};

/** 영어 → 한국어 장소/명사 매핑 */
export const EN_NOUNS: Record<string, string> = {
  me: '나',
  you: '너',
  him: '그',
  her: '그녀',
  class: '반',
  school: '학교',
  friend: '친구',
  Seoul: '서울',
  Busan: '부산',
  train: '기차',
  baby: '아기',
  letter: '편지',
  window: '창문',
  door: '문',
  house: '집',
  room: '방',
  book: '책',
  pen: '펜',
  car: '차',
  bus: '버스',
  bird: '새',
  dog: '개',
  cat: '고양이',
  girl: '소녀',
  boy: '소년',
  man: '남자',
  woman: '여자',
  child: '아이',
  thing: '것',
  money: '돈',
  table: '탁자',
  desk: '책상',
  phone: '전화',
  water: '물',
  food: '음식',
  time: '시간',
  day: '날',
  night: '밤',
  morning: '아침',
  evening: '저녁',
  Korea: '한국',
  korea: '한국',
  Japan: '일본',
  japan: '일본',
  China: '중국',
  china: '중국',
  America: '미국',
  america: '미국',
  song: '노래',
  work: '일',
  flower: '꽃',
  building: '건물',
  word: '말',
  peace: '평화',
};

/** 영어 → 한국어 동사 매핑 */
export const EN_VERBS: Record<string, string> = {
  love: '사랑하다',
  hate: '싫어하다',
  like: '좋아하다',
  want: '원하다',
  need: '필요하다',
  go: '가다',
  come: '오다',
  eat: '먹다',
  drink: '마시다',
  sleep: '자다',
  study: '공부하다',
  work: '일하다',
  play: '놀다',
  watch: '보다',
  see: '보다',
  listen: '듣다',
  hear: '듣다',
  speak: '말하다',
  read: '읽다',
  write: '쓰다',
  buy: '사다',
  sell: '팔다',
  give: '주다',
  take: '가지다',
  make: '만들다',
  do: '하다',
  run: '뛰다',
  walk: '걷다',
  sit: '앉다',
  stand: '서다',
  help: '돕다',
  swim: '수영하다',
  break: '깨다',
  close: '닫다',
  open: '열다',
  use: '사용하다',
  meet: '만나다',
  know: '알다',
  think: '생각하다',
  feel: '느끼다',
  say: '말하다',
  tell: '말하다',
  ask: '묻다',
  rest: '쉬다',
  cook: '요리하다',
  travel: '여행하다',
  call: '전화하다',
  sing: '부르다',
  sings: '부르다',
  leave: '떠나다',
};

/** 한국어 동사 → 영어 동사 매핑 */
export const KO_VERBS: Record<string, string> = {
  도착하: 'arrive',
  도착: 'arrive',
  일하: 'work',
  떠나: 'leave',
  시작하: 'start',
  시작: 'start',
  끝나: 'end',
  끝: 'end',
  알: 'know',
  오: 'come',
  가: 'go',
  자: 'sleep',
  잠: 'sleep',
  읽: 'read',
  쓰: 'write',
  듣: 'listen',
  먹: 'eat',
  마시: 'drink',
  만나: 'meet',
  뛰: 'run',
  걷: 'walk',
  깨: 'break',
  실패하: 'fail',
  성공하: 'succeed',
  돕: 'help',
  수영하: 'swim',
  공부하: 'study',
  보: 'watch',
  살: 'live',
  사: 'buy',
  팔: 'sell',
  좋아하: 'like',
  싫어하: 'hate',
  사랑하: 'love',
  배우: 'learn',
  전화하: 'call',
  부르: 'sing',
  노래하: 'sing',
  후회하: 'regret',
  하: 'do',
  결정하: 'decide',
  풀: 'solve',
  푸: 'solve', // ㄹ-irregular: 풀다 + 는 → 푸는 (ㄹ dropped before ㄴ/ㅅ)
  울: 'cry',
  우: 'cry', // ㄹ-irregular: 울다 + 는 → 우는
};

/** 한국어 명사 → 영어 명사 매핑 */
export const KO_NOUNS: Record<string, string> = {
  친구: 'friend',
  의사: 'doctor',
  서울: 'Seoul',
  부산: 'Busan',
  새: 'bird',
  아침: 'morning',
  날: 'day',
  나: 'me',
  커피: 'coffee',
  학교: 'school',
  책: 'book',
  기차: 'train',
  버스: 'bus',
  소녀: 'girl',
  소년: 'boy',
  창문: 'window',
  문: 'door',
  집: 'house',
  방: 'room',
  아기: 'baby',
  편지: 'letter',
  것: 'thing',
  돈: 'money',
  탁자: 'table',
  책상: 'desk',
  전화: 'phone',
  물: 'water',
  음식: 'food',
  시간: 'time',
  밤: 'night',
  저녁: 'evening',
  고양이: 'cat',
  개: 'dog',
  남자: 'man',
  여자: 'woman',
  아이: 'child',
  그녀: 'she',
  그: 'he',
  꽃: 'flower',
  건물: 'building',
  일: 'work',
  말: 'word',
  사람: 'person',
  분: 'person',
};
