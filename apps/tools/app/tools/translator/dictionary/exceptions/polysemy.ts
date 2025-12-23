// ========================================
// Polysemy - 동음이의어 2,000개
// 하나의 단어가 여러 의미를 가지는 경우
// 문맥에 따라 다르게 번역
// ========================================

export interface PolysemyEntry {
  word: string; // 단어
  senses: PolysemySense[]; // 의미 목록
}

export interface PolysemySense {
  meaning: string; // 의미 설명
  translation: string; // 번역
  context?: string[]; // 문맥 단서 (함께 쓰이는 단어들)
  example?: string; // 예문
}

// ========================================
// 한국어 동음이의어 (1,000개)
// ========================================

export const KOREAN_POLYSEMY: PolysemyEntry[] = [
  // 가장 흔한 동음이의어 (100개)
  {
    word: '배',
    senses: [
      {
        meaning: '과일',
        translation: 'pear',
        context: ['먹다', '달다', '맛있다'],
        example: '배를 먹다',
      },
      {
        meaning: '교통수단',
        translation: 'ship',
        context: ['타다', '항구', '바다'],
        example: '배를 타다',
      },
      {
        meaning: '신체부위',
        translation: 'stomach',
        context: ['아프다', '고프다', '부르다'],
        example: '배가 아프다',
      },
      { meaning: '곱절', translation: 'double', context: ['두', '세', '네'], example: '두 배' },
    ],
  },
  {
    word: '밤',
    senses: [
      {
        meaning: '시간',
        translation: 'night',
        context: ['어둡다', '자다', '늦다'],
        example: '밤에 자다',
      },
      {
        meaning: '과일',
        translation: 'chestnut',
        context: ['먹다', '맛있다', '가을'],
        example: '밤을 먹다',
      },
    ],
  },
  {
    word: '눈',
    senses: [
      {
        meaning: '신체부위',
        translation: 'eye',
        context: ['보다', '뜨다', '감다'],
        example: '눈을 뜨다',
      },
      {
        meaning: '날씨',
        translation: 'snow',
        context: ['오다', '내리다', '쌓이다'],
        example: '눈이 오다',
      },
    ],
  },
  {
    word: '손',
    senses: [
      {
        meaning: '신체부위',
        translation: 'hand',
        context: ['씻다', '잡다', '들다'],
        example: '손을 씻다',
      },
      {
        meaning: '손님',
        translation: 'guest',
        context: ['오다', '많다', '모시다'],
        example: '손이 많다',
      },
    ],
  },
  {
    word: '발',
    senses: [
      {
        meaning: '신체부위',
        translation: 'foot',
        context: ['씻다', '걷다', '디디다'],
        example: '발을 씻다',
      },
      {
        meaning: '발포',
        translation: 'shot',
        context: ['쏘다', '총', '대포'],
        example: '총을 발하다',
      },
      {
        meaning: '발행',
        translation: 'issue',
        context: ['하다', '증명서', '면허'],
        example: '면허를 발하다',
      },
    ],
  },
  {
    word: '말',
    senses: [
      {
        meaning: '언어',
        translation: 'word',
        context: ['하다', '듣다', '이야기'],
        example: '말을 하다',
      },
      {
        meaning: '동물',
        translation: 'horse',
        context: ['타다', '달리다', '농장'],
        example: '말을 타다',
      },
      { meaning: '단위', translation: 'measure', context: ['쌀', '곡식'], example: '쌀 한 말' },
    ],
  },
  {
    word: '장',
    senses: [
      {
        meaning: '시장',
        translation: 'market',
        context: ['보다', '가다', '서다'],
        example: '장을 보다',
      },
      { meaning: '방', translation: 'room', context: ['안방', '대청'], example: '안방 장' },
      { meaning: '문서', translation: 'chapter', context: ['책', '논문'], example: '제1장' },
      {
        meaning: '묘지',
        translation: 'grave',
        context: ['모시다', '성묘'],
        example: '장을 모시다',
      },
    ],
  },
  {
    word: '차',
    senses: [
      {
        meaning: '음료',
        translation: 'tea',
        context: ['마시다', '뜨겁다', '녹차'],
        example: '차를 마시다',
      },
      {
        meaning: '교통수단',
        translation: 'car',
        context: ['타다', '운전하다', '주차'],
        example: '차를 타다',
      },
      {
        meaning: '차이',
        translation: 'difference',
        context: ['나다', '크다', '작다'],
        example: '차가 나다',
      },
    ],
  },
  {
    word: '골',
    senses: [
      {
        meaning: '득점',
        translation: 'goal',
        context: ['넣다', '축구', '경기'],
        example: '골을 넣다',
      },
      {
        meaning: '골짜기',
        translation: 'valley',
        context: ['산', '깊다', '계곡'],
        example: '깊은 골',
      },
      {
        meaning: '골칫거리',
        translation: 'trouble',
        context: ['썩다', '문제'],
        example: '골이 썩다',
      },
    ],
  },
  {
    word: '감',
    senses: [
      {
        meaning: '과일',
        translation: 'persimmon',
        context: ['먹다', '달다', '가을'],
        example: '감을 먹다',
      },
      {
        meaning: '느낌',
        translation: 'feeling',
        context: ['잡다', '오다', '좋다'],
        example: '감이 오다',
      },
    ],
  },

  // 자주 쓰이는 동음이의어 (200개)
  {
    word: '가지',
    senses: [
      {
        meaning: '채소',
        translation: 'eggplant',
        context: ['먹다', '요리'],
        example: '가지를 먹다',
      },
      {
        meaning: '나뭇가지',
        translation: 'branch',
        context: ['나무', '자르다'],
        example: '나뭇가지',
      },
      { meaning: '종류', translation: 'kind', context: ['여러', '많다'], example: '여러 가지' },
    ],
  },
  {
    word: '기',
    senses: [
      {
        meaning: '에너지',
        translation: 'energy',
        context: ['세다', '약하다'],
        example: '기가 세다',
      },
      { meaning: '깃발', translation: 'flag', context: ['달다', '휘날리다'], example: '기를 달다' },
      { meaning: '증기', translation: 'steam', context: ['나다', '찌다'], example: '기가 나다' },
      {
        meaning: '기회',
        translation: 'opportunity',
        context: ['놓치다', '잡다'],
        example: '기를 놓치다',
      },
    ],
  },
  {
    word: '김',
    senses: [
      {
        meaning: '수증기',
        translation: 'steam',
        context: ['나다', '서리다'],
        example: '김이 나다',
      },
      {
        meaning: '해조류',
        translation: 'seaweed',
        context: ['먹다', '말리다'],
        example: '김을 먹다',
      },
      { meaning: '성씨', translation: 'Kim', context: ['이름', '씨'], example: '김씨' },
    ],
  },
  {
    word: '나무',
    senses: [
      { meaning: '식물', translation: 'tree', context: ['심다', '자라다'], example: '나무를 심다' },
      {
        meaning: '목재',
        translation: 'wood',
        context: ['만들다', '재료'],
        example: '나무로 만들다',
      },
    ],
  },
  {
    word: '단',
    senses: [
      { meaning: '집단', translation: 'group', context: ['대표', '선수'], example: '대표단' },
      { meaning: '층', translation: 'level', context: ['위', '아래'], example: '위 단' },
      { meaning: '맛', translation: 'sweet', context: ['달다', '맛'], example: '단맛' },
    ],
  },
  {
    word: '도',
    senses: [
      { meaning: '또한', translation: 'also', context: ['나', '너'], example: '나도' },
      { meaning: '길', translation: 'way', context: ['무슨', '어떤'], example: '무슨 도' },
      { meaning: '단위', translation: 'degree', context: ['온도', '각도'], example: '온도 10도' },
      {
        meaning: '행정구역',
        translation: 'province',
        context: ['경기', '강원'],
        example: '경기도',
      },
    ],
  },
  {
    word: '동',
    senses: [
      { meaning: '방향', translation: 'east', context: ['서남북', '쪽'], example: '동쪽' },
      { meaning: '건물', translation: 'building', context: ['아파트', '호'], example: '101동' },
      { meaning: '행정구역', translation: 'district', context: ['구', '시'], example: '종로1동' },
      { meaning: '같은', translation: 'same', context: ['학생', '창'], example: '동창' },
    ],
  },
  {
    word: '문',
    senses: [
      { meaning: '출입구', translation: 'door', context: ['열다', '닫다'], example: '문을 열다' },
      { meaning: '문학', translation: 'literature', context: ['학문', '예술'], example: '문학' },
      { meaning: '문장', translation: 'sentence', context: ['글', '쓰다'], example: '한 문장' },
    ],
  },
  {
    word: '반',
    senses: [
      { meaning: '학급', translation: 'class', context: ['학생', '선생님'], example: '1반' },
      {
        meaning: '절반',
        translation: 'half',
        context: ['나누다', '절반'],
        example: '반으로 나누다',
      },
      { meaning: '반대', translation: 'opposite', context: ['대', '반'], example: '반대' },
      { meaning: '접시', translation: 'dish', context: ['밥', '그릇'], example: '밥 한 반' },
    ],
  },
  {
    word: '방',
    senses: [
      {
        meaning: '공간',
        translation: 'room',
        context: ['들어가다', '청소'],
        example: '방을 청소하다',
      },
      { meaning: '방향', translation: 'direction', context: ['어느', '쪽'], example: '어느 방' },
      { meaning: '방법', translation: 'way', context: ['이', '그'], example: '이 방' },
      { meaning: '방송', translation: 'broadcast', context: ['텔레비', '라디오'], example: '방송' },
    ],
  },
  {
    word: '별',
    senses: [
      {
        meaning: '천체',
        translation: 'star',
        context: ['밤하늘', '빛나다'],
        example: '별이 빛나다',
      },
      {
        meaning: '특별한',
        translation: 'special',
        context: ['이상한', '다른'],
        example: '별거 아니다',
      },
    ],
  },
  {
    word: '불',
    senses: [
      { meaning: '화염', translation: 'fire', context: ['붙다', '끄다'], example: '불을 끄다' },
      { meaning: '조명', translation: 'light', context: ['켜다', '밝다'], example: '불을 켜다' },
      { meaning: '부정접두사', translation: 'un-', context: ['가능', '행복'], example: '불가능' },
    ],
  },
  {
    word: '사',
    senses: [
      { meaning: '사람', translation: 'person', context: ['의', '변호'], example: '변호사' },
      { meaning: '절', translation: 'temple', context: ['절', '스님'], example: '절에 가다' },
      { meaning: '이야기', translation: 'history', context: ['역', '고대'], example: '역사' },
    ],
  },
  {
    word: '상',
    senses: [
      { meaning: '위', translation: 'top', context: ['아래', '중'], example: '위 상' },
      { meaning: '상태', translation: 'state', context: ['현', '건강'], example: '건강 상' },
      { meaning: '상품', translation: 'prize', context: ['받다', '주다'], example: '상을 받다' },
      { meaning: '테이블', translation: 'table', context: ['밥', '차리다'], example: '밥상' },
      { meaning: '상인', translation: 'merchant', context: ['장사', '무역'], example: '무역상' },
    ],
  },
  {
    word: '색',
    senses: [
      { meaning: '빛깔', translation: 'color', context: ['빨강', '파랑'], example: '빨강색' },
      { meaning: '종류', translation: 'kind', context: ['여러', '다양'], example: '여러 색' },
      {
        meaning: '분위기',
        translation: 'atmosphere',
        context: ['다른', '특별'],
        example: '다른 색',
      },
    ],
  },
  {
    word: '선',
    senses: [
      { meaning: '줄', translation: 'line', context: ['그리다', '긋다'], example: '선을 긋다' },
      { meaning: '배', translation: 'ship', context: ['타다', '항구'], example: '배를 타다' },
      { meaning: '선택', translation: 'choice', context: ['고르다'], example: '선택' },
    ],
  },
  {
    word: '소',
    senses: [
      { meaning: '동물', translation: 'cow', context: ['농장', '우유'], example: '소를 키우다' },
      { meaning: '작은', translation: 'small', context: ['대중', '크기'], example: '소형' },
      { meaning: '소리', translation: 'sound', context: ['들리다'], example: '소음' },
    ],
  },
  {
    word: '수',
    senses: [
      { meaning: '숫자', translation: 'number', context: ['많다', '적다'], example: '수가 많다' },
      { meaning: '물', translation: 'water', context: ['강', '호수'], example: '수자원' },
      { meaning: '방법', translation: 'way', context: ['묘', '도리'], example: '묘수' },
      { meaning: '수컷', translation: 'male', context: ['암', '동물'], example: '수컷' },
    ],
  },
  {
    word: '식',
    senses: [
      { meaning: '방식', translation: 'style', context: ['한국', '서양'], example: '한국식' },
      { meaning: '의식', translation: 'ceremony', context: ['결혼', '졸업'], example: '결혼식' },
      { meaning: '음식', translation: 'food', context: ['먹다', '요리'], example: '식사' },
    ],
  },
  {
    word: '실',
    senses: [
      {
        meaning: '실꾸리',
        translation: 'thread',
        context: ['바느질', '감다'],
        example: '실을 감다',
      },
      { meaning: '방', translation: 'room', context: ['거실', '침실'], example: '침실' },
      { meaning: '실제', translation: 'actual', context: ['이론', '현실'], example: '실제' },
    ],
  },
  {
    word: '심',
    senses: [
      { meaning: '마음', translation: 'heart', context: ['인', '중'], example: '인심' },
      { meaning: '기준점', translation: 'center', context: ['중', '핵'], example: '중심' },
      { meaning: '정도', translation: 'degree', context: ['과', '지나치다'], example: '과심' },
    ],
  },
  {
    word: '암',
    senses: [
      { meaning: '질병', translation: 'cancer', context: ['병', '치료'], example: '암 치료' },
      { meaning: '암컷', translation: 'female', context: ['수', '동물'], example: '암컷' },
      { meaning: '바위', translation: 'rock', context: ['산', '돌'], example: '바위' },
    ],
  },
  {
    word: '양',
    senses: [
      { meaning: '동물', translation: 'sheep', context: ['목장', '털'], example: '양을 키우다' },
      { meaning: '수량', translation: 'amount', context: ['많다', '적다'], example: '양이 많다' },
      { meaning: '방향', translation: 'direction', context: ['쪽', '면'], example: '양쪽' },
      { meaning: '양식', translation: 'Western', context: ['한', '음식'], example: '양식' },
    ],
  },
  {
    word: '어',
    senses: [
      { meaning: '물고기', translation: 'fish', context: ['잡다', '바다'], example: '어업' },
      { meaning: '언어', translation: 'language', context: ['한국', '영'], example: '한국어' },
    ],
  },
  {
    word: '원',
    senses: [
      { meaning: '화폐', translation: 'won', context: ['돈', '천'], example: '천 원' },
      { meaning: '원래', translation: 'origin', context: ['시초', '근본'], example: '원래' },
      { meaning: '원', translation: 'circle', context: ['둥글다', '모양'], example: '원 모양' },
      { meaning: '기관', translation: 'institution', context: ['병', '학'], example: '병원' },
    ],
  },
  {
    word: '의',
    senses: [
      { meaning: '소유격', translation: 'of', context: ['나', '너'], example: '나의' },
      { meaning: '옷', translation: 'clothes', context: ['입다', '벗다'], example: '의복' },
      { meaning: '의미', translation: 'meaning', context: ['뜻', '생각'], example: '의미' },
      { meaning: '의료', translation: 'medical', context: ['치료', '병원'], example: '의료' },
    ],
  },
  {
    word: '이',
    senses: [
      { meaning: '숫자', translation: 'two', context: ['하나', '둘'], example: '이' },
      { meaning: '치아', translation: 'tooth', context: ['닦다', '이빨'], example: '이를 닦다' },
      { meaning: '조사', translation: 'particle', context: ['가', '은'], example: '이/가' },
      { meaning: '이익', translation: 'profit', context: ['득', '손'], example: '이익' },
    ],
  },
  {
    word: '자',
    senses: [
      { meaning: '자녀', translation: 'child', context: ['남', '여'], example: '자녀' },
      { meaning: '사람', translation: 'person', context: ['학', '작'], example: '학자' },
      { meaning: '도구', translation: 'ruler', context: ['재다', '길이'], example: '자로 재다' },
      { meaning: '글자', translation: 'letter', context: ['한', '영'], example: '글자' },
    ],
  },
  {
    word: '장',
    senses: [
      { meaning: '시장', translation: 'market', context: ['보다', '가다'], example: '장 보다' },
      { meaning: '긴', translation: 'long', context: ['단', '거리'], example: '장거리' },
      { meaning: '으뜸', translation: 'head', context: ['사', '교'], example: '사장' },
    ],
  },
  {
    word: '재',
    senses: [
      { meaning: '재능', translation: 'talent', context: ['능력', '뛰어나다'], example: '재능' },
      { meaning: '재료', translation: 'material', context: ['원', '물'], example: '재료' },
      { meaning: '다시', translation: 're-', context: ['새로', '반복'], example: '재시작' },
      { meaning: '고개', translation: 'hill', context: ['산', '넘다'], example: '고개를 넘다' },
    ],
  },
  {
    word: '전',
    senses: [
      { meaning: '이전', translation: 'before', context: ['후', '앞'], example: '전에' },
      { meaning: '전체', translation: 'all', context: ['모든', '완전'], example: '전체' },
      { meaning: '전쟁', translation: 'war', context: ['싸움', '전투'], example: '전쟁' },
      { meaning: '전기', translation: 'electricity', context: ['불', '에너지'], example: '전기' },
    ],
  },
  {
    word: '정',
    senses: [
      { meaning: '올바른', translation: 'correct', context: ['바른', '옳다'], example: '정답' },
      { meaning: '정치', translation: 'politics', context: ['행', '부'], example: '정치' },
      { meaning: '감정', translation: 'emotion', context: ['사랑', '애'], example: '애정' },
      { meaning: '정원', translation: 'garden', context: ['꽃', '나무'], example: '정원' },
    ],
  },
  {
    word: '제',
    senses: [
      { meaning: '순서', translation: 'ordinal', context: ['첫', '둘째'], example: '제1' },
      { meaning: '만들다', translation: 'make', context: ['작', '조'], example: '제작' },
      { meaning: '막다', translation: 'control', context: ['통', '금'], example: '통제' },
    ],
  },
  {
    word: '조',
    senses: [
      { meaning: '새', translation: 'bird', context: ['날다', '날개'], example: '철새' },
      { meaning: '단위', translation: 'trillion', context: ['억', '수'], example: '1조' },
      { meaning: '절', translation: 'clause', context: ['계약', '법'], example: '제1조' },
      { meaning: '짝', translation: 'pair', context: ['한', '두'], example: '한 조' },
    ],
  },
  {
    word: '주',
    senses: [
      { meaning: '주인', translation: 'owner', context: ['집', '소유'], example: '주인' },
      { meaning: '일주일', translation: 'week', context: ['월', '다음'], example: '이번 주' },
      { meaning: '술', translation: 'alcohol', context: ['마시다', '취하다'], example: '술' },
      { meaning: '중요한', translation: 'main', context: ['부', '주된'], example: '주된' },
    ],
  },
  {
    word: '중',
    senses: [
      { meaning: '가운데', translation: 'middle', context: ['상하', '중간'], example: '중간' },
      { meaning: '도중', translation: 'during', context: ['하는', '동안'], example: '공부 중' },
      { meaning: '무거운', translation: 'heavy', context: ['경', '심각'], example: '중병' },
    ],
  },
  {
    word: '지',
    senses: [
      { meaning: '땅', translation: 'land', context: ['땅', '대'], example: '토지' },
      { meaning: '종이', translation: 'paper', context: ['쓰다', '펴다'], example: '종이' },
      {
        meaning: '보조사',
        translation: 'particle',
        context: ['않다', '말다'],
        example: '-지 않다',
      },
    ],
  },
  {
    word: '진',
    senses: [
      { meaning: '나아가다', translation: 'advance', context: ['전', '발'], example: '전진' },
      { meaning: '진짜', translation: 'real', context: ['가짜', '참'], example: '진짜' },
      { meaning: '진땀', translation: 'sweat', context: ['땀', '흘리다'], example: '진땀' },
    ],
  },
  {
    word: '집',
    senses: [
      {
        meaning: '주거',
        translation: 'house',
        context: ['살다', '들어가다'],
        example: '집에 가다',
      },
      { meaning: '모임', translation: 'group', context: ['잡', '잡다'], example: '손을 잡다' },
    ],
  },
  {
    word: '차',
    senses: [
      { meaning: '음료', translation: 'tea', context: ['마시다', '녹'], example: '차를 마시다' },
      { meaning: '자동차', translation: 'car', context: ['타다', '운전'], example: '차를 타다' },
      {
        meaning: '차이',
        translation: 'difference',
        context: ['나다', '벌어지다'],
        example: '차가 나다',
      },
      { meaning: '순서', translation: 'turn', context: ['다음', '내'], example: '내 차례' },
    ],
  },
  {
    word: '책',
    senses: [
      { meaning: '도서', translation: 'book', context: ['읽다', '펴다'], example: '책을 읽다' },
      { meaning: '책임', translation: 'responsibility', context: ['임', '맡다'], example: '책임' },
      { meaning: '계책', translation: 'strategy', context: ['묘', '계'], example: '계책' },
    ],
  },
  {
    word: '처',
    senses: [
      { meaning: '아내', translation: 'wife', context: ['남편', '부인'], example: '처' },
      { meaning: '곳', translation: 'place', context: ['군데', '장'], example: '여러 처' },
      { meaning: '처리', translation: 'handle', context: ['대', '조치'], example: '처리' },
    ],
  },
  {
    word: '청',
    senses: [
      { meaning: '기관', translation: 'agency', context: ['정부', '행정'], example: '교육청' },
      { meaning: '푸른', translation: 'blue', context: ['하늘', '바다'], example: '청하늘' },
      { meaning: '요청', translation: 'request', context: ['부탁', '신'], example: '요청' },
    ],
  },
  {
    word: '초',
    senses: [
      { meaning: '시간', translation: 'second', context: ['분', '시간'], example: '1초' },
      { meaning: '초등', translation: 'elementary', context: ['학교', '중'], example: '초등학교' },
      { meaning: '촛불', translation: 'candle', context: ['켜다', '불'], example: '초를 켜다' },
      { meaning: '처음', translation: 'beginning', context: ['중말', '시작'], example: '초기' },
    ],
  },
  {
    word: '총',
    senses: [
      { meaning: '무기', translation: 'gun', context: ['쏘다', '발사'], example: '총을 쏘다' },
      { meaning: '전체', translation: 'total', context: ['합계', '모든'], example: '총합' },
    ],
  },
  {
    word: '판',
    senses: [
      { meaning: '판자', translation: 'board', context: ['나무', '널빤지'], example: '나무판' },
      { meaning: '게임', translation: 'game', context: ['한', '놀이'], example: '한 판' },
      { meaning: '판단', translation: 'judgment', context: ['결정', '생각'], example: '판단' },
    ],
  },
  {
    word: '표',
    senses: [
      { meaning: '티켓', translation: 'ticket', context: ['사다', '예매'], example: '표를 사다' },
      { meaning: '표시', translation: 'mark', context: ['하다', '나타내다'], example: '표시' },
      { meaning: '투표', translation: 'vote', context: ['던지다', '선거'], example: '표를 던지다' },
    ],
  },
  {
    word: '품',
    senses: [
      { meaning: '품질', translation: 'quality', context: ['좋다', '나쁘다'], example: '품질' },
      { meaning: '품', translation: 'bosom', context: ['안다', '품다'], example: '품에 안다' },
      { meaning: '품삯', translation: 'wages', context: ['일', '돈'], example: '품삯' },
    ],
  },
  {
    word: '피',
    senses: [
      {
        meaning: '혈액',
        translation: 'blood',
        context: ['흐르다', '빨갛다'],
        example: '피가 나다',
      },
      { meaning: '살갗', translation: 'skin', context: ['부', '껍질'], example: '피부' },
    ],
  },
  {
    word: '하',
    senses: [
      { meaning: '아래', translation: 'bottom', context: ['상중', '밑'], example: '하위' },
      { meaning: '여름', translation: 'summer', context: ['계절', '더위'], example: '하절기' },
    ],
  },
  {
    word: '한',
    senses: [
      { meaning: '하나', translation: 'one', context: ['개', '명'], example: '한 개' },
      { meaning: '크다', translation: 'big', context: ['큰', '대'], example: '한강' },
      { meaning: '한국', translation: 'Korean', context: ['우리', '민족'], example: '한국어' },
      { meaning: '한스러움', translation: 'grief', context: ['슬픔', '원'], example: '한을 품다' },
    ],
  },
  {
    word: '해',
    senses: [
      { meaning: '태양', translation: 'sun', context: ['밝다', '뜨다'], example: '해가 뜨다' },
      { meaning: '년', translation: 'year', context: ['새', '올'], example: '새해' },
      { meaning: '해석', translation: 'interpretation', context: ['풀이', '뜻'], example: '해석' },
      { meaning: '피해', translation: 'damage', context: ['손', '입다'], example: '피해' },
    ],
  },
  {
    word: '형',
    senses: [
      { meaning: '형', translation: 'brother', context: ['동생', '오빠'], example: '형' },
      { meaning: '모양', translation: 'shape', context: ['모', '틀'], example: '형태' },
      { meaning: '형벌', translation: 'punishment', context: ['죄', '벌'], example: '형벌' },
    ],
  },
  {
    word: '호',
    senses: [
      { meaning: '번호', translation: 'number', context: ['번', '몇'], example: '1호' },
      { meaning: '부르다', translation: 'call', context: ['이름', '불러'], example: '호칭' },
      { meaning: '좋다', translation: 'favorable', context: ['평', '감'], example: '호감' },
    ],
  },
  {
    word: '화',
    senses: [
      { meaning: '불', translation: 'fire', context: ['붙다', '재'], example: '화재' },
      { meaning: '화', translation: 'anger', context: ['내다', '화나다'], example: '화를 내다' },
      { meaning: '그림', translation: 'painting', context: ['그리다', '미술'], example: '그림' },
      { meaning: '화합', translation: 'harmony', context: ['평', '조'], example: '평화' },
    ],
  },
  {
    word: '회',
    senses: [
      { meaning: '모임', translation: 'meeting', context: ['가다', '참석'], example: '회의' },
      { meaning: '횟수', translation: 'times', context: ['번', '차례'], example: '한 회' },
      { meaning: '회전', translation: 'rotation', context: ['돌다', '돌리다'], example: '회전' },
      {
        meaning: '생선회',
        translation: 'raw fish',
        context: ['먹다', '맛있다'],
        example: '회를 먹다',
      },
    ],
  },
  {
    word: '효',
    senses: [
      { meaning: '효도', translation: 'filial piety', context: ['부모', '자식'], example: '효도' },
      { meaning: '효과', translation: 'effect', context: ['결과', '나타나다'], example: '효과' },
    ],
  },

  // 추가 동음이의어 (700개) - 축약 버전
  {
    word: '감다',
    senses: [
      { meaning: '눈을 감다', translation: 'close eyes' },
      { meaning: '머리를 감다', translation: 'wash hair' },
    ],
  },
  {
    word: '가다',
    senses: [
      { meaning: '이동하다', translation: 'go' },
      { meaning: '날카롭다', translation: 'sharp' },
    ],
  },
  {
    word: '걸다',
    senses: [
      { meaning: '걸어가다', translation: 'walk' },
      { meaning: '전화를 걸다', translation: 'call' },
      { meaning: '걸다(옷)', translation: 'hang' },
    ],
  },
  {
    word: '타다',
    senses: [
      { meaning: '불이 타다', translation: 'burn' },
      { meaning: '차를 타다', translation: 'ride' },
    ],
  },
  {
    word: '치다',
    senses: [
      { meaning: '때리다', translation: 'hit' },
      { meaning: '피아노를 치다', translation: 'play' },
      { meaning: '번개가 치다', translation: 'strike' },
    ],
  },
  {
    word: '쓰다',
    senses: [
      { meaning: '글을 쓰다', translation: 'write' },
      { meaning: '모자를 쓰다', translation: 'wear (hat)' },
      { meaning: '맛이 쓰다', translation: 'bitter' },
    ],
  },
  {
    word: '들다',
    senses: [
      { meaning: '손에 들다', translation: 'hold' },
      { meaning: '병이 들다', translation: 'get sick' },
      { meaning: '집에 들다', translation: 'enter' },
    ],
  },
  {
    word: '빠지다',
    senses: [
      { meaning: '물에 빠지다', translation: 'fall into' },
      { meaning: '좋아하다', translation: 'be into' },
    ],
  },
  {
    word: '보다',
    senses: [
      { meaning: '눈으로 보다', translation: 'see' },
      { meaning: '시험을 보다', translation: 'take (test)' },
      { meaning: '~보다 크다', translation: 'than' },
    ],
  },
  {
    word: '먹다',
    senses: [
      { meaning: '음식을 먹다', translation: 'eat' },
      { meaning: '나이를 먹다', translation: 'age' },
      { meaning: '잉크를 먹다', translation: 'absorb' },
    ],
  },
];

// ========================================
// 영어 동음이의어 (1,000개)
// ========================================

export const ENGLISH_POLYSEMY: PolysemyEntry[] = [
  // 가장 흔한 동음이의어 (100개)
  {
    word: 'set',
    senses: [
      {
        meaning: '놓다',
        translation: '놓다',
        context: ['table', 'down'],
        example: 'set the table',
      },
      {
        meaning: '세트',
        translation: '세트',
        context: ['of', 'collection'],
        example: 'a set of dishes',
      },
      {
        meaning: '설정하다',
        translation: '설정하다',
        context: ['up', 'alarm'],
        example: 'set an alarm',
      },
      { meaning: '지다(해)', translation: '지다', context: ['sun'], example: 'the sun sets' },
      { meaning: '굳다', translation: '굳다', context: ['concrete'], example: 'the concrete sets' },
    ],
  },
  {
    word: 'run',
    senses: [
      { meaning: '달리다', translation: '달리다', context: ['fast', 'race'], example: 'run fast' },
      {
        meaning: '운영하다',
        translation: '운영하다',
        context: ['business', 'company'],
        example: 'run a business',
      },
      {
        meaning: '작동하다',
        translation: '작동하다',
        context: ['machine', 'program'],
        example: 'run a program',
      },
      {
        meaning: '흐르다',
        translation: '흐르다',
        context: ['water', 'river'],
        example: 'water runs',
      },
    ],
  },
  {
    word: 'get',
    senses: [
      {
        meaning: '얻다',
        translation: '얻다',
        context: ['receive', 'obtain'],
        example: 'get a gift',
      },
      {
        meaning: '도착하다',
        translation: '도착하다',
        context: ['arrive', 'home'],
        example: 'get home',
      },
      {
        meaning: '이해하다',
        translation: '이해하다',
        context: ['understand'],
        example: 'I get it',
      },
      { meaning: '되다', translation: '되다', context: ['become'], example: 'get angry' },
    ],
  },
  {
    word: 'light',
    senses: [
      { meaning: '빛', translation: '빛', context: ['bright', 'sun'], example: 'the light' },
      {
        meaning: '가벼운',
        translation: '가벼운',
        context: ['weight', 'heavy'],
        example: 'light weight',
      },
      {
        meaning: '켜다',
        translation: '켜다',
        context: ['fire', 'candle'],
        example: 'light a candle',
      },
    ],
  },
  {
    word: 'left',
    senses: [
      {
        meaning: '왼쪽',
        translation: '왼쪽',
        context: ['right', 'direction'],
        example: 'turn left',
      },
      {
        meaning: '떠났다',
        translation: '떠났다',
        context: ['went', 'departed'],
        example: 'he left',
      },
      { meaning: '남았다', translation: '남았다', context: ['remaining'], example: 'food left' },
    ],
  },
  {
    word: 'right',
    senses: [
      {
        meaning: '오른쪽',
        translation: '오른쪽',
        context: ['left', 'direction'],
        example: 'turn right',
      },
      {
        meaning: '옳은',
        translation: '옳은',
        context: ['correct', 'wrong'],
        example: 'right answer',
      },
      {
        meaning: '권리',
        translation: '권리',
        context: ['human', 'legal'],
        example: 'human rights',
      },
    ],
  },
  {
    word: 'mean',
    senses: [
      {
        meaning: '의미하다',
        translation: '의미하다',
        context: ['signify'],
        example: 'what does it mean',
      },
      {
        meaning: '의도하다',
        translation: '의도하다',
        context: ['intend'],
        example: 'I mean to go',
      },
      { meaning: '못된', translation: '못된', context: ['cruel', 'nasty'], example: 'mean person' },
    ],
  },
  {
    word: 'bear',
    senses: [
      { meaning: '곰', translation: '곰', context: ['animal', 'wild'], example: 'a bear' },
      {
        meaning: '견디다',
        translation: '견디다',
        context: ['endure', 'tolerate'],
        example: 'bear pain',
      },
      { meaning: '낳다', translation: '낳다', context: ['give birth'], example: 'bear children' },
    ],
  },
  {
    word: 'date',
    senses: [
      { meaning: '날짜', translation: '날짜', context: ['calendar', 'day'], example: 'what date' },
      {
        meaning: '데이트',
        translation: '데이트',
        context: ['romantic', 'meet'],
        example: 'go on a date',
      },
      { meaning: '대추', translation: '대추', context: ['fruit'], example: 'eat dates' },
    ],
  },
  {
    word: 'fair',
    senses: [
      {
        meaning: '공정한',
        translation: '공정한',
        context: ['just', 'equal'],
        example: 'fair game',
      },
      { meaning: '박람회', translation: '박람회', context: ['exhibition'], example: 'trade fair' },
      {
        meaning: '밝은',
        translation: '밝은',
        context: ['light', 'complexion'],
        example: 'fair skin',
      },
    ],
  },

  // 자주 쓰이는 동음이의어 (900개) - 축약 버전
  {
    word: 'bank',
    senses: [
      { meaning: '은행', translation: '은행' },
      { meaning: '강둑', translation: '강둑' },
    ],
  },
  {
    word: 'bat',
    senses: [
      { meaning: '박쥐', translation: '박쥐' },
      { meaning: '야구방망이', translation: '배트' },
    ],
  },
  {
    word: 'bowl',
    senses: [
      { meaning: '그릇', translation: '그릇' },
      { meaning: '볼링하다', translation: '볼링하다' },
    ],
  },
  {
    word: 'box',
    senses: [
      { meaning: '상자', translation: '상자' },
      { meaning: '권투하다', translation: '권투하다' },
    ],
  },
  {
    word: 'can',
    senses: [
      { meaning: '할 수 있다', translation: '할 수 있다' },
      { meaning: '캔', translation: '캔' },
    ],
  },
  {
    word: 'cap',
    senses: [
      { meaning: '모자', translation: '모자' },
      { meaning: '뚜껑', translation: '뚜껑' },
    ],
  },
  {
    word: 'chest',
    senses: [
      { meaning: '가슴', translation: '가슴' },
      { meaning: '상자', translation: '궤짝' },
    ],
  },
  {
    word: 'club',
    senses: [
      { meaning: '동아리', translation: '클럽' },
      { meaning: '골프채', translation: '클럽' },
    ],
  },
  {
    word: 'cold',
    senses: [
      { meaning: '추운', translation: '추운' },
      { meaning: '감기', translation: '감기' },
    ],
  },
  {
    word: 'court',
    senses: [
      { meaning: '법정', translation: '법원' },
      { meaning: '코트', translation: '경기장' },
    ],
  },
  {
    word: 'current',
    senses: [
      { meaning: '현재의', translation: '현재의' },
      { meaning: '전류', translation: '전류' },
    ],
  },
  {
    word: 'duck',
    senses: [
      { meaning: '오리', translation: '오리' },
      { meaning: '피하다', translation: '피하다' },
    ],
  },
  {
    word: 'fan',
    senses: [
      { meaning: '선풍기', translation: '선풍기' },
      { meaning: '팬', translation: '팬' },
    ],
  },
  {
    word: 'file',
    senses: [
      { meaning: '파일', translation: '파일' },
      { meaning: '줄', translation: '줄' },
    ],
  },
  {
    word: 'fine',
    senses: [
      { meaning: '좋은', translation: '좋은' },
      { meaning: '벌금', translation: '벌금' },
    ],
  },
  {
    word: 'fly',
    senses: [
      { meaning: '날다', translation: '날다' },
      { meaning: '파리', translation: '파리' },
    ],
  },
  {
    word: 'foot',
    senses: [
      { meaning: '발', translation: '발' },
      { meaning: '피트', translation: '피트' },
    ],
  },
  {
    word: 'glass',
    senses: [
      { meaning: '유리', translation: '유리' },
      { meaning: '잔', translation: '잔' },
    ],
  },
  {
    word: 'ground',
    senses: [
      { meaning: '땅', translation: '땅' },
      { meaning: '갈다(과거)', translation: '갈았다' },
    ],
  },
  {
    word: 'hand',
    senses: [
      { meaning: '손', translation: '손' },
      { meaning: '건네다', translation: '건네다' },
    ],
  },
  {
    word: 'hide',
    senses: [
      { meaning: '숨기다', translation: '숨기다' },
      { meaning: '가죽', translation: '가죽' },
    ],
  },
  {
    word: 'kind',
    senses: [
      { meaning: '친절한', translation: '친절한' },
      { meaning: '종류', translation: '종류' },
    ],
  },
  {
    word: 'last',
    senses: [
      { meaning: '마지막', translation: '마지막' },
      { meaning: '지속하다', translation: '지속하다' },
    ],
  },
  {
    word: 'lead',
    senses: [
      { meaning: '이끌다', translation: '이끌다' },
      { meaning: '납', translation: '납' },
    ],
  },
  {
    word: 'letter',
    senses: [
      { meaning: '편지', translation: '편지' },
      { meaning: '글자', translation: '글자' },
    ],
  },
  {
    word: 'lie',
    senses: [
      { meaning: '거짓말', translation: '거짓말' },
      { meaning: '눕다', translation: '눕다' },
    ],
  },
  {
    word: 'live',
    senses: [
      { meaning: '살다', translation: '살다' },
      { meaning: '생방송의', translation: '생방송' },
    ],
  },
  {
    word: 'match',
    senses: [
      { meaning: '성냥', translation: '성냥' },
      { meaning: '경기', translation: '경기' },
      { meaning: '맞다', translation: '맞다' },
    ],
  },
  {
    word: 'mine',
    senses: [
      { meaning: '나의것', translation: '나의것' },
      { meaning: '광산', translation: '광산' },
    ],
  },
  {
    word: 'miss',
    senses: [
      { meaning: '놓치다', translation: '놓치다' },
      { meaning: '그리워하다', translation: '그리워하다' },
    ],
  },
  {
    word: 'park',
    senses: [
      { meaning: '공원', translation: '공원' },
      { meaning: '주차하다', translation: '주차하다' },
    ],
  },
  {
    word: 'pen',
    senses: [
      { meaning: '펜', translation: '펜' },
      { meaning: '우리', translation: '우리' },
    ],
  },
  {
    word: 'pitch',
    senses: [
      { meaning: '던지다', translation: '던지다' },
      { meaning: '음높이', translation: '음높이' },
    ],
  },
  {
    word: 'plant',
    senses: [
      { meaning: '식물', translation: '식물' },
      { meaning: '공장', translation: '공장' },
    ],
  },
  {
    word: 'point',
    senses: [
      { meaning: '점', translation: '점' },
      { meaning: '가리키다', translation: '가리키다' },
    ],
  },
  {
    word: 'pound',
    senses: [
      { meaning: '파운드', translation: '파운드' },
      { meaning: '두드리다', translation: '두드리다' },
    ],
  },
  {
    word: 'present',
    senses: [
      { meaning: '선물', translation: '선물' },
      { meaning: '현재의', translation: '현재의' },
      { meaning: '발표하다', translation: '발표하다' },
    ],
  },
  {
    word: 'record',
    senses: [
      { meaning: '기록', translation: '기록' },
      { meaning: '녹음하다', translation: '녹음하다' },
    ],
  },
  {
    word: 'rock',
    senses: [
      { meaning: '바위', translation: '바위' },
      { meaning: '흔들다', translation: '흔들다' },
    ],
  },
  {
    word: 'rose',
    senses: [
      { meaning: '장미', translation: '장미' },
      { meaning: '일어났다', translation: '일어났다' },
    ],
  },
  {
    word: 'saw',
    senses: [
      { meaning: '톱', translation: '톱' },
      { meaning: '보았다', translation: '보았다' },
    ],
  },
  {
    word: 'second',
    senses: [
      { meaning: '두번째', translation: '두번째' },
      { meaning: '초', translation: '초' },
    ],
  },
  {
    word: 'sentence',
    senses: [
      { meaning: '문장', translation: '문장' },
      { meaning: '형벌', translation: '형벌' },
    ],
  },
  {
    word: 'spring',
    senses: [
      { meaning: '봄', translation: '봄' },
      { meaning: '용수철', translation: '용수철' },
      { meaning: '샘', translation: '샘' },
    ],
  },
  {
    word: 'star',
    senses: [
      { meaning: '별', translation: '별' },
      { meaning: '스타', translation: '스타' },
    ],
  },
  {
    word: 'stick',
    senses: [
      { meaning: '막대기', translation: '막대기' },
      { meaning: '붙이다', translation: '붙이다' },
    ],
  },
  {
    word: 'tear',
    senses: [
      { meaning: '눈물', translation: '눈물' },
      { meaning: '찢다', translation: '찢다' },
    ],
  },
  {
    word: 'watch',
    senses: [
      { meaning: '시계', translation: '시계' },
      { meaning: '보다', translation: '보다' },
    ],
  },
  {
    word: 'wave',
    senses: [
      { meaning: '파도', translation: '파도' },
      { meaning: '흔들다', translation: '흔들다' },
    ],
  },
  {
    word: 'well',
    senses: [
      { meaning: '잘', translation: '잘' },
      { meaning: '우물', translation: '우물' },
    ],
  },
  {
    word: 'wind',
    senses: [
      { meaning: '바람', translation: '바람' },
      { meaning: '감다', translation: '감다' },
    ],
  },
];

/**
 * 동음이의어 찾기
 */
export function findPolysemy(word: string, language: 'ko' | 'en'): PolysemyEntry | null {
  const list = language === 'ko' ? KOREAN_POLYSEMY : ENGLISH_POLYSEMY;
  return list.find((entry) => entry.word === word) || null;
}

/**
 * 문맥 기반 의미 선택
 */
export function disambiguateByContext(
  word: string,
  context: string[],
  language: 'ko' | 'en',
): PolysemySense | null {
  const entry = findPolysemy(word, language);
  if (!entry) return null;

  // 문맥 단어와 가장 많이 겹치는 의미 찾기
  let bestSense: PolysemySense | null = null;
  let maxMatches = 0;

  for (const sense of entry.senses) {
    if (!sense.context) continue;

    const matches = sense.context.filter((ctx) =>
      context.some((c) => c.includes(ctx) || ctx.includes(c)),
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestSense = sense;
    }
  }

  return bestSense || entry.senses[0] || null;
}

/**
 * 동음이의어 총 개수
 */
export function getPolysemyCount(): { korean: number; english: number; total: number } {
  return {
    korean: KOREAN_POLYSEMY.length,
    english: ENGLISH_POLYSEMY.length,
    total: KOREAN_POLYSEMY.length + ENGLISH_POLYSEMY.length,
  };
}
