import { describe, expect, it } from 'vitest';
import {
  checkEnglishIrregular,
  checkKoreanIrregular,
  ENGLISH_IRREGULARS,
  findEnglishIrregular,
  findKoreanIrregular,
  getIrregularCount,
  KOREAN_IRREGULARS,
} from '../src/dictionary/exceptions/irregulars';

describe('Irregulars - 불규칙 활용', () => {
  describe('KOREAN_IRREGULARS 데이터', () => {
    it('한국어 불규칙 배열이 존재', () => {
      expect(KOREAN_IRREGULARS).toBeDefined();
      expect(Array.isArray(KOREAN_IRREGULARS)).toBe(true);
      expect(KOREAN_IRREGULARS.length).toBeGreaterThan(0);
    });

    it('각 항목이 올바른 구조', () => {
      for (const irr of KOREAN_IRREGULARS.slice(0, 10)) {
        expect(irr.base).toBeDefined();
        expect(typeof irr.base).toBe('string');
        expect(irr.type).toBeDefined();
        expect(irr.conjugations).toBeDefined();
      }
    });

    it('ㄷ불규칙 포함', () => {
      const found = KOREAN_IRREGULARS.find((irr) => irr.base === '듣');
      expect(found).toBeDefined();
      expect(found?.type).toBe('ㄷ→ㄹ');
    });
  });

  describe('ENGLISH_IRREGULARS 데이터', () => {
    it('영어 불규칙 배열이 존재', () => {
      expect(ENGLISH_IRREGULARS).toBeDefined();
      expect(Array.isArray(ENGLISH_IRREGULARS)).toBe(true);
      expect(ENGLISH_IRREGULARS.length).toBeGreaterThan(0);
    });

    it('각 항목이 올바른 구조', () => {
      for (const irr of ENGLISH_IRREGULARS.slice(0, 10)) {
        expect(irr.base).toBeDefined();
        expect(irr.past).toBeDefined();
        expect(irr.pp).toBeDefined();
      }
    });

    it('go 동사 포함', () => {
      const found = ENGLISH_IRREGULARS.find((irr) => irr.base === 'go');
      expect(found).toBeDefined();
      expect(found?.past).toBe('went');
      expect(found?.pp).toBe('gone');
    });
  });

  describe('findKoreanIrregular', () => {
    it('존재하는 불규칙 찾기', () => {
      const result = findKoreanIrregular('듣');
      expect(result).not.toBeNull();
      expect(result?.base).toBe('듣');
      expect(result?.type).toBe('ㄷ→ㄹ');
    });

    it('걷 불규칙 찾기', () => {
      const result = findKoreanIrregular('걷');
      expect(result).not.toBeNull();
      expect(result?.conjugations.polite).toBe('걸어요');
    });

    it('존재하지 않는 불규칙', () => {
      const result = findKoreanIrregular('없는단어');
      expect(result).toBeNull();
    });

    it('빈 문자열', () => {
      const result = findKoreanIrregular('');
      expect(result).toBeNull();
    });
  });

  describe('findEnglishIrregular', () => {
    it('go 동사 찾기', () => {
      const result = findEnglishIrregular('go');
      expect(result).not.toBeNull();
      expect(result?.past).toBe('went');
      expect(result?.pp).toBe('gone');
    });

    it('be 동사 찾기', () => {
      const result = findEnglishIrregular('be');
      expect(result).not.toBeNull();
      expect(result?.past).toBe('was/were');
    });

    it('have 동사 찾기', () => {
      const result = findEnglishIrregular('have');
      expect(result).not.toBeNull();
      expect(result?.past).toBe('had');
    });

    it('존재하지 않는 동사', () => {
      const result = findEnglishIrregular('xyz');
      expect(result).toBeNull();
    });

    it('빈 문자열', () => {
      const result = findEnglishIrregular('');
      expect(result).toBeNull();
    });
  });

  describe('checkKoreanIrregular', () => {
    it('과거형 매칭', () => {
      const result = checkKoreanIrregular('들었다');
      expect(result).toBe('들었다');
    });

    it('현재형 매칭', () => {
      const result = checkKoreanIrregular('듣는다');
      expect(result).toBe('듣는다');
    });

    it('존경형 매칭', () => {
      const result = checkKoreanIrregular('들어요');
      expect(result).toBe('들어요');
    });

    it('매칭 안 되는 단어', () => {
      const result = checkKoreanIrregular('없는활용형');
      expect(result).toBeNull();
    });

    it('빈 문자열', () => {
      const result = checkKoreanIrregular('');
      expect(result).toBeNull();
    });
  });

  describe('checkEnglishIrregular', () => {
    it('과거형 매칭', () => {
      const result = checkEnglishIrregular('went');
      expect(result).toBe('went');
    });

    it('과거분사 매칭', () => {
      const result = checkEnglishIrregular('gone');
      expect(result).toBe('gone');
    });

    it('원형 매칭', () => {
      const result = checkEnglishIrregular('go');
      expect(result).toBe('go');
    });

    it('had 매칭', () => {
      const result = checkEnglishIrregular('had');
      expect(result).toBe('had');
    });

    it('매칭 안 되는 단어', () => {
      const result = checkEnglishIrregular('xyz');
      expect(result).toBeNull();
    });

    it('빈 문자열', () => {
      const result = checkEnglishIrregular('');
      expect(result).toBeNull();
    });
  });

  describe('getIrregularCount', () => {
    it('올바른 개수 반환', () => {
      const count = getIrregularCount();
      expect(count.korean).toBe(KOREAN_IRREGULARS.length);
      expect(count.english).toBe(ENGLISH_IRREGULARS.length);
      expect(count.total).toBe(KOREAN_IRREGULARS.length + ENGLISH_IRREGULARS.length);
    });

    it('총 개수가 양수', () => {
      const count = getIrregularCount();
      expect(count.total).toBeGreaterThan(0);
    });
  });
});
