// ========================================
// Translator Types - 번역기 타입 정의
// ========================================

export type TranslationDirection = 'ko-en' | 'en-ko';

export interface ParticleInfo {
  role: 'topic' | 'subject' | 'object' | 'location' | 'direction' | 'conjunction' | 'possessive';
  en: string;
}

export interface EndingInfo {
  tense: 'past' | 'present' | 'future';
  formality: 'formal' | 'polite' | 'casual';
  question?: boolean;
}

export interface Token {
  text: string;
  type: 'word' | 'stem' | 'particle' | 'ending' | 'copula';
  translated?: string;
  role?: string;
}

export interface PatternEntry {
  ko: RegExp;
  en: string;
  /** 질문일 때만 매칭 */
  questionOnly?: boolean;
}

export interface TranslatorDictionary {
  sentences: Record<string, string>;
  patterns: PatternEntry[];
  words: Record<string, string>;
  morphemes: {
    particles: Record<string, ParticleInfo>;
    endings: Record<string, EndingInfo>;
  };
}
