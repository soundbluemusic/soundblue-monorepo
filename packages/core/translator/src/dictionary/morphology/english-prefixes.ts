// ========================================
// English Prefixes - 영어 접두사 (카테고리별 분류)
// ========================================

export interface PrefixInfo {
  prefix: string;
  ko: string; // Korean equivalent
  meaning: string;
  category: PrefixCategory;
}

export type PrefixCategory =
  | 'negation' // 부정
  | 'time' // 시간
  | 'degree' // 정도
  | 'position' // 위치/방향
  | 'together' // 함께/공동
  | 'size' // 크기
  | 'quantity' // 수량
  | 'quality' // 속성/특성
  | 'other'; // 기타

// ========================================
// 1. 부정 접두사 (Negation) - 13개
// ========================================
export const NEGATION_PREFIXES: PrefixInfo[] = [
  { prefix: 'un', ko: '불', meaning: 'not', category: 'negation' },
  { prefix: 'in', ko: '불', meaning: 'not', category: 'negation' },
  { prefix: 'im', ko: '불', meaning: 'not (before m/p)', category: 'negation' },
  { prefix: 'il', ko: '불', meaning: 'not (before l)', category: 'negation' },
  { prefix: 'ir', ko: '불', meaning: 'not (before r)', category: 'negation' },
  { prefix: 'dis', ko: '불', meaning: 'not/opposite', category: 'negation' },
  { prefix: 'non', ko: '무', meaning: 'not', category: 'negation' },
  { prefix: 'a', ko: '무', meaning: 'without', category: 'negation' },
  { prefix: 'an', ko: '무', meaning: 'without (before vowel)', category: 'negation' },
  { prefix: 'anti', ko: '반', meaning: 'against', category: 'negation' },
  { prefix: 'de', ko: '탈', meaning: 'reverse/remove', category: 'negation' },
  { prefix: 'counter', ko: '반', meaning: 'against', category: 'negation' },
  { prefix: 'contra', ko: '반', meaning: 'against', category: 'negation' },
];

// ========================================
// 2. 시간 접두사 (Time) - 7개
// ========================================
export const TIME_PREFIXES: PrefixInfo[] = [
  { prefix: 're', ko: '재', meaning: 'again', category: 'time' },
  { prefix: 'pre', ko: '사전', meaning: 'before', category: 'time' },
  { prefix: 'post', ko: '사후', meaning: 'after', category: 'time' },
  { prefix: 'ante', ko: '선', meaning: 'before', category: 'time' },
  { prefix: 'retro', ko: '후', meaning: 'backward', category: 'time' },
  { prefix: 'fore', ko: '전방', meaning: 'before/front', category: 'time' },
  { prefix: 'pro', ko: '전', meaning: 'forward/before', category: 'time' },
];

// ========================================
// 3. 정도 접두사 (Degree) - 10개
// ========================================
export const DEGREE_PREFIXES: PrefixInfo[] = [
  { prefix: 'over', ko: '과', meaning: 'too much', category: 'degree' },
  { prefix: 'under', ko: '미', meaning: 'too little', category: 'degree' },
  { prefix: 'super', ko: '초', meaning: 'above/beyond', category: 'degree' },
  { prefix: 'hyper', ko: '초', meaning: 'over/excessive', category: 'degree' },
  { prefix: 'hypo', ko: '저', meaning: 'under/below', category: 'degree' },
  { prefix: 'ultra', ko: '극', meaning: 'beyond', category: 'degree' },
  { prefix: 'extra', ko: '외', meaning: 'beyond/outside', category: 'degree' },
  { prefix: 'out', ko: '초과', meaning: 'beyond/exceed', category: 'degree' },
  { prefix: 'arch', ko: '수석', meaning: 'chief/principal', category: 'degree' },
  { prefix: 'sur', ko: '초', meaning: 'over/above', category: 'degree' },
];

// ========================================
// 4. 위치/방향 접두사 (Position/Direction) - 12개
// ========================================
export const POSITION_PREFIXES: PrefixInfo[] = [
  { prefix: 'sub', ko: '하위', meaning: 'under/below', category: 'position' },
  { prefix: 'inter', ko: '상호', meaning: 'between', category: 'position' },
  { prefix: 'intra', ko: '내', meaning: 'within', category: 'position' },
  { prefix: 'trans', ko: '횡단', meaning: 'across', category: 'position' },
  { prefix: 'ex', ko: '외', meaning: 'out/former', category: 'position' },
  { prefix: 'en', ko: '화', meaning: 'make/put in', category: 'position' },
  { prefix: 'em', ko: '화', meaning: 'make/put in (before m/p)', category: 'position' },
  { prefix: 'mid', ko: '중간', meaning: 'middle', category: 'position' },
  { prefix: 'meta', ko: '초', meaning: 'beyond/after', category: 'position' },
  { prefix: 'circum', ko: '주변', meaning: 'around', category: 'position' },
  { prefix: 'peri', ko: '주위', meaning: 'around', category: 'position' },
  { prefix: 'para', ko: '부', meaning: 'beside/beyond', category: 'position' },
];

// ========================================
// 5. 함께/공동 접두사 (Together/Joint) - 6개
// ========================================
export const TOGETHER_PREFIXES: PrefixInfo[] = [
  { prefix: 'co', ko: '공', meaning: 'with/together', category: 'together' },
  { prefix: 'con', ko: '공', meaning: 'with/together', category: 'together' },
  { prefix: 'com', ko: '공', meaning: 'with/together (before m/p)', category: 'together' },
  { prefix: 'col', ko: '공', meaning: 'with/together (before l)', category: 'together' },
  { prefix: 'syn', ko: '공', meaning: 'together', category: 'together' },
  { prefix: 'sym', ko: '공', meaning: 'together (before m/p)', category: 'together' },
];

// ========================================
// 6. 크기 접두사 (Size) - 7개
// ========================================
export const SIZE_PREFIXES: PrefixInfo[] = [
  { prefix: 'semi', ko: '반', meaning: 'half', category: 'size' },
  { prefix: 'hemi', ko: '반', meaning: 'half', category: 'size' },
  { prefix: 'macro', ko: '거대', meaning: 'large', category: 'size' },
  { prefix: 'micro', ko: '미세', meaning: 'small', category: 'size' },
  { prefix: 'mega', ko: '메가', meaning: 'million/large', category: 'size' },
  { prefix: 'mini', ko: '미니', meaning: 'small', category: 'size' },
  { prefix: 'maxi', ko: '최대', meaning: 'maximum', category: 'size' },
];

// ========================================
// 7. 수량 접두사 (Quantity) - 9개
// ========================================
export const QUANTITY_PREFIXES: PrefixInfo[] = [
  { prefix: 'multi', ko: '다', meaning: 'many', category: 'quantity' },
  { prefix: 'poly', ko: '다', meaning: 'many', category: 'quantity' },
  { prefix: 'mono', ko: '단', meaning: 'one', category: 'quantity' },
  { prefix: 'uni', ko: '단일', meaning: 'one', category: 'quantity' },
  { prefix: 'bi', ko: '이중', meaning: 'two', category: 'quantity' },
  { prefix: 'di', ko: '이중', meaning: 'two', category: 'quantity' },
  { prefix: 'tri', ko: '삼', meaning: 'three', category: 'quantity' },
  { prefix: 'quad', ko: '사', meaning: 'four', category: 'quantity' },
  { prefix: 'penta', ko: '오', meaning: 'five', category: 'quantity' },
];

// ========================================
// 8. 속성/특성 접두사 (Quality) - 8개
// ========================================
export const QUALITY_PREFIXES: PrefixInfo[] = [
  { prefix: 'auto', ko: '자동', meaning: 'self', category: 'quality' },
  { prefix: 'bio', ko: '생명', meaning: 'life', category: 'quality' },
  { prefix: 'geo', ko: '지구', meaning: 'earth', category: 'quality' },
  { prefix: 'tele', ko: '원격', meaning: 'distant', category: 'quality' },
  { prefix: 'photo', ko: '빛', meaning: 'light', category: 'quality' },
  { prefix: 'neo', ko: '신', meaning: 'new', category: 'quality' },
  { prefix: 'paleo', ko: '고', meaning: 'old/ancient', category: 'quality' },
  { prefix: 'pseudo', ko: '가짜', meaning: 'false', category: 'quality' },
];

// ========================================
// 9. 기타 접두사 (Other) - 3개
// ========================================
export const OTHER_PREFIXES: PrefixInfo[] = [
  { prefix: 'mis', ko: '오', meaning: 'wrong', category: 'other' },
  { prefix: 'mal', ko: '악', meaning: 'bad', category: 'other' },
  { prefix: 'bene', ko: '선', meaning: 'good', category: 'other' },
];

// ========================================
// 통합 접두사 목록 (Total: 75개)
// ========================================
export const PREFIXES: PrefixInfo[] = [
  ...NEGATION_PREFIXES,
  ...TIME_PREFIXES,
  ...DEGREE_PREFIXES,
  ...POSITION_PREFIXES,
  ...TOGETHER_PREFIXES,
  ...SIZE_PREFIXES,
  ...QUANTITY_PREFIXES,
  ...QUALITY_PREFIXES,
  ...OTHER_PREFIXES,
];

// ========================================
// 카테고리별 접근 맵
// ========================================
export const PREFIXES_BY_CATEGORY: Record<PrefixCategory, PrefixInfo[]> = {
  negation: NEGATION_PREFIXES,
  time: TIME_PREFIXES,
  degree: DEGREE_PREFIXES,
  position: POSITION_PREFIXES,
  together: TOGETHER_PREFIXES,
  size: SIZE_PREFIXES,
  quantity: QUANTITY_PREFIXES,
  quality: QUALITY_PREFIXES,
  other: OTHER_PREFIXES,
};

// ========================================
// Helper Functions
// ========================================

/**
 * 단어에서 접두사 추출
 */
export function extractPrefix(word: string): string | null {
  const lower = word.toLowerCase();

  // 긴 접두사부터 매칭 (greedy)
  const sorted = [...PREFIXES].sort((a, b) => b.prefix.length - a.prefix.length);

  for (const { prefix } of sorted) {
    if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
      // 최소 2글자 어간 필요
      return prefix;
    }
  }

  return null;
}

/**
 * 접두사 정보 가져오기
 */
export function getPrefixInfo(prefix: string): PrefixInfo | null {
  return PREFIXES.find((p) => p.prefix === prefix) || null;
}

/**
 * 접두사 한국어 번역
 */
export function translatePrefix(prefix: string): string {
  const info = getPrefixInfo(prefix);
  return info?.ko || '';
}

/**
 * 카테고리별 접두사 가져오기
 */
export function getPrefixesByCategory(category: PrefixCategory): PrefixInfo[] {
  return PREFIXES_BY_CATEGORY[category] || [];
}

/**
 * 모든 접두사 개수 반환
 */
export function getPrefixCount(): number {
  return PREFIXES.length;
}

/**
 * 카테고리별 접두사 개수 반환
 */
export function getPrefixCountByCategory(): Record<PrefixCategory, number> {
  return {
    negation: NEGATION_PREFIXES.length,
    time: TIME_PREFIXES.length,
    degree: DEGREE_PREFIXES.length,
    position: POSITION_PREFIXES.length,
    together: TOGETHER_PREFIXES.length,
    size: SIZE_PREFIXES.length,
    quantity: QUANTITY_PREFIXES.length,
    quality: QUALITY_PREFIXES.length,
    other: OTHER_PREFIXES.length,
  };
}
