/**
 * 띄어쓰기 정규화 모듈
 *
 * 최대 매칭 알고리즘 + 조사/어미 패턴을 사용하여
 * 붙어있는 텍스트를 적절히 분리합니다.
 *
 * 한계:
 * - 사전에 없는 단어는 분리 불가
 * - 중의성이 있는 경우 최장 매칭 우선
 * - 100% 정확도는 아님 (추정 70-80%)
 */

import { EN_KO, KO_EN } from './data';

// ============================================
// 한국어 조사/어미 패턴
// ============================================

/** 한국어 조사 목록 (긴 것부터 매칭) */
const KO_PARTICLES = [
  // 복합 조사
  '에서는',
  '으로는',
  '에게는',
  '한테는',
  '으로서',
  '으로써',
  '에서도',
  '으로도',
  // 2글자 조사
  '에서',
  '에게',
  '한테',
  '으로',
  '부터',
  '까지',
  '처럼',
  '보다',
  '만큼',
  '대로',
  '마다',
  '조차',
  '밖에',
  '라고',
  '라는',
  '라면',
  '이라',
  // 1글자 조사
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '에',
  '의',
  '와',
  '과',
  '로',
  '도',
  '만',
  '나',
  '랑',
];

/** 한국어 어미 패턴 (동사/형용사 끝) */
const KO_ENDINGS = [
  // 종결어미
  '습니다',
  '입니다',
  '습니까',
  '입니까',
  '세요',
  '어요',
  '아요',
  '에요',
  '예요',
  '네요',
  '군요',
  '지요',
  '잖아',
  '거든',
  '는데',
  '은데',
  '니까',
  '으니',
  '어서',
  '아서',
  '지만',
  '는다',
  'ㄴ다',
  '었다',
  '았다',
  '겠다',
  '다고',
  '라고',
  '냐고',
  '자고',
  // 연결어미
  '면서',
  '으면',
  '다가',
  '려고',
  '으려',
  '도록',
  '듯이',
  // 짧은 어미
  '고',
  '며',
  '서',
  '니',
  '면',
  '자',
  '게',
  '어',
  '아',
  '지',
  '다',
  '요',
];

/** 복합 표현 (띄어쓰기 없이 인식해야 하는 것들) */
const KO_COMPOUNDS = [
  '배고프',
  '배가고프',
  '배불러',
  '배가부르',
  '목마르',
  '목이마르',
  '졸리',
  '잠이오',
  '하고싶',
  '하기싫',
  '못하겠',
  '잘하겠',
  '안하겠',
];

// ============================================
// 영어 단어 사전 구축
// ============================================

/** 영어 단어 세트 (소문자) */
const EN_WORDS = new Set<string>();

// EN_KO에서 영어 단어 추출
for (const en of Object.keys(EN_KO)) {
  EN_WORDS.add(en.toLowerCase());
}

// 추가 기본 영어 단어
const COMMON_EN_WORDS = [
  // 대명사
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'mine',
  'yours',
  'hers',
  'ours',
  'theirs',
  'myself',
  'yourself',
  'himself',
  'herself',
  'itself',
  'ourselves',
  'themselves',
  // 관사/한정사
  'a',
  'an',
  'the',
  'this',
  'that',
  'these',
  'those',
  'some',
  'any',
  'no',
  'every',
  'each',
  'all',
  'both',
  'few',
  'many',
  'much',
  'most',
  'other',
  'another',
  // be동사/조동사
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'done',
  'will',
  'would',
  'shall',
  'should',
  'can',
  'could',
  'may',
  'might',
  'must',
  // 전치사
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'up',
  'down',
  'out',
  'into',
  'over',
  'under',
  'above',
  'below',
  'between',
  'among',
  'through',
  'during',
  'before',
  'after',
  'about',
  'against',
  'around',
  'behind',
  'beside',
  'beyond',
  'near',
  'off',
  'since',
  'until',
  'upon',
  'within',
  'without',
  // 접속사
  'and',
  'or',
  'but',
  'so',
  'yet',
  'for',
  'nor',
  'if',
  'when',
  'while',
  'because',
  'although',
  'though',
  'unless',
  'since',
  'as',
  'than',
  'that',
  'whether',
  // 부사
  'not',
  'very',
  'really',
  'also',
  'too',
  'just',
  'only',
  'even',
  'still',
  'already',
  'always',
  'never',
  'ever',
  'often',
  'sometimes',
  'usually',
  'now',
  'then',
  'here',
  'there',
  'where',
  'why',
  'how',
  'what',
  'who',
  'which',
  'whose',
  'whom',
  // 기본 동사
  'go',
  'goes',
  'went',
  'gone',
  'going',
  'come',
  'comes',
  'came',
  'coming',
  'get',
  'gets',
  'got',
  'getting',
  'make',
  'makes',
  'made',
  'making',
  'take',
  'takes',
  'took',
  'taken',
  'taking',
  'see',
  'sees',
  'saw',
  'seen',
  'seeing',
  'know',
  'knows',
  'knew',
  'known',
  'knowing',
  'think',
  'thinks',
  'thought',
  'thinking',
  'want',
  'wants',
  'wanted',
  'wanting',
  'use',
  'uses',
  'used',
  'using',
  'find',
  'finds',
  'found',
  'finding',
  'give',
  'gives',
  'gave',
  'given',
  'giving',
  'tell',
  'tells',
  'told',
  'telling',
  'work',
  'works',
  'worked',
  'working',
  'feel',
  'feels',
  'felt',
  'feeling',
  'try',
  'tries',
  'tried',
  'trying',
  'leave',
  'leaves',
  'left',
  'leaving',
  'call',
  'calls',
  'called',
  'calling',
  'need',
  'needs',
  'needed',
  'needing',
  'become',
  'becomes',
  'became',
  'becoming',
  'put',
  'puts',
  'putting',
  'keep',
  'keeps',
  'kept',
  'keeping',
  'let',
  'lets',
  'letting',
  'begin',
  'begins',
  'began',
  'begun',
  'beginning',
  'seem',
  'seems',
  'seemed',
  'seeming',
  'help',
  'helps',
  'helped',
  'helping',
  'show',
  'shows',
  'showed',
  'shown',
  'showing',
  'hear',
  'hears',
  'heard',
  'hearing',
  'play',
  'plays',
  'played',
  'playing',
  'run',
  'runs',
  'ran',
  'running',
  'move',
  'moves',
  'moved',
  'moving',
  'live',
  'lives',
  'lived',
  'living',
  'believe',
  'believes',
  'believed',
  'believing',
  'bring',
  'brings',
  'brought',
  'bringing',
  'happen',
  'happens',
  'happened',
  'happening',
  'write',
  'writes',
  'wrote',
  'written',
  'writing',
  'sit',
  'sits',
  'sat',
  'sitting',
  'stand',
  'stands',
  'stood',
  'standing',
  'lose',
  'loses',
  'lost',
  'losing',
  'pay',
  'pays',
  'paid',
  'paying',
  'meet',
  'meets',
  'met',
  'meeting',
  'learn',
  'learns',
  'learned',
  'learning',
  'change',
  'changes',
  'changed',
  'changing',
  'watch',
  'watches',
  'watched',
  'watching',
  'follow',
  'follows',
  'followed',
  'following',
  'stop',
  'stops',
  'stopped',
  'stopping',
  'speak',
  'speaks',
  'spoke',
  'spoken',
  'speaking',
  'read',
  'reads',
  'reading',
  'spend',
  'spends',
  'spent',
  'spending',
  'grow',
  'grows',
  'grew',
  'grown',
  'growing',
  'open',
  'opens',
  'opened',
  'opening',
  'walk',
  'walks',
  'walked',
  'walking',
  'win',
  'wins',
  'won',
  'winning',
  'teach',
  'teaches',
  'taught',
  'teaching',
  'offer',
  'offers',
  'offered',
  'offering',
  'remember',
  'remembers',
  'remembered',
  'remembering',
  'love',
  'loves',
  'loved',
  'loving',
  'consider',
  'considers',
  'considered',
  'considering',
  'appear',
  'appears',
  'appeared',
  'appearing',
  'buy',
  'buys',
  'bought',
  'buying',
  'wait',
  'waits',
  'waited',
  'waiting',
  'serve',
  'serves',
  'served',
  'serving',
  'die',
  'dies',
  'died',
  'dying',
  'send',
  'sends',
  'sent',
  'sending',
  'expect',
  'expects',
  'expected',
  'expecting',
  'build',
  'builds',
  'built',
  'building',
  'stay',
  'stays',
  'stayed',
  'staying',
  'fall',
  'falls',
  'fell',
  'fallen',
  'falling',
  'cut',
  'cuts',
  'cutting',
  'reach',
  'reaches',
  'reached',
  'reaching',
  'kill',
  'kills',
  'killed',
  'killing',
  'raise',
  'raises',
  'raised',
  'raising',
  'pass',
  'passes',
  'passed',
  'passing',
  'sell',
  'sells',
  'sold',
  'selling',
  'decide',
  'decides',
  'decided',
  'deciding',
  'return',
  'returns',
  'returned',
  'returning',
  'explain',
  'explains',
  'explained',
  'explaining',
  'hope',
  'hopes',
  'hoped',
  'hoping',
  'develop',
  'develops',
  'developed',
  'developing',
  'carry',
  'carries',
  'carried',
  'carrying',
  'break',
  'breaks',
  'broke',
  'broken',
  'breaking',
  'receive',
  'receives',
  'received',
  'receiving',
  'agree',
  'agrees',
  'agreed',
  'agreeing',
  'support',
  'supports',
  'supported',
  'supporting',
  'hit',
  'hits',
  'hitting',
  'produce',
  'produces',
  'produced',
  'producing',
  'eat',
  'eats',
  'ate',
  'eaten',
  'eating',
  'cover',
  'covers',
  'covered',
  'covering',
  'catch',
  'catches',
  'caught',
  'catching',
  'draw',
  'draws',
  'drew',
  'drawn',
  'drawing',
  'choose',
  'chooses',
  'chose',
  'chosen',
  'choosing',
  // 기본 명사
  'time',
  'year',
  'people',
  'way',
  'day',
  'man',
  'woman',
  'child',
  'children',
  'world',
  'life',
  'hand',
  'part',
  'place',
  'case',
  'week',
  'company',
  'system',
  'program',
  'question',
  'work',
  'government',
  'number',
  'night',
  'point',
  'home',
  'water',
  'room',
  'mother',
  'area',
  'money',
  'story',
  'fact',
  'month',
  'lot',
  'right',
  'study',
  'book',
  'eye',
  'job',
  'word',
  'business',
  'issue',
  'side',
  'kind',
  'head',
  'house',
  'service',
  'friend',
  'father',
  'power',
  'hour',
  'game',
  'line',
  'end',
  'member',
  'law',
  'car',
  'city',
  'community',
  'name',
  'president',
  'team',
  'minute',
  'idea',
  'kid',
  'body',
  'information',
  'back',
  'parent',
  'face',
  'others',
  'level',
  'office',
  'door',
  'health',
  'person',
  'art',
  'war',
  'history',
  'party',
  'result',
  'change',
  'morning',
  'reason',
  'research',
  'girl',
  'guy',
  'moment',
  'air',
  'teacher',
  'force',
  'education',
  'food',
  'movie',
  'bank',
  'river',
  'song',
  'love',
  'coffee',
  'music',
  'school',
  'gym',
  'treadmill',
  'minutes',
  'exam',
  'programmer',
  'bugs',
  'code',
  'project',
  'colors',
  'spring',
  'bar',
  'colleagues',
  'beer',
  'problems',
  'software',
  'developer',
  'bug',
  'module',
  'lighthouse',
  'keeper',
  'dark',
  'match',
  'fire',
  'light',
  'pear',
  'ship',
  'horse',
  'words',
  'eyes',
  'snow',
  'stomach',
  'hungry',
  // 기본 형용사
  'good',
  'new',
  'first',
  'last',
  'long',
  'great',
  'little',
  'own',
  'other',
  'old',
  'right',
  'big',
  'high',
  'different',
  'small',
  'large',
  'next',
  'early',
  'young',
  'important',
  'few',
  'public',
  'bad',
  'same',
  'able',
  'happy',
  'sad',
  'angry',
  'stressed',
  'frustrated',
  'tired',
  'lonely',
  'positive',
  'negative',
  'better',
  'best',
  'worse',
  'worst',
  'light',
  'dark',
  'cool',
  'exciting',
  'stressful',
  'confusing',
  'amazing',
  'proud',
  // 기타
  'while',
  'cause',
  'isnt',
  'doesnt',
  'dont',
  'didnt',
  'wont',
  'cant',
  'couldnt',
  'wouldnt',
  'shouldnt',
  'ive',
  'youve',
  'weve',
  'theyve',
  'im',
  'youre',
  'hes',
  'shes',
  'its',
  'were',
  'theyre',
  'aint',
  'gonna',
  'wanna',
  'gotta',
  'kinda',
  'sorta',
  'pretty',
  'finally',
  'actually',
  'basically',
  'seriously',
  'honestly',
  'obviously',
  'probably',
  'maybe',
  'perhaps',
  'definitely',
  'certainly',
  'absolutely',
  'exactly',
  'completely',
  'totally',
  'entirely',
  'rather',
  'quite',
  'somewhat',
  'almost',
  'nearly',
  'hardly',
  'barely',
  'scarcely',
  'anymore',
  'anyway',
  'besides',
  'however',
  'therefore',
  'otherwise',
  'instead',
  'meanwhile',
  'nonetheless',
  'nevertheless',
  'furthermore',
  'moreover',
  'consequently',
  'hence',
  'thus',
  'accordingly',
  'conversely',
  'alternatively',
  'respectively',
  'similarly',
  'likewise',
  'specifically',
  'particularly',
  'especially',
  'generally',
  'typically',
  'usually',
  'normally',
  'occasionally',
  'frequently',
  'constantly',
  'continuously',
  'repeatedly',
  'eventually',
  'ultimately',
  'initially',
  'originally',
  'previously',
  'recently',
  'currently',
  'presently',
  'nowadays',
  'yesterday',
  'today',
  'tomorrow',
  'tonight',
  'overnight',
  'everyday',
  'something',
  'anything',
  'nothing',
  'everything',
  'someone',
  'anyone',
  'everyone',
  'nobody',
  'everybody',
  'somebody',
  'anybody',
  'somewhere',
  'anywhere',
  'everywhere',
  'nowhere',
];

for (const word of COMMON_EN_WORDS) {
  EN_WORDS.add(word);
}

// ============================================
// 한국어 띄어쓰기 정규화
// ============================================

/**
 * 한국어 텍스트의 띄어쓰기 정규화
 * 최대 매칭 알고리즘 + 조사/어미 패턴 사용
 */
export function normalizeKoreanSpacing(text: string): string {
  // 이미 띄어쓰기가 있으면 그대로 반환
  if (hasReasonableSpacing(text)) {
    return text;
  }

  const result: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const match = findLongestKoreanMatch(remaining);

    if (match) {
      result.push(match.word);
      remaining = remaining.slice(match.length);
    } else {
      // 매칭 실패시 한 글자씩 이동
      result.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  // 연속된 단일 문자들 합치기 (사전에 없는 단어)
  return mergeUnknownTokens(result);
}

/**
 * 가장 긴 한국어 단어 매칭 찾기
 */
function findLongestKoreanMatch(text: string): { word: string; length: number } | null {
  // 1. 복합 표현 우선 체크
  for (const compound of KO_COMPOUNDS) {
    if (text.startsWith(compound)) {
      // 복합어 뒤에 어미가 붙을 수 있음
      const afterCompound = text.slice(compound.length);
      for (const ending of KO_ENDINGS) {
        if (afterCompound.startsWith(ending)) {
          return { word: compound + ending, length: compound.length + ending.length };
        }
      }
      // 어미 없이 복합어만
      return { word: compound, length: compound.length };
    }
  }

  // 2. 사전 단어 + 조사/어미 조합 찾기
  let bestMatch: { word: string; length: number } | null = null;

  // 최대 15글자까지 시도 (한국어 단어 길이 제한)
  const maxLen = Math.min(text.length, 15);

  for (let len = maxLen; len >= 1; len--) {
    const candidate = text.slice(0, len);

    // 2a. 사전에 정확히 있는 경우
    if (KO_EN[candidate]) {
      if (!bestMatch || len > bestMatch.length) {
        bestMatch = { word: candidate, length: len };
      }
      continue;
    }

    // 2b. 단어 + 조사 조합 체크
    for (const particle of KO_PARTICLES) {
      if (candidate.endsWith(particle)) {
        const stem = candidate.slice(0, -particle.length);
        if (stem.length > 0 && KO_EN[stem]) {
          if (!bestMatch || len > bestMatch.length) {
            bestMatch = { word: candidate, length: len };
          }
        }
      }
    }

    // 2c. 단어 + 어미 조합 체크
    for (const ending of KO_ENDINGS) {
      if (candidate.endsWith(ending)) {
        const stem = candidate.slice(0, -ending.length);
        if (stem.length > 0 && (KO_EN[stem] || KO_EN[stem + '다'])) {
          if (!bestMatch || len > bestMatch.length) {
            bestMatch = { word: candidate, length: len };
          }
        }
      }
    }
  }

  return bestMatch;
}

/**
 * 연속된 단일 문자들을 합침 (사전에 없는 단어 처리)
 */
function mergeUnknownTokens(tokens: string[]): string {
  const merged: string[] = [];
  let current = '';

  for (const token of tokens) {
    if (token.length === 1 && !KO_EN[token]) {
      // 단일 문자이고 사전에 없으면 합침
      current += token;
    } else {
      if (current) {
        merged.push(current);
        current = '';
      }
      merged.push(token);
    }
  }

  if (current) {
    merged.push(current);
  }

  return merged.join(' ');
}

// ============================================
// 영어 띄어쓰기 정규화
// ============================================

/**
 * 영어 텍스트의 띄어쓰기 정규화
 * 최대 매칭 알고리즘 사용
 */
export function normalizeEnglishSpacing(text: string): string {
  // 이미 띄어쓰기가 있으면 그대로 반환
  if (hasReasonableSpacing(text)) {
    return text;
  }

  const result: string[] = [];
  let remaining = text.toLowerCase();
  let originalRemaining = text;

  while (remaining.length > 0) {
    const match = findLongestEnglishMatch(remaining);

    if (match) {
      // 원본 대소문자 유지
      result.push(originalRemaining.slice(0, match.length));
      remaining = remaining.slice(match.length);
      originalRemaining = originalRemaining.slice(match.length);
    } else {
      // 매칭 실패시 한 글자씩 이동
      result.push(originalRemaining[0]);
      remaining = remaining.slice(1);
      originalRemaining = originalRemaining.slice(1);
    }
  }

  return result.join(' ');
}

/**
 * 가장 긴 영어 단어 매칭 찾기
 */
function findLongestEnglishMatch(text: string): { word: string; length: number } | null {
  let bestMatch: { word: string; length: number } | null = null;

  // 최대 20글자까지 시도
  const maxLen = Math.min(text.length, 20);

  for (let len = maxLen; len >= 1; len--) {
    const candidate = text.slice(0, len).toLowerCase();

    if (EN_WORDS.has(candidate)) {
      if (!bestMatch || len > bestMatch.length) {
        bestMatch = { word: candidate, length: len };
      }
    }
  }

  return bestMatch;
}

// ============================================
// 공통 유틸리티
// ============================================

/**
 * 텍스트에 적절한 띄어쓰기가 있는지 확인
 * 또는 정규화가 필요 없는지 확인
 */
function hasReasonableSpacing(text: string): boolean {
  // 1. 짧은 텍스트(15글자 미만)는 정규화 건너뛰기
  // 이미 정상적인 짧은 문장일 가능성이 높음
  if (text.length < 15) return true;

  // 2. 공백이 있으면 적절한지 확인
  const spaces = (text.match(/\s/g) || []).length;
  if (spaces > 0) {
    const avgWordLen = text.length / (spaces + 1);
    // 평균 단어 길이가 2-15 사이면 합리적
    return avgWordLen >= 2 && avgWordLen <= 15;
  }

  // 3. 공백이 없고 15글자 이상이면 정규화 필요
  return false;
}

/**
 * 메인 띄어쓰기 정규화 함수
 * 언어 자동 감지하여 적절한 정규화 적용
 */
export function normalizeSpacing(text: string, direction: 'ko-en' | 'en-ko'): string {
  if (direction === 'ko-en') {
    return normalizeKoreanSpacing(text);
  }
  return normalizeEnglishSpacing(text);
}
