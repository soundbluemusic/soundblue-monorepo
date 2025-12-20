// ========================================
// Compound Words - 복합어 분석
// 한국어 복합어를 구성 요소로 분해 또는 직접 번역
// ========================================

// 복합어 정의
export interface CompoundWordEntry {
  translation?: string; // 단일 번역 (예: 한국사람 → Korean)
  parts?: string[]; // 분리 번역용 구성요소
}

export const compoundWords: Record<string, CompoundWordEntry> = {
  // === 국적 + 사람 → 국적으로 번역 (person 생략) ===
  한국사람: { translation: 'Korean' },
  미국사람: { translation: 'American' },
  일본사람: { translation: 'Japanese' },
  중국사람: { translation: 'Chinese' },
  영국사람: { translation: 'British' },
  프랑스사람: { translation: 'French' },
  독일사람: { translation: 'German' },
  캐나다사람: { translation: 'Canadian' },
  호주사람: { translation: 'Australian' },
  러시아사람: { translation: 'Russian' },
  인도사람: { translation: 'Indian' },
  브라질사람: { translation: 'Brazilian' },
  스페인사람: { translation: 'Spanish' },
  이탈리아사람: { translation: 'Italian' },
  베트남사람: { translation: 'Vietnamese' },
  태국사람: { translation: 'Thai' },

  // === 장소 + 명사 ===
  학교생활: { translation: 'school life' },
  회사생활: { translation: 'work life' },
  회사일: { translation: 'work' },
  집안일: { translation: 'housework' },
  가사일: { translation: 'housework' },

  // === 시간 관련 ===
  오늘밤: { translation: 'tonight' },
  오늘아침: { translation: 'this morning' },
  오늘저녁: { translation: 'this evening' },
  내일아침: { translation: 'tomorrow morning' },
  내일저녁: { translation: 'tomorrow evening' },
  어제밤: { translation: 'last night' },
  어젯밤: { translation: 'last night' },
  매일아침: { translation: 'every morning' },
  매일저녁: { translation: 'every evening' },
  다음주: { translation: 'next week' },
  지난주: { translation: 'last week' },
  다음달: { translation: 'next month' },
  지난달: { translation: 'last month' },
  내년: { translation: 'next year' },
  작년: { translation: 'last year' },
  올해: { translation: 'this year' },

  // === 음식 관련 ===
  아침밥: { translation: 'breakfast' },
  점심밥: { translation: 'lunch' },
  저녁밥: { translation: 'dinner' },
  아침식사: { translation: 'breakfast' },
  점심식사: { translation: 'lunch' },
  저녁식사: { translation: 'dinner' },
  한식당: { translation: 'Korean restaurant' },
  중식당: { translation: 'Chinese restaurant' },
  일식당: { translation: 'Japanese restaurant' },
  양식당: { translation: 'Western restaurant' },
  분식집: { translation: 'snack bar' },
  치킨집: { translation: 'chicken restaurant' },
  고깃집: { translation: 'meat restaurant' },
  술집: { translation: 'bar' },
  커피숍: { translation: 'coffee shop' },

  // === 교통/장소 ===
  서울역: { translation: 'Seoul Station' },
  부산역: { translation: 'Busan Station' },
  버스정류장: { translation: 'bus stop' },
  지하철역: { translation: 'subway station' },
  공항버스: { translation: 'airport bus' },
  시내버스: { translation: 'city bus' },
  고속버스: { translation: 'express bus' },
  택시정류장: { translation: 'taxi stand' },
  기차역: { translation: 'train station' },
  공항철도: { translation: 'airport railroad' },

  // === 가전제품 ===
  공기청정기: { translation: 'air purifier' },
  로봇청소기: { translation: 'robot vacuum' },
  전자레인지: { translation: 'microwave' },
  전기밥솥: { translation: 'rice cooker' },
  식기세척기: { translation: 'dishwasher' },
  커피머신: { translation: 'coffee machine' },
  가스레인지: { translation: 'gas stove' },
  헤어드라이어: { translation: 'hair dryer' },
  블루투스스피커: { translation: 'Bluetooth speaker' },
  보조배터리: { translation: 'power bank' },
  외장하드: { translation: 'external hard drive' },

  // === IT/기술 ===
  휴대전화: { translation: 'cell phone' },
  휴대폰: { translation: 'cell phone' },
  스마트폰: { translation: 'smartphone' },
  컴퓨터게임: { translation: 'computer game' },
  비디오게임: { translation: 'video game' },
  온라인게임: { translation: 'online game' },
  모바일게임: { translation: 'mobile game' },
  인터넷뱅킹: { translation: 'online banking' },
  모바일뱅킹: { translation: 'mobile banking' },
  온라인쇼핑: { translation: 'online shopping' },
  온라인강의: { translation: 'online lecture' },
  화상회의: { translation: 'video conference' },
  화상통화: { translation: 'video call' },
  음성통화: { translation: 'voice call' },
  문자메시지: { translation: 'text message' },
  이메일주소: { translation: 'email address' },
  웹사이트주소: { translation: 'website address' },
  소셜미디어: { translation: 'social media' },
  인공지능: { translation: 'artificial intelligence' },
  머신러닝: { translation: 'machine learning' },
  빅데이터: { translation: 'big data' },
  클라우드서비스: { translation: 'cloud service' },
  오픈소스: { translation: 'open source' },

  // === 학교/교육 ===
  공부방: { translation: 'study room' },
  독서실: { translation: 'reading room' },
  자습실: { translation: 'study hall' },
  운동장: { translation: 'playground' },
  수영장: { translation: 'swimming pool' },
  체육관: { translation: 'gymnasium' },
  도서관: { translation: 'library' },
  학생증: { translation: 'student ID' },
  졸업증: { translation: 'diploma' },
  성적표: { translation: 'report card' },
  학교버스: { translation: 'school bus' },
  교복바지: { translation: 'school uniform pants' },
  교복치마: { translation: 'school uniform skirt' },
  학생회장: { translation: 'student council president' },
  담임선생님: { translation: 'homeroom teacher' },
  영어선생님: { translation: 'English teacher' },
  수학선생님: { translation: 'math teacher' },

  // === 의료/건강 ===
  건강검진: { translation: 'health checkup' },
  종합검진: { translation: 'comprehensive checkup' },
  혈액검사: { translation: 'blood test' },
  소변검사: { translation: 'urine test' },
  엑스레이: { translation: 'X-ray' },
  CT촬영: { translation: 'CT scan' },
  MRI촬영: { translation: 'MRI scan' },
  예방접종: { translation: 'vaccination' },
  독감예방주사: { translation: 'flu shot' },
  응급실: { translation: 'emergency room' },
  수술실: { translation: 'operating room' },
  대기실: { translation: 'waiting room' },
  진료실: { translation: 'examination room' },
  입원실: { translation: 'hospital room' },
  건강보험: { translation: 'health insurance' },
  의료보험: { translation: 'medical insurance' },

  // === 직업/비즈니스 ===
  회사원: { translation: 'office worker' },
  공무원: { translation: 'civil servant' },
  택배기사: { translation: 'delivery driver' },
  배달기사: { translation: 'delivery person' },
  영업사원: { translation: 'salesperson' },
  마케팅팀: { translation: 'marketing team' },
  개발팀: { translation: 'development team' },
  인사팀: { translation: 'HR team' },
  재무팀: { translation: 'finance team' },
  회의실: { translation: 'meeting room' },
  사무실: { translation: 'office' },
  작업실: { translation: 'workshop' },
  연구실: { translation: 'laboratory' },

  // === 쇼핑/상업 ===
  백화점: { translation: 'department store' },
  할인매장: { translation: 'discount store' },
  대형마트: { translation: 'hypermarket' },
  편의점: { translation: 'convenience store' },
  무인매장: { translation: 'unmanned store' },
  면세점: { translation: 'duty-free shop' },
  신용카드: { translation: 'credit card' },
  체크카드: { translation: 'debit card' },
  선불카드: { translation: 'prepaid card' },
  기프트카드: { translation: 'gift card' },
  포인트적립: { translation: 'points accumulation' },
  할인쿠폰: { translation: 'discount coupon' },
  무료배송: { translation: 'free shipping' },
  당일배송: { translation: 'same-day delivery' },
  새벽배송: { translation: 'dawn delivery' },
  로켓배송: { translation: 'rocket delivery' },

  // === 스포츠/레저 ===
  축구공: { translation: 'soccer ball' },
  농구공: { translation: 'basketball' },
  야구공: { translation: 'baseball' },
  탁구공: { translation: 'ping pong ball' },
  골프공: { translation: 'golf ball' },
  테니스공: { translation: 'tennis ball' },
  야구장: { translation: 'baseball stadium' },
  축구장: { translation: 'soccer stadium' },
  농구장: { translation: 'basketball court' },
  테니스장: { translation: 'tennis court' },
  골프장: { translation: 'golf course' },
  스키장: { translation: 'ski resort' },
  헬스장: { translation: 'fitness center' },
  볼링장: { translation: 'bowling alley' },
  당구장: { translation: 'billiard hall' },
  노래방: { translation: 'karaoke' },
  찜질방: { translation: 'jjimjilbang' },

  // === 예술/문화 ===
  미술관: { translation: 'art museum' },
  박물관: { translation: 'museum' },
  콘서트홀: { translation: 'concert hall' },
  공연장: { translation: 'performance hall' },
  전시회: { translation: 'exhibition' },
  영화관: { translation: 'cinema' },
  연극배우: { translation: 'theater actor' },
  영화배우: { translation: 'movie actor' },
  팝송: { translation: 'pop song' },
  클래식음악: { translation: 'classical music' },
  전통음악: { translation: 'traditional music' },
  힙합음악: { translation: 'hip hop music' },

  // === 가구/인테리어 ===
  침대방: { translation: 'bedroom' },
  거실: { translation: 'living room' },
  주방: { translation: 'kitchen' },
  화장실: { translation: 'bathroom' },
  샤워실: { translation: 'shower room' },
  세탁실: { translation: 'laundry room' },
  다용도실: { translation: 'utility room' },
  드레스룸: { translation: 'dressing room' },
  작은방: { translation: 'small room' },
  큰방: { translation: 'large room' },
  안방: { translation: 'master bedroom' },
  손님방: { translation: 'guest room' },

  // === 공공기관 ===
  시청: { translation: 'city hall' },
  구청: { translation: 'district office' },
  동사무소: { translation: 'community center' },
  주민센터: { translation: 'community service center' },
  세무서: { translation: 'tax office' },
  등기소: { translation: 'registry office' },
  출입국관리사무소: { translation: 'immigration office' },
  보건소: { translation: 'public health center' },
  복지관: { translation: 'welfare center' },
  문화센터: { translation: 'cultural center' },
  소방서: { translation: 'fire station' },
  경찰서: { translation: 'police station' },
  우체국: { translation: 'post office' },

  // === 감정/상태 ===
  기분좋음: { translation: 'feeling good' },
  기분나쁨: { translation: 'feeling bad' },
  몸상태: { translation: 'physical condition' },
  건강상태: { translation: 'health condition' },
  정신건강: { translation: 'mental health' },
  마음상태: { translation: 'state of mind' },
};

// 접미사 패턴 (명사 + 접미사)
export const suffixPatterns: Record<string, { meaning: string; type: string }> = {
  사람: { meaning: 'person', type: 'noun' },
  분: { meaning: 'person (honorific)', type: 'noun' },
  님: { meaning: 'honorific suffix', type: 'suffix' },
  씨: { meaning: 'Mr./Ms.', type: 'suffix' },
  역: { meaning: 'station', type: 'noun' },
  장: { meaning: 'place', type: 'noun' },
  관: { meaning: 'building', type: 'noun' },
  실: { meaning: 'room', type: 'noun' },
  점: { meaning: 'store', type: 'noun' },
  // [신규] 추가 접미사
  기: { meaning: 'machine/device', type: 'noun' },
  대: { meaning: 'stand/platform', type: 'noun' },
  용: { meaning: 'for use', type: 'suffix' },
  집: { meaning: 'house/shop', type: 'noun' },
  방: { meaning: 'room', type: 'noun' },
  차: { meaning: 'vehicle', type: 'noun' },
  품: { meaning: 'product', type: 'noun' },
  비: { meaning: 'cost/fee', type: 'noun' },
  금: { meaning: 'money/fee', type: 'noun' },
  증: { meaning: 'certificate', type: 'noun' },
  표: { meaning: 'ticket/table', type: 'noun' },
  서: { meaning: 'office/document', type: 'noun' },
  원: { meaning: 'center/institute', type: 'noun' },
  소: { meaning: 'place/center', type: 'noun' },
  가: { meaning: 'artist/specialist', type: 'noun' },
  사: { meaning: 'person/master', type: 'noun' },
};

// 접두사 패턴
export const prefixPatterns: Record<string, { meaning: string; type: string }> = {
  새: { meaning: 'new', type: 'adjective' },
  옛: { meaning: 'old/former', type: 'adjective' },
  헌: { meaning: 'old/used', type: 'adjective' },
  맨: { meaning: 'bare/only', type: 'adjective' },
  첫: { meaning: 'first', type: 'adjective' },
  // [신규] 추가 접두사
  총: { meaning: 'total/chief', type: 'adjective' },
  대: { meaning: 'big/grand', type: 'adjective' },
  소: { meaning: 'small/minor', type: 'adjective' },
  무: { meaning: 'without/free', type: 'adjective' },
  유: { meaning: 'with/paid', type: 'adjective' },
  비: { meaning: 'non-/un-', type: 'adjective' },
  재: { meaning: 're-/again', type: 'adjective' },
  초: { meaning: 'super/ultra', type: 'adjective' },
  최: { meaning: 'most/best', type: 'adjective' },
  한: { meaning: 'Korean', type: 'adjective' },
  양: { meaning: 'Western', type: 'adjective' },
  중: { meaning: 'Chinese/middle', type: 'adjective' },
  일: { meaning: 'Japanese', type: 'adjective' },
};

/**
 * 복합어 번역 또는 분해 시도
 * @param word 분해할 단어
 * @returns { translation: string } 또는 { parts: string[] } 또는 null
 */
export function tryDecomposeCompound(
  word: string,
): { translation: string } | { parts: string[] } | null {
  // 1. 정의된 복합어 확인
  const entry = compoundWords[word];
  if (entry) {
    if (entry.translation) {
      return { translation: entry.translation };
    }
    if (entry.parts) {
      return { parts: entry.parts };
    }
  }

  // 2. 접미사 패턴 확인 (일반 분해)
  for (const [suffix, _info] of Object.entries(suffixPatterns)) {
    if (word.endsWith(suffix) && word.length > suffix.length) {
      const prefix = word.slice(0, -suffix.length);
      if (prefix.length >= 1) {
        return { parts: [prefix, suffix] };
      }
    }
  }

  // 3. 접두사 패턴 확인
  for (const [prefix, _info] of Object.entries(prefixPatterns)) {
    if (word.startsWith(prefix) && word.length > prefix.length) {
      const suffixPart = word.slice(prefix.length);
      if (suffixPart.length >= 1) {
        return { parts: [prefix, suffixPart] };
      }
    }
  }

  return null;
}

/**
 * 복합어인지 확인
 */
export function isCompoundWord(word: string): boolean {
  return tryDecomposeCompound(word) !== null;
}
