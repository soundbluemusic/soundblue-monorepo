/**
 * 번역기 v2 생성기
 * 분석된 토큰을 목표 언어로 재조립
 */

import {
  COUNTERS,
  EN_KO,
  IDIOMS_EN_KO,
  IDIOMS_KO_EN,
  KO_EN,
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

  // 평서문 부정
  'statement-present-negated': "{S} don't {V} {O} {L} {A}",
  'statement-past-negated': "{S} didn't {V} {O} {L} {A}",
  'statement-future-negated': "{S} won't {V} {O} {L} {A}",

  // Phase 1: 3인칭 단수 평서문 부정
  'statement-present-3ps-negated': "{S} doesn't {V} {O} {L} {A}",

  // 의문문
  'question-present': 'Do {S:lower} {V} {O} {L} {A}',
  'question-past': 'Did {S:lower} {V} {O} {L} {A}',
  'question-future': 'Will {S:lower} {V} {O} {L} {A}',

  // Phase 1: 3인칭 단수 의문문
  'question-present-3ps': 'Does {S:lower} {V} {O} {L} {A}',
  'question-present-3ps-negated': "Doesn't {S:lower} {V} {O} {L} {A}",

  // 의문문 부정
  'question-present-negated': "Don't {S:lower} {V} {O} {L} {A}",
  'question-past-negated': "Didn't {S:lower} {V} {O} {L} {A}",
  'question-future-negated': "Won't {S:lower} {V} {O} {L} {A}",

  // 감탄문
  'exclamation-present': '{S} {V} {O} {L} {A}',
  'exclamation-past': '{S} {V:past} {O} {L} {A}',
  'exclamation-future': '{S} will {V} {O} {L} {A}',

  // 감탄문 부정
  'exclamation-present-negated': "{S} don't {V} {O} {L} {A}",
  'exclamation-past-negated': "{S} didn't {V} {O} {L} {A}",
  'exclamation-future-negated': "{S} won't {V} {O} {L} {A}",

  // 명령문
  'imperative-present': '{V} {O} {L} {A}',
  'imperative-past': '{V} {O} {L} {A}',
  'imperative-future': '{V} {O} {L} {A}',

  // 명령문 부정
  'imperative-present-negated': "Don't {V} {O} {L} {A}",
  'imperative-past-negated': "Don't {V} {O} {L} {A}",
  'imperative-future-negated': "Don't {V} {O} {L} {A}",
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
 * 한→영 생성
 */
export function generateEnglish(parsed: ParsedSentence): string {
  // 1. 관용구 체크 (통문장)
  const idiom = IDIOMS_KO_EN[parsed.original.replace(/[.!?？！。]+$/, '').trim()];
  if (idiom) return idiom;

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

  // 5-1. 주어 추론 (생략된 경우)
  const subjectText =
    subjects.length > 0 ? translateTokens(subjects) : inferSubject(parsed.type, parsed.tense);

  // 5-2. 다의어 해소 (동사 번역 결정)
  let verbText: string | undefined;
  if (verbs.length > 0) {
    const verb = verbs[0];
    // 먼저 다의어 규칙 확인
    const polysemyResult = resolvePolysemy(verb.stem, objects);
    if (polysemyResult) {
      verbText = polysemyResult;
    } else {
      verbText = verb.translated || KO_EN[verb.stem] || verb.stem;
    }
  }

  // 6. 템플릿 기반 문장 생성
  // Phase 2: 목적어에 관사 추가
  const objectText = objects.length > 0 ? translateTokens(objects) : undefined;
  const objectWithArticle = objectText ? addArticle(objectText) : undefined;

  const templateValues = {
    S: subjectText || undefined,
    V: verbText,
    O: objectWithArticle,
    L:
      locations.length > 0
        ? locations
            .map((loc) => {
              const noun = loc.translated || KO_EN[loc.stem] || loc.stem;
              const prep = loc.meta?.particle === '에서' ? 'at' : 'to';
              return `${prep} ${noun}`;
            })
            .join(' ')
        : undefined,
    A: adverbs.length > 0 ? translateTokens(adverbs) : undefined,
  };

  // 동사가 없으면 기타 토큰 사용
  if (!templateValues.V && others.length > 0) {
    return translateTokens(others);
  }

  // 부정 여부 확인
  const isNegated = parsed.negated || verbs.some((v) => v.meta?.negated);

  // Phase 1: 3인칭 단수 판단
  const is3ps = subjectText ? isThirdPersonSingular(subjectText) : false;

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
 */
function translateTokens(tokens: Token[]): string {
  return tokens.map((t) => t.translated || KO_EN[t.stem] || t.stem).join(' ');
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
 */
function startsWithVowelSound(word: string): boolean {
  const lower = word.toLowerCase();

  // 예외: h 묵음 → 모음 취급
  const silentH = ['hour', 'honest', 'honor', 'heir'];
  if (silentH.some((h) => lower.startsWith(h))) return true;

  // 예외: u로 시작하지만 자음 발음 (ju-)
  const consonantU = ['uni', 'use', 'usual', 'europe', 'euro'];
  if (consonantU.some((u) => lower.startsWith(u))) return false;

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

/** 영어 동사 → 한국어 (원형만) */
const EN_VERBS: Record<string, string> = {
  go: '가다',
  went: '갔다',
  gone: '갔다',
  come: '오다',
  came: '왔다',
  eat: '먹다',
  ate: '먹었다',
  drink: '마시다',
  drank: '마셨다',
  read: '읽다',
  reading: '읽다',
  write: '쓰다',
  wrote: '썼다',
  see: '보다',
  saw: '봤다',
  hear: '듣다',
  heard: '들었다',
  listen: '듣다',
  like: '좋아하다',
  love: '사랑하다',
  want: '원하다',
  need: '필요하다',
  have: '가지다',
  had: '가졌다',
  make: '만들다',
  made: '만들었다',
  take: '가져가다',
  took: '가져갔다',
  give: '주다',
  gave: '줬다',
  buy: '사다',
  bought: '샀다',
  sell: '팔다',
  sold: '팔았다',
  sleep: '자다',
  slept: '잤다',
  work: '일하다',
  play: '놀다',
  run: '뛰다',
  ran: '뛰었다',
  walk: '걷다',
  walked: '걸었다',
  learn: '배우다',
  teach: '가르치다',
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
 * 전치사에 따른 조사 선택
 *
 * Phase 8: with의 경우 받침에 따라 와/과 선택
 */
function getParticleForPreposition(prep: string, noun: string): string {
  const particle = PREPOSITION_TO_PARTICLE[prep.toLowerCase()] || '에';

  // 'with'는 받침에 따라 와/과 선택
  if (prep.toLowerCase() === 'with') {
    if (!noun) return '와';
    const lastChar = noun[noun.length - 1];
    return hasJongseong(lastChar) ? '과' : '와';
  }

  return particle;
}

/** 조동사 */
const EN_AUXILIARIES = new Set([
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
  'have',
  'has',
  'had',
]);

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

/** be동사 (진행형 판별용) */
const EN_BE_VERBS = new Set(['am', 'is', 'are', 'was', 'were']);

/**
 * 영어 문장 품사 태깅
 *
 * Phase 6: 진행형 (be + -ing) 감지
 */
function tagEnglishWords(parsed: ParsedSentence): TaggedWord[] {
  const result: TaggedWord[] = [];
  let foundVerb = false;
  let foundSubject = false;
  let foundBeVerb = false; // Phase 6: be동사 감지

  for (let i = 0; i < parsed.tokens.length; i++) {
    const token = parsed.tokens[i];
    const lower = token.stem.toLowerCase();
    const text = token.text;

    let pos: EnglishPOS = 'unknown';
    let ko = EN_KO[lower] || '';
    let isProgressive = false;

    // 1. 관사 체크
    if (EN_ARTICLES.has(lower)) {
      pos = 'article';
      ko = ''; // 관사는 번역 안 함
    }
    // 2. 전치사 체크
    else if (EN_PREPOSITIONS.has(lower)) {
      pos = 'prep';
      ko = ''; // 전치사는 조사로 변환될 예정
    }
    // 3. be동사 체크 (진행형 판별용)
    else if (EN_BE_VERBS.has(lower) && !foundVerb) {
      pos = 'aux';
      ko = '';
      foundBeVerb = true; // Phase 6: be동사 발견
    }
    // 4. 조동사 체크 (의문문의 Do, Does 등)
    else if (EN_AUXILIARIES.has(lower) && !foundVerb) {
      pos = 'aux';
      ko = ''; // 조동사는 시제/의문문 처리에 사용
    }
    // 5. 대명사 → 주어
    else if (EN_PRONOUNS[lower]) {
      pos = foundSubject ? 'object' : 'subject';
      ko = EN_PRONOUNS[lower];
      if (!foundSubject) foundSubject = true;
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
      foundVerb = true;
    }
    // 8. 명사 (사전에 있으면)
    else if (ko) {
      pos = foundSubject ? 'object' : 'subject';
      if (!foundSubject) foundSubject = true;
    }
    // 9. 알 수 없음
    else {
      pos = 'unknown';
      ko = text;
    }

    result.push({ text, lower, ko, pos, isProgressive });
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

/**
 * 영→한 생성
 *
 * Phase 5: SVO → SOV 어순 변환
 * Phase 6: 진행형 (is -ing) → -고 있다
 * Phase 9: 조사 자동 선택 (을/를, 은/는)
 */
export function generateKorean(parsed: ParsedSentence, formality: Formality = 'neutral'): string {
  // 1. 관용구 체크 (formality별 결과 반환)
  const normalized = parsed.original
    .toLowerCase()
    .replace(/[.!?]+$/, '')
    .trim();
  const idiomEntry = IDIOMS_EN_KO[normalized];
  if (idiomEntry) {
    return idiomEntry[formality];
  }

  // 2. 품사 태깅
  const tagged = tagEnglishWords(parsed);

  // 3. 역할별 분류
  let subject = '';
  let verb = '';
  let isProgressive = false; // Phase 6
  const objects: string[] = [];
  const locations: string[] = [];

  for (let i = 0; i < tagged.length; i++) {
    const word = tagged[i];

    if (word.pos === 'subject' && !subject) {
      subject = word.ko;
    } else if (word.pos === 'verb') {
      verb = word.ko;
      isProgressive = word.isProgressive || false; // Phase 6
    } else if (word.pos === 'object' || (word.pos === 'unknown' && word.ko)) {
      // 전치사 뒤의 명사는 위치/부사구로 처리
      const prev = tagged[i - 1];
      if (prev && prev.pos === 'prep') {
        // Phase 8: 전치사에 따른 조사 선택
        const particle = getParticleForPreposition(prev.text, word.ko);
        locations.push(`${word.ko}${particle}`);
      } else if (word.ko) {
        objects.push(word.ko);
      }
    }
  }

  // 4. 단일 단어 처리 (조사 없이 반환)
  const meaningfulParts = [subject, verb, ...objects, ...locations].filter(Boolean);
  if (meaningfulParts.length === 1) {
    return meaningfulParts[0];
  }

  // 5. SOV 어순으로 재조합 (Phase 9: 조사 자동 선택)
  const parts: string[] = [];

  // 주어 + 는/은 (받침에 따라 선택)
  if (subject) {
    const particle = selectSubjectParticle(subject, 'topic');
    parts.push(`${subject}${particle}`);
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
  if (verb) {
    if (isProgressive) {
      // 진행형 + 의문문
      if (parsed.type === 'question') {
        const progressive = toProgressiveKorean(verb);
        // -고 있다 → 어조별 변환
        const baseProgressive = progressive.replace(/있다$/, '');
        parts.push(baseProgressive + applyFormality('있다', formality, 'question'));
      } else {
        const progressive = toProgressiveKorean(verb);
        const baseProgressive = progressive.replace(/있다$/, '');
        parts.push(baseProgressive + applyFormality('있다', formality, 'statement'));
      }
    } else if (parsed.type === 'question') {
      // Phase 7: 의문형 어미 변환 + 어조 적용
      parts.push(applyFormality(verb, formality, 'question'));
    } else {
      // Phase 10: 평서문 어조 적용
      parts.push(applyFormality(verb, formality, 'statement'));
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
 */
function applyVerbEnding(
  stem: string,
  formality: Formality,
  sentenceType: 'statement' | 'question',
): string {
  const suffix = FORMALITY_ENDINGS[formality].suffix || '';

  switch (formality) {
    case 'casual':
      // 반말: 어간 + 아/어
      return `${stem}${getInformalEnding(stem)}${suffix}`;
    case 'formal':
      // 존댓말: 어간 + 아요/어요 (의문문: 으세요)
      if (sentenceType === 'question') {
        return `${stem}으세요${suffix}`;
      }
      return `${stem}${getInformalEnding(stem)}요${suffix}`;
    case 'neutral':
      // 상관없음: 어간 + ㄴ다/는다 (의문문: 니)
      if (sentenceType === 'question') {
        return `${stem}니${suffix}`;
      }
      return `${stem}는다${suffix}`;
    case 'friendly':
      // 친근체: 반말 + ~
      return `${stem}${getInformalEnding(stem)}${suffix}`;
    case 'literal':
      // 번역체: 어간 + ㅂ니다/습니다 (의문문: ㅂ니까/습니까)
      if (sentenceType === 'question') {
        return `${stem}습니까${suffix}`;
      }
      return `${stem}습니다${suffix}`;
    default:
      return `${stem}다`;
  }
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
