// ========================================
// Korean to English Engine - 한→영 자소 기반 번역
// 문장 수준 번역 지원 (토큰화, 어순 변환, 접속사 처리)
// ========================================

import { getEnglishTense, matchEnding } from '../dictionary/endings';
import { isAdjective, translateStemKoToEn } from '../dictionary/stems';
import { koToEnWords } from '../dictionary/words';
import { composeFromJaso, decomposeAll, removeEndingPattern } from '../jaso/hangul-jaso';

export interface KoToEnResult {
  original: string; // 원본
  stem: string; // 어간
  ending: string; // 어미
  englishStem: string; // 영어 어간
  englishForm: string; // 영어 활용형
  translated: string; // 최종 번역
}

// 한국어 조사 목록 (길이순 정렬 - 긴 것부터 매칭)
const KOREAN_PARTICLES = [
  '에서는',
  '으로는',
  '에서도',
  '으로도',
  '과는',
  '와는',
  '에서',
  '에게',
  '한테',
  '으로',
  '로서',
  '까지',
  '부터',
  '마다',
  '처럼',
  '같이',
  '보다',
  '이랑',
  '랑',
  '하고',
  '과',
  '와',
  '의',
  '도',
  '만',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '에',
  '로',
];

// 한국어 연결 어미 (복합문 처리)
const KOREAN_CONNECTIVES: Record<string, { en: string; type: string }> = {
  고: { en: 'and', type: 'and' },
  며: { en: 'and', type: 'and' },
  으며: { en: 'and', type: 'and' },
  서: { en: 'and then', type: 'sequence' },
  아서: { en: 'and then', type: 'sequence' },
  어서: { en: 'and then', type: 'sequence' },
  지만: { en: 'but', type: 'but' },
  는데: { en: 'but', type: 'but' },
  면: { en: 'if', type: 'condition' },
  으면: { en: 'if', type: 'condition' },
  니까: { en: 'because', type: 'reason' },
  으니까: { en: 'because', type: 'reason' },
};

// 한국어 종결 어미 (시제/형태 추출, 길이순 정렬)
const KOREAN_ENDINGS: Record<string, { tense: string; form: string }> = {
  // 긴 어미부터 매칭
  았으며: { tense: 'past', form: 'connective' },
  었으며: { tense: 'past', form: 'connective' },
  였으며: { tense: 'past', form: 'connective' },
  // 3글자 어미
  았다: { tense: 'past', form: 'declarative' },
  었다: { tense: 'past', form: 'declarative' },
  였다: { tense: 'past', form: 'declarative' },
  했다: { tense: 'past', form: 'declarative' },
  았고: { tense: 'past', form: 'connective' },
  었고: { tense: 'past', form: 'connective' },
  였고: { tense: 'past', form: 'connective' },
  했고: { tense: 'past', form: 'connective' },
  는다: { tense: 'present', form: 'declarative' },
  ㄴ다: { tense: 'present', form: 'declarative' },
  // 2글자 어미
  다: { tense: 'present', form: 'declarative' },
};

// 이동 동사 (to 전치사 사용)
const MOVEMENT_VERBS = new Set([
  'go',
  'went',
  'come',
  'came',
  'arrive',
  'arrived',
  'return',
  'returned',
  'run',
  'ran',
  'walk',
  'walked',
  'travel',
  'traveled',
  'move',
  'moved',
  'leave',
  'left',
  'enter',
  'entered',
  'climb',
  'climbed',
  'fly',
  'flew',
]);

// 한국어 형용사 어간 목록
const KOREAN_ADJECTIVE_STEMS = new Set([
  '좋',
  '나쁘',
  '크',
  '작',
  '높',
  '낮',
  '길',
  '짧',
  '넓',
  '좁',
  '밝',
  '어두',
  '예쁘',
  '아름답',
  '추',
  '더',
  '행복',
  '슬프',
  '맛있',
  '맛없',
  '재미있',
  '재미없',
  '무섭',
  '기쁘',
  '즐겁',
  '새롭',
  '오래',
  '빠르',
  '느리',
  '가깝',
  '멀',
  '비싸',
  '싸',
]);

// 한국어 불규칙 활용형 → 영어 (완전 활용형 매핑)
const KOREAN_IRREGULAR_VERBS: Record<string, { stem: string; tense: string }> = {
  // ㅏ 불규칙 (가다, 자다, 타다 등)
  갔다: { stem: 'go', tense: 'past' },
  갔고: { stem: 'go', tense: 'past' },
  잤다: { stem: 'sleep', tense: 'past' },
  잤고: { stem: 'sleep', tense: 'past' },
  탔다: { stem: 'ride', tense: 'past' },
  탔고: { stem: 'ride', tense: 'past' },
  샀다: { stem: 'buy', tense: 'past' },
  샀고: { stem: 'buy', tense: 'past' },
  났다: { stem: 'come out', tense: 'past' },
  났고: { stem: 'come out', tense: 'past' },
  봤다: { stem: 'see', tense: 'past' },
  봤고: { stem: 'see', tense: 'past' },
  왔다: { stem: 'come', tense: 'past' },
  왔고: { stem: 'come', tense: 'past' },
  // ㅓ 불규칙 (서다, 먹다 등)
  섰다: { stem: 'stand', tense: 'past' },
  섰고: { stem: 'stand', tense: 'past' },
  // 하다 불규칙
  했다: { stem: 'do', tense: 'past' },
  했고: { stem: 'do', tense: 'past' },
};

/**
 * 한국어 → 영어 번역 (자소 기반)
 * 문장 수준 번역 지원
 *
 * @example
 * translateKoToEn('먹었다') → 'ate'
 * translateKoToEn('행복했다') → 'was happy'
 * translateKoToEn('나는 밥을 먹었다') → 'I ate rice'
 */
export function translateKoToEn(text: string): string {
  // 문장인지 단어인지 판별
  const hasSpaces = text.includes(' ');
  const hasCommas = text.includes(',');

  if (hasSpaces || hasCommas) {
    // 문장 수준 번역
    return translateSentenceKoToEn(text);
  }

  // 단어 수준 번역
  const result = translateKoToEnDetailed(text);
  return result?.translated || text;
}

/**
 * 문장 수준 한→영 번역
 */
function translateSentenceKoToEn(text: string): string {
  // 1. 쉼표로 절 분리
  const clauses = text.split(/,\s*/);
  const translatedClauses: string[] = [];

  for (const clause of clauses) {
    if (!clause.trim()) continue;
    const translatedClause = translateClauseKoToEn(clause.trim());
    translatedClauses.push(translatedClause);
  }

  // 절들을 적절한 접속사로 연결
  return translatedClauses.join(', ');
}

/**
 * 절 수준 한→영 번역 (SOV → SVO 변환)
 */
function translateClauseKoToEn(clause: string): string {
  // 토큰화
  const tokens = clause.split(/\s+/);

  // 각 토큰 분석 및 번역
  const analyzed: Array<{
    original: string;
    translated: string;
    role: 'subject' | 'object' | 'verb' | 'adverb' | 'modifier' | 'time' | 'location' | 'unknown';
    particle?: string;
    connective?: string;
  }> = [];

  for (const token of tokens) {
    const result = analyzeAndTranslateToken(token);
    analyzed.push(result);
  }

  // SVO 어순으로 재배열
  return rearrangeToSVO(analyzed);
}

/**
 * 토큰 분석 및 번역
 */
function analyzeAndTranslateToken(token: string): {
  original: string;
  translated: string;
  role: 'subject' | 'object' | 'verb' | 'adverb' | 'modifier' | 'time' | 'location' | 'unknown';
  particle?: string;
  connective?: string;
  isAdjective?: boolean;
  koreanStem?: string;
} {
  let word = token;
  let particle: string | undefined;
  let connective: string | undefined;
  let role:
    | 'subject'
    | 'object'
    | 'verb'
    | 'adverb'
    | 'modifier'
    | 'time'
    | 'location'
    | 'unknown' = 'unknown';

  // 1. 조사 분리
  for (const p of KOREAN_PARTICLES) {
    if (word.endsWith(p) && word.length > p.length) {
      particle = p;
      word = word.slice(0, -p.length);
      break;
    }
  }

  // 2. 조사로 역할 결정
  if (particle) {
    if (['은', '는', '이', '가'].includes(particle)) {
      role = 'subject';
    } else if (['을', '를'].includes(particle)) {
      role = 'object';
    } else if (['에', '에서'].includes(particle)) {
      role = 'location';
    } else if (['에게', '한테', '로', '으로'].includes(particle)) {
      role = 'location';
    }
  }

  // 2.5. 불규칙 활용형 체크 (갔다, 봤다, 왔다 등)
  const irregularVerb = KOREAN_IRREGULAR_VERBS[word];
  if (irregularVerb) {
    const pastForm = conjugatePast(irregularVerb.stem);
    return {
      original: token,
      translated: pastForm,
      role: 'verb',
      particle,
      connective: undefined,
    };
  }

  // 3. 연결어미/종결어미 분리
  let tense = 'present';
  for (const [ending, info] of Object.entries(KOREAN_ENDINGS)) {
    if (word.endsWith(ending)) {
      word = word.slice(0, -ending.length);
      tense = info.tense;
      role = 'verb';
      if (info.form === 'connective') {
        connective = 'and';
      }
      break;
    }
  }

  // 4. 연결어미 체크 (복합문)
  for (const [conn, info] of Object.entries(KOREAN_CONNECTIVES)) {
    if (word.endsWith(conn)) {
      word = word.slice(0, -conn.length);
      connective = info.en;
      role = 'verb';
      break;
    }
  }

  // 5. 형용사인지 확인
  const isAdj = KOREAN_ADJECTIVE_STEMS.has(word);

  // 6. 단어 번역
  const translated = translateWord(word, tense, role);

  // 주의: 전치사는 rearrangeToSVO에서 동사 타입에 따라 결정됨
  return {
    original: token,
    translated,
    role,
    particle,
    connective,
    isAdjective: isAdj,
    koreanStem: word,
  };
}

/**
 * 단어 번역
 */
function translateWord(word: string, tense: string, role: string): string {
  // 1. 사전에서 직접 검색
  const directTranslation = koToEnWords[word];
  if (directTranslation) {
    if (role === 'verb' && tense === 'past') {
      return conjugatePast(directTranslation);
    }
    return directTranslation;
  }

  // 2. 어간 번역 시도
  const stemTranslation = translateStemKoToEn(word);
  if (stemTranslation) {
    if (role === 'verb' && tense === 'past') {
      return conjugatePast(stemTranslation);
    }
    return stemTranslation;
  }

  // 3. 자소 기반 번역 시도
  const result = translateKoToEnDetailed(word);
  if (result && result.translated !== word) {
    return result.translated;
  }

  // 4. 원본 반환
  return word;
}

/**
 * 조사에 따른 전치사 반환
 */
function _getPrepositionForParticle(particle: string): string {
  const map: Record<string, string> = {
    에: 'at',
    에서: 'at',
    로: 'to',
    으로: 'to',
    에게: 'to',
    한테: 'to',
    와: 'with',
    과: 'with',
    의: 'of',
    부터: 'from',
    까지: 'until',
    처럼: 'like',
    같이: 'with',
    보다: 'than',
  };
  return map[particle] || '';
}

/**
 * SOV → SVO 어순 변환
 */
function rearrangeToSVO(
  tokens: Array<{
    original: string;
    translated: string;
    role: string;
    particle?: string;
    connective?: string;
    isAdjective?: boolean;
    koreanStem?: string;
  }>,
): string {
  const subjects: string[] = [];
  const verbs: string[] = [];
  const objects: string[] = [];
  const adverbs: string[] = [];
  const locations: Array<{ text: string; particle?: string }> = [];
  const others: string[] = [];
  let connective = '';
  let hasAdjective = false;

  for (const token of tokens) {
    // 연결어미 저장
    if (token.connective) {
      connective = token.connective;
    }

    // 형용사 체크
    if (token.isAdjective) {
      hasAdjective = true;
    }

    switch (token.role) {
      case 'subject':
        subjects.push(token.translated);
        break;
      case 'object':
        objects.push(token.translated);
        break;
      case 'verb':
        verbs.push(token.translated);
        break;
      case 'adverb':
      case 'modifier':
        adverbs.push(token.translated);
        break;
      case 'location':
        locations.push({ text: token.translated, particle: token.particle });
        break;
      default:
        // 시간 표현은 앞에
        if (isTimeExpression(token.translated)) {
          adverbs.unshift(token.translated);
        } else {
          others.push(token.translated);
        }
    }
  }

  // 동사 타입에 따른 전치사 결정
  const isMovementVerb = verbs.some((v) => MOVEMENT_VERBS.has(v.toLowerCase()));

  // SVO 순서로 조합
  const parts: string[] = [];

  // 시간/부사 표현
  if (adverbs.length > 0) {
    parts.push(...adverbs);
  }

  // 주어
  if (subjects.length > 0) {
    parts.push(...subjects);
  }

  // 형용사 술어인 경우 "is" 추가
  if (hasAdjective && verbs.length > 0) {
    parts.push('is');
  }

  // 동사
  if (verbs.length > 0) {
    parts.push(...verbs);
  }

  // 목적어
  if (objects.length > 0) {
    parts.push(...objects);
  }

  // 장소 (전치사 포함)
  if (locations.length > 0) {
    for (const loc of locations) {
      let prep = 'at'; // 기본값
      if (isMovementVerb && loc.particle === '에') {
        prep = 'to'; // 이동 동사 + 에 = to
      } else if (loc.particle === '에서') {
        prep = 'at'; // 에서 = at (장소에서 행동)
      } else if (loc.particle === '로' || loc.particle === '으로') {
        prep = 'to'; // 로/으로 = to (방향)
      }
      parts.push(`${prep} ${loc.text}`);
    }
  }

  // 기타
  if (others.length > 0) {
    parts.push(...others);
  }

  let result = parts.join(' ');

  // 연결어미 추가
  if (connective) {
    result = `${result} ${connective}`;
  }

  // 첫 글자 대문자
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

/**
 * 시간 표현인지 확인
 */
function isTimeExpression(word: string): boolean {
  const timeWords = [
    'today',
    'tomorrow',
    'yesterday',
    'now',
    'later',
    'soon',
    'morning',
    'afternoon',
    'evening',
    'night',
    'always',
    'sometimes',
    'often',
    'never',
    'usually',
    'early',
    'late',
  ];
  return timeWords.includes(word.toLowerCase());
}

/**
 * 한국어 → 영어 번역 (상세 정보 포함)
 */
export function translateKoToEnDetailed(text: string): KoToEnResult | null {
  // 1. 자소 분해
  const jasoArr = decomposeAll(text);
  if (jasoArr.length === 0) return null;

  // 2. 어미 패턴 매칭
  const endingPattern = matchEnding(jasoArr);
  if (!endingPattern) {
    // 어미가 없으면 어간 그대로 번역
    const englishStem = translateStemKoToEn(text);
    return {
      original: text,
      stem: text,
      ending: '',
      englishStem: englishStem || text,
      englishForm: englishStem || text,
      translated: englishStem || text,
    };
  }

  // 3. 어간 추출 (어미 제거)
  const stemJaso = removeEndingPattern(jasoArr, endingPattern.jaso);
  const koreanStem = composeFromJaso(stemJaso);

  // 4. 어간 번역
  const englishStem = translateStemKoToEn(koreanStem);
  if (!englishStem) {
    // 어간을 찾을 수 없으면 원본 반환
    return {
      original: text,
      stem: koreanStem,
      ending: text.slice(koreanStem.length),
      englishStem: koreanStem,
      englishForm: koreanStem,
      translated: text,
    };
  }

  // 5. 영어 시제 적용
  const englishForm = applyEnglishTense(englishStem, endingPattern, koreanStem);

  // 6. 부정형 처리
  let translated = englishForm;
  if (endingPattern.negative) {
    translated = `do not ${englishStem}`;
    if (endingPattern.tense === 'past') {
      translated = `did not ${englishStem}`;
    }
  }

  // 7. 의문형 처리
  if (endingPattern.question && !endingPattern.negative) {
    if (endingPattern.tense === 'past') {
      translated = `did ${englishStem}`;
    } else if (endingPattern.tense === 'future') {
      translated = `will ${englishStem}`;
    } else {
      translated = `do ${englishStem}`;
    }
  }

  // 8. 형용사 처리 (be 동사 추가)
  if (isAdjective(koreanStem) && !endingPattern.negative && !endingPattern.question) {
    if (endingPattern.tense === 'past') {
      translated = `was ${englishStem}`;
    } else if (endingPattern.tense === 'future') {
      translated = `will be ${englishStem}`;
    } else if (endingPattern.tense === 'progressive') {
      translated = `is being ${englishStem}`;
    } else {
      translated = `is ${englishStem}`;
    }
  }

  return {
    original: text,
    stem: koreanStem,
    ending: text.slice(koreanStem.length),
    englishStem,
    englishForm,
    translated,
  };
}

/**
 * 영어 시제 적용
 */
function applyEnglishTense(
  verb: string,
  endingPattern: { tense?: string; progressive?: boolean },
  koreanStem: string,
): string {
  // biome-ignore lint/suspicious/noExplicitAny: Ending pattern type mismatch - to be fixed later
  const tense = getEnglishTense(endingPattern as any);

  // 형용사는 시제 변화 없음
  if (isAdjective(koreanStem)) {
    return verb;
  }

  if (tense === 'past') {
    return conjugatePast(verb);
  }

  if (tense === 'progressive') {
    return conjugateProgressive(verb);
  }

  if (tense === 'future') {
    return `will ${verb}`;
  }

  return verb; // present
}

/**
 * 과거형 변환 (간단 버전, 나중에 불규칙 동사 추가)
 */
function conjugatePast(verb: string): string {
  // 불규칙 동사 (하드코딩 - 나중에 dictionary/exceptions로 이동)
  const irregulars: Record<string, string> = {
    go: 'went',
    eat: 'ate',
    see: 'saw',
    come: 'came',
    take: 'took',
    make: 'made',
    get: 'got',
    give: 'gave',
    know: 'knew',
    think: 'thought',
    find: 'found',
    say: 'said',
    tell: 'told',
    feel: 'felt',
    leave: 'left',
    meet: 'met',
    sit: 'sat',
    stand: 'stood',
    hear: 'heard',
    run: 'ran',
    write: 'wrote',
    read: 'read',
    speak: 'spoke',
    break: 'broke',
    buy: 'bought',
    bring: 'brought',
    teach: 'taught',
    catch: 'caught',
    fight: 'fought',
    sleep: 'slept',
    win: 'won',
    lose: 'lost',
    send: 'sent',
    spend: 'spent',
    build: 'built',
    lend: 'lent',
    bend: 'bent',
    throw: 'threw',
    grow: 'grew',
    blow: 'blew',
    fly: 'flew',
    draw: 'drew',
    fall: 'fell',
    sell: 'sold',
    hold: 'held',
    understand: 'understood',
    forget: 'forgot',
    begin: 'began',
    drink: 'drank',
    sing: 'sang',
    swim: 'swam',
    ring: 'rang',
  };

  if (irregulars[verb]) {
    return irregulars[verb];
  }

  // 규칙 동사
  if (verb.endsWith('e')) {
    return `${verb}d`;
  }

  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ied`;
  }

  // 단모음 + 단자음 → 자음 중복 + ed
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ed`;
  }

  return `${verb}ed`;
}

/**
 * 진행형 변환
 */
function conjugateProgressive(verb: string): string {
  if (verb.endsWith('e') && !verb.endsWith('ee') && !verb.endsWith('ye')) {
    return `${verb.slice(0, -1)}ing`;
  }

  // 단모음 + 단자음 → 자음 중복 + ing
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(verb)) {
    return `${verb}${verb[verb.length - 1]}ing`;
  }

  return `${verb}ing`;
}

/**
 * 3인칭 단수 현재형
 */
function _conjugateThirdPerson(verb: string): string {
  if (
    verb.endsWith('s') ||
    verb.endsWith('x') ||
    verb.endsWith('z') ||
    verb.endsWith('ch') ||
    verb.endsWith('sh')
  ) {
    return `${verb}es`;
  }

  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }

  return `${verb}s`;
}

/**
 * 여러 단어 번역 (공백으로 구분)
 */
export function translateKoToEnMultiple(text: string): string {
  const words = text.split(/\s+/);
  const translated = words.map((word) => translateKoToEn(word));
  return translated.join(' ');
}
