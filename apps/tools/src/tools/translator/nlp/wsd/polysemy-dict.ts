// ========================================
// WSD - 다의어 사전 (Polysemy Dictionary)
// 50개 핵심 다의어 + 문맥 트리거
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
 * 다의어 사전 (50개 핵심 단어)
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
          '녹',
          '겨울',
          '눈사람',
          '하얗',
          '펑펑',
          '눈송이',
          '제설',
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
        triggers: ['끝', '마지막', '월말', '연말', '학기', '년', '달'],
        weight: 0.1,
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
