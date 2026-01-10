import { describe, expect, it } from 'vitest';
import { analyzeMorpheme } from '../src/analysis/syntax/morpheme-analyzer';
import { parseSentence } from '../src/analysis/syntax/sentence-parser';

describe('sentence-parser', () => {
  describe('5가지 문장종류 (SentenceType)', () => {
    describe('평서문 (declarative)', () => {
      it('should detect declarative sentences', () => {
        const result = parseSentence('나는 학생입니다');
        expect(result.sentenceType).toBe('declarative');
      });
    });

    describe('의문문 (interrogative)', () => {
      it('should detect interrogative sentences with ?', () => {
        const result = parseSentence('뭐 해요?');
        expect(result.sentenceType).toBe('interrogative');
      });

      it('should detect interrogative sentences with 니까 ending', () => {
        const result = parseSentence('밥 먹었습니까');
        expect(result.isQuestion).toBe(true);
      });
    });

    describe('명령문 (imperative)', () => {
      it('should detect imperative sentences with -아라/-어라', () => {
        const result = parseSentence('먹어라');
        expect(result.sentenceType).toBe('imperative');
      });
    });

    describe('청유문 (cohortative)', () => {
      it('should detect cohortative sentences with -자', () => {
        const result = parseSentence('가자');
        expect(result.sentenceType).toBe('cohortative');
      });

      it('should detect cohortative sentences with -하자', () => {
        const result = parseSentence('하자');
        expect(result.sentenceType).toBe('cohortative');
      });
    });

    describe('감탄문 (exclamatory)', () => {
      it('should detect exclamatory sentences with -구나', () => {
        const result = parseSentence('정말 예쁘구나');
        expect(result.sentenceType).toBe('exclamatory');
      });

      it('should detect exclamatory sentences with -네요', () => {
        const result = parseSentence('정말 맛있네요');
        expect(result.sentenceType).toBe('exclamatory');
      });
    });
  });

  describe('7가지 문장성분 (Constituent Roles)', () => {
    describe('주어 (subject)', () => {
      it('should detect subject with -이/-가', () => {
        const result = parseSentence('고양이가 달립니다');
        expect(result.subject?.text).toBe('고양이가');
      });
    });

    describe('목적어 (object)', () => {
      it('should detect object with -을/-를', () => {
        const result = parseSentence('나는 책을 읽습니다');
        expect(result.object?.text).toBe('책을');
      });
    });

    describe('서술어 (predicate)', () => {
      it('should detect predicate', () => {
        const result = parseSentence('나는 간다');
        expect(result.predicate?.text).toBe('간다');
      });
    });

    describe('부사어 (adverbial)', () => {
      it('should detect adverbial with -에/-에서', () => {
        const result = parseSentence('학교에서 공부합니다');
        expect(result.adverbials.length).toBeGreaterThan(0);
      });
    });

    describe('독립어 (independent)', () => {
      it('should detect interjections as independent', () => {
        const result = parseSentence('와 좋다');
        expect(result.independents.length).toBeGreaterThan(0);
      });

      it('should detect single interjection correctly', () => {
        const result = parseSentence('아이고');
        expect(result.independents.length).toBeGreaterThan(0);
        expect(result.independents[0]?.text).toBe('아이고');
      });
    });
  });
});

describe('morpheme-analyzer', () => {
  describe('9품사 (PartOfSpeech)', () => {
    describe('감탄사 (interjection)', () => {
      it('should detect common interjections', () => {
        expect(analyzeMorpheme('아이고').pos).toBe('interjection');
        expect(analyzeMorpheme('어머').pos).toBe('interjection');
        expect(analyzeMorpheme('헐').pos).toBe('interjection');
      });

      it('should detect greetings as interjections', () => {
        expect(analyzeMorpheme('안녕하세요').pos).toBe('interjection');
        expect(analyzeMorpheme('감사합니다').pos).toBe('interjection');
      });

      it('should detect response words as interjections', () => {
        expect(analyzeMorpheme('네').pos).toBe('interjection');
        expect(analyzeMorpheme('예').pos).toBe('interjection');
        expect(analyzeMorpheme('아니요').pos).toBe('interjection');
      });

      it('should have independent role for interjections', () => {
        expect(analyzeMorpheme('와').role).toBe('independent');
        expect(analyzeMorpheme('세상에').role).toBe('independent');
      });
    });

    describe('부사 (adverb)', () => {
      it('should detect pure adverbs', () => {
        expect(analyzeMorpheme('빨리').pos).toBe('adverb');
        expect(analyzeMorpheme('많이').pos).toBe('adverb');
      });
    });

    describe('대명사 (pronoun)', () => {
      it('should detect pronouns', () => {
        expect(analyzeMorpheme('나').pos).toBe('pronoun');
        expect(analyzeMorpheme('너').pos).toBe('pronoun');
      });
    });
  });

  describe('문장종류 어미 (SentenceKind)', () => {
    describe('청유문 어미', () => {
      it('should detect cohortative endings', () => {
        const result = analyzeMorpheme('가자');
        expect(result.ending).toBe('자');
      });
    });

    describe('명령문 어미', () => {
      it('should detect imperative endings', () => {
        const result = analyzeMorpheme('가세요');
        expect(result.ending).toBe('세요');
      });
    });

    describe('감탄문 어미', () => {
      it('should detect exclamatory endings', () => {
        const result = analyzeMorpheme('좋구나');
        expect(result.ending).toBe('구나');
      });
    });
  });
});
