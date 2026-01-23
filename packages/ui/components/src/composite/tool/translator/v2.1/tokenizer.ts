/**
 * 번역기 v3 토크나이저
 * 입력 텍스트를 토큰으로 분리하고 역할 부여
 *
 * @filesize ~4,200 lines
 *
 * 파이프라인 v3 개선사항:
 * - 유사도 검색 제거 (할루시네이션 방지)
 * - 규칙 기반 형태소 분석 강화
 * - 미인식 단어는 원문 유지 (추측하지 않음)
 * - WSD 통합 (다의어 해소)
 * - morphology 모듈 통합 (리팩토링)
 *
 * TODO(refactor): 이 파일은 4K+ 줄로 분할 고려 대상입니다.
 * 제안되는 모듈 구조:
 * - tokenizer/index.ts - 메인 토크나이저
 * - tokenizer/korean.ts - 한국어 형태소 분석
 * - tokenizer/english.ts - 영어 토큰화
 * - tokenizer/particles.ts - 조사/어미 처리
 */

import { decompose, getBatchim } from '@soundblue/hangul';
import {
  disambiguate,
  isPolysemous,
  koToEnWords,
  tryExtractContracted,
  tryExtractCopula,
} from '@soundblue/translator';
import {
  COUNTERS,
  ENDINGS,
  IRREGULAR_KO_VERBS,
  KO_EN,
  KO_NUMBERS,
  KO_SIMPLE_ADVERBS,
  KO_VERB_MAP,
  matchCompoundExpression,
  NOUN_TO_VERB,
  PARTICLES,
  VERB_STEMS,
} from './data';
import { addKoreanRieul } from './korean-utils';
import type { ParsedSentence, Role, SentenceType, Tense, Token, TokenStrategy } from './types';

// ============================================
// WSD 통합 (다의어 해소)
// ============================================

/**
 * WSD를 사용한 단어 번역
 *
 * 번역 우선순위:
 * 1. 기본 사전 (대명사, 기본 어휘 - WSD 불필요)
 * 2. WSD (다의어 - 문맥 기반 의미 결정)
 *
 * @param word 한국어 단어
 * @param context 문맥 (전체 문장 또는 주변 토큰)
 * @returns 영어 번역 또는 undefined
 */
function translateWithWSD(word: string, context?: string): string | undefined {
  // 1. 기본 사전 우선 조회 (대명사, 기본 어휘는 WSD 제외)
  // v2.1 사전과 core 사전 모두 확인
  const directTranslation = KO_EN[word] || koToEnWords[word];
  if (directTranslation) {
    return directTranslation;
  }

  // 2. 다의어인지 확인 (사전에 없는 경우만)
  if (isPolysemous(word)) {
    // WSD를 통해 의미 결정
    const contextWindow = {
      before: [],
      after: [],
      full: context || word,
    };
    const wsdResult = disambiguate(word, contextWindow, null, context);
    if (wsdResult) {
      return wsdResult.sense.en;
    }
  }

  return undefined;
}

// ============================================
// 영어 -ing 타입 분류 (Phase 2)
// ============================================

/**
 * -ing 형태의 문법적 타입
 *
 * PROGRESSIVE: 진행형 (is/are/was/were + Ving) → "-고 있다"
 * PARTICIPLE: 현재분사 (수식) → "-는"
 * GERUND_PREP: 전치사 목적어 (while/after/before + Ving) → "-면서", "-한 후", "-하기 전"
 * GERUND_NOUN: 동명사 (주어/목적어 위치) → "-기", "-음"
 */
export type IngType = 'PROGRESSIVE' | 'PARTICIPLE' | 'GERUND_PREP' | 'GERUND_NOUN';

/**
 * -ing 단어의 문법적 타입 분류
 *
 * @param words 전체 단어 배열
 * @param index -ing 단어의 인덱스
 * @returns -ing 타입 및 관련 정보
 */
export function getIngType(
  words: string[],
  index: number,
): { type: IngType; koreanForm: string; preposition?: string } {
  const _word = words[index];
  const prevWord = index > 0 ? words[index - 1].toLowerCase() : '';
  const prevPrevWord = index > 1 ? words[index - 2].toLowerCase() : '';
  const nextWord = index < words.length - 1 ? words[index + 1]?.toLowerCase() : '';

  // 1. 진행형 체크: be동사 + -ing
  const beVerbs = ['am', 'is', 'are', 'was', 'were', 'been', 'being'];
  if (beVerbs.includes(prevWord)) {
    return { type: 'PROGRESSIVE', koreanForm: '-고 있다' };
  }
  // "have been + -ing" (현재완료 진행형)
  if (prevWord === 'been' && ['have', 'has', 'had'].includes(prevPrevWord)) {
    return { type: 'PROGRESSIVE', koreanForm: '-고 있었다' };
  }

  // 2. 전치사 + -ing: 동명사 (전치사 목적어)
  const prepMappings: Record<string, string> = {
    while: '-면서',
    whilst: '-면서',
    after: '-한 후',
    before: '-하기 전에',
    by: '-함으로써',
    without: '-하지 않고',
    instead: '-하는 대신',
    of: '-하는 것의', // "instead of", "tired of" 등
    about: '-하는 것에 대해',
    for: '-하기 위해',
    on: '-하자마자', // "on arriving"
    upon: '-하자마자',
    in: '-하는 중에',
    from: '-하는 것으로부터',
    to: '-하는 것에', // "look forward to Ving"
  };

  if (prepMappings[prevWord]) {
    return {
      type: 'GERUND_PREP',
      koreanForm: prepMappings[prevWord],
      preposition: prevWord,
    };
  }

  // 복합 전치사 처리: "instead of", "tired of", "look forward to" 등
  if (prevWord === 'of') {
    if (prevPrevWord === 'instead') {
      return { type: 'GERUND_PREP', koreanForm: '-하는 대신', preposition: 'instead of' };
    }
    if (prevPrevWord === 'tired') {
      return { type: 'GERUND_PREP', koreanForm: '-하는 것에 지쳐', preposition: 'tired of' };
    }
    if (prevPrevWord === 'afraid') {
      return { type: 'GERUND_PREP', koreanForm: '-하는 것이 두려워', preposition: 'afraid of' };
    }
    if (prevPrevWord === 'capable') {
      return { type: 'GERUND_PREP', koreanForm: '-할 수 있는', preposition: 'capable of' };
    }
  }

  if (prevWord === 'to') {
    // "look forward to Ving", "be used to Ving" 등
    if (prevPrevWord === 'forward' || prevPrevWord === 'used' || prevPrevWord === 'accustomed') {
      return {
        type: 'GERUND_PREP',
        koreanForm: '-하는 것에 익숙한',
        preposition: `${prevPrevWord} to`,
      };
    }
  }

  // 3. 현재분사 체크: -ing + 명사 (수식)
  // 예: "eating apple", "running water", "singing bird"
  // 단, 명사가 아닌 경우는 제외
  const commonNouns = [
    'man',
    'woman',
    'person',
    'people',
    'child',
    'children',
    'student',
    'teacher',
    'dog',
    'cat',
    'bird',
    'car',
    'bus',
    'train',
    'water',
    'food',
    'apple',
    'movie',
    'book',
    'room',
    'house',
    'tree',
    'flower',
    'song',
    'music',
    'game',
    'ball',
  ];
  if (nextWord && commonNouns.includes(nextWord)) {
    return { type: 'PARTICIPLE', koreanForm: '-는' };
  }

  // 4. 동명사 (주어/목적어 위치)
  // 문장 시작 또는 동사 뒤
  const mainVerbs = [
    'like',
    'love',
    'hate',
    'enjoy',
    'finish',
    'stop',
    'start',
    'begin',
    'keep',
    'continue',
    'avoid',
    'consider',
    'suggest',
    'recommend',
    'mind',
    'imagine',
    'practice',
    'deny',
    'admit',
    'appreciate',
    'prefer',
    'dislike',
  ];

  if (index === 0) {
    // 문장 시작: 동명사 (주어)
    return { type: 'GERUND_NOUN', koreanForm: '-기' };
  }

  if (mainVerbs.includes(prevWord)) {
    // 동사 + -ing: 동명사 (목적어)
    return { type: 'GERUND_NOUN', koreanForm: '-기' };
  }

  // 기본값: 문맥 불명확 시 동명사로 처리
  return { type: 'GERUND_NOUN', koreanForm: '-기' };
}

/**
 * -ing 단어의 어간(stem) 추출
 *
 * @param ingWord -ing로 끝나는 단어
 * @returns 어간 (예: "eating" → "eat")
 */
export function extractIngStem(ingWord: string): string {
  const word = ingWord.toLowerCase();

  if (!word.endsWith('ing')) {
    return word;
  }

  const base = word.slice(0, -3);

  // 1. 자음 중복 제거: "running" → "run", "swimming" → "swim"
  // 단, "ing" 제거 후 끝이 자음 중복이고 원래 동사가 1음절인 경우
  const doubleConsonantPattern = /([bcdfghjklmnpqrstvwxyz])\1$/;
  if (doubleConsonantPattern.test(base)) {
    const singleBase = base.slice(0, -1);
    // 짧은 동사 확인 (run, swim, sit, etc.)
    const shortVerbs = [
      'run',
      'swim',
      'sit',
      'stop',
      'shop',
      'hit',
      'cut',
      'put',
      'get',
      'set',
      'let',
      'bet',
      'win',
      'begin',
      'plan',
      'drop',
      'skip',
      'slip',
      'trip',
      'wrap',
    ];
    if (shortVerbs.includes(singleBase)) {
      return singleBase;
    }
  }

  // 2. -e 복원: "making" → "make", "coming" → "come"
  // 단, "being", "seeing" 등은 제외
  const eVerbStems = [
    'mak',
    'tak',
    'com',
    'giv',
    'hav',
    'liv',
    'lov',
    'mov',
    'sav',
    'writ',
    'driv',
    'rid',
    'hid',
    'bit',
    'chos',
    'wok',
    'bak',
    'smok',
    'hop',
    'danc',
    'chang',
    'manag',
    'arrang',
    'imagin',
    'continu',
    'decid',
    'provid',
    'receiv',
    'believ',
    'achiev',
  ];
  if (eVerbStems.includes(base)) {
    return `${base}e`;
  }

  // 3. -ie → -y: "lying" → "lie" (이미 처리됨 위에서 -ying 체크 필요)
  if (word.endsWith('ying')) {
    const yBase = word.slice(0, -4);
    const ieVerbs = ['l', 'd', 't']; // lie, die, tie
    if (ieVerbs.includes(yBase)) {
      return `${yBase}ie`;
    }
  }

  // 기본: 그대로 반환
  return base;
}

// ============================================
// 보조용언 패턴 (Phase 0: 긴급 수정)
// "-고 있다", "-고 싶다" 등을 우선 인식하여
// "하고"→"하구" 오매칭 방지
// ============================================

interface AuxiliaryPattern {
  /** 매칭 패턴 */
  pattern: RegExp;
  /** 문법적 의미 */
  meaning:
    | 'progressive'
    | 'past-progressive'
    | 'desiderative'
    | 'attemptive'
    | 'completive'
    | 'benefactive'
    | 'benefactive-honorific'
    | 'resultative'
    | 'accomplishment'
    | 'prohibition'
    | 'seem'
    | 'inchoative'
    | 'know-how'
    | 'know-how-negative'
    | 'tendency'
    | 'future'
    | 'perfect'
    | 'modal-can'
    | 'modal-cannot'
    | 'modal-may'
    | 'modal-might'
    | 'modal-must'
    | 'modal-should'
    | 'modal-would'
    | 'modal-could'
    | 'modal-had-to'
    | 'polite-request'
    | 'only'
    | 'experience'
    | 'intention'
    | 'schedule'
    | 'worth'
    | 'necessity'
    | 'reason';
  /** 영어 표현 형식 */
  englishForm: string;
}

/**
 * 보조용언 패턴 목록
 * 우선순위: 긴 패턴부터 매칭
 */
const AUXILIARY_PATTERNS: AuxiliaryPattern[] = [
  // ============================================
  // 긴 패턴부터 (우선순위 높음)
  // ============================================

  // -어 본 적 있다 (경험/완료): 먹어 본 적 있다
  { pattern: /(.+)[아어]\s*본\s*적\s*있/, meaning: 'perfect', englishForm: 'have Vpp' },

  // -ㄹ 필요가 있다 (필요): 할 필요가 있다, 갈 필요가 있다
  { pattern: /(.+)\s*필요가?\s*있/, meaning: 'necessity', englishForm: 'need to V' },

  // -ㄹ 줄 모르다 (능력 부정): 할 줄 모르다, 수영할 줄 모르다
  { pattern: /(.+)\s*줄\s*모르/, meaning: 'know-how-negative', englishForm: "don't know how to V" },

  // -ㄹ 줄 알다 (능력 지식): 할 줄 알다, 수영할 줄 알다
  // 한글 받침 ㄹ은 합자 안에 있으므로 [ㄹ을] 대신 전체 글자 매칭
  { pattern: /(.+)\s*줄\s*알/, meaning: 'know-how', englishForm: 'know how to V' },

  // -ㄴ 적 있다 (경험): 간 적 있다, 본 적 있다
  { pattern: /(.+)\s*적\s*있/, meaning: 'experience', englishForm: 'have Vpp' },

  // -ㄹ 생각이다 (의도): 할 생각이다, 갈 생각이다
  { pattern: /(.+)\s*생각이[다]?/, meaning: 'intention', englishForm: 'intend to V' },

  // -ㄹ 예정이다 (예정): 갈 예정이다, 할 예정이다
  { pattern: /(.+)\s*예정이[다]?/, meaning: 'schedule', englishForm: 'plan to V' },

  // -ㄹ 뿐이다 (한정): 갈 뿐이다, 할 뿐이다
  { pattern: /(.+)\s*뿐이[다]?/, meaning: 'only', englishForm: 'only V' },

  // -ㄹ 만하다 (가치): 볼 만하다, 읽을 만하다
  { pattern: /(.+)\s*만하[다]?/, meaning: 'worth', englishForm: 'worth Ving' },

  // -ㄹ 이유 (이유): 갈 이유, 할 이유
  { pattern: /(.+)\s*이유/, meaning: 'reason', englishForm: 'reason to V' },

  // ============================================
  // g5: 조동사 패턴 (Modals)
  // ============================================

  // -ㄹ 수 있었다 (과거 능력): 할 수 있었다
  { pattern: /(.+)\s*수\s*있었/, meaning: 'modal-could', englishForm: 'could V' },

  // -어야 했다 (과거 의무): 해야 했다, 먹어야 했다
  { pattern: /(.+)야\s*했/, meaning: 'modal-had-to', englishForm: 'had to V' },

  // -주시겠어요? (정중 요청): 해 주시겠어요?
  { pattern: /(.+)\s*주시겠/, meaning: 'polite-request', englishForm: 'Would you V?' },

  // -지도 모르다 (불확실): 할지도 모른다, 갈지도 모른다
  { pattern: /(.+)지도\s*모[르른]/, meaning: 'modal-might', englishForm: 'might V' },

  // -어야 하다 (의무): 해야 한다, 먹어야 한다
  { pattern: /(.+)야\s*한[다]?/, meaning: 'modal-must', englishForm: 'must V' },

  // -는 게 좋다 (권고): 하는 게 좋다, 먹는 게 좋다
  { pattern: /(.+)는\s*게\s*좋/, meaning: 'modal-should', englishForm: 'should V' },

  // -곤 하다 (과거 습관): 하곤 했다, 먹곤 했다
  { pattern: /(.+)곤\s*했/, meaning: 'modal-would', englishForm: 'would V' },

  // -ㄹ/을 수 없다 (불능): 할 수 없다, 먹을 수 없다
  // 긴 패턴이 먼저 매칭되도록 "있다" 앞에 배치
  { pattern: /(.+)을\s*수\s*없/, meaning: 'modal-cannot', englishForm: 'cannot V' },
  { pattern: /(.)\s*수\s*없/, meaning: 'modal-cannot', englishForm: 'cannot V' },

  // -ㄹ/을 수 있다 (능력): 할 수 있다, 먹을 수 있다
  { pattern: /(.+)을\s*수\s*있/, meaning: 'modal-can', englishForm: 'can V' },
  { pattern: /(.)\s*수\s*있/, meaning: 'modal-can', englishForm: 'can V' },

  // -는 것 같다 (추측): 하는 것 같다, 먹는 것 같다
  { pattern: /(.+)는\s*것\s*같/, meaning: 'seem', englishForm: 'seem to V' },

  // -는 편이다 (경향): 하는 편이다, 먹는 편이다
  { pattern: /(.+)는\s*편이/, meaning: 'tendency', englishForm: 'tend to V' },

  // -기 시작하다 (시작): 하기 시작하다, 먹기 시작하다
  { pattern: /(.+)기\s*시작하/, meaning: 'inchoative', englishForm: 'start to V' },

  // -면 안 되다 (금지): 하면 안 되다, 가면 안 돼
  { pattern: /(.+)면\s*안\s*(?:되다|돼)/, meaning: 'prohibition', englishForm: 'must not V' },

  // -도 되다 (허가): 해도 되다, 가도 돼
  { pattern: /(.+)도\s*(?:되다|된다|돼)/, meaning: 'modal-may', englishForm: 'may V' },

  // -ㄹ/을 것이다 (미래): 먹을 것이다, 갈 것이다
  { pattern: /(.+)[ㄹ을]\s*것이다/, meaning: 'future', englishForm: 'will V' },

  // -고 있었다 (과거 진행형): 먹고 있었다
  { pattern: /(.+)고\s*있었/, meaning: 'past-progressive', englishForm: 'was + Ving' },

  // -고 있다 (진행형): 먹고 있다, 가고 있어, 하고 있습니다
  { pattern: /(.+)고\s*있/, meaning: 'progressive', englishForm: 'be + Ving' },

  // -고 싶다 (희망): 먹고 싶다, 가고 싶어
  { pattern: /(.+)고\s*싶/, meaning: 'desiderative', englishForm: 'want to V' },

  // -아/어 드리다 (수혜 높임): 해 드리다, 도와 드리다
  // 축약형 포함: 해(하+아), 써(쓰+어) 등
  { pattern: /(.+)\s*드리/, meaning: 'benefactive-honorific', englishForm: 'V for (honorific)' },

  // -아/어 주다 (수혜): 도와 주다, 알려 줘, 해 주다
  { pattern: /(.+)\s*주[다]?$/, meaning: 'benefactive', englishForm: 'V for (someone)' },

  // -아/어 놓다 (결과 유지): 써 놓다, 해 놓다
  { pattern: /(.+)\s*놓[다]?$/, meaning: 'resultative', englishForm: 'have Vpp (and left)' },

  // -아/어 버리다 (완료): 먹어 버리다, 가 버렸어, 먹어버렸다
  // 더 긴 패턴을 먼저 매칭하기 위해 "보다" 앞에 배치
  // 시제 활용형 포함: 버리다/버렸다/버렸어/버려
  {
    pattern: /(.+)\s*버(?:리다|렸다|렸어|려|림)$/,
    meaning: 'completive',
    englishForm: 'V up (completely)',
  },

  // -아/어 내다 (완수): 해 내다, 견뎌 내다, 해냈다
  // 시제 활용형 포함: 내다/냈다/냈어/내
  {
    pattern: /(.+)\s*(?:내다|냈다|냈어|내)$/,
    meaning: 'accomplishment',
    englishForm: 'accomplish',
  },

  // -아/어 보다 (시도): 먹어 봤다, 해 봐, 가 보다, 먹어봤다
  // 시제 활용형 포함: 보다/봤다/봤어/봐
  { pattern: /(.+)\s*(?:보다|봤다|봤어|봐)$/, meaning: 'attemptive', englishForm: 'try Ving' },
];

/**
 * 보조용언 패턴 감지
 * @param text 입력 문장
 * @returns 감지된 패턴 정보 또는 null
 */
function detectAuxiliaryPattern(
  text: string,
): { verbStem: string; pattern: AuxiliaryPattern; fullMatch: string } | null {
  for (const pattern of AUXILIARY_PATTERNS) {
    const match = text.match(pattern.pattern);
    if (match?.[1]) {
      return {
        verbStem: match[1],
        pattern,
        fullMatch: match[0],
      };
    }
  }
  return null;
}

// ============================================
// 신뢰도 상수 정의
// ============================================

/** 사전 정확 매칭 신뢰도 */
const CONFIDENCE_DICTIONARY = 1.0;
/** 규칙 기반 추론 신뢰도 */
const CONFIDENCE_RULE = 0.85;
/** 미인식 신뢰도 (v3: 원문 유지) */
const CONFIDENCE_UNKNOWN = 0.3;

// ============================================
// 유사도 검색 제거됨 (v3.0)
// ============================================
//
// 이유: "모르면 추측" → "모르면 원문 유지"
//
// 문제점:
// - 사전이 커질수록 오매칭 증가 (예: "하고" → "하구")
// - O(n) 전체 순회로 성능 저하
// - 할루시네이션 발생 원인
//
// 해결책:
// - 미인식 단어는 원문 그대로 유지
// - 규칙 기반 형태소 분석으로 대체
// ============================================

// ============================================
// 모음조화 규칙 기반 동사 어간 추출
// ============================================

/** 양성모음 (ㅏ, ㅗ, ㅑ, ㅛ) → 았 */
const POSITIVE_VOWELS = ['ㅏ', 'ㅗ', 'ㅑ', 'ㅛ'];

/**
 * 마지막 글자의 모음 추출
 */
function getLastVowel(text: string): string | null {
  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i];
    if (!char) continue;
    const jamo = decompose(char);
    if (jamo) return jamo.jung;
  }
  return null;
}

/**
 * 모음조화에 따른 과거 어미 선택 (았/었)
 */
function _selectPastSuffix(stem: string): '았' | '었' {
  const vowel = getLastVowel(stem);
  if (vowel && POSITIVE_VOWELS.includes(vowel)) {
    return '았';
  }
  return '었';
}

/**
 * 모음조화 규칙으로 동사 어간 추출
 *
 * 규칙:
 * 1. 양성모음(ㅏ,ㅗ) + 았 → 과거 (갔, 봤, 샀)
 * 2. 음성모음(그 외) + 었 → 과거 (먹었, 잤, 썼)
 * 3. 하다 → 했 (ㅏ+ㅕ 축약)
 * 4. Phase 3: 미래 시제 (-ㄹ 거야, -겠)
 * 5. Phase 4: 부정문 (-지 않다, -지 못하다)
 *
 * @param word 활용된 동사 (예: "갔어", "먹었다")
 * @returns 어간 정보 또는 null
 */
function extractVerbStemByRule(
  word: string,
): { stem: string; tense: Tense; en?: string; negated?: boolean } | null {
  // 0. 불규칙 동사 활용형 먼저 체크 (ㄷ불규칙: 듣다→들었, 걷다→걸었 등)
  // IRREGULAR_KO_VERBS에 정의된 활용형이 word에 포함되어 있으면 우선 적용
  //
  // 주의: [명사]+하다 패턴과 충돌 방지
  // - 노래했어 → "노래"가 ㅎ불규칙(노랗→노래)으로 잡히면 안 됨
  // - 노래한다 → "노래"가 ㅎ불규칙으로 잡히면 안 됨
  // - 하다 계열 패턴이 있으면 불규칙 체크 건너뛰고 하다 계열로 처리
  const isHadaPattern =
    word.includes('했') ||
    word.endsWith('한다') ||
    word.endsWith('해') ||
    word.endsWith('해요') ||
    word.endsWith('합니다');

  /**
   * 하다동사의 영어 번역을 조회
   *
   * 조회 우선순위:
   * 1. KO_EN[stem] - 어간 전체 (좋아하 → like)
   * 2. VERB_STEMS[stem] - 동사 어간 사전
   * 3. NOUN_TO_VERB[prefix] - 명사→동사 특별 변환 (노래 → sing)
   * 4. KO_EN[prefix] - 명사 번역을 동사로 사용 (운동 → exercise)
   * 5. 'do' - fallback
   */
  const lookupHadaVerb = (prefix: string, stem: string): string => {
    return KO_EN[stem] || VERB_STEMS[stem] || NOUN_TO_VERB[prefix] || KO_EN[prefix] || 'do';
  };

  if (!isHadaPattern) {
    for (const [conjugated, info] of Object.entries(IRREGULAR_KO_VERBS)) {
      if (word.startsWith(conjugated)) {
        return { stem: info.stem, tense: 'past', en: info.en };
      }
    }
  }

  // 1. 하다 계열 (했, 했어, 했다) - [명사]+하다 패턴 알고리즘 처리
  // ============================================
  // 일반화 규칙:
  // - [명사]+했 → 명사를 동사화하여 과거 시제로 변환
  // - NOUN_TO_VERB에 정의된 경우: 특별 동사 사용 (노래→sing)
  // - 그 외: KO_EN[명사]를 그대로 동사로 사용 (운동→exercise)
  // ============================================
  if (word.includes('했')) {
    const idx = word.indexOf('했');
    const prefix = word.slice(0, idx);
    // "공부했어" → prefix "공부", 어간 "공부하"
    const stem = prefix ? `${prefix}하` : '하';

    // 영어 동사 결정 - lookupHadaVerb 사용
    // 우선순위: KO_EN[stem] → VERB_STEMS[stem] → NOUN_TO_VERB[prefix] → KO_EN[prefix] → 'do'
    const en = prefix ? lookupHadaVerb(prefix, stem) : 'do';

    return { stem, tense: 'past', en };
  }

  // 1-2. 하다 계열 현재형 (해, 해요, 합니다, 한다)
  // ============================================
  // 일반화 규칙:
  // - [명사]+해/해요/합니다/한다 → 명사를 동사화하여 현재 시제로 변환
  // ============================================
  const hadaPresentPatterns = [
    { pattern: /^(.+)합니다$/, ending: '합니다' },
    { pattern: /^(.+)해요$/, ending: '해요' },
    { pattern: /^(.+)한다$/, ending: '한다' },
    { pattern: /^(.+)해$/, ending: '해' },
  ];

  for (const { pattern } of hadaPresentPatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const prefix = match[1];
      const stem = `${prefix}하`;

      // 영어 동사 결정 - lookupHadaVerb 사용
      // 우선순위: KO_EN[stem] → VERB_STEMS[stem] → NOUN_TO_VERB[prefix] → KO_EN[prefix] → 'do'
      const en = lookupHadaVerb(prefix, stem);

      return { stem, tense: 'present', en };
    }
  }

  // 2. 았/었 패턴 찾기 (모음조화 역추적)
  // 다양한 어미 포함: -았어, -았다, -았니, -았어요, -았습니다 등
  const pastPatterns = [
    // 과거 평서형
    { pattern: /^(.+)았어$/, vowel: 'ㅏ' },
    { pattern: /^(.+)었어$/, vowel: 'ㅓ' },
    { pattern: /^(.+)였어$/, vowel: 'ㅕ' },
    { pattern: /^(.+)았다$/, vowel: 'ㅏ' },
    { pattern: /^(.+)었다$/, vowel: 'ㅓ' },
    { pattern: /^(.+)였다$/, vowel: 'ㅕ' },
    // 과거 의문형
    { pattern: /^(.+)았니$/, vowel: 'ㅏ' },
    { pattern: /^(.+)었니$/, vowel: 'ㅓ' },
    { pattern: /^(.+)였니$/, vowel: 'ㅕ' },
    { pattern: /^(.+)았어요$/, vowel: 'ㅏ' },
    { pattern: /^(.+)었어요$/, vowel: 'ㅓ' },
    { pattern: /^(.+)였어요$/, vowel: 'ㅕ' },
    { pattern: /^(.+)았습니다$/, vowel: 'ㅏ' },
    { pattern: /^(.+)었습니다$/, vowel: 'ㅓ' },
    { pattern: /^(.+)였습니다$/, vowel: 'ㅕ' },
    // 기본 패턴 (어미 없이 과거 활용만)
    { pattern: /^(.+)았/, vowel: 'ㅏ' },
    { pattern: /^(.+)었/, vowel: 'ㅓ' },
    { pattern: /^(.+)였/, vowel: 'ㅕ' },
  ];

  for (const { pattern } of pastPatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const possibleStem = match[1];
      // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
      // (열 = ten(number) vs open(verb) 구분)
      const en = VERB_STEMS[possibleStem] || KO_EN[possibleStem];
      if (en) {
        return { stem: possibleStem, tense: 'past', en };
      }
    }
  }

  // 3. 축약형 역추적 (모음 축약된 과거형)
  // ㅏ+ㅏ→ㅏ (가+았→갔), ㅗ+ㅏ→ㅘ (오+았→왔)
  // ㅜ+ㅓ→ㅝ (주+었→줬), ㅣ+ㅓ→ㅕ (마시+었→마셨)
  const contractions: Record<string, { stem: string; en: string }> = {
    // 기본 축약형
    갔: { stem: '가', en: 'go' },
    왔: { stem: '오', en: 'come' },
    봤: { stem: '보', en: 'see' },
    줬: { stem: '주', en: 'give' },
    샀: { stem: '사', en: 'buy' },
    잤: { stem: '자', en: 'sleep' },
    썼: { stem: '쓰', en: 'write' },
    됐: { stem: '되', en: 'become' },

    // 복합 동사 축약형
    일어났: { stem: '일어나', en: 'wake up' },
    돌아왔: { stem: '돌아오', en: 'come back' },
    돌아갔: { stem: '돌아가', en: 'go back' },
    나갔: { stem: '나가', en: 'go out' },
    들어왔: { stem: '들어오', en: 'come in' },
    들어갔: { stem: '들어가', en: 'go in' },
    올라갔: { stem: '올라가', en: 'go up' },
    내려갔: { stem: '내려가', en: 'go down' },
    떠났: { stem: '떠나', en: 'leave' },
    도착했: { stem: '도착하', en: 'arrive' },
    출발했: { stem: '출발하', en: 'leave' },
    만났: { stem: '만나', en: 'meet' },
    헤어졌: { stem: '헤어지', en: 'part' },
    시작했: { stem: '시작하', en: 'start' },
    끝났: { stem: '끝나', en: 'end' },

    // ㅣ+ㅓ→ㅕ 축약
    마셨: { stem: '마시', en: 'drink' },
    보셨: { stem: '보시', en: 'see' }, // 높임
    드셨: { stem: '드시', en: 'eat' }, // 높임

    // 참고: [명사]+했 형태 (운동했, 공부했 등)는
    // 하다 계열 처리 (섹션 1)에서 알고리즘으로 처리됨
    // 하드코딩 금지
  };

  for (const [contracted, info] of Object.entries(contractions)) {
    if (word.startsWith(contracted)) {
      return { stem: info.stem, tense: 'past', en: info.en };
    }
  }

  // 4. 현재형 패턴 (는다, ㄴ다)
  // ============================================
  // 일반화 규칙:
  // - 받침 있는 어간 + 는다 → 먹는다, 듣는다
  // - 받침 없는 어간 + ㄴ다 → 간다(가+ㄴ다), 본다(보+ㄴ다)
  // ============================================

  // 4-1. "는다" 패턴 (받침 있는 어간)
  const neundaMatch = word.match(/^(.+)는다$/);
  if (neundaMatch?.[1]) {
    const possibleStem = neundaMatch[1];
    // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
    const en = VERB_STEMS[possibleStem] || KO_EN[possibleStem];
    if (en) {
      return { stem: possibleStem, tense: 'present', en };
    }
  }

  // 4-2. "Xㄴ다" 패턴 (받침 없는 어간 + ㄴ 받침 + 다)
  // 예: 간다 = 가(어간) + ㄴ(받침) + 다
  // 알고리즘: 마지막에서 두번째 글자의 ㄴ 받침 제거 → 어간 추출
  if (word.endsWith('다') && word.length >= 2) {
    const beforeDa = word.slice(0, -1); // '간' from '간다'
    const lastChar = beforeDa[beforeDa.length - 1];
    if (lastChar) {
      const jamo = decompose(lastChar);
      // 받침이 ㄴ인 경우 → 받침 제거하여 어간 추출
      if (jamo && jamo.jong === 'ㄴ') {
        const stemChar = composeWithoutJong(jamo.cho, jamo.jung);
        const stem = beforeDa.slice(0, -1) + stemChar;
        // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
        const en = VERB_STEMS[stem] || KO_EN[stem];
        if (en) {
          return { stem, tense: 'present', en };
        }
      }
    }
  }

  // ============================================
  // Phase 3: 미래 시제 패턴 (-ㄹ 거야, -ㄹ게, -겠)
  // ============================================

  // 5-1. -ㄹ 거야 / -을 거야 패턴
  // 예: "갈 거야" → 가 + ㄹ 거야 → go (future)
  // 예: "먹을 거야" → 먹 + 을 거야 → eat (future)
  const futurePatterns = [
    // "갈 거야", "할 거야" (받침 없는 어간 + ㄹ 거야)
    { pattern: /^(.+)ㄹ\s*거야$/, hasBatchim: false },
    { pattern: /^(.+)ㄹ\s*거예요$/, hasBatchim: false },
    { pattern: /^(.+)ㄹ\s*겁니다$/, hasBatchim: false },
    // "먹을 거야", "읽을 거야" (받침 있는 어간 + 을 거야)
    { pattern: /^(.+)을\s*거야$/, hasBatchim: true },
    { pattern: /^(.+)을\s*거예요$/, hasBatchim: true },
    { pattern: /^(.+)을\s*겁니다$/, hasBatchim: true },
    // -ㄹ게 / -을게 (의지)
    { pattern: /^(.+)ㄹ게$/, hasBatchim: false },
    { pattern: /^(.+)ㄹ께$/, hasBatchim: false },
    { pattern: /^(.+)을게$/, hasBatchim: true },
    { pattern: /^(.+)을께$/, hasBatchim: true },
    // -겠 (추측/의지)
    { pattern: /^(.+)겠어$/, hasBatchim: null },
    { pattern: /^(.+)겠다$/, hasBatchim: null },
    { pattern: /^(.+)겠습니다$/, hasBatchim: null },
  ];

  for (const { pattern } of futurePatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const possibleStem = match[1];
      // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
      const en = VERB_STEMS[possibleStem] || KO_EN[possibleStem];
      if (en) {
        return { stem: possibleStem, tense: 'future', en };
      }
    }
  }

  // 5-2. 축약형 미래 ("갈 거야"가 "갈거야"로 붙여쓴 경우)
  const futureCombined = [
    /^(.+)ㄹ거야$/,
    /^(.+)ㄹ거예요$/,
    /^(.+)을거야$/,
    /^(.+)을거예요$/,
    /^(.+)ㄹ게요$/,
    /^(.+)을게요$/,
  ];

  for (const pattern of futureCombined) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const possibleStem = match[1];
      // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
      const en = VERB_STEMS[possibleStem] || KO_EN[possibleStem];
      if (en) {
        return { stem: possibleStem, tense: 'future', en };
      }
    }
  }

  // 5-3. 받침 ㄹ + 거야 패턴 (갈거야, 할거야 등)
  // "갈" = 가 + ㄹ, "할" = 하 + ㄹ
  // 마지막 글자의 받침이 ㄹ이고 뒤에 거야/거예요가 붙은 경우
  const futureBatchimPatterns = [/^(.+)(거야|거예요|겁니다|게|께)$/];

  for (const pattern of futureBatchimPatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const stemWithBatchim = match[1];
      // 마지막 글자 분해해서 ㄹ 받침 확인
      const lastChar = stemWithBatchim[stemWithBatchim.length - 1];
      if (lastChar) {
        const jamo = decompose(lastChar);
        if (jamo && jamo.jong === 'ㄹ') {
          // ㄹ 받침 제거하여 원형 어간 추출
          // 갈 → 가, 할 → 하, 볼 → 보
          const prefix = stemWithBatchim.slice(0, -1);
          // 받침 없는 글자로 재조합 (cho + jung만)
          const stemChar = composeWithoutJong(jamo.cho, jamo.jung);
          const stem = prefix + stemChar;
          // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
          const en = VERB_STEMS[stem] || KO_EN[stem];
          if (en) {
            return { stem, tense: 'future', en };
          }
        }
      }
    }
  }

  // ============================================
  // Phase 4: 부정문 패턴 (-지 않다, -지 못하다)
  // ============================================

  // 6-1. -지 않았어 / -지 않았다 (과거 부정)
  // 예: "마시지않았어" → 마시 + 지 않았 → drink (past, negated)
  const negationPastPatterns = [
    /^(.+)지않았어$/,
    /^(.+)지않았다$/,
    /^(.+)지않았어요$/,
    /^(.+)지않았습니다$/,
    /^(.+)지못했어$/,
    /^(.+)지못했다$/,
    /^(.+)지못했어요$/,
  ];

  for (const pattern of negationPastPatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const possibleStem = match[1];
      // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
      const en = VERB_STEMS[possibleStem] || KO_EN[possibleStem];
      if (en) {
        return { stem: possibleStem, tense: 'past', en, negated: true };
      }
    }
  }

  // 6-2. -지 않아 / -지 않는다 (현재 부정)
  const negationPresentPatterns = [
    /^(.+)지않아$/,
    /^(.+)지않는다$/,
    /^(.+)지않아요$/,
    /^(.+)지않습니다$/,
    /^(.+)지못해$/,
    /^(.+)지못하다$/,
    /^(.+)지못해요$/,
  ];

  for (const pattern of negationPresentPatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const possibleStem = match[1];
      // 동사 활용형 맥락이므로 VERB_STEMS를 우선 조회
      const en = VERB_STEMS[possibleStem] || KO_EN[possibleStem];
      if (en) {
        return { stem: possibleStem, tense: 'present', en, negated: true };
      }
    }
  }

  return null;
}

/**
 * 받침 없이 초성+중성만으로 한글 조합
 * Phase 3: 미래 시제 어간 추출용
 *
 * 성능: indexOf() O(n) → Map.get() O(1)
 */
const CHO_INDEX_MAP_LOCAL = new Map<string, number>([
  ['ㄱ', 0],
  ['ㄲ', 1],
  ['ㄴ', 2],
  ['ㄷ', 3],
  ['ㄸ', 4],
  ['ㄹ', 5],
  ['ㅁ', 6],
  ['ㅂ', 7],
  ['ㅃ', 8],
  ['ㅅ', 9],
  ['ㅆ', 10],
  ['ㅇ', 11],
  ['ㅈ', 12],
  ['ㅉ', 13],
  ['ㅊ', 14],
  ['ㅋ', 15],
  ['ㅌ', 16],
  ['ㅍ', 17],
  ['ㅎ', 18],
]);

const JUNG_INDEX_MAP_LOCAL = new Map<string, number>([
  ['ㅏ', 0],
  ['ㅐ', 1],
  ['ㅑ', 2],
  ['ㅒ', 3],
  ['ㅓ', 4],
  ['ㅔ', 5],
  ['ㅕ', 6],
  ['ㅖ', 7],
  ['ㅗ', 8],
  ['ㅘ', 9],
  ['ㅙ', 10],
  ['ㅚ', 11],
  ['ㅛ', 12],
  ['ㅜ', 13],
  ['ㅝ', 14],
  ['ㅞ', 15],
  ['ㅟ', 16],
  ['ㅠ', 17],
  ['ㅡ', 18],
  ['ㅢ', 19],
  ['ㅣ', 20],
]);

function composeWithoutJong(cho: string, jung: string): string {
  const choIndex = CHO_INDEX_MAP_LOCAL.get(cho);
  const jungIndex = JUNG_INDEX_MAP_LOCAL.get(jung);

  if (choIndex === undefined || jungIndex === undefined) return '';

  // 한글 유니코드 계산: 0xAC00 + (초성 * 21 * 28) + (중성 * 28) + 종성
  // 종성 없음 = 0
  const code = 0xac00 + choIndex * 21 * 28 + jungIndex * 28;
  return String.fromCharCode(code);
}

// 조사를 길이 역순으로 정렬 (긴 것부터 매칭)
const SORTED_PARTICLES = [...PARTICLES].sort((a, b) => b[0].length - a[0].length);
const SORTED_ENDINGS = [...ENDINGS].sort((a, b) => b[0].length - a[0].length);

/**
 * 보조용언 패턴을 포함한 문장 파싱
 *
 * Phase 0: 긴급 수정
 * "-고 있다" 등의 패턴을 우선 처리하여 "하고"→"하구" 오매칭 방지
 */
function parseWithAuxiliaryPattern(
  original: string,
  auxMatch: { verbStem: string; pattern: AuxiliaryPattern; fullMatch: string },
  sentenceType: SentenceType,
): ParsedSentence {
  const tokens: Token[] = [];
  const cleaned = original.replace(/[.!?？！。]+$/, '').trim();

  // 시제 감지: 봤다/버렸다/냈다 등 과거형 패턴
  const isPastTense =
    /봤다$|봤어$|버렸다$|버렸어$|냈다$|냈어$|있었다$|있었어$|싶었다$|싶었어$/.test(cleaned);

  // 보조용언 패턴 앞부분 (주어, 목적어 등) 분리
  const beforePattern = cleaned.slice(0, cleaned.indexOf(auxMatch.fullMatch)).trim();
  const afterPattern = cleaned
    .slice(cleaned.indexOf(auxMatch.fullMatch) + auxMatch.fullMatch.length)
    .trim();

  // 1. 앞부분 토큰화 (주어, 목적어) - WSD를 위해 원문 전달
  if (beforePattern) {
    const words = beforePattern.split(/\s+/).filter(Boolean);
    for (const word of words) {
      tokens.push(tokenizeKoreanWord(word, original));
    }
  }

  // 2. 동사 어간 추출 및 번역
  // auxMatch.verbStem: "하", "먹", "운동을 하", "할" (ㄹ 받침) 등
  let verbStem = auxMatch.verbStem.trim();
  let verbTranslation: string | undefined;
  let objectToken: Token | undefined;

  // modal-can 패턴에서 ㄹ 받침 처리: "할" → "하"
  // 단일 글자이고 ㄹ 받침으로 끝나면 받침 제거
  if (auxMatch.pattern.meaning === 'modal-can' && verbStem.length === 1) {
    const jamo = decompose(verbStem);
    if (jamo && jamo.jong === 'ㄹ') {
      // ㄹ 받침 제거하여 원형 어간 추출: 할 → 하, 갈 → 가, 볼 → 보
      verbStem = composeWithoutJong(jamo.cho, jamo.jung);
    }
  }

  // "운동을 하" → "운동을" + "하"로 분리
  if (verbStem.includes(' ')) {
    const parts = verbStem.split(/\s+/);
    const lastPart = parts.pop() || '';

    // 마지막 부분 전까지를 토큰화 - WSD를 위해 원문 전달
    for (const part of parts) {
      const token = tokenizeKoreanWord(part, original);
      tokens.push(token);
      if (token.role === 'object') {
        objectToken = token;
      }
    }
    verbStem = lastPart;
  }

  // 연결어미 제거: "먹어" → "먹", "써" → "쓰", "해" → "하"
  // 보조용언 앞의 연결어미(-아/-어)를 제거하여 어간 추출
  let pureVerbStem = verbStem;

  // 축약형 처리: "해" → "하", "써" → "쓰", "봐" → "보"
  const contractedForms: Record<string, string> = {
    해: '하',
    써: '쓰',
    봐: '보',
    돼: '되',
    줘: '주',
    와: '오',
    가: '가',
  };

  if (contractedForms[pureVerbStem]) {
    pureVerbStem = contractedForms[pureVerbStem];
  } else if (pureVerbStem.endsWith('아') || pureVerbStem.endsWith('어')) {
    // 연결어미 -아/-어 제거
    pureVerbStem = pureVerbStem.slice(0, -1);
  }

  // 관형형 어미 처리: 의존명사/조동사 패턴에서 동사 어간 추출
  // -ㄹ 받침: "할", "갈", "볼" → "하", "가", "보"
  // -ㄴ 받침: "간", "본" → "가", "보"
  const boundNounPatterns: string[] = [
    'know-how',
    'know-how-negative',
    'modal-can',
    'modal-cannot',
    'modal-could',
    'modal-might',
    'only',
    'experience',
    'intention',
    'schedule',
    'worth',
    'necessity',
    'reason',
  ];
  if (boundNounPatterns.includes(auxMatch.pattern.meaning)) {
    const jamo = decompose(pureVerbStem);
    if (jamo && (jamo.jong === 'ㄹ' || jamo.jong === 'ㄴ')) {
      pureVerbStem = composeWithoutJong(jamo.cho, jamo.jung);
    }
  }

  // "하" 동사의 경우 목적어에 따라 동사 결정
  // "운동을 하고 있다" → "exercising" (운동 = exercise)
  if (pureVerbStem === '하' && objectToken?.translated) {
    // 목적어 번역을 동사로 사용
    verbTranslation = objectToken.translated;
    // 목적어 토큰의 translated를 지워서 중복 출력 방지
    objectToken.translated = undefined;
    objectToken.role = 'object-absorbed'; // 동사에 흡수됨
  } else {
    // 보조용언 패턴에서는 VERB_STEMS를 우선 확인 (동사 문맥)
    // "해"가 "sun"(태양)이 아닌 "do"(하다)로 번역되어야 함
    verbTranslation = VERB_STEMS[pureVerbStem] || translateWithWSD(pureVerbStem, original) || 'do';
  }

  // 3. 보조용언 패턴에 따른 문법 정보 설정
  const isProgressive = auxMatch.pattern.meaning === 'progressive';
  const isDesiderative = auxMatch.pattern.meaning === 'desiderative';

  // 동사 토큰 생성
  tokens.push({
    text: auxMatch.fullMatch,
    stem: verbStem,
    role: 'verb',
    translated: verbTranslation,
    confidence: CONFIDENCE_RULE,
    meta: {
      strategy: 'grammar-pattern' as TokenStrategy,
      tense: 'present',
      auxiliaryMeaning: auxMatch.pattern.meaning,
      isProgressive,
      isDesiderative,
    },
  });

  // 4. 뒷부분 토큰화 (드문 케이스) - WSD를 위해 원문 전달
  if (afterPattern) {
    const words = afterPattern.split(/\s+/).filter(Boolean);
    for (const word of words) {
      tokens.push(tokenizeKoreanWord(word, original));
    }
  }

  return {
    original,
    tokens,
    type: sentenceType,
    tense: isPastTense ? 'past' : 'present',
    negated: false,
    // Phase 0: 보조용언 정보 추가
    auxiliaryPattern: auxMatch.pattern.meaning,
  };
}

// ============================================
// Phase g4: 피동/사동 패턴 감지
// ============================================

/**
 * 한국어 피동 접미사 매핑
 * 피동사 → { base: 능동사, type: 접미사 타입, english: 영어 과거분사 }
 */
const PASSIVE_VERBS: Record<string, { base: string; type: string; english: string }> = {
  // -리다 (ri) 피동
  열리다: { base: '열다', type: 'ri', english: 'opened' },
  들리다: { base: '듣다', type: 'ri', english: 'heard' },
  걸리다: { base: '걸다', type: 'ri', english: 'caught' },
  풀리다: { base: '풀다', type: 'ri', english: 'untied' },
  밀리다: { base: '밀다', type: 'ri', english: 'pushed' },
  팔리다: { base: '팔다', type: 'ri', english: 'sold' },
  물리다: { base: '물다', type: 'ri', english: 'bitten' },
  뚫리다: { base: '뚫다', type: 'ri', english: 'pierced' },

  // -이다 (i) 피동
  보이다: { base: '보다', type: 'i', english: 'seen' },
  쓰이다: { base: '쓰다', type: 'i', english: 'written' },
  놓이다: { base: '놓다', type: 'i', english: 'placed' },
  바뀌다: { base: '바꾸다', type: 'i', english: 'changed' },

  // -히다 (hi) 피동
  먹히다: { base: '먹다', type: 'hi', english: 'eaten' },
  잡히다: { base: '잡다', type: 'hi', english: 'caught' },
  읽히다: { base: '읽다', type: 'hi', english: 'read' },
  닫히다: { base: '닫다', type: 'hi', english: 'closed' },
  막히다: { base: '막다', type: 'hi', english: 'blocked' },

  // -기다 (gi) 피동
  끊기다: { base: '끊다', type: 'gi', english: 'cut off' },
  안기다: { base: '안다', type: 'gi', english: 'held' },

  // -되다 (doeda) 피동
  해결되다: { base: '해결하다', type: 'doeda', english: 'solved' },
  완성되다: { base: '완성하다', type: 'doeda', english: 'completed' },
  건설되다: { base: '건설하다', type: 'doeda', english: 'built' },
  발견되다: { base: '발견하다', type: 'doeda', english: 'discovered' },
  파괴되다: { base: '파괴하다', type: 'doeda', english: 'destroyed' },
  사용되다: { base: '사용하다', type: 'doeda', english: 'used' },

  // -받다 (batda) 피동
  사랑받다: { base: '사랑하다', type: 'batda', english: 'loved' },
  존경받다: { base: '존경하다', type: 'batda', english: 'respected' },
  인정받다: { base: '인정하다', type: 'batda', english: 'recognized' },
  칭찬받다: { base: '칭찬하다', type: 'batda', english: 'praised' },

  // -당하다 (danghada) 피동
  비난당하다: { base: '비난하다', type: 'danghada', english: 'criticized' },
  거부당하다: { base: '거부하다', type: 'danghada', english: 'rejected' },
  공격당하다: { base: '공격하다', type: 'danghada', english: 'attacked' },
  처벌당하다: { base: '처벌하다', type: 'danghada', english: 'punished' },
};

/**
 * 한국어 사동 접미사 매핑 (g4-7)
 * 사동사 → { base: 기본동사, english: 영어 번역 }
 *
 * 사동 접미사:
 * - -이- : 먹이다 (먹다 → 먹이다)
 * - -히- : 입히다 (입다 → 입히다)
 * - -리- : 날리다 (날다 → 날리다)
 * - -기- : 웃기다 (웃다 → 웃기다)
 * - -우- : 세우다 (서다 → 세우다)
 * - -추- : 맞추다 (맞다 → 맞추다)
 */
const CAUSATIVE_VERBS: Record<string, { base: string; english: string }> = {
  // -이- 사동
  먹이다: { base: '먹다', english: 'feed' },
  보이다: { base: '보다', english: 'show' },
  죽이다: { base: '죽다', english: 'kill' },
  녹이다: { base: '녹다', english: 'melt' },
  속이다: { base: '속다', english: 'deceive' },
  // -히- 사동
  입히다: { base: '입다', english: 'dress' },
  읽히다: { base: '읽다', english: 'make read' },
  앉히다: { base: '앉다', english: 'seat' },
  눕히다: { base: '눕다', english: 'lay down' },
  익히다: { base: '익다', english: 'cook' },
  // -리- 사동
  날리다: { base: '날다', english: 'fly' },
  돌리다: { base: '돌다', english: 'turn' },
  울리다: { base: '울다', english: 'make cry' },
  알리다: { base: '알다', english: 'inform' },
  // -기- 사동
  웃기다: { base: '웃다', english: 'make laugh' },
  신기다: { base: '신다', english: 'put shoes on' },
  // -우- 사동
  세우다: { base: '서다', english: 'stand up' },
  깨우다: { base: '깨다', english: 'wake up' },
  태우다: { base: '타다', english: 'burn' },
  재우다: { base: '자다', english: 'put to sleep' },
  // -추- 사동
  맞추다: { base: '맞다', english: 'match' },
  낮추다: { base: '낮다', english: 'lower' },
};

// ============================================
// 한국어 조건문 패턴 감지 (g6)
// ============================================

/**
 * 한국어 조건문 패턴 감지
 *
 * 조건문 유형:
 * - Type 0 (일반적 진리): -면 + 현재형 (비가 오면 땅이 젖는다)
 * - Type 1 (미래 가능): -면 + 미래형 (비가 오면 집에 있을 것이다)
 * - Type 2 (현재 가정법): -(이)라면 + 텐데 (부자라면 여행할 텐데)
 * - Type 3 (과거 가정법): -았/었더라면 + 었을 텐데 (공부했더라면 합격했을 텐데)
 * - Unless: -지 않으면 (오지 않으면)
 * - Even if: -더라도 (비가 오더라도)
 */
interface ConditionalMatch {
  conditional: true;
  type: 'type0' | 'type1' | 'type2' | 'type3' | 'unless' | 'even-if';
  conditionClause: string; // 조건절 (비가 오면, 부자라면)
  resultClause?: string; // 결과절 (땅이 젖는다, 여행할 텐데)
  conditionVerb?: string; // 조건절 동사 (오다, 부자이다)
  resultVerb?: string; // 결과절 동사 (젖다, 여행하다)
}

function detectKoreanConditional(text: string): ConditionalMatch | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // 보조용언 패턴 제외: -면 안 되다, -도 되다는 조건문이 아닌 보조용언 패턴
  // 이 패턴들은 g22 보조용언에서 처리
  if (/면\s*안\s*(되다|돼)/.test(cleaned)) return null;
  if (/도\s*(되다|돼|된다)$/.test(cleaned)) return null;

  // Type 3: 과거 가정법 (-았/었더라면 ... 었을 텐데)
  // 공부했더라면 합격했을 텐데
  const type3Match = cleaned.match(/^(.+?)(았|었|했)더라면\s+(.+?)(았|었|했)을\s*텐데$/);
  if (type3Match) {
    return {
      conditional: true,
      type: 'type3',
      conditionClause: `${type3Match[1] + type3Match[2]}더라면`,
      resultClause: `${type3Match[3] + type3Match[4]}을 텐데`,
      conditionVerb: type3Match[1].trim(),
      resultVerb: type3Match[3].trim(),
    };
  }

  // Type 2: 현재 가정법 (-(이)라면 ... 텐데)
  // 부자라면 여행할 텐데, 내가 너라면 갈 텐데
  // ㄹ 받침이 들어간 글자: 할, 갈, 볼, 먹을 등
  const type2Match = cleaned.match(/^(.+?)(이)?라면\s+(.+?)\s*텐데$/);
  if (type2Match) {
    const condPart = type2Match[1].trim();
    const resultPart = type2Match[3].trim();
    return {
      conditional: true,
      type: 'type2',
      conditionClause: `${condPart + (type2Match[2] || '')}라면`,
      resultClause: `${resultPart} 텐데`,
      conditionVerb: condPart,
      resultVerb: resultPart,
    };
  }

  // Type 2-extended: 일반 가정법 (-(이)라면 + 결과절, 텐데 없음)
  // 너와 내가 함께라면 힘든것도 이겨낼 수 있어
  // 네가 나라면 어떻게 할 거야?
  const type2ExtMatch = cleaned.match(/^(.+?)(이)?라면\s+(.+)$/);
  if (type2ExtMatch) {
    const condPart = type2ExtMatch[1].trim();
    const resultPart = type2ExtMatch[3].trim();
    return {
      conditional: true,
      type: 'type2',
      conditionClause: `${condPart + (type2ExtMatch[2] || '')}라면`,
      resultClause: resultPart,
      conditionVerb: condPart,
      resultVerb: resultPart,
    };
  }

  // Even-if: -더라도 (양보 조건)
  // 비가 오더라도
  const evenIfMatch = cleaned.match(/^(.+?)더라도$/);
  if (evenIfMatch) {
    return {
      conditional: true,
      type: 'even-if',
      conditionClause: cleaned,
      conditionVerb: evenIfMatch[1].trim(),
    };
  }

  // Unless: -지 않으면 (부정 조건)
  // 오지 않으면
  const unlessMatch = cleaned.match(/^(.+?)지\s*않으면$/);
  if (unlessMatch) {
    return {
      conditional: true,
      type: 'unless',
      conditionClause: cleaned,
      conditionVerb: unlessMatch[1].trim(),
    };
  }

  // Type 0/1: -면 (기본 조건)
  // Type 0: 비가 오면 땅이 젖는다 (현재형 결과)
  // Type 1: 비가 오면 집에 있을 것이다 (미래형 결과)
  const conditionalMatch = cleaned.match(/^(.+?)(으)?면\s+(.+)$/);
  if (conditionalMatch) {
    const condClause = `${conditionalMatch[1] + (conditionalMatch[2] || '')}면`;
    const resultClause = conditionalMatch[3];

    // 결과절의 시제로 Type 0 vs Type 1 구분
    // 미래형: -ㄹ 것이다, -을 것이다, -ㄹ게, -을게
    const isFutureResult = /것이다|거야|거예요|겁니다|게$|ㄹ거|을거/.test(resultClause);
    const type = isFutureResult ? 'type1' : 'type0';

    return {
      conditional: true,
      type,
      conditionClause: condClause,
      resultClause,
      conditionVerb: conditionalMatch[1].trim(),
    };
  }

  return null;
}

// ============================================
// g8: 명사절 (Noun Clauses) 감지
// ============================================

interface NounClauseMatch {
  type: 'that-subject' | 'that-object' | 'whether' | 'wh-clause' | 'quote';
  nounClauseContent: string;
  mainPredicate: string;
  whWord?: string;
  subject?: string;
  verb?: string;
}

/**
 * 한국어 명사절 감지
 *
 * 패턴:
 * 1. -다는 것이/은 + V (That-subject): 그가 왔다는 것이 중요하다
 * 2. -다는 것을 + V (That-object): 그가 왔다는 것을 안다
 * 3. -ㄹ지/-을지 + V (Whether): 그가 올지 궁금하다
 * 4. 어디/무엇/왜 + -는지 + V (Wh-clause): 그가 어디 갔는지 모른다
 * 5. -다고 + V (Quote): 그가 간다고 했다
 */
function detectKoreanNounClause(text: string): NounClauseMatch | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // Pattern 5: -다고 + V (Quote) - 가장 먼저 체크
  // 그가 간다고 했다 → He said that he would go
  const quoteMatch = cleaned.match(/^(.+?)(?:다|ㄴ다|는다|았|었)고\s+(.+)$/);
  if (quoteMatch) {
    const content = quoteMatch[1].trim();
    const mainPred = quoteMatch[2].trim();

    // 주어 추출 시도
    const subjectMatch = content.match(/^(.+?)(?:가|이|는|은)\s*(.+)$/);
    if (subjectMatch) {
      return {
        type: 'quote',
        nounClauseContent: content,
        mainPredicate: mainPred,
        subject: subjectMatch[1].trim(),
        verb: subjectMatch[2].trim(),
      };
    }
    return {
      type: 'quote',
      nounClauseContent: content,
      mainPredicate: mainPred,
    };
  }

  // Pattern 4: 어디/무엇/왜/언제/누가 + -는지/-ㄴ지 + V (Wh-clause)
  // 그가 어디 갔는지 모른다 → I don't know where he went
  const whMatch = cleaned.match(
    /^(.+?)(어디|무엇|뭐|무슨|왜|언제|누가|누구|어느|어떤|어떻게)\s*(.+?)(?:는지|ㄴ지|었는지|았는지)\s+(.+)$/,
  );
  if (whMatch) {
    const subject = whMatch[1].trim();
    const whWord = whMatch[2].trim();
    const verb = whMatch[3].trim();
    const mainPred = whMatch[4].trim();

    return {
      type: 'wh-clause',
      nounClauseContent: `${subject}${whWord} ${verb}`,
      mainPredicate: mainPred,
      whWord: whWord,
      subject: subject.replace(/(?:가|이|는|은)$/, ''),
      verb: verb,
    };
  }

  // Pattern 3: -ㄹ지/-을지 + V (Whether)
  // 그가 올지 궁금하다 → I wonder if he will come
  // 패턴: 받침 ㄹ이 있는 글자 + 지 (올지, 갈지, 할지 등) 또는 을지, 는지
  // ㄹ 받침 글자들: 올, 갈, 할, 볼, 널, 들 등
  const whetherMatch =
    cleaned.match(/^(.+?[올갈할볼널들알설멀걸줄풀끌밀붙찔절팔붙할])지\s+(.+)$/) ||
    cleaned.match(/^(.+?)(?:을지|는지)\s+(.+)$/);
  if (whetherMatch && !whMatch) {
    const content = whetherMatch[1].trim();
    const mainPred = whetherMatch[2].trim();

    // 주어 추출 시도
    const subjectMatch = content.match(/^(.+?)(?:가|이|는|은)\s*(.+)$/);
    if (subjectMatch) {
      return {
        type: 'whether',
        nounClauseContent: content,
        mainPredicate: mainPred,
        subject: subjectMatch[1].trim(),
        verb: subjectMatch[2].trim(),
      };
    }
    return {
      type: 'whether',
      nounClauseContent: content,
      mainPredicate: mainPred,
    };
  }

  // Pattern 1 & 2: -다는 것이/은 + V (That-subject) 또는 -다는 것을 + V (That-object)
  // 그가 왔다는 것이 중요하다 → That he came is important
  // 그가 왔다는 것을 안다 → I know that he came
  const thatMatch = cleaned.match(/^(.+?)다는\s*것(?:이|은|을)\s+(.+)$/);
  if (thatMatch) {
    const content = thatMatch[1].trim();
    const mainPred = thatMatch[2].trim();

    // 것이/것은 = subject, 것을 = object
    const isSubject = /것(?:이|은)\s/.test(cleaned);

    // 주어 추출 시도
    const subjectMatch = content.match(/^(.+?)(?:가|이|는|은)\s*(.+)$/);
    if (subjectMatch) {
      return {
        type: isSubject ? 'that-subject' : 'that-object',
        nounClauseContent: content,
        mainPredicate: mainPred,
        subject: subjectMatch[1].trim(),
        verb: subjectMatch[2].trim().replace(/(?:았|었|였)$/, ''), // 과거 시제 어미 제거
      };
    }
    return {
      type: isSubject ? 'that-subject' : 'that-object',
      nounClauseContent: content,
      mainPredicate: mainPred,
    };
  }

  return null;
}

/**
 * 한국어 관계절 감지 결과 타입
 */
interface KoreanRelativeClauseMatch {
  /** 관계절 유형 */
  type: 'who' | 'whom' | 'which' | 'that' | 'where' | 'when';
  /** 선행사 (head noun) */
  antecedent: string;
  /** 관계절 내용 (동사구) */
  clauseContent: string;
  /** 관계절 주어 */
  clauseSubject?: string;
  /** 관계절 동사 (원형) */
  clauseVerb?: string;
  /** 관계절 동사 어간 (번역용) */
  clauseVerbStem?: string;
  /** 관계절 동사 시제 */
  clauseVerbTense?: 'past' | 'present' | 'future';
  /** 관계절 목적어 */
  clauseObject?: string;
}

/**
 * 한글 음절에서 받침(종성) 추출
 * 한글 유니코드: 0xAC00 + (초성 * 21 + 중성) * 28 + 종성
 */
function getFinalConsonant(char: string): string {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return '';

  const jongseong = (code - 0xac00) % 28;
  // 0=없음, 1=ㄱ, 2=ㄲ, 4=ㄴ, 8=ㄹ, ...
  const jongList = [
    '',
    'ㄱ',
    'ㄲ',
    'ㄳ',
    'ㄴ',
    'ㄵ',
    'ㄶ',
    'ㄷ',
    'ㄹ',
    'ㄺ',
    'ㄻ',
    'ㄼ',
    'ㄽ',
    'ㄾ',
    'ㄿ',
    'ㅀ',
    'ㅁ',
    'ㅂ',
    'ㅄ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ',
  ];
  return jongList[jongseong] || '';
}

/**
 * 문자열의 마지막 글자에서 받침 제거
 * "아픈" → "아프", "갈" → "가"
 */
function removeFinalConsonant(str: string): string {
  if (!str) return str;

  const lastChar = str[str.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return str;

  const jongseong = (code - 0xac00) % 28;
  if (jongseong === 0) return str; // 받침 없음

  const newLastChar = String.fromCharCode(code - jongseong);
  return str.slice(0, -1) + newLastChar;
}

/**
 * 한국어 관계절 감지
 *
 * 한국어 관계절 패턴:
 * 1. [S가 V-ㄴ/은] N: 내가 산 책 → the book that I bought (산 = 사+ㄴ)
 * 2. [O를 V-은/ㄴ] N: 나를 도운 사람 → the person who helped me (도운 = 도우+ㄴ)
 * 3. [S가 V-는] N: 그가 사는 집 → the home where he lives (사는 = 살+는)
 * 4. [S가 V-ㄴ] N: 우리가 만난 날 → the day when we met (만난 = 만나+ㄴ)
 *
 * 핵심: 관형형 어미(-ㄴ, -은, -는, -ㄹ)가 동사/형용사에 붙고, 그 뒤에 명사가 옴
 * ㄴ 받침: 사다→산, 만나다→만난, 도우다→도운
 * 는 어미: 살다→사는 (ㄹ탈락+는)
 */
function detectKoreanRelativeClause(text: string): KoreanRelativeClauseMatch | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // 선행사 목록 (장소/시간 명사 분류)
  const placeNouns = ['집', '곳', '장소', '나라', '도시', '학교', '방', '마을'];
  const timeNouns = ['날', '때', '순간', '시간', '해', '달', '주'];
  const personNouns = ['사람', '분', '친구', '남자', '여자', '아이', '사람들'];

  /**
   * 관형형에서 동사 어간 추출 및 시제 판별
   *
   * -는: 현재 (사는 → 살, 먹는 → 먹)
   * -은: 과거 (먹은 → 먹)
   * -ㄴ 받침: 과거 (산 → 사, 만난 → 만나)
   * -ㄹ 받침: 미래 (살 → 살, 먹을 → 먹)
   */
  function extractVerbStemAndTense(verbPart: string): {
    stem: string;
    tense: 'past' | 'present' | 'future';
  } | null {
    const lastChar = verbPart[verbPart.length - 1];
    const finalConsonant = getFinalConsonant(lastChar);

    // -는 (현재): 사는→살, 먹는→먹
    if (verbPart.endsWith('는')) {
      const stem = verbPart.slice(0, -1);
      // ㄹ 탈락 동사 복원: 사→살 (사다 vs 살다)
      // 사는 집 → 살다 (to live), not 사다 (to buy)
      const stemWithRieul = addKoreanRieul(stem);
      // ㄹ 탈락 동사 확인: 살다, 알다, 놀다 등
      if (VERB_STEMS[stemWithRieul] || KO_EN[`${stemWithRieul}다`]) {
        return { stem: stemWithRieul, tense: 'present' };
      }
      return { stem, tense: 'present' };
    }

    // -은 (과거): 먹은→먹
    if (verbPart.endsWith('은')) {
      return { stem: verbPart.slice(0, -1), tense: 'past' };
    }

    // -ㄴ 받침 (과거): 산→사, 만난→만나, 간→가
    if (finalConsonant === 'ㄴ') {
      const stemChar = removeFinalConsonant(lastChar);
      const stem = verbPart.slice(0, -1) + stemChar;
      return { stem, tense: 'past' };
    }

    // -ㄹ 받침 (미래): 살→살, 갈→가
    if (finalConsonant === 'ㄹ') {
      // ㄹ은 탈락하지 않음, 그대로 어간
      return { stem: verbPart, tense: 'future' };
    }

    return null;
  }

  // 패턴 1: [S-가/이 V] N - 주어가 있는 관계절
  // 예: 내가 산 책, 그가 사는 집, 우리가 만난 날
  const pattern1 = cleaned.match(/^(.+?)(?:가|이)\s+(\S+)\s+(\S+)$/);

  // 패턴 1b: [영어대명사 V] N - 대명사가 영어로 치환된 관계절
  // replaceKoreanPronouns() 처리 후: "I 산 책", "he 사는 집"
  const pattern1b = cleaned.match(/^(I|you|he|she|we|they)\s+(\S+)\s+(\S+)$/i);

  if (pattern1 || pattern1b) {
    const match = pattern1 || pattern1b;
    const subject = match![1].trim();
    const verbPart = match![2].trim();
    const noun = match![3].trim();

    // 필터링: 동사 종결어미(다/요/어)로 끝나는 문장은 관계절이 아닌 일반 문장
    // 예: "그가 책을 읽는다" → 일반 SVO 문장 (관계절 아님)
    if (/[다요어]$/.test(noun)) {
      return null;
    }

    // 필터링: 목적격 조사(을/를)로 끝나는 단어는 관형형 동사가 아님
    // 예: "책을"은 목적어이지 관형형이 아님
    if (/[을를]$/.test(verbPart)) {
      return null;
    }

    const verbInfo = extractVerbStemAndTense(verbPart);

    if (verbInfo) {
      // 선행사 유형에 따라 관계절 유형 결정
      let type: 'who' | 'where' | 'when' | 'that' = 'that';
      if (placeNouns.includes(noun)) {
        type = 'where';
      } else if (timeNouns.includes(noun)) {
        type = 'when';
      }

      return {
        type,
        antecedent: noun,
        clauseContent: `${subject} ${verbPart}`,
        clauseSubject: subject,
        clauseVerb: verbPart,
        clauseVerbStem: verbInfo.stem,
        clauseVerbTense: verbInfo.tense,
      };
    }
  }

  // 패턴 2: [O-를/을 V] N - 목적어가 있는 관계절
  // 예: 나를 도운 사람
  const pattern2 = cleaned.match(/^(.+?)(?:를|을)\s+(\S+)\s+(\S+)$/);
  if (pattern2) {
    const object = pattern2[1].trim();
    const verbPart = pattern2[2].trim();
    const noun = pattern2[3].trim();

    const verbInfo = extractVerbStemAndTense(verbPart);
    if (verbInfo) {
      // 사람 명사면 who, 아니면 that
      const type: 'who' | 'that' = personNouns.includes(noun) ? 'who' : 'that';

      return {
        type,
        antecedent: noun,
        clauseContent: `${object} ${verbPart}`,
        clauseObject: object,
        clauseVerb: verbPart,
        clauseVerbStem: verbInfo.stem,
        clauseVerbTense: verbInfo.tense,
      };
    }
  }

  return null;
}

/**
 * 한국어 피동 접미사 패턴 감지
 *
 * 피동사 활용 패턴:
 * - 열리다 → 열리 + 었다 = 열렸다 (ㄹ 받침 + 었다 축약)
 * - 들리다 → 들리 + ㄴ다 = 들린다
 * - 해결되다 → 해결되 + 었다 = 해결되었다
 */
function detectKoreanPassive(
  text: string,
): { passive: true; stem: string; base: string; type: string; english: string } | null {
  // 종결어미 제거
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // 피동사 활용형 검색 - 어미 포함 패턴 직접 매칭
  for (const [passiveVerb, info] of Object.entries(PASSIVE_VERBS)) {
    // 피동사 어간 추출 (다 제거)
    const passiveStem = passiveVerb.slice(0, -1);

    // 피동사 어간의 마지막 글자
    const lastChar = passiveStem[passiveStem.length - 1];

    // 활용 패턴 생성
    const patterns: string[] = [];

    // 기본형 (열리다)
    patterns.push(`${passiveStem}다`);

    // ㄹ 받침 동사의 축약 (열리 + 었다 → 열렸다)
    // 리다, 기다 등 'ㅣ' 모음으로 끝나는 경우
    if (lastChar === '리' || lastChar === '기' || lastChar === '히' || lastChar === '이') {
      // 리 + 었다 → 렸다
      const contracted = passiveStem.slice(0, -1) + contractVowel(lastChar, '었');
      patterns.push(`${contracted}다`);
      // 린다 (현재)
      patterns.push(`${passiveStem.slice(0, -1) + contractVowel(lastChar, 'ㄴ')}다`);
      // 리는 (현재 관형)
      patterns.push(`${passiveStem}는`);
    }

    // 되다 동사 (해결되다 → 해결되었다)
    if (lastChar === '되') {
      patterns.push(`${passiveStem}었다`);
      patterns.push(`${passiveStem}는`);
    }

    // 받다 동사 (사랑받다 → 사랑받는다, 사랑받았다)
    if (lastChar === '받') {
      patterns.push(`${passiveStem}는다`);
      patterns.push(`${passiveStem}았다`);
      patterns.push(`${passiveStem}는`);
    }

    // 당하다 동사 (비난당하다 → 비난당했다, 비난당한다)
    if (passiveStem.endsWith('당하')) {
      patterns.push(`${passiveStem.slice(0, -1)}했다`); // 당하 → 당했다
      patterns.push(`${passiveStem}ㄴ다`); // 당한다
      patterns.push(`${passiveStem}는`);
    }

    // 패턴 매칭
    for (const pattern of patterns) {
      if (cleaned.endsWith(pattern)) {
        return {
          passive: true,
          stem: passiveStem,
          base: info.base,
          type: info.type,
          english: info.english,
        };
      }
    }
  }

  return null;
}

/**
 * 모음 축약 (리 + 었 → 렸)
 */
function contractVowel(syllable: string, ending: string): string {
  // 간단한 축약 매핑
  const contractions: Record<string, Record<string, string>> = {
    리: { 었: '렸', ㄴ: '린' },
    기: { 었: '겼', ㄴ: '긴' },
    히: { 었: '혔', ㄴ: '힌' },
    이: { 었: '였', ㄴ: '인' },
  };
  return contractions[syllable]?.[ending] || syllable + ending;
}

/**
 * 한국어 사동 패턴 감지 (g4-7, g4-8)
 *
 * 두 가지 유형:
 * 1. 어휘적 사동 (lexical causative): 먹이다, 입히다 등 (-이-/-히-/-리-/-기-/-우-/-추-)
 * 2. 분석적 사동 (analytic causative): -게 하다
 */
function detectKoreanCausative(text: string): {
  causative: true;
  type: 'lexical' | 'analytic';
  verb: string;
  english: string;
  object?: string;
  recipient?: string;
  tense: 'past' | 'present';
} | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // 1. 분석적 사동: -게 하다/했다/해/합니다/했습니다
  // "그를 가게 했다" → made him go
  const analyticPattern = /^(.+)를?\s*(.+)게\s*(하다|했다|해|합니다|했습니다)$/;
  const analyticMatch = cleaned.match(analyticPattern);
  if (analyticMatch) {
    const object = analyticMatch[1].trim();
    const verbStem = analyticMatch[2].trim();
    const ending = analyticMatch[3];
    const tense = ending.includes('했') || ending === '해' ? 'past' : 'present';

    // 동사 어간 → 영어 원형 찾기
    const enVerb = KO_EN[`${verbStem}다`] || VERB_STEMS[verbStem] || verbStem;

    return {
      causative: true,
      type: 'analytic',
      verb: verbStem,
      english: enVerb,
      object: object,
      tense,
    };
  }

  // 2. 어휘적 사동: 먹이다 형태
  // "아이에게 밥을 먹였다" → fed rice to the child → I fed the child
  for (const [causativeVerb, info] of Object.entries(CAUSATIVE_VERBS)) {
    const causativeStem = causativeVerb.slice(0, -1); // 다 제거

    // 활용 패턴 생성
    const lastChar = causativeStem[causativeStem.length - 1];
    const patterns: { pattern: string; tense: 'past' | 'present' }[] = [];

    // 기본형
    patterns.push({ pattern: `${causativeStem}다`, tense: 'present' });

    // 과거형 축약
    // -이- 어간 + 었다 → -였다 (먹이 + 었다 → 먹였다)
    if (lastChar === '이') {
      patterns.push({ pattern: `${causativeStem.slice(0, -1)}였다`, tense: 'past' });
    }
    // -히- 어간 + 었다 → -혔다
    else if (lastChar === '히') {
      patterns.push({ pattern: `${causativeStem.slice(0, -1)}혔다`, tense: 'past' });
    }
    // -리- 어간 + 었다 → -렸다
    else if (lastChar === '리') {
      patterns.push({ pattern: `${causativeStem.slice(0, -1)}렸다`, tense: 'past' });
    }
    // -기- 어간 + 었다 → -겼다
    else if (lastChar === '기') {
      patterns.push({ pattern: `${causativeStem.slice(0, -1)}겼다`, tense: 'past' });
    }
    // -우- 어간 + 었다 → -웠다
    else if (lastChar === '우') {
      patterns.push({ pattern: `${causativeStem.slice(0, -1)}웠다`, tense: 'past' });
    }
    // -추- 어간 + 었다 → -췄다
    else if (lastChar === '추') {
      patterns.push({ pattern: `${causativeStem.slice(0, -1)}췄다`, tense: 'past' });
    }
    // 일반 -었다
    patterns.push({ pattern: `${causativeStem}었다`, tense: 'past' });
    patterns.push({ pattern: `${causativeStem}었어`, tense: 'past' });
    patterns.push({ pattern: `${causativeStem}었어요`, tense: 'past' });

    for (const { pattern, tense } of patterns) {
      if (cleaned.endsWith(pattern)) {
        // 문장에서 수혜자(에게)와 목적어(을/를) 추출
        const beforeVerb = cleaned.slice(0, cleaned.length - pattern.length).trim();
        const recipientMatch = beforeVerb.match(/(.+?)에게\s*/);
        const objectMatch = beforeVerb.match(/(.+?)(?:을|를)\s*/);

        return {
          causative: true,
          type: 'lexical',
          verb: causativeStem,
          english: info.english,
          recipient: recipientMatch ? recipientMatch[1].trim() : undefined,
          object: objectMatch ? objectMatch[1].trim() : undefined,
          tense,
        };
      }
    }
  }

  return null;
}

/**
 * 한국어 문장 파싱
 */
export function parseKorean(text: string): ParsedSentence {
  const original = text.trim();
  const cleanedForDetection = original.replace(/[.!?？！。]+$/, '');

  // ============================================
  // Phase 0-1: 미래 부정 패턴 우선 체크 (-지 않을 것이다)
  // 이 패턴은 보조용언 패턴보다 우선 처리해야 함
  // "먹지 않을 것이다" → won't eat
  // ============================================
  const futureNegMatch = cleanedForDetection.match(
    /^(.+)지\s*않을\s*(것이다|거야|거예요|겁니다|것입니다|것이야|거니)$/,
  );
  if (futureNegMatch) {
    const type = detectSentenceType(original);
    const verbStem = futureNegMatch[1].trim();
    // 어간에서 동사 찾기
    const token = tokenizeKoreanWord(verbStem, original);
    // 미래 부정 패턴에서 추출된 토큰은 항상 동사 역할
    token.role = 'verb';
    return {
      original,
      tokens: [token],
      type,
      tense: 'future',
      negated: true,
    };
  }

  // ============================================
  // Phase g4: 피동 패턴 우선 체크
  // "문이 열렸다" → "The door was opened"
  // "소리가 들린다" → "The sound is heard"
  // ============================================
  const passiveMatch = detectKoreanPassive(cleanedForDetection);
  if (passiveMatch) {
    const type = detectSentenceType(original);
    // 시제 감지 - 축약형 포함
    // 었다/았다: 기본 과거
    // 렸다/겼다/혔다/였다: 리/기/히/이 + 었다 축약
    // 했다: 하다의 과거 (당했다, 받았다 등)
    const pastPatterns = /었다$|았다$|렸다$|겼다$|혔다$|였다$|했다$/;
    const tense = pastPatterns.test(cleanedForDetection) ? 'past' : 'present';

    // 주어 추출 (피동사 앞의 부분)
    const subjectMatch = cleanedForDetection.match(/^(.+?)(?:이|가|은|는)\s*/);
    const subject = subjectMatch ? subjectMatch[1] : '';

    // 토큰 생성
    const tokens: Token[] = [];

    if (subject) {
      tokens.push({
        text: subject,
        stem: subject,
        role: 'subject',
        translated: translateWithWSD(subject, original) || subject,
        confidence: 0.9,
        meta: { strategy: 'passive-subject' as TokenStrategy },
      });
    }

    tokens.push({
      text: passiveMatch.stem,
      stem: passiveMatch.stem,
      role: 'verb',
      translated: passiveMatch.english,
      confidence: 1.0,
      meta: {
        strategy: 'passive-verb' as TokenStrategy,
        passiveType: passiveMatch.type as 'ri' | 'gi' | 'i' | 'hi' | 'doeda' | 'batda' | 'danghada',
        passiveBase: passiveMatch.base,
      },
    });

    return {
      original,
      tokens,
      type,
      tense,
      negated: false,
      passive: true,
      passiveType: passiveMatch.type as ParsedSentence['passiveType'],
      passiveVerbStem: passiveMatch.stem,
      passiveBaseVerb: passiveMatch.base,
    };
  }

  // ============================================
  // Phase g4: 사동 패턴 체크 (g4-7, g4-8)
  // "아이에게 밥을 먹였다" → "I fed the child"
  // "그를 가게 했다" → "I made him go"
  // ============================================
  const causativeMatch = detectKoreanCausative(cleanedForDetection);
  if (causativeMatch) {
    const type = detectSentenceType(original);

    // 토큰 생성
    const tokens: Token[] = [];

    // 목적어/수혜자 토큰 추가
    if (causativeMatch.recipient) {
      tokens.push({
        text: causativeMatch.recipient,
        stem: causativeMatch.recipient,
        role: 'indirect-object',
        translated:
          translateWithWSD(causativeMatch.recipient, original) || causativeMatch.recipient,
        confidence: 0.9,
        meta: { strategy: 'causative-recipient' as TokenStrategy },
      });
    }

    if (causativeMatch.object) {
      tokens.push({
        text: causativeMatch.object,
        stem: causativeMatch.object,
        role: 'object',
        translated: translateWithWSD(causativeMatch.object, original) || causativeMatch.object,
        confidence: 0.9,
        meta: { strategy: 'causative-object' as TokenStrategy },
      });
    }

    // 사동 동사 토큰
    tokens.push({
      text: causativeMatch.verb,
      stem: causativeMatch.verb,
      role: 'verb',
      translated: causativeMatch.english,
      confidence: 1.0,
      meta: {
        strategy: 'causative-verb' as TokenStrategy,
        causativeType: causativeMatch.type,
      },
    });

    return {
      original,
      tokens,
      type,
      tense: causativeMatch.tense,
      negated: false,
      causative: true,
      causativeType: causativeMatch.type,
      causativeVerbStem: causativeMatch.verb,
      causativeEnglish: causativeMatch.english,
      causativeObject: causativeMatch.object,
      causativeRecipient: causativeMatch.recipient,
    };
  }

  // ============================================
  // Phase g6: 조건문 패턴 체크
  // "비가 오면 땅이 젖는다" → "If it rains, the ground gets wet"
  // "부자라면 여행할 텐데" → "If I were rich, I would travel"
  // ============================================
  const conditionalMatch = detectKoreanConditional(cleanedForDetection);
  if (conditionalMatch) {
    const type = detectSentenceType(original);
    const tokens: Token[] = [];

    // 조건절에서 주요 단어 토큰화
    if (conditionalMatch.conditionVerb) {
      tokens.push({
        text: conditionalMatch.conditionClause,
        stem: conditionalMatch.conditionVerb,
        role: 'verb',
        translated:
          translateWithWSD(conditionalMatch.conditionVerb, original) ||
          conditionalMatch.conditionVerb,
        confidence: 0.9,
        meta: { strategy: 'conditional-clause' as TokenStrategy },
      });
    }

    // 결과절 토큰화
    if (conditionalMatch.resultClause) {
      tokens.push({
        text: conditionalMatch.resultClause,
        stem: conditionalMatch.resultVerb || conditionalMatch.resultClause,
        role: 'verb',
        translated: conditionalMatch.resultClause,
        confidence: 0.9,
        meta: { strategy: 'result-clause' as TokenStrategy },
      });
    }

    return {
      original,
      tokens,
      type,
      tense: 'present', // 조건문의 시제는 generator에서 유형별로 처리
      negated: false,
      conditional: true,
      conditionalType: conditionalMatch.type,
      conditionalClause: conditionalMatch.conditionClause,
      resultClause: conditionalMatch.resultClause,
    };
  }

  // ============================================
  // Phase g24: 인용 표현 체크 (추측보다 먼저!)
  // "간다고 했다" → "said that (someone) goes"
  // "가냐고 물었다" → "asked if (someone) goes"
  // ============================================
  const quotationMatch = detectKoreanQuotation(cleanedForDetection);
  if (quotationMatch) {
    const type = detectSentenceType(original);
    const tokens: Token[] = [];

    // 어간 토큰
    tokens.push({
      text: quotationMatch.stem,
      stem: quotationMatch.stem,
      role: 'verb',
      confidence: 0.9,
      meta: { strategy: 'quotation-stem' as TokenStrategy },
    });

    return {
      original,
      tokens,
      type,
      tense: quotationMatch.tense === 'past' ? 'past' : 'present',
      negated: false,
      quotation: true,
      quotationType: quotationMatch.type,
      quotationStem: quotationMatch.stem,
      quotationTense: quotationMatch.tense,
      quotationVerb: quotationMatch.quotationVerb,
    };
  }

  // ============================================
  // Phase g23: 추측 표현 체크 (명사절보다 먼저!)
  // "갈 것 같다" → "probably will go"
  // "갔다고 하다" → "I heard that (someone) went"
  // ============================================
  const conjectureMatch = detectKoreanConjecture(cleanedForDetection);
  if (conjectureMatch) {
    const type = detectSentenceType(original);
    const tokens: Token[] = [];

    // 어간 토큰
    tokens.push({
      text: conjectureMatch.stem,
      stem: conjectureMatch.stem,
      role: 'verb',
      confidence: 0.9,
      meta: { strategy: 'conjecture-stem' as TokenStrategy },
    });

    return {
      original,
      tokens,
      type,
      tense: conjectureMatch.tense,
      negated: false,
      conjecture: true,
      conjectureType: conjectureMatch.type,
      conjectureStem: conjectureMatch.stem,
      conjectureTense: conjectureMatch.tense,
    };
  }

  // ============================================
  // Phase g8: 명사절 패턴 체크
  // "그가 왔다는 것이 중요하다" → "That he came is important"
  // "그가 올지 궁금하다" → "I wonder if he will come"
  // ============================================
  const nounClauseMatch = detectKoreanNounClause(cleanedForDetection);
  if (nounClauseMatch) {
    const type = detectSentenceType(original);
    const tokens: Token[] = [];

    // 주어가 있으면 토큰 추가
    if (nounClauseMatch.subject) {
      tokens.push({
        text: nounClauseMatch.subject,
        stem: nounClauseMatch.subject,
        role: 'subject',
        translated: translateWithWSD(nounClauseMatch.subject, original) || nounClauseMatch.subject,
        confidence: 0.9,
        meta: { strategy: 'noun-clause-subject' as TokenStrategy },
      });
    }

    // 동사 토큰 추가
    if (nounClauseMatch.verb) {
      tokens.push({
        text: nounClauseMatch.verb,
        stem: nounClauseMatch.verb,
        role: 'verb',
        translated: translateWithWSD(nounClauseMatch.verb, original) || nounClauseMatch.verb,
        confidence: 0.9,
        meta: { strategy: 'noun-clause-verb' as TokenStrategy },
      });
    }

    // 주절 술어 토큰 추가
    tokens.push({
      text: nounClauseMatch.mainPredicate,
      stem: nounClauseMatch.mainPredicate,
      role: 'verb',
      translated:
        translateWithWSD(nounClauseMatch.mainPredicate, original) || nounClauseMatch.mainPredicate,
      confidence: 0.9,
      meta: { strategy: 'main-predicate' as TokenStrategy },
    });

    return {
      original,
      tokens,
      type,
      tense: /었|았|했|렸|겼|였|혔/.test(cleanedForDetection) ? 'past' : 'present',
      negated: /모른다|모르|않/.test(cleanedForDetection),
      nounClause: true,
      nounClauseType: nounClauseMatch.type,
      nounClauseContent: nounClauseMatch.nounClauseContent,
      mainPredicate: nounClauseMatch.mainPredicate,
      whWord: nounClauseMatch.whWord,
    };
  }

  // ============================================
  // Phase g9: 관계절 패턴 체크
  // "내가 산 책" → "the book that I bought"
  // "그가 사는 집" → "the home where he lives"
  // ============================================
  const relativeClauseMatch = detectKoreanRelativeClause(cleanedForDetection);

  if (relativeClauseMatch) {
    const type = detectSentenceType(original);
    const tokens: Token[] = [];

    // 관계절 주어 토큰
    if (relativeClauseMatch.clauseSubject) {
      tokens.push({
        text: relativeClauseMatch.clauseSubject,
        stem: relativeClauseMatch.clauseSubject,
        role: 'subject',
        translated:
          translateWithWSD(relativeClauseMatch.clauseSubject, original) ||
          relativeClauseMatch.clauseSubject,
        confidence: 0.9,
        meta: { strategy: 'relative-clause-subject' as TokenStrategy },
      });
    }

    // 관계절 목적어 토큰
    if (relativeClauseMatch.clauseObject) {
      tokens.push({
        text: relativeClauseMatch.clauseObject,
        stem: relativeClauseMatch.clauseObject,
        role: 'object',
        translated:
          translateWithWSD(relativeClauseMatch.clauseObject, original) ||
          relativeClauseMatch.clauseObject,
        confidence: 0.9,
        meta: { strategy: 'relative-clause-object' as TokenStrategy },
      });
    }

    // 관계절 동사 토큰
    // 어간(clauseVerbStem)을 사용하여 올바른 동사 번역 (산→사→buy, 사는→살→live)
    if (relativeClauseMatch.clauseVerb) {
      const verbStem = relativeClauseMatch.clauseVerbStem || relativeClauseMatch.clauseVerb;
      // 동사 어간 + 다 = 사전형 (사 → 사다)
      const dictForm = `${verbStem}다`;
      // 동사 어간 또는 사전형으로 번역 조회
      const verbTranslation =
        VERB_STEMS[verbStem] ||
        KO_EN[dictForm] ||
        translateWithWSD(verbStem, original) ||
        translateWithWSD(dictForm, original) ||
        verbStem;

      tokens.push({
        text: relativeClauseMatch.clauseVerb,
        stem: verbStem,
        role: 'verb',
        translated: verbTranslation,
        confidence: 0.9,
        meta: {
          strategy: 'relative-clause-verb' as TokenStrategy,
          tense: relativeClauseMatch.clauseVerbTense,
        },
      });
    }

    // 선행사(head noun) 토큰
    tokens.push({
      text: relativeClauseMatch.antecedent,
      stem: relativeClauseMatch.antecedent,
      role: 'object', // 선행사는 명사이므로 object 역할
      translated:
        translateWithWSD(relativeClauseMatch.antecedent, original) ||
        relativeClauseMatch.antecedent,
      confidence: 0.9,
      meta: { strategy: 'relative-clause-antecedent' as TokenStrategy },
    });

    // 시제는 관형형 어미에서 추출 (clauseVerbTense 사용)
    const detectedTense = relativeClauseMatch.clauseVerbTense || 'present';
    const tenseMapping: Record<string, 'past' | 'present' | 'future'> = {
      past: 'past',
      present: 'present',
      future: 'future',
    };

    return {
      original,
      tokens,
      type,
      tense: tenseMapping[detectedTense] || 'present',
      negated: false,
      relativeClause: true,
      relativeClauseType: relativeClauseMatch.type,
      relativeAntecedent: relativeClauseMatch.antecedent,
      relativeClauseContent: relativeClauseMatch.clauseContent,
    };
  }

  // ============================================
  // Phase 0: 보조용언 패턴 우선 체크 (긴급 수정)
  // "-고 있다", "-고 싶다" 등을 먼저 인식하여
  // "하고"→"하구" 오매칭 방지
  // ============================================
  const auxMatch = detectAuxiliaryPattern(cleanedForDetection);
  if (auxMatch) {
    const type = detectSentenceType(original);
    return parseWithAuxiliaryPattern(original, auxMatch, type);
  }

  // 0. 복합어/관용어 우선 체크 (띄어쓰기 유무 상관없이)
  // "배고프다", "배가 고프다" 등을 통째로 인식
  const compoundMatch = matchCompoundExpression(cleanedForDetection);
  if (compoundMatch && !compoundMatch.remaining) {
    // 전체 문장이 복합어인 경우
    const type = detectSentenceType(original);
    return {
      original,
      tokens: [
        {
          text: compoundMatch.pattern,
          stem: compoundMatch.pattern,
          role: 'compound',
          translated: compoundMatch.translation,
          confidence: 1.0,
          meta: { strategy: 'compound' as TokenStrategy },
        },
      ],
      type,
      tense: 'present',
      negated: false,
    };
  }

  // 1. 문장 유형 감지
  const type = detectSentenceType(original);

  // 2. 구두점 제거
  let cleaned = original.replace(/[.!?？！。]+$/, '').trim();

  // Phase 3: 미래 시제 패턴 통합 (공백 제거)
  // "갈 거야" → "갈거야", "먹을 거야" → "먹을거야"
  // "학교에 갈 거야" → "학교에 갈거야"
  cleaned = cleaned.replace(/(\S+)\s+(거야|거예요|겁니다)$/g, '$1$2');
  // "갈게", "먹을게" 등은 이미 붙어있음

  // Phase 4: 부정문 패턴 통합 (공백 제거)
  // "마시지 않았어" → "마시지않았어"
  // "가지 못했어" → "가지못했어"
  cleaned = cleaned.replace(/(\S+지)\s+(않|못)/g, '$1$2');

  // Phase 5: "안" / "못" 전치 부정 감지
  // "안 먹어" → 부정 + "먹어"
  // "못 먹어" → 능력 부정 + "먹어"
  let prefixNegation = false;
  let inabilityNegation = false; // 못 부정 (can't)

  if (/^안\s+/.test(cleaned)) {
    prefixNegation = true;
    cleaned = cleaned.replace(/^안\s+/, '');
  } else if (/^못\s+/.test(cleaned)) {
    inabilityNegation = true;
    cleaned = cleaned.replace(/^못\s+/, '');
  }
  // 문장 중간의 "안" 처리: "나는 안 먹어" → "나는" + 부정 + "먹어"
  // "안"이 동사 바로 앞에 오는 경우
  cleaned = cleaned.replace(/\s+안\s+(\S+)$/, (_, verb) => {
    prefixNegation = true;
    return ` ${verb}`;
  });
  // 문장 중간의 "못" 처리: "나는 못 먹어" → "나는" + 능력부정 + "먹어"
  cleaned = cleaned.replace(/\s+못\s+(\S+)$/, (_, verb) => {
    inabilityNegation = true;
    return ` ${verb}`;
  });

  // Phase 6: "더" / "가장" 비교급/최상급 감지
  // "더 크다" → comparative + "크다"
  // "가장 크다" → superlative + "크다"
  let comparativeType: 'comparative' | 'superlative' | undefined;
  if (/^더\s+/.test(cleaned)) {
    comparativeType = 'comparative';
    cleaned = cleaned.replace(/^더\s+/, '');
  } else if (/^가장\s+/.test(cleaned)) {
    comparativeType = 'superlative';
    cleaned = cleaned.replace(/^가장\s+/, '');
  }
  // 문장 중간의 비교급: "그녀는 더 크다" → "그녀는" + comparative + "크다"
  cleaned = cleaned.replace(/\s+더\s+(\S+)$/, (_, adj) => {
    comparativeType = 'comparative';
    return ` ${adj}`;
  });
  cleaned = cleaned.replace(/\s+가장\s+(\S+)$/, (_, adj) => {
    comparativeType = 'superlative';
    return ` ${adj}`;
  });

  // 3. 공백으로 분리 + 숫자+분류사 분리
  const rawWords = cleaned.split(/\s+/).filter(Boolean);
  const words: string[] = [];

  for (const word of rawWords) {
    // 숫자+분류사 패턴 분리 (예: "1개" → "1", "개")
    const numCounterMatch = word.match(/^(\d+)(개|마리|명|권|잔|병|대)$/);
    if (numCounterMatch) {
      words.push(numCounterMatch[1]); // 숫자
      words.push(numCounterMatch[2]); // 분류사
    } else {
      words.push(word);
    }
  }

  // 4-1. "-지 마" 금지 부정 감지
  // "먹지 마!" → prohibitiveNegation + 동사 어간 추출
  let prohibitiveNegation = false;
  const jiMaMatch = cleaned.match(/^(.+)지\s*마(!?)$/);
  if (jiMaMatch) {
    prohibitiveNegation = true;
    // 어간만 남김
    cleaned = jiMaMatch[1];
  }

  // 4-2. "-지 못하다" 능력 부정 감지
  // "먹지 못한다" → inabilityNegation + 동사 어간 추출
  const jiMotMatch = cleaned.match(/^(.+)지\s*못(한다|해|해요|합니다|했다|했어|했어요)$/);
  if (jiMotMatch) {
    inabilityNegation = true;
    cleaned = jiMotMatch[1];
  }

  // 4-3. "-지 않을 것이다" 미래 부정 감지
  // "먹지 않을 것이다" → futureNegation + 동사 어간 추출
  let futureNegation = false;
  const jiAnhFutureMatch = cleaned.match(/^(.+)지\s*않을\s*(것이다|거야|거예요|겁니다|것입니다)$/);
  if (jiAnhFutureMatch) {
    futureNegation = true;
    prefixNegation = true; // negated 플래그도 설정
    cleaned = jiAnhFutureMatch[1];
  }

  // 4. 각 단어를 토큰으로 변환 (WSD를 위해 원문 전달)
  const tokens: Token[] = [];
  let sentenceTense: Tense = futureNegation ? 'future' : 'present'; // 미래 부정이면 future 시제
  let negated = prefixNegation; // Phase 5: "안" 전치 부정 반영

  // 재파싱: 금지/능력/미래 부정으로 어간이 추출된 경우
  const wordsToTokenize =
    prohibitiveNegation || (inabilityNegation && jiMotMatch) || futureNegation
      ? cleaned.split(/\s+/).filter(Boolean)
      : words;

  for (const word of wordsToTokenize) {
    const token = tokenizeKoreanWord(word, original);
    tokens.push(token);

    // 시제/부정 정보 수집
    if (token.meta?.tense) sentenceTense = token.meta.tense;
    if (token.meta?.negated) negated = true;
  }

  return {
    original,
    tokens,
    type: prohibitiveNegation ? 'imperative' : type, // -지 마 → 명령문
    tense: sentenceTense,
    negated,
    inabilityNegation: inabilityNegation || undefined,
    prohibitiveNegation: prohibitiveNegation || undefined,
    comparativeType,
  };
}

/**
 * 문장 유형 감지
 */
function detectSentenceType(text: string): SentenceType {
  // 구두점 제거 후 어미 분석용 텍스트
  const cleanText = text.replace(/[.!?？！。]+$/, '').trim();

  // 1. 청유문 어미 (-자, -읍시다, -ㅂ시다) - 느낌표와 무관하게 우선 감지
  // "책을 읽자", "같이 가자", "공부합시다"
  if (/(자|읍시다|ㅂ시다)\s*$/.test(cleanText)) return 'suggestion';

  // 2. 명령문 어미 (-아라/-어라, -해라, -라, -세요, -십시오)
  // "책을 읽어라", "가거라", "공부하세요", "앉으십시오"
  if (/(아라|어라|해라|거라|라|세요|십시오|시오)\s*$/.test(cleanText)) return 'imperative';

  // 2-1. 영어 부정 명령문 감지 - Don't/Do not + verb
  // "Don't run!", "Do not touch" → imperative
  if (/^(Don't|Do not)\s+/i.test(cleanText)) return 'imperative';

  // 3. 구두점 기반 감지
  if (/[?？]/.test(text)) return 'question';

  // 4. 느낌표가 있으면서 명령형/청유형이 아닌 경우 → 감탄문
  // "정말 아름답다!" → exclamation
  if (/[!！]/.test(text)) return 'exclamation';

  // 5. 한국어 의문형 어미
  if (/(니|나|까)\s*$/.test(cleanText)) return 'question';

  return 'statement';
}

/**
 * 한국어 단어 토큰화
 *
 * Pipeline v3: 유사도 검색 제거, 규칙 기반 강화
 * - Strategy A: 사전 정확 매칭 (1.0)
 * - Strategy B: 규칙 기반 추론 (0.85) - 어미 분리, 조사 분리
 * - Strategy C: 불규칙 동사 (0.9)
 * - Strategy D: 미인식 → 원문 유지 (0.3) - 추측하지 않음
 * - WSD 통합: 다의어는 문맥 기반 의미 결정
 *
 * @param word 토큰화할 단어
 * @param context 문맥 (원문 문장) - WSD에 사용
 */
function tokenizeKoreanWord(word: string, context?: string): Token {
  // 0.5. 영어 대명사 인식 (replaceKoreanPronouns로 미리 변환된 경우)
  // "그는" → "he", "그녀는" → "she" 등의 변환 후 토큰화
  const englishPronouns: Record<string, { translated: string; is3ps: boolean }> = {
    I: { translated: 'I', is3ps: false },
    you: { translated: 'you', is3ps: false },
    You: { translated: 'You', is3ps: false },
    he: { translated: 'he', is3ps: true },
    He: { translated: 'He', is3ps: true },
    she: { translated: 'she', is3ps: true },
    She: { translated: 'She', is3ps: true },
    it: { translated: 'it', is3ps: true },
    It: { translated: 'It', is3ps: true },
    we: { translated: 'we', is3ps: false },
    We: { translated: 'We', is3ps: false },
    they: { translated: 'they', is3ps: false },
    They: { translated: 'They', is3ps: false },
  };

  const pronounInfo = englishPronouns[word];
  if (pronounInfo) {
    return {
      text: word,
      stem: word,
      role: 'subject',
      translated: pronounInfo.translated,
      confidence: CONFIDENCE_DICTIONARY,
      meta: { strategy: 'dictionary', is3ps: pronounInfo.is3ps },
    };
  }

  // 1. 숫자 체크
  if (/^\d+$/.test(word)) {
    return {
      text: word,
      stem: word,
      role: 'number',
      confidence: CONFIDENCE_DICTIONARY,
      meta: { strategy: 'dictionary' },
    };
  }

  // 2. 한국어 숫자 체크
  if (KO_NUMBERS[word] !== undefined) {
    return {
      text: word,
      stem: String(KO_NUMBERS[word]),
      role: 'number',
      confidence: CONFIDENCE_DICTIONARY,
      meta: { strategy: 'dictionary' },
    };
  }

  // 3. 분류사 체크
  for (const [counter] of COUNTERS) {
    if (word === counter) {
      return {
        text: word,
        stem: word,
        role: 'counter',
        confidence: CONFIDENCE_DICTIONARY,
        meta: { strategy: 'dictionary' },
      };
    }
  }

  // 4. 조사 분리 시도 (기본형 우선)
  // 조사 붙은 단어(운동을)보다 기본형(운동)을 우선하여 역번역 검증 통과율 향상
  let stem = word;
  let particle: string | undefined;
  let role: Role = 'unknown';
  let strategy: TokenStrategy = 'unknown';
  let confidence: number = CONFIDENCE_UNKNOWN;

  for (const [p, r] of SORTED_PARTICLES) {
    if (word.endsWith(p) && word.length > p.length) {
      const possibleStem = word.slice(0, -p.length);
      // 분리된 기본형이 사전에 있으면 조사 분리 확정 (WSD 사용)
      const stemTranslation = translateWithWSD(possibleStem, context);
      if (stemTranslation) {
        stem = possibleStem;
        particle = p;
        role = r === 'subject' || r === 'topic' ? 'subject' : r === 'object' ? 'object' : 'unknown';
        // 기본형을 WSD로 번역하여 반환
        return {
          text: word,
          stem,
          role,
          translated: stemTranslation,
          confidence: CONFIDENCE_DICTIONARY,
          meta: { strategy: 'dictionary', particle },
        };
      }
      // 기본형이 사전에 없어도 조사 분리는 저장 (후속 처리용)
      stem = possibleStem;
      particle = p;
      role = r === 'subject' || r === 'topic' ? 'subject' : r === 'object' ? 'object' : 'unknown';
      break;
    }
  }

  // 5. 축약형 동사 체크 (morphology/korean-contracted.ts 사용)
  // ============================================
  // 리팩토링: contractedForms 모듈 통합
  // 해, 가, 와, 먹어, 마셔 등 현재 비격식 패턴 처리
  // ⚠️ 중요: dictionary 체크(section 5.5)보다 먼저 실행해야 함
  //    - "가"는 PARTICLES에 "가"(주격조사)와 충돌하지만, 단독 사용시 동사
  //    - morphology 모듈이 role='verb'로 정확히 인식
  //    - dictionary는 role='unknown'으로 처리하여 validator에서 롤백됨
  // ============================================
  const contractedResult = tryExtractContracted(word);
  if (contractedResult) {
    const { prefix, contracted } = contractedResult;
    // prefix가 있으면 (예: "공부해" → prefix="공부", contracted={stem:"하", ...})
    // prefix가 없으면 단독 동사 (예: "해" → prefix="", contracted={stem:"하", ...})
    const verbStem = prefix ? `${prefix}${contracted.stem}` : contracted.stem;
    // 영어 동사 결정 - lookupHadaVerb와 동일한 우선순위 적용
    // 우선순위: KO_EN[verbStem] → VERB_STEMS[verbStem] → NOUN_TO_VERB[prefix] → KO_EN[prefix] → baseMeaning
    const verbEn = prefix
      ? KO_EN[verbStem] ||
        VERB_STEMS[verbStem] ||
        NOUN_TO_VERB[prefix] ||
        KO_EN[prefix] ||
        contracted.baseMeaning
      : contracted.baseMeaning;

    // 경동사(light verb) 체크: "했어", "해" 등 단독 하다 동사
    // prefix가 없고 stem이 '하'인 경우 경동사로 표시
    const isLightVerb = !prefix && contracted.stem === '하';

    return {
      text: word,
      stem: verbStem,
      role: 'verb',
      translated: verbEn,
      confidence: CONFIDENCE_DICTIONARY,
      meta: {
        strategy: 'morphology' as TokenStrategy,
        tense: contracted.tense as Tense,
        formality: contracted.formality,
        isDescriptive: contracted.isDescriptive,
        isLightVerb,
      },
    };
  }

  // 5.1. 서술격 조사 체크 (morphology/korean-copulas.ts 사용)
  // ============================================
  // 리팩토링: copulas 모듈 통합
  // 명사 + 이다/입니다/이에요/예요/야/이야 → "is + 명사"
  // ============================================
  const copulaResult = tryExtractCopula(word);
  if (copulaResult) {
    const { noun, copula, info } = copulaResult;
    // WSD 사용하여 명사 번역
    const nounTranslation = translateWithWSD(noun, context);
    if (nounTranslation) {
      return {
        text: word,
        stem: noun,
        role: 'verb', // 서술어 역할
        // be 동사는 generator에서 주어에 맞게 활용 (I am, he is, they are)
        translated: nounTranslation,
        confidence: CONFIDENCE_RULE,
        meta: {
          strategy: 'morphology' as TokenStrategy,
          copula,
          isCopula: true,
          tense: info.tense as Tense,
          formality: info.formality,
        },
      };
    }
  }

  // 5.5. 조사 분리 안 된 단어가 사전에 있으면 그대로 사용 (WSD 사용)
  const directTranslation = translateWithWSD(word, context);
  if (!particle && directTranslation) {
    // 경동사(light verb) 패턴: 했다, 했어, 한다, 해 등
    // "[명사]를 하다" 패턴에서 하다 부분 - verb 역할 부여
    const lightVerbPattern = /^(했다|했어|했어요|했습니다|한다|해|해요|합니다|하다)$/;
    if (lightVerbPattern.test(word)) {
      const tenseInfo: Tense = word.startsWith('했') ? 'past' : 'present';
      return {
        text: word,
        stem: '하',
        role: 'verb',
        translated: 'do',
        confidence: CONFIDENCE_DICTIONARY,
        meta: { strategy: 'dictionary', tense: tenseInfo, isLightVerb: true },
      };
    }

    // 동사 기본형 (다로 끝나는 단어) - VERB_STEMS 확인
    // "가다", "오다", "보다" 등 기본형 동사를 verb 역할로 인식
    if (word.endsWith('다') && word.length >= 2) {
      const stemOnly = word.slice(0, -1); // 다 제거
      if (VERB_STEMS[stemOnly]) {
        return {
          text: word,
          stem: word,
          role: 'verb',
          translated: VERB_STEMS[stemOnly],
          confidence: CONFIDENCE_DICTIONARY,
          meta: { strategy: 'dictionary' },
        };
      }
    }

    // 동사 현재형 활용 (-는다 패턴) - 외부 사전보다 규칙 기반 우선
    // "먹는다", "읽는다" 등 현재형 활용은 원형(eat, read)으로 반환
    // 외부 사전에 활용형(eats)이 있어도 무시하고 원형 사용
    if (word.endsWith('는다') && word.length >= 3) {
      const stemOnly = word.slice(0, -2); // 는다 제거 → 먹, 읽
      const verbEn = VERB_STEMS[stemOnly] || KO_EN[stemOnly];
      if (verbEn) {
        return {
          text: word,
          stem: stemOnly,
          role: 'verb',
          translated: verbEn,
          confidence: CONFIDENCE_DICTIONARY,
          meta: { strategy: 'rule', tense: 'present' as Tense },
        };
      }
    }

    // 동사 현재형 활용 (-ㄴ다 패턴) - 받침 없는 어간
    // "간다" (가+ㄴ다), "본다" (보+ㄴ다) 등
    if (word.endsWith('다') && word.length >= 2) {
      const beforeDa = word.slice(0, -1);
      const lastChar = beforeDa[beforeDa.length - 1];
      if (lastChar) {
        // 마지막 글자에 ㄴ 받침이 있으면 제거하여 어간 추출
        const code = lastChar.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) {
          const offset = code - 0xac00;
          const jongIndex = offset % 28;
          // ㄴ 받침 (index 4)
          if (jongIndex === 4) {
            const stemChar = String.fromCharCode(code - 4); // ㄴ 받침 제거
            const stem = beforeDa.slice(0, -1) + stemChar;
            const verbEn = VERB_STEMS[stem] || KO_EN[stem];
            if (verbEn) {
              return {
                text: word,
                stem: stem,
                role: 'verb',
                translated: verbEn,
                confidence: CONFIDENCE_DICTIONARY,
                meta: { strategy: 'rule', tense: 'present' as Tense },
              };
            }
          }
        }
      }
    }

    // 부사 인식: KO_SIMPLE_ADVERBS에 있거나 대문자로 시작(감탄사)
    const isAdverb = KO_SIMPLE_ADVERBS[word] !== undefined || /^[A-Z]/.test(directTranslation);
    const wordRole: Role = isAdverb ? 'adverb' : 'unknown';
    return {
      text: word,
      stem: word,
      role: wordRole,
      translated: directTranslation,
      confidence: CONFIDENCE_DICTIONARY,
      meta: { strategy: 'dictionary' },
    };
  }

  // 6. 동사 활용형 체크 - 규칙 기반 + 축약형 맵
  let tense: Tense | undefined;
  let negated = false;
  let translated: string | undefined;

  // 6-1. 먼저 규칙 기반 어간 추출 시도 (모음조화 규칙)
  const ruleResult = extractVerbStemByRule(stem);
  if (ruleResult) {
    stem = ruleResult.stem;
    translated = ruleResult.en;
    tense = ruleResult.tense;
    role = 'verb';
    strategy = 'rule';
    confidence = CONFIDENCE_RULE;
    // Phase 4: 부정문 처리
    if (ruleResult.negated) {
      negated = true;
    }
  }

  // 6-2. 규칙으로 안 되면 어미 분리 후 확인
  if (!translated) {
    for (const [ending, t] of SORTED_ENDINGS) {
      if (stem.endsWith(ending)) {
        const verbPart = stem.slice(0, -ending.length);
        if (verbPart.length > 0) {
          // 축약형 맵에서 찾기 (갔, 먹었, 했 등)
          const verbInfo = KO_VERB_MAP.get(verbPart);
          if (verbInfo) {
            stem = verbInfo.stem;
            translated = verbInfo.en;
            tense = verbInfo.tense as Tense;
            role = 'verb';
            strategy = 'dictionary';
            confidence = CONFIDENCE_DICTIONARY;
            break;
          }
          // VERB_STEMS에서 어간 찾기
          const verbEn = VERB_STEMS[verbPart];
          if (verbEn) {
            stem = verbPart;
            translated = verbEn;
            tense = t as Tense;
            role = 'verb';
            strategy = 'dictionary';
            confidence = CONFIDENCE_DICTIONARY;
            break;
          }
          // 기본 사전에서 어간 찾기 (WSD 사용)
          const verbPartTranslation = translateWithWSD(verbPart, context);
          if (verbPartTranslation) {
            stem = verbPart;
            translated = verbPartTranslation;
            tense = t as Tense;
            role = 'verb';
            strategy = 'dictionary';
            confidence = CONFIDENCE_DICTIONARY;
            break;
          }
        }
      }
    }
  }

  // 7. 활용형이 어미 없이 바로 나온 경우 (갔, 했 등 단독)
  if (!translated) {
    const verbInfo = KO_VERB_MAP.get(stem);
    if (verbInfo) {
      translated = verbInfo.en;
      tense = verbInfo.tense as Tense;
      role = 'verb';
      stem = verbInfo.stem;
      strategy = 'dictionary';
      confidence = CONFIDENCE_DICTIONARY;
    }
  }

  // 7-1. VERB_STEMS에서도 찾기
  if (!translated && VERB_STEMS[stem]) {
    translated = VERB_STEMS[stem];
    role = 'verb';
    strategy = 'dictionary';
    confidence = CONFIDENCE_DICTIONARY;
  }

  // 8. 부정 체크 (어미에 포함된 경우)
  for (const [_ending] of SORTED_ENDINGS) {
    if (word.includes('않') || word.includes('못')) {
      negated = true;
      break;
    }
  }

  // 9. 부정 접두어 체크
  if (stem.startsWith('안 ') || stem.startsWith('못 ')) {
    negated = true;
    stem = stem.slice(2);
  }

  // 10. 사전에서 번역 찾기 (아직 없으면) - WSD 사용
  if (!translated) {
    translated = translateWithWSD(stem, context);
    if (translated) {
      strategy = 'dictionary';
      confidence = CONFIDENCE_DICTIONARY;
    }
  }

  // 11. 미인식 단어 처리 (v3.0: 유사도 검색 제거)
  // "모르면 추측"이 아닌 "모르면 원문 유지"
  // → 할루시네이션 방지
  if (!translated) {
    // 원문 그대로 유지 (번역하지 않음)
    translated = undefined;
    strategy = 'unknown';
    confidence = CONFIDENCE_UNKNOWN;
  }

  return {
    text: word,
    stem,
    role,
    translated,
    confidence,
    meta: {
      tense,
      negated: negated || undefined,
      particle,
      strategy,
    },
  };
}

/**
 * 영어 문장 파싱
 */
export function parseEnglish(text: string): ParsedSentence {
  const original = text.trim();
  const type = detectSentenceType(original);
  const cleaned = original.replace(/[.!?]+$/, '').trim();

  // 간단한 공백 분리 (영어는 형태소 분석 불필요)
  const words = cleaned.split(/\s+/).filter(Boolean);
  const tokens: Token[] = words.map((word) => ({
    text: word,
    stem: word.toLowerCase(),
    role: 'unknown' as Role,
  }));

  // g4: 영어 수동태 감지
  // 패턴: "was/were/is/are/been + past participle"
  const passiveResult = detectEnglishPassive(words);

  // g6: 영어 조건문 감지
  const conditionalResult = detectEnglishConditional(cleaned);

  // g8: 영어 명사절 감지
  const nounClauseResult = detectEnglishNounClause(cleaned);

  // g9: 영어 관계절 감지
  const relativeClauseResult = detectEnglishRelativeClause(cleaned);

  // g24: 영어 인용 표현 감지
  const quotationResult = detectEnglishQuotation(cleaned);

  const result: ParsedSentence = {
    original,
    tokens,
    type,
    tense: detectEnglishTense(words),
    negated: words.some((w) =>
      /^(not|n't|don't|doesn't|didn't|won't|can't|cannot|couldn't|wouldn't|shouldn't|mustn't|mightn't)$/i.test(
        w,
      ),
    ),
    // g4: 수동태 관련 필드
    englishPassive: passiveResult?.passive,
    englishPassiveVerb: passiveResult?.verb,
    passiveAgent: passiveResult?.agent,
  };

  // g6: 조건문 필드 추가
  if (conditionalResult) {
    result.conditional = true;
    result.englishConditional = true;
    result.englishConditionalType = conditionalResult.type;
    result.conditionalClause = conditionalResult.conditionClause;
    result.resultClause = conditionalResult.resultClause;
  }

  // g8: 명사절 필드 추가
  if (nounClauseResult) {
    result.nounClause = true;
    result.nounClauseType = nounClauseResult.type;
    result.nounClauseContent = nounClauseResult.nounClauseContent;
    result.mainPredicate = nounClauseResult.mainPredicate;
    result.whWord = nounClauseResult.whWord;
  }

  // g9: 관계절 필드 추가
  if (relativeClauseResult) {
    result.relativeClause = true;
    result.englishRelativeClause = true;
    result.relativeClauseType = relativeClauseResult.type;
    result.relativeAntecedent = relativeClauseResult.antecedent;
    result.relativeClauseContent = relativeClauseResult.clauseContent;
    // 관계절 토큰 추가
    const relTokens: Token[] = [];

    // 주어 토큰 (있는 경우)
    if (relativeClauseResult.clauseSubject) {
      relTokens.push({
        text: relativeClauseResult.clauseSubject,
        stem: relativeClauseResult.clauseSubject.toLowerCase(),
        role: 'subject',
        meta: { strategy: 'relative-clause-subject' as TokenStrategy },
      });
    }

    // 동사 토큰
    if (relativeClauseResult.clauseVerb) {
      relTokens.push({
        text: relativeClauseResult.clauseVerb,
        stem: relativeClauseResult.clauseVerb.toLowerCase(),
        role: 'verb',
        meta: { strategy: 'relative-clause-verb' as TokenStrategy },
      });
    }

    // 목적어 토큰 (who 타입에서 사용)
    if (relativeClauseResult.clauseObject) {
      relTokens.push({
        text: relativeClauseResult.clauseObject,
        stem: relativeClauseResult.clauseObject.toLowerCase(),
        role: 'object',
        meta: { strategy: 'relative-clause-object' as TokenStrategy },
      });
    }

    // 선행사 토큰
    relTokens.push({
      text: relativeClauseResult.antecedent,
      stem: relativeClauseResult.antecedent.toLowerCase(),
      role: 'object',
      meta: { strategy: 'relative-clause-antecedent' as TokenStrategy },
    });

    result.tokens = relTokens;
    result.tense = relativeClauseResult.tense || 'present';
  }

  // g23: 영어 추측 표현 감지
  const conjectureResult = detectEnglishConjecture(cleaned);
  if (conjectureResult) {
    result.englishConjecture = true;
    result.conjecture = true;
    // 영어 추측 유형 → 한국어 추측 유형으로 매핑
    const typeMap: Record<string, ParsedSentence['conjectureType']> = {
      probably: 'geot-gatda',
      seems: 'ga-boda',
      appears: 'moyang',
      'must-be': 'certain',
      'might-have': 'jido-moreunda',
      might: 'jido-moreunda',
    };
    result.conjectureType = typeMap[conjectureResult.type] || 'geot-gatda';
    result.conjectureStem = conjectureResult.adjective || conjectureResult.verb || '';
    result.conjectureTense = conjectureResult.tense;
  }

  // g24: 영어 인용 표현 필드 추가
  if (quotationResult) {
    result.quotation = true;
    result.englishQuotation = true;
    // 영어 인용 유형 → 한국어 인용 유형으로 매핑
    const typeMap: Record<string, ParsedSentence['quotationType']> = {
      'said-that': 'dago',
      'asked-if': 'nyago',
      'told-to': 'rago',
      suggested: 'jago',
      'heard-that': 'dago', // 들었다 → -다고 하다
    };
    result.quotationType = typeMap[quotationResult.type] || 'dago';
    result.quotationStem = quotationResult.quotedVerb;
    result.quotationTense = quotationResult.tense;
    // 인용 토큰 추가
    result.tokens = [
      {
        text: quotationResult.quotedVerb,
        stem: quotationResult.quotedVerb,
        role: 'verb',
        meta: { strategy: 'quotation-verb' as TokenStrategy },
      },
    ];
  }

  // g15: 영어 종결어미 패턴 감지
  // "I eat (formal)" → 먹습니다
  // "Please eat" → 드세요
  // "Let's eat" → 먹자
  const finalPatternResult = detectEnglishFinalPattern(original);
  if (finalPatternResult) {
    result.englishFinalPatternType = finalPatternResult.type;
    result.englishFinalPatternVerb = finalPatternResult.verb;
    // 동사 토큰 추가
    result.tokens = [
      {
        text: finalPatternResult.verb,
        stem: finalPatternResult.verb.toLowerCase(),
        role: 'verb',
        meta: { strategy: 'final-pattern-verb' as TokenStrategy },
      },
    ];
  }

  return result;
}

/**
 * 영어 수동태 감지
 * 패턴: "was/were/is/are + past participle (+ by agent)"
 */
function detectEnglishPassive(
  words: string[],
): { passive: true; verb: string; agent?: string } | null {
  const lowerWords = words.map((w) => w.toLowerCase());

  // be 동사 찾기
  const beIndex = lowerWords.findIndex((w) =>
    ['was', 'were', 'is', 'are', 'been', 'being'].includes(w),
  );

  if (beIndex === -1) return null;

  // be 동사 다음 단어가 과거분사인지 확인
  const nextWord = lowerWords[beIndex + 1];
  if (!nextWord) return null;

  // 과거분사 판단 (ended with -ed, -en, -t 또는 불규칙 과거분사)
  const isPastParticiple =
    nextWord.endsWith('ed') || nextWord.endsWith('en') || IRREGULAR_PAST_PARTICIPLES.has(nextWord);

  if (!isPastParticiple) return null;

  // by + agent 찾기
  const byIndex = lowerWords.indexOf('by', beIndex + 2);
  let agent: string | undefined;
  if (byIndex !== -1 && byIndex < lowerWords.length - 1) {
    // by 뒤의 모든 단어를 agent로 (끝까지 또는 다음 전치사까지)
    agent = words.slice(byIndex + 1).join(' ');
  }

  return {
    passive: true,
    verb: nextWord,
    agent,
  };
}

/**
 * 영어 불규칙 과거분사 목록
 */
const IRREGULAR_PAST_PARTICIPLES = new Set([
  // be동사
  'been',
  // 기본 동사
  'eaten',
  'gone',
  'come',
  'seen',
  'taken',
  'given',
  'made',
  'got',
  'gotten',
  'read',
  'written',
  'slept',
  'woken',
  'bought',
  'sold',
  'run',
  'ridden',
  'hit',
  'caught',
  'held',
  'fallen',
  // 인지/사고 동사
  'thought',
  'known',
  'understood',
  'forgotten',
  'meant',
  'felt',
  'found',
  'taught',
  'told',
  'said',
  'spoken',
  // 행위 동사
  'broken',
  'chosen',
  'worn',
  'done',
  'sung',
  'drunk',
  'begun',
  'swum',
  'driven',
  // 수동태에서 자주 쓰이는
  'loved',
  'respected',
  'criticized',
  'attacked',
  'punished',
  'praised',
  'recognized',
  'used',
  'built',
  'solved',
  'discovered',
  'destroyed',
]);

/**
 * g6: 영어 조건문 감지
 * - Type 0: If + present, present (일반적 진리)
 * - Type 1: If + present, will + base (실현 가능 조건)
 * - Type 2: If + were/past, would + base (현재 가정법)
 * - Type 3: If + had + pp, would have + pp (과거 가정법)
 * - Unless: Unless + clause
 * - Even if: Even if + clause
 */
interface EnglishConditionalMatch {
  type: 'type0' | 'type1' | 'type2' | 'type3' | 'unless' | 'even-if';
  conditionClause: string;
  resultClause?: string;
}

function detectEnglishConditional(text: string): EnglishConditionalMatch | null {
  const cleaned = text.trim();

  // Even if 패턴 (먼저 체크 - If보다 구체적)
  const evenIfMatch = cleaned.match(/^Even if\s+(.+?)$/i);
  if (evenIfMatch) {
    return {
      type: 'even-if',
      conditionClause: evenIfMatch[1].trim(),
    };
  }

  // Unless 패턴
  const unlessMatch = cleaned.match(/^Unless\s+(.+?)$/i);
  if (unlessMatch) {
    return {
      type: 'unless',
      conditionClause: unlessMatch[1].trim(),
    };
  }

  // If 패턴 분석
  const ifMatch = cleaned.match(/^If\s+(.+?),\s*(.+)$/i);
  if (ifMatch) {
    const conditionClause = ifMatch[1].trim();
    const resultClause = ifMatch[2].trim();

    // Type 3: If + had + pp, would have + pp
    // 예: "If I had known, I would have helped"
    if (/\bhad\b/i.test(conditionClause) && /\bwould\s+have\b/i.test(resultClause)) {
      return { type: 'type3', conditionClause, resultClause };
    }

    // Type 2: If + were, would + base
    // 예: "If I were you, I would go"
    if (/\bwere\b/i.test(conditionClause) && /\bwould\b/i.test(resultClause)) {
      return { type: 'type2', conditionClause, resultClause };
    }

    // Type 1: If + present, will + base
    // 예: "If it snows, I will stay home"
    if (/\bwill\b/i.test(resultClause)) {
      return { type: 'type1', conditionClause, resultClause };
    }

    // Type 0: If + present, present (기본)
    // 예: "If you study, you learn"
    return { type: 'type0', conditionClause, resultClause };
  }

  return null;
}

/**
 * 영어 불규칙 과거형 동사
 *
 * 규칙 동사는 -ed로 끝나므로 정규식으로 감지
 * 불규칙 동사는 개별 매핑 필요
 *
 * data.ts의 IRREGULAR_VERBS와 동기화됨 (80개+)
 */
const IRREGULAR_PAST_VERBS = new Set([
  // be동사
  'was',
  'were',
  // have/do
  'had',
  'did',
  // 기본 동사
  'ate', // eat
  'went', // go
  'came', // come
  'saw', // see
  'took', // take
  'gave', // give
  'made', // make
  'got', // get
  'read', // read
  'wrote', // write
  'slept', // sleep
  'woke', // wake
  'bought', // buy
  'sold', // sell
  'ran', // run
  'rode', // ride
  'hit', // hit
  'caught', // catch
  'held', // hold
  'fell', // fall
  // 인지/사고 동사
  'thought', // think
  'knew', // know
  'understood', // understand
  'forgot', // forget
  'meant', // mean
  'felt', // feel
  'found', // find
  'taught', // teach
  'told', // tell
  'said', // say
  'spoke', // speak
  // 이동/위치 동사
  'sat', // sit
  'stood', // stand
  'lay', // lie
  'laid', // lay
  'rose', // rise
  'flew', // fly
  'swam', // swim
  'drove', // drive
  'left', // leave
  'met', // meet
  'brought', // bring
  'sent', // send
  'spent', // spend
  'lent', // lend
  'led', // lead
  // 행위 동사
  'put', // put
  'set', // set
  'let', // let
  'cut', // cut
  'shut', // shut
  'cost', // cost
  'hurt', // hurt
  'broke', // break
  'chose', // choose
  'threw', // throw
  'grew', // grow
  'blew', // blow
  'drew', // draw
  'wore', // wear
  'tore', // tear
  'beat', // beat
  'began', // begin
  'sang', // sing
  'rang', // ring
  'sank', // sink
  // 소유/획득 동사
  'lost', // lose
  'won', // win
  'kept', // keep
  'paid', // pay
  'built', // build
  'fought', // fight
  'sought', // seek
  'bound', // bind
  'hung', // hang
  'stuck', // stick
  // 조동사
  'could', // can
  'would', // will
  'should', // shall
  'might', // may
]);

/**
 * 영어 시제 감지
 *
 * 규칙:
 * - have/has + pp → 현재완료 (present-perfect)
 * - had + pp → 과거완료 (past-perfect)
 * - 불규칙 과거형 동사 → 과거
 * - -ed로 끝나는 단어 → 과거
 * - will, going to, 'll → 미래
 * - 그 외 → 현재
 */
function detectEnglishTense(words: string[]): Tense {
  const lowerWords = words.map((w) => w.toLowerCase());
  const text = lowerWords.join(' ');

  // Perfect Tense 감지: have/has/had + 과거분사
  for (let i = 0; i < lowerWords.length - 1; i++) {
    const word = lowerWords[i];
    const nextWord = lowerWords[i + 1];

    // have/has + pp → 현재완료
    if ((word === 'have' || word === 'has') && nextWord) {
      // 과거분사 확인: 불규칙 과거분사 또는 -ed/-en으로 끝남
      if (IRREGULAR_PAST_PARTICIPLES.has(nextWord) || /ed$|en$/.test(nextWord)) {
        return 'present-perfect';
      }
    }

    // had + pp → 과거완료
    if (word === 'had' && nextWord) {
      if (IRREGULAR_PAST_PARTICIPLES.has(nextWord) || /ed$|en$/.test(nextWord)) {
        return 'past-perfect';
      }
    }
  }

  // 불규칙 과거형 동사 체크 (have/has/had 제외 - Perfect에서 이미 처리)
  for (const word of lowerWords) {
    if (word !== 'had' && IRREGULAR_PAST_VERBS.has(word)) return 'past';
  }

  // 규칙 동사 과거형 (-ed) - Perfect가 아닌 경우만
  // 주의: have/has/had 뒤에 오지 않는 -ed만 과거로 처리
  if (/\b\w+ed\b/.test(text) && !/\b(have|has|had)\s+\w+ed\b/.test(text)) {
    return 'past';
  }

  // 미래형
  if (/\b(will|going to|'ll)\b/.test(text)) return 'future';

  // 과거 부정형: didn't + 동사원형 → past
  if (/\bdidn't\b/i.test(text) || /\bdid\s+not\b/i.test(text)) {
    return 'past';
  }

  // won't → 미래 부정이므로 future로 처리
  if (/\bwon't\b/i.test(text)) {
    return 'future';
  }

  return 'present';
}

// ============================================
// g9: 영어 관계절 감지
// ============================================

interface EnglishRelativeClauseMatch {
  /** 관계절 유형 */
  type: 'who' | 'whom' | 'which' | 'that' | 'where' | 'when';
  /** 선행사 (head noun) */
  antecedent: string;
  /** 관계절 내용 */
  clauseContent: string;
  /** 관계절 주어 */
  clauseSubject?: string;
  /** 관계절 동사 */
  clauseVerb?: string;
  /** 관계절 목적어 (who 타입에서 사용) */
  clauseObject?: string;
  /** 시제 */
  tense?: 'past' | 'present';
}

/**
 * 영어 관계절 감지
 *
 * 패턴:
 * - the book that I bought → 내가 산 책
 * - the person who helped me → 나를 도운 사람
 * - the home where he lives → 그가 사는 집
 * - the day when we met → 우리가 만난 날
 */
function detectEnglishRelativeClause(text: string): EnglishRelativeClauseMatch | null {
  const cleaned = text.replace(/[.!?]+$/, '').trim();

  // Pattern: the N (that|who|whom|which|where|when) S V
  // "the book that I bought", "the person who helped me"
  const relativeMatch = cleaned.match(/^the\s+(\w+)\s+(that|who|whom|which|where|when)\s+(.+)$/i);

  if (relativeMatch) {
    const antecedent = relativeMatch[1].trim();
    const relPronoun = relativeMatch[2].toLowerCase();
    const clauseContent = relativeMatch[3].trim();

    // 관계대명사 유형 결정
    let type: EnglishRelativeClauseMatch['type'] = 'that';
    if (relPronoun === 'who') type = 'who';
    else if (relPronoun === 'whom') type = 'whom';
    else if (relPronoun === 'which') type = 'which';
    else if (relPronoun === 'where') type = 'where';
    else if (relPronoun === 'when') type = 'when';

    // 시제 감지 (문자열을 단어 배열로 변환)
    const clauseWords = clauseContent.split(/\s+/).filter(Boolean);
    const tense = detectEnglishTense(clauseWords);

    // 관계절 내용 파싱
    // who 타입 (선행사가 주어): "helped me" (V + O) - 선행사가 관계절 주어
    // that 타입 (선행사가 목적어): "I bought" (S + V) - 관계절 주어 + 동사
    // where/when 타입: "he lives" (S + V) - 관계절 주어 + 동사

    if (type === 'who') {
      // who: 선행사(person)가 주어, 관계절 내용 = 동사 + 목적어
      // "helped me" → verb="helped", object="me"
      const whoParts = clauseContent.match(/^(\S+)\s+(.+)$/);
      if (whoParts) {
        return {
          type,
          antecedent,
          clauseContent,
          clauseSubject: undefined, // 선행사가 주어 역할
          clauseVerb: whoParts[1].trim(), // "helped"
          clauseObject: whoParts[2].trim(), // "me"
          tense: tense === 'past' ? 'past' : 'present',
        };
      }
    } else {
      // that/where/when: 관계절 주어 + 동사
      const clauseParts = clauseContent.match(/^(\S+)\s+(.+)$/);
      if (clauseParts) {
        const subject = clauseParts[1].trim();
        const verb = clauseParts[2].trim();

        return {
          type,
          antecedent,
          clauseContent,
          clauseSubject: subject,
          clauseVerb: verb,
          tense: tense === 'past' ? 'past' : 'present',
        };
      }
    }

    return {
      type,
      antecedent,
      clauseContent,
      tense: tense === 'past' ? 'past' : 'present',
    };
  }

  return null;
}

// ============================================
// g8: 영어 명사절 감지
// ============================================

interface EnglishNounClauseMatch {
  type: 'that-subject' | 'that-object' | 'whether' | 'wh-clause' | 'quote';
  nounClauseContent: string;
  mainPredicate: string;
  subject?: string;
  verb?: string;
  whWord?: string;
}

/**
 * 영어 명사절 감지
 *
 * g8-6: That she is honest is clear → 그녀가 정직하다는 것은 분명하다
 * g8-7: I believe that he is right → 그가 옳다고 믿는다
 * g8-8: I wonder whether it is true → 그것이 사실인지 궁금하다
 * g8-9: I know what you mean → 네가 무슨 말을 하는지 안다
 * g8-10: She said that she was busy → 그녀는 바쁘다고 말했다
 */
function detectEnglishNounClause(text: string): EnglishNounClauseMatch | null {
  const cleaned = text.replace(/[.!?]+$/, '').trim();
  const _lowerCleaned = cleaned.toLowerCase();

  // Pattern 1: That ... is/was ADJ (That-절이 주어)
  // "That she is honest is clear" → 그녀가 정직하다는 것은 분명하다
  const thatSubjectMatch = cleaned.match(/^That\s+(.+?)\s+is\s+(\w+)$/i);
  if (thatSubjectMatch) {
    const content = thatSubjectMatch[1].trim();
    const predicate = thatSubjectMatch[2].trim();
    // 내용에서 주어/동사 추출
    const contentParts = content.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)$/i);
    if (contentParts) {
      return {
        type: 'that-subject',
        nounClauseContent: content,
        mainPredicate: predicate,
        subject: contentParts[1].trim(),
        verb: contentParts[2].trim(),
      };
    }
    return {
      type: 'that-subject',
      nounClauseContent: content,
      mainPredicate: predicate,
    };
  }

  // Pattern 5: S said that S V (인용절)
  // "She said that she was busy" → 그녀는 바쁘다고 말했다
  const quoteMatch = cleaned.match(/^(.+?)\s+said\s+that\s+(.+)$/i);
  if (quoteMatch) {
    const quoter = quoteMatch[1].trim();
    const content = quoteMatch[2].trim();
    // 내용에서 주어/동사 추출
    const contentParts = content.match(/^(.+?)\s+(?:was|were|is|are)\s+(.+)$/i);
    if (contentParts) {
      return {
        type: 'quote',
        nounClauseContent: content,
        mainPredicate: 'said',
        subject: quoter,
        verb: contentParts[2].trim(),
      };
    }
    return {
      type: 'quote',
      nounClauseContent: content,
      mainPredicate: 'said',
      subject: quoter,
    };
  }

  // Pattern 2: S V that S V (That-절이 목적어)
  // "I believe that he is right" → 그가 옳다고 믿는다
  const thatObjectMatch = cleaned.match(
    /^(.+?)\s+(believe|think|know|hope|say|feel|realize|expect|suppose|guess|imagine|understand|remember|forget|notice|discover|learn|hear|see|find|mean|prove|show|suggest|admit|deny|claim|doubt|fear|trust)\s+that\s+(.+)$/i,
  );
  if (thatObjectMatch) {
    const _mainSubject = thatObjectMatch[1].trim();
    const mainVerb = thatObjectMatch[2].trim();
    const content = thatObjectMatch[3].trim();
    // 내용에서 주어/동사 추출
    const contentParts = content.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)$/i);
    if (contentParts) {
      return {
        type: 'that-object',
        nounClauseContent: content,
        mainPredicate: mainVerb,
        subject: contentParts[1].trim(),
        verb: contentParts[2].trim(),
      };
    }
    return {
      type: 'that-object',
      nounClauseContent: content,
      mainPredicate: mainVerb,
    };
  }

  // Pattern 3: S V whether/if S V (의문 명사절)
  // "I wonder whether it is true" → 그것이 사실인지 궁금하다
  const whetherMatch = cleaned.match(
    /^(.+?)\s+(wonder|ask|know|doubt|question)\s+(whether|if)\s+(.+)$/i,
  );
  if (whetherMatch) {
    const _mainSubject = whetherMatch[1].trim();
    const mainVerb = whetherMatch[2].trim();
    const content = whetherMatch[4].trim();
    // 내용에서 주어/동사 추출
    const contentParts = content.match(/^(.+?)\s+(?:is|are|was|were)\s+(.+)$/i);
    if (contentParts) {
      return {
        type: 'whether',
        nounClauseContent: content,
        mainPredicate: mainVerb,
        subject: contentParts[1].trim(),
        verb: contentParts[2].trim(),
      };
    }
    return {
      type: 'whether',
      nounClauseContent: content,
      mainPredicate: mainVerb,
    };
  }

  // Pattern 4: S V wh-word S V (Wh-절)
  // "I know what you mean" → 네가 무슨 말을 하는지 안다
  const whClauseMatch = cleaned.match(
    /^(.+?)\s+(know|understand|wonder|ask|see|tell|remember|forget|learn|discover|decide|explain)\s+(what|where|when|why|how|who|which)\s+(.+)$/i,
  );
  if (whClauseMatch) {
    const _mainSubject = whClauseMatch[1].trim();
    const mainVerb = whClauseMatch[2].trim();
    const whWord = whClauseMatch[3].trim();
    const content = whClauseMatch[4].trim();
    // 내용에서 주어/동사 추출
    const contentParts = content.match(/^(.+?)\s+(\w+)$/);
    if (contentParts) {
      return {
        type: 'wh-clause',
        nounClauseContent: content,
        mainPredicate: mainVerb,
        subject: contentParts[1].trim(),
        verb: contentParts[2].trim(),
        whWord: whWord,
      };
    }
    return {
      type: 'wh-clause',
      nounClauseContent: content,
      mainPredicate: mainVerb,
      whWord: whWord,
    };
  }

  return null;
}

// ============================================
// g23: 추측 표현 감지 (Conjecture Detection)
// ============================================

interface KoreanConjectureMatch {
  type:
    | 'geot-gatda'
    | 'ga-boda'
    | 'moyang'
    | 'deut'
    | 'na-sipda'
    | 'certain'
    | 'jido-moreunda'
    | 'hearsay';
  stem: string;
  tense: 'past' | 'present' | 'future';
}

/**
 * 마지막 글자가 ㄹ 받침인지 확인
 */
function hasRieulFinal(char: string): boolean {
  return getFinalConsonant(char) === 'ㄹ';
}

/**
 * 마지막 글자가 ㄴ 받침인지 확인
 */
function hasNieunFinal(char: string): boolean {
  return getFinalConsonant(char) === 'ㄴ';
}

/**
 * 한국어 추측 표현 감지
 * - 갈 것 같다 (-ㄹ 것 같다)
 * - 아픈가 보다 (-가 보다)
 * - 바쁜 모양이다 (-ㄴ 모양이다)
 * - 올 듯하다 (-ㄹ 듯하다)
 * - 맞나 싶다 (-나 싶다)
 * - 틀림없이 그렇다 (certainty marker)
 * - 왔을지도 모른다 (-ㄹ지도 모른다)
 * - 갔다고 하다 (-다고 하다 - hearsay)
 */
export function detectKoreanConjecture(text: string): KoreanConjectureMatch | null {
  const cleaned = text.trim();

  // Pattern 1: -ㄹ 것 같다 (probably will)
  // 갈 것 같다 → stem="가", tense=future
  // "갈 것 같다" where 갈 has ㄹ 받침
  const geotGatda = cleaned.match(/^(.+?)\s*것\s*같다$/);
  if (geotGatda) {
    let stemPart = geotGatda[1].trim();
    const lastChar = stemPart[stemPart.length - 1];
    // ㄹ 받침 확인 (갈, 올, 먹을 등)
    if (hasRieulFinal(lastChar)) {
      stemPart = removeFinalConsonant(stemPart);
      return { type: 'geot-gatda', stem: stemPart, tense: 'future' };
    }
    // 을/를 접미사 확인
    if (stemPart.endsWith('을') || stemPart.endsWith('를')) {
      stemPart = stemPart.slice(0, -1);
      return { type: 'geot-gatda', stem: stemPart, tense: 'future' };
    }
  }

  // Pattern 2: -가 보다 (seems to be)
  // 아픈가 보다 → stem="아프", descriptive adjective
  // "아픈가 보다" where 아픈 has ㄴ 받침
  const gaBoda = cleaned.match(/^(.+?)가\s*보다$/);
  if (gaBoda) {
    let stemPart = gaBoda[1].trim();
    const lastChar = stemPart[stemPart.length - 1];
    // -ㄴ 받침 제거 (아픈 → 아프)
    if (hasNieunFinal(lastChar)) {
      stemPart = removeFinalConsonant(stemPart);
    }
    return { type: 'ga-boda', stem: stemPart, tense: 'present' };
  }

  // Pattern 3: -ㄴ 모양이다 (appears to be)
  // 바쁜 모양이다 → stem="바쁘"
  // "바쁜 모양이다" where 바쁜 has ㄴ 받침
  const moyang = cleaned.match(/^(.+?)\s*모양이다$/);
  if (moyang) {
    let stemPart = moyang[1].trim();
    const lastChar = stemPart[stemPart.length - 1];
    // -ㄴ 받침 제거 (바쁜 → 바쁘)
    if (hasNieunFinal(lastChar)) {
      stemPart = removeFinalConsonant(stemPart);
    }
    return { type: 'moyang', stem: stemPart, tense: 'present' };
  }

  // Pattern 4: -ㄹ 듯하다 (seems like)
  // 올 듯하다 → stem="오"
  // "올 듯하다" where 올 has ㄹ 받침
  const deut = cleaned.match(/^(.+?)\s*듯하다$/);
  if (deut) {
    let stemPart = deut[1].trim();
    const lastChar = stemPart[stemPart.length - 1];
    // ㄹ 받침 확인
    if (hasRieulFinal(lastChar)) {
      stemPart = removeFinalConsonant(stemPart);
      return { type: 'deut', stem: stemPart, tense: 'future' };
    }
    // 을/를 접미사 확인
    if (stemPart.endsWith('을') || stemPart.endsWith('를')) {
      stemPart = stemPart.slice(0, -1);
      return { type: 'deut', stem: stemPart, tense: 'future' };
    }
  }

  // Pattern 5: -나 싶다 (I guess)
  // 맞나 싶다 → stem="맞"
  const naSipda = cleaned.match(/^(.+?)나\s*싶다$/);
  if (naSipda) {
    return { type: 'na-sipda', stem: naSipda[1], tense: 'present' };
  }

  // Pattern 6: 틀림없이 (must be - certainty)
  // 틀림없이 그렇다 → stem="그렇"
  if (cleaned.startsWith('틀림없이')) {
    const rest = cleaned.replace('틀림없이', '').trim();
    let stem = rest;
    if (rest.endsWith('다')) {
      stem = rest.slice(0, -1);
    }
    return { type: 'certain', stem, tense: 'present' };
  }

  // Pattern 7: -ㄹ지도 모른다 (might)
  // 왔을지도 모른다 → stem="오", tense=past (왔 = 오 + 았)
  // "왔을지도 모른다" where 왔+을 = past + adnominal
  const jidoMoreunda = cleaned.match(/^(.+?)(?:을지도|ㄹ지도)\s*모른다$/);
  if (jidoMoreunda) {
    let stemPart = jidoMoreunda[1].trim();

    let tense: 'past' | 'present' | 'future' = 'future';
    // 왔 → 오, 갔 → 가 (과거 축약형 분리)
    const pastContractions: Record<string, string> = {
      왔: '오',
      갔: '가',
      샀: '사',
      잤: '자',
      났: '나',
      했: '하',
    };
    const lastStemChar = stemPart[stemPart.length - 1];
    if (pastContractions[lastStemChar]) {
      stemPart = pastContractions[lastStemChar];
      tense = 'past';
    } else if (stemPart.endsWith('았') || stemPart.endsWith('었')) {
      stemPart = stemPart.slice(0, -1);
      tense = 'past';
    }
    return { type: 'jido-moreunda', stem: stemPart, tense };
  }

  // Pattern 8: -다고 하다 (hearsay - I heard that)
  // 갔다고 하다 → stem="가", tense=past
  const hearsay = cleaned.match(/^(.+?)(?:다고|라고)\s*하다$/);
  if (hearsay) {
    let stemPart = hearsay[1];
    let tense: 'past' | 'present' | 'future' = 'present';
    // 갔 → 가 (과거 축약형)
    const pastContractions: Record<string, string> = {
      왔: '오',
      갔: '가',
      샀: '사',
      잤: '자',
      났: '나',
      했: '하',
    };
    const lastChar = stemPart[stemPart.length - 1];
    if (pastContractions[lastChar]) {
      stemPart = stemPart.slice(0, -1) + pastContractions[lastChar];
      tense = 'past';
    } else if (stemPart.endsWith('았') || stemPart.endsWith('었')) {
      stemPart = stemPart.slice(0, -1);
      tense = 'past';
    }
    return { type: 'hearsay', stem: stemPart, tense };
  }

  return null;
}

interface EnglishConjectureMatch {
  type: 'probably' | 'seems' | 'appears' | 'must-be' | 'might' | 'might-have';
  adjective?: string;
  verb?: string;
  tense: 'past' | 'present' | 'future';
}

/**
 * 영어 추측 표현 감지
 * - probably true → 아마 맞을 것 같다
 * - seems tired → 피곤한가 보다
 * - appears happy → 행복한 모양이다
 * - must be correct → 틀림없이 맞다
 * - might have left → 떠났을지도 모른다
 */
export function detectEnglishConjecture(text: string): EnglishConjectureMatch | null {
  const cleaned = text.trim().toLowerCase();

  // Pattern 1: probably + adjective
  // probably true → adjective="true"
  const probably = cleaned.match(/^probably\s+(\w+)$/);
  if (probably) {
    return { type: 'probably', adjective: probably[1], tense: 'present' };
  }

  // Pattern 2: seems + adjective
  // seems tired → adjective="tired"
  const seems = cleaned.match(/^seems?\s+(\w+)$/);
  if (seems) {
    return { type: 'seems', adjective: seems[1], tense: 'present' };
  }

  // Pattern 3: appears + adjective
  // appears happy → adjective="happy"
  const appears = cleaned.match(/^appears?\s+(\w+)$/);
  if (appears) {
    return { type: 'appears', adjective: appears[1], tense: 'present' };
  }

  // Pattern 4: must be + adjective
  // must be correct → adjective="correct"
  const mustBe = cleaned.match(/^must\s+be\s+(\w+)$/);
  if (mustBe) {
    return { type: 'must-be', adjective: mustBe[1], tense: 'present' };
  }

  // Pattern 5: might have + past participle
  // might have left → verb="left"
  const mightHave = cleaned.match(/^might\s+have\s+(\w+)$/);
  if (mightHave) {
    return { type: 'might-have', verb: mightHave[1], tense: 'past' };
  }

  // Pattern 6: might + verb
  // might go → verb="go"
  const might = cleaned.match(/^might\s+(\w+)$/);
  if (might && might[1] !== 'have') {
    return { type: 'might', verb: might[1], tense: 'future' };
  }

  return null;
}

// ============================================
// g24: 인용 표현 감지 (Quotation Detection)
// ============================================

interface KoreanQuotationMatch {
  type: 'dago' | 'nyago' | 'rago' | 'jago' | 'ndae' | 'nyae' | 'rae';
  stem: string;
  quotationVerb: string;
  tense: 'past' | 'present';
}

/**
 * 한국어 인용 표현 감지
 * - 간다고 했다 (-다고 하다)
 * - 가냐고 물었다 (-냐고 물다)
 * - 가라고 했다 (-라고 하다)
 * - 가자고 했다 (-자고 하다)
 * - 간대 (-ㄴ대)
 * - 가냬 (-냬)
 * - 가래 (-래)
 */
export function detectKoreanQuotation(text: string): KoreanQuotationMatch | null {
  const cleaned = text.trim();

  // Pattern 1: -다고 했다/한다 (평서문 인용) - "하다" 제외! (hearsay는 g23에서 처리)
  // 간다고 했다 → stem="가", type=dago
  // 갔다고 하다 → hearsay, g23에서 처리 (여기서 제외)
  const dago = cleaned.match(/^(.+?)(?:ㄴ다고|는다고|다고)\s*(했다|한다)$/);
  if (dago) {
    let stemPart = dago[1];
    // "간다고" → 간 → 가
    if (hasNieunFinal(stemPart[stemPart.length - 1])) {
      stemPart = removeFinalConsonant(stemPart);
    }
    const quotationVerb = dago[2];
    const tense: 'past' | 'present' = quotationVerb === '했다' ? 'past' : 'present';
    return { type: 'dago', stem: stemPart, quotationVerb, tense };
  }

  // Pattern 2: -냐고 물다/물었다 (의문문 인용)
  // 가냐고 물었다 → stem="가", type=nyago
  const nyago = cleaned.match(/^(.+?)냐고\s*(물었다|물다|묻다|묻는다)$/);
  if (nyago) {
    const stemPart = nyago[1];
    const quotationVerb = nyago[2];
    const tense: 'past' | 'present' = quotationVerb === '물었다' ? 'past' : 'present';
    return { type: 'nyago', stem: stemPart, quotationVerb, tense };
  }

  // Pattern 3: -라고 하다/했다 (명령문 인용)
  // 가라고 했다 → stem="가", type=rago
  const rago = cleaned.match(/^(.+?)라고\s*(했다|하다|한다)$/);
  if (rago) {
    const stemPart = rago[1];
    const quotationVerb = rago[2];
    const tense: 'past' | 'present' = quotationVerb === '했다' ? 'past' : 'present';
    return { type: 'rago', stem: stemPart, quotationVerb, tense };
  }

  // Pattern 4: -자고 하다/했다 (청유문 인용)
  // 가자고 했다 → stem="가", type=jago
  const jago = cleaned.match(/^(.+?)자고\s*(했다|하다|한다)$/);
  if (jago) {
    const stemPart = jago[1];
    const quotationVerb = jago[2];
    const tense: 'past' | 'present' = quotationVerb === '했다' ? 'past' : 'present';
    return { type: 'jago', stem: stemPart, quotationVerb, tense };
  }

  // Pattern 5: -ㄴ대/-는대 (축약형 평서문)
  // 간대 → stem="가", type=ndae
  // "간대" = "간" + "대" (ㄴ 받침이 간에 있음)
  // Check if second-to-last char has ㄴ 받침 and ends with 대
  if (cleaned.endsWith('대') && cleaned.length >= 2) {
    const beforeDae = cleaned.slice(0, -1); // "간"
    const lastChar = beforeDae[beforeDae.length - 1];
    if (hasNieunFinal(lastChar)) {
      const stemPart = removeFinalConsonant(beforeDae);
      return { type: 'ndae', stem: stemPart, quotationVerb: '해', tense: 'present' };
    }
    // Also check for "는대" pattern
    if (cleaned.endsWith('는대')) {
      const stemPart = cleaned.slice(0, -2);
      return { type: 'ndae', stem: stemPart, quotationVerb: '해', tense: 'present' };
    }
  }

  // Pattern 6: -냬 (축약형 의문문)
  // 가냬 → stem="가", type=nyae
  const nyae = cleaned.match(/^(.+?)냬$/);
  if (nyae) {
    return { type: 'nyae', stem: nyae[1], quotationVerb: '해', tense: 'present' };
  }

  // Pattern 7: -래 (축약형 명령문) - 단, -ㄹ래 (want 패턴) 제외
  // 가래 → stem="가", type=rae (quotation: "he/she says to go")
  // 갈래 → 가+ㄹ래 (contracted want: "Want to go?") - 제외해야 함
  // 구분: 마지막 글자가 ㄹ 받침이면 want 패턴이므로 제외
  const rae = cleaned.match(/^(.+?)래$/);
  if (rae) {
    const stemPart = rae[1];
    const lastChar = stemPart[stemPart.length - 1];
    // ㄹ 받침이면 -ㄹ래 want 패턴이므로 quotation 아님
    if (getBatchim(lastChar) !== 'ㄹ') {
      return { type: 'rae', stem: stemPart, quotationVerb: '해', tense: 'present' };
    }
    // ㄹ 받침이면 null 반환하여 다른 패턴에서 처리하도록
  }

  return null;
}

interface EnglishQuotationMatch {
  type: 'said-that' | 'asked-if' | 'told-to' | 'suggested' | 'heard-that';
  quotedVerb: string;
  subject?: string;
  object?: string;
  tense: 'past' | 'present';
}

/**
 * 영어 인용 표현 감지
 * - He said he would come → 온다고 했다
 * - She asked if I was busy → 바쁘냐고 물었다
 * - He told me to study → 공부하라고 했다
 * - She suggested eating → 먹자고 했다
 * - I heard that he left → 떠났다고 들었다
 */
export function detectEnglishQuotation(text: string): EnglishQuotationMatch | null {
  const cleaned = text.trim().toLowerCase();

  // Pattern 1: (S) said (S) would V / (S) said that
  // "He said he would come" → quotedVerb="come", quotedTense="present" (quoted content is future/present)
  const saidWould = cleaned.match(/^(\w+)\s+said\s+(?:\w+\s+)?(?:would|will)\s+(\w+)$/i);
  if (saidWould) {
    return { type: 'said-that', quotedVerb: saidWould[2], subject: saidWould[1], tense: 'present' };
  }

  // Pattern 2: (S) asked if (S) was/were ADJ
  // "She asked if I was busy" → quotedVerb="busy"
  const askedIf = cleaned.match(
    /^(\w+)\s+asked\s+if\s+(?:\w+\s+)?(?:was|were|am|is|are)\s+(\w+)$/i,
  );
  if (askedIf) {
    return { type: 'asked-if', quotedVerb: askedIf[2], subject: askedIf[1], tense: 'past' };
  }

  // Pattern 3: (S) told (O) to V
  // "He told me to study" → quotedVerb="study"
  const toldTo = cleaned.match(/^(\w+)\s+told\s+(\w+)\s+to\s+(\w+)$/i);
  if (toldTo) {
    return {
      type: 'told-to',
      quotedVerb: toldTo[3],
      subject: toldTo[1],
      object: toldTo[2],
      tense: 'past',
    };
  }

  // Pattern 4: (S) suggested V-ing
  // "She suggested eating" → quotedVerb="eating"
  const suggested = cleaned.match(/^(\w+)\s+suggested\s+(\w+ing)$/i);
  if (suggested) {
    // eating → eat
    let verb = suggested[2];
    if (verb.endsWith('ing')) {
      verb = verb.slice(0, -3);
      // double consonant handling: running → run
      if (/([a-z])\1$/.test(verb)) {
        verb = verb.slice(0, -1);
      }
    }
    return { type: 'suggested', quotedVerb: verb, subject: suggested[1], tense: 'past' };
  }

  // Pattern 5: (S) heard that (S) V-ed
  // "I heard that he left" → quotedVerb="left"
  const heardThat = cleaned.match(/^(\w+)\s+heard\s+that\s+(?:\w+\s+)?(\w+)$/i);
  if (heardThat) {
    return { type: 'heard-that', quotedVerb: heardThat[2], subject: heardThat[1], tense: 'past' };
  }

  return null;
}

// ============================================
// g15 종결어미 감지 함수
// ============================================

export interface FinalEndingMatch {
  type: import('./types.ts').FinalEndingType;
  stem: string; // 동사 어간
  verb?: string; // 영어 동사 (번역됨)
}

/**
 * 한국어 종결어미 감지
 *
 * @param text - 원본 텍스트
 * @returns 종결어미 정보 또는 null
 */
export function detectKoreanFinalEnding(text: string): FinalEndingMatch | null {
  const cleaned = text.replace(/[.!?？！。]+$/, '').trim();

  // 1. -ㅂ니까? (격식 의문) - 갑니까?
  const formalQuestionMatch = cleaned.match(/^(.+)([ㅂ습])니까$/);
  if (formalQuestionMatch) {
    let stem = formalQuestionMatch[1];
    // ㅂ니까 앞의 받침 처리 (습니까 → 받침 있음, ㅂ니까 → 받침 없음)
    if (formalQuestionMatch[2] === '습') {
      // 받침 있는 동사: 먹습니까 → 먹
      stem = formalQuestionMatch[1];
    } else {
      // 받침 없는 동사: 갑니까 → 가
      stem = formalQuestionMatch[1];
    }
    return { type: 'formal-question', stem };
  }

  // 2. -세요 (존경 명령) - 가세요
  const pleaseMatch = cleaned.match(/^(.+)세요$/);
  if (pleaseMatch) {
    const stem = pleaseMatch[1];
    return { type: 'please-honorific', stem };
  }

  // 3. -라 (명령) - 가라, 먹어라
  // 가라 → 가 + 라, 먹어라 → 먹 + 어라
  const commandMatch = cleaned.match(/^(.+)(어라|아라|라)$/);
  if (commandMatch) {
    let stem = commandMatch[1];
    // 어라/아라 → 어/아 제거하고 어간 추출
    if (commandMatch[2] !== '라') {
      stem = commandMatch[1];
    }
    return { type: 'command', stem };
  }

  // 4. -구나 (감탄) - 가는구나, 예쁘구나
  const exclamationMatch = cleaned.match(/^(.+)(는구나|구나)$/);
  if (exclamationMatch) {
    let stem = exclamationMatch[1];
    // 가는구나 → 가 + 는구나
    if (exclamationMatch[2] === '는구나') {
      stem = exclamationMatch[1];
    }
    return { type: 'exclamation', stem };
  }

  // 5. -지 (부가의문) - 가지, 먹지
  // 주의: 다른 패턴과 충돌 방지 (가지 않다 등)
  if (cleaned.match(/^(.+)지$/) && !cleaned.match(/지\s*(않|못)/)) {
    const match = cleaned.match(/^(.+)지$/);
    if (match) {
      return { type: 'tag-question', stem: match[1] };
    }
  }

  // 6. -잖아 (상대 인식) - 가잖아
  const youKnowMatch = cleaned.match(/^(.+)잖아$/);
  if (youKnowMatch) {
    return { type: 'you-know', stem: youKnowMatch[1] };
  }

  // 7. -ㄹ래? (의향 질문) - 갈래?, 먹을래?
  const wantMatch = cleaned.match(/^(.+)[ㄹ을]래$/);
  if (wantMatch) {
    return { type: 'want', stem: wantMatch[1] };
  }

  // 8. -ㄹ까? (제안) - 갈까?, 먹을까?
  const shallMatch = cleaned.match(/^(.+)[ㄹ을]까$/);
  if (shallMatch) {
    return { type: 'shall', stem: shallMatch[1] };
  }

  // 9. -더라 (회상) - 가더라
  const retrospectiveMatch = cleaned.match(/^(.+)더라$/);
  if (retrospectiveMatch) {
    return { type: 'retrospective', stem: retrospectiveMatch[1] };
  }

  return null;
}

/**
 * 영어 종결어미/문법 구조 감지 (En→Ko)
 *
 * @param text - 원본 텍스트
 * @returns 영어 문법 정보 또는 null
 */
export interface EnglishFinalPatternMatch {
  type:
    | 'formal-statement' // I V (formal)
    | 'polite-statement' // I V (polite)
    | 'casual-statement' // I V (casual)
    | 'formal-question' // Do you V? (formal)
    | 'please-command' // Please V
    | 'command' // V! (command)
    | 'lets' // Let's V
    | 'want-question' // Want to V?
    | 'shall-question'; // Shall we V?
  verb: string; // 동사 원형
  verbKorean?: string; // 한국어 동사 어간
}

export function detectEnglishFinalPattern(text: string): EnglishFinalPatternMatch | null {
  // 끝 구두점 제거
  const cleaned = text.replace(/[.!?]+$/, '').trim();

  // 1. I V (formal) → 먹습니다
  const formalStatementMatch = cleaned.match(/^I\s+(\w+)\s*\(formal\)$/i);
  if (formalStatementMatch) {
    return { type: 'formal-statement', verb: formalStatementMatch[1] };
  }

  // 2. I V (polite) → 먹어요
  const politeStatementMatch = cleaned.match(/^I\s+(\w+)\s*\(polite\)$/i);
  if (politeStatementMatch) {
    return { type: 'polite-statement', verb: politeStatementMatch[1] };
  }

  // 3. I V (casual) → 먹어
  const casualStatementMatch = cleaned.match(/^I\s+(\w+)\s*\(casual\)$/i);
  if (casualStatementMatch) {
    return { type: 'casual-statement', verb: casualStatementMatch[1] };
  }

  // 4. Do you V? (formal) → 드십니까?
  // [.!?]* 추가: "Do you eat? (formal)" 처리
  const formalQuestionMatch = cleaned.match(/^Do\s+you\s+(\w+)[.!?]*\s*\(formal\)$/i);
  if (formalQuestionMatch) {
    return { type: 'formal-question', verb: formalQuestionMatch[1] };
  }

  // 5. Please V → 드세요
  const pleaseMatch = cleaned.match(/^Please\s+(\w+)$/i);
  if (pleaseMatch) {
    return { type: 'please-command', verb: pleaseMatch[1] };
  }

  // 6. V! (command) → 먹어라
  // [.!?]* 추가: "Eat! (command)" 처리
  const commandMatch = cleaned.match(/^(\w+)[.!?]*\s*\(command\)$/i);
  if (commandMatch) {
    return { type: 'command', verb: commandMatch[1] };
  }

  // 7. Let's V → 먹자
  const letsMatch = cleaned.match(/^Let's\s+(\w+)$/i);
  if (letsMatch) {
    return { type: 'lets', verb: letsMatch[1] };
  }

  // 8. Want to V? → 먹을래?
  const wantMatch = cleaned.match(/^Want\s+to\s+(\w+)[.!?]*$/i);
  if (wantMatch) {
    return { type: 'want-question', verb: wantMatch[1] };
  }

  // 9. Shall we V? → 먹을까?
  const shallMatch = cleaned.match(/^Shall\s+we\s+(\w+)[.!?]*$/i);
  if (shallMatch) {
    return { type: 'shall-question', verb: shallMatch[1] };
  }

  return null;
}
