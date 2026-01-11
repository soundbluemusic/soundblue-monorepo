/**
 * Korean Spell Checker - Type Definitions
 * 한국어 맞춤법 검사기 타입 정의
 */

/** 에러 유형 */
export type SpellErrorType = 'spacing' | 'typo' | 'grammar';

/** 개별 맞춤법 에러 */
export interface SpellError {
  /** 에러 유형 */
  type: SpellErrorType;
  /** 에러 시작 위치 (0-based index) */
  start: number;
  /** 에러 끝 위치 (exclusive) */
  end: number;
  /** 원본 텍스트 */
  original: string;
  /** 수정 제안 */
  suggestion: string;
  /** 에러 설명 메시지 */
  message: string;
  /** 신뢰도 (0-1) */
  confidence: number;
}

/** 검사 통계 */
export interface SpellCheckStats {
  /** 총 에러 수 */
  totalErrors: number;
  /** 띄어쓰기 에러 수 */
  spacingErrors: number;
  /** 오타 에러 수 */
  typoErrors: number;
  /** 문법 에러 수 */
  grammarErrors: number;
}

/** 맞춤법 검사 결과 */
export interface SpellCheckResult {
  /** 원본 텍스트 */
  original: string;
  /** 수정된 텍스트 */
  corrected: string;
  /** 발견된 에러 목록 */
  errors: SpellError[];
  /** 검사 통계 */
  stats: SpellCheckStats;
}

/** 검사 옵션 */
export interface SpellCheckOptions {
  /** 띄어쓰기 검사 여부 */
  checkSpacing?: boolean;
  /** 오타 검사 여부 */
  checkTypo?: boolean;
  /** 문법 검사 여부 */
  checkGrammar?: boolean;
}
