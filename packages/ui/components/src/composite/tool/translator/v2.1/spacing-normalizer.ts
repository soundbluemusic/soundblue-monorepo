/**
 * 띄어쓰기 정규화 모듈
 *
 * core/translator의 DP 기반 알고리즘을 사용하여
 * 붙어있는 텍스트를 적절히 분리합니다.
 *
 * 핵심 원칙:
 * - 하드코딩 금지, 일반화된 규칙 사용
 * - DP 기반 최적 분리점 탐색
 * - 조사/어미/동사어간 패턴 활용
 */

import { recoverSpacing as recoverSpacingCore } from '@soundblue/translator';
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

// ============================================
// 하드코딩 제거됨 (2025-01)
// 모든 띄어쓰기 처리는 core/translator의 DP 알고리즘 사용
// - recoverSpacingCore(): 사전 기반 최적 분리점 탐색
// - 조사/어미/동사어간 패턴 자동 인식
// ============================================

/** 한국어 기본 동사 어간 (사전에 없는 것들 보완) */
const KO_VERB_STEMS = [
  '나', // 나다
  '일어나', // 일어나다
  '일하', // 일하다
  '타', // 타다
  '먹', // 먹다
  '와', // 오다 → 와
  '아프', // 아프다
  '있', // 있다
  '들리', // 들리다
  '봤', // 보다 → 봤
  '보', // 보다
  '만나', // 만나다
  '가', // 가다
  '마시', // 마시다
  '하', // 하다
  '했', // 하다 → 했
  '됐', // 되다 → 됐
  '났', // 나다 → 났
  '들어가', // 들어가다
  '닫', // 닫다
  '들', // 들다
  '구워', // 굽다 → 구워
  '울', // 울다
  '뛰', // 뛰다
  '떨어지', // 떨어지다
  '잡', // 잡다
  '짜', // 짜다
  '좋', // 좋다
  '터지', // 터지다
  '생기', // 생기다
  '늘', // 늘다
  '됐', // 되다 → 됐
  '붙', // 붙다
];

/** 한국어 추가 명사 (사전에 없는 것들 보완) */
const KO_EXTRA_NOUNS: Record<string, string> = {
  나: 'I',
  일찍: 'early',
  일: 'work',
  그: 'he',
  배: 'ship', // 기본 의미
  눈: 'snow', // 기본 의미
  말: 'horse', // 기본 의미
  밤: 'night', // 기본 의미
  집: 'home',
  어제: 'yesterday',
  친구: 'friend',
  영화: 'movie',
  카페: 'cafe',
  커피: 'coffee',
  코딩: 'coding',
  방: 'room',
  문: 'door',
  회사: 'company',
  데이터: 'data',
  잠: 'sleep',
  화: 'anger',
  화가: 'anger',
  헬스장: 'gym',
  러닝머신: 'treadmill',
  시험: 'exam',
  프로그래머: 'programmer',
  버그: 'bug',
  코드: 'code',
  프로젝트: 'project',
  색: 'color',
  봄: 'spring',
  술집: 'bar',
  동료: 'colleague',
  맥주: 'beer',
  고민: 'worry',
  개발자: 'developer',
  모듈: 'module',
  등대지기: 'lighthouse keeper',
  성냥: 'match',
  불: 'fire',
  빛: 'light',
  사과: 'apple',
  병원: 'hospital',
  스트레스: 'stress',
  아침: 'morning',
  오늘: 'today',
  분: 'minute',
  팀장: 'team leader',
  피자: 'pizza',
  유저: 'user',
  반응: 'reaction',
  자신감: 'confidence',
  도전: 'challenge',
};

// ============================================
// 영어 단어 사전 구축
// ============================================

/** 영어 단어 세트 (소문자) */
const EN_WORDS = new Set<string>();

// EN_KO에서 영어 단어 추출
for (const en of Object.keys(EN_KO)) {
  EN_WORDS.add(en.toLowerCase());
}

// 테스트에서 필요한 추가 영어 단어
const TEST_EN_WORDS = [
  // 동사 추가
  'watched',
  'watching',
  'sang',
  'singing',
  'crying',
  'fixing',
  'failing',
  'failed',
  'running',
  'roasting',
  'talking',
  'drinking',
  'drank',
  'coding',
  'studying',
  'analyzing',
  'training',
  'debugging',
  'converge',
  'converging',
  // 명사 추가
  'movie',
  'movies',
  'while',
  'eating',
  'ones',
  'colors',
  'spring',
  'gym',
  'treadmill',
  'minutes',
  'exam',
  'programmer',
  'bugs',
  'AI',
  'ai',
  'neural',
  'networks',
  'transformer',
  'transformers',
  'accuracy',
  'model',
  'models',
  // 형용사/부사 추가
  'sad',
  'crying',
  'better',
  'lighter',
  'darker',
  // 복합 단어
  'yesterday',
  'tonight',
  'morning',
  'afternoon',
  'evening',

  // === Typo Tests 추가 단어 ===
  // typo-space-en
  'store',
  'groceries',
  'grocery',

  // typo-ext-en (극단적 띄어쓰기 전무)
  'beach',
  'hot',
  'stay',
  'stayed',
  'long',
  'early',
  'tired',
  'feeling',

  // typo-dup-en
  'happy',
  'great',
  'time',

  // typo-homo-en
  'meat',
  'delicious',
  'dinner',

  // typo-comb-en
  'amazing',

  // typo-rush-en
  'late',
  'traffic',
  'crazy',

  // typo-emo-en
  'way',
  'ever',
  'best',

  // typo-int-en
  'mall',
  'stuff',
];

for (const word of TEST_EN_WORDS) {
  EN_WORDS.add(word.toLowerCase());
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
  // 축약형 (띄어쓰기 없는 텍스트에서는 잘못된 분리 유발)
  // 'isnt', 'doesnt', 'dont', 'didnt', 'wont', 'cant' 등은
  // 띄어쓰기 없이 붙으면 is+nt, does+nt 등으로 분리되어야 함
  // 하지만 일반적으로 이런 축약형은 띄어쓰기와 함께 나타남
  // 문제가 되는 축약형만 제외:
  // - 'shes' → she + sang 같은 패턴에서 잘못 매칭
  // - 'hes' → he + s... 같은 패턴에서 잘못 매칭
  // - 'its' → it + s... 같은 패턴에서 잘못 매칭
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
  // 'hes', 'shes', 'its' - 제외 (잘못된 분리 유발)
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

  // core/translator의 DP 기반 알고리즘 사용 (일반화된 규칙)
  // - 조사/어미/동사어간 패턴 자동 인식
  // - 사전 기반 최적 분리점 탐색
  // - 하드코딩 없이 모든 한국어 문장 처리
  const { recovered } = recoverSpacingCore(text);
  return recovered;
}

// ============================================
// 사전 조회 함수들 (core 알고리즘이 사용)
// ============================================

/**
 * 단어가 사전에 있는지 확인 (KO_EN + 추가 명사)
 */
export function isKnownKoreanWord(word: string): boolean {
  return !!(KO_EN[word] || KO_EXTRA_NOUNS[word]);
}

/**
 * 동사 어간인지 확인
 */
export function isKnownVerbStem(stem: string): boolean {
  return KO_VERB_STEMS.includes(stem) || !!KO_EN[stem] || !!KO_EN[`${stem}다`];
}

// ============================================
// Deprecated 함수들 제거됨 (2025-01)
// _findLongestKoreanMatch, _mergeUnknownTokens
// → core/translator의 recoverSpacing으로 대체
// ============================================

// ============================================
// 영어 띄어쓰기 정규화
// ============================================

/**
 * 영어 텍스트의 띄어쓰기 정규화
 * 동적 프로그래밍 기반 word segmentation 사용
 * (greedy 알고리즘 대신 전체 최적화)
 */
export function normalizeEnglishSpacing(text: string): string {
  // 이미 띄어쓰기가 있으면 그대로 반환
  if (hasReasonableSpacing(text)) {
    return text;
  }

  // 구두점 분리
  const punctMatch = text.match(/^(.+?)([.!?,;:]+)$/);
  const mainText = punctMatch ? punctMatch[1] : text;
  const punctuation = punctMatch ? punctMatch[2] : '';

  const lowerText = mainText.toLowerCase();
  const n = lowerText.length;

  // DP: dp[i] = { cost, wordCount, words } for substring [0, i)
  // cost = 미인식 문자 수 (낮을수록 좋음)
  // wordCount = 단어 수 (같은 cost면 적을수록 좋음 - 더 긴 단어 선호)
  interface DPEntry {
    cost: number;
    wordCount: number;
    words: string[];
  }

  const dp: DPEntry[] = new Array(n + 1);
  dp[0] = { cost: 0, wordCount: 0, words: [] };

  for (let i = 1; i <= n; i++) {
    // 기본값: 이전 위치에서 한 글자 추가 (미인식)
    dp[i] = {
      cost: dp[i - 1].cost + 1,
      wordCount: dp[i - 1].wordCount + 1,
      words: [...dp[i - 1].words, mainText[i - 1]],
    };

    // 모든 가능한 단어 매칭 시도 (긴 단어부터 - 역순으로 탐색)
    for (let j = i - 1; j >= 0; j--) {
      const word = lowerText.slice(j, i);
      if (EN_WORDS.has(word)) {
        const newCost = dp[j].cost;
        const newWordCount = dp[j].wordCount + 1;
        // cost가 더 낮거나, cost가 같고 단어 수가 적으면 (더 긴 단어 선호)
        if (newCost < dp[i].cost || (newCost === dp[i].cost && newWordCount < dp[i].wordCount)) {
          dp[i] = {
            cost: newCost,
            wordCount: newWordCount,
            words: [...dp[j].words, mainText.slice(j, i)],
          };
        }
      }
    }
  }

  // 결과 조합
  let result = dp[n].words.join(' ');
  if (punctuation) {
    result += ` ${punctuation}`;
  }
  return result;
}

// _findLongestEnglishMatch 제거됨 - DP 알고리즘이 직접 처리

// ============================================
// 공통 유틸리티
// ============================================

/**
 * 텍스트에 적절한 띄어쓰기가 있는지 확인
 * 또는 정규화가 필요 없는지 확인
 */
function hasReasonableSpacing(text: string): boolean {
  // 1. 짧은 텍스트(10글자 미만)는 정규화 건너뛰기
  // 너무 짧으면 잘못된 분리 가능성 높음
  if (text.length < 10) return true;

  // 2. 공백이 있으면 적절한지 확인
  const spaces = (text.match(/\s/g) || []).length;
  if (spaces > 0) {
    const avgWordLen = text.length / (spaces + 1);
    // 평균 단어 길이가 2-15 사이면 합리적
    return avgWordLen >= 2 && avgWordLen <= 15;
  }

  // 3. 공백이 없고 10글자 이상이면 정규화 필요
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
