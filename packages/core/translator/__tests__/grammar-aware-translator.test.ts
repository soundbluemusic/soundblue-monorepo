import { describe, expect, it } from 'vitest';
import { analyzeMorpheme } from '../src/analysis/syntax/morpheme-analyzer';
import { parseSentence } from '../src/analysis/syntax/sentence-parser';
import {
  generateBySentenceType,
  rearrangeByConstituents,
  translateByPartOfSpeech,
  translateKoToEnGrammarAware,
} from '../src/engine/grammar-aware-translator';

describe('grammar-aware-translator', () => {
  describe('9품사별 번역 (translateByPartOfSpeech)', () => {
    describe('감탄사 (interjection)', () => {
      it('should translate interjections', () => {
        const analysis = analyzeMorpheme('안녕하세요');
        expect(translateByPartOfSpeech(analysis)).toBe('hello');
      });

      it('should translate emotional interjections', () => {
        const analysis = analyzeMorpheme('와');
        expect(translateByPartOfSpeech(analysis)).toBe('wow');
      });
    });

    describe('수사 (number)', () => {
      it('should translate native Korean numerals', () => {
        const analysis = analyzeMorpheme('하나');
        expect(translateByPartOfSpeech(analysis)).toBe('one');
      });

      it('should translate Sino-Korean numerals', () => {
        const analysis = analyzeMorpheme('일');
        expect(translateByPartOfSpeech(analysis)).toBe('one');
      });

      it('should translate ordinal numerals', () => {
        const analysis = analyzeMorpheme('첫째');
        expect(translateByPartOfSpeech(analysis)).toBe('first');
      });
    });

    describe('관형사 (determiner)', () => {
      it('should translate demonstrative determiners', () => {
        const analysis = analyzeMorpheme('이런');
        expect(translateByPartOfSpeech(analysis)).toBe('this kind of');
      });

      it('should translate descriptive determiners', () => {
        const analysis = analyzeMorpheme('새');
        expect(translateByPartOfSpeech(analysis)).toBe('new');
      });

      it('should translate numeral determiners', () => {
        const analysis = analyzeMorpheme('모든');
        expect(translateByPartOfSpeech(analysis)).toBe('all');
      });
    });

    describe('대명사 (pronoun)', () => {
      it('should translate first person pronouns', () => {
        const analysis = analyzeMorpheme('나');
        expect(translateByPartOfSpeech(analysis)).toBe('I');
      });

      it('should translate third person pronouns', () => {
        const analysis = analyzeMorpheme('그녀');
        expect(translateByPartOfSpeech(analysis)).toBe('she');
      });
    });

    describe('부사 (adverb)', () => {
      it('should translate time adverbs', () => {
        const analysis = analyzeMorpheme('오늘');
        expect(translateByPartOfSpeech(analysis)).toBe('today');
      });

      it('should translate manner adverbs', () => {
        const analysis = analyzeMorpheme('빨리');
        expect(translateByPartOfSpeech(analysis)).toBe('quickly');
      });
    });
  });

  describe('7문장성분 어순 변환 (rearrangeByConstituents)', () => {
    it('should rearrange SOV to SVO', () => {
      const parsed = parseSentence('나는 밥을 먹는다');
      const parts = rearrangeByConstituents(parsed);
      // Subject should come first, then verb, then object
      expect(parts.length).toBeGreaterThan(0);
    });

    it('should place time adverbials at the beginning', () => {
      const parsed = parseSentence('오늘 학교에 간다');
      const parts = rearrangeByConstituents(parsed);
      // Time adverb should be first
      expect(parts[0]?.toLowerCase()).toContain('today');
    });

    it('should handle subject omission', () => {
      const parsed = parseSentence('밥을 먹었다');
      expect(parsed.subjectOmitted).toBe(true);
    });
  });

  describe('5문장종류 생성 (generateBySentenceType)', () => {
    it('should generate declarative sentences with period', () => {
      const parsed = parseSentence('나는 학생입니다');
      const parts = rearrangeByConstituents(parsed);
      const result = generateBySentenceType(parts, 'declarative', parsed);
      expect(result).toMatch(/\.$/);
    });

    it('should generate interrogative sentences with question mark', () => {
      const parsed = parseSentence('밥 먹었니?');
      const parts = rearrangeByConstituents(parsed);
      const result = generateBySentenceType(parts, 'interrogative', parsed);
      expect(result).toMatch(/\?$/);
    });

    it('should generate cohortative sentences with "Let\'s"', () => {
      const parsed = parseSentence('가자');
      const parts = rearrangeByConstituents(parsed);
      const result = generateBySentenceType(parts, 'cohortative', parsed);
      expect(result.toLowerCase()).toContain("let's");
    });

    it('should generate exclamatory sentences with exclamation mark', () => {
      const parsed = parseSentence('정말 예쁘구나');
      const parts = rearrangeByConstituents(parsed);
      const result = generateBySentenceType(parts, 'exclamatory', parsed);
      expect(result).toMatch(/!$/);
    });
  });

  describe('통합 번역 (translateKoToEnGrammarAware)', () => {
    it('should translate simple declarative sentence', () => {
      const result = translateKoToEnGrammarAware('나는 학생입니다');
      expect(result.sentenceType).toBe('declarative');
      expect(result.translated).toBeTruthy();
    });

    it('should translate interrogative sentence', () => {
      const result = translateKoToEnGrammarAware('밥 먹었니?');
      expect(result.sentenceType).toBe('interrogative');
    });

    it('should translate cohortative sentence', () => {
      const result = translateKoToEnGrammarAware('같이 가자');
      expect(result.sentenceType).toBe('cohortative');
    });

    it('should translate exclamatory sentence', () => {
      const result = translateKoToEnGrammarAware('정말 좋구나');
      expect(result.sentenceType).toBe('exclamatory');
    });

    it('should handle interjections as independent constituents', () => {
      const result = translateKoToEnGrammarAware('와 좋다');
      expect(result.constituents.independents.length).toBeGreaterThan(0);
    });

    it('should identify sentence constituents', () => {
      const result = translateKoToEnGrammarAware('나는 밥을 먹었다');
      expect(result.constituents.subject).toBeTruthy();
      expect(result.constituents.verb).toBeTruthy();
      expect(result.constituents.object).toBeTruthy();
    });
  });
});
