// ========================================
// 연어 사전 (Collocation Dictionary)
// 200개 핵심 연어 표현
// ========================================

/**
 * 연어 타입
 */
export type CollocationType = 'V+N' | 'N+V' | 'ADJ+N' | 'ADV+V' | 'N+N';

/**
 * 연어 정의
 */
export interface Collocation {
  /** 한국어 패턴 (어간 기준) */
  ko: string[];
  /** 영어 번역 */
  en: string;
  /** 연어 타입 */
  type: CollocationType;
  /** 우선순위 (높을수록 우선) */
  priority?: number;
}

/**
 * 연어 사전 (200개)
 */
export const collocations: Collocation[] = [
  // ========================================
  // make 류
  // ========================================
  { ko: ['결정', '내리'], en: 'make a decision', type: 'V+N', priority: 10 },
  { ko: ['결정', '하'], en: 'make a decision', type: 'V+N', priority: 9 },
  { ko: ['실수', '하'], en: 'make a mistake', type: 'V+N', priority: 10 },
  { ko: ['약속', '하'], en: 'make a promise', type: 'V+N', priority: 10 },
  { ko: ['약속', '지키'], en: 'keep a promise', type: 'V+N', priority: 10 },
  { ko: ['약속', '어기'], en: 'break a promise', type: 'V+N', priority: 10 },
  { ko: ['전화', '하'], en: 'make a call', type: 'V+N', priority: 9 },
  { ko: ['전화', '걸'], en: 'make a call', type: 'V+N', priority: 10 },
  { ko: ['전화', '받'], en: 'answer a call', type: 'V+N', priority: 10 },
  { ko: ['노력', '하'], en: 'make an effort', type: 'V+N', priority: 10 },
  { ko: ['돈', '벌'], en: 'make money', type: 'V+N', priority: 10 },
  { ko: ['친구', '사귀'], en: 'make friends', type: 'V+N', priority: 10 },
  { ko: ['소리', '내'], en: 'make a sound', type: 'V+N', priority: 9 },
  { ko: ['선택', '하'], en: 'make a choice', type: 'V+N', priority: 10 },
  { ko: ['차이', '만들'], en: 'make a difference', type: 'V+N', priority: 10 },
  { ko: ['진전', '이루'], en: 'make progress', type: 'V+N', priority: 10 },

  // ========================================
  // do 류
  // ========================================
  { ko: ['숙제', '하'], en: 'do homework', type: 'V+N', priority: 10 },
  { ko: ['운동', '하'], en: 'do exercise', type: 'V+N', priority: 10 },
  { ko: ['요리', '하'], en: 'do the cooking', type: 'V+N', priority: 9 },
  { ko: ['빨래', '하'], en: 'do the laundry', type: 'V+N', priority: 10 },
  { ko: ['설거지', '하'], en: 'do the dishes', type: 'V+N', priority: 10 },
  { ko: ['청소', '하'], en: 'do the cleaning', type: 'V+N', priority: 9 },
  { ko: ['연구', '하'], en: 'do research', type: 'V+N', priority: 10 },
  { ko: ['일', '하'], en: 'do work', type: 'V+N', priority: 8 },
  { ko: ['장', '보'], en: 'do the shopping', type: 'V+N', priority: 10 },
  { ko: ['손해', '입'], en: 'do damage', type: 'V+N', priority: 9 },
  { ko: ['최선', '다하'], en: "do one's best", type: 'V+N', priority: 10 },

  // ========================================
  // take 류
  // ========================================
  { ko: ['사진', '찍'], en: 'take a photo', type: 'V+N', priority: 10 },
  { ko: ['샤워', '하'], en: 'take a shower', type: 'V+N', priority: 10 },
  { ko: ['목욕', '하'], en: 'take a bath', type: 'V+N', priority: 10 },
  { ko: ['낮잠', '자'], en: 'take a nap', type: 'V+N', priority: 10 },
  { ko: ['휴식', '취하'], en: 'take a rest', type: 'V+N', priority: 10 },
  { ko: ['휴식', '하'], en: 'take a rest', type: 'V+N', priority: 9 },
  { ko: ['시험', '보'], en: 'take an exam', type: 'V+N', priority: 10 },
  { ko: ['시험', '치르'], en: 'take an exam', type: 'V+N', priority: 10 },
  { ko: ['수업', '듣'], en: 'take a class', type: 'V+N', priority: 10 },
  { ko: ['수업', '받'], en: 'take a class', type: 'V+N', priority: 9 },
  { ko: ['책임', '지'], en: 'take responsibility', type: 'V+N', priority: 10 },
  { ko: ['위험', '감수하'], en: 'take a risk', type: 'V+N', priority: 10 },
  { ko: ['산책', '하'], en: 'take a walk', type: 'V+N', priority: 10 },
  { ko: ['걸', '걷'], en: 'take a walk', type: 'V+N', priority: 8 },
  { ko: ['조치', '취하'], en: 'take action', type: 'V+N', priority: 10 },
  { ko: ['기회', '잡'], en: 'take a chance', type: 'V+N', priority: 9 },
  { ko: ['시간', '걸리'], en: 'take time', type: 'V+N', priority: 10 },
  { ko: ['자리', '잡'], en: 'take a seat', type: 'V+N', priority: 9 },

  // ========================================
  // have 류
  // ========================================
  { ko: ['식사', '하'], en: 'have a meal', type: 'V+N', priority: 10 },
  { ko: ['아침', '먹'], en: 'have breakfast', type: 'V+N', priority: 10 },
  { ko: ['점심', '먹'], en: 'have lunch', type: 'V+N', priority: 10 },
  { ko: ['저녁', '먹'], en: 'have dinner', type: 'V+N', priority: 10 },
  { ko: ['대화', '나누'], en: 'have a conversation', type: 'V+N', priority: 10 },
  { ko: ['대화', '하'], en: 'have a conversation', type: 'V+N', priority: 9 },
  { ko: ['회의', '하'], en: 'have a meeting', type: 'V+N', priority: 10 },
  { ko: ['회의', '열'], en: 'have a meeting', type: 'V+N', priority: 9 },
  { ko: ['파티', '열'], en: 'have a party', type: 'V+N', priority: 10 },
  { ko: ['꿈', '꾸'], en: 'have a dream', type: 'V+N', priority: 10 },
  { ko: ['문제', '있'], en: 'have a problem', type: 'V+N', priority: 10 },
  { ko: ['효과', '있'], en: 'have an effect', type: 'V+N', priority: 10 },
  { ko: ['영향', '미치'], en: 'have an influence', type: 'V+N', priority: 10 },
  { ko: ['감기', '걸리'], en: 'have a cold', type: 'V+N', priority: 10 },
  { ko: ['두통', '있'], en: 'have a headache', type: 'V+N', priority: 10 },
  { ko: ['재미', '있'], en: 'have fun', type: 'V+N', priority: 10 },
  { ko: ['시간', '있'], en: 'have time', type: 'V+N', priority: 9 },

  // ========================================
  // give 류
  // ========================================
  { ko: ['도움', '주'], en: 'give help', type: 'V+N', priority: 10 },
  { ko: ['조언', '하'], en: 'give advice', type: 'V+N', priority: 10 },
  { ko: ['조언', '주'], en: 'give advice', type: 'V+N', priority: 10 },
  { ko: ['허락', '하'], en: 'give permission', type: 'V+N', priority: 10 },
  { ko: ['박수', '치'], en: 'give applause', type: 'V+N', priority: 9 },
  { ko: ['선물', '주'], en: 'give a gift', type: 'V+N', priority: 10 },
  { ko: ['정보', '주'], en: 'give information', type: 'V+N', priority: 10 },
  { ko: ['연설', '하'], en: 'give a speech', type: 'V+N', priority: 10 },
  { ko: ['발표', '하'], en: 'give a presentation', type: 'V+N', priority: 10 },

  // ========================================
  // get 류
  // ========================================
  { ko: ['허가', '받'], en: 'get permission', type: 'V+N', priority: 10 },
  { ko: ['일자리', '구하'], en: 'get a job', type: 'V+N', priority: 10 },
  { ko: ['직장', '구하'], en: 'get a job', type: 'V+N', priority: 9 },
  { ko: ['결과', '얻'], en: 'get results', type: 'V+N', priority: 10 },
  { ko: ['인상', '받'], en: 'get an impression', type: 'V+N', priority: 10 },
  { ko: ['소식', '듣'], en: 'get news', type: 'V+N', priority: 9 },

  // ========================================
  // pay 류
  // ========================================
  { ko: ['주의', '기울이'], en: 'pay attention', type: 'V+N', priority: 10 },
  { ko: ['관심', '기울이'], en: 'pay attention', type: 'V+N', priority: 9 },
  { ko: ['관심', '갖'], en: 'pay attention', type: 'V+N', priority: 8 },
  { ko: ['존경', '표하'], en: 'pay respect', type: 'V+N', priority: 10 },
  { ko: ['방문', '하'], en: 'pay a visit', type: 'V+N', priority: 9 },
  { ko: ['값', '치르'], en: 'pay the price', type: 'V+N', priority: 10 },

  // ========================================
  // catch 류
  // ========================================
  { ko: ['눈길', '끌'], en: 'catch attention', type: 'V+N', priority: 10 },
  { ko: ['시선', '끌'], en: 'catch attention', type: 'V+N', priority: 9 },
  { ko: ['감기', '옮'], en: 'catch a cold', type: 'V+N', priority: 9 },
  { ko: ['버스', '타'], en: 'catch a bus', type: 'V+N', priority: 10 },
  { ko: ['택시', '잡'], en: 'catch a taxi', type: 'V+N', priority: 10 },

  // ========================================
  // keep 류
  // ========================================
  { ko: ['비밀', '지키'], en: 'keep a secret', type: 'V+N', priority: 10 },
  { ko: ['건강', '유지하'], en: 'keep healthy', type: 'V+N', priority: 10 },
  { ko: ['침묵', '지키'], en: 'keep silent', type: 'V+N', priority: 10 },
  { ko: ['기록', '유지하'], en: 'keep a record', type: 'V+N', priority: 10 },
  { ko: ['연락', '하'], en: 'keep in touch', type: 'V+N', priority: 10 },
  { ko: ['일기', '쓰'], en: 'keep a diary', type: 'V+N', priority: 10 },

  // ========================================
  // break 류
  // ========================================
  { ko: ['법', '어기'], en: 'break the law', type: 'V+N', priority: 10 },
  { ko: ['규칙', '어기'], en: 'break the rules', type: 'V+N', priority: 10 },
  { ko: ['기록', '깨'], en: 'break a record', type: 'V+N', priority: 10 },
  { ko: ['침묵', '깨'], en: 'break the silence', type: 'V+N', priority: 10 },

  // ========================================
  // 날씨/자연 현상 (N+V)
  // ========================================
  { ko: ['비', '오'], en: 'rain falls', type: 'N+V', priority: 10 },
  { ko: ['비', '내리'], en: 'rain falls', type: 'N+V', priority: 10 },
  { ko: ['눈', '오'], en: 'snow falls', type: 'N+V', priority: 10 },
  { ko: ['눈', '내리'], en: 'snow falls', type: 'N+V', priority: 10 },
  { ko: ['바람', '불'], en: 'wind blows', type: 'N+V', priority: 10 },
  { ko: ['해', '뜨'], en: 'sun rises', type: 'N+V', priority: 10 },
  { ko: ['해', '지'], en: 'sun sets', type: 'N+V', priority: 10 },
  { ko: ['달', '뜨'], en: 'moon rises', type: 'N+V', priority: 10 },
  { ko: ['천둥', '치'], en: 'thunder rumbles', type: 'N+V', priority: 10 },
  { ko: ['번개', '치'], en: 'lightning strikes', type: 'N+V', priority: 10 },
  { ko: ['안개', '끼'], en: 'fog sets in', type: 'N+V', priority: 10 },
  { ko: ['구름', '끼'], en: 'clouds gather', type: 'N+V', priority: 10 },
  { ko: ['꽃', '피'], en: 'flowers bloom', type: 'N+V', priority: 10 },
  { ko: ['잎', '지'], en: 'leaves fall', type: 'N+V', priority: 10 },

  // ========================================
  // 형용사 + 명사 (ADJ+N)
  // ========================================
  { ko: ['심한', '비'], en: 'heavy rain', type: 'ADJ+N', priority: 10 },
  { ko: ['폭우'], en: 'heavy rain', type: 'ADJ+N', priority: 10 },
  { ko: ['강한', '바람'], en: 'strong wind', type: 'ADJ+N', priority: 10 },
  { ko: ['빠른', '속도'], en: 'high speed', type: 'ADJ+N', priority: 10 },
  { ko: ['깊은', '잠'], en: 'deep sleep', type: 'ADJ+N', priority: 10 },
  { ko: ['높은', '온도'], en: 'high temperature', type: 'ADJ+N', priority: 10 },
  { ko: ['높은', '열'], en: 'high fever', type: 'ADJ+N', priority: 10 },
  { ko: ['고열'], en: 'high fever', type: 'ADJ+N', priority: 10 },
  { ko: ['심각한', '문제'], en: 'serious problem', type: 'ADJ+N', priority: 10 },
  { ko: ['큰', '실수'], en: 'big mistake', type: 'ADJ+N', priority: 10 },
  { ko: ['작은', '실수'], en: 'minor mistake', type: 'ADJ+N', priority: 10 },
  { ko: ['좋은', '기회'], en: 'good opportunity', type: 'ADJ+N', priority: 10 },
  { ko: ['나쁜', '습관'], en: 'bad habit', type: 'ADJ+N', priority: 10 },
  { ko: ['좋은', '소식'], en: 'good news', type: 'ADJ+N', priority: 10 },
  { ko: ['나쁜', '소식'], en: 'bad news', type: 'ADJ+N', priority: 10 },
  { ko: ['급한', '일'], en: 'urgent matter', type: 'ADJ+N', priority: 10 },
  { ko: ['중요한', '결정'], en: 'important decision', type: 'ADJ+N', priority: 10 },
  { ko: ['밝은', '미래'], en: 'bright future', type: 'ADJ+N', priority: 10 },
  { ko: ['어두운', '밤'], en: 'dark night', type: 'ADJ+N', priority: 10 },
  { ko: ['긴', '여행'], en: 'long journey', type: 'ADJ+N', priority: 10 },
  { ko: ['짧은', '시간'], en: 'short time', type: 'ADJ+N', priority: 10 },
  { ko: ['오랜', '시간'], en: 'long time', type: 'ADJ+N', priority: 10 },
  { ko: ['많은', '사람'], en: 'many people', type: 'ADJ+N', priority: 10 },
  { ko: ['적은', '돈'], en: 'little money', type: 'ADJ+N', priority: 10 },
  { ko: ['많은', '돈'], en: 'a lot of money', type: 'ADJ+N', priority: 10 },

  // ========================================
  // 기타 중요 연어
  // ========================================
  { ko: ['답', '찾'], en: 'find an answer', type: 'V+N', priority: 10 },
  { ko: ['해결책', '찾'], en: 'find a solution', type: 'V+N', priority: 10 },
  { ko: ['직업', '찾'], en: 'find a job', type: 'V+N', priority: 10 },
  { ko: ['길', '잃'], en: "lose one's way", type: 'V+N', priority: 10 },
  { ko: ['시간', '낭비하'], en: 'waste time', type: 'V+N', priority: 10 },
  { ko: ['돈', '낭비하'], en: 'waste money', type: 'V+N', priority: 10 },
  { ko: ['시간', '보내'], en: 'spend time', type: 'V+N', priority: 10 },
  { ko: ['돈', '쓰'], en: 'spend money', type: 'V+N', priority: 10 },
  { ko: ['돈', '모으'], en: 'save money', type: 'V+N', priority: 10 },
  { ko: ['시간', '절약하'], en: 'save time', type: 'V+N', priority: 10 },
  { ko: ['질문', '하'], en: 'ask a question', type: 'V+N', priority: 10 },
  { ko: ['부탁', '하'], en: 'make a request', type: 'V+N', priority: 10 },
  { ko: ['메모', '하'], en: 'take notes', type: 'V+N', priority: 10 },
  { ko: ['필기', '하'], en: 'take notes', type: 'V+N', priority: 10 },
  { ko: ['결론', '내리'], en: 'reach a conclusion', type: 'V+N', priority: 10 },
  { ko: ['합의', '하'], en: 'reach an agreement', type: 'V+N', priority: 10 },
  { ko: ['계획', '세우'], en: 'make a plan', type: 'V+N', priority: 10 },
  { ko: ['목표', '세우'], en: 'set a goal', type: 'V+N', priority: 10 },
  { ko: ['목표', '달성하'], en: 'achieve a goal', type: 'V+N', priority: 10 },
  { ko: ['문제', '해결하'], en: 'solve a problem', type: 'V+N', priority: 10 },
  { ko: ['문제', '풀'], en: 'solve a problem', type: 'V+N', priority: 10 },
  { ko: ['관계', '맺'], en: 'form a relationship', type: 'V+N', priority: 10 },
  { ko: ['성공', '거두'], en: 'achieve success', type: 'V+N', priority: 10 },
  { ko: ['인기', '얻'], en: 'gain popularity', type: 'V+N', priority: 10 },
  { ko: ['경험', '쌓'], en: 'gain experience', type: 'V+N', priority: 10 },
  { ko: ['실력', '쌓'], en: 'build skills', type: 'V+N', priority: 10 },
  { ko: ['습관', '들이'], en: 'form a habit', type: 'V+N', priority: 10 },
  { ko: ['습관', '고치'], en: 'break a habit', type: 'V+N', priority: 10 },

  // ========================================
  // 감정/상태 표현
  // ========================================
  { ko: ['화', '내'], en: 'get angry', type: 'V+N', priority: 10 },
  { ko: ['화', '나'], en: 'get angry', type: 'N+V', priority: 10 },
  { ko: ['짜증', '나'], en: 'get annoyed', type: 'N+V', priority: 10 },
  { ko: ['기분', '좋'], en: 'feel good', type: 'N+V', priority: 10 },
  { ko: ['기분', '나쁘'], en: 'feel bad', type: 'N+V', priority: 10 },
  { ko: ['걱정', '되'], en: 'get worried', type: 'N+V', priority: 10 },
  { ko: ['걱정', '하'], en: 'worry', type: 'V+N', priority: 9 },
  { ko: ['긴장', '하'], en: 'get nervous', type: 'V+N', priority: 10 },
  { ko: ['긴장', '되'], en: 'get nervous', type: 'N+V', priority: 10 },
  { ko: ['기대', '되'], en: 'look forward to', type: 'N+V', priority: 10 },
  { ko: ['기대', '하'], en: 'expect', type: 'V+N', priority: 9 },
  { ko: ['후회', '하'], en: 'regret', type: 'V+N', priority: 10 },
  { ko: ['실망', '하'], en: 'get disappointed', type: 'V+N', priority: 10 },
  { ko: ['만족', '하'], en: 'be satisfied', type: 'V+N', priority: 10 },

  // ========================================
  // 교통/이동
  // ========================================
  { ko: ['길', '건너'], en: 'cross the street', type: 'V+N', priority: 10 },
  { ko: ['길', '물어보'], en: 'ask for directions', type: 'V+N', priority: 10 },
  { ko: ['길', '알려주'], en: 'give directions', type: 'V+N', priority: 10 },
  { ko: ['차', '세우'], en: 'stop the car', type: 'V+N', priority: 10 },
  { ko: ['차', '주차하'], en: 'park the car', type: 'V+N', priority: 10 },
  { ko: ['비행기', '타'], en: 'take a flight', type: 'V+N', priority: 10 },
  { ko: ['기차', '타'], en: 'take a train', type: 'V+N', priority: 10 },
  { ko: ['버스', '놓치'], en: 'miss the bus', type: 'V+N', priority: 10 },
  { ko: ['비행기', '놓치'], en: 'miss the flight', type: 'V+N', priority: 10 },
];

/**
 * 첫 단어 기준 인덱스 (빠른 조회용)
 */
export const collocationIndex = new Map<string, Collocation[]>();

// 인덱스 초기화
for (const c of collocations) {
  const key = c.ko[0];
  if (!key) continue;
  if (!collocationIndex.has(key)) {
    collocationIndex.set(key, []);
  }
  collocationIndex.get(key)?.push(c);
}

// 우선순위로 정렬
for (const [, list] of collocationIndex) {
  list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

/**
 * 연어 후보 조회
 */
export function getCollocationCandidates(firstWord: string): Collocation[] {
  return collocationIndex.get(firstWord) || [];
}
