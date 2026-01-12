/**
 * Korean Spell Checker - Type Definitions
 * 한국어 맞춤법 검사기 타입 정의
 *
 * Uses unified types from @soundblue/text-processor
 */

import type { TextError } from '@soundblue/text-processor';

// Re-export unified types
export type {
  TextCheckOptions,
  TextCheckResult,
  TextCheckStats,
  TextError,
  TextErrorType,
} from '@soundblue/text-processor';

/** 에러 유형 (한국어 전용) */
export type SpellErrorType = 'spacing' | 'typo' | 'grammar';

/** 개별 맞춤법 에러 - TextError 기반으로 통합 */
export type SpellError = TextError;

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
