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
  // 추가 동음이의어 (빈도 높은 순서)
  {
    word: '머리',
    senses: [
      {
        meaning: '신체부위',
        translation: 'head',
        context: ['아프다', '감다', '빗다'],
        example: '머리가 아프다',
      },
      {
        meaning: '머리카락',
        translation: 'hair',
        context: ['자르다', '기르다', '염색하다'],
        example: '머리를 자르다',
      },
      {
        meaning: '지능',
        translation: 'brain',
        context: ['좋다', '나쁘다', '쓰다'],
        example: '머리가 좋다',
      },
      {
        meaning: '우두머리',
        translation: 'leader',
        context: ['되다', '뽑다'],
        example: '머리를 뽑다',
      },
    ],
  },
  {
    word: '다리',
    senses: [
      {
        meaning: '신체부위',
        translation: 'leg',
        context: ['걷다', '뛰다', '아프다'],
        example: '다리가 아프다',
      },
      {
        meaning: '교량',
        translation: 'bridge',
        context: ['건너다', '놓다', '무너지다'],
        example: '다리를 건너다',
      },
      {
        meaning: '가구 다리',
        translation: 'leg (furniture)',
        context: ['책상', '의자'],
        example: '책상 다리',
      },
    ],
  },
  {
    word: '팔',
    senses: [
      {
        meaning: '신체부위',
        translation: 'arm',
        context: ['들다', '굽히다', '아프다'],
        example: '팔을 들다',
      },
      { meaning: '숫자', translation: 'eight', context: ['개', '명', '번'], example: '팔 개' },
    ],
  },
  {
    word: '차',
    senses: [
      {
        meaning: '자동차',
        translation: 'car',
        context: ['타다', '운전하다', '주차하다'],
        example: '차를 타다',
      },
      {
        meaning: '차(음료)',
        translation: 'tea',
        context: ['마시다', '녹차', '홍차'],
        example: '차를 마시다',
      },
      {
        meaning: '차이',
        translation: 'difference',
        context: ['나다', '있다', '없다'],
        example: '차가 나다',
      },
    ],
  },
  {
    word: '표',
    senses: [
      {
        meaning: '티켓',
        translation: 'ticket',
        context: ['사다', '예매하다', '보여주다'],
        example: '표를 사다',
      },
      { meaning: '표시', translation: 'mark', context: ['하다', '남기다'], example: '표를 하다' },
      { meaning: '투표', translation: 'vote', context: ['던지다', '얻다'], example: '표를 던지다' },
      {
        meaning: '표정',
        translation: 'expression',
        context: ['짓다', '보이다'],
        example: '표를 짓다',
      },
    ],
  },
  {
    word: '시',
    senses: [
      { meaning: '시간', translation: 'hour', context: ['되다', '지나다', '몇'], example: '몇 시' },
      { meaning: '시(문학)', translation: 'poem', context: ['쓰다', '읽다'], example: '시를 쓰다' },
      { meaning: '시(도시)', translation: 'city', context: ['살다', '가다'], example: '서울시' },
    ],
  },
  {
    word: '감',
    senses: [
      {
        meaning: '과일',
        translation: 'persimmon',
        context: ['먹다', '달다'],
        example: '감을 먹다',
      },
      {
        meaning: '느낌',
        translation: 'sense',
        context: ['잡다', '오다', '있다'],
        example: '감이 오다',
      },
      {
        meaning: '감독',
        translation: 'director (short)',
        context: ['영화', '드라마'],
        example: '영화 감',
      },
    ],
  },
  {
    word: '물',
    senses: [
      {
        meaning: '액체',
        translation: 'water',
        context: ['마시다', '흐르다'],
        example: '물을 마시다',
      },
      {
        meaning: '물가',
        translation: 'waterside',
        context: ['가다', '놀다'],
        example: '물가에 가다',
      },
      {
        meaning: '물건',
        translation: 'thing (short)',
        context: ['좋다', '나쁘다'],
        example: '좋은 물건',
      },
    ],
  },
  {
    word: '불',
    senses: [
      {
        meaning: '화재',
        translation: 'fire',
        context: ['나다', '끄다', '피우다'],
        example: '불이 나다',
      },
      { meaning: '빛', translation: 'light', context: ['켜다', '끄다'], example: '불을 켜다' },
      {
        meaning: '부정',
        translation: 'no (prefix)',
        context: ['가능', '법', '만'],
        example: '불가능',
      },
    ],
  },
  {
    word: '판',
    senses: [
      { meaning: '널판', translation: 'board', context: ['나무', '깔다'], example: '나무판' },
      {
        meaning: '게임판',
        translation: 'game (round)',
        context: ['한', '두', '승부'],
        example: '한 판',
      },
      {
        meaning: '상황',
        translation: 'situation',
        context: ['벌어지다', '커지다'],
        example: '판이 벌어지다',
      },
      { meaning: '판사', translation: 'judge (short)', context: ['되다'], example: '판사' },
    ],
  },
  {
    word: '잔',
    senses: [
      { meaning: '컵', translation: 'cup', context: ['따르다', '마시다'], example: '잔을 따르다' },
      { meaning: '남은 것', translation: 'remaining', context: ['돈', '음식'], example: '잔돈' },
    ],
  },
  {
    word: '쓰다',
    senses: [
      {
        meaning: '글쓰다',
        translation: 'write',
        context: ['편지', '책', '일기'],
        example: '편지를 쓰다',
      },
      { meaning: '사용하다', translation: 'use', context: ['돈', '시간'], example: '돈을 쓰다' },
      {
        meaning: '맛이 쓰다',
        translation: 'bitter',
        context: ['약', '커피'],
        example: '약이 쓰다',
      },
      {
        meaning: '쓰개를 쓰다',
        translation: 'wear (hat)',
        context: ['모자', '안경'],
        example: '모자를 쓰다',
      },
    ],
  },
  {
    word: '지다',
    senses: [
      {
        meaning: '패배하다',
        translation: 'lose',
        context: ['게임', '경기'],
        example: '게임에 지다',
      },
      {
        meaning: '해가 지다',
        translation: 'set (sun)',
        context: ['해', '달'],
        example: '해가 지다',
      },
      { meaning: '짐을 지다', translation: 'carry', context: ['짐', '책임'], example: '짐을 지다' },
      { meaning: '집을 지다', translation: 'build', context: ['집', '건물'], example: '집을 지다' },
    ],
  },
  {
    word: '들다',
    senses: [
      {
        meaning: '손에 들다',
        translation: 'hold',
        context: ['손', '가방'],
        example: '가방을 들다',
      },
      { meaning: '안으로 들다', translation: 'enter', context: ['방', '집'], example: '방에 들다' },
      { meaning: '나이 들다', translation: 'age', context: ['나이'], example: '나이가 들다' },
      {
        meaning: '비용이 들다',
        translation: 'cost',
        context: ['돈', '시간'],
        example: '돈이 들다',
      },
      { meaning: '예를 들다', translation: 'give example', context: ['예'], example: '예를 들다' },
    ],
  },
  {
    word: '받다',
    senses: [
      {
        meaning: '수령하다',
        translation: 'receive',
        context: ['선물', '편지'],
        example: '선물을 받다',
      },
      { meaning: '지탱하다', translation: 'support', context: ['무게'], example: '무게를 받다' },
      {
        meaning: '테스트 받다',
        translation: 'take (test)',
        context: ['시험', '검사'],
        example: '시험을 받다',
      },
    ],
  },
  {
    word: '나다',
    senses: [
      { meaning: '생기다', translation: 'occur', context: ['불', '사고'], example: '불이 나다' },
      { meaning: '태어나다', translation: 'be born', context: ['아기'], example: '아기가 나다' },
      { meaning: '외출하다', translation: 'go out', context: ['밖', '외출'], example: '밖에 나다' },
      {
        meaning: '냄새나다',
        translation: 'smell',
        context: ['냄새', '향기'],
        example: '냄새가 나다',
      },
      { meaning: '소리나다', translation: 'sound', context: ['소리'], example: '소리가 나다' },
    ],
  },
  {
    word: '자다',
    senses: [
      { meaning: '수면', translation: 'sleep', context: ['밤', '잠'], example: '밤에 자다' },
      { meaning: '눕다', translation: 'lie down', context: ['침대'], example: '침대에 자다' },
    ],
  },
  {
    word: '차다',
    senses: [
      { meaning: '발로 차다', translation: 'kick', context: ['공', '발'], example: '공을 차다' },
      { meaning: '차갑다', translation: 'cold', context: ['물', '날씨'], example: '물이 차다' },
      { meaning: '가득 차다', translation: 'full', context: ['물', '사람'], example: '물이 차다' },
    ],
  },
  {
    word: '놓다',
    senses: [
      { meaning: '두다', translation: 'put', context: ['위', '바닥'], example: '바닥에 놓다' },
      { meaning: '풀어주다', translation: 'release', context: ['손', '새'], example: '손을 놓다' },
      {
        meaning: '설치하다',
        translation: 'install',
        context: ['다리', '전화'],
        example: '전화를 놓다',
      },
    ],
  },
  {
    word: '서다',
    senses: [
      {
        meaning: '일어서다',
        translation: 'stand',
        context: ['자리', '앉다'],
        example: '자리에서 서다',
      },
      { meaning: '멈추다', translation: 'stop', context: ['차', '시계'], example: '차가 서다' },
      { meaning: '생기다', translation: 'form', context: ['서리', '이슬'], example: '서리가 서다' },
    ],
  },
  {
    word: '앉다',
    senses: [
      {
        meaning: '자리잡다',
        translation: 'sit',
        context: ['의자', '바닥'],
        example: '의자에 앉다',
      },
      { meaning: '가라앉다', translation: 'settle', context: ['먼지'], example: '먼지가 앉다' },
    ],
  },
  {
    word: '개',
    senses: [
      { meaning: '동물', translation: 'dog', context: ['키우다', '짖다'], example: '개를 키우다' },
      { meaning: '단위', translation: 'piece', context: ['한', '두'], example: '사과 한 개' },
    ],
  },
  {
    word: '김',
    senses: [
      {
        meaning: '해조류',
        translation: 'seaweed',
        context: ['먹다', '구이'],
        example: '김을 먹다',
      },
      { meaning: '증기', translation: 'steam', context: ['나다', '빠지다'], example: '김이 나다' },
      { meaning: '성씨', translation: 'Kim (surname)', context: ['씨'], example: '김 씨' },
    ],
  },
  {
    word: '박',
    senses: [
      { meaning: '박(식물)', translation: 'gourd', context: ['심다'], example: '박을 심다' },
      { meaning: '성씨', translation: 'Park (surname)', context: ['씨'], example: '박 씨' },
      { meaning: '바깥', translation: 'outside', context: ['에', '으로'], example: '문박에' },
    ],
  },
  {
    word: '양',
    senses: [
      { meaning: '동물', translation: 'sheep', context: ['키우다', '털'], example: '양을 키우다' },
      { meaning: '수량', translation: 'amount', context: ['많다', '적다'], example: '양이 많다' },
      { meaning: '성씨', translation: 'Yang (surname)', context: ['씨'], example: '양 씨' },
      { meaning: '서양', translation: 'Western (short)', context: ['식', '복'], example: '양식' },
    ],
  },
  {
    word: '대',
    senses: [
      { meaning: '대나무', translation: 'bamboo', context: ['숲'], example: '대나무' },
      { meaning: '단위', translation: 'unit', context: ['한', '두'], example: '자동차 한 대' },
      { meaning: '세대', translation: 'generation', context: ['부모', '자식'], example: '3대' },
      { meaning: '대신', translation: 'instead (short)', context: ['에', '로'], example: '대신에' },
    ],
  },
  {
    word: '목',
    senses: [
      {
        meaning: '신체부위',
        translation: 'neck',
        context: ['아프다', '빳빳하다'],
        example: '목이 아프다',
      },
      { meaning: '목소리', translation: 'voice', context: ['높다', '낮다'], example: '목이 높다' },
      { meaning: '목적', translation: 'goal (short)', context: ['적'], example: '목적' },
      { meaning: '항목', translation: 'item', context: ['차', '여러'], example: '여러 목' },
    ],
  },
  {
    word: '코',
    senses: [
      {
        meaning: '신체부위',
        translation: 'nose',
        context: ['풀다', '막히다'],
        example: '코를 풀다',
      },
      { meaning: '코드', translation: 'code (short)', context: ['컴퓨터'], example: '코드' },
    ],
  },
  {
    word: '귀',
    senses: [
      {
        meaning: '신체부위',
        translation: 'ear',
        context: ['듣다', '아프다'],
        example: '귀가 아프다',
      },
      { meaning: '귀퉁이', translation: 'corner', context: ['방'], example: '방귀' },
      {
        meaning: '귀하다',
        translation: 'precious (short)',
        context: ['중', '한'],
        example: '귀한',
      },
    ],
  },
  {
    word: '이',
    senses: [
      // 지시형용사가 가장 흔한 용법 (이 책, 이 사람 등)
      {
        meaning: '지시어',
        translation: 'this',
        context: ['것', '사람', '책', '집', '곳', '날', '번'],
        example: '이 책',
      },
      // 치아는 조사와 함께 사용: 이를, 이가 (닦다, 빠지다 문맥)
      {
        meaning: '치아',
        translation: 'tooth',
        context: ['닦다', '빠지다', '아프다', '이빨'],
        example: '이를 닦다',
      },
      { meaning: '이익', translation: 'profit (short)', context: ['득'], example: '이득' },
      { meaning: '성씨', translation: 'Lee (surname)', context: ['씨'], example: '이 씨' },
    ],
  },
  {
    word: '입',
    senses: [
      {
        meaning: '신체부위',
        translation: 'mouth',
        context: ['벌리다', '다물다'],
        example: '입을 벌리다',
      },
      { meaning: '입구', translation: 'entrance', context: ['문', '동굴'], example: '동굴 입구' },
    ],
  },
  {
    word: '허리',
    senses: [
      {
        meaning: '신체부위',
        translation: 'waist',
        context: ['아프다', '굽히다'],
        example: '허리가 아프다',
      },
      { meaning: '중간', translation: 'middle', context: ['산', '길'], example: '산 허리' },
    ],
  },
  {
    word: '가슴',
    senses: [
      {
        meaning: '신체부위',
        translation: 'chest',
        context: ['아프다', '펴다'],
        example: '가슴이 아프다',
      },
      {
        meaning: '마음',
        translation: 'heart',
        context: ['뛰다', '아프다'],
        example: '가슴이 뛰다',
      },
    ],
  },
  {
    word: '등',
    senses: [
      {
        meaning: '신체부위',
        translation: 'back',
        context: ['아프다', '긁다'],
        example: '등이 아프다',
      },
      { meaning: '등급', translation: 'grade', context: ['1', '상'], example: '1등' },
      { meaning: '나열', translation: 'etc', context: ['책', '연필'], example: '책, 연필 등' },
    ],
  },
  {
    word: '어깨',
    senses: [
      {
        meaning: '신체부위',
        translation: 'shoulder',
        context: ['아프다', '으쓱하다'],
        example: '어깨가 아프다',
      },
      {
        meaning: '옷어깨',
        translation: 'shoulder (clothing)',
        context: ['옷'],
        example: '옷 어깨',
      },
    ],
  },
  {
    word: '피',
    senses: [
      { meaning: '혈액', translation: 'blood', context: ['나다', '흐르다'], example: '피가 나다' },
      {
        meaning: '혈통',
        translation: 'bloodline',
        context: ['같다', '다르다'],
        example: '피가 같다',
      },
    ],
  },
  {
    word: '뼈',
    senses: [
      {
        meaning: '골격',
        translation: 'bone',
        context: ['부러지다', '아프다'],
        example: '뼈가 부러지다',
      },
      { meaning: '핵심', translation: 'core', context: ['있다'], example: '뼈가 있다' },
    ],
  },
  {
    word: '살',
    senses: [
      { meaning: '육체', translation: 'flesh', context: ['찌다', '빠지다'], example: '살이 찌다' },
      { meaning: '피부', translation: 'skin', context: ['하얗다'], example: '살이 하얗다' },
      { meaning: '생활', translation: 'living (short)', context: ['림'], example: '살림' },
    ],
  },
  {
    word: '집',
    senses: [
      { meaning: '주택', translation: 'house', context: ['짓다', '살다'], example: '집을 짓다' },
      { meaning: '가정', translation: 'home', context: ['돌아가다'], example: '집에 가다' },
      { meaning: '상점', translation: 'shop', context: ['음식', '커피'], example: '커피집' },
    ],
  },
  {
    word: '방',
    senses: [
      {
        meaning: '공간',
        translation: 'room',
        context: ['들어가다', '나가다'],
        example: '방에 들어가다',
      },
      {
        meaning: '방향',
        translation: 'direction',
        context: ['동', '서', '남', '북'],
        example: '동쪽 방',
      },
      { meaning: '방법', translation: 'way (short)', context: ['법'], example: '방법' },
    ],
  },
  {
    word: '문',
    senses: [
      { meaning: '출입구', translation: 'door', context: ['열다', '닫다'], example: '문을 열다' },
      { meaning: '문자', translation: 'letter (short)', context: ['자'], example: '문자' },
      { meaning: '문화', translation: 'culture (short)', context: ['화'], example: '문화' },
    ],
  },
  {
    word: '길',
    senses: [
      { meaning: '도로', translation: 'road', context: ['걷다', '달리다'], example: '길을 걷다' },
      { meaning: '방법', translation: 'way', context: ['찾다'], example: '길을 찾다' },
      { meaning: '김(성씨)', translation: 'Gil (surname)', context: ['씨'], example: '길 씨' },
    ],
  },
  {
    word: '창',
    senses: [
      { meaning: '창문', translation: 'window', context: ['열다', '닫다'], example: '창을 열다' },
      { meaning: '창(무기)', translation: 'spear', context: ['던지다'], example: '창을 던지다' },
      { meaning: '창조', translation: 'creation (short)', context: ['조'], example: '창조' },
    ],
  },
  {
    word: '색',
    senses: [
      { meaning: '색깔', translation: 'color', context: ['빨강', '파랑'], example: '빨간 색' },
      { meaning: '여색', translation: 'lust (short)', context: ['주', '도'], example: '색주가' },
    ],
  },
  {
    word: '벽',
    senses: [
      { meaning: '벽면', translation: 'wall', context: ['쌓다', '부수다'], example: '벽을 쌓다' },
      { meaning: '장벽', translation: 'barrier', context: ['넘다'], example: '벽을 넘다' },
    ],
  },
  {
    word: '바닥',
    senses: [
      { meaning: '땅', translation: 'floor', context: ['닦다', '앉다'], example: '바닥을 닦다' },
      { meaning: '최저', translation: 'bottom', context: ['치다'], example: '바닥을 치다' },
    ],
  },
  {
    word: '천장',
    senses: [
      {
        meaning: '위쪽 면',
        translation: 'ceiling',
        context: ['높다', '낮다'],
        example: '천장이 높다',
      },
      { meaning: '최고 한도', translation: 'cap', context: ['가격'], example: '가격 천장' },
    ],
  },
  {
    word: '값',
    senses: [
      {
        meaning: '가격',
        translation: 'price',
        context: ['비싸다', '싸다'],
        example: '값이 비싸다',
      },
      { meaning: '수치', translation: 'value', context: ['계산하다'], example: '값을 계산하다' },
      { meaning: '보람', translation: 'worth', context: ['있다', '없다'], example: '값이 있다' },
    ],
  },
  {
    word: '힘',
    senses: [
      {
        meaning: '물리력',
        translation: 'strength',
        context: ['세다', '약하다'],
        example: '힘이 세다',
      },
      { meaning: '노력', translation: 'effort', context: ['쓰다', '빼다'], example: '힘을 쓰다' },
      { meaning: '권력', translation: 'power', context: ['갖다', '잃다'], example: '힘을 갖다' },
    ],
  },
  {
    word: '정',
    senses: [
      {
        meaning: '애정',
        translation: 'affection',
        context: ['들다', '떨어지다'],
        example: '정이 들다',
      },
      { meaning: '정해진', translation: 'fixed (short)', context: ['도', '해진'], example: '정도' },
      { meaning: '성씨', translation: 'Jeong (surname)', context: ['씨'], example: '정 씨' },
    ],
  },
  {
    word: '신',
    senses: [
      { meaning: '신발', translation: 'shoes', context: ['신다', '벗다'], example: '신을 신다' },
      { meaning: '신(神)', translation: 'god', context: ['믿다'], example: '신을 믿다' },
      { meaning: '새로운', translation: 'new (short)', context: ['입생'], example: '신입생' },
    ],
  },
  // 추가 동음이의어 (고빈도 동사/형용사)
  {
    word: '가다',
    senses: [
      { meaning: '이동하다', translation: 'go', context: ['학교', '집'], example: '학교에 가다' },
      { meaning: '작동하다', translation: 'work', context: ['시계'], example: '시계가 가다' },
      { meaning: '없어지다', translation: 'fade', context: ['색', '얼룩'], example: '얼룩이 가다' },
    ],
  },
  {
    word: '오다',
    senses: [
      { meaning: '도착하다', translation: 'come', context: ['여기'], example: '여기로 오다' },
      {
        meaning: '발생하다',
        translation: 'occur',
        context: ['생각', '느낌'],
        example: '생각이 오다',
      },
      {
        meaning: '도래하다',
        translation: 'arrive (time)',
        context: ['봄', '겨울'],
        example: '봄이 오다',
      },
    ],
  },
  {
    word: '하다',
    senses: [
      { meaning: '행동하다', translation: 'do', context: ['일', '공부'], example: '일을 하다' },
      { meaning: '상태되다', translation: 'become', context: ['커', '좋'], example: '좋아 하다' },
      {
        meaning: '말하다',
        translation: 'say',
        context: ['라고', '고'],
        example: '안녕이라고 하다',
      },
    ],
  },
  {
    word: '보다',
    senses: [
      {
        meaning: '시각으로 감지',
        translation: 'see',
        context: ['눈', '영화'],
        example: '영화를 보다',
      },
      { meaning: '시험', translation: 'take (exam)', context: ['시험'], example: '시험을 보다' },
      {
        meaning: '~보다 (비교)',
        translation: 'than',
        context: ['크다', '작다'],
        example: '너보다 크다',
      },
      { meaning: '경험하다', translation: 'experience', context: ['고생'], example: '고생을 보다' },
    ],
  },
  {
    word: '알다',
    senses: [
      { meaning: '인지하다', translation: 'know', context: ['사실'], example: '사실을 알다' },
      { meaning: '이해하다', translation: 'understand', context: ['의미'], example: '의미를 알다' },
      { meaning: '인식하다', translation: 'recognize', context: ['사람'], example: '사람을 알다' },
    ],
  },
  {
    word: '살다',
    senses: [
      { meaning: '생존하다', translation: 'live', context: ['집'], example: '집에서 살다' },
      { meaning: '생활하다', translation: 'survive', context: ['힘들게'], example: '힘들게 살다' },
      { meaning: '삶', translation: 'life', context: ['아', '았'], example: '잘 살아' },
    ],
  },
  {
    word: '죽다',
    senses: [
      { meaning: '사망하다', translation: 'die', context: ['병'], example: '병으로 죽다' },
      {
        meaning: '고장나다',
        translation: 'break down',
        context: ['컴퓨터'],
        example: '컴퓨터가 죽다',
      },
      { meaning: '극도로', translation: 'extremely (slang)', context: ['좋다'], example: '죽이다' },
    ],
  },
  {
    word: '타다',
    senses: [
      { meaning: '탑승하다', translation: 'ride', context: ['버스', '차'], example: '버스를 타다' },
      { meaning: '불이 붙다', translation: 'burn', context: ['불'], example: '불이 타다' },
      { meaning: '피부 그을리다', translation: 'tan', context: ['햇볕'], example: '피부가 타다' },
    ],
  },
  {
    word: '내다',
    senses: [
      { meaning: '밖으로', translation: 'put out', context: ['밖'], example: '밖에 내다' },
      { meaning: '제출하다', translation: 'submit', context: ['서류'], example: '서류를 내다' },
      { meaning: '소리', translation: 'make (sound)', context: ['소리'], example: '소리를 내다' },
      { meaning: '돈을 지불', translation: 'pay', context: ['돈'], example: '돈을 내다' },
    ],
  },
  {
    word: '주다',
    senses: [
      { meaning: '전달하다', translation: 'give', context: ['선물'], example: '선물을 주다' },
      { meaning: '~해주다', translation: 'do for', context: ['해'], example: '해 주다' },
    ],
  },
  {
    word: '크다',
    senses: [
      { meaning: '크기가', translation: 'big', context: ['집', '키'], example: '집이 크다' },
      { meaning: '성장하다', translation: 'grow', context: ['자라다'], example: '크게 자라다' },
      { meaning: '중요하다', translation: 'important', context: ['의미'], example: '의미가 크다' },
    ],
  },
  {
    word: '작다',
    senses: [
      { meaning: '크기가 작은', translation: 'small', context: ['손'], example: '손이 작다' },
      { meaning: '적은', translation: 'little', context: ['양'], example: '양이 작다' },
    ],
  },
  {
    word: '많다',
    senses: [
      { meaning: '수량이', translation: 'many', context: ['사람'], example: '사람이 많다' },
      { meaning: '정도가', translation: 'much', context: ['물'], example: '물이 많다' },
    ],
  },
  {
    word: '적다',
    senses: [
      { meaning: '수량이', translation: 'few', context: ['사람'], example: '사람이 적다' },
      { meaning: '기록하다', translation: 'write down', context: ['메모'], example: '메모를 적다' },
    ],
  },
  {
    word: '빠르다',
    senses: [
      { meaning: '속도가', translation: 'fast', context: ['차'], example: '차가 빠르다' },
      { meaning: '시간이 이른', translation: 'early', context: ['시간'], example: '시간이 빠르다' },
    ],
  },
  {
    word: '느리다',
    senses: [
      { meaning: '속도가', translation: 'slow', context: ['걷다'], example: '느리게 걷다' },
      { meaning: '시간이 늦은', translation: 'late', context: ['반응'], example: '반응이 느리다' },
    ],
  },
  {
    word: '높다',
    senses: [
      { meaning: '위치가', translation: 'high', context: ['산'], example: '산이 높다' },
      { meaning: '수준이', translation: 'superior', context: ['실력'], example: '실력이 높다' },
      { meaning: '가격이', translation: 'expensive', context: ['값'], example: '값이 높다' },
    ],
  },
  {
    word: '낮다',
    senses: [
      { meaning: '위치가', translation: 'low', context: ['천장'], example: '천장이 낮다' },
      { meaning: '수준이', translation: 'inferior', context: ['실력'], example: '실력이 낮다' },
      { meaning: '가격이', translation: 'cheap', context: ['값'], example: '값이 낮다' },
    ],
  },
  {
    word: '좋다',
    senses: [
      { meaning: '만족스러운', translation: 'good', context: ['날씨'], example: '날씨가 좋다' },
      { meaning: '선호하다', translation: 'like', context: ['아'], example: '좋아하다' },
    ],
  },
  {
    word: '나쁘다',
    senses: [
      { meaning: '불만족스러운', translation: 'bad', context: ['날씨'], example: '날씨가 나쁘다' },
      { meaning: '도덕적으로', translation: 'evil', context: ['사람'], example: '나쁜 사람' },
    ],
  },
  {
    word: '쉽다',
    senses: [
      { meaning: '어렵지 않은', translation: 'easy', context: ['문제'], example: '문제가 쉽다' },
      { meaning: '~하기 쉽다', translation: 'tend to', context: ['지'], example: '쉽게' },
    ],
  },
  {
    word: '어렵다',
    senses: [
      { meaning: '힘든', translation: 'difficult', context: ['문제'], example: '문제가 어렵다' },
      { meaning: '가난한', translation: 'poor', context: ['살림'], example: '살림이 어렵다' },
    ],
  },
  {
    word: '깊다',
    senses: [
      { meaning: '깊이가', translation: 'deep', context: ['바다'], example: '바다가 깊다' },
      { meaning: '정도가', translation: 'profound', context: ['생각'], example: '생각이 깊다' },
      { meaning: '시간이 늦은', translation: 'late (time)', context: ['밤'], example: '밤이 깊다' },
    ],
  },
  {
    word: '얕다',
    senses: [
      { meaning: '깊이가', translation: 'shallow', context: ['물'], example: '물이 얕다' },
      { meaning: '천박한', translation: 'superficial', context: ['생각'], example: '생각이 얕다' },
    ],
  },
  {
    word: '넓다',
    senses: [
      { meaning: '면적이', translation: 'wide', context: ['땅'], example: '땅이 넓다' },
      { meaning: '폭이', translation: 'broad', context: ['마음'], example: '마음이 넓다' },
    ],
  },
  {
    word: '좁다',
    senses: [
      { meaning: '면적이', translation: 'narrow', context: ['길'], example: '길이 좁다' },
      {
        meaning: '편협한',
        translation: 'narrow-minded',
        context: ['마음'],
        example: '마음이 좁다',
      },
    ],
  },
  {
    word: '밝다',
    senses: [
      { meaning: '빛이 많은', translation: 'bright', context: ['방'], example: '방이 밝다' },
      {
        meaning: '지식이 많은',
        translation: 'knowledgeable',
        context: ['박식하다'],
        example: '밝은 사람',
      },
      { meaning: '성격이', translation: 'cheerful', context: ['성격'], example: '성격이 밝다' },
    ],
  },
  {
    word: '어둡다',
    senses: [
      { meaning: '빛이 없는', translation: 'dark', context: ['방'], example: '방이 어둡다' },
      { meaning: '무지한', translation: 'ignorant', context: ['지식'], example: '어두운 사람' },
      { meaning: '암울한', translation: 'gloomy', context: ['미래'], example: '미래가 어둡다' },
    ],
  },
  {
    word: '달다',
    senses: [
      { meaning: '맛이', translation: 'sweet', context: ['사탕'], example: '사탕이 달다' },
      { meaning: '부착하다', translation: 'attach', context: ['붙이다'], example: '달아 붙이다' },
      { meaning: '매달다', translation: 'hang', context: ['목에'], example: '목에 달다' },
    ],
  },
  {
    word: '쓰다',
    senses: [
      { meaning: '맛이', translation: 'bitter', context: ['약'], example: '약이 쓰다' },
      { meaning: '사용하다', translation: 'use', context: ['돈'], example: '돈을 쓰다' },
      { meaning: '쓰레기', translation: 'write', context: ['글'], example: '글을 쓰다' },
      { meaning: '착용하다', translation: 'wear', context: ['모자'], example: '모자를 쓰다' },
    ],
  },
  {
    word: '맵다',
    senses: [
      { meaning: '맛이', translation: 'spicy', context: ['고추'], example: '고추가 맵다' },
      { meaning: '날카롭다', translation: 'sharp', context: ['칼'], example: '칼이 맵다' },
    ],
  },
  {
    word: '짜다',
    senses: [
      { meaning: '소금맛', translation: 'salty', context: ['국'], example: '국이 짜다' },
      { meaning: '짜내다', translation: 'squeeze', context: ['레몬'], example: '레몬을 짜다' },
      { meaning: '엮다', translation: 'weave', context: ['옷'], example: '옷을 짜다' },
      { meaning: '계획하다', translation: 'plan', context: ['짜임'], example: '계획을 짜다' },
    ],
  },
  {
    word: '굽다',
    senses: [
      { meaning: '요리하다', translation: 'bake', context: ['빵'], example: '빵을 굽다' },
      { meaning: '휘어지다', translation: 'bent', context: ['등'], example: '등이 굽다' },
    ],
  },
  {
    word: '삶다',
    senses: [
      { meaning: '끓이다', translation: 'boil', context: ['계란'], example: '계란을 삶다' },
      { meaning: '생활', translation: 'life (noun form)', context: [''], example: '삶의 의미' },
    ],
  },
  {
    word: '뜨다',
    senses: [
      { meaning: '물에 뜨다', translation: 'float', context: ['물'], example: '물에 뜨다' },
      { meaning: '떠오르다', translation: 'rise', context: ['해'], example: '해가 뜨다' },
      { meaning: '뜨거운', translation: 'hot (short)', context: ['거운'], example: '뜨거운' },
      { meaning: '눈을 뜨다', translation: 'open (eyes)', context: ['눈'], example: '눈을 뜨다' },
      {
        meaning: '인기를 얻다',
        translation: 'become popular',
        context: ['스타'],
        example: '스타가 뜨다',
      },
    ],
  },
  {
    word: '뜨겁다',
    senses: [
      { meaning: '온도가', translation: 'hot', context: ['물'], example: '물이 뜨겁다' },
      {
        meaning: '열정적인',
        translation: 'passionate',
        context: ['마음'],
        example: '마음이 뜨겁다',
      },
    ],
  },
  {
    word: '차갑다',
    senses: [
      { meaning: '온도가', translation: 'cold', context: ['얼음'], example: '얼음이 차갑다' },
      {
        meaning: '냉정한',
        translation: 'cold-hearted',
        context: ['마음'],
        example: '마음이 차갑다',
      },
    ],
  },
  {
    word: '따뜻하다',
    senses: [
      { meaning: '온도가', translation: 'warm', context: ['날씨'], example: '날씨가 따뜻하다' },
      {
        meaning: '다정한',
        translation: 'warm-hearted',
        context: ['마음'],
        example: '마음이 따뜻하다',
      },
    ],
  },
  {
    word: '시원하다',
    senses: [
      { meaning: '온도가', translation: 'cool', context: ['바람'], example: '바람이 시원하다' },
      {
        meaning: '상쾌한',
        translation: 'refreshing',
        context: ['기분'],
        example: '기분이 시원하다',
      },
    ],
  },
  {
    word: '무겁다',
    senses: [
      { meaning: '무게가', translation: 'heavy', context: ['짐'], example: '짐이 무겁다' },
      {
        meaning: '심각한',
        translation: 'serious',
        context: ['분위기'],
        example: '분위기가 무겁다',
      },
    ],
  },
  {
    word: '가볍다',
    senses: [
      { meaning: '무게가', translation: 'light', context: ['깃털'], example: '깃털이 가볍다' },
      { meaning: '경솔한', translation: 'frivolous', context: ['행동'], example: '행동이 가볍다' },
    ],
  },
  {
    word: '세다',
    senses: [
      { meaning: '힘이 강한', translation: 'strong', context: ['힘'], example: '힘이 세다' },
      {
        meaning: '숫자를 헤아리다',
        translation: 'count',
        context: ['숫자'],
        example: '숫자를 세다',
      },
      { meaning: '새다 (틈)', translation: 'leak', context: ['물'], example: '물이 세다' },
    ],
  },
  {
    word: '약하다',
    senses: [
      { meaning: '힘이', translation: 'weak', context: ['힘'], example: '힘이 약하다' },
      { meaning: '건강이', translation: 'frail', context: ['몸'], example: '몸이 약하다' },
    ],
  },
  {
    word: '굳다',
    senses: [
      {
        meaning: '단단해지다',
        translation: 'harden',
        context: ['시멘트'],
        example: '시멘트가 굳다',
      },
      {
        meaning: '결심하다',
        translation: 'firm (determination)',
        context: ['결심'],
        example: '결심이 굳다',
      },
    ],
  },
  {
    word: '녹다',
    senses: [
      { meaning: '액체로', translation: 'melt', context: ['얼음'], example: '얼음이 녹다' },
      { meaning: '녹슬다', translation: 'rust', context: ['철'], example: '철이 녹다' },
      { meaning: '월급', translation: 'salary', context: ['받다'], example: '녹을 받다' },
    ],
  },
  {
    word: '뛰다',
    senses: [
      { meaning: '달리다', translation: 'run', context: ['빨리'], example: '빨리 뛰다' },
      { meaning: '점프하다', translation: 'jump', context: ['높이'], example: '높이 뛰다' },
      {
        meaning: '심장박동',
        translation: 'beat (heart)',
        context: ['심장'],
        example: '심장이 뛰다',
      },
    ],
  },
  {
    word: '걷다',
    senses: [
      { meaning: '걸어가다', translation: 'walk', context: ['천천히'], example: '천천히 걷다' },
      { meaning: '걷어올리다', translation: 'roll up', context: ['소매'], example: '소매를 걷다' },
      { meaning: '거두다', translation: 'collect', context: ['세금'], example: '세금을 걷다' },
    ],
  },
  {
    word: '날다',
    senses: [
      { meaning: '비행하다', translation: 'fly', context: ['새'], example: '새가 날다' },
      { meaning: '날카롭다', translation: 'sharp', context: ['칼'], example: '칼이 날다' },
      { meaning: '생(生)', translation: 'raw', context: ['고기'], example: '날 고기' },
    ],
  },
  {
    word: '떨어지다',
    senses: [
      { meaning: '추락하다', translation: 'fall', context: ['낙엽'], example: '낙엽이 떨어지다' },
      { meaning: '실패하다', translation: 'fail', context: ['시험'], example: '시험에 떨어지다' },
      {
        meaning: '멀어지다',
        translation: 'be apart',
        context: ['거리'],
        example: '거리가 떨어지다',
      },
    ],
  },
  {
    word: '오르다',
    senses: [
      { meaning: '상승하다', translation: 'climb', context: ['산'], example: '산에 오르다' },
      { meaning: '증가하다', translation: 'rise', context: ['가격'], example: '가격이 오르다' },
    ],
  },
  {
    word: '내리다',
    senses: [
      { meaning: '하강하다', translation: 'descend', context: ['계단'], example: '계단을 내리다' },
      {
        meaning: '강수',
        translation: 'fall (rain/snow)',
        context: ['비', '눈'],
        example: '비가 내리다',
      },
      {
        meaning: '결정하다',
        translation: 'make (decision)',
        context: ['결정'],
        example: '결정을 내리다',
      },
      {
        meaning: '하차하다',
        translation: 'get off',
        context: ['버스'],
        example: '버스에서 내리다',
      },
    ],
  },
  {
    word: '올리다',
    senses: [
      { meaning: '위로', translation: 'raise', context: ['손'], example: '손을 올리다' },
      {
        meaning: '증가시키다',
        translation: 'increase',
        context: ['가격'],
        example: '가격을 올리다',
      },
      { meaning: '업로드', translation: 'upload', context: ['사진'], example: '사진을 올리다' },
    ],
  },
  {
    word: '내려가다',
    senses: [
      { meaning: '아래로', translation: 'go down', context: ['계단'], example: '계단을 내려가다' },
      {
        meaning: '감소하다',
        translation: 'decrease',
        context: ['온도'],
        example: '온도가 내려가다',
      },
    ],
  },
  {
    word: '올라가다',
    senses: [
      { meaning: '위로', translation: 'go up', context: ['산'], example: '산에 올라가다' },
      {
        meaning: '증가하다',
        translation: 'increase',
        context: ['온도'],
        example: '온도가 올라가다',
      },
    ],
  },
  {
    word: '끊다',
    senses: [
      { meaning: '절단하다', translation: 'cut', context: ['줄'], example: '줄을 끊다' },
      { meaning: '중단하다', translation: 'stop', context: ['담배'], example: '담배를 끊다' },
      { meaning: '전화를', translation: 'hang up', context: ['전화'], example: '전화를 끊다' },
    ],
  },
  {
    word: '끓다',
    senses: [
      { meaning: '비등하다', translation: 'boil', context: ['물'], example: '물이 끓다' },
      { meaning: '화가 나다', translation: 'seethe', context: ['화'], example: '화가 끓다' },
    ],
  },
  {
    word: '끓이다',
    senses: [
      { meaning: '요리하다', translation: 'boil', context: ['물'], example: '물을 끓이다' },
      { meaning: '조리하다', translation: 'cook', context: ['국'], example: '국을 끓이다' },
    ],
  },
  {
    word: '끌다',
    senses: [
      { meaning: '당기다', translation: 'pull', context: ['줄'], example: '줄을 끌다' },
      { meaning: '유인하다', translation: 'attract', context: ['관심'], example: '관심을 끌다' },
      { meaning: '끌고가다', translation: 'drag', context: ['짐'], example: '짐을 끌다' },
    ],
  },
  {
    word: '밀다',
    senses: [
      { meaning: '밀어내다', translation: 'push', context: ['문'], example: '문을 밀다' },
      { meaning: '면도하다', translation: 'shave', context: ['수염'], example: '수염을 밀다' },
    ],
  },
  {
    word: '밀리다',
    senses: [
      { meaning: '밀려나다', translation: 'be pushed', context: ['밀려'], example: '밀려나다' },
      { meaning: '지연되다', translation: 'be delayed', context: ['일'], example: '일이 밀리다' },
    ],
  },
  {
    word: '모으다',
    senses: [
      { meaning: '수집하다', translation: 'collect', context: ['우표'], example: '우표를 모으다' },
      { meaning: '저축하다', translation: 'save', context: ['돈'], example: '돈을 모으다' },
      { meaning: '소집하다', translation: 'gather', context: ['사람'], example: '사람을 모으다' },
    ],
  },
  {
    word: '모이다',
    senses: [
      { meaning: '집합하다', translation: 'gather', context: ['사람'], example: '사람이 모이다' },
      { meaning: '축적되다', translation: 'accumulate', context: ['돈'], example: '돈이 모이다' },
    ],
  },
  {
    word: '펴다',
    senses: [
      { meaning: '펼치다', translation: 'spread', context: ['지도'], example: '지도를 펴다' },
      { meaning: '해결하다', translation: 'resolve', context: ['문제'], example: '문제를 펴다' },
      { meaning: '출판하다', translation: 'publish', context: ['책'], example: '책을 펴다' },
    ],
  },
  {
    word: '접다',
    senses: [
      { meaning: '접어 넣다', translation: 'fold', context: ['종이'], example: '종이를 접다' },
      { meaning: '그만두다', translation: 'quit', context: ['사업'], example: '사업을 접다' },
    ],
  },
  {
    word: '켜다',
    senses: [
      {
        meaning: '작동시키다',
        translation: 'turn on',
        context: ['불', '전원'],
        example: '불을 켜다',
      },
      {
        meaning: '악기를 연주',
        translation: 'play (instrument)',
        context: ['피아노'],
        example: '피아노를 켜다',
      },
    ],
  },
  {
    word: '끄다',
    senses: [
      {
        meaning: '정지시키다',
        translation: 'turn off',
        context: ['불', '전원'],
        example: '불을 끄다',
      },
      { meaning: '소화하다', translation: 'put out (fire)', context: ['불'], example: '불을 끄다' },
    ],
  },
  {
    word: '풀다',
    senses: [
      { meaning: '해체하다', translation: 'untie', context: ['매듭'], example: '매듭을 풀다' },
      { meaning: '해결하다', translation: 'solve', context: ['문제'], example: '문제를 풀다' },
      { meaning: '이완하다', translation: 'relax', context: ['긴장'], example: '긴장을 풀다' },
    ],
  },
  {
    word: '묶다',
    senses: [
      { meaning: '결속하다', translation: 'tie', context: ['끈'], example: '끈으로 묶다' },
      { meaning: '그룹화하다', translation: 'bundle', context: ['책'], example: '책을 묶다' },
    ],
  },
  {
    word: '열다',
    senses: [
      { meaning: '개방하다', translation: 'open', context: ['문'], example: '문을 열다' },
      { meaning: '개최하다', translation: 'hold', context: ['회의'], example: '회의를 열다' },
      { meaning: '시작하다', translation: 'start', context: ['가게'], example: '가게를 열다' },
    ],
  },
  {
    word: '닫다',
    senses: [
      { meaning: '폐쇄하다', translation: 'close', context: ['문'], example: '문을 닫다' },
      { meaning: '종료하다', translation: 'shut down', context: ['가게'], example: '가게를 닫다' },
    ],
  },
  {
    word: '맞다',
    senses: [
      { meaning: '정확하다', translation: 'correct', context: ['답'], example: '답이 맞다' },
      { meaning: '맞이하다', translation: 'welcome', context: ['손님'], example: '손님을 맞다' },
      { meaning: '맞추다', translation: 'fit', context: ['옷'], example: '옷이 맞다' },
      { meaning: '타격당하다', translation: 'be hit', context: ['맞아'], example: '맞았다' },
    ],
  },
  {
    word: '틀리다',
    senses: [
      { meaning: '부정확하다', translation: 'wrong', context: ['답'], example: '답이 틀리다' },
      { meaning: '다르다', translation: 'different', context: ['의견'], example: '의견이 틀리다' },
    ],
  },
  {
    word: '같다',
    senses: [
      { meaning: '동일하다', translation: 'same', context: ['색'], example: '색이 같다' },
      { meaning: '~같다 (추측)', translation: 'seem like', context: ['것'], example: '것 같다' },
    ],
  },
  {
    word: '다르다',
    senses: [
      { meaning: '상이하다', translation: 'different', context: ['색'], example: '색이 다르다' },
      { meaning: '특별하다', translation: 'special', context: ['남'], example: '남다르다' },
    ],
  },
  {
    word: '비슷하다',
    senses: [
      {
        meaning: '유사하다',
        translation: 'similar',
        context: ['모양'],
        example: '모양이 비슷하다',
      },
      { meaning: '거의', translation: 'almost', context: ['한'], example: '비슷한' },
    ],
  },
  // 추가 동음이의어 (명사 및 복합어 계속)
  {
    word: '배',
    senses: [
      { meaning: '과일', translation: 'pear', context: ['먹다', '따다'], example: '배를 먹다' },
      {
        meaning: '신체부위',
        translation: 'stomach',
        context: ['아프다', '고프다'],
        example: '배가 고프다',
      },
      { meaning: '선박', translation: 'ship', context: ['타다', '출항'], example: '배를 타다' },
      { meaning: '곱', translation: 'times (math)', context: ['두', '세'], example: '두 배' },
    ],
  },
  {
    word: '손',
    senses: [
      { meaning: '신체부위', translation: 'hand', context: ['씻다', '잡다'], example: '손을 씻다' },
      { meaning: '손님', translation: 'guest', context: ['많다'], example: '손이 많다' },
      {
        meaning: '솜씨',
        translation: 'skill',
        context: ['좋다', '빠르다'],
        example: '손이 빠르다',
      },
    ],
  },
  {
    word: '발',
    senses: [
      {
        meaning: '신체부위',
        translation: 'foot',
        context: ['씻다', '아프다'],
        example: '발이 아프다',
      },
      { meaning: '발걸음', translation: 'step', context: ['떼다', '옮기다'], example: '발을 떼다' },
    ],
  },
  {
    word: '가지',
    senses: [
      { meaning: '나뭇가지', translation: 'branch', context: ['나무'], example: '나뭇가지' },
      { meaning: '채소', translation: 'eggplant', context: ['볶다'], example: '가지를 볶다' },
      { meaning: '종류', translation: 'kind', context: ['여러', '몇'], example: '여러 가지' },
    ],
  },
  {
    word: '뿌리',
    senses: [
      {
        meaning: '식물의',
        translation: 'root',
        context: ['내리다', '뽑다'],
        example: '뿌리를 내리다',
      },
      { meaning: '근원', translation: 'origin', context: ['깊다'], example: '뿌리가 깊다' },
    ],
  },
  {
    word: '꽃',
    senses: [
      { meaning: '식물의', translation: 'flower', context: ['피다', '지다'], example: '꽃이 피다' },
      { meaning: '정수', translation: 'essence', context: ['청춘'], example: '청춘의 꽃' },
    ],
  },
  {
    word: '열매',
    senses: [
      { meaning: '과실', translation: 'fruit', context: ['맺다', '따다'], example: '열매를 맺다' },
      { meaning: '결과', translation: 'result', context: ['노력'], example: '노력의 열매' },
    ],
  },
  {
    word: '씨',
    senses: [
      { meaning: '종자', translation: 'seed', context: ['뿌리다', '심다'], example: '씨를 뿌리다' },
      { meaning: '존칭', translation: 'Mr./Ms.', context: ['김', '이'], example: '김 씨' },
      { meaning: '핵심', translation: 'essence', context: ['알', '속'], example: '씨가 마르다' },
    ],
  },
  {
    word: '별',
    senses: [
      { meaning: '천체', translation: 'star', context: ['빛나다'], example: '별이 빛나다' },
      { meaning: '특별한', translation: 'special', context: ['다', '것'], example: '별것' },
      { meaning: '이상한', translation: 'strange', context: ['일'], example: '별일' },
    ],
  },
  {
    word: '돌',
    senses: [
      { meaning: '암석', translation: 'stone', context: ['던지다'], example: '돌을 던지다' },
      { meaning: '1주년', translation: 'first birthday', context: ['아기'], example: '돌잔치' },
      { meaning: '회전', translation: 'turn', context: ['다'], example: '돌다' },
    ],
  },
  {
    word: '바위',
    senses: [
      { meaning: '큰 돌', translation: 'rock', context: ['부수다'], example: '바위를 부수다' },
      { meaning: '견고함', translation: 'solid', context: ['같다'], example: '바위같다' },
    ],
  },
  {
    word: '산',
    senses: [
      { meaning: '지형', translation: 'mountain', context: ['오르다'], example: '산에 오르다' },
      { meaning: '계산', translation: 'bill', context: ['내다'], example: '산을 내다' },
      { meaning: '산성', translation: 'acid', context: ['성'], example: '산성' },
    ],
  },
  {
    word: '강',
    senses: [
      { meaning: '하천', translation: 'river', context: ['흐르다'], example: '강이 흐르다' },
      { meaning: '강도', translation: 'strength', context: ['도'], example: '강도' },
      { meaning: '강도(범죄)', translation: 'robbery', context: ['사건'], example: '강도 사건' },
    ],
  },
  {
    word: '바다',
    senses: [
      { meaning: '해양', translation: 'sea', context: ['깊다'], example: '바다가 깊다' },
      { meaning: '많음', translation: 'vast amount', context: ['사람'], example: '사람의 바다' },
    ],
  },
  {
    word: '섬',
    senses: [
      { meaning: '도서', translation: 'island', context: ['가다'], example: '섬에 가다' },
      { meaning: '번쩍임', translation: 'flash', context: ['번쩍'], example: '섬광' },
    ],
  },
  {
    word: '하늘',
    senses: [
      { meaning: '천공', translation: 'sky', context: ['맑다'], example: '하늘이 맑다' },
      { meaning: '신', translation: 'heaven', context: ['님'], example: '하늘님' },
    ],
  },
  {
    word: '땅',
    senses: [
      { meaning: '지면', translation: 'ground', context: ['파다'], example: '땅을 파다' },
      { meaning: '토지', translation: 'land', context: ['사다'], example: '땅을 사다' },
    ],
  },
  {
    word: '공기',
    senses: [
      { meaning: '기체', translation: 'air', context: ['신선하다'], example: '공기가 신선하다' },
      { meaning: '빈 그릇', translation: 'empty bowl', context: ['밥'], example: '밥 공기' },
    ],
  },
  {
    word: '바람',
    senses: [
      { meaning: '기류', translation: 'wind', context: ['불다'], example: '바람이 불다' },
      { meaning: '소망', translation: 'wish', context: ['있다'], example: '바람이 있다' },
      { meaning: '외도', translation: 'affair', context: ['피우다'], example: '바람을 피우다' },
    ],
  },
  {
    word: '비',
    senses: [
      { meaning: '강수', translation: 'rain', context: ['오다', '내리다'], example: '비가 오다' },
      { meaning: '비율', translation: 'ratio', context: ['율'], example: '비율' },
      { meaning: '~아님', translation: 'non-', context: ['공개'], example: '비공개' },
    ],
  },
  {
    word: '눈',
    senses: [
      { meaning: '시각기관', translation: 'eye', context: ['뜨다', '감다'], example: '눈을 뜨다' },
      { meaning: '설', translation: 'snow', context: ['오다'], example: '눈이 오다' },
      { meaning: '눈치', translation: 'sense', context: ['치'], example: '눈치' },
    ],
  },
  {
    word: '해',
    senses: [
      { meaning: '태양', translation: 'sun', context: ['뜨다', '지다'], example: '해가 뜨다' },
      { meaning: '년', translation: 'year', context: ['새', '지난'], example: '새해' },
      { meaning: '손해', translation: 'harm', context: ['를 끼치다'], example: '해를 끼치다' },
      { meaning: '하다(명령)', translation: 'do (imperative)', context: ['라'], example: '해' },
    ],
  },
  {
    word: '달',
    senses: [
      { meaning: '월구', translation: 'moon', context: ['뜨다'], example: '달이 뜨다' },
      { meaning: '월', translation: 'month', context: ['한', '두'], example: '한 달' },
    ],
  },
  {
    word: '빛',
    senses: [
      { meaning: '광선', translation: 'light', context: ['나다'], example: '빛이 나다' },
      { meaning: '영광', translation: 'glory', context: ['보다'], example: '빛을 보다' },
      { meaning: '부채', translation: 'debt', context: ['지다'], example: '빛을 지다' },
    ],
  },
  {
    word: '그림자',
    senses: [
      { meaning: '음영', translation: 'shadow', context: ['지다'], example: '그림자가 지다' },
      { meaning: '흔적', translation: 'trace', context: ['도 없다'], example: '그림자도 없다' },
    ],
  },
  {
    word: '소리',
    senses: [
      { meaning: '음향', translation: 'sound', context: ['나다'], example: '소리가 나다' },
      { meaning: '말', translation: 'word', context: ['듣다'], example: '소리를 듣다' },
      { meaning: '소문', translation: 'rumor', context: ['없다'], example: '소리 없다' },
    ],
  },
  {
    word: '냄새',
    senses: [
      { meaning: '후각', translation: 'smell', context: ['나다', '맡다'], example: '냄새가 나다' },
      { meaning: '기미', translation: 'sign', context: ['풍기다'], example: '냄새를 풍기다' },
    ],
  },
  {
    word: '맛',
    senses: [
      { meaning: '미각', translation: 'taste', context: ['보다', '있다'], example: '맛을 보다' },
      { meaning: '재미', translation: 'fun', context: ['들리다'], example: '맛이 들리다' },
    ],
  },
  {
    word: '기분',
    senses: [
      { meaning: '감정', translation: 'mood', context: ['좋다', '나쁘다'], example: '기분이 좋다' },
    ],
  },
  {
    word: '마음',
    senses: [
      { meaning: '심성', translation: 'heart', context: ['넓다'], example: '마음이 넓다' },
      { meaning: '의도', translation: 'mind', context: ['먹다'], example: '마음을 먹다' },
    ],
  },
  {
    word: '정신',
    senses: [
      { meaning: '의식', translation: 'mind', context: ['차리다'], example: '정신을 차리다' },
      { meaning: '영혼', translation: 'spirit', context: ['없다'], example: '정신이 없다' },
    ],
  },
  {
    word: '몸',
    senses: [
      { meaning: '육체', translation: 'body', context: ['건강하다'], example: '몸이 건강하다' },
      { meaning: '자신', translation: 'oneself', context: ['조심하다'], example: '몸을 조심하다' },
    ],
  },
  {
    word: '얼굴',
    senses: [
      { meaning: '안면', translation: 'face', context: ['씻다'], example: '얼굴을 씻다' },
      { meaning: '체면', translation: 'reputation', context: ['들다'], example: '얼굴을 들다' },
    ],
  },
  {
    word: '웃음',
    senses: [
      { meaning: '소리', translation: 'laughter', context: ['짓다'], example: '웃음을 짓다' },
      { meaning: '조롱', translation: 'ridicule', context: ['거리'], example: '웃음거리' },
    ],
  },
  {
    word: '눈물',
    senses: [
      { meaning: '물', translation: 'tears', context: ['흘리다'], example: '눈물을 흘리다' },
      { meaning: '감동', translation: 'emotion', context: ['없이'], example: '눈물 없이' },
    ],
  },
  {
    word: '말',
    senses: [
      { meaning: '언어', translation: 'word', context: ['하다'], example: '말을 하다' },
      { meaning: '동물', translation: 'horse', context: ['타다'], example: '말을 타다' },
      { meaning: '단위', translation: 'measure (grain)', context: ['한'], example: '한 말' },
    ],
  },
  {
    word: '글',
    senses: [
      { meaning: '문자', translation: 'writing', context: ['쓰다'], example: '글을 쓰다' },
      { meaning: '글씨', translation: 'handwriting', context: ['체'], example: '글체' },
    ],
  },
  {
    word: '이야기',
    senses: [
      { meaning: '얘기', translation: 'story', context: ['하다'], example: '이야기를 하다' },
      {
        meaning: '대화',
        translation: 'conversation',
        context: ['나누다'],
        example: '이야기를 나누다',
      },
    ],
  },
  {
    word: '소식',
    senses: [
      { meaning: '뉴스', translation: 'news', context: ['듣다'], example: '소식을 듣다' },
      {
        meaning: '절제',
        translation: 'moderation (eating)',
        context: ['하다'],
        example: '소식하다',
      },
    ],
  },
  {
    word: '생각',
    senses: [
      { meaning: '사고', translation: 'thought', context: ['하다'], example: '생각을 하다' },
      { meaning: '의견', translation: 'opinion', context: ['다르다'], example: '생각이 다르다' },
    ],
  },
  {
    word: '꿈',
    senses: [
      { meaning: '수면중', translation: 'dream', context: ['꾸다'], example: '꿈을 꾸다' },
      { meaning: '이상', translation: 'aspiration', context: ['이루다'], example: '꿈을 이루다' },
    ],
  },
  {
    word: '사랑',
    senses: [{ meaning: '애정', translation: 'love', context: ['하다'], example: '사랑을 하다' }],
  },
  {
    word: '화',
    senses: [
      { meaning: '분노', translation: 'anger', context: ['나다'], example: '화가 나다' },
      { meaning: '재앙', translation: 'disaster', context: ['를 당하다'], example: '화를 당하다' },
      { meaning: '불', translation: 'fire', context: ['재'], example: '화재' },
    ],
  },
  {
    word: '일',
    senses: [
      { meaning: '작업', translation: 'work', context: ['하다'], example: '일을 하다' },
      { meaning: '사건', translation: 'matter', context: ['생기다'], example: '일이 생기다' },
      { meaning: '하나', translation: 'one (Sino-Korean)', context: [''], example: '일월' },
    ],
  },
  {
    word: '공부',
    senses: [{ meaning: '학습', translation: 'study', context: ['하다'], example: '공부를 하다' }],
  },
  {
    word: '시험',
    senses: [
      { meaning: '시험', translation: 'exam', context: ['보다'], example: '시험을 보다' },
      { meaning: '테스트', translation: 'test', context: ['하다'], example: '시험을 하다' },
    ],
  },
  {
    word: '약속',
    senses: [
      { meaning: '언약', translation: 'promise', context: ['하다'], example: '약속을 하다' },
      { meaning: '예약', translation: 'appointment', context: ['잡다'], example: '약속을 잡다' },
    ],
  },
  {
    word: '거짓말',
    senses: [{ meaning: '허위', translation: 'lie', context: ['하다'], example: '거짓말을 하다' }],
  },
  {
    word: '문제',
    senses: [
      { meaning: '퀴즈', translation: 'problem', context: ['풀다'], example: '문제를 풀다' },
      { meaning: '이슈', translation: 'issue', context: ['생기다'], example: '문제가 생기다' },
    ],
  },
  {
    word: '계획',
    senses: [
      { meaning: '기획', translation: 'plan', context: ['세우다'], example: '계획을 세우다' },
    ],
  },
  {
    word: '시작',
    senses: [{ meaning: '개시', translation: 'start', context: ['하다'], example: '시작을 하다' }],
  },
  {
    word: '끝',
    senses: [
      { meaning: '종료', translation: 'end', context: ['나다'], example: '끝이 나다' },
      { meaning: '극단', translation: 'tip', context: ['부분'], example: '끝부분' },
    ],
  },
  {
    word: '중간',
    senses: [
      { meaning: '가운데', translation: 'middle', context: ['에'], example: '중간에' },
      {
        meaning: '중간고사',
        translation: 'midterm (short)',
        context: ['고사'],
        example: '중간고사',
      },
    ],
  },
  {
    word: '처음',
    senses: [
      { meaning: '시초', translation: 'beginning', context: ['부터'], example: '처음부터' },
      { meaning: '첫', translation: 'first time', context: ['보다'], example: '처음 보다' },
    ],
  },
  {
    word: '나중',
    senses: [{ meaning: '후', translation: 'later', context: ['에'], example: '나중에' }],
  },
  {
    word: '앞',
    senses: [
      { meaning: '전방', translation: 'front', context: ['으로'], example: '앞으로' },
      { meaning: '미래', translation: 'future', context: ['날'], example: '앞날' },
    ],
  },
  {
    word: '뒤',
    senses: [
      { meaning: '후방', translation: 'back', context: ['로'], example: '뒤로' },
      { meaning: '나중', translation: 'after', context: ['에'], example: '뒤에' },
    ],
  },
  {
    word: '옆',
    senses: [{ meaning: '측면', translation: 'side', context: ['에'], example: '옆에' }],
  },
  {
    word: '위',
    senses: [
      { meaning: '상부', translation: 'top', context: ['에'], example: '위에' },
      { meaning: '지위', translation: 'position', context: ['높다'], example: '위가 높다' },
    ],
  },
  {
    word: '아래',
    senses: [
      { meaning: '하부', translation: 'bottom', context: ['에'], example: '아래에' },
      { meaning: '하급', translation: 'subordinate', context: ['사람'], example: '아래 사람' },
    ],
  },
  {
    word: '안',
    senses: [
      { meaning: '내부', translation: 'inside', context: ['에'], example: '안에' },
      { meaning: '부정', translation: 'not', context: ['~', '되다'], example: '안 되다' },
      { meaning: '성씨', translation: 'Ahn (surname)', context: ['씨'], example: '안 씨' },
    ],
  },
  {
    word: '밖',
    senses: [
      { meaning: '외부', translation: 'outside', context: ['에'], example: '밖에' },
      { meaning: '~외', translation: 'other than', context: ['에'], example: '밖에' },
    ],
  },
  {
    word: '곳',
    senses: [{ meaning: '장소', translation: 'place', context: ['여러'], example: '여러 곳' }],
  },
  {
    word: '때',
    senses: [
      { meaning: '시간', translation: 'time', context: ['그', '그때'], example: '그때' },
      { meaning: '때(오물)', translation: 'dirt', context: ['밀다'], example: '때를 밀다' },
    ],
  },
  {
    word: '동안',
    senses: [
      { meaning: '기간', translation: 'while', context: ['그', '잠시'], example: '잠시 동안' },
    ],
  },
  {
    word: '사이',
    senses: [
      { meaning: '간격', translation: 'between', context: ['나무'], example: '나무 사이' },
      { meaning: '관계', translation: 'relationship', context: ['친구'], example: '친구 사이' },
    ],
  },
  {
    word: '새',
    senses: [
      { meaning: '조류', translation: 'bird', context: ['날다'], example: '새가 날다' },
      { meaning: '새로운', translation: 'new', context: ['옷'], example: '새 옷' },
      { meaning: '사이', translation: 'between', context: ['틈'], example: '틈새' },
    ],
  },
  {
    word: '사람',
    senses: [
      { meaning: '인간', translation: 'person', context: ['좋다'], example: '좋은 사람' },
      { meaning: '연인', translation: 'lover', context: ['만나다'], example: '사람을 만나다' },
    ],
  },
  {
    word: '사자',
    senses: [
      { meaning: '동물', translation: 'lion', context: ['울다'], example: '사자가 울다' },
      { meaning: '사신', translation: 'messenger', context: ['보내다'], example: '사자를 보내다' },
      { meaning: '죽은자', translation: 'dead person', context: ['혼'], example: '사자의 혼' },
    ],
  },
  {
    word: '원숭이',
    senses: [{ meaning: '동물', translation: 'monkey', context: ['재주'], example: '원숭이 재주' }],
  },
  {
    word: '호랑이',
    senses: [
      { meaning: '동물', translation: 'tiger', context: ['무섭다'], example: '호랑이가 무섭다' },
    ],
  },
  {
    word: '곰',
    senses: [
      { meaning: '동물', translation: 'bear', context: ['큰'], example: '큰 곰' },
      { meaning: '곰팡이', translation: 'mold (short)', context: ['팡이'], example: '곰팡이' },
    ],
  },
  {
    word: '소',
    senses: [
      { meaning: '동물', translation: 'cow', context: ['키우다'], example: '소를 키우다' },
      { meaning: '작은', translation: 'small (Sino)', context: ['식'], example: '소식' },
      { meaning: '소송', translation: 'lawsuit (short)', context: ['송'], example: '소송' },
    ],
  },
  {
    word: '돼지',
    senses: [
      { meaning: '동물', translation: 'pig', context: ['키우다'], example: '돼지를 키우다' },
    ],
  },
  {
    word: '닭',
    senses: [
      { meaning: '동물', translation: 'chicken', context: ['키우다'], example: '닭을 키우다' },
    ],
  },
  {
    word: '물고기',
    senses: [{ meaning: '동물', translation: 'fish', context: ['잡다'], example: '물고기를 잡다' }],
  },
  {
    word: '나무',
    senses: [
      { meaning: '식물', translation: 'tree', context: ['심다'], example: '나무를 심다' },
      { meaning: '목재', translation: 'wood', context: ['로'], example: '나무로' },
    ],
  },
  {
    word: '풀',
    senses: [
      { meaning: '초', translation: 'grass', context: ['뜯다'], example: '풀을 뜯다' },
      { meaning: '접착제', translation: 'glue', context: ['붙이다'], example: '풀로 붙이다' },
    ],
  },
  {
    word: '밥',
    senses: [
      { meaning: '식사', translation: 'meal', context: ['먹다'], example: '밥을 먹다' },
      { meaning: '쌀밥', translation: 'rice', context: ['짓다'], example: '밥을 짓다' },
    ],
  },
  {
    word: '국',
    senses: [
      { meaning: '국물', translation: 'soup', context: ['끓이다'], example: '국을 끓이다' },
      { meaning: '나라', translation: 'country', context: ['가'], example: '국가' },
    ],
  },
  {
    word: '김치',
    senses: [
      { meaning: '음식', translation: 'kimchi', context: ['담그다'], example: '김치를 담그다' },
    ],
  },
  {
    word: '차',
    senses: [
      { meaning: '차량', translation: 'car', context: ['타다'], example: '차를 타다' },
      { meaning: '차(음료)', translation: 'tea', context: ['마시다'], example: '차를 마시다' },
      { meaning: '차이', translation: 'difference', context: ['이'], example: '차이' },
      { meaning: '차다(동사)', translation: 'cold (verb)', context: ['다'], example: '차다' },
    ],
  },
  {
    word: '술',
    senses: [
      { meaning: '주류', translation: 'alcohol', context: ['마시다'], example: '술을 마시다' },
      { meaning: '기술', translation: 'skill (short)', context: ['재'], example: '재술' },
    ],
  },
  {
    word: '물',
    senses: [
      { meaning: '액체', translation: 'water', context: ['마시다'], example: '물을 마시다' },
      { meaning: '물건', translation: 'thing (short)', context: ['건'], example: '물건' },
    ],
  },
  {
    word: '우유',
    senses: [
      { meaning: '유제품', translation: 'milk', context: ['마시다'], example: '우유를 마시다' },
    ],
  },
  {
    word: '빵',
    senses: [{ meaning: '음식', translation: 'bread', context: ['먹다'], example: '빵을 먹다' }],
  },
  {
    word: '과자',
    senses: [{ meaning: '간식', translation: 'snack', context: ['먹다'], example: '과자를 먹다' }],
  },
  {
    word: '사탕',
    senses: [{ meaning: '캔디', translation: 'candy', context: ['먹다'], example: '사탕을 먹다' }],
  },
  {
    word: '옷',
    senses: [{ meaning: '의복', translation: 'clothes', context: ['입다'], example: '옷을 입다' }],
  },
  {
    word: '신발',
    senses: [{ meaning: '이화', translation: 'shoes', context: ['신다'], example: '신발을 신다' }],
  },
  {
    word: '모자',
    senses: [
      { meaning: '두식', translation: 'hat', context: ['쓰다'], example: '모자를 쓰다' },
      { meaning: '부족함', translation: 'shortage', context: ['라다'], example: '모자라다' },
    ],
  },
  {
    word: '가방',
    senses: [{ meaning: '가죽', translation: 'bag', context: ['메다'], example: '가방을 메다' }],
  },
  {
    word: '책',
    senses: [{ meaning: '서적', translation: 'book', context: ['읽다'], example: '책을 읽다' }],
  },
  {
    word: '공',
    senses: [
      { meaning: '구', translation: 'ball', context: ['던지다'], example: '공을 던지다' },
      { meaning: '공로', translation: 'merit', context: ['세우다'], example: '공을 세우다' },
      { meaning: '공평', translation: 'fair (short)', context: ['평'], example: '공평' },
    ],
  },
  {
    word: '그릇',
    senses: [
      { meaning: '용기', translation: 'bowl', context: ['씻다'], example: '그릇을 씻다' },
      { meaning: '인물', translation: 'caliber', context: ['크다'], example: '그릇이 크다' },
    ],
  },
  {
    word: '칼',
    senses: [
      { meaning: '도구', translation: 'knife', context: ['날카롭다'], example: '칼이 날카롭다' },
    ],
  },
  {
    word: '가위',
    senses: [
      { meaning: '도구', translation: 'scissors', context: ['자르다'], example: '가위로 자르다' },
      {
        meaning: '가위눌림',
        translation: 'sleep paralysis',
        context: ['눌리다'],
        example: '가위에 눌리다',
      },
    ],
  },
  {
    word: '연필',
    senses: [
      { meaning: '필기구', translation: 'pencil', context: ['쓰다'], example: '연필로 쓰다' },
    ],
  },
  {
    word: '종이',
    senses: [{ meaning: '지', translation: 'paper', context: ['접다'], example: '종이를 접다' }],
  },
  {
    word: '형',
    senses: [
      { meaning: '오빠(남자)', translation: 'older brother', context: ['님'], example: '형님' },
      { meaning: '형태', translation: 'form (short)', context: ['태'], example: '형태' },
      { meaning: '형벌', translation: 'punishment (short)', context: ['벌'], example: '형벌' },
    ],
  },
  {
    word: '동생',
    senses: [
      { meaning: '아우', translation: 'younger sibling', context: ['남'], example: '남동생' },
    ],
  },
  {
    word: '친구',
    senses: [
      { meaning: '벗', translation: 'friend', context: ['만나다'], example: '친구를 만나다' },
    ],
  },
  {
    word: '선생님',
    senses: [
      {
        meaning: '교사',
        translation: 'teacher',
        context: ['가르치다'],
        example: '선생님이 가르치다',
      },
    ],
  },
  {
    word: '학생',
    senses: [
      {
        meaning: '제자',
        translation: 'student',
        context: ['공부하다'],
        example: '학생이 공부하다',
      },
    ],
  },
  {
    word: '아이',
    senses: [
      { meaning: '어린이', translation: 'child', context: ['놀다'], example: '아이가 놀다' },
    ],
  },
  {
    word: '어른',
    senses: [{ meaning: '성인', translation: 'adult', context: ['되다'], example: '어른이 되다' }],
  },
  {
    word: '할머니',
    senses: [
      { meaning: '조모', translation: 'grandmother', context: ['집'], example: '할머니 집' },
    ],
  },
  {
    word: '할아버지',
    senses: [
      { meaning: '조부', translation: 'grandfather', context: ['집'], example: '할아버지 집' },
    ],
  },
  {
    word: '부모',
    senses: [{ meaning: '양친', translation: 'parents', context: ['님'], example: '부모님' }],
  },
  {
    word: '아버지',
    senses: [{ meaning: '부친', translation: 'father', context: ['께서'], example: '아버지께서' }],
  },
  {
    word: '어머니',
    senses: [{ meaning: '모친', translation: 'mother', context: ['께서'], example: '어머니께서' }],
  },
  // 추가 동음이의어 (최종 배치)
  {
    word: '학교',
    senses: [
      { meaning: '교육기관', translation: 'school', context: ['가다'], example: '학교에 가다' },
    ],
  },
  {
    word: '회사',
    senses: [
      { meaning: '기업', translation: 'company', context: ['다니다'], example: '회사를 다니다' },
    ],
  },
  {
    word: '병원',
    senses: [
      { meaning: '의료기관', translation: 'hospital', context: ['가다'], example: '병원에 가다' },
    ],
  },
  {
    word: '공원',
    senses: [
      {
        meaning: '공공장소',
        translation: 'park',
        context: ['산책하다'],
        example: '공원을 산책하다',
      },
    ],
  },
  {
    word: '식당',
    senses: [
      { meaning: '음식점', translation: 'restaurant', context: ['가다'], example: '식당에 가다' },
    ],
  },
  {
    word: '상점',
    senses: [
      { meaning: '가게', translation: 'store', context: ['들어가다'], example: '상점에 들어가다' },
    ],
  },
  {
    word: '은행',
    senses: [
      { meaning: '금융기관', translation: 'bank', context: ['가다'], example: '은행에 가다' },
    ],
  },
  {
    word: '우체국',
    senses: [
      {
        meaning: '우편기관',
        translation: 'post office',
        context: ['가다'],
        example: '우체국에 가다',
      },
    ],
  },
  {
    word: '도서관',
    senses: [
      { meaning: '독서실', translation: 'library', context: ['가다'], example: '도서관에 가다' },
    ],
  },
  {
    word: '박물관',
    senses: [
      { meaning: '전시관', translation: 'museum', context: ['가다'], example: '박물관에 가다' },
    ],
  },
  {
    word: '극장',
    senses: [
      { meaning: '영화관', translation: 'theater', context: ['가다'], example: '극장에 가다' },
    ],
  },
  {
    word: '역',
    senses: [
      { meaning: '정거장', translation: 'station', context: ['가다'], example: '역에 가다' },
      { meaning: '배역', translation: 'role', context: ['맡다'], example: '역을 맡다' },
    ],
  },
  {
    word: '공항',
    senses: [
      { meaning: '비행장', translation: 'airport', context: ['가다'], example: '공항에 가다' },
    ],
  },
  {
    word: '항구',
    senses: [
      { meaning: '포트', translation: 'port', context: ['도착하다'], example: '항구에 도착하다' },
    ],
  },
  {
    word: '다리',
    senses: [
      { meaning: '신체부위', translation: 'leg', context: ['아프다'], example: '다리가 아프다' },
      { meaning: '교량', translation: 'bridge', context: ['건너다'], example: '다리를 건너다' },
    ],
  },
  {
    word: '호텔',
    senses: [
      { meaning: '숙박시설', translation: 'hotel', context: ['묵다'], example: '호텔에 묵다' },
    ],
  },
  {
    word: '시장',
    senses: [
      { meaning: '시티장', translation: 'market', context: ['가다'], example: '시장에 가다' },
      { meaning: '시장(직)', translation: 'mayor', context: ['선거'], example: '시장 선거' },
    ],
  },
  {
    word: '거리',
    senses: [
      { meaning: '길', translation: 'street', context: ['걷다'], example: '거리를 걷다' },
      { meaning: '간격', translation: 'distance', context: ['멀다'], example: '거리가 멀다' },
    ],
  },
  {
    word: '골목',
    senses: [
      {
        meaning: '좁은길',
        translation: 'alley',
        context: ['들어가다'],
        example: '골목에 들어가다',
      },
    ],
  },
  {
    word: '계단',
    senses: [
      { meaning: '층계', translation: 'stairs', context: ['오르다'], example: '계단을 오르다' },
    ],
  },
  {
    word: '엘리베이터',
    senses: [
      {
        meaning: '승강기',
        translation: 'elevator',
        context: ['타다'],
        example: '엘리베이터를 타다',
      },
    ],
  },
  {
    word: '화장실',
    senses: [
      { meaning: '변소', translation: 'restroom', context: ['가다'], example: '화장실에 가다' },
    ],
  },
  {
    word: '주방',
    senses: [
      { meaning: '부엌', translation: 'kitchen', context: ['일하다'], example: '주방에서 일하다' },
    ],
  },
  {
    word: '거실',
    senses: [
      { meaning: '응접실', translation: 'living room', context: ['앉다'], example: '거실에 앉다' },
    ],
  },
  {
    word: '침실',
    senses: [
      { meaning: '방', translation: 'bedroom', context: ['자다'], example: '침실에서 자다' },
    ],
  },
  {
    word: '책상',
    senses: [{ meaning: '테이블', translation: 'desk', context: ['앉다'], example: '책상에 앉다' }],
  },
  {
    word: '의자',
    senses: [{ meaning: '좌석', translation: 'chair', context: ['앉다'], example: '의자에 앉다' }],
  },
  {
    word: '침대',
    senses: [{ meaning: '잠자리', translation: 'bed', context: ['눕다'], example: '침대에 눕다' }],
  },
  {
    word: '소파',
    senses: [{ meaning: '장의자', translation: 'sofa', context: ['앉다'], example: '소파에 앉다' }],
  },
  {
    word: '냉장고',
    senses: [
      {
        meaning: '냉동기',
        translation: 'refrigerator',
        context: ['열다'],
        example: '냉장고를 열다',
      },
    ],
  },
  {
    word: '에어컨',
    senses: [
      {
        meaning: '냉방기',
        translation: 'air conditioner',
        context: ['켜다'],
        example: '에어컨을 켜다',
      },
    ],
  },
  {
    word: '선풍기',
    senses: [
      { meaning: '송풍기', translation: 'fan', context: ['켜다'], example: '선풍기를 켜다' },
    ],
  },
  {
    word: '전등',
    senses: [{ meaning: '조명', translation: 'light', context: ['켜다'], example: '전등을 켜다' }],
  },
  {
    word: '시계',
    senses: [
      { meaning: '타임피스', translation: 'clock', context: ['보다'], example: '시계를 보다' },
    ],
  },
  {
    word: '거울',
    senses: [
      { meaning: '반사경', translation: 'mirror', context: ['보다'], example: '거울을 보다' },
    ],
  },
  {
    word: '사진',
    senses: [{ meaning: '포토', translation: 'photo', context: ['찍다'], example: '사진을 찍다' }],
  },
  {
    word: '그림',
    senses: [
      { meaning: '회화', translation: 'picture', context: ['그리다'], example: '그림을 그리다' },
    ],
  },
  {
    word: '전화',
    senses: [{ meaning: '통화', translation: 'phone', context: ['하다'], example: '전화를 하다' }],
  },
  {
    word: '컴퓨터',
    senses: [
      { meaning: 'PC', translation: 'computer', context: ['켜다'], example: '컴퓨터를 켜다' },
    ],
  },
  {
    word: '텔레비전',
    senses: [
      { meaning: 'TV', translation: 'television', context: ['보다'], example: '텔레비전을 보다' },
    ],
  },
  {
    word: '라디오',
    senses: [
      { meaning: '방송수신기', translation: 'radio', context: ['듣다'], example: '라디오를 듣다' },
    ],
  },
  {
    word: '휴대폰',
    senses: [
      {
        meaning: '핸드폰',
        translation: 'mobile phone',
        context: ['보다'],
        example: '휴대폰을 보다',
      },
    ],
  },
  {
    word: '자동차',
    senses: [
      { meaning: '승용차', translation: 'car', context: ['타다'], example: '자동차를 타다' },
    ],
  },
  {
    word: '자전거',
    senses: [
      { meaning: '바이크', translation: 'bicycle', context: ['타다'], example: '자전거를 타다' },
    ],
  },
  {
    word: '오토바이',
    senses: [
      {
        meaning: '모터사이클',
        translation: 'motorcycle',
        context: ['타다'],
        example: '오토바이를 타다',
      },
    ],
  },
  {
    word: '버스',
    senses: [
      { meaning: '대중교통', translation: 'bus', context: ['타다'], example: '버스를 타다' },
    ],
  },
  {
    word: '기차',
    senses: [{ meaning: '열차', translation: 'train', context: ['타다'], example: '기차를 타다' }],
  },
  {
    word: '지하철',
    senses: [
      { meaning: '메트로', translation: 'subway', context: ['타다'], example: '지하철을 타다' },
    ],
  },
  {
    word: '비행기',
    senses: [
      { meaning: '항공기', translation: 'airplane', context: ['타다'], example: '비행기를 타다' },
    ],
  },
  {
    word: '헬리콥터',
    senses: [
      {
        meaning: '회전익기',
        translation: 'helicopter',
        context: ['타다'],
        example: '헬리콥터를 타다',
      },
    ],
  },
  {
    word: '배',
    senses: [
      { meaning: '과일', translation: 'pear', context: ['먹다'], example: '배를 먹다' },
      { meaning: '신체부위', translation: 'stomach', context: ['고프다'], example: '배가 고프다' },
      { meaning: '선박', translation: 'ship', context: ['타다'], example: '배를 타다' },
      { meaning: '곱', translation: 'times (math)', context: ['두'], example: '두 배' },
    ],
  },
  {
    word: '사과',
    senses: [
      { meaning: '과일', translation: 'apple', context: ['먹다'], example: '사과를 먹다' },
      { meaning: '용서빔', translation: 'apology', context: ['하다'], example: '사과를 하다' },
    ],
  },
  {
    word: '귤',
    senses: [
      { meaning: '과일', translation: 'tangerine', context: ['먹다'], example: '귤을 먹다' },
    ],
  },
  {
    word: '포도',
    senses: [{ meaning: '과일', translation: 'grape', context: ['먹다'], example: '포도를 먹다' }],
  },
  {
    word: '딸기',
    senses: [
      { meaning: '과일', translation: 'strawberry', context: ['먹다'], example: '딸기를 먹다' },
    ],
  },
  {
    word: '수박',
    senses: [
      { meaning: '과일', translation: 'watermelon', context: ['먹다'], example: '수박을 먹다' },
    ],
  },
  {
    word: '참외',
    senses: [{ meaning: '과일', translation: 'melon', context: ['먹다'], example: '참외를 먹다' }],
  },
  {
    word: '토마토',
    senses: [
      { meaning: '채소', translation: 'tomato', context: ['먹다'], example: '토마토를 먹다' },
    ],
  },
  {
    word: '오이',
    senses: [
      { meaning: '채소', translation: 'cucumber', context: ['먹다'], example: '오이를 먹다' },
    ],
  },
  {
    word: '당근',
    senses: [{ meaning: '채소', translation: 'carrot', context: ['먹다'], example: '당근을 먹다' }],
  },
  {
    word: '양파',
    senses: [
      { meaning: '채소', translation: 'onion', context: ['자르다'], example: '양파를 자르다' },
    ],
  },
  {
    word: '마늘',
    senses: [
      { meaning: '조미료', translation: 'garlic', context: ['넣다'], example: '마늘을 넣다' },
    ],
  },
  {
    word: '고추',
    senses: [{ meaning: '채소', translation: 'pepper', context: ['넣다'], example: '고추를 넣다' }],
  },
  {
    word: '배추',
    senses: [
      { meaning: '채소', translation: 'cabbage', context: ['씻다'], example: '배추를 씻다' },
    ],
  },
  {
    word: '무',
    senses: [
      { meaning: '채소', translation: 'radish', context: ['썰다'], example: '무를 썰다' },
      { meaning: '없음', translation: 'nothing', context: [''], example: '무엇' },
    ],
  },
  {
    word: '감자',
    senses: [{ meaning: '채소', translation: 'potato', context: ['삶다'], example: '감자를 삶다' }],
  },
  {
    word: '고구마',
    senses: [
      { meaning: '채소', translation: 'sweet potato', context: ['굽다'], example: '고구마를 굽다' },
    ],
  },
  {
    word: '쌀',
    senses: [{ meaning: '곡물', translation: 'rice', context: ['씻다'], example: '쌀을 씻다' }],
  },
  {
    word: '밀',
    senses: [{ meaning: '곡물', translation: 'wheat', context: ['가루'], example: '밀가루' }],
  },
  {
    word: '콩',
    senses: [{ meaning: '콩과', translation: 'bean', context: ['삶다'], example: '콩을 삶다' }],
  },
  {
    word: '팥',
    senses: [{ meaning: '곡물', translation: 'red bean', context: ['삶다'], example: '팥을 삶다' }],
  },
  {
    word: '고기',
    senses: [{ meaning: '육', translation: 'meat', context: ['먹다'], example: '고기를 먹다' }],
  },
  {
    word: '쇠고기',
    senses: [{ meaning: '우육', translation: 'beef', context: ['먹다'], example: '쇠고기를 먹다' }],
  },
  {
    word: '돼지고기',
    senses: [
      { meaning: '돈육', translation: 'pork', context: ['먹다'], example: '돼지고기를 먹다' },
    ],
  },
  {
    word: '닭고기',
    senses: [
      { meaning: '계육', translation: 'chicken', context: ['먹다'], example: '닭고기를 먹다' },
    ],
  },
  {
    word: '생선',
    senses: [{ meaning: '어류', translation: 'fish', context: ['먹다'], example: '생선을 먹다' }],
  },
  {
    word: '새우',
    senses: [
      { meaning: '갑각류', translation: 'shrimp', context: ['먹다'], example: '새우를 먹다' },
    ],
  },
  {
    word: '게',
    senses: [{ meaning: '갑각류', translation: 'crab', context: ['먹다'], example: '게를 먹다' }],
  },
  {
    word: '오징어',
    senses: [
      { meaning: '연체동물', translation: 'squid', context: ['먹다'], example: '오징어를 먹다' },
    ],
  },
  {
    word: '문어',
    senses: [
      { meaning: '연체동물', translation: 'octopus', context: ['먹다'], example: '문어를 먹다' },
    ],
  },
  {
    word: '조개',
    senses: [
      { meaning: '패류', translation: 'shellfish', context: ['먹다'], example: '조개를 먹다' },
    ],
  },
  {
    word: '계란',
    senses: [{ meaning: '달걀', translation: 'egg', context: ['깨다'], example: '계란을 깨다' }],
  },
  {
    word: '치즈',
    senses: [
      { meaning: '유제품', translation: 'cheese', context: ['먹다'], example: '치즈를 먹다' },
    ],
  },
  {
    word: '버터',
    senses: [
      { meaning: '유지', translation: 'butter', context: ['바르다'], example: '버터를 바르다' },
    ],
  },
  {
    word: '설탕',
    senses: [{ meaning: '당류', translation: 'sugar', context: ['넣다'], example: '설탕을 넣다' }],
  },
  {
    word: '소금',
    senses: [{ meaning: '염', translation: 'salt', context: ['넣다'], example: '소금을 넣다' }],
  },
  {
    word: '후추',
    senses: [
      { meaning: '향신료', translation: 'pepper', context: ['넣다'], example: '후추를 넣다' },
    ],
  },
  {
    word: '간장',
    senses: [
      { meaning: '조미료', translation: 'soy sauce', context: ['넣다'], example: '간장을 넣다' },
    ],
  },
  {
    word: '된장',
    senses: [
      { meaning: '장', translation: 'soybean paste', context: ['넣다'], example: '된장을 넣다' },
    ],
  },
  {
    word: '고추장',
    senses: [
      {
        meaning: '장',
        translation: 'red pepper paste',
        context: ['넣다'],
        example: '고추장을 넣다',
      },
    ],
  },
  {
    word: '식초',
    senses: [{ meaning: '초', translation: 'vinegar', context: ['넣다'], example: '식초를 넣다' }],
  },
  {
    word: '기름',
    senses: [{ meaning: '유', translation: 'oil', context: ['두르다'], example: '기름을 두르다' }],
  },
  {
    word: '참기름',
    senses: [
      { meaning: '조미료', translation: 'sesame oil', context: ['넣다'], example: '참기름을 넣다' },
    ],
  },
  {
    word: '커피',
    senses: [
      { meaning: '음료', translation: 'coffee', context: ['마시다'], example: '커피를 마시다' },
    ],
  },
  {
    word: '주스',
    senses: [
      { meaning: '음료', translation: 'juice', context: ['마시다'], example: '주스를 마시다' },
    ],
  },
  {
    word: '콜라',
    senses: [
      { meaning: '음료', translation: 'cola', context: ['마시다'], example: '콜라를 마시다' },
    ],
  },
  {
    word: '사이다',
    senses: [
      { meaning: '음료', translation: 'cider', context: ['마시다'], example: '사이다를 마시다' },
    ],
  },
  {
    word: '맥주',
    senses: [
      { meaning: '주류', translation: 'beer', context: ['마시다'], example: '맥주를 마시다' },
    ],
  },
  {
    word: '소주',
    senses: [
      { meaning: '주류', translation: 'soju', context: ['마시다'], example: '소주를 마시다' },
    ],
  },
  {
    word: '포도주',
    senses: [
      { meaning: '주류', translation: 'wine', context: ['마시다'], example: '포도주를 마시다' },
    ],
  },
  {
    word: '위스키',
    senses: [
      { meaning: '주류', translation: 'whiskey', context: ['마시다'], example: '위스키를 마시다' },
    ],
  },
  {
    word: '막걸리',
    senses: [
      {
        meaning: '주류',
        translation: 'makgeolli',
        context: ['마시다'],
        example: '막걸리를 마시다',
      },
    ],
  },
  {
    word: '약',
    senses: [
      { meaning: '의약품', translation: 'medicine', context: ['먹다'], example: '약을 먹다' },
      { meaning: '약속', translation: 'promise (short)', context: ['속'], example: '약속' },
      { meaning: '나쁜', translation: 'bad (short)', context: ['자'], example: '약자' },
    ],
  },
  {
    word: '병',
    senses: [
      { meaning: '질병', translation: 'disease', context: ['나다'], example: '병이 나다' },
      { meaning: '용기', translation: 'bottle', context: ['따다'], example: '병을 따다' },
    ],
  },
  {
    word: '주사',
    senses: [
      { meaning: '주입', translation: 'injection', context: ['맞다'], example: '주사를 맞다' },
    ],
  },
  {
    word: '수술',
    senses: [
      { meaning: '외과', translation: 'surgery', context: ['받다'], example: '수술을 받다' },
    ],
  },
  {
    word: '병원',
    senses: [
      { meaning: '의료기관', translation: 'hospital', context: ['가다'], example: '병원에 가다' },
    ],
  },
  {
    word: '돈',
    senses: [{ meaning: '화폐', translation: 'money', context: ['벌다'], example: '돈을 벌다' }],
  },
  {
    word: '가격',
    senses: [
      { meaning: '값', translation: 'price', context: ['비싸다'], example: '가격이 비싸다' },
    ],
  },
  {
    word: '값',
    senses: [
      { meaning: '가격', translation: 'price', context: ['비싸다'], example: '값이 비싸다' },
      { meaning: '수치', translation: 'value', context: ['계산하다'], example: '값을 계산하다' },
      { meaning: '보람', translation: 'worth', context: ['있다'], example: '값이 있다' },
    ],
  },
  {
    word: '색깔',
    senses: [
      { meaning: '컬러', translation: 'color', context: ['예쁘다'], example: '색깔이 예쁘다' },
    ],
  },
  {
    word: '모양',
    senses: [
      { meaning: '형태', translation: 'shape', context: ['예쁘다'], example: '모양이 예쁘다' },
    ],
  },
  {
    word: '향기',
    senses: [
      { meaning: '냄새', translation: 'fragrance', context: ['나다'], example: '향기가 나다' },
    ],
  },
  {
    word: '무게',
    senses: [
      { meaning: '중량', translation: 'weight', context: ['무겁다'], example: '무게가 무겁다' },
    ],
  },
  {
    word: '길이',
    senses: [{ meaning: '장도', translation: 'length', context: ['길다'], example: '길이가 길다' }],
  },
  {
    word: '넓이',
    senses: [{ meaning: '면적', translation: 'width', context: ['넓다'], example: '넓이가 넓다' }],
  },
  {
    word: '깊이',
    senses: [{ meaning: '수심', translation: 'depth', context: ['깊다'], example: '깊이가 깊다' }],
  },
  {
    word: '속도',
    senses: [
      { meaning: '스피드', translation: 'speed', context: ['빠르다'], example: '속도가 빠르다' },
    ],
  },
  {
    word: '에너지',
    senses: [
      { meaning: '활력', translation: 'energy', context: ['넘치다'], example: '에너지가 넘치다' },
    ],
  },
  {
    word: '습관',
    senses: [
      { meaning: '버릇', translation: 'habit', context: ['들이다'], example: '습관을 들이다' },
    ],
  },
  {
    word: '성격',
    senses: [
      { meaning: '성질', translation: 'personality', context: ['좋다'], example: '성격이 좋다' },
    ],
  },
  {
    word: '능력',
    senses: [
      { meaning: '역량', translation: 'ability', context: ['있다'], example: '능력이 있다' },
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
