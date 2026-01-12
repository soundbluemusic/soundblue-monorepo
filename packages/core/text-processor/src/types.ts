// ========================================
// @soundblue/text-processor - Type Definitions
// Common types for language tools (spell checkers, translators)
// ========================================

/** Error type for text processing (language agnostic) */
export type TextErrorType = 'spelling' | 'spacing' | 'grammar' | 'typo';

/** Supported languages */
export type TextLanguage = 'ko' | 'en';

/**
 * Unified text error interface
 * Used by both Korean and English spell checkers
 */
export interface TextError {
  /** Error type */
  type: TextErrorType;
  /** Start position in text (0-based, inclusive) */
  start: number;
  /** End position in text (0-based, exclusive) */
  end: number;
  /** Original text that contains the error */
  original: string;
  /** Suggested corrections (always array, even for single suggestion) */
  suggestions: string[];
  /** Human-readable error description */
  message?: string;
  /** Confidence score (0-1, optional) */
  confidence?: number;
}

/**
 * Text check result
 * Returned by spell check functions
 */
export interface TextCheckResult {
  /** Original input text */
  original: string;
  /** Auto-corrected text (using first suggestion for each error) */
  corrected: string;
  /** List of detected errors */
  errors: TextError[];
  /** Error statistics */
  stats: TextCheckStats;
}

/**
 * Error statistics
 */
export interface TextCheckStats {
  /** Total items checked (words for English, characters for Korean) */
  totalItems: number;
  /** Number of spelling errors */
  spellingErrors: number;
  /** Number of spacing errors */
  spacingErrors: number;
  /** Number of grammar errors */
  grammarErrors: number;
  /** Number of typo errors */
  typoErrors: number;
}

/**
 * Check options
 * Common options for all text checkers
 */
export interface TextCheckOptions {
  /** Enable spelling check (default: true) */
  checkSpelling?: boolean;
  /** Enable spacing check (default: true) */
  checkSpacing?: boolean;
  /** Enable grammar check (default: true) */
  checkGrammar?: boolean;
  /** Enable typo check (default: true) */
  checkTypo?: boolean;
  /** Maximum number of suggestions per error (default: 5) */
  maxSuggestions?: number;
}
