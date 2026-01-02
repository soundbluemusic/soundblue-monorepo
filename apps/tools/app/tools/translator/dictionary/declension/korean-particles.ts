/**
 * 한국어 조사 사전 (격변화)
 *
 * 조사 유형:
 * - 격조사: 문법적 관계 표시 (이/가, 을/를, 의 등)
 * - 보조사: 의미 추가 (은/는, 도, 만 등)
 * - 접속조사: 연결 (와/과, 하고, 랑 등)
 *
 * 참조: docs/declension-en-ko-complete.md
 */

// ============================================
// 조사 유형 정의
// ============================================

export type ParticleCategory =
  | 'nominative' // 주격
  | 'topic' // 주제 (보조사)
  | 'accusative' // 목적격
  | 'genitive' // 소유격
  | 'dative' // 여격 (대상)
  | 'ablative' // 탈격 (출처)
  | 'locative' // 처격 (위치)
  | 'instrumental' // 도구격
  | 'comitative' // 공동격 (동반)
  | 'comparative' // 비교격
  | 'vocative' // 호격
  | 'quotative' // 인용
  | 'delimiter' // 한정 보조사
  | 'auxiliary'; // 기타 보조사

export interface ParticleInfo {
  particle: string;
  category: ParticleCategory;
  condition:
    | 'batchim'
    | 'no-batchim'
    | 'any'
    | 'l-batchim'
    | 'honorific'
    | 'colloquial'
    | 'literary';
  english: string[]; // 대응하는 영어 전치사/표현
  example: {
    korean: string;
    english: string;
  };
}

// ============================================
// 1. 주격 조사 (Nominative/Subjective Case)
// ============================================

export const NOMINATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '이',
    category: 'nominative',
    condition: 'batchim',
    english: ['(subject)'],
    example: { korean: '책이 있다', english: 'The book exists' },
  },
  {
    particle: '가',
    category: 'nominative',
    condition: 'no-batchim',
    english: ['(subject)'],
    example: { korean: '사과가 있다', english: 'The apple exists' },
  },
  {
    particle: '께서',
    category: 'nominative',
    condition: 'honorific',
    english: ['(subject, honorific)'],
    example: { korean: '선생님께서 오셨다', english: 'The teacher came (hon.)' },
  },
  {
    particle: '에서',
    category: 'nominative',
    condition: 'any', // 단체 주어
    english: ['(subject, organization)'],
    example: { korean: '학교에서 발표했다', english: 'The school announced' },
  },
];

// ============================================
// 2. 주제 보조사 (Topic Marker)
// ============================================

export const TOPIC_PARTICLES: ParticleInfo[] = [
  {
    particle: '은',
    category: 'topic',
    condition: 'batchim',
    english: ['as for', 'regarding'],
    example: { korean: '책은 재미있다', english: 'As for the book, it is interesting' },
  },
  {
    particle: '는',
    category: 'topic',
    condition: 'no-batchim',
    english: ['as for', 'regarding'],
    example: { korean: '나는 학생이다', english: 'As for me, I am a student' },
  },
];

// ============================================
// 3. 목적격 조사 (Accusative/Objective Case)
// ============================================

export const ACCUSATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '을',
    category: 'accusative',
    condition: 'batchim',
    english: ['(object)'],
    example: { korean: '밥을 먹다', english: 'eat rice' },
  },
  {
    particle: '를',
    category: 'accusative',
    condition: 'no-batchim',
    english: ['(object)'],
    example: { korean: '사과를 먹다', english: 'eat an apple' },
  },
];

// ============================================
// 4. 소유격 조사 (Genitive/Possessive Case)
// ============================================

export const GENITIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '의',
    category: 'genitive',
    condition: 'any',
    english: ["'s", 'of'],
    example: { korean: '나의 책', english: 'my book' },
  },
];

// ============================================
// 5. 여격 조사 (Dative Case) - 대상
// ============================================

export const DATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '에게',
    category: 'dative',
    condition: 'any', // 문어
    english: ['to', 'for'],
    example: { korean: '친구에게 주다', english: 'give to a friend' },
  },
  {
    particle: '한테',
    category: 'dative',
    condition: 'colloquial',
    english: ['to', 'for'],
    example: { korean: '친구한테 주다', english: 'give to a friend' },
  },
  {
    particle: '께',
    category: 'dative',
    condition: 'honorific',
    english: ['to', 'for (honorific)'],
    example: { korean: '선생님께 드리다', english: 'give to the teacher (hon.)' },
  },
];

// ============================================
// 6. 탈격 조사 (Ablative Case) - 출처/기원
// ============================================

export const ABLATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '에게서',
    category: 'ablative',
    condition: 'any', // 문어
    english: ['from (person)'],
    example: { korean: '친구에게서 받다', english: 'receive from a friend' },
  },
  {
    particle: '한테서',
    category: 'ablative',
    condition: 'colloquial',
    english: ['from (person)'],
    example: { korean: '친구한테서 받다', english: 'receive from a friend' },
  },
  {
    particle: '에서',
    category: 'ablative',
    condition: 'any', // 장소
    english: ['from (place)'],
    example: { korean: '서울에서 오다', english: 'come from Seoul' },
  },
  {
    particle: '부터',
    category: 'ablative',
    condition: 'any',
    english: ['from', 'since'],
    example: { korean: '월요일부터 시작', english: 'start from Monday' },
  },
  {
    particle: '로부터',
    category: 'ablative',
    condition: 'literary',
    english: ['from (formal)'],
    example: { korean: '회사로부터 연락', english: 'contact from the company' },
  },
];

// ============================================
// 7. 처격/위치격 조사 (Locative Case)
// ============================================

export const LOCATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '에',
    category: 'locative',
    condition: 'any',
    english: ['at', 'in', 'on', 'to'],
    example: { korean: '집에 있다', english: 'be at home' },
  },
  {
    particle: '에서',
    category: 'locative',
    condition: 'any', // 동적
    english: ['at', 'in (action)'],
    example: { korean: '학교에서 공부하다', english: 'study at school' },
  },
];

// ============================================
// 8. 도구격/조격 조사 (Instrumental Case)
// ============================================

export const INSTRUMENTAL_PARTICLES: ParticleInfo[] = [
  {
    particle: '로',
    category: 'instrumental',
    condition: 'no-batchim', // 또는 ㄹ 받침
    english: ['by', 'with', 'as', 'to (direction)'],
    example: { korean: '버스로 가다', english: 'go by bus' },
  },
  {
    particle: '으로',
    category: 'instrumental',
    condition: 'batchim', // ㄹ 제외
    english: ['by', 'with', 'as', 'to (direction)'],
    example: { korean: '칼으로 자르다', english: 'cut with a knife' },
  },
];

// ============================================
// 9. 공동격 조사 (Comitative Case) - 동반
// ============================================

export const COMITATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '과',
    category: 'comitative',
    condition: 'batchim',
    english: ['with', 'and'],
    example: { korean: '친구과 가다', english: 'go with a friend' },
  },
  {
    particle: '와',
    category: 'comitative',
    condition: 'no-batchim',
    english: ['with', 'and'],
    example: { korean: '아버지와 가다', english: 'go with father' },
  },
  {
    particle: '하고',
    category: 'comitative',
    condition: 'colloquial',
    english: ['with', 'and'],
    example: { korean: '친구하고 가다', english: 'go with a friend' },
  },
  {
    particle: '이랑',
    category: 'comitative',
    condition: 'batchim', // 구어
    english: ['with', 'and'],
    example: { korean: '동생이랑 가다', english: 'go with younger sibling' },
  },
  {
    particle: '랑',
    category: 'comitative',
    condition: 'no-batchim', // 구어
    english: ['with', 'and'],
    example: { korean: '오빠랑 가다', english: 'go with older brother' },
  },
];

// ============================================
// 10. 비교격 조사 (Comparative Case)
// ============================================

export const COMPARATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '보다',
    category: 'comparative',
    condition: 'any',
    english: ['than'],
    example: { korean: '너보다 크다', english: 'bigger than you' },
  },
];

// ============================================
// 11. 호격 조사 (Vocative Case) - 부름
// ============================================

export const VOCATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '아',
    category: 'vocative',
    condition: 'batchim',
    english: ['(calling)'],
    example: { korean: '철수아!', english: 'Cheolsu!' },
  },
  {
    particle: '야',
    category: 'vocative',
    condition: 'no-batchim',
    english: ['(calling)'],
    example: { korean: '영희야!', english: 'Younghee!' },
  },
  {
    particle: '이여',
    category: 'vocative',
    condition: 'literary',
    english: ['oh (literary)'],
    example: { korean: '대한민국이여', english: 'Oh, Korea' },
  },
  {
    particle: '여',
    category: 'vocative',
    condition: 'literary',
    english: ['oh (literary)'],
    example: { korean: '조국이여', english: 'Oh, motherland' },
  },
];

// ============================================
// 12. 한정 보조사 (Delimiter Particles)
// ============================================

export const DELIMITER_PARTICLES: ParticleInfo[] = [
  {
    particle: '만',
    category: 'delimiter',
    condition: 'any',
    english: ['only', 'just'],
    example: { korean: '너만 알아', english: 'only you know' },
  },
  {
    particle: '뿐',
    category: 'delimiter',
    condition: 'any',
    english: ['only'],
    example: { korean: '너뿐이야', english: "it's only you" },
  },
  {
    particle: '밖에',
    category: 'delimiter',
    condition: 'any', // +부정
    english: ['only (with negation)'],
    example: { korean: '너밖에 없어', english: "there's only you" },
  },
  {
    particle: '까지',
    category: 'delimiter',
    condition: 'any',
    english: ['even', 'until', 'up to'],
    example: { korean: '너까지 그래?', english: 'even you too?' },
  },
  {
    particle: '마저',
    category: 'delimiter',
    condition: 'any',
    english: ['even (last remaining)'],
    example: { korean: '희망마저 사라졌다', english: 'even hope disappeared' },
  },
  {
    particle: '조차',
    category: 'delimiter',
    condition: 'any',
    english: ['even (extreme)'],
    example: { korean: '이름조차 몰라', english: "don't even know the name" },
  },
  {
    particle: '도',
    category: 'delimiter',
    condition: 'any',
    english: ['also', 'too', 'even'],
    example: { korean: '나도 가고 싶어', english: 'I want to go too' },
  },
];

// ============================================
// 13. 기타 보조사 (Auxiliary Particles)
// ============================================

export const AUXILIARY_PARTICLES: ParticleInfo[] = [
  {
    particle: '마다',
    category: 'auxiliary',
    condition: 'any',
    english: ['every', 'each'],
    example: { korean: '날마다 운동하다', english: 'exercise every day' },
  },
  {
    particle: '대로',
    category: 'auxiliary',
    condition: 'any',
    english: ['as', 'according to'],
    example: { korean: '계획대로 하다', english: 'do as planned' },
  },
  {
    particle: '처럼',
    category: 'auxiliary',
    condition: 'any',
    english: ['like', 'as'],
    example: { korean: '바람처럼 빠르다', english: 'fast like the wind' },
  },
  {
    particle: '같이',
    category: 'auxiliary',
    condition: 'any',
    english: ['like', 'together'],
    example: { korean: '천사같이 예쁘다', english: 'pretty like an angel' },
  },
  {
    particle: '만큼',
    category: 'auxiliary',
    condition: 'any',
    english: ['as much as'],
    example: { korean: '너만큼 잘해', english: 'as good as you' },
  },
  {
    particle: '씩',
    category: 'auxiliary',
    condition: 'any',
    english: ['each', 'apiece'],
    example: { korean: '하나씩 가져가', english: 'take one each' },
  },
  {
    particle: '이나',
    category: 'auxiliary',
    condition: 'batchim',
    english: ['or', 'about', 'as many as'],
    example: { korean: '밥이나 먹자', english: 'let us eat or something' },
  },
  {
    particle: '나',
    category: 'auxiliary',
    condition: 'no-batchim',
    english: ['or', 'about', 'as many as'],
    example: { korean: '커피나 마셔', english: 'drink coffee or something' },
  },
  {
    particle: '이라도',
    category: 'auxiliary',
    condition: 'batchim',
    english: ['at least', 'even if'],
    example: { korean: '물이라도 마셔', english: 'at least drink water' },
  },
  {
    particle: '라도',
    category: 'auxiliary',
    condition: 'no-batchim',
    english: ['at least', 'even if'],
    example: { korean: '커피라도 마셔', english: 'at least drink coffee' },
  },
  {
    particle: '이든지',
    category: 'auxiliary',
    condition: 'batchim',
    english: ['any', 'whatever', 'whether'],
    example: { korean: '뭐이든지 괜찮아', english: 'anything is fine' },
  },
  {
    particle: '든지',
    category: 'auxiliary',
    condition: 'no-batchim',
    english: ['any', 'whatever', 'whether'],
    example: { korean: '뭐든지 괜찮아', english: 'anything is fine' },
  },
];

// ============================================
// 14. 인용 조사 (Quotative Particles)
// ============================================

export const QUOTATIVE_PARTICLES: ParticleInfo[] = [
  {
    particle: '이라고',
    category: 'quotative',
    condition: 'batchim',
    english: ['(direct quote)', 'called'],
    example: { korean: '"가자"라고 했다', english: 'said "let\'s go"' },
  },
  {
    particle: '라고',
    category: 'quotative',
    condition: 'no-batchim',
    english: ['(direct quote)', 'called'],
    example: { korean: '"와"라고 했다', english: 'said "wow"' },
  },
  {
    particle: '고',
    category: 'quotative',
    condition: 'any',
    english: ['(indirect quote)'],
    example: { korean: '간다고 했다', english: 'said (they) will go' },
  },
  {
    particle: '냐고',
    category: 'quotative',
    condition: 'any',
    english: ['(question quote)'],
    example: { korean: '뭐냐고 물었다', english: 'asked what it was' },
  },
];

// ============================================
// 전체 조사 목록
// ============================================

export const ALL_PARTICLES: ParticleInfo[] = [
  ...NOMINATIVE_PARTICLES,
  ...TOPIC_PARTICLES,
  ...ACCUSATIVE_PARTICLES,
  ...GENITIVE_PARTICLES,
  ...DATIVE_PARTICLES,
  ...ABLATIVE_PARTICLES,
  ...LOCATIVE_PARTICLES,
  ...INSTRUMENTAL_PARTICLES,
  ...COMITATIVE_PARTICLES,
  ...COMPARATIVE_PARTICLES,
  ...VOCATIVE_PARTICLES,
  ...DELIMITER_PARTICLES,
  ...AUXILIARY_PARTICLES,
  ...QUOTATIVE_PARTICLES,
];

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 조사 정보 조회
 */
export function getParticleInfo(particle: string): ParticleInfo | null {
  return ALL_PARTICLES.find((p) => p.particle === particle) || null;
}

/**
 * 카테고리별 조사 조회
 */
export function getParticlesByCategory(category: ParticleCategory): ParticleInfo[] {
  return ALL_PARTICLES.filter((p) => p.category === category);
}

/**
 * 영어 전치사로 한국어 조사 찾기
 */
export function findParticleByEnglish(english: string): ParticleInfo[] {
  const lower = english.toLowerCase();
  return ALL_PARTICLES.filter((p) => p.english.some((e) => e.toLowerCase().includes(lower)));
}

/**
 * 받침 유무에 따른 올바른 조사 선택
 *
 * @param stem 어간 (받침 확인용)
 * @param category 조사 카테고리
 * @returns 적절한 조사
 */
export function selectParticle(stem: string, category: ParticleCategory): string {
  const particles = getParticlesByCategory(category);
  if (particles.length === 0) return '';

  // 마지막 글자의 받침 확인
  const lastChar = stem[stem.length - 1];
  if (!lastChar) return particles[0].particle;

  const code = lastChar.charCodeAt(0);

  // 한글 범위 확인
  if (code < 0xac00 || code > 0xd7a3) {
    // 한글이 아니면 기본값
    return particles[0].particle;
  }

  const hasBatchim = (code - 0xac00) % 28 !== 0;
  const hasLBatchim = (code - 0xac00) % 28 === 8; // ㄹ 받침

  // 받침 조건에 맞는 조사 찾기
  for (const p of particles) {
    if (p.condition === 'any') return p.particle;
    if (p.condition === 'batchim' && hasBatchim && !hasLBatchim) return p.particle;
    if (p.condition === 'no-batchim' && !hasBatchim) return p.particle;
    if (p.condition === 'l-batchim' && hasLBatchim) return p.particle;
    // ㄹ 받침은 '로'를 사용 (으로가 아님)
    if (category === 'instrumental' && hasLBatchim) {
      return '로';
    }
  }

  // 기본값
  return particles[0].particle;
}

/**
 * 한국어 격을 영어 전치사로 변환
 */
export function getEnglishPreposition(category: ParticleCategory): string {
  switch (category) {
    case 'nominative':
    case 'topic':
      return ''; // 주격은 전치사 없음
    case 'accusative':
      return ''; // 목적격은 전치사 없음
    case 'genitive':
      return 'of';
    case 'dative':
      return 'to';
    case 'ablative':
      return 'from';
    case 'locative':
      return 'at';
    case 'instrumental':
      return 'with';
    case 'comitative':
      return 'with';
    case 'comparative':
      return 'than';
    case 'vocative':
      return '';
    default:
      return '';
  }
}
