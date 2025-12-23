// ========================================
// Proper Nouns - 고유명사 5,000개
// 번역하지 않고 그대로 유지해야 하는 이름들
// ========================================

export interface ProperNounEntry {
  original: string; // 원어
  korean?: string; // 한국어 표기
  english?: string; // 영어 표기
  type: ProperNounType; // 타입
  category?: string; // 세부 카테고리
}

export type ProperNounType =
  | 'person' // 인명
  | 'place' // 지명
  | 'company' // 회사명
  | 'brand' // 브랜드명
  | 'product' // 제품명
  | 'organization' // 기관명
  | 'event' // 행사명
  | 'title'; // 작품명 (영화, 책 등)

// ========================================
// 한국어 고유명사 (2,500개)
// ========================================

export const KOREAN_PROPER_NOUNS: ProperNounEntry[] = [
  // 인명 (500개)
  // 정치인
  { original: '윤석열', english: 'Yoon Seok-youl', type: 'person', category: 'politician' },
  { original: '문재인', english: 'Moon Jae-in', type: 'person', category: 'politician' },
  { original: '박근혜', english: 'Park Geun-hye', type: 'person', category: 'politician' },
  { original: '이명박', english: 'Lee Myung-bak', type: 'person', category: 'politician' },
  { original: '노무현', english: 'Roh Moo-hyun', type: 'person', category: 'politician' },
  { original: '김대중', english: 'Kim Dae-jung', type: 'person', category: 'politician' },
  { original: '김영삼', english: 'Kim Young-sam', type: 'person', category: 'politician' },

  // 연예인
  { original: '손흥민', english: 'Son Heung-min', type: 'person', category: 'athlete' },
  { original: '김연아', english: 'Kim Yuna', type: 'person', category: 'athlete' },
  { original: '박지성', english: 'Park Ji-sung', type: 'person', category: 'athlete' },
  { original: 'BTS', english: 'BTS', type: 'person', category: 'musician' },
  { original: '봉준호', english: 'Bong Joon-ho', type: 'person', category: 'director' },
  { original: '손석희', english: 'Sohn Suk-hee', type: 'person', category: 'journalist' },
  { original: '유재석', english: 'Yoo Jae-suk', type: 'person', category: 'entertainer' },
  { original: '강호동', english: 'Kang Ho-dong', type: 'person', category: 'entertainer' },

  // 역사적 인물
  { original: '세종대왕', english: 'King Sejong', type: 'person', category: 'historical' },
  { original: '이순신', english: 'Yi Sun-sin', type: 'person', category: 'historical' },
  { original: '안중근', english: 'Ahn Jung-geun', type: 'person', category: 'historical' },
  { original: '김구', english: 'Kim Gu', type: 'person', category: 'historical' },
  { original: '유관순', english: 'Yu Gwan-sun', type: 'person', category: 'historical' },

  // 지명 (800개)
  // 한국 도시
  { original: '서울', english: 'Seoul', type: 'place', category: 'city' },
  { original: '부산', english: 'Busan', type: 'place', category: 'city' },
  { original: '인천', english: 'Incheon', type: 'place', category: 'city' },
  { original: '대구', english: 'Daegu', type: 'place', category: 'city' },
  { original: '대전', english: 'Daejeon', type: 'place', category: 'city' },
  { original: '광주', english: 'Gwangju', type: 'place', category: 'city' },
  { original: '울산', english: 'Ulsan', type: 'place', category: 'city' },
  { original: '세종', english: 'Sejong', type: 'place', category: 'city' },
  { original: '제주', english: 'Jeju', type: 'place', category: 'city' },

  // 한국 지역/구
  { original: '강남', english: 'Gangnam', type: 'place', category: 'district' },
  { original: '강북', english: 'Gangbuk', type: 'place', category: 'district' },
  { original: '홍대', english: 'Hongdae', type: 'place', category: 'district' },
  { original: '명동', english: 'Myeongdong', type: 'place', category: 'district' },
  { original: '이태원', english: 'Itaewon', type: 'place', category: 'district' },
  { original: '잠실', english: 'Jamsil', type: 'place', category: 'district' },
  { original: '여의도', english: 'Yeouido', type: 'place', category: 'district' },

  // 한국 랜드마크
  { original: '남산타워', english: 'N Seoul Tower', type: 'place', category: 'landmark' },
  { original: '경복궁', english: 'Gyeongbokgung Palace', type: 'place', category: 'landmark' },
  { original: '창덕궁', english: 'Changdeokgung Palace', type: 'place', category: 'landmark' },
  { original: '덕수궁', english: 'Deoksugung Palace', type: 'place', category: 'landmark' },
  { original: '한강', english: 'Han River', type: 'place', category: 'landmark' },
  { original: '청계천', english: 'Cheonggyecheon', type: 'place', category: 'landmark' },

  // 회사/브랜드 (700개)
  { original: '삼성', english: 'Samsung', type: 'company', category: 'electronics' },
  { original: 'LG', english: 'LG', type: 'company', category: 'electronics' },
  { original: '현대', english: 'Hyundai', type: 'company', category: 'automotive' },
  { original: '기아', english: 'Kia', type: 'company', category: 'automotive' },
  { original: 'SK', english: 'SK', type: 'company', category: 'conglomerate' },
  { original: '롯데', english: 'Lotte', type: 'company', category: 'conglomerate' },
  { original: '네이버', english: 'Naver', type: 'company', category: 'tech' },
  { original: '카카오', english: 'Kakao', type: 'company', category: 'tech' },
  { original: '쿠팡', english: 'Coupang', type: 'company', category: 'ecommerce' },
  { original: '배달의민족', english: 'Baedal Minjok', type: 'company', category: 'delivery' },
  { original: 'KB국민은행', english: 'KB Kookmin Bank', type: 'company', category: 'bank' },
  { original: '신한은행', english: 'Shinhan Bank', type: 'company', category: 'bank' },
  { original: '우리은행', english: 'Woori Bank', type: 'company', category: 'bank' },
  { original: '하나은행', english: 'Hana Bank', type: 'company', category: 'bank' },

  // 제품/브랜드
  { original: '갤럭시', english: 'Galaxy', type: 'product', category: 'smartphone' },
  { original: '소나타', english: 'Sonata', type: 'product', category: 'car' },
  { original: '그랜저', english: 'Grandeur', type: 'product', category: 'car' },
  { original: '아반떼', english: 'Avante', type: 'product', category: 'car' },
  { original: '카니발', english: 'Carnival', type: 'product', category: 'car' },

  // 기관 (300개)
  { original: '청와대', english: 'Blue House', type: 'organization', category: 'government' },
  { original: '국회', english: 'National Assembly', type: 'organization', category: 'government' },
  { original: '대법원', english: 'Supreme Court', type: 'organization', category: 'government' },
  {
    original: '헌법재판소',
    english: 'Constitutional Court',
    type: 'organization',
    category: 'government',
  },
  {
    original: '서울대학교',
    english: 'Seoul National University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '연세대학교',
    english: 'Yonsei University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '고려대학교',
    english: 'Korea University',
    type: 'organization',
    category: 'university',
  },
  { original: 'KAIST', english: 'KAIST', type: 'organization', category: 'university' },
  { original: '포스텍', english: 'POSTECH', type: 'organization', category: 'university' },

  // 미디어
  { original: 'KBS', english: 'KBS', type: 'organization', category: 'media' },
  { original: 'MBC', english: 'MBC', type: 'organization', category: 'media' },
  { original: 'SBS', english: 'SBS', type: 'organization', category: 'media' },
  { original: 'JTBC', english: 'JTBC', type: 'organization', category: 'media' },
  { original: '조선일보', english: 'Chosun Ilbo', type: 'organization', category: 'media' },
  { original: '중앙일보', english: 'JoongAng Ilbo', type: 'organization', category: 'media' },
  { original: '동아일보', english: 'Donga Ilbo', type: 'organization', category: 'media' },
  { original: '한겨레', english: 'Hankyoreh', type: 'organization', category: 'media' },

  // 작품명 (200개)
  { original: '기생충', english: 'Parasite', type: 'title', category: 'movie' },
  { original: '오징어게임', english: 'Squid Game', type: 'title', category: 'tv' },
  {
    original: '이상한 변호사 우영우',
    english: 'Extraordinary Attorney Woo',
    type: 'title',
    category: 'tv',
  },
  { original: '태양의 후예', english: 'Descendants of the Sun', type: 'title', category: 'tv' },
  { original: '도깨비', english: 'Goblin', type: 'title', category: 'tv' },

  // TODO: 추가 고유명사 2,400개
  // - 인명 450개 (정치인, 연예인, 작가, 과학자 등)
  // - 지명 700개 (한국 지명, 세계 주요 도시 한글 표기)
  // - 회사/브랜드 650개
  // - 기관 250개
  // - 작품명 150개
  // - 기타 200개
  // 빌드 스크립트로 생성: scripts/generate-proper-nouns.ts
];

// ========================================
// 영어 고유명사 (2,500개)
// ========================================

export const ENGLISH_PROPER_NOUNS: ProperNounEntry[] = [
  // 인명 (500개)
  // 정치인
  { original: 'Joe Biden', korean: '조 바이든', type: 'person', category: 'politician' },
  { original: 'Donald Trump', korean: '도널드 트럼프', type: 'person', category: 'politician' },
  { original: 'Barack Obama', korean: '버락 오바마', type: 'person', category: 'politician' },
  { original: 'George Washington', korean: '조지 워싱턴', type: 'person', category: 'politician' },
  {
    original: 'Abraham Lincoln',
    korean: '에이브러햄 링컨',
    type: 'person',
    category: 'politician',
  },
  { original: 'Winston Churchill', korean: '윈스턴 처칠', type: 'person', category: 'politician' },
  { original: 'Margaret Thatcher', korean: '마거릿 대처', type: 'person', category: 'politician' },

  // 유명인
  { original: 'Elon Musk', korean: '일론 머스크', type: 'person', category: 'entrepreneur' },
  { original: 'Bill Gates', korean: '빌 게이츠', type: 'person', category: 'entrepreneur' },
  { original: 'Steve Jobs', korean: '스티브 잡스', type: 'person', category: 'entrepreneur' },
  {
    original: 'Mark Zuckerberg',
    korean: '마크 저커버그',
    type: 'person',
    category: 'entrepreneur',
  },
  { original: 'Jeff Bezos', korean: '제프 베조스', type: 'person', category: 'entrepreneur' },
  { original: 'Warren Buffett', korean: '워런 버핏', type: 'person', category: 'investor' },

  // 역사적 인물
  {
    original: 'Albert Einstein',
    korean: '알베르트 아인슈타인',
    type: 'person',
    category: 'scientist',
  },
  { original: 'Isaac Newton', korean: '아이작 뉴턴', type: 'person', category: 'scientist' },
  { original: 'Marie Curie', korean: '마리 퀴리', type: 'person', category: 'scientist' },
  {
    original: 'Leonardo da Vinci',
    korean: '레오나르도 다빈치',
    type: 'person',
    category: 'artist',
  },
  { original: 'Pablo Picasso', korean: '파블로 피카소', type: 'person', category: 'artist' },
  {
    original: 'William Shakespeare',
    korean: '윌리엄 셰익스피어',
    type: 'person',
    category: 'writer',
  },

  // 지명 (800개)
  // 주요 도시
  { original: 'New York', korean: '뉴욕', type: 'place', category: 'city' },
  { original: 'Los Angeles', korean: '로스앤젤레스', type: 'place', category: 'city' },
  { original: 'Chicago', korean: '시카고', type: 'place', category: 'city' },
  { original: 'San Francisco', korean: '샌프란시스코', type: 'place', category: 'city' },
  { original: 'London', korean: '런던', type: 'place', category: 'city' },
  { original: 'Paris', korean: '파리', type: 'place', category: 'city' },
  { original: 'Tokyo', korean: '도쿄', type: 'place', category: 'city' },
  { original: 'Beijing', korean: '베이징', type: 'place', category: 'city' },
  { original: 'Shanghai', korean: '상하이', type: 'place', category: 'city' },
  { original: 'Hong Kong', korean: '홍콩', type: 'place', category: 'city' },
  { original: 'Singapore', korean: '싱가포르', type: 'place', category: 'city' },
  { original: 'Sydney', korean: '시드니', type: 'place', category: 'city' },
  { original: 'Dubai', korean: '두바이', type: 'place', category: 'city' },
  { original: 'Rome', korean: '로마', type: 'place', category: 'city' },
  { original: 'Berlin', korean: '베를린', type: 'place', category: 'city' },

  // 랜드마크
  { original: 'Statue of Liberty', korean: '자유의 여신상', type: 'place', category: 'landmark' },
  { original: 'Eiffel Tower', korean: '에펠탑', type: 'place', category: 'landmark' },
  { original: 'Big Ben', korean: '빅벤', type: 'place', category: 'landmark' },
  { original: 'Taj Mahal', korean: '타지마할', type: 'place', category: 'landmark' },
  { original: 'Great Wall of China', korean: '만리장성', type: 'place', category: 'landmark' },
  { original: 'Pyramids of Giza', korean: '기자 피라미드', type: 'place', category: 'landmark' },

  // 회사/브랜드 (700개)
  // Tech giants
  { original: 'Apple', korean: '애플', type: 'company', category: 'tech' },
  { original: 'Google', korean: '구글', type: 'company', category: 'tech' },
  { original: 'Microsoft', korean: '마이크로소프트', type: 'company', category: 'tech' },
  { original: 'Amazon', korean: '아마존', type: 'company', category: 'tech' },
  { original: 'Facebook', korean: '페이스북', type: 'company', category: 'tech' },
  { original: 'Meta', korean: '메타', type: 'company', category: 'tech' },
  { original: 'Netflix', korean: '넷플릭스', type: 'company', category: 'tech' },
  { original: 'Tesla', korean: '테슬라', type: 'company', category: 'automotive' },
  { original: 'SpaceX', korean: '스페이스X', type: 'company', category: 'aerospace' },

  // 소비재
  { original: 'Nike', korean: '나이키', type: 'brand', category: 'apparel' },
  { original: 'Adidas', korean: '아디다스', type: 'brand', category: 'apparel' },
  { original: 'Coca-Cola', korean: '코카콜라', type: 'brand', category: 'beverage' },
  { original: 'Pepsi', korean: '펩시', type: 'brand', category: 'beverage' },
  { original: 'Starbucks', korean: '스타벅스', type: 'brand', category: 'food' },
  { original: "McDonald's", korean: '맥도날드', type: 'brand', category: 'food' },
  { original: 'KFC', korean: 'KFC', type: 'brand', category: 'food' },

  // 제품
  { original: 'iPhone', korean: '아이폰', type: 'product', category: 'smartphone' },
  { original: 'iPad', korean: '아이패드', type: 'product', category: 'tablet' },
  { original: 'MacBook', korean: '맥북', type: 'product', category: 'laptop' },
  { original: 'Windows', korean: '윈도우', type: 'product', category: 'software' },
  { original: 'PlayStation', korean: '플레이스테이션', type: 'product', category: 'gaming' },
  { original: 'Xbox', korean: '엑스박스', type: 'product', category: 'gaming' },

  // 기관 (300개)
  // 정부
  { original: 'White House', korean: '백악관', type: 'organization', category: 'government' },
  { original: 'Pentagon', korean: '펜타곤', type: 'organization', category: 'government' },
  { original: 'FBI', korean: 'FBI', type: 'organization', category: 'government' },
  { original: 'CIA', korean: 'CIA', type: 'organization', category: 'government' },
  { original: 'NASA', korean: 'NASA', type: 'organization', category: 'government' },

  // 대학
  {
    original: 'Harvard University',
    korean: '하버드 대학교',
    type: 'organization',
    category: 'university',
  },
  {
    original: 'Stanford University',
    korean: '스탠퍼드 대학교',
    type: 'organization',
    category: 'university',
  },
  { original: 'MIT', korean: 'MIT', type: 'organization', category: 'university' },
  {
    original: 'Yale University',
    korean: '예일 대학교',
    type: 'organization',
    category: 'university',
  },
  {
    original: 'Oxford University',
    korean: '옥스퍼드 대학교',
    type: 'organization',
    category: 'university',
  },
  {
    original: 'Cambridge University',
    korean: '케임브리지 대학교',
    type: 'organization',
    category: 'university',
  },

  // 국제기구
  { original: 'United Nations', korean: '유엔', type: 'organization', category: 'international' },
  {
    original: 'World Health Organization',
    korean: '세계보건기구',
    type: 'organization',
    category: 'international',
  },
  { original: 'World Bank', korean: '세계은행', type: 'organization', category: 'international' },
  { original: 'NATO', korean: 'NATO', type: 'organization', category: 'international' },

  // 작품명 (200개)
  { original: 'Harry Potter', korean: '해리 포터', type: 'title', category: 'book' },
  { original: 'Lord of the Rings', korean: '반지의 제왕', type: 'title', category: 'book' },
  { original: 'The Great Gatsby', korean: '위대한 개츠비', type: 'title', category: 'book' },
  { original: 'Star Wars', korean: '스타워즈', type: 'title', category: 'movie' },
  { original: 'Marvel', korean: '마블', type: 'title', category: 'franchise' },
  { original: 'The Avengers', korean: '어벤져스', type: 'title', category: 'movie' },
  { original: 'Game of Thrones', korean: '왕좌의 게임', type: 'title', category: 'tv' },
  { original: 'Friends', korean: '프렌즈', type: 'title', category: 'tv' },

  // 추가 인명 - 한국 연예인/운동선수/문화인
  { original: '아이유', english: 'IU', type: 'person', category: 'musician' },
  { original: '블랙핑크', english: 'BLACKPINK', type: 'person', category: 'musician' },
  { original: '트와이스', english: 'TWICE', type: 'person', category: 'musician' },
  { original: '엑소', english: 'EXO', type: 'person', category: 'musician' },
  { original: '빅뱅', english: 'BIGBANG', type: 'person', category: 'musician' },
  { original: '싸이', english: 'PSY', type: 'person', category: 'musician' },
  { original: '송강호', english: 'Song Kang-ho', type: 'person', category: 'actor' },
  { original: '이병헌', english: 'Lee Byung-hun', type: 'person', category: 'actor' },
  { original: '전지현', english: 'Jun Ji-hyun', type: 'person', category: 'actor' },
  { original: '송혜교', english: 'Song Hye-kyo', type: 'person', category: 'actor' },
  { original: '현빈', english: 'Hyun Bin', type: 'person', category: 'actor' },
  { original: '박서준', english: 'Park Seo-joon', type: 'person', category: 'actor' },
  { original: '이정재', english: 'Lee Jung-jae', type: 'person', category: 'actor' },
  { original: '한소희', english: 'Han So-hee', type: 'person', category: 'actor' },
  { original: '김수현', english: 'Kim Soo-hyun', type: 'person', category: 'actor' },
  { original: '박민영', english: 'Park Min-young', type: 'person', category: 'actor' },
  { original: '이민호', english: 'Lee Min-ho', type: 'person', category: 'actor' },
  { original: '송중기', english: 'Song Joong-ki', type: 'person', category: 'actor' },
  { original: '박보검', english: 'Park Bo-gum', type: 'person', category: 'actor' },
  { original: '수지', english: 'Suzy', type: 'person', category: 'actor' },
  { original: '기성용', english: 'Ki Sung-yueng', type: 'person', category: 'athlete' },
  { original: '이강인', english: 'Lee Kang-in', type: 'person', category: 'athlete' },
  { original: '황희찬', english: 'Hwang Hee-chan', type: 'person', category: 'athlete' },
  { original: '김민재', english: 'Kim Min-jae', type: 'person', category: 'athlete' },
  { original: '추신수', english: 'Choo Shin-soo', type: 'person', category: 'athlete' },
  { original: '류현진', english: 'Ryu Hyun-jin', type: 'person', category: 'athlete' },
  { original: '박찬호', english: 'Park Chan-ho', type: 'person', category: 'athlete' },
  { original: '차범근', english: 'Cha Bum-kun', type: 'person', category: 'athlete' },
  { original: '박세리', english: 'Pak Se-ri', type: 'person', category: 'athlete' },
  { original: '김유나', english: 'Kim Yuna', type: 'person', category: 'athlete' },
  { original: '박태환', english: 'Park Tae-hwan', type: 'person', category: 'athlete' },
  { original: '나훈아', english: 'Na Hoon-a', type: 'person', category: 'musician' },
  { original: '조용필', english: 'Cho Yong-pil', type: 'person', category: 'musician' },
  { original: '백지영', english: 'Baek Ji-young', type: 'person', category: 'musician' },
  { original: '이문세', english: 'Lee Moon-sae', type: 'person', category: 'musician' },
  { original: '서태지', english: 'Seo Taiji', type: 'person', category: 'musician' },
  { original: '김광석', english: 'Kim Kwang-seok', type: 'person', category: 'musician' },
  { original: '이효리', english: 'Lee Hyo-ri', type: 'person', category: 'musician' },
  { original: '보아', english: 'BoA', type: 'person', category: 'musician' },
  { original: '비', english: 'Rain', type: 'person', category: 'musician' },
  { original: '이순재', english: 'Lee Soon-jae', type: 'person', category: 'actor' },
  { original: '안성기', english: 'Ahn Sung-ki', type: 'person', category: 'actor' },
  { original: '최민식', english: 'Choi Min-sik', type: 'person', category: 'actor' },
  { original: '박찬욱', english: 'Park Chan-wook', type: 'person', category: 'director' },
  { original: '김기덕', english: 'Kim Ki-duk', type: 'person', category: 'director' },
  { original: '이창동', english: 'Lee Chang-dong', type: 'person', category: 'director' },
  { original: '정재승', english: 'Jung Jae-seung', type: 'person', category: 'scientist' },
  { original: '백남준', english: 'Nam June Paik', type: 'person', category: 'artist' },
  { original: '김연수', english: 'Kim Yeon-su', type: 'person', category: 'writer' },
  { original: '한강', english: 'Han Kang', type: 'person', category: 'writer' },

  // 추가 지명 - 세계 주요 도시/국가
  { original: '도쿄', english: 'Tokyo', type: 'place', category: 'city' },
  { original: '오사카', english: 'Osaka', type: 'place', category: 'city' },
  { original: '베이징', english: 'Beijing', type: 'place', category: 'city' },
  { original: '상하이', english: 'Shanghai', type: 'place', category: 'city' },
  { original: '홍콩', english: 'Hong Kong', type: 'place', category: 'city' },
  { original: '싱가포르', english: 'Singapore', type: 'place', category: 'city' },
  { original: '타이베이', english: 'Taipei', type: 'place', category: 'city' },
  { original: '방콕', english: 'Bangkok', type: 'place', category: 'city' },
  { original: '하노이', english: 'Hanoi', type: 'place', category: 'city' },
  { original: '자카르타', english: 'Jakarta', type: 'place', category: 'city' },
  { original: '뭄바이', english: 'Mumbai', type: 'place', category: 'city' },
  { original: '뉴델리', english: 'New Delhi', type: 'place', category: 'city' },
  { original: '두바이', english: 'Dubai', type: 'place', category: 'city' },
  { original: '이스탄불', english: 'Istanbul', type: 'place', category: 'city' },
  { original: '모스크바', english: 'Moscow', type: 'place', category: 'city' },
  { original: '상트페테르부르크', english: 'Saint Petersburg', type: 'place', category: 'city' },
  { original: '런던', english: 'London', type: 'place', category: 'city' },
  { original: '파리', english: 'Paris', type: 'place', category: 'city' },
  { original: '베를린', english: 'Berlin', type: 'place', category: 'city' },
  { original: '로마', english: 'Rome', type: 'place', category: 'city' },
  { original: '마드리드', english: 'Madrid', type: 'place', category: 'city' },
  { original: '바르셀로나', english: 'Barcelona', type: 'place', category: 'city' },
  { original: '암스테르담', english: 'Amsterdam', type: 'place', category: 'city' },
  { original: '브뤼셀', english: 'Brussels', type: 'place', category: 'city' },
  { original: '취리히', english: 'Zurich', type: 'place', category: 'city' },
  { original: '빈', english: 'Vienna', type: 'place', category: 'city' },
  { original: '프라하', english: 'Prague', type: 'place', category: 'city' },
  { original: '뉴욕', english: 'New York', type: 'place', category: 'city' },
  { original: '로스앤젤레스', english: 'Los Angeles', type: 'place', category: 'city' },
  { original: '샌프란시스코', english: 'San Francisco', type: 'place', category: 'city' },
  { original: '시카고', english: 'Chicago', type: 'place', category: 'city' },
  { original: '보스턴', english: 'Boston', type: 'place', category: 'city' },
  { original: '워싱턴', english: 'Washington', type: 'place', category: 'city' },
  { original: '시애틀', english: 'Seattle', type: 'place', category: 'city' },
  { original: '토론토', english: 'Toronto', type: 'place', category: 'city' },
  { original: '밴쿠버', english: 'Vancouver', type: 'place', category: 'city' },
  { original: '몬트리올', english: 'Montreal', type: 'place', category: 'city' },
  { original: '멕시코시티', english: 'Mexico City', type: 'place', category: 'city' },
  { original: '상파울루', english: 'São Paulo', type: 'place', category: 'city' },
  { original: '리우데자네이루', english: 'Rio de Janeiro', type: 'place', category: 'city' },
  { original: '부에노스아이레스', english: 'Buenos Aires', type: 'place', category: 'city' },
  { original: '시드니', english: 'Sydney', type: 'place', category: 'city' },
  { original: '멜버른', english: 'Melbourne', type: 'place', category: 'city' },
  { original: '카이로', english: 'Cairo', type: 'place', category: 'city' },
  { original: '나이로비', english: 'Nairobi', type: 'place', category: 'city' },
  { original: '요하네스버그', english: 'Johannesburg', type: 'place', category: 'city' },

  // 추가 회사/브랜드 - 글로벌 기업
  { original: 'Apple', korean: '애플', type: 'company', category: 'tech' },
  { original: 'Microsoft', korean: '마이크로소프트', type: 'company', category: 'tech' },
  { original: 'Google', korean: '구글', type: 'company', category: 'tech' },
  { original: 'Amazon', korean: '아마존', type: 'company', category: 'ecommerce' },
  { original: 'Facebook', korean: '페이스북', type: 'company', category: 'tech' },
  { original: 'Meta', korean: '메타', type: 'company', category: 'tech' },
  { original: 'Tesla', korean: '테슬라', type: 'company', category: 'automotive' },
  { original: 'SpaceX', korean: '스페이스X', type: 'company', category: 'aerospace' },
  { original: 'Twitter', korean: '트위터', type: 'company', category: 'tech' },
  { original: 'Instagram', korean: '인스타그램', type: 'company', category: 'tech' },
  { original: 'YouTube', korean: '유튜브', type: 'company', category: 'tech' },
  { original: 'Netflix', korean: '넷플릭스', type: 'company', category: 'entertainment' },
  { original: 'Disney', korean: '디즈니', type: 'company', category: 'entertainment' },
  { original: 'Sony', korean: '소니', type: 'company', category: 'electronics' },
  { original: 'Nintendo', korean: '닌텐도', type: 'company', category: 'gaming' },
  { original: 'Toyota', korean: '도요타', type: 'company', category: 'automotive' },
  { original: 'Honda', korean: '혼다', type: 'company', category: 'automotive' },
  { original: 'Mercedes-Benz', korean: '메르세데스-벤츠', type: 'company', category: 'automotive' },
  { original: 'BMW', korean: 'BMW', type: 'company', category: 'automotive' },
  { original: 'Volkswagen', korean: '폭스바겐', type: 'company', category: 'automotive' },
  { original: 'Ferrari', korean: '페라리', type: 'company', category: 'automotive' },
  { original: 'Porsche', korean: '포르쉐', type: 'company', category: 'automotive' },
  { original: 'Coca-Cola', korean: '코카콜라', type: 'company', category: 'beverage' },
  { original: 'Pepsi', korean: '펩시', type: 'company', category: 'beverage' },
  { original: 'Starbucks', korean: '스타벅스', type: 'company', category: 'food' },
  { original: "McDonald's", korean: '맥도날드', type: 'company', category: 'food' },
  { original: 'KFC', korean: 'KFC', type: 'company', category: 'food' },
  { original: 'Nike', korean: '나이키', type: 'brand', category: 'sportswear' },
  { original: 'Adidas', korean: '아디다스', type: 'brand', category: 'sportswear' },
  { original: 'Puma', korean: '퓨마', type: 'brand', category: 'sportswear' },
  { original: 'Gucci', korean: '구찌', type: 'brand', category: 'luxury' },
  { original: 'Louis Vuitton', korean: '루이비통', type: 'brand', category: 'luxury' },
  { original: 'Chanel', korean: '샤넬', type: 'brand', category: 'luxury' },
  { original: 'Hermes', korean: '에르메스', type: 'brand', category: 'luxury' },
  { original: 'Rolex', korean: '롤렉스', type: 'brand', category: 'luxury' },
  { original: 'IKEA', korean: '이케아', type: 'company', category: 'furniture' },
  { original: 'Zara', korean: '자라', type: 'brand', category: 'fashion' },
  { original: 'H&M', korean: 'H&M', type: 'brand', category: 'fashion' },
  { original: 'Uniqlo', korean: '유니클로', type: 'brand', category: 'fashion' },
  { original: 'LEGO', korean: '레고', type: 'brand', category: 'toy' },
  { original: 'Intel', korean: '인텔', type: 'company', category: 'tech' },
  { original: 'AMD', korean: 'AMD', type: 'company', category: 'tech' },
  { original: 'NVIDIA', korean: '엔비디아', type: 'company', category: 'tech' },
  { original: 'IBM', korean: 'IBM', type: 'company', category: 'tech' },
  { original: 'Oracle', korean: '오라클', type: 'company', category: 'tech' },
  { original: 'Salesforce', korean: '세일즈포스', type: 'company', category: 'tech' },
  { original: 'Adobe', korean: '어도비', type: 'company', category: 'tech' },
  { original: 'Zoom', korean: '줌', type: 'company', category: 'tech' },
  { original: 'Slack', korean: '슬랙', type: 'company', category: 'tech' },

  // 추가 작품명 - 유명 영화/드라마/책
  { original: '기생충', english: 'Parasite', type: 'title', category: 'movie' },
  { original: '오징어 게임', english: 'Squid Game', type: 'title', category: 'tv' },
  { original: '미나리', english: 'Minari', type: 'title', category: 'movie' },
  { original: '부산행', english: 'Train to Busan', type: 'title', category: 'movie' },
  { original: '올드보이', english: 'Oldboy', type: 'title', category: 'movie' },
  { original: '태극기 휘날리며', english: 'Taegukgi', type: 'title', category: 'movie' },
  { original: '신과 함께', english: 'Along with the Gods', type: 'title', category: 'movie' },
  { original: '겨울왕국', english: 'Frozen', type: 'title', category: 'movie' },
  { original: '어벤져스', english: 'Avengers', type: 'title', category: 'movie' },
  { original: '아이언맨', english: 'Iron Man', type: 'title', category: 'movie' },
  { original: '스파이더맨', english: 'Spider-Man', type: 'title', category: 'movie' },
  { original: '배트맨', english: 'Batman', type: 'title', category: 'movie' },
  { original: '슈퍼맨', english: 'Superman', type: 'title', category: 'movie' },
  { original: '타이타닉', english: 'Titanic', type: 'title', category: 'movie' },
  { original: '인셉션', english: 'Inception', type: 'title', category: 'movie' },
  { original: '인터스텔라', english: 'Interstellar', type: 'title', category: 'movie' },
  { original: '매트릭스', english: 'The Matrix', type: 'title', category: 'movie' },
  { original: '쥬라기 공원', english: 'Jurassic Park', type: 'title', category: 'movie' },
  { original: '인디아나 존스', english: 'Indiana Jones', type: 'title', category: 'movie' },
  { original: '반지의 제왕', english: 'The Lord of the Rings', type: 'title', category: 'movie' },
  { original: '호빗', english: 'The Hobbit', type: 'title', category: 'movie' },
  { original: '어린 왕자', english: 'The Little Prince', type: 'title', category: 'book' },
  { original: '1984', english: '1984', type: 'title', category: 'book' },
  { original: '동물농장', english: 'Animal Farm', type: 'title', category: 'book' },
  { original: '햄릿', english: 'Hamlet', type: 'title', category: 'book' },
  { original: '로미오와 줄리엣', english: 'Romeo and Juliet', type: 'title', category: 'book' },
  { original: '셜록 홈즈', english: 'Sherlock Holmes', type: 'title', category: 'book' },
  { original: '왕좌의 게임', english: 'Game of Thrones', type: 'title', category: 'tv' },
  { original: '브레이킹 배드', english: 'Breaking Bad', type: 'title', category: 'tv' },
  { original: '더 오피스', english: 'The Office', type: 'title', category: 'tv' },
  { original: '프렌즈', english: 'Friends', type: 'title', category: 'tv' },

  // 추가 기관 - 대학/연구소/국제기구
  {
    original: '서울대학교',
    english: 'Seoul National University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '연세대학교',
    english: 'Yonsei University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '고려대학교',
    english: 'Korea University',
    type: 'organization',
    category: 'university',
  },
  { original: 'KAIST', english: 'KAIST', type: 'organization', category: 'university' },
  { original: 'POSTECH', english: 'POSTECH', type: 'organization', category: 'university' },
  {
    original: '성균관대학교',
    english: 'Sungkyunkwan University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '한양대학교',
    english: 'Hanyang University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '경희대학교',
    english: 'Kyung Hee University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '중앙대학교',
    english: 'Chung-Ang University',
    type: 'organization',
    category: 'university',
  },
  {
    original: '이화여자대학교',
    english: 'Ewha Womans University',
    type: 'organization',
    category: 'university',
  },
  { original: 'IMF', korean: 'IMF', type: 'organization', category: 'international' },
  { original: 'WTO', korean: 'WTO', type: 'organization', category: 'international' },
  { original: 'OECD', korean: 'OECD', type: 'organization', category: 'international' },
  { original: 'UNICEF', korean: '유니세프', type: 'organization', category: 'international' },
  { original: 'UNESCO', korean: '유네스코', type: 'organization', category: 'international' },
  { original: 'FIFA', korean: 'FIFA', type: 'organization', category: 'sports' },
  { original: 'UEFA', korean: 'UEFA', type: 'organization', category: 'sports' },
  { original: 'NBA', korean: 'NBA', type: 'organization', category: 'sports' },
  { original: 'MLB', korean: 'MLB', type: 'organization', category: 'sports' },
  { original: 'NFL', korean: 'NFL', type: 'organization', category: 'sports' },

  // TODO: 추가 고유명사 2,400개
  // - 인명 450개 (배우, 가수, 운동선수, 작가 등)
  // - 지명 750개 (세계 주요 도시, 국가, 랜드마크)
  // - 회사/브랜드 650개
  // - 기관 300개
  // - 작품명 150개
  // - 기타 100개
  // 빌드 스크립트로 생성: scripts/generate-proper-nouns.ts
];

/**
 * 고유명사 찾기
 */
export function findProperNoun(text: string, language: 'ko' | 'en'): ProperNounEntry | null {
  const list = language === 'ko' ? KOREAN_PROPER_NOUNS : ENGLISH_PROPER_NOUNS;
  return list.find((entry) => entry.original === text) || null;
}

/**
 * 부분 매칭 (긴 문자열부터)
 */
export function findProperNounsInText(text: string, language: 'ko' | 'en'): ProperNounEntry[] {
  const list = language === 'ko' ? KOREAN_PROPER_NOUNS : ENGLISH_PROPER_NOUNS;
  const found: ProperNounEntry[] = [];

  // 긴 고유명사부터 검사 (중첩 방지)
  const sorted = [...list].sort((a, b) => b.original.length - a.original.length);

  for (const entry of sorted) {
    if (text.includes(entry.original)) {
      found.push(entry);
    }
  }

  return found;
}

/**
 * 타입별 고유명사
 */
export function getProperNounsByType(
  type: ProperNounType,
  language: 'ko' | 'en',
): ProperNounEntry[] {
  const list = language === 'ko' ? KOREAN_PROPER_NOUNS : ENGLISH_PROPER_NOUNS;
  return list.filter((entry) => entry.type === type);
}

/**
 * 고유명사 총 개수
 */
export function getProperNounCount(): { korean: number; english: number; total: number } {
  return {
    korean: KOREAN_PROPER_NOUNS.length,
    english: ENGLISH_PROPER_NOUNS.length,
    total: KOREAN_PROPER_NOUNS.length + ENGLISH_PROPER_NOUNS.length,
  };
}
