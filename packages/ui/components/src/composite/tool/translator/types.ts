/**
 * 번역기 타입 정의
 */

import type { TranslationDirection } from './settings';

// Benchmark test types
export interface TestCase {
  id: string;
  input: string;
  expected: string;
  direction: TranslationDirection;
}

export interface TestCategory {
  id: string;
  name: string;
  nameKo: string;
  tests: TestCase[];
}

export interface TestLevel {
  id: string;
  name: string;
  nameKo: string;
  categories: TestCategory[];
}

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
