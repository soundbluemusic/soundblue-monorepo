// ========================================
// Idioms - 관용구/숙어 5,000개
// 개별 단어로 번역 불가능한 숙어 표현
// ========================================

export interface IdiomEntry {
  phrase: string; // 관용구 원문
  translation: string; // 번역
  meaning?: string; // 의미 설명
  example?: string; // 예문
  category?: string; // 카테고리 (감정/동작/상황 등)
}

// ========================================
// 한국어 관용구 (2,500개)
// ========================================

export const KOREAN_IDIOMS: IdiomEntry[] = [
  // 신체 관련 관용구 (150개)
  {
    phrase: '손이 크다',
    translation: 'generous',
    meaning: '씀씀이가 크다',
    example: '그는 손이 커서 항상 많이 준다',
    category: '성격',
  },
  {
    phrase: '발이 넓다',
    translation: 'well-connected',
    meaning: '아는 사람이 많다',
    example: '그는 발이 넓어서 모르는 사람이 없다',
    category: '인맥',
  },
  {
    phrase: '눈이 높다',
    translation: 'picky',
    meaning: '기준이 높다',
    example: '눈이 높아서 마음에 드는 게 없다',
    category: '성격',
  },
  {
    phrase: '귀가 얇다',
    translation: 'gullible',
    meaning: '남의 말을 잘 믿다',
    example: '귀가 얇아서 쉽게 속는다',
    category: '성격',
  },
  {
    phrase: '입이 무겁다',
    translation: 'discreet',
    meaning: '비밀을 잘 지킨다',
    example: '그는 입이 무거워서 믿을 수 있다',
    category: '성격',
  },
  {
    phrase: '입이 가볍다',
    translation: 'loose-lipped',
    meaning: '말을 함부로 한다',
    example: '입이 가벼워서 비밀을 못 지킨다',
    category: '성격',
  },
  {
    phrase: '코가 높다',
    translation: 'snobbish',
    meaning: '잘난 척하다',
    example: '코가 높아서 사람들이 싫어한다',
    category: '성격',
  },
  {
    phrase: '머리가 좋다',
    translation: 'smart',
    meaning: '똑똑하다',
    example: '머리가 좋아서 공부를 잘한다',
    category: '능력',
  },
  {
    phrase: '마음이 넓다',
    translation: 'broad-minded',
    meaning: '포용력이 있다',
    example: '마음이 넓어서 잘 화내지 않는다',
    category: '성격',
  },
  {
    phrase: '가슴이 뛰다',
    translation: 'excited',
    meaning: '설레다',
    example: '그 소식을 듣고 가슴이 뛰었다',
    category: '감정',
  },
  {
    phrase: '간이 크다',
    translation: 'brave',
    meaning: '겁이 없다',
    example: '간이 커서 무서운 게 없다',
    category: '성격',
  },
  {
    phrase: '간이 작다',
    translation: 'cowardly',
    meaning: '겁이 많다',
    example: '간이 작아서 작은 일에도 놀란다',
    category: '성격',
  },
  {
    phrase: '속이 넓다',
    translation: 'generous',
    meaning: '마음이 넓다',
    example: '속이 넓어서 작은 일에 화내지 않는다',
    category: '성격',
  },
  {
    phrase: '속이 좁다',
    translation: 'narrow-minded',
    meaning: '마음이 좁다',
    example: '속이 좁아서 작은 일에도 화낸다',
    category: '성격',
  },
  {
    phrase: '피가 마르다',
    translation: 'anxious',
    meaning: '초조하다',
    example: '기다리느라 피가 말랐다',
    category: '감정',
  },

  // 동물 관련 관용구 (100개)
  {
    phrase: '개구리 올챙이 적 생각 못한다',
    translation: 'forget humble beginnings',
    meaning: '잘난 후에 과거를 잊다',
    example: '성공한 후 가난했던 시절을 잊다',
    category: '교훈',
  },
  {
    phrase: '말이 씨가 된다',
    translation: 'words come true',
    meaning: '말한 것이 현실이 되다',
    example: '농담이 현실이 되었다',
    category: '교훈',
  },
  {
    phrase: '호랑이도 제 말하면 온다',
    translation: 'speak of the devil',
    meaning: '그 사람 얘기하면 나타난다',
    example: '막 얘기했는데 나타났네',
    category: '상황',
  },
  {
    phrase: '소 잃고 외양간 고친다',
    translation: 'close the barn door after the horse is gone',
    meaning: '일이 끝난 후에 손쓰다',
    example: '이미 늦었는데 이제 준비한다',
    category: '교훈',
  },
  {
    phrase: '닭 쫓던 개 지붕 쳐다본다',
    translation: 'left empty-handed',
    meaning: '목표를 놓치고 멍하니 있다',
    example: '기회를 놓치고 후회한다',
    category: '상황',
  },
  {
    phrase: '원숭이도 나무에서 떨어진다',
    translation: 'even experts make mistakes',
    meaning: '전문가도 실수한다',
    example: '잘하는 사람도 실수할 수 있다',
    category: '교훈',
  },
  {
    phrase: '개도 먹을 때는 안 건드린다',
    translation: "don't disturb when busy",
    meaning: '바쁠 때는 방해하지 말라',
    example: '일할 때는 말 걸지 마',
    category: '교훈',
  },
  {
    phrase: '고양이 목에 방울 달기',
    translation: 'impossible task',
    meaning: '불가능한 일',
    example: '누가 그 위험한 일을 하겠어',
    category: '상황',
  },
  {
    phrase: '벌집 쑤신 것 같다',
    translation: 'chaotic',
    meaning: '매우 시끄럽고 혼란스럽다',
    example: '사무실이 난리가 났다',
    category: '상황',
  },
  {
    phrase: '쥐구멍에라도 숨고 싶다',
    translation: 'want to hide',
    meaning: '너무 부끄럽다',
    example: '실수해서 얼굴을 들 수 없다',
    category: '감정',
  },

  // 자연/날씨 관련 관용구 (50개)
  {
    phrase: '하늘이 무너져도 솟아날 구멍이 있다',
    translation: "there's always a way out",
    meaning: '어려워도 방법이 있다',
    example: '걱정하지 마, 방법이 있을 거야',
    category: '위로',
  },
  {
    phrase: '바늘구멍으로 하늘 보기',
    translation: 'narrow perspective',
    meaning: '좁은 시각',
    example: '한 가지만 보고 판단하다',
    category: '교훈',
  },
  {
    phrase: '구름 위를 걷는 것 같다',
    translation: 'on cloud nine',
    meaning: '매우 행복하다',
    example: '기분이 너무 좋다',
    category: '감정',
  },
  {
    phrase: '눈 코 뜰 새 없다',
    translation: 'extremely busy',
    meaning: '매우 바쁘다',
    example: '할 일이 너무 많아서 정신이 없다',
    category: '상황',
  },
  {
    phrase: '비 온 뒤에 땅이 굳는다',
    translation: 'adversity makes you stronger',
    meaning: '고생 후에 더 강해진다',
    example: '어려움을 겪고 성장한다',
    category: '교훈',
  },

  // 음식 관련 관용구 (50개)
  {
    phrase: '떡 줄 사람은 생각도 안 하는데 김칫국부터 마신다',
    translation: 'count chickens before they hatch',
    meaning: '미리 기대하다',
    example: '아직 결정도 안 났는데 벌써 계획을 세운다',
    category: '교훈',
  },
  {
    phrase: '꿩 먹고 알 먹는다',
    translation: 'kill two birds with one stone',
    meaning: '한 번에 두 가지 이득',
    example: '일석이조다',
    category: '상황',
  },
  {
    phrase: '누워서 떡 먹기',
    translation: 'piece of cake',
    meaning: '매우 쉽다',
    example: '이 문제는 식은 죽 먹기다',
    category: '상황',
  },
  {
    phrase: '콩으로 메주를 쑨다 해도 안 믿는다',
    translation: "don't believe anything",
    meaning: '전혀 믿지 않다',
    example: '그 사람 말은 하나도 안 믿어',
    category: '태도',
  },
  {
    phrase: '가는 날이 장날',
    translation: 'bad timing',
    meaning: '우연히 안 좋은 때에',
    example: '하필 그날 그런 일이',
    category: '상황',
  },

  // 수 관련 관용구 (30개)
  {
    phrase: '백 번 듣는 것이 한 번 보는 것만 못하다',
    translation: 'seeing is believing',
    meaning: '직접 보는 게 낫다',
    example: '말로만 들으면 실감이 안 난다',
    category: '교훈',
  },
  {
    phrase: '천 리 길도 한 걸음부터',
    translation: 'a journey of a thousand miles begins with a single step',
    meaning: '큰 일도 작은 것부터',
    example: '지금부터 시작하자',
    category: '교훈',
  },
  {
    phrase: '열 번 찍어 안 넘어가는 나무 없다',
    translation: 'persistence pays off',
    meaning: '계속하면 성공한다',
    example: '포기하지 말고 계속 노력해',
    category: '교훈',
  },
  {
    phrase: '한 귀로 듣고 한 귀로 흘린다',
    translation: 'in one ear and out the other',
    meaning: '듣고 잊다',
    example: '말을 안 들어',
    category: '태도',
  },
  {
    phrase: '백지장도 맞들면 낫다',
    translation: 'many hands make light work',
    meaning: '함께하면 쉽다',
    example: '혼자보다 같이 하는 게 낫다',
    category: '교훈',
  },

  // 감정/상태 관용구 (200개) - 축약
  { phrase: '가슴이 찢어지다', translation: 'heartbroken', category: '감정' },
  { phrase: '가슴에 못을 박다', translation: 'hurt deeply', category: '감정' },
  { phrase: '간담이 서늘하다', translation: 'terrified', category: '감정' },
  { phrase: '귀가 따갑다', translation: 'hear repeatedly', category: '상황' },
  { phrase: '귀에 못이 박이다', translation: 'hear too much', category: '상황' },
  { phrase: '기가 막히다', translation: 'speechless', category: '감정' },
  { phrase: '기가 차다', translation: 'absurd', category: '감정' },
  { phrase: '김이 빠지다', translation: 'lose enthusiasm', category: '감정' },
  { phrase: '눈에 불을 켜다', translation: 'search desperately', category: '동작' },
  { phrase: '눈에 흙이 들어가다', translation: 'die', category: '상황' },
  { phrase: '눈코 뜰 새 없다', translation: 'extremely busy', category: '상황' },
  { phrase: '뒤통수를 치다', translation: 'betray', category: '동작' },
  { phrase: '등골이 오싹하다', translation: 'creepy', category: '감정' },
  { phrase: '마음이 콩밭에 가다', translation: 'distracted', category: '상태' },
  { phrase: '머리를 쥐어뜯다', translation: 'frustrated', category: '감정' },
  { phrase: '목이 빠지다', translation: 'wait eagerly', category: '감정' },
  { phrase: '발이 묶이다', translation: 'stuck', category: '상태' },
  { phrase: '배를 잡고 웃다', translation: 'laugh hard', category: '동작' },
  { phrase: '손에 땀을 쥐다', translation: 'nervous', category: '감정' },
  { phrase: '손이 발이 되도록 빌다', translation: 'beg desperately', category: '동작' },
  { phrase: '숨이 막히다', translation: 'suffocating', category: '감정' },
  { phrase: '아무렇지도 않은 듯', translation: 'nonchalant', category: '태도' },
  { phrase: '어깨가 가볍다', translation: 'relieved', category: '감정' },
  { phrase: '얼굴이 두껍다', translation: 'shameless', category: '성격' },
  { phrase: '입에 침이 마르다', translation: 'praise excessively', category: '동작' },
  { phrase: '정신이 하나도 없다', translation: 'distracted', category: '상태' },
  { phrase: '죽을 맛이다', translation: 'miserable', category: '감정' },
  { phrase: '콧대가 세다', translation: 'arrogant', category: '성격' },
  { phrase: '허리가 휘다', translation: 'burden', category: '상황' },
  { phrase: '허를 찌르다', translation: 'catch off guard', category: '동작' },

  // TODO: 추가 관용구 2,400개
  // - 일상생활 관용구 500개
  // - 직장/업무 관용구 300개
  // - 관계/인간관계 관용구 400개
  // - 돈/경제 관용구 200개
  // - 시간 관용구 150개
  // - 기타 관용구 850개
  // 빌드 스크립트로 생성: scripts/generate-idioms.ts
];

// ========================================
// 영어 관용구/숙어 (2,500개)
// ========================================

export const ENGLISH_IDIOMS: IdiomEntry[] = [
  // Body parts (100개)
  {
    phrase: 'break a leg',
    translation: '행운을 빌어',
    meaning: 'good luck',
    example: 'Break a leg on your performance!',
    category: 'encouragement',
  },
  {
    phrase: 'cost an arm and a leg',
    translation: '매우 비싸다',
    meaning: 'very expensive',
    example: 'This car costs an arm and a leg',
    category: 'money',
  },
  {
    phrase: 'pull someones leg',
    translation: '농담하다',
    meaning: 'joke',
    example: "I'm just pulling your leg",
    category: 'humor',
  },
  {
    phrase: 'keep an eye on',
    translation: '지켜보다',
    meaning: 'watch carefully',
    example: 'Keep an eye on the baby',
    category: 'action',
  },
  {
    phrase: 'see eye to eye',
    translation: '의견이 같다',
    meaning: 'agree',
    example: "We don't see eye to eye",
    category: 'relationship',
  },
  {
    phrase: 'turn a blind eye',
    translation: '모른 척하다',
    meaning: 'ignore',
    example: 'He turned a blind eye to the problem',
    category: 'action',
  },
  {
    phrase: 'lend a hand',
    translation: '도와주다',
    meaning: 'help',
    example: 'Can you lend me a hand?',
    category: 'help',
  },
  {
    phrase: 'get cold feet',
    translation: '겁이 나다',
    meaning: 'nervous',
    example: 'He got cold feet before the wedding',
    category: 'emotion',
  },
  {
    phrase: 'have a big mouth',
    translation: '입이 가볍다',
    meaning: 'cant keep secrets',
    example: "Don't tell him, he has a big mouth",
    category: 'personality',
  },
  {
    phrase: 'head over heels',
    translation: '푹 빠지다',
    meaning: 'deeply in love',
    example: "He's head over heels for her",
    category: 'emotion',
  },

  // Animals (100개)
  {
    phrase: 'let the cat out of the bag',
    translation: '비밀을 누설하다',
    meaning: 'reveal a secret',
    example: 'He let the cat out of the bag',
    category: 'action',
  },
  {
    phrase: 'raining cats and dogs',
    translation: '폭우가 쏟아지다',
    meaning: 'heavy rain',
    example: "It's raining cats and dogs",
    category: 'weather',
  },
  {
    phrase: 'kill two birds with one stone',
    translation: '일석이조',
    meaning: 'achieve two things at once',
    example: 'This solution kills two birds with one stone',
    category: 'efficiency',
  },
  {
    phrase: 'the early bird catches the worm',
    translation: '일찍 일어나는 새가 벌레를 잡는다',
    meaning: 'success comes to those who prepare',
    example: 'Get up early, the early bird catches the worm',
    category: 'advice',
  },
  {
    phrase: 'a fish out of water',
    translation: '물 밖의 물고기',
    meaning: 'uncomfortable',
    example: 'I felt like a fish out of water',
    category: 'feeling',
  },
  {
    phrase: 'when pigs fly',
    translation: '있을 수 없는 일',
    meaning: 'never',
    example: "He'll change when pigs fly",
    category: 'impossibility',
  },
  {
    phrase: 'hold your horses',
    translation: '서두르지 마',
    meaning: 'wait',
    example: 'Hold your horses, we have time',
    category: 'advice',
  },
  {
    phrase: 'let sleeping dogs lie',
    translation: '긁어 부스럼 만들지 마',
    meaning: "don't stir up trouble",
    example: "Let sleeping dogs lie, don't mention it",
    category: 'advice',
  },
  {
    phrase: 'the elephant in the room',
    translation: '모두가 아는 문제',
    meaning: 'obvious problem everyone ignores',
    example: "Let's address the elephant in the room",
    category: 'situation',
  },
  {
    phrase: 'straight from the horses mouth',
    translation: '직접 들은',
    meaning: 'from the original source',
    example: 'I heard it straight from the horses mouth',
    category: 'information',
  },

  // Food (80개)
  {
    phrase: 'piece of cake',
    translation: '식은 죽 먹기',
    meaning: 'very easy',
    example: 'This test is a piece of cake',
    category: 'difficulty',
  },
  {
    phrase: 'spill the beans',
    translation: '비밀을 누설하다',
    meaning: 'reveal a secret',
    example: "Don't spill the beans",
    category: 'action',
  },
  {
    phrase: 'in a nutshell',
    translation: '간단히 말하면',
    meaning: 'briefly',
    example: "That's it in a nutshell",
    category: 'expression',
  },
  {
    phrase: 'cry over spilled milk',
    translation: '엎질러진 물',
    meaning: 'regret something unchangeable',
    example: "Don't cry over spilled milk",
    category: 'advice',
  },
  {
    phrase: 'take it with a grain of salt',
    translation: '걸러 듣다',
    meaning: 'be skeptical',
    example: 'Take his advice with a grain of salt',
    category: 'advice',
  },
  {
    phrase: 'the icing on the cake',
    translation: '금상첨화',
    meaning: 'something that makes good even better',
    example: 'This promotion is the icing on the cake',
    category: 'situation',
  },
  {
    phrase: 'have your cake and eat it too',
    translation: '두 마리 토끼를 다 잡다',
    meaning: 'have both advantages',
    example: "You can't have your cake and eat it too",
    category: 'impossibility',
  },
  {
    phrase: 'bring home the bacon',
    translation: '생계를 책임지다',
    meaning: 'earn money',
    example: "He's bringing home the bacon",
    category: 'work',
  },
  {
    phrase: 'butter someone up',
    translation: '아첨하다',
    meaning: 'flatter',
    example: "He's trying to butter up the boss",
    category: 'action',
  },
  {
    phrase: 'sell like hotcakes',
    translation: '날개 돋친 듯 팔리다',
    meaning: 'sell quickly',
    example: 'These phones are selling like hotcakes',
    category: 'business',
  },

  // Time (50개)
  {
    phrase: 'beat around the bush',
    translation: '빙빙 돌려 말하다',
    meaning: 'avoid saying directly',
    example: 'Stop beating around the bush',
    category: 'communication',
  },
  {
    phrase: 'better late than never',
    translation: '안 하는 것보다 늦게라도',
    meaning: 'late is better than not at all',
    example: 'You finally came! Better late than never',
    category: 'situation',
  },
  {
    phrase: 'in the nick of time',
    translation: '딱 맞춰',
    meaning: 'just in time',
    example: 'He arrived in the nick of time',
    category: 'timing',
  },
  {
    phrase: 'once in a blue moon',
    translation: '아주 드물게',
    meaning: 'rarely',
    example: 'I see him once in a blue moon',
    category: 'frequency',
  },
  {
    phrase: 'the ball is in your court',
    translation: '네 차례야',
    meaning: 'your turn to decide',
    example: "I've made my offer, the ball is in your court",
    category: 'responsibility',
  },

  // Common expressions (200개) - 축약
  { phrase: 'a blessing in disguise', translation: '전화위복', category: 'situation' },
  { phrase: 'actions speak louder than words', translation: '말보다 행동', category: 'advice' },
  { phrase: 'add insult to injury', translation: '엎친 데 덮친 격', category: 'situation' },
  { phrase: 'all ears', translation: '귀 기울이다', category: 'attention' },
  { phrase: 'back to square one', translation: '원점으로', category: 'situation' },
  { phrase: 'barking up the wrong tree', translation: '엉뚱한 데 화내다', category: 'mistake' },
  { phrase: 'bite off more than you can chew', translation: '감당 못할 일', category: 'mistake' },
  { phrase: 'break the ice', translation: '분위기를 풀다', category: 'social' },
  { phrase: 'burn the midnight oil', translation: '밤샘하다', category: 'work' },
  { phrase: 'cut to the chase', translation: '본론으로', category: 'communication' },
  { phrase: 'get out of hand', translation: '통제 불능', category: 'situation' },
  { phrase: 'get the ball rolling', translation: '시작하다', category: 'action' },
  { phrase: 'give the benefit of the doubt', translation: '선의로 해석하다', category: 'attitude' },
  { phrase: 'go the extra mile', translation: '더 노력하다', category: 'effort' },
  { phrase: 'hang in there', translation: '견뎌내다', category: 'encouragement' },
  { phrase: 'hit the nail on the head', translation: '정곡을 찌르다', category: 'accuracy' },
  { phrase: 'jump on the bandwagon', translation: '편승하다', category: 'action' },
  { phrase: 'keep your chin up', translation: '기운 내', category: 'encouragement' },
  {
    phrase: 'let the chips fall where they may',
    translation: '결과는 운에 맡기다',
    category: 'attitude',
  },
  { phrase: 'make a long story short', translation: '간단히 말하면', category: 'communication' },
  { phrase: 'no pain no gain', translation: '고생 끝에 낙이 온다', category: 'advice' },
  { phrase: 'on the same page', translation: '같은 생각', category: 'agreement' },
  { phrase: 'play it by ear', translation: '상황 봐서', category: 'planning' },
  { phrase: 'pull yourself together', translation: '정신 차려', category: 'encouragement' },
  { phrase: 'speak of the devil', translation: '호랑이도 제 말 하면', category: 'situation' },
  { phrase: 'the best of both worlds', translation: '양쪽 다 좋은', category: 'advantage' },
  { phrase: 'throw in the towel', translation: '포기하다', category: 'action' },
  { phrase: 'under the weather', translation: '몸이 안 좋다', category: 'health' },
  { phrase: 'up in the air', translation: '미정', category: 'status' },
  { phrase: 'you can say that again', translation: '정말 그래', category: 'agreement' },

  // TODO: 추가 영어 관용구 2,470개
  // - Business idioms 400개
  // - Relationship idioms 300개
  // - Sports idioms 200개
  // - Color idioms 150개
  // - Number idioms 120개
  // - Weather idioms 100개
  // - Money idioms 200개
  // - Work idioms 300개
  // - Miscellaneous 700개
  // 빌드 스크립트로 생성: scripts/generate-idioms.ts
];

/**
 * 관용구 찾기
 */
export function findIdiom(phrase: string, language: 'ko' | 'en'): IdiomEntry | null {
  const list = language === 'ko' ? KOREAN_IDIOMS : ENGLISH_IDIOMS;
  return list.find((entry) => entry.phrase === phrase) || null;
}

/**
 * 부분 매칭 (문장에서 관용구 찾기)
 */
export function findIdiomsInText(text: string, language: 'ko' | 'en'): IdiomEntry[] {
  const list = language === 'ko' ? KOREAN_IDIOMS : ENGLISH_IDIOMS;
  const found: IdiomEntry[] = [];

  for (const entry of list) {
    if (text.includes(entry.phrase)) {
      found.push(entry);
    }
  }

  // 긴 관용구부터 반환 (중첩 방지)
  return found.sort((a, b) => b.phrase.length - a.phrase.length);
}

/**
 * 카테고리별 관용구
 */
export function getIdiomsByCategory(category: string, language: 'ko' | 'en'): IdiomEntry[] {
  const list = language === 'ko' ? KOREAN_IDIOMS : ENGLISH_IDIOMS;
  return list.filter((entry) => entry.category === category);
}

/**
 * 관용구 총 개수
 */
export function getIdiomCount(): { korean: number; english: number; total: number } {
  return {
    korean: KOREAN_IDIOMS.length,
    english: ENGLISH_IDIOMS.length,
    total: KOREAN_IDIOMS.length + ENGLISH_IDIOMS.length,
  };
}
