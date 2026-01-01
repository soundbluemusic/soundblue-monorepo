/**
 * 번역기 v2 토크나이저
 * 입력 텍스트를 토큰으로 분리하고 역할 부여
 *
 * 파이프라인 v2 개선사항:
 * - 다중 전략 토큰화 (사전, 규칙, 유사도, 불규칙)
 * - 각 토큰에 confidence 점수 부여
 * - jamoEditDistance 기반 유사도 fallback
 */

import { decompose, jamoEditDistance } from '@soundblue/hangul';
import {
  COUNTERS,
  ENDINGS,
  IRREGULAR_KO_VERBS,
  KO_EN,
  KO_NUMBERS,
  KO_VERB_MAP,
  PARTICLES,
  VERB_STEMS,
} from './data';
import type { ParsedSentence, Role, SentenceType, Tense, Token, TokenStrategy } from './types';

// ============================================
// 신뢰도 상수 정의
// ============================================

/** 사전 정확 매칭 신뢰도 */
const CONFIDENCE_DICTIONARY = 1.0;
/** 규칙 기반 추론 신뢰도 */
const CONFIDENCE_RULE = 0.85;
/** 유사도 기반 추론 신뢰도 (거리에 따라 조정) */
const CONFIDENCE_SIMILARITY_BASE = 0.7;
/** 불규칙 동사 처리 신뢰도 */
const _CONFIDENCE_IRREGULAR = 0.9;
/** 미인식 신뢰도 */
const CONFIDENCE_UNKNOWN = 0.3;

/** 유사도 검색 임계값 (이 거리 이하만 후보로 인정) */
const SIMILARITY_THRESHOLD = 1.5;

// ============================================
// 유사도 기반 단어 검색 (Strategy B)
// ============================================

interface SimilarWordResult {
  word: string;
  translation: string;
  distance: number;
  confidence: number;
}

/**
 * jamoEditDistance를 사용하여 사전에서 가장 유사한 단어 찾기
 *
 * @param unknown 미인식 단어
 * @returns 유사 단어 정보 또는 null
 */
function findSimilarWord(unknown: string): SimilarWordResult | null {
  let best: SimilarWordResult | null = null;

  // KO_EN 사전에서 유사 단어 검색
  for (const [korean, english] of Object.entries(KO_EN)) {
    // 길이 차이가 너무 크면 스킵 (최적화)
    if (Math.abs(korean.length - unknown.length) > 2) continue;

    const distance = jamoEditDistance(unknown, korean);

    if (distance <= SIMILARITY_THRESHOLD) {
      // 신뢰도 계산: 거리가 가까울수록 높음
      // distance 0 → confidence 0.7
      // distance 1.5 → confidence 0.5
      const confidence = CONFIDENCE_SIMILARITY_BASE - (distance / SIMILARITY_THRESHOLD) * 0.2;

      if (!best || distance < best.distance) {
        best = { word: korean, translation: english, distance, confidence };
      }
    }
  }

  // VERB_STEMS에서도 검색
  for (const [korean, english] of Object.entries(VERB_STEMS)) {
    if (Math.abs(korean.length - unknown.length) > 2) continue;

    const distance = jamoEditDistance(unknown, korean);

    if (distance <= SIMILARITY_THRESHOLD) {
      const confidence = CONFIDENCE_SIMILARITY_BASE - (distance / SIMILARITY_THRESHOLD) * 0.2;

      if (!best || distance < best.distance) {
        best = { word: korean, translation: english, distance, confidence };
      }
    }
  }

  return best;
}

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
  for (const [conjugated, info] of Object.entries(IRREGULAR_KO_VERBS)) {
    if (word.startsWith(conjugated)) {
      return { stem: info.stem, tense: 'past', en: info.en };
    }
  }

  // 1. 하다 계열 (했, 했어, 했다)
  if (word.includes('했')) {
    const idx = word.indexOf('했');
    const prefix = word.slice(0, idx);
    // "공부했어" → 어간 "공부하", 복합어 처리
    const stem = prefix ? `${prefix}하` : '하';
    const en = prefix ? KO_EN[prefix] || KO_EN[stem] : 'do';
    return { stem, tense: 'past', en: en || 'do' };
  }

  // 2. 았/었 패턴 찾기 (모음조화 역추적)
  const pastPatterns = [
    // 축약형: ㅏ+ㅏ→ㅏ (가+았→갔), ㅗ+ㅏ→ㅘ (오+았→왔)
    { pattern: /^(.+)았/, vowel: 'ㅏ' },
    { pattern: /^(.+)었/, vowel: 'ㅓ' },
    { pattern: /^(.+)였/, vowel: 'ㅕ' },
  ];

  for (const { pattern } of pastPatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const possibleStem = match[1];
      // 사전에서 어간 확인
      const en = KO_EN[possibleStem] || VERB_STEMS[possibleStem];
      if (en) {
        return { stem: possibleStem, tense: 'past', en };
      }
    }
  }

  // 3. 축약형 역추적 (모음 축약된 과거형)
  // ㅏ+ㅏ→ㅏ (가+았→갔), ㅗ+ㅏ→ㅘ (오+았→왔)
  // ㅜ+ㅓ→ㅝ (주+었→줬), ㅣ+ㅓ→ㅕ (마시+었→마셨)
  const contractions: Record<string, { stem: string; en: string }> = {
    갔: { stem: '가', en: 'go' },
    왔: { stem: '오', en: 'come' },
    봤: { stem: '보', en: 'see' },
    줬: { stem: '주', en: 'give' },
    샀: { stem: '사', en: 'buy' },
    잤: { stem: '자', en: 'sleep' },
    썼: { stem: '쓰', en: 'write' },
    됐: { stem: '되', en: 'become' },
    // ㅣ+ㅓ→ㅕ 축약
    마셨: { stem: '마시', en: 'drink' },
    보셨: { stem: '보시', en: 'see' }, // 높임
    드셨: { stem: '드시', en: 'eat' }, // 높임
  };

  for (const [contracted, info] of Object.entries(contractions)) {
    if (word.startsWith(contracted)) {
      return { stem: info.stem, tense: 'past', en: info.en };
    }
  }

  // 4. 현재형 패턴 (는다, ㄴ다)
  const presentPatterns = [
    /^(.+)는다$/, // 먹는다, 듣는다
    /^(.+)ㄴ다$/, // 간다, 본다 (받침 없는 어간)
  ];

  for (const pattern of presentPatterns) {
    const match = word.match(pattern);
    if (match?.[1]) {
      const possibleStem = match[1];
      const en = KO_EN[possibleStem] || VERB_STEMS[possibleStem];
      if (en) {
        return { stem: possibleStem, tense: 'present', en };
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
      // 사전에서 어간 확인
      const en = KO_EN[possibleStem] || VERB_STEMS[possibleStem];
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
      const en = KO_EN[possibleStem] || VERB_STEMS[possibleStem];
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
          const en = KO_EN[stem] || VERB_STEMS[stem];
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
      const en = KO_EN[possibleStem] || VERB_STEMS[possibleStem];
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
      const en = KO_EN[possibleStem] || VERB_STEMS[possibleStem];
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
 * 한국어 문장 파싱
 */
export function parseKorean(text: string): ParsedSentence {
  const original = text.trim();

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

  // 4. 각 단어를 토큰으로 변환
  const tokens: Token[] = [];
  let sentenceTense: Tense = 'present';
  let negated = false;

  for (const word of words) {
    const token = tokenizeKoreanWord(word);
    tokens.push(token);

    // 시제/부정 정보 수집
    if (token.meta?.tense) sentenceTense = token.meta.tense;
    if (token.meta?.negated) negated = true;
  }

  return {
    original,
    tokens,
    type,
    tense: sentenceTense,
    negated,
  };
}

/**
 * 문장 유형 감지
 */
function detectSentenceType(text: string): SentenceType {
  if (/[?？]/.test(text)) return 'question';
  if (/[!！]/.test(text)) return 'exclamation';
  // 한국어 의문형 어미
  if (/(니|나|까)\s*$/.test(text)) return 'question';
  return 'statement';
}

/**
 * 한국어 단어 토큰화
 *
 * Pipeline v2: confidence 점수 포함
 * - Strategy A: 사전 정확 매칭 (1.0)
 * - Strategy B: 유사도 기반 fallback (0.5~0.7)
 * - Strategy C: 규칙 기반 추론 (0.85)
 * - Strategy D: 불규칙 동사 (0.9)
 */
function tokenizeKoreanWord(word: string): Token {
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

  // 4. 단어가 사전에 있으면 그대로 사용 (조사 분리 불필요)
  if (KO_EN[word]) {
    const en = KO_EN[word];
    // 감탄사는 대문자로 시작
    const role: Role = /^[A-Z]/.test(en) ? 'adverb' : 'unknown';
    return {
      text: word,
      stem: word,
      role,
      translated: en,
      confidence: CONFIDENCE_DICTIONARY,
      meta: { strategy: 'dictionary' },
    };
  }

  // 5. 조사 분리 시도
  let stem = word;
  let particle: string | undefined;
  let role: Role = 'unknown';
  let strategy: TokenStrategy = 'unknown';
  let confidence: number = CONFIDENCE_UNKNOWN;

  for (const [p, r] of SORTED_PARTICLES) {
    if (word.endsWith(p) && word.length > p.length) {
      stem = word.slice(0, -p.length);
      particle = p;
      role = r === 'subject' || r === 'topic' ? 'subject' : r === 'object' ? 'object' : 'unknown';
      break;
    }
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
          // 기본 사전에서 어간 찾기
          if (KO_EN[verbPart]) {
            stem = verbPart;
            translated = KO_EN[verbPart];
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

  // 10. 사전에서 번역 찾기 (아직 없으면)
  if (!translated) {
    translated = KO_EN[stem];
    if (translated) {
      strategy = 'dictionary';
      confidence = CONFIDENCE_DICTIONARY;
    }
  }

  // 11. Strategy B: 유사도 기반 fallback (사전에서 못 찾은 경우)
  if (!translated) {
    const similar = findSimilarWord(stem);
    if (similar) {
      translated = similar.translation;
      stem = similar.word; // 가장 유사한 단어로 교체
      strategy = 'similarity';
      confidence = similar.confidence;
    }
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

  return {
    original,
    tokens,
    type,
    tense: detectEnglishTense(words),
    negated: words.some((w) => /^(not|n't|don't|doesn't|didn't|won't|can't)$/i.test(w)),
  };
}

/**
 * 영어 시제 감지
 */
function detectEnglishTense(words: string[]): Tense {
  const text = words.join(' ').toLowerCase();
  if (/\b(did|was|were|had|\w+ed)\b/.test(text)) return 'past';
  if (/\b(will|going to|'ll)\b/.test(text)) return 'future';
  return 'present';
}
