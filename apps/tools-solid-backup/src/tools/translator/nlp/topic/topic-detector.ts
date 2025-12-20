// ========================================
// 주제 탐지 (Topic Detector)
// 문장의 도메인/주제 감지
// WSD에 문맥 힌트 제공
// ========================================

/**
 * 도메인 점수
 */
export interface DomainScore {
  /** 도메인 이름 */
  domain: string;
  /** 점수 */
  score: number;
  /** 매칭된 키워드들 */
  matchedKeywords: string[];
}

/**
 * 도메인별 키워드 사전
 */
export const domainKeywords: Record<string, string[]> = {
  // 신체/건강
  body: [
    '아프',
    '아파',
    '아픈',
    '병원',
    '의사',
    '약',
    '치료',
    '수술',
    '증상',
    '환자',
    '몸',
    '건강',
    '진찰',
    '진단',
    '주사',
    '처방',
    '입원',
    '퇴원',
    '검사',
    '통증',
    '열',
    '감기',
    '두통',
    '배탈',
    '설사',
    '구토',
    '기침',
    '콧물',
  ],

  // 음식/요리
  food: [
    '먹',
    '맛있',
    '요리',
    '음식',
    '식당',
    '과일',
    '달',
    '짜',
    '매운',
    '싱거운',
    '맛',
    '레시피',
    '재료',
    '조리',
    '끓이',
    '볶',
    '굽',
    '찌',
    '삶',
    '튀기',
    '밥',
    '반찬',
    '국',
    '찌개',
    '고기',
    '생선',
    '야채',
    '채소',
  ],

  // 교통/이동
  transport: [
    '타',
    '차',
    '버스',
    '지하철',
    '배',
    '비행기',
    '역',
    '운전',
    '택시',
    '기차',
    '교통',
    '출발',
    '도착',
    '정류장',
    '공항',
    '항구',
    '주차',
    '신호등',
    '도로',
    '고속도로',
    '자전거',
    '오토바이',
    '걸어',
  ],

  // 날씨/자연
  weather: [
    '날씨',
    '비',
    '눈',
    '바람',
    '춥',
    '덥',
    '맑',
    '흐리',
    '구름',
    '태양',
    '해',
    '달',
    '별',
    '기온',
    '습도',
    '안개',
    '번개',
    '천둥',
    '태풍',
    '폭우',
    '폭설',
    '봄',
    '여름',
    '가을',
    '겨울',
  ],

  // 교육/학습
  education: [
    '학교',
    '공부',
    '시험',
    '수업',
    '선생님',
    '학생',
    '숙제',
    '과제',
    '졸업',
    '입학',
    '대학',
    '도서관',
    '책',
    '강의',
    '성적',
    '점수',
    '학점',
    '전공',
    '교수',
    '강사',
    '연구',
    '논문',
  ],

  // 비즈니스/직장
  business: [
    '회사',
    '일',
    '회의',
    '계약',
    '거래',
    '사업',
    '직장',
    '출근',
    '퇴근',
    '야근',
    '월급',
    '급여',
    '보너스',
    '승진',
    '부서',
    '상사',
    '부하',
    '동료',
    '면접',
    '이력서',
    '취업',
    '퇴직',
    '해고',
  ],

  // 감정/심리
  emotion: [
    '좋',
    '싫',
    '슬프',
    '기쁘',
    '화나',
    '걱정',
    '행복',
    '우울',
    '불안',
    '두려',
    '무섭',
    '즐겁',
    '재미있',
    '지루',
    '피곤',
    '외롭',
    '그립',
    '설레',
    '긴장',
    '초조',
    '당황',
    '부끄럽',
    '창피',
  ],

  // 시간/일정
  time: [
    '오늘',
    '내일',
    '어제',
    '아침',
    '저녁',
    '시간',
    '언제',
    '항상',
    '자주',
    '가끔',
    '매일',
    '매주',
    '매월',
    '올해',
    '작년',
    '내년',
    '주말',
    '평일',
    '약속',
    '일정',
    '스케줄',
    '계획',
  ],

  // 가족/관계
  family: [
    '가족',
    '부모님',
    '아버지',
    '어머니',
    '아빠',
    '엄마',
    '형',
    '누나',
    '언니',
    '오빠',
    '동생',
    '할아버지',
    '할머니',
    '아들',
    '딸',
    '남편',
    '아내',
    '결혼',
    '이혼',
  ],

  // 쇼핑/구매
  shopping: [
    '사',
    '팔',
    '가격',
    '돈',
    '비싸',
    '싸',
    '할인',
    '세일',
    '쇼핑',
    '물건',
    '상품',
    '마트',
    '백화점',
    '온라인',
    '배송',
    '결제',
    '카드',
    '현금',
    '영수증',
  ],

  // 취미/여가
  leisure: [
    '여행',
    '운동',
    '게임',
    '영화',
    '음악',
    '노래',
    '춤',
    '취미',
    '산책',
    '등산',
    '수영',
    '축구',
    '야구',
    '농구',
    '테니스',
    '골프',
    '요가',
    '헬스',
    '독서',
    '그림',
  ],

  // 통신/기술
  technology: [
    '컴퓨터',
    '인터넷',
    '스마트폰',
    '핸드폰',
    '전화',
    '메시지',
    '이메일',
    '앱',
    '프로그램',
    '소프트웨어',
    '하드웨어',
    '업데이트',
    '다운로드',
    '설치',
    '삭제',
    '비밀번호',
    '로그인',
  ],

  // 수학/숫자
  math: [
    '숫자',
    '계산',
    '더하기',
    '빼기',
    '곱하기',
    '나누기',
    '퍼센트',
    '배',
    '반',
    '평균',
    '합계',
    '증가',
    '감소',
    '몇',
    '얼마',
    '개수',
    '수량',
  ],

  // 장소/위치
  place: [
    '집',
    '방',
    '거실',
    '부엌',
    '화장실',
    '욕실',
    '침실',
    '사무실',
    '건물',
    '아파트',
    '빌딩',
    '공원',
    '광장',
    '시장',
    '병원',
    '은행',
    '우체국',
    '경찰서',
    '소방서',
  ],

  // 동물
  animal: [
    '동물',
    '개',
    '고양이',
    '새',
    '물고기',
    '소',
    '돼지',
    '닭',
    '말',
    '양',
    '염소',
    '토끼',
    '사자',
    '호랑이',
    '코끼리',
    '원숭이',
    '뱀',
    '곤충',
    '벌레',
  ],

  // 식물
  plant: [
    '꽃',
    '나무',
    '풀',
    '숲',
    '정원',
    '심',
    '가꾸',
    '물주',
    '씨앗',
    '싹',
    '잎',
    '뿌리',
    '줄기',
    '열매',
    '과수원',
    '채소밭',
    '화분',
  ],
};

/**
 * 도메인 키워드 역인덱스 (빠른 조회용)
 */
const keywordToDomain = new Map<string, string[]>();

// 역인덱스 초기화
for (const [domain, keywords] of Object.entries(domainKeywords)) {
  for (const keyword of keywords) {
    if (!keywordToDomain.has(keyword)) {
      keywordToDomain.set(keyword, []);
    }
    keywordToDomain.get(keyword)!.push(domain);
  }
}

/**
 * 문장의 도메인 점수 계산
 * @param text 입력 텍스트
 * @returns 도메인별 점수 (높은 순)
 */
export function detectDomains(text: string): DomainScore[] {
  const scores = new Map<string, { score: number; keywords: string[] }>();

  // 모든 도메인 초기화
  for (const domain of Object.keys(domainKeywords)) {
    scores.set(domain, { score: 0, keywords: [] });
  }

  // 키워드 매칭
  for (const [keyword, domains] of keywordToDomain) {
    if (text.includes(keyword)) {
      for (const domain of domains) {
        const entry = scores.get(domain)!;
        entry.score += 1;
        if (!entry.keywords.includes(keyword)) {
          entry.keywords.push(keyword);
        }
      }
    }
  }

  // 결과 배열로 변환 및 정렬
  const result: DomainScore[] = [];
  for (const [domain, { score, keywords }] of scores) {
    if (score > 0) {
      result.push({
        domain,
        score,
        matchedKeywords: keywords,
      });
    }
  }

  // 점수 내림차순 정렬
  return result.sort((a, b) => b.score - a.score);
}

/**
 * 최상위 도메인 반환
 * @param text 입력 텍스트
 * @returns 최상위 도메인 또는 null
 */
export function getTopDomain(text: string): string | null {
  const domains = detectDomains(text);
  const top = domains[0];
  return top ? top.domain : null;
}

/**
 * 도메인 확인
 * @param text 입력 텍스트
 * @param domain 확인할 도메인
 * @returns 해당 도메인 점수 (0이면 매칭 없음)
 */
export function hasDomain(text: string, domain: string): number {
  const domains = detectDomains(text);
  const found = domains.find((d) => d.domain === domain);
  return found?.score || 0;
}

/**
 * 복수 도메인 확인 (상위 N개)
 * @param text 입력 텍스트
 * @param topN 반환할 도메인 수
 * @returns 상위 N개 도메인
 */
export function getTopDomains(text: string, topN = 3): string[] {
  const domains = detectDomains(text);
  return domains.slice(0, topN).map((d) => d.domain);
}

/**
 * 도메인 기반 WSD 힌트 생성
 * @param text 입력 텍스트
 * @returns WSD에 사용할 도메인 정보
 */
export function getDomainHint(text: string): {
  primary: string | null;
  secondary: string | null;
  confidence: number;
} {
  const domains = detectDomains(text);

  if (domains.length === 0) {
    return { primary: null, secondary: null, confidence: 0 };
  }

  const primary = domains[0];
  if (!primary) {
    return { primary: null, secondary: null, confidence: 0 };
  }

  const secondary = domains[1];

  // 확신도 계산: 1위 점수 / 전체 점수
  const totalScore = domains.reduce((sum, d) => sum + d.score, 0);
  const confidence = totalScore > 0 ? primary.score / totalScore : 0;

  return {
    primary: primary.domain,
    secondary: secondary?.domain || null,
    confidence,
  };
}
