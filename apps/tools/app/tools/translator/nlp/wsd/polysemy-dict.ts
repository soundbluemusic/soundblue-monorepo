// ========================================
// WSD - 다의어 사전 (Polysemy Dictionary)
// 100개+ 핵심 다의어 + 문맥 트리거
// ========================================

/**
 * 의미 정의
 */
export interface Sense {
  /** 의미 ID */
  id: string;
  /** 영어 번역 */
  en: string;
  /** 도메인 (body, food, transport, weather 등) */
  domain: string;
  /** 문맥 단서 단어들 (트리거) */
  triggers: string[];
  /** 기본 빈도 가중치 (0-1) */
  weight: number;
}

/**
 * 다의어 정의
 */
export interface Polysemy {
  /** 한국어 단어 */
  word: string;
  /** 가능한 의미들 */
  senses: Sense[];
}

/**
 * 다의어 사전 (100개+ 핵심 단어)
 */
export const polysemyDict: Polysemy[] = [
  // ========================================
  // 명사 (Nouns)
  // ========================================
  {
    word: '배',
    senses: [
      {
        id: 'belly',
        en: 'stomach',
        domain: 'body',
        triggers: [
          '아프',
          '고프',
          '고파',
          '부르',
          '부러',
          '배탈',
          '소화',
          '병원',
          '배고프',
          '배고파',
          '더부룩',
          '설사',
          '속',
          '불편',
        ],
        weight: 0.4,
      },
      {
        id: 'boat',
        en: 'boat',
        domain: 'transport',
        triggers: [
          '타',
          '탔',
          '타고',
          '항구',
          '바다',
          '강',
          '선장',
          '출항',
          '닻',
          '어선',
          '여객선',
          '노',
          '항해',
        ],
        weight: 0.3,
      },
      {
        id: 'pear',
        en: 'pear',
        domain: 'food',
        triggers: ['과일', '달', '깎', '사과', '맛있', '포도', '수박', '먹', '익', '달콤'],
        weight: 0.2,
      },
      {
        id: 'times',
        en: 'times',
        domain: 'math',
        triggers: ['두', '세', '열', '몇', '배로', '증가', '감소', '곱', '몇배', '백'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '눈',
    senses: [
      {
        id: 'eye',
        en: 'eye',
        domain: 'body',
        triggers: [
          '보',
          '감',
          '감았',
          '감아',
          '뜨',
          '떴',
          '시력',
          '안과',
          '눈물',
          '눈썹',
          '깜빡',
          '멀',
          '충혈',
          '감다',
          '뜨다',
          '떠',
          '크',
          '예쁜',
        ],
        weight: 0.45,
      },
      {
        id: 'snow',
        en: 'snow',
        domain: 'weather',
        triggers: [
          '오',
          '와',
          '내리',
          '내려',
          '내렸',
          '쌓이',
          '쌓여',
          '쌓였',
          '녹',
          '겨울',
          '눈사람',
          '하얗',
          '하얀',
          '펑펑',
          '눈송이',
          '제설',
          '흰',
        ],
        weight: 0.45,
      },
      {
        id: 'bud',
        en: 'bud',
        domain: 'plant',
        triggers: ['새', '트', '봄', '싹', '나무', '새싹'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '밤',
    senses: [
      {
        id: 'night',
        en: 'night',
        domain: 'time',
        triggers: [
          '어둡',
          '자',
          '늦',
          '새벽',
          '저녁',
          '달',
          '별',
          '캄캄',
          '야간',
          '밤늦',
          '밤새',
          '하루',
        ],
        weight: 0.6,
      },
      {
        id: 'chestnut',
        en: 'chestnut',
        domain: 'food',
        triggers: ['먹', '구워', '맛', '과일', '껍질', '알밤', '군밤', '달', '가을', '줍', '까'],
        weight: 0.4,
      },
    ],
  },
  {
    word: '차',
    senses: [
      {
        id: 'car',
        en: 'car',
        domain: 'transport',
        triggers: [
          '타',
          '타고',
          '운전',
          '주차',
          '도로',
          '교통',
          '자동차',
          '버스',
          '택시',
          '몰',
          '출근',
          '퇴근',
          '드라이브',
        ],
        weight: 0.5,
      },
      {
        id: 'tea',
        en: 'tea',
        domain: 'food',
        triggers: [
          '마시',
          '마셔',
          '뜨거',
          '녹차',
          '홍차',
          '따뜻',
          '카페',
          '끓이',
          '우려',
          '잔',
          '티',
        ],
        weight: 0.35,
      },
      {
        id: 'difference',
        en: 'difference',
        domain: 'math',
        triggers: ['크', '작', '많', '적', '나이', '점수', '온도', '격차', '벌어지'],
        weight: 0.15,
      },
    ],
  },
  {
    word: '말',
    senses: [
      {
        id: 'word',
        en: 'word',
        domain: 'language',
        triggers: [
          '하',
          '했',
          '해',
          '듣',
          '들',
          '전하',
          '대화',
          '이야기',
          '말씀',
          '표현',
          '발음',
          '언어',
          '통하',
        ],
        weight: 0.6,
      },
      {
        id: 'horse',
        en: 'horse',
        domain: 'animal',
        triggers: [
          '타',
          '탔',
          '타고',
          '달리',
          '경마',
          '마구간',
          '기마',
          '조랑말',
          '말발굽',
          '안장',
        ],
        weight: 0.3,
      },
      {
        id: 'end',
        en: 'end',
        domain: 'time',
        triggers: ['끝', '마지막', '월말', '연말', '학기', '년', '달', '급여', '마감'],
        weight: 0.15,
      },
    ],
  },
  {
    word: '손',
    senses: [
      {
        id: 'hand',
        en: 'hand',
        domain: 'body',
        triggers: ['잡', '흔들', '씻', '손가락', '손톱', '손목', '박수', '만지', '들'],
        weight: 0.8,
      },
      {
        id: 'guest',
        en: 'guest',
        domain: 'social',
        triggers: ['오', '맞', '접대', '손님', '방문', '찾아오', '대접'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '발',
    senses: [
      {
        id: 'foot',
        en: 'foot',
        domain: 'body',
        triggers: ['걷', '뛰', '발가락', '발목', '신발', '밟', '디디', '아프'],
        weight: 0.8,
      },
      {
        id: 'departure',
        en: 'departure',
        domain: 'transport',
        triggers: ['출발', '서울', '부산', '비행기', '기차', '버스', '행'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '길',
    senses: [
      {
        id: 'road',
        en: 'road',
        domain: 'place',
        triggers: ['걷', '건너', '도로', '골목', '거리', '지나', '막히', '넓'],
        weight: 0.7,
      },
      {
        id: 'method',
        en: 'way',
        domain: 'abstract',
        triggers: ['찾', '방법', '해결', '방향', '없', '있', '모르', '알'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '병',
    senses: [
      {
        id: 'bottle',
        en: 'bottle',
        domain: 'object',
        triggers: ['물', '술', '음료', '담', '뚜껑', '유리', '플라스틱', '따'],
        weight: 0.5,
      },
      {
        id: 'illness',
        en: 'illness',
        domain: 'health',
        triggers: ['걸리', '아프', '치료', '병원', '낫', '고치', '환자', '증상'],
        weight: 0.5,
      },
    ],
  },
  {
    word: '달',
    senses: [
      {
        id: 'moon',
        en: 'moon',
        domain: 'nature',
        triggers: ['뜨', '밤', '하늘', '별', '보름달', '초승달', '밝', '빛'],
        weight: 0.5,
      },
      {
        id: 'month',
        en: 'month',
        domain: 'time',
        triggers: ['지나', '전', '후', '몇', '이번', '다음', '지난', '한'],
        weight: 0.5,
      },
    ],
  },
  {
    word: '머리',
    senses: [
      {
        id: 'head',
        en: 'head',
        domain: 'body',
        triggers: ['아프', '감', '두통', '숙이', '들', '흔들', '부딪히', '다치'],
        weight: 0.6,
      },
      {
        id: 'hair',
        en: 'hair',
        domain: 'body',
        triggers: ['자르', '기르', '염색', '파마', '빗', '감', '긴', '짧'],
        weight: 0.3,
      },
      {
        id: 'intelligence',
        en: 'mind',
        domain: 'abstract',
        triggers: ['좋', '나쁘', '똑똑', '돌아가', '쓰'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '목',
    senses: [
      {
        id: 'neck',
        en: 'neck',
        domain: 'body',
        triggers: ['아프', '돌리', '목걸이', '목도리', '뻣뻣', '숙이'],
        weight: 0.5,
      },
      {
        id: 'throat',
        en: 'throat',
        domain: 'body',
        triggers: ['마르', '아프', '목소리', '삼키', '막히', '기침'],
        weight: 0.4,
      },
      {
        id: 'lumber',
        en: 'wood',
        domain: 'material',
        triggers: ['나무', '재목', '건축'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '코',
    senses: [
      {
        id: 'nose',
        en: 'nose',
        domain: 'body',
        triggers: ['냄새', '맡', '콧물', '코피', '풀', '막히', '높'],
        weight: 0.9,
      },
      {
        id: 'stitch',
        en: 'stitch',
        domain: 'craft',
        triggers: ['뜨개질', '바늘', '실', '한'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '귀',
    senses: [
      {
        id: 'ear',
        en: 'ear',
        domain: 'body',
        triggers: ['듣', '소리', '이어폰', '귀걸이', '아프', '막히'],
        weight: 0.9,
      },
      {
        id: 'corner',
        en: 'corner',
        domain: 'object',
        triggers: ['모서리', '책', '종이', '접'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '입',
    senses: [
      {
        id: 'mouth',
        en: 'mouth',
        domain: 'body',
        triggers: ['벌리', '다물', '말', '먹', '입술', '맛', '씹'],
        weight: 0.9,
      },
      {
        id: 'entrance',
        en: 'entrance',
        domain: 'place',
        triggers: ['건물', '문', '들어가', '출입구'],
        weight: 0.1,
      },
    ],
  },

  // ========================================
  // 동사/형용사 (Verbs/Adjectives)
  // ========================================
  {
    word: '쓰',
    senses: [
      {
        id: 'write',
        en: 'write',
        domain: 'action',
        triggers: ['글', '편지', '일기', '연필', '펜', '종이', '문서', '메모'],
        weight: 0.4,
      },
      {
        id: 'wear',
        en: 'wear',
        domain: 'action',
        triggers: ['모자', '안경', '마스크', '머리', '얼굴'],
        weight: 0.3,
      },
      {
        id: 'use',
        en: 'use',
        domain: 'action',
        triggers: ['돈', '에너지', '힘', '시간', '사용'],
        weight: 0.2,
      },
      {
        id: 'bitter',
        en: 'bitter',
        domain: 'taste',
        triggers: ['맛', '약', '커피', '쓴맛'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '타',
    senses: [
      {
        id: 'ride',
        en: 'ride',
        domain: 'transport',
        triggers: ['버스', '차', '지하철', '비행기', '자전거', '말', '배'],
        weight: 0.5,
      },
      {
        id: 'burn',
        en: 'burn',
        domain: 'fire',
        triggers: ['불', '타오르', '재', '연기', '화상', '그을'],
        weight: 0.3,
      },
      {
        id: 'receive',
        en: 'receive',
        domain: 'action',
        triggers: ['월급', '급여', '선물', '상', '보너스'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '걸',
    senses: [
      {
        id: 'hang',
        en: 'hang',
        domain: 'action',
        triggers: ['벽', '옷걸이', '그림', '사진', '걸어놓'],
        weight: 0.4,
      },
      {
        id: 'call',
        en: 'call',
        domain: 'communication',
        triggers: ['전화', '연락', '통화'],
        weight: 0.4,
      },
      {
        id: 'bet',
        en: 'bet',
        domain: 'action',
        triggers: ['내기', '돈', '거', '도박'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '차다',
    senses: [
      {
        id: 'kick',
        en: 'kick',
        domain: 'action',
        triggers: ['공', '축구', '발로', '찼'],
        weight: 0.4,
      },
      {
        id: 'cold',
        en: 'cold',
        domain: 'temperature',
        triggers: ['물', '바람', '날씨', '손'],
        weight: 0.4,
      },
      {
        id: 'full',
        en: 'full',
        domain: 'state',
        triggers: ['시간', '기한', '가득'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '빠지',
    senses: [
      {
        id: 'fall',
        en: 'fall',
        domain: 'movement',
        triggers: ['물', '구멍', '함정', '웅덩이', '떨어지'],
        weight: 0.4,
      },
      {
        id: 'missing',
        en: 'missing',
        domain: 'state',
        triggers: ['없', '제외', '이빨', '단추', '부품'],
        weight: 0.3,
      },
      {
        id: 'absorbed',
        en: 'absorbed',
        domain: 'emotion',
        triggers: ['게임', '사랑', '매력', '빠져들', '헤어나'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '들',
    senses: [
      {
        id: 'hold',
        en: 'hold',
        domain: 'action',
        triggers: ['손', '가방', '물건', '잡', '들고'],
        weight: 0.3,
      },
      {
        id: 'enter',
        en: 'enter',
        domain: 'movement',
        triggers: ['방', '집', '안', '들어가', '들어오'],
        weight: 0.3,
      },
      {
        id: 'cost',
        en: 'cost',
        domain: 'money',
        triggers: ['돈', '비용', '얼마', '많이'],
        weight: 0.2,
      },
      {
        id: 'like',
        en: 'like',
        domain: 'emotion',
        triggers: ['마음', '맘', '기분', '들다'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '나',
    senses: [
      {
        id: 'occur',
        en: 'occur',
        domain: 'event',
        triggers: ['문제', '사고', '일', '사건', '발생'],
        weight: 0.4,
      },
      {
        id: 'grow',
        en: 'grow',
        domain: 'biology',
        triggers: ['나이', '풀', '싹', '자라'],
        weight: 0.3,
      },
      {
        id: 'exit',
        en: 'exit',
        domain: 'movement',
        triggers: ['밖', '나가', '나오', '떠나'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '보',
    senses: [
      {
        id: 'see',
        en: 'see',
        domain: 'perception',
        triggers: ['눈', '영화', 'TV', '보이', '시청', '구경'],
        weight: 0.6,
      },
      {
        id: 'try',
        en: 'try',
        domain: 'action',
        triggers: ['해보', '먹어보', '가보', '시도'],
        weight: 0.2,
      },
      {
        id: 'than',
        en: 'than',
        domain: 'comparison',
        triggers: ['비해', '보다', '크', '작', '더'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '풀',
    senses: [
      {
        id: 'solve',
        en: 'solve',
        domain: 'action',
        triggers: ['문제', '수학', '퀴즈', '답'],
        weight: 0.4,
      },
      {
        id: 'untie',
        en: 'untie',
        domain: 'action',
        triggers: ['끈', '매듭', '묶', '옷'],
        weight: 0.3,
      },
      {
        id: 'grass',
        en: 'grass',
        domain: 'plant',
        triggers: ['뜯', '잔디', '초록', '풀밭'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '떨어지',
    senses: [
      {
        id: 'fall',
        en: 'fall',
        domain: 'movement',
        triggers: ['아래', '땅', '높', '떨어뜨리', '추락'],
        weight: 0.5,
      },
      {
        id: 'run_out',
        en: 'run out',
        domain: 'state',
        triggers: ['돈', '재료', '배터리', '다'],
        weight: 0.3,
      },
      {
        id: 'fail',
        en: 'fail',
        domain: 'result',
        triggers: ['시험', '합격', '불합격', '떨어졌'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '오르',
    senses: [
      {
        id: 'climb',
        en: 'climb',
        domain: 'movement',
        triggers: ['산', '계단', '위', '높', '올라가'],
        weight: 0.5,
      },
      {
        id: 'rise',
        en: 'rise',
        domain: 'change',
        triggers: ['가격', '온도', '물가', '증가', '올랐'],
        weight: 0.5,
      },
    ],
  },
  {
    word: '내리',
    senses: [
      {
        id: 'descend',
        en: 'descend',
        domain: 'movement',
        triggers: ['산', '계단', '아래', '내려가'],
        weight: 0.3,
      },
      {
        id: 'get_off',
        en: 'get off',
        domain: 'transport',
        triggers: ['버스', '지하철', '차', '택시'],
        weight: 0.3,
      },
      {
        id: 'fall_weather',
        en: 'fall',
        domain: 'weather',
        triggers: ['비', '눈', '우박', '날씨'],
        weight: 0.2,
      },
      {
        id: 'make_decision',
        en: 'make',
        domain: 'action',
        triggers: ['결정', '결론', '판단', '명령'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '돌',
    senses: [
      {
        id: 'turn',
        en: 'turn',
        domain: 'movement',
        triggers: ['돌아가', '돌리', '회전', '왼쪽', '오른쪽'],
        weight: 0.5,
      },
      {
        id: 'stone',
        en: 'stone',
        domain: 'object',
        triggers: ['던지', '바위', '돌멩이', '딱딱'],
        weight: 0.4,
      },
      {
        id: 'first_birthday',
        en: 'first birthday',
        domain: 'celebration',
        triggers: ['아기', '잔치', '생일'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '잡',
    senses: [
      {
        id: 'catch',
        en: 'catch',
        domain: 'action',
        triggers: ['손', '물고기', '공', '범인', '잡았'],
        weight: 0.5,
      },
      {
        id: 'hold',
        en: 'hold',
        domain: 'action',
        triggers: ['잡고', '손잡이', '붙잡'],
        weight: 0.3,
      },
      {
        id: 'book',
        en: 'book',
        domain: 'action',
        triggers: ['예약', '호텔', '식당', '자리'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '세',
    senses: [
      {
        id: 'count',
        en: 'count',
        domain: 'action',
        triggers: ['숫자', '세어', '셈', '계산'],
        weight: 0.4,
      },
      {
        id: 'strong',
        en: 'strong',
        domain: 'intensity',
        triggers: ['힘', '바람', '물살', '세게'],
        weight: 0.3,
      },
      {
        id: 'rent',
        en: 'rent',
        domain: 'housing',
        triggers: ['집', '방', '월세', '전세'],
        weight: 0.2,
      },
      {
        id: 'age',
        en: 'years old',
        domain: 'age',
        triggers: ['살', '나이', '몇'],
        weight: 0.1,
      },
    ],
  },

  // ========================================
  // 추가 다의어 (30개)
  // ========================================
  {
    word: '자리',
    senses: [
      {
        id: 'seat',
        en: 'seat',
        domain: 'place',
        triggers: ['앉', '빈', '예약', '좌석'],
        weight: 0.5,
      },
      {
        id: 'position',
        en: 'position',
        domain: 'job',
        triggers: ['직위', '자리', '승진', '부장'],
        weight: 0.3,
      },
      {
        id: 'spot',
        en: 'spot',
        domain: 'place',
        triggers: ['장소', '위치', '그'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '물',
    senses: [
      {
        id: 'water',
        en: 'water',
        domain: 'nature',
        triggers: ['마시', '끓이', '차가운', '따뜻한', '수돗물', '생수'],
        weight: 0.8,
      },
      {
        id: 'bite',
        en: 'bite',
        domain: 'action',
        triggers: ['개', '뱀', '물렸', '이빨'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '불',
    senses: [
      {
        id: 'fire',
        en: 'fire',
        domain: 'element',
        triggers: ['끄', '켜', '타', '뜨거운', '화재', '불꽃'],
        weight: 0.5,
      },
      {
        id: 'light',
        en: 'light',
        domain: 'illumination',
        triggers: ['전등', '스위치', '밝', '어두운'],
        weight: 0.3,
      },
      {
        id: 'call_verb',
        en: 'call',
        domain: 'action',
        triggers: ['부르', '노래', '이름'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '바람',
    senses: [
      {
        id: 'wind',
        en: 'wind',
        domain: 'weather',
        triggers: ['불', '세', '시원한', '차가운', '태풍'],
        weight: 0.6,
      },
      {
        id: 'wish',
        en: 'wish',
        domain: 'desire',
        triggers: ['있', '소원', '희망', '바라'],
        weight: 0.2,
      },
      {
        id: 'affair',
        en: 'affair',
        domain: 'relationship',
        triggers: ['피우', '남편', '아내'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '하늘',
    senses: [
      {
        id: 'sky',
        en: 'sky',
        domain: 'nature',
        triggers: ['파란', '구름', '해', '달', '별', '높'],
        weight: 0.8,
      },
      {
        id: 'heaven',
        en: 'heaven',
        domain: 'religion',
        triggers: ['신', '천국', '죽', '기도'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '땅',
    senses: [
      {
        id: 'ground',
        en: 'ground',
        domain: 'place',
        triggers: ['바닥', '떨어지', '밟', '흙'],
        weight: 0.5,
      },
      {
        id: 'land',
        en: 'land',
        domain: 'property',
        triggers: ['사', '팔', '부동산', '소유'],
        weight: 0.5,
      },
    ],
  },
  {
    word: '소리',
    senses: [
      {
        id: 'sound',
        en: 'sound',
        domain: 'perception',
        triggers: ['듣', '나', '시끄러운', '조용한', '음악'],
        weight: 0.7,
      },
      {
        id: 'voice',
        en: 'voice',
        domain: 'body',
        triggers: ['목', '크', '작', '말'],
        weight: 0.2,
      },
      {
        id: 'nonsense',
        en: 'nonsense',
        domain: 'language',
        triggers: ['무슨', '헛', '말도 안 되'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '마음',
    senses: [
      {
        id: 'heart',
        en: 'heart',
        domain: 'emotion',
        triggers: ['아프', '따뜻한', '착한', '마음이'],
        weight: 0.5,
      },
      {
        id: 'mind',
        en: 'mind',
        domain: 'thought',
        triggers: ['먹', '바꾸', '정하', '결정'],
        weight: 0.3,
      },
      {
        id: 'feeling',
        en: 'feeling',
        domain: 'emotion',
        triggers: ['기분', '느낌', '좋', '나쁜'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '사람',
    senses: [
      {
        id: 'person',
        en: 'person',
        domain: 'human',
        triggers: ['만나', '좋은', '나쁜', '그', '이'],
        weight: 0.7,
      },
      {
        id: 'people',
        en: 'people',
        domain: 'human',
        triggers: ['많', '없', '모든', '사람들'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '시간',
    senses: [
      {
        id: 'time',
        en: 'time',
        domain: 'time',
        triggers: ['없', '있', '걸리', '지나', '몇'],
        weight: 0.6,
      },
      {
        id: 'hour',
        en: 'hour',
        domain: 'time',
        triggers: ['한', '두', '세', '시간이'],
        weight: 0.4,
      },
    ],
  },
  {
    word: '집',
    senses: [
      {
        id: 'house',
        en: 'house',
        domain: 'building',
        triggers: ['살', '가', '크', '작', '지'],
        weight: 0.6,
      },
      {
        id: 'home',
        en: 'home',
        domain: 'place',
        triggers: ['돌아가', '그리운', '편한'],
        weight: 0.3,
      },
      {
        id: 'restaurant',
        en: 'restaurant',
        domain: 'food',
        triggers: ['국밥', '냉면', '음식'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '일',
    senses: [
      {
        id: 'work',
        en: 'work',
        domain: 'job',
        triggers: ['하', '회사', '직장', '바쁜'],
        weight: 0.4,
      },
      {
        id: 'matter',
        en: 'matter',
        domain: 'event',
        triggers: ['생기', '있', '무슨', '그런'],
        weight: 0.3,
      },
      {
        id: 'day',
        en: 'day',
        domain: 'time',
        triggers: ['월', '화', '수', '며칠'],
        weight: 0.2,
      },
      {
        id: 'one',
        en: 'one',
        domain: 'number',
        triggers: ['번', '첫', '하나'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '곳',
    senses: [
      {
        id: 'place',
        en: 'place',
        domain: 'location',
        triggers: ['어디', '여기', '저기', '그'],
        weight: 0.7,
      },
      {
        id: 'spot',
        en: 'spot',
        domain: 'location',
        triggers: ['좋은', '예쁜', '특별한'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '생각',
    senses: [
      {
        id: 'thought',
        en: 'thought',
        domain: 'mind',
        triggers: ['좋은', '나쁜', '그런', '어떤'],
        weight: 0.5,
      },
      {
        id: 'idea',
        en: 'idea',
        domain: 'mind',
        triggers: ['새로운', '좋은', '있'],
        weight: 0.3,
      },
      {
        id: 'opinion',
        en: 'opinion',
        domain: 'mind',
        triggers: ['제', '내', '당신'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '문',
    senses: [
      {
        id: 'door',
        en: 'door',
        domain: 'object',
        triggers: ['열', '닫', '잠그', '두드리'],
        weight: 0.6,
      },
      {
        id: 'gate',
        en: 'gate',
        domain: 'object',
        triggers: ['정문', '후문', '대문'],
        weight: 0.2,
      },
      {
        id: 'question',
        en: 'question',
        domain: 'language',
        triggers: ['몇', '번', '문제'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '방',
    senses: [
      {
        id: 'room',
        en: 'room',
        domain: 'place',
        triggers: ['안', '들어가', '크', '작'],
        weight: 0.7,
      },
      {
        id: 'method',
        en: 'method',
        domain: 'abstract',
        triggers: ['좋은', '다른', '이런', '방법'],
        weight: 0.2,
      },
      {
        id: 'direction',
        en: 'direction',
        domain: 'place',
        triggers: ['이', '저', '그', '방향'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '가게',
    senses: [
      {
        id: 'store',
        en: 'store',
        domain: 'business',
        triggers: ['열', '닫', '가', '근처'],
        weight: 0.9,
      },
      {
        id: 'go_informal',
        en: 'go',
        domain: 'movement',
        triggers: ['학교', '집', '회사'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '끝',
    senses: [
      {
        id: 'end',
        en: 'end',
        domain: 'state',
        triggers: ['시작', '나', '마지막', '처음'],
        weight: 0.6,
      },
      {
        id: 'tip',
        en: 'tip',
        domain: 'object',
        triggers: ['연필', '손가락', '코'],
        weight: 0.2,
      },
      {
        id: 'finish_verb',
        en: 'finish',
        domain: 'action',
        triggers: ['끝나', '끝내'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '가슴',
    senses: [
      {
        id: 'chest',
        en: 'chest',
        domain: 'body',
        triggers: ['아프', '펴', '두근거리'],
        weight: 0.5,
      },
      {
        id: 'heart',
        en: 'heart',
        domain: 'emotion',
        triggers: ['아프', '뛰', '설레', '두근'],
        weight: 0.5,
      },
    ],
  },
  {
    word: '피',
    senses: [
      {
        id: 'blood',
        en: 'blood',
        domain: 'body',
        triggers: ['나', '흘리', '빨간', '수혈'],
        weight: 0.6,
      },
      {
        id: 'avoid',
        en: 'avoid',
        domain: 'action',
        triggers: ['피하', '위험', '사람'],
        weight: 0.2,
      },
      {
        id: 'bloom',
        en: 'bloom',
        domain: 'plant',
        triggers: ['꽃', '피우', '봄'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '사과',
    senses: [
      {
        id: 'apple',
        en: 'apple',
        domain: 'food',
        triggers: ['먹', '깎', '빨간', '과일', '달', '맛있'],
        weight: 0.5,
      },
      {
        id: 'apology',
        en: 'apology',
        domain: 'social',
        triggers: ['하', '받', '진심', '용서', '사과하', '했', '드리'],
        weight: 0.5,
      },
    ],
  },
  {
    word: '다리',
    senses: [
      {
        id: 'leg',
        en: 'leg',
        domain: 'body',
        triggers: ['아프', '다쳤', '걷', '뛰', '근육', '무릎', '발'],
        weight: 0.5,
      },
      {
        id: 'bridge',
        en: 'bridge',
        domain: 'structure',
        triggers: ['건너', '강', '위', '놓', '다리 위', '다리를 건너'],
        weight: 0.5,
      },
    ],
  },

  // ========================================
  // 추가 다의어 (50개 → 100개+)
  // ========================================
  {
    word: '감',
    senses: [
      {
        id: 'persimmon',
        en: 'persimmon',
        domain: 'food',
        triggers: ['먹', '익', '달', '과일', '가을', '떫', '홍시', '곶감'],
        weight: 0.4,
      },
      {
        id: 'sense',
        en: 'sense',
        domain: 'abstract',
        triggers: ['있', '없', '좋', '감각', '느낌', '음악', '리듬'],
        weight: 0.3,
      },
      {
        id: 'close_eyes',
        en: 'close',
        domain: 'action',
        triggers: ['눈', '감았', '감아', '감고'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '가지',
    senses: [
      {
        id: 'eggplant',
        en: 'eggplant',
        domain: 'food',
        triggers: ['먹', '요리', '볶', '채소', '보라색'],
        weight: 0.3,
      },
      {
        id: 'branch',
        en: 'branch',
        domain: 'plant',
        triggers: ['나무', '꺾', '뻗', '잎', '자르'],
        weight: 0.3,
      },
      {
        id: 'kind',
        en: 'kind',
        domain: 'abstract',
        triggers: ['여러', '몇', '한', '두', '세', '종류'],
        weight: 0.4,
      },
    ],
  },
  {
    word: '이',
    senses: [
      // 지시형용사/대명사가 가장 흔한 용법 (이 책, 이 사람, 이것 등)
      // 단독 '이'가 명사 앞에 올 때 대부분 'this'
      {
        id: 'this',
        en: 'this',
        domain: 'pronoun',
        triggers: [
          '것',
          '사람',
          '분',
          '곳',
          '책',
          '집',
          '날',
          '번',
          '때',
          '자리',
          '일',
          '문제',
          '방법',
          '경우',
          '정도',
          '상황',
          '이유',
          '점',
          '부분',
        ],
        weight: 0.6,
      },
      // 치아는 보통 조사와 함께 사용: '이를', '이가' + 닦다/빠지다/아프다
      {
        id: 'tooth',
        en: 'tooth',
        domain: 'body',
        triggers: ['아프', '빠지', '닦', '충치', '치과', '씹', '이빨', '치통'],
        weight: 0.3,
      },
      {
        id: 'louse',
        en: 'louse',
        domain: 'insect',
        triggers: ['잡', '옮', '생기', '머릿'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '파',
    senses: [
      {
        id: 'green_onion',
        en: 'green onion',
        domain: 'food',
        triggers: ['넣', '썰', '파전', '양념', '국'],
        weight: 0.5,
      },
      {
        id: 'wave',
        en: 'wave',
        domain: 'physics',
        triggers: ['전자', '음', '빛', '주파수', '진동'],
        weight: 0.3,
      },
      {
        id: 'faction',
        en: 'faction',
        domain: 'social',
        triggers: ['정치', '당', '파벌', '세력'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '속',
    senses: [
      {
        id: 'inside',
        en: 'inside',
        domain: 'place',
        triggers: ['안', '들어가', '넣', '있'],
        weight: 0.4,
      },
      {
        id: 'stomach',
        en: 'stomach',
        domain: 'body',
        triggers: ['아프', '불편', '쓰리', '더부룩', '소화'],
        weight: 0.3,
      },
      {
        id: 'speed',
        en: 'speed',
        domain: 'movement',
        triggers: ['빠른', '느린', '속도', '속력'],
        weight: 0.2,
      },
      {
        id: 'mind',
        en: 'mind',
        domain: 'emotion',
        triggers: ['마음', '생각', '시원', '후련'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '약',
    senses: [
      {
        id: 'medicine',
        en: 'medicine',
        domain: 'health',
        triggers: ['먹', '처방', '병원', '약국', '복용', '효과'],
        weight: 0.6,
      },
      {
        id: 'about',
        en: 'about',
        domain: 'quantity',
        triggers: ['분', '시간', '명', '개', '정도'],
        weight: 0.3,
      },
      {
        id: 'weak',
        en: 'weak',
        domain: 'state',
        triggers: ['강', '점', '하', '체력'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '판',
    senses: [
      {
        id: 'board',
        en: 'board',
        domain: 'object',
        triggers: ['나무', '칠', '바둑', '체스'],
        weight: 0.3,
      },
      {
        id: 'round',
        en: 'round',
        domain: 'game',
        triggers: ['한', '두', '세', '게임', '경기', '이기', '지'],
        weight: 0.4,
      },
      {
        id: 'scene',
        en: 'scene',
        domain: 'situation',
        triggers: ['벌어지', '난리', '아수라장', '상황'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '잔',
    senses: [
      {
        id: 'cup',
        en: 'cup',
        domain: 'object',
        triggers: ['마시', '커피', '차', '술', '물', '한'],
        weight: 0.7,
      },
      {
        id: 'remaining',
        en: 'remaining',
        domain: 'state',
        triggers: ['남', '돈', '시간', '잔액'],
        weight: 0.2,
      },
      {
        id: 'small',
        en: 'small',
        domain: 'size',
        triggers: ['잔물결', '잔돈', '자잘'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '장',
    senses: [
      {
        id: 'sheet',
        en: 'sheet',
        domain: 'object',
        triggers: ['종이', '한', '두', '몇', '카드'],
        weight: 0.3,
      },
      {
        id: 'chapter',
        en: 'chapter',
        domain: 'document',
        triggers: ['책', '소설', '제', '마지막'],
        weight: 0.2,
      },
      {
        id: 'market',
        en: 'market',
        domain: 'place',
        triggers: ['시장', '가', '보', '재래'],
        weight: 0.2,
      },
      {
        id: 'intestine',
        en: 'intestine',
        domain: 'body',
        triggers: ['대장', '소장', '위', '소화'],
        weight: 0.2,
      },
      {
        id: 'sauce',
        en: 'sauce',
        domain: 'food',
        triggers: ['간장', '된장', '고추장', '양념'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '차례',
    senses: [
      {
        id: 'turn',
        en: 'turn',
        domain: 'order',
        triggers: ['내', '네', '기다리', '다음', '돌아오'],
        weight: 0.5,
      },
      {
        id: 'ritual',
        en: 'ancestral rite',
        domain: 'culture',
        triggers: ['설날', '추석', '명절', '지내', '제사'],
        weight: 0.3,
      },
      {
        id: 'times',
        en: 'times',
        domain: 'quantity',
        triggers: ['한', '두', '세', '여러', '번'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '권',
    senses: [
      {
        id: 'volume',
        en: 'volume',
        domain: 'document',
        triggers: ['책', '한', '두', '전집', '시리즈'],
        weight: 0.4,
      },
      {
        id: 'right',
        en: 'right',
        domain: 'legal',
        triggers: ['투표', '인', '소유', '저작', '권리'],
        weight: 0.4,
      },
      {
        id: 'ticket',
        en: 'ticket',
        domain: 'object',
        triggers: ['입장', '승차', '한', '샀'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '기',
    senses: [
      {
        id: 'energy',
        en: 'energy',
        domain: 'abstract',
        triggers: ['받', '빠지', '살리', '기운', '활력'],
        weight: 0.3,
      },
      {
        id: 'period',
        en: 'period',
        domain: 'time',
        triggers: ['1', '2', '3', '분기', '학기'],
        weight: 0.3,
      },
      {
        id: 'machine',
        en: 'machine',
        domain: 'object',
        triggers: ['세탁', '청소', '기계', '작동'],
        weight: 0.2,
      },
      {
        id: 'flag',
        en: 'flag',
        domain: 'object',
        triggers: ['국', '태극', '휘날리', '걸'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '자',
    senses: [
      {
        id: 'ruler',
        en: 'ruler',
        domain: 'object',
        triggers: ['측정', '재', '길이', '30cm', '직'],
        weight: 0.3,
      },
      {
        id: 'person',
        en: 'person',
        domain: 'suffix',
        triggers: ['노동', '소비', '생산', '투자'],
        weight: 0.3,
      },
      {
        id: 'character',
        en: 'character',
        domain: 'language',
        triggers: ['글', '한', '문', '쓰'],
        weight: 0.2,
      },
      {
        id: 'lets',
        en: "let's",
        domain: 'action',
        triggers: ['가', '하', '먹', '보'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '수',
    senses: [
      {
        id: 'number',
        en: 'number',
        domain: 'math',
        triggers: ['많', '적', '숫자', '개', '계산'],
        weight: 0.4,
      },
      {
        id: 'method',
        en: 'method',
        domain: 'abstract',
        triggers: ['없', '있', '좋은', '나쁜', '방법'],
        weight: 0.3,
      },
      {
        id: 'embroidery',
        en: 'embroidery',
        domain: 'craft',
        triggers: ['놓', '자수', '바늘', '실'],
        weight: 0.1,
      },
      {
        id: 'male',
        en: 'male',
        domain: 'gender',
        triggers: ['암', '동물', '수컷'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '면',
    senses: [
      {
        id: 'noodle',
        en: 'noodle',
        domain: 'food',
        triggers: ['먹', '삶', '라면', '국수', '비빔'],
        weight: 0.3,
      },
      {
        id: 'surface',
        en: 'surface',
        domain: 'object',
        triggers: ['표', '바닥', '옆', '윗', '아랫'],
        weight: 0.3,
      },
      {
        id: 'cotton',
        en: 'cotton',
        domain: 'material',
        triggers: ['100%', '순', '원단', '옷'],
        weight: 0.2,
      },
      {
        id: 'if',
        en: 'if',
        domain: 'grammar',
        triggers: ['하', '가', '오', '본다'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '점',
    senses: [
      {
        id: 'point',
        en: 'point',
        domain: 'math',
        triggers: ['득', '몇', '백', '만', '점수'],
        weight: 0.3,
      },
      {
        id: 'dot',
        en: 'dot',
        domain: 'shape',
        triggers: ['찍', '작은', '빨간', '검은'],
        weight: 0.2,
      },
      {
        id: 'store',
        en: 'store',
        domain: 'business',
        triggers: ['가게', '매장', '본', '지'],
        weight: 0.2,
      },
      {
        id: 'mole',
        en: 'mole',
        domain: 'body',
        triggers: ['얼굴', '피부', '빼', '생기'],
        weight: 0.2,
      },
      {
        id: 'fortune',
        en: 'fortune telling',
        domain: 'culture',
        triggers: ['보', '운세', '사주', '점쟁이'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '끼',
    senses: [
      {
        id: 'meal',
        en: 'meal',
        domain: 'food',
        triggers: ['한', '두', '세', '밥', '식사', '굶'],
        weight: 0.5,
      },
      {
        id: 'talent',
        en: 'talent',
        domain: 'ability',
        triggers: ['있', '없', '보이', '연기', '재능'],
        weight: 0.3,
      },
      {
        id: 'insert',
        en: 'insert',
        domain: 'action',
        triggers: ['끼우', '넣', '사이', '손가락'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '뜻',
    senses: [
      {
        id: 'meaning',
        en: 'meaning',
        domain: 'language',
        triggers: ['단어', '무슨', '알', '모르', '사전'],
        weight: 0.5,
      },
      {
        id: 'will',
        en: 'will',
        domain: 'emotion',
        triggers: ['대로', '펼치', '이루', '품', '뜻대로'],
        weight: 0.3,
      },
      {
        id: 'intention',
        en: 'intention',
        domain: 'abstract',
        triggers: ['좋', '나쁜', '없', '있'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '살',
    senses: [
      {
        id: 'flesh',
        en: 'flesh',
        domain: 'body',
        triggers: ['빠지', '찌', '살이', '근육', '뼈'],
        weight: 0.4,
      },
      {
        id: 'live',
        en: 'live',
        domain: 'life',
        triggers: ['어디', '집', '서울', '한국', '살고'],
        weight: 0.3,
      },
      {
        id: 'age',
        en: 'years old',
        domain: 'age',
        triggers: ['몇', '스무', '서른', '마흔', '나이'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '값',
    senses: [
      {
        id: 'price',
        en: 'price',
        domain: 'money',
        triggers: ['비싸', '싸', '얼마', '가격', '물건'],
        weight: 0.5,
      },
      {
        id: 'value',
        en: 'value',
        domain: 'math',
        triggers: ['변수', '계산', '입력', '출력', '수치'],
        weight: 0.3,
      },
      {
        id: 'worth',
        en: 'worth',
        domain: 'abstract',
        triggers: ['하', '없', '있', '가치'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '힘',
    senses: [
      {
        id: 'strength',
        en: 'strength',
        domain: 'body',
        triggers: ['세', '약', '없', '있', '빠지', '주'],
        weight: 0.5,
      },
      {
        id: 'power',
        en: 'power',
        domain: 'abstract',
        triggers: ['정치', '권력', '영향', '가지'],
        weight: 0.3,
      },
      {
        id: 'effort',
        en: 'effort',
        domain: 'action',
        triggers: ['들', '쓰', '모아', '힘들'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '굴',
    senses: [
      {
        id: 'oyster',
        en: 'oyster',
        domain: 'food',
        triggers: ['먹', '회', '굴전', '바다', '싱싱'],
        weight: 0.4,
      },
      {
        id: 'cave',
        en: 'cave',
        domain: 'place',
        triggers: ['동', '들어가', '어두운', '탐험'],
        weight: 0.3,
      },
      {
        id: 'roll',
        en: 'roll',
        domain: 'action',
        triggers: ['굴러', '구르', '바퀴', '공'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '벌',
    senses: [
      {
        id: 'bee',
        en: 'bee',
        domain: 'insect',
        triggers: ['꿀', '쏘', '꽃', '날', '벌집', '침'],
        weight: 0.4,
      },
      {
        id: 'punishment',
        en: 'punishment',
        domain: 'legal',
        triggers: ['받', '주', '벌금', '처', '형'],
        weight: 0.3,
      },
      {
        id: 'earn',
        en: 'earn',
        domain: 'money',
        triggers: ['돈', '벌었', '벌어', '수입'],
        weight: 0.2,
      },
      {
        id: 'set',
        en: 'set',
        domain: 'quantity',
        triggers: ['한', '두', '옷', '양복'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '곱',
    senses: [
      {
        id: 'multiply',
        en: 'multiply',
        domain: 'math',
        triggers: ['곱하', '셈', '계산', '배'],
        weight: 0.4,
      },
      {
        id: 'beautiful',
        en: 'beautiful',
        domain: 'appearance',
        triggers: ['곱다', '예쁘', '피부', '얼굴', '손'],
        weight: 0.4,
      },
      {
        id: 'intestine',
        en: 'tripe',
        domain: 'food',
        triggers: ['먹', '곱창', '구', '요리'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '재',
    senses: [
      {
        id: 'ash',
        en: 'ash',
        domain: 'material',
        triggers: ['불', '타', '담배', '화산', '남'],
        weight: 0.4,
      },
      {
        id: 'talent',
        en: 'talent',
        domain: 'ability',
        triggers: ['재능', '천', '있', '보이'],
        weight: 0.3,
      },
      {
        id: 'material',
        en: 'material',
        domain: 'object',
        triggers: ['목', '석', '재료', '건축'],
        weight: 0.2,
      },
      {
        id: 'again',
        en: 'again',
        domain: 'action',
        triggers: ['재시작', '재활용', '재사용'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '비',
    senses: [
      {
        id: 'rain',
        en: 'rain',
        domain: 'weather',
        triggers: ['오', '내리', '우산', '젖', '맞', '소나기'],
        weight: 0.5,
      },
      {
        id: 'ratio',
        en: 'ratio',
        domain: 'math',
        triggers: ['비율', '대', '비교', '황금', '황금비', '계산', '비례'],
        weight: 0.25,
      },
      {
        id: 'monument',
        en: 'monument',
        domain: 'object',
        triggers: ['세우', '비석', '묘', '기념'],
        weight: 0.2,
      },
      {
        id: 'non',
        en: 'non-',
        domain: 'prefix',
        triggers: ['비공개', '비정상', '비영리'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '짝',
    senses: [
      {
        id: 'pair',
        en: 'pair',
        domain: 'object',
        triggers: ['맞', '한', '양말', '신발', '짝꿍'],
        weight: 0.5,
      },
      {
        id: 'partner',
        en: 'partner',
        domain: 'social',
        triggers: ['찾', '없', '있', '만나', '춤'],
        weight: 0.3,
      },
      {
        id: 'odd',
        en: 'odd',
        domain: 'math',
        triggers: ['홀', '짝수', '번호'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '줄',
    senses: [
      {
        id: 'line',
        en: 'line',
        domain: 'object',
        triggers: ['서', '길', '기다리', '한', '두'],
        weight: 0.4,
      },
      {
        id: 'rope',
        en: 'rope',
        domain: 'object',
        triggers: ['묶', '당기', '줄넘기', '밧줄'],
        weight: 0.3,
      },
      {
        id: 'know_how',
        en: 'know how to',
        domain: 'ability',
        triggers: ['알', '모르', '할', '줄 알'],
        weight: 0.2,
      },
      {
        id: 'string',
        en: 'string',
        domain: 'music',
        triggers: ['기타', '바이올린', '현', '튕기'],
        weight: 0.1,
      },
    ],
  },

  // ========================================
  // 추가 다의어 (100개+ 달성)
  // ========================================
  {
    word: '대',
    senses: [
      {
        id: 'counter',
        en: 'unit',
        domain: 'quantity',
        triggers: ['한', '두', '차', '컴퓨터', '기계'],
        weight: 0.3,
      },
      {
        id: 'bamboo',
        en: 'bamboo',
        domain: 'plant',
        triggers: ['대나무', '숲', '자르'],
        weight: 0.2,
      },
      {
        id: 'versus',
        en: 'versus',
        domain: 'comparison',
        triggers: ['한국', '일본', '경기', '대결'],
        weight: 0.3,
      },
      {
        id: 'big',
        en: 'big',
        domain: 'size',
        triggers: ['소', '중', '사이즈', '크기'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '고',
    senses: [
      {
        id: 'high',
        en: 'high',
        domain: 'level',
        triggers: ['저', '중', '등급', '수준', '급'],
        weight: 0.3,
      },
      {
        id: 'and',
        en: 'and',
        domain: 'grammar',
        triggers: ['먹', '마시', '가', '오'],
        weight: 0.4,
      },
      {
        id: 'drum',
        en: 'drum',
        domain: 'instrument',
        triggers: ['북', '치', '소리', '장구'],
        weight: 0.2,
      },
      {
        id: 'late',
        en: 'late',
        domain: 'time',
        triggers: ['고인', '돌아가신', '할아버지'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '칼',
    senses: [
      {
        id: 'knife',
        en: 'knife',
        domain: 'object',
        triggers: ['자르', '썰', '날카로운', '부엌', '요리'],
        weight: 0.7,
      },
      {
        id: 'sword',
        en: 'sword',
        domain: 'weapon',
        triggers: ['휘두르', '싸움', '무사', '검'],
        weight: 0.2,
      },
      {
        id: 'strict',
        en: 'strict',
        domain: 'abstract',
        triggers: ['칼같이', '정확', '시간'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '꽃',
    senses: [
      {
        id: 'flower',
        en: 'flower',
        domain: 'plant',
        triggers: ['피', '꺾', '예쁜', '향기', '장미', '튤립'],
        weight: 0.8,
      },
      {
        id: 'prime',
        en: 'prime',
        domain: 'abstract',
        triggers: ['인생', '청춘', '전성기', '나이'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '나무',
    senses: [
      {
        id: 'tree',
        en: 'tree',
        domain: 'plant',
        triggers: ['심', '자라', '잎', '가지', '숲', '나뭇잎'],
        weight: 0.6,
      },
      {
        id: 'wood',
        en: 'wood',
        domain: 'material',
        triggers: ['만들', '가구', '재료', '단단한'],
        weight: 0.4,
      },
    ],
  },
  {
    word: '빛',
    senses: [
      {
        id: 'light',
        en: 'light',
        domain: 'physics',
        triggers: ['밝', '어둠', '햇', '태양', '전등'],
        weight: 0.6,
      },
      {
        id: 'color',
        en: 'color',
        domain: 'appearance',
        triggers: ['빨간', '파란', '색', '띠'],
        weight: 0.2,
      },
      {
        id: 'glory',
        en: 'glory',
        domain: 'abstract',
        triggers: ['영광', '빛나', '빛을 보'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '글',
    senses: [
      {
        id: 'writing',
        en: 'writing',
        domain: 'language',
        triggers: ['쓰', '읽', '작성', '짧은', '긴'],
        weight: 0.5,
      },
      {
        id: 'article',
        en: 'article',
        domain: 'document',
        triggers: ['올리', '게시', '블로그', '뉴스'],
        weight: 0.3,
      },
      {
        id: 'letter',
        en: 'letter',
        domain: 'language',
        triggers: ['한', '글자', '알파벳'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '돈',
    senses: [
      {
        id: 'money',
        en: 'money',
        domain: 'finance',
        triggers: ['벌', '쓰', '많', '없', '부자', '가난'],
        weight: 0.9,
      },
      {
        id: 'weight_unit',
        en: 'don',
        domain: 'unit',
        triggers: ['금', '은', '무게'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '거',
    senses: [
      {
        id: 'thing',
        en: 'thing',
        domain: 'pronoun',
        triggers: ['이', '그', '저', '뭐', '내'],
        weight: 0.6,
      },
      {
        id: 'living',
        en: 'living',
        domain: 'life',
        triggers: ['거주', '사', '있'],
        weight: 0.2,
      },
      {
        id: 'bet',
        en: 'bet',
        domain: 'action',
        triggers: ['걸', '내기', '도박'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '바닥',
    senses: [
      {
        id: 'floor',
        en: 'floor',
        domain: 'place',
        triggers: ['앉', '눕', '떨어지', '청소', '방'],
        weight: 0.5,
      },
      {
        id: 'bottom',
        en: 'bottom',
        domain: 'position',
        triggers: ['바다', '컵', '가방', '아래'],
        weight: 0.3,
      },
      {
        id: 'depleted',
        en: 'depleted',
        domain: 'state',
        triggers: ['나', '드러나', '체력', '돈'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '구름',
    senses: [
      {
        id: 'cloud',
        en: 'cloud',
        domain: 'weather',
        triggers: ['하늘', '비', '흰', '떠', '끼'],
        weight: 0.8,
      },
      {
        id: 'crowd',
        en: 'crowd',
        domain: 'social',
        triggers: ['사람', '인파', '몰려들'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '새',
    senses: [
      {
        id: 'bird',
        en: 'bird',
        domain: 'animal',
        triggers: ['날', '깃털', '울', '둥지', '참새', '비둘기'],
        weight: 0.5,
      },
      {
        id: 'new',
        en: 'new',
        domain: 'state',
        triggers: ['옷', '차', '집', '물건', '사'],
        weight: 0.4,
      },
      {
        id: 'gap',
        en: 'gap',
        domain: 'space',
        triggers: ['틈', '사이', '문', '새어나오'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '맛',
    senses: [
      {
        id: 'taste',
        en: 'taste',
        domain: 'food',
        triggers: ['좋', '없', '달', '짠', '쓴', '매운'],
        weight: 0.7,
      },
      {
        id: 'fun',
        en: 'fun',
        domain: 'emotion',
        triggers: ['재미', '느끼', '들이', '맛을 들이'],
        weight: 0.2,
      },
      {
        id: 'beaten',
        en: 'beaten',
        domain: 'action',
        triggers: ['맛을 보', '혼나', '당하'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '모양',
    senses: [
      {
        id: 'shape',
        en: 'shape',
        domain: 'appearance',
        triggers: ['동그란', '네모', '세모', '이상한', '예쁜'],
        weight: 0.5,
      },
      {
        id: 'seems',
        en: 'seems',
        domain: 'inference',
        triggers: ['인', '이다', '보이', '그런'],
        weight: 0.3,
      },
      {
        id: 'form',
        en: 'form',
        domain: 'state',
        triggers: ['좋', '나쁜', '이상한', '볼'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '봄',
    senses: [
      {
        id: 'spring',
        en: 'spring',
        domain: 'season',
        triggers: ['여름', '가을', '겨울', '꽃', '따뜻'],
        weight: 0.7,
      },
      {
        id: 'seeing',
        en: 'seeing',
        domain: 'perception',
        triggers: ['보', '시청', '구경'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '여름',
    senses: [
      {
        id: 'summer',
        en: 'summer',
        domain: 'season',
        triggers: ['봄', '가을', '겨울', '더운', '바다', '휴가'],
        weight: 0.9,
      },
      {
        id: 'heat',
        en: 'heat',
        domain: 'temperature',
        triggers: ['폭염', '더위', '무더운'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '가을',
    senses: [
      {
        id: 'autumn',
        en: 'autumn',
        domain: 'season',
        triggers: ['봄', '여름', '겨울', '단풍', '추석', '시원'],
        weight: 0.9,
      },
      {
        id: 'harvest',
        en: 'harvest',
        domain: 'agriculture',
        triggers: ['수확', '풍년', '곡식'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '겨울',
    senses: [
      {
        id: 'winter',
        en: 'winter',
        domain: 'season',
        triggers: ['봄', '여름', '가을', '추운', '눈', '크리스마스'],
        weight: 0.9,
      },
      {
        id: 'cold_period',
        en: 'cold period',
        domain: 'abstract',
        triggers: ['힘든', '시련', '시기'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '가방',
    senses: [
      {
        id: 'bag',
        en: 'bag',
        domain: 'object',
        triggers: ['들', '메', '넣', '지퍼', '학교'],
        weight: 0.9,
      },
      {
        id: 'briefcase',
        en: 'briefcase',
        domain: 'object',
        triggers: ['서류', '회사', '출근'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '창',
    senses: [
      {
        id: 'window',
        en: 'window',
        domain: 'object',
        triggers: ['열', '닫', '유리', '밖', '바라보'],
        weight: 0.5,
      },
      {
        id: 'spear',
        en: 'spear',
        domain: 'weapon',
        triggers: ['던지', '찌르', '무기', '방패'],
        weight: 0.2,
      },
      {
        id: 'computer_window',
        en: 'window',
        domain: 'computing',
        triggers: ['팝업', '닫기', '클릭', '프로그램'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '사진',
    senses: [
      {
        id: 'photo',
        en: 'photo',
        domain: 'media',
        triggers: ['찍', '찍히', '앨범', '카메라', '스마트폰'],
        weight: 0.9,
      },
      {
        id: 'picture',
        en: 'picture',
        domain: 'document',
        triggers: ['증명', '여권', '신분증'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '마당',
    senses: [
      {
        id: 'yard',
        en: 'yard',
        domain: 'place',
        triggers: ['집', '넓', '뛰놀', '잔디'],
        weight: 0.6,
      },
      {
        id: 'situation',
        en: 'situation',
        domain: 'abstract',
        triggers: ['어차피', '이미', '이런', '그런'],
        weight: 0.4,
      },
    ],
  },
  {
    word: '부',
    senses: [
      {
        id: 'wealth',
        en: 'wealth',
        domain: 'finance',
        triggers: ['귀', '부자', '가난', '재산'],
        weight: 0.3,
      },
      {
        id: 'department',
        en: 'department',
        domain: 'organization',
        triggers: ['국방', '외교', '재무', '장관'],
        weight: 0.3,
      },
      {
        id: 'copy',
        en: 'copy',
        domain: 'document',
        triggers: ['한', '두', '인쇄', '출력'],
        weight: 0.2,
      },
      {
        id: 'vice',
        en: 'vice',
        domain: 'position',
        triggers: ['장', '회장', '사장', '대표'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '통',
    senses: [
      {
        id: 'barrel',
        en: 'barrel',
        domain: 'object',
        triggers: ['물', '쓰레기', '담', '크'],
        weight: 0.4,
      },
      {
        id: 'through',
        en: 'through',
        domain: 'communication',
        triggers: ['전화', '편지', '이메일', '연락'],
        weight: 0.3,
      },
      {
        id: 'completely',
        en: 'completely',
        domain: 'degree',
        triggers: ['통째로', '다', '전부'],
        weight: 0.2,
      },
      {
        id: 'pain',
        en: 'pain',
        domain: 'body',
        triggers: ['두', '복', '아프'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '판단',
    senses: [
      {
        id: 'judgment',
        en: 'judgment',
        domain: 'thought',
        triggers: ['하', '내리', '옳', '그른', '잘못된'],
        weight: 0.7,
      },
      {
        id: 'decision',
        en: 'decision',
        domain: 'action',
        triggers: ['결정', '선택', '최종'],
        weight: 0.3,
      },
    ],
  },
  {
    word: '상',
    senses: [
      {
        id: 'prize',
        en: 'prize',
        domain: 'award',
        triggers: ['받', '주', '대', '노벨', '수상'],
        weight: 0.3,
      },
      {
        id: 'table',
        en: 'table',
        domain: 'object',
        triggers: ['밥', '차리', '식', '상다리'],
        weight: 0.3,
      },
      {
        id: 'image',
        en: 'image',
        domain: 'abstract',
        triggers: ['영', '인', '좋', '나쁜'],
        weight: 0.2,
      },
      {
        id: 'above',
        en: 'above',
        domain: 'position',
        triggers: ['하', '이', '그', '이상'],
        weight: 0.2,
      },
    ],
  },
  {
    word: '하',
    senses: [
      {
        id: 'do',
        en: 'do',
        domain: 'action',
        triggers: ['일', '공부', '운동', '게임'],
        weight: 0.6,
      },
      {
        id: 'below',
        en: 'below',
        domain: 'position',
        triggers: ['상', '중', '급', '이하'],
        weight: 0.2,
      },
      {
        id: 'summer',
        en: 'summer',
        domain: 'season',
        triggers: ['동', '하계', '올림픽'],
        weight: 0.2,
      },
    ],
  },
];

/**
 * 빠른 조회용 Map
 */
export const polysemyMap = new Map<string, Polysemy>(polysemyDict.map((p) => [p.word, p]));

/**
 * 다의어 여부 확인
 */
export function isPolysemous(word: string): boolean {
  return polysemyMap.has(word);
}

/**
 * 특정 단어의 모든 의미 가져오기
 */
export function getSenses(word: string): Sense[] | null {
  return polysemyMap.get(word)?.senses || null;
}
