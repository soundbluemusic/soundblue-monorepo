// ========================================
// Spacing Rules - 띄어쓰기 규칙
// 의존명사, 보조용언, 조사 규칙 기반 교정
// 명사-동사 경계 분리 포함
// ========================================

/**
 * 의존명사 정보
 */
interface DependencyNounInfo {
  patterns: RegExp[]; // 앞에 오는 패턴들
  examples: string[];
}

/**
 * 의존명사 목록 (반드시 앞 단어와 띄어쓰기)
 */
export const dependencyNouns: Record<string, DependencyNounInfo> = {
  // 것/거/게 류
  수: {
    patterns: [/[ㄹ을]$/, /할$/, /갈$/, /볼$/, /올$/, /줄$/],
    examples: ['할 수', '갈 수', '볼 수'],
  },
  것: {
    patterns: [/[ㄹ은는]$/, /하는$/, /먹는$/, /가는$/, /할$/, /먹을$/],
    examples: ['하는 것', '할 것', '먹을 것'],
  },
  거: {
    patterns: [/[ㄹ을]$/, /할$/, /갈$/, /먹을$/],
    examples: ['할 거', '갈 거야'],
  },
  게: {
    patterns: [/[ㄹ을]$/, /할$/, /먹을$/],
    examples: ['할 게', '먹을 게'],
  },

  // 때/적 류
  때: {
    patterns: [/[ㄹ을는]$/, /할$/, /갈$/, /했을$/, /왔을$/],
    examples: ['할 때', '갈 때', '먹을 때'],
  },
  적: {
    patterns: [/[ㄴ은]$/, /한$/, /본$/, /간$/],
    examples: ['한 적', '본 적', '간 적'],
  },

  // 줄/리 류
  줄: {
    patterns: [/[ㄹ을는]$/, /할$/, /알$/, /모를$/],
    examples: ['할 줄', '알 줄', '모를 줄'],
  },
  리: {
    patterns: [/[ㄹ을]$/, /할$/, /갈$/],
    examples: ['할 리가', '갈 리가'],
  },

  // 뿐/만큼/대로 류
  뿐: {
    patterns: [/[ㄹ을ㄴ은]$/, /할$/, /한$/],
    examples: ['할 뿐', '한 뿐'],
  },
  만큼: {
    patterns: [/[ㄴ은ㄹ을]$/, /한$/, /할$/],
    examples: ['한 만큼', '할 만큼'],
  },
  대로: {
    patterns: [/[ㄴ는]$/, /하는$/, /가는$/],
    examples: ['하는 대로', '가는 대로'],
  },

  // 데/바/지 류
  데: {
    patterns: [/[ㄴ는]$/, /가는$/, /하는$/, /있는$/],
    examples: ['가는 데', '하는 데'],
  },
  바: {
    patterns: [/[ㄴ은]$/, /아는$/, /한$/],
    examples: ['아는 바', '한 바'],
  },
  지: {
    patterns: [/[ㄴ은]$/, /온$/, /간$/, /한$/],
    examples: ['온 지', '간 지', '한 지'],
  },
};

/**
 * 보조용언 패턴 (본용언 + 보조용언)
 */
export const auxiliaryVerbPatterns: {
  pattern: RegExp;
  replacement: string;
}[] = [
  // -고 있다
  { pattern: /고있다/g, replacement: '고 있다' },
  { pattern: /고있는/g, replacement: '고 있는' },
  { pattern: /고있어/g, replacement: '고 있어' },
  { pattern: /고있었/g, replacement: '고 있었' },
  { pattern: /고있으면/g, replacement: '고 있으면' },

  // -고 싶다
  { pattern: /고싶다/g, replacement: '고 싶다' },
  { pattern: /고싶어/g, replacement: '고 싶어' },
  { pattern: /고싶은/g, replacement: '고 싶은' },
  { pattern: /고싶었/g, replacement: '고 싶었' },
  { pattern: /고싶으면/g, replacement: '고 싶으면' },

  // -지 않다/못하다
  { pattern: /지않다/g, replacement: '지 않다' },
  { pattern: /지않는/g, replacement: '지 않는' },
  { pattern: /지않아/g, replacement: '지 않아' },
  { pattern: /지않았/g, replacement: '지 않았' },
  { pattern: /지않으면/g, replacement: '지 않으면' },
  { pattern: /지못하/g, replacement: '지 못하' },
  { pattern: /지못해/g, replacement: '지 못해' },
  { pattern: /지못했/g, replacement: '지 못했' },

  // -아/어 보다
  { pattern: /([아어])보다/g, replacement: '$1 보다' },
  { pattern: /([아어])봐/g, replacement: '$1 봐' },
  { pattern: /([아어])봤/g, replacement: '$1 봤' },

  // -아/어 주다
  { pattern: /([아어])주다/g, replacement: '$1 주다' },
  { pattern: /([아어])줘/g, replacement: '$1 줘' },
  { pattern: /([아어])줬/g, replacement: '$1 줬' },

  // -아/어 버리다
  { pattern: /([아어])버리/g, replacement: '$1 버리' },
  { pattern: /([아어])버렸/g, replacement: '$1 버렸' },

  // -야 하다/되다
  { pattern: /([아어]야)하다/g, replacement: '$1 하다' },
  { pattern: /([아어]야)한다/g, replacement: '$1 한다' },
  { pattern: /([아어]야)해/g, replacement: '$1 해' },
  { pattern: /([아어]야)했/g, replacement: '$1 했' },
  { pattern: /([아어]야)되/g, replacement: '$1 되' },
  { pattern: /([아어]야)돼/g, replacement: '$1 돼' },
];

/**
 * 조사 목록 (반드시 앞 단어에 붙여쓰기)
 */
export const particles = [
  // 격조사
  '이',
  '가',
  '을',
  '를',
  '은',
  '는',
  '의',
  '에',
  '에서',
  '로',
  '으로',
  '와',
  '과',
  '랑',
  '이랑',
  '에게',
  '한테',
  '께',
  '에게서',
  '한테서',
  // 보조사
  '도',
  '만',
  '까지',
  '부터',
  '마저',
  '조차',
  '밖에',
  '요',
  '든지',
  '든가',
  '나',
  '이나',
  '처럼',
  '같이',
  '보다',
  '마다',
];

/**
 * 의존명사가 아닌 경우 (제외 패턴)
 * 수록 = ~할수록 (연결어미, 의존명사 아님)
 * 지경 = 할 지경이다 (의존명사지만 특수 처리)
 */
const DEPENDENCY_NOUN_EXCEPTIONS: Record<string, string[]> = {
  수: ['록'], // 수록 (급할수록 → 분리 안함)
  지: ['경'], // 지경이 아닌 경우만 분리
};

/**
 * 의존명사 띄어쓰기 교정
 * "할수" → "할 수"
 */
export function correctDependencyNounSpacing(text: string): string {
  let result = text;

  for (const [noun, info] of Object.entries(dependencyNouns)) {
    const exceptions = DEPENDENCY_NOUN_EXCEPTIONS[noun] || [];

    // 각 패턴에 대해 검사
    for (const pattern of info.patterns) {
      // 붙어있는 패턴 생성: "할수" 형태
      const source = pattern.source.replace('$', '');

      // 제외 패턴이 뒤따르지 않는 경우만 매칭
      // 예: "수" 뒤에 "록"이 오면 분리하지 않음
      let negativeLookahead = '';
      if (exceptions.length > 0) {
        negativeLookahead = `(?![${exceptions.join('')}])`;
      }

      const attachedRegex = new RegExp(`(${source})${noun}${negativeLookahead}`, 'g');

      result = result.replace(attachedRegex, `$1 ${noun}`);
    }
  }

  return result;
}

/**
 * 보조용언 띄어쓰기 교정
 * "하고있다" → "하고 있다"
 */
export function correctAuxiliaryVerbSpacing(text: string): string {
  let result = text;

  for (const { pattern, replacement } of auxiliaryVerbPatterns) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 조사 띄어쓰기 교정 (잘못 띄어진 조사를 붙임)
 * "학교 에" → "학교에"
 */
export function correctParticleSpacing(text: string): string {
  let result = text;

  // 긴 조사부터 처리 (에게서 before 에게 before 에)
  const sortedParticles = [...particles].sort((a, b) => b.length - a.length);

  for (const particle of sortedParticles) {
    // "단어 조사" 패턴을 "단어조사"로
    // 단, 조사 뒤에 공백이나 문장 끝이 와야 함
    const spacedPattern = new RegExp(`(\\S) (${particle})(?=\\s|$|[.!?])`, 'g');
    result = result.replace(spacedPattern, `$1$2`);
  }

  return result;
}

/**
 * 명사-동사 경계 분리 패턴
 * 음식/장소 명사 + 동사 어간 조합
 */
const nounVerbPatterns: { pattern: RegExp; replacement: string }[] = [
  // 음식 + 먹/마시
  {
    pattern: /(김밥|라면|밥|빵|떡|과자|국|찌개|고기|생선|음식|커피|술|맥주|물)(먹|마시)/g,
    replacement: '$1 $2',
  },
  // 장소 + 가/오
  {
    pattern: /(학교|집|회사|병원|시장|공원|역|호텔|도서관|영화관)(가|오|갔|왔|간|온)/g,
    replacement: '$1 $2',
  },
  // 일반 동작
  { pattern: /(공부|운동|일|청소|빨래|요리|쇼핑)(하|했|해)/g, replacement: '$1 $2' },
  // 감정/상태 + 되다/하다
  // 주의: 피곤해, 배고파, 졸려 등 형용사 활용형은 띄어쓰기 없이 사용
  { pattern: /(좋|싫|행복|슬프|기쁘|화나)(하|해|했)/g, replacement: '$1 $2' },
];

/**
 * 명사-동사 경계 띄어쓰기
 * "김밥먹" → "김밥 먹"
 */
export function correctNounVerbSpacing(text: string): string {
  let result = text;
  for (const { pattern, replacement } of nounVerbPatterns) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * 통합 띄어쓰기 교정
 */
export function correctSpacing(text: string): {
  corrected: string;
  confidence: number;
} {
  let result = text;
  let corrections = 0;

  // 0. 명사-동사 경계 분리 (띄어쓰기 없는 문장 처리)
  const afterNounVerb = correctNounVerbSpacing(result);
  if (afterNounVerb !== result) corrections++;
  result = afterNounVerb;

  // 1. 의존명사 규칙 적용
  const afterDep = correctDependencyNounSpacing(result);
  if (afterDep !== result) corrections++;
  result = afterDep;

  // 2. 보조용언 규칙 적용
  const afterAux = correctAuxiliaryVerbSpacing(result);
  if (afterAux !== result) corrections++;
  result = afterAux;

  // 3. 조사 붙여쓰기 규칙 적용
  const afterParticle = correctParticleSpacing(result);
  if (afterParticle !== result) corrections++;
  result = afterParticle;

  // 확신도 계산 (규칙 기반이므로 높음)
  const confidence = corrections > 0 ? 0.9 : 1.0;

  return { corrected: result, confidence };
}
