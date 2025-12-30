/**
 * 번역기 v2 통합 데이터
 * v1의 사전 데이터 재사용 + 핵심 규칙 정의
 */

// v1 사전 재사용
import { enToKoWords, koToEnWords } from '../dictionary';

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
};

/**
 * 불규칙 활용 동사 (ㄷ불규칙, ㅂ불규칙 등)
 * 이들은 어간 변화가 있어 별도 처리 필요
 */
export const IRREGULAR_KO_VERBS: Record<string, { stem: string; en: string; type: string }> = {
  // ㄷ불규칙: 듣다 → 들어
  들었: { stem: '듣', en: 'hear', type: 'ㄷ' },
  걸었: { stem: '걷', en: 'walk', type: 'ㄷ' },
  // ㅂ불규칙: 돕다 → 도와
  도왔: { stem: '돕', en: 'help', type: 'ㅂ' },
  // ㅅ불규칙: 짓다 → 지어
  지었: { stem: '짓', en: 'build', type: 'ㅅ' },
  // 르불규칙: 모르다 → 몰라
  몰랐: { stem: '모르', en: 'not know', type: '르' },
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

export const IDIOMS_EN_KO: Record<string, string> = {
  'every little bit counts': '티끌 모아 태산',
  'let it slide': '눈 감아주다',
  'sleep in peace': '발 뻗고 자다',
};
