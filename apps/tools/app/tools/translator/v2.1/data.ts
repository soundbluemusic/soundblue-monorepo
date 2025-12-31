/**
 * 번역기 v2 통합 데이터
 * v1의 사전 데이터 재사용 + 핵심 규칙 정의
 */

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

/** 영→한 단어 사전 (v1 사전 + KO_EN 역변환 + 추가 매핑) */
export const EN_KO: Record<string, string> = {
  ...enToKoWords,
  ...Object.fromEntries(Object.entries(KO_EN).map(([k, v]) => [v.toLowerCase(), k])),
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

/** 종결어미: [어미, 시제, 문장유형, 공손도] */
export const ENDINGS: Array<[string, string, string, string]> = [
  // 과거
  ['았어', 'past', 'statement', 'casual'],
  ['었어', 'past', 'statement', 'casual'],
  ['였어', 'past', 'statement', 'casual'],
  ['했어', 'past', 'statement', 'casual'],
  ['았다', 'past', 'statement', 'neutral'],
  ['었다', 'past', 'statement', 'neutral'],
  ['였다', 'past', 'statement', 'neutral'],
  ['했다', 'past', 'statement', 'neutral'],
  ['았니', 'past', 'question', 'casual'],
  ['었니', 'past', 'question', 'casual'],
  ['였니', 'past', 'question', 'casual'],
  ['했니', 'past', 'question', 'casual'],
  ['았어요', 'past', 'statement', 'polite'],
  ['었어요', 'past', 'statement', 'polite'],

  // 현재
  ['아', 'present', 'statement', 'casual'],
  ['어', 'present', 'statement', 'casual'],
  ['야', 'present', 'statement', 'casual'],
  ['다', 'present', 'statement', 'neutral'],
  ['는다', 'present', 'statement', 'neutral'],
  ['ㄴ다', 'present', 'statement', 'neutral'],
  ['아요', 'present', 'statement', 'polite'],
  ['어요', 'present', 'statement', 'polite'],
  ['니', 'present', 'question', 'casual'],
  ['나', 'present', 'question', 'casual'],

  // 미래/의지
  ['ㄹ게', 'future', 'statement', 'casual'],
  ['을게', 'future', 'statement', 'casual'],
  ['ㄹ거야', 'future', 'statement', 'casual'],
  ['을거야', 'future', 'statement', 'casual'],

  // 부정
  ['지 않았어', 'past', 'negative', 'casual'],
  ['지 않았다', 'past', 'negative', 'neutral'],
  ['지 않아', 'present', 'negative', 'casual'],
  ['지 않는다', 'present', 'negative', 'neutral'],
  ['지 못했어', 'past', 'negative', 'casual'],
  ['지 못해', 'present', 'negative', 'casual'],
];

// ============================================
// 4. 불규칙 동사
// ============================================

/** 영어 불규칙 동사: [원형, 과거, 과거분사] */
export const IRREGULAR_VERBS: Array<[string, string, string]> = [
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
  // Phase 2A: 다의어 동사 추가
  ['ride', 'rode', 'ridden'],
  ['hit', 'hit', 'hit'],
  ['catch', 'caught', 'caught'],
  ['hold', 'held', 'held'],
  ['fall', 'fell', 'fallen'],
];

/** 불규칙 동사 빠른 조회용 맵 */
export const VERB_PAST = new Map(IRREGULAR_VERBS.map(([base, past]) => [base, past]));
export const VERB_BASE = new Map(
  IRREGULAR_VERBS.flatMap(([base, past]) =>
    past.includes('/') ? past.split('/').map((p) => [p, base]) : [[past, base]],
  ),
);

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
  // 기본 동사 (어간 → 영어)
  가: 'go',
  오: 'come',
  먹: 'eat',
  마시: 'drink',
  보: 'see',
  듣: 'listen',
  읽: 'read',
  쓰: 'write',
  자: 'sleep',
  만들: 'make',
  사: 'buy',
  팔: 'sell',
  주: 'give',
  하: 'do',
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
};

/**
 * 불규칙 활용 동사 (ㄷ불규칙, ㅂ불규칙 등)
 * 이들은 어간 변화가 있어 별도 처리 필요
 *
 * 주의: KO_VERB_CONTRACTIONS보다 먼저 체크되어야 함 (들었 → 듣다 vs 들다 충돌 방지)
 */
export const IRREGULAR_KO_VERBS: Record<string, { stem: string; en: string; type: string }> = {
  // ㄷ불규칙: 듣다 → 들어/들었
  들었: { stem: '듣', en: 'hear', type: 'ㄷ' },
  들어: { stem: '듣', en: 'hear', type: 'ㄷ' },
  걸었: { stem: '걷', en: 'walk', type: 'ㄷ' },
  걸어: { stem: '걷', en: 'walk', type: 'ㄷ' },
  // ㅂ불규칙: 돕다 → 도와
  도왔: { stem: '돕', en: 'help', type: 'ㅂ' },
  도와: { stem: '돕', en: 'help', type: 'ㅂ' },
  // ㅅ불규칙: 짓다 → 지어
  지었: { stem: '짓', en: 'build', type: 'ㅅ' },
  지어: { stem: '짓', en: 'build', type: 'ㅅ' },
  // 르불규칙: 모르다 → 몰라
  몰랐: { stem: '모르', en: 'not know', type: '르' },
  몰라: { stem: '모르', en: 'not know', type: '르' },
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
  '티끌 모아 태산': 'Every little bit counts',
  '눈 감아주다': 'let it slide',
  '발 뻗고 자다': 'sleep in peace',
  '야 진짜 대박': 'OMG',
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
// 7. 동사-전치사 결합 (Verb + Preposition)
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
