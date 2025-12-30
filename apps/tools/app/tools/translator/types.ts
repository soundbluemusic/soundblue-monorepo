/**
 * 번역기 타입 정의
 */

export interface ParticleInfo {
  role: 'topic' | 'subject' | 'object' | 'direction' | 'location' | 'conjunction' | 'possessive';
  en: string;
}

export interface EndingInfo {
  tense: 'present' | 'past' | 'future';
  formality: 'plain' | 'polite' | 'formal' | 'casual';
  mood?: 'interrogative';
}

export interface PatternEntry {
  ko: RegExp;
  en: string;
  questionOnly?: boolean;
}
