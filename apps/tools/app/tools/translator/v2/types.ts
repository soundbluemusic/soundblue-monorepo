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
export type Tense = 'past' | 'present' | 'future';

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
  /** 추가 정보 */
  meta?: {
    tense?: Tense;
    negated?: boolean;
    plural?: boolean;
    particle?: string; // 분리된 조사
  };
}

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
