import { describe, expect, it } from 'vitest';
import {
  hasStem,
  isAdjective,
  isNoun,
  isVerb,
  STEMS,
  translateStemEnToKo,
  translateStemKoToEn,
} from '../src/dictionary/entries/stems';

describe('stems - 어간 사전', () => {
  describe('STEMS 데이터', () => {
    it('koToEn 맵이 존재', () => {
      expect(STEMS.koToEn).toBeDefined();
      expect(Object.keys(STEMS.koToEn).length).toBeGreaterThan(0);
    });

    it('enToKo 맵이 존재', () => {
      expect(STEMS.enToKo).toBeDefined();
      expect(Object.keys(STEMS.enToKo).length).toBeGreaterThan(0);
    });

    it('동사 어간 포함', () => {
      expect(STEMS.koToEn['가']).toBe('go');
      expect(STEMS.koToEn['먹']).toBe('eat');
      expect(STEMS.koToEn['보']).toBe('see');
    });

    it('형용사 어간 포함', () => {
      expect(STEMS.koToEn['크']).toBe('big');
      expect(STEMS.koToEn['좋']).toBe('good');
      expect(STEMS.koToEn['빠르']).toBe('fast');
    });

    it('명사 어간 포함', () => {
      expect(STEMS.koToEn['사랑']).toBe('love');
      expect(STEMS.koToEn['행복']).toBe('happiness');
      expect(STEMS.koToEn['평화']).toBe('peace');
    });
  });

  describe('translateStemKoToEn', () => {
    it('존재하는 동사 어간 번역', () => {
      expect(translateStemKoToEn('가')).toBe('go');
      expect(translateStemKoToEn('오')).toBe('come');
      expect(translateStemKoToEn('먹')).toBe('eat');
    });

    it('존재하는 형용사 어간 번역', () => {
      expect(translateStemKoToEn('크')).toBe('big');
      expect(translateStemKoToEn('작')).toBe('small');
    });

    it('존재하는 명사 어간 번역', () => {
      expect(translateStemKoToEn('사랑')).toBe('love');
      expect(translateStemKoToEn('희망')).toBe('hope');
    });

    it('존재하지 않는 어간', () => {
      expect(translateStemKoToEn('없는단어')).toBeNull();
      expect(translateStemKoToEn('')).toBeNull();
    });
  });

  describe('translateStemEnToKo', () => {
    it('존재하는 동사 어간 번역', () => {
      expect(translateStemEnToKo('go')).toBe('가');
      expect(translateStemEnToKo('come')).toBe('오');
      expect(translateStemEnToKo('eat')).toBe('먹');
    });

    it('존재하는 형용사 어간 번역', () => {
      expect(translateStemEnToKo('big')).toBe('크');
      expect(translateStemEnToKo('small')).toBe('작');
    });

    it('존재하는 명사 어간 번역', () => {
      expect(translateStemEnToKo('love')).toBe('사랑');
      expect(translateStemEnToKo('hope')).toBe('희망');
    });

    it('존재하지 않는 어간', () => {
      expect(translateStemEnToKo('nonexistent')).toBeNull();
      expect(translateStemEnToKo('')).toBeNull();
    });
  });

  describe('hasStem', () => {
    it('한→영 방향 존재 확인', () => {
      expect(hasStem('가', 'ko-en')).toBe(true);
      expect(hasStem('먹', 'ko-en')).toBe(true);
      expect(hasStem('없는단어', 'ko-en')).toBe(false);
    });

    it('영→한 방향 존재 확인', () => {
      expect(hasStem('go', 'en-ko')).toBe(true);
      expect(hasStem('eat', 'en-ko')).toBe(true);
      expect(hasStem('nonexistent', 'en-ko')).toBe(false);
    });

    it('빈 문자열', () => {
      expect(hasStem('', 'ko-en')).toBe(false);
      expect(hasStem('', 'en-ko')).toBe(false);
    });
  });

  describe('isVerb', () => {
    it('동사 어간 확인', () => {
      expect(isVerb('가')).toBe(true);
      expect(isVerb('먹')).toBe(true);
      expect(isVerb('보')).toBe(true);
      expect(isVerb('듣')).toBe(true);
      expect(isVerb('일하')).toBe(true);
    });

    it('형용사/명사는 false', () => {
      expect(isVerb('크')).toBe(false);
      expect(isVerb('사랑')).toBe(false);
    });

    it('존재하지 않는 어간', () => {
      expect(isVerb('없는단어')).toBe(false);
      expect(isVerb('')).toBe(false);
    });
  });

  describe('isAdjective', () => {
    it('형용사 어간 확인', () => {
      expect(isAdjective('크')).toBe(true);
      expect(isAdjective('작')).toBe(true);
      expect(isAdjective('좋')).toBe(true);
      expect(isAdjective('아름답')).toBe(true);
      expect(isAdjective('빠르')).toBe(true);
    });

    it('동사/명사는 false', () => {
      expect(isAdjective('가')).toBe(false);
      expect(isAdjective('사랑')).toBe(false);
    });

    it('존재하지 않는 어간', () => {
      expect(isAdjective('없는단어')).toBe(false);
      expect(isAdjective('')).toBe(false);
    });
  });

  describe('isNoun', () => {
    it('명사 어간 확인', () => {
      expect(isNoun('사랑')).toBe(true);
      expect(isNoun('행복')).toBe(true);
      expect(isNoun('평화')).toBe(true);
      expect(isNoun('자유')).toBe(true);
      expect(isNoun('희망')).toBe(true);
    });

    it('동사/형용사는 false', () => {
      expect(isNoun('가')).toBe(false);
      expect(isNoun('크')).toBe(false);
    });

    it('존재하지 않는 어간', () => {
      expect(isNoun('없는단어')).toBe(false);
      expect(isNoun('')).toBe(false);
    });
  });

  describe('어간 분류 일관성', () => {
    it('하나의 어간은 하나의 품사에만 속함', () => {
      // 동사
      const verbStems = ['가', '먹', '보'];
      for (const stem of verbStems) {
        expect(isVerb(stem)).toBe(true);
        expect(isAdjective(stem)).toBe(false);
        expect(isNoun(stem)).toBe(false);
      }

      // 형용사
      const adjStems = ['크', '작', '좋'];
      for (const stem of adjStems) {
        expect(isVerb(stem)).toBe(false);
        expect(isAdjective(stem)).toBe(true);
        expect(isNoun(stem)).toBe(false);
      }

      // 명사
      const nounStems = ['사랑', '희망', '평화'];
      for (const stem of nounStems) {
        expect(isVerb(stem)).toBe(false);
        expect(isAdjective(stem)).toBe(false);
        expect(isNoun(stem)).toBe(true);
      }
    });
  });
});
