// ========================================
// English to Korean Constants - 영→한 번역 상수
// ========================================

import type { EnglishMorpheme } from '../analysis/morpheme/english-morpheme';

// =====================================
// 타입 정의
// =====================================

export interface EnToKoResult {
  original: string; // 원본
  morpheme: EnglishMorpheme; // 형태소 분해
  koreanPrefix: string; // 한국어 접두사
  koreanStem: string; // 한국어 어간
  koreanSuffix: string; // 한국어 접미사
  translated: string; // 최종 번역
}

// =====================================
// 연결어미 패턴 (성능 최적화 - 모듈 레벨)
// =====================================

/** 종결어미→연결어미 변환 패턴 (7개 RegExp) */
export const CONNECTIVE_ENDING_PATTERNS: ReadonlyArray<{ from: RegExp; to: string }> = [
  // 구체적인 동사 패턴 (우선)
  { from: /봤$/, to: '보고' },
  { from: /샀$/, to: '사고' },
  { from: /먹었$/, to: '먹었고' },
  { from: /방문했$/, to: '방문했고' },
  // 일반 동사 패턴
  { from: /했다$/, to: '했고' },
  { from: /았다$/, to: '았고' },
  { from: /었다$/, to: '었고' },
];

// =====================================
// 이동/위치 관련 동사
// =====================================

/** 이동 동사 (to 전치사 생략) */
export const MOVEMENT_VERBS_EN = new Set([
  'go',
  'went',
  'come',
  'came',
  'walk',
  'walked',
  'run',
  'ran',
  'drive',
  'drove',
  'fly',
  'flew',
  'travel',
  'traveled',
  'return',
  'returned',
]);

/** to와 함께 사용되는 구동사 */
export const PHRASAL_VERBS_WITH_TO = new Set(['listen', 'look', 'belong', 'refer', 'relate']);

/** 위치 부사 (전치사 생략) */
export const LOCATION_ADVERBS = new Set([
  'home',
  'here',
  'there',
  'upstairs',
  'downstairs',
  'abroad',
]);

// =====================================
// 영어 접속사/전치사
// =====================================

/** 영어 접속사 → 한국어 연결어미 */
export const ENGLISH_CONJUNCTIONS: Record<string, string> = {
  and: '그리고',
  but: '하지만',
  or: '또는',
  because: '왜냐하면',
  so: '그래서',
  // biome-ignore lint/suspicious/noThenProperty: dictionary key for translation
  then: '그리고',
  if: '만약',
  when: '때',
  while: '동안',
  although: '비록',
  however: '하지만',
};

/** 영어 전치사 → 한국어 조사 */
export const ENGLISH_PREPOSITIONS: Record<string, string> = {
  at: '에서',
  in: '에',
  on: '위에',
  to: '에',
  for: '위해',
  with: '와 함께',
  from: '에서부터',
  by: '에 의해',
  about: '에 대해',
  of: '의',
  during: '동안',
  after: '후에',
  before: '전에',
  into: '안으로',
  through: '통해',
  between: '사이에',
  among: '가운데',
  under: '아래에',
  over: '위에',
  near: '근처에',
  nearby: '근처',
};

// =====================================
// 영어 관사/한정사/Be동사
// =====================================

/** 영어 관사 (번역 시 생략) */
export const ENGLISH_ARTICLES = new Set(['the', 'a', 'an']);

/** 지시형용사 (this, that - 다음 명사를 수식) */
export const ENGLISH_DEMONSTRATIVES = new Set(['this', 'that', 'these', 'those']);

/** 영어 be 동사 (번역 시 특수 처리) */
export const ENGLISH_BE_VERBS = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);

// =====================================
// 불규칙 동사 과거형
// =====================================

/** 영어 불규칙 동사 과거형 → 기본형 */
export const ENGLISH_IRREGULAR_VERBS: Record<string, { base: string; tense: 'past' }> = {
  went: { base: 'go', tense: 'past' },
  ate: { base: 'eat', tense: 'past' },
  saw: { base: 'see', tense: 'past' },
  came: { base: 'come', tense: 'past' },
  took: { base: 'take', tense: 'past' },
  made: { base: 'make', tense: 'past' },
  got: { base: 'get', tense: 'past' },
  gave: { base: 'give', tense: 'past' },
  knew: { base: 'know', tense: 'past' },
  thought: { base: 'think', tense: 'past' },
  found: { base: 'find', tense: 'past' },
  said: { base: 'say', tense: 'past' },
  told: { base: 'tell', tense: 'past' },
  felt: { base: 'feel', tense: 'past' },
  left: { base: 'leave', tense: 'past' },
  met: { base: 'meet', tense: 'past' },
  sat: { base: 'sit', tense: 'past' },
  stood: { base: 'stand', tense: 'past' },
  heard: { base: 'hear', tense: 'past' },
  ran: { base: 'run', tense: 'past' },
  wrote: { base: 'write', tense: 'past' },
  read: { base: 'read', tense: 'past' },
  spoke: { base: 'speak', tense: 'past' },
  broke: { base: 'break', tense: 'past' },
  bought: { base: 'buy', tense: 'past' },
  brought: { base: 'bring', tense: 'past' },
  taught: { base: 'teach', tense: 'past' },
  caught: { base: 'catch', tense: 'past' },
  slept: { base: 'sleep', tense: 'past' },
  won: { base: 'win', tense: 'past' },
  lost: { base: 'lose', tense: 'past' },
  sent: { base: 'send', tense: 'past' },
  spent: { base: 'spend', tense: 'past' },
  built: { base: 'build', tense: 'past' },
  held: { base: 'hold', tense: 'past' },
  sold: { base: 'sell', tense: 'past' },
  returned: { base: 'return', tense: 'past' },
  visited: { base: 'visit', tense: 'past' },
  looked: { base: 'look', tense: 'past' },
  opened: { base: 'open', tense: 'past' },
};

// =====================================
// 형용사/부사 목록
// =====================================

/** 영어 형용사 목록 (수식어 판별용) */
export const ENGLISH_ADJECTIVES = new Set([
  'new',
  'newly',
  'old',
  'young',
  'good',
  'bad',
  'beautiful',
  'ugly',
  'big',
  'small',
  'large',
  'little',
  'long',
  'short',
  'tall',
  'high',
  'low',
  'hot',
  'cold',
  'warm',
  'cool',
  'fast',
  'slow',
  'quick',
  'hard',
  'soft',
  'happy',
  'sad',
  'angry',
  'delicious',
  'tasty',
  'interesting',
  'boring',
  'important',
  'urgent',
  'famous',
  'popular',
  'expensive',
  'cheap',
  'nice',
  'great',
  'wonderful',
  'amazing',
  'terrible',
  'horrible',
  'opened',
  'closed',
  'nearby',
  'italian',
  'chinese',
  'korean',
  'japanese',
]);

/** 영어 부사 목록 */
export const ENGLISH_ADVERBS = new Set([
  'very',
  'really',
  'quite',
  'too',
  'so',
  'already',
  'still',
  'just',
  'always',
  'never',
  'often',
  'sometimes',
  'usually',
  'rarely',
  'happily',
  'sadly',
  'quickly',
  'slowly',
  'carefully',
  'easily',
  'early',
  'late',
  'soon',
  'yesterday',
  'today',
  'tomorrow',
  'well', // 잘
  'badly', // 잘못
  'hard', // 열심히
]);
