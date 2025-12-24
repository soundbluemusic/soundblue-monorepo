// ========================================
// Korean to English Engine - 한→영 자소 기반 번역
// 문장 수준 번역 지원 (토큰화, 어순 변환, 접속사 처리)
// ========================================

import { getEnglishTense, matchEnding } from '../dictionary/endings';
import { conjugateEnglishVerb } from '../dictionary/english-verbs';
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

// 한국어 연결 어미 (복합문 처리) - 길이순 정렬 (긴 것부터 매칭)
const KOREAN_CONNECTIVES: Record<string, { en: string; type: string; tense?: string }> = {
  // 5글자 이상 - 과거 + 연결어미
  았으니까: { en: 'because', type: 'reason', tense: 'past' },
  었으니까: { en: 'because', type: 'reason', tense: 'past' },
  였으니까: { en: 'because', type: 'reason', tense: 'past' },
  했으니까: { en: 'because', type: 'reason', tense: 'past' },
  // 4글자 - 과거 + 연결어미
  았으며: { en: 'and', type: 'and', tense: 'past' },
  었으며: { en: 'and', type: 'and', tense: 'past' },
  였으며: { en: 'and', type: 'and', tense: 'past' },
  했으며: { en: 'and', type: 'and', tense: 'past' },
  았어서: { en: 'and then', type: 'sequence', tense: 'past' },
  었어서: { en: 'and then', type: 'sequence', tense: 'past' },
  였어서: { en: 'and then', type: 'sequence', tense: 'past' },
  았지만: { en: 'but', type: 'but', tense: 'past' },
  었지만: { en: 'but', type: 'but', tense: 'past' },
  였지만: { en: 'but', type: 'but', tense: 'past' },
  았는데: { en: 'but', type: 'but', tense: 'past' },
  었는데: { en: 'but', type: 'but', tense: 'past' },
  였는데: { en: 'but', type: 'but', tense: 'past' },
  았으면: { en: 'if', type: 'condition', tense: 'past' },
  었으면: { en: 'if', type: 'condition', tense: 'past' },
  였으면: { en: 'if', type: 'condition', tense: 'past' },
  // 3글자
  으니까: { en: 'because', type: 'reason' },
  아서는: { en: 'and then', type: 'sequence' },
  어서는: { en: 'and then', type: 'sequence' },
  으면서: { en: 'while', type: 'while' },
  // 2글자
  아서: { en: 'and then', type: 'sequence' },
  어서: { en: 'and then', type: 'sequence' },
  으며: { en: 'and', type: 'and' },
  으면: { en: 'if', type: 'condition' },
  면서: { en: 'while', type: 'while' },
  지만: { en: 'but', type: 'but' },
  는데: { en: 'but', type: 'but' },
  ㄴ데: { en: 'but', type: 'but' },
  니까: { en: 'because', type: 'reason' },
  // 1글자
  고: { en: 'and', type: 'and' },
  며: { en: 'and', type: 'and' },
  서: { en: 'and then', type: 'sequence' },
  면: { en: 'if', type: 'condition' },
};

// 한국어 관형형 어미 (수식어 처리) - 길이순 정렬
const KOREAN_MODIFIERS: Record<string, { type: string; tense: string }> = {
  // 과거 관형형
  았던: { type: 'modifier', tense: 'past' },
  었던: { type: 'modifier', tense: 'past' },
  였던: { type: 'modifier', tense: 'past' },
  했던: { type: 'modifier', tense: 'past' },
  // 현재/과거 관형형
  는: { type: 'modifier', tense: 'present' },
  은: { type: 'modifier', tense: 'past' },
  ㄴ: { type: 'modifier', tense: 'past' },
  // 미래/추정 관형형
  을: { type: 'modifier', tense: 'future' },
  ㄹ: { type: 'modifier', tense: 'future' },
};

// 한국어 부사형 어미
const KOREAN_ADVERBIAL_ENDINGS: Record<string, { en: string; type: string }> = {
  게: { en: '-ly', type: 'manner' }, // 형용사 → 부사
  히: { en: '-ly', type: 'manner' }, // 형용사 → 부사 (조용히)
  이: { en: '-ly', type: 'manner' }, // 형용사 → 부사 (깨끗이)
  로: { en: 'as', type: 'manner' }, // ~로 (새로)
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
  봤다: { stem: 'watch', tense: 'past' },
  봤고: { stem: 'watch', tense: 'past' },
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
  // 0. 사전에서 직접 조회 (최우선)
  const directTranslation = koToEnWords[text];
  if (directTranslation) {
    return directTranslation;
  }

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
  // 부정문 패턴 전처리: "V-지 않는다" → "do not V"
  // 예: "가지 않는다" → "do not go"
  let processedClause = clause;
  let isNegative = false;
  let negativeVerb = '';

  // "V지 않는다/않았다/않아요" 패턴 감지
  const negationMatch = clause.match(/(\S+)지\s+않([는았아])/);
  if (negationMatch) {
    const verbPart = negationMatch[1]; // 가, 먹, 읽 등
    const verbStem = verbPart ?? '';
    // 동사 어간 번역
    const translatedVerb = translateWord(verbStem, 'present', 'verb');
    if (translatedVerb && translatedVerb !== verbStem) {
      isNegative = true;
      negativeVerb = translatedVerb;
      // 부정 패턴 제거하고 동사 부분만 남김
      processedClause = clause.replace(/(\S+)지\s+않[는았아요습니다]+/, '');
    }
  }

  // 토큰화
  const tokens = processedClause.split(/\s+/).filter((t) => t.trim());

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

  // 부정문인 경우 "do not V" 추가
  if (isNegative && negativeVerb) {
    analyzed.push({
      original: '않는다',
      translated: `do not ${negativeVerb}`,
      role: 'verb',
      particle: undefined,
      connective: undefined,
    });
  }

  // SVO 어순으로 재배열
  return rearrangeToSVO(analyzed);
}

/**
 * 토큰 분석 및 번역
 *
 * 핵심 원칙:
 * 1. 사전 우선 조회 (Longest Match First) - 전체 토큰을 먼저 사전에서 찾기
 * 2. 문맥 기반 역할 판단 - 조사로 역할 결정
 * 3. 형태소 분석은 사전에서 못 찾은 경우에만
 */
function analyzeAndTranslateToken(token: string): {
  original: string;
  translated: string;
  role: 'subject' | 'object' | 'verb' | 'adverb' | 'modifier' | 'time' | 'location' | 'unknown';
  particle?: string;
  connective?: string;
  connectiveType?: string;
  isAdjective?: boolean;
  isModifier?: boolean;
  koreanStem?: string;
  tense?: string;
} {
  let word = token;
  let particle: string | undefined;
  let connective: string | undefined;
  let connectiveType: string | undefined;
  let isModifier = false;
  let tense = 'present';
  let role:
    | 'subject'
    | 'object'
    | 'verb'
    | 'adverb'
    | 'modifier'
    | 'time'
    | 'location'
    | 'unknown' = 'unknown';

  // === 0. 사전 우선 조회 (Longest Match First) ===
  // 전체 토큰이 사전에 있으면 바로 반환 (예: 일찍, 오늘, 어제 등)
  const directTranslation = koToEnWords[token];
  if (directTranslation) {
    // 시간/부사 표현 판단
    const timeAdverbs = [
      '일찍',
      '늦게',
      '오늘',
      '어제',
      '내일',
      '지금',
      '항상',
      '자주',
      '가끔',
      '매일',
    ];
    if (timeAdverbs.includes(token)) {
      return {
        original: token,
        translated: directTranslation,
        role: 'adverb',
        particle: undefined,
        connective: undefined,
        tense: 'present',
      };
    }
    // 일반 단어
    return {
      original: token,
      translated: directTranslation,
      role: 'unknown',
      particle: undefined,
      connective: undefined,
      tense: 'present',
    };
  }

  // 1. 조사 분리
  for (const p of KOREAN_PARTICLES) {
    if (word.endsWith(p) && word.length > p.length) {
      particle = p;
      word = word.slice(0, -p.length);
      break;
    }
  }

  // === 1.5. 조사 분리 후 사전에서 다시 조회 ===
  // 예: "아침에" → 조사 "에" 분리 후 "아침" 사전 조회
  const wordTranslation = koToEnWords[word];
  if (wordTranslation && particle) {
    // 조사로 역할 결정
    if (['은', '는', '이', '가'].includes(particle)) {
      role = 'subject';
    } else if (['을', '를'].includes(particle)) {
      role = 'object';
    } else if (['에', '에서'].includes(particle)) {
      role = 'location';
    } else if (['에게', '한테', '로', '으로'].includes(particle)) {
      role = 'location';
    } else if (['와', '과', '하고', '랑', '이랑'].includes(particle)) {
      role = 'object';
    }

    return {
      original: token,
      translated: wordTranslation,
      role,
      particle,
      connective: undefined,
      tense: 'present',
    };
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
    } else if (['와', '과', '하고', '랑', '이랑'].includes(particle)) {
      role = 'object'; // with 관계
    }
  }

  // 2.3. 지시형용사 체크 (이, 저, 그 - 다음 명사 수식)
  const DEMONSTRATIVE_ADJECTIVES = ['이', '저', '그'];
  if (DEMONSTRATIVE_ADJECTIVES.includes(word) && !particle) {
    role = 'modifier';
    isModifier = true;
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
      tense: 'past',
    };
  }

  // 3. 연결어미 체크 (복합문) - 긴 것부터 매칭
  const sortedConnectives = Object.entries(KOREAN_CONNECTIVES).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [conn, info] of sortedConnectives) {
    if (word.endsWith(conn)) {
      word = word.slice(0, -conn.length);
      connective = info.en;
      connectiveType = info.type;
      if (info.tense) {
        tense = info.tense;
      }
      role = 'verb';
      break;
    }
  }

  // 4. 관형형 어미 체크 (수식어) - 긴 것부터 매칭
  if (role === 'unknown') {
    const sortedModifiers = Object.entries(KOREAN_MODIFIERS).sort(
      (a, b) => b[0].length - a[0].length,
    );
    for (const [mod, info] of sortedModifiers) {
      if (word.endsWith(mod)) {
        word = word.slice(0, -mod.length);
        isModifier = true;
        role = 'modifier';
        tense = info.tense;
        break;
      }
    }
  }

  // 5. 부사형 어미 체크
  if (role === 'unknown') {
    for (const [adv, _info] of Object.entries(KOREAN_ADVERBIAL_ENDINGS)) {
      if (word.endsWith(adv) && word.length > adv.length) {
        word = word.slice(0, -adv.length);
        role = 'adverb';
        break;
      }
    }
  }

  // 6. 종결어미 분리
  if (role !== 'modifier' && role !== 'adverb' && !connective) {
    const sortedEndings = Object.entries(KOREAN_ENDINGS).sort((a, b) => b[0].length - a[0].length);
    for (const [ending, info] of sortedEndings) {
      if (word.endsWith(ending)) {
        word = word.slice(0, -ending.length);
        tense = info.tense;
        role = 'verb';
        if (info.form === 'connective') {
          connective = 'and';
          connectiveType = 'and';
        }
        break;
      }
    }
  }

  // 7. 형용사인지 확인
  const isAdj = KOREAN_ADJECTIVE_STEMS.has(word);

  // 8. 단어 번역
  let translated = translateWord(word, tense, role);

  // 9. 수식어인 경우 영어 형태 조정
  if (isModifier) {
    // 형용사 수식어: 좋은 → good, 새로운 → new
    // 동사 수식어: 생긴 → opened, 만든 → made
    if (tense === 'past' && !isAdj) {
      // 과거분사 형태로 변환 (동사 수식어)
      translated = conjugatePastParticiple(translated);
    }
  }

  // 10. 부사인 경우 -ly 추가
  if (role === 'adverb' && isAdj) {
    translated = convertToAdverb(translated);
  }

  return {
    original: token,
    translated,
    role,
    particle,
    connective,
    connectiveType,
    isAdjective: isAdj,
    isModifier,
    koreanStem: word,
    tense,
  };
}

/**
 * 과거분사 변환
 */
function conjugatePastParticiple(verb: string): string {
  // 불규칙 동사
  const irregulars: Record<string, string> = {
    open: 'opened',
    make: 'made',
    take: 'taken',
    give: 'given',
    write: 'written',
    eat: 'eaten',
    see: 'seen',
    go: 'gone',
    come: 'come',
    do: 'done',
    be: 'been',
    have: 'had',
    get: 'gotten',
    buy: 'bought',
    bring: 'brought',
    build: 'built',
    catch: 'caught',
    find: 'found',
    hear: 'heard',
    hold: 'held',
    keep: 'kept',
    know: 'known',
    leave: 'left',
    lose: 'lost',
    meet: 'met',
    pay: 'paid',
    put: 'put',
    read: 'read',
    run: 'run',
    say: 'said',
    sell: 'sold',
    send: 'sent',
    sit: 'sat',
    sleep: 'slept',
    speak: 'spoken',
    spend: 'spent',
    stand: 'stood',
    teach: 'taught',
    tell: 'told',
    think: 'thought',
    understand: 'understood',
    win: 'won',
  };

  if (irregulars[verb]) {
    return irregulars[verb];
  }

  // 규칙 동사 - 과거형과 동일
  return conjugatePast(verb);
}

/**
 * 형용사 → 부사 변환
 */
function convertToAdverb(adjective: string): string {
  // 특수 케이스
  const irregulars: Record<string, string> = {
    good: 'well',
    fast: 'fast',
    hard: 'hard',
    late: 'late',
    early: 'early',
    high: 'high',
    low: 'low',
    near: 'near',
    far: 'far',
    happy: 'happily',
    easy: 'easily',
    angry: 'angrily',
    lucky: 'luckily',
    busy: 'busily',
  };

  if (irregulars[adjective]) {
    return irregulars[adjective];
  }

  // 규칙: -ly 추가
  if (adjective.endsWith('y')) {
    return `${adjective.slice(0, -1)}ily`;
  }
  if (adjective.endsWith('le')) {
    return `${adjective.slice(0, -2)}ly`;
  }
  if (adjective.endsWith('ic')) {
    return `${adjective}ally`;
  }

  return `${adjective}ly`;
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
 * SOV → SVO 어순 변환 (관형절, 부사절 처리 포함)
 */
function rearrangeToSVO(
  tokens: Array<{
    original: string;
    translated: string;
    role: string;
    particle?: string;
    connective?: string;
    connectiveType?: string;
    isAdjective?: boolean;
    isModifier?: boolean;
    koreanStem?: string;
    tense?: string;
  }>,
): string {
  const subjects: string[] = [];
  const verbs: string[] = [];
  const objects: string[] = [];
  const adverbs: string[] = [];
  const modifiers: string[] = []; // 수식어 (다음 명사 앞에 배치)
  const locations: Array<{ text: string; particle?: string }> = [];
  const companions: Array<{ text: string; particle?: string }> = []; // with 관계
  const others: string[] = [];
  let connective = '';
  let connectiveType = '';
  let hasAdjective = false;
  let verbTense = 'present';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const _nextToken = tokens[i + 1];

    // 연결어미 저장
    if (token.connective) {
      connective = token.connective;
      connectiveType = token.connectiveType || '';
    }

    // 시제 저장
    if (token.tense) {
      verbTense = token.tense;
    }

    // 형용사 체크
    if (token.isAdjective && token.role === 'verb') {
      hasAdjective = true;
    }

    switch (token.role) {
      case 'subject':
        // 수식어가 있으면 주어 앞에 붙임
        if (modifiers.length > 0) {
          subjects.push(`${modifiers.join(' ')} ${token.translated}`);
          modifiers.length = 0;
        } else {
          subjects.push(token.translated);
        }
        break;
      case 'object':
        // 수식어가 있으면 목적어 앞에 붙임
        if (modifiers.length > 0) {
          // with 관계 처리
          if (['와', '과', '하고', '랑', '이랑'].includes(token.particle || '')) {
            companions.push({
              text: `${modifiers.join(' ')} ${token.translated}`,
              particle: token.particle,
            });
          } else {
            objects.push(`${modifiers.join(' ')} ${token.translated}`);
          }
          modifiers.length = 0;
        } else {
          if (['와', '과', '하고', '랑', '이랑'].includes(token.particle || '')) {
            companions.push({ text: token.translated, particle: token.particle });
          } else {
            objects.push(token.translated);
          }
        }
        break;
      case 'verb':
        verbs.push(token.translated);
        break;
      case 'adverb':
        adverbs.push(token.translated);
        break;
      case 'modifier':
        // 수식어는 다음 명사 앞에 배치될 것임
        modifiers.push(token.translated);
        break;
      case 'location':
        // 수식어가 있으면 장소 앞에 붙임
        if (modifiers.length > 0) {
          locations.push({
            text: `${modifiers.join(' ')} ${token.translated}`,
            particle: token.particle,
          });
          modifiers.length = 0;
        } else {
          locations.push({ text: token.translated, particle: token.particle });
        }
        break;
      default:
        // 시간 표현은 앞에
        if (isTimeExpression(token.translated)) {
          adverbs.unshift(token.translated);
        } else if (modifiers.length > 0) {
          // 수식어가 있으면 기타 앞에 붙임
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

  // 위치 전치사 패턴 처리: "책상 위에" → "on desk"
  // "위/아래/옆/앞/뒤" + "에"가 location으로 들어오고, 앞에 일반 명사가 others에 있는 경우
  const POSITION_WORDS = [
    'on',
    'above',
    'below',
    'under',
    'beside',
    'next to',
    'behind',
    'in front of',
    'inside',
    'in',
    'outside',
  ];
  if (locations.length > 0 && others.length > 0) {
    const lastOther = others[others.length - 1];
    const firstLoc = locations[0];
    if (lastOther && firstLoc && POSITION_WORDS.includes(firstLoc.text.toLowerCase())) {
      // "책상" + "위" → "on desk"
      // others에서 명사 제거하고, locations의 preposition으로 결합
      others.pop();
      locations[0] = { text: lastOther, particle: firstLoc.particle };
      // 원래 위치 전치사를 앞에 붙여서 새 위치로
      locations.unshift({ text: firstLoc.text.toLowerCase(), particle: undefined });
    }
  }

  // 동사 타입에 따른 전치사 결정
  // "do not go" 같은 복합 동사도 이동 동사로 인식
  const isMovementVerb = verbs.some((v) => {
    const verbLower = v.toLowerCase();
    // 직접 매칭
    if (MOVEMENT_VERBS.has(verbLower)) return true;
    // 복합 동사 (do not go, will go 등)에서 이동 동사 포함 여부
    const words = verbLower.split(' ');
    return words.some((word) => MOVEMENT_VERBS.has(word));
  });

  // SVO 순서로 조합
  const parts: string[] = [];

  // 시간/부사 표현 (문두)
  if (adverbs.length > 0) {
    parts.push(...adverbs);
  }

  // 주어
  if (subjects.length > 0) {
    parts.push(...subjects);
  }

  // 형용사 술어인 경우 "is/was" 추가
  if (hasAdjective && verbs.length > 0) {
    if (verbTense === 'past') {
      parts.push('was');
    } else {
      parts.push('is');
    }
  }

  // 동사 (3인칭 단수 및 시제 처리)
  if (verbs.length > 0) {
    // 주어에서 3인칭 단수 여부 판단
    const subjectText = subjects.join(' ').toLowerCase();
    const isThirdPersonSingular =
      subjectText === 'he' ||
      subjectText === 'she' ||
      subjectText === 'it' ||
      // 관사 + 명사 (the cat, a dog 등)는 3인칭 단수
      /^(the|a|an)\s+\w+$/.test(subjectText) ||
      // 단일 명사 (cat, dog 등)도 3인칭 단수
      (subjects.length === 1 && !['i', 'you', 'we', 'they'].includes(subjectText));

    // "있다" → "be" 변환 (위치/존재 문맥)
    // "have" + location → "be" (나는 집에 있다 = I am at home)
    const processedVerbs = verbs.map((verb) => {
      if (verb.toLowerCase() === 'have' && locations.length > 0) {
        // 위치가 있으면 be 동사로 변환
        if (verbTense === 'past') {
          return subjectText === 'i' ||
            subjectText === 'he' ||
            subjectText === 'she' ||
            subjectText === 'it'
            ? 'was'
            : 'were';
        }
        return subjectText === 'i' ? 'am' : isThirdPersonSingular ? 'is' : 'are';
      }
      return verb;
    });

    // 형용사가 아닌 경우에만 동사 활용 (형용사는 is/was 처리됨)
    if (!hasAdjective) {
      // 과거형은 이미 conjugatePast()에서 처리됨 - 중복 활용 방지
      // 현재형에서만 3인칭 단수 처리
      if (verbTense === 'present' && isThirdPersonSingular) {
        const conjugatedVerbs = processedVerbs.map((verb) => {
          // be 동사는 이미 is로 변환됨
          if (verb === 'am' || verb === 'is' || verb === 'are') {
            return verb;
          }
          return conjugateEnglishVerb(verb, 'present', 'he');
        });
        parts.push(...conjugatedVerbs);
      } else {
        // 과거형/미래형이거나 1/2인칭은 이미 처리된 동사 사용
        parts.push(...processedVerbs);
      }
    } else {
      parts.push(...processedVerbs);
    }
  }

  // 목적어
  if (objects.length > 0) {
    parts.push(...objects);
  }

  // 동반자 (with 관계)
  if (companions.length > 0) {
    for (const comp of companions) {
      parts.push(`with ${comp.text}`);
    }
  }

  // 위치 전치사 매핑 (위, 아래, 옆, 앞, 뒤 등)
  const POSITION_PREPOSITIONS: Record<string, string> = {
    on: 'on',
    above: 'above',
    below: 'below',
    under: 'under',
    beside: 'beside',
    'next to': 'next to',
    behind: 'behind',
    'in front of': 'in front of',
    inside: 'inside',
    in: 'in',
    outside: 'outside',
    between: 'between',
  };

  // 장소 (전치사 포함)
  if (locations.length > 0) {
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      if (!loc) continue;

      // "home"은 이동 동사와 함께 전치사 없이 사용 (go home, come home)
      const locLower = loc.text.toLowerCase();
      if (isMovementVerb && (locLower === 'home' || locLower === 'here' || locLower === 'there')) {
        parts.push(loc.text);
        continue;
      }

      // 위치 전치사인 경우 (on, under, beside 등)
      // 다음 위치가 있으면 그것과 결합: "on" + "desk" → "on the desk"
      if (POSITION_PREPOSITIONS[locLower] && i + 1 < locations.length) {
        const nextLoc = locations[i + 1];
        if (nextLoc) {
          parts.push(`${locLower} ${nextLoc.text}`);
          i++; // 다음 위치 건너뛰기
          continue;
        }
      }

      let prep = 'at'; // 기본값
      if (isMovementVerb && loc.particle === '에') {
        prep = 'to'; // 이동 동사 + 에 = to
      } else if (loc.particle === '에서') {
        prep = 'at'; // 에서 = at (장소에서 행동)
      } else if (loc.particle === '로' || loc.particle === '으로') {
        prep = 'to'; // 로/으로 = to (방향)
      } else if (loc.particle === '에게' || loc.particle === '한테') {
        prep = 'to'; // 에게/한테 = to (대상)
      }
      parts.push(`${prep} ${loc.text}`);
    }
  }

  // 기타
  if (others.length > 0) {
    parts.push(...others);
  }

  let result = parts.join(' ');

  // 연결어미 추가 (타입에 따라 다르게 처리)
  if (connective) {
    if (connectiveType === 'reason') {
      // because는 문두로 이동하거나 문장 뒤에
      result = `${result}, ${connective}`;
    } else if (connectiveType === 'condition') {
      // if는 절 앞에
      result = `${result}, ${connective}`;
    } else if (connectiveType === 'while') {
      // while
      result = `${result}, ${connective}`;
    } else {
      result = `${result} ${connective}`;
    }
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
