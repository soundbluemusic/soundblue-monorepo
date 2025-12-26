/**
 * Context 데이터 타입 정의
 * Source: public-monorepo/apps/context
 */

export type Language = 'ko' | 'en';

export interface LeveledExamples {
  beginner: string;
  intermediate: string;
  advanced: string;
  master: string;
}

export interface Variations {
  formal?: string[];
  casual?: string[];
  short?: string[];
}

export interface Translation {
  word: string;
  reading?: string;
  explanation: string;
  examples?: LeveledExamples;
  variations?: Variations;
}

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'particle'
  | 'interjection'
  | 'conjunction'
  | 'pronoun'
  | 'determiner'
  | 'expression';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type FrequencyLevel = 'common' | 'frequent' | 'occasional' | 'rare';

export interface ContextEntry {
  id: string;
  korean: string;
  romanization: string;
  pronunciation?: {
    korean: string;
    ipa: string;
  };
  partOfSpeech: PartOfSpeech;
  categoryId: string;
  translations: {
    ko: Translation;
    en: Translation;
  };
  tags: string[];
  difficulty: DifficultyLevel;
  frequency?: FrequencyLevel;
}
