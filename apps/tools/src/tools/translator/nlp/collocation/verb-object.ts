// ========================================
// Verb-Object Collocations - 동사-목적어 연어 사전
// 테스트지 v3.0 A1.2 다의어 기반
// ========================================

/**
 * 동사-목적어 연어 패턴
 * 목적어 → 동사 조합의 영어 번역
 */
export interface VerbObjectPattern {
  /** 목적어 (한국어) */
  object: string;
  /** 동사 어간 (한국어) */
  verbStem: string;
  /** 영어 번역 */
  en: string;
  /** 대안 번역 */
  alternatives?: string[];
}

/**
 * 동사별 목적어 연어 사전
 */
export const verbObjectCollocations: Record<string, VerbObjectPattern[]> = {
  // ========================================
  // 잡다 (catch, hail, press, keep, set, find fault, make)
  // ========================================
  잡: [
    { object: '물고기', verbStem: '잡', en: 'catch fish' },
    { object: '택시', verbStem: '잡', en: 'hail a taxi', alternatives: ['catch a taxi'] },
    { object: '주름', verbStem: '잡', en: 'press pleats' },
    { object: '중심', verbStem: '잡', en: 'keep balance', alternatives: ['maintain balance'] },
    { object: '날짜', verbStem: '잡', en: 'set a date', alternatives: ['fix a date'] },
    { object: '꼬투리', verbStem: '잡', en: 'find fault with' },
    { object: '계획', verbStem: '잡', en: 'make a plan' },
    { object: '범인', verbStem: '잡', en: 'catch the criminal' },
    { object: '기회', verbStem: '잡', en: 'seize the opportunity' },
  ],

  // ========================================
  // 먹다 (eat, get older, make up mind, get scared, concede, take bribe)
  // ========================================
  먹: [
    { object: '밥', verbStem: '먹', en: 'eat rice', alternatives: ['have a meal'] },
    { object: '나이', verbStem: '먹', en: 'get older', alternatives: ['age'] },
    { object: '마음', verbStem: '먹', en: "make up one's mind", alternatives: ['decide'] },
    { object: '겁', verbStem: '먹', en: 'get scared', alternatives: ['be frightened'] },
    { object: '골', verbStem: '먹', en: 'concede a goal' },
    { object: '뇌물', verbStem: '먹', en: 'take a bribe' },
    { object: '욕', verbStem: '먹', en: 'get criticized', alternatives: ['be scolded'] },
    { object: '약', verbStem: '먹', en: 'take medicine' },
    { object: '점심', verbStem: '먹', en: 'have lunch' },
    { object: '저녁', verbStem: '먹', en: 'have dinner' },
    { object: '아침', verbStem: '먹', en: 'have breakfast' },
  ],

  // ========================================
  // 타다 (ride, play, get tanned, receive, burn, make coffee)
  // ========================================
  타: [
    { object: '버스', verbStem: '타', en: 'ride a bus', alternatives: ['take a bus'] },
    { object: '지하철', verbStem: '타', en: 'take the subway' },
    { object: '택시', verbStem: '타', en: 'take a taxi' },
    { object: '비행기', verbStem: '타', en: 'take a plane', alternatives: ['fly'] },
    { object: '배', verbStem: '타', en: 'ride a boat', alternatives: ['take a boat'] },
    { object: '자전거', verbStem: '타', en: 'ride a bicycle' },
    { object: '피아노', verbStem: '타', en: 'play the piano' },
    { object: '기타', verbStem: '타', en: 'play the guitar' },
    { object: '햇볕', verbStem: '타', en: 'get tanned', alternatives: ['get sunburned'] },
    { object: '월급', verbStem: '타', en: 'receive salary', alternatives: ['get paid'] },
    { object: '불', verbStem: '타', en: 'burn', alternatives: ['be on fire'] },
    { object: '커피', verbStem: '타', en: 'make instant coffee' },
    { object: '줄', verbStem: '타', en: 'walk on a rope', alternatives: ['tightrope walk'] },
  ],

  // ========================================
  // 빠지다 (fall into, lose, skip, fall in love, lose weight)
  // ========================================
  빠지: [
    { object: '물', verbStem: '빠지', en: 'fall into water', alternatives: ['drown'] },
    { object: '머리', verbStem: '빠지', en: 'lose hair' },
    { object: '머리카락', verbStem: '빠지', en: 'lose hair' },
    { object: '학교', verbStem: '빠지', en: 'skip school' },
    { object: '수업', verbStem: '빠지', en: 'skip class' },
    { object: '사랑', verbStem: '빠지', en: 'fall in love' },
    { object: '살', verbStem: '빠지', en: 'lose weight' },
    { object: '맛', verbStem: '빠지', en: 'lose flavor' },
    { object: '함정', verbStem: '빠지', en: 'fall into a trap' },
  ],

  // ========================================
  // 끊다 (cut, quit, cut off, buy, hang up, interrupt)
  // ========================================
  끊: [
    { object: '줄', verbStem: '끊', en: 'cut a rope' },
    { object: '담배', verbStem: '끊', en: 'quit smoking' },
    { object: '술', verbStem: '끊', en: 'quit drinking' },
    { object: '연락', verbStem: '끊', en: 'cut off contact' },
    { object: '표', verbStem: '끊', en: 'buy a ticket' },
    { object: '전화', verbStem: '끊', en: 'hang up' },
    { object: '말', verbStem: '끊', en: 'interrupt', alternatives: ['cut someone off'] },
  ],

  // ========================================
  // 풀다 (solve, untie, let go, unpack, clear up)
  // ========================================
  풀: [
    { object: '문제', verbStem: '풀', en: 'solve a problem' },
    { object: '숙제', verbStem: '풀', en: 'do homework' },
    { object: '매듭', verbStem: '풀', en: 'untie a knot' },
    { object: '화', verbStem: '풀', en: 'let go of anger', alternatives: ['calm down'] },
    { object: '짐', verbStem: '풀', en: 'unpack' },
    { object: '오해', verbStem: '풀', en: 'clear up a misunderstanding' },
    { object: '스트레스', verbStem: '풀', en: 'relieve stress' },
  ],

  // ========================================
  // 치다 (play, take, pitch, clear, cause, give)
  // ========================================
  치: [
    { object: '피아노', verbStem: '치', en: 'play the piano' },
    { object: '기타', verbStem: '치', en: 'play the guitar' },
    { object: '시험', verbStem: '치', en: 'take an exam' },
    { object: '텐트', verbStem: '치', en: 'pitch a tent' },
    { object: '눈', verbStem: '치', en: 'clear the snow' },
    { object: '사고', verbStem: '치', en: 'cause trouble', alternatives: ['cause an accident'] },
    { object: '주사', verbStem: '치', en: 'give an injection' },
    { object: '공', verbStem: '치', en: 'hit the ball' },
  ],

  // ========================================
  // 들다 (hold, like, enter, cost)
  // ========================================
  들: [
    { object: '손', verbStem: '들', en: 'raise hand' },
    { object: '마음', verbStem: '들', en: 'like', alternatives: ['take a liking to'] },
    { object: '방', verbStem: '들', en: 'enter the room' },
    { object: '돈', verbStem: '들', en: 'cost money' },
    { object: '힘', verbStem: '들', en: 'require effort', alternatives: ['be difficult'] },
    { object: '잠', verbStem: '들', en: 'fall asleep' },
  ],

  // ========================================
  // 내다 (pay, submit, make, let out)
  // ========================================
  내: [
    { object: '돈', verbStem: '내', en: 'pay money' },
    { object: '숙제', verbStem: '내', en: 'submit homework' },
    { object: '소리', verbStem: '내', en: 'make a sound' },
    { object: '냄새', verbStem: '내', en: 'give off a smell' },
    { object: '결론', verbStem: '내', en: 'reach a conclusion' },
    { object: '시간', verbStem: '내', en: 'make time' },
  ],

  // ========================================
  // 보다 (see, watch, take, read)
  // ========================================
  보: [
    { object: '영화', verbStem: '보', en: 'watch a movie' },
    { object: 'TV', verbStem: '보', en: 'watch TV' },
    { object: '시험', verbStem: '보', en: 'take an exam' },
    { object: '책', verbStem: '보', en: 'read a book' },
    { object: '신문', verbStem: '보', en: 'read the newspaper' },
    { object: '의사', verbStem: '보', en: 'see a doctor' },
  ],
};

/**
 * 동사 어간 목록 (빠른 검색용)
 */
export const verbStems = Object.keys(verbObjectCollocations);

/**
 * 동사-목적어 연어 검색
 * @param object 목적어 (조사 제거된 상태)
 * @param verbStem 동사 어간
 * @returns 연어 패턴 또는 null
 */
export function findVerbObjectCollocation(
  object: string,
  verbStem: string
): VerbObjectPattern | null {
  const patterns = verbObjectCollocations[verbStem];
  if (!patterns) return null;

  return patterns.find((p) => p.object === object) || null;
}

/**
 * 목적어로 가능한 동사 연어 모두 검색
 * @param object 목적어
 * @returns 가능한 연어 패턴 목록
 */
export function findCollocationsForObject(object: string): VerbObjectPattern[] {
  const results: VerbObjectPattern[] = [];

  for (const verbStem of verbStems) {
    const pattern = findVerbObjectCollocation(object, verbStem);
    if (pattern) {
      results.push(pattern);
    }
  }

  return results;
}
