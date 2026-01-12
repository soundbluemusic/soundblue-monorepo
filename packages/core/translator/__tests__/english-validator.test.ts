import { describe, expect, it } from 'vitest';
import { quickValidate, validateEnglish } from '../src/analysis/syntax/english-validator';

describe('quickValidate - 빠른 영어 문법 교정', () => {
  describe('대문자 처리', () => {
    it('문장 첫 글자를 대문자로 변환', () => {
      expect(quickValidate('hello world')).toBe('Hello world');
    });

    it('I는 항상 대문자', () => {
      expect(quickValidate('i am happy')).toBe('I am happy');
      expect(quickValidate('he and i went')).toBe('He and I went');
    });
  });

  describe('관사 a/an 교정', () => {
    it('a + 모음 → an', () => {
      expect(quickValidate('a apple')).toBe('An apple');
      expect(quickValidate('a orange')).toBe('An orange');
    });

    it('an + 자음 → a', () => {
      expect(quickValidate('an book')).toBe('A book');
      expect(quickValidate('an car')).toBe('A car');
    });
  });

  describe('공백 정규화', () => {
    it('중복 공백 제거', () => {
      expect(quickValidate('hello  world')).toBe('Hello world');
      expect(quickValidate('a   b   c')).toBe('A b c');
    });

    it('문장부호 앞 공백 제거', () => {
      expect(quickValidate('hello .')).toBe('Hello.');
      expect(quickValidate('hello , world')).toBe('Hello, world');
    });
  });
});

describe('validateEnglish - 상세 영어 문법 검증', () => {
  describe('관사 검증', () => {
    it('a/an 오류 감지 및 교정', () => {
      const result = validateEnglish('a apple');
      expect(result.corrected).toBe('An apple');
      expect(result.errors.some((e) => e.type === 'article')).toBe(true);
    });

    it('예외 단어 처리: university (a가 맞음)', () => {
      const result = validateEnglish('an university');
      expect(result.corrected).toBe('A university');
    });

    it('예외 단어 처리: hour (an이 맞음)', () => {
      const result = validateEnglish('a hour');
      expect(result.corrected).toBe('An hour');
    });
  });

  describe('be동사 누락 검증', () => {
    it('"He happy" → "He is happy"', () => {
      const result = validateEnglish('He happy');
      expect(result.corrected).toBe('He is happy');
      expect(result.errors.some((e) => e.type === 'missing-be')).toBe(true);
    });

    it('"She tired" → "She is tired"', () => {
      const result = validateEnglish('She tired');
      expect(result.corrected).toBe('She is tired');
    });

    it('"I sad" → "I am sad"', () => {
      const result = validateEnglish('I sad');
      expect(result.corrected).toBe('I am sad');
    });
  });

  describe('주어-동사 일치', () => {
    it('"He go" → "He goes"', () => {
      const result = validateEnglish('He go');
      expect(result.corrected).toBe('He goes');
      expect(result.errors.some((e) => e.type === 'subject-verb')).toBe(true);
    });

    it('"She like" → "She likes"', () => {
      const result = validateEnglish('She like');
      expect(result.corrected).toBe('She likes');
    });

    it('이미 활용된 동사는 그대로 유지', () => {
      const result = validateEnglish('He goes');
      expect(result.corrected).toBe('He goes');
      expect(result.errors.filter((e) => e.type === 'subject-verb')).toHaveLength(0);
    });
  });

  describe('단어 반복 검증', () => {
    it('"the the" → "the"', () => {
      const result = validateEnglish('the the book');
      expect(result.corrected).toBe('The book');
      expect(result.errors.some((e) => e.type === 'repetition')).toBe(true);
    });

    it('의도적 반복은 유지: "very very"', () => {
      const result = validateEnglish('very very good');
      expect(result.corrected).toBe('Very very good');
    });
  });

  describe('대문자 검증', () => {
    it('문장 첫 글자 대문자', () => {
      const result = validateEnglish('hello world');
      expect(result.corrected).toBe('Hello world');
    });

    it('문장 부호 후 대문자', () => {
      const result = validateEnglish('Hello. world');
      expect(result.corrected).toBe('Hello. World');
    });

    it('I는 항상 대문자', () => {
      const result = validateEnglish('he and i');
      expect(result.corrected).toBe('He and I');
      expect(result.errors.some((e) => e.type === 'capitalization')).toBe(true);
    });
  });

  describe('복합 오류 교정', () => {
    it('여러 오류 동시 교정', () => {
      const result = validateEnglish('a apple is  good');
      expect(result.corrected).toBe('An apple is good');
      expect(result.wasModified).toBe(true);
    });
  });
});
