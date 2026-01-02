/**
 * 영어 대명사 격변화 사전
 *
 * 격 유형:
 * - subjective: 주격 (I, he, she)
 * - objective: 목적격 (me, him, her)
 * - possessiveAdj: 소유 형용사 (my, his, her)
 * - possessivePron: 소유 대명사 (mine, his, hers)
 * - reflexive: 재귀 대명사 (myself, himself, herself)
 */

export type PronounCase =
  | 'subjective'
  | 'objective'
  | 'possessiveAdj'
  | 'possessivePron'
  | 'reflexive';

export interface PronounDeclension {
  subjective: string;
  objective: string;
  possessiveAdj: string;
  possessivePron: string;
  reflexive: string;
  korean: {
    subjective: string[]; // 나는, 내가
    objective: string[]; // 나를, 나에게
    possessiveAdj: string[]; // 나의, 내
    possessivePron: string[]; // 내 것
    reflexive: string[]; // 나 자신
  };
}

// ============================================
// 인칭대명사 (Personal Pronouns)
// ============================================

/** 1인칭 단수 */
export const PRONOUN_1S: PronounDeclension = {
  subjective: 'i',
  objective: 'me',
  possessiveAdj: 'my',
  possessivePron: 'mine',
  reflexive: 'myself',
  korean: {
    subjective: ['나는', '내가', '제가', '저는'],
    objective: ['나를', '나에게', '저를', '저에게'],
    possessiveAdj: ['나의', '내', '저의', '제'],
    possessivePron: ['내 것', '제 것'],
    reflexive: ['나 자신', '나 스스로', '저 자신'],
  },
};

/** 1인칭 복수 */
export const PRONOUN_1P: PronounDeclension = {
  subjective: 'we',
  objective: 'us',
  possessiveAdj: 'our',
  possessivePron: 'ours',
  reflexive: 'ourselves',
  korean: {
    subjective: ['우리는', '우리가', '저희는', '저희가'],
    objective: ['우리를', '우리에게', '저희를', '저희에게'],
    possessiveAdj: ['우리의', '우리', '저희의', '저희'],
    possessivePron: ['우리 것', '저희 것'],
    reflexive: ['우리 자신', '저희 자신'],
  },
};

/** 2인칭 단수 */
export const PRONOUN_2S: PronounDeclension = {
  subjective: 'you',
  objective: 'you',
  possessiveAdj: 'your',
  possessivePron: 'yours',
  reflexive: 'yourself',
  korean: {
    subjective: ['너는', '네가', '당신은', '당신이'],
    objective: ['너를', '너에게', '당신을', '당신에게'],
    possessiveAdj: ['너의', '네', '당신의'],
    possessivePron: ['네 것', '당신 것'],
    reflexive: ['너 자신', '당신 자신'],
  },
};

/** 2인칭 복수 */
export const PRONOUN_2P: PronounDeclension = {
  subjective: 'you',
  objective: 'you',
  possessiveAdj: 'your',
  possessivePron: 'yours',
  reflexive: 'yourselves',
  korean: {
    subjective: ['너희는', '너희가', '여러분은', '여러분이'],
    objective: ['너희를', '너희에게', '여러분을', '여러분에게'],
    possessiveAdj: ['너희의', '너희', '여러분의'],
    possessivePron: ['너희 것', '여러분 것'],
    reflexive: ['너희 자신', '여러분 자신'],
  },
};

/** 3인칭 단수 남성 */
export const PRONOUN_3SM: PronounDeclension = {
  subjective: 'he',
  objective: 'him',
  possessiveAdj: 'his',
  possessivePron: 'his',
  reflexive: 'himself',
  korean: {
    subjective: ['그는', '그가'],
    objective: ['그를', '그에게'],
    possessiveAdj: ['그의'],
    possessivePron: ['그의 것'],
    reflexive: ['그 자신'],
  },
};

/** 3인칭 단수 여성 */
export const PRONOUN_3SF: PronounDeclension = {
  subjective: 'she',
  objective: 'her',
  possessiveAdj: 'her',
  possessivePron: 'hers',
  reflexive: 'herself',
  korean: {
    subjective: ['그녀는', '그녀가'],
    objective: ['그녀를', '그녀에게'],
    possessiveAdj: ['그녀의'],
    possessivePron: ['그녀의 것'],
    reflexive: ['그녀 자신'],
  },
};

/** 3인칭 단수 중성 */
export const PRONOUN_3SN: PronounDeclension = {
  subjective: 'it',
  objective: 'it',
  possessiveAdj: 'its',
  possessivePron: '', // it은 소유대명사 없음
  reflexive: 'itself',
  korean: {
    subjective: ['그것은', '그것이'],
    objective: ['그것을'],
    possessiveAdj: ['그것의'],
    possessivePron: [],
    reflexive: ['그것 자체'],
  },
};

/** 3인칭 복수 */
export const PRONOUN_3P: PronounDeclension = {
  subjective: 'they',
  objective: 'them',
  possessiveAdj: 'their',
  possessivePron: 'theirs',
  reflexive: 'themselves',
  korean: {
    subjective: ['그들은', '그들이', '그것들은', '그것들이'],
    objective: ['그들을', '그들에게', '그것들을'],
    possessiveAdj: ['그들의', '그것들의'],
    possessivePron: ['그들의 것', '그것들의 것'],
    reflexive: ['그들 자신', '그것들 자체'],
  },
};

// ============================================
// 영어 → 한국어 대명사 매핑
// ============================================

/** 영어 대명사 → 격 정보 */
export const EN_PRONOUN_CASE: Record<string, { paradigm: PronounDeclension; case: PronounCase }> = {
  // 1인칭 단수
  i: { paradigm: PRONOUN_1S, case: 'subjective' },
  me: { paradigm: PRONOUN_1S, case: 'objective' },
  my: { paradigm: PRONOUN_1S, case: 'possessiveAdj' },
  mine: { paradigm: PRONOUN_1S, case: 'possessivePron' },
  myself: { paradigm: PRONOUN_1S, case: 'reflexive' },

  // 1인칭 복수
  we: { paradigm: PRONOUN_1P, case: 'subjective' },
  us: { paradigm: PRONOUN_1P, case: 'objective' },
  our: { paradigm: PRONOUN_1P, case: 'possessiveAdj' },
  ours: { paradigm: PRONOUN_1P, case: 'possessivePron' },
  ourselves: { paradigm: PRONOUN_1P, case: 'reflexive' },

  // 2인칭 (단수/복수 동일)
  you: { paradigm: PRONOUN_2S, case: 'subjective' }, // 문맥에 따라 목적격일 수도
  your: { paradigm: PRONOUN_2S, case: 'possessiveAdj' },
  yours: { paradigm: PRONOUN_2S, case: 'possessivePron' },
  yourself: { paradigm: PRONOUN_2S, case: 'reflexive' },
  yourselves: { paradigm: PRONOUN_2P, case: 'reflexive' },

  // 3인칭 단수 남성
  he: { paradigm: PRONOUN_3SM, case: 'subjective' },
  him: { paradigm: PRONOUN_3SM, case: 'objective' },
  his: { paradigm: PRONOUN_3SM, case: 'possessiveAdj' }, // 소유격/소유대명사 동일
  himself: { paradigm: PRONOUN_3SM, case: 'reflexive' },

  // 3인칭 단수 여성
  she: { paradigm: PRONOUN_3SF, case: 'subjective' },
  her: { paradigm: PRONOUN_3SF, case: 'objective' }, // 목적격/소유격 동일
  hers: { paradigm: PRONOUN_3SF, case: 'possessivePron' },
  herself: { paradigm: PRONOUN_3SF, case: 'reflexive' },

  // 3인칭 단수 중성
  it: { paradigm: PRONOUN_3SN, case: 'subjective' }, // 주격/목적격 동일
  its: { paradigm: PRONOUN_3SN, case: 'possessiveAdj' },
  itself: { paradigm: PRONOUN_3SN, case: 'reflexive' },

  // 3인칭 복수
  they: { paradigm: PRONOUN_3P, case: 'subjective' },
  them: { paradigm: PRONOUN_3P, case: 'objective' },
  their: { paradigm: PRONOUN_3P, case: 'possessiveAdj' },
  theirs: { paradigm: PRONOUN_3P, case: 'possessivePron' },
  themselves: { paradigm: PRONOUN_3P, case: 'reflexive' },
};

// ============================================
// 의문대명사 / 관계대명사
// ============================================

export interface InterrogativePronoun {
  subjective: string;
  objective: string;
  possessive: string;
  korean: {
    subjective: string[];
    objective: string[];
    possessive: string[];
  };
}

/** 사람을 가리키는 의문/관계 대명사 */
export const INTERROGATIVE_WHO: InterrogativePronoun = {
  subjective: 'who',
  objective: 'whom',
  possessive: 'whose',
  korean: {
    subjective: ['누가', '누구가'],
    objective: ['누구를', '누구에게'],
    possessive: ['누구의'],
  },
};

/** 사물/선택을 가리키는 의문대명사 */
export const INTERROGATIVE_WHAT = {
  subjective: 'what',
  objective: 'what',
  korean: {
    subjective: ['무엇이', '뭐가'],
    objective: ['무엇을', '뭘'],
  },
};

export const INTERROGATIVE_WHICH = {
  subjective: 'which',
  objective: 'which',
  korean: {
    subjective: ['어느 것이', '어떤 것이'],
    objective: ['어느 것을', '어떤 것을'],
  },
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 영어 대명사의 격 정보 조회
 */
export function getPronounCase(
  word: string,
): { paradigm: PronounDeclension; case: PronounCase } | null {
  const lower = word.toLowerCase();
  return EN_PRONOUN_CASE[lower] || null;
}

/**
 * 영어 대명사를 한국어로 변환 (격에 맞게)
 *
 * @param word 영어 대명사
 * @param targetCase 목표 격 (생략 시 원래 격 유지)
 * @returns 한국어 대명사 (첫 번째 옵션)
 */
export function translatePronoun(word: string, targetCase?: PronounCase): string | null {
  const info = getPronounCase(word);
  if (!info) return null;

  const caseToUse = targetCase || info.case;
  const koreanOptions = info.paradigm.korean[caseToUse];

  return koreanOptions?.[0] || null;
}

/**
 * 영어 대명사가 주격인지 확인
 */
export function isSubjectivePronoun(word: string): boolean {
  const info = getPronounCase(word);
  return info?.case === 'subjective';
}

/**
 * 영어 대명사가 목적격인지 확인
 */
export function isObjectivePronoun(word: string): boolean {
  const info = getPronounCase(word);
  return info?.case === 'objective';
}

/**
 * 영어 대명사가 소유격인지 확인
 */
export function isPossessivePronoun(word: string): boolean {
  const info = getPronounCase(word);
  return info?.case === 'possessiveAdj' || info?.case === 'possessivePron';
}
