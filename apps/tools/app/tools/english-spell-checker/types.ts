/**
 * English Spell Checker Types
 * 영어 맞춤법 검사기 타입 정의
 */

export interface EnglishSpellError {
  word: string; // Misspelled word
  start: number; // Start position in text
  end: number; // End position in text
  suggestions: string[]; // Suggested corrections (max 5)
}

export interface EnglishSpellCheckResult {
  original: string;
  errors: EnglishSpellError[];
  stats: {
    totalWords: number;
    misspelledWords: number;
  };
}

export interface EnglishSpellCheckOptions {
  maxSuggestions?: number;
  ignoreCase?: boolean;
  ignoreNumbers?: boolean;
}
