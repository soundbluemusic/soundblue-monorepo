// ========================================
// English to Korean Engine - 영→한 자소 기반 번역
// 문장 수준 번역 지원 (토큰화, 접속사 처리, 어순 변환)
// ========================================

import { translatePrefix } from '../dictionary/prefixes';
import { translateStemEnToKo } from '../dictionary/stems';
import { translateSuffix } from '../dictionary/suffixes';
import { enToKoWords, koToEnWords } from '../dictionary/words';
import { decomposeEnglish, type EnglishMorpheme } from '../jaso/english-morpheme';

// 영어 동사의 3인칭 단수형/과거형에서 기본형 추출
function getEnglishVerbBase(verb: string): { base: string; tense: 'present' | 'past' } {
  const lowerVerb = verb.toLowerCase();

  // 불규칙 동사 체크
  const irregularPast = ENGLISH_IRREGULAR_VERBS[lowerVerb];
  if (irregularPast) {
    return { base: irregularPast.base, tense: 'past' };
  }

  // 3인칭 단수 현재 (-s, -es, -ies)
  if (lowerVerb.endsWith('ies')) {
    return { base: `${lowerVerb.slice(0, -3)}y`, tense: 'present' };
  }
  if (lowerVerb.endsWith('es')) {
    // watches → watch, goes → go
    const withoutEs = lowerVerb.slice(0, -2);
    if (
      withoutEs.endsWith('ch') ||
      withoutEs.endsWith('sh') ||
      withoutEs.endsWith('x') ||
      withoutEs.endsWith('o') ||
      withoutEs.endsWith('s')
    ) {
      return { base: withoutEs, tense: 'present' };
    }
  }
  if (lowerVerb.endsWith('s') && !lowerVerb.endsWith('ss')) {
    return { base: lowerVerb.slice(0, -1), tense: 'present' };
  }

  // 규칙 과거형 (-ed)
  if (lowerVerb.endsWith('ed')) {
    // doubled consonant: stopped → stop
    if (
      lowerVerb.length > 4 &&
      lowerVerb[lowerVerb.length - 3] === lowerVerb[lowerVerb.length - 4]
    ) {
      return { base: lowerVerb.slice(0, -3), tense: 'past' };
    }
    // -ied: tried → try
    if (lowerVerb.endsWith('ied')) {
      return { base: `${lowerVerb.slice(0, -3)}y`, tense: 'past' };
    }
    // -ed: played → play
    return { base: lowerVerb.slice(0, -2), tense: 'past' };
  }

  return { base: lowerVerb, tense: 'present' };
}

// 한국어 동사 활용형 생성
function conjugateKoreanVerb(stem: string, tense: 'present' | 'past', _isPlain = true): string {
  if (!stem) return stem;

  // 이미 활용된 형태면 그대로 반환 (는다, 었다, 았다로 끝나는 경우만)
  if (
    stem.endsWith('는다') ||
    stem.endsWith('ㄴ다') ||
    stem.endsWith('었다') ||
    stem.endsWith('았다')
  ) {
    return stem;
  }

  // 어간 추출 (사전에서 ~다 형태로 저장된 경우: 가다 → 가, 먹다 → 먹)
  const verbStem = stem.endsWith('다') ? stem.slice(0, -1) : stem;

  // 현재형 (평서문)
  if (tense === 'present') {
    // 형용사성 동사 (있다, 없다, 좋다 등)는 ~다 형태
    const stemForCheck = verbStem;
    if (
      stemForCheck.endsWith('있') ||
      stemForCheck.endsWith('없') ||
      stemForCheck.endsWith('좋') ||
      stemForCheck.endsWith('싫') ||
      stemForCheck.endsWith('재미있') ||
      stemForCheck.endsWith('재미없')
    ) {
      return `${verbStem}다`;
    }
    // 일반 동사는 ~ㄴ다/는다
    // 받침 유무에 따라 ㄴ다/는다 선택
    const lastChar = verbStem[verbStem.length - 1];
    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const jongseong = (code - 0xac00) % 28;
        if (jongseong === 0) {
          // 받침 없음: ~ㄴ다 (가→간다, 마시→마신다)
          // 마지막 글자에 ㄴ 받침 추가
          const newCode = code + 4; // ㄴ은 4번 받침
          const prefix = verbStem.slice(0, -1); // 마지막 글자 제외한 앞부분
          return `${prefix + String.fromCharCode(newCode)}다`;
        }
        // 받침 있음: ~는다 (먹→먹는다, 읽→읽는다)
        return `${verbStem}는다`;
      }
    }
    return `${verbStem}다`;
  }

  // 과거형
  if (tense === 'past') {
    // 어간 모음에 따라 았다/었다 선택 (모음 축약 적용)
    const lastChar = verbStem[verbStem.length - 1];
    const prefix = verbStem.slice(0, -1); // 마지막 글자 제외한 앞부분
    if (lastChar) {
      const code = lastChar.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const offset = code - 0xac00;
        const cho = Math.floor(offset / 588);
        const jung = Math.floor((offset % 588) / 28);
        const jong = offset % 28;

        // 양성모음 (ㅏ=0, ㅗ=8): 았다
        if (jung === 0 || jung === 8) {
          if (jong === 0) {
            // 받침 없는 양성모음은 모음 축약
            if (jung === 0) {
              // ㅏ → ㅏ+ㅆ (가→갔다)
              const newCode = 0xac00 + cho * 588 + 0 * 28 + 20; // ㅏ + ㅆ
              return `${prefix + String.fromCharCode(newCode)}다`;
            }
            // ㅗ → ㅘ+ㅆ (보→봤다, 오→왔다)
            // ㅘ = jung index 9
            const newCode = 0xac00 + cho * 588 + 9 * 28 + 20; // ㅘ + ㅆ
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          return `${verbStem}았다`;
        }
        // 음성모음: 었다
        if (jong === 0) {
          // 받침 없는 음성모음: 축약 (ㅓ→ㅓ+ㅆ, ㅜ→ㅝ+ㅆ, ㅣ→ㅕ+ㅆ 등)
          if (jung === 4) {
            // ㅓ → ㅓ+ㅆ (서→섰다)
            const newCode = 0xac00 + cho * 588 + 4 * 28 + 20;
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          if (jung === 13) {
            // ㅜ → ㅝ+ㅆ (주→줬다)
            const newCode = 0xac00 + cho * 588 + 14 * 28 + 20; // ㅝ = 14
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          if (jung === 20) {
            // ㅣ → ㅕ+ㅆ (시→셨다, 하지만 보통 ㅣ+었다 = ㅕ+ㅆ)
            const newCode = 0xac00 + cho * 588 + 6 * 28 + 20; // ㅕ = 6
            return `${prefix + String.fromCharCode(newCode)}다`;
          }
          // 기타 음성모음: 그냥 ㅆ 받침 추가
          const newCode = code + 20;
          return `${prefix + String.fromCharCode(newCode)}다`;
        }
        return `${verbStem}었다`;
      }
    }
    return `${verbStem}었다`;
  }

  return `${verbStem}다`;
}

// ========================================
// 받침에 따른 조사 선택 헬퍼 함수
// ========================================

/**
 * 단어의 마지막 글자에 받침이 있는지 확인
 */
function hasFinalConsonant(word: string): boolean {
  if (!word) return false;
  const lastChar = word[word.length - 1];
  if (!lastChar) return false;
  const code = lastChar.charCodeAt(0);
  // 한글 범위 확인
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jongseong = (code - 0xac00) % 28;
    return jongseong !== 0;
  }
  // 한글이 아니면 받침 없음으로 처리
  return false;
}

/**
 * 주격 조사 선택 (이/가)
 * @remarks 현재 미사용이나 향후 주격 처리에 필요
 */
function _selectSubjectParticle(word: string): string {
  return hasFinalConsonant(word) ? '이' : '가';
}

/**
 * 주제 조사 선택 (은/는)
 */
function selectTopicParticle(word: string): string {
  return hasFinalConsonant(word) ? '은' : '는';
}

/**
 * 목적격 조사 선택 (을/를)
 */
function selectObjectParticle(word: string): string {
  return hasFinalConsonant(word) ? '을' : '를';
}

// 이동 동사 목록 (to + 장소 → 에)
const MOVEMENT_VERBS_EN = new Set([
  'go',
  'come',
  'return',
  'travel',
  'move',
  'walk',
  'run',
  'fly',
  'drive',
]);

// 구문동사 패턴 (to를 전치사로 취하지 않는 동사)
// 이 동사들 뒤의 to는 무시한다
const PHRASAL_VERBS_WITH_TO = new Set(['listen', 'look', 'belong', 'refer', 'relate']);

// 장소 부사로 쓰이는 단어 (전치사 없이 사용)
// "go home", "come home" 등에서 home은 부사로 사용됨
const LOCATION_ADVERBS = new Set(['home', 'here', 'there', 'upstairs', 'downstairs', 'abroad']);

// 역방향 사전 생성 (한→영에서 영→한 추출)
function getKoreanFromEnglish(english: string): string | undefined {
  const lower = english.toLowerCase();
  // 먼저 enToKoWords에서 직접 검색
  const direct = enToKoWords[lower];
  if (direct) return direct;

  // koToEnWords에서 역검색
  for (const [ko, en] of Object.entries(koToEnWords)) {
    if (en.toLowerCase() === lower) {
      return ko;
    }
  }
  return undefined;
}

export interface EnToKoResult {
  original: string; // 원본
  morpheme: EnglishMorpheme; // 형태소 분해
  koreanPrefix: string; // 한국어 접두사
  koreanStem: string; // 한국어 어간
  koreanSuffix: string; // 한국어 접미사
  translated: string; // 최종 번역
}

// 영어 접속사 → 한국어 연결어미
const ENGLISH_CONJUNCTIONS: Record<string, string> = {
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

// 영어 전치사 → 한국어 조사
const ENGLISH_PREPOSITIONS: Record<string, string> = {
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

// 영어 관사/한정사 (번역 시 생략)
const ENGLISH_ARTICLES = new Set(['the', 'a', 'an']);

// 지시형용사 (this, that - 다음 명사를 수식)
const ENGLISH_DEMONSTRATIVES = new Set(['this', 'that', 'these', 'those']);

// 영어 be 동사 (번역 시 특수 처리)
const ENGLISH_BE_VERBS = new Set(['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being']);

// 영어 불규칙 동사 과거형
const ENGLISH_IRREGULAR_VERBS: Record<string, { base: string; tense: 'past' }> = {
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

// 영어 형용사 목록 (수식어 판별용)
const ENGLISH_ADJECTIVES = new Set([
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

// 영어 부사 목록
const ENGLISH_ADVERBS = new Set([
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
]);

/**
 * 영어 → 한국어 번역 (자소 기반)
 * 문장 수준 번역 지원
 *
 * @example
 * translateEnToKo('unhappiness') → '불행복함'
 * translateEnToKo('I ate breakfast') → '나는 아침을 먹었다'
 */
export function translateEnToKo(text: string): string {
  // 0. 사전에서 직접 조회 (최우선)
  const lowerText = text.toLowerCase();
  const directTranslation = enToKoWords[lowerText];
  if (directTranslation) {
    return directTranslation;
  }

  // 문장인지 단어인지 판별
  const hasSpaces = text.includes(' ');
  const hasCommas = text.includes(',');

  if (hasSpaces || hasCommas) {
    // 문장 수준 번역
    return translateSentenceEnToKo(text);
  }

  // 단어 수준 번역
  const result = translateEnToKoDetailed(text);
  return result?.translated || text;
}

/**
 * 문장 수준 영→한 번역
 */
function translateSentenceEnToKo(text: string): string {
  // 1. 쉼표로 절 분리
  const clauses = text.split(/,\s*/);
  const translatedClauses: string[] = [];

  for (const clause of clauses) {
    if (!clause.trim()) continue;
    const translatedClause = translateClauseEnToKo(clause.trim());
    translatedClauses.push(translatedClause);
  }

  // 절들을 적절한 접속사로 연결
  return translatedClauses.join(', ');
}

/**
 * 절 수준 영→한 번역 (SVO → SOV 변환)
 */
function translateClauseEnToKo(clause: string): string {
  // 토큰화 (공백 기준)
  const tokens = clause.split(/\s+/);

  // 각 토큰 분석 및 번역
  const analyzed: Array<{
    original: string;
    translated: string;
    role:
      | 'subject'
      | 'verb'
      | 'object'
      | 'preposition'
      | 'conjunction'
      | 'adverb'
      | 'adjective'
      | 'article'
      | 'auxiliary'
      | 'negation'
      | 'unknown';
    tense?: 'past' | 'present' | 'future';
    verbBase?: string;
  }> = [];

  let prevRole: string | undefined;
  let hasVerb = false; // 동사가 나왔는지 추적
  let prevVerbBase: string | undefined; // 이전 동사의 기본형

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    const result = analyzeAndTranslateEnToken(token, prevRole, i === 0, { hasVerb, prevVerbBase });
    analyzed.push(result);
    prevRole = result.role;

    // 동사가 나오면 플래그 설정 및 기본형 저장
    // auxiliary (be, do 등)도 동사로 취급
    if (result.role === 'verb' || result.role === 'auxiliary') {
      hasVerb = true;
      if (result.verbBase) {
        prevVerbBase = result.verbBase;
      }
    }
  }

  // SOV 어순으로 재배열
  return rearrangeToSOV(analyzed);
}

/**
 * 영어 토큰 분석 및 번역
 */
function analyzeAndTranslateEnToken(
  token: string,
  prevRole: string | undefined,
  isFirst: boolean,
  context: {
    hasMovementVerb?: boolean;
    verbBase?: string;
    hasVerb?: boolean;
    prevVerbBase?: string;
  } = {},
): {
  original: string;
  translated: string;
  role:
    | 'subject'
    | 'verb'
    | 'object'
    | 'preposition'
    | 'conjunction'
    | 'adverb'
    | 'adjective'
    | 'article'
    | 'auxiliary'
    | 'negation'
    | 'unknown';
  tense?: 'past' | 'present' | 'future';
  isModifier?: boolean;
  verbBase?: string;
  isLocationAdverb?: boolean;
} {
  const lowerToken = token.toLowerCase();

  // 1. 관사 체크 (번역에서 생략)
  if (ENGLISH_ARTICLES.has(lowerToken)) {
    return { original: token, translated: '', role: 'article' };
  }

  // 1.5. 지시형용사 체크 (this, that - 관형어로 처리)
  if (ENGLISH_DEMONSTRATIVES.has(lowerToken)) {
    const translation = enToKoWords[lowerToken] || token;
    return { original: token, translated: translation, role: 'article', isModifier: true };
  }

  // 2. 부정어 체크
  if (lowerToken === 'not') {
    return { original: token, translated: '', role: 'negation' };
  }

  // 3. 접속사 체크
  const conjunction = ENGLISH_CONJUNCTIONS[lowerToken];
  if (conjunction) {
    return { original: token, translated: conjunction, role: 'conjunction' };
  }

  // 4. 전치사 체크
  // "listen to", "look at" 같은 구문동사의 전치사는 무시
  if (lowerToken === 'to' && prevRole === 'verb') {
    // 직전이 phrasal verb면 to 무시, 그 외에는 정상 전치사로 처리
    if (context.prevVerbBase && PHRASAL_VERBS_WITH_TO.has(context.prevVerbBase)) {
      return { original: token, translated: '', role: 'preposition' };
    }
    // 이동 동사 뒤의 to는 정상 전치사 (에로 번역)
    return { original: token, translated: '에', role: 'preposition' };
  }
  const preposition = ENGLISH_PREPOSITIONS[lowerToken];
  if (preposition) {
    return { original: token, translated: preposition, role: 'preposition' };
  }

  // 5. be 동사 체크
  if (ENGLISH_BE_VERBS.has(lowerToken)) {
    const tense = ['was', 'were'].includes(lowerToken) ? ('past' as const) : ('present' as const);
    return { original: token, translated: '있', role: 'auxiliary', tense };
  }

  // 6. do/does/did 체크 (조동사로 사용)
  if (['do', 'does', 'did'].includes(lowerToken)) {
    const tense = lowerToken === 'did' ? ('past' as const) : ('present' as const);
    return { original: token, translated: '', role: 'auxiliary', tense };
  }

  // 7. 불규칙 동사 과거형 체크
  const irregularVerb = ENGLISH_IRREGULAR_VERBS[lowerToken];
  if (irregularVerb) {
    // 사전에서 기본형 번역
    const baseTranslation = getKoreanFromEnglish(irregularVerb.base);
    if (baseTranslation) {
      return {
        original: token,
        translated: baseTranslation,
        role: prevRole === 'auxiliary' ? 'adjective' : 'verb',
        tense: 'past',
        verbBase: irregularVerb.base,
      };
    }
  }

  // 8. 3인칭 단수 동사 체크 (-s, -es, -ies)
  const verbInfo = getEnglishVerbBase(lowerToken);
  if (verbInfo.base !== lowerToken) {
    const baseTranslation = getKoreanFromEnglish(verbInfo.base);
    if (baseTranslation) {
      return {
        original: token,
        translated: baseTranslation,
        role: 'verb',
        tense: verbInfo.tense,
        verbBase: verbInfo.base,
      };
    }
  }

  // 9. 부사 체크
  if (ENGLISH_ADVERBS.has(lowerToken)) {
    const directTranslation = enToKoWords[lowerToken];
    return {
      original: token,
      translated: directTranslation || token,
      role: 'adverb',
    };
  }

  // 10. 형용사 체크 (관형어로 사용될 수 있음)
  if (ENGLISH_ADJECTIVES.has(lowerToken)) {
    const directTranslation = enToKoWords[lowerToken];
    // 이전이 관사나 부사면 관형어 (modifier)
    const isModifier = prevRole === 'article' || prevRole === 'adverb' || prevRole === 'adjective';
    return {
      original: token,
      translated: directTranslation || token,
      role: 'adjective',
      isModifier,
    };
  }

  // 11. 장소 부사 체크 (home, here, there 등 - 전치사 없이 사용)
  // "go home", "come home"에서 home은 부사로 사용됨 → 장소로 처리
  if (LOCATION_ADVERBS.has(lowerToken) && prevRole === 'verb') {
    const directTranslation = enToKoWords[lowerToken];
    // 이동 동사 + home → 집에
    if (context.prevVerbBase && MOVEMENT_VERBS_EN.has(context.prevVerbBase)) {
      return {
        original: token,
        translated: directTranslation || token,
        role: 'object', // rearrangeToSOV에서 장소로 처리되도록
        isLocationAdverb: true, // 마커 추가
      };
    }
    return { original: token, translated: directTranslation || token, role: 'adverb' };
  }

  // 12. 사전에서 직접 검색
  const directTranslation = enToKoWords[lowerToken];
  if (directTranslation !== undefined) {
    // 역할 추론
    let role: 'subject' | 'verb' | 'object' | 'adverb' | 'adjective' | 'unknown' = 'unknown';
    let tense: 'past' | 'present' | 'future' | undefined;

    // 첫 번째 단어이고 대명사면 주어
    if (isFirst && ['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(lowerToken)) {
      role = 'subject';
    }
    // 관사 뒤에 오는 명사 + 아직 동사가 안 나왔으면 주어 (The cat, The book 등)
    else if (prevRole === 'article' && !context.hasVerb) {
      role = 'subject';
    }
    // 이전이 주어/부사면 동사
    else if (
      prevRole === 'subject' ||
      prevRole === 'adverb' ||
      prevRole === 'auxiliary' ||
      prevRole === 'negation'
    ) {
      role = 'verb';
    }
    // 이전이 동사면 목적어
    else if (prevRole === 'verb') {
      role = 'object';
    }
    // 이전이 전치사면 목적어
    else if (prevRole === 'preposition') {
      role = 'object';
    }
    // 이전이 관사/형용사면 목적어 (a beautiful painting → 아름다운 그림을)
    else if (prevRole === 'article' || prevRole === 'adjective') {
      role = 'object';
    }

    // -ed 어미로 과거 시제 추론
    if (lowerToken.endsWith('ed') && role === 'verb') {
      tense = 'past';
    }

    return { original: token, translated: directTranslation, role, tense, verbBase: lowerToken };
  }

  // 12. 형태소 분해 번역
  const morphemeResult = translateEnToKoDetailed(token);
  if (morphemeResult && morphemeResult.translated !== token) {
    let role: 'subject' | 'verb' | 'object' | 'adverb' | 'adjective' | 'unknown' = 'unknown';
    let tense: 'past' | 'present' | 'future' | undefined;

    if (
      prevRole === 'subject' ||
      prevRole === 'adverb' ||
      prevRole === 'auxiliary' ||
      prevRole === 'negation'
    ) {
      role = 'verb';
    } else if (prevRole === 'verb' || prevRole === 'preposition') {
      role = 'object';
    } else if (prevRole === 'article' || prevRole === 'adjective') {
      role = 'object';
    }

    // -ed 어미로 과거 시제 추론
    if (lowerToken.endsWith('ed') && role === 'verb') {
      tense = 'past';
    }

    return { original: token, translated: morphemeResult.translated, role, tense };
  }

  // 13. 원본 반환 (로마자 유지)
  return { original: token, translated: token, role: 'unknown' };
}

/**
 * SVO → SOV 어순 변환 (관형절, 부사절 처리 포함)
 */
function rearrangeToSOV(
  tokens: Array<{
    original: string;
    translated: string;
    role: string;
    tense?: string;
    isModifier?: boolean;
    verbBase?: string;
    isLocationAdverb?: boolean;
  }>,
): string {
  const subjects: string[] = [];
  const verbs: Array<{ text: string; tense: string; base?: string; isAdjective?: boolean }> = [];
  const objects: string[] = [];
  const adverbs: string[] = [];
  const conjunctions: string[] = [];
  const locations: Array<{ text: string; preposition?: string }> = [];
  const companions: string[] = []; // with 관계
  const modifiers: string[] = []; // 관형어 (다음 명사 앞에 배치)
  const others: string[] = [];
  let verbTense: 'past' | 'present' = 'present';
  let isNegative = false;
  let hasMovementVerb = false;
  let pendingPreposition: string | null = null;

  // 1단계: 동사 분석하여 이동 동사 여부 확인
  for (const token of tokens) {
    if (token.role === 'verb' && token.verbBase) {
      if (MOVEMENT_VERBS_EN.has(token.verbBase)) {
        hasMovementVerb = true;
        break;
      }
    }
  }

  // 2단계: 토큰 분류
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];
    const _prevToken = tokens[i - 1];

    // 부정어 감지
    if (token.role === 'negation') {
      isNegative = true;
      continue;
    }

    // 빈 번역은 건너뜀 (관사 등)
    if (!token.translated) {
      // auxiliary (be/do)의 시제는 기억
      if (token.role === 'auxiliary' && token.tense === 'past') {
        verbTense = 'past';
      }
      continue;
    }

    // 지시형용사 (this, that)는 modifier로 추가
    if (token.role === 'article' && token.isModifier && token.translated) {
      modifiers.push(token.translated);
      continue;
    }

    // 동사의 시제 저장
    if (token.tense === 'past') {
      verbTense = 'past';
    }

    switch (token.role) {
      case 'subject':
        // 수식어가 있으면 주어 앞에 붙임
        // 주제 조사 (은/는) 사용 - 받침에 따라 선택
        if (modifiers.length > 0) {
          const particle = selectTopicParticle(token.translated);
          subjects.push(`${modifiers.join(' ')} ${token.translated}${particle}`);
          modifiers.length = 0;
        } else {
          const particle = selectTopicParticle(token.translated);
          subjects.push(`${token.translated}${particle}`);
        }
        break;

      case 'verb':
        verbs.push({
          text: token.translated,
          tense: token.tense || 'present',
          base: token.verbBase,
        });
        break;

      case 'object':
        // 장소 부사 (home, here, there 등 - 전치사 없이 사용되는 경우)
        if (token.isLocationAdverb) {
          // 이동 동사 뒤의 home → 집에
          locations.push({ text: token.translated, preposition: '에' });
          break;
        }
        // 전치사가 pending 상태면 장소로 처리
        if (pendingPreposition) {
          // 이동 동사 + to + 장소 → 장소에
          if (hasMovementVerb && pendingPreposition === '에') {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({ text: `${modifiedText} ${token.translated}`, preposition: '에' });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: '에' });
            }
          } else if (pendingPreposition === '위에') {
            locations.push({ text: token.translated, preposition: ' 위에' });
          } else if (pendingPreposition === '에서') {
            locations.push({ text: token.translated, preposition: '에' });
          } else if (pendingPreposition.includes('에') || pendingPreposition.includes('로')) {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({
                text: `${modifiedText} ${token.translated}`,
                preposition: pendingPreposition,
              });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: pendingPreposition });
            }
          } else if (pendingPreposition === '와 함께') {
            companions.push(token.translated);
          } else {
            // 일반 목적어
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              objects.push(`${modifiedText} ${token.translated}`);
              modifiers.length = 0;
            } else {
              objects.push(token.translated);
            }
          }
          pendingPreposition = null;
        } else {
          // 수식어가 있으면 목적어 앞에 붙임 (관형절)
          if (modifiers.length > 0) {
            const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
            objects.push(`${modifiedText} ${token.translated}`);
            modifiers.length = 0;
          } else {
            objects.push(token.translated);
          }
        }
        break;

      case 'preposition':
        // 전치사 정보 저장 (다음 명사에 적용될 것)
        pendingPreposition = token.translated;
        break;

      case 'conjunction':
        conjunctions.push(token.translated);
        break;

      case 'adverb':
        adverbs.push(token.translated);
        break;

      case 'adjective':
        // 형용사는 관형어로 처리 (다음 명사 앞에 배치)
        if (token.isModifier || (nextToken && ['object', 'unknown'].includes(nextToken.role))) {
          modifiers.push(token.translated);
        } else {
          // 서술어로 사용 (be + adj)
          // 형용사 어간 추출: 좋은 → 좋, 아름다운 → 아름답
          let adjStem = token.translated;
          if (adjStem.endsWith('은') || adjStem.endsWith('운')) {
            adjStem = adjStem.slice(0, -1);
          } else if (adjStem.endsWith('ㄴ')) {
            // 관형형 ㄴ 제거 후 기본형으로
            adjStem = adjStem.slice(0, -1);
          }
          // 형용사는 ~다 형태로 바로 출력 (동사 활용 적용하지 않음)
          verbs.push({
            text: `${adjStem}다`,
            tense: 'present',
            base: undefined,
            isAdjective: true,
          });
        }
        break;

      case 'auxiliary':
        // be 동사 + 형용사/장소의 경우
        if (token.translated === '있') {
          // 다음 토큰 확인하여 장소/형용사 판단
          // 지금은 일단 동사로 추가
          verbs.push({ text: token.translated, tense: token.tense || 'present', base: 'be' });
        }
        break;

      default:
        // 전치사 뒤에 온 명사 처리
        if (pendingPreposition) {
          // 이동 동사 + to + 장소 → 장소에
          if (hasMovementVerb && pendingPreposition === '에') {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({ text: `${modifiedText} ${token.translated}`, preposition: '에' });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: '에' });
            }
          } else if (pendingPreposition === '위에') {
            // on the desk → 책상 위에
            locations.push({ text: token.translated, preposition: ' 위에' });
          } else if (pendingPreposition === '에서') {
            // at home → 집에 (be 동사 + at → 에)
            locations.push({ text: token.translated, preposition: '에' });
          } else if (pendingPreposition.includes('에') || pendingPreposition.includes('로')) {
            if (modifiers.length > 0) {
              const modifiedText = modifiers.map((m) => convertToKoreanModifier(m)).join(' ');
              locations.push({
                text: `${modifiedText} ${token.translated}`,
                preposition: pendingPreposition,
              });
              modifiers.length = 0;
            } else {
              locations.push({ text: token.translated, preposition: pendingPreposition });
            }
          } else if (pendingPreposition === '와 함께') {
            companions.push(token.translated);
          } else {
            if (modifiers.length > 0) {
              others.push(`${modifiers.join(' ')} ${token.translated}`);
              modifiers.length = 0;
            } else {
              others.push(token.translated);
            }
          }
          pendingPreposition = null;
        } else if (modifiers.length > 0) {
          others.push(`${modifiers.join(' ')} ${token.translated}`);
          modifiers.length = 0;
        } else {
          others.push(token.translated);
        }
    }
  }

  // 남은 수식어가 있으면 others에 추가
  if (modifiers.length > 0) {
    others.push(...modifiers);
  }

  // SOV 순서로 조합
  const parts: string[] = [];

  // 접속사 (문두)
  if (conjunctions.length > 0) {
    parts.push(...conjunctions);
  }

  // 주어
  if (subjects.length > 0) {
    parts.push(...subjects);
  }

  // 부사
  if (adverbs.length > 0) {
    parts.push(...adverbs);
  }

  // 장소 (조사 포함)
  if (locations.length > 0) {
    for (const loc of locations) {
      const particle = loc.preposition || '에';
      if (
        !loc.text.endsWith('에') &&
        !loc.text.endsWith('에서') &&
        !loc.text.endsWith('로') &&
        !loc.text.endsWith('으로')
      ) {
        parts.push(`${loc.text}${particle}`);
      } else {
        parts.push(loc.text);
      }
    }
  }

  // 동반자 (with 관계)
  if (companions.length > 0) {
    for (const comp of companions) {
      parts.push(`${comp}와 함께`);
    }
  }

  // 기타
  if (others.length > 0) {
    parts.push(...others.filter((o) => o && !o.includes('에') && o !== '와 함께'));
  }

  // 목적어
  if (objects.length > 0) {
    const objsWithParticle = objects.map((obj, idx) => {
      if (
        obj.includes('에') ||
        obj.includes('와') ||
        obj.endsWith('를') ||
        obj.endsWith('을') ||
        obj.endsWith('로')
      ) {
        return obj;
      }
      if (idx === objects.length - 1) {
        // 받침에 따라 을/를 선택
        const particle = selectObjectParticle(obj);
        return `${obj}${particle}`;
      }
      return obj;
    });
    parts.push(...objsWithParticle);
  }

  // 동사 (문장 끝) - 활용형 적용
  if (verbs.length > 0) {
    const lastVerb = verbs[verbs.length - 1];
    let finalVerb = lastVerb.text;

    // 부정문 처리
    if (isNegative) {
      // V-지 않는다 형태로 변환
      const stem = finalVerb.endsWith('다') ? finalVerb.slice(0, -1) : finalVerb;
      finalVerb = `${stem}지 않는다`;
    } else if (lastVerb.isAdjective) {
      // 형용사는 이미 ~다 형태이므로 그대로 사용
      // (좋다, 재미있다 등)
    } else {
      // 동사 활용형 적용
      const tense = verbTense === 'past' || lastVerb.tense === 'past' ? 'past' : 'present';
      finalVerb = conjugateKoreanVerb(finalVerb, tense);
    }

    parts.push(finalVerb);
  }

  // 공백으로 연결
  return parts.filter((p) => p?.trim()).join(' ');
}

/**
 * 형용사를 한국어 관형형으로 변환
 * 예: 아름다운, 새로운, 좋은
 */
function convertToKoreanModifier(adjective: string): string {
  // 이미 관형형이면 그대로 반환
  if (adjective.endsWith('운') || adjective.endsWith('은') || adjective.endsWith('ㄴ')) {
    return adjective;
  }

  // 형용사 + ㄴ/은 관형형 변환
  // 받침 유무 확인
  const lastChar = adjective[adjective.length - 1];
  if (lastChar) {
    const code = lastChar.charCodeAt(0);
    // 한글 범위 확인
    if (code >= 0xac00 && code <= 0xd7a3) {
      const jongseong = (code - 0xac00) % 28;
      if (jongseong === 0) {
        // 받침 없음: ~ㄴ 추가 (예: 새로 → 새로운)
        return `${adjective}운`;
      }
      // 받침 있음: ~은 추가 (예: 좋 → 좋은)
      return `${adjective}은`;
    }
  }

  // 기본값: ~은
  return `${adjective}`;
}

/**
 * 영어 → 한국어 번역 (상세 정보 포함)
 */
export function translateEnToKoDetailed(text: string): EnToKoResult | null {
  // 1. 형태소 분해
  const morpheme = decomposeEnglish(text);

  // 2. 접두사 번역
  const koreanPrefix = morpheme.prefix ? translatePrefix(morpheme.prefix) : '';

  // 3. 어간 번역
  const koreanStem = translateStemEnToKo(morpheme.stem) || morpheme.stem;

  // 4. 접미사 번역
  const koreanSuffix = translateEnglishSuffix(morpheme.suffix, morpheme.suffixInfo?.type);

  // 5. 조합
  let translated = koreanPrefix + koreanStem + koreanSuffix;

  // 6. 후처리 (자연스러운 한국어 형태로)
  translated = postProcessKorean(translated, morpheme);

  return {
    original: text,
    morpheme,
    koreanPrefix,
    koreanStem,
    koreanSuffix,
    translated,
  };
}

/**
 * 영어 접미사를 한국어로 번역
 */
function translateEnglishSuffix(suffix: string, type?: string): string {
  if (!suffix) return '';

  // 동사 접미사
  if (type === 'verb') {
    // 과거형
    if (suffix.includes('ed')) {
      return '었다'; // 간단 버전
    }

    // 진행형
    if (suffix.includes('ing')) {
      return '는'; // 간단 버전
    }

    // 3인칭 단수
    if (suffix === 's' || suffix === 'es') {
      return '다';
    }
  }

  // 명사 접미사
  if (type === 'noun') {
    if (suffix === 'ness') return '함';
    if (suffix === 'ment' || suffix === 'tion' || suffix === 'sion') return '것';
    if (suffix === 'er' || suffix === 'or') return '하는사람';
    if (suffix === 'ist') return '주의자';
    if (suffix === 'ship') return '관계';
    if (suffix === 'hood') return '상태';
    if (suffix === 'ity') return '성';
  }

  // 형용사 접미사
  if (type === 'adjective') {
    if (suffix === 'able' || suffix === 'ible') return '할수있는';
    if (suffix === 'ful') return '로운';
    if (suffix === 'less') return '없는';
    if (suffix === 'ous' || suffix === 'ious') return '한';
    if (suffix === 'ive') return '한';
    if (suffix === 'al' || suffix === 'ial') return '한';
    if (suffix === 'y') return '한';
  }

  // 부사 접미사
  if (type === 'adverb') {
    if (suffix.includes('ly')) return '하게';
  }

  // 기본 번역 시도
  return translateSuffix(suffix);
}

/**
 * 한국어 후처리 (자연스러운 형태로)
 */
function postProcessKorean(text: string, morpheme: EnglishMorpheme): string {
  let result = text;

  // 동사 접미사 자연스럽게 변환
  if (morpheme.suffixInfo?.type === 'verb') {
    // ing → 고있다/는중이다
    if (morpheme.suffix.includes('ing')) {
      result = result.replace(/는$/, '고있다');
    }

    // ed → 었다/았다
    if (morpheme.suffix.includes('ed')) {
      // 어간의 마지막 모음에 따라 었다/았다 선택
      // 간단 버전: 일단 었다 사용
      result = result.replace(/었다$/, '었다');
    }
  }

  // 명사화 접미사 자연스럽게
  if (morpheme.suffixInfo?.type === 'noun') {
    if (morpheme.suffix === 'ness') {
      // happiness → 행복함
      result = result.replace(/함$/, '함');
    }

    if (morpheme.suffix === 'er' || morpheme.suffix === 'or') {
      // teacher → 가르치는사람
      result = result.replace(/하는사람$/, '는사람');
    }
  }

  // 형용사 접미사
  if (morpheme.suffixInfo?.type === 'adjective') {
    if (morpheme.suffix === 'able' || morpheme.suffix === 'ible') {
      // readable → 읽을수있는
      result = result.replace(/할수있는$/, '할수있는');
    }

    if (morpheme.suffix === 'ful') {
      // beautiful → 아름다로운
      result = result.replace(/로운$/, '운');
    }

    if (morpheme.suffix === 'less') {
      // helpless → 도움없는
      result = result.replace(/없는$/, '없는');
    }
  }

  // 공백 제거 (한국어는 붙여씀)
  result = result.replace(/\s+/g, '');

  return result;
}

/**
 * 여러 단어 번역 (공백으로 구분)
 */
export function translateEnToKoMultiple(text: string): string {
  const words = text.split(/\s+/);
  const translated = words.map((word) => translateEnToKo(word));
  return translated.join(' ');
}
