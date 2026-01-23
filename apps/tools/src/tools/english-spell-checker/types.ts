/**
 * English Spell Checker Types
 * 영어 맞춤법 검사기 타입 정의
 *
 * Uses unified types from @soundblue/text-processor
 */

// Re-export unified types for new code
export type {
  TextCheckOptions,
  TextCheckResult,
  TextCheckStats,
  TextError,
  TextErrorType,
} from '@soundblue/text-processor';

/** 에러 유형 */
export type EnglishSpellErrorType = 'spelling' | 'spacing' | 'grammar';

export interface EnglishSpellError {
  type: EnglishSpellErrorType; // Error type
  word: string; // Original word/text
  start: number; // Start position in text
  end: number; // End position in text
  suggestions: string[]; // Suggested corrections (max 5)
  message?: string; // Error description
}

export interface EnglishSpellCheckResult {
  original: string;
  corrected: string; // Auto-corrected text
  errors: EnglishSpellError[];
  stats: {
    totalWords: number;
    spellingErrors: number;
    spacingErrors: number;
    grammarErrors: number;
  };
}

export interface EnglishSpellCheckOptions {
  maxSuggestions?: number;
  ignoreCase?: boolean;
  ignoreNumbers?: boolean;
  checkSpacing?: boolean;
  checkGrammar?: boolean;
}
