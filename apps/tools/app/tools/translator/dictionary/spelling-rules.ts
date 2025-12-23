// ========================================
// English Spelling Rules - 영어 철자 변화 규칙
// ========================================

export interface SpellingRule {
  name: string;
  description: string;
  pattern: RegExp;
  examples: string[];
  apply: (word: string, suffix: string) => string;
}

// ========================================
// 1. Y to I/IES Rule (y → i 변화)
// ========================================
export const Y_TO_I_RULE: SpellingRule = {
  name: 'y_to_i',
  description: '자음 + y → i (단, -ing 제외)',
  pattern: /[^aeiou]y$/,
  examples: [
    'happy → happier, happiest, happiness',
    'study → studied, studies (단, studying)',
    'carry → carried, carries (단, carrying)',
  ],
  apply: (word: string, suffix: string) => {
    // -ing는 y 유지
    if (suffix === 'ing') {
      return word + suffix;
    }
    // 자음 + y → i
    if (/[^aeiou]y$/.test(word)) {
      return word.slice(0, -1) + 'i' + suffix;
    }
    return word + suffix;
  },
};

// ========================================
// 2. Drop E Rule (e 제거)
// ========================================
export const DROP_E_RULE: SpellingRule = {
  name: 'drop_e',
  description: '모음 접미사 앞에서 e 제거',
  pattern: /[^aeiou]e$/,
  examples: [
    'love → loving, loved, lovable',
    'make → making, maker',
    'hope → hoping, hoped',
    'write → writing, writer',
  ],
  apply: (word: string, suffix: string) => {
    // 모음으로 시작하는 접미사 (-ing, -ed, -er, -est, -able, -ible, -y)
    const vowelSuffixes = /^(ing|ed|er|est|able|ible|y|ous|ive|al)/;
    if (vowelSuffixes.test(suffix) && /[^aeiou]e$/.test(word)) {
      // 예외: ee, oe, ye로 끝나는 경우 e 유지
      if (/(ee|oe|ye)$/.test(word)) {
        return word + suffix;
      }
      return word.slice(0, -1) + suffix;
    }
    return word + suffix;
  },
};

// ========================================
// 3. Double Consonant Rule (자음 중복)
// ========================================
export const DOUBLE_CONSONANT_RULE: SpellingRule = {
  name: 'double_consonant',
  description: '단모음 + 단자음 → 자음 중복',
  pattern: /^[^aeiou]*[aeiou][^aeiouwxy]$/,
  examples: [
    'stop → stopping, stopped',
    'plan → planning, planned',
    'big → bigger, biggest',
    'run → running, runner',
  ],
  apply: (word: string, suffix: string) => {
    // 모음으로 시작하는 접미사만
    if (!/^[aeiou]/.test(suffix)) {
      return word + suffix;
    }
    // 단모음 + 단자음 패턴
    if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(word)) {
      const lastChar = word[word.length - 1];
      return word + lastChar + suffix;
    }
    return word + suffix;
  },
};

// ========================================
// 4. Change F to V Rule (f → v)
// ========================================
export const F_TO_V_RULE: SpellingRule = {
  name: 'f_to_v',
  description: 'f/fe로 끝나는 명사 → ves',
  pattern: /f(e)?$/,
  examples: ['half → halves', 'knife → knives', 'leaf → leaves', 'life → lives', 'shelf → shelves'],
  apply: (word: string, suffix: string) => {
    // 복수형 -s만 적용
    if (suffix !== 's' && suffix !== 'es') {
      return word + suffix;
    }
    if (/fe$/.test(word)) {
      return word.slice(0, -2) + 'ves';
    }
    if (/f$/.test(word)) {
      return word.slice(0, -1) + 'ves';
    }
    return word + suffix;
  },
};

// ========================================
// 5. Add ES Rule (es 추가)
// ========================================
export const ADD_ES_RULE: SpellingRule = {
  name: 'add_es',
  description: 's/x/z/ch/sh로 끝나면 -es',
  pattern: /(s|x|z|ch|sh)$/,
  examples: [
    'watch → watches',
    'box → boxes',
    'buzz → buzzes',
    'wish → wishes',
    'class → classes',
    'dish → dishes',
  ],
  apply: (word: string, suffix: string) => {
    // 복수형/3인칭 단수만
    if (suffix !== 's') {
      return word + suffix;
    }
    if (/(s|x|z|ch|sh)$/.test(word)) {
      return word + 'es';
    }
    return word + suffix;
  },
};

// ========================================
// 6. O to OES Rule (o → oes)
// ========================================
export const O_TO_OES_RULE: SpellingRule = {
  name: 'o_to_oes',
  description: '자음 + o → oes',
  pattern: /[^aeiou]o$/,
  examples: [
    'hero → heroes',
    'potato → potatoes',
    'tomato → tomatoes',
    'go → goes',
    '예외: photo → photos, piano → pianos',
  ],
  apply: (word: string, suffix: string) => {
    // 복수형/3인칭 단수만
    if (suffix !== 's') {
      return word + suffix;
    }
    // 예외 단어들 (외래어, 음악 용어 등)
    const exceptions = ['photo', 'piano', 'solo', 'studio', 'video', 'radio', 'zoo'];
    if (exceptions.includes(word)) {
      return word + 's';
    }
    // 자음 + o
    if (/[^aeiou]o$/.test(word)) {
      return word + 'es';
    }
    return word + suffix;
  },
};

// ========================================
// 7. Keep E Rule (e 유지)
// ========================================
export const KEEP_E_RULE: SpellingRule = {
  name: 'keep_e',
  description: 'ce/ge 뒤에서 e 유지',
  pattern: /(ce|ge)$/,
  examples: [
    'notice → noticeable (발음 유지)',
    'change → changeable',
    'courage → courageous',
    'manage → manageable',
  ],
  apply: (word: string, suffix: string) => {
    // -able, -ous 앞에서 e 유지
    if (/(ce|ge)$/.test(word) && /^(able|ous)/.test(suffix)) {
      return word + suffix;
    }
    // 그 외는 일반 규칙 적용
    return word + suffix;
  },
};

// ========================================
// 8. IC to ICAL Rule (ic → ical)
// ========================================
export const IC_TO_ICAL_RULE: SpellingRule = {
  name: 'ic_to_ical',
  description: 'ic로 끝나는 형용사 → ically',
  pattern: /ic$/,
  examples: ['basic → basically', 'magic → magically', 'specific → specifically', 'tragic → tragically'],
  apply: (word: string, suffix: string) => {
    // -ly를 붙일 때
    if (suffix === 'ly' && /ic$/.test(word)) {
      return word + 'ally';
    }
    return word + suffix;
  },
};

// ========================================
// 9. Silent E Before -MENT Rule
// ========================================
export const SILENT_E_BEFORE_MENT_RULE: SpellingRule = {
  name: 'silent_e_before_ment',
  description: '-ment 앞에서 e 유지',
  pattern: /[^aeiou]e$/,
  examples: ['move → movement', 'manage → management', 'engage → engagement', 'arrange → arrangement'],
  apply: (word: string, suffix: string) => {
    // -ment, -ness, -ful, -less는 e 유지
    const keepESuffixes = /^(ment|ness|ful|less)$/;
    if (keepESuffixes.test(suffix) && /[^aeiou]e$/.test(word)) {
      return word + suffix;
    }
    return word + suffix;
  },
};

// ========================================
// 10. LE to LY Rule (le → ly)
// ========================================
export const LE_TO_LY_RULE: SpellingRule = {
  name: 'le_to_ly',
  description: 'le로 끝나면 e 제거 후 y',
  pattern: /le$/,
  examples: ['possible → possibly', 'terrible → terribly', 'gentle → gently', 'simple → simply'],
  apply: (word: string, suffix: string) => {
    if (suffix === 'ly' && /le$/.test(word)) {
      return word.slice(0, -1) + 'y';
    }
    return word + suffix;
  },
};

// ========================================
// 통합 규칙 목록
// ========================================
export const SPELLING_RULES: SpellingRule[] = [
  Y_TO_I_RULE,
  DROP_E_RULE,
  DOUBLE_CONSONANT_RULE,
  F_TO_V_RULE,
  ADD_ES_RULE,
  O_TO_OES_RULE,
  KEEP_E_RULE,
  IC_TO_ICAL_RULE,
  SILENT_E_BEFORE_MENT_RULE,
  LE_TO_LY_RULE,
];

// ========================================
// 규칙 맵 (이름으로 접근)
// ========================================
export const SPELLING_RULES_BY_NAME: Record<string, SpellingRule> = {
  y_to_i: Y_TO_I_RULE,
  drop_e: DROP_E_RULE,
  double_consonant: DOUBLE_CONSONANT_RULE,
  f_to_v: F_TO_V_RULE,
  add_es: ADD_ES_RULE,
  o_to_oes: O_TO_OES_RULE,
  keep_e: KEEP_E_RULE,
  ic_to_ical: IC_TO_ICAL_RULE,
  silent_e_before_ment: SILENT_E_BEFORE_MENT_RULE,
  le_to_ly: LE_TO_LY_RULE,
};

// ========================================
// Helper Functions
// ========================================

/**
 * 단어와 접미사를 받아 올바른 철자를 반환
 */
export function applySuffix(word: string, suffix: string): string {
  // 우선순위: 특정 규칙 → 일반 규칙

  // 1. ic + ly → ically
  if (suffix === 'ly' && IC_TO_ICAL_RULE.pattern.test(word)) {
    return IC_TO_ICAL_RULE.apply(word, suffix);
  }

  // 2. le + ly → ly
  if (suffix === 'ly' && LE_TO_LY_RULE.pattern.test(word)) {
    return LE_TO_LY_RULE.apply(word, suffix);
  }

  // 3. y → i (단, -ing 제외)
  if (suffix !== 'ing' && Y_TO_I_RULE.pattern.test(word)) {
    return Y_TO_I_RULE.apply(word, suffix);
  }

  // 4. 자음 중복
  if (DOUBLE_CONSONANT_RULE.pattern.test(word)) {
    return DOUBLE_CONSONANT_RULE.apply(word, suffix);
  }

  // 5. e 제거 (단, ce/ge + able/ous, -ment/-ness/-ful/-less 제외)
  if (DROP_E_RULE.pattern.test(word)) {
    // ce/ge + able/ous는 e 유지
    if (KEEP_E_RULE.pattern.test(word) && /^(able|ous)/.test(suffix)) {
      return KEEP_E_RULE.apply(word, suffix);
    }
    // -ment/-ness/-ful/-less는 e 유지
    if (/^(ment|ness|ful|less)$/.test(suffix)) {
      return SILENT_E_BEFORE_MENT_RULE.apply(word, suffix);
    }
    return DROP_E_RULE.apply(word, suffix);
  }

  // 6. f/fe → ves
  if (suffix === 's' && F_TO_V_RULE.pattern.test(word)) {
    return F_TO_V_RULE.apply(word, suffix);
  }

  // 7. 자음 + o → oes
  if (suffix === 's' && O_TO_OES_RULE.pattern.test(word)) {
    return O_TO_OES_RULE.apply(word, suffix);
  }

  // 8. s/x/z/ch/sh → es
  if (suffix === 's' && ADD_ES_RULE.pattern.test(word)) {
    return ADD_ES_RULE.apply(word, suffix);
  }

  // 기본: 그대로 붙이기
  return word + suffix;
}

/**
 * 해당 단어에 적용되는 모든 규칙 찾기
 */
export function findMatchingRules(word: string): SpellingRule[] {
  return SPELLING_RULES.filter((rule) => rule.pattern.test(word));
}

/**
 * 규칙 이름으로 규칙 가져오기
 */
export function getRule(name: string): SpellingRule | null {
  return SPELLING_RULES_BY_NAME[name] || null;
}

/**
 * 모든 규칙 개수 반환
 */
export function getRuleCount(): number {
  return SPELLING_RULES.length;
}

/**
 * 단어 + 접미사 예시 생성
 */
export function generateExamples(word: string, suffixes: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const suffix of suffixes) {
    result[suffix] = applySuffix(word, suffix);
  }
  return result;
}

/**
 * 철자 규칙 테스트
 */
export function testRule(word: string, suffix: string, expected: string): boolean {
  const result = applySuffix(word, suffix);
  return result === expected;
}
