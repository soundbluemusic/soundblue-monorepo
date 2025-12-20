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
): string {
  const verbLower = verb.toLowerCase();
  const isThirdPerson =
    subject.toLowerCase() !== 'i' &&
    subject.toLowerCase() !== 'you' &&
    subject.toLowerCase() !== 'we' &&
    subject.toLowerCase() !== 'they';

  // 부정문 처리
  if (isNegative) {
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

  // 불특정 단수 → a/an
  if (/^[aeiou]/i.test(noun)) {
    return 'an ';
  }
  return 'a ';
}

// ========================================
// 한국어 토큰 → 영어 단어 변환
// ========================================
function translateToken(token: TokenAnalysis): string {
  const stem = token.stem;

  // 사전에서 검색
  const english = koToEnWords[stem] || koToEnWords[token.original] || stem;

  // 조사에 따른 전치사 추가
  if (token.particle) {
    const particleInfo = PARTICLES[token.particle];
    if (particleInfo?.en) {
      // 전치사가 있는 경우
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
// 성분(Constituent) → 영어 변환
// ========================================
function translateConstituent(
  constituent: Constituent,
  addArticle: boolean = false,
  isSubject: boolean = false,
): string {
  const parts: string[] = [];

  for (const token of constituent.tokens) {
    const translated = translateToken(token);
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
// 메인 생성 함수: 한국어 문장 → 영어 문장
// ========================================
export function generateEnglish(parsed: ParsedSentence): string {
  const parts: string[] = [];

  // 0. 문장 앞 수식어/독립어 처리 (인사말 등)
  const sentenceInitialPhrases: string[] = [];
  for (const mod of parsed.modifiers) {
    const modEn = translateConstituent(mod);
    if (modEn?.trim()) {
      sentenceInitialPhrases.push(modEn);
    }
  }

  // 1. 주어 결정
  let subjectEn: string;
  if (parsed.subjectOmitted) {
    subjectEn = inferSubject(parsed);
  } else if (parsed.subject) {
    subjectEn = translateConstituent(parsed.subject, false, true); // isSubject = true
    // 대명사가 아닌 경우 대문자로 시작
    if (!['I', 'you', 'he', 'she', 'it', 'we', 'they'].includes(subjectEn.toLowerCase())) {
      subjectEn = subjectEn.charAt(0).toUpperCase() + subjectEn.slice(1);
    }
  } else {
    subjectEn = 'I';
  }

  parts.push(subjectEn);

  // 2. 서술어 분석 (SVC 패턴인지 확인)
  const isCopula = parsed.pattern === 'SVC';

  if (isCopula && parsed.predicate) {
    // SVC: 주어 + be동사 + 보어
    const beVerb = selectBeVerb(subjectEn, parsed.tense);
    parts.push(beVerb);

    // 보어 (서술격 조사 앞의 명사)
    const predicateToken = parsed.predicate.tokens[0];
    if (predicateToken) {
      let complement = koToEnWords[predicateToken.stem] || predicateToken.stem;
      // 고유명사 감지 (첫 글자 대문자로 시작하는 단어)
      const isProperNoun = /^[A-Z]/.test(complement);
      // 보어가 명사면 관사 추가 (고유명사 제외)
      if (!isProperNoun) {
        const article = selectArticle(complement, false);
        complement = article + complement;
      }
      parts.push(complement);
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
          verbEn = conjugateVerb('have', parsed.tense, subjectEn, parsed.isNegative);
        } else {
          verbEn = selectBeVerb(subjectEn, parsed.tense);
        }
        parts.push(verbEn);
      } else if (verbStem === '없') {
        // 없다 → don't have / there is no
        if (parsed.object) {
          verbEn = conjugateVerb('have', parsed.tense, subjectEn, true);
        } else {
          verbEn = `${selectBeVerb(subjectEn, parsed.tense)} not`;
        }
        parts.push(verbEn);
      } else {
        // 일반 동사
        const conjugated = conjugateVerb(verbEn, parsed.tense, subjectEn, parsed.isNegative);
        parts.push(conjugated);
      }
    }

    // 4. 목적어 추가 (SVO 어순)
    if (parsed.object) {
      const objectEn = translateConstituent(parsed.object, true);
      parts.push(objectEn);
    }
  }

  // 5. 부사어 추가
  for (const adv of parsed.adverbials) {
    const advEn = translateConstituent(adv);
    parts.push(advEn);
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
      return `${capitalizedPrefix}. ${mainSentence}`;
    } else {
      // 시간/부사 표현: 쉼표 없이 문장에 합류
      // 메인 문장 첫 글자 소문자
      const mainLower = mainSentence.charAt(0).toLowerCase() + mainSentence.slice(1);
      return `${capitalizedPrefix} ${mainLower}`;
    }
  }

  return mainSentence;
}

// ========================================
// 간단한 번역 인터페이스
// ========================================
export function translateKoreanToEnglish(_text: string): string {
  // parseSentence는 외부에서 import 해야 함 (순환 참조 방지)
  // 이 함수는 translator-service에서 사용
  throw new Error('Use translateSentenceAdvanced from translator-service instead');
}
