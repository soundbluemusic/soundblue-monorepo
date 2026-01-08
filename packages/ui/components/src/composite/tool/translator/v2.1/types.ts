/**
 * 번역기 v2 타입 정의
 * 단순하고 명확한 구조
 */

/** 번역 방향 */
export type Direction = 'ko-en' | 'en-ko';

/**
 * 어조/격식 설정
 *
 * - casual: 반말 (커피 좋아해?)
 * - formal: 존댓말 (커피 좋아하세요?)
 * - neutral: 상관없음 - 기본값 (커피 좋아하니?)
 * - friendly: 친근체 (커피 좋아해~?)
 * - literal: 번역체 (당신은 커피를 좋아합니까?)
 */
export type Formality = 'casual' | 'formal' | 'neutral' | 'friendly' | 'literal';

/** 토큰 역할 */
export type Role =
  | 'subject' // 주어
  | 'object' // 목적어
  | 'object-absorbed' // 목적어가 동사에 흡수됨 (운동을 하고 있다 → exercising)
  | 'indirect-object' // 간접목적어 (사동문에서 사용)
  | 'verb' // 동사
  | 'adjective' // 형용사
  | 'adverb' // 부사
  | 'particle' // 조사 (한국어)
  | 'number' // 숫자
  | 'counter' // 분류사 (개, 마리...)
  | 'punctuation' // 구두점
  | 'compound' // 복합어/관용어 (배고프다, 목마르다 등)
  | 'unknown'; // 미분류

/** 보조용언 패턴 유형 */
export type AuxiliaryMeaning =
  | 'progressive'
  | 'past-progressive'
  | 'desiderative'
  | 'attemptive'
  | 'completive'
  | 'benefactive'
  | 'benefactive-honorific' // -어 드리다
  | 'resultative' // -어 놓다
  | 'accomplishment' // -어 내다
  | 'prohibition' // -면 안 되다
  | 'seem' // -는 것 같다
  | 'inchoative' // -기 시작하다
  | 'know-how' // -ㄹ 줄 알다
  | 'know-how-negative' // -ㄹ 줄 모르다
  | 'tendency' // -는 편이다
  | 'future'
  | 'perfect'
  | 'modal-can'
  | 'modal-cannot' // -ㄹ 수 없다 (불능)
  | 'modal-may'
  // 의존명사 패턴 (Bound Nouns)
  | 'only' // -ㄹ 뿐이다
  | 'experience' // -ㄴ 적 있다
  | 'intention' // -ㄹ 생각이다
  | 'schedule' // -ㄹ 예정이다
  | 'worth' // -ㄹ 만하다
  | 'necessity' // -ㄹ 필요가 있다
  | 'reason' // -ㄹ 이유
  // 조동사 패턴 (Modals) g5
  | 'modal-might' // -지도 모르다 (불확실)
  | 'modal-must' // -어야 하다 (의무)
  | 'modal-should' // -는 게 좋다 (권고)
  | 'modal-would' // -곤 하다 (과거 습관)
  | 'polite-request' // -주시겠어요? (정중 요청)
  | 'modal-could' // -ㄹ 수 있었다 (과거 능력)
  | 'modal-had-to'; // -어야 했다 (과거 의무)

/** 시제 */
export type Tense = 'past' | 'present' | 'future' | 'present-perfect' | 'past-perfect';

/** 문장 유형 */
export type SentenceType = 'statement' | 'question' | 'exclamation' | 'imperative' | 'suggestion';

/** 격식 수준 (종결어미에서 추출) */
export type PolitenessLevel = 'formal-polite' | 'polite' | 'plain' | 'informal';

/**
 * 종결어미 유형 (g15 Final Endings)
 * 한국어 문장의 마무리 형태를 나타냄
 */
export type FinalEndingType =
  // 평서문 종결어미
  | 'formal-polite' // -ㅂ니다 (갑니다)
  | 'polite' // -아/어요 (가요)
  | 'plain' // -다/-ㄴ다 (간다)
  | 'informal' // 어간만 (가)
  // 의문문 종결어미
  | 'formal-question' // -ㅂ니까? (갑니까?)
  // 명령문 종결어미
  | 'please-honorific' // -세요 (가세요)
  | 'command' // -라 (가라)
  // 청유문 종결어미
  | 'formal-suggestion' // -ㅂ시다 (갑시다)
  | 'casual-suggestion' // -자 (가자)
  // 감탄문 종결어미
  | 'exclamation' // -구나 (가는구나)
  // 특수 종결어미
  | 'tag-question' // -지 (가지)
  | 'you-know' // -잖아 (가잖아)
  | 'promise' // -ㄹ게 (갈게)
  | 'want' // -ㄹ래? (갈래?)
  | 'shall' // -ㄹ까? (갈까?)
  | 'retrospective'; // -더라 (가더라)

/** 토큰 */
export interface Token {
  /** 원본 텍스트 */
  text: string;
  /** 어간 (활용 전 원형) */
  stem: string;
  /** 역할 */
  role: Role;
  /** 번역된 텍스트 */
  translated?: string;
  /**
   * 신뢰도 (0.0 ~ 1.0)
   * - 1.0: 사전 정확 매칭
   * - 0.8~0.9: 규칙 기반 추론
   * - 0.5~0.7: 유사도 기반 추론
   * - 0.0~0.4: 낮은 신뢰도 (fallback)
   */
  confidence?: number;
  /** 추가 정보 */
  meta?: {
    tense?: Tense;
    negated?: boolean;
    plural?: boolean;
    particle?: string; // 분리된 조사
    /** 토큰화 전략 (디버깅용) */
    strategy?: TokenStrategy;
    /** 계사(이다/입니다) 정보 */
    copula?: string;
    /** 계사 여부 */
    isCopula?: boolean;
    /** 경동사 여부 (했다, 한다 등 - 목적어를 동사로 변환) */
    isLightVerb?: boolean;
    /** 보조용언 패턴 유형 (Phase 0) */
    auxiliaryMeaning?: AuxiliaryMeaning;
    /** 진행형 여부 (-고 있다) */
    isProgressive?: boolean;
    /** 희망형 여부 (-고 싶다) */
    isDesiderative?: boolean;
    /** 격식 (morphology 모듈) */
    formality?: 'formal' | 'polite' | 'casual';
    /** 형용사/서술적 동사 여부 (morphology 모듈) */
    isDescriptive?: boolean;
    /** 사동 유형: lexical (먹이다) 또는 analytic (-게 하다) */
    causativeType?: 'lexical' | 'analytic';
    /** 피동 접미사 타입 */
    passiveType?: 'ri' | 'gi' | 'i' | 'hi' | 'doeda' | 'batda' | 'danghada';
    /** 피동 원래 동사 어간 */
    passiveBase?: string;
  };
}

/**
 * 토큰화 전략 (어떤 방법으로 토큰을 인식했는지)
 */
export type TokenStrategy =
  | 'dictionary' // 사전 정확 매칭
  | 'rule' // 규칙 기반 (모음조화 등)
  | 'similarity' // 유사도 기반 (jamoEditDistance)
  | 'irregular' // 불규칙 동사 처리
  | 'compound' // 복합어/관용어 매칭
  | 'grammar-pattern' // 문법 패턴 매칭 (보조용언 등)
  | 'morphology' // 형태소 모듈 (korean-contracted, korean-copulas)
  | 'relative-clause-subject' // 관계절 주어
  | 'relative-clause-verb' // 관계절 동사
  | 'relative-clause-object' // 관계절 목적어
  | 'relative-clause-antecedent' // 관계절 선행사
  | 'unknown'; // 미인식

/** 분석된 문장 */
export interface ParsedSentence {
  /** 원본 */
  original: string;
  /** 토큰 목록 */
  tokens: Token[];
  /** 문장 유형 */
  type: SentenceType;
  /** 시제 */
  tense: Tense;
  /** 부정문 여부 (안, -지 않다) */
  negated: boolean;
  /** 능력 부정 여부 (못, -지 못하다) → can't */
  inabilityNegation?: boolean;
  /** 금지 부정 여부 (-지 마) → Don't! */
  prohibitiveNegation?: boolean;
  /** 보조용언 패턴 (Phase 0) */
  auxiliaryPattern?: AuxiliaryMeaning;
  /** 비교급/최상급 마커 (Phase 3) - "더"=comparative, "가장"=superlative */
  comparativeType?: 'comparative' | 'superlative';
  /** 격식 수준 (Phase 1: 종결어미) */
  politenessLevel?: PolitenessLevel;
  /** 종결어미 유형 (g15) */
  finalEndingType?: FinalEndingType;
  /** 종결어미에서 추출된 동사 어간 */
  finalEndingStem?: string;
  /** 피동문 여부 (g4) - 열리다, 들리다, 해결되다, 사랑받다, 비난당하다 */
  passive?: boolean;
  /** 피동 접미사 타입 */
  passiveType?: 'ri' | 'gi' | 'i' | 'hi' | 'doeda' | 'batda' | 'danghada';
  /** 피동 동사 어간 */
  passiveVerbStem?: string;
  /** 피동 원래 동사 */
  passiveBaseVerb?: string;
  /** 사동문 여부 (g4) - 먹이다, -게 하다 */
  causative?: boolean;
  /** 사동 유형: lexical (먹이다) 또는 analytic (-게 하다) */
  causativeType?: 'lexical' | 'analytic';
  /** 사동 동사 어간 */
  causativeVerbStem?: string;
  /** 사동 영어 번역 (feed, make go 등) */
  causativeEnglish?: string;
  /** 사동 목적어 (그를) */
  causativeObject?: string;
  /** 사동 수혜자 (아이에게) */
  causativeRecipient?: string;
  /** 영어 수동태 여부 (was/were + pp) */
  englishPassive?: boolean;
  /** 영어 수동태 동사 (과거분사) */
  englishPassiveVerb?: string;
  /** 영어 수동태 행위자 (by + agent) */
  passiveAgent?: string;

  // ============================================
  // 조건문 (g6 Conditionals)
  // ============================================
  /** 조건문 여부 */
  conditional?: boolean;
  /**
   * 조건문 유형
   * - type0: 일반적 진리 (비가 오면 땅이 젖는다)
   * - type1: 미래 가능 조건 (비가 오면 집에 있을 것이다)
   * - type2: 현재 가정법 (부자라면 여행할 텐데)
   * - type3: 과거 가정법 (공부했더라면 합격했을 텐데)
   * - unless: 부정 조건 (오지 않으면)
   * - even-if: 양보 조건 (비가 오더라도)
   */
  conditionalType?: 'type0' | 'type1' | 'type2' | 'type3' | 'unless' | 'even-if';
  /** 조건절 (If clause) */
  conditionalClause?: string;
  /** 결과절 (Main clause) */
  resultClause?: string;
  /** 영어 조건문 패턴 */
  englishConditional?: boolean;
  /** 영어 조건문 유형 */
  englishConditionalType?: 'type0' | 'type1' | 'type2' | 'type3' | 'unless' | 'even-if';

  // ============================================
  // 명사절 (g8 Noun Clauses)
  // ============================================
  /** 명사절 여부 */
  nounClause?: boolean;
  /**
   * 명사절 유형
   * - that-subject: That-절이 주어 (That he came is important)
   * - that-object: That-절이 목적어 (I know that he came)
   * - whether: 의문 명사절 (I wonder if/whether he will come)
   * - wh-clause: Wh-절 (I don't know where he went)
   * - quote: 인용절 (He said that he would go)
   */
  nounClauseType?: 'that-subject' | 'that-object' | 'whether' | 'wh-clause' | 'quote';
  /** 명사절 내용 */
  nounClauseContent?: string;
  /** 주절 술어 */
  mainPredicate?: string;
  /** Wh-단어 (where, what, when, etc.) */
  whWord?: string;

  // ============================================
  // 관계절 (g9 Relative Clauses)
  // ============================================
  /** 관계절 여부 */
  relativeClause?: boolean;
  /**
   * 관계절 유형
   * - who: 사람 주격 (the person who helped me)
   * - whom: 사람 목적격 (the person whom I met)
   * - which: 사물 (the book which I read)
   * - that: 범용 (the book that I bought)
   * - where: 장소 (the place where he lives)
   * - when: 시간 (the day when we met)
   */
  relativeClauseType?: 'who' | 'whom' | 'which' | 'that' | 'where' | 'when';
  /** 선행사 (head noun) */
  relativeAntecedent?: string;
  /** 관계절 내용 */
  relativeClauseContent?: string;
  /** 영어 관계절 여부 */
  englishRelativeClause?: boolean;

  // ============================================
  // 추측 표현 (g23 Conjecture)
  // ============================================
  /** 추측 표현 여부 */
  conjecture?: boolean;
  /**
   * 추측 표현 유형
   * - geot-gatda: -ㄹ 것 같다 (probably)
   * - ga-boda: -가 보다 (seems to be)
   * - moyang: -ㄴ 모양이다 (appears to be)
   * - deut: -ㄹ 듯하다 (seems like)
   * - na-sipda: -나 싶다 (I guess)
   * - certain: 틀림없이 (must be)
   * - jido-moreunda: -ㄹ지도 모른다 (might)
   * - hearsay: -다고 하다 (I heard that)
   */
  conjectureType?:
    | 'geot-gatda'
    | 'ga-boda'
    | 'moyang'
    | 'deut'
    | 'na-sipda'
    | 'certain'
    | 'jido-moreunda'
    | 'hearsay';
  /** 추측 대상 동사/형용사 어간 */
  conjectureStem?: string;
  /** 추측 시제 */
  conjectureTense?: 'past' | 'present' | 'future';
  /** 영어 추측 표현 여부 */
  englishConjecture?: boolean;

  // ============================================
  // 인용 표현 (g24 Quotation)
  // ============================================
  /** 인용 표현 여부 */
  quotation?: boolean;
  /**
   * 인용 표현 유형
   * - dago: -다고 하다 (평서문 인용)
   * - nyago: -냐고 물다 (의문문 인용)
   * - rago: -라고 하다 (명령문 인용)
   * - jago: -자고 하다 (청유문 인용)
   * - ndae: -ㄴ대 (축약형 평서문)
   * - nyae: -냬 (축약형 의문문)
   * - rae: -래 (축약형 명령문)
   */
  quotationType?: 'dago' | 'nyago' | 'rago' | 'jago' | 'ndae' | 'nyae' | 'rae';
  /** 인용 동사 어간 */
  quotationStem?: string;
  /** 인용 시제 (인용 동사 시제) */
  quotationTense?: 'past' | 'present';
  /** 인용 동사 (했다, 물었다, 들었다 등) */
  quotationVerb?: string;
  /** 영어 인용 표현 여부 */
  englishQuotation?: boolean;

  // ============================================
  // g15 영어 종결어미 패턴 (En→Ko)
  // ============================================
  /** 영어 종결어미 패턴 유형 */
  englishFinalPatternType?:
    | 'formal-statement' // I V (formal)
    | 'polite-statement' // I V (polite)
    | 'casual-statement' // I V (casual)
    | 'formal-question' // Do you V? (formal)
    | 'please-command' // Please V
    | 'command' // V! (command)
    | 'lets' // Let's V
    | 'want-question' // Want to V?
    | 'shall-question'; // Shall we V?
  /** 영어 종결어미 패턴에서 추출된 동사 */
  englishFinalPatternVerb?: string;
}

/** 번역 결과 */
export interface TranslationResult {
  /** 번역문 */
  translated: string;
  /** 원문 */
  original: string;
  /** 분석 정보 (디버깅용) */
  debug?: ParsedSentence;
}

// ============================================
// 파이프라인 v2 확장 타입
// ============================================

/**
 * 번역 후보 (다중 후보 생성용)
 */
export interface TranslationCandidate {
  /** 번역 결과 */
  text: string;
  /** 종합 신뢰도 (0.0 ~ 1.0) */
  confidence: number;
  /** 각 단어별 신뢰도 */
  wordConfidences: WordConfidence[];
  /** 사용된 전략 */
  strategy: string;
}

/**
 * 단어별 신뢰도 정보
 */
export interface WordConfidence {
  /** 원본 단어 */
  original: string;
  /** 번역된 단어 */
  translated: string;
  /** 신뢰도 */
  confidence: number;
  /** 역번역 검증 결과 */
  validation?: WordValidation;
}

/**
 * 단어 역번역 검증 결과
 */
export interface WordValidation {
  /** 검증 통과 여부 */
  valid: boolean;
  /** 역번역 결과 */
  reverseTranslation: string;
  /** 검증 신뢰도 */
  confidence: number;
  /** 허용된 동의어 목록 (매칭된 경우) */
  matchedSynonym?: string;
}

/**
 * 분석된 문장 (확장 - 다중 후보 지원)
 */
export interface ParsedSentenceWithCandidates extends ParsedSentence {
  /** 번역 후보 목록 (신뢰도 순) */
  candidates?: TranslationCandidate[];
  /** 평균 토큰 신뢰도 */
  avgConfidence?: number;
}
