// ========================================
// Korean Endings - 한글 어미 패턴 100개 (자소 레벨)
// ========================================

export interface EndingPattern {
  jaso: string[]; // 자소 배열
  tense?: 'present' | 'past' | 'future' | 'progressive';
  formality?: 'formal' | 'polite' | 'casual';
  negative?: boolean;
  question?: boolean;
  connective?: string; // 연결어미 (그리고, 하지만 등)
  en?: string; // 영어 대응
}

export const ENDINGS: EndingPattern[] = [
  // ========================================
  // 현재 시제 (20개)
  // ========================================

  // 격식체
  { jaso: ['ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'], tense: 'present', formality: 'formal' }, // -습니다
  { jaso: ['ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'], tense: 'present', formality: 'formal' }, // -ㅂ니다

  // 존댓말
  { jaso: ['ㅇ', 'ㅏ', 'ㅇ', 'ㅛ'], tense: 'present', formality: 'polite' }, // -아요
  { jaso: ['ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'], tense: 'present', formality: 'polite' }, // -어요
  { jaso: ['ㅎ', 'ㅐ', 'ㅇ', 'ㅛ'], tense: 'present', formality: 'polite' }, // -해요
  { jaso: ['ㅇ', 'ㅕ', 'ㅇ', 'ㅛ'], tense: 'present', formality: 'polite' }, // -여요

  // 반말
  { jaso: ['ㄷ', 'ㅏ'], tense: 'present', formality: 'casual' }, // -다
  { jaso: ['ㅇ', 'ㅏ'], tense: 'present', formality: 'casual' }, // -아
  { jaso: ['ㅇ', 'ㅓ'], tense: 'present', formality: 'casual' }, // -어
  { jaso: ['ㅎ', 'ㅐ'], tense: 'present', formality: 'casual' }, // -해
  { jaso: ['ㅇ', 'ㅕ'], tense: 'present', formality: 'casual' }, // -여

  // 관형형
  { jaso: ['ㄴ', 'ㄷ', 'ㅏ'], tense: 'present' }, // -ㄴ다
  { jaso: ['ㄴ', 'ㅡ', 'ㄴ', 'ㄷ', 'ㅏ'], tense: 'present' }, // -는다
  { jaso: ['ㄴ', 'ㅡ', 'ㄴ'], tense: 'present' }, // -는 (관형사형)

  // 평서형
  { jaso: ['ㄴ', 'ㅡ', 'ㄴ', 'ㄷ', 'ㅔ'], tense: 'present' }, // -는데
  { jaso: ['ㄴ', 'ㅔ'], tense: 'present' }, // -네
  { jaso: ['ㄴ', 'ㅔ', 'ㅇ', 'ㅛ'], tense: 'present', formality: 'polite' }, // -네요

  // 기타
  { jaso: ['ㅇ', 'ㅡ', 'ㄴ'], tense: 'present' }, // -은 (관형사형, 받침 있을 때)
  { jaso: ['ㄴ'], tense: 'present' }, // -ㄴ (관형사형, 받침 없을 때)
  { jaso: ['ㄹ'], tense: 'present' }, // -ㄹ (관형사형, 미래)

  // ========================================
  // 과거 시제 (20개)
  // ========================================

  // 격식체
  {
    jaso: ['ㅇ', 'ㅏ', 'ㅆ', 'ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'],
    tense: 'past',
    formality: 'formal',
  }, // -았습니다
  {
    jaso: ['ㅇ', 'ㅓ', 'ㅆ', 'ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'],
    tense: 'past',
    formality: 'formal',
  }, // -었습니다
  {
    jaso: ['ㅎ', 'ㅐ', 'ㅆ', 'ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'],
    tense: 'past',
    formality: 'formal',
  }, // -했습니다

  // 존댓말
  { jaso: ['ㅇ', 'ㅏ', 'ㅆ', 'ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'], tense: 'past', formality: 'polite' }, // -았어요
  { jaso: ['ㅇ', 'ㅓ', 'ㅆ', 'ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'], tense: 'past', formality: 'polite' }, // -었어요
  { jaso: ['ㅎ', 'ㅐ', 'ㅆ', 'ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'], tense: 'past', formality: 'polite' }, // -했어요
  { jaso: ['ㅇ', 'ㅕ', 'ㅆ', 'ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'], tense: 'past', formality: 'polite' }, // -였어요

  // 반말
  { jaso: ['ㅇ', 'ㅏ', 'ㅆ', 'ㄷ', 'ㅏ'], tense: 'past', formality: 'casual' }, // -았다
  { jaso: ['ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅏ'], tense: 'past', formality: 'casual' }, // -었다
  { jaso: ['ㅎ', 'ㅐ', 'ㅆ', 'ㄷ', 'ㅏ'], tense: 'past', formality: 'casual' }, // -했다
  { jaso: ['ㅇ', 'ㅏ', 'ㅆ', 'ㅇ', 'ㅓ'], tense: 'past', formality: 'casual' }, // -았어
  { jaso: ['ㅇ', 'ㅓ', 'ㅆ', 'ㅇ', 'ㅓ'], tense: 'past', formality: 'casual' }, // -었어
  { jaso: ['ㅎ', 'ㅐ', 'ㅆ', 'ㅇ', 'ㅓ'], tense: 'past', formality: 'casual' }, // -했어

  // 관형형
  { jaso: ['ㅇ', 'ㅓ', 'ㅆ', 'ㄴ'], tense: 'past' }, // -었ㄴ
  { jaso: ['ㅇ', 'ㅏ', 'ㅆ', 'ㄴ'], tense: 'past' }, // -았ㄴ
  { jaso: ['ㅎ', 'ㅐ', 'ㅆ', 'ㄴ'], tense: 'past' }, // -했ㄴ

  // 기타
  { jaso: ['ㅇ', 'ㅓ', 'ㅆ', 'ㄴ', 'ㅡ', 'ㄴ', 'ㄷ', 'ㅔ'], tense: 'past' }, // -었는데
  { jaso: ['ㅇ', 'ㅏ', 'ㅆ', 'ㄴ', 'ㅡ', 'ㄴ', 'ㄷ', 'ㅔ'], tense: 'past' }, // -았는데
  { jaso: ['ㅇ', 'ㅓ', 'ㅆ', 'ㄷ', 'ㅓ', 'ㄴ'], tense: 'past' }, // -었던
  { jaso: ['ㅇ', 'ㅏ', 'ㅆ', 'ㄷ', 'ㅓ', 'ㄴ'], tense: 'past' }, // -았던

  // ========================================
  // 미래 시제 (15개)
  // ========================================

  // 격식체
  {
    jaso: ['ㄹ', 'ㄱ', 'ㅓ', 'ㅅ', 'ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'],
    tense: 'future',
    formality: 'formal',
  }, // -ㄹ것습니다
  {
    jaso: ['ㄱ', 'ㅔ', 'ㅆ', 'ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'],
    tense: 'future',
    formality: 'formal',
  }, // -겠습니다

  // 존댓말
  { jaso: ['ㄹ', 'ㄱ', 'ㅓ', 'ㅇ', 'ㅕ', 'ㅇ', 'ㅛ'], tense: 'future', formality: 'polite' }, // -ㄹ거예요
  { jaso: ['ㄹ', 'ㄱ', 'ㅔ', 'ㅇ', 'ㅛ'], tense: 'future', formality: 'polite' }, // -ㄹ게요
  { jaso: ['ㄱ', 'ㅔ', 'ㅆ', 'ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'], tense: 'future', formality: 'polite' }, // -겠어요

  // 반말
  { jaso: ['ㄹ', 'ㄱ', 'ㅓ', 'ㅅ'], tense: 'future', formality: 'casual' }, // -ㄹ것
  { jaso: ['ㄹ', 'ㄱ', 'ㅓ', 'ㅇ', 'ㅑ'], tense: 'future', formality: 'casual' }, // -ㄹ거야
  { jaso: ['ㄹ', 'ㄱ', 'ㅔ'], tense: 'future', formality: 'casual' }, // -ㄹ게
  { jaso: ['ㄱ', 'ㅔ', 'ㅆ', 'ㄷ', 'ㅏ'], tense: 'future', formality: 'casual' }, // -겠다
  { jaso: ['ㄱ', 'ㅔ', 'ㅆ', 'ㅇ', 'ㅓ'], tense: 'future', formality: 'casual' }, // -겠어

  // 관형형
  { jaso: ['ㄹ'], tense: 'future' }, // -ㄹ (미래 관형사형)
  { jaso: ['ㅇ', 'ㅡ', 'ㄹ'], tense: 'future' }, // -을 (미래 관형사형, 받침 있을 때)

  // 기타
  { jaso: ['ㄹ', 'ㄱ', 'ㅓ', 'ㄴ'], tense: 'future' }, // -ㄹ건
  { jaso: ['ㄹ', 'ㄷ', 'ㅔ'], tense: 'future' }, // -ㄹ데
  { jaso: ['ㄹ', 'ㄷ', 'ㅔ', 'ㅇ', 'ㅛ'], tense: 'future', formality: 'polite' }, // -ㄹ데요

  // ========================================
  // 진행형 (10개)
  // ========================================
  {
    jaso: ['ㄱ', 'ㅗ', 'ㅇ', 'ㅣ', 'ㅆ', 'ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄷ', 'ㅏ'],
    tense: 'progressive',
    formality: 'formal',
  }, // -고있습니다
  {
    jaso: ['ㄱ', 'ㅗ', 'ㅇ', 'ㅣ', 'ㅆ', 'ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'],
    tense: 'progressive',
    formality: 'polite',
  }, // -고있어요
  { jaso: ['ㄱ', 'ㅗ', 'ㅇ', 'ㅣ', 'ㅆ', 'ㄷ', 'ㅏ'], tense: 'progressive', formality: 'casual' }, // -고있다
  { jaso: ['ㄱ', 'ㅗ', 'ㅇ', 'ㅣ', 'ㅆ', 'ㅇ', 'ㅓ'], tense: 'progressive', formality: 'casual' }, // -고있어
  { jaso: ['ㄴ', 'ㅡ', 'ㄴ', 'ㅈ', 'ㅜ', 'ㅇ', 'ㅣ', 'ㄷ', 'ㅏ'], tense: 'progressive' }, // -는중이다
  {
    jaso: ['ㄴ', 'ㅡ', 'ㄴ', 'ㅈ', 'ㅜ', 'ㅇ', 'ㅣ', 'ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'],
    tense: 'progressive',
    formality: 'polite',
  }, // -는중이어요
  { jaso: ['ㅁ', 'ㅕ', 'ㄴ', 'ㅅ', 'ㅓ'], tense: 'progressive' }, // -면서
  { jaso: ['ㅁ', 'ㅕ'], tense: 'progressive' }, // -며
  { jaso: ['ㄴ', 'ㅡ', 'ㄴ', 'ㄱ', 'ㅏ', 'ㅇ', 'ㅜ', 'ㄴ', 'ㄷ', 'ㅔ'], tense: 'progressive' }, // -는가운데
  { jaso: ['ㄴ', 'ㅡ', 'ㄴ', 'ㄷ', 'ㅗ', 'ㅇ', 'ㅏ', 'ㄴ'], tense: 'progressive' }, // -는동안

  // ========================================
  // 부정형 (10개)
  // ========================================
  { jaso: ['ㅈ', 'ㅣ', 'ㅇ', 'ㅏ', 'ㄴ', 'ㅎ', 'ㅏ', 'ㄷ', 'ㅏ'], negative: true }, // -지않다
  { jaso: ['ㅈ', 'ㅣ', 'ㅇ', 'ㅏ', 'ㄴ', 'ㅎ', 'ㅐ'], negative: true }, // -지않해 (?)
  {
    jaso: ['ㅈ', 'ㅣ', 'ㅇ', 'ㅏ', 'ㄴ', 'ㅎ', 'ㅏ', 'ㅇ', 'ㅛ'],
    negative: true,
    formality: 'polite',
  }, // -지않아요
  {
    jaso: ['ㅈ', 'ㅣ', 'ㅇ', 'ㅏ', 'ㄴ', 'ㅎ', 'ㅏ', 'ㅆ', 'ㄷ', 'ㅏ'],
    negative: true,
    tense: 'past',
  }, // -지않았다
  { jaso: ['ㅈ', 'ㅣ', 'ㅁ', 'ㅗ', 'ㅅ', 'ㅎ', 'ㅏ', 'ㄷ', 'ㅏ'], negative: true }, // -지못하다
  { jaso: ['ㅈ', 'ㅣ', 'ㅁ', 'ㅗ', 'ㅅ', 'ㅎ', 'ㅐ'], negative: true }, // -지못해
  {
    jaso: ['ㅈ', 'ㅣ', 'ㅁ', 'ㅗ', 'ㅅ', 'ㅎ', 'ㅏ', 'ㅇ', 'ㅛ'],
    negative: true,
    formality: 'polite',
  }, // -지못해요
  { jaso: ['ㅁ', 'ㅗ', 'ㅅ', 'ㅎ', 'ㅏ', 'ㄷ', 'ㅏ'], negative: true }, // -못하다 (못+동사)
  { jaso: ['ㅁ', 'ㅗ', 'ㅅ', 'ㅎ', 'ㅐ'], negative: true }, // -못해
  { jaso: ['ㅁ', 'ㅗ', 'ㅅ', 'ㅎ', 'ㅏ', 'ㅇ', 'ㅛ'], negative: true, formality: 'polite' }, // -못해요

  // ========================================
  // 의문형 (10개)
  // ========================================
  { jaso: ['ㄴ', 'ㅣ'], question: true }, // -니
  { jaso: ['ㄴ', 'ㅑ'], question: true }, // -냐
  { jaso: ['ㄴ', 'ㅣ', 'ㄲ', 'ㅏ'], question: true }, // -니까
  { jaso: ['ㄴ', 'ㅏ', 'ㅇ', 'ㅛ'], question: true, formality: 'polite' }, // -나요
  { jaso: ['ㅇ', 'ㅓ', 'ㅇ', 'ㅛ'], question: true, formality: 'polite' }, // -어요? (억양)
  { jaso: ['ㅇ', 'ㅏ', 'ㅇ', 'ㅛ'], question: true, formality: 'polite' }, // -아요? (억양)
  { jaso: ['ㅅ', 'ㅡ', 'ㅂ', 'ㄴ', 'ㅣ', 'ㄲ', 'ㅏ'], question: true, formality: 'formal' }, // -습니까
  { jaso: ['ㅂ', 'ㄴ', 'ㅣ', 'ㄲ', 'ㅏ'], question: true, formality: 'formal' }, // -ㅂ니까
  { jaso: ['ㄹ', 'ㄲ', 'ㅏ'], question: true }, // -ㄹ까
  { jaso: ['ㅇ', 'ㅡ', 'ㄹ', 'ㄲ', 'ㅏ'], question: true }, // -을까 (받침 있을 때)

  // ========================================
  // 연결어미 (5개)
  // ========================================
  { jaso: ['ㄱ', 'ㅗ'], connective: 'and' }, // -고 (그리고)
  { jaso: ['ㅁ', 'ㅕ', 'ㄴ', 'ㅅ', 'ㅓ'], connective: 'while' }, // -면서 (하는 동안)
  { jaso: ['ㅈ', 'ㅣ', 'ㅁ', 'ㅏ', 'ㄴ'], connective: 'but' }, // -지만 (하지만)
  { jaso: ['ㄴ', 'ㅡ', 'ㄴ', 'ㄷ', 'ㅔ'], connective: 'but' }, // -는데 (그런데)
  { jaso: ['ㄴ', 'ㅣ', 'ㄲ', 'ㅏ'], connective: 'because' }, // -니까 (왜냐하면)
];

/**
 * 자소 배열에서 어미 패턴 매칭
 */
export function matchEnding(jasoArr: string[]): EndingPattern | null {
  // 긴 패턴부터 매칭 (greedy)
  const sorted = [...ENDINGS].sort((a, b) => b.jaso.length - a.jaso.length);

  for (const pattern of sorted) {
    if (endsWithPattern(jasoArr, pattern.jaso)) {
      return pattern;
    }
  }

  return null;
}

/**
 * 자소 배열이 특정 패턴으로 끝나는지 확인
 */
function endsWithPattern(jasoArr: string[], pattern: string[]): boolean {
  if (pattern.length > jasoArr.length) return false;

  for (let i = 0; i < pattern.length; i++) {
    const arrIdx = jasoArr.length - pattern.length + i;
    if (jasoArr[arrIdx] !== pattern[i]) {
      return false;
    }
  }

  return true;
}

/**
 * 어미에서 영어 시제 추출
 */
export function getEnglishTense(ending: EndingPattern): string {
  if (ending.tense === 'past') return 'past';
  if (ending.tense === 'future') return 'future';
  if (ending.tense === 'progressive') return 'progressive';
  return 'present';
}

/**
 * 어미에서 영어 형태 생성
 */
export function generateEnglishForm(verb: string, ending: EndingPattern): string {
  const tense = getEnglishTense(ending);

  if (tense === 'past') {
    // 간단 구현 (나중에 불규칙 동사 처리)
    return verb.endsWith('e') ? `${verb}d` : `${verb}ed`;
  }

  if (tense === 'progressive') {
    return verb.endsWith('e') ? `${verb.slice(0, -1)}ing` : `${verb}ing`;
  }

  if (tense === 'future') {
    return `will ${verb}`;
  }

  return verb; // present
}
