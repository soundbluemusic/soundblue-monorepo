/**
 * 번역기 v2 생성기
 * 분석된 토큰을 목표 언어로 재조립
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
  MODAL_VERBS,
  NOUN_CONTEXT,
  VERB_PAST,
  VERB_PREPOSITIONS,
} from './data';
import type { Formality, ParsedSentence, SentenceType, Tense, Token } from './types';

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
 * 주어 생략 시 기본 주어 추론
 *
 * 한국어는 주어 생략이 빈번함.
 * 문장 유형에 따라 생략된 주어를 추론.
 */
function inferSubject(type: SentenceType, _tense: Tense): string {
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
 * "-고 있다" → "I'm Ving"
 * "-고 싶다" → "I want to V"
 */
function generateWithAuxiliaryPattern(parsed: ParsedSentence): string {
  const parts: string[] = [];

  // 주어 찾기
  let subject = 'I'; // 기본값
  let verb = '';

  for (const token of parsed.tokens) {
    if (token.role === 'subject') {
      // 주어 번역 (한→영: translated 값을 그대로 사용)
      const translated = token.translated || KO_EN[token.stem];
      if (translated) {
        subject = translated;
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
      const beVerb = getBeVerbForAuxiliary(subject);
      const gerund = toGerund(verb);
      parts.push(`${subject}'${beVerb === 'am' ? 'm' : beVerb === 'are' ? 're' : 's'} ${gerund}`);
      break;
    }
    case 'desiderative': {
      // -고 싶다 → want to V
      parts.push(
        `${subject} want${subject.toLowerCase() === 'i' || isPlural(subject) ? '' : 's'} to ${verb}`,
      );
      break;
    }
    case 'attemptive': {
      // -아/어 보다 → try Ving
      const gerund = toGerund(verb);
      parts.push(`${subject} tried ${gerund}`);
      break;
    }
    case 'completive': {
      // -아/어 버리다 → end up Ving
      const gerund = toGerund(verb);
      parts.push(`${subject} ended up ${gerund}`);
      break;
    }
    case 'benefactive': {
      // -아/어 주다 → V for (someone)
      // "도와 주다" → "help (someone)"
      // "알려 주다" → "let (someone) know"
      parts.push(`${subject} ${verb}s for`);
      break;
    }
    default:
      // fallback
      parts.push(`${subject} ${verb}`);
  }

  return parts.join(' ').trim();
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

  // 단모음 + 단자음으로 끝나면 자음 중복
  if (/^[a-z]*[aeiou][bcdfghjklmnpqrstvwxz]$/i.test(verb) && verb.length <= 4) {
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

/**
 * 한→영 생성
 */
export function generateEnglish(parsed: ParsedSentence): string {
  // ============================================
  // Phase 0: 보조용언 패턴 우선 처리 (긴급 수정)
  // "-고 있다" 등의 패턴을 먼저 처리
  // ============================================
  if (parsed.auxiliaryPattern) {
    return generateWithAuxiliaryPattern(parsed);
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
      // 어간에서 영어 동사 찾기
      const stemWithDa = `${endingAnalysis.stem}다`;
      const enVerb =
        KO_EN[endingAnalysis.stem] || KO_EN[stemWithDa] || token.translated || endingAnalysis.stem;

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
  const subjectText =
    subjects.length > 0
      ? translateTokens(subjects, allContextTokens)
      : inferSubject(parsed.type, parsed.tense);

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
    // 예: "운동을 했다" → "exercised", "샤워를 했다" → "showered"
    else if (verb.meta?.isLightVerb && objects.length > 0) {
      isLightVerbPattern = true;
      const obj = objects[0];
      // 목적어 명사의 동사형 찾기 (exercise → exercise, shower → shower)
      const nounStem = obj.stem;
      const nounTranslation = obj.translated || KO_EN[nounStem] || nounStem;
      // 영어에서 명사 = 동사인 경우가 많음 (exercise, shower, study 등)
      verbText = nounTranslation;
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
  const objectWithArticle = objectText ? addArticle(objectText) : undefined;

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
      if (t.translated) return t.translated;

      // 문맥 기반 명사 번역 시도
      const contextTranslation = resolveNounContext(t.stem, contextHints);
      if (contextTranslation) return contextTranslation;

      // 기본 사전 조회
      return KO_EN[t.stem] || t.stem;
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
    // 불규칙 동사 확인
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
function addArticle(noun: string): string {
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
  // biome-ignore lint/suspicious/noThenProperty: 'then'은 영어 접속사, Promise.then과 무관
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
    else if (
      foundBeVerb &&
      !foundVerb &&
      !foundHaveAux &&
      !getComparativeInfo(lower) &&
      !lower.endsWith('ing')
    ) {
      const passiveBase = getPassiveVerbBase(lower);
      if (passiveBase) {
        pos = 'verb';
        const koVerb = EN_VERBS[passiveBase] || EN_KO[passiveBase] || passiveBase;
        // 한국어 피동형으로 변환
        ko = toPassiveKorean(koVerb);
        isPassive = true;
        foundVerb = true;
      }
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

  // 4. 관계절 동사 찾기 및 관형형 변환
  let relVerb = '';
  const relObjects: string[] = [];

  for (let i = 0; i < relativeClauseWords.length; i++) {
    const word = relativeClauseWords[i].replace(/[.,!?]/g, '');

    // 동사 찾기
    if (EN_VERBS[word] || EN_KO[word]?.endsWith('다')) {
      const verbBase = extractEnglishVerbBase(word) || word;
      relVerb = EN_KO[verbBase] || EN_VERBS[verbBase] || word;
    } else {
      const ko = EN_KO[word];
      if (ko && !['the', 'a', 'an', 'i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(word)) {
        relObjects.push(ko);
      }
    }
  }

  if (!relVerb) return null;

  // 5. 관형형 어미 적용 (-는, -은/ㄴ)
  // 현재: -는 (달리는)
  // 과거: -은/ㄴ (달린)
  const attributiveVerb = applyAttributiveEnding(relVerb, 'present');

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
 */
function applyAttributiveEnding(verb: string, tense: 'present' | 'past'): string {
  if (!verb) return '';

  // 동사 어간 추출
  const stem = verb.endsWith('다') ? verb.slice(0, -1) : verb;

  if (tense === 'present') {
    // 현재 관형형: -는
    return `${stem}는`;
  }
  // 과거 관형형: -은/ㄴ
  const lastChar = stem[stem.length - 1];
  const hasJong = hasJongseong(lastChar);

  if (hasJong) {
    return `${stem}은`;
  }
  return `${addJongseong(stem, 'ㄴ')}`;
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
  // Phase 2.1: 조건문에서는 가/이 사용, 일반 문장에서는 는/은 사용
  if (subject) {
    const particleType = isConditional ? 'subject' : 'topic';
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
    } else if (isProgressive) {
      // 진행형: -고 있다
      const progressive = toProgressiveKorean(verb);
      const baseProgressive = progressive.replace(/있다$/, '');
      // 진행형의 "있다"는 특별 처리 (있다 → 있어/있어요/있다)
      parts.push(baseProgressive + applyProgressiveEnding(formality, sentenceType));
    } else if (parsed.tense === 'past') {
      // Phase 12: 과거 시제 → -었다/-았다
      parts.push(applyPastTense(verb, formality, sentenceType));
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
 * 부정문 적용 (-지 않다)
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
  // 어간 추출
  let stem = verb;
  if (verb.endsWith('다')) {
    stem = verb.slice(0, -1);
  }

  // 하다 동사 처리
  if (verb.endsWith('하다')) {
    const prefix = verb.slice(0, -2);
    return applyNegationEnding(`${prefix}하지`, formality, sentenceType);
  }

  return applyNegationEnding(`${stem}지`, formality, sentenceType);
}

/**
 * 부정 어간에 어미 적용
 */
function applyNegationEnding(
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
      // 모음조화
      const vowelEnding = getVowelHarmonyEnding(stem);
      return applyModalEnding(`${stem}${vowelEnding}야`, 'obligation', formality, sentenceType);
    }

    case 'had to': {
      // had to → -아/어야 했다 (과거 의무)
      if (isHadaVerb) {
        return applyModalEnding(`${hadaPrefix}해야`, 'past-obligation', formality, sentenceType);
      }
      // 모음조화
      const vowelEnding = getVowelHarmonyEnding(stem);
      return applyModalEnding(
        `${stem}${vowelEnding}야`,
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
      const mayEnding = getVowelHarmonyEnding(stem);
      return applyModalEnding(`${stem}${mayEnding}도`, 'permission', formality, sentenceType);
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
      // cannot/can't → -ㄹ 수 없다
      if (isHadaVerb) {
        return applyNegatedModalEnding(`${hadaPrefix}할 수`, 'inability', formality, sentenceType);
      }
      if (hasJong) {
        return applyNegatedModalEnding(`${stem}을 수`, 'inability', formality, sentenceType);
      }
      return applyNegatedModalEnding(
        `${addJongseong(stem, 'ㄹ')} 수`,
        'inability',
        formality,
        sentenceType,
      );

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
  const base = `${stem}지 않을 것`;

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
function getVowelHarmonyEnding(stem: string): string {
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
