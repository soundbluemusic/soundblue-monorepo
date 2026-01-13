// ========================================
// English Validator - 영어 문법 검증 및 교정
// 번역 결과물의 문법 오류를 감지하고 자동 교정
// ========================================

/**
 * 검증 결과 타입
 */
export interface ValidationResult {
  /** 교정된 텍스트 */
  corrected: string;
  /** 발견된 오류 목록 */
  errors: ValidationError[];
  /** 교정 적용 여부 */
  wasModified: boolean;
}

/**
 * 검증 오류 타입
 */
export interface ValidationError {
  type: 'article' | 'subject-verb' | 'missing-be' | 'capitalization' | 'spacing' | 'repetition';
  original: string;
  corrected: string;
  position: number;
  message: string;
}

// ========================================
// 상수 정의
// ========================================

/** a를 사용해야 하는 단어들 (발음이 자음으로 시작) */
const A_WORDS = new Set([
  'user',
  'union',
  'unique',
  'unit',
  'university',
  'uniform',
  'united',
  'use',
  'useful',
  'usual',
  'usually',
  'european',
  'one',
  'once',
]);

/** an을 사용해야 하는 단어들 (발음이 모음으로 시작) */
const AN_WORDS = new Set([
  'hour',
  'honest',
  'honor',
  'heir',
  'herb',
  'fbi',
  'html',
  'mba',
  'nba',
  'lcd',
  'led',
  'mri',
  'x-ray',
]);

/** be동사가 필요한 형용사 패턴 */
const ADJECTIVE_PATTERNS =
  /^(happy|sad|angry|tired|hungry|thirsty|beautiful|ugly|tall|short|big|small|fast|slow|hot|cold|warm|cool|good|bad|nice|great|important|difficult|easy|hard|soft|new|old|young|busy|free|ready|sorry|glad|afraid|sure|certain|possible|impossible|necessary|available|different|same|similar|special|general|specific|particular|common|rare|popular|famous|successful|rich|poor|healthy|sick|alive|dead|awake|asleep|alone|together|safe|dangerous|clean|dirty|dry|wet|full|empty|open|closed|bright|dark|loud|quiet|strong|weak|thick|thin|heavy|light|deep|shallow|wide|narrow|long|short|high|low|early|late|near|far|close|distant)$/i;

/** 3인칭 단수 주어 */
const _THIRD_PERSON_SINGULAR = new Set([
  'he',
  'she',
  'it',
  'this',
  'that',
  'everyone',
  'someone',
  'anyone',
  'no one',
  'everybody',
  'somebody',
  'anybody',
  'nobody',
  'everything',
  'something',
  'anything',
  'nothing',
  'each',
  'either',
  'neither',
]);

/** 1인칭/2인칭/복수 주어 */
const _NON_THIRD_SINGULAR = new Set(['i', 'you', 'we', 'they']);

/** be동사 형태 */
const BE_FORMS = {
  i: { present: 'am', past: 'was' },
  you: { present: 'are', past: 'were' },
  we: { present: 'are', past: 'were' },
  they: { present: 'are', past: 'were' },
  he: { present: 'is', past: 'was' },
  she: { present: 'is', past: 'was' },
  it: { present: 'is', past: 'was' },
} as const;

// ========================================
// 메인 검증 함수
// ========================================

/**
 * 영어 문장의 문법을 검증하고 교정
 * @param text 검증할 영어 텍스트
 * @returns 교정된 텍스트와 오류 목록
 */
export function validateEnglish(text: string): ValidationResult {
  const errors: ValidationError[] = [];
  let corrected = text;

  // 1. be동사 누락 검증 (주어-동사 일치보다 먼저 실행해야 함)
  corrected = validateMissingBe(corrected, errors);

  // 2. 주어-동사 일치 검증
  corrected = validateSubjectVerbAgreement(corrected, errors);

  // 3. 관사 a/an 검증
  corrected = validateArticles(corrected, errors);

  // 4. 단어 반복 검증
  corrected = validateRepetition(corrected, errors);

  // 5. 띄어쓰기 검증
  corrected = validateSpacing(corrected, errors);

  // 6. 대문자 검증
  corrected = validateCapitalization(corrected, errors);

  return {
    corrected,
    errors,
    wasModified: corrected !== text,
  };
}

// ========================================
// 개별 검증 함수들
// ========================================

/**
 * 관사 a/an 검증 및 교정
 */
function validateArticles(text: string, errors: ValidationError[]): string {
  let result = text;

  // a + 모음 소리 → an (예외 처리 포함)
  result = result.replace(/\b(a)\s+([a-zA-Z]+)/gi, (match, _article, word, offset) => {
    const wordLower = word.toLowerCase();

    // 예외: a가 맞는 경우 (uni-, use- 등)
    if (A_WORDS.has(wordLower) || /^(uni|use|usual|euro|one)/.test(wordLower)) {
      return match;
    }

    // an이 필요한 경우
    if (AN_WORDS.has(wordLower) || /^[aeiou]/i.test(word)) {
      errors.push({
        type: 'article',
        original: match,
        corrected: `an ${word}`,
        position: offset,
        message: `"a ${word}" should be "an ${word}"`,
      });
      return `an ${word}`;
    }

    return match;
  });

  // an + 자음 소리 → a (예외 처리 포함)
  result = result.replace(/\b(an)\s+([a-zA-Z]+)/gi, (match, _article, word, offset) => {
    const wordLower = word.toLowerCase();

    // 예외: an이 맞는 경우
    if (AN_WORDS.has(wordLower) || /^[aeiou]/i.test(word)) {
      // 단, uni-, use- 등은 a가 맞음
      if (A_WORDS.has(wordLower) || /^(uni|use|usual|euro|one)/.test(wordLower)) {
        errors.push({
          type: 'article',
          original: match,
          corrected: `a ${word}`,
          position: offset,
          message: `"an ${word}" should be "a ${word}"`,
        });
        return `a ${word}`;
      }
      return match;
    }

    // a가 필요한 경우
    errors.push({
      type: 'article',
      original: match,
      corrected: `a ${word}`,
      position: offset,
      message: `"an ${word}" should be "a ${word}"`,
    });
    return `a ${word}`;
  });

  return result;
}

/**
 * 주어-동사 일치 검증 및 교정
 */
function validateSubjectVerbAgreement(text: string, errors: ValidationError[]): string {
  let result = text;

  // 3인칭 단수 주어 + 동사 원형 → 동사에 -s 추가
  // 패턴: He/She/It + 동사원형 (be동사, 조동사, 접속사 제외)
  const thirdSingularPattern =
    /\b(he|she|it)\s+((?!is|was|has|does|goes|am|are|were|been|being|have|had|do|did|will|would|can|could|shall|should|may|might|must|and|or|but|so|yet|for|nor|the|a|an|to|in|on|at|of|with|by|from|as|if|then|than|that|this|these|those|which|who|whom|whose|what|when|where|why|how|not|no|yes)[a-z]+)\b/gi;

  result = result.replace(thirdSingularPattern, (match, subject, verb, offset) => {
    const verbLower = verb.toLowerCase();

    // 형용사는 건너뛰기 (be동사 누락 검증에서 처리됨)
    if (ADJECTIVE_PATTERNS.test(verbLower)) {
      return match;
    }

    // 이미 -s/-es로 끝나면 패스
    if (/[sx]$|es$|ies$/i.test(verb)) {
      return match;
    }

    const conjugated = addThirdPersonS(verb);
    if (conjugated !== verb) {
      errors.push({
        type: 'subject-verb',
        original: match,
        corrected: `${subject} ${conjugated}`,
        position: offset,
        message: `"${subject} ${verb}" should be "${subject} ${conjugated}"`,
      });
      return `${subject} ${conjugated}`;
    }

    return match;
  });

  return result;
}

/**
 * be동사 누락 검증 및 교정
 * "He happy" → "He is happy"
 */
function validateMissingBe(text: string, errors: ValidationError[]): string {
  let result = text;

  // 주어 + 형용사 (be동사 없이)
  const missingBePattern =
    /\b(i|you|we|they|he|she|it)\s+((?!is|am|are|was|were|be|been|being|have|has|had|do|does|did|will|would|can|could|shall|should|may|might|must|not)[a-z]+)\b/gi;

  result = result.replace(missingBePattern, (match, subject, word, offset) => {
    const subjectLower = subject.toLowerCase();
    const wordLower = word.toLowerCase();

    // 형용사인지 확인
    if (!ADJECTIVE_PATTERNS.test(wordLower)) {
      return match;
    }

    // be동사 형태 결정 (현재 시제 기본)
    const beVerb = BE_FORMS[subjectLower as keyof typeof BE_FORMS]?.present || 'is';
    const correctedPhrase = `${subject} ${beVerb} ${word}`;

    errors.push({
      type: 'missing-be',
      original: match,
      corrected: correctedPhrase,
      position: offset,
      message: `Missing "be" verb: "${match}" should be "${correctedPhrase}"`,
    });

    return correctedPhrase;
  });

  return result;
}

/**
 * 단어 반복 검증 및 교정
 * "the the" → "the"
 */
function validateRepetition(text: string, errors: ValidationError[]): string {
  let result = text;

  // 의도적 반복 예외
  const intentionalRepetitions = new Set([
    'very very',
    'really really',
    'so so',
    'had had',
    'that that',
  ]);

  result = result.replace(/\b(\w+)\s+\1\b/gi, (match, word, offset) => {
    if (intentionalRepetitions.has(match.toLowerCase())) {
      return match;
    }

    errors.push({
      type: 'repetition',
      original: match,
      corrected: word,
      position: offset,
      message: `Repeated word: "${match}" should be "${word}"`,
    });

    return word;
  });

  return result;
}

/**
 * 띄어쓰기 검증 및 교정
 */
function validateSpacing(text: string, errors: ValidationError[]): string {
  let result = text;

  // 이중 공백 제거
  result = result.replace(/ {2,}/g, (match, offset) => {
    errors.push({
      type: 'spacing',
      original: match,
      corrected: ' ',
      position: offset,
      message: 'Multiple spaces should be single space',
    });
    return ' ';
  });

  // 문장부호 앞 공백 제거
  result = result.replace(/ +([.!?,;:])/g, (match, punct, offset) => {
    errors.push({
      type: 'spacing',
      original: match,
      corrected: punct,
      position: offset,
      message: `No space before "${punct}"`,
    });
    return punct;
  });

  // 문장부호 뒤 공백 추가 (문장 끝 제외)
  result = result.replace(/([.!?])([A-Za-z])/g, (match, punct, letter, offset) => {
    errors.push({
      type: 'spacing',
      original: match,
      corrected: `${punct} ${letter.toUpperCase()}`,
      position: offset,
      message: `Space needed after "${punct}"`,
    });
    return `${punct} ${letter.toUpperCase()}`;
  });

  return result;
}

/**
 * 대문자 검증 및 교정
 */
function validateCapitalization(text: string, errors: ValidationError[]): string {
  let result = text;

  // 문장 첫 글자 대문자
  if (result.length > 0 && /^[a-z]/.test(result)) {
    const corrected = result.charAt(0).toUpperCase() + result.slice(1);
    errors.push({
      type: 'capitalization',
      original: result.charAt(0),
      corrected: result.charAt(0).toUpperCase(),
      position: 0,
      message: 'Sentence should start with capital letter',
    });
    result = corrected;
  }

  // 문장 부호 후 첫 글자 대문자
  result = result.replace(/([.!?]\s+)([a-z])/g, (_match, punct, letter, offset) => {
    errors.push({
      type: 'capitalization',
      original: letter,
      corrected: letter.toUpperCase(),
      position: offset + punct.length,
      message: 'First letter after sentence should be capitalized',
    });
    return punct + letter.toUpperCase();
  });

  // I는 항상 대문자
  result = result.replace(/\bi\b/g, (match, offset) => {
    if (match === 'i') {
      errors.push({
        type: 'capitalization',
        original: 'i',
        corrected: 'I',
        position: offset,
        message: '"i" should be "I"',
      });
      return 'I';
    }
    return match;
  });

  return result;
}

// ========================================
// 헬퍼 함수
// ========================================

/**
 * 3인칭 단수 -s/-es 추가
 */
function addThirdPersonS(verb: string): string {
  const lowerVerb = verb.toLowerCase();

  // 불규칙 동사
  if (lowerVerb === 'have') return 'has';
  if (lowerVerb === 'do') return 'does';
  if (lowerVerb === 'go') return 'goes';

  // -s, -x, -z, -ch, -sh → -es
  if (/[sxz]$|ch$|sh$/i.test(verb)) {
    return `${verb}es`;
  }

  // 자음 + y → -ies
  if (/[^aeiou]y$/i.test(verb)) {
    return `${verb.slice(0, -1)}ies`;
  }

  // 일반적인 경우 -s
  return `${verb}s`;
}

/**
 * 간단한 검증만 수행 (빠른 버전)
 * 번역 파이프라인에서 사용
 */
export function quickValidate(text: string): string {
  let result = text;

  // 1. 중복 공백 제거
  result = result.replace(/\s+/g, ' ').trim();

  // 2. I 대문자
  result = result.replace(/\bi\b/g, 'I');

  // 3. a/an 기본 교정 (대소문자 보존)
  // a + 모음 → an
  result = result.replace(/\b[Aa]\s+([aeiouAEIOU])/g, (match, vowel) => {
    const isUpper = match.charAt(0) === 'A';
    return isUpper ? `An ${vowel}` : `an ${vowel}`;
  });
  // an + 자음 → a
  result = result.replace(/\b[Aa]n\s+([^aeiouAEIOU\s])/g, (match, consonant) => {
    const isUpper = match.charAt(0) === 'A';
    return isUpper ? `A ${consonant}` : `a ${consonant}`;
  });

  // 4. 문장부호 앞 공백 제거
  result = result.replace(/ +([.!?,;:])/g, '$1');

  // 5. 첫 글자 대문자 (마지막에 처리)
  if (result.length > 0 && /^[a-z]/.test(result)) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}
