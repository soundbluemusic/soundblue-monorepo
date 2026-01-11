/**
 * 한글 맞춤법 규칙 모듈
 * 국립국어원 한글 맞춤법 (문화체육관광부고시 제2017-12호) 기반
 *
 * 출처: https://korean.go.kr/kornorms/regltn/regltnView.do
 *       https://www.law.go.kr/행정규칙/한글맞춤법
 *
 * 제5장 띄어쓰기 (제41항~제50항) 구현
 */

// ============================================
// 제41항: 조사는 그 앞말에 붙여 쓴다
// ============================================

/** 한국어 조사 목록 (긴 것부터 매칭) */
export const PARTICLES = [
  // 복합 조사 (3글자 이상)
  '에서부터',
  '으로부터',
  '에게서는',
  '한테서는',
  '으로서는',
  '으로써는',
  '에서는',
  '으로는',
  '에게는',
  '한테는',
  '으로서',
  '으로써',
  '에서도',
  '으로도',
  '이라고',
  '이라는',
  '이라면',
  '이라도',
  '이야말로',
  // 2글자 조사
  '에서',
  '에게',
  '한테',
  '으로',
  '부터',
  '까지',
  '처럼',
  '보다',
  '만큼', // 체언 뒤 조사 (관형사형 뒤는 의존명사)
  '대로', // 체언 뒤 조사 (관형사형 뒤는 의존명사)
  '마다',
  '조차',
  '밖에',
  '라고',
  '라는',
  '라면',
  '이라',
  '이나',
  '이란',
  '이며',
  '이고',
  '이든',
  '이요',
  '이야',
  '와는',
  '과는',
  '로서',
  '로써',
  '로는',
  '로도',
  '에는',
  '에도',
  '에만',
  // 1글자 조사
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '에',
  '의',
  '와',
  '과',
  '로',
  '도',
  '만',
  '나',
  '랑',
  '야',
  '요',
  '며',
  '고',
  '든',
] as const;

// ============================================
// 제42항: 의존 명사는 띄어 쓴다
// ============================================

/** 의존명사 목록 (관형사형 뒤에서 띄어 쓰기) */
export const DEPENDENT_NOUNS = {
  // 보편성 의존명사 (여러 문장성분으로 사용)
  general: ['것', '데', '바', '따위', '줄', '뿐', '이', '분', '터'],

  // 주어성 의존명사 (주로 주어로 사용)
  subject: ['지', '수', '리', '나위', '법', '노릇'],

  // 서술성 의존명사 (서술어로 사용, '-이다' 결합)
  predicate: ['때문', '나름', '따름', '뿐', '터', '셈', '탓', '덕'],

  // 시간 관련 의존명사
  time: ['만', '동안', '사이', '무렵', '즈음', '적', '때'],

  // 단위성 의존명사
  unit: ['개', '명', '마리', '대', '권', '장', '병', '잔', '벌', '채', '켤레', '쌍'],

  // 기타 의존명사
  other: ['양', '체', '척', '듯', '대로', '만큼', '뻔', '성', '품'],
} as const;

/** 의존명사 전체 목록 (평탄화) */
export const ALL_DEPENDENT_NOUNS = [
  ...DEPENDENT_NOUNS.general,
  ...DEPENDENT_NOUNS.subject,
  ...DEPENDENT_NOUNS.predicate,
  ...DEPENDENT_NOUNS.time,
  ...DEPENDENT_NOUNS.unit,
  ...DEPENDENT_NOUNS.other,
];

/** 조사/의존명사 구분이 필요한 동형이의어 */
export const AMBIGUOUS_FORMS: Record<
  string,
  {
    asParticle: string; // 조사로 쓰일 때 (붙여쓰기)
    asNoun: string; // 의존명사로 쓰일 때 (띄어쓰기)
  }
> = {
  뿐: {
    asParticle: '체언 뒤: 남자뿐이다, 셋뿐이다',
    asNoun: '관형사형 뒤: 웃을 뿐이다, 만졌을 뿐이다',
  },
  대로: {
    asParticle: '체언 뒤: 법대로, 약속대로',
    asNoun: '관형사형 뒤: 아는 대로, 약속한 대로',
  },
  만큼: {
    asParticle: '체언 뒤: 고등학생만큼',
    asNoun: '관형사형 뒤: 볼 만큼, 애쓴 만큼',
  },
  만: {
    asParticle: '한정/비교: 하나만, 그것만',
    asNoun: '시간 경과: 사흘 만에, 한 달 만에',
  },
  지: {
    asParticle: '어미 일부: 큰지 작은지 (-ㄴ지)',
    asNoun: '시간 경과: 떠난 지, 온 지',
  },
};

// ============================================
// 제43항: 단위를 나타내는 명사는 띄어 쓴다
// (다만, 순서를 나타내는 경우나 숫자와 어울리어
//  쓰이는 경우에는 붙여 쓸 수 있다)
// ============================================

/** 단위명사 목록 */
export const UNIT_NOUNS = {
  // 수량 단위
  quantity: [
    '개',
    '명',
    '마리',
    '대',
    '권',
    '장',
    '병',
    '잔',
    '벌',
    '채',
    '켤레',
    '쌍',
    '그루',
    '송이',
    '알',
    '톨',
    '자루',
    '척',
    '필',
    '포기',
    '줄',
    '살',
  ],

  // 시간 단위
  time: ['년', '월', '일', '시', '분', '초', '주', '개월', '세기', '학기', '학년', '주년', '주일'],

  // 도량형 단위
  measurement: [
    '미터',
    '킬로미터',
    '센티미터',
    '밀리미터',
    '그램',
    '킬로그램',
    '리터',
    '밀리리터',
    '제곱미터',
    '평',
    '평방미터',
  ],

  // 화폐 단위
  currency: ['원', '달러', '엔', '위안', '유로', '파운드'],

  // 순서/서수
  ordinal: ['번', '번째', '호', '등', '위', '차', '회', '기', '판', '쪽', '면'],
} as const;

/** 단위명사 전체 목록 */
export const ALL_UNIT_NOUNS = [
  ...UNIT_NOUNS.quantity,
  ...UNIT_NOUNS.time,
  ...UNIT_NOUNS.measurement,
  ...UNIT_NOUNS.currency,
  ...UNIT_NOUNS.ordinal,
];

// ============================================
// 제44항: 수를 적을 때에는 '만(萬)' 단위로 띄어 쓴다
// ============================================

/** 수 단위 */
export const NUMBER_UNITS = {
  small: ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '백', '천'],
  large: ['만', '억', '조', '경'],
};

// ============================================
// 제45항: 두 말을 이어 주거나 열거할 적에 쓰이는
// 다음의 말들은 띄어 쓴다
// ============================================

/** 접속/열거 표현 (띄어 쓰기) */
export const CONNECTIVE_WORDS = [
  // 접속 부사
  '그러나',
  '그런데',
  '그러면',
  '그리고',
  '그래서',
  '그러므로',
  '따라서',
  '하지만',
  '그렇지만',
  '그러니까',
  '왜냐하면',
  // 열거 표현
  '및',
  '또는',
  '혹은',
  '내지',
  // 이어주는 말
  '즉',
  '곧',
  '다시 말해',
  '바꿔 말하면',
];

// ============================================
// 제46항: 단음절로 된 단어가 연이어 나타날 적에는
// 붙여 쓸 수 있다
// ============================================

/** 단음절 단어 연속 붙여쓰기 허용 패턴 */
export const MONOSYLLABLE_PATTERNS = [
  // 예: 좀 더, 이 곳, 그 것
  // 붙여 쓸 수 있음: 좀더, 이곳, 그것
];

// ============================================
// 제47항: 보조 용언은 띄어 씀을 원칙으로 하되,
// 경우에 따라 붙여 씀도 허용한다
// ============================================

/** 보조용언 목록 */
export const AUXILIARY_VERBS = {
  // -아/어 + 보조용언
  eo: [
    '가다', // 먹어 가다 / 먹어가다
    '오다', // 읽어 오다 / 읽어오다
    '내다', // 해 내다 / 해내다
    '놓다', // 써 놓다 / 써놓다
    '두다', // 알아 두다 / 알아두다
    '대다', // 먹어 대다 / 먹어대다
    '버리다', // 잊어 버리다 / 잊어버리다
    '보다', // 먹어 보다 / 먹어보다
    '주다', // 도와 주다 / 도와주다
    '드리다', // 도와 드리다 / 도와드리다
    '치우다', // 던져 치우다
    '빠지다', // 빠져 빠지다
  ],

  // -고 + 보조용언
  go: [
    '있다', // 먹고 있다
    '싶다', // 가고 싶다
    '말다', // 하고 말다
    '나다', // 하고 나다
  ],

  // -게 + 보조용언
  ge: [
    '하다', // 먹게 하다
    '되다', // 알게 되다
  ],

  // -지 + 보조용언
  ji: [
    '않다', // 먹지 않다
    '못하다', // 가지 못하다
    '말다', // 먹지 말다
  ],
} as const;

/** 보조용언 전체 목록 */
export const ALL_AUXILIARY_VERBS = [
  ...AUXILIARY_VERBS.eo,
  ...AUXILIARY_VERBS.go,
  ...AUXILIARY_VERBS.ge,
  ...AUXILIARY_VERBS.ji,
];

// ============================================
// 제48항: 성과 이름, 성과 호 등은 붙여 쓰고,
// 이에 덧붙는 호칭어, 관직명 등은 띄어 쓴다
// ============================================

/** 한국 성씨 목록 */
export const KOREAN_SURNAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
  '장',
  '임',
  '한',
  '오',
  '서',
  '신',
  '권',
  '황',
  '안',
  '송',
  '류',
  '유',
  '전',
  '홍',
  '고',
  '문',
  '양',
  '손',
  '배',
  '백',
  '허',
  '남',
  '심',
  '노',
  '하',
  '곽',
  '성',
  '차',
  '주',
  '우',
  '구',
  '민',
  '나',
  '진',
  '지',
  '엄',
  '채',
  '원',
  '천',
  '방',
  '공',
  '현',
];

/** 호칭어/직함 (띄어 쓰기) */
export const HONORIFICS = [
  '씨',
  '님',
  '군',
  '양',
  '선생',
  '선생님',
  '교수',
  '교수님',
  '박사',
  '박사님',
  '사장',
  '사장님',
  '회장',
  '회장님',
  '대표',
  '대표님',
  '부장',
  '부장님',
  '과장',
  '과장님',
  '대리',
  '대리님',
  '사원',
];

// ============================================
// 제49항: 성명 이외의 고유 명사는 단어별로
// 띄어 씀을 원칙으로 하되, 단위별로 띄어 쓸 수 있다
// ============================================

/** 고유명사 처리 규칙 */
export const PROPER_NOUN_RULES = {
  // 지명: 단어별 띄어쓰기
  places: '대한민국 → 대한 민국 (허용)',
  // 기관명: 단위별 띄어쓰기 가능
  organizations: '한국방송공사 → 한국 방송 공사 (허용)',
};

// ============================================
// 제50항: 전문 용어는 단어별로 띄어 씀을 원칙으로 하되,
// 붙여 쓸 수 있다
// ============================================

/** 전문용어 처리 규칙 */
export const TECHNICAL_TERM_RULES = {
  examples: ['만성골수성백혈병 / 만성 골수성 백혈병', '중거리탄도유도탄 / 중거리 탄도 유도탄'],
};

// ============================================
// 띄어쓰기 검사 및 교정 함수
// ============================================

/**
 * 조사인지 확인
 */
export function isParticle(word: string): boolean {
  return PARTICLES.includes(word as (typeof PARTICLES)[number]);
}

/**
 * 의존명사인지 확인
 */
export function isDependentNoun(word: string): boolean {
  return (ALL_DEPENDENT_NOUNS as readonly string[]).includes(word);
}

/**
 * 단위명사인지 확인
 */
export function isUnitNoun(word: string): boolean {
  return (ALL_UNIT_NOUNS as readonly string[]).includes(word);
}

/**
 * 보조용언인지 확인
 */
export function isAuxiliaryVerb(word: string): boolean {
  return (ALL_AUXILIARY_VERBS as readonly string[]).includes(word);
}

/**
 * 관형사형 어미인지 확인 (의존명사 앞에 올 수 있는 형태)
 * -ㄴ, -은, -는, -ㄹ, -을, -던 등
 */
export function isAdnominalEnding(word: string): boolean {
  if (!word) return false;

  const lastChar = word.slice(-1);

  // 완성형 한글 (은, 는, 던, 을)
  const completeEndings = ['은', '는', '던', '을'];
  if (completeEndings.includes(lastChar)) {
    return true;
  }

  // 종성 확인: ㄴ 또는 ㄹ로 끝나는지
  // 한글 유니코드: (초성 * 21 + 중성) * 28 + 종성 + 0xAC00
  const code = lastChar.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jongseong = (code - 0xac00) % 28;
    // 종성 인덱스: 0=없음, 4=ㄴ, 8=ㄹ
    return jongseong === 4 || jongseong === 8; // ㄴ(4) 또는 ㄹ(8)
  }

  return false;
}

/**
 * 의존명사/조사 구분 (문맥 기반)
 * 관형사형 어미 뒤 → 의존명사 (띄어쓰기)
 * 체언 뒤 → 조사 (붙여쓰기)
 */
export function classifyAmbiguousForm(
  form: string,
  precedingWord: string,
): 'dependent_noun' | 'particle' | 'unknown' {
  if (!AMBIGUOUS_FORMS[form]) {
    return 'unknown';
  }

  // 관형사형 어미로 끝나면 의존명사
  const lastChar = precedingWord.slice(-1);
  if (isAdnominalEnding(lastChar)) {
    return 'dependent_noun';
  }

  // 그 외는 조사로 추정
  return 'particle';
}

/**
 * 띄어쓰기 교정 (제41항~제50항 적용)
 */
export function correctSpacing(text: string): string {
  let result = text;

  // 1. 조사 붙여쓰기 교정 (제41항)
  // 주의: 조사는 독립적인 단어로 띄어져 있을 때만 붙임
  // "학교 에 가다" → "학교에 가다" (에 뒤에 공백이 있으므로 붙임)
  // "가다"의 "가"는 조사가 아니므로 건드리지 않음
  for (const particle of PARTICLES) {
    // "단어 조사 " → "단어조사 " (조사 뒤에 공백 또는 문장 끝이어야 함)
    const pattern = new RegExp(`([가-힣])\\s+(${particle})(?=\\s|$)`, 'g');
    result = result.replace(pattern, '$1$2');
  }

  // 2. 의존명사 띄어쓰기 교정 (제42항)
  // 관형사형 어미(ㄴ, ㄹ, 은, 는, 을, 던) + 의존명사는 띄어쓰기
  // "할수" → "할 수", "먹을것" → "먹을 것"
  // 단, 호칭어가 바로 뒤에 오면 분리하지 않음 (예: 김철수씨)
  const honorificPattern = HONORIFICS.join('|');
  for (const noun of ALL_DEPENDENT_NOUNS) {
    // 한글 음절 + 의존명사 패턴 (호칭어가 바로 뒤에 오면 제외)
    const pattern = new RegExp(`([가-힣])${noun}(?!(?:${honorificPattern}))(?=\\s|$|[가-힣])`, 'g');
    result = result.replace(pattern, (match, precedingChar: string) => {
      // 선행 음절이 관형사형 어미로 끝나면 띄어쓰기
      if (isAdnominalEnding(precedingChar)) {
        return `${precedingChar} ${noun}`;
      }
      return match;
    });
  }

  // 3. 호칭어 띄어쓰기 교정 (제48항)
  for (const honorific of HONORIFICS) {
    // "김철수씨" → "김철수 씨"
    const pattern = new RegExp(`([가-힣]{2,})${honorific}(?=[\\s]|$)`, 'g');
    result = result.replace(pattern, `$1 ${honorific}`);
  }

  return result;
}

/**
 * 띄어쓰기 검증 (올바른지 확인)
 */
export function validateSpacing(text: string): {
  isValid: boolean;
  errors: Array<{ position: number; message: string; rule: string }>;
} {
  const errors: Array<{ position: number; message: string; rule: string }> = [];

  // 조사 앞 띄어쓰기 오류 검사
  for (const particle of PARTICLES) {
    const pattern = new RegExp(`([가-힣])\\s+(${particle})(?=[\\s가-힣]|$)`, 'g');
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      errors.push({
        position: match.index ?? 0,
        message: `"${match[1]} ${particle}" → "${match[1]}${particle}" (조사는 붙여 씁니다)`,
        rule: '제41항',
      });
    }
  }

  // 의존명사 띄어쓰기 오류 검사
  for (const noun of DEPENDENT_NOUNS.general) {
    // 관형사형 + 의존명사가 붙어있는 경우
    const pattern = new RegExp(`([ㄴ은는ㄹ을던])${noun}(?=[\\s가-힣]|$)`, 'g');
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      errors.push({
        position: match.index ?? 0,
        message: `"${match[0]}" → "${match[1]} ${noun}" (의존명사는 띄어 씁니다)`,
        rule: '제42항',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 숫자 + 단위명사 띄어쓰기 (제43항)
 * 원칙: 띄어 쓴다 (삼 미터)
 * 허용: 붙여 쓸 수 있다 (3미터)
 */
export function formatNumberWithUnit(
  number: string | number,
  unit: string,
  style: 'spaced' | 'attached' = 'attached',
): string {
  if (style === 'spaced') {
    return `${number} ${unit}`;
  }
  return `${number}${unit}`;
}

/**
 * 큰 수 만 단위 띄어쓰기 (제44항)
 * 예: 12억 3456만 7890
 */
export function formatLargeNumber(num: number): string {
  if (num < 10000) {
    return num.toString();
  }

  const 억 = Math.floor(num / 100000000);
  const 만 = Math.floor((num % 100000000) / 10000);
  const 나머지 = num % 10000;

  const parts: string[] = [];
  if (억 > 0) parts.push(`${억}억`);
  if (만 > 0) parts.push(`${만}만`);
  if (나머지 > 0) parts.push(나머지.toString());

  return parts.join(' ');
}

/**
 * 이름 + 호칭 띄어쓰기 (제48항)
 * 예: 김철수 씨, 박영희 선생님
 */
export function formatNameWithHonorific(name: string, honorific: string): string {
  return `${name} ${honorific}`;
}

// ============================================
// 형태에 관한 규칙 (제14항~제40항) - 주요 규칙
// ============================================

/** 사이시옷 규칙 (제30항) */
export const SIOT_RULES = {
  description:
    '사이시옷은 두 개의 형태소 또는 단어가 결합할 때, ' +
    '앞말이 모음으로 끝나고 뒷말이 된소리로 발음되면 표기',
  examples: ['나무 + 가지 → 나뭇가지', '고기 + 배 → 곳간', '바다 + 가 → 바닷가'],
};

/** 두음법칙 (제10항~제12항) */
export const INITIAL_LAW: Record<string, string> = {
  // ㄴ → ㅇ (녀, 뇨, 뉴, 니)
  녀: '여',
  뇨: '요',
  뉴: '유',
  니: '이',
  // ㄹ → ㅇ (랴, 려, 례, 료, 류, 리)
  랴: '야',
  려: '여',
  례: '예',
  료: '요',
  류: '유',
  리: '이',
  // ㄹ → ㄴ (라, 래, 로, 뢰, 루, 르)
  라: '나',
  래: '내',
  로: '노',
  뢰: '뇌',
  루: '누',
  르: '느',
  // 추가: 량 → 양 등
  량: '양',
  력: '역',
  련: '연',
  렬: '열',
  렴: '염',
  렵: '엽',
  령: '영',
  륜: '윤',
  률: '율',
  륭: '융',
};

/**
 * 두음법칙 적용
 */
export function applyInitialLaw(word: string): string {
  if (!word) return word;

  const firstChar = word[0];
  if (INITIAL_LAW[firstChar as keyof typeof INITIAL_LAW]) {
    return INITIAL_LAW[firstChar as keyof typeof INITIAL_LAW] + word.slice(1);
  }
  return word;
}

// ============================================
// 번역기 통합용 함수
// ============================================

/**
 * 한국어 텍스트 띄어쓰기 정규화
 * 번역 전/후 처리에 사용
 */
export function normalizeKoreanSpacing(text: string): string {
  let result = text;

  // 1. 조사 붙여쓰기 교정
  result = correctSpacing(result);

  // 2. 연속 공백 제거
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * 번역 결과 한국어 띄어쓰기 후처리
 * 조사가 띄어져 있으면 붙여쓰기로 교정
 */
export function postProcessKoreanSpacing(text: string): string {
  let result = text;

  // 긴 조사부터 처리 (이미 정렬되어 있음)
  for (const particle of PARTICLES) {
    // "단어 조사" → "단어조사"
    // 조사 뒤에 공백, 문장끝, 구두점, 또는 다른 한글이 올 수 있음
    const pattern = new RegExp(`([가-힣])\\s+(${particle})(?=\\s|$|[.,!?가-힣])`, 'g');
    result = result.replace(pattern, '$1$2');
  }

  return result;
}

export default {
  // 상수
  PARTICLES,
  DEPENDENT_NOUNS,
  ALL_DEPENDENT_NOUNS,
  UNIT_NOUNS,
  ALL_UNIT_NOUNS,
  AUXILIARY_VERBS,
  ALL_AUXILIARY_VERBS,
  KOREAN_SURNAMES,
  HONORIFICS,
  CONNECTIVE_WORDS,
  NUMBER_UNITS,
  AMBIGUOUS_FORMS,

  // 검사 함수
  isParticle,
  isDependentNoun,
  isUnitNoun,
  isAuxiliaryVerb,
  classifyAmbiguousForm,

  // 교정 함수
  correctSpacing,
  validateSpacing,
  formatNumberWithUnit,
  formatLargeNumber,
  formatNameWithHonorific,
  applyInitialLaw,

  // 통합 함수
  normalizeKoreanSpacing,
  postProcessKoreanSpacing,
};
