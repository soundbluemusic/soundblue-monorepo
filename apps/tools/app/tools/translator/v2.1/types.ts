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
  | 'verb' // 동사
  | 'adjective' // 형용사
  | 'adverb' // 부사
  | 'particle' // 조사 (한국어)
  | 'number' // 숫자
  | 'counter' // 분류사 (개, 마리...)
  | 'punctuation' // 구두점
  | 'unknown'; // 미분류

/** 시제 */
export type Tense = 'past' | 'present' | 'future' | 'present-perfect' | 'past-perfect';

/** 문장 유형 */
export type SentenceType = 'statement' | 'question' | 'exclamation' | 'imperative';

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
  /** 부정문 여부 */
  negated: boolean;
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
