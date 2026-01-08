// ========================================
// Word Types - 단어 타입 정의
// 중복 키 지원: 하나의 한국어 단어 → 여러 영어 번역
// ========================================

/**
 * 카테고리 타입 (Context 데이터와 일치)
 */
export type WordCategory =
  | 'food' // 음식
  | 'transportation' // 교통
  | 'math' // 수학
  | 'music' // 음악
  | 'art' // 예술
  | 'sports' // 스포츠
  | 'travel' // 여행
  | 'work' // 직장
  | 'family' // 가족
  | 'emotions' // 감정
  | 'greetings' // 인사
  | 'shopping' // 쇼핑
  | 'daily-life' // 일상
  | 'time-date' // 시간/날짜
  | 'culture' // 문화
  | 'physics' // 물리
  | 'space' // 우주
  | 'numbers' // 숫자
  | 'adjectives-basic' // 기본 형용사
  | 'verbs-basic' // 기본 동사
  | 'general'; // 일반 (기본값)

/**
 * 개별 번역 항목
 */
export interface WordTranslation {
  english: string; // 영어 번역
  category: WordCategory; // 카테고리
  priority?: number; // 우선순위 (높을수록 우선, 기본값 0)
  contextHints?: string[]; // 문맥 힌트 단어들 (이 단어들이 함께 등장하면 선택)
}

/**
 * 다중 번역 단어 항목
 * 하나의 한국어 단어 → 여러 영어 번역
 */
export interface MultiTranslationWord {
  korean: string;
  translations: WordTranslation[];
}

/**
 * 카테고리별 키워드 매핑
 * 문맥 분석시 이 키워드들이 있으면 해당 카테고리로 판단
 */
export const CATEGORY_KEYWORDS: Record<WordCategory, string[]> = {
  food: [
    '먹다',
    '마시다',
    '맛있다',
    '음식',
    '요리',
    '밥',
    '식당',
    '커피',
    '물',
    '술',
    '과일',
    '고기',
    '채소',
    '빵',
    '차',
    '식사',
    '아침',
    '점심',
    '저녁',
    '배고프다',
    'eat',
    'drink',
    'food',
    'restaurant',
    'coffee',
    'tea',
    'delicious',
  ],
  transportation: [
    '타다',
    '운전하다',
    '가다',
    '오다',
    '버스',
    '지하철',
    '택시',
    '비행기',
    '기차',
    '자전거',
    '도착하다',
    '출발하다',
    '역',
    '공항',
    '차',
    '도로',
    '신호',
    'drive',
    'ride',
    'bus',
    'train',
    'car',
    'airport',
    'station',
  ],
  math: [
    '더하다',
    '빼다',
    '곱하다',
    '나누다',
    '숫자',
    '계산',
    '문제',
    '답',
    '수학',
    '공식',
    '방정식',
    'add',
    'subtract',
    'multiply',
    'divide',
    'calculate',
    'math',
    'number',
  ],
  music: [
    '노래',
    '음악',
    '듣다',
    '연주하다',
    '가수',
    '악기',
    '피아노',
    '기타',
    '드럼',
    '멜로디',
    '리듬',
    '콘서트',
    'music',
    'song',
    'sing',
    'play',
    'listen',
    'instrument',
    'concert',
  ],
  art: [
    '그리다',
    '그림',
    '예술',
    '작품',
    '전시',
    '미술관',
    '색',
    '붓',
    '캔버스',
    'art',
    'draw',
    'paint',
    'picture',
    'museum',
    'gallery',
  ],
  sports: [
    '운동',
    '축구',
    '야구',
    '농구',
    '테니스',
    '수영',
    '달리다',
    '이기다',
    '지다',
    '경기',
    '팀',
    '선수',
    'sports',
    'soccer',
    'basketball',
    'baseball',
    'run',
    'win',
    'game',
  ],
  travel: [
    '여행',
    '관광',
    '호텔',
    '예약',
    '비자',
    '여권',
    '짐',
    '가방',
    '휴가',
    'travel',
    'trip',
    'hotel',
    'vacation',
    'tourist',
    'passport',
  ],
  work: [
    '일하다',
    '회사',
    '직장',
    '사무실',
    '회의',
    '프로젝트',
    '보고서',
    '상사',
    '동료',
    '월급',
    '출근',
    '퇴근',
    'work',
    'office',
    'meeting',
    'company',
    'job',
    'boss',
  ],
  family: [
    '가족',
    '부모님',
    '아버지',
    '어머니',
    '형',
    '누나',
    '동생',
    '할머니',
    '할아버지',
    '아들',
    '딸',
    '결혼',
    'family',
    'mother',
    'father',
    'brother',
    'sister',
    'parents',
  ],
  emotions: [
    '기쁘다',
    '슬프다',
    '화나다',
    '행복하다',
    '걱정하다',
    '사랑하다',
    '미워하다',
    '두렵다',
    '외롭다',
    'happy',
    'sad',
    'angry',
    'love',
    'hate',
    'worry',
    'fear',
    'lonely',
  ],
  greetings: [
    '안녕',
    '인사',
    '만나다',
    '처음',
    '반갑다',
    '감사하다',
    '미안하다',
    '실례',
    'hello',
    'hi',
    'goodbye',
    'thank',
    'sorry',
    'meet',
  ],
  shopping: [
    '사다',
    '팔다',
    '가격',
    '돈',
    '카드',
    '현금',
    '할인',
    '물건',
    '가게',
    '마트',
    '영수증',
    'buy',
    'sell',
    'price',
    'money',
    'shop',
    'store',
    'discount',
  ],
  'daily-life': [
    '일상',
    '아침',
    '저녁',
    '잠',
    '씻다',
    '청소',
    '요리',
    'daily',
    'morning',
    'evening',
    'sleep',
    'wash',
    'clean',
  ],
  'time-date': [
    '시간',
    '분',
    '초',
    '오늘',
    '어제',
    '내일',
    '요일',
    '월',
    '년',
    '주',
    'time',
    'hour',
    'minute',
    'today',
    'yesterday',
    'tomorrow',
    'week',
    'month',
  ],
  culture: [
    '문화',
    '전통',
    '역사',
    '축제',
    '명절',
    '한복',
    'culture',
    'tradition',
    'history',
    'festival',
    'holiday',
  ],
  physics: [
    '물리',
    '에너지',
    '힘',
    '속도',
    '질량',
    '중력',
    '원자',
    'physics',
    'energy',
    'force',
    'speed',
    'mass',
    'gravity',
  ],
  space: [
    '우주',
    '별',
    '행성',
    '태양',
    '달',
    '지구',
    '은하',
    '로켓',
    'space',
    'star',
    'planet',
    'sun',
    'moon',
    'earth',
    'galaxy',
  ],
  numbers: [
    '하나',
    '둘',
    '셋',
    '넷',
    '다섯',
    '일',
    '이',
    '삼',
    '사',
    '오',
    '백',
    '천',
    '만',
    'one',
    'two',
    'three',
    'number',
    'count',
  ],
  'adjectives-basic': [],
  'verbs-basic': [],
  general: [], // 기본 카테고리는 매칭 키워드 없음
};

/**
 * 다중 번역 단어 사전
 * 동일한 한국어 단어가 여러 의미를 가질 때 사용
 */
export const MULTI_TRANSLATION_WORDS: MultiTranslationWord[] = [
  // === 차 (tea vs car vs difference) ===
  {
    korean: '차',
    translations: [
      {
        english: 'tea',
        category: 'food',
        priority: 1,
        contextHints: ['마시다', '커피', '녹차', '홍차', '따뜻한', '차가운', '음료'],
      },
      {
        english: 'car',
        category: 'transportation',
        priority: 1,
        contextHints: ['타다', '운전', '주차', '도로', '버스', '택시'],
      },
      {
        english: 'difference',
        category: 'math',
        priority: 0,
        contextHints: ['빼다', '계산', '숫자', '수학', '크다', '작다'],
      },
    ],
  },
  // === 눈 (eye vs snow) ===
  {
    korean: '눈',
    translations: [
      {
        english: 'eye',
        category: 'general',
        priority: 2,
        contextHints: ['보다', '감다', '뜨다', '시력', '얼굴', '아프다'],
      },
      {
        english: 'snow',
        category: 'general',
        priority: 1,
        contextHints: ['오다', '내리다', '겨울', '하얀', '춥다', '날씨'],
      },
    ],
  },
  // === 배 (stomach/belly vs ship vs pear) ===
  {
    korean: '배',
    translations: [
      {
        english: 'stomach',
        category: 'general',
        priority: 2,
        contextHints: ['아프다', '고프다', '부르다', '먹다', '소화'],
      },
      {
        english: 'ship',
        category: 'transportation',
        priority: 1,
        contextHints: ['타다', '바다', '항구', '여행', '선장'],
      },
      {
        english: 'pear',
        category: 'food',
        priority: 0,
        contextHints: ['과일', '먹다', '달다', '맛있다'],
      },
    ],
  },
  // === 밤 (night vs chestnut) ===
  {
    korean: '밤',
    translations: [
      {
        english: 'night',
        category: 'time-date',
        priority: 2,
        contextHints: ['어둡다', '자다', '늦다', '저녁', '달', '별'],
      },
      {
        english: 'chestnut',
        category: 'food',
        priority: 0,
        contextHints: ['먹다', '맛있다', '과일', '굽다', '가을'],
      },
    ],
  },
  // === 사과 (apple vs apology) ===
  {
    korean: '사과',
    translations: [
      {
        english: 'apple',
        category: 'food',
        priority: 2,
        contextHints: ['먹다', '과일', '빨간', '맛있다', '주스'],
      },
      {
        english: 'apology',
        category: 'general',
        priority: 1,
        contextHints: ['하다', '받다', '미안', '잘못', '용서'],
      },
    ],
  },
  // === 말 (horse vs speech/word) ===
  {
    korean: '말',
    translations: [
      {
        english: 'horse',
        category: 'general',
        priority: 1,
        contextHints: ['타다', '동물', '경마', '달리다', '마굿간'],
      },
      {
        english: 'word',
        category: 'general',
        priority: 2,
        contextHints: ['하다', '듣다', '대화', '언어', '표현', '뜻'],
      },
    ],
  },
  // === 다리 (leg vs bridge) ===
  {
    korean: '다리',
    translations: [
      {
        english: 'leg',
        category: 'general',
        priority: 2,
        contextHints: ['아프다', '걷다', '달리다', '근육', '무릎'],
      },
      {
        english: 'bridge',
        category: 'transportation',
        priority: 1,
        contextHints: ['건너다', '강', '도로', '다리 위', '건설'],
      },
    ],
  },
  // === 감 (persimmon vs sense/feeling) ===
  {
    korean: '감',
    translations: [
      {
        english: 'persimmon',
        category: 'food',
        priority: 1,
        contextHints: ['먹다', '과일', '달다', '가을', '익다'],
      },
      {
        english: 'sense',
        category: 'general',
        priority: 1,
        contextHints: ['있다', '없다', '좋다', '나쁘다', '느낌'],
      },
    ],
  },
  // === 잠 (sleep vs lock) ===
  {
    korean: '잠',
    translations: [
      {
        english: 'sleep',
        category: 'daily-life',
        priority: 2,
        contextHints: ['자다', '피곤하다', '꿈', '침대', '늦다', '일어나다'],
      },
      {
        english: 'lock',
        category: 'general',
        priority: 0,
        contextHints: ['잠그다', '문', '열쇠', '안전'],
      },
    ],
  },
  // === 볼 (cheek vs ball) ===
  {
    korean: '볼',
    translations: [
      {
        english: 'cheek',
        category: 'general',
        priority: 1,
        contextHints: ['빨간', '얼굴', '뽀뽀', '부끄럽다'],
      },
      {
        english: 'ball',
        category: 'sports',
        priority: 1,
        contextHints: ['던지다', '차다', '잡다', '축구', '야구', '경기'],
      },
    ],
  },
];
