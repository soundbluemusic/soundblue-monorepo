// ========================================
// English Sentence Generator - 영어 문장 생성기
// SOV→SVO 어순 변환 + 시제/관사/Be동사 처리
// ========================================

import { koToEnWords } from '../dictionary';
import type { Tense, TokenAnalysis } from './morpheme-analyzer';
import { PARTICLES } from './morpheme-analyzer';
import type { Constituent, ParsedSentence } from './sentence-parser';

// ========================================
// 영어 동사 불규칙 변화표
// ========================================
const IRREGULAR_VERBS: Record<string, { past: string; pastParticiple: string }> = {
  be: { past: 'was', pastParticiple: 'been' },
  have: { past: 'had', pastParticiple: 'had' },
  do: { past: 'did', pastParticiple: 'done' },
  go: { past: 'went', pastParticiple: 'gone' },
  come: { past: 'came', pastParticiple: 'come' },
  see: { past: 'saw', pastParticiple: 'seen' },
  hear: { past: 'heard', pastParticiple: 'heard' },
  eat: { past: 'ate', pastParticiple: 'eaten' },
  drink: { past: 'drank', pastParticiple: 'drunk' },
  give: { past: 'gave', pastParticiple: 'given' },
  take: { past: 'took', pastParticiple: 'taken' },
  make: { past: 'made', pastParticiple: 'made' },
  get: { past: 'got', pastParticiple: 'gotten' },
  buy: { past: 'bought', pastParticiple: 'bought' },
  sell: { past: 'sold', pastParticiple: 'sold' },
  read: { past: 'read', pastParticiple: 'read' },
  write: { past: 'wrote', pastParticiple: 'written' },
  speak: { past: 'spoke', pastParticiple: 'spoken' },
  meet: { past: 'met', pastParticiple: 'met' },
  find: { past: 'found', pastParticiple: 'found' },
  know: { past: 'knew', pastParticiple: 'known' },
  think: { past: 'thought', pastParticiple: 'thought' },
  feel: { past: 'felt', pastParticiple: 'felt' },
  run: { past: 'ran', pastParticiple: 'run' },
  sit: { past: 'sat', pastParticiple: 'sat' },
  stand: { past: 'stood', pastParticiple: 'stood' },
  sleep: { past: 'slept', pastParticiple: 'slept' },
  sing: { past: 'sang', pastParticiple: 'sung' },
  swim: { past: 'swam', pastParticiple: 'swum' },
  drive: { past: 'drove', pastParticiple: 'driven' },
  ride: { past: 'rode', pastParticiple: 'ridden' },
  fly: { past: 'flew', pastParticiple: 'flown' },
  grow: { past: 'grew', pastParticiple: 'grown' },
  begin: { past: 'began', pastParticiple: 'begun' },
  break: { past: 'broke', pastParticiple: 'broken' },
  choose: { past: 'chose', pastParticiple: 'chosen' },
  forget: { past: 'forgot', pastParticiple: 'forgotten' },
  wake: { past: 'woke', pastParticiple: 'woken' },
  wear: { past: 'wore', pastParticiple: 'worn' },
  win: { past: 'won', pastParticiple: 'won' },
  lose: { past: 'lost', pastParticiple: 'lost' },
  send: { past: 'sent', pastParticiple: 'sent' },
  spend: { past: 'spent', pastParticiple: 'spent' },
  build: { past: 'built', pastParticiple: 'built' },
  catch: { past: 'caught', pastParticiple: 'caught' },
  teach: { past: 'taught', pastParticiple: 'taught' },
  bring: { past: 'brought', pastParticiple: 'brought' },
  fight: { past: 'fought', pastParticiple: 'fought' },
  hold: { past: 'held', pastParticiple: 'held' },
  leave: { past: 'left', pastParticiple: 'left' },
  pay: { past: 'paid', pastParticiple: 'paid' },
  say: { past: 'said', pastParticiple: 'said' },
  tell: { past: 'told', pastParticiple: 'told' },
  understand: { past: 'understood', pastParticiple: 'understood' },
  put: { past: 'put', pastParticiple: 'put' },
  cut: { past: 'cut', pastParticiple: 'cut' },
  let: { past: 'let', pastParticiple: 'let' },
  set: { past: 'set', pastParticiple: 'set' },
  hit: { past: 'hit', pastParticiple: 'hit' },
  hurt: { past: 'hurt', pastParticiple: 'hurt' },
  // 규칙 동사지만 자주 사용되므로 명시
  listen: { past: 'listened', pastParticiple: 'listened' },
  watch: { past: 'watched', pastParticiple: 'watched' },
};

// ========================================
// 불가산 명사 목록
// ========================================
const UNCOUNTABLE_NOUNS = new Set([
  'water',
  'rice',
  'bread',
  'milk',
  'coffee',
  'tea',
  'beer',
  'wine',
  'food',
  'meat',
  'fish',
  'music',
  'love',
  'happiness',
  'sadness',
  'anger',
  'fear',
  'information',
  'news',
  'advice',
  'weather',
  'rain',
  'snow',
  'time',
  'money',
  'work',
  'homework',
  'furniture',
  'luggage',
  'equipment',
  'traffic',
  'knowledge',
  'research',
  'evidence',
  'progress',
  'health',
  'air',
  'oxygen',
  'sugar',
  'salt',
  'pepper',
  'butter',
  'cheese',
  'juice',
  'soup',
  'electricity',
  'energy',
  'fun',
  'luck',
  'nature',
  'space',
  'travel',
]);

// ========================================
// 동사 활용 함수
// ========================================
function conjugateVerb(
  verb: string,
  tense: Tense,
  subject: string,
  isNegative: boolean = false,
  negationType?: 'did_not' | 'could_not',
): string {
  const verbLower = verb.toLowerCase();
  const isThirdPerson =
    subject.toLowerCase() !== 'i' &&
    subject.toLowerCase() !== 'you' &&
    subject.toLowerCase() !== 'we' &&
    subject.toLowerCase() !== 'they';

  // 부정문 처리
  if (isNegative) {
    // 능력 부정 (couldn't) vs 의지 부정 (didn't)
    if (negationType === 'could_not') {
      switch (tense) {
        case 'present':
          return `can't ${verbLower}`;
        case 'past':
          return `couldn't ${verbLower}`;
        case 'future':
          return `won't be able to ${verbLower}`;
        case 'progressive':
          return `can't ${getProgressiveForm(verbLower)}`;
      }
    }
    // 기본: 의지 부정 (didn't)
    switch (tense) {
      case 'present':
        return isThirdPerson ? `doesn't ${verbLower}` : `don't ${verbLower}`;
      case 'past':
        return `didn't ${verbLower}`;
      case 'future':
        return `won't ${verbLower}`;
      case 'progressive':
        return isThirdPerson
          ? `isn't ${getProgressiveForm(verbLower)}`
          : `am not ${getProgressiveForm(verbLower)}`;
    }
  }

  // 긍정문 시제 처리
  switch (tense) {
    case 'present':
      if (isThirdPerson) {
        return getThirdPersonPresent(verbLower);
      }
      return verbLower;

    case 'past':
      return getPastTense(verbLower);

    case 'future':
      return `will ${verbLower}`;

    case 'progressive': {
      const progressive = getProgressiveForm(verbLower);
      if (subject.toLowerCase() === 'i') return `am ${progressive}`;
      if (isThirdPerson) return `is ${progressive}`;
      return `are ${progressive}`;
    }
  }
}

function getThirdPersonPresent(verb: string): string {
  if (verb === 'have') return 'has';
  if (verb === 'be') return 'is';
  if (verb === 'do') return 'does';
  if (verb === 'go') return 'goes';

  // -s, -ss, -sh, -ch, -x, -o → -es
  if (/(?:s|ss|sh|ch|x|o)$/.test(verb)) {
    return `${verb}es`;
  }
  // 자음 + y → -ies
  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }
  return `${verb}s`;
}

function getPastTense(verb: string): string {
  // 불규칙 동사
  if (IRREGULAR_VERBS[verb]) {
    return IRREGULAR_VERBS[verb].past;
  }

  // 규칙 동사
  if (verb.endsWith('e')) {
    return `${verb}d`;
  }
  // 자음 + y → -ied
  if (/[^aeiou]y$/.test(verb)) {
    return `${verb.slice(0, -1)}ied`;
  }
  // 단모음 + 단자음 → 자음 중복 + ed
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(verb)) {
    return `${verb + (verb[verb.length - 1] ?? '')}ed`;
  }
  return `${verb}ed`;
}

function getProgressiveForm(verb: string): string {
  if (verb === 'be') return 'being';
  if (verb === 'have') return 'having';
  if (verb === 'die') return 'dying';
  if (verb === 'lie') return 'lying';
  if (verb === 'tie') return 'tying';

  // -e로 끝나면 e 제거 + ing
  if (verb.endsWith('e') && !verb.endsWith('ee')) {
    return `${verb.slice(0, -1)}ing`;
  }
  // -ie로 끝나면 → ying
  if (verb.endsWith('ie')) {
    return `${verb.slice(0, -2)}ying`;
  }
  // 단모음 + 단자음 → 자음 중복 + ing
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(verb)) {
    return `${verb + (verb[verb.length - 1] ?? '')}ing`;
  }
  return `${verb}ing`;
}

// ========================================
// Be 동사 선택
// ========================================
function selectBeVerb(subject: string, tense: Tense): string {
  const subjectLower = subject.toLowerCase();

  if (tense === 'past') {
    if (
      subjectLower === 'i' ||
      subjectLower === 'he' ||
      subjectLower === 'she' ||
      subjectLower === 'it'
    ) {
      return 'was';
    }
    return 'were';
  }

  if (tense === 'future') {
    return 'will be';
  }

  // 현재
  if (subjectLower === 'i') return 'am';
  if (subjectLower === 'you' || subjectLower === 'we' || subjectLower === 'they') return 'are';
  return 'is';
}

// ========================================
// 관사 선택
// ========================================
// "a" 사용 예외: 발음이 /j/ 또는 /w/로 시작하는 단어들 (철자는 모음이지만 발음은 자음)
const A_NOT_AN_WORDS = new Set([
  // uni- 시작 (발음: /juː/)
  'university',
  'uniform',
  'unique',
  'unit',
  'united',
  'union',
  'universe',
  'universal',
  'unicorn',
  'unification',
  'unilateral',
  // use-/usu- 시작 (발음: /juː/)
  'useful',
  'useless',
  'user',
  'usual',
  'usually',
  'usurp',
  'utensil',
  'utility',
  'utilize',
  'utopia',
  // eu- 시작 (발음: /juː/)
  'european',
  'euro',
  'euphoria',
  'eulogy',
  'euphemism',
  // one/once (발음: /wʌn/)
  'one',
  'once',
  'one-way',
  'one-time',
]);

// "an" 사용 예외: 묵음 h로 시작하는 단어들 (철자는 자음이지만 발음은 모음)
const AN_NOT_A_WORDS = new Set([
  // 묵음 h (발음: 모음으로 시작)
  'hour',
  'hourly',
  'honest',
  'honestly',
  'honor',
  'honour',
  'honorable',
  'honourable',
  'heir',
  'heiress',
  'herb', // American English에서 묵음
  'herbal',
]);

function selectArticle(noun: string, isSpecific: boolean = false): string {
  const nounLower = noun.toLowerCase();

  // 불가산 명사 → 관사 없음
  if (UNCOUNTABLE_NOUNS.has(nounLower)) {
    return '';
  }

  // 특정한 것 → the
  if (isSpecific) {
    return 'the ';
  }

  // 발음이 자음으로 시작하는 예외 단어들 (uni-, use-, eu- 등)
  // 철자는 모음이지만 발음은 /j/ 또는 /w/로 시작
  if (A_NOT_AN_WORDS.has(nounLower)) {
    return 'a ';
  }

  // 묵음 h로 시작하는 예외 단어들 (hour, honest 등)
  // 철자는 자음이지만 발음은 모음으로 시작
  if (AN_NOT_A_WORDS.has(nounLower)) {
    return 'an ';
  }

  // 불특정 단수 → a/an (철자 기반)
  if (/^[aeiou]/i.test(noun)) {
    return 'an ';
  }
  return 'a ';
}

// ========================================
// 이동 동사 목록 (전치사 'to' 사용)
// ========================================
const MOVEMENT_VERBS = new Set([
  'go',
  'come',
  'return',
  'arrive',
  'leave',
  'travel',
  'move',
  'run',
  'walk',
  'fly',
  'drive',
  'ride',
]);

// 전치사 없이 사용되는 장소 부사
const ADVERBIAL_PLACES = new Set([
  'home',
  'here',
  'there',
  'abroad',
  'downtown',
  'upstairs',
  'downstairs',
]);

// ========================================
// 목적어 전치사가 필요한 동사 (listen to, look at 등)
// ========================================
const VERBS_WITH_OBJECT_PREPOSITION: Record<string, string> = {
  listen: 'to',
  look: 'at',
  wait: 'for',
  search: 'for',
  ask: 'for',
  care: 'about',
  think: 'about',
  talk: 'about',
  worry: 'about',
  dream: 'about',
  apologize: 'for',
  apply: 'for',
  belong: 'to',
  depend: 'on',
  rely: 'on',
  // Level 2 동사
  graduate: 'from',
  prepare: 'for',
  adapt: 'to',
};

// ========================================
// 한국어 토큰 → 영어 단어 변환
// ========================================
// 시간 표현 목록 (전치사 불필요)
const TIME_EXPRESSIONS_NO_PREPOSITION = new Set([
  'this morning',
  'last night',
  'last evening',
  'tomorrow morning',
  'tonight',
  'this evening',
  'yesterday',
  'today',
  'tomorrow',
  'now',
]);

// 시간 명사 + 조사 '에' → 전치사 + 시간 표현
// 예: 주말에 → on the weekend, 아침에 → in the morning
const TIME_NOUN_PREPOSITIONS: Record<string, string> = {
  주말: 'on the weekend',
  평일: 'on weekdays',
  아침: 'in the morning',
  오전: 'in the morning',
  오후: 'in the afternoon',
  저녁: 'in the evening',
  밤: 'at night',
  낮: 'during the day',
  방학: 'during vacation',
  휴일: 'on the holiday',
  휴가: 'during vacation',
  생일: 'on the birthday',
  크리스마스: 'on Christmas',
  설날: 'on New Year',
  추석: 'on Chuseok',
};

// 시간 명사 (조사 없이도 시간으로 인식)
const TIME_NOUNS_KO = new Set([
  '주말',
  '평일',
  '아침',
  '오전',
  '오후',
  '저녁',
  '밤',
  '낮',
  '방학',
  '휴일',
  '휴가',
  '생일',
]);

// 시간 표현 영어 패턴 (문장 끝에 배치해야 함)
const TIME_EXPRESSION_PATTERNS = [
  /^on the weekend$/i,
  /^on weekdays$/i,
  /^in the morning$/i,
  /^in the afternoon$/i,
  /^in the evening$/i,
  /^at night$/i,
  /^during the day$/i,
  /^during vacation$/i,
  /^on the (holiday|birthday)$/i,
  /^on (Christmas|New Year|Chuseok)$/i,
  /^(yesterday|today|tomorrow)$/i,
  /^(last|this|next) (night|morning|evening|week|month|year)$/i,
];

function isTimeExpression(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return TIME_EXPRESSION_PATTERNS.some((pattern) => pattern.test(lower));
}

// 방법/정도 부사 목록 (동사 바로 뒤에 위치)
const MANNER_ADVERBS = new Set([
  'early',
  'late',
  'quickly',
  'slowly',
  'well',
  'badly',
  'fast',
  'hard',
  'properly',
  'correctly',
  'carefully',
  'continuously',
  'constantly',
]);

function translateToken(
  token: TokenAnalysis,
  verbInfo?: { stem: string; english: string },
): string {
  const stem = token.stem;

  // 사전에서 검색 (원본 먼저, 그 다음 어간)
  const english = koToEnWords[token.original] || koToEnWords[stem] || stem;

  // 시간 표현이면 전치사 없이 바로 반환
  if (TIME_EXPRESSIONS_NO_PREPOSITION.has(english.toLowerCase())) {
    return english;
  }

  // 조사에 따른 전치사 추가
  if (token.particle) {
    const particleInfo = PARTICLES[token.particle];

    // 시간 명사 + '에' 조사 → 특수 전치사 표현
    // 예: 주말에 → on the weekend, 아침에 → in the morning
    if (token.particle === '에' && TIME_NOUNS_KO.has(stem)) {
      const timeExpression = TIME_NOUN_PREPOSITIONS[stem];
      if (timeExpression) {
        return timeExpression;
      }
    }

    if (particleInfo?.en) {
      // '에' 조사 특수 처리: 동사와 장소에 따라 전치사 결정
      if (token.particle === '에' && verbInfo) {
        const verbEnglish = verbInfo.english.toLowerCase();
        const placeEnglish = english.toLowerCase();

        // 이동 동사 + home/here/there → 전치사 없음
        if (MOVEMENT_VERBS.has(verbEnglish) && ADVERBIAL_PLACES.has(placeEnglish)) {
          return english;
        }
        // 이동 동사 + 장소 → 'to'
        if (MOVEMENT_VERBS.has(verbEnglish)) {
          return `to ${english}`;
        }
        // 존재 동사(있다) → 'at'
        if (verbInfo.stem === '있') {
          // home은 'at home'
          return `at ${english}`;
        }
      }

      // 기본: 조사에 정의된 전치사 사용
      return `${particleInfo.en} ${english}`;
    }
  }

  return english;
}

// ========================================
// 정관사(the)가 필요한 명사들
// ========================================
const DEFINITE_ARTICLE_NOUNS = new Set([
  'weather',
  'sun',
  'moon',
  'sky',
  'world',
  'earth',
  'morning',
  'afternoon',
  'evening',
  'night',
  'future',
  'past',
  'present',
  'situation',
  'problem',
  'news',
  'truth',
  'answer',
  'question',
  'reason',
]);

// ========================================
// 위치 명사 → 전치사 매핑
// ========================================
const LOCATION_NOUN_TO_PREPOSITION: Record<string, string> = {
  위: 'on',
  아래: 'under',
  밑: 'under',
  옆: 'beside',
  앞: 'in front of',
  뒤: 'behind',
  안: 'in',
  속: 'inside',
  사이: 'between',
  가운데: 'in the middle of',
  근처: 'near',
  주변: 'around',
};

// ========================================
// 부사 분류 (영어 어순 정렬용)
// manner → frequency → time → place
// ========================================

// 시간 부사 (문장 끝에 위치)
const TIME_ADVERBS_EN = new Set([
  'yesterday',
  'today',
  'tomorrow',
  'now',
  'then',
  'soon',
  'later',
  'already',
  'finally',
  'eventually',
  'this morning',
  'this afternoon',
  'this evening',
  'last night',
  'tonight',
]);

// 양태 부사 (동사 직후에 위치)
const MANNER_ADVERBS_EN = new Set([
  'early',
  'late',
  'fast',
  'slowly',
  'quickly',
  'quietly',
  'loudly',
  'well',
  'badly',
  'carefully',
  'easily',
  'hard',
  'alone',
  'together',
]);

// 한국어 원본 기준 시간 부사
const TIME_ADVERBS_KO = new Set([
  '어제',
  '오늘',
  '내일',
  '지금',
  '방금',
  '아까',
  '이제',
  '곧',
  '드디어',
  '마침내',
  '결국',
]);

// 한국어 원본 기준 양태 부사
const MANNER_ADVERBS_KO = new Set([
  '일찍',
  '늦게',
  '빨리',
  '천천히',
  '조용히',
  '크게',
  '작게',
  '잘',
  '혼자',
  '함께',
  '같이',
  '제대로',
  '정확히',
  '조심스럽게',
  '계속',
  '지속적으로',
]);

function classifyAdverb(
  englishText: string,
  constituent: Constituent,
): 'manner' | 'time' | 'place' | 'other' {
  const lowerText = englishText.toLowerCase().trim();

  // 영어 번역 기준으로 분류
  if (TIME_ADVERBS_EN.has(lowerText)) return 'time';
  if (MANNER_ADVERBS_EN.has(lowerText)) return 'manner';

  // 영어에 시간 표현이 포함되어 있으면 time
  if (/\b(morning|afternoon|evening|night|day|week|month|year)\b/.test(lowerText)) return 'time';

  // 한국어 원본 기준으로 분류
  const koStem = constituent.tokens[0]?.stem || '';
  if (TIME_ADVERBS_KO.has(koStem)) return 'time';
  if (MANNER_ADVERBS_KO.has(koStem)) return 'manner';

  // 장소 표현 (전치사로 시작하는 경우)
  if (/^(at|in|on|to|from|near|by)\s/.test(lowerText)) return 'place';

  return 'other';
}

// ========================================
// 성분(Constituent) → 영어 변환
// ========================================
function translateConstituent(
  constituent: Constituent,
  addArticle: boolean = false,
  isSubject: boolean = false,
  verbInfo?: { stem: string; english: string },
): string {
  const parts: string[] = [];

  // 위치 표현 부사구 특별 처리: "책상 위에" → "on the desk"
  // 마지막 토큰이 위치 명사(위/아래/앞 등) + 조사 '에'인 경우
  const lastToken = constituent.tokens[constituent.tokens.length - 1];
  if (
    constituent.role === 'adverbial' &&
    lastToken?.particle === '에' &&
    LOCATION_NOUN_TO_PREPOSITION[lastToken.stem]
  ) {
    const preposition = LOCATION_NOUN_TO_PREPOSITION[lastToken.stem];
    // 위치 명사 앞의 모든 토큰을 번역 (장소 명사들)
    const placeTokens = constituent.tokens.slice(0, -1);
    const placeParts: string[] = [];
    for (const token of placeTokens) {
      const translated = koToEnWords[token.stem] || token.stem;
      placeParts.push(translated);
    }
    const placeText = placeParts.join(' ');
    // "on the desk" 형태로 조합 (정관사 추가)
    return `${preposition} the ${placeText}`;
  }

  for (const token of constituent.tokens) {
    // 부정 부사(안, 못)는 건너뛰기 - 동사 활용에서 처리됨
    if (
      token.stem === '안' ||
      token.stem === '못' ||
      token.original === '안' ||
      token.original === '못'
    ) {
      continue;
    }
    const translated = translateToken(token, verbInfo);
    parts.push(translated);
  }

  let result = parts.join(' ');

  // 관사 추가 (목적어 등)
  if (addArticle && constituent.role === 'object') {
    const headToken = constituent.tokens[constituent.headIndex];
    if (headToken && headToken.pos === 'noun') {
      const article = selectArticle(result, false);
      result = article + result;
    }
  }

  // 주어에서 정관사가 필요한 명사 처리 (the weather, the sun 등)
  if (isSubject) {
    const words = result.toLowerCase().split(' ');
    const lastWord = words[words.length - 1] ?? '';
    if (DEFINITE_ARTICLE_NOUNS.has(lastWord) && !result.toLowerCase().startsWith('the ')) {
      // 앞에 수식어가 있으면 수식어 뒤에 the 삽입
      if (words.length > 1) {
        words.splice(words.length - 1, 0, 'the');
        result = words.join(' ');
      } else {
        result = `the ${result}`;
      }
    }
  }

  return result;
}

// ========================================
// 기본 주어 추론
// ========================================
function inferSubject(parsed: ParsedSentence): string {
  // 의문문에서 주어 생략 시 → you (상대방에게 묻는 것)
  if (parsed.isQuestion) {
    return 'you';
  }

  // 존칭 어미가 있으면 → you (상대방)
  const predicateToken = parsed.predicate?.tokens[0];
  if (predicateToken?.isHonorable) {
    return 'you';
  }

  // 기본값: I
  return 'I';
}

// ========================================
// 형용사 목록 (be + adj 패턴 적용)
// ========================================
const ADJECTIVES = new Set([
  // 기본 형용사
  'good',
  'bad',
  'big',
  'small',
  'many',
  'few',
  'new',
  'old',
  'fast',
  'slow',
  'easy',
  'difficult',
  'expensive',
  'cheap',
  'delicious',
  'pretty',
  'beautiful',
  'cool',
  'cute',
  'hot',
  'cold',
  'warm',
  'high',
  'low',
  'long',
  'short',
  'wide',
  'narrow',
  'heavy',
  'light',
  'bright',
  'dark',
  'clean',
  'dirty',
  'fun',
  'boring',
  'tired',
  'hungry',
  'thirsty',
  'happy',
  'sad',
  'angry',
  'scary',
  'healthy',
  'sick',
  'busy',
  'free',
  'important',
  'same',
  'different',
  'special',
  'ordinary',
  'unique',
  'amazing',
  'surprising',
  'convenient',
  'inconvenient',
  'famous',
  'popular',
  'safe',
  'dangerous',
  'complicated',
  'simple',
  'accurate',
  'uncertain',
  // 날씨/상태
  'nice',
  'fine',
  'great',
  'wonderful',
  'terrible',
  'awful',
]);

// 한국어 형용사 어간 목록
const KOREAN_ADJECTIVES = new Set([
  '좋',
  '나쁘',
  '크',
  '작',
  '많',
  '적',
  '새롭',
  '오래되',
  '빠르',
  '느리',
  '쉬우',
  '쉽',
  '어렵',
  '비싸',
  '싸',
  '맛있',
  '맛없',
  '예쁘',
  '아름답',
  '멋있',
  '귀엽',
  '덥',
  '춥',
  '따뜻하',
  '시원하',
  '높',
  '낮',
  '길',
  '짧',
  '넓',
  '좁',
  '무겁',
  '가볍',
  '밝',
  '어두',
  '깨끗하',
  '더럽',
  '재미있',
  '재미없',
  '피곤하',
  '배고프',
  '목마르',
  '기쁘',
  '슬프',
  '화나',
  '무섭',
  '행복하',
  '건강하',
  '아프',
  '바쁘',
  '한가하',
  '중요하',
  '같',
  '다르',
  '특별하',
  '평범하',
  '독특하',
  '신기하',
  '놀랍',
  '편리하',
  '불편하',
  '유명하',
  '인기있',
  '안전하',
  '위험하',
  '복잡하',
  '간단하',
  '정확하',
  '불확실하',
]);

// 형용사 여부 판단
function isAdjective(stem: string, englishWord: string): boolean {
  return KOREAN_ADJECTIVES.has(stem) || ADJECTIVES.has(englishWord.toLowerCase());
}

// ========================================
// 명사+하다 복합동사 (Noun + 하다 → single English verb)
// 운동을 했니? → Did you exercise? (not "Did you do an exercise?")
// ========================================
const NOUN_HADA_COMPOUND_VERBS: Record<string, string> = {
  // 기본 동작
  운동: 'exercise',
  공부: 'study',
  일: 'work',
  요리: 'cook',
  청소: 'clean',
  쇼핑: 'shop',
  수영: 'swim',
  조깅: 'jog',
  산책: 'walk',
  여행: 'travel',
  춤: 'dance',
  노래: 'sing',
  전화: 'call',
  문자: 'text',
  이메일: 'email',
  검색: 'search',
  클릭: 'click',
  드라이브: 'drive',
  사인: 'sign',
  서명: 'sign',
  축하: 'congratulate',
  인사: 'greet',
  감사: 'thank',
  사과: 'apologize',
  휴식: 'rest',
  // Level 2 취업/학업 관련
  졸업: 'graduate',
  취업: 'get employed',
  지원: 'apply',
  면접: 'interview',
  합격: 'pass',
  불합격: 'fail',
  준비: 'prepare',
  도전: 'challenge',
  적응: 'adapt',
  포기: 'give up',
  연습: 'practice',
  향상: 'improve',
  소통: 'communicate',
  출근: 'go to work',
  퇴근: 'leave work',
};

// ========================================
// 명사+가다/오다 복합표현 (go/come + Verb-ing)
// 쇼핑 가다 → go shopping, 여행 가다 → go traveling
// ========================================
const NOUN_GO_COMPOUND_VERBS: Record<string, string> = {
  쇼핑: 'shopping',
  여행: 'traveling',
  수영: 'swimming',
  조깅: 'jogging',
  산책: 'walking',
  하이킹: 'hiking',
  등산: 'hiking',
  낚시: 'fishing',
  스키: 'skiing',
  캠핑: 'camping',
  피크닉: 'for a picnic',
  소풍: 'on a picnic',
  드라이브: 'for a drive',
  데이트: 'on a date',
  외출: 'out',
};

// ========================================
// 의문문 보조동사 선택 (Do/Did/Does)
// ========================================
function selectAuxiliaryVerb(tense: Tense, subject: string): string {
  const subjectLower = subject.toLowerCase();
  const isThirdPerson =
    subjectLower !== 'i' &&
    subjectLower !== 'you' &&
    subjectLower !== 'we' &&
    subjectLower !== 'they';

  if (tense === 'past') {
    return 'Did';
  }
  if (tense === 'present') {
    return isThirdPerson ? 'Does' : 'Do';
  }
  if (tense === 'future') {
    return 'Will';
  }
  // progressive는 be동사 도치
  return isThirdPerson ? 'Is' : 'Are';
}

// ========================================
// 추측 의문문 생성 (Level 2)
// ~했을까? → "Did ... really ...?" / "Could it be that ...?"
// ========================================
function generateSpeculativeQuestion(
  parsed: ParsedSentence,
  subjectEn: string,
  verbEn: string,
  verbStem: string,
): string {
  const parts: string[] = [];

  // 접속사 (하지만, 그런데 등)를 문장 앞에 배치
  const CONJUNCTIONS_KO = new Set(['하지만', '그러나', '그런데', '그리고', '또한', '그래서']);
  let leadingConjunction = '';
  for (const adv of parsed.adverbials) {
    const token = adv.tokens[0];
    if (token && CONJUNCTIONS_KO.has(token.stem)) {
      leadingConjunction = koToEnWords[token.stem] || '';
      break;
    }
  }
  // modifiers에서도 접속사 찾기
  if (!leadingConjunction) {
    for (const mod of parsed.modifiers) {
      for (const token of mod.tokens) {
        if (CONJUNCTIONS_KO.has(token.stem)) {
          leadingConjunction = koToEnWords[token.stem] || '';
          break;
        }
      }
      if (leadingConjunction) break;
    }
  }

  // 의문사 (왜, 어떻게, 언제 등)를 찾기
  const INTERROGATIVES_KO = new Set(['왜', '어떻게', '언제', '어디서', '누가', '뭐', '뭘']);
  let interrogative = '';
  for (const mod of parsed.modifiers) {
    for (const token of mod.tokens) {
      if (INTERROGATIVES_KO.has(token.stem) || INTERROGATIVES_KO.has(token.original)) {
        interrogative = koToEnWords[token.stem] || koToEnWords[token.original] || '';
        break;
      }
    }
    if (interrogative) break;
  }
  // tokens에서도 의문사 찾기 (modifiers에 없을 경우)
  if (!interrogative) {
    for (const token of parsed.tokens) {
      if (INTERROGATIVES_KO.has(token.stem) || INTERROGATIVES_KO.has(token.original)) {
        interrogative = koToEnWords[token.stem] || koToEnWords[token.original] || '';
        break;
      }
    }
  }

  // 접속사가 있으면 먼저 추가
  if (leadingConjunction) {
    parts.push(leadingConjunction.charAt(0).toUpperCase() + leadingConjunction.slice(1));
  }

  // 의문사가 있으면 "Why did...?" 패턴 사용
  if (interrogative) {
    parts.push(interrogative);
    const aux = selectAuxiliaryVerb(parsed.tense, subjectEn);
    parts.push(aux.toLowerCase());
    parts.push(subjectEn.toLowerCase());

    // 계속 → keep + V-ing 패턴 확인
    const hasKeep = parsed.tokens.some((t) => t.stem === '계속' || t.original === '계속');
    if (hasKeep) {
      parts.push('keep');
      // 동사를 -ing 형태로 변환
      const verbIng = verbEn.endsWith('e') ? `${verbEn.slice(0, -1)}ing` : `${verbEn}ing`;
      parts.push(verbIng);
    } else {
      parts.push(verbEn);
    }

    const result = `${parts.join(' ')}?`;
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  // 부정 추측: ~건 아닐까? / ~이 아닐까? → "Could it be that ... not ...?"
  if (parsed.isNegative) {
    parts.push('Could it be that');
    // 주어가 3인칭 단수면 "he/she/it", 아니면 원래 주어
    const subjectLower = subjectEn.toLowerCase();
    const isThirdPerson = !['i', 'you', 'we', 'they'].includes(subjectLower);

    if (isThirdPerson) {
      parts.push(subjectLower === 'he' || subjectLower === 'she' ? subjectLower : 'it');
    } else {
      parts.push(subjectLower);
    }

    // 동사 부정형: "was not", "didn't"
    if (parsed.tense === 'past') {
      parts.push("didn't");
      parts.push(verbEn);
    } else {
      parts.push("doesn't");
      parts.push(verbEn);
    }
  } else {
    // 긍정 추측: ~했을까? → "Did ... really ...?"
    const aux = selectAuxiliaryVerb(parsed.tense, subjectEn);
    parts.push(aux);
    parts.push(subjectEn.toLowerCase());

    // 정도/추측 부사 추가 (정말, 진짜 → really; 아마 → probably)
    const DEGREE_ADVERBS_KO_SET = new Set(['정말', '진짜', '정말로', '진짜로']);
    const PROBABILITY_ADVERBS_KO = new Set(['아마', '아마도', '혹시', '어쩌면']);
    const usedModifierIndices = new Set<number>();

    // modifiers에서 정도/추측 부사 찾기
    for (let i = 0; i < parsed.modifiers.length; i++) {
      const mod = parsed.modifiers[i];
      for (const token of mod.tokens) {
        if (DEGREE_ADVERBS_KO_SET.has(token.stem)) {
          parts.push('really');
          usedModifierIndices.add(i);
        } else if (
          PROBABILITY_ADVERBS_KO.has(token.stem) ||
          PROBABILITY_ADVERBS_KO.has(token.original)
        ) {
          const probEn = koToEnWords[token.stem] || koToEnWords[token.original] || '';
          if (probEn) {
            parts.push(probEn);
            usedModifierIndices.add(i);
          }
        }
      }
    }

    // adverbials에서도 찾기
    const hasReallyAdverbial = parsed.adverbials.some((adv) => {
      const token = adv.tokens[0];
      return token && DEGREE_ADVERBS_KO_SET.has(token.stem);
    });
    if (hasReallyAdverbial) {
      parts.push('really');
    }

    // 명사+하다 복합동사 처리
    let finalVerbEn = verbEn;
    let compoundObjectSuffix = '';

    if (verbStem === '하' && parsed.object) {
      const objectToken = parsed.object.tokens[0];
      const objectStem = objectToken?.stem || '';
      const compoundVerb = NOUN_HADA_COMPOUND_VERBS[objectStem];
      if (compoundVerb) {
        finalVerbEn = compoundVerb;

        // 복합 목적어 패턴: 취업 + 준비 → prepare for employment
        if (objectStem === '준비' || objectStem === '연습') {
          for (let i = 0; i < parsed.modifiers.length; i++) {
            const mod = parsed.modifiers[i];
            const modToken = mod?.tokens[0];
            const modStem = modToken?.stem || '';
            const modEn = koToEnWords[modStem] || koToEnWords[modToken?.original || ''];
            if (modEn && !DEGREE_ADVERBS_KO_SET.has(modStem)) {
              compoundObjectSuffix = `for ${modEn}`;
              usedModifierIndices.add(i);
              break;
            }
          }
        }
      }
    }

    // 방법 부사 추가 (제대로 → properly)
    const MANNER_ADVS_KO = new Set([
      '제대로',
      '제대',
      '정확히',
      '조심스럽게',
      '계속',
      '지속적으로',
    ]);
    for (const adv of parsed.adverbials) {
      const advToken = adv.tokens[0];
      if (
        advToken &&
        (MANNER_ADVS_KO.has(advToken.stem) || MANNER_ADVS_KO.has(advToken.original))
      ) {
        const advEn = koToEnWords[advToken.original] || koToEnWords[advToken.stem] || advToken.stem;
        if (advEn && advEn !== advToken.stem && advEn !== advToken.original) {
          parts.push(advEn);
        }
      }
    }

    parts.push(finalVerbEn);

    // 복합 목적어 접미사 추가
    if (compoundObjectSuffix) {
      parts.push(compoundObjectSuffix);
    }
  }

  // 목적어 추가 (복합동사로 처리되지 않은 경우)
  // 복합동사 처리 변수가 이 스코프에서 접근 가능하지 않으므로 재확인
  let shouldSkipObject = false;
  if (verbStem === '하' && parsed.object) {
    const objectToken = parsed.object.tokens[0];
    const objectStem = objectToken?.stem || '';
    const compoundVerb = NOUN_HADA_COMPOUND_VERBS[objectStem];
    if (compoundVerb) {
      shouldSkipObject = true;
    }
  }

  if (parsed.object && !shouldSkipObject) {
    const objectToken = parsed.object.tokens[0];
    if (objectToken) {
      const objectEn = koToEnWords[objectToken.stem] || objectToken.stem;
      // 동사에 따른 전치사 추가
      const prep = VERBS_WITH_OBJECT_PREPOSITION[verbEn.toLowerCase()];
      if (prep) {
        parts.push(prep);
      }
      // 관사 추가
      const article = selectArticle(objectEn, false);
      parts.push(article + objectEn);
    }
  }

  // 부사어 추가 (시간, 장소 등) - 정도 부사와 방법 부사는 이미 위에서 추가됨
  const verbInfo = { stem: verbStem, english: verbEn };
  const DEGREE_ADVERBS_KO = new Set(['정말', '진짜', '정말로', '진짜로']);
  const MANNER_ADVS_KO_SKIP = new Set([
    '제대로',
    '제대',
    '정확히',
    '조심스럽게',
    '계속',
    '지속적으로',
  ]);
  const QUANTITY_ADJECTIVES_KO = new Set(['여러', '많은', '몇', '수십', '수백', '다양한']);
  const PROBABILITY_ADVERBS_SKIP = new Set(['아마', '아마도', '혹시', '어쩌면']);

  // modifiers에서 수량 형용사 찾기 (여러 회사 → several companies)
  let quantityAdjective = '';
  for (const mod of parsed.modifiers) {
    for (const token of mod.tokens) {
      if (QUANTITY_ADJECTIVES_KO.has(token.stem) || QUANTITY_ADJECTIVES_KO.has(token.original)) {
        quantityAdjective = koToEnWords[token.stem] || koToEnWords[token.original] || '';
        break;
      }
    }
    if (quantityAdjective) break;
  }

  for (const adv of parsed.adverbials) {
    const firstToken = adv.tokens[0];
    // 이미 처리된 부사는 건너뛰기 (stem과 original 모두 확인)
    if (
      firstToken &&
      (DEGREE_ADVERBS_KO.has(firstToken.stem) ||
        DEGREE_ADVERBS_KO.has(firstToken.original) ||
        MANNER_ADVS_KO_SKIP.has(firstToken.stem) ||
        MANNER_ADVS_KO_SKIP.has(firstToken.original) ||
        PROBABILITY_ADVERBS_SKIP.has(firstToken.stem) ||
        PROBABILITY_ADVERBS_SKIP.has(firstToken.original))
    ) {
      continue;
    }

    // 수량 형용사가 있으면 명사에 적용 (여러 + 회사 → several companies)
    if (quantityAdjective && firstToken) {
      const nounEn =
        koToEnWords[firstToken.stem] || koToEnWords[firstToken.original] || firstToken.stem;
      // 복수형 처리 (간단히 's' 추가)
      const pluralNoun = nounEn.endsWith('y') ? `${nounEn.slice(0, -1)}ies` : `${nounEn}s`;
      // 전치사 추가
      const prep = firstToken.particle === '에' ? 'to' : '';
      parts.push(
        prep ? `${prep} ${quantityAdjective} ${pluralNoun}` : `${quantityAdjective} ${pluralNoun}`,
      );
      quantityAdjective = ''; // 한 번만 사용
    } else {
      const advEn = translateConstituent(adv, false, false, verbInfo);
      parts.push(advEn);
    }
  }

  let result = parts.join(' ');
  result = result.charAt(0).toUpperCase() + result.slice(1);
  result = result.replace(/\s+/g, ' ').trim();
  if (!result.endsWith('?')) {
    result += '?';
  }

  return result;
}

// ========================================
// 조건문 생성 (Level 2)
// 만약 ~했다면 → "If ... had ..." / "If ... hadn't ..."
// ========================================
function generateConditionalClause(
  parsed: ParsedSentence,
  subjectEn: string,
  verbEn: string,
  verbStem: string,
): string {
  const parts: string[] = [];

  // 과거 조건: ~했다면 → "If ... had ..."
  if (parsed.tense === 'past') {
    if (parsed.isNegative) {
      // 부정 조건: ~하지 않았다면 → "If ... hadn't ..."
      parts.push('If');
      parts.push(subjectEn.toLowerCase());
      parts.push("hadn't");
      // 과거분사
      const pastParticiple =
        IRREGULAR_VERBS[verbEn.toLowerCase()]?.pastParticiple || getPastTense(verbEn);
      parts.push(pastParticiple);
    } else {
      // 긍정 조건: ~했다면 → "If ... had ..."
      parts.push('If');
      parts.push(subjectEn.toLowerCase());
      parts.push('had');
      // 과거분사
      const pastParticiple =
        IRREGULAR_VERBS[verbEn.toLowerCase()]?.pastParticiple || getPastTense(verbEn);
      parts.push(pastParticiple);
    }
  } else {
    // 현재 조건: ~한다면 → "If ... ..."
    parts.push('If');
    parts.push(subjectEn.toLowerCase());
    if (parsed.isNegative) {
      parts.push("doesn't");
      parts.push(verbEn);
    } else {
      parts.push(`${verbEn}s`);
    }
  }

  // 목적어 추가
  if (parsed.object) {
    const objectToken = parsed.object.tokens[0];
    if (objectToken) {
      const objectEn = koToEnWords[objectToken.stem] || objectToken.stem;
      const prep = VERBS_WITH_OBJECT_PREPOSITION[verbEn.toLowerCase()];
      if (prep) {
        parts.push(prep);
      }
      parts.push(objectEn);
    }
  }

  // 부사어 추가
  const verbInfo = { stem: verbStem, english: verbEn };
  for (const adv of parsed.adverbials) {
    const advEn = translateConstituent(adv, false, false, verbInfo);
    parts.push(advEn);
  }

  let result = parts.join(' ');
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

// ========================================
// 가정법 생성 (Level 2)
// ~했을 텐데 → "would have ..."
// ~하지 못했을 거야 → "wouldn't have been able to ..."
// ========================================
function generateHypotheticalClause(
  parsed: ParsedSentence,
  subjectEn: string,
  verbEn: string,
  verbStem: string,
): string {
  const parts: string[] = [];

  parts.push(subjectEn);

  if (parsed.isNegative) {
    // 부정 가정: ~하지 못했을 거야 → "wouldn't have been able to ..."
    if (parsed.negationType === 'could_not') {
      parts.push("wouldn't have been able to");
      parts.push(verbEn);
    } else {
      parts.push("wouldn't have");
      const pastParticiple =
        IRREGULAR_VERBS[verbEn.toLowerCase()]?.pastParticiple || getPastTense(verbEn);
      parts.push(pastParticiple);
    }
  } else {
    // 긍정 가정: ~했을 텐데 → "would have ..."
    parts.push('would have');
    const pastParticiple =
      IRREGULAR_VERBS[verbEn.toLowerCase()]?.pastParticiple || getPastTense(verbEn);
    parts.push(pastParticiple);
  }

  // 목적어 추가
  if (parsed.object) {
    const objectToken = parsed.object.tokens[0];
    if (objectToken) {
      const objectEn = koToEnWords[objectToken.stem] || objectToken.stem;
      const prep = VERBS_WITH_OBJECT_PREPOSITION[verbEn.toLowerCase()];
      if (prep) {
        parts.push(prep);
      }
      parts.push(objectEn);
    }
  }

  // 부사어 추가
  const verbInfo = { stem: verbStem, english: verbEn };
  for (const adv of parsed.adverbials) {
    const advEn = translateConstituent(adv, false, false, verbInfo);
    parts.push(advEn);
  }

  let result = parts.join(' ');
  result = result.charAt(0).toUpperCase() + result.slice(1);
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

// ========================================
// 영어 생성 결과 타입
// ========================================
export interface GenerateEnglishResult {
  translation: string;
  detectedSubject: string; // 이 문장에서 명시된 주어 (다음 문장에 전달용)
}

// ========================================
// 메인 생성 함수: 한국어 문장 → 영어 문장
// ========================================
/**
 * 영어 문장 생성
 * @param parsed 파싱된 문장 구조
 * @param contextSubject 복수 문장에서 이전 문장의 주어 (문맥 주어)
 * @returns 생성된 영어 문장과 탐지된 주어
 */
export function generateEnglish(
  parsed: ParsedSentence,
  contextSubject?: string,
): GenerateEnglishResult {
  const parts: string[] = [];

  // 사용된 modifier 추적 (go shopping 등의 복합표현에서 사용된 것 제외)
  const usedModifierIndices = new Set<number>();

  // ========================================
  // 순수 감탄문 처리: predicate가 없는 문장
  // 예: "야 진짜 대박!" → "OMG!"
  // 이 경우 주어를 추론하지 않고, 감탄사와 부사만 조합
  // ========================================
  if (!parsed.predicate && parsed.subjectOmitted) {
    // 모든 토큰의 stem을 수집 (복합 표현 감지용)
    const allStems: string[] = [];
    for (const mod of parsed.modifiers) {
      for (const token of mod.tokens) {
        allStems.push(token.stem);
      }
    }
    for (const adv of parsed.adverbials) {
      for (const token of adv.tokens) {
        allStems.push(token.stem);
      }
    }

    // 복합 감탄 표현 매핑 (우선순위: 긴 표현 먼저)
    const COMPOUND_EXCLAMATIONS: Record<string, string> = {
      '진짜 대박': 'OMG',
      '완전 대박': 'OMG',
      대박: 'OMG',
    };

    // 호출어 (감탄사 앞에서 생략 가능)
    const VOCATIVES = new Set(['야', '어이', '얘', '이봐']);

    // 복합 표현 확인
    const stemsText = allStems.join(' ');
    let exclamation = '';

    // 복합 표현 매칭 (긴 표현 우선)
    const sortedCompounds = Object.entries(COMPOUND_EXCLAMATIONS).sort(
      ([a], [b]) => b.length - a.length,
    );
    for (const [pattern, translation] of sortedCompounds) {
      if (stemsText.includes(pattern)) {
        exclamation = translation;
        break;
      }
    }

    // 복합 표현이 없으면 개별 번역
    if (!exclamation) {
      const exclamationParts: string[] = [];

      for (const mod of parsed.modifiers) {
        const modEn = translateConstituent(mod);
        if (modEn?.trim()) {
          exclamationParts.push(modEn);
        }
      }

      for (const adv of parsed.adverbials) {
        const advEn = translateConstituent(adv);
        if (advEn?.trim()) {
          exclamationParts.push(advEn);
        }
      }

      exclamation = exclamationParts.join(' ');
    } else {
      // 복합 표현이 있으면 호출어(야 등)만 앞에 추가
      const vocativeParts: string[] = [];
      for (const mod of parsed.modifiers) {
        for (const token of mod.tokens) {
          if (VOCATIVES.has(token.stem)) {
            // 호출어는 OMG 앞에서 생략 (자연스러운 영어)
            // 대신 OMG만 사용
          }
        }
      }
      // vocativeParts가 있으면 앞에 추가
      if (vocativeParts.length > 0) {
        exclamation = `${vocativeParts.join(' ')} ${exclamation}`;
      }
    }

    // 결과가 있으면 감탄문으로 반환
    if (exclamation.trim()) {
      // 첫 글자 대문자
      exclamation = exclamation.charAt(0).toUpperCase() + exclamation.slice(1);
      // 느낌표 추가
      if (!exclamation.endsWith('!') && !exclamation.endsWith('?')) {
        exclamation += '!';
      }
      return { translation: exclamation.trim(), detectedSubject: '' };
    }
  }

  // 1. 주어 결정
  let subjectEn: string;
  let detectedSubject = ''; // 이 문장에서 명시된 주어 (다음 문장에 전달용)

  if (parsed.subjectOmitted) {
    // 주어가 생략된 경우: 문맥 주어가 있으면 우선 사용
    if (contextSubject) {
      subjectEn = contextSubject;
    } else {
      subjectEn = inferSubject(parsed);
    }
  } else if (parsed.subject) {
    subjectEn = translateConstituent(parsed.subject, false, true); // isSubject = true
    detectedSubject = subjectEn; // 명시된 주어 저장
    // 대명사가 아닌 경우 대문자로 시작
    if (!['I', 'you', 'he', 'she', 'it', 'we', 'they'].includes(subjectEn.toLowerCase())) {
      subjectEn = subjectEn.charAt(0).toUpperCase() + subjectEn.slice(1);
    }
  } else {
    subjectEn = 'I';
  }

  // ========================================
  // Level 2: 조건문 처리 (만약 ~했다면)
  // 조건문은 의문문보다 먼저 처리 (If절은 의문문이 아님)
  // ========================================
  if (parsed.isConditional && !parsed.isQuestion && parsed.predicate) {
    const predicateToken = parsed.predicate.tokens[0];
    const verbStem = predicateToken?.stem || '';
    let verbEn = koToEnWords[verbStem] || verbStem;

    // 복합동사 처리: 졸업하 → graduate
    if (verbStem.endsWith('하') && verbStem.length > 1) {
      const nounPart = verbStem.slice(0, -1);
      const compoundVerb = NOUN_HADA_COMPOUND_VERBS[nounPart];
      if (compoundVerb) {
        verbEn = compoundVerb;
      }
    }

    return {
      translation: generateConditionalClause(parsed, subjectEn, verbEn, verbStem),
      detectedSubject,
    };
  }

  // ========================================
  // Level 2: 가정법 처리 (~했을 텐데, ~했을 거야)
  // ========================================
  if (parsed.isHypothetical && !parsed.isQuestion && parsed.predicate) {
    const predicateToken = parsed.predicate.tokens[0];
    const verbStem = predicateToken?.stem || '';
    let verbEn = koToEnWords[verbStem] || verbStem;

    // 복합동사 처리
    if (verbStem.endsWith('하') && verbStem.length > 1) {
      const nounPart = verbStem.slice(0, -1);
      const compoundVerb = NOUN_HADA_COMPOUND_VERBS[nounPart];
      if (compoundVerb) {
        verbEn = compoundVerb;
      }
    }

    return {
      translation: generateHypotheticalClause(parsed, subjectEn, verbEn, verbStem),
      detectedSubject,
    };
  }

  // ========================================
  // 의문문 처리: Do/Did + Subject + base verb
  // Level 2 추측 의문문: Did ... really? / Could it be that ...?
  // ========================================
  if (parsed.isQuestion && parsed.predicate) {
    // Level 2: 추측 의문문 (~했을까?)
    if (parsed.isSpeculative) {
      const predicateToken = parsed.predicate.tokens[0];
      const verbStem = predicateToken?.stem || '';
      let verbEn = koToEnWords[verbStem] || verbStem;

      // 복합동사 처리
      if (verbStem.endsWith('하') && verbStem.length > 1) {
        const nounPart = verbStem.slice(0, -1);
        const compoundVerb = NOUN_HADA_COMPOUND_VERBS[nounPart];
        if (compoundVerb) {
          verbEn = compoundVerb;
        }
      }

      return {
        translation: generateSpeculativeQuestion(parsed, subjectEn, verbEn, verbStem),
        detectedSubject,
      };
    }

    // 기존 의문문 처리 (Level 1)
    const predicateToken = parsed.predicate.tokens[0];
    const verbStem = predicateToken?.stem || '';
    let verbEn = koToEnWords[verbStem] || verbStem;

    // 복합동사 처리: 졸업하 → graduate (명사+하다 패턴)
    // verbStem이 '하'로 끝나는 경우, 앞부분도 확인
    if (verbStem.endsWith('하') && verbStem.length > 1) {
      const nounPart = verbStem.slice(0, -1);
      const compoundVerb = NOUN_HADA_COMPOUND_VERBS[nounPart];
      if (compoundVerb) {
        verbEn = compoundVerb;
      } else {
        // 사전에서 직접 검색
        const fullVerbEn = koToEnWords[verbStem];
        if (fullVerbEn) {
          verbEn = fullVerbEn;
        }
      }
    }

    // 형용사인 경우 be동사 의문문: Is/Was + Subject + adjective?
    if (isAdjective(verbStem, verbEn) && !parsed.object) {
      const beAux = parsed.tense === 'past' ? 'Was' : 'Is';
      const subjectLower = subjectEn.toLowerCase();
      // I, we, you, they → Are/Were
      if (['i', 'we', 'you', 'they'].includes(subjectLower)) {
        const beAuxPlural = parsed.tense === 'past' ? 'Were' : 'Are';
        parts.push(beAuxPlural);
      } else {
        parts.push(beAux);
      }
      parts.push(subjectEn.toLowerCase());
      parts.push(verbEn);

      // 부사어 추가
      const verbInfo = { stem: verbStem, english: verbEn };
      for (const adv of parsed.adverbials) {
        const advEn = translateConstituent(adv, false, false, verbInfo);
        parts.push(advEn);
      }
    } else {
      // 일반 동사 의문문: Do/Did/Does + Subject + (really) + base verb?
      const aux = selectAuxiliaryVerb(parsed.tense, subjectEn);
      parts.push(aux);
      parts.push(subjectEn.toLowerCase());

      // 정도 부사 (really, probably 등)는 주어 바로 뒤에 위치
      // modifiers 또는 adverbials에서 정도 부사를 찾아서 먼저 추가
      const DEGREE_ADVERBS = new Set(['really', 'truly', 'actually', 'certainly', 'definitely']);
      const DEGREE_ADVERBS_KO = new Set(['정말', '정말로', '진짜', '진짜로', '사실', '확실히']);
      let degreeAdverb = '';
      const usedAdverbialIndices = new Set<number>();

      // 1. modifiers에서 찾기
      for (const mod of parsed.modifiers) {
        const modToken = mod.tokens[0];
        if (modToken) {
          const modEn = koToEnWords[modToken.stem] || koToEnWords[modToken.original] || '';
          if (DEGREE_ADVERBS.has(modEn.toLowerCase())) {
            degreeAdverb = modEn;
            usedModifierIndices.add(parsed.modifiers.indexOf(mod));
            break;
          }
        }
      }

      // 2. adverbials에서 찾기 (정말, 진짜 등 한국어 정도 부사)
      if (!degreeAdverb) {
        for (let i = 0; i < parsed.adverbials.length; i++) {
          const adv = parsed.adverbials[i];
          const advToken = adv?.tokens[0];
          if (advToken && DEGREE_ADVERBS_KO.has(advToken.stem)) {
            const advEn = koToEnWords[advToken.stem] || koToEnWords[advToken.original] || '';
            if (advEn && DEGREE_ADVERBS.has(advEn.toLowerCase())) {
              degreeAdverb = advEn;
              usedAdverbialIndices.add(i);
              break;
            }
          }
        }
      }

      if (degreeAdverb) {
        parts.push(degreeAdverb);
      }

      // 명사+하다 복합동사 확인 (운동을 했니? → Did you exercise?)
      // verbStem이 '하'이고 object가 있으면 복합동사 확인
      let finalVerbEn = verbEn;
      let skipObject = false;
      let goCompoundSuffix = ''; // go shopping, go hiking 등의 suffix
      let compoundObjectSuffix = ''; // "prepare for employment" 등

      if (verbStem === '하' && parsed.object) {
        const objectToken = parsed.object.tokens[0];
        const objectStem = objectToken?.stem || '';
        const compoundVerb = NOUN_HADA_COMPOUND_VERBS[objectStem];
        if (compoundVerb) {
          // 복합동사로 대체: "do" + "exercise" → "exercise"
          finalVerbEn = compoundVerb;
          skipObject = true; // 목적어는 동사에 포함됨

          // 복합 목적어 패턴: modifier + 준비/연습 등 → "prepare for X"
          // 예: 취업(modifier) + 준비(object) + 하다 → "prepare for employment"
          if (objectStem === '준비' || objectStem === '연습') {
            // modifier에서 목적어의 수식어 찾기 (취업, 면접 등)
            for (let i = 0; i < parsed.modifiers.length; i++) {
              const mod = parsed.modifiers[i];
              const modToken = mod?.tokens[0];
              const modStem = modToken?.stem || '';
              // 준비/연습의 대상이 되는 명사인지 확인
              const modEn = koToEnWords[modStem] || koToEnWords[modToken?.original || ''];
              if (modEn && !DEGREE_ADVERBS_KO.has(modStem)) {
                // "prepare for employment", "practice for interview"
                compoundObjectSuffix = `for ${modEn}`;
                usedModifierIndices.add(i);
                break;
              }
            }
          }
        }
      }

      // 명사+가다/오다 복합표현 확인 (쇼핑 갔어? → Did you go shopping?)
      // modifier 또는 adverbial에서 명사를 찾아서 go + Verb-ing 패턴 생성
      if (verbStem === '가' || verbStem === '오') {
        // 1. modifier에서 찾기
        for (let i = 0; i < parsed.modifiers.length; i++) {
          const mod = parsed.modifiers[i];
          const modToken = mod?.tokens[0];
          const modStem = modToken?.stem || '';
          const goCompound = NOUN_GO_COMPOUND_VERBS[modStem];
          if (goCompound) {
            goCompoundSuffix = goCompound;
            usedModifierIndices.add(i);
            break;
          }
        }

        // 2. adverbial에서도 찾기 (주말에 쇼핑 → 주말에+쇼핑이 하나의 adverbial로 묶인 경우)
        if (!goCompoundSuffix) {
          for (const adv of parsed.adverbials) {
            for (const token of adv.tokens) {
              const tokenStem = token.stem || '';
              const goCompound = NOUN_GO_COMPOUND_VERBS[tokenStem];
              if (goCompound) {
                goCompoundSuffix = goCompound;
                // 해당 토큰을 adverbial에서 제거하면 복잡해지므로
                // 나중에 번역 시 중복 체크로 처리
                break;
              }
            }
            if (goCompoundSuffix) break;
          }
        }
      }

      // 동사는 기본형 사용 (Do/Did가 시제 담당)
      parts.push(finalVerbEn);

      // 복합 목적어 접미사 추가 (prepare for employment 등)
      if (compoundObjectSuffix) {
        parts.push(compoundObjectSuffix);
      }

      // go + Verb-ing 패턴 추가
      if (goCompoundSuffix) {
        parts.push(goCompoundSuffix);
      }

      // 목적어 추가 (복합동사가 아닌 경우에만)
      if (parsed.object && !skipObject) {
        const objectEn = translateConstituent(parsed.object, true);
        // 동사에 따른 목적어 전치사 추가
        const objPreposition = VERBS_WITH_OBJECT_PREPOSITION[finalVerbEn.toLowerCase()];
        if (objPreposition) {
          parts.push(objPreposition);
        }
        parts.push(objectEn);
      }

      // 부사어 분류: 방법/정도 부사 vs 시간 표현
      // 영어 어순: Verb + Object + manner adverb + time expression (문장 끝)
      const verbInfo = { stem: verbStem, english: verbEn };
      const mannerAdverbs: string[] = [];
      const timeExpressions: string[] = [];
      const otherAdverbs: string[] = [];

      // go compound에서 사용된 단어 (중복 출력 방지)
      const usedGoCompoundWord = goCompoundSuffix
        ? Object.entries(NOUN_GO_COMPOUND_VERBS).find(([_, v]) => v === goCompoundSuffix)?.[0]
        : null;

      for (let advIdx = 0; advIdx < parsed.adverbials.length; advIdx++) {
        // 이미 정도 부사로 사용된 adverbial은 건너뛰기
        if (usedAdverbialIndices.has(advIdx)) continue;

        const adv = parsed.adverbials[advIdx];
        if (!adv) continue;

        // 각 토큰별로 처리 (go compound 단어는 건너뛰기)
        const filteredTokens: TokenAnalysis[] = [];
        for (const token of adv.tokens) {
          // go compound에 사용된 단어면 건너뛰기
          if (usedGoCompoundWord && token.stem === usedGoCompoundWord) {
            continue;
          }
          filteredTokens.push(token);
        }

        // 필터링된 토큰이 없으면 건너뛰기
        if (filteredTokens.length === 0) continue;

        // 필터링된 토큰으로 번역
        const advParts: string[] = [];
        for (const token of filteredTokens) {
          const tokenEn = translateToken(token, verbInfo);
          if (tokenEn?.trim()) {
            advParts.push(tokenEn);
          }
        }
        const advEn = advParts.join(' ');
        if (!advEn?.trim()) continue;

        // 전체 문자열로 시간 표현인지 먼저 확인 (on the weekend, in the morning 등)
        if (isTimeExpression(advEn)) {
          timeExpressions.push(advEn);
          continue;
        }

        // 단일 단어 분류
        const wordLower = advEn.toLowerCase().trim();

        // 방법/정도 부사인지 확인 (early, late 등)
        if (MANNER_ADVERBS.has(wordLower)) {
          mannerAdverbs.push(advEn);
        }
        // 시간 표현인지 확인 (today, yesterday 등)
        else if (TIME_EXPRESSIONS_NO_PREPOSITION.has(wordLower)) {
          timeExpressions.push(advEn);
        }
        // 기타 부사어
        else if (advEn?.trim()) {
          otherAdverbs.push(advEn);
        }
      }

      // 어순: 방법 부사 → 기타 부사 → 시간 표현 (문장 끝)
      for (const adv of mannerAdverbs) {
        parts.push(adv);
      }
      for (const adv of otherAdverbs) {
        parts.push(adv);
      }
      for (const time of timeExpressions) {
        parts.push(time);
      }
    }

    // 후처리
    let questionSentence = parts.join(' ');
    questionSentence = questionSentence.charAt(0).toUpperCase() + questionSentence.slice(1);
    // a/an 수정: 모음으로 시작하는 단어 앞에 an, 단 uni-, use- 등 예외 제외
    questionSentence = questionSentence.replace(/\ba ([aeiouAEIOU]\w*)/gi, (_match, word) => {
      const wordLower = word.toLowerCase();
      // 발음이 자음으로 시작하는 예외 단어들
      if (A_NOT_AN_WORDS.has(wordLower) || /^uni|^use|^usual/.test(wordLower)) {
        return `a ${word}`;
      }
      return `an ${word}`;
    });
    questionSentence = questionSentence.replace(/\s+/g, ' ').trim();
    if (!questionSentence.endsWith('?')) {
      questionSentence += '?';
    }

    // 문장 앞 수식어 결합 (go shopping 등에서 사용된 modifier 제외)
    const sentenceInitialPhrases: string[] = [];
    for (let i = 0; i < parsed.modifiers.length; i++) {
      if (usedModifierIndices.has(i)) continue; // 이미 사용된 modifier 건너뛰기
      const mod = parsed.modifiers[i];
      if (mod) {
        const modEn = translateConstituent(mod);
        if (modEn?.trim()) {
          sentenceInitialPhrases.push(modEn);
        }
      }
    }

    if (sentenceInitialPhrases.length > 0) {
      const prefix = sentenceInitialPhrases.join(', ');
      const capitalizedPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      return {
        translation: `${capitalizedPrefix}, ${questionSentence}`,
        detectedSubject,
      };
    }

    return { translation: questionSentence, detectedSubject };
  }

  // ========================================
  // 평서문 처리 (기존 로직)
  // ========================================

  // 문장 앞 수식어/독립어 처리 (인사말 등)
  const sentenceInitialPhrases: string[] = [];
  for (const mod of parsed.modifiers) {
    const modEn = translateConstituent(mod);
    if (modEn?.trim()) {
      sentenceInitialPhrases.push(modEn);
    }
  }

  parts.push(subjectEn);

  // 2. 서술어 분석 (SVC 패턴인지 확인)
  const isCopula = parsed.pattern === 'SVC';

  // SVC에서 사용된 부사어 인덱스 추적
  const usedSvcAdverbialIndices = new Set<number>();

  if (isCopula && parsed.predicate) {
    // SVC: 주어 + be동사 + (부사) + (소유격) + 보어
    const beVerb = selectBeVerb(subjectEn, parsed.tense);
    parts.push(beVerb);

    // 정도 부사와 소유격 추출 (보어 앞에 위치)
    const degreeAdverbs: string[] = [];
    let possessive = '';
    const DEGREE_ADVERBS_KO = new Set(['완전', '정말', '진짜', '아주', '매우', '너무']);
    const POSSESSIVES_KO = new Set([
      '내',
      '제',
      '네',
      '니',
      '그의',
      '그녀의',
      '우리',
      '저희',
      '그들의',
    ]);

    for (let advIdx = 0; advIdx < parsed.adverbials.length; advIdx++) {
      const adv = parsed.adverbials[advIdx];
      for (const token of adv.tokens) {
        if (DEGREE_ADVERBS_KO.has(token.stem)) {
          const advEn = koToEnWords[token.stem] || token.stem;
          if (advEn && advEn !== token.stem) {
            degreeAdverbs.push(advEn);
            usedSvcAdverbialIndices.add(advIdx);
          }
        } else if (POSSESSIVES_KO.has(token.stem)) {
          possessive = koToEnWords[token.stem] || token.stem;
          usedSvcAdverbialIndices.add(advIdx);
        }
      }
    }

    // 정도 부사 추가 (be동사 뒤, 보어 앞): "is totally"
    for (const adv of degreeAdverbs) {
      parts.push(adv);
    }

    // 보어 (서술격 조사 앞의 명사)
    const predicateToken = parsed.predicate.tokens[0];
    if (predicateToken) {
      let complement = koToEnWords[predicateToken.stem] || predicateToken.stem;

      // 소유격이 있으면 관사 없이 소유격 + 보어: "my dream guy"
      if (possessive) {
        parts.push(`${possessive} ${complement}`);
      } else {
        // 고유명사 감지 (첫 글자 대문자로 시작하는 단어)
        const isProperNoun = /^[A-Z]/.test(complement);
        // 보어가 명사면 관사 추가 (고유명사 제외)
        if (!isProperNoun) {
          const article = selectArticle(complement, false);
          complement = article + complement;
        }
        parts.push(complement);
      }
    }
  } else {
    // SVO, SV: 주어 + 동사 + 목적어

    // 3. 동사 번역 및 활용
    if (parsed.predicate) {
      const predicateToken = parsed.predicate.tokens[0];
      const verbStem = predicateToken?.stem || '';
      let verbEn = koToEnWords[verbStem] || verbStem;

      // 형용사 처리: be + adjective
      if (isAdjective(verbStem, verbEn) && !parsed.object) {
        const beVerb = selectBeVerb(subjectEn, parsed.tense);
        parts.push(beVerb);
        parts.push(verbEn);
      }
      // 특수 동사 처리
      else if (verbStem === '있') {
        // 있다 → have/be 결정
        if (parsed.adverbials.length > 0) {
          // 장소 부사어 있으면 "be at"
          verbEn = selectBeVerb(subjectEn, parsed.tense);
        } else if (parsed.object) {
          // 목적어 있으면 "have"
          verbEn = conjugateVerb(
            'have',
            parsed.tense,
            subjectEn,
            parsed.isNegative,
            parsed.negationType,
          );
        } else {
          verbEn = selectBeVerb(subjectEn, parsed.tense);
        }
        parts.push(verbEn);
      } else if (verbStem === '없') {
        // 없다 → don't have / there is no
        if (parsed.object) {
          verbEn = conjugateVerb('have', parsed.tense, subjectEn, true, parsed.negationType);
        } else {
          verbEn = `${selectBeVerb(subjectEn, parsed.tense)} not`;
        }
        parts.push(verbEn);
      } else {
        // 일반 동사
        const conjugated = conjugateVerb(
          verbEn,
          parsed.tense,
          subjectEn,
          parsed.isNegative,
          parsed.negationType,
        );
        parts.push(conjugated);
      }
    }

    // 4. 목적어 추가 (SVO 어순)
    if (parsed.object) {
      const objectEn = translateConstituent(parsed.object, true);

      // 동사에 따른 목적어 전치사 추가 (listen to music, look at the picture 등)
      const predicateTokenForObj = parsed.predicate?.tokens[0];
      const verbStemForObj = predicateTokenForObj?.stem || '';
      const verbEnForObj = koToEnWords[verbStemForObj] || verbStemForObj;
      const objPreposition = VERBS_WITH_OBJECT_PREPOSITION[verbEnForObj.toLowerCase()];

      if (objPreposition) {
        parts.push(objPreposition);
      }

      parts.push(objectEn);
    }
  }

  // 5. 부사어 추가 (동사 정보 전달)
  // 동사 정보 추출 (전치사 결정에 사용)
  const predicateToken = parsed.predicate?.tokens[0];
  const verbStem = predicateToken?.stem || '';
  const verbEnglish = koToEnWords[verbStem] || verbStem;
  const verbInfo = { stem: verbStem, english: verbEnglish };

  // 부사어 번역 및 분류 (영어 어순: manner → frequency → time → place)
  // SVC에서 이미 사용된 부사어는 건너뛰기
  const adverbTranslations: { text: string; type: 'manner' | 'time' | 'place' | 'other' }[] = [];

  for (let advIdx = 0; advIdx < parsed.adverbials.length; advIdx++) {
    if (usedSvcAdverbialIndices.has(advIdx)) continue; // SVC에서 사용된 부사어 건너뛰기
    const adv = parsed.adverbials[advIdx];
    const advEn = translateConstituent(adv, false, false, verbInfo);
    const advType = classifyAdverb(advEn, adv);
    adverbTranslations.push({ text: advEn, type: advType });
  }

  // 영어 어순으로 정렬: manner → other → time → place
  const adverbOrder: Record<string, number> = { manner: 0, other: 1, time: 2, place: 3 };
  adverbTranslations.sort((a, b) => adverbOrder[a.type] - adverbOrder[b.type]);

  for (const adv of adverbTranslations) {
    parts.push(adv.text);
  }

  // 6. 후처리
  let mainSentence = parts.join(' ');

  // 첫 글자 대문자
  mainSentence = mainSentence.charAt(0).toUpperCase() + mainSentence.slice(1);

  // a/an 수정
  mainSentence = mainSentence.replace(/\ba ([aeiouAEIOU])/g, 'an $1');

  // 중복 공백 제거
  mainSentence = mainSentence.replace(/\s+/g, ' ').trim();

  // 의문문이면 물음표 추가
  if (parsed.isQuestion && !mainSentence.endsWith('?')) {
    mainSentence += '?';
  }

  // 7. 문장 앞 수식어와 결합
  if (sentenceInitialPhrases.length > 0) {
    const prefix = sentenceInitialPhrases.join(', ');
    // 접두어 첫 글자 대문자
    const capitalizedPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);

    // 인사말 같은 독립적 표현인지 확인 (대문자로 시작하는 단어가 아닌 경우 = 시간/부사 표현)
    const isSentenceLike = /^(Hello|Hi|Goodbye|Thank|Sorry|Yes|No)/i.test(capitalizedPrefix);

    if (isSentenceLike) {
      // 독립적 표현: 마침표로 분리
      // 본문 첫 글자 대문자 유지
      return {
        translation: `${capitalizedPrefix}. ${mainSentence}`,
        detectedSubject,
      };
    } else {
      // 시간/부사 표현: 쉼표 없이 문장에 합류
      // 메인 문장 첫 글자 소문자
      const mainLower = mainSentence.charAt(0).toLowerCase() + mainSentence.slice(1);
      return {
        translation: `${capitalizedPrefix} ${mainLower}`,
        detectedSubject,
      };
    }
  }

  return { translation: mainSentence, detectedSubject };
}

// ========================================
// 간단한 번역 인터페이스
// ========================================
export function translateKoreanToEnglish(_text: string): string {
  // parseSentence는 외부에서 import 해야 함 (순환 참조 방지)
  // 이 함수는 translator-service에서 사용
  throw new Error('Use translateSentenceAdvanced from translator-service instead');
}
