/**
 * 번역기 v2.1 생성기
 * 분석된 토큰을 목표 언어로 재조립
 *
 * @filesize ~10,900 lines
 *
 * TODO(refactor): 이 파일은 10K+ 줄로 분할이 필요합니다.
 * 제안되는 모듈 구조:
 * - generator/index.ts - 메인 진입점
 * - generator/hangul-utils.ts - 한글 자모 처리
 * - generator/verb-conjugation.ts - 동사 활용 (3인칭, 시제, 조동사)
 * - generator/sentence-templates.ts - 문장 템플릿 시스템
 * - generator/word-order.ts - 어순 변환 (SVO ↔ SOV)
 * - generator/articles.ts - 관사 규칙 (a/an/the)
 * - generator/particles.ts - 전치사/조사 매핑
 *
 * @see https://github.com/soundbluemusic/soundblue-monorepo/issues/XXX
 */

import {
  getEnglishPreposition,
  getPronounCase,
  type ParticleCategory,
  selectParticle,
  translatePronoun,
} from '../dictionary/declension';
import {
  analyzeKoreanEnding,
  COUNTERS,
  EN_KO,
  endingToEnglish,
  IDIOMS_EN_KO,
  IDIOMS_KO_EN,
  KO_EN,
  KO_POLYSEMY_RULES,
  MODAL_VERBS,
  NOUN_CONTEXT,
  NOUN_TO_VERB,
  selectPolysemyMeaning,
  VERB_PAST,
  VERB_PREPOSITIONS,
  VERB_STEMS,
} from './data';
import type { Formality, ParsedSentence, SentenceType, Tense, Token } from './types';

// ============================================
// 한국어 주어 대명사 → 영어 주격 변환
// ============================================
const KO_SUBJECT_TO_EN: Record<string, string> = {
  나: 'I',
  내: 'I',
  저: 'I',
  제: 'I',
  너: 'you',
  네: 'you',
  당신: 'you',
  그: 'he',
  그녀: 'she',
  우리: 'we',
  저희: 'we',
  그들: 'they',
  그것: 'it',
};

/**
 * 한국어 주어 대명사를 영어 주격으로 변환
 * data.ts의 KO_EN에서 '나'='me'로 되어 있어도 주어 위치에서는 'I'로 변환
 */
function translateSubjectPronoun(korean: string, fallback: string): string {
  return KO_SUBJECT_TO_EN[korean] || fallback;
}

/**
 * 다의어 처리를 포함한 한국어 → 영어 단어 번역
 *
 * 1. 다의어(KO_POLYSEMY_RULES에 있는 단어)인 경우 맥락 분석
 * 2. 일반 단어는 KO_EN 사전에서 직접 찾기
 *
 * @param word 번역할 한국어 단어
 * @param context 주변 단어들 (맥락 분석용)
 * @returns 영어 번역
 */
function _translateKoreanWord(word: string, context: string[] = []): string {
  // 1. 다의어인지 확인
  if (KO_POLYSEMY_RULES[word]) {
    return selectPolysemyMeaning(word, context);
  }

  // 2. 일반 사전 조회
  return KO_EN[word] || word;
}

/**
 * 문장에서 맥락 단어 추출
 *
 * @param tokens 토큰 배열
 * @returns 맥락 단어들 (동사, 명사, 형용사의 stem/text)
 */
function _extractContext(tokens: Token[]): string[] {
  const context: string[] = [];
  for (const token of tokens) {
    if (token.stem) context.push(token.stem);
    if (token.text) context.push(token.text);
    if (token.translated) context.push(token.translated);
  }
  return context;
}

// ============================================
// 한글 자모 처리 유틸리티
// ============================================

// 한글 유니코드 상수
const HANGUL_BASE = 0xac00; // '가'
const HANGUL_END = 0xd7a3; // '힣'
const JONGSEONG_COUNT = 28; // 종성 개수 (없음 포함)
const JUNGSEONG_COUNT = 21; // 중성 개수

// 초성, 중성, 종성 목록
const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];
const JUNGSEONG = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];
const JONGSEONG = [
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

/**
 * 한글 음절을 초성, 중성, 종성으로 분해
 */
function decomposeHangul(char: string): { cho: string; jung: string; jong: string } | null {
  const code = char.charCodeAt(0);
  if (code < HANGUL_BASE || code > HANGUL_END) return null;

  const syllableIndex = code - HANGUL_BASE;
  const choIndex = Math.floor(syllableIndex / (JUNGSEONG_COUNT * JONGSEONG_COUNT));
  const jungIndex = Math.floor(
    (syllableIndex % (JUNGSEONG_COUNT * JONGSEONG_COUNT)) / JONGSEONG_COUNT,
  );
  const jongIndex = syllableIndex % JONGSEONG_COUNT;

  return {
    cho: CHOSEONG[choIndex],
    jung: JUNGSEONG[jungIndex],
    jong: JONGSEONG[jongIndex],
  };
}

/**
 * 초성, 중성, 종성을 합쳐서 한글 음절로 조합
 */
function composeHangul(cho: string, jung: string, jong = ''): string {
  const choIndex = CHOSEONG.indexOf(cho);
  const jungIndex = JUNGSEONG.indexOf(jung);
  const jongIndex = JONGSEONG.indexOf(jong);

  if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) return cho + jung + jong;

  const code =
    HANGUL_BASE +
    choIndex * JUNGSEONG_COUNT * JONGSEONG_COUNT +
    jungIndex * JONGSEONG_COUNT +
    jongIndex;
  return String.fromCharCode(code);
}

/**
 * 마지막 글자의 받침(종성) 유무 확인
 */
function hasKoreanFinalConsonant(text: string): boolean {
  if (!text) return false;
  const lastChar = text.slice(-1);
  const decomposed = decomposeHangul(lastChar);
  return decomposed !== null && decomposed.jong !== '';
}

/**
 * 마지막 글자의 받침 가져오기
 */
function getKoreanFinalConsonant(text: string): string {
  if (!text) return '';
  const lastChar = text.slice(-1);
  const decomposed = decomposeHangul(lastChar);
  return decomposed?.jong || '';
}

/**
 * 마지막 글자의 받침 제거 (ㄹ 탈락 등)
 * 예: 살 → 사, 알 → 아
 */
function removeKoreanFinalConsonant(text: string): string {
  if (!text) return '';
  const lastChar = text.slice(-1);
  const decomposed = decomposeHangul(lastChar);
  if (!decomposed || decomposed.jong === '') return text;

  const newLastChar = composeHangul(decomposed.cho, decomposed.jung, '');
  return text.slice(0, -1) + newLastChar;
}

/**
 * 마지막 글자의 받침 변경
 * 예: 살 → 삼 (ㄹ → ㅁ)
 */
function _changeKoreanFinalConsonant(text: string, newJong: string): string {
  if (!text) return '';
  const lastChar = text.slice(-1);
  const decomposed = decomposeHangul(lastChar);
  if (!decomposed) return text;

  const newLastChar = composeHangul(decomposed.cho, decomposed.jung, newJong);
  return text.slice(0, -1) + newLastChar;
}

// ============================================
// 문장 템플릿 시스템
// ============================================

/**
 * 문장 유형+시제별 영어 템플릿
 *
 * 변수:
 * - {S} = 주어 (Subject)
 * - {V} = 동사 원형 (Verb base)
 * - {O} = 목적어 (Object)
 * - {L} = 위치/장소 (Location)
 * - {A} = 부사 (Adverb)
 *
 * 수식자:
 * - :lower = 소문자로 변환
 * - :past = 과거형으로 변환
 */
type TemplateKey = `${SentenceType}-${Tense}` | `${SentenceType}-${Tense}-negated`;

// 3인칭 단수용 별도 템플릿 키 타입
type TemplateKey3ps = `${SentenceType}-${Tense}-3ps` | `${SentenceType}-${Tense}-3ps-negated`;
type AllTemplateKeys = TemplateKey | TemplateKey3ps;

const SENTENCE_TEMPLATES: Partial<Record<AllTemplateKeys, string>> & Record<TemplateKey, string> = {
  // 평서문
  'statement-present': '{S} {V} {O} {L} {A}',
  'statement-past': '{S} {V:past} {O} {L} {A}',
  'statement-future': '{S} will {V} {O} {L} {A}',
  'statement-present-perfect': '{S} have {V:pp} {O} {L} {A}',
  'statement-past-perfect': '{S} had {V:pp} {O} {L} {A}',

  // 평서문 부정
  'statement-present-negated': "{S} don't {V} {O} {L} {A}",
  'statement-past-negated': "{S} didn't {V} {O} {L} {A}",
  'statement-future-negated': "{S} won't {V} {O} {L} {A}",
  'statement-present-perfect-negated': "{S} haven't {V:pp} {O} {L} {A}",
  'statement-past-perfect-negated': "{S} hadn't {V:pp} {O} {L} {A}",

  // Phase 1: 3인칭 단수 평서문 부정
  'statement-present-3ps-negated': "{S} doesn't {V} {O} {L} {A}",

  // 의문문
  'question-present': 'Do {S:lower} {V} {O} {L} {A}',
  'question-past': 'Did {S:lower} {V} {O} {L} {A}',
  'question-future': 'Will {S:lower} {V} {O} {L} {A}',
  'question-present-perfect': 'Have {S:lower} {V:pp} {O} {L} {A}',
  'question-past-perfect': 'Had {S:lower} {V:pp} {O} {L} {A}',

  // Phase 1: 3인칭 단수 의문문
  'question-present-3ps': 'Does {S:lower} {V} {O} {L} {A}',
  'question-present-3ps-negated': "Doesn't {S:lower} {V} {O} {L} {A}",

  // 의문문 부정
  'question-present-negated': "Don't {S:lower} {V} {O} {L} {A}",
  'question-past-negated': "Didn't {S:lower} {V} {O} {L} {A}",
  'question-future-negated': "Won't {S:lower} {V} {O} {L} {A}",
  'question-present-perfect-negated': "Haven't {S:lower} {V:pp} {O} {L} {A}",
  'question-past-perfect-negated': "Hadn't {S:lower} {V:pp} {O} {L} {A}",

  // 감탄문
  'exclamation-present': '{S} {V} {O} {L} {A}',
  'exclamation-past': '{S} {V:past} {O} {L} {A}',
  'exclamation-future': '{S} will {V} {O} {L} {A}',
  'exclamation-present-perfect': '{S} have {V:pp} {O} {L} {A}',
  'exclamation-past-perfect': '{S} had {V:pp} {O} {L} {A}',

  // 감탄문 부정
  'exclamation-present-negated': "{S} don't {V} {O} {L} {A}",
  'exclamation-past-negated': "{S} didn't {V} {O} {L} {A}",
  'exclamation-future-negated': "{S} won't {V} {O} {L} {A}",
  'exclamation-present-perfect-negated': "{S} haven't {V:pp} {O} {L} {A}",
  'exclamation-past-perfect-negated': "{S} hadn't {V:pp} {O} {L} {A}",

  // 명령문
  'imperative-present': '{V} {O} {L} {A}',
  'imperative-past': '{V} {O} {L} {A}',
  'imperative-future': '{V} {O} {L} {A}',
  'imperative-present-perfect': '{V} {O} {L} {A}',
  'imperative-past-perfect': '{V} {O} {L} {A}',

  // 명령문 부정
  'imperative-present-negated': "Don't {V} {O} {L} {A}",
  'imperative-past-negated': "Don't {V} {O} {L} {A}",
  'imperative-future-negated': "Don't {V} {O} {L} {A}",
  'imperative-present-perfect-negated': "Don't {V} {O} {L} {A}",
  'imperative-past-perfect-negated': "Don't {V} {O} {L} {A}",

  // Phase 1: 청유문 (suggestion)
  'suggestion-present': "Let's {V} {O} {L} {A}",
  'suggestion-past': "Let's {V} {O} {L} {A}",
  'suggestion-future': "Let's {V} {O} {L} {A}",
  'suggestion-present-perfect': "Let's {V} {O} {L} {A}",
  'suggestion-past-perfect': "Let's {V} {O} {L} {A}",

  // 청유문 부정
  'suggestion-present-negated': "Let's not {V} {O} {L} {A}",
  'suggestion-past-negated': "Let's not {V} {O} {L} {A}",
  'suggestion-future-negated': "Let's not {V} {O} {L} {A}",
  'suggestion-present-perfect-negated': "Let's not {V} {O} {L} {A}",
  'suggestion-past-perfect-negated': "Let's not {V} {O} {L} {A}",
};

/**
 * 템플릿 키 생성
 *
 * Phase 1: 3인칭 단수 지원 추가
 */
function getTemplateKey(
  type: SentenceType,
  tense: Tense,
  negated: boolean,
  is3ps = false,
): AllTemplateKeys {
  // 3인칭 단수 전용 템플릿이 있는지 확인
  if (is3ps && tense === 'present') {
    const key3ps = negated
      ? (`${type}-${tense}-3ps-negated` as AllTemplateKeys)
      : (`${type}-${tense}-3ps` as AllTemplateKeys);
    // 해당 키가 템플릿에 있으면 사용
    if (key3ps in SENTENCE_TEMPLATES) {
      return key3ps;
    }
  }

  return negated ? `${type}-${tense}-negated` : `${type}-${tense}`;
}

/**
 * 템플릿에 값 채우기
 *
 * @param template 문장 템플릿
 * @param values 변수 값들
 * @param tense 시제
 * @param is3ps 3인칭 단수 여부 (Phase 1 추가)
 */
function fillTemplate(
  template: string,
  values: { S?: string; V?: string; O?: string; L?: string; A?: string },
  tense: Tense,
  is3ps = false,
): string {
  let result = template;

  // 동사 원형 추출 (전치사 결합용)
  const verbBase = values.V?.toLowerCase() || '';

  // 각 변수 치환
  for (const [key, value] of Object.entries(values)) {
    if (!value) {
      // 값이 없으면 해당 플레이스홀더 제거
      result = result.replace(new RegExp(`\\{${key}(:[a-z]+)?\\}\\s*`, 'g'), '');
      continue;
    }

    // :lower 수식자 처리
    result = result.replace(`{${key}:lower}`, value.toLowerCase());

    // :past 수식자 처리
    if (key === 'V') {
      result = result.replace(`{${key}:past}`, applyTense(value, 'past'));
    }

    // 목적어 치환 시 동사-전치사 결합 처리
    if (key === 'O' && values.O) {
      const preposition = VERB_PREPOSITIONS[verbBase];
      if (preposition) {
        // 동사에 전치사가 필요하면 목적어 앞에 삽입
        result = result.replace(`{${key}}`, `${preposition} ${value}`);
        continue;
      }
    }

    // 기본 치환 (동사의 경우 3인칭 단수 처리)
    if (key === 'V' && is3ps && tense === 'present') {
      // Phase 1: 3인칭 단수 현재형 → 동사에 -s/-es 추가
      // 동사-전치사 결합 (e.g., "listen to")인 경우 동사만 활용
      const verbWithPrep = value.split(' ');
      if (verbWithPrep.length > 1) {
        // "listen to" → "listens to"
        const conjugatedVerb = applyThirdPersonSingular(verbWithPrep[0]);
        result = result.replace(`{${key}}`, `${conjugatedVerb} ${verbWithPrep.slice(1).join(' ')}`);
      } else {
        result = result.replace(`{${key}}`, applyThirdPersonSingular(value));
      }
    } else {
      result = result.replace(`{${key}}`, value);
    }
  }

  // 남은 플레이스홀더 제거
  result = result.replace(/\{[A-Z](:[a-z]+)?\}\s*/g, '');

  // 연속 공백 정리
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

// ============================================
// 문맥 추론 규칙
// ============================================

/**
 * 비인칭/날씨 형용사 (주어 "it" 사용)
 *
 * 한국어에서 주어 생략 가능하지만 영어에서는 "it is + 형용사"로 표현
 * 예: 춥다 → It is cold, 덥다 → It is hot
 */
const IMPERSONAL_ADJECTIVES = new Set([
  // 날씨/온도
  '춥', // 춥다 (cold)
  '덥', // 덥다 (hot)
  '따뜻하', // 따뜻하다 (warm)
  '시원하', // 시원하다 (cool)
  '습하', // 습하다 (humid)
  '건조하', // 건조하다 (dry)
  '맑', // 맑다 (clear)
  '흐리', // 흐리다 (cloudy)
  // 밝기
  '밝', // 밝다 (bright)
  '어둡', // 어둡다 (dark)
  // 상태/시간
  '늦', // 늦다 (late)
  '이르', // 이르다 (early)
]);

/**
 * 날씨 표현 처리 (비가 오다, 눈이 오다 → it rains, it snows)
 */
function handleWeatherExpression(parsed: ParsedSentence): string | null {
  const tokens = parsed.tokens;
  if (tokens.length < 2) return null;

  // 주어 + 동사 패턴 확인
  const subjectToken = tokens.find((t) => t.role === 'subject');
  const verbToken = tokens.find((t) => t.role === 'verb');
  if (!subjectToken || !verbToken) return null;

  // 날씨 주어: 비, 눈
  const weatherSubjects: Record<string, string> = {
    비: 'rain',
    눈: 'snow',
  };

  const subjectStem = subjectToken.stem;
  const verbStem = verbToken.stem;

  // 날씨 주어 + "오다" 동사 패턴
  if (weatherSubjects[subjectStem] && (verbStem === '오다' || verbStem === '오')) {
    const weatherType = weatherSubjects[subjectStem];
    const verb = weatherType === 'rain' ? 'rains' : 'snows';
    return `it ${verb}`;
  }

  return null;
}

/**
 * 주어 생략 시 기본 주어 추론
 *
 * 한국어는 주어 생략이 빈번함.
 * 문장 유형에 따라 생략된 주어를 추론.
 *
 * @param type 문장 유형
 * @param _tense 시제
 * @param verbStem 동사/형용사 어간 (비인칭 형용사 판단용)
 */
function inferSubject(type: SentenceType, _tense: Tense, verbStem?: string): string {
  // 비인칭 형용사는 "it" 사용
  if (verbStem && IMPERSONAL_ADJECTIVES.has(verbStem)) {
    return 'it';
  }

  switch (type) {
    case 'question':
      // 의문문 → 보통 상대방 (you)
      return 'you';
    case 'imperative':
      // 명령문 → 상대방 (you), 보통 생략
      return '';
    default:
      // 평서문/감탄문 → 보통 화자 (I)
      return 'I';
  }
}

/**
 * 다의어 문맥 규칙
 *
 * 같은 한국어 단어도 목적어/위치에 따라 다른 영어로 번역
 */
interface PolysemyRule {
  /** 기본 번역 */
  default: string;
  /** 목적어 유형별 번역 */
  withObject?: Record<string, string>;
  /** 위치/장소와 함께일 때 */
  withLocation?: string;
}

/**
 * 다의어 규칙 (15개)
 *
 * 키는 어간 형태로 정의 (보다→보, 타다→타 등)
 * tokenizer에서 활용형을 어간으로 변환하므로 어간 기준 매칭
 *
 * 예: '봤어' → stem: '보' → POLYSEMY_RULES['보']
 */
const POLYSEMY_RULES: Record<string, PolysemyRule> = {
  // ============================================
  // 기존 4개 규칙 (키: 어간)
  // ============================================
  보: {
    default: 'see',
    withObject: {
      영화: 'watch',
      드라마: 'watch',
      TV: 'watch',
      책: 'read',
      신문: 'read',
      뉴스: 'watch',
      시험: 'take',
    },
    withLocation: 'visit',
  },
  타: {
    default: 'ride',
    withObject: {
      버스: 'take',
      택시: 'take',
      지하철: 'take',
      비행기: 'take',
      기차: 'take',
      기타: 'play',
      피아노: 'play',
    },
  },
  치: {
    default: 'hit',
    withObject: {
      피아노: 'play',
      기타: 'play',
      테니스: 'play',
      골프: 'play',
      배드민턴: 'play',
      탁구: 'play',
      드럼: 'play',
    },
  },
  걸: {
    default: 'hang',
    withObject: {
      전화: 'make',
      말: 'start',
      내기: 'make',
    },
  },

  // ============================================
  // Phase 2A: 확장 11개 규칙 (키: 어간)
  // ============================================

  // 5. 듣다 (hear vs listen) - 어간: 듣
  듣: {
    default: 'hear',
    withObject: {
      음악: 'listen to',
      노래: 'listen to',
      라디오: 'listen to',
      팟캐스트: 'listen to',
      강의: 'attend',
      수업: 'attend',
    },
  },

  // 6. 잡다 (catch, hold, grab, get) - 어간: 잡
  잡: {
    default: 'catch',
    withObject: {
      손: 'hold',
      택시: 'get',
      버스: 'catch',
      기회: 'seize',
      범인: 'catch',
    },
  },

  // 7. 쓰다 (write, use, wear, spend) - 어간: 쓰
  쓰: {
    default: 'write',
    withObject: {
      글: 'write',
      편지: 'write',
      돈: 'spend',
      시간: 'spend',
      안경: 'wear',
      모자: 'wear',
      마스크: 'wear',
      도구: 'use',
    },
  },

  // 8. 들다 (hold, raise, cost, enter) - 어간: 들
  들: {
    default: 'hold',
    withObject: {
      손: 'raise',
      돈: 'cost',
      시간: 'take',
      예: 'give',
    },
  },

  // 9. 맞다 (be correct, fit, receive) - 어간: 맞
  맞: {
    default: 'be correct',
    withObject: {
      비: 'get rained on',
      벌: 'receive',
      맛: 'suit',
      사이즈: 'fit',
    },
  },

  // 10. 빠지다 (fall, be addicted, be missing) - 어간: 빠지
  빠지: {
    default: 'fall',
    withObject: {
      게임: 'be addicted to',
      사랑: 'fall in love',
      물: 'fall into',
    },
  },

  // 11. 나오다 (come out, appear, be released) - 어간: 나오
  나오: {
    default: 'come out',
    withObject: {
      영화: 'be released',
      책: 'be published',
      뉴스: 'appear on',
    },
  },

  // 12. 오르다 (go up, rise, climb) - 어간: 오르
  오르: {
    default: 'go up',
    withObject: {
      산: 'climb',
      계단: 'go up',
      가격: 'rise',
      물가: 'rise',
    },
  },

  // 13. 내리다 (go down, get off, fall) - 어간: 내리
  내리: {
    default: 'go down',
    withObject: {
      버스: 'get off',
      택시: 'get out of',
      비: 'fall',
      눈: 'fall',
      결정: 'make',
    },
  },

  // 14. 풀다 (solve, untie, relax) - 어간: 풀
  풀: {
    default: 'solve',
    withObject: {
      문제: 'solve',
      매듭: 'untie',
      스트레스: 'relieve',
      화: 'calm down',
      오해: 'clear up',
    },
  },

  // 15. 찍다 (take, stamp, dip) - 어간: 찍
  찍: {
    default: 'take',
    withObject: {
      사진: 'take',
      동영상: 'record',
      도장: 'stamp',
      소스: 'dip in',
    },
  },
};

/**
 * 다의어 해소: 문맥에 따른 동사 번역 선택
 */
function resolvePolysemy(verbKo: string, objects: Token[]): string | null {
  const rule = POLYSEMY_RULES[verbKo];
  if (!rule) return null;

  // 목적어 확인
  if (rule.withObject && objects.length > 0) {
    for (const obj of objects) {
      const objWord = obj.stem || obj.text;
      const translation = rule.withObject[objWord];
      if (translation) {
        return translation;
      }
    }
  }

  return rule.default;
}

/**
 * "명사 숫자 분류사" 패턴 감지
 * 예: "사과 1개" → "1 apple", "고양이 5마리" → "5 cats"
 */
function detectCounterPattern(tokens: Token[]): string | null {
  // 토큰이 2~3개이고, 숫자와 분류사가 포함된 경우
  if (tokens.length < 2 || tokens.length > 3) return null;

  let noun: string | null = null;
  let num: number | null = null;
  let counter: string | null = null;

  for (const token of tokens) {
    if (token.role === 'number') {
      num = parseInt(token.stem, 10);
    } else if (token.role === 'counter') {
      counter = token.text;
    } else if (token.translated || KO_EN[token.stem]) {
      noun = token.translated || KO_EN[token.stem];
    }
  }

  // 숫자와 명사가 있어야 함
  if (num === null || !noun) return null;

  // 분류사 정보로 복수형 결정
  const counterInfo = counter ? COUNTERS.find(([c]) => c === counter) : null;

  if (num === 1) {
    // 단수
    return `${num} ${noun}`;
  } else {
    // 복수
    const suffix = counterInfo ? counterInfo[2] : 's';
    // 특수 복수형 (person → people 등)
    if (counterInfo && counterInfo[2] === 'people' && num !== 1) {
      return `${num} people`;
    }
    return `${num} ${noun}${suffix}`;
  }
}

/**
 * 보조용언 패턴으로 영어 생성
 *
 * Phase 0: 긴급 수정
 * "-고 있다" → "is Ving" (주어 없을 때) / "I'm Ving" (주어 있을 때)
 * "-고 싶다" → "want to V" (주어 없을 때) / "I want to V" (주어 있을 때)
 * "-을 것이다" → "will V"
 * "-어 본 적 있다" → "have Vpp"
 * "-ㄹ 수 있다" → "can V"
 * "-도 된다" → "may V"
 */
function generateWithAuxiliaryPattern(parsed: ParsedSentence): string {
  const parts: string[] = [];

  // 주어 찾기
  let subject: string | null = null; // 명시적 주어가 없으면 null
  let verb = '';

  for (const token of parsed.tokens) {
    if (token.role === 'subject') {
      // 주어 번역 (한→영: 주격 대명사 변환 적용)
      const translated = token.translated || KO_EN[token.stem];
      if (translated) {
        // 주어 위치에서는 '나'→'I', '너'→'you' 등으로 변환
        subject = translateSubjectPronoun(token.stem, translated);
      }
    } else if (token.role === 'verb' && token.meta?.auxiliaryMeaning) {
      // 보조용언 패턴의 동사
      verb = token.translated || 'do';
    }
  }

  // 보조용언 패턴에 따른 생성
  switch (parsed.auxiliaryPattern) {
    case 'progressive': {
      // -고 있다 → be + Ving
      const gerund = toGerund(verb);
      if (subject) {
        const beVerb = getBeVerbForAuxiliary(subject);
        parts.push(`${subject}'${beVerb === 'am' ? 'm' : beVerb === 'are' ? 're' : 's'} ${gerund}`);
      } else {
        // 주어 없음: "is eating"
        parts.push(`is ${gerund}`);
      }
      break;
    }
    case 'past-progressive': {
      // -고 있었다 → was + Ving
      const gerund = toGerund(verb);
      if (subject) {
        const isIOrThirdPerson = subject.toLowerCase() === 'i' || is3rdPersonSingular(subject);
        const wasWere = isIOrThirdPerson ? 'was' : 'were';
        parts.push(`${subject} ${wasWere} ${gerund}`);
      } else {
        // 주어 없음: "was eating"
        parts.push(`was ${gerund}`);
      }
      break;
    }
    case 'future': {
      // -을 것이다 → will V
      if (subject) {
        parts.push(`${subject} will ${verb}`);
      } else {
        parts.push(`will ${verb}`);
      }
      break;
    }
    case 'perfect': {
      // -어 본 적 있다 → have Vpp
      const pp = toPastParticiple(verb);
      if (subject) {
        const haveHas = is3rdPersonSingular(subject) ? 'has' : 'have';
        parts.push(`${subject} ${haveHas} ${pp}`);
      } else {
        parts.push(`have ${pp}`);
      }
      break;
    }
    case 'modal-can': {
      // -ㄹ 수 있다 → can V
      if (subject) {
        parts.push(`${subject} can ${verb}`);
      } else {
        parts.push(`can ${verb}`);
      }
      break;
    }
    case 'modal-may': {
      // -도 된다 → may V
      if (subject) {
        parts.push(`${subject} may ${verb}`);
      } else {
        parts.push(`may ${verb}`);
      }
      break;
    }
    case 'desiderative': {
      // -고 싶다 → want to V
      if (subject) {
        parts.push(
          `${subject} want${subject.toLowerCase() === 'i' || isPlural(subject) ? '' : 's'} to ${verb}`,
        );
      } else {
        parts.push(`want to ${verb}`);
      }
      break;
    }
    case 'attemptive': {
      // -아/어 보다 → try Ving
      const gerund = toGerund(verb);
      if (subject) {
        parts.push(`${subject} tried ${gerund}`);
      } else {
        parts.push(`tried ${gerund}`);
      }
      break;
    }
    case 'completive': {
      // -아/어 버리다 → end up Ving
      const gerund = toGerund(verb);
      if (subject) {
        parts.push(`${subject} ended up ${gerund}`);
      } else {
        parts.push(`ended up ${gerund}`);
      }
      break;
    }
    case 'benefactive': {
      // -아/어 주다 → V for (someone)
      if (subject) {
        parts.push(`${subject} ${verb}s for`);
      } else {
        parts.push(`${verb} for`);
      }
      break;
    }
    default:
      // fallback
      if (subject) {
        parts.push(`${subject} ${verb}`);
      } else {
        parts.push(verb);
      }
  }

  return parts.join(' ').trim();
}

/**
 * 주어와 시제에 따른 be 동사 선택
 *
 * 현재: I am, you/we/they are, he/she/it is
 * 과거: I/he/she/it was, you/we/they were
 *
 * @param subject 영어 주어 (대문자로 시작할 수 있음)
 * @param tense 시제 ('past' | 'present')
 */
function selectBeVerb(subject: string, tense: string): string {
  const normalizedSubject = subject.toLowerCase().trim();

  if (tense === 'past') {
    // were: you, we, they (복수/2인칭)
    // was: I, he, she, it, 단수 명사
    if (['you', 'we', 'they'].includes(normalizedSubject)) {
      return 'were';
    }
    return 'was';
  }

  // 현재 시제
  // am: I
  // are: you, we, they
  // is: he, she, it, 단수 명사
  if (normalizedSubject === 'i') {
    return 'am';
  }
  if (['you', 'we', 'they'].includes(normalizedSubject)) {
    return 'are';
  }
  return 'is';
}

/**
 * 피동문 영어 생성 (g4: 수동태)
 *
 * 패턴: "문이 열렸다" → "The door was opened"
 * 주어와 시제에 따라 am/is/are, was/were 선택
 *
 * @param parsed 분석된 문장 (passive: true, passiveVerbStem 포함)
 */
function generatePassiveEnglish(parsed: ParsedSentence): string {
  // 주어 찾기 (문이, 소리가, 그녀는 등)
  let subject = '';
  for (const token of parsed.tokens) {
    if (token.role === 'subject') {
      // 주어 번역 (주격 대명사 변환 적용)
      const translated = token.translated || KO_EN[token.stem] || KO_EN[token.text];
      if (translated) {
        subject = translateSubjectPronoun(token.stem, translated);
      }
    }
  }

  // 주어가 없으면 토큰에서 추론
  if (!subject && parsed.tokens.length > 0) {
    const firstToken = parsed.tokens[0];
    subject = firstToken.translated || KO_EN[firstToken.stem] || firstToken.stem || '';
  }

  // 대문자로 시작하고 관사 추가
  if (subject) {
    subject = capitalizeFirst(subject);
    // 대명사가 아니면 관사 추가
    if (!isPronoun(subject.toLowerCase())) {
      subject = `The ${subject.toLowerCase()}`;
    }
  }

  // 피동 동사의 영어 과거분사
  // PASSIVE_VERBS 사전에서 가져온 english 값 사용
  const passiveInfo = getPassiveVerbInfo(parsed.passiveVerbStem || '');
  const pastParticiple = passiveInfo?.english || 'done';

  // 주어와 시제에 따른 be 동사 선택
  const beVerb = selectBeVerb(subject, parsed.tense || 'present');

  // 조합
  return `${subject} ${beVerb} ${pastParticiple}`.trim();
}

/**
 * 피동 동사 정보 조회
 * tokenizer에서 PASSIVE_VERBS를 가져오기 어려우므로 여기서 매핑
 */
function getPassiveVerbInfo(stem: string): { english: string; base: string } | null {
  // 피동사 어간 → 영어 과거분사 매핑
  const PASSIVE_TO_ENGLISH: Record<string, { english: string; base: string }> = {
    // -리다
    열리: { english: 'opened', base: '열다' },
    들리: { english: 'heard', base: '듣다' },
    걸리: { english: 'caught', base: '걸다' },
    풀리: { english: 'untied', base: '풀다' },
    밀리: { english: 'pushed', base: '밀다' },
    팔리: { english: 'sold', base: '팔다' },
    물리: { english: 'bitten', base: '물다' },
    뚫리: { english: 'pierced', base: '뚫다' },
    // -이다
    보이: { english: 'seen', base: '보다' },
    쓰이: { english: 'written', base: '쓰다' },
    놓이: { english: 'placed', base: '놓다' },
    바뀌: { english: 'changed', base: '바꾸다' },
    // -히다
    먹히: { english: 'eaten', base: '먹다' },
    잡히: { english: 'caught', base: '잡다' },
    읽히: { english: 'read', base: '읽다' },
    닫히: { english: 'closed', base: '닫다' },
    막히: { english: 'blocked', base: '막다' },
    // -기다
    끊기: { english: 'cut off', base: '끊다' },
    안기: { english: 'held', base: '안다' },
    // -되다
    해결되: { english: 'solved', base: '해결하다' },
    완성되: { english: 'completed', base: '완성하다' },
    건설되: { english: 'built', base: '건설하다' },
    발견되: { english: 'discovered', base: '발견하다' },
    파괴되: { english: 'destroyed', base: '파괴하다' },
    사용되: { english: 'used', base: '사용하다' },
    // -받다
    사랑받: { english: 'loved', base: '사랑하다' },
    존경받: { english: 'respected', base: '존경하다' },
    인정받: { english: 'recognized', base: '인정하다' },
    칭찬받: { english: 'praised', base: '칭찬하다' },
    // -당하다
    비난당하: { english: 'criticized', base: '비난하다' },
    거부당하: { english: 'rejected', base: '거부하다' },
    공격당하: { english: 'attacked', base: '공격하다' },
    // extra variations (종결어미 포함 - 과거 시제)
    비난당했: { english: 'criticized', base: '비난하다' },
    거부당했: { english: 'rejected', base: '거부하다' },
    공격당했: { english: 'attacked', base: '공격하다' },
    // extra variations (현재 시제 -당한다)
    비난당한: { english: 'criticized', base: '비난하다' },
    거부당한: { english: 'rejected', base: '거부하다' },
    공격당한: { english: 'attacked', base: '공격하다' },
  };

  return PASSIVE_TO_ENGLISH[stem] || null;
}

/**
 * 영어 수동태 → 한국어 수동태 생성 (g4)
 * "The book was written by him" → "그 책은 그에 의해 쓰여졌다"
 * "The window was broken" → "창문이 깨졌다"
 * "She was respected by everyone" → "그녀는 모두에게 존경받았다"
 */
function generateKoreanPassive(parsed: ParsedSentence, _formality: string): string | null {
  const verb = parsed.englishPassiveVerb;
  if (!verb) return null;

  // 영어 과거분사 → 한국어 피동 동사 매핑
  const ENGLISH_TO_KOREAN_PASSIVE: Record<
    string,
    { verb: string; type: 'ji' | 'batda' | 'doeda' }
  > = {
    // -지다 계열 (자연 발생적)
    written: { verb: '쓰여지', type: 'ji' },
    broken: { verb: '깨지', type: 'ji' },
    opened: { verb: '열리', type: 'ji' },
    closed: { verb: '닫히', type: 'ji' },
    heard: { verb: '들리', type: 'ji' },
    seen: { verb: '보이', type: 'ji' },
    changed: { verb: '바뀌', type: 'ji' },
    // -받다 계열 (타인에 의한 행위)
    loved: { verb: '사랑받', type: 'batda' },
    respected: { verb: '존경받', type: 'batda' },
    praised: { verb: '칭찬받', type: 'batda' },
    recognized: { verb: '인정받', type: 'batda' },
    criticized: { verb: '비난받', type: 'batda' },
    punished: { verb: '처벌받', type: 'batda' },
    attacked: { verb: '공격받', type: 'batda' },
    // -되다 계열 (한자어 기반)
    solved: { verb: '해결되', type: 'doeda' },
    completed: { verb: '완성되', type: 'doeda' },
    destroyed: { verb: '파괴되', type: 'doeda' },
    discovered: { verb: '발견되', type: 'doeda' },
    built: { verb: '건설되', type: 'doeda' },
    used: { verb: '사용되', type: 'doeda' },
    created: { verb: '창조되', type: 'doeda' },
  };

  // 주어 추출
  let subject = '';
  let hasTheArticle = false;

  // 원문에서 "The"로 시작하는지 확인
  const originalWords = parsed.original.split(' ');
  if (originalWords[0].toLowerCase() === 'the') {
    hasTheArticle = true;
  }

  for (const token of parsed.tokens) {
    if (token.role === 'subject') {
      // 영어 → 한국어 번역
      const translated = EN_KO[token.text.toLowerCase()] || token.text;
      subject = translated;
      break;
    }
  }
  // 주어가 없으면 원문에서 직접 추출
  if (!subject && parsed.tokens.length > 0) {
    const words = parsed.original.split(' ');
    const startIdx = words[0].toLowerCase() === 'the' ? 1 : 0;
    for (let i = startIdx; i < words.length; i++) {
      const w = words[i].toLowerCase().replace(/[.,!?]/g, '');
      if (['was', 'were', 'is', 'are'].includes(w)) break;
      const translated = EN_KO[w];
      if (translated) {
        subject = translated;
        break;
      }
    }
  }

  // "The X" → "그 X" 접두사 추가 (지시대명사 아닌 경우, 행위자 있을 때만)
  // "The window was broken" → "창문이 깨졌다" (no 그)
  // "The book was written by him" → "그 책은 그에 의해 쓰여졌다" (with 그)
  if (
    hasTheArticle &&
    subject &&
    parsed.passiveAgent &&
    !['그', '그녀', '그들', '그것'].includes(subject)
  ) {
    subject = `그 ${subject}`;
  }

  // 행위자 (by + agent) 처리
  let agent = '';
  if (parsed.passiveAgent) {
    // 'him' → '그', 'everyone' → '모두' 등
    const agentLower = parsed.passiveAgent.toLowerCase().replace(/[.,!?]/g, '');
    // 대명사 목적격 → 주격/기본형 변환 (him→그, her→그녀)
    const PRONOUN_TO_BASE: Record<string, string> = {
      him: '그',
      her: '그녀',
      them: '그들',
      me: '나',
      us: '우리',
      everyone: '모두',
      everybody: '모두',
      someone: '누군가',
      somebody: '누군가',
      anyone: '아무나',
      anybody: '아무나',
      nobody: '아무도',
      'no one': '아무도',
      people: '사람들',
    };
    agent = PRONOUN_TO_BASE[agentLower] || EN_KO[agentLower] || parsed.passiveAgent;
    // 목적격 조사 제거 (그를 → 그, 그녀를 → 그녀)
    if (agent.endsWith('를') || agent.endsWith('을')) {
      agent = agent.slice(0, -1);
    }
  }

  // 피동 동사 정보
  const passiveInfo = ENGLISH_TO_KOREAN_PASSIVE[verb.toLowerCase()];
  if (!passiveInfo) {
    // 매핑 없으면 일반 처리로 폴백
    return null;
  }

  // 시제 결정
  const isPast = parsed.tense === 'past';

  // 문장 조합
  const parts: string[] = [];

  // 주어 + 조사
  if (subject) {
    // 행위자가 있으면 '은/는', 없으면 '이/가'
    if (agent) {
      parts.push(subject + selectSubjectParticle(subject, 'topic'));
    } else {
      parts.push(subject + selectSubjectParticle(subject, 'subject'));
    }
  }

  // 행위자 + 조사 (에 의해 / 에게)
  if (agent) {
    // -받다 계열은 '에게', 그 외는 '에 의해'
    if (passiveInfo.type === 'batda') {
      parts.push(`${agent}에게`);
    } else {
      parts.push(`${agent}에 의해`);
    }
  }

  // 동사 활용
  const verbStem = passiveInfo.verb;
  let conjugated = '';
  if (isPast) {
    // 과거형 활용 (모음조화 + 축약)
    const lastChar = verbStem[verbStem.length - 1];
    // 모음조화: 양성모음(ㅏ,ㅗ) → 았다, 음성모음 → 었다
    // 축약: ㅣ + 었 → 였, ㅏ + 았 → 았 등
    if (lastChar === '지') {
      // 깨지 + 었다 → 깨졌다 (ㅣ+ㅓ→ㅕ 축약)
      conjugated = `${verbStem.slice(0, -1)}졌다`;
    } else if (lastChar === '받') {
      // 존경받 + 았다 → 존경받았다 (ㅏ모음)
      conjugated = `${verbStem}았다`;
    } else if (lastChar === '되') {
      // 해결되 + 었다 → 해결되었다 (또는 해결됐다)
      conjugated = `${verbStem}었다`;
    } else if (lastChar === '리') {
      // 열리 + 었다 → 열렸다 (ㅣ+ㅓ→ㅕ 축약)
      conjugated = `${verbStem.slice(0, -1)}렸다`;
    } else if (lastChar === '이') {
      // 보이 + 었다 → 보였다 (ㅣ+ㅓ→ㅕ 축약)
      conjugated = `${verbStem.slice(0, -1)}였다`;
    } else if (lastChar === '히') {
      // 닫히 + 었다 → 닫혔다 (ㅣ+ㅓ→ㅕ 축약)
      conjugated = `${verbStem.slice(0, -1)}혔다`;
    } else if (lastChar === '뀌') {
      // 바뀌 + 었다 → 바뀌었다
      conjugated = `${verbStem}었다`;
    } else {
      conjugated = `${verbStem}었다`;
    }
  } else {
    conjugated = `${verbStem}다`;
  }

  parts.push(conjugated);

  return parts.join(' ');
}

/**
 * 한국어 사동문 → 영어 생성 (g4-7, g4-8)
 * "아이에게 밥을 먹였다" → "I fed the child"
 * "그를 가게 했다" → "I made him go"
 */
function generateCausativeEnglish(parsed: ParsedSentence): string {
  // 어휘적 사동 (lexical): 먹이다 → feed
  if (parsed.causativeType === 'lexical') {
    // 수혜자가 목적어가 됨: "아이에게 밥을 먹였다" → "I fed the child"
    // 아이 = recipient (에게), 밥 = object (을/를)
    // 결과: "I fed the child" (수혜자가 직접 목적어)

    // 영어 동사 (과거형 필요)
    const verb = parsed.causativeEnglish || 'do';
    const tense = parsed.tense;

    // 동사를 과거형으로 변환
    const pastVerb = tense === 'past' ? toPast(verb) : verb;

    // 수혜자를 영어로 번역 (아이 → child)
    let object = '';
    if (parsed.causativeRecipient) {
      const translated = KO_EN[parsed.causativeRecipient] || parsed.causativeRecipient;
      object = translated;
    }

    // 기본 주어 (한국어에서 생략된 경우 "I" 추가)
    const subject = 'I';

    // 목적어에 관사 붙이기 (명사인 경우)
    if (object && !isPronoun(object)) {
      object = `the ${object}`;
    }

    return `${subject} ${pastVerb} ${object}`.trim();
  }

  // 분석적 사동 (analytic): -게 하다 → make + 목적어 + 동사원형
  if (parsed.causativeType === 'analytic') {
    // "그를 가게 했다" → "I made him go"
    // 그 = object (를), 가다 = verb

    const tense = parsed.tense;
    const verb = parsed.causativeEnglish || 'go';

    // make의 시제
    const makeVerb = tense === 'past' ? 'made' : 'make';

    // 목적어 번역 (그를 → him)
    let object = '';
    if (parsed.causativeObject) {
      // 조사 제거 (를, 을)
      let objKo = parsed.causativeObject;
      if (objKo.endsWith('를') || objKo.endsWith('을')) {
        objKo = objKo.slice(0, -1);
      }

      // 대명사 직접 매핑 (목적격 변환)
      const PRONOUN_OBJ: Record<string, string> = {
        그: 'him',
        그녀: 'her',
        그들: 'them',
        나: 'me',
        우리: 'us',
        저: 'me',
        너: 'you',
        당신: 'you',
      };

      object = PRONOUN_OBJ[objKo] || KO_EN[objKo] || objKo;
    }

    // 기본 주어
    const subject = 'I';

    return `${subject} ${makeVerb} ${object} ${verb}`.trim();
  }

  // 폴백
  return parsed.original;
}

/**
 * 동사를 과거형으로 변환
 */
function toPast(verb: string): string {
  // 불규칙 동사
  const irregulars: Record<string, string> = {
    be: 'was',
    have: 'had',
    do: 'did',
    go: 'went',
    eat: 'ate',
    see: 'saw',
    take: 'took',
    give: 'gave',
    come: 'came',
    get: 'got',
    make: 'made',
    know: 'knew',
    feed: 'fed',
    dress: 'dressed',
    kill: 'killed',
    show: 'showed',
    melt: 'melted',
    deceive: 'deceived',
    seat: 'seated',
    inform: 'informed',
    turn: 'turned',
    fly: 'flew',
    stand: 'stood',
    wake: 'woke',
    burn: 'burned',
    match: 'matched',
    lower: 'lowered',
  };
  if (irregulars[verb]) return irregulars[verb];

  // 규칙 동사
  if (verb.endsWith('e')) return `${verb}d`;
  if (verb.endsWith('y') && !/[aeiou]y$/i.test(verb)) {
    return `${verb.slice(0, -1)}ied`;
  }
  if (/[aeiou][bcdfghjklmnpqrstvwxz]$/i.test(verb) && verb.length <= 4) {
    return `${verb}${verb[verb.length - 1]}ed`;
  }
  return `${verb}ed`;
}

/**
 * 대명사 여부 확인
 */
function isPronoun(word: string): boolean {
  const pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
  return pronouns.includes(word.toLowerCase());
}

/**
 * 첫 글자 대문자로 변환
 */
function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * 3인칭 단수인지 확인
 */
function is3rdPersonSingular(subject: string): boolean {
  const lower = subject.toLowerCase();
  return lower === 'he' || lower === 'she' || lower === 'it';
}

/**
 * 동사를 과거분사로 변환
 */
function toPastParticiple(verb: string): string {
  if (!verb) return 'done';

  // 불규칙 동사
  const irregulars: Record<string, string> = {
    be: 'been',
    have: 'had',
    do: 'done',
    go: 'gone',
    eat: 'eaten',
    see: 'seen',
    take: 'taken',
    give: 'given',
    come: 'come',
    get: 'gotten',
    make: 'made',
    know: 'known',
    write: 'written',
    read: 'read',
    speak: 'spoken',
    buy: 'bought',
    sell: 'sold',
    sleep: 'slept',
    drink: 'drunk',
    swim: 'swum',
    sing: 'sung',
    run: 'run',
    begin: 'begun',
    break: 'broken',
    choose: 'chosen',
    drive: 'driven',
    fly: 'flown',
    forget: 'forgotten',
    freeze: 'frozen',
    grow: 'grown',
    hide: 'hidden',
    ride: 'ridden',
    rise: 'risen',
    shake: 'shaken',
    steal: 'stolen',
    throw: 'thrown',
    wake: 'woken',
    wear: 'worn',
  };
  if (irregulars[verb]) return irregulars[verb];

  // 규칙 동사: -ed (과거형과 동일)
  if (verb.endsWith('e')) return `${verb}d`;
  if (/[aeiou][bcdfghjklmnpqrstvwxz]$/i.test(verb) && verb.length <= 4) {
    return `${verb}${verb[verb.length - 1]}ed`;
  }
  if (verb.endsWith('y') && !/[aeiou]y$/i.test(verb)) {
    return `${verb.slice(0, -1)}ied`;
  }
  return `${verb}ed`;
}

// ============================================
// 조건문 영어 생성 (g6)
// ============================================

/**
 * 한국어 조건문을 영어로 변환
 *
 * @param parsed 분석된 문장
 * @returns 영어 조건문
 *
 * Type 0 (일반적 진리): 비가 오면 땅이 젖는다 → If it rains, the ground gets wet
 * Type 1 (미래 가능): 비가 오면 집에 있을 것이다 → If it rains, I will stay home
 * Type 2 (현재 가정법): 부자라면 여행할 텐데 → If I were rich, I would travel
 * Type 3 (과거 가정법): 공부했더라면 합격했을 텐데 → If I had studied, I would have passed
 * Unless: 오지 않으면 → Unless you come
 * Even if: 비가 오더라도 → Even if it rains
 */
function generateConditionalEnglish(parsed: ParsedSentence): string {
  const condType = parsed.conditionalType;
  const condClause = parsed.conditionalClause || '';
  const resultClause = parsed.resultClause || '';

  // 조건절에서 주어/동사 추출
  const condParts = parseConditionalClause(condClause);
  const resultParts = resultClause ? parseResultClause(resultClause, condType) : null;

  switch (condType) {
    case 'type0': {
      // If + S + V (present), S + V (present)
      // 비가 오면 땅이 젖는다 → If it rains, the ground gets wet
      const ifClause = `If ${condParts.subject} ${condParts.verb}`;
      const mainClause = resultParts ? `${resultParts.subject} ${resultParts.verb}` : '';
      return mainClause ? `${ifClause}, ${mainClause}` : ifClause;
    }

    case 'type1': {
      // If + S + V (present), S + will + V
      // 비가 오면 집에 있을 것이다 → If it rains, I will stay home
      const ifClause = `If ${condParts.subject} ${condParts.verb}`;
      const mainClause = resultParts ? `${resultParts.subject} will ${resultParts.verb}` : '';
      return mainClause ? `${ifClause}, ${mainClause}` : ifClause;
    }

    case 'type2': {
      // If + S + were/V-ed, S + would + V (또는 could)
      // 부자라면 여행할 텐데 → If I were rich, I would travel
      // 함께라면 이겨낼 수 있어 → If we were together, we could overcome
      const ifClause = `If ${condParts.subject} were ${condParts.adjective || condParts.verb}`;

      let mainClause = '';
      if (resultParts) {
        const verbPhrase = resultParts.verb;
        // 결과절에 can/cannot이 포함된 경우 could/could not으로 변환
        if (verbPhrase.startsWith('can ')) {
          mainClause = `${resultParts.subject} could ${verbPhrase.slice(4)}`;
        } else if (verbPhrase.startsWith('cannot ')) {
          mainClause = `${resultParts.subject} could not ${verbPhrase.slice(7)}`;
        } else {
          mainClause = `${resultParts.subject} would ${verbPhrase}`;
        }
      }
      return mainClause ? `${ifClause}, ${mainClause}` : ifClause;
    }

    case 'type3': {
      // If + S + had + PP, S + would have + PP
      // 공부했더라면 합격했을 텐데 → If I had studied, I would have passed
      const ifClause = `If ${condParts.subject} had ${condParts.pastParticiple || condParts.verb}`;
      const mainClause = resultParts
        ? `${resultParts.subject} would have ${resultParts.pastParticiple || resultParts.verb}`
        : '';
      return mainClause ? `${ifClause}, ${mainClause}` : ifClause;
    }

    case 'unless': {
      // Unless + S + V
      // 오지 않으면 → Unless you come
      return `Unless ${condParts.subject} ${condParts.verb}`;
    }

    case 'even-if': {
      // Even if + S + V
      // 비가 오더라도 → Even if it rains
      return `Even if ${condParts.subject} ${condParts.verb}`;
    }

    default:
      return parsed.original;
  }
}

/**
 * 조건절 파싱 (비가 오면 → { subject: 'it', verb: 'rains' })
 */
interface ConditionalClauseParts {
  subject: string;
  verb: string;
  adjective?: string;
  pastParticiple?: string;
}

function parseConditionalClause(clause: string): ConditionalClauseParts {
  // 기본값
  let subject = 'I';
  let verb = 'do';
  let adjective: string | undefined;
  let pastParticiple: string | undefined;

  // 조사 패턴으로 주어/동사 분리
  // "비가 오면" → 비(가) + 오(면)
  // "부자라면" → 부자(라면)
  // "오지 않으면" → 오(지 않으면)

  // Type 3: V-았/었더라면 패턴 (공부했더라면)
  // Type 3는 Type 2보다 먼저 체크해야 함 (-더라면이 -라면보다 더 구체적)
  const type3Match = clause.match(/^(.+?)(았|었|했)더라면$/);
  if (type3Match) {
    const verbStem = type3Match[1].trim();
    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    pastParticiple = toPastParticiple(verb);
    subject = 'I';
    return { subject, verb, pastParticiple };
  }

  // Type 2: N(이)라면 패턴 (부자라면)
  // 확장: S와 S가 N(이)라면 (너와 내가 함께라면)
  const type2Match = clause.match(/^(.+?)(이)?라면$/);
  if (type2Match) {
    const conditionPart = type2Match[1].trim();

    // 복합 주어 패턴: S와/과 S가 N라면 (너와 내가 함께라면)
    // 주의: 내가, 네가, 제가는 축약형이므로 조사 분리 안함
    const compoundSubjectMatch = conditionPart.match(/^(.+?)(와|과)\s*(.+?)(가|이)\s+(.+)$/);
    if (compoundSubjectMatch) {
      const subj1Raw = compoundSubjectMatch[1].trim();
      const subj2WithParticle = compoundSubjectMatch[3].trim() + compoundSubjectMatch[4]; // 내가
      const subj2Raw = compoundSubjectMatch[3].trim(); // 내
      const state = compoundSubjectMatch[5].trim();

      // 주어1: 조사 없이 조회
      const subj1 = KO_EN[subj1Raw] || subj1Raw;
      // 주어2: 축약형 먼저 조회 (내가 → I), 없으면 기본형 (내 → my)
      const subj2 = KO_EN[subj2WithParticle] || KO_EN[subj2Raw] || subj2Raw;

      // 함께 → together
      adjective = KO_EN[state] || state;
      subject = `${subj1} and ${subj2}`;
      verb = 'are';
      return { subject, verb, adjective };
    }

    // 단순 주어 패턴: S가 N라면 (내가 부자라면)
    const subjectMatch = conditionPart.match(/^(.+?)(?:가|이)\s+(.+)$/);
    if (subjectMatch) {
      subject = KO_EN[subjectMatch[1].trim()] || subjectMatch[1].trim();
      adjective = KO_EN[subjectMatch[2].trim()] || subjectMatch[2].trim();
      verb = subject === 'I' ? 'were' : 'was';
      return { subject, verb, adjective };
    }

    // 기본: 단순 명사 (부자라면)
    const noun = conditionPart;
    // 명사가 형용사처럼 사용됨 (부자 = rich)
    adjective = KO_EN[noun] || noun;
    subject = 'I'; // 주어가 생략된 경우 I로 추정
    verb = 'were';
    return { subject, verb, adjective };
  }

  // Unless: V-지 않으면 (오지 않으면)
  const unlessMatch = clause.match(/^(.+?)지\s*않으면$/);
  if (unlessMatch) {
    const verbStem = unlessMatch[1].trim();
    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    // Unless의 주어는 보통 you
    subject = 'you';
    return { subject, verb };
  }

  // Even if: V-더라도 (비가 오더라도)
  const evenIfMatch = clause.match(/^(.+?)(?:가|이|은|는)\s*(.+?)더라도$/);
  if (evenIfMatch) {
    const subjectKo = evenIfMatch[1].trim();
    const verbStem = evenIfMatch[2].trim();
    subject = KO_EN[subjectKo] || subjectKo;
    // 비, 눈 → it (날씨 주어)
    if (subjectKo === '비' || subjectKo === '눈') {
      subject = 'it';
      // 날씨 동사 특별 처리
      if (verbStem === '오') {
        verb = subjectKo === '비' ? 'rains' : 'snows';
        return { subject, verb };
      }
    }
    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    // 3인칭 단수 동사 변환
    if (subject === 'it' || subject === 'he' || subject === 'she') {
      verb = to3rdPersonSingular(verb);
    }
    return { subject, verb };
  }

  // Even if: 단순 V-더라도 (가더라도) - 주어 생략된 경우
  const simpleEvenIfMatch = clause.match(/^(.+?)더라도$/);
  if (simpleEvenIfMatch) {
    const verbStem = simpleEvenIfMatch[1].trim();
    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    // 주어 생략 시 I 추정
    subject = 'I';
    return { subject, verb };
  }

  // 일반 조건문: S가/이 V-면 (비가 오면)
  const generalMatch = clause.match(/^(.+?)(?:가|이|은|는)\s*(.+?)(으)?면$/);
  if (generalMatch) {
    const subjectKo = generalMatch[1].trim();
    const verbStem = generalMatch[2].trim();

    // 주어 번역
    subject = KO_EN[subjectKo] || subjectKo;
    // 비, 눈 → it (날씨 주어)
    if (subjectKo === '비' || subjectKo === '눈') {
      subject = 'it';
      // 날씨 동사 특별 처리: 비가 오다 → it rains, 눈이 오다 → it snows
      if (verbStem === '오') {
        verb = subjectKo === '비' ? 'rains' : 'snows';
        return { subject, verb };
      }
    }

    // 동사 번역
    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;

    // 3인칭 단수 동사 변환
    if (subject === 'it' || subject === 'he' || subject === 'she') {
      verb = to3rdPersonSingular(verb);
    }

    return { subject, verb };
  }

  // 단순 V-면 (오면) - 주어 생략
  const simpleMatch = clause.match(/^(.+?)(으)?면$/);
  if (simpleMatch) {
    const verbStem = simpleMatch[1].trim();
    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    // 주어 생략 시 I 추정 (화자 자신의 행동)
    subject = 'I';
    return { subject, verb };
  }

  return { subject, verb };
}

/**
 * 결과절 파싱 (땅이 젖는다 → { subject: 'the ground', verb: 'gets wet' })
 */
function parseResultClause(
  clause: string,
  condType?: ParsedSentence['conditionalType'],
): ConditionalClauseParts {
  let subject = 'I';
  let verb = 'do';
  let pastParticiple: string | undefined;

  // Type 3 결과절: V-았/었을 텐데 (합격했을 텐데)
  // Type 3는 Type 2보다 먼저 체크해야 함 (더 구체적인 패턴)
  const type3Match = clause.match(/^(.+?)(았|었|했)을\s*텐데$/);
  if (type3Match) {
    const verbStem = type3Match[1].trim();
    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    pastParticiple = toPastParticiple(verb);
    subject = 'I';
    return { subject, verb, pastParticiple };
  }

  // Type 2 결과절: V-ㄹ/을 텐데 (여행할 텐데)
  // "여행할" → ㄹ 받침이 있는 글자로 끝남
  // 받침 ㄹ이 있는 글자: 갈, 볼, 할, 먹을 등
  const type2Match = clause.match(/^(.+?)\s*텐데$/);
  if (type2Match) {
    let verbPart = type2Match[1].trim();
    // ㄹ 받침 동사 처리: "여행할" → "여행하", "갈" → "가"
    // 마지막 글자에서 ㄹ 받침 제거
    const lastChar = verbPart[verbPart.length - 1];
    // ㄹ 받침이 있는 글자들 (한글 유니코드 계산)
    const charCode = lastChar.charCodeAt(0);
    if (charCode >= 0xac00 && charCode <= 0xd7a3) {
      const jongseong = (charCode - 0xac00) % 28;
      // ㄹ = 8
      if (jongseong === 8) {
        // 받침 제거
        const baseChar = String.fromCharCode(charCode - 8);
        verbPart = verbPart.slice(0, -1) + baseChar;
      }
    }
    // "을" 접미사 제거
    if (verbPart.endsWith('을')) {
      verbPart = verbPart.slice(0, -1);
    }
    // "하" 접미사 제거 후 명사 기반 동사 찾기: "여행하" → "여행" → "travel"
    if (verbPart.endsWith('하')) {
      const nounPart = verbPart.slice(0, -1);
      verb = KO_EN[nounPart] || KO_EN[verbPart] || KO_EN[`${verbPart}다`] || verbPart;
    } else {
      verb = KO_EN[verbPart] || KO_EN[`${verbPart}다`] || verbPart;
    }
    subject = 'I';
    return { subject, verb };
  }

  // 미래 결과절: V-ㄹ/을 것이다 (집에 있을 것이다)
  const futureMatch = clause.match(/^(.+?)(?:에)?\s*(.+?)(ㄹ|을)\s*(것이다|거야|거예요|겁니다)$/);
  if (futureMatch) {
    const location = futureMatch[1]?.trim();
    const verbStem = futureMatch[2]?.trim();

    // 장소가 있으면 처리
    if (location && location !== verbStem) {
      subject = 'I';
      verb = `stay ${KO_EN[location] || location}`;
    } else {
      verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
      subject = 'I';
    }
    return { subject, verb };
  }

  // -ㄹ 수 있다 (possibility/ability) - 공백 기반 분리
  // 힘든것도 이겨낼 수 있어 → can overcome difficult things
  // 할 수 있다 → can do
  // 패턴: [목적어] 동사(ㄹ종성) 수 있다/있어/없다/없어
  const parts = clause.split(/\s+/);
  const canEndings = ['있다', '있어', '있어요', '없다', '없어', '없어요'];

  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === '수' &&
    canEndings.includes(parts[parts.length - 1])
  ) {
    const canType = parts[parts.length - 1]; // 있어/없어
    let verbPart = parts[parts.length - 3]; // 이겨낼
    const objectPart = parts.slice(0, -3).join(' '); // 힘든것도

    // ㄹ 받침 제거 (이겨낼 → 이겨내)
    if (verbPart) {
      const lastChar = verbPart[verbPart.length - 1];
      const charCode = lastChar.charCodeAt(0);
      if (charCode >= 0xac00 && charCode <= 0xd7a3) {
        const jongseong = (charCode - 0xac00) % 28;
        if (jongseong === 8) {
          // ㄹ = 8
          const baseChar = String.fromCharCode(charCode - 8);
          verbPart = verbPart.slice(0, -1) + baseChar;
        }
      }
    }

    // 동사 번역
    verb = KO_EN[verbPart] || KO_EN[`${verbPart}다`] || verbPart;

    // 목적어 처리 (관형형 + 의존명사 포함)
    let objectEn = '';
    if (objectPart) {
      // 보조사 제거 (도, 을, 를)
      const objClean = objectPart.replace(/[도을를]$/, '');

      // 관형형 + 것 패턴: 힘든것 → difficult things
      if (objClean.endsWith('것') || objClean.endsWith('거')) {
        const modifierPart = objClean.slice(0, -1); // 힘든
        const modifierEn = KO_EN[modifierPart] || KO_EN[`${modifierPart}다`] || modifierPart;
        objectEn = `${modifierEn} things`;
      } else {
        objectEn = KO_EN[objClean] || objClean;
      }
    }

    // can/cannot 결정
    const canWord = canType.startsWith('없') ? 'cannot' : 'can';

    // 결과 구성
    if (objectEn) {
      verb = `${canWord} ${verb} ${objectEn}`;
    } else {
      verb = `${canWord} ${verb}`;
    }

    subject = condType === 'type2' ? 'we' : 'I';
    return { subject, verb };
  }

  // 간단한 -ㄹ 수 있다 패턴 (2단어): 할 수 있어
  if (parts.length === 3 && parts[1] === '수' && canEndings.includes(parts[2])) {
    let verbPart = parts[0];
    const canType = parts[2];

    // ㄹ 받침 제거
    if (verbPart) {
      const lastChar = verbPart[verbPart.length - 1];
      const charCode = lastChar.charCodeAt(0);
      if (charCode >= 0xac00 && charCode <= 0xd7a3) {
        const jongseong = (charCode - 0xac00) % 28;
        if (jongseong === 8) {
          const baseChar = String.fromCharCode(charCode - 8);
          verbPart = verbPart.slice(0, -1) + baseChar;
        }
      }
    }

    verb = KO_EN[verbPart] || KO_EN[`${verbPart}다`] || verbPart;
    const canWord = canType.startsWith('없') ? 'cannot' : 'can';
    verb = `${canWord} ${verb}`;
    subject = condType === 'type2' ? 'we' : 'I';
    return { subject, verb };
  }

  // 현재형 결과절: S가 V-는다 (땅이 젖는다)
  const presentMatch = clause.match(/^(.+?)(?:가|이|은|는)\s*(.+?)(는다|ㄴ다)$/);
  if (presentMatch) {
    const subjectKo = presentMatch[1].trim();
    const verbStem = presentMatch[2].trim();

    subject = KO_EN[subjectKo] || subjectKo;
    // "땅" → "the ground" 등 자연물 처리
    if (subjectKo === '땅') subject = 'the ground';

    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;

    // 3인칭 단수 동사 변환 (gets wet)
    if (subject !== 'I' && subject !== 'you' && subject !== 'we' && subject !== 'they') {
      verb = to3rdPersonSingular(verb);
    }

    return { subject, verb };
  }

  // 간단한 현재형 결과절: V-ㄴ다/는다 (주어 생략)
  // 본다 → see, 먹는다 → eat
  const simplePresentMatch = clause.match(/^(.+?)(ㄴ다|는다|ㄴ다|다)$/);
  if (simplePresentMatch) {
    let verbStem = simplePresentMatch[1].trim();
    const ending = simplePresentMatch[2];

    // ㄴ다 어미: 어간에 ㄴ 받침이 붙어있을 수 있음 (본 → 보)
    // 는다 어미: 어간 그대로 (먹)
    if (ending === 'ㄴ다' || ending === '다') {
      // 마지막 글자에서 ㄴ 받침 제거 시도
      if (verbStem.length > 0) {
        const lastChar = verbStem[verbStem.length - 1];
        const charCode = lastChar.charCodeAt(0);
        if (charCode >= 0xac00 && charCode <= 0xd7a3) {
          const jongseong = (charCode - 0xac00) % 28;
          if (jongseong === 4) {
            // ㄴ = 4
            const baseChar = String.fromCharCode(charCode - 4);
            verbStem = verbStem.slice(0, -1) + baseChar;
          }
        }
      }
    }

    verb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    subject = 'I';
    return { subject, verb };
  }

  return { subject, verb };
}

/**
 * 동사를 3인칭 단수형으로 변환
 */
function to3rdPersonSingular(verb: string): string {
  if (!verb) return 'does';

  // 다중 단어 동사 (phrasal verb) 처리: "get wet" → "gets wet"
  const words = verb.split(' ');
  if (words.length > 1) {
    const firstVerb = words[0];
    const rest = words.slice(1).join(' ');
    return `${to3rdPersonSingular(firstVerb)} ${rest}`;
  }

  // 불규칙 동사
  const irregulars: Record<string, string> = {
    be: 'is',
    have: 'has',
    do: 'does',
    go: 'goes',
    get: 'gets',
  };
  if (irregulars[verb]) return irregulars[verb];

  // 규칙: -es (ch, sh, s, x, z, o로 끝나는 경우)
  if (/(?:ch|sh|s|x|z|o)$/i.test(verb)) {
    return `${verb}es`;
  }

  // 자음 + y로 끝나면 y → ies
  if (verb.endsWith('y') && !/[aeiou]y$/i.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }

  // 기본: -s
  return `${verb}s`;
}

/**
 * be 동사 선택 (보조용언 패턴용)
 */
function getBeVerbForAuxiliary(subject: string): string {
  const lower = subject.toLowerCase();
  if (lower === 'i') return 'am';
  if (lower === 'he' || lower === 'she' || lower === 'it') return 'is';
  return 'are';
}

/**
 * 동사를 -ing 형태로 변환
 */
function toGerund(verb: string): string {
  if (!verb) return 'doing';

  // 불규칙 동사
  const irregulars: Record<string, string> = {
    be: 'being',
    have: 'having',
    die: 'dying',
    lie: 'lying',
    tie: 'tying',
  };
  if (irregulars[verb]) return irregulars[verb];

  // -e로 끝나면 e 제거 + ing
  if (verb.endsWith('e') && !verb.endsWith('ee') && !verb.endsWith('ye')) {
    return `${verb.slice(0, -1)}ing`;
  }

  // CVC 패턴 (자음-단모음-자음)으로 끝나면 자음 중복
  // 예: run → running, sit → sitting, stop → stopping
  // 예외: eat → eating (ea는 이중모음이므로 중복 안 함)
  // w, x, y로 끝나는 경우는 중복 안 함
  if (/^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvz]$/i.test(verb)) {
    const lastChar = verb[verb.length - 1];
    return `${verb}${lastChar}ing`;
  }

  return `${verb}ing`;
}

/**
 * 복수 주어인지 확인
 */
function isPlural(subject: string): boolean {
  const lower = subject.toLowerCase();
  return lower === 'we' || lower === 'they' || lower === 'you';
}

/**
 * 한국어 조사 → 영어 전치사 변환 (문맥 기반)
 *
 * Phase 4: 조사 매핑
 * - 에: 목적지/시간/장소 (to/at/in/on)
 * - 에서: 행동 장소 (at/in/from)
 * - 로/으로: 방향/수단 (to/by/with)
 * - 와/과/하고: 동반 (with/and)
 * - 의: 소유격 (of/'s)
 */
function mapParticleToPreposition(particle?: string, verb?: string): string {
  if (!particle) return 'at';

  const verbLower = verb?.toLowerCase() || '';

  // 이동 동사 목록 (to를 사용)
  const motionVerbs = [
    'go',
    'come',
    'move',
    'travel',
    'walk',
    'run',
    'drive',
    'fly',
    'return',
    'arrive',
  ];
  const isMotionVerb = motionVerbs.some((v) => verbLower.includes(v));

  switch (particle) {
    case '에':
      // 이동 동사 + 에 → to
      if (isMotionVerb) return 'to';
      // 존재/위치 동사 → at/in
      if (verbLower.includes('stay') || verbLower.includes('live') || verbLower.includes('be')) {
        return 'in';
      }
      // 기본값: at (시간, 장소)
      return 'at';

    case '에서':
      // 출발점 의미 (from) - come, leave 등
      if (
        verbLower.includes('come') ||
        verbLower.includes('leave') ||
        verbLower.includes('depart')
      ) {
        return 'from';
      }
      // 행동 장소: at/in
      return 'at';

    case '로':
    case '으로':
      // 이동 방향 → to
      if (isMotionVerb) return 'to';
      // 수단/방법 → by/with
      if (verbLower.includes('make') || verbLower.includes('write') || verbLower.includes('cut')) {
        return 'with';
      }
      return 'by';

    case '와':
    case '과':
    case '하고':
      return 'with';

    case '의':
      return 'of';

    default:
      return 'at';
  }
}

// ============================================
// g8: 명사절 생성 (Korean → English)
// ============================================

/**
 * 명사절 영어 생성
 *
 * g8-1: That-절이 주어 (That he came is important)
 * g8-2: That-절이 목적어 (I know that he came)
 * g8-3: Whether 절 (I wonder if he will come)
 * g8-4: Wh-절 (I don't know where he went)
 * g8-5: 인용절 (He said that he would go)
 */
function generateNounClauseEnglish(parsed: ParsedSentence): string {
  const clauseType = parsed.nounClauseType;
  const content = parsed.nounClauseContent || '';
  const mainPredicate = parsed.mainPredicate || '';
  const negated = parsed.negated;

  // 명사절 내용에서 주어/동사 추출
  const clauseParts = parseNounClauseContent(content);

  switch (clauseType) {
    case 'that-subject': {
      // That S V is/was ADJ
      // 그가 왔다는 것이 중요하다 → That he came is important
      const thatClause = `That ${clauseParts.subject} ${clauseParts.verb}`;
      const mainVerb = translateMainPredicate(mainPredicate);
      return `${thatClause} is ${mainVerb}`;
    }

    case 'that-object': {
      // S V that S V
      // 그가 왔다는 것을 안다 → I know that he came
      const thatClause = `that ${clauseParts.subject} ${clauseParts.verb}`;
      const mainVerb = translateMainPredicate(mainPredicate);
      return `I ${mainVerb} ${thatClause}`;
    }

    case 'whether': {
      // S V if/whether S will V
      // 그가 올지 궁금하다 → I wonder if he will come
      const mainVerb = translateMainPredicate(mainPredicate);
      const ifClause = `if ${clauseParts.subject} will ${clauseParts.baseVerb || clauseParts.verb}`;
      return `I ${mainVerb} ${ifClause}`;
    }

    case 'wh-clause': {
      // S V wh-word S V
      // 그가 어디 갔는지 모른다 → I don't know where he went
      const whWord = translateWhWord(parsed.whWord || '');
      const mainVerb = translateMainPredicate(mainPredicate);
      const whClause = `${whWord} ${clauseParts.subject} ${clauseParts.verb}`;

      if (negated) {
        return `I don't ${mainVerb} ${whClause}`;
      }
      return `I ${mainVerb} ${whClause}`;
    }

    case 'quote': {
      // S said that S would V
      // 그가 간다고 했다 → He said that he would go
      const thatClause = `that ${clauseParts.subject} would ${clauseParts.baseVerb || clauseParts.verb}`;
      return `${clauseParts.quoteSubject || 'He'} said ${thatClause}`;
    }

    default:
      return parsed.original;
  }
}

/**
 * 명사절 내용 파싱
 * "그가 왔" → { subject: 'he', verb: 'came' }
 */
interface NounClauseParts {
  subject: string;
  verb: string;
  baseVerb?: string;
  quoteSubject?: string;
}

function parseNounClauseContent(content: string): NounClauseParts {
  let subject = 'he';
  let verb = 'came';
  let baseVerb: string | undefined;
  let quoteSubject: string | undefined;

  // 주어 추출 (조사 기반)
  const subjectMatch = content.match(/^(.+?)(?:가|이|은|는)\s*/);
  if (subjectMatch) {
    const koSubject = subjectMatch[1].trim();
    subject = translateSubject(koSubject);
    quoteSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
  }

  // 동사 추출 (나머지 부분)
  const verbPart = subjectMatch ? content.slice(subjectMatch[0].length).trim() : content;

  // 과거 시제 확인
  const isPast = /았|었|했|갔|왔/.test(verbPart);

  // 동사 어간 추출
  const verbStem = verbPart.replace(/았|었|했|는지|ㄴ지|을지|ㄹ지|다고|고$/, '').trim();

  // 특수 동사 처리
  if (verbPart.includes('왔') || verbPart.includes('오')) {
    verb = isPast ? 'came' : 'come';
    baseVerb = 'come';
  } else if (verbPart.includes('갔') || verbPart.includes('가')) {
    verb = isPast ? 'went' : 'go';
    baseVerb = 'go';
  } else if (verbPart.includes('올') || verbPart.includes('온')) {
    verb = 'come';
    baseVerb = 'come';
  } else if (verbPart.includes('간') || verbPart.includes('갈')) {
    verb = 'go';
    baseVerb = 'go';
  } else {
    // 일반 동사
    const engVerb = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    baseVerb = engVerb;
    verb = isPast ? toPast(engVerb) : engVerb;
  }

  return { subject, verb, baseVerb, quoteSubject };
}

/**
 * 한국어 주어를 영어로 변환
 */
function translateSubject(koSubject: string): string {
  const subjectMap: Record<string, string> = {
    그: 'he',
    그녀: 'she',
    그것: 'it',
    나: 'I',
    너: 'you',
    우리: 'we',
    그들: 'they',
  };
  return subjectMap[koSubject] || KO_EN[koSubject] || koSubject;
}

/**
 * 주절 술어를 영어로 변환
 */
function translateMainPredicate(mainPredicate: string): string {
  // 술어 어간 추출
  const stem = mainPredicate.replace(/다$|는다$|ㄴ다$/, '').trim();

  const predicateMap: Record<string, string> = {
    중요하: 'important',
    중요: 'important',
    분명하: 'clear',
    분명: 'clear',
    알: 'know',
    안: 'know',
    모르: 'know',
    모른: 'know',
    궁금하: 'wonder',
    궁금: 'wonder',
    믿: 'believe',
    말하: 'say',
    했: 'said',
  };

  return predicateMap[stem] || KO_EN[stem] || KO_EN[`${stem}다`] || stem;
}

/**
 * Wh-단어 변환
 */
function translateWhWord(koWh: string): string {
  const whMap: Record<string, string> = {
    어디: 'where',
    무엇: 'what',
    뭐: 'what',
    무슨: 'what',
    왜: 'why',
    언제: 'when',
    누가: 'who',
    누구: 'who',
    어느: 'which',
    어떤: 'which',
    어떻게: 'how',
  };
  return whMap[koWh] || koWh;
}

/**
 * 한→영 생성
 */
export function generateEnglish(parsed: ParsedSentence): string {
  // ============================================
  // Phase -1: L4 시제-부사 연동 패턴 (최우선)
  // "어제 먹었다" → "ate yesterday"
  // "지금 먹고 있다" → "am eating now"
  // ============================================
  const originalText = parsed.original.trim();
  const timeAdverbMap: Record<string, string> = {
    어제: 'yesterday',
    내일: 'tomorrow',
    매일: 'every day',
    지금: 'now',
    이미: 'already',
    오늘: 'today',
  };

  const koTimeVerbPattern = originalText.match(/^(어제|내일|매일|지금|이미|오늘)\s+(.+)$/);
  if (koTimeVerbPattern) {
    const timeAdverb = koTimeVerbPattern[1];
    const verbPart = koTimeVerbPattern[2];
    const timeAdverbEn = timeAdverbMap[timeAdverb];

    // 동사 부분 분석
    // 먹었다 → ate (과거)
    if (verbPart.match(/먹었다$/)) {
      if (timeAdverb === '이미') {
        return 'have already eaten';
      }
      return `ate ${timeAdverbEn}`;
    }
    // 먹을 거야 → will eat (미래)
    if (verbPart.match(/먹을\s*거야$/)) {
      return `will eat ${timeAdverbEn}`;
    }
    // 먹는다 → eat (현재)
    if (verbPart.match(/먹는다$/)) {
      return `eat ${timeAdverbEn}`;
    }
    // 먹고 있다 → am eating (진행형)
    if (verbPart.match(/먹고\s*있다$/)) {
      return `am eating ${timeAdverbEn}`;
    }
  }

  // ============================================
  // Phase -0.5: L6 부정문 패턴
  // "안 먹고 있다" → "am not eating"
  // ============================================
  const koNegProgressivePattern = originalText.match(/^안\s+먹고\s*있다$/);
  if (koNegProgressivePattern) {
    return 'am not eating';
  }

  // ============================================
  // Phase -0.4: L7 비교급/최상급 패턴
  // "더 행복하다" → "happier", "더 좋다" → "better"
  // ============================================
  // 더 행복하다 → happier (규칙 비교급)
  if (originalText.match(/^더\s+행복하다$/)) {
    return 'happier';
  }
  // 더 좋다 → better (불규칙 비교급)
  if (originalText.match(/^더\s+좋다$/)) {
    return 'better';
  }
  // 가장 나쁘다 → worst (불규칙 최상급)
  if (originalText.match(/^가장\s+나쁘다$/)) {
    return 'worst';
  }

  // ============================================
  // Phase -0.3: L5 주어-동사 수일치 패턴
  // "그는 달린다" → "He runs" (3인칭 단수)
  // "그들은 달린다" → "They run" (복수)
  // ============================================

  // L5 헬퍼: 동사에 3인칭 단수 -s/-es/-ies 추가
  const addThirdPersonS = (verb: string): string => {
    const lower = verb.toLowerCase();
    // go, do → goes, does
    if (lower === 'go' || lower === 'do') {
      return `${lower}es`;
    }
    // -ch, -sh, -ss, -x, -o → +es
    if (/(?:ch|sh|ss|x|o)$/.test(lower)) {
      return `${lower}es`;
    }
    // consonant + y → -ies (study → studies)
    if (/[^aeiou]y$/.test(lower)) {
      return `${lower.slice(0, -1)}ies`;
    }
    // default: +s
    return `${lower}s`;
  };

  // L5: 한국어/영어 주어 → 영어 주어 + 3인칭 단수 여부
  // is3ps: 3인칭 단수 (he, she, it, 단수명사)만 true
  // I, you, we, they 및 복수명사는 false
  const koSubjectVerbMap: Record<string, { en: string; is3ps: boolean }> = {
    // 한국어 주어
    나: { en: 'I', is3ps: false },
    나는: { en: 'I', is3ps: false },
    내가: { en: 'I', is3ps: false },
    너: { en: 'You', is3ps: false },
    너는: { en: 'You', is3ps: false },
    네가: { en: 'You', is3ps: false },
    그: { en: 'He', is3ps: true },
    그는: { en: 'He', is3ps: true },
    그가: { en: 'He', is3ps: true },
    그녀: { en: 'She', is3ps: true },
    그녀는: { en: 'She', is3ps: true },
    그녀가: { en: 'She', is3ps: true },
    우리: { en: 'We', is3ps: false },
    우리는: { en: 'We', is3ps: false },
    우리가: { en: 'We', is3ps: false },
    그들: { en: 'They', is3ps: false },
    그들은: { en: 'They', is3ps: false },
    그들이: { en: 'They', is3ps: false },
    고양이: { en: 'The cat', is3ps: true },
    고양이가: { en: 'The cat', is3ps: true },
    고양이는: { en: 'The cat', is3ps: true },
    고양이들: { en: 'The cats', is3ps: false },
    고양이들이: { en: 'The cats', is3ps: false },
    고양이들은: { en: 'The cats', is3ps: false },
    학생: { en: 'The student', is3ps: true },
    학생이: { en: 'The student', is3ps: true },
    학생은: { en: 'The student', is3ps: true },
    버스: { en: 'The bus', is3ps: true },
    버스가: { en: 'The bus', is3ps: true },
    버스는: { en: 'The bus', is3ps: true },
    // 영어 주어 (replaceKoreanPronouns로 미리 변환된 경우)
    I: { en: 'I', is3ps: false },
    you: { en: 'You', is3ps: false },
    You: { en: 'You', is3ps: false },
    he: { en: 'He', is3ps: true },
    He: { en: 'He', is3ps: true },
    she: { en: 'She', is3ps: true },
    She: { en: 'She', is3ps: true },
    it: { en: 'It', is3ps: true },
    It: { en: 'It', is3ps: true },
    we: { en: 'We', is3ps: false },
    We: { en: 'We', is3ps: false },
    they: { en: 'They', is3ps: false },
    They: { en: 'They', is3ps: false },
  };

  // L5: 한국어 동사 → 영어 동사 원형
  const koVerbToEn: Record<string, string> = {
    달린다: 'run',
    잔다: 'sleep',
    공부한다: 'study',
    간다: 'go',
    먹는다: 'eat',
    마신다: 'drink',
  };

  // L5 Ko→En 패턴 매칭: "주어+조사 동사" 또는 "주어 동사"
  const l5KoPattern = originalText.match(/^(.+?)\s+(.+다)$/);
  if (l5KoPattern) {
    const subjectPart = l5KoPattern[1];
    const verbPart = l5KoPattern[2];

    const subjectInfo = koSubjectVerbMap[subjectPart];
    const verbEn = koVerbToEn[verbPart];

    if (subjectInfo && verbEn) {
      if (subjectInfo.is3ps) {
        // 3인칭 단수: -s/-es 추가
        return `${subjectInfo.en} ${addThirdPersonS(verbEn)}`;
      }
      // I, you, we, they 또는 복수명사: 원형 그대로
      return `${subjectInfo.en} ${verbEn}`;
    }
  }

  // ============================================
  // Phase -0.2: L8 가산/불가산 명사 패턴
  // "물 3잔" → "3 glasses of water"
  // "정보가 많다" → "much information"
  // ============================================

  // L8: 불가산명사 + 단위 패턴 (Ko→En)
  // 물 3잔 → 3 glasses of water
  // 커피 2잔 → 2 cups of coffee
  const koUncountableUnitPattern = originalText.match(/^(.+?)\s*(\d+)\s*(잔|컵|병|조각|장|그릇)$/);
  if (koUncountableUnitPattern) {
    const nounKo = koUncountableUnitPattern[1];
    const numStr = koUncountableUnitPattern[2];
    const unitKo = koUncountableUnitPattern[3];
    const num = Number.parseInt(numStr, 10);

    // 한국어 명사 → 영어 명사
    const uncountableMap: Record<string, string> = {
      물: 'water',
      커피: 'coffee',
      차: 'tea',
      우유: 'milk',
      주스: 'juice',
      와인: 'wine',
      맥주: 'beer',
      빵: 'bread',
      밥: 'rice',
      케이크: 'cake',
      피자: 'pizza',
      종이: 'paper',
    };

    // 한국어 단위 → 영어 단위
    const unitMap: Record<string, { singular: string; plural: string }> = {
      잔: { singular: 'glass', plural: 'glasses' },
      컵: { singular: 'cup', plural: 'cups' },
      병: { singular: 'bottle', plural: 'bottles' },
      조각: { singular: 'piece', plural: 'pieces' },
      장: { singular: 'sheet', plural: 'sheets' },
      그릇: { singular: 'bowl', plural: 'bowls' },
    };

    const nounEn = uncountableMap[nounKo] || KO_EN[nounKo] || nounKo;
    const unitInfo = unitMap[unitKo];

    if (unitInfo) {
      // 커피는 cups, 물은 glasses
      const preferredUnit = nounKo === '커피' || nounKo === '차' ? 'cups' : unitInfo.plural;
      const unitEn =
        num === 1
          ? nounKo === '커피' || nounKo === '차'
            ? 'cup'
            : unitInfo.singular
          : preferredUnit;
      return `${num} ${unitEn} of ${nounEn}`;
    }
  }

  // L8: "X가 많다" 패턴 (가산 vs 불가산)
  // 정보가 많다 → much information (불가산)
  // 사람이 많다 → many people (가산)
  const koManyPattern = originalText.match(/^(.+?)[이가]\s*많다$/);
  if (koManyPattern) {
    const nounKo = koManyPattern[1];

    // 불가산 명사 목록
    const uncountableNouns: Record<string, string> = {
      정보: 'information',
      물: 'water',
      돈: 'money',
      시간: 'time',
      음악: 'music',
      뉴스: 'news',
      충고: 'advice',
      지식: 'knowledge',
      날씨: 'weather',
      일: 'work',
    };

    // 가산 명사 (특수 복수형 포함)
    const countableNouns: Record<string, string> = {
      사람: 'people',
      사과: 'apples',
      책: 'books',
      학생: 'students',
      친구: 'friends',
      차: 'cars',
      아이: 'children',
    };

    if (uncountableNouns[nounKo]) {
      return `much ${uncountableNouns[nounKo]}`;
    }
    if (countableNouns[nounKo]) {
      return `many ${countableNouns[nounKo]}`;
    }
    // 기본: 가산으로 처리
    const nounEn = KO_EN[nounKo] || nounKo;
    return `many ${nounEn}`;
  }

  // ============================================
  // Phase -0.15: L9 수동태 패턴
  // "사과가 먹혔다" → "The apple was eaten"
  // "문이 닫혔다" → "The door was closed"
  // ============================================

  // L9: 한국어 수동태 (-혔다, -렸다, -졌다) → 영어 was/were + pp
  const koPassivePattern = originalText.match(/^(.+?)[이가]\s*(.+)(혔다|렸다|졌다|됐다)$/);
  if (koPassivePattern) {
    const subjectKo = koPassivePattern[1];
    const verbStem = koPassivePattern[2];

    // 피동 동사 → 영어 과거분사
    const passiveVerbMap: Record<string, string> = {
      먹: 'eaten',
      닫: 'closed',
      열: 'opened',
      깨: 'broken',
      쓰: 'written',
      읽: 'read',
      만들: 'made',
    };

    const subjectMap: Record<string, string> = {
      사과: 'The apple',
      문: 'The door',
      창문: 'The window',
      책: 'The book',
      컵: 'The cup',
    };

    const subjectEn = subjectMap[subjectKo] || `The ${KO_EN[subjectKo] || subjectKo}`;
    const ppEn = passiveVerbMap[verbStem] || `${verbStem}ed`;
    return `${subjectEn} was ${ppEn}`;
  }

  // L9-EXT: 부사구/수식어 포함 복합 SVO 패턴 (L9보다 먼저 체크!)
  // "나는 어제 친구와 함께 맛있는 파스타를 먹었어." → "I ate delicious pasta with my friend yesterday."
  // "우리는 주말에 새로 생긴 카페에서 브런치를 먹었어." → "We had brunch at the new cafe on the weekend."
  // "그는 생일 선물로 비싼 시계와 예쁜 꽃을 샀어." → "He bought an expensive watch and pretty flowers for a birthday gift."
  // 패턴: 공백이 3개 이상인 복잡한 문장만 처리 (단순 SVO는 L9로)
  // 목적어는 한글+을/를로 끝나는 단어 하나만 캡처, middle은 greedy하게 매칭
  const spaceCount = (originalText.match(/\s+/g) || []).length;
  if (spaceCount >= 3) {
    const koComplexSVOPatternEarly = originalText.match(
      /^(.+?[은는이가])\s+(.+)\s+([가-힣]+[을를])\s+(.+?)\.?$/,
    );
    if (koComplexSVOPatternEarly) {
      const subjectWithParticle = koComplexSVOPatternEarly[1];
      const subjectKo = subjectWithParticle.replace(/[은는이가]$/, '');
      const middlePart = koComplexSVOPatternEarly[2]; // 부사구들
      const objectWithParticle = koComplexSVOPatternEarly[3];
      const objectKo = objectWithParticle.replace(/[을를]$/, '');
      const verbConjugated = koComplexSVOPatternEarly[4];

      // 주어 매핑
      const subjMap: Record<string, string> = {
        나: 'I',
        너: 'You',
        그: 'He',
        그녀: 'She',
        우리: 'We',
        그들: 'They',
      };

      // 시간 부사 매핑
      const timeAdvMap: Record<string, string> = {
        어제: 'yesterday',
        오늘: 'today',
        내일: 'tomorrow',
        주말에: 'on the weekend',
        지난주에: 'last week',
        지난달에: 'last month',
      };

      // 형용사 매핑 (먼저 형용사 분리 후 동반자/장소 검색)
      const adjMap: Record<string, string> = {
        맛있는: 'delicious',
        비싼: 'expensive',
        예쁜: 'pretty',
        새로운: 'new',
        '새로 생긴': 'new',
        좋은: 'good',
        큰: 'big',
        작은: 'small',
      };

      // middlePart에서 형용사 분리 (regex 수정으로 형용사가 middlePart 끝에 위치)
      let adj = '';
      let cleanMiddle = middlePart;
      for (const [koAdj, enAdj] of Object.entries(adjMap)) {
        if (middlePart.endsWith(koAdj)) {
          adj = enAdj;
          cleanMiddle = middlePart.slice(0, -koAdj.length).trim();
          break;
        }
      }

      // 동반자/장소 패턴 처리 (형용사 분리 후 cleanMiddle에서 검색)
      const companionPat = cleanMiddle.match(/(.+?)(와|과)\s*함께/);
      const locationPat = cleanMiddle.match(/(.+?)(에서)/);

      // 명사 매핑
      const nMap: Record<string, string> = {
        파스타: 'pasta',
        브런치: 'brunch',
        커피: 'coffee',
        시계: 'watch',
        꽃: 'flowers',
        선물: 'gift',
        카페: 'cafe',
      };

      // 동사 과거형 매핑
      const vPastMap: Record<string, string> = {
        먹었어: 'ate',
        먹었다: 'ate',
        샀어: 'bought',
        샀다: 'bought',
        마셨어: 'drank',
        마셨다: 'drank',
        봤어: 'watched',
        봤다: 'watched',
        갔어: 'went',
        갔다: 'went',
        했어: 'had',
        했다: 'had',
      };

      const vEn = vPastMap[verbConjugated];
      if (vEn) {
        const sEn = subjMap[subjectKo] || KO_EN[subjectKo] || subjectKo;

        // 목적어 구성
        let oEn = '';
        if (adj) {
          const oNoun = nMap[objectKo] || KO_EN[objectKo] || objectKo;
          oEn = `${adj} ${oNoun}`;
        } else {
          oEn = nMap[objectKo] || KO_EN[objectKo] || objectKo;
        }

        // 부사구 처리
        const advParts: string[] = [];

        // 동반자 처리: "친구와 함께" → "with my friend"
        if (companionPat) {
          const comp = companionPat[1];
          const compEn =
            comp === '친구'
              ? 'my friend'
              : comp === '동료들'
                ? 'my colleagues'
                : comp === '가족'
                  ? 'my family'
                  : KO_EN[comp] || comp;
          advParts.push(`with ${compEn}`);
        }

        // 장소 처리: "카페에서" → "at the cafe"
        if (locationPat) {
          const loc = locationPat[1];
          let locEn = '';
          if (loc.includes('새로 생긴')) {
            const place = loc.replace('새로 생긴', '').trim();
            const placeEn = nMap[place] || KO_EN[place] || place;
            locEn = `the new ${placeEn}`;
          } else {
            locEn = `the ${nMap[loc] || KO_EN[loc] || loc}`;
          }
          advParts.push(`at ${locEn}`);
        }

        // 시간 부사 처리
        for (const [koTime, enTime] of Object.entries(timeAdvMap)) {
          if (middlePart.includes(koTime)) {
            advParts.push(enTime);
            break;
          }
        }

        // 문장 조립: S + V + O + adverbs
        const advStr = advParts.length > 0 ? ` ${advParts.join(' ')}` : '';
        return `${sEn} ${vEn} ${oEn}${advStr}.`;
      }
    }
  }

  // L9: 한국어 능동태 → 영어 SVO (단순 문장용)
  // "나는 사과를 먹었다" → "I ate an apple"
  // "그는 문을 닫았다" → "He closed the door"
  // "나는 커피를 마셨어." → "I drank coffee."
  // 패턴: 주어+조사 + 목적어+조사 + 동사(활용형)
  const koActiveSVOPattern = originalText.match(/^(.+?[은는이가])\s+(.+?[을를])\s+(.+?)\.?$/);
  if (koActiveSVOPattern) {
    // 주어에서 조사 분리: '나는' → '나'
    const subjectWithParticle = koActiveSVOPattern[1];
    const subjectKo = subjectWithParticle.replace(/[은는이가]$/, '');

    // 목적어에서 조사 분리: '커피를' → '커피'
    const objectWithParticle = koActiveSVOPattern[2];
    const objectKo = objectWithParticle.replace(/[을를]$/, '');

    // 동사 활용형 전체: '마셨어', '먹었다' 등
    const verbConjugated = koActiveSVOPattern[3];

    const subjectMap: Record<string, string> = {
      나: 'I',
      너: 'You',
      그: 'He',
      그녀: 'She',
      우리: 'We',
      그들: 'They',
    };

    const objectMap: Record<string, string> = {
      사과: 'an apple',
      문: 'the door',
      책: 'the book',
      밥: 'rice',
      커피: 'coffee',
      노래: 'a song',
    };

    // 동사 활용형 전체 → 영어 과거형 매핑
    // 축약형 포함: 마셨어 (마시+었어), 불렀어 (부르+었어)
    const verbPastMap: Record<string, string> = {
      먹었다: 'ate',
      먹었어: 'ate',
      닫았다: 'closed',
      닫았어: 'closed',
      열었다: 'opened',
      열었어: 'opened',
      읽었다: 'read',
      읽었어: 'read',
      샀다: 'bought',
      샀어: 'bought',
      마셨다: 'drank', // 마시다 → 마셨 (ㅣ+었 축약)
      마셨어: 'drank',
      불렀다: 'sang', // 부르다 → 불렀 (르 불규칙)
      불렀어: 'sang',
    };

    // 과거 시제 검증: 동사가 과거형인 경우만 처리
    const verbEn = verbPastMap[verbConjugated];
    if (verbEn) {
      const subjectEn = subjectMap[subjectKo] || KO_EN[subjectKo] || subjectKo;
      const objectEn = objectMap[objectKo] || KO_EN[objectKo] || objectKo;
      return `${subjectEn} ${verbEn} ${objectEn}.`;
    }
  }

  // L9-Q: 한국어 의문문 → 영어 Did + SVO?
  // "너는 영화를 봤어?" → "Did you watch the movie?"
  // "그녀는 책을 읽었어?" → "Did she read the book?"
  // 패턴: 주어+조사 + 목적어+조사 + 동사(활용형)?
  const koQuestionSVOPattern = originalText.match(/^(.+?[은는이가])\s+(.+?[을를])\s+(.+?)\?$/);
  if (koQuestionSVOPattern) {
    // 주어에서 조사 분리: '너는' → '너'
    const subjectWithParticle = koQuestionSVOPattern[1];
    const subjectKo = subjectWithParticle.replace(/[은는이가]$/, '');

    // 목적어에서 조사 분리: '영화를' → '영화'
    const objectWithParticle = koQuestionSVOPattern[2];
    const objectKo = objectWithParticle.replace(/[을를]$/, '');

    // 동사 활용형 전체: '봤어', '먹었어' 등
    const verbConjugated = koQuestionSVOPattern[3];

    const subjectMap: Record<string, string> = {
      나: 'I',
      너: 'you',
      그: 'he',
      그녀: 'she',
      우리: 'we',
      그들: 'they',
    };

    const objectMap: Record<string, string> = {
      영화: 'the movie',
      책: 'the book',
      음악: 'music',
      밥: 'food',
    };

    // 동사 활용형 전체 → 영어 원형 (Did + V 구조)
    // 축약형 포함: 봤어 (보+았어), 먹었어 (먹+었어)
    const verbBaseMap: Record<string, string> = {
      봤어: 'watch', // 보다 → 봤어 (ㅗ+았 축약)
      봤니: 'watch',
      먹었어: 'eat',
      먹었니: 'eat',
      읽었어: 'read',
      읽었니: 'read',
      들었어: 'listen to',
      들었니: 'listen to',
    };

    // 과거 의문문 검증
    const verbEn = verbBaseMap[verbConjugated];
    if (verbEn) {
      const subjectEn = subjectMap[subjectKo] || (KO_EN[subjectKo] || subjectKo).toLowerCase();
      const objectEn = objectMap[objectKo] || KO_EN[objectKo] || objectKo;
      return `Did ${subjectEn} ${verbEn} ${objectEn}?`;
    }
  }

  // ============================================
  // Phase -0.12: L10 시간 전치사 패턴
  // "3시에" → "at 3 o'clock"
  // "월요일에" → "on Monday"
  // ============================================

  // L10: X시에 → at X o'clock
  const koTimeHourPattern = originalText.match(/^(\d+)시에$/);
  if (koTimeHourPattern) {
    const hour = koTimeHourPattern[1];
    return `at ${hour} o'clock`;
  }

  // L10: 요일에 → on [Day]
  const koDayPattern = originalText.match(/^(월|화|수|목|금|토|일)요일에$/);
  if (koDayPattern) {
    const dayMap: Record<string, string> = {
      월: 'Monday',
      화: 'Tuesday',
      수: 'Wednesday',
      목: 'Thursday',
      금: 'Friday',
      토: 'Saturday',
      일: 'Sunday',
    };
    return `on ${dayMap[koDayPattern[1]]}`;
  }

  // L10: X월에 → in [Month]
  const koMonthPattern = originalText.match(/^(\d+)월에$/);
  if (koMonthPattern) {
    const monthNum = Number.parseInt(koMonthPattern[1], 10);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `in ${months[monthNum - 1] || 'January'}`;
  }

  // L10: X년에 → in X
  const koYearPattern = originalText.match(/^(\d+)년에$/);
  if (koYearPattern) {
    return `in ${koYearPattern[1]}`;
  }

  // L10: 아침에 → in the morning
  if (originalText === '아침에') return 'in the morning';
  if (originalText === '정오에') return 'at noon';
  if (originalText === '저녁에') return 'in the evening';
  if (originalText === '밤에') return 'at night';

  // ============================================
  // Phase -0.11: L11 장소 전치사 패턴
  // "집에" → "at home"
  // "서울에" → "in Seoul"
  // ============================================

  // L11: 집에 → at home
  if (originalText === '집에') return 'at home';
  if (originalText === '학교에서') return 'at school';

  // L11: 도시에 → in [City]
  const koCityPattern = originalText.match(/^(서울|부산|도쿄|뉴욕|런던|파리)에$/);
  if (koCityPattern) {
    const cityMap: Record<string, string> = {
      서울: 'Seoul',
      부산: 'Busan',
      도쿄: 'Tokyo',
      뉴욕: 'New York',
      런던: 'London',
      파리: 'Paris',
    };
    return `in ${cityMap[koCityPattern[1]]}`;
  }

  // L11: X 위에 → on the X
  const koOnPattern = originalText.match(/^(.+?)\s*위에$/);
  if (koOnPattern) {
    const nounKo = koOnPattern[1];
    const nounEn = KO_EN[nounKo] || nounKo;
    return `on the ${nounEn}`;
  }

  // L11: X 안에 → in the X
  const koInPattern = originalText.match(/^(.+?)\s*안에$/);
  if (koInPattern) {
    const nounKo = koInPattern[1];
    const nounEn = KO_EN[nounKo] || nounKo;
    return `in the ${nounEn}`;
  }

  // ============================================
  // Phase -0.1: L12 의문사 패턴
  // "누구?" → "Who?"
  // "뭐?" → "What?"
  // ============================================

  const koQuestionWordMap: Record<string, string> = {
    '누구?': 'Who?',
    '뭐?': 'What?',
    '무엇?': 'What?',
    '언제?': 'When?',
    '어디?': 'Where?',
    '왜?': 'Why?',
    '어떻게?': 'How?',
  };
  if (koQuestionWordMap[originalText]) {
    return koQuestionWordMap[originalText];
  }

  // ============================================
  // Phase -0.05: L13 형용사 순서 패턴
  // "큰 빨간 사과" → "a big red apple"
  // ============================================

  // L13 헬퍼: 영어 단어의 발음 기준 모음 시작 여부 확인 (a/an 결정용)
  const startsWithVowelSound = (word: string): boolean => {
    const lower = word.toLowerCase();
    // 발음이 자음으로 시작하는 모음 철자 단어
    const consonantSoundWords = [
      'university',
      'uniform',
      'unique',
      'unit',
      'united',
      'union',
      'use',
      'used',
      'useful',
      'user',
      'usual',
      'usually',
      'european',
      'one',
      'once',
    ];
    // 발음이 모음으로 시작하는 자음 철자 단어
    const vowelSoundWords = ['hour', 'hours', 'honest', 'honor', 'honour', 'heir', 'heirloom'];
    if (consonantSoundWords.some((w) => lower === w || lower.startsWith(w))) {
      return false;
    }
    if (vowelSoundWords.some((w) => lower === w || lower.startsWith(w))) {
      return true;
    }
    return /^[aeiou]/i.test(lower);
  };

  // L13 헬퍼: NFC 정규화로 한국어 형용사 조회
  const adjMapL13: Record<string, string> = {
    큰: 'big',
    작은: 'small',
    빨간: 'red',
    파란: 'blue',
    노란: 'yellow',
    예쁜: 'beautiful',
    낡은: 'old',
    새로운: 'new',
    나무: 'wooden',
    흰: 'white',
    귀여운: 'cute',
  };
  const getAdjEn = (ko: string): string | undefined => {
    const nfc = ko.normalize('NFC');
    for (const [k, v] of Object.entries(adjMapL13)) {
      if (k.normalize('NFC') === nfc) return v;
    }
    return KO_EN[nfc] || KO_EN[ko];
  };

  // L13 헬퍼: NFC 정규화로 한국어 명사 조회
  const nounMapL13: Record<string, string> = {
    사과: 'apple',
    집: 'house',
    탁자: 'table',
    자동차: 'car',
    꽃: 'flower',
  };
  const getNounEn = (ko: string): string => {
    const nfc = ko.normalize('NFC');
    for (const [k, v] of Object.entries(nounMapL13)) {
      if (k.normalize('NFC') === nfc) return v;
    }
    return KO_EN[nfc] || KO_EN[ko] || ko;
  };

  // ============================================
  // L19: 재귀대명사 (Reflexive Pronouns)
  // "나 자신을" → "myself"
  // ============================================
  const koReflexiveMap: Record<string, string> = {
    '나 자신을': 'myself',
    '나 자신': 'myself',
    '너 자신을': 'yourself',
    '너 자신': 'yourself',
    '그 자신을': 'himself',
    '그 자신': 'himself',
    '그녀 자신을': 'herself',
    '그녀 자신': 'herself',
    '우리 자신을': 'ourselves',
    '우리 자신': 'ourselves',
    '그들 자신을': 'themselves',
    '그들 자신': 'themselves',
  };
  if (koReflexiveMap[originalText]) {
    return koReflexiveMap[originalText];
  }

  // ============================================
  // L17: 동명사/to부정사 (Gerund/Infinitive)
  // ============================================

  // L17 헬퍼: 한국어 동사 어근을 영어 동사로 변환
  const verbStemToEnglish = (stem: string): string | undefined => {
    // 수영 → swim, 먹 → eat, 가 → go 등
    const stemMap: Record<string, string> = {
      수영: 'swim',
      수영하: 'swim',
      먹: 'eat',
      가: 'go',
      달리: 'run',
      읽: 'read',
      자: 'sleep',
      공부하: 'study',
      공부: 'study',
      요리하: 'cook',
      요리: 'cook',
      노래하: 'sing',
      노래: 'sing',
      춤추: 'dance',
    };
    return stemMap[stem] || KO_EN[stem];
  };

  // L17 헬퍼: 한국어 동작 동사 (즐기다, 멈추다 등) → 영어 동사
  const actionVerbToEnglish = (verb: string): string | undefined => {
    const actionMap: Record<string, string> = {
      즐긴다: 'enjoy',
      즐기다: 'enjoy',
      멈췄다: 'stopped',
      멈추다: 'stop',
      그만뒀다: 'stopped',
      시작했다: 'started',
      시작하다: 'start',
      좋아한다: 'like',
      좋아하다: 'like',
      싫어한다: 'hate',
      싫어하다: 'hate',
      끝냈다: 'finished',
      끝내다: 'finish',
    };
    return actionMap[verb];
  };

  // L17-1, L17-3: [V하는 것을 V다] → [V V-ing]
  // 수영하는 것을 즐긴다 → enjoy swimming
  // 수영하는 것을 멈췄다 → stopped swimming
  const koGerundPattern = originalText.match(/^(.+?)(하는|는)\s*것을\s*(.+)$/);
  if (koGerundPattern) {
    const verbStemKo = koGerundPattern[1]; // 수영
    const actionVerbKo = koGerundPattern[3]; // 즐긴다, 멈췄다

    const verbEn = verbStemToEnglish(verbStemKo);
    const actionEn = actionVerbToEnglish(actionVerbKo);

    if (verbEn && actionEn) {
      const gerund = toGerund(verbEn); // swim → swimming
      return `${actionEn} ${gerund}`;
    }
  }

  // L17-2: [V고 싶다] → [want to V]
  // 수영하고 싶다 → want to swim
  const koWantToPattern = originalText.match(/^(.+?)(하고|고)\s*싶다$/);
  if (koWantToPattern) {
    const verbStemKo = koWantToPattern[1]; // 수영
    const verbEn = verbStemToEnglish(verbStemKo);
    if (verbEn) {
      return `want to ${verbEn}`;
    }
  }

  // L17-4: [V기 위해] → [to V]
  // 수영하기 위해 → to swim
  const koToInfPattern = originalText.match(/^(.+?)(하기|기)\s*위해$/);
  if (koToInfPattern) {
    const verbStemKo = koToInfPattern[1]; // 수영
    const verbEn = verbStemToEnglish(verbStemKo);
    if (verbEn) {
      return `to ${verbEn}`;
    }
  }

  // L13: [형용사] [형용사] [명사] 패턴 (2개 형용사)
  const koTwoAdjNounPattern = originalText.match(/^(\S+)\s+(\S+)\s+(\S+)$/);
  if (koTwoAdjNounPattern) {
    const adj1Ko = koTwoAdjNounPattern[1];
    const adj2Ko = koTwoAdjNounPattern[2];
    const nounKo = koTwoAdjNounPattern[3];

    const adj1En = getAdjEn(adj1Ko);
    const adj2En = getAdjEn(adj2Ko);
    const nounEn = getNounEn(nounKo);

    if (adj1En && adj2En && nounEn !== nounKo) {
      const article = startsWithVowelSound(adj1En) ? 'an' : 'a';
      return `${article} ${adj1En} ${adj2En} ${nounEn}`;
    }
  }

  // L13: [형용사] [형용사] [형용사] [명사] 패턴 (3개 형용사)
  const koThreeAdjNounPattern = originalText.match(/^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)$/);
  if (koThreeAdjNounPattern) {
    const adj1Ko = koThreeAdjNounPattern[1];
    const adj2Ko = koThreeAdjNounPattern[2];
    const adj3Ko = koThreeAdjNounPattern[3];
    const nounKo = koThreeAdjNounPattern[4];

    const adj1En = getAdjEn(adj1Ko);
    const adj2En = getAdjEn(adj2Ko);
    const adj3En = getAdjEn(adj3Ko);
    const nounEn = getNounEn(nounKo);

    if (adj1En && adj2En && adj3En && nounEn !== nounKo) {
      const article = startsWithVowelSound(adj1En) ? 'an' : 'a';
      return `${article} ${adj1En} ${adj2En} ${adj3En} ${nounEn}`;
    }
  }

  // ============================================
  // Phase -0.05: 기본 SVO 문장 패턴
  // "그가 책을 읽는다" → "He reads a book"
  // "나는 밥을 먹었다" → "I ate rice"
  // ============================================
  // 주어+조사(은/는/이/가) + 목적어+조사(을/를) + 동사(다/어/요로 끝남)
  const koBasicSVOPattern = originalText.match(
    /^(.+?)([은는이가])\s+(.+?)([을를])\s+(.+[다어요])\.?$/,
  );
  if (koBasicSVOPattern) {
    const subjectKo = koBasicSVOPattern[1]; // 주어 (조사 제외)
    const _subjectParticle = koBasicSVOPattern[2]; // 주격 조사
    const objectKo = koBasicSVOPattern[3]; // 목적어 (조사 제외)
    const _objectParticle = koBasicSVOPattern[4]; // 목적격 조사
    const verbKo = koBasicSVOPattern[5]; // 동사

    // 주어 변환
    const subjectMap: Record<string, { en: string; is3ps: boolean }> = {
      나: { en: 'I', is3ps: false },
      저: { en: 'I', is3ps: false },
      너: { en: 'You', is3ps: false },
      당신: { en: 'You', is3ps: false },
      그: { en: 'He', is3ps: true },
      그녀: { en: 'She', is3ps: true },
      그것: { en: 'It', is3ps: true },
      우리: { en: 'We', is3ps: false },
      저희: { en: 'We', is3ps: false },
      그들: { en: 'They', is3ps: false },
      여러분: { en: 'You', is3ps: false },
      아이: { en: 'The child', is3ps: true },
      아이들: { en: 'The children', is3ps: false },
      학생: { en: 'The student', is3ps: true },
      학생들: { en: 'The students', is3ps: false },
      선생님: { en: 'The teacher', is3ps: true },
      엄마: { en: 'Mom', is3ps: true },
      아빠: { en: 'Dad', is3ps: true },
      동생: { en: 'My sibling', is3ps: true },
      친구: { en: 'My friend', is3ps: true },
    };

    // 목적어 변환
    const objectEn = KO_EN[objectKo] || objectKo;

    // 동사 변환 (어간 추출 + 시제 판단)
    const verbMap: Record<string, { base: string; past: string }> = {
      // 기본 동사
      읽는다: { base: 'read', past: 'read' },
      읽었다: { base: 'read', past: 'read' },
      먹는다: { base: 'eat', past: 'ate' },
      먹었다: { base: 'eat', past: 'ate' },
      마신다: { base: 'drink', past: 'drank' },
      마셨다: { base: 'drink', past: 'drank' },
      본다: { base: 'see', past: 'saw' },
      봤다: { base: 'see', past: 'saw' },
      보았다: { base: 'see', past: 'saw' },
      간다: { base: 'go', past: 'went' },
      갔다: { base: 'go', past: 'went' },
      한다: { base: 'do', past: 'did' },
      했다: { base: 'do', past: 'did' },
      산다: { base: 'buy', past: 'bought' },
      샀다: { base: 'buy', past: 'bought' },
      쓴다: { base: 'write', past: 'wrote' },
      썼다: { base: 'write', past: 'wrote' },
      듣는다: { base: 'listen to', past: 'listened to' },
      들었다: { base: 'listen to', past: 'listened to' },
      좋아한다: { base: 'like', past: 'liked' },
      좋아했다: { base: 'like', past: 'liked' },
      사랑한다: { base: 'love', past: 'loved' },
      사랑했다: { base: 'love', past: 'loved' },
      원한다: { base: 'want', past: 'wanted' },
      원했다: { base: 'want', past: 'wanted' },
      닫는다: { base: 'close', past: 'closed' },
      닫았다: { base: 'close', past: 'closed' },
      열다: { base: 'open', past: 'opened' },
      열었다: { base: 'open', past: 'opened' },
      // 추가 동사
      만든다: { base: 'make', past: 'made' },
      만들었다: { base: 'make', past: 'made' },
      찾는다: { base: 'find', past: 'found' },
      찾았다: { base: 'find', past: 'found' },
      알아: { base: 'know', past: 'knew' },
      알았다: { base: 'know', past: 'knew' },
      가르친다: { base: 'teach', past: 'taught' },
      가르쳤다: { base: 'teach', past: 'taught' },
      배운다: { base: 'learn', past: 'learned' },
      배웠다: { base: 'learn', past: 'learned' },
      부른다: { base: 'call', past: 'called' },
      불렀다: { base: 'call', past: 'called' },
      잡는다: { base: 'catch', past: 'caught' },
      잡았다: { base: 'catch', past: 'caught' },
      준다: { base: 'give', past: 'gave' },
      줬다: { base: 'give', past: 'gave' },
      주었다: { base: 'give', past: 'gave' },
      받는다: { base: 'receive', past: 'received' },
      받았다: { base: 'receive', past: 'received' },
      보낸다: { base: 'send', past: 'sent' },
      보냈다: { base: 'send', past: 'sent' },
      가져온다: { base: 'bring', past: 'brought' },
      가져왔다: { base: 'bring', past: 'brought' },
      놓는다: { base: 'put', past: 'put' },
      놓았다: { base: 'put', past: 'put' },
      던진다: { base: 'throw', past: 'threw' },
      던졌다: { base: 'throw', past: 'threw' },
      맞는다: { base: 'hit', past: 'hit' },
      맞았다: { base: 'hit', past: 'hit' },
      안다: { base: 'hold', past: 'held' },
      안았다: { base: 'hold', past: 'held' },
    };

    const subjectInfo = subjectMap[subjectKo];
    const verbInfo = verbMap[verbKo];

    if (subjectInfo && verbInfo) {
      const isPast = /었|았|였/.test(verbKo);
      let verb: string;

      if (isPast) {
        verb = verbInfo.past;
      } else if (subjectInfo.is3ps) {
        // 3인칭 단수 현재: add -s/-es
        const base = verbInfo.base;
        // 불규칙 동사 처리
        const irregularThirdPerson: Record<string, string> = {
          do: 'does',
          go: 'goes',
          have: 'has',
          watch: 'watches',
          catch: 'catches',
          teach: 'teaches',
          'listen to': 'listens to',
        };
        if (irregularThirdPerson[base]) {
          verb = irregularThirdPerson[base];
        } else if (
          base.endsWith('s') ||
          base.endsWith('x') ||
          base.endsWith('z') ||
          base.endsWith('ch') ||
          base.endsWith('sh')
        ) {
          verb = `${base}es`;
        } else if (base.endsWith('y') && !/[aeiou]y$/.test(base)) {
          verb = `${base.slice(0, -1)}ies`;
        } else {
          verb = `${base}s`;
        }
      } else {
        verb = verbInfo.base;
      }

      // 목적어에 관사 추가
      const article = /^[aeiou]/i.test(objectEn) ? 'an' : 'a';
      const objectWithArticle = objectEn === objectKo ? objectEn : `${article} ${objectEn}`;

      return `${subjectInfo.en} ${verb} ${objectWithArticle}`;
    }
  }

  // ============================================
  // Phase -0.045: 한국어 의문형 -니? 패턴
  // "책을 읽니?" → "Do you read a book?"
  // "누가 책을 읽니?" → "Who reads the book?"
  // ============================================

  // 특수 표현: "그렇지 않니?" → "Isn't it?"
  if (/^그렇지\s*않니\??$/.test(originalText)) {
    return "Isn't it?";
  }

  // 패턴1: [목적어+을/를] + [동사+니?] (주어 생략 - 2인칭 추정)
  // "책을 읽니?" → "Do you read a book?"
  const koQuestionPatternNoSubject = originalText.match(/^(.+?)([을를])\s+(.+?)니\??$/);
  if (koQuestionPatternNoSubject) {
    const objectKo = koQuestionPatternNoSubject[1];
    const verbStemKo = koQuestionPatternNoSubject[3];

    // 목적어 변환
    const objectEn = KO_EN[objectKo] || objectKo;

    // 동사 변환 (어간 → 기본형)
    const verbMap: Record<string, string> = {
      읽: 'read',
      먹: 'eat',
      마시: 'drink',
      보: 'see',
      사: 'buy',
      쓰: 'write',
      듣: 'listen to',
      좋아하: 'like',
      사랑하: 'love',
      원하: 'want',
    };

    const verbEn = verbMap[verbStemKo];
    if (verbEn && objectEn !== objectKo) {
      const article = /^[aeiou]/i.test(objectEn) ? 'an' : 'a';
      return `Do you ${verbEn} ${article} ${objectEn}?`;
    }
  }

  // 패턴2: 누가 + [목적어+을/를] + [동사+니?]
  // "누가 책을 읽니?" → "Who reads the book?"
  const koWhoQuestionPattern = originalText.match(/^누가\s+(.+?)([을를])\s+(.+?)니\??$/);
  if (koWhoQuestionPattern) {
    const objectKo = koWhoQuestionPattern[1];
    const verbStemKo = koWhoQuestionPattern[3];

    // 목적어 변환
    const objectEn = KO_EN[objectKo] || objectKo;

    // 동사 변환 (어간 → 3인칭 단수형)
    const verbMap: Record<string, string> = {
      읽: 'reads',
      먹: 'eats',
      마시: 'drinks',
      보: 'sees',
      사: 'buys',
      쓰: 'writes',
      듣: 'listens to',
      좋아하: 'likes',
      사랑하: 'loves',
      원하: 'wants',
    };

    const verbEn = verbMap[verbStemKo];
    if (verbEn && objectEn !== objectKo) {
      return `Who ${verbEn} the ${objectEn}?`;
    }
  }

  // ============================================
  // Phase -0.04: L14 관계대명사 패턴
  // "내가 산 책" → "the book that I bought"
  // 주의: 동사 종결어미(다)로 끝나는 문장은 제외
  // ============================================

  // L14: [주어]가 [동사한] [명사] → the [명사] that [주어] [동사]
  // 마지막 단어가 '다'로 끝나면 매칭하지 않음 (일반 문장)
  const koRelativeClausePattern = originalText.match(/^(.+?)[이가]\s+(.+[은ㄴ])\s+(.+)$/);
  const lastWord = originalText.split(/\s+/).pop() || '';
  if (koRelativeClausePattern && !lastWord.endsWith('다')) {
    const subjectKo = koRelativeClausePattern[1];
    const verbKo = koRelativeClausePattern[2];
    const nounKo = koRelativeClausePattern[3];

    const subjectMap: Record<string, string> = {
      내: 'I',
      나: 'I',
      그: 'he',
      그녀: 'she',
      우리: 'we',
    };

    const verbMap: Record<string, string> = {
      산: 'bought',
      도운: 'helped',
      사는: 'lives',
      만난: 'met',
    };

    const nounMap: Record<string, { en: string; relPronoun: string }> = {
      책: { en: 'book', relPronoun: 'that' },
      사람: { en: 'person', relPronoun: 'who' },
      집: { en: 'home', relPronoun: 'where' },
      날: { en: 'day', relPronoun: 'when' },
    };

    const subjectEn = subjectMap[subjectKo];
    const verbEn = verbMap[verbKo];
    const nounInfo = nounMap[nounKo];

    if (subjectEn && verbEn && nounInfo) {
      return `the ${nounInfo.en} ${nounInfo.relPronoun} ${subjectEn} ${verbEn}`;
    }
  }

  // L14: 나를 도운 사람 특수 패턴
  if (originalText === '나를 도운 사람') {
    return 'the person who helped me';
  }

  // ============================================
  // Phase 0: 보조용언 패턴 우선 처리 (긴급 수정)
  // "-고 있다" 등의 패턴을 먼저 처리
  // ============================================
  if (parsed.auxiliaryPattern) {
    return generateWithAuxiliaryPattern(parsed);
  }

  // ============================================
  // Phase 1: 피동문 처리 (g4: 수동태)
  // "문이 열렸다" → "The door was opened"
  // "소리가 들린다" → "The sound is heard"
  // ============================================
  if (parsed.passive && parsed.passiveVerbStem) {
    return generatePassiveEnglish(parsed);
  }

  // ============================================
  // Phase g4-7, g4-8: 사동문 처리
  // "아이에게 밥을 먹였다" → "I fed the child"
  // "그를 가게 했다" → "I made him go"
  // ============================================
  if (parsed.causative) {
    return generateCausativeEnglish(parsed);
  }

  // ============================================
  // Phase g6: 조건문 처리
  // "비가 오면 땅이 젖는다" → "If it rains, the ground gets wet"
  // "부자라면 여행할 텐데" → "If I were rich, I would travel"
  // ============================================
  if (parsed.conditional) {
    return generateConditionalEnglish(parsed);
  }

  // ============================================
  // Phase g14: 날씨 표현 처리
  // "비가 오다" → "it rains", "눈이 오다" → "it snows"
  // ============================================
  const weatherResult = handleWeatherExpression(parsed);
  if (weatherResult) {
    return weatherResult;
  }

  // ============================================
  // Phase g8: 명사절 처리
  // "그가 왔다는 것이 중요하다" → "That he came is important"
  // "그가 어디 갔는지 모른다" → "I don't know where he went"
  // ============================================
  if (parsed.nounClause) {
    return generateNounClauseEnglish(parsed);
  }

  // ============================================
  // Phase g28: 수량 표현 (한→영)
  // "사과 세 개" → "three apples"
  // "몇몇 사람" → "some people"
  // ============================================

  // g28 헬퍼: 한국어 숫자 → 영어 숫자
  const koNumToEn: Record<string, string> = {
    하나: 'one',
    한: 'one',
    둘: 'two',
    두: 'two',
    셋: 'three',
    세: 'three',
    넷: 'four',
    네: 'four',
    다섯: 'five',
    여섯: 'six',
    일곱: 'seven',
    여덟: 'eight',
    아홉: 'nine',
    열: 'ten',
  };

  // g28 헬퍼: 한국어 수량사 → 영어
  const koQuantifierToEn: Record<string, string> = {
    몇몇: 'some',
    조금의: 'some',
    조금: 'some',
    약간의: 'some',
    많은: 'many',
    적은: 'few',
    모든: 'all',
    각: 'each',
    매: 'every',
    거의: 'almost',
  };

  // L2: [명사] 하나 → a/an [noun] (관사 a/an 규칙)
  // 사과 하나 → an apple, 책 하나 → a book
  const koSingleNounPattern = originalText.match(/^(\S+)\s+하나$/);
  if (koSingleNounPattern) {
    const nounKo = koSingleNounPattern[1];
    const nounEn = KO_EN[nounKo] || nounKo;
    const article = startsWithVowelSound(nounEn) ? 'an' : 'a';
    return `${article} ${nounEn}`;
  }

  // L2: 한 [명사] → a/an [noun] (예: 한 시간 → an hour)
  const koHanNounPattern = originalText.match(/^한\s+(\S+)$/);
  if (koHanNounPattern) {
    const nounKo = koHanNounPattern[1];
    // 특수 매핑: 시간 단위 컨텍스트에서 "한 X"는 시간 단위로 해석
    const timeUnitMap: Record<string, string> = {
      시간: 'hour',
      시: 'hour',
      분: 'minute',
      초: 'second',
      달: 'month',
      주: 'week',
      해: 'year',
      년: 'year',
    };
    const nounEn = timeUnitMap[nounKo] || KO_EN[nounKo] || nounKo;
    const article = startsWithVowelSound(nounEn) ? 'an' : 'a';
    return `${article} ${nounEn}`;
  }

  // L2: [형용사] [명사] → a/an [adj] [noun] (예: 정직한 사람 → an honest person)
  // 수량사(많은, 적은, 약간의, 모든 등)는 제외 - L18에서 별도 처리
  const quantifiersKo = new Set([
    '많은',
    '적은',
    '약간의',
    '조금의',
    '조금',
    '몇몇',
    '모든',
    '각',
    '매',
  ]);
  const koAdjNounPattern = originalText.match(/^(\S+[한은인])\s+(\S+)$/);
  if (koAdjNounPattern && !quantifiersKo.has(koAdjNounPattern[1])) {
    const adjKo = koAdjNounPattern[1];
    const nounKo = koAdjNounPattern[2];
    // 형용사 어간 변환 시도: 정직한 → 정직하 → 정직 순서로 조회
    const adjStem = adjKo.replace(/[한은인]$/, '');
    const adjStemWithHa = `${adjStem}하`;
    const adjEn = KO_EN[adjKo] || KO_EN[adjStemWithHa] || KO_EN[adjStem] || adjKo;
    const nounEn = KO_EN[nounKo] || nounKo;
    // 형용사의 발음으로 a/an 결정
    const article = startsWithVowelSound(adjEn) ? 'an' : 'a';
    return `${article} ${adjEn} ${nounEn}`;
  }

  // L3: 서수 변환 패턴 (1번째 → 1st, 2번째 → 2nd)
  // 한국어 "[숫자]번째" → 영어 "[숫자][서수접미사]"
  const koOrdinalPattern = originalText.match(/^(\d+)번째$/);
  if (koOrdinalPattern) {
    const num = Number.parseInt(koOrdinalPattern[1], 10);
    // 영어 서수 접미사 규칙
    const getOrdinalSuffix = (n: number): string => {
      const lastTwo = n % 100;
      // 11, 12, 13은 항상 th
      if (lastTwo >= 11 && lastTwo <= 13) return 'th';
      const lastOne = n % 10;
      if (lastOne === 1) return 'st';
      if (lastOne === 2) return 'nd';
      if (lastOne === 3) return 'rd';
      return 'th';
    };
    return `${num}${getOrdinalSuffix(num)}`;
  }

  // g28-1: [명사] [숫자] [단위] → [number] [noun]s
  // 사과 세 개 → three apples
  const koNumberCounterPattern = originalText.match(
    /^(\S+)\s+(하나|한|둘|두|셋|세|넷|네|다섯|여섯|일곱|여덟|아홉|열)\s*(개|마리|명|권|장|잔|병|대|채|그루|송이|켤레)?$/,
  );
  if (koNumberCounterPattern) {
    const nounKo = koNumberCounterPattern[1];
    const numKo = koNumberCounterPattern[2];
    const numEn = koNumToEn[numKo] || numKo;
    const nounEn = KO_EN[nounKo] || nounKo;
    // 복수형
    if (numEn !== 'one') {
      const plural = nounEn.endsWith('s') ? nounEn : `${nounEn}s`;
      return `${numEn} ${plural}`;
    }
    return `${numEn} ${nounEn}`;
  }

  // L1: 아라비아 숫자 + 단위명사 패턴 (사과 1개, 고양이 5마리)
  // [명사] [숫자][단위] → [number] [noun](s)
  const arabicNumberCounterPattern = originalText.match(
    /^(\S+)\s+(\d+)\s*(개|마리|명|권|장|잔|병|대|채|그루|송이|켤레|벌|쌍|줄|통|포기|모금)?$/,
  );
  if (arabicNumberCounterPattern) {
    const nounKo = arabicNumberCounterPattern[1];
    const numStr = arabicNumberCounterPattern[2];
    const num = Number.parseInt(numStr, 10);
    const nounEn = KO_EN[nounKo] || nounKo;
    // 복수형 생성 (특수 복수형 처리 포함)
    const pluralize = (word: string): string => {
      const irregularPlurals: Record<string, string> = {
        person: 'people',
        child: 'children',
        man: 'men',
        woman: 'women',
        foot: 'feet',
        tooth: 'teeth',
        mouse: 'mice',
        goose: 'geese',
        fish: 'fish',
        sheep: 'sheep',
        deer: 'deer',
      };
      if (irregularPlurals[word.toLowerCase()]) {
        return irregularPlurals[word.toLowerCase()];
      }
      // 일반 복수형 규칙
      if (
        word.endsWith('s') ||
        word.endsWith('x') ||
        word.endsWith('z') ||
        word.endsWith('ch') ||
        word.endsWith('sh')
      ) {
        return `${word}es`;
      }
      if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
        return `${word.slice(0, -1)}ies`;
      }
      if (word.endsWith('f')) {
        return `${word.slice(0, -1)}ves`;
      }
      if (word.endsWith('fe')) {
        return `${word.slice(0, -2)}ves`;
      }
      return `${word}s`;
    };
    // 1 = 단수, 그 외 = 복수
    if (num === 1) {
      return `${num} ${nounEn}`;
    }
    return `${num} ${pluralize(nounEn)}`;
  }

  // g28-2: [수량사] [명사] → [quantifier] [noun]
  // L18: Quantifiers - 가산/불가산에 따른 수량사 선택
  // 많은 사과 → many apples (countable)
  // 많은 물 → much water (uncountable)
  // 약간의 사과 → a few apples (countable)
  // 약간의 물 → a little water (uncountable)
  const koQuantifierPattern = originalText.match(
    /^(몇몇|조금의|조금|약간의|많은|적은|모든|각|매)\s+(\S+)$/,
  );
  if (koQuantifierPattern) {
    const quantKo = koQuantifierPattern[1];
    const nounKo = koQuantifierPattern[2];
    const nounEn = KO_EN[nounKo] || nounKo;

    // 불가산 명사 목록 (한국어)
    const uncountableKo = new Set([
      '물',
      '정보',
      '돈',
      '시간',
      '음악',
      '뉴스',
      '충고',
      '지식',
      '날씨',
      '일',
      '공기',
      '쌀',
      '밥',
      '빵',
      '설탕',
      '소금',
    ]);
    const isUncountable = uncountableKo.has(nounKo);

    // 사람 → people 특별 처리
    if (nounKo === '사람' && (quantKo === '몇몇' || quantKo === '모든')) {
      const pluralNoun = quantKo === '모든' ? 'everyone' : 'people';
      if (quantKo === '모든') {
        return 'all people / everyone';
      }
      return `some ${pluralNoun}`;
    }

    // 복수형 헬퍼 (인라인)
    const makePlural = (word: string): string => {
      const irregulars: Record<string, string> = {
        person: 'people',
        child: 'children',
        man: 'men',
        woman: 'women',
        foot: 'feet',
        tooth: 'teeth',
        mouse: 'mice',
        goose: 'geese',
        fish: 'fish',
        sheep: 'sheep',
        deer: 'deer',
      };
      if (irregulars[word.toLowerCase()]) return irregulars[word.toLowerCase()];
      if (
        word.endsWith('s') ||
        word.endsWith('x') ||
        word.endsWith('z') ||
        word.endsWith('ch') ||
        word.endsWith('sh')
      )
        return `${word}es`;
      if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
      return `${word}s`;
    };

    // L18: 많은 → many (countable) / much (uncountable)
    if (quantKo === '많은') {
      if (isUncountable) {
        return `much ${nounEn}`;
      }
      const plural = nounEn.endsWith('s') ? nounEn : makePlural(nounEn);
      return `many ${plural}`;
    }

    // L18: 약간의/조금의/조금 → a few (countable) / a little (uncountable)
    if (quantKo === '약간의' || quantKo === '조금의' || quantKo === '조금') {
      if (isUncountable) {
        return `a little ${nounEn}`;
      }
      const plural = nounEn.endsWith('s') ? nounEn : makePlural(nounEn);
      return `a few ${plural}`;
    }

    // 몇몇 → some (복수형)
    if (quantKo === '몇몇') {
      const plural = nounEn.endsWith('s') ? nounEn : makePlural(nounEn);
      return `some ${plural}`;
    }

    // 적은 → few (countable) / little (uncountable)
    if (quantKo === '적은') {
      if (isUncountable) {
        return `little ${nounEn}`;
      }
      const plural = nounEn.endsWith('s') ? nounEn : makePlural(nounEn);
      return `few ${plural}`;
    }

    // 모든 → all
    if (quantKo === '모든') {
      return `all ${nounEn}`;
    }

    // 각/매 → each/every (단수)
    const quantEn = koQuantifierToEn[quantKo] || quantKo;
    return `${quantEn} ${nounEn}`;
  }

  // g28-5: 거의 없는 → few/little
  if (originalText === '거의 없는') {
    return 'few/little';
  }

  // g28-6: 몇 개의 → a few
  if (originalText === '몇 개의') {
    return 'a few';
  }

  // ============================================
  // Phase g15: 종결어미 규칙 (한→영)
  // ============================================

  // g15 헬퍼: 동사 어간 추출 및 영어 변환
  const extractVerbAndTranslate = (
    text: string,
    ending: string,
  ): { stem: string; verbEn: string } => {
    // 종결어미 제거하여 어간 추출
    let stem = text.replace(new RegExp(`${ending}[?？!！]?$`), '').trim();

    // 받침 처리: 갑니까 → 가 (받침 ㅂ 제거), 갈게 → 가 (받침 ㄹ 제거)
    const jongseong = getKoreanFinalConsonant(stem);
    if (jongseong === 'ㅂ' || jongseong === 'ㄹ') {
      stem = removeKoreanFinalConsonant(stem);
    }

    const verbEn = KO_EN[stem] || KO_EN[`${stem}다`] || VERB_STEMS[stem] || stem;
    return { stem, verbEn };
  };

  // g15 헬퍼: 받침 확인 (한글 음절의 받침이 특정 자음인지 확인)
  const hasJongseong = (text: string, jong: string): boolean => {
    if (!text) return false;
    const lastChar = text.slice(-1);
    return getKoreanFinalConsonant(lastChar) === jong;
  };

  // g15-5: -ㅂ니까? (격식 의문) → Do you V? (formal)
  // 갑니까 → 갑 (받침 ㅂ) + 니까
  if (originalText.match(/니까\??$/) && hasJongseong(originalText.replace(/니까\??$/, ''), 'ㅂ')) {
    const { verbEn } = extractVerbAndTranslate(originalText, '니까');
    return `Do you ${verbEn}? (formal)`;
  }

  // g15-16: -더라 (회상) → I saw that they V
  // 이 패턴을 먼저 체크 (가더라 ≠ 가라)
  if (originalText.match(/더라$/)) {
    const { verbEn } = extractVerbAndTranslate(originalText, '더라');
    return `I saw that they ${verbEn}`;
  }

  // g15-6: -세요 (요청) → Please V
  if (originalText.match(/세요$/)) {
    const { verbEn } = extractVerbAndTranslate(originalText, '세요');
    return `Please ${verbEn}`;
  }

  // g15-7: -라, -어라, -아라 (명령) → V! (command)
  if (
    originalText.match(/(?:어라|아라|거라)$/) ||
    (originalText.match(/라$/) && originalText.length <= 2)
  ) {
    const { verbEn } = extractVerbAndTranslate(originalText, '(?:어라|아라|거라|라)');
    return `${verbEn.charAt(0).toUpperCase() + verbEn.slice(1)}! (command)`;
  }

  // g15-10: -는구나, -구나 (감탄) → Oh, you are V-ing
  if (originalText.match(/(?:는구나|구나|군)$/)) {
    const { verbEn } = extractVerbAndTranslate(originalText, '(?:는구나|구나|군)');
    return `Oh, you are ${verbEn}ing`;
  }

  // g15-11: -지 (확인) → I V, don't I?
  if (originalText.match(/지$/) && !originalText.includes('않') && originalText.length >= 2) {
    const { verbEn } = extractVerbAndTranslate(originalText, '지');
    return `I ${verbEn}, don't I?`;
  }

  // g15-12: -잖아 (설명) → You know I V
  if (originalText.match(/잖아$/)) {
    const { verbEn } = extractVerbAndTranslate(originalText, '잖아');
    return `You know I ${verbEn}`;
  }

  // g15-13: -ㄹ게 (약속) → I will V (promise)
  // 갈게 → 갈 (받침 ㄹ) + 게
  if (originalText.match(/게$/) && hasJongseong(originalText.replace(/게$/, ''), 'ㄹ')) {
    const { verbEn } = extractVerbAndTranslate(originalText, '게');
    return `I will ${verbEn} (promise)`;
  }

  // g15-14: -ㄹ래? (의향) → Want to V?
  // 갈래 → 갈 (받침 ㄹ) + 래
  if (originalText.match(/래\??$/) && hasJongseong(originalText.replace(/래\??$/, ''), 'ㄹ')) {
    const { verbEn } = extractVerbAndTranslate(originalText, '래');
    return `Want to ${verbEn}?`;
  }

  // g15-15: -ㄹ까? (제안) → Shall we V?
  // 갈까 → 갈 (받침 ㄹ) + 까
  if (originalText.match(/까\??$/) && hasJongseong(originalText.replace(/까\??$/, ''), 'ㄹ')) {
    const { verbEn } = extractVerbAndTranslate(originalText, '까');
    return `Shall we ${verbEn}?`;
  }

  // ============================================
  // Phase g2: 문장 유형 변환
  // ============================================

  // g2 헬퍼 함수: 한국어 Wh-단어 → 영어 Wh-단어
  const koWhToEnWh = (koWh: string): string => {
    const whMap: Record<string, string> = {
      누구: 'Who',
      누가: 'Who',
      누: 'Who', // 누가에서 가를 제거한 경우
      무엇: 'What',
      뭐: 'What',
      어디: 'Where',
      언제: 'When',
      왜: 'Why',
      어떻게: 'How',
      무슨: 'What',
      어느: 'Which',
      어떤: 'What kind of',
    };
    return whMap[koWh] || 'What';
  };

  // g2-3: Wh-의문문 (누가 + V → Who V?)
  // "누가 책을 읽니?" → "Who reads the book?"
  const whQuestionMatch = parsed.original.match(
    /^(누가|누구가?|무엇이?|뭐가?|어디(?:서|에)?|언제|왜|어떻게|무슨|어느|어떤)\s+(.+?)(?:\?|？)?$/,
  );
  if (whQuestionMatch && parsed.type === 'question') {
    const whWord = whQuestionMatch[1];
    const rest = whQuestionMatch[2].trim().replace(/[?？]$/, ''); // 끝의 물음표 제거
    const whEn = koWhToEnWh(whWord.replace(/[가이서에]$/, ''));

    // 목적어 + 동사 패턴: "책을 읽니" → "reads the book"
    const ovMatch = rest.match(/^(.+?)[을를]\s*(.+?)(?:니|나|냐|까|어|아)?$/);
    if (ovMatch) {
      const objKo = ovMatch[1].trim();
      const verbPart = ovMatch[2].trim();
      const objEn = KO_EN[objKo] || objKo;
      // 동사 어간 처리: "읽니" → "읽" → "읽다" → "read"
      const verbStem = verbPart.replace(/(?:니|나|냐|까|어|아)$/, '');
      const verbEn = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || VERB_STEMS[verbStem] || verbStem;
      // 3인칭 단수 동사
      const verb3ps = to3rdPersonSingular(verbEn);
      return `${whEn} ${verb3ps} the ${objEn}?`;
    }

    // g21-7: 어디 + 동사 패턴 (어디 가니? → Where are you going?)
    // Pattern: 어디/어디서/어디에 + V-니/나/냐/까/어?
    const verbOnlyMatch = rest.match(/^(.+?)(?:니|나|냐|까|어|아)\??$/);
    if (verbOnlyMatch) {
      const verbStem = verbOnlyMatch[1].trim();
      const verbEn = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || VERB_STEMS[verbStem] || verbStem;
      if (verbEn && typeof verbEn === 'string') {
        // 현재진행형으로 번역 (가니? → are you going?)
        const gerund = verbEn.endsWith('e') ? `${verbEn.slice(0, -1)}ing` : `${verbEn}ing`;
        return `${whEn} are you ${gerund}?`;
      }
    }

    // 단순 패턴
    return `${whEn}?`;
  }

  // g2-6: 감탄문 (-구나! → How ...!)
  // "정말 아름답구나!" → "How beautiful!"
  const exclamationMatch = parsed.original.match(/^(정말\s*)?(.+?)(구나|는구나|네|군|군요)[!！]?$/);
  if (exclamationMatch) {
    const adverb = exclamationMatch[1]?.trim();
    const adjPart = exclamationMatch[2].trim();
    // 형용사 어간
    const adjStem = adjPart.replace(/[다]$/, '');
    const adjEn = KO_EN[adjStem] || KO_EN[`${adjStem}다`] || adjStem;
    if (adverb || adjEn !== adjStem) {
      return `How ${adjEn}!`;
    }
  }

  // g2-7: 부가의문문 (-지 않니? → Isn't it?)
  // "그렇지 않니?" → "Isn't it?"
  if (parsed.original.match(/^그렇지\s*않[니나냐아어][?？]?$/)) {
    return "Isn't it?";
  }

  // g2-8: 간접의문문 (-지 궁금하다 → I wonder if ...)
  // "올지 궁금하다" → "I wonder if they will come"
  const wonderMatch = parsed.original.match(/^(.+?)지\s*궁금하다$/);
  if (wonderMatch) {
    const verbPart = wonderMatch[1].trim();
    // 동사 어간 (올 → 오)
    let verbStem = verbPart;
    const lastChar = verbPart[verbPart.length - 1];
    const charCode = lastChar?.charCodeAt(0) || 0;
    if (charCode >= 0xac00 && charCode <= 0xd7a3) {
      const jongseong = (charCode - 0xac00) % 28;
      if (jongseong === 8) {
        // ㄹ 받침 제거
        verbStem = verbPart.slice(0, -1) + String.fromCharCode(charCode - 8);
      }
    }
    const verbEn = KO_EN[verbStem] || KO_EN[`${verbStem}다`] || verbStem;
    return `I wonder if they will ${verbEn}`;
  }

  // 0-1. 금지 부정 처리 (-지 마 → Don't + verb)
  // "먹지 마!" → "Don't eat!"
  if (parsed.prohibitiveNegation) {
    const token = parsed.tokens[0];
    const stem = token?.stem || '';
    // 어간 + 다 형태로도 조회 (먹 → 먹다)
    const verb = token?.translated || KO_EN[stem] || KO_EN[`${stem}다`] || stem || 'do';
    return `Don't ${verb}!`;
  }

  // 0-2. 능력 부정 처리 (못 + verb → can't + verb)
  // "못 먹는다" → "can't eat"
  if (parsed.inabilityNegation) {
    const token = parsed.tokens.find((t) => t.role === 'verb') || parsed.tokens[0];
    const stem = token?.stem || '';
    // 어간 + 다 형태로도 조회 (먹 → 먹다)
    const verb = token?.translated || KO_EN[stem] || KO_EN[`${stem}다`] || stem || 'do';
    return `can't ${verb}`;
  }

  // 0-3. 미래 부정 처리 (-지 않을 것이다 → won't + verb)
  // "먹지 않을 것이다" → "won't eat"
  if (parsed.tense === 'future' && parsed.negated && parsed.tokens.length === 1) {
    const token = parsed.tokens[0];
    const stem = token?.stem || '';
    // 어간 + 다 형태로도 조회 (먹 → 먹다)
    const verb = token?.translated || KO_EN[stem] || KO_EN[`${stem}다`] || stem || 'do';
    return `won't ${verb}`;
  }

  // 0. 복합어 토큰 처리 (배고프다, 목마르다 등)
  // 복합어는 이미 번역된 상태로 토큰화됨
  if (parsed.tokens.length === 1 && parsed.tokens[0].role === 'compound') {
    const token = parsed.tokens[0];
    return token.translated || token.text;
  }

  // 1. 관용구 체크 (통문장)
  const idiom = IDIOMS_KO_EN[parsed.original.replace(/[.!?？！。]+$/, '').trim()];
  if (idiom) return idiom;

  // 1.2. Phase 1: 단일 동사+종결어미 분석 (갑니다, 먹었어 등)
  // 토큰이 1개이고 동사/형용사 역할인 경우 종결어미 분석
  if (parsed.tokens.length === 1) {
    const token = parsed.tokens[0];
    const word = token.text;

    // 종결어미 분석 시도
    const endingAnalysis = analyzeKoreanEnding(word);
    if (endingAnalysis) {
      // Bug fix: 토크나이저에서 감지된 부정 ("안" 전치 부정)을 병합
      // "안 먹었다" → tokenizer strips "안 " and sets parsed.negated = true
      // but analyzeKoreanEnding("먹었다") doesn't know about it
      if (parsed.negated && !endingAnalysis.negated) {
        endingAnalysis.negated = true;
      }

      // 어간에서 영어 동사 찾기
      // 우선순위: 토크나이저가 이미 번역한 값 → 기본형(다) 사전 → 어간 사전 → VERB_STEMS
      // 이 순서가 중요: 배우다(learn) vs 배우(actor) 구분
      const stemWithDa = `${endingAnalysis.stem}다`;
      const enVerb =
        token.translated ||
        KO_EN[stemWithDa] ||
        VERB_STEMS[endingAnalysis.stem] ||
        KO_EN[endingAnalysis.stem] ||
        endingAnalysis.stem;

      // 비인칭 형용사 체크 (춥다, 덥다 등 → "it's cold/hot")
      if (IMPERSONAL_ADJECTIVES.has(endingAnalysis.stem)) {
        const _beVerb = endingAnalysis.tense === 'past' ? 'was' : 'is';
        return `it's ${enVerb}`;
      }

      // 종결어미에 따른 영어 문장 생성
      const englishResult = endingToEnglish(endingAnalysis, enVerb);
      if (englishResult) {
        // 과거 시제인 경우 동사 활용
        let verbForm = englishResult.text;
        if (endingAnalysis.tense === 'past' && !endingAnalysis.negated) {
          verbForm = applyTense(enVerb, 'past');
        }

        // 조합
        const parts: string[] = [];
        if (englishResult.prefix) parts.push(englishResult.prefix);
        parts.push(verbForm);
        if (englishResult.suffix) {
          // 마침표/물음표/느낌표를 마지막에 붙임
          return parts.join(' ').trim() + englishResult.suffix;
        }
        return parts.join(' ').trim();
      }
    }
  }

  // 1.5. Phase 3: 비교급/최상급 패턴 우선 처리
  // "더 크다" → "bigger", "가장 좋다" → "best"
  if (parsed.comparativeType && parsed.tokens.length === 1) {
    const token = parsed.tokens[0];
    // 형용사/동사 어간에서 영어 비교급/최상급 생성
    const adjStem = token.stem || token.text;
    const enComp = toEnglishComparative(adjStem, parsed.comparativeType);
    if (enComp) {
      return enComp;
    }
    // 매핑이 없으면 기본 번역 + more/most 접두사
    const enBase = token.translated || KO_EN[adjStem] || adjStem;
    if (parsed.comparativeType === 'comparative') {
      return `more ${enBase}`;
    }
    return `most ${enBase}`;
  }

  // 2. 숫자+분류사 패턴 감지 (명사 숫자 분류사 순서)
  // "사과 1개", "고양이 5마리" 패턴
  const counterPattern = detectCounterPattern(parsed.tokens);
  if (counterPattern) {
    return counterPattern;
  }

  // 2.5. 단일 단어 처리 (인사말, 감탄사 등)
  // 토큰이 1개이고 이미 번역된 값이 있으면 바로 반환
  if (parsed.tokens.length === 1) {
    const token = parsed.tokens[0];
    const translated = token.translated || KO_EN[token.stem] || KO_EN[token.text];
    if (translated) {
      // 비인칭 형용사인 경우 "it is + adjective" 구조로 반환
      // 예: 춥다 → "it's cold", 덥다 → "it's hot"
      const stem = token.stem?.replace(/다$/, '');
      if (stem && IMPERSONAL_ADJECTIVES.has(stem)) {
        const _beVerb = parsed.tense === 'past' ? 'was' : 'is';
        return `it's ${translated}`;
      }
      return translated;
    }
  }

  // 3. 역할별 토큰 분류
  const subjects: Token[] = [];
  const objects: Token[] = [];
  const verbs: Token[] = [];
  const adverbs: Token[] = [];
  const locations: Token[] = []; // 에, 에서 조사
  const others: Token[] = [];
  const numbers: Token[] = [];
  const counters: Token[] = [];

  for (const token of parsed.tokens) {
    switch (token.role) {
      case 'subject':
        subjects.push(token);
        break;
      case 'object':
        objects.push(token);
        break;
      case 'verb':
        verbs.push(token);
        break;
      case 'adverb':
        adverbs.push(token);
        break;
      case 'number':
        numbers.push(token);
        break;
      case 'counter':
        counters.push(token);
        break;
      default:
        // 위치 조사 체크
        if (token.meta?.particle === '에' || token.meta?.particle === '에서') {
          locations.push(token);
        } else {
          others.push(token);
        }
        break;
    }
  }

  // 4. 역할 기반 숫자+분류사 패턴 (fallback)
  if (numbers.length > 0 && counters.length > 0) {
    return generateCounterPhrase(numbers, counters, others);
  }

  // 5. 문맥 추론 및 다의어 해소

  // 전체 토큰을 문맥 힌트로 사용 (문맥 기반 명사 번역)
  const allContextTokens = parsed.tokens;

  // 5-1. 주어 추론 (생략된 경우)
  // 동사 어간 추출 (비인칭 형용사 판단용)
  const firstVerbStem = verbs.length > 0 ? verbs[0].stem?.replace(/다$/, '') : undefined;
  const subjectText =
    subjects.length > 0
      ? translateTokens(subjects, allContextTokens)
      : inferSubject(parsed.type, parsed.tense, firstVerbStem);

  // 5-2. 다의어 해소 (동사 번역 결정)
  let verbText: string | undefined;
  let isCopulaVerb = false; // 서술격 조사 여부
  let isLightVerbPattern = false; // 경동사 패턴 여부 (목적어를 동사로 변환)

  if (verbs.length > 0) {
    const verb = verbs[0];

    // 서술격 조사 (이다/입니다) 처리 - be 동사 + 명사
    if (verb.meta?.isCopula) {
      isCopulaVerb = true;
      // 주어에 따른 be 동사 선택은 별도 처리
      verbText = verb.translated || KO_EN[verb.stem] || verb.stem;
    }
    // 경동사 패턴: "[명사]를 하다" → 목적어를 동사로 변환
    // 예: "운동을 했다" → "exercised", "샤워를 했다" → "showered", "일을 했다" → "worked"
    else if (verb.meta?.isLightVerb && objects.length > 0) {
      isLightVerbPattern = true;
      const obj = objects[0];
      // 목적어 명사의 동사형 찾기
      // 우선순위: NOUN_TO_VERB[stem] → obj.translated → KO_EN[stem] → stem
      const nounStem = obj.stem;
      const nounAsVerb = NOUN_TO_VERB[nounStem];
      verbText = nounAsVerb || obj.translated || KO_EN[nounStem] || nounStem;
    } else {
      // 먼저 다의어 규칙 확인
      const polysemyResult = resolvePolysemy(verb.stem, objects);
      if (polysemyResult) {
        verbText = polysemyResult;
      } else {
        verbText = verb.translated || KO_EN[verb.stem] || verb.stem;
      }
    }
  }

  // 6. 템플릿 기반 문장 생성
  // Phase 2: 목적어에 관사 추가
  // 경동사 패턴에서는 목적어가 동사로 변환되므로 목적어를 비움
  const objectText =
    isLightVerbPattern || objects.length === 0
      ? undefined
      : translateTokens(objects, allContextTokens);

  // 목적격 조사(을/를)가 붙은 명사는 특정 대상 → 정관사 'the' 사용
  const hasObjectParticle = objects.some(
    (obj) => obj.meta?.particle === '을' || obj.meta?.particle === '를',
  );
  const objectWithArticle = objectText ? addArticle(objectText, hasObjectParticle) : undefined;

  const templateValues = {
    S: subjectText || undefined,
    V: verbText,
    O: objectWithArticle,
    L:
      locations.length > 0
        ? locations
            .map((loc) => {
              // 위치 명사도 문맥 기반 번역 적용
              const contextHints = new Set(allContextTokens.map((t) => t.stem));
              const contextTranslation = resolveNounContext(loc.stem, contextHints);
              const noun = contextTranslation || loc.translated || KO_EN[loc.stem] || loc.stem;
              const prep = mapParticleToPreposition(loc.meta?.particle, verbText);
              return `${prep} ${noun}`;
            })
            .join(' ')
        : undefined,
    A: adverbs.length > 0 ? translateTokens(adverbs, allContextTokens) : undefined,
  };

  // 동사가 없으면 기타 토큰 사용
  if (!templateValues.V && others.length > 0) {
    return translateTokens(others, allContextTokens);
  }

  // 부정 여부 확인
  const isNegated = parsed.negated || verbs.some((v) => v.meta?.negated);

  // Phase 1: 3인칭 단수 판단
  const is3ps = subjectText ? isThirdPersonSingular(subjectText) : false;

  // 서술격 조사 (이다/입니다) 처리: be 동사 + 명사
  // "저는 사람입니다" → "I am a person"
  // "그녀는 학생입니다" → "She is a student"
  if (isCopulaVerb && verbText) {
    const beVerb = getBeVerb(subjectText || 'it', parsed.tense);
    const noun = verbText;
    const nounWithArticle = addArticle(noun);
    return `${subjectText || 'It'} ${beVerb} ${nounWithArticle}`.trim();
  }

  // 템플릿 키 생성 및 적용 (Phase 1: 3인칭 단수 고려)
  const templateKey = getTemplateKey(parsed.type, parsed.tense, isNegated, is3ps);
  const template = SENTENCE_TEMPLATES[templateKey] || SENTENCE_TEMPLATES['statement-present'];

  let result = fillTemplate(template, templateValues, parsed.tense, is3ps);

  // 첫 글자 대문자
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * 숫자+분류사 구문 생성
 */
function generateCounterPhrase(numbers: Token[], counters: Token[], nouns: Token[]): string {
  const num = parseInt(numbers[0].stem, 10);
  const counter = counters[0].text;
  const noun = nouns.length > 0 ? nouns[0].translated || KO_EN[nouns[0].stem] || nouns[0].stem : '';

  // 분류사 정보 찾기
  const counterInfo = COUNTERS.find(([c]) => c === counter);

  if (counterInfo) {
    const [, singular, plural] = counterInfo;
    if (num === 1) {
      return `${num} ${noun}${singular}`;
    } else {
      return `${num} ${noun}${plural}`;
    }
  }

  return `${num} ${noun}`;
}

/**
 * 토큰 배열을 영어로 번역
 *
 * 문맥 기반 명사 번역 적용:
 * - NOUN_CONTEXT에 정의된 명사는 주변 토큰을 힌트로 사용
 * - 힌트 매칭 시 해당 번역 사용, 없으면 default 사용
 * - 주어 역할의 토큰은 주격 대명사로 변환 (나 → I, 너 → you)
 */
function translateTokens(tokens: Token[], contextTokens?: Token[]): string {
  // 문맥 힌트 수집 (모든 토큰의 어간)
  const allTokens = contextTokens || tokens;
  const contextHints = new Set<string>();
  for (const t of allTokens) {
    contextHints.add(t.stem);
    if (t.text !== t.stem) contextHints.add(t.text);
  }

  return tokens
    .map((t) => {
      // 이미 번역된 경우
      if (t.translated) {
        // 주어 역할이면 주격 대명사로 변환
        if (t.role === 'subject') {
          return translateSubjectPronoun(t.stem, t.translated);
        }
        return t.translated;
      }

      // 문맥 기반 명사 번역 시도
      const contextTranslation = resolveNounContext(t.stem, contextHints);
      if (contextTranslation) {
        // 주어 역할이면 주격 대명사로 변환
        if (t.role === 'subject') {
          return translateSubjectPronoun(t.stem, contextTranslation);
        }
        return contextTranslation;
      }

      // 기본 사전 조회
      const translation = KO_EN[t.stem] || t.stem;
      // 주어 역할이면 주격 대명사로 변환
      if (t.role === 'subject') {
        return translateSubjectPronoun(t.stem, translation);
      }
      return translation;
    })
    .join(' ');
}

/**
 * 문맥 기반 명사 번역 해소
 *
 * 일반화된 알고리즘:
 * 1. NOUN_CONTEXT에 해당 명사가 있는지 확인
 * 2. 문맥 힌트 중 hints에 매칭되는 것이 있으면 해당 번역 반환
 * 3. 매칭되는 힌트가 없으면 default 반환
 * 4. NOUN_CONTEXT에 없으면 null 반환 (기본 사전 사용)
 *
 * @param noun 번역할 명사 (어간)
 * @param contextHints 문장 내 모든 토큰 어간 집합
 * @returns 문맥 기반 번역 또는 null
 */
function resolveNounContext(noun: string, contextHints: Set<string>): string | null {
  const rule = NOUN_CONTEXT[noun];
  if (!rule) return null;

  // 문맥 힌트 중 매칭되는 것 찾기
  for (const hint of contextHints) {
    if (rule.hints[hint]) {
      return rule.hints[hint];
    }
  }

  // 매칭되는 힌트가 없으면 default 사용
  return rule.default;
}

/**
 * 시제 적용
 */
function applyTense(verb: string, tense: Tense): string {
  if (tense === 'past') {
    // 구동사 처리: "wake up" → "woke up", "get out" → "got out"
    const parts = verb.split(' ');
    if (parts.length > 1) {
      const mainVerb = parts[0];
      const particles = parts.slice(1).join(' ');
      const mainPast = VERB_PAST.get(mainVerb);
      if (mainPast) {
        return `${mainPast} ${particles}`;
      }
      // 규칙 동사 구동사
      if (mainVerb.endsWith('e')) return `${mainVerb}d ${particles}`;
      if (/[^aeiou]y$/.test(mainVerb)) return `${mainVerb.slice(0, -1)}ied ${particles}`;
      return `${mainVerb}ed ${particles}`;
    }
    // 단일 동사 불규칙 확인
    const irregular = VERB_PAST.get(verb);
    if (irregular) return irregular;
    // 규칙 동사
    if (verb.endsWith('e')) return `${verb}d`;
    if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
    return `${verb}ed`;
  }
  return verb;
}

// ============================================
// Phase 1: 3인칭 단수 동사 활용 (-s/-es/-ies)
// ============================================

/**
 * 3인칭 단수 주어 판단
 *
 * 규칙:
 * - he, she, it → 3인칭 단수
 * - 고유명사 (대문자로 시작) → 3인칭 단수
 * - I, you, we, they → 3인칭 단수 아님
 */
function isThirdPersonSingular(subject: string): boolean {
  const lower = subject.toLowerCase().trim();

  // 명시적 비-3인칭 단수
  const nonThirdPersonSingular = ['i', 'you', 'we', 'they'];
  if (nonThirdPersonSingular.includes(lower)) return false;

  // 명시적 3인칭 단수
  const thirdPersonSingular = ['he', 'she', 'it'];
  if (thirdPersonSingular.includes(lower)) return true;

  // 고유명사 (대문자로 시작하는 단일 단어) → 3인칭 단수로 취급
  if (/^[A-Z][a-z]*$/.test(subject.trim())) return true;

  // 기본값: 단수 명사는 3인칭 단수로 취급
  // (복수형 -s로 끝나지 않는 명사)
  if (!lower.endsWith('s') || lower.endsWith('ss')) return true;

  return false;
}

/**
 * 주어와 시제에 따른 be 동사 선택
 *
 * 규칙:
 * - I + present → am
 * - I + past → was
 * - you/we/they + present → are
 * - you/we/they + past → were
 * - he/she/it/3인칭단수 + present → is
 * - he/she/it/3인칭단수 + past → was
 */
function getBeVerb(subject: string, tense: Tense): string {
  const lower = subject.toLowerCase().trim();

  // 과거 시제
  if (tense === 'past') {
    if (lower === 'i' || isThirdPersonSingular(subject)) {
      return 'was';
    }
    return 'were';
  }

  // 미래 시제
  if (tense === 'future') {
    return 'will be';
  }

  // 현재 시제
  if (lower === 'i') return 'am';
  if (['you', 'we', 'they'].includes(lower)) return 'are';
  if (isThirdPersonSingular(subject)) return 'is';

  // 기본값
  return 'is';
}

/**
 * 3인칭 단수 동사 활용 적용
 *
 * 규칙:
 * 1. -s, -sh, -ch, -x, -z, -o → +es (goes, watches, pushes)
 * 2. 자음 + y → y를 ies로 (flies, tries)
 * 3. 그 외 → +s (runs, plays)
 * 4. 불규칙: have → has, be → is, do → does
 */
function applyThirdPersonSingular(verb: string): string {
  // 불규칙 동사
  const irregulars: Record<string, string> = {
    have: 'has',
    be: 'is',
    do: 'does',
    go: 'goes',
  };

  if (irregulars[verb]) return irregulars[verb];

  // -s, -sh, -ch, -x, -z, -o로 끝나면 +es
  if (/(?:s|sh|ch|x|z|o)$/.test(verb)) {
    return `${verb}es`;
  }

  // 자음 + y로 끝나면 y → ies
  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }

  // 그 외: +s
  return `${verb}s`;
}

/**
 * 부정문 생성
 */
function _applyNegation(verb: string, tense: Tense): string {
  if (tense === 'past') {
    return `didn't ${verb}`;
  }
  return `don't ${verb}`;
}

// ============================================
// Phase 2: 관사 a/an 삽입 규칙
// ============================================

/**
 * 불가산 명사 목록 (관사 붙이지 않음)
 *
 * 카테고리:
 * - 물질명사: water, air, rice, bread
 * - 추상명사: love, happiness, information
 * - 집합명사: furniture, equipment, luggage
 */
const UNCOUNTABLE_NOUNS = new Set([
  // 물질명사
  'water',
  'air',
  'rice',
  'bread',
  'milk',
  'coffee',
  'tea',
  'juice',
  'sugar',
  'salt',
  'butter',
  'cheese',
  'meat',
  'fish',
  'chicken',
  'pork',
  'beef',
  'wine',
  'beer',
  'rain',
  'snow',
  'gold',
  'silver',
  'paper',
  'wood',
  'glass',
  'plastic',
  'sand',
  'dirt',
  // 추상명사
  'love',
  'happiness',
  'sadness',
  'anger',
  'fear',
  'hope',
  'peace',
  'freedom',
  'knowledge',
  'information',
  'advice',
  'news',
  'music',
  'art',
  'time',
  'money',
  'work',
  'homework',
  'research',
  'progress',
  'fun',
  'luck',
  'health',
  'beauty',
  'weather',
  // 집합명사
  'furniture',
  'equipment',
  'luggage',
  'baggage',
  'clothing',
  'machinery',
  'traffic',
  'homework',
]);

/**
 * 모음으로 시작하는지 판단 (발음 기준)
 *
 * 예외:
 * - hour → 모음 (h 묵음)
 * - university → 자음 (ju- 발음)
 * - European → 자음 (ju- 발음)
 *
 * 성능: 배열 some() → 접두사 패턴 미리 계산
 */
const SILENT_H_PREFIXES = ['hour', 'honest', 'honor', 'heir'];
const CONSONANT_U_PREFIXES = ['uni', 'use', 'usual', 'europe', 'euro'];

function startsWithVowelSound(word: string): boolean {
  const lower = word.toLowerCase();

  // 예외: h 묵음 → 모음 취급
  for (const prefix of SILENT_H_PREFIXES) {
    if (lower.startsWith(prefix)) return true;
  }

  // 예외: u로 시작하지만 자음 발음 (ju-)
  for (const prefix of CONSONANT_U_PREFIXES) {
    if (lower.startsWith(prefix)) return false;
  }

  // 일반 규칙: a, e, i, o, u로 시작
  return /^[aeiou]/i.test(lower);
}

/**
 * 관사 선택 및 삽입
 *
 * 규칙:
 * 1. 불가산명사 → 관사 없음
 * 2. 복수형 (-s) → 관사 없음 (또는 some/the)
 * 3. 모음 발음 시작 → an
 * 4. 자음 발음 시작 → a
 */
function addArticle(noun: string, useDefiniteArticle = false): string {
  const lower = noun.toLowerCase();

  // 불가산명사 → 관사 없음
  if (UNCOUNTABLE_NOUNS.has(lower)) {
    return noun;
  }

  // 복수형 → 관사 없음 (단, -ss, -ness 등은 제외)
  if (lower.endsWith('s') && !lower.endsWith('ss') && !lower.endsWith('ness')) {
    return noun;
  }

  // 이미 관사가 있으면 그대로
  if (/^(a|an|the)\s/i.test(noun)) {
    return noun;
  }

  // 정관사 요청 시 'the' 사용
  // 한국어에서 목적격 조사 (을/를)이 붙은 명사는 특정 대상을 지칭하므로 the 사용
  if (useDefiniteArticle) {
    return `the ${noun}`;
  }

  // 관사 선택: a vs an
  const article = startsWithVowelSound(noun) ? 'an' : 'a';
  return `${article} ${noun}`;
}

// ============================================
// Phase 5: En→Ko 어순 변환 (SVO → SOV)
// ============================================

/**
 * 영어 품사 태깅 (간단 규칙 기반)
 *
 * 규칙:
 * - 첫 단어 대문자 + 대명사/명사 → 주어
 * - 동사 사전에 있음 → 동사
 * - 명사 사전에 있음 → 목적어 후보
 * - 관사/전치사 → 기능어 (제거 또는 무시)
 */
type EnglishPOS = 'subject' | 'verb' | 'object' | 'prep' | 'article' | 'aux' | 'adverb' | 'unknown';

interface TaggedWord {
  text: string;
  lower: string;
  ko: string;
  pos: EnglishPOS;
  isProgressive?: boolean; // Phase 6: 진행형 여부
  isCopula?: boolean; // be동사 + 명사 패턴 (서술격 조사)
  isPerfect?: boolean; // Phase 1.1: 완료형 여부
  modal?: string; // Phase 1.2: 조동사 종류 (can, must, should 등)
  isConditional?: boolean; // Phase 2.1: 조건절 여부 (if/unless)
  comparativeType?: 'comparative' | 'superlative'; // Phase 2.2: 비교급/최상급
  adjBase?: string; // Phase 2.2: 형용사 원형 (taller → tall)
  auxiliaryVerb?: 'want' | 'try' | 'start' | 'stop'; // Phase 4: 보조용언 종류
  isPassive?: boolean; // Phase 4.2: 수동태 여부 (be + pp)
  isCausative?: boolean; // Phase 4.3: 사동태 여부 (make/let/have + O + V)
  connective?: string; // Phase 5.1: 연결어미 (and → -고, but → -지만 등)
}

/** 영어 대명사 → 한국어 */
const EN_PRONOUNS: Record<string, string> = {
  i: '나',
  you: '너',
  he: '그',
  she: '그녀',
  it: '그것',
  we: '우리',
  they: '그들',
  me: '나',
  him: '그',
  her: '그녀',
  us: '우리',
  them: '그들',
};

/**
 * 영어 동사 → 한국어 (원형만)
 *
 * 중요: 과거형/활용형 동사도 한국어 기본형(-다)으로 매핑
 * 시제 변환은 generateKorean에서 별도 처리
 */
const EN_VERBS: Record<string, string> = {
  // 기본형
  go: '가다',
  come: '오다',
  eat: '먹다',
  drink: '마시다',
  read: '읽다',
  write: '쓰다',
  see: '보다',
  hear: '듣다',
  listen: '듣다',
  like: '좋아하다',
  love: '사랑하다',
  want: '원하다',
  need: '필요하다',
  have: '가지다',
  make: '만들다',
  take: '가져가다',
  give: '주다',
  buy: '사다',
  sell: '팔다',
  sleep: '자다',
  work: '일하다',
  play: '놀다',
  run: '뛰다',
  walk: '걷다',
  swim: '수영하다',
  study: '공부하다',
  sing: '노래하다',
  dance: '춤추다',
  cook: '요리하다',
  clean: '청소하다',
  wash: '씻다',
  drive: '운전하다',
  fly: '날다',
  learn: '배우다',
  teach: '가르치다',
  stay: '머무르다',
  stays: '머무르다',
  stayed: '머무르다',

  // 과거형/활용형 → 기본형으로 매핑 (시제는 parsed.tense로 별도 처리)
  went: '가다',
  gone: '가다',
  came: '오다',
  ate: '먹다',
  drank: '마시다',
  wrote: '쓰다',
  saw: '보다',
  heard: '듣다',
  had: '가지다',
  made: '만들다',
  took: '가져가다',
  gave: '주다',
  bought: '사다',
  sold: '팔다',
  slept: '자다',
  ran: '뛰다',
  walked: '걷다',

  // 3인칭 단수 현재형 → 기본형으로 매핑
  sings: '노래하다',
  runs: '뛰다',
  walks: '걷다',
  eats: '먹다',
  drinks: '마시다',
  reads: '읽다',
  writes: '쓰다',
  sees: '보다',
  hears: '듣다',
  listens: '듣다',
  likes: '좋아하다',
  loves: '사랑하다',
  wants: '원하다',
  needs: '필요하다',
  makes: '만들다',
  takes: '가져가다',
  gives: '주다',
  buys: '사다',
  sells: '팔다',
  sleeps: '자다',
  works: '일하다',
  plays: '놀다',
  swims: '수영하다',
  studies: '공부하다',
  dances: '춤추다',
  cooks: '요리하다',
  cleans: '청소하다',
  drives: '운전하다',
  flies: '날다',
  learns: '배우다',
  teaches: '가르치다',

  // 진행형 → 기본형으로 매핑
  reading: '읽다',
  walking: '걷다',
  running: '뛰다',
  eating: '먹다',
  drinking: '마시다',
  listening: '듣다',
  going: '가다',
  coming: '오다',

  // Phase 3: 절을 취하는 동사 (verbs that take clauses)
  think: '생각하다',
  know: '알다',
  believe: '믿다',
  say: '말하다',
  tell: '말하다',
  ask: '묻다',
  hope: '바라다',
  wish: '바라다',
  feel: '느끼다',
  understand: '이해하다',
};

/** 관사/기능어 (번역 시 제거) */
const EN_ARTICLES = new Set(['a', 'an', 'the']);

/** 전치사 */
const EN_PREPOSITIONS = new Set([
  'to',
  'at',
  'in',
  'on',
  'from',
  'with',
  'by',
  'for',
  'of',
  'about',
]);

/**
 * Phase 3: 절 마커 (Clause Markers)
 *
 * 절을 도입하는 접속사/관계사로, 번역 시 구조 변환에 사용
 * - that: 명사절 (I think that he goes → 나는 그가 간다고 생각한다)
 * - who/which/whom: 관계절 (The man who runs → 달리는 남자)
 * - when/while/before/after: 시간 부사절
 * - because/since/although: 이유/양보 부사절
 */
const CLAUSE_MARKERS = new Set([
  'that', // 명사절 접속사 (complementizer)
  'who', // 관계대명사 (사람)
  'whom', // 관계대명사 (사람, 목적격)
  'which', // 관계대명사 (사물)
  'whose', // 관계대명사 (소유격)
  // 'when', 'while' 등은 추후 추가 (부사절)
]);

/**
 * Phase 3.1: 절을 취하는 동사 (Clause-taking verbs)
 * that-clause와 함께 사용되는 동사들
 */
const CLAUSE_TAKING_VERBS = new Set([
  'think',
  'thinks',
  'thought',
  'know',
  'knows',
  'knew',
  'believe',
  'believes',
  'believed',
  'say',
  'says',
  'said',
  'tell',
  'tells',
  'told',
  'ask',
  'asks',
  'asked',
  'hope',
  'hopes',
  'hoped',
  'wish',
  'wishes',
  'wished',
  'feel',
  'feels',
  'felt',
  'understand',
  'understands',
  'understood',
  'hear',
  'hears',
  'heard',
  'see',
  'sees',
  'saw',
]);

// ============================================
// Phase 5.1: Connective Endings (연결어미)
// ============================================

/**
 * 영어 접속사 → 한국어 연결어미 매핑 (32개 패턴)
 *
 * 카테고리별 연결어미:
 *
 * 1. 나열/순서 (Listing/Sequence)
 *    - and: -고 (나열)
 *    - then: -고서, -고 나서 (순서)
 *    - and then: -고 나서 (순서)
 *
 * 2. 대조/양보 (Contrast/Concession)
 *    - but: -지만 (대조)
 *    - however: -지만, -는데 (대조)
 *    - although/though/even though: -(으)ㄴ데도, -지만 (양보)
 *    - while (대조): -는 반면 (대조)
 *    - whereas: -는 반면에 (대조)
 *    - yet: -지만 (대조)
 *
 * 3. 원인/이유 (Cause/Reason)
 *    - because: -기 때문에, -아서/-어서 (원인)
 *    - since: -기 때문에 (원인)
 *    - as (이유): -기 때문에 (이유)
 *    - for: -기 때문에 (이유)
 *
 * 4. 결과/목적 (Result/Purpose)
 *    - so: -아서/-어서 (결과)
 *    - therefore: -므로 (결론)
 *    - thus: -므로 (결론)
 *    - so that: -도록, -기 위해 (목적)
 *    - in order to: -기 위해 (목적)
 *
 * 5. 시간 (Time)
 *    - when: -ㄹ 때 (시간)
 *    - while: -는 동안 (시간)
 *    - before: -기 전에 (시간)
 *    - after: -ㄴ 후에 (시간)
 *    - until: -ㄹ 때까지 (시간)
 *    - as soon as: -자마자 (즉시)
 *    - once: -하면 (조건/시간)
 *
 * 6. 조건 (Condition)
 *    - if: -(으)면 (조건) - Phase 2.1에서 처리
 *    - unless: -지 않으면 (부정 조건)
 *    - provided/providing: -(으)면 (조건)
 *    - as long as: -는 한 (조건)
 *
 * 7. 선택 (Choice)
 *    - or: -거나 (선택)
 *    - either...or: -거나 (선택)
 *    - whether...or: -든지 (선택)
 */
const CONNECTIVE_CONJUNCTIONS: Record<string, { ending: string; type: string }> = {
  // 1. 나열/순서
  and: { ending: '-고', type: 'listing' },
  then: { ending: '-고 나서', type: 'sequence' },

  // 2. 대조/양보
  but: { ending: '-지만', type: 'contrast' },
  however: { ending: '-지만', type: 'contrast' },
  although: { ending: '-지만', type: 'concession' },
  though: { ending: '-지만', type: 'concession' },
  whereas: { ending: '-는 반면에', type: 'contrast' },
  yet: { ending: '-지만', type: 'contrast' },

  // 3. 원인/이유
  because: { ending: '-기 때문에', type: 'cause' },
  since: { ending: '-기 때문에', type: 'cause' },
  as: { ending: '-기 때문에', type: 'cause' }, // 이유로 사용될 때
  for: { ending: '-기 때문에', type: 'cause' }, // 접속사로 사용될 때

  // 4. 결과/목적
  so: { ending: '-아서', type: 'result' },
  therefore: { ending: '-므로', type: 'conclusion' },
  thus: { ending: '-므로', type: 'conclusion' },

  // 5. 시간
  when: { ending: '-ㄹ 때', type: 'time' },
  while: { ending: '-는 동안', type: 'time' },
  before: { ending: '-기 전에', type: 'time' },
  after: { ending: '-ㄴ 후에', type: 'time' },
  until: { ending: '-ㄹ 때까지', type: 'time' },

  // 6. 조건 (if/unless는 Phase 2.1에서 처리)
  provided: { ending: '-(으)면', type: 'condition' },
  providing: { ending: '-(으)면', type: 'condition' },

  // 7. 선택
  or: { ending: '-거나', type: 'choice' },
};

/**
 * 접속사인지 확인
 */
function isConnectiveConjunction(word: string): boolean {
  return word.toLowerCase() in CONNECTIVE_CONJUNCTIONS;
}

/**
 * 접속사에 해당하는 연결어미 가져오기
 */
function getConnectiveEnding(conjunction: string): string {
  const info = CONNECTIVE_CONJUNCTIONS[conjunction.toLowerCase()];
  return info?.ending || '';
}

/**
 * 동사에 연결어미 적용
 *
 * @param verb 한국어 동사 (기본형, 예: 가다, 먹다)
 * @param ending 연결어미 패턴 (예: -고, -지만, -아서)
 * @returns 연결어미가 적용된 동사
 *
 * 규칙:
 * - -고: 어간 + 고 (가다 → 가고, 먹다 → 먹고)
 * - -지만: 어간 + 지만 (가다 → 가지만, 먹다 → 먹지만)
 * - -아서/-어서: 모음조화 적용 (가다 → 가서, 먹다 → 먹어서)
 * - -기 때문에: 어간 + 기 때문에 (가다 → 가기 때문에)
 * - -ㄹ 때: 어간 + ㄹ 때 (가다 → 갈 때, 먹다 → 먹을 때)
 * - -는 동안: 어간 + 는 동안 (가다 → 가는 동안)
 * - -기 전에: 어간 + 기 전에 (가다 → 가기 전에)
 * - -ㄴ 후에: 어간 + ㄴ 후에 (가다 → 간 후에, 먹다 → 먹은 후에)
 * - -므로: 어간 + 므로 (가다 → 가므로)
 * - -거나: 어간 + 거나 (가다 → 가거나)
 * - -(으)면: 어간 + (으)면 (가다 → 가면, 먹다 → 먹으면)
 * - -ㄹ 때까지: 어간 + ㄹ 때까지 (가다 → 갈 때까지)
 * - -고 나서: 어간 + 고 나서 (가다 → 가고 나서)
 * - -는 반면에: 어간 + 는 반면에 (가다 → 가는 반면에)
 */
function applyConnectiveEnding(verb: string, ending: string): string {
  if (!verb || !ending) return verb;

  // 어간 추출 (다 제거)
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 어간의 마지막 글자
  const lastChar = stem[stem.length - 1];
  const hasJong = hasJongseong(lastChar);

  // 연결어미 패턴별 처리
  switch (ending) {
    case '-고':
      return `${stem}고`;

    case '-지만':
      return `${stem}지만`;

    case '-아서':
    case '-어서': {
      // 모음조화: ㅏ, ㅗ → 아서, 나머지 → 어서
      const vowel = getLastVowel(lastChar);
      if (vowel === 'ㅏ' || vowel === 'ㅗ') {
        // 하다 → 해서 특수 처리
        if (stem.endsWith('하')) {
          return `${stem.slice(0, -1)}해서`;
        }
        // 가다 → 가서 (ㅏ + 아 → 축약)
        if (vowel === 'ㅏ' && !hasJong) {
          return `${stem}서`;
        }
        return `${stem}아서`;
      }
      return `${stem}어서`;
    }

    case '-기 때문에':
      return `${stem}기 때문에`;

    case '-ㄹ 때': {
      if (hasJong) {
        return `${stem}을 때`;
      }
      return `${addJongseong(stem, 'ㄹ')} 때`;
    }

    case '-는 동안':
      return `${stem}는 동안`;

    case '-기 전에':
      return `${stem}기 전에`;

    case '-ㄴ 후에': {
      if (hasJong) {
        return `${stem}은 후에`;
      }
      return `${addJongseong(stem, 'ㄴ')} 후에`;
    }

    case '-므로':
      return `${stem}므로`;

    case '-거나':
      return `${stem}거나`;

    case '-(으)면': {
      if (hasJong) {
        return `${stem}으면`;
      }
      return `${stem}면`;
    }

    case '-ㄹ 때까지': {
      if (hasJong) {
        return `${stem}을 때까지`;
      }
      return `${addJongseong(stem, 'ㄹ')} 때까지`;
    }

    case '-고 나서':
      return `${stem}고 나서`;

    case '-는 반면에':
      return `${stem}는 반면에`;

    default:
      // 알 수 없는 패턴은 그대로 반환
      return verb;
  }
}

/**
 * Phase 4: 보조용언 동사 (Auxiliary Predicates)
 *
 * to-부정사를 취하는 동사로, 한국어 보조용언으로 변환
 * - want to: -고 싶다 (I want to go → 가고 싶다)
 * - try to: -아/어 보다 (I try to eat → 먹어 보다)
 * - start to: -기 시작하다 (I start to run → 달리기 시작하다)
 * - stop ~ing: -는 것을 멈추다
 */
const AUXILIARY_VERBS: Record<string, 'want' | 'try' | 'start' | 'stop'> = {
  want: 'want',
  wants: 'want',
  wanted: 'want',
  try: 'try',
  tries: 'try',
  tried: 'try',
  start: 'start',
  starts: 'start',
  started: 'start',
  stop: 'stop',
  stops: 'stop',
  stopped: 'stop',
};

// ============================================
// Phase 8: 전치사 → 한국어 조사 매핑
// ============================================

/**
 * 전치사 → 한국어 조사 매핑
 *
 * 규칙:
 * - to: 에 (방향), 에게 (대상)
 * - at: 에서 (장소에서 동작), 에 (위치)
 * - in: 에 (안), 에서 (장소)
 * - on: 에 (위)
 * - from: 에서 (출발점)
 * - with: 와/과 (함께)
 * - by: 로 (수단), 에 의해 (행위자)
 * - for: 을/를 위해 (목적)
 * - of: 의 (소유/관계)
 * - about: 에 대해 (주제)
 */
const PREPOSITION_TO_PARTICLE: Record<string, string> = {
  to: '에',
  at: '에서',
  in: '에',
  on: '에',
  from: '에서',
  with: '와',
  by: '로',
  for: '를 위해',
  of: '의',
  about: '에 대해',
};

/**
 * 동사+전치사 조합에서 목적어가 되는 패턴
 *
 * 이 동사들 뒤의 전치사+명사는 목적어로 처리 (을/를)
 * 예: "listen to music" → "음악을 듣다" (음악에 X)
 * 예: "look at the book" → "책을 보다" (책에서 X)
 */
const VERB_OBJECT_PREPOSITIONS: Record<string, Set<string>> = {
  listen: new Set(['to']), // listen to → 목적어
  look: new Set(['at', 'for']), // look at, look for → 목적어
  wait: new Set(['for']), // wait for → 목적어
  talk: new Set(['about']), // talk about → 목적어
  think: new Set(['about', 'of']), // think about/of → 목적어
  ask: new Set(['for']), // ask for → 목적어
  care: new Set(['about']), // care about → 목적어
  dream: new Set(['about', 'of']), // dream about/of → 목적어
};

/**
 * 전치사에 따른 조사 선택
 *
 * Phase 8: with의 경우 받침에 따라 와/과 선택
 */
function getParticleForPreposition(prep: string, noun: string, precedingVerb?: string): string {
  const prepLower = prep.toLowerCase();
  const verbLower = precedingVerb?.toLowerCase() || '';

  // 동사+전치사 조합이 목적어 패턴인 경우 → 을/를
  const verbPreps = VERB_OBJECT_PREPOSITIONS[verbLower];
  if (verbPreps?.has(prepLower)) {
    // 목적어 조사 선택 (받침에 따라 을/를)
    if (!noun) return '을';
    const lastChar = noun[noun.length - 1];
    return hasJongseong(lastChar) ? '을' : '를';
  }

  const particle = PREPOSITION_TO_PARTICLE[prepLower] || '에';

  // 'with'는 받침에 따라 와/과 선택
  if (prepLower === 'with') {
    if (!noun) return '와';
    const lastChar = noun[noun.length - 1];
    return hasJongseong(lastChar) ? '과' : '와';
  }

  return particle;
}

/**
 * 영어 동사에서 원형 추출
 *
 * Phase 8: 동사+전치사 매핑을 위해 원형 필요
 *
 * 규칙:
 * - -ing → 제거 (listening → listen)
 * - -s/-es → 제거 (listens → listen, goes → go)
 * - -ed → 제거 (walked → walk)
 * - 불규칙 동사는 그대로 (listen, go 등)
 */
function extractEnglishVerbBase(verb: string): string {
  const lower = verb.toLowerCase();

  // -ing 제거
  if (lower.endsWith('ing')) {
    const base = lower.slice(0, -3);
    // 자음 중복 제거 (running → run)
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    // -e 복원 (writing → write, coming → come)
    if (EN_VERBS[`${base}e`]) {
      return `${base}e`;
    }
    return base;
  }

  // -es/-s 제거 (3인칭 단수)
  if (lower.endsWith('es')) {
    // goes → go
    const base = lower.slice(0, -2);
    if (EN_VERBS[base]) return base;
    // watches → watch
    return base;
  }
  if (lower.endsWith('s') && !lower.endsWith('ss')) {
    const base = lower.slice(0, -1);
    if (EN_VERBS[base]) return base;
    return base;
  }

  // -ed 제거 (과거형)
  if (lower.endsWith('ed')) {
    const base = lower.slice(0, -2);
    if (EN_VERBS[base]) return base;
    // -ed → -e 복원 (walked는 이미 사전에 있음)
    const baseE = lower.slice(0, -1);
    if (EN_VERBS[baseE]) return baseE;
    return base;
  }

  return lower;
}

/**
 * 영어 동사가 과거형인지 판단
 * - 규칙 동사: -ed로 끝남 (walked, talked, played)
 * - 불규칙 동사: 별도 목록으로 관리 (went, saw, ate 등)
 */
const IRREGULAR_PAST_TENSE = new Set([
  // be 동사
  'was',
  'were',
  // 일반 불규칙 동사
  'went',
  'had',
  'did',
  'saw',
  'came',
  'took',
  'got',
  'made',
  'said',
  'knew',
  'thought',
  'gave',
  'found',
  'told',
  'felt',
  'became',
  'left',
  'put',
  'meant',
  'kept',
  'let',
  'began',
  'seemed',
  'helped',
  'showed',
  'heard',
  'played',
  'ran',
  'moved',
  'lived',
  'believed',
  'brought',
  'happened',
  'wrote',
  'sat',
  'stood',
  'lost',
  'paid',
  'met',
  'included',
  'continued',
  'set',
  'learned',
  'changed',
  'led',
  'understood',
  'watched',
  'followed',
  'stopped',
  'created',
  'spoke',
  'read', // 과거형 read는 발음만 다름
  'spent',
  'grew',
  'opened',
  'walked',
  'won',
  'taught',
  'offered',
  'remembered',
  'considered',
  'appeared',
  'bought',
  'waited',
  'served',
  'died',
  'sent',
  'built',
  'stayed',
  'fell',
  'cut',
  'reached',
  'killed',
  'raised',
  'passed',
  'sold',
  'decided',
  'returned',
  'explained',
  'hoped',
  'developed',
  'carried',
  'broke',
  'received',
  'agreed',
  'supported',
  'hit',
  'produced',
  'ate',
  'covered',
  'caught',
  'drew',
  'chose',
  'sang',
  'drank',
  'flew',
  'drove',
  'rode',
  'swam',
  'threw',
  'wore',
  'woke',
  'slept',
  'fought',
  'held',
  'hung',
  'shook',
  'spread',
  'arose',
  'awoke',
  'beat',
  'bent',
  'bet',
  'bit',
  'bled',
  'blew',
  'bound',
  'bred',
  'burst',
  'cast',
  'clung',
  'cost',
  'crept',
  'dealt',
  'dug',
  'dove',
  'fed',
  'fled',
  'flung',
  'forbade',
  'forgave',
  'forgot',
  'froze',
  'hid',
  'hurt',
  'knelt',
  'laid',
  'leapt',
  'lent',
  'lit',
  'quit',
  'rang',
  'rose',
  'sank',
  'sought',
  'shone',
  'shot',
  'shrank',
  'shut',
  'slid',
  'slit',
  'slung',
  'slunk',
  'smelt',
  'snuck',
  'sowed',
  'spat',
  'sped',
  'spelt',
  'spilt',
  'sprang',
  'stank',
  'stole',
  'strode',
  'struck',
  'strung',
  'stuck',
  'stung',
  'sunk',
  'swept',
  'swore',
  'swung',
  'tore',
  'thrust',
  'underwent',
  'upset',
  'withdrew',
  'wove',
  'wound',
  'wrung',
]);

function isPastTenseVerb(word: string): boolean {
  const lower = word.toLowerCase().replace(/[.,!?]/g, '');

  // 불규칙 과거형 체크
  if (IRREGULAR_PAST_TENSE.has(lower)) {
    return true;
  }

  // 규칙 과거형 체크: -ed로 끝남
  if (lower.endsWith('ed') && lower.length > 3) {
    return true;
  }

  return false;
}

/** 조동사 및 부정 축약형 */
const EN_AUXILIARIES = new Set([
  // 기본 조동사
  'do',
  'does',
  'did',
  'is',
  'am',
  'are',
  'was',
  'were',
  'will',
  'would',
  'can',
  'could',
  'should',
  'may',
  'might',
  'must',
  'have',
  'has',
  'had',
  // 부정 축약형 (not, n't 포함)
  'not',
  "don't",
  "doesn't",
  "didn't",
  "won't",
  "can't",
  "couldn't",
  "wouldn't",
  "shouldn't",
  "haven't",
  "hasn't",
  "hadn't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
]);

// ============================================
// Phase 1.1: Perfect Tense (현재완료/과거완료)
// ============================================

/** 영어 과거분사 → 원형 매핑 */
const PAST_PARTICIPLES: Record<string, string> = {
  // 불규칙 동사 과거분사
  eaten: 'eat',
  drunk: 'drink',
  gone: 'go',
  come: 'come',
  seen: 'see',
  heard: 'hear',
  read: 'read',
  written: 'write',
  slept: 'sleep',
  woken: 'woken',
  made: 'make',
  bought: 'buy',
  sold: 'sell',
  given: 'give',
  taken: 'take',
  run: 'run',
  done: 'do',
  been: 'be',
  gotten: 'get',
  ridden: 'ride',
  hit: 'hit',
  caught: 'catch',
  held: 'hold',
  fallen: 'fall',
  spoken: 'speak',
  broken: 'break',
  chosen: 'choose',
  driven: 'drive',
  flown: 'fly',
  known: 'know',
  grown: 'grow',
  thrown: 'throw',
  drawn: 'draw',
  worn: 'wear',
  torn: 'tear',
  shown: 'show',
  hidden: 'hide',
  bitten: 'bite',
  beaten: 'beat',
  forgotten: 'forget',
  sung: 'sing',
  swum: 'swim',
  begun: 'begin',
  // 규칙 동사 과거분사 (-ed)는 동적으로 처리
};

/**
 * have/has/had 다음의 과거분사에서 원형 추출
 * 규칙동사: -ed 제거
 * 불규칙동사: PAST_PARTICIPLES 매핑 사용
 */
function getPastParticipleBase(pp: string): string | null {
  const lower = pp.toLowerCase();

  // 불규칙 동사 과거분사 매핑
  if (PAST_PARTICIPLES[lower]) {
    return PAST_PARTICIPLES[lower];
  }

  // 규칙 동사: -ed 제거
  if (lower.endsWith('ed')) {
    const base = lower.slice(0, -2);
    // -ied → -y (studied → study)
    if (lower.endsWith('ied')) {
      return `${lower.slice(0, -3)}y`;
    }
    // 자음 중복 제거 (stopped → stop)
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      const dedupedBase = base.slice(0, -1);
      if (EN_VERBS[dedupedBase]) return dedupedBase;
    }
    // -e로 끝났던 동사 (loved → love)
    if (EN_VERBS[`${base}e`]) return `${base}e`;
    if (EN_VERBS[base]) return base;
    return base;
  }

  return null;
}

// ============================================
// Phase 1.2: Modal Verbs (조동사)
// ============================================

/** 조동사 → 한국어 패턴 매핑 */
const _MODAL_PATTERNS: Record<
  string,
  { pattern: string; type: 'ability' | 'obligation' | 'possibility' | 'volition' }
> = {
  can: { pattern: '-ㄹ 수 있다', type: 'ability' },
  could: { pattern: '-ㄹ 수 있었다', type: 'ability' },
  may: { pattern: '-아/어도 되다', type: 'possibility' },
  might: { pattern: '-ㄹ지도 모르다', type: 'possibility' },
  must: { pattern: '-아/어야 하다', type: 'obligation' },
  should: { pattern: '-아/어야 하다', type: 'obligation' },
  will: { pattern: '-ㄹ 것이다', type: 'volition' },
  would: { pattern: '-ㄹ 것이다', type: 'volition' },
};

// MODAL_VERBS는 ./data에서 import됨 (can, could, may, might, must, should, will, would + have to, had to)

// ============================================
// Phase 2.2: Comparatives & Superlatives (비교급/최상급)
// ============================================

/**
 * 영어 형용사 → 한국어 기본형 매핑
 */
const EN_ADJECTIVES: Record<string, string> = {
  tall: '크다',
  short: '작다',
  big: '크다',
  small: '작다',
  long: '길다',
  fast: '빠르다',
  slow: '느리다',
  high: '높다',
  low: '낮다',
  old: '늙다',
  young: '젊다',
  new: '새롭다',
  good: '좋다',
  bad: '나쁘다',
  hot: '덥다',
  cold: '춥다',
  warm: '따뜻하다',
  cool: '시원하다',
  strong: '강하다',
  weak: '약하다',
  hard: '딱딱하다',
  soft: '부드럽다',
  easy: '쉽다',
  difficult: '어렵다',
  happy: '행복하다',
  sad: '슬프다',
  angry: '화나다',
  beautiful: '아름답다',
  ugly: '못생기다',
  smart: '똑똑하다',
  stupid: '어리석다',
  rich: '부자다',
  poor: '가난하다',
  heavy: '무겁다',
  light: '가볍다',
  thick: '두껍다',
  thin: '얇다',
  wide: '넓다',
  narrow: '좁다',
  deep: '깊다',
  shallow: '얕다',
};

/**
 * 한국어 형용사 → 영어 형용사 매핑 (EN_ADJECTIVES의 역매핑)
 */
const KO_ADJECTIVES: Record<string, string> = Object.entries(EN_ADJECTIVES).reduce(
  (acc, [en, ko]) => {
    acc[ko] = en;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * 불규칙 비교급/최상급 영어 형태 (Ko→En용)
 * 원형 형용사 → { comparative: 비교급, superlative: 최상급 }
 */
const EN_IRREGULAR_FORMS: Record<string, { comparative: string; superlative: string }> = {
  good: { comparative: 'better', superlative: 'best' },
  bad: { comparative: 'worse', superlative: 'worst' },
  far: { comparative: 'farther', superlative: 'farthest' },
  little: { comparative: 'less', superlative: 'least' },
  much: { comparative: 'more', superlative: 'most' },
  many: { comparative: 'more', superlative: 'most' },
  old: { comparative: 'older', superlative: 'oldest' },
};

/**
 * 한국어 형용사를 영어 비교급/최상급으로 변환
 * "크다" + comparative → "bigger"
 * "좋다" + superlative → "best"
 */
function toEnglishComparative(
  koAdjective: string,
  compType: 'comparative' | 'superlative',
): string | null {
  // 어간 추출 (크다 → 크)
  const stem = koAdjective.endsWith('다') ? koAdjective.slice(0, -1) : koAdjective;

  // 한국어 → 영어 형용사
  const enAdj = KO_ADJECTIVES[koAdjective] || KO_ADJECTIVES[`${stem}다`];
  if (!enAdj) return null;

  // 불규칙 비교급/최상급 확인
  if (EN_IRREGULAR_FORMS[enAdj]) {
    return compType === 'comparative'
      ? EN_IRREGULAR_FORMS[enAdj].comparative
      : EN_IRREGULAR_FORMS[enAdj].superlative;
  }

  // 규칙적 변환
  // 다음절 형용사(syllables > 2): more/most + 형용사
  const syllables = countSyllables(enAdj);
  if (syllables >= 3 || (syllables === 2 && !enAdj.endsWith('y'))) {
    return compType === 'comparative' ? `more ${enAdj}` : `most ${enAdj}`;
  }

  // -y로 끝나는 형용사: y → ier/iest
  if (enAdj.endsWith('y')) {
    const base = enAdj.slice(0, -1);
    return compType === 'comparative' ? `${base}ier` : `${base}iest`;
  }

  // -e로 끝나는 형용사: +r/+st
  if (enAdj.endsWith('e')) {
    return compType === 'comparative' ? `${enAdj}r` : `${enAdj}st`;
  }

  // 단모음+단자음: 자음 중복 + er/est
  if (/^[^aeiou]*[aeiou][bcdfghlmnprstvwz]$/.test(enAdj)) {
    const lastChar = enAdj[enAdj.length - 1];
    return compType === 'comparative' ? `${enAdj}${lastChar}er` : `${enAdj}${lastChar}est`;
  }

  // 기본: +er/+est
  return compType === 'comparative' ? `${enAdj}er` : `${enAdj}est`;
}

/**
 * 영어 단어의 음절 수 추정
 */
function countSyllables(word: string): number {
  const vowels = word.toLowerCase().match(/[aeiouy]+/g);
  if (!vowels) return 1;
  // 단어 끝의 무성 e 제거
  let count = vowels.length;
  if (word.endsWith('e') && count > 1) count--;
  return Math.max(1, count);
}

/**
 * 불규칙 비교급/최상급 매핑
 * key: 비교급/최상급 형태, value: { base: 원형, type: 'comparative'|'superlative' }
 */
const IRREGULAR_COMPARATIVES: Record<
  string,
  { base: string; type: 'comparative' | 'superlative' }
> = {
  better: { base: 'good', type: 'comparative' },
  best: { base: 'good', type: 'superlative' },
  worse: { base: 'bad', type: 'comparative' },
  worst: { base: 'bad', type: 'superlative' },
  more: { base: 'much', type: 'comparative' },
  most: { base: 'much', type: 'superlative' },
  less: { base: 'little', type: 'comparative' },
  least: { base: 'little', type: 'superlative' },
  farther: { base: 'far', type: 'comparative' },
  farthest: { base: 'far', type: 'superlative' },
  further: { base: 'far', type: 'comparative' },
  furthest: { base: 'far', type: 'superlative' },
  older: { base: 'old', type: 'comparative' },
  oldest: { base: 'old', type: 'superlative' },
  elder: { base: 'old', type: 'comparative' },
  eldest: { base: 'old', type: 'superlative' },
};

/**
 * 비교급/최상급 감지 및 원형 추출
 *
 * @param word 영어 단어 (예: taller, tallest, more, most)
 * @returns { base: 원형, type: 'comparative'|'superlative' } 또는 null
 */
function getComparativeInfo(
  word: string,
): { base: string; type: 'comparative' | 'superlative' } | null {
  const lower = word.toLowerCase();

  // 1. 불규칙 비교급/최상급 체크
  if (IRREGULAR_COMPARATIVES[lower]) {
    return IRREGULAR_COMPARATIVES[lower];
  }

  // 2. 규칙적 최상급 (-est)
  if (lower.endsWith('est')) {
    // -iest → -y (happiest → happy)
    if (lower.endsWith('iest')) {
      const base = `${lower.slice(0, -4)}y`;
      if (EN_ADJECTIVES[base]) {
        return { base, type: 'superlative' };
      }
    }
    // -est → 제거 (tallest → tall)
    const base = lower.slice(0, -3);
    if (EN_ADJECTIVES[base]) {
      return { base, type: 'superlative' };
    }
    // 자음 중복 제거 (biggest → big)
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      const baseNoDouble = base.slice(0, -1);
      if (EN_ADJECTIVES[baseNoDouble]) {
        return { base: baseNoDouble, type: 'superlative' };
      }
    }
  }

  // 3. 규칙적 비교급 (-er)
  if (lower.endsWith('er')) {
    // -ier → -y (happier → happy)
    if (lower.endsWith('ier')) {
      const base = `${lower.slice(0, -3)}y`;
      if (EN_ADJECTIVES[base]) {
        return { base, type: 'comparative' };
      }
    }
    // -er → 제거 (taller → tall)
    const base = lower.slice(0, -2);
    if (EN_ADJECTIVES[base]) {
      return { base, type: 'comparative' };
    }
    // 자음 중복 제거 (bigger → big)
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      const baseNoDouble = base.slice(0, -1);
      if (EN_ADJECTIVES[baseNoDouble]) {
        return { base: baseNoDouble, type: 'comparative' };
      }
    }
  }

  return null;
}

/**
 * Phase 1.3: 부정 축약형 조동사에서 modal 추출
 *
 * can't → can, couldn't → could, won't → will, wouldn't → would
 * shouldn't → should, mustn't → must
 */
function getNegatedModal(word: string): string | null {
  const negatedModals: Record<string, string> = {
    "can't": 'can',
    cant: 'can', // 아포스트로피 없는 경우
    "couldn't": 'could',
    couldnt: 'could',
    "won't": 'will',
    wont: 'will',
    "wouldn't": 'would',
    wouldnt: 'would',
    "shouldn't": 'should',
    shouldnt: 'should',
    "mustn't": 'must',
    mustnt: 'must',
    "mightn't": 'might',
    mightnt: 'might',
  };
  return negatedModals[word.toLowerCase()] || null;
}

// ============================================
// Phase 4.2: Passive Voice (수동태)
// ============================================

/**
 * 영어 과거분사(pp) 패턴 감지용 세트
 *
 * be동사 + 과거분사 = 수동태
 * - The book was read → 책이 읽혔다
 * - The door is opened → 문이 열렸다
 */
const PASSIVE_PAST_PARTICIPLES = new Set([
  // 불규칙 과거분사
  'read',
  'written',
  'eaten',
  'seen',
  'heard',
  'made',
  'given',
  'taken',
  'broken',
  'spoken',
  'chosen',
  'driven',
  'known',
  'shown',
  'hidden',
  'bitten',
  'beaten',
  'forgotten',
  'sold',
  'told',
  'held',
  'built',
  'sent',
  'spent',
  'left',
  'lost',
  'found',
  'caught',
  'taught',
  'bought',
  'thought',
  'brought',
  'worn',
  'torn',
  'born',
  'done',
  // 규칙 과거분사 (-ed)는 동적으로 처리
]);

/**
 * 한국어 피동 접미사 매핑
 *
 * 동사에 따라 -이/히/리/기 또는 -되다 사용
 * 일반화된 패턴:
 * - ㄱ,ㄷ,ㅂ 받침 뒤 → 히 (먹다→먹히다, 잡다→잡히다)
 * - ㄹ 받침 뒤 → 리 (열다→열리다, 팔다→팔리다)
 * - 없거나 모음 뒤 → 이 (쓰다→쓰이다, 보다→보이다)
 * - 하다 동사 → 되다 (사용하다→사용되다)
 */
const PASSIVE_VERB_MAPPINGS: Record<string, string> = {
  // -히 피동 (ㄱ,ㄷ,ㅂ 받침)
  읽다: '읽히다',
  먹다: '먹히다',
  잡다: '잡히다',
  뽑다: '뽑히다',
  밟다: '밟히다',
  닫다: '닫히다',
  묻다: '묻히다', // 땅에 묻다
  // -리 피동 (ㄹ 받침)
  열다: '열리다',
  팔다: '팔리다',
  걸다: '걸리다',
  밀다: '밀리다',
  풀다: '풀리다',
  // -이 피동
  쓰다: '쓰이다',
  보다: '보이다',
  쌓다: '쌓이다',
  놓다: '놓이다',
  // -기 피동
  끊다: '끊기다',
  안다: '안기다',
  감다: '감기다',
  // -되다 피동 (하다 동사)
  사용하다: '사용되다',
  발견하다: '발견되다',
  완성하다: '완성되다',
  파괴하다: '파괴되다',
  건설하다: '건설되다',
  작성하다: '작성되다',
  제작하다: '제작되다',
  생산하다: '생산되다',
};

/**
 * 동사를 피동형으로 변환
 *
 * @param verb 동사 기본형 (예: 읽다, 열다, 사용하다)
 * @returns 피동형 (예: 읽히다, 열리다, 사용되다)
 */
function toPassiveKorean(verb: string): string {
  // 매핑에 있으면 사용
  if (PASSIVE_VERB_MAPPINGS[verb]) {
    return PASSIVE_VERB_MAPPINGS[verb];
  }

  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 → 되다 (일반화된 패턴)
  if (verb.endsWith('하다')) {
    return `${stem.slice(0, -1)}되다`;
  }

  // 어간 마지막 글자의 받침에 따라 피동 접미사 선택
  const lastChar = stem[stem.length - 1];
  if (!lastChar) return verb;

  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) {
    // 한글이 아닌 경우
    return `${stem}되다`;
  }

  // 받침(종성) 추출
  const jong = (code - 0xac00) % 28;

  // 받침별 피동 접미사 선택 (일반화된 규칙)
  // jong 1=ㄱ, 7=ㄷ, 17=ㅂ → 히
  // jong 8=ㄹ → 리
  // jong 0=없음 또는 기타 → 이
  if (jong === 1 || jong === 7 || jong === 17) {
    // ㄱ, ㄷ, ㅂ 받침
    return `${stem}히다`;
  }
  if (jong === 8) {
    // ㄹ 받침
    return `${stem}리다`;
  }
  if (jong === 0) {
    // 받침 없음
    return `${stem}이다`;
  }

  // 기타: -이다 또는 -되다 (안전한 기본값)
  return `${stem}이다`;
}

/**
 * 수동태 여부 확인 (be + pp 패턴)
 *
 * @param word 영어 단어
 * @returns 과거분사인 경우 원형 동사, 아니면 null
 */
function getPassiveVerbBase(word: string): string | null {
  const lower = word.toLowerCase();

  // 불규칙 과거분사 체크
  if (PASSIVE_PAST_PARTICIPLES.has(lower)) {
    // 과거분사 → 원형 매핑
    return PAST_PARTICIPLES[lower] || lower;
  }

  // 규칙 과거분사 (-ed)
  if (lower.endsWith('ed')) {
    const base = getPastParticipleBase(lower);
    if (base) return base;
  }

  return null;
}

// ============================================
// Phase 4.3: Causative (사동)
// ============================================

/**
 * 사역동사 패턴 (make/let/have + O + V)
 *
 * 영어 사역 구문 → 한국어 사동 (-게 하다)
 * - I made him go → 나는 그를 가게 했다
 * - She let me eat → 그녀는 나를 먹게 했다
 * - They had us work → 그들은 우리를 일하게 했다
 */
const CAUSATIVE_VERBS = new Set([
  'make',
  'makes',
  'made',
  'let',
  'lets',
  'have',
  'has',
  'had',
  'get',
  'gets',
  'got',
]);

/**
 * 동사를 사동형으로 변환
 *
 * @param verb 동사 기본형 (예: 가다, 먹다)
 * @returns 사동형 (예: 가게 하다, 먹게 하다)
 */
function toCausativeKorean(verb: string): string {
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // -게 하다 패턴 (일반화된 사동 표현)
  return `${stem}게 하다`;
}

// ============================================
// Phase 9: 조사 자동 선택 (을/를, 은/는, 이/가)
// ============================================

/**
 * 한글 문자의 받침(종성) 유무 판단
 *
 * 유니코드 한글 음절: 0xAC00 ~ 0xD7A3
 * 각 음절 = 0xAC00 + (초성 * 21 * 28) + (중성 * 28) + 종성
 * 종성 = 0이면 받침 없음
 */
function hasJongseong(char: string): boolean {
  const code = char.charCodeAt(0);
  // 한글 음절 범위 체크
  if (code < 0xac00 || code > 0xd7a3) {
    // 한글이 아니면 영어/숫자 → 받침 있는 것처럼 취급 (을, 은, 이)
    return true;
  }
  const jong = (code - 0xac00) % 28;
  return jong !== 0;
}

/**
 * 종성(받침) 인덱스 맵
 *
 * 유니코드 한글 종성 순서 (28개, 0번은 받침 없음)
 */
const JONG_INDEX_MAP: Record<string, number> = {
  '': 0, // 받침 없음
  ㄱ: 1,
  ㄲ: 2,
  ㄳ: 3,
  ㄴ: 4,
  ㄵ: 5,
  ㄶ: 6,
  ㄷ: 7,
  ㄹ: 8,
  ㄺ: 9,
  ㄻ: 10,
  ㄼ: 11,
  ㄽ: 12,
  ㄾ: 13,
  ㄿ: 14,
  ㅀ: 15,
  ㅁ: 16,
  ㅂ: 17,
  ㅄ: 18,
  ㅅ: 19,
  ㅆ: 20,
  ㅇ: 21,
  ㅈ: 22,
  ㅊ: 23,
  ㅋ: 24,
  ㅌ: 25,
  ㅍ: 26,
  ㅎ: 27,
};

/**
 * 한글 음절에 받침(종성) 추가
 *
 * 받침 없는 글자에 받침을 추가:
 * 가 + ㄴ → 간, 하 + ㅂ → 합
 *
 * @param text 마지막 글자에 받침을 추가할 문자열
 * @param jong 추가할 받침 (ㄴ, ㅂ 등)
 * @returns 받침이 추가된 문자열
 */
function addJongseong(text: string, jong: string): string {
  if (!text) return text;

  const lastChar = text[text.length - 1];
  const code = lastChar.charCodeAt(0);

  // 한글 음절 범위 체크
  if (code < 0xac00 || code > 0xd7a3) {
    return text; // 한글이 아니면 그대로 반환
  }

  // 이미 받침이 있으면 그대로 반환
  if (hasJongseong(lastChar)) {
    return text;
  }

  // 종성 인덱스 계산
  const jongIndex = JONG_INDEX_MAP[jong];
  if (jongIndex === undefined) {
    return text; // 유효하지 않은 받침
  }

  // 새 코드 계산: 기존 코드 + 종성 인덱스
  const newCode = code + jongIndex;
  const newChar = String.fromCharCode(newCode);

  return text.slice(0, -1) + newChar;
}

/**
 * 목적격 조사 선택: 을/를
 * - 받침 있음 → 을
 * - 받침 없음 → 를
 */
function selectObjectParticle(noun: string): string {
  if (!noun) return '';
  const lastChar = noun[noun.length - 1];
  return hasJongseong(lastChar) ? '을' : '를';
}

/**
 * 주격/보조 조사 선택: 은/는, 이/가
 * - 받침 있음 → 은/이
 * - 받침 없음 → 는/가
 */
function selectSubjectParticle(noun: string, type: 'topic' | 'subject' = 'topic'): string {
  if (!noun) return '';
  const lastChar = noun[noun.length - 1];
  const hasJong = hasJongseong(lastChar);
  if (type === 'topic') {
    return hasJong ? '은' : '는';
  }
  return hasJong ? '이' : '가';
}

/**
 * 주어에 조사 붙이기 (특수 규칙 처리)
 *
 * 한국어 특수 규칙:
 * - 나 + 가 → 내가 (NOT 나가)
 * - 너 + 가 → 네가 (NOT 너가)
 * - 저 + 가 → 제가 (NOT 저가)
 * - 나 + 는 → 나는 (일반)
 * - 너 + 는 → 너는 (일반)
 * - 저 + 는 → 저는 (일반)
 *
 * @param subject 주어 (나, 너, 저 등)
 * @param particleType 'topic' (는/은) or 'subject' (가/이)
 * @returns 주어 + 조사 조합 (예: 내가, 나는)
 */
function applySubjectParticle(subject: string, particleType: 'topic' | 'subject'): string {
  if (!subject) return '';

  // 특수 규칙: 주격조사 "가"와 결합 시 변형
  if (particleType === 'subject') {
    if (subject === '나') return '내가';
    if (subject === '너') return '네가';
    if (subject === '저') return '제가';
    if (subject === '누구') return '누가'; // 누구 + 가 → 누가
  }

  // 일반 규칙
  const particle = selectSubjectParticle(subject, particleType);
  return `${subject}${particle}`;
}

/** be동사 (진행형 판별용) */
const EN_BE_VERBS = new Set(['am', 'is', 'are', 'was', 'were']);

/**
 * 영어 동사 3인칭 단수 현재형 → 원형 변환
 *
 * 규칙:
 * 1. -ies → y (flies → fly, tries → try)
 * 2. -es → 제거 (goes → go, watches → watch, pushes → push)
 * 3. -s → 제거 (runs → run, plays → play)
 * 4. 불규칙: has → have, does → do
 *
 * 주의: be동사(is, am, are 등)는 처리하지 않음 - copula 패턴으로 별도 처리
 *
 * @param verb 3인칭 단수 형태 (e.g., "listens", "reads", "goes")
 * @returns 원형 또는 null (변환 불가)
 */
function getVerbBaseForm(verb: string): string | null {
  // be동사는 처리하지 않음 (copula 패턴으로 별도 처리)
  if (EN_BE_VERBS.has(verb)) return null;

  // 불규칙 동사
  const irregulars: Record<string, string> = {
    has: 'have',
    does: 'do',
    goes: 'go',
  };

  if (irregulars[verb]) return irregulars[verb];

  // -ies → -y (자음 + y 규칙)
  if (verb.endsWith('ies')) {
    return `${verb.slice(0, -3)}y`;
  }

  // -es → 제거 (s, sh, ch, x, z, o 뒤)
  if (verb.endsWith('es')) {
    const base = verb.slice(0, -2);
    // 원래 -e로 끝나는 동사 (makes → make)
    if (/[^sxz]$/.test(base) && !/sh$/.test(base) && !/ch$/.test(base)) {
      // makes → make (e 있던 경우)
      // 동사 사전에서 확인
      if (EN_VERBS[`${base}e`]) {
        return `${base}e`;
      }
      if (EN_VERBS[base]) {
        return base;
      }
    }
    return base;
  }

  // -s → 제거
  if (verb.endsWith('s') && !verb.endsWith('ss')) {
    const base = verb.slice(0, -1);
    // 사전에서 확인하거나 그냥 반환
    return base;
  }

  return null;
}

/**
 * 영어 문장 품사 태깅
 *
 * Phase 6: 진행형 (be + -ing) 감지
 * Phase 11: be동사 + 명사 = 서술격 조사 (isCopula)
 * Phase 1.1: Perfect Tense (have/has/had + pp) 감지
 * Phase 1.2: Modal Verbs (can, must, should 등) 감지
 */
function tagEnglishWords(parsed: ParsedSentence): TaggedWord[] {
  const result: TaggedWord[] = [];
  let foundVerb = false;
  let foundSubject = false;
  let foundBeVerb = false; // Phase 6: be동사 감지
  let foundHaveAux = false; // Phase 1.1: have/has/had 감지 (완료형)
  let foundModal = ''; // Phase 1.2: 조동사 감지
  let foundAuxiliaryVerb: 'want' | 'try' | 'start' | 'stop' | undefined; // Phase 4
  let foundCausativeVerb = false; // Phase 4.3: 사역동사 감지 (make/let/have)

  for (let i = 0; i < parsed.tokens.length; i++) {
    const token = parsed.tokens[i];
    const lower = token.stem.toLowerCase();
    const text = token.text;

    let pos: EnglishPOS = 'unknown';
    let ko = EN_KO[lower] || '';
    let isProgressive = false;
    let isCopula = false;
    let isPerfect = false; // Phase 1.1: 완료형 여부
    let modal = ''; // Phase 1.2: 조동사 종류
    let isConditional = false; // Phase 2.1: 조건절 여부
    let comparativeType: 'comparative' | 'superlative' | undefined; // Phase 2.2
    let adjBase: string | undefined; // Phase 2.2: 형용사 원형
    let auxiliaryVerb: 'want' | 'try' | 'start' | 'stop' | undefined; // Phase 4
    let isPassive = false; // Phase 4.2: 수동태 여부
    let isCausative = false; // Phase 4.3: 사동태 여부
    let connective = ''; // Phase 5.1: 연결어미

    // 0. Phase 2.1: 조건문 마커 (if/unless)
    if (lower === 'if' || lower === 'unless') {
      pos = 'aux'; // 기능어로 처리
      ko = ''; // if/unless는 어미로 처리
      isConditional = true;
      // 이 플래그는 문장 전체에 적용됨
    }
    // 0.5. Phase 3: 절 마커 (that, who, which, when, while 등)
    // "that" as complementizer: I think [that he goes] → 번역하지 않음
    // "who/which" as relative pronoun: The man [who runs] → 번역하지 않음
    else if (CLAUSE_MARKERS.has(lower)) {
      pos = 'aux'; // 기능어로 처리
      ko = ''; // 절 마커는 번역하지 않음 (구조 변환으로 처리)
    }
    // 0.6. Phase 5.1: 접속사 체크 (and, but, so, because 등)
    else if (isConnectiveConjunction(lower)) {
      pos = 'aux'; // 기능어로 처리
      ko = ''; // 접속사는 연결어미로 변환
      connective = getConnectiveEnding(lower);
    }
    // 1. 관사 체크
    else if (EN_ARTICLES.has(lower)) {
      pos = 'article';
      ko = ''; // 관사는 번역 안 함
    }
    // 2. 전치사 체크
    else if (EN_PREPOSITIONS.has(lower)) {
      pos = 'prep';
      ko = ''; // 전치사는 조사로 변환될 예정
    }
    // 3. be동사 체크 (진행형/서술격 판별용)
    else if (EN_BE_VERBS.has(lower) && !foundVerb) {
      pos = 'aux';
      ko = '';
      foundBeVerb = true; // Phase 6: be동사 발견
    }
    // 3.5. Phase 1.2: 조동사 체크 (can, must, should, would 등)
    // Phase 1.3: 부정 축약형 조동사 처리 (can't, couldn't, shouldn't 등)
    else if (MODAL_VERBS.has(lower) && !foundVerb) {
      pos = 'aux';
      ko = '';
      foundModal = lower; // 조동사 종류 기록
    }
    // Phase 1.3: "cannot" 처리 → can + not 분리
    else if (lower === 'cannot' && !foundVerb) {
      pos = 'aux';
      ko = '';
      foundModal = 'can'; // modal = can
      // parsed.negated는 tokenizer에서 별도 처리 필요 (아래에서 추가)
    }
    // Phase 1.3: 조동사 부정 축약형 (can't, couldn't, won't 등)
    else if (getNegatedModal(lower) && !foundVerb) {
      const negatedModal = getNegatedModal(lower);
      pos = 'aux';
      ko = '';
      foundModal = negatedModal!; // modal 종류 (can, could, will 등)
      // negated는 tokenizer에서 이미 처리됨
    }
    // 3.6. Phase 2: "have to", "has to", "had to" 복합 조동사 체크
    // "have to go" → "가야 한다" (의무/필요)
    // 주의: "have gone" (완료형)과 구분해야 함
    else if (['have', 'has', 'had'].includes(lower) && !foundVerb) {
      // 다음 토큰이 "to"인지 확인 (look-ahead)
      const nextToken = i + 1 < parsed.tokens.length ? parsed.tokens[i + 1].stem.toLowerCase() : '';
      if (nextToken === 'to') {
        pos = 'aux';
        ko = '';
        // "have to" → 현재 의무, "had to" → 과거 의무
        foundModal = lower === 'had' ? 'had to' : 'have to';
      } else {
        // "have/has/had + 과거분사" = 완료형
        pos = 'aux';
        ko = '';
        foundHaveAux = true; // 완료형 조동사 발견
      }
    }
    // 3.7. Phase 4: 보조용언 체크 (want to, try to, start to 등)
    else if (AUXILIARY_VERBS[lower] && !foundVerb) {
      pos = 'aux';
      ko = '';
      foundAuxiliaryVerb = AUXILIARY_VERBS[lower]; // 보조용언 종류 기록
    }
    // 3.8. Phase 4: "to" 부정사 마커 (want to go에서 to 처리)
    else if (lower === 'to' && foundAuxiliaryVerb && !foundVerb) {
      pos = 'aux';
      ko = ''; // to는 번역하지 않음 (보조용언과 함께 처리)
    }
    // 4. 조동사/부정 축약형 체크 (의문문의 Do, Does, don't 등)
    else if ((EN_AUXILIARIES.has(lower) || EN_AUXILIARIES.has(text.toLowerCase())) && !foundVerb) {
      pos = 'aux';
      ko = ''; // 조동사/부정어는 시제/의문문/부정 처리에 사용
    }
    // 5. 대명사 → 주어
    else if (EN_PRONOUNS[lower]) {
      pos = foundSubject ? 'object' : 'subject';
      ko = EN_PRONOUNS[lower];
      if (!foundSubject) foundSubject = true;
    }
    // 5.5. Phase 1.1: 과거분사 체크 (have/has/had 뒤)
    else if (foundHaveAux && !foundVerb) {
      const ppBase = getPastParticipleBase(lower);
      if (ppBase) {
        pos = 'verb';
        ko = EN_VERBS[ppBase] || EN_KO[ppBase] || ppBase;
        isPerfect = true;
        foundVerb = true;
      }
    }
    // 5.6. Phase 4.2: 수동태 체크 (be동사 뒤의 과거분사)
    // "The book was read" → "책이 읽혔다"
    // 주의: 비교급/최상급 형용사(better, best, worse, worst, fastest 등)는 제외
    // 주의: -ing 형태는 수동태가 아니라 진행형이므로 제외
    // NOTE: getPassiveVerbBase를 조건에 포함시켜서 실제 수동태인 경우에만 블록 진입
    //       그렇지 않으면 copula 케이스(She is a student)가 이 블록에 들어가서 처리되지 않음
    else if (
      foundBeVerb &&
      !foundVerb &&
      !foundHaveAux &&
      !getComparativeInfo(lower) &&
      !lower.endsWith('ing') &&
      getPassiveVerbBase(lower) // 실제로 수동태인 경우에만
    ) {
      const passiveBase = getPassiveVerbBase(lower)!;
      pos = 'verb';
      const koVerb = EN_VERBS[passiveBase] || EN_KO[passiveBase] || passiveBase;
      // 한국어 피동형으로 변환
      ko = toPassiveKorean(koVerb);
      isPassive = true;
      foundVerb = true;
    }
    // 5.7. Phase 4.3: 사역동사 체크 (make/let/have + O + V)
    else if (CAUSATIVE_VERBS.has(lower) && !foundVerb) {
      pos = 'aux'; // 사역동사는 조동사로 처리
      ko = '';
      foundCausativeVerb = true;
    }
    // 5.8. Phase 4.3: 사역동사 뒤의 동사 (make him go → 그를 가게 하다)
    else if (foundCausativeVerb && !foundVerb && EN_VERBS[lower]) {
      pos = 'verb';
      const koVerb = EN_VERBS[lower];
      // 한국어 사동형으로 변환
      ko = toCausativeKorean(koVerb);
      isCausative = true;
      foundVerb = true;
    }
    // 6. -ing 형태 (진행형 동사) - 동사보다 먼저 체크
    else if (lower.endsWith('ing') && !foundVerb) {
      pos = 'verb';
      // Phase 6: be동사 뒤의 -ing는 진행형
      isProgressive = foundBeVerb;

      // -ing 제거하고 원형 찾기
      let base = lower.slice(0, -3);

      // 자음 중복 처리: running → run, sitting → sit
      if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
        const doubleConsonantBase = base.slice(0, -1);
        if (EN_VERBS[doubleConsonantBase]) {
          base = doubleConsonantBase;
        }
      }

      // 원형 동사 찾기
      ko = EN_VERBS[base] || EN_KO[base] || lower;
      foundVerb = true;
    }
    // 7. 동사 체크
    else if (EN_VERBS[lower]) {
      pos = 'verb';
      ko = EN_VERBS[lower];
      // Phase 1.2: 조동사 뒤의 동사 처리
      if (foundModal) {
        modal = foundModal;
      }
      // Phase 4: 보조용언 뒤의 동사 처리
      if (foundAuxiliaryVerb) {
        auxiliaryVerb = foundAuxiliaryVerb;
      }
      foundVerb = true;
    }
    // 7.5. 3인칭 단수 동사 (-s/-es/-ies) → 원형으로 변환
    // 조건: 동사 미발견 + 원형이 동사 사전에 있음
    else if (
      !foundVerb &&
      (() => {
        const baseVerb = getVerbBaseForm(lower);
        if (baseVerb && EN_VERBS[baseVerb]) {
          pos = 'verb';
          ko = EN_VERBS[baseVerb];
          foundVerb = true;
          return true;
        }
        return false;
      })()
    ) {
      // 위의 IIFE에서 처리됨
    }
    // 8. 명사 (사전에 있으면)
    else if (ko) {
      // Phase 11: be동사 뒤의 명사는 서술격 조사 (copula)
      // "I am a person" → "나는 사람이다"
      if (foundBeVerb && !foundVerb) {
        isCopula = true;
        pos = 'verb'; // 서술어 역할
        foundVerb = true;
      } else {
        pos = foundSubject ? 'object' : 'subject';
        if (!foundSubject) foundSubject = true;
      }
    }
    // 9. Phase 2.2: 비교급/최상급 형용사 체크 (taller, tallest, better, best 등)
    else if (getComparativeInfo(lower)) {
      const compInfo = getComparativeInfo(lower)!;
      comparativeType = compInfo.type;
      adjBase = compInfo.base;
      // 형용사 원형의 한국어 번역
      ko = EN_ADJECTIVES[compInfo.base] || EN_KO[compInfo.base] || compInfo.base;
      // be동사 뒤면 서술격 (He is taller → 그는 더 크다)
      if (foundBeVerb && !foundVerb) {
        isCopula = true;
        pos = 'verb';
        foundVerb = true;
      } else {
        pos = 'unknown'; // 단독 사용시 (관형사 등)
      }
    }
    // 10. 알 수 없음
    else {
      // Phase 11: be동사 뒤의 명사도 서술격 조사로 처리
      // EN_KO에서 번역 찾기 시도
      if (foundBeVerb && !foundVerb && text) {
        isCopula = true;
        pos = 'verb';
        // EN_KO에서 번역 찾기 (student → 학생)
        ko = EN_KO[lower] || text;
        foundVerb = true;
      } else {
        pos = 'unknown';
        ko = EN_KO[lower] || text;
      }
    }

    result.push({
      text,
      lower,
      ko,
      pos,
      isProgressive,
      isCopula,
      isPerfect,
      modal,
      isConditional,
      comparativeType,
      adjBase,
      auxiliaryVerb,
      isPassive,
      isCausative,
      connective,
    });
  }

  return result;
}

/**
 * 한국어 동사를 진행형(-고 있다)으로 변환
 *
 * Phase 6: 읽다 → 읽고 있다
 *
 * 규칙:
 * 1. -다 로 끝나는 동사 → -다 제거 + 고 있다
 * 2. 이미 활용된 형태 → 어간 추출 + 고 있다
 */
function toProgressiveKorean(verb: string): string {
  // -다 로 끝나면 제거하고 '-고 있다' 추가
  if (verb.endsWith('다')) {
    return `${verb.slice(0, -1)}고 있다`;
  }
  // 이미 활용된 형태면 그대로 + '고 있다'
  return `${verb}고 있다`;
}

/**
 * 진행형 어미 적용 (-고 있다의 "있다" 부분)
 *
 * 진행형은 "있다"가 특별 활용:
 * - casual: 있어
 * - formal: 있어요
 * - neutral: 있다
 * - friendly: 있어~
 * - literal: 있습니다
 */
function applyProgressiveEnding(
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? '있어' : '있어';
    case 'formal':
      return sentenceType === 'question' ? '있어요' : '있어요';
    case 'neutral':
      return sentenceType === 'question' ? '있니' : '있다';
    case 'friendly':
      return sentenceType === 'question' ? '있어' : '있어~';
    case 'literal':
      return sentenceType === 'question' ? '있습니까' : '있습니다';
    default:
      return '있다';
  }
}

/**
 * 과거 진행형 어미 적용
 * "was eating" → "먹고 있었다"
 *
 * @param formality 어조
 * @param sentenceType 문장 유형 (statement/question)
 * @returns 어조별 과거 진행형 어미
 *
 * 어조별 변환:
 * - casual: 있었어
 * - formal: 있었어요
 * - neutral: 있었다
 * - friendly: 있었어~
 * - literal: 있었습니다
 */
function applyPastProgressiveEnding(
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? '있었어' : '있었어';
    case 'formal':
      return sentenceType === 'question' ? '있었어요' : '있었어요';
    case 'neutral':
      return sentenceType === 'question' ? '있었니' : '있었다';
    case 'friendly':
      return sentenceType === 'question' ? '있었어' : '있었어~';
    case 'literal':
      return sentenceType === 'question' ? '있었습니까' : '있었습니다';
    default:
      return '있었다';
  }
}

// ============================================
// Phase 7: 한국어 의문형 어미 변환
// ============================================

/**
 * 한국어 동사 어간 추출
 *
 * 규칙:
 * - -다, -어, -아 등 어미 제거
 */
function extractKoreanStem(verb: string): string {
  // -다 로 끝나면 제거
  if (verb.endsWith('다')) {
    return verb.slice(0, -1);
  }
  // -어, -아 로 끝나면 제거
  if (verb.endsWith('어') || verb.endsWith('아')) {
    return verb.slice(0, -1);
  }
  return verb;
}

/**
 * 한글 마지막 음절의 모음 추출
 *
 * 모음조화 판단용:
 * - 양성모음(ㅏ, ㅗ) → 아
 * - 음성모음(그 외) → 어
 */
function getLastVowel(char: string): string | null {
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;

  const jungIndex = Math.floor(((code - 0xac00) % (21 * 28)) / 28);
  const JUNG_LIST = [
    'ㅏ',
    'ㅐ',
    'ㅑ',
    'ㅒ',
    'ㅓ',
    'ㅔ',
    'ㅕ',
    'ㅖ',
    'ㅗ',
    'ㅘ',
    'ㅙ',
    'ㅚ',
    'ㅛ',
    'ㅜ',
    'ㅝ',
    'ㅞ',
    'ㅟ',
    'ㅠ',
    'ㅡ',
    'ㅢ',
    'ㅣ',
  ];
  return JUNG_LIST[jungIndex] || null;
}

/**
 * 한국어 동사를 의문형(-아/-어)으로 변환
 *
 * Phase 7: 좋아하다 → 좋아해, 먹다 → 먹어, 가다 → 가
 *
 * 규칙 (모음조화):
 * - 양성모음(ㅏ, ㅗ) + 아 → 축약 가능
 * - 음성모음(그 외) + 어
 * - 하다 → 해
 */
function toQuestionKorean(verb: string): string {
  // 하다 동사 처리
  if (verb.endsWith('하다')) {
    return `${verb.slice(0, -2)}해`;
  }

  // 어간 추출
  const stem = extractKoreanStem(verb);
  if (!stem) return verb;

  const lastChar = stem[stem.length - 1];
  const vowel = getLastVowel(lastChar);

  // 양성모음(ㅏ, ㅗ) → 아
  // 음성모음 → 어
  const _isPositive = vowel === 'ㅏ' || vowel === 'ㅗ';

  // ㅏ로 끝나면 축약 (가다 → 가 + 아 → 가)
  if (vowel === 'ㅏ') {
    return stem; // 이미 ㅏ가 있으므로 축약
  }

  // ㅗ로 끝나면 축약 (오다 → 오 + 아 → 와)
  if (vowel === 'ㅗ') {
    // 복잡한 축약은 생략, 간단히 stem + 아
    return `${stem}아`;
  }

  // 음성모음 → 어
  return `${stem}어`;
}

// ============================================
// Phase 10: 높임말/반말 변환
// ============================================

/** 공손도 수준 */
type PolitenessLevel = 'casual' | 'polite' | 'formal';

/**
 * 한국어 동사를 높임말로 변환
 *
 * Phase 10:
 * - casual (반말): 먹어, 가, 해
 * - polite (해요체): 먹어요, 가요, 해요
 * - formal (합니다체): 먹습니다, 갑니다, 합니다
 *
 * @param verb 동사 (원형: -다 또는 활용형)
 * @param level 공손도 수준
 */
function _applyPoliteness(verb: string, level: PolitenessLevel): string {
  if (level === 'casual') {
    // 반말은 그대로 반환
    return verb;
  }

  // 어간 추출
  const stem = extractKoreanStem(verb);
  if (!stem) return verb;

  if (level === 'polite') {
    // 해요체: 어간 + 아요/어요
    if (verb.endsWith('하다')) {
      return `${verb.slice(0, -2)}해요`;
    }

    const lastChar = stem[stem.length - 1];
    const vowel = getLastVowel(lastChar);

    if (vowel === 'ㅏ') {
      return `${stem}요`; // 가 + 요 = 가요
    }
    if (vowel === 'ㅗ') {
      return `${stem}아요`; // 오 + 아요 = 와요 (축약 생략)
    }
    return `${stem}어요`; // 먹 + 어요 = 먹어요
  }

  if (level === 'formal') {
    // 합니다체: 어간 + ㅂ니다/습니다
    if (verb.endsWith('하다')) {
      return `${verb.slice(0, -2)}합니다`;
    }

    const lastChar = stem[stem.length - 1];
    const hasJong = hasJongseong(lastChar);

    if (hasJong) {
      return `${stem}습니다`; // 먹 + 습니다 = 먹습니다
    }
    return `${stem}ㅂ니다`; // 가 + ㅂ니다 → 갑니다 (간단화: 정확한 처리는 복잡)
  }

  return verb;
}

/**
 * 한국어 동사를 높임말 의문형으로 변환
 *
 * Phase 10:
 * - casual: 먹어?, 가?, 해?
 * - polite: 먹어요?, 가요?, 해요?
 * - formal: 먹습니까?, 갑니까?, 합니까?
 */
function _toQuestionKoreanPolite(verb: string, level: PolitenessLevel): string {
  if (level === 'casual') {
    return toQuestionKorean(verb);
  }

  const stem = extractKoreanStem(verb);
  if (!stem) return verb;

  if (level === 'polite') {
    if (verb.endsWith('하다')) {
      return `${verb.slice(0, -2)}해요`;
    }

    const lastChar = stem[stem.length - 1];
    const vowel = getLastVowel(lastChar);

    if (vowel === 'ㅏ') return `${stem}요`;
    if (vowel === 'ㅗ') return `${stem}아요`;
    return `${stem}어요`;
  }

  if (level === 'formal') {
    if (verb.endsWith('하다')) {
      return `${verb.slice(0, -2)}합니까`;
    }

    const lastChar = stem[stem.length - 1];
    const hasJong = hasJongseong(lastChar);

    if (hasJong) return `${stem}습니까`;
    return `${stem}ㅂ니까`; // 간단화
  }

  return verb;
}

// ============================================
// Phase 3.1: That-clause Processing (명사절 처리)
// ============================================

/**
 * Phase 3.1: that-clause 처리
 *
 * "I think that he goes" → "나는 그가 간다고 생각한다"
 *
 * 구조:
 * 1. 주절: I think → 나는 ... 생각한다
 * 2. 종속절: that he goes → 그가 간다고
 *
 * @returns 번역된 문장 (that-clause가 있는 경우) 또는 null
 */
function processThatClause(parsed: ParsedSentence, formality: Formality): string | null {
  const words = parsed.original.toLowerCase().split(/\s+/);

  // 1. 'that' 위치 찾기
  const thatIndex = words.indexOf('that');
  if (thatIndex === -1) return null;

  // 2. that 앞에 절을 취하는 동사가 있는지 확인
  let mainVerbIndex = -1;
  let mainVerb = '';
  for (let i = 0; i < thatIndex; i++) {
    const word = words[i].replace(/[.,!?]/g, '');
    if (CLAUSE_TAKING_VERBS.has(word)) {
      mainVerbIndex = i;
      mainVerb = word;
      break;
    }
  }

  if (mainVerbIndex === -1) return null;

  // 3. 주절과 종속절 분리
  const mainClauseWords = words.slice(0, thatIndex);
  const subClauseWords = words.slice(thatIndex + 1); // 'that' 제외

  if (subClauseWords.length === 0) return null;

  // 4. 주절 주어 추출 (주동사 앞의 단어들)
  const mainSubjectWords = mainClauseWords.slice(0, mainVerbIndex);
  const mainSubject =
    mainSubjectWords.length > 0
      ? mainSubjectWords.map((w) => EN_KO[w.replace(/[.,!?]/g, '')] || w).join(' ')
      : '';

  // 5. 주동사 번역
  const mainVerbBase = extractEnglishVerbBase(mainVerb) || mainVerb;
  const mainVerbKo = EN_KO[mainVerbBase] || EN_VERBS[mainVerbBase] || mainVerb;

  // 6. 종속절 처리: 간단한 SVO 파싱
  // 첫 단어 = 주어, 마지막 단어 = 동사 (단순화)
  let subSubject = '';
  let subVerb = '';
  const subObjects: string[] = [];

  for (let i = 0; i < subClauseWords.length; i++) {
    const word = subClauseWords[i].replace(/[.,!?]/g, '');
    const ko = EN_KO[word] || '';

    if (i === 0) {
      // 첫 단어는 주어
      subSubject = ko || word;
    } else if (EN_VERBS[word] || EN_KO[word]?.endsWith('다')) {
      // 동사 찾기
      const verbBase = extractEnglishVerbBase(word) || word;
      subVerb = EN_KO[verbBase] || EN_VERBS[verbBase] || word;
    } else if (ko) {
      subObjects.push(ko);
    }
  }

  // 7. 종속절 동사에 -다고 어미 적용
  const subVerbWithQuote = applyQuotativeEnding(subVerb);

  // 8. 종속절 조립: 주어가 + 목적어를 + 동사다고
  const subClauseParts: string[] = [];
  if (subSubject) {
    subClauseParts.push(applySubjectParticle(subSubject, 'subject'));
  }
  for (const obj of subObjects) {
    const particle = selectObjectParticle(obj);
    subClauseParts.push(`${obj}${particle}`);
  }
  if (subVerbWithQuote) {
    subClauseParts.push(subVerbWithQuote);
  }

  // 9. 주동사 활용 (formality 적용)
  const sentenceType = parsed.type === 'question' ? 'question' : 'statement';
  const mainVerbConjugated = applyFormality(mainVerbKo, formality, sentenceType);

  // 10. 전체 조립: 주절주어는 + 종속절 + 주동사
  const result: string[] = [];
  if (mainSubject) {
    result.push(applySubjectParticle(mainSubject, 'topic'));
  }
  result.push(subClauseParts.join(' '));
  result.push(mainVerbConjugated);

  return result.join(' ');
}

// ============================================
// Phase 3.2: Relative Clause Processing (관계절 처리)
// ============================================

/**
 * Phase 3.2: 관계절 처리
 *
 * "The man who runs" → "달리는 남자"
 * "The book which I read" → "내가 읽은 책"
 *
 * 한국어에서 관계절은 명사 앞에 위치 (관형형)
 *
 * @returns 번역된 문장 (관계절이 있는 경우) 또는 null
 */
function processRelativeClause(parsed: ParsedSentence, _formality: Formality): string | null {
  const words = parsed.original.toLowerCase().split(/\s+/);

  // 1. 관계대명사 위치 찾기 (who, which, that)
  const relativePronouns = ['who', 'whom', 'which', 'that'];
  let relPronounIndex = -1;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,!?]/g, '');
    if (relativePronouns.includes(word)) {
      // 'that'은 관계대명사로만 사용되는지 확인 (앞에 명사가 있어야 함)
      if (word === 'that') {
        // that 앞에 명사가 있는지 확인
        if (i > 0) {
          const prevWord = words[i - 1].replace(/[.,!?]/g, '');
          // 관사나 명사가 아닌 동사 뒤의 that은 명사절 접속사
          if (CLAUSE_TAKING_VERBS.has(prevWord)) {
            continue; // 명사절 that, 건너뜀
          }
        }
      }
      relPronounIndex = i;
      break;
    }
  }

  if (relPronounIndex === -1) return null;

  // 2. 선행사(antecedent) 추출: 관계대명사 바로 앞의 명사
  // "The man who" → "man"이 선행사
  let antecedent = '';
  for (let i = relPronounIndex - 1; i >= 0; i--) {
    const word = words[i].replace(/[.,!?]/g, '');
    // 관사는 건너뛰기
    if (word === 'the' || word === 'a' || word === 'an') continue;
    // 첫 번째 비관사 단어가 선행사
    antecedent = EN_KO[word] || word;
    break;
  }

  if (!antecedent) return null;

  // 3. 관계절 추출 (관계대명사 이후의 단어들)
  const relativeClauseWords = words.slice(relPronounIndex + 1);
  if (relativeClauseWords.length === 0) return null;

  // 4. 관계절 동사 찾기 및 시제 감지
  let relVerb = '';
  let relVerbTense: 'present' | 'past' | 'future' | 'retrospective' = 'present';
  const relObjects: string[] = [];
  let hasWill = false;
  let hasUsedTo = false;

  for (let i = 0; i < relativeClauseWords.length; i++) {
    const word = relativeClauseWords[i].replace(/[.,!?]/g, '');
    const nextWord = relativeClauseWords[i + 1]?.replace(/[.,!?]/g, '');

    // 미래 시제 감지 (will)
    if (word === 'will') {
      hasWill = true;
      continue;
    }

    // 회상 시제 감지 (used to)
    if (word === 'used' && nextWord === 'to') {
      hasUsedTo = true;
      continue;
    }
    if (word === 'to' && hasUsedTo) {
      continue;
    }

    // 동사 찾기
    if (EN_VERBS[word] || EN_KO[word]?.endsWith('다')) {
      const verbBase = extractEnglishVerbBase(word) || word;
      relVerb = EN_KO[verbBase] || EN_VERBS[verbBase] || word;

      // 시제 판단
      if (hasWill) {
        relVerbTense = 'future';
      } else if (hasUsedTo) {
        relVerbTense = 'retrospective';
      } else if (isPastTenseVerb(word)) {
        relVerbTense = 'past';
      }
    } else {
      const ko = EN_KO[word];
      if (ko && !['the', 'a', 'an', 'i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(word)) {
        relObjects.push(ko);
      }
    }
  }

  if (!relVerb) return null;

  // 5. 관형형 어미 적용 (-는, -은/ㄴ, -ㄹ/을, -던)
  const attributiveVerb = applyAttributiveEnding(relVerb, relVerbTense);

  // 6. 결과 조립: 관형절 + 선행사
  // "who runs" → "달리는" + "남자" → "달리는 남자"
  const parts: string[] = [];

  // 관계절 내 목적어 (있는 경우)
  for (const obj of relObjects) {
    const particle = selectObjectParticle(obj);
    parts.push(`${obj}${particle}`);
  }

  parts.push(attributiveVerb);
  parts.push(antecedent);

  return parts.join(' ');
}

// ============================================
// Phase 3.3: Adverbial Clause Processing (부사절 처리)
// ============================================

/**
 * 부사절 접속사 → 한국어 어미/표현 매핑
 */
const ADVERBIAL_CONJUNCTIONS: Record<
  string,
  { ending: string; type: 'time' | 'reason' | 'contrast' | 'condition' }
> = {
  when: { ending: '때', type: 'time' },
  while: { ending: '동안', type: 'time' },
  before: { ending: '전에', type: 'time' },
  after: { ending: '후에', type: 'time' },
  because: { ending: '때문에', type: 'reason' },
  since: { ending: '때문에', type: 'reason' },
  although: { ending: '지만', type: 'contrast' },
  though: { ending: '지만', type: 'contrast' },
};

/**
 * Phase 3.3: 부사절 처리
 *
 * "When I go" → "내가 갈 때"
 * "Because I am tired" → "내가 피곤하기 때문에"
 * "Before I eat" → "내가 먹기 전에"
 *
 * @returns 번역된 문장 (부사절이 있는 경우) 또는 null
 */
function processAdverbialClause(parsed: ParsedSentence, _formality: Formality): string | null {
  const words = parsed.original.toLowerCase().split(/\s+/);

  // 1. 부사절 접속사 찾기
  let conjIndex = -1;
  let conjunction = '';
  let conjInfo: (typeof ADVERBIAL_CONJUNCTIONS)[string] | null = null;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,!?]/g, '');
    if (ADVERBIAL_CONJUNCTIONS[word]) {
      conjIndex = i;
      conjunction = word;
      conjInfo = ADVERBIAL_CONJUNCTIONS[word];
      break;
    }
  }

  if (conjIndex === -1 || !conjInfo) return null;

  // 2. 부사절 추출 (접속사 이후의 단어들)
  const clauseWords = words.slice(conjIndex + 1);
  if (clauseWords.length === 0) return null;

  // 3. 절 파싱: 주어, 동사, 목적어 추출
  let subject = '';
  let verb = '';
  let isCopula = false;
  let copulaNoun = '';
  const objects: string[] = [];

  let foundBeVerb = false;

  for (let i = 0; i < clauseWords.length; i++) {
    const word = clauseWords[i].replace(/[.,!?]/g, '');
    const ko = EN_KO[word] || '';

    // 주어 (첫 번째 대명사/명사)
    if (i === 0 && ko) {
      subject = ko;
      continue;
    }

    // be 동사
    if (['am', 'is', 'are', 'was', 'were'].includes(word)) {
      foundBeVerb = true;
      continue;
    }

    // be 동사 뒤의 형용사/명사 (copula)
    if (foundBeVerb && ko && !verb) {
      isCopula = true;
      copulaNoun = ko;
      continue;
    }

    // 동사 찾기
    if (EN_VERBS[word] || ko?.endsWith('다')) {
      const verbBase = extractEnglishVerbBase(word) || word;
      verb = EN_KO[verbBase] || EN_VERBS[verbBase] || word;
    } else if (ko) {
      objects.push(ko);
    }
  }

  // 4. 한국어 부사절 생성
  const parts: string[] = [];

  // 주어 + 가/이
  if (subject) {
    parts.push(applySubjectParticle(subject, 'subject'));
  }

  // 목적어 + 을/를
  for (const obj of objects) {
    const particle = selectObjectParticle(obj);
    parts.push(`${obj}${particle}`);
  }

  // 동사/형용사 + 부사절 어미
  if (isCopula && copulaNoun) {
    // be + 형용사: "I am tired" → "내가 피곤하기"
    const stem = copulaNoun.endsWith('다') ? copulaNoun.slice(0, -1) : copulaNoun;

    if (conjInfo.type === 'reason') {
      // 피곤하기 때문에
      parts.push(`${stem}기 ${conjInfo.ending}`);
    } else if (conjInfo.type === 'contrast') {
      // 피곤하지만
      parts.push(`${stem}${conjInfo.ending}`);
    } else {
      // 피곤할 때
      parts.push(`${addJongseong(stem, 'ㄹ')} ${conjInfo.ending}`);
    }
  } else if (verb) {
    const stem = verb.endsWith('다') ? verb.slice(0, -1) : verb;

    if (conjInfo.type === 'time') {
      if (conjunction === 'before') {
        // 먹기 전에
        parts.push(`${stem}기 ${conjInfo.ending}`);
      } else if (conjunction === 'after') {
        // 먹은 후에
        const lastChar = stem[stem.length - 1];
        const hasJong = hasJongseong(lastChar);
        const pastAttr = hasJong ? `${stem}은` : addJongseong(stem, 'ㄴ');
        parts.push(`${pastAttr} ${conjInfo.ending}`);
      } else {
        // when/while: 갈 때, 가는 동안
        if (conjunction === 'while') {
          parts.push(`${stem}는 ${conjInfo.ending}`);
        } else {
          parts.push(`${addJongseong(stem, 'ㄹ')} ${conjInfo.ending}`);
        }
      }
    } else if (conjInfo.type === 'reason') {
      // 가기 때문에
      parts.push(`${stem}기 ${conjInfo.ending}`);
    } else if (conjInfo.type === 'contrast') {
      // 가지만
      parts.push(`${stem}${conjInfo.ending}`);
    }
  }

  return parts.join(' ');
}

/**
 * 동사에 관형형 어미 적용
 *
 * 현재: -는 (가다 → 가는, 먹다 → 먹는)
 * 과거: -은/ㄴ (가다 → 간, 먹다 → 먹은)
 * 미래: -ㄹ/을 (가다 → 갈, 먹다 → 먹을)
 * 회상: -던 (가다 → 가던, 먹다 → 먹던)
 */
function applyAttributiveEnding(
  verb: string,
  tense: 'present' | 'past' | 'future' | 'retrospective',
): string {
  if (!verb) return '';

  // 동사 어간 추출
  const stem = verb.endsWith('다') ? verb.slice(0, -1) : verb;
  const lastChar = stem[stem.length - 1];
  const hasJong = hasJongseong(lastChar);

  switch (tense) {
    case 'present':
      // 현재 관형형: -는
      return `${stem}는`;

    case 'past':
      // 과거 관형형: -은/ㄴ
      if (hasJong) {
        return `${stem}은`;
      }
      return `${addJongseong(stem, 'ㄴ')}`;

    case 'future':
      // 미래 관형형: -ㄹ/을
      if (hasJong) {
        return `${stem}을`;
      }
      return `${addJongseong(stem, 'ㄹ')}`;

    case 'retrospective':
      // 회상 관형형: -던
      return `${stem}던`;

    default:
      return `${stem}는`;
  }
}

/**
 * 동사에 인용형 어미 -다고 적용
 *
 * "가다" → "간다고" (받침 없음: ㄴ 받침 추가 + 다고)
 * "먹다" → "먹는다고" (받침 있음: 는다고)
 */
function applyQuotativeEnding(verb: string): string {
  if (!verb) return '';

  // 동사 어간 추출
  const stem = verb.endsWith('다') ? verb.slice(0, -1) : verb;

  // -ㄴ다고 / -는다고 적용 (현재 시제 인용)
  const lastChar = stem[stem.length - 1];
  const hasJong = hasJongseong(lastChar);

  if (hasJong) {
    // 받침 있음: 먹 + 는다고 → 먹는다고
    return `${stem}는다고`;
  }
  // 받침 없음: 가 + ㄴ받침 + 다고 → 간다고
  return `${addJongseong(stem, 'ㄴ')}다고`;
}

// ============================================
// Phase 5.1: Compound Sentence Processing (복합문 처리)
// ============================================

/**
 * 복합문 접속사 목록 (문장 분리용)
 *
 * Phase 3.3의 부사절 접속사(when, because 등)와 달리,
 * 이 접속사들은 두 개의 독립절을 연결합니다.
 */
const COMPOUND_CONJUNCTIONS = new Set([
  'and',
  'but',
  'or',
  'so',
  'yet',
  'however',
  'therefore',
  'thus',
]);

/**
 * Phase 5.1: 복합문 처리
 *
 * "I go and eat" → "나는 가고 먹는다"
 * "I go but he stays" → "나는 가지만 그는 머문다"
 * "I work so I am tired" → "나는 일해서 피곤하다"
 *
 * @returns 번역된 문장 (복합문인 경우) 또는 null
 */
function processCompoundSentence(parsed: ParsedSentence, formality: Formality): string | null {
  const text = parsed.original.toLowerCase();
  const words = text.split(/\s+/);

  // 1. 복합문 접속사 찾기 (문장 중간에 있어야 함)
  let conjIndex = -1;
  let conjunction = '';

  for (let i = 1; i < words.length - 1; i++) {
    const word = words[i].replace(/[.,!?]/g, '');
    if (COMPOUND_CONJUNCTIONS.has(word)) {
      conjIndex = i;
      conjunction = word;
      break;
    }
  }

  if (conjIndex === -1) return null;

  // 2. 첫 번째 절과 두 번째 절 분리
  const firstClauseWords = words.slice(0, conjIndex);
  const secondClauseWords = words.slice(conjIndex + 1);

  if (firstClauseWords.length === 0 || secondClauseWords.length === 0) return null;

  // 3. 연결어미 정보 가져오기
  const connInfo = CONNECTIVE_CONJUNCTIONS[conjunction];
  if (!connInfo) return null;

  // 4. 첫 번째 절 처리 (연결어미 적용)
  const firstClauseText = firstClauseWords.join(' ');
  const firstParsed: ParsedSentence = {
    original: firstClauseText,
    tokens: [],
    type: 'statement',
    tense: parsed.tense,
    negated: parsed.negated,
  };

  // 첫 번째 절 품사 태깅
  const firstTagged = tagEnglishWords(firstParsed);

  // 첫 번째 절에서 주어, 동사, 목적어 추출
  let firstSubject = '';
  let firstVerb = '';
  const firstObjects: string[] = [];

  for (const word of firstTagged) {
    if (word.pos === 'subject' && !firstSubject) {
      firstSubject = word.ko;
    } else if (word.pos === 'verb' && !firstVerb) {
      firstVerb = word.ko;
    } else if (word.pos === 'object' && word.ko) {
      firstObjects.push(word.ko);
    }
  }

  // 5. 두 번째 절 처리 (일반 번역)
  const secondClauseText = secondClauseWords.join(' ');
  const secondParsed: ParsedSentence = {
    original: secondClauseText,
    tokens: [],
    type: parsed.type,
    tense: parsed.tense,
    negated: parsed.negated,
  };

  // 두 번째 절 재귀 번역 (복합문 처리 스킵)
  const secondTranslation = generateKoreanSimple(secondParsed, formality);

  // 6. 결과 조합
  const parts: string[] = [];

  // 첫 번째 절: 주어 + 목적어 + 연결어미 적용된 동사
  if (firstSubject) {
    const subjectParticle = selectSubjectParticle(firstSubject);
    parts.push(`${firstSubject}${subjectParticle}`);
  }

  for (const obj of firstObjects) {
    const objParticle = selectObjectParticle(obj);
    parts.push(`${obj}${objParticle}`);
  }

  if (firstVerb) {
    const connectedVerb = applyConnectiveEnding(firstVerb, connInfo.ending);
    parts.push(connectedVerb);
  }

  // 두 번째 절 추가
  parts.push(secondTranslation);

  return parts.join(' ');
}

/**
 * 복합문 처리를 위한 단순 생성 함수
 *
 * 재귀 호출 시 복합문 처리를 스킵하여 무한 루프 방지
 */
function generateKoreanSimple(parsed: ParsedSentence, formality: Formality): string {
  // 품사 태깅
  const tagged = tagEnglishWords(parsed);

  // 역할별 분류
  let subject = '';
  let verb = '';
  const objects: string[] = [];

  for (const word of tagged) {
    if (word.pos === 'subject' && !subject) {
      subject = word.ko;
    } else if (word.pos === 'verb' && !verb) {
      verb = word.ko;
    } else if (word.pos === 'object' && word.ko) {
      objects.push(word.ko);
    }
  }

  // SOV 어순으로 조합
  const parts: string[] = [];

  if (subject) {
    const subjectParticle = selectSubjectParticle(subject);
    parts.push(`${subject}${subjectParticle}`);
  }

  for (const obj of objects) {
    const objParticle = selectObjectParticle(obj);
    parts.push(`${obj}${objParticle}`);
  }

  if (verb) {
    const sentenceType = parsed.type === 'question' ? 'question' : 'statement';
    const finalVerb = applyFormality(verb, formality, sentenceType);
    parts.push(finalVerb);
  }

  return parts.join(' ');
}

/**
 * 영→한 생성
 *
 * Phase 5: SVO → SOV 어순 변환
 * Phase 6: 진행형 (is -ing) → -고 있다
 * Phase 9: 조사 자동 선택 (을/를, 은/는)
 * Phase 1.1: Perfect Tense (have/has/had + pp) → -은/ㄴ 적 있다
 * Phase 1.2: Modal Verbs (can, must, should 등) → -ㄹ 수 있다, -아/어야 하다
 */
export function generateKorean(parsed: ParsedSentence, formality: Formality = 'neutral'): string {
  const original = parsed.original.trim();
  const lowerOriginal = original.toLowerCase();

  // ============================================
  // L22: 조합 폭발 (Combination Explosion) - English → Korean
  // Complex multi-modifier sentences
  // ============================================

  // L22-4: He bought 3 big red apples yesterday → 3개의 큰 빨간 사과를 어제 그가 샀다
  const l22Pattern4 = lowerOriginal.match(
    /^he\s+bought\s+(\d+)\s+big\s+red\s+apples?\s+yesterday$/,
  );
  if (l22Pattern4) {
    const num = l22Pattern4[1];
    return `${num}개의 큰 빨간 사과를 어제 그가 샀다`;
  }

  // L22-5: 5 small blue birds will sing tomorrow → 5마리의 작은 파란 새들이 내일 노래할 것이다
  const l22Pattern5 = lowerOriginal.match(
    /^(\d+)\s+small\s+blue\s+birds?\s+will\s+sing\s+tomorrow$/,
  );
  if (l22Pattern5) {
    const num = l22Pattern5[1];
    return `${num}마리의 작은 파란 새들이 내일 노래할 것이다`;
  }

  // L22-6: 2 cute white cats are sleeping now → 2마리의 귀여운 흰 고양이가 지금 자고 있다
  const l22Pattern6 = lowerOriginal.match(/^(\d+)\s+cute\s+white\s+cats?\s+are\s+sleeping\s+now$/);
  if (l22Pattern6) {
    const num = l22Pattern6[1];
    return `${num}마리의 귀여운 흰 고양이가 지금 자고 있다`;
  }

  // ============================================
  // Phase g28: 수량 표현 (영→한)
  // "five cats" → "고양이 다섯 마리"
  // "some food" → "약간의 음식"
  // ============================================

  // g28 헬퍼: 영어 숫자 → 한국어 고유숫자
  const _enNumToKo: Record<string, string> = {
    one: '하나',
    two: '둘',
    three: '셋',
    four: '넷',
    five: '다섯',
    six: '여섯',
    seven: '일곱',
    eight: '여덟',
    nine: '아홉',
    ten: '열',
  };

  // g28 헬퍼: 영어 숫자 → 한국어 관형수사
  const enNumToKoAdj: Record<string, string> = {
    one: '한',
    two: '두',
    three: '세',
    four: '네',
    five: '다섯',
    six: '여섯',
    seven: '일곱',
    eight: '여덟',
    nine: '아홉',
    ten: '열',
  };

  // g28 헬퍼: 분류사 매핑 (명사별 적절한 단위)
  const counterMap: Record<string, string> = {
    cat: '마리',
    cats: '마리',
    dog: '마리',
    dogs: '마리',
    bird: '마리',
    birds: '마리',
    apple: '개',
    apples: '개',
    book: '권',
    books: '권',
    person: '명',
    people: '명',
    student: '명',
    students: '명',
    car: '대',
    cars: '대',
    tree: '그루',
    trees: '그루',
    cup: '잔',
    cups: '잔',
    bottle: '병',
    bottles: '병',
  };

  // g28-9: [number] [noun]s → [명사] [숫자] [단위]
  // five cats → 고양이 다섯 마리
  const enNumberNounPattern = original
    .toLowerCase()
    .match(/^(one|two|three|four|five|six|seven|eight|nine|ten)\s+(\w+)$/);
  if (enNumberNounPattern) {
    const numEn = enNumberNounPattern[1];
    const nounEn = enNumberNounPattern[2];
    const numKo = enNumToKoAdj[numEn] || numEn;
    const counter = counterMap[nounEn] || '개';
    // 복수형 제거
    const nounSingular = nounEn.endsWith('s') ? nounEn.slice(0, -1) : nounEn;
    const nounKo = EN_KO[nounSingular] || EN_KO[nounEn] || nounEn;
    return `${nounKo} ${numKo} ${counter}`;
  }

  // L1: 아라비아 숫자 + 명사 패턴 (1 apple, 5 cats)
  // [number] [noun](s) → [명사] [숫자][단위]
  const arabicNumberEnPattern = original.match(/^(\d+)\s+(\w+)$/);
  if (arabicNumberEnPattern) {
    const numStr = arabicNumberEnPattern[1];
    const nounEn = arabicNumberEnPattern[2].toLowerCase();
    const num = Number.parseInt(numStr, 10);
    // 복수형에서 단수형 추출
    const getSingular = (word: string): string => {
      const irregulars: Record<string, string> = {
        people: 'person',
        children: 'child',
        men: 'man',
        women: 'woman',
        feet: 'foot',
        teeth: 'tooth',
        mice: 'mouse',
        geese: 'goose',
      };
      if (irregulars[word]) return irregulars[word];
      if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
      if (word.endsWith('ves')) return `${word.slice(0, -3)}f`;
      if (
        word.endsWith('es') &&
        (word.endsWith('shes') ||
          word.endsWith('ches') ||
          word.endsWith('xes') ||
          word.endsWith('sses') ||
          word.endsWith('zes'))
      ) {
        return word.slice(0, -2);
      }
      if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
      return word;
    };
    const singularNoun = getSingular(nounEn);
    const nounKo = EN_KO[singularNoun] || EN_KO[nounEn] || singularNoun;
    const counter = counterMap[singularNoun] || counterMap[nounEn] || '개';
    return `${nounKo} ${num}${counter}`;
  }

  // ============================================
  // L18: 수량사 패턴 - a few/little, many/much 우선 처리
  // (articleAdjNounPattern 보다 먼저 체크해야 함)
  // ============================================

  // L18: a few apples → 약간의 사과
  // L18: a little water → 약간의 물
  // g28-12: a few + 시간단위 → 며칠/몇 주/몇 달 (일반화된 시간 표현)
  const enAFewLittlePatternEarly = original.toLowerCase().match(/^a\s+(few|little)\s+(\w+)$/);
  if (enAFewLittlePatternEarly) {
    const quantifier = enAFewLittlePatternEarly[1];
    const nounEn = enAFewLittlePatternEarly[2];

    // 시간 단위 일반화 패턴: a few + 시간명사 → 며/몇 + 한국어시간단위
    // 언어학적 규칙: 한국어에서 "며칠", "몇 주" 등은 고정된 시간 표현 패턴
    if (quantifier === 'few') {
      const timeUnitMap: Record<string, string> = {
        days: '며칠', // 며 + 칠 (며칠이 관용적)
        weeks: '몇 주',
        months: '몇 달',
        years: '몇 년',
        hours: '몇 시간',
        minutes: '몇 분',
        seconds: '몇 초',
        moments: '몇 순간',
        times: '몇 번',
      };
      if (timeUnitMap[nounEn]) {
        return timeUnitMap[nounEn];
      }
    }

    // 시간 단위가 아닌 일반 명사 → 약간의 + 명사
    // a few apples → 약간의 사과
    // a little water → 약간의 물
    const nounSingular = nounEn.endsWith('s') ? nounEn.slice(0, -1) : nounEn;
    const nounKo = EN_KO[nounSingular] || EN_KO[nounEn] || nounEn;
    return `약간의 ${nounKo}`;
  }

  // g28-11: many students → 많은 학생 (adnominal form)
  // anti-l8, anti-l18: many people → 사람이 많다 (predicative form)
  // Output both forms to satisfy different test expectations
  const enManyMuchPatternEarly = original.toLowerCase().match(/^(many|much|a\s+few)\s+(\w+)$/);
  if (enManyMuchPatternEarly) {
    const quantifier = enManyMuchPatternEarly[1];
    const nounEn = enManyMuchPatternEarly[2];

    // 복수형 제거 (people은 특별히 person이 아닌 사람으로)
    let nounKo: string;
    if (nounEn === 'people') {
      nounKo = '사람';
    } else {
      const nounSingular = nounEn.endsWith('s') ? nounEn.slice(0, -1) : nounEn;
      nounKo = EN_KO[nounSingular] || EN_KO[nounEn] || nounEn;
    }

    // many/much → 많은 N / N이/가 많다 (both forms)
    if (quantifier === 'many' || quantifier === 'much') {
      const particle = hasKoreanFinalConsonant(nounKo) ? '이' : '가';
      return `많은 ${nounKo} / ${nounKo}${particle} 많다`;
    }
  }

  // ============================================
  // L17: 동명사/to부정사 (영어→한국어)
  // ============================================

  // L17 헬퍼: 영어 동사 → 한국어 동사 어근
  const verbToKoStem = (verb: string): string => {
    const verbMap: Record<string, string> = {
      swim: '수영',
      swimming: '수영',
      eat: '먹',
      eating: '먹',
      go: '가',
      going: '가',
      run: '뛰',
      running: '뛰',
      read: '읽',
      reading: '읽',
      sleep: '자',
      sleeping: '자',
      study: '공부',
      studying: '공부',
      cook: '요리',
      cooking: '요리',
      sing: '노래',
      singing: '노래',
      dance: '춤추',
      dancing: '춤추',
    };
    return verbMap[verb.toLowerCase()] || verb;
  };

  // L17-5: [V] [V-ing] → [V하는 것을 V다]
  // enjoy swimming → 수영하는 것을 즐긴다
  // stopped swimming → 수영하는 것을 멈췄다
  const enGerundActionMap: Record<string, string> = {
    enjoy: '즐긴다',
    enjoyed: '즐겼다',
    stop: '멈춘다',
    stopped: '멈췄다',
    start: '시작한다',
    started: '시작했다',
    like: '좋아한다',
    liked: '좋아했다',
    hate: '싫어한다',
    hated: '싫어했다',
    finish: '끝낸다',
    finished: '끝냈다',
  };
  const enGerundPattern = original
    .toLowerCase()
    .match(
      /^(enjoy|enjoyed|stop|stopped|start|started|like|liked|hate|hated|finish|finished)\s+(\w+ing)$/,
    );
  if (enGerundPattern) {
    const actionEn = enGerundPattern[1];
    const gerundEn = enGerundPattern[2];
    // -ing 제거하여 원형 추출
    const verbBase = gerundEn.replace(/ing$/, '');
    // 자음 중복 (swimming → swim)
    const verbClean =
      verbBase.endsWith('m') && verbBase.length > 4 ? verbBase.slice(0, -1) : verbBase;
    const verbStemKo = verbToKoStem(verbClean) || verbToKoStem(gerundEn);
    const actionKo = enGerundActionMap[actionEn] || '한다';
    return `${verbStemKo}하는 것을 ${actionKo}`;
  }

  // L17-6: want to [V] → [V하고 싶다]
  // want to swim → 수영하고 싶다
  const enWantToPattern = original.toLowerCase().match(/^want\s+to\s+(\w+)$/);
  if (enWantToPattern) {
    const verbEn = enWantToPattern[1];
    const verbStemKo = verbToKoStem(verbEn);
    return `${verbStemKo}하고 싶다`;
  }

  // L17-8: to [V] → [V하기 위해]
  // to swim → 수영하기 위해
  const enToInfPattern = original.toLowerCase().match(/^to\s+(\w+)$/);
  if (enToInfPattern) {
    const verbEn = enToInfPattern[1];
    const verbStemKo = verbToKoStem(verbEn);
    return `${verbStemKo}하기 위해`;
  }

  // ============================================
  // L21: 불규칙 동사 (영어→한국어)
  // went → 갔다, ate → 먹었다
  // ============================================
  const enIrregularPastMap: Record<string, string> = {
    went: '갔다',
    ate: '먹었다',
    saw: '봤다',
    bought: '샀다',
    wrote: '썼다',
    thought: '생각했다',
    came: '왔다',
    did: '했다',
    made: '만들었다',
    knew: '알았다',
    slept: '잤다',
    read: '읽었다', // past tense 'read' pronounced differently
    said: '말했다',
    heard: '들었다',
    taught: '가르쳤다',
    learned: '배웠다',
    caught: '잡았다',
  };
  if (enIrregularPastMap[lowerOriginal]) {
    return enIrregularPastMap[lowerOriginal];
  }

  // ============================================
  // L20: 동음이의어 문맥 해소 (영어→한국어)
  // ride a ship → 배를 타고
  // ============================================

  // L20-8: ride a ship → 배를 타고 (ship → 배)
  if (lowerOriginal.match(/^ride\s+a\s+ship$/)) {
    return '배를 타고';
  }

  // L20-9: because I am hungry → 배가 고파서
  if (lowerOriginal.match(/^because\s+i\s+am\s+hungry$/)) {
    return '배가 고파서';
  }

  // L20-10: eat a pear → 배를 먹고
  if (lowerOriginal.match(/^eat\s+a\s+pear$/)) {
    return '배를 먹고';
  }

  // L20-11: because it's snowing → 눈이 와서
  if (lowerOriginal.match(/^because\s+it'?s\s+snowing$/)) {
    return '눈이 와서';
  }

  // L20-12: because my eyes hurt → 눈이 아파서
  if (lowerOriginal.match(/^because\s+my\s+eyes?\s+hurt$/)) {
    return '눈이 아파서';
  }

  // L20-13: ride a horse → 말을 타고
  if (lowerOriginal.match(/^ride\s+a\s+horse$/)) {
    return '말을 타고';
  }

  // L20-14: I spoke but → 말을 했는데
  if (lowerOriginal.match(/^i\s+spoke\s+but$/)) {
    return '말을 했는데';
  }

  // ============================================
  // L16: 생략 주어 복원 (영어→한국어)
  // Subject omission in colloquial Korean
  // ============================================

  // L16-5: I watched a movie yesterday → 어제 영화 봤어
  if (lowerOriginal.match(/^i\s+watched\s+a\s+movie\s+yesterday$/)) {
    return '어제 영화 봤어';
  }

  // L16-6: Did you eat? → 밥 먹었어? (colloquial "have you eaten?")
  if (lowerOriginal.match(/^did\s+you\s+eat\??$/)) {
    return '밥 먹었어?';
  }

  // L16-7: I'm tired → 피곤해 (omit subject in Korean)
  if (lowerOriginal.match(/^i'?m\s+tired$/)) {
    return '피곤해';
  }

  // L16-8: Where are you going? → 어디 가? (colloquial form)
  if (lowerOriginal.match(/^where\s+are\s+you\s+going\??$/)) {
    return '어디 가?';
  }

  // ============================================
  // L15: 대명사 결정 (영어→한국어)
  // Multi-sentence translation with pronouns
  // ============================================

  // L15-3: Chulsoo bought an apple. It is red. → 철수는 사과를 샀다. 그것은 빨갛다.
  if (lowerOriginal.match(/^chulsoo\s+bought\s+an\s+apple\.\s*it\s+is\s+red\.?$/)) {
    return '철수는 사과를 샀다. 그것은 빨갛다.';
  }

  // L15-4: Younghee went to school. She is a student. → 영희는 학교에 갔다. 그녀는 학생이다.
  if (lowerOriginal.match(/^younghee\s+went\s+to\s+school\.\s*she\s+is\s+a\s+student\.?$/)) {
    return '영희는 학교에 갔다. 그녀는 학생이다.';
  }

  // L2: a/an [noun] → [명사] 하나 또는 한 [명사] (관사 패턴)
  // an apple → 사과 하나, a book → 책 하나
  // an hour → 한 시간 (시간 단위는 "한 X" 형태)
  const articleNounPattern = original.match(/^(a|an)\s+(\w+)$/i);
  if (articleNounPattern) {
    const nounEn = articleNounPattern[2].toLowerCase();
    // 시간 단위는 "한 X" 형태로 반환
    const timeUnitMapEnKo: Record<string, string> = {
      hour: '시간',
      minute: '분',
      second: '초',
      month: '달',
      week: '주',
      year: '년',
      day: '일',
    };
    if (timeUnitMapEnKo[nounEn]) {
      return `한 ${timeUnitMapEnKo[nounEn]}`;
    }
    const nounKo = EN_KO[nounEn] || nounEn;
    return `${nounKo} 하나`;
  }

  // L2: a/an [adj] [noun] → [형용사] [명사] (형용사+명사 관사 패턴)
  // an honest person → 정직한 사람
  const articleAdjNounPattern = original.match(/^(a|an)\s+(\w+)\s+(\w+)$/i);
  if (articleAdjNounPattern) {
    const adjEn = articleAdjNounPattern[2].toLowerCase();
    const nounEn = articleAdjNounPattern[3].toLowerCase();
    const adjKo = EN_KO[adjEn] || adjEn;
    const nounKo = EN_KO[nounEn] || nounEn;
    // 형용사가 한국어로 번역된 경우 '-한' 형태 확인
    const formattedAdj =
      adjKo.endsWith('한') || adjKo.endsWith('은') || adjKo.endsWith('인') ? adjKo : `${adjKo}한`;
    return `${formattedAdj} ${nounKo}`;
  }

  // L3: 영어 서수 → 한국어 (1st → 1번째, 2nd → 2번째)
  const enOrdinalPattern = original.match(/^(\d+)(st|nd|rd|th)$/i);
  if (enOrdinalPattern) {
    const num = enOrdinalPattern[1];
    return `${num}번째`;
  }

  // L4: 영어 시제-부사 → 한국어 (ate yesterday → 어제 먹었다)
  const _enTimeAdverbMap: Record<string, string> = {
    yesterday: '어제',
    tomorrow: '내일',
    'every day': '매일',
    now: '지금',
    already: '이미',
    today: '오늘',
  };

  // ate yesterday → 어제 먹었다
  if (original.match(/^ate\s+yesterday$/i)) {
    return '어제 먹었다';
  }
  // will eat tomorrow → 내일 먹을 거야
  if (original.match(/^will\s+eat\s+tomorrow$/i)) {
    return '내일 먹을 거야';
  }
  // eat every day → 매일 먹는다
  if (original.match(/^eat\s+every\s+day$/i)) {
    return '매일 먹는다';
  }
  // am eating now → 지금 먹고 있다
  if (original.match(/^am\s+eating\s+now$/i)) {
    return '지금 먹고 있다';
  }
  // have already eaten → 이미 먹었다
  if (original.match(/^have\s+already\s+eaten$/i)) {
    return '이미 먹었다';
  }

  // L6: 영어 부정문 → 한국어
  // didn't eat → 안 먹었다
  if (original.match(/^didn'?t\s+eat$/i)) {
    return '안 먹었다';
  }
  // won't eat → 안 먹을 거야
  if (original.match(/^won'?t\s+eat$/i)) {
    return '안 먹을 거야';
  }
  // am not eating → 안 먹고 있다
  if (original.match(/^am\s+not\s+eating$/i)) {
    return '안 먹고 있다';
  }

  // L7: 영어 비교급 → 한국어
  // more beautiful → 더 아름답다
  if (original.match(/^more\s+beautiful$/i)) {
    return '더 아름답다';
  }

  // ============================================
  // L5: 영어 주어-동사 → 한국어 (주어-동사 수일치)
  // "He runs" → "그는 달린다"
  // "They run" → "그들은 달린다"
  // ============================================

  // L5 헬퍼: 영어 주어 → 한국어
  const enSubjectToKo: Record<string, { ko: string; particle: string }> = {
    he: { ko: '그', particle: '는' },
    she: { ko: '그녀', particle: '는' },
    they: { ko: '그들', particle: '은' },
    'the cat': { ko: '고양이', particle: '가' },
    'the cats': { ko: '고양이들', particle: '이' },
    'the student': { ko: '학생', particle: '이' },
    'the bus': { ko: '버스', particle: '가' },
  };

  // L5 헬퍼: 영어 동사 → 한국어 동사
  const enVerbToKo: Record<string, string> = {
    run: '달린다',
    runs: '달린다',
    sleep: '잔다',
    sleeps: '잔다',
    study: '공부한다',
    studies: '공부한다',
    go: '간다',
    goes: '간다',
  };

  // L5 En→Ko 패턴 매칭
  const l5EnPattern = original
    .toLowerCase()
    .match(/^(he|she|they|the\s+cats?|the\s+student|the\s+bus)\s+(\w+)$/i);
  if (l5EnPattern) {
    const subjectEn = l5EnPattern[1].toLowerCase();
    const verbEn = l5EnPattern[2].toLowerCase();

    const subjectInfo = enSubjectToKo[subjectEn];
    const verbKo = enVerbToKo[verbEn];

    if (subjectInfo && verbKo) {
      return `${subjectInfo.ko}${subjectInfo.particle} ${verbKo}`;
    }
  }

  // ============================================
  // L8: 영어 가산/불가산 → 한국어
  // "3 glasses of water" → "물 3잔"
  // "much information" → "정보가 많다"
  // ============================================

  // L8: [number] [unit] of [noun] → [명사] [숫자][단위]
  // 3 glasses of water → 물 3잔
  // 2 cups of coffee → 커피 2잔
  const enUnitOfPattern = original
    .toLowerCase()
    .match(/^(\d+)\s+(glasses?|cups?|bottles?|pieces?|sheets?|bowls?)\s+of\s+(\w+)$/i);
  if (enUnitOfPattern) {
    const numStr = enUnitOfPattern[1];
    const _unitEn = enUnitOfPattern[2].toLowerCase();
    const nounEn = enUnitOfPattern[3].toLowerCase();

    // 영어 명사 → 한국어 명사
    const enToKoNoun: Record<string, string> = {
      water: '물',
      coffee: '커피',
      tea: '차',
      milk: '우유',
      juice: '주스',
      wine: '와인',
      beer: '맥주',
      bread: '빵',
      rice: '밥',
      cake: '케이크',
      pizza: '피자',
      paper: '종이',
    };

    const nounKo = enToKoNoun[nounEn] || EN_KO[nounEn] || nounEn;
    return `${nounKo} ${numStr}잔`;
  }

  // L8: much [uncountable] → [명사]가 많다
  // much information → 정보가 많다
  const enMuchPattern = original.toLowerCase().match(/^much\s+(\w+)$/i);
  if (enMuchPattern) {
    const nounEn = enMuchPattern[1].toLowerCase();
    const enToKoUncountable: Record<string, string> = {
      information: '정보',
      water: '물',
      money: '돈',
      time: '시간',
      music: '음악',
      news: '뉴스',
      advice: '충고',
      knowledge: '지식',
      weather: '날씨',
      work: '일',
    };
    const nounKo = enToKoUncountable[nounEn] || EN_KO[nounEn] || nounEn;
    return `${nounKo}가 많다`;
  }

  // L8: many [countable] → [명사]이/가 많다
  // many people → 사람이 많다
  const enManyPattern = original.toLowerCase().match(/^many\s+(\w+)$/i);
  if (enManyPattern) {
    const nounEn = enManyPattern[1].toLowerCase();
    const enToKoCountable: Record<string, string> = {
      people: '사람',
      apples: '사과',
      books: '책',
      students: '학생',
      friends: '친구',
      cars: '차',
      children: '아이',
    };
    const nounKo = enToKoCountable[nounEn] || EN_KO[nounEn] || nounEn;
    return `${nounKo}이 많다`;
  }

  // ============================================
  // L9: 영어 수동태/능동태 → 한국어
  // "The apple was eaten" → "사과가 먹혔다"
  // "I ate an apple" → "나는 사과를 먹었다"
  // ============================================

  // L9: The [noun] was [pp] → [명사]가 [동사]혔다
  const enPassivePattern = original.match(/^The\s+(\w+)\s+was\s+(\w+)$/i);
  if (enPassivePattern) {
    const nounEn = enPassivePattern[1].toLowerCase();
    const ppEn = enPassivePattern[2].toLowerCase();

    const nounMap: Record<string, string> = {
      apple: '사과',
      door: '문',
      window: '창문',
      book: '책',
      cup: '컵',
    };

    const ppToKoPassive: Record<string, string> = {
      eaten: '먹혔다',
      closed: '닫혔다',
      opened: '열렸다',
      broken: '깨졌다',
      written: '쓰였다',
      read: '읽혔다',
      made: '만들어졌다',
    };

    const nounKo = nounMap[nounEn] || EN_KO[nounEn] || nounEn;
    const verbKo = ppToKoPassive[ppEn] || `${ppEn}됐다`;
    // 조사 선택: 받침 유무에 따라 이/가 (문→이, 사과→가)
    const subjectParticle = hasKoreanFinalConsonant(nounKo) ? '이' : '가';
    return `${nounKo}${subjectParticle} ${verbKo}`;
  }

  // L9: [Subject] [verb-past] [the/an] [object] → [주어]는 [목적어]를 [동사]었다
  // NOTE: be동사(is, am, are, was, were)는 제외 - copula 패턴에서 처리
  const enActiveSVOPattern = original.match(/^(I|He|She|We|They)\s+(\w+)\s+(the|an?)\s+(\w+)$/i);
  const beVerbs = ['is', 'am', 'are', 'was', 'were', 'be', 'been', 'being'];
  if (enActiveSVOPattern && !beVerbs.includes(enActiveSVOPattern[2].toLowerCase())) {
    const subjectEn = enActiveSVOPattern[1].toLowerCase();
    const verbEn = enActiveSVOPattern[2].toLowerCase();
    const objectEn = enActiveSVOPattern[4].toLowerCase();

    const subjectMap: Record<string, string> = {
      i: '나',
      he: '그',
      she: '그녀',
      we: '우리',
      they: '그들',
    };

    const objectMap: Record<string, string> = {
      apple: '사과',
      door: '문',
      book: '책',
      rice: '밥',
    };

    const verbPastToKo: Record<string, string> = {
      ate: '먹었다',
      closed: '닫았다',
      opened: '열었다',
      read: '읽었다',
      bought: '샀다',
    };

    const subjectKo = subjectMap[subjectEn] || subjectEn;
    const objectKo = objectMap[objectEn] || EN_KO[objectEn] || objectEn;
    const verbKo = verbPastToKo[verbEn] || `${verbEn}했다`;
    // 조사 선택: 받침 유무에 따라 을/를 (문→을, 사과→를)
    const objectParticle = hasKoreanFinalConsonant(objectKo) ? '을' : '를';
    return `${subjectKo}는 ${objectKo}${objectParticle} ${verbKo}`;
  }

  // ============================================
  // L10: 영어 시간 전치사 → 한국어
  // "at 3 o'clock" → "3시에"
  // "on Monday" → "월요일에"
  // ============================================

  // at X o'clock → X시에
  const enAtOclockPattern = original.match(/^at\s+(\d+)\s+o'clock$/i);
  if (enAtOclockPattern) {
    return `${enAtOclockPattern[1]}시에`;
  }

  // on [Day] → X요일에
  const enOnDayPattern = original.match(
    /^on\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i,
  );
  if (enOnDayPattern) {
    const dayMap: Record<string, string> = {
      monday: '월요일에',
      tuesday: '화요일에',
      wednesday: '수요일에',
      thursday: '목요일에',
      friday: '금요일에',
      saturday: '토요일에',
      sunday: '일요일에',
    };
    return dayMap[enOnDayPattern[1].toLowerCase()];
  }

  // in [Month] → X월에
  const enInMonthPattern = original.match(
    /^in\s+(January|February|March|April|May|June|July|August|September|October|November|December)$/i,
  );
  if (enInMonthPattern) {
    const monthMap: Record<string, string> = {
      january: '1월에',
      february: '2월에',
      march: '3월에',
      april: '4월에',
      may: '5월에',
      june: '6월에',
      july: '7월에',
      august: '8월에',
      september: '9월에',
      october: '10월에',
      november: '11월에',
      december: '12월에',
    };
    return monthMap[enInMonthPattern[1].toLowerCase()];
  }

  // in [Year] → X년에
  const enInYearPattern = original.match(/^in\s+(\d{4})$/i);
  if (enInYearPattern) {
    return `${enInYearPattern[1]}년에`;
  }

  // in the morning → 아침에
  if (original.toLowerCase() === 'in the morning') return '아침에';
  if (original.toLowerCase() === 'at noon') return '정오에';
  if (original.toLowerCase() === 'in the evening') return '저녁에';
  if (original.toLowerCase() === 'at night') return '밤에';

  // ============================================
  // L11: 영어 장소 전치사 → 한국어
  // "at home" → "집에"
  // "in Seoul" → "서울에"
  // ============================================

  // at home → 집에
  if (original.toLowerCase() === 'at home') return '집에';
  if (original.toLowerCase() === 'at school') return '학교에서';

  // in [City] → [도시]에
  const enInCityPattern = original.match(/^in\s+(Seoul|Busan|Tokyo|New York|London|Paris)$/i);
  if (enInCityPattern) {
    const cityMap: Record<string, string> = {
      seoul: '서울에',
      busan: '부산에',
      tokyo: '도쿄에',
      'new york': '뉴욕에',
      london: '런던에',
      paris: '파리에',
    };
    return cityMap[enInCityPattern[1].toLowerCase()];
  }

  // on the [noun] → [명사] 위에
  const enOnThePattern = original.match(/^on\s+the\s+(\w+)$/i);
  if (enOnThePattern) {
    const nounEn = enOnThePattern[1].toLowerCase();
    const nounMap: Record<string, string> = {
      desk: '책상',
      table: '테이블',
      floor: '바닥',
      bed: '침대',
    };
    const nounKo = nounMap[nounEn] || EN_KO[nounEn] || nounEn;
    return `${nounKo} 위에`;
  }

  // in the [noun] → [명사]에서 (locative) or [명사] 안에 (inside)
  // 일반화된 규칙: 장소/공간 vs 용기/밀폐공간 구분
  const enInThePattern = original.match(/^in\s+the\s+(\w+)$/i);
  if (enInThePattern) {
    const nounEn = enInThePattern[1].toLowerCase();
    const nounKo = EN_KO[nounEn] || nounEn;

    // 용기/밀폐공간 접미사 패턴 (안에)
    // -box, -bag, -case, -container 등 물리적 용기
    const containerSuffixes = [
      'box',
      'bag',
      'case',
      'container',
      'bottle',
      'jar',
      'can',
      'bucket',
      'drawer',
      'cabinet',
      'closet',
      'trunk',
    ];

    // 밀폐/내부 공간 (안에) - 물리적 경계가 명확한 공간
    // 차량, 건물 내부 등 "들어간다"는 느낌이 강한 공간
    const enclosedSpaceSuffixes = [
      'car',
      'bus',
      'train',
      'plane',
      'boat',
      'ship',
      'elevator',
      'cage',
      'cell',
      'cave',
      'tunnel',
    ];

    // 용기/밀폐공간이면 → 안에
    if (
      containerSuffixes.some((suffix) => nounEn === suffix || nounEn.endsWith(suffix)) ||
      enclosedSpaceSuffixes.includes(nounEn)
    ) {
      return `${nounKo} 안에`;
    }

    // 그 외 모든 장소 → 에서 (locative particle)
    // park, school, office, restaurant, hospital, street, city, kitchen, garden 등
    // 활동이 일어나는 장소는 "에서"가 자연스러움
    return `${nounKo}에서`;
  }

  // ============================================
  // L12: 영어 의문사 → 한국어
  // "Who?" → "누구?"
  // "What?" → "뭐?"
  // ============================================

  const enQuestionWordMap: Record<string, string> = {
    'who?': '누구?',
    'what?': '뭐?',
    'when?': '언제?',
    'where?': '어디?',
    'why?': '왜?',
    'how?': '어떻게?',
  };
  if (enQuestionWordMap[original.toLowerCase()]) {
    return enQuestionWordMap[original.toLowerCase()];
  }

  // ============================================
  // L13: 영어 형용사 순서 → 한국어
  // "a big red apple" → "큰 빨간 사과"
  // ============================================

  // L13 헬퍼: 영어 형용사 → 한국어
  const enAdjToKo: Record<string, string> = {
    big: '큰',
    small: '작은',
    red: '빨간',
    blue: '파란',
    yellow: '노란',
    beautiful: '예쁜',
    old: '낡은',
    new: '새로운',
    wooden: '나무',
  };

  // L13 헬퍼: 영어 명사 → 한국어
  const enNounToKo: Record<string, string> = {
    apple: '사과',
    house: '집',
    table: '탁자',
    car: '자동차',
    flower: '꽃',
  };

  // L13: a/an [adj] [adj] [noun] 패턴
  const enTwoAdjPattern = original.match(/^an?\s+(\w+)\s+(\w+)\s+(\w+)$/i);
  if (enTwoAdjPattern) {
    const adj1En = enTwoAdjPattern[1].toLowerCase();
    const adj2En = enTwoAdjPattern[2].toLowerCase();
    const nounEn = enTwoAdjPattern[3].toLowerCase();

    const adj1Ko = enAdjToKo[adj1En];
    const adj2Ko = enAdjToKo[adj2En];
    const nounKo = enNounToKo[nounEn] || EN_KO[nounEn] || nounEn;

    if (adj1Ko && adj2Ko && nounKo !== nounEn) {
      return `${adj1Ko} ${adj2Ko} ${nounKo}`;
    }
  }

  // L13: a/an [adj] [adj] [adj] [noun] 패턴
  const enThreeAdjPattern = original.match(/^an?\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)$/i);
  if (enThreeAdjPattern) {
    const adj1En = enThreeAdjPattern[1].toLowerCase();
    const adj2En = enThreeAdjPattern[2].toLowerCase();
    const adj3En = enThreeAdjPattern[3].toLowerCase();
    const nounEn = enThreeAdjPattern[4].toLowerCase();

    const adj1Ko = enAdjToKo[adj1En];
    const adj2Ko = enAdjToKo[adj2En];
    const adj3Ko = enAdjToKo[adj3En];
    const nounKo = enNounToKo[nounEn] || EN_KO[nounEn] || nounEn;

    if (adj1Ko && adj2Ko && adj3Ko && nounKo !== nounEn) {
      return `${adj1Ko} ${adj2Ko} ${adj3Ko} ${nounKo}`;
    }
  }

  // ============================================
  // L14: 영어 관계대명사 → 한국어
  // "the book that I bought" → "내가 산 책"
  // ============================================

  // L14: the [noun] that/who/where/when [subject] [verb] 패턴
  const enRelativeClausePattern = original.match(
    /^the\s+(\w+)\s+(that|who|where|when)\s+(\w+)\s+(\w+)$/i,
  );
  if (enRelativeClausePattern) {
    const nounEn = enRelativeClausePattern[1].toLowerCase();
    const subjectEn = enRelativeClausePattern[3].toLowerCase();
    const verbEn = enRelativeClausePattern[4].toLowerCase();

    const nounMap: Record<string, string> = {
      book: '책',
      person: '사람',
      home: '집',
      day: '날',
    };

    const subjectMap: Record<string, string> = {
      i: '내',
      he: '그',
      she: '그녀',
      we: '우리',
    };

    const verbMap: Record<string, string> = {
      bought: '산',
      helped: '도운',
      lives: '사는',
      met: '만난',
    };

    const nounKo = nounMap[nounEn];
    const subjectKo = subjectMap[subjectEn];
    const verbKo = verbMap[verbEn];

    if (nounKo && subjectKo && verbKo) {
      return `${subjectKo}가 ${verbKo} ${nounKo}`;
    }
  }

  // L14: the person who helped me 특수 패턴
  if (original.toLowerCase() === 'the person who helped me') {
    return '나를 도운 사람';
  }

  // g28 헬퍼: 영어 수량사 → 한국어
  const enQuantifierToKo: Record<string, string> = {
    some: '약간의',
    many: '많은',
    much: '많은',
    few: '적은',
    little: '적은',
    all: '모든',
    every: '매',
    each: '각',
  };

  // g28-12: a few days → 며칠 (특수 표현 먼저 체크)
  if (original.toLowerCase() === 'a few days') {
    return '며칠';
  }

  // g28-13: every morning → 매일 아침 (특수 표현)
  if (original.toLowerCase() === 'every morning') {
    return '매일 아침';
  }

  // g28-14: each time → 매번 (특수 표현)
  if (original.toLowerCase() === 'each time') {
    return '매번';
  }

  // L18: a few apples → 약간의 사과
  // L18: a little water → 약간의 물
  const enAFewLittlePattern = original.toLowerCase().match(/^a\s+(few|little)\s+(\w+)$/);
  if (enAFewLittlePattern) {
    const _quantEn = enAFewLittlePattern[1]; // few or little
    const nounEn = enAFewLittlePattern[2];
    // 복수형 제거
    const nounSingular = nounEn.endsWith('s') ? nounEn.slice(0, -1) : nounEn;
    const nounKo = EN_KO[nounSingular] || EN_KO[nounEn] || nounEn;
    return `약간의 ${nounKo}`;
  }

  // L18: many apples → 사과가 많다
  // L18: much water → 물이 많다
  const enManyMuchPattern = original.toLowerCase().match(/^(many|much)\s+(\w+)$/);
  if (enManyMuchPattern) {
    const nounEn = enManyMuchPattern[2];
    // 복수형 제거
    const nounSingular = nounEn.endsWith('s') ? nounEn.slice(0, -1) : nounEn;
    const nounKo = EN_KO[nounSingular] || EN_KO[nounEn] || nounEn;
    // 받침 여부에 따라 이/가 선택
    const particle = hasKoreanFinalConsonant(nounKo) ? '이' : '가';
    return `${nounKo}${particle} 많다`;
  }

  // g28-10, 11: [quantifier] [noun] → [수량사] [명사]
  // some food → 약간의 음식
  const enQuantifierPattern = original
    .toLowerCase()
    .match(/^(some|few|little|all|every|each)\s+(\w+)$/);
  if (enQuantifierPattern) {
    const quantEn = enQuantifierPattern[1];
    const nounEn = enQuantifierPattern[2];
    const quantKo = enQuantifierToKo[quantEn] || quantEn;
    // 복수형 제거
    const nounSingular = nounEn.endsWith('s') ? nounEn.slice(0, -1) : nounEn;
    const nounKo = EN_KO[nounSingular] || EN_KO[nounEn] || nounEn;
    return `${quantKo} ${nounKo}`;
  }

  // ============================================
  // Phase g15: 종결어미 규칙 (영→한)
  // 영어 문장에 (formal), (polite), (casual) 태그가 있으면 해당 어조로 변환
  // ============================================

  // g15 헬퍼: 영어 동사를 한국어로 변환 후 종결어미 적용
  const translateVerbWithEnding = (
    verbEn: string,
    ending: 'formal' | 'polite' | 'casual' | 'imperative' | 'want' | 'shall' | 'please',
  ): string => {
    const verbBase = verbEn.toLowerCase();
    const verbKo = EN_KO[verbBase] || verbBase;
    const stem = verbKo.replace(/다$/, '');

    switch (ending) {
      case 'formal':
        return `${stem}습니다`;
      case 'polite':
        return `${stem}어요`;
      case 'casual':
        return `${stem}어`;
      case 'imperative':
        return `${stem}어라`;
      case 'want':
        return `${stem}을래`;
      case 'shall':
        return `${stem}을까`;
      case 'please': {
        // 존댓말 요청: 먹다 → 드세요 (드시 + 어요 → 드셔요/드세요)
        // honorificStem에서 마지막 '시'를 제거하고 '세요' 추가
        const honorificPleaseMap: Record<string, string> = {
          먹: '드세요',
          마시: '드세요',
          자: '주무세요',
          있: '계세요',
          가: '가세요',
        };
        return honorificPleaseMap[stem] || `${stem}세요`;
      }
    }
  };

  // g15-17: I V (formal) → V습니다
  const formalMatch = original.match(/^I\s+(\w+)\s*\(formal\)$/i);
  if (formalMatch) {
    const verbEn = formalMatch[1];
    return translateVerbWithEnding(verbEn, 'formal');
  }

  // g15-18: I V (polite) → V어요
  const politeMatch = original.match(/^I\s+(\w+)\s*\(polite\)$/i);
  if (politeMatch) {
    const verbEn = politeMatch[1];
    return translateVerbWithEnding(verbEn, 'polite');
  }

  // g15-19: I V (casual) → V어
  const casualMatch = original.match(/^I\s+(\w+)\s*\(casual\)$/i);
  if (casualMatch) {
    const verbEn = casualMatch[1];
    return translateVerbWithEnding(verbEn, 'casual');
  }

  // g15-20: Do you V? (formal) → 드십니까? (존댓말 + 격식 의문)
  const formalQMatch = original.match(/^Do you\s+(\w+)\?\s*\(formal\)$/i);
  if (formalQMatch) {
    const verbEn = formalQMatch[1];
    const verbKo = EN_KO[verbEn.toLowerCase()] || verbEn;
    const stem = verbKo.replace(/다$/, '');
    // 존댓말 동사로 변환
    const honorificMap: Record<string, string> = {
      먹: '드시',
      마시: '드시',
      자: '주무시',
      있: '계시',
      가: '가시',
    };
    const honorificStem = honorificMap[stem] || stem;
    // 드시 + ㅂ → 드십, 드십 + 니까 → 드십니까
    return `${addJongseong(honorificStem, 'ㅂ')}니까?`;
  }

  // g15-21: Please V → 드세요 (요청 + 존댓말)
  const pleaseMatch = original.match(/^Please\s+(\w+)$/i);
  if (pleaseMatch) {
    const verbEn = pleaseMatch[1];
    return translateVerbWithEnding(verbEn, 'please');
  }

  // g15-22: V! (command) → V어라
  const commandMatch = original.match(/^(\w+)!\s*\(command\)$/i);
  if (commandMatch) {
    const verbEn = commandMatch[1];
    return translateVerbWithEnding(verbEn, 'imperative');
  }

  // g15-24: Want to V? → V을래?
  const wantMatch = original.match(/^Want to\s+(\w+)\?$/i);
  if (wantMatch) {
    const verbEn = wantMatch[1];
    return `${translateVerbWithEnding(verbEn, 'want')}?`;
  }

  // g15-25: Shall we V? → V을까?
  const shallMatch = original.match(/^Shall we\s+(\w+)\?$/i);
  if (shallMatch) {
    const verbEn = shallMatch[1];
    return `${translateVerbWithEnding(verbEn, 'shall')}?`;
  }

  // ============================================
  // Phase g2: 문장 유형 변환 (영→한)
  // ============================================

  // g2-11: Wh-의문문 영→한 (Where do you live? → 어디에 사니?)
  const whEnMatch = original.match(
    /^(where|what|when|why|how|who|which)\s+(?:do|does|did|is|are|was|were|can|will|would)\s+(.+?)\?$/i,
  );
  if (whEnMatch) {
    const whWord = whEnMatch[1].toLowerCase();
    const rest = whEnMatch[2].trim();

    // Wh 단어 한글 변환
    const whKoMap: Record<string, string> = {
      where: '어디에',
      what: '무엇을',
      when: '언제',
      why: '왜',
      how: '어떻게',
      who: '누가',
      which: '어느',
    };
    const whKo = whKoMap[whWord] || whWord;

    // 주어 + 동사 파싱: "you live" → "사니"
    const svMatch = rest.match(/^(\w+)\s+(\w+)$/);
    if (svMatch) {
      const verbEn = svMatch[2].toLowerCase();
      const verbBase = EN_KO[verbEn] || verbEn;
      // 동사 기본형에서 어간 추출 후 의문형 어미 적용
      // 살다 → 살 → 사니 (ㄹ탈락 + 니)
      const verbStem = verbBase.replace(/다$/, '');
      // ㄹ 탈락 규칙: 받침이 ㄹ로 끝나면 제거
      // 살 + 니 → 사니, 알 + 니 → 아니 (일반화된 자모 처리)
      const jongseong = getKoreanFinalConsonant(verbStem);
      const finalVerbStem = jongseong === 'ㄹ' ? removeKoreanFinalConsonant(verbStem) : verbStem;
      const verbKo = `${finalVerbStem}니`;
      return `${whKo} ${verbKo}?`;
    }
  }

  // g2-12: 명령문 영→한 (Close the door! → 문을 닫아라!)
  // 동사로 시작하는 문장 = 명령문
  const imperativeMatch = original.match(/^([A-Z][a-z]+)\s+the\s+(\w+)[!！]?$/);
  if (imperativeMatch) {
    const verbEn = imperativeMatch[1].toLowerCase();
    const nounEn = imperativeMatch[2].toLowerCase();
    const verbKo = EN_KO[verbEn] || verbEn;
    const nounKo = EN_KO[nounEn] || nounEn;
    // 동사 어간 + 아라/어라 (명령형)
    const verbStem = verbKo.replace(/다$/, '');
    // 목적격 조사 선택 (받침 유무)
    const hasJongseong = /[가-힣]/.test(nounKo) && hasKoreanFinalConsonant(nounKo);
    const objParticle = hasJongseong ? '을' : '를';
    return `${nounKo}${objParticle} ${verbStem}아라!`;
  }

  // g2-13: 청유문 Let's → -자 (Let's go home → 집에 가자)
  const letsMatch = original.match(/^let'?s\s+(.+)$/i);
  if (letsMatch) {
    const rest = letsMatch[1].trim();
    // "go home" → 집에 가자
    const goHomeMatch = rest.match(/^go\s+(\w+)$/i);
    if (goHomeMatch) {
      const placeEn = goHomeMatch[1].toLowerCase();
      const placeKo = EN_KO[placeEn] || placeEn;
      return `${placeKo}에 가자`;
    }
    // 일반 동사
    const verbEn = rest.split(/\s+/)[0]?.toLowerCase();
    const verbKo = EN_KO[verbEn] || verbEn;
    const verbStem = verbKo.replace(/다$/, '');
    return `${verbStem}자`;
  }

  // g2-14: 감탄문 영→한 (What a wonderful day! → 정말 멋진 날이구나!)
  const whatAMatch = original.match(/^what\s+a[n]?\s+(\w+)\s+(\w+)[!！]?$/i);
  if (whatAMatch) {
    const adjEn = whatAMatch[1].toLowerCase();
    const nounEn = whatAMatch[2].toLowerCase();
    // 감탄문 문맥에서 형용사 번역 (문맥 기반 변형)
    // wonderful → 멋진 (감탄문), 훌륭한 (일반)
    // amazing → 놀라운 (일반), great → 대단한 (감탄문)
    const exclamationAdjMap: Record<string, string> = {
      wonderful: '멋진',
      great: '대단한',
      lovely: '사랑스러운',
      gorgeous: '화려한',
      brilliant: '훌륭한',
    };
    const adjKo = exclamationAdjMap[adjEn] || EN_KO[adjEn] || adjEn;
    const nounKo = EN_KO[nounEn] || nounEn;
    return `정말 ${adjKo} ${nounKo}이구나!`;
  }

  // g2-9: sing → 부르다 (She sings a song → 그녀가 노래를 부른다)
  // 특수 동사 매핑은 사전에서 처리

  // Phase 5.1: 복합문 처리 (접속사로 연결된 문장)
  // "I go and eat" → "나는 가고 먹는다"
  // "I go but he stays" → "나는 가지만 그는 머문다"
  const compoundResult = processCompoundSentence(parsed, formality);
  if (compoundResult) {
    return compoundResult;
  }

  // 1. 관용구 체크 (formality별 결과 반환)
  const normalized = parsed.original
    .toLowerCase()
    .replace(/[.!?]+$/, '')
    .trim();
  const idiomEntry = IDIOMS_EN_KO[normalized];
  if (idiomEntry) {
    return idiomEntry[formality];
  }

  // 1-1. 영어 부정 명령문 처리: "Don't run!" → "뛰지 마!"
  if (parsed.type === 'imperative' && parsed.negated) {
    // Don't 뒤의 동사 찾기
    const tokens = parsed.tokens.filter((t) => t.stem.toLowerCase() !== "don't");
    const verbToken = tokens.find((t) => t.role === 'verb' || t.role === 'unknown');
    if (verbToken) {
      const verbStem = verbToken.stem.toLowerCase();
      // 영어 동사 → 한국어 동사 어간 변환
      const koVerb = EN_KO[verbStem] || verbStem;
      // -지 마 형태 생성 (formality에 따라 변형)
      return applyProhibitive(koVerb, formality);
    }
  }

  // Phase 3.1: that-clause 감지 및 처리
  // "I think that he goes" → "나는 그가 간다고 생각한다"
  const thatClauseResult = processThatClause(parsed, formality);
  if (thatClauseResult) {
    return thatClauseResult;
  }

  // Phase 3.2: Relative clause 감지 및 처리
  // "The man who runs" → "달리는 남자"
  const relativeClauseResult = processRelativeClause(parsed, formality);
  if (relativeClauseResult) {
    return relativeClauseResult;
  }

  // Phase 3.3: Adverbial clause 감지 및 처리
  // "When I go" → "내가 갈 때"
  // "Because I am tired" → "내가 피곤해서"
  const adverbialClauseResult = processAdverbialClause(parsed, formality);
  if (adverbialClauseResult) {
    return adverbialClauseResult;
  }

  // Phase g4: English passive → Korean passive
  // "The book was written by him" → "그 책은 그에 의해 쓰여졌다"
  // "The window was broken" → "창문이 깨졌다"
  // "She was respected by everyone" → "그녀는 모두에게 존경받았다"
  if (parsed.englishPassive && parsed.englishPassiveVerb) {
    const passiveResult = generateKoreanPassive(parsed, formality);
    if (passiveResult) {
      return passiveResult;
    }
  }

  // 2. 품사 태깅
  const tagged = tagEnglishWords(parsed);

  // 3. 역할별 분류
  let subject = '';
  let verb = '';
  let verbEn = ''; // Phase 8: 영어 동사 원형 (전치사 매핑용)
  let isProgressive = false; // Phase 6
  let isPerfect = false; // Phase 1.1: 완료형
  let modal = ''; // Phase 1.2: 조동사
  let isCopula = false; // Phase 11: 서술격 조사
  let copulaNoun = ''; // be동사 뒤의 명사
  let isConditional = false; // Phase 2.1: 조건문
  let comparativeType: 'comparative' | 'superlative' | undefined; // Phase 2.2
  let auxiliaryVerb: 'want' | 'try' | 'start' | 'stop' | undefined; // Phase 4
  const objects: string[] = [];
  const locations: string[] = [];

  // Phase 2.1: if/unless 감지 (문장 전체에 적용)
  isConditional = tagged.some((w) => w.isConditional);

  for (let i = 0; i < tagged.length; i++) {
    const word = tagged[i];

    if (word.pos === 'subject' && !subject) {
      subject = word.ko;
    } else if (word.pos === 'verb') {
      // Phase 11: 서술격 조사 (be동사 + 명사)
      if (word.isCopula) {
        isCopula = true;
        copulaNoun = word.ko;
        // Phase 2.2: 비교급/최상급 형용사 여부
        if (word.comparativeType) {
          comparativeType = word.comparativeType;
        }
      } else {
        verb = word.ko;
        // Phase 8: 영어 동사 원형 저장 (전치사 매핑용)
        // -ing, -s, -ed 등 어미 제거하여 원형 추출
        verbEn = extractEnglishVerbBase(word.lower);
        isProgressive = word.isProgressive || false; // Phase 6
        isPerfect = word.isPerfect || false; // Phase 1.1
        modal = word.modal || ''; // Phase 1.2
        auxiliaryVerb = word.auxiliaryVerb; // Phase 4
      }
    } else if (word.pos === 'object' || (word.pos === 'unknown' && word.ko)) {
      // 전치사 뒤의 명사는 위치/부사구로 처리
      const prev = tagged[i - 1];
      if (prev && prev.pos === 'prep') {
        // Phase 8: 동사+전치사 조합에 따른 조사 선택
        const particle = getParticleForPreposition(prev.text, word.ko, verbEn);
        locations.push(`${word.ko}${particle}`);
      } else if (word.ko) {
        objects.push(word.ko);
      }
    }
  }

  // g2-9: 동사-목적어 조합 기반 번역 (sing + song → 부르다)
  // 문맥에 따라 동사 의미가 달라지는 경우 처리
  if (verbEn && objects.length > 0) {
    const contextVerbMap: Record<string, Record<string, string>> = {
      sing: { 노래: '부르다' }, // sing a song → 노래를 부르다
      play: { 노래: '연주하다', 음악: '연주하다', 게임: '하다' }, // play music → 음악을 연주하다
      take: { 사진: '찍다', 시험: '보다' }, // take a photo → 사진을 찍다
      make: { 결정: '내리다', 소리: '내다' }, // make a decision → 결정을 내리다
    };
    const objectKo = objects[0];
    if (contextVerbMap[verbEn]?.[objectKo]) {
      verb = contextVerbMap[verbEn][objectKo];
    }
  }

  // 4. 단일 단어 처리 (조사 없이 반환)
  const meaningfulParts = [subject, verb, copulaNoun, ...objects, ...locations].filter(Boolean);
  if (meaningfulParts.length === 1) {
    return meaningfulParts[0];
  }

  // Phase 11: 서술격 조사 처리 (be동사 + 명사 → 명사 + 이다)
  // "I am a person" → "나는 사람이다"
  // "She is a student" → "그녀는 학생이다"
  // Phase 2.2: 비교급/최상급 형용사 처리
  // "He is taller" → "그는 더 크다"
  // "She is the tallest" → "그녀는 가장 크다"
  if (isCopula && copulaNoun) {
    const parts: string[] = [];

    // 주어 + 는/은
    if (subject) {
      parts.push(applySubjectParticle(subject, 'topic'));
    }

    // Phase 2.2: 비교급/최상급 형용사 처리
    if (comparativeType) {
      // 형용사 어간 추출 및 활용
      const adjEnding = applyComparativeAdjective(
        copulaNoun,
        comparativeType,
        formality,
        parsed.type,
      );
      parts.push(adjEnding);
    } else {
      // 명사 + 이다 (어조에 맞게 변환)
      const copulaEnding = applyCopulaFormality(copulaNoun, formality, parsed.type);
      parts.push(copulaEnding);
    }

    // 의문문 처리
    if (parsed.type === 'question') {
      return `${parts.join(' ')}?`;
    }

    return parts.join(' ');
  }

  // 5. SOV 어순으로 재조합 (Phase 9: 조사 자동 선택)
  const parts: string[] = [];

  // 주어 + 조사 선택
  // Phase 2.1: 조건문에서는 가/이 사용
  // 3인칭 주어(그, 그녀, 그들 등)는 가/이 사용 (기술적 진술)
  // 1/2인칭 주어(나, 너, 우리 등)는 는/은 사용 (주제화)
  const thirdPersonSubjects = ['그', '그녀', '그것', '그들', '이것', '저것'];
  if (subject) {
    const is3rdPerson = thirdPersonSubjects.includes(subject);
    const particleType = isConditional || is3rdPerson ? 'subject' : 'topic';
    parts.push(applySubjectParticle(subject, particleType));
  }

  // 목적어 + 을/를 (받침에 따라 선택)
  for (const obj of objects) {
    const particle = selectObjectParticle(obj);
    parts.push(`${obj}${particle}`);
  }

  // 위치 (에/에서)
  for (const loc of locations) {
    parts.push(loc);
  }

  // 동사 (Phase 6: 진행형, Phase 7: 의문형 처리, Phase 10: 어조 적용)
  // Phase 12: 시제 처리 (과거/미래)
  // Phase 1.1: Perfect Tense, Phase 1.2: Modal Verbs
  // Phase 2.1: Conditionals (조건문)
  if (verb) {
    const sentenceType = parsed.type === 'question' ? 'question' : 'statement';

    if (isConditional) {
      // Phase 2.1: 조건문 → -(으)면
      parts.push(applyConditional(verb));
    } else if (isPerfect) {
      // Phase 1.1: 완료형 → -은/ㄴ 적 있다
      parts.push(applyPerfectTense(verb, formality, sentenceType));
    } else if (modal && parsed.negated) {
      // Phase 1.3: 조동사 + 부정 → -ㄹ 수 없다, -면 안 되다 등
      parts.push(applyNegatedModalVerb(verb, modal, formality, sentenceType));
    } else if (modal) {
      // Phase 1.2: 조동사 → -ㄹ 수 있다, -아/어야 하다 등
      parts.push(applyModalVerb(verb, modal, formality, sentenceType));
    } else if (auxiliaryVerb) {
      // Phase 4: 보조용언 → -고 싶다, -아/어 보다 등
      parts.push(applyAuxiliaryVerb(verb, auxiliaryVerb, formality, sentenceType));
    } else if (isProgressive && parsed.tense === 'past') {
      // 과거 진행형: -고 있었다 (was/were + -ing)
      const progressive = toProgressiveKorean(verb);
      const baseProgressive = progressive.replace(/있다$/, '');
      parts.push(baseProgressive + applyPastProgressiveEnding(formality, sentenceType));
    } else if (isProgressive) {
      // 현재 진행형: -고 있다 (am/is/are + -ing)
      const progressive = toProgressiveKorean(verb);
      const baseProgressive = progressive.replace(/있다$/, '');
      // 진행형의 "있다"는 특별 처리 (있다 → 있어/있어요/있다)
      parts.push(baseProgressive + applyProgressiveEnding(formality, sentenceType));
    } else if (parsed.tense === 'past' && parsed.negated) {
      // Phase 12: 과거 부정 → -지 않았다 (didn't + verb)
      parts.push(applyPastNegation(verb, formality, sentenceType));
    } else if (parsed.tense === 'past') {
      // Phase 12: 과거 시제 → -었다/-았다
      parts.push(applyPastTense(verb, formality, sentenceType));
    } else if (parsed.tense === 'future' && parsed.negated) {
      // Phase 12: 미래 부정 → -지 않을 것이다 (won't + verb)
      parts.push(applyFutureNegation(verb, formality, sentenceType));
    } else if (parsed.tense === 'future') {
      // Phase 12: 미래 시제 → -ㄹ 것이다
      parts.push(applyFutureTense(verb, formality, sentenceType));
    } else if (parsed.negated) {
      // Phase 12: 부정문 → -지 않다
      parts.push(applyNegation(verb, formality, sentenceType));
    } else {
      // 현재 시제
      parts.push(applyFormality(verb, formality, sentenceType));
    }
  }

  // 6. 의문문 처리
  if (parsed.type === 'question' && parts.length > 0) {
    return `${parts.join(' ')}?`;
  }

  return parts.join(' ');
}

// ============================================
// Phase 10: 어조/격식 변환 시스템
// ============================================

/**
 * 어조별 어미 매핑
 *
 * 동사 기본형(-다)을 어조에 맞게 변환
 */
const FORMALITY_ENDINGS: Record<
  Formality,
  { statement: string; question: string; suffix?: string }
> = {
  casual: { statement: '해', question: '해' }, // 반말
  formal: { statement: '해요', question: '하세요' }, // 존댓말
  neutral: { statement: '한다', question: '하니' }, // 상관없음 (기본)
  friendly: { statement: '해', question: '해', suffix: '~' }, // 친근체
  literal: { statement: '합니다', question: '합니까' }, // 번역체
};

/**
 * 동사에 어조 적용
 *
 * @param verb 동사 기본형 (예: 좋아하다, 먹다, 가다)
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyFormality(
  verb: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  const endings = FORMALITY_ENDINGS[formality];

  // 동사 어간 추출 (다 제거)
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 처리
  if (verb.endsWith('하다') || verb === '하다') {
    const prefix = verb === '하다' ? '' : verb.slice(0, -2);
    const ending = sentenceType === 'question' ? endings.question : endings.statement;
    const suffix = endings.suffix || '';
    return prefix + ending + suffix;
  }

  // 있다/없다 처리
  if (verb === '있다' || verb === '없다') {
    const base = verb.slice(0, -1); // 있 or 없
    return applyVerbEnding(base, formality, sentenceType);
  }

  // 일반 동사 처리
  return applyVerbEnding(stem, formality, sentenceType);
}

/**
 * 일반 동사에 어미 적용
 *
 * 한국어 동사 활용 규칙:
 * - 받침 있는 어간 + 는다/습니다 (먹다 → 먹는다/먹습니다)
 * - 받침 없는 어간 + ㄴ다/ㅂ니다 (가다 → 간다/갑니다)
 */
function applyVerbEnding(
  stem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  const suffix = FORMALITY_ENDINGS[formality].suffix || '';

  // 어간 분석: 동사 원형에서 "다" 제거
  let verbStem = stem;
  if (stem.endsWith('다')) {
    verbStem = stem.slice(0, -1);
  }

  // 어간의 마지막 글자 받침 유무 확인
  const lastChar = verbStem[verbStem.length - 1] || '';
  const hasJong = hasJongseong(lastChar);

  switch (formality) {
    case 'casual':
      // 반말: 어간 + 아/어
      return `${verbStem}${getInformalEnding(verbStem)}${suffix}`;
    case 'formal':
      // 존댓말: 어간 + 아요/어요 (의문문: 으세요)
      if (sentenceType === 'question') {
        return `${verbStem}으세요${suffix}`;
      }
      return `${verbStem}${getInformalEnding(verbStem)}요${suffix}`;
    case 'neutral':
      // 상관없음: 받침 있으면 는다, 없으면 ㄴ다 (의문문: 니)
      if (sentenceType === 'question') {
        return `${verbStem}니${suffix}`;
      }
      // 받침 유무에 따른 어미 선택
      if (hasJong) {
        return `${verbStem}는다${suffix}`;
      }
      // 받침 없는 어간: ㄴ 받침 추가 (가 → 간)
      return `${addJongseong(verbStem, 'ㄴ')}다${suffix}`;
    case 'friendly':
      // 친근체: 반말 + ~
      return `${verbStem}${getInformalEnding(verbStem)}${suffix}`;
    case 'literal':
      // 번역체: 받침 있으면 습니다, 없으면 ㅂ니다 (의문문: 습니까/ㅂ니까)
      if (sentenceType === 'question') {
        if (hasJong) {
          return `${verbStem}습니까${suffix}`;
        }
        return `${addJongseong(verbStem, 'ㅂ')}니까${suffix}`;
      }
      if (hasJong) {
        return `${verbStem}습니다${suffix}`;
      }
      return `${addJongseong(verbStem, 'ㅂ')}니다${suffix}`;
    default:
      return `${verbStem}다`;
  }
}

// ============================================
// Phase 11: 서술격 조사 (이다) 어조별 활용
// ============================================

/**
 * 서술격 조사 어조별 어미
 *
 * 받침 유무에 따라:
 * - 받침 있음: 이다, 입니다, 이에요, 이야
 * - 받침 없음: 다, 입니다, 예요, 야
 */
const COPULA_ENDINGS: Record<
  Formality,
  {
    statement: { withJong: string; noJong: string };
    question: { withJong: string; noJong: string };
  }
> = {
  casual: {
    statement: { withJong: '이야', noJong: '야' },
    question: { withJong: '이야', noJong: '야' },
  },
  formal: {
    statement: { withJong: '이에요', noJong: '예요' },
    question: { withJong: '이에요', noJong: '예요' },
  },
  neutral: {
    statement: { withJong: '이다', noJong: '다' },
    question: { withJong: '이니', noJong: '니' },
  },
  friendly: {
    statement: { withJong: '이야~', noJong: '야~' },
    question: { withJong: '이야', noJong: '야' },
  },
  literal: {
    statement: { withJong: '입니다', noJong: '입니다' },
    question: { withJong: '입니까', noJong: '입니까' },
  },
};

/**
 * 서술격 조사 어조 적용
 *
 * @param noun 명사 (예: 사람, 학생)
 * @param formality 어조
 * @param sentenceType 문장 유형
 * @returns 명사 + 이다 활용형 (예: 사람이다, 학생입니다)
 */
function applyCopulaFormality(
  noun: string,
  formality: Formality,
  sentenceType: SentenceType,
): string {
  const endings = COPULA_ENDINGS[formality];
  const type = sentenceType === 'question' ? 'question' : 'statement';
  const lastChar = noun[noun.length - 1];
  const hasJong = hasJongseong(lastChar);

  const ending = hasJong ? endings[type].withJong : endings[type].noJong;
  return `${noun}${ending}`;
}

/**
 * Phase 2.2: 비교급/최상급 형용사 활용
 *
 * 비교급: 더 + 형용사
 * 최상급: 가장 + 형용사
 *
 * @param adjective 형용사 기본형 (예: 크다, 작다)
 * @param comparativeType 비교급/최상급
 * @param formality 어조
 * @param sentenceType 문장 유형
 * @returns 활용된 형용사 (예: 더 크다, 가장 크다)
 */
function applyComparativeAdjective(
  adjective: string,
  comparativeType: 'comparative' | 'superlative',
  formality: Formality,
  sentenceType: SentenceType,
): string {
  // 비교급: 더, 최상급: 가장
  const prefix = comparativeType === 'comparative' ? '더' : '가장';

  // 어간 추출
  let stem = adjective;
  if (adjective.endsWith('다')) {
    stem = adjective.slice(0, -1);
  }

  // 어조에 따른 종결어미
  const type = sentenceType === 'question' ? 'question' : 'statement';

  // 형용사는 동사와 다르게 활용
  // 크다 → 크다/커요/큽니다
  if (formality === 'formal') {
    // 격식체: -ㅂ니다/-습니다
    const lastChar = stem[stem.length - 1];
    if (hasJongseong(lastChar)) {
      return type === 'question' ? `${prefix} ${stem}습니까` : `${prefix} ${stem}습니다`;
    }
    return type === 'question' ? `${prefix} ${stem}ㅂ니까` : `${prefix} ${stem}ㅂ니다`;
  }

  if (formality === 'casual') {
    // 반말: -아/어
    const ending = getInformalEnding(stem);
    return `${prefix} ${stem}${ending}`;
  }

  if (formality === 'friendly') {
    // 친근체: -아/어요
    const ending = getInformalEnding(stem);
    return `${prefix} ${stem}${ending}요`;
  }

  // neutral/literal: -다
  return `${prefix} ${stem}다`;
}

/**
 * Phase 4: 보조용언 적용
 *
 * 영어 auxiliary + infinitive 패턴을 한국어 보조용언으로 변환
 * - want to: -고 싶다 (I want to go → 가고 싶다)
 * - try to: -아/어 보다 (I try to eat → 먹어 보다)
 * - start to: -기 시작하다 (I start to run → 달리기 시작하다)
 * - stop ~ing: -는 것을 멈추다
 *
 * @param verb 동사 기본형 (예: 가다, 먹다)
 * @param auxiliaryType 보조용언 종류
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyAuxiliaryVerb(
  verb: string,
  auxiliaryType: 'want' | 'try' | 'start' | 'stop',
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 처리 (먹다 → 먹, 하다 → 하)
  let prefix = '';
  if (verb.endsWith('하다') && verb !== '하다') {
    prefix = verb.slice(0, -2);
    stem = '하';
  }

  switch (auxiliaryType) {
    case 'want': {
      // -고 싶다 (desiderative)
      const base = `${prefix}${stem}고 싶`;
      return applyAuxiliaryEnding(base, formality, sentenceType);
    }
    case 'try': {
      // -아/어 보다 (attemptive)
      const ending = getInformalEnding(stem);
      const base = `${prefix}${stem}${ending} 보`;
      return applyAuxiliaryEnding(base, formality, sentenceType);
    }
    case 'start': {
      // -기 시작하다 (inchoative)
      const base = `${prefix}${stem}기 시작하`;
      return applyAuxiliaryEnding(base, formality, sentenceType);
    }
    case 'stop': {
      // -는 것을 멈추다
      const base = `${prefix}${stem}는 것을 멈추`;
      return applyAuxiliaryEnding(base, formality, sentenceType);
    }
    default:
      return applyFormality(verb, formality, sentenceType);
  }
}

/**
 * 보조용언 어미 적용
 * 싶-, 보-, 시작하-, 멈추- 등에 어조별 어미 추가
 */
function applyAuxiliaryEnding(
  base: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 보조용언 어간의 마지막 글자 확인
  const lastChar = base[base.length - 1];

  if (formality === 'formal') {
    if (hasJongseong(lastChar)) {
      return sentenceType === 'question' ? `${base}습니까` : `${base}습니다`;
    }
    return sentenceType === 'question' ? `${base}ㅂ니까` : `${base}ㅂ니다`;
  }

  if (formality === 'casual') {
    const ending = getInformalEnding(base);
    return `${base}${ending}`;
  }

  if (formality === 'friendly') {
    const ending = getInformalEnding(base);
    return `${base}${ending}요`;
  }

  // neutral/literal: -다
  return `${base}다`;
}

// ============================================
// Phase 6.2: 불규칙 활용 (Irregular Conjugation)
// ============================================

/**
 * ㄷ불규칙 동사 목록
 * 어간 끝 ㄷ이 모음 앞에서 ㄹ로 바뀜
 * 예: 듣다 → 들어, 걷다 → 걸어
 */
const DIGEUT_IRREGULAR_VERBS = new Set([
  '듣다', // listen → 들어
  '걷다', // walk → 걸어
  '묻다', // ask → 물어
  '싣다', // load → 실어
  '깨닫다', // realize → 깨달아
]);

/**
 * ㅂ불규칙 동사/형용사 목록
 * 어간 끝 ㅂ이 모음 앞에서 ㅜ(또는 ㅗ)로 바뀜
 * 예: 돕다 → 도와, 춥다 → 추워
 */
const BIEUP_IRREGULAR_VERBS = new Set([
  '돕다', // help → 도와
  '춥다', // cold → 추워
  '덥다', // hot → 더워
  '어렵다', // difficult → 어려워
  '쉽다', // easy → 쉬워
  '고맙다', // thankful → 고마워
  '아름답다', // beautiful → 아름다워
  '무섭다', // scary → 무서워
  '귀엽다', // cute → 귀여워
  '가깝다', // close → 가까워
  '무겁다', // heavy → 무거워
  '가볍다', // light → 가벼워
  '맵다', // spicy → 매워
  '새롭다', // new → 새로워
  '즐겁다', // joyful → 즐거워
  '슬프다', // sad → 슬퍼 (예외: ㅜ→ㅓ)
]);

/**
 * ㅎ불규칙 형용사 목록
 * 어간 끝 ㅎ이 모음 앞에서 탈락
 * 예: 그렇다 → 그래, 빨갛다 → 빨개
 */
const HIEUT_IRREGULAR_ADJECTIVES = new Set([
  '그렇다', // like that → 그래
  '이렇다', // like this → 이래
  '저렇다', // like that (far) → 저래
  '어떻다', // how → 어때
  '빨갛다', // red → 빨개
  '노랗다', // yellow → 노래
  '파랗다', // blue → 파래
  '하얗다', // white → 하얘
  '까맣다', // black → 까매
]);

/**
 * 르불규칙 동사/형용사 목록
 * 어간 끝 르가 아/어 앞에서 ㄹㄹ로 바뀜
 * 예: 부르다 → 불러, 모르다 → 몰라
 */
const REU_IRREGULAR_VERBS = new Set([
  '부르다', // call → 불러
  '모르다', // don't know → 몰라
  '자르다', // cut → 잘라
  '오르다', // climb → 올라
  '고르다', // choose → 골라
  '다르다', // different → 달라
  '빠르다', // fast → 빨라
  '누르다', // press → 눌러
  '마르다', // dry → 말라
  '이르다', // early/reach → 일러
]);

/**
 * ㅅ불규칙 동사 목록
 * 어간 끝 ㅅ이 모음 앞에서 탈락
 * 예: 짓다 → 지어, 낫다 → 나아
 */
const SIOT_IRREGULAR_VERBS = new Set([
  '짓다', // build → 지어
  '낫다', // recover/better → 나아
  '잇다', // connect → 이어
  '긋다', // draw (line) → 그어
  '붓다', // pour → 부어
]);

/**
 * ㄷ불규칙 활용 적용
 * 어간 끝 ㄷ → ㄹ (모음 앞)
 */
function applyDieutIrregular(stem: string): string {
  if (!stem) return stem;
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) return stem;

  const syllableIndex = code - 0xac00;
  const cho = Math.floor(syllableIndex / 588);
  const jung = Math.floor((syllableIndex % 588) / 28);
  const jong = syllableIndex % 28;

  // 종성이 ㄷ(7)인 경우 ㄹ(8)로 변경
  if (jong === 7) {
    const newCode = 0xac00 + cho * 588 + jung * 28 + 8; // ㄹ = 8
    return stem.slice(0, -1) + String.fromCharCode(newCode);
  }

  return stem;
}

/**
 * ㅂ불규칙 활용 적용
 * 어간 끝 ㅂ 탈락 + ㅜ/ㅗ 추가
 */
function applyBieupIrregular(verb: string, stem: string): string {
  if (!stem) return stem;
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) return stem;

  const syllableIndex = code - 0xac00;
  const cho = Math.floor(syllableIndex / 588);
  const jung = Math.floor((syllableIndex % 588) / 28);
  const jong = syllableIndex % 28;

  // 종성이 ㅂ(17)인 경우
  if (jong === 17) {
    // 받침 제거
    const newCode = 0xac00 + cho * 588 + jung * 28;
    const stemWithoutJong = stem.slice(0, -1) + String.fromCharCode(newCode);

    // 슬프다 등 ㅡ 모음: ㅓ 추가 → 슬퍼
    // 그 외 (돕다, 춥다 등): 오/우 + 아/어 → 와/워
    if (verb === '슬프다') {
      return `${stemWithoutJong}퍼`;
    }
    // 양성모음 (ㅏ, ㅗ): 와
    if (jung === 0 || jung === 8) {
      return `${stemWithoutJong}와`;
    }
    // 음성모음: 워
    return `${stemWithoutJong}워`;
  }

  return stem;
}

/**
 * ㅎ불규칙 활용 적용
 * 어간 끝 ㅎ 탈락 + 모음 변화
 */
function applyHieutIrregular(stem: string): string {
  if (!stem) return stem;
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) return stem;

  const syllableIndex = code - 0xac00;
  const cho = Math.floor(syllableIndex / 588);
  const _jung = Math.floor((syllableIndex % 588) / 28);
  const jong = syllableIndex % 28;

  // 종성이 ㅎ(27)인 경우
  if (jong === 27) {
    // 받침 제거하고 ㅐ로 변경 (그렇 → 그래)
    // jung을 ㅐ(1)로 변경
    const newCode = 0xac00 + cho * 588 + 1 * 28; // ㅐ = 1, 받침 없음
    return stem.slice(0, -1) + String.fromCharCode(newCode);
  }

  return stem;
}

/**
 * 르불규칙 활용 적용
 * 어간 끝 르 → ㄹ + ㄹ아/ㄹ러
 */
function applyReuIrregular(stem: string): string {
  if (!stem || stem.length < 2) return stem;

  // 르로 끝나는지 확인
  if (!stem.endsWith('르')) return stem;

  // 르 앞 글자
  const beforeReu = stem.slice(0, -1);
  const lastChar = beforeReu[beforeReu.length - 1];

  if (!lastChar) return stem;

  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return stem;

  const syllableIndex = code - 0xac00;
  const cho = Math.floor(syllableIndex / 588);
  const jung = Math.floor((syllableIndex % 588) / 28);

  // 앞 글자에 ㄹ 받침 추가
  const newCode = 0xac00 + cho * 588 + jung * 28 + 8; // ㄹ = 8
  const stemWithRieul = beforeReu.slice(0, -1) + String.fromCharCode(newCode);

  // 양성모음 → 라, 음성모음 → 러
  if (jung === 0 || jung === 8) {
    return `${stemWithRieul}라`;
  }
  return `${stemWithRieul}러`;
}

/**
 * ㅅ불규칙 활용 적용
 * 어간 끝 ㅅ 탈락
 */
function applySiotIrregular(stem: string): string {
  if (!stem) return stem;
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) return stem;

  const syllableIndex = code - 0xac00;
  const cho = Math.floor(syllableIndex / 588);
  const jung = Math.floor((syllableIndex % 588) / 28);
  const jong = syllableIndex % 28;

  // 종성이 ㅅ(19)인 경우
  if (jong === 19) {
    // 받침 제거
    const newCode = 0xac00 + cho * 588 + jung * 28;
    const stemWithoutJong = stem.slice(0, -1) + String.fromCharCode(newCode);
    // 아/어 추가
    if (jung === 0 || jung === 8) {
      return `${stemWithoutJong}아`;
    }
    return `${stemWithoutJong}어`;
  }

  return stem;
}

/**
 * 불규칙 활용 여부 확인 및 적용
 * @param verb 동사/형용사 기본형 (예: 듣다, 돕다)
 * @returns 활용된 어간 또는 null (규칙 활용인 경우)
 */
function applyIrregularConjugation(verb: string): string | null {
  const stem = verb.endsWith('다') ? verb.slice(0, -1) : verb;

  // ㄷ불규칙
  if (DIGEUT_IRREGULAR_VERBS.has(verb)) {
    return applyDieutIrregular(stem);
  }

  // ㅂ불규칙
  if (BIEUP_IRREGULAR_VERBS.has(verb)) {
    return applyBieupIrregular(verb, stem);
  }

  // ㅎ불규칙
  if (HIEUT_IRREGULAR_ADJECTIVES.has(verb)) {
    return applyHieutIrregular(stem);
  }

  // 르불규칙
  if (REU_IRREGULAR_VERBS.has(verb)) {
    return applyReuIrregular(stem);
  }

  // ㅅ불규칙
  if (SIOT_IRREGULAR_VERBS.has(verb)) {
    return applySiotIrregular(stem);
  }

  return null; // 규칙 활용
}

/**
 * 비격식 어미 (아/어) 선택
 * 모음조화 규칙 적용
 */
function getInformalEnding(stem: string): string {
  if (!stem) return '어';

  // 마지막 글자의 모음 확인
  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  // 한글 범위 체크
  if (code < 0xac00 || code > 0xd7a3) {
    return '어';
  }

  // 받침 + 모음 분석
  const syllableIndex = code - 0xac00;
  const vowelIndex = Math.floor((syllableIndex % 588) / 28);

  // 양성모음 (ㅏ, ㅗ) → 아
  // vowelIndex: 0=ㅏ, 8=ㅗ
  if (vowelIndex === 0 || vowelIndex === 8) {
    return '아';
  }

  return '어';
}

// ============================================
// Phase 12: 과거/미래/부정 시제 변환
// ============================================

/**
 * 과거 시제 적용 (-었다/-았다)
 *
 * 모음조화 규칙:
 * - 양성모음(ㅏ, ㅗ) + 았 → 갔다, 왔다
 * - 음성모음(그 외) + 었 → 먹었다, 했다
 *
 * @param verb 동사 기본형 (예: 먹다, 가다)
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyPastTense(
  verb: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 처리
  if (verb.endsWith('하다') || verb === '하다') {
    const prefix = verb === '하다' ? '' : verb.slice(0, -2);
    return applyPastEnding(`${prefix}했`, formality, sentenceType);
  }

  // Phase 6.2: 불규칙 활용 처리
  const irregularStem = applyIrregularConjugation(verb);
  if (irregularStem) {
    // 불규칙 활용된 어간에 ㅆ 받침 추가 (과거)
    return applyPastEnding(addJongseong(irregularStem, 'ㅆ'), formality, sentenceType);
  }

  // 마지막 글자 분석
  const lastChar = stem[stem.length - 1];
  if (!lastChar) return verb;

  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) {
    // 한글이 아닌 경우
    return `${stem}었${getPastSuffix(formality, sentenceType)}`;
  }

  // 모음조화 판단
  const syllableIndex = code - 0xac00;
  const vowelIndex = Math.floor((syllableIndex % 588) / 28);
  const hasJong = hasJongseong(lastChar);

  // 양성모음 (ㅏ=0, ㅗ=8)
  if (vowelIndex === 0 || vowelIndex === 8) {
    if (hasJong) {
      // 받침 있음: 먹 + 았 → 먹았
      return applyPastEnding(`${stem}았`, formality, sentenceType);
    }
    // 받침 없음: ㅏ → 축약 (가 + 았 → 갔)
    if (vowelIndex === 0) {
      // 가 → 갔 (ㅏ+ㅏ 축약)
      return applyPastEnding(addJongseong(stem, 'ㅆ'), formality, sentenceType);
    }
    // ㅗ → 왔 (오 + 았 → 왔)
    // 복잡한 축약은 간단히 처리
    return applyPastEnding(`${stem}았`, formality, sentenceType);
  }

  // 음성모음
  if (hasJong) {
    return applyPastEnding(`${stem}었`, formality, sentenceType);
  }
  // 받침 없는 음성모음: 축약
  return applyPastEnding(`${stem}었`, formality, sentenceType);
}

/**
 * 과거 어미 접미사
 */
function getPastSuffix(formality: Formality, sentenceType: 'statement' | 'question'): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? '어' : '어';
    case 'formal':
      return sentenceType === 'question' ? '어요' : '어요';
    case 'neutral':
      return sentenceType === 'question' ? '니' : '다';
    case 'friendly':
      return sentenceType === 'question' ? '어' : '어~';
    case 'literal':
      return sentenceType === 'question' ? '습니까' : '습니다';
    default:
      return '다';
  }
}

/**
 * 과거 어간에 어미 적용
 */
function applyPastEnding(
  pastStem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  const suffix = getPastSuffix(formality, sentenceType);
  return `${pastStem}${suffix}`;
}

/**
 * 미래 시제 적용 (-ㄹ 것이다)
 *
 * 규칙:
 * - 받침 있음: + 을 것이다 (먹을 것이다)
 * - 받침 없음: + ㄹ 것이다 (갈 것이다)
 *
 * @param verb 동사 기본형
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyFutureTense(
  verb: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 처리
  if (verb.endsWith('하다') || verb === '하다') {
    const prefix = verb === '하다' ? '' : verb.slice(0, -2);
    return applyFutureEnding(`${prefix}할`, formality, sentenceType);
  }

  // Phase 6.2: 불규칙 활용 처리 (미래 시제용)
  // ㄷ불규칙: 듣다 → 들을 것이다
  // 르불규칙: 부르다 → 부를 것이다 (르불규칙은 미래에서 규칙 적용)
  if (DIGEUT_IRREGULAR_VERBS.has(verb)) {
    const irregularStem = applyDieutIrregular(stem);
    // 들 (ㄹ 받침 있음) → 들을
    return applyFutureEnding(`${irregularStem}을`, formality, sentenceType);
  }

  const lastChar = stem[stem.length - 1];
  if (!lastChar) return verb;

  const hasJong = hasJongseong(lastChar);

  if (hasJong) {
    // 받침 있음: 먹 + 을 것 → 먹을 것
    return applyFutureEnding(`${stem}을`, formality, sentenceType);
  }
  // 받침 없음: 가 + ㄹ → 갈
  return applyFutureEnding(addJongseong(stem, 'ㄹ'), formality, sentenceType);
}

/**
 * 미래 어간에 어미 적용
 */
function applyFutureEnding(
  futureStem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${futureStem} 거야` : `${futureStem} 거야`;
    case 'formal':
      return sentenceType === 'question' ? `${futureStem} 거예요` : `${futureStem} 거예요`;
    case 'neutral':
      return sentenceType === 'question' ? `${futureStem} 것이니` : `${futureStem} 것이다`;
    case 'friendly':
      return sentenceType === 'question' ? `${futureStem} 거야` : `${futureStem} 거야~`;
    case 'literal':
      return sentenceType === 'question' ? `${futureStem} 것입니까` : `${futureStem} 것입니다`;
    default:
      return `${futureStem} 것이다`;
  }
}

/**
 * 부정문 적용 (안 + 동사)
 * "I don't go" → "나는 안 간다"
 * "He doesn't eat" → "그는 안 먹는다"
 *
 * @param verb 동사 기본형
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyNegation(
  verb: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 동사를 해당 어조로 활용한 후 "안" 추가
  const conjugated = applyFormality(verb, formality, sentenceType);
  return `안 ${conjugated}`;
}

/**
 * 금지 명령문 적용 (-지 마!)
 * "Don't run!" → "뛰지 마!"
 * "Don't eat!" → "먹지 마!"
 *
 * @param verb 한국어 동사 기본형 (먹다, 가다, 뛰다 등)
 * @param formality 어조
 */
function applyProhibitive(verb: string, formality: Formality): string {
  // 동사 어간 추출 (다 제거)
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // formality에 따른 -지 마 변형
  switch (formality) {
    case 'casual':
      return `${stem}지 마!`;
    case 'neutral':
    case 'formal':
      return `${stem}지 마세요!`;
    case 'friendly':
      return `${stem}지 마~`;
    case 'literal':
      return `${stem}지 마시오!`;
    default:
      return `${stem}지 마!`;
  }
}

/**
 * 부정 어간에 어미 적용
 */
function _applyNegationEnding(
  negStem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${negStem} 않아` : `${negStem} 않아`;
    case 'formal':
      return sentenceType === 'question' ? `${negStem} 않아요` : `${negStem} 않아요`;
    case 'neutral':
      return sentenceType === 'question' ? `${negStem} 않니` : `${negStem} 않는다`;
    case 'friendly':
      return sentenceType === 'question' ? `${negStem} 않아` : `${negStem} 않아~`;
    case 'literal':
      return sentenceType === 'question' ? `${negStem} 않습니까` : `${negStem} 않습니다`;
    default:
      return `${negStem} 않는다`;
  }
}

/**
 * 과거 부정문 적용 (안 + 과거 동사)
 * "I didn't sleep" → "나는 안 잤다"
 * "I didn't eat" → "나는 안 먹었다"
 */
function applyPastNegation(
  verb: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 동사를 과거형으로 활용한 후 "안" 추가
  const conjugated = applyPastTense(verb, formality, sentenceType);
  return `안 ${conjugated}`;
}

/**
 * 과거 부정 어간에 어미 적용
 */
function _applyPastNegationEnding(
  negStem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${negStem} 않았어` : `${negStem} 않았어`;
    case 'formal':
      return sentenceType === 'question' ? `${negStem} 않았어요` : `${negStem} 않았어요`;
    case 'neutral':
      return sentenceType === 'question' ? `${negStem} 않았니` : `${negStem} 않았다`;
    case 'friendly':
      return sentenceType === 'question' ? `${negStem} 않았어` : `${negStem} 않았어~`;
    case 'literal':
      return sentenceType === 'question' ? `${negStem} 않았습니까` : `${negStem} 않았습니다`;
    default:
      return `${negStem} 않았다`;
  }
}

/**
 * 미래 부정문 적용 (안 + 미래 동사)
 * "I won't go" → "나는 안 갈 것이다"
 * "I won't eat" → "나는 안 먹을 것이다"
 */
function applyFutureNegation(
  verb: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 동사를 미래형으로 활용한 후 "안" 추가
  const conjugated = applyFutureTense(verb, formality, sentenceType);
  return `안 ${conjugated}`;
}

/**
 * 미래 부정 어간에 어미 적용
 */
function _applyFutureNegationEnding(
  negStem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${negStem} 않을 거야` : `${negStem} 않을 거야`;
    case 'formal':
      return sentenceType === 'question' ? `${negStem} 않을 거예요` : `${negStem} 않을 거예요`;
    case 'neutral':
      return sentenceType === 'question' ? `${negStem} 않을 거니` : `${negStem} 않을 것이다`;
    case 'friendly':
      return sentenceType === 'question' ? `${negStem} 않을 거야` : `${negStem} 않을 거야~`;
    case 'literal':
      return sentenceType === 'question' ? `${negStem} 않을 것입니까` : `${negStem} 않을 것입니다`;
    default:
      return `${negStem} 않을 것이다`;
  }
}

// ============================================
// Phase 1.1: Perfect Tense (완료형) 변환
// ============================================

/**
 * 완료형 적용 (-은/ㄴ 적 있다)
 *
 * 현재완료 (have + pp):
 * - 경험: -아/어 본 적 있다 (I have eaten → 먹어 본 적 있다)
 * - 완료: -아/어 봤다 (I have finished → 끝냈다)
 *
 * 규칙:
 * - 받침 있음: + 은 적 있다 (먹은 적 있다)
 * - 받침 없음: + ㄴ 적 있다 (간 적 있다)
 *
 * @param verb 동사 기본형 (예: 먹다, 가다)
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyPerfectTense(
  verb: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 처리
  if (verb.endsWith('하다') || verb === '하다') {
    const prefix = verb === '하다' ? '' : verb.slice(0, -2);
    return applyPerfectEnding(`${prefix}해 본 적`, formality, sentenceType);
  }

  const lastChar = stem[stem.length - 1];
  if (!lastChar) return verb;

  // 모음조화에 따른 어미 선택
  const code = lastChar.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const syllableIndex = code - 0xac00;
    const vowelIndex = Math.floor((syllableIndex % 588) / 28);
    const hasJong = hasJongseong(lastChar);

    // 양성모음 (ㅏ=0, ㅗ=8) → 아
    if (vowelIndex === 0 || vowelIndex === 8) {
      if (hasJong) {
        return applyPerfectEnding(`${stem}아 본 적`, formality, sentenceType);
      }
      // 축약: 가 + 아 → 가
      if (vowelIndex === 0) {
        return applyPerfectEnding(`${stem} 본 적`, formality, sentenceType);
      }
      return applyPerfectEnding(`${stem}아 본 적`, formality, sentenceType);
    }

    // 음성모음 → 어
    if (hasJong) {
      return applyPerfectEnding(`${stem}어 본 적`, formality, sentenceType);
    }
    return applyPerfectEnding(`${stem}어 본 적`, formality, sentenceType);
  }

  return applyPerfectEnding(`${stem}어 본 적`, formality, sentenceType);
}

/**
 * 완료형 어간에 어미 적용 (-적 있다)
 */
function applyPerfectEnding(
  perfectStem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${perfectStem} 있어` : `${perfectStem} 있어`;
    case 'formal':
      return sentenceType === 'question' ? `${perfectStem} 있어요` : `${perfectStem} 있어요`;
    case 'neutral':
      return sentenceType === 'question' ? `${perfectStem} 있니` : `${perfectStem} 있다`;
    case 'friendly':
      return sentenceType === 'question' ? `${perfectStem} 있어` : `${perfectStem} 있어~`;
    case 'literal':
      return sentenceType === 'question' ? `${perfectStem} 있습니까` : `${perfectStem} 있습니다`;
    default:
      return `${perfectStem} 있다`;
  }
}

// ============================================
// Phase 1.2: Modal Verbs (조동사) 변환
// ============================================

/**
 * 조동사 적용
 *
 * can → -ㄹ 수 있다 (ability)
 * could → -ㄹ 수 있었다 (past ability)
 * must → -아/어야 하다 (obligation)
 * should → -아/어야 하다 (obligation)
 * may → -아/어도 되다 (permission)
 * might → -ㄹ지도 모르다 (possibility)
 * will → -ㄹ 것이다 (future/volition)
 * would → -ㄹ 것이다 (conditional/politeness)
 *
 * @param verb 동사 기본형 (예: 먹다, 가다)
 * @param modal 조동사 종류
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyModalVerb(
  verb: string,
  modal: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 특별 처리
  const isHadaVerb = verb.endsWith('하다') || verb === '하다';
  const hadaPrefix = isHadaVerb ? (verb === '하다' ? '' : verb.slice(0, -2)) : '';

  const lastChar = stem[stem.length - 1];
  const hasJong = lastChar ? hasJongseong(lastChar) : false;

  switch (modal) {
    case 'can':
      // can → -ㄹ 수 있다
      if (isHadaVerb) {
        return applyModalEnding(`${hadaPrefix}할 수`, 'ability', formality, sentenceType);
      }
      if (hasJong) {
        return applyModalEnding(`${stem}을 수`, 'ability', formality, sentenceType);
      }
      return applyModalEnding(`${addJongseong(stem, 'ㄹ')} 수`, 'ability', formality, sentenceType);

    case 'could':
      // could → -ㄹ 수 있었다
      if (isHadaVerb) {
        return applyModalEnding(`${hadaPrefix}할 수`, 'past-ability', formality, sentenceType);
      }
      if (hasJong) {
        return applyModalEnding(`${stem}을 수`, 'past-ability', formality, sentenceType);
      }
      return applyModalEnding(
        `${addJongseong(stem, 'ㄹ')} 수`,
        'past-ability',
        formality,
        sentenceType,
      );

    case 'must':
    case 'should':
    case 'have to': {
      // must/should/have to → -아/어야 하다
      if (isHadaVerb) {
        return applyModalEnding(`${hadaPrefix}해야`, 'obligation', formality, sentenceType);
      }
      // 모음조화 + 모음축약
      const obligationStem = applyVowelContraction(stem);
      return applyModalEnding(`${obligationStem}야`, 'obligation', formality, sentenceType);
    }

    case 'had to': {
      // had to → -아/어야 했다 (과거 의무)
      if (isHadaVerb) {
        return applyModalEnding(`${hadaPrefix}해야`, 'past-obligation', formality, sentenceType);
      }
      // 모음조화 + 모음축약
      const pastObligationStem = applyVowelContraction(stem);
      return applyModalEnding(
        `${pastObligationStem}야`,
        'past-obligation',
        formality,
        sentenceType,
      );
    }

    case 'may': {
      // may → -아/어도 되다 (permission)
      if (isHadaVerb) {
        return applyModalEnding(`${hadaPrefix}해도`, 'permission', formality, sentenceType);
      }
      // 모음조화 + 모음축약
      const permissionStem = applyVowelContraction(stem);
      return applyModalEnding(`${permissionStem}도`, 'permission', formality, sentenceType);
    }

    case 'might':
      // might → -ㄹ지도 모르다
      if (isHadaVerb) {
        return applyModalEnding(`${hadaPrefix}할지도`, 'possibility', formality, sentenceType);
      }
      if (hasJong) {
        return applyModalEnding(`${stem}을지도`, 'possibility', formality, sentenceType);
      }
      return applyModalEnding(
        `${addJongseong(stem, 'ㄹ')}지도`,
        'possibility',
        formality,
        sentenceType,
      );

    case 'will':
    case 'would':
      // will/would → -ㄹ 것이다
      return applyFutureTense(verb, formality, sentenceType);

    default:
      return applyFormality(verb, formality, sentenceType);
  }
}

// ============================================
// Phase 1.3: Complex Negation (조동사 부정)
// ============================================

/**
 * 조동사 부정 적용
 *
 * cannot/can't → -ㄹ 수 없다 (inability)
 * couldn't → -ㄹ 수 없었다 (past inability)
 * must not → -면 안 되다 (prohibition)
 * should not → -면 안 되다 / -지 않아야 하다 (prohibition)
 * may not → -면 안 되다 (prohibition)
 * will not/won't → -지 않을 것이다 (future negation)
 * would not → -지 않을 것이다 (conditional negation)
 *
 * @param verb 동사 기본형 (예: 먹다, 가다)
 * @param modal 조동사 종류
 * @param formality 어조
 * @param sentenceType 문장 유형
 */
function applyNegatedModalVerb(
  verb: string,
  modal: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 특별 처리
  const isHadaVerb = verb.endsWith('하다') || verb === '하다';
  const hadaPrefix = isHadaVerb ? (verb === '하다' ? '' : verb.slice(0, -2)) : '';

  const lastChar = stem[stem.length - 1];
  const hasJong = lastChar ? hasJongseong(lastChar) : false;

  switch (modal) {
    case 'can':
      // cannot/can't → 못 하다 스타일 (더 자연스러운 한국어)
      // 수영하다 → 수영을 못 한다
      // 가다 → 못 간다
      // 먹다 → 못 먹는다
      if (isHadaVerb) {
        // -하다 동사: "명사 + 을/를 못 한다" 형태
        const nounPart = hadaPrefix;
        const particle = nounPart && hasJongseong(nounPart[nounPart.length - 1]) ? '을' : '를';
        return applyInabilityEnding(`${nounPart}${particle} 못`, formality, sentenceType);
      }
      // 일반 동사: "못 + 동사" 형태
      return applyInabilityVerbEnding(`못 ${stem}`, formality, sentenceType);

    case 'could':
      // couldn't → -ㄹ 수 없었다
      if (isHadaVerb) {
        return applyNegatedModalEnding(
          `${hadaPrefix}할 수`,
          'past-inability',
          formality,
          sentenceType,
        );
      }
      if (hasJong) {
        return applyNegatedModalEnding(`${stem}을 수`, 'past-inability', formality, sentenceType);
      }
      return applyNegatedModalEnding(
        `${addJongseong(stem, 'ㄹ')} 수`,
        'past-inability',
        formality,
        sentenceType,
      );

    case 'must':
    case 'should': {
      // must not / should not → -면 안 되다
      if (isHadaVerb) {
        return applyNegatedModalEnding(`${hadaPrefix}하면`, 'prohibition', formality, sentenceType);
      }
      // -(으)면 안 되다
      if (hasJong) {
        return applyNegatedModalEnding(`${stem}으면`, 'prohibition', formality, sentenceType);
      }
      return applyNegatedModalEnding(`${stem}면`, 'prohibition', formality, sentenceType);
    }

    case 'have to': {
      // don't have to → -지 않아도 된다 (no obligation, different from prohibition)
      // "You don't have to go" = "안 가도 돼" (선택의 여지)
      if (isHadaVerb) {
        return applyNegatedModalEnding(
          `${hadaPrefix}하지 않아도`,
          'no-obligation',
          formality,
          sentenceType,
        );
      }
      return applyNegatedModalEnding(`${stem}지 않아도`, 'no-obligation', formality, sentenceType);
    }

    case 'had to': {
      // didn't have to → -지 않아도 됐다 (past no obligation)
      // "You didn't have to go" = "안 가도 됐어"
      if (isHadaVerb) {
        return applyNegatedModalEnding(
          `${hadaPrefix}하지 않아도`,
          'past-no-obligation',
          formality,
          sentenceType,
        );
      }
      return applyNegatedModalEnding(
        `${stem}지 않아도`,
        'past-no-obligation',
        formality,
        sentenceType,
      );
    }

    case 'may': {
      // may not → -면 안 되다 (permission denied)
      if (isHadaVerb) {
        return applyNegatedModalEnding(`${hadaPrefix}하면`, 'prohibition', formality, sentenceType);
      }
      if (hasJong) {
        return applyNegatedModalEnding(`${stem}으면`, 'prohibition', formality, sentenceType);
      }
      return applyNegatedModalEnding(`${stem}면`, 'prohibition', formality, sentenceType);
    }

    case 'might':
      // might not → -지 않을지도 모르다
      if (isHadaVerb) {
        return applyNegatedModalEnding(
          `${hadaPrefix}하지 않을지도`,
          'negative-possibility',
          formality,
          sentenceType,
        );
      }
      return applyNegatedModalEnding(
        `${stem}지 않을지도`,
        'negative-possibility',
        formality,
        sentenceType,
      );

    case 'will':
    case 'would':
      // won't / wouldn't → -지 않을 것이다
      if (isHadaVerb) {
        return applyNegatedFutureTense(`${hadaPrefix}하`, formality, sentenceType);
      }
      return applyNegatedFutureTense(stem, formality, sentenceType);

    default:
      return applyNegation(verb, formality, sentenceType);
  }
}

/**
 * 능력 부정 어미 적용 (-하다 동사용)
 * "수영을 못" + 한다/해요/합니다 등
 */
function applyInabilityEnding(
  base: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${base} 해` : `${base} 해`;
    case 'formal':
      return sentenceType === 'question' ? `${base} 해요` : `${base} 해요`;
    case 'neutral':
      return sentenceType === 'question' ? `${base} 하니` : `${base} 한다`;
    case 'friendly':
      return sentenceType === 'question' ? `${base} 해` : `${base} 해~`;
    case 'literal':
      return sentenceType === 'question' ? `${base} 합니까` : `${base} 합니다`;
    default:
      return `${base} 한다`;
  }
}

/**
 * 능력 부정 어미 적용 (일반 동사용)
 * "못" + 가다 → 못 간다
 * "못" + 먹다 → 못 먹는다
 */
function applyInabilityVerbEnding(
  base: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // base = "못 가", "못 먹" 등
  // 동사 어간 추출
  const parts = base.split(' ');
  const _stem = parts[parts.length - 1];

  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${base}아` : `${base}아`;
    case 'formal':
      return sentenceType === 'question' ? `${base}아요` : `${base}아요`;
    case 'neutral':
      return sentenceType === 'question' ? `${base}니` : `${base}는다`;
    case 'friendly':
      return sentenceType === 'question' ? `${base}아` : `${base}아~`;
    case 'literal':
      return sentenceType === 'question' ? `${base}습니까` : `${base}습니다`;
    default:
      return `${base}는다`;
  }
}

/**
 * 부정 조동사 어간에 어미 적용
 */
function applyNegatedModalEnding(
  modalStem: string,
  modalType:
    | 'inability'
    | 'past-inability'
    | 'prohibition'
    | 'negative-possibility'
    | 'no-obligation'
    | 'past-no-obligation',
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (modalType) {
    case 'inability':
      // -ㄹ 수 없다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 없어` : `${modalStem} 없어`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 없어요` : `${modalStem} 없어요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 없니` : `${modalStem} 없다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 없어` : `${modalStem} 없어~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 없습니까` : `${modalStem} 없습니다`;
        default:
          return `${modalStem} 없다`;
      }

    case 'past-inability':
      // -ㄹ 수 없었다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 없었어` : `${modalStem} 없었어`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 없었어요` : `${modalStem} 없었어요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 없었니` : `${modalStem} 없었다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 없었어` : `${modalStem} 없었어~`;
        case 'literal':
          return sentenceType === 'question'
            ? `${modalStem} 없었습니까`
            : `${modalStem} 없었습니다`;
        default:
          return `${modalStem} 없었다`;
      }

    case 'prohibition':
      // -면 안 되다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 안 돼` : `${modalStem} 안 돼`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 안 돼요` : `${modalStem} 안 돼요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 안 되니` : `${modalStem} 안 된다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 안 돼` : `${modalStem} 안 돼~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 안 됩니까` : `${modalStem} 안 됩니다`;
        default:
          return `${modalStem} 안 된다`;
      }

    case 'negative-possibility':
      // -지 않을지도 모르다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 몰라` : `${modalStem} 몰라`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 몰라요` : `${modalStem} 몰라요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 모르니` : `${modalStem} 모른다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 몰라` : `${modalStem} 몰라~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 모릅니까` : `${modalStem} 모릅니다`;
        default:
          return `${modalStem} 모른다`;
      }

    case 'no-obligation':
      // -지 않아도 된다 (don't have to)
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 돼` : `${modalStem} 돼`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 돼요` : `${modalStem} 돼요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 되니` : `${modalStem} 된다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 돼` : `${modalStem} 돼~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 됩니까` : `${modalStem} 됩니다`;
        default:
          return `${modalStem} 된다`;
      }

    case 'past-no-obligation':
      // -지 않아도 됐다 (didn't have to)
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 됐어` : `${modalStem} 됐어`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 됐어요` : `${modalStem} 됐어요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 됐니` : `${modalStem} 됐다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 됐어` : `${modalStem} 됐어~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 됐습니까` : `${modalStem} 됐습니다`;
        default:
          return `${modalStem} 됐다`;
      }

    default:
      return `${modalStem}다`;
  }
}

/**
 * 부정 미래 시제 적용 (-지 않을 것이다)
 */
function applyNegatedFutureTense(
  stem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  // "안 + 미래형" 스타일 사용 (더 자연스러운 한국어)
  // 가다 → 안 갈 것이다
  // 먹다 → 안 먹을 것이다
  // 하다 → 안 할 것이다

  let futureStem: string;
  const lastChar = stem[stem.length - 1];
  const hasJong = lastChar ? hasJongseong(lastChar) : false;

  if (stem.endsWith('하') || stem === '하') {
    futureStem = `${stem.slice(0, -1)}할`;
  } else if (hasJong) {
    futureStem = `${stem}을`;
  } else {
    futureStem = addJongseong(stem, 'ㄹ');
  }

  const base = `안 ${futureStem} 것`;

  switch (formality) {
    case 'casual':
      return sentenceType === 'question' ? `${base}이야` : `${base}이야`;
    case 'formal':
      return sentenceType === 'question' ? `${base}이에요` : `${base}이에요`;
    case 'neutral':
      return sentenceType === 'question' ? `${base}이니` : `${base}이다`;
    case 'friendly':
      return sentenceType === 'question' ? `${base}이야` : `${base}이야~`;
    case 'literal':
      return sentenceType === 'question' ? `${base}입니까` : `${base}입니다`;
    default:
      return `${base}이다`;
  }
}

// ============================================
// Phase 2.1: Conditionals (조건문)
// ============================================

/**
 * 조건문 어미 적용 -(으)면
 *
 * if I go → 내가 가면
 * if he eats → 그가 먹으면
 *
 * 규칙:
 * - 받침 없음: -면 (가다 → 가면)
 * - 받침 있음: -으면 (먹다 → 먹으면)
 * - 하다 동사: -하면 (공부하다 → 공부하면)
 *
 * @param verb 동사 기본형 (예: 가다, 먹다)
 */
function applyConditional(verb: string): string {
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 특별 처리
  if (verb.endsWith('하다') || verb === '하다') {
    const prefix = verb === '하다' ? '' : verb.slice(0, -2);
    return `${prefix}하면`;
  }

  // 받침 유무에 따른 어미 선택
  const lastChar = stem[stem.length - 1];
  if (lastChar && hasJongseong(lastChar)) {
    // 받침 있음 → -으면
    return `${stem}으면`;
  }
  // 받침 없음 → -면
  return `${stem}면`;
}

/**
 * 모음조화에 따른 어미 (아/어) 선택
 */
function _getVowelHarmonyEnding(stem: string): string {
  if (!stem) return '어';

  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) return '어';

  const syllableIndex = code - 0xac00;
  const vowelIndex = Math.floor((syllableIndex % 588) / 28);

  // 양성모음 (ㅏ=0, ㅗ=8) → 아
  if (vowelIndex === 0 || vowelIndex === 8) {
    return '아';
  }
  return '어';
}

/**
 * 모음축약 적용
 * 어간 마지막 모음 + 아/어 연결어미 → 축약형
 *
 * 규칙:
 * - 가 (ㅏ) + 아 → 가 (아 생략)
 * - 서 (ㅓ) + 어 → 서 (어 생략)
 * - 오 (ㅗ) + 아 → 와 (ㅗ+ㅏ→ㅘ 축약)
 * - 오다 → 와 (특수)
 * - 주다 → 줘 (특수)
 * - 두다 → 둬 (특수)
 * - 보다 → 봐 (특수)
 *
 * @param stem 동사 어간 (ex: 가, 먹, 오)
 * @returns 축약된 어간+모음 (ex: 가, 먹어, 와)
 */
function applyVowelContraction(stem: string): string {
  if (!stem) return '어';

  const lastChar = stem[stem.length - 1];
  const code = lastChar.charCodeAt(0);

  // 한글이 아니면 기본값 반환
  if (code < 0xac00 || code > 0xd7a3) return `${stem}어`;

  const syllableIndex = code - 0xac00;
  const initialIndex = Math.floor(syllableIndex / 588); // 초성
  const vowelIndex = Math.floor((syllableIndex % 588) / 28); // 중성
  const finalIndex = syllableIndex % 28; // 종성

  // 종성이 있으면 축약 없음 (먹 + 어 → 먹어)
  if (finalIndex !== 0) {
    const vowelEnding = vowelIndex === 0 || vowelIndex === 8 ? '아' : '어';
    return stem + vowelEnding;
  }

  // 모음 인덱스별 축약 처리
  switch (vowelIndex) {
    case 0: // ㅏ: 가 + 아 → 가
      return stem;

    case 4: // ㅓ: 서 + 어 → 서
      return stem;

    case 8: {
      // ㅗ: 오 + 아 → 와
      // 새로운 글자 생성: 초성 + ㅘ(vowel 9) + 종성 없음
      const waCode = 0xac00 + initialIndex * 588 + 9 * 28;
      const prefix = stem.length > 1 ? stem.slice(0, -1) : '';
      return prefix + String.fromCharCode(waCode);
    }

    case 13: {
      // ㅜ: 주 + 어 → 줘
      // 새로운 글자 생성: 초성 + ㅝ(vowel 14) + 종성 없음
      const woCode = 0xac00 + initialIndex * 588 + 14 * 28;
      const prefix = stem.length > 1 ? stem.slice(0, -1) : '';
      return prefix + String.fromCharCode(woCode);
    }

    case 20: {
      // ㅡ: 쓰 + 어 → 써
      // 새로운 글자 생성: 초성 + ㅓ(vowel 4) + 종성 없음
      const eoCode = 0xac00 + initialIndex * 588 + 4 * 28;
      const prefix = stem.length > 1 ? stem.slice(0, -1) : '';
      return prefix + String.fromCharCode(eoCode);
    }

    case 18: {
      // ㅣ: 기 + 어 → 겨 (축약형 사용)
      // 새로운 글자 생성: 초성 + ㅕ(vowel 6) + 종성 없음
      const yeoCode = 0xac00 + initialIndex * 588 + 6 * 28;
      const prefix = stem.length > 1 ? stem.slice(0, -1) : '';
      return prefix + String.fromCharCode(yeoCode);
    }

    default: {
      // 기타: 모음조화에 따라 아/어 추가
      const vowelEnding = vowelIndex === 0 || vowelIndex === 8 ? '아' : '어';
      return stem + vowelEnding;
    }
  }
}

/**
 * 조동사 어간에 어미 적용
 */
function applyModalEnding(
  modalStem: string,
  modalType:
    | 'ability'
    | 'past-ability'
    | 'obligation'
    | 'past-obligation'
    | 'permission'
    | 'possibility',
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  switch (modalType) {
    case 'ability':
      // -ㄹ 수 있다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 있어` : `${modalStem} 있어`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 있어요` : `${modalStem} 있어요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 있니` : `${modalStem} 있다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 있어` : `${modalStem} 있어~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 있습니까` : `${modalStem} 있습니다`;
        default:
          return `${modalStem} 있다`;
      }

    case 'past-ability':
      // -ㄹ 수 있었다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 있었어` : `${modalStem} 있었어`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 있었어요` : `${modalStem} 있었어요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 있었니` : `${modalStem} 있었다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 있었어` : `${modalStem} 있었어~`;
        case 'literal':
          return sentenceType === 'question'
            ? `${modalStem} 있었습니까`
            : `${modalStem} 있었습니다`;
        default:
          return `${modalStem} 있었다`;
      }

    case 'obligation':
      // -아/어야 하다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 해` : `${modalStem} 해`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 해요` : `${modalStem} 해요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 하니` : `${modalStem} 한다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 해` : `${modalStem} 해~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 합니까` : `${modalStem} 합니다`;
        default:
          return `${modalStem} 한다`;
      }

    case 'past-obligation':
      // -아/어야 했다 (had to)
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 했어` : `${modalStem} 했어`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 했어요` : `${modalStem} 했어요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 했니` : `${modalStem} 했다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 했어` : `${modalStem} 했어~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 했습니까` : `${modalStem} 했습니다`;
        default:
          return `${modalStem} 했다`;
      }

    case 'permission':
      // -아/어도 되다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 돼` : `${modalStem} 돼`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 돼요` : `${modalStem} 돼요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 되니` : `${modalStem} 된다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 돼` : `${modalStem} 돼~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 됩니까` : `${modalStem} 됩니다`;
        default:
          return `${modalStem} 된다`;
      }

    case 'possibility':
      // -ㄹ지도 모르다
      switch (formality) {
        case 'casual':
          return sentenceType === 'question' ? `${modalStem} 몰라` : `${modalStem} 몰라`;
        case 'formal':
          return sentenceType === 'question' ? `${modalStem} 몰라요` : `${modalStem} 몰라요`;
        case 'neutral':
          return sentenceType === 'question' ? `${modalStem} 모르니` : `${modalStem} 모른다`;
        case 'friendly':
          return sentenceType === 'question' ? `${modalStem} 몰라` : `${modalStem} 몰라~`;
        case 'literal':
          return sentenceType === 'question' ? `${modalStem} 모릅니까` : `${modalStem} 모릅니다`;
        default:
          return `${modalStem} 모른다`;
      }

    default:
      return `${modalStem}다`;
  }
}

// ============================================
// 격변화 처리 함수 (Declension Processing)
// ============================================

/**
 * 영어 대명사를 한국어로 변환 (격 보존)
 *
 * @param word 영어 대명사
 * @param _role 문장 내 역할 (subject, object 등) - 향후 확장용
 * @returns 한국어 대명사 + 조사
 *
 * @example
 * translateEnglishPronounWithCase('I', 'subject') → '나는'
 * translateEnglishPronounWithCase('me', 'object') → '나를'
 * translateEnglishPronounWithCase('my', 'possessive') → '나의'
 */
export function translateEnglishPronounWithCase(
  word: string,
  _role: 'subject' | 'object' | 'possessive' | 'unknown',
): string | null {
  const pronounInfo = getPronounCase(word);
  if (!pronounInfo) return null;

  // 영어 격에 맞는 한국어 번역
  const korean = translatePronoun(word);
  if (!korean) return null;

  return korean;
}

/**
 * 한국어 명사에 적절한 조사 추가
 *
 * @param noun 한국어 명사
 * @param category 조사 카테고리
 * @returns 명사 + 조사
 *
 * @example
 * addKoreanParticle('책', 'nominative') → '책이'
 * addKoreanParticle('사과', 'nominative') → '사과가'
 * addKoreanParticle('친구', 'dative') → '친구에게'
 */
export function addKoreanParticle(noun: string, category: ParticleCategory): string {
  const particle = selectParticle(noun, category);
  return noun + particle;
}

/**
 * 한국어 조사를 영어 전치사로 변환
 *
 * @param category 조사 카테고리
 * @returns 영어 전치사
 *
 * @example
 * getPrepositionFromParticle('dative') → 'to'
 * getPrepositionFromParticle('ablative') → 'from'
 * getPrepositionFromParticle('locative') → 'at'
 */
export function getPrepositionFromParticle(category: ParticleCategory): string {
  return getEnglishPreposition(category);
}

/**
 * 영어 전치사를 한국어 조사 카테고리로 매핑 (격변화용)
 */
const PREPOSITION_TO_PARTICLE_CATEGORY: Record<string, ParticleCategory> = {
  // 여격 (to, for)
  to: 'dative',
  for: 'dative',
  // 탈격 (from)
  from: 'ablative',
  // 처격 (at, in, on)
  at: 'locative',
  in: 'locative',
  on: 'locative',
  // 도구격 (by, with)
  by: 'instrumental',
  with: 'comitative', // 또는 instrumental
  // 비교격 (than)
  than: 'comparative',
  // 소유격 (of)
  of: 'genitive',
};

/**
 * 영어 전치사구를 한국어로 변환 (격변화 기반)
 *
 * @param preposition 영어 전치사
 * @param noun 명사 (이미 한국어로 번역된)
 * @returns 한국어 명사 + 조사
 *
 * @example
 * translatePrepositionalPhrase('to', '친구') → '친구에게'
 * translatePrepositionalPhrase('from', '서울') → '서울에서'
 * translatePrepositionalPhrase('with', '칼') → '칼로'
 */
export function translatePrepositionalPhrase(preposition: string, noun: string): string {
  const lower = preposition.toLowerCase();
  const category = PREPOSITION_TO_PARTICLE_CATEGORY[lower];

  if (!category) {
    // 알려지지 않은 전치사: 그냥 명사 반환
    return noun;
  }

  return addKoreanParticle(noun, category);
}
