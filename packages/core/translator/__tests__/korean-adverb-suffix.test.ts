import { describe, expect, it } from 'vitest';
import {
  createAdverb,
  extractStemFromAdverb,
  getAdverbSuffix,
  isValidAdverbSuffix,
} from '../src/dictionary/morphology/korean-adverb-suffix';

describe('korean-adverb-suffix (부사 -이/-히 규칙 제51항)', () => {
  describe('getAdverbSuffix', () => {
    describe('-이 전용 어간', () => {
      it('should return "i" for stems that only use -이', () => {
        expect(getAdverbSuffix('같')).toBe('i');
        expect(getAdverbSuffix('깊')).toBe('i');
        expect(getAdverbSuffix('높')).toBe('i');
        expect(getAdverbSuffix('많')).toBe('i');
      });
    });

    describe('-히 전용 어간', () => {
      it('should return "hi" for stems that only use -히', () => {
        expect(getAdverbSuffix('급')).toBe('hi');
        expect(getAdverbSuffix('극')).toBe('hi');
        expect(getAdverbSuffix('정확')).toBe('hi');
        expect(getAdverbSuffix('솔직')).toBe('hi');
      });
    });

    describe('복수형 어간 (-이/-히 둘 다 가능)', () => {
      it('should return "both" for stems that can use either', () => {
        expect(getAdverbSuffix('깨끗')).toBe('both');
        expect(getAdverbSuffix('반듯')).toBe('both');
      });
    });

    describe('일반 규칙', () => {
      it('should return "hi" for 2+ syllable stems without batchim', () => {
        // 2음절 이상 한자어는 대부분 -히
        expect(getAdverbSuffix('완전')).toBe('hi');
      });

      it('should return "hi" for stems with ㅎ batchim', () => {
        // 받침 ㅎ는 -히
        expect(getAdverbSuffix('조용')).toBe('hi');
        expect(getAdverbSuffix('고요')).toBe('hi');
      });
    });
  });

  describe('createAdverb', () => {
    it('should create correct adverb form with -이', () => {
      expect(createAdverb('같')).toBe('같이');
      expect(createAdverb('깊')).toBe('깊이');
      expect(createAdverb('높')).toBe('높이');
    });

    it('should create correct adverb form with -히', () => {
      expect(createAdverb('급')).toBe('급히');
      expect(createAdverb('정확')).toBe('정확히');
      expect(createAdverb('솔직')).toBe('솔직히');
    });

    it('should create correct adverb form with -이 for both type (default)', () => {
      expect(createAdverb('깨끗')).toBe('깨끗이');
    });
  });

  describe('extractStemFromAdverb', () => {
    it('should extract stem from -이 adverbs', () => {
      expect(extractStemFromAdverb('같이')).toBe('같');
      expect(extractStemFromAdverb('높이')).toBe('높');
    });

    it('should extract stem from -히 adverbs', () => {
      expect(extractStemFromAdverb('급히')).toBe('급');
      expect(extractStemFromAdverb('정확히')).toBe('정확');
    });

    it('should return null for non-adverb words', () => {
      expect(extractStemFromAdverb('사과')).toBeNull();
      expect(extractStemFromAdverb('달리기')).toBeNull();
    });
  });

  describe('isValidAdverbSuffix', () => {
    it('should validate correct suffix for -이 only stems', () => {
      expect(isValidAdverbSuffix('같', '이')).toBe(true);
      expect(isValidAdverbSuffix('같', '히')).toBe(false);
    });

    it('should validate correct suffix for -히 only stems', () => {
      expect(isValidAdverbSuffix('급', '히')).toBe(true);
      expect(isValidAdverbSuffix('급', '이')).toBe(false);
    });

    it('should validate both suffixes for both type stems', () => {
      expect(isValidAdverbSuffix('깨끗', '이')).toBe(true);
      expect(isValidAdverbSuffix('깨끗', '히')).toBe(true);
    });
  });

  describe('일반 규칙 - 상세 테스트', () => {
    describe('getAdverbSuffix 규칙 분기', () => {
      it('빈 문자열 처리', () => {
        expect(getAdverbSuffix('')).toBe('i');
      });

      it('한글 아닌 문자 처리', () => {
        expect(getAdverbSuffix('abc')).toBe('i');
        expect(getAdverbSuffix('123')).toBe('i');
      });

      it('받침 없는 1음절 → -이', () => {
        // 1음절 + 받침 없음 → -이
        expect(getAdverbSuffix('이')).toBe('i');
      });

      it('받침 없는 2음절 이상 → -히', () => {
        // 2음절 이상 한자어 대부분 -히
        expect(getAdverbSuffix('완전')).toBe('hi');
        expect(getAdverbSuffix('충분')).toBe('hi');
      });

      it('받침 ㅎ → -히', () => {
        // ㅎ 받침은 -히
        expect(getAdverbSuffix('닿')).toBe('hi');
      });

      it('받침 ㄱ + 2음절 이상 → -히', () => {
        expect(getAdverbSuffix('엄격')).toBe('hi');
      });

      it('받침 ㄱ + 1음절 → -이', () => {
        // 1음절 + ㄱ받침 → -이
        expect(getAdverbSuffix('억')).toBe('i');
      });

      it('받침 ㅂ → -히', () => {
        expect(getAdverbSuffix('답')).toBe('hi');
      });

      it('받침 ㅅ, ㅆ → -이', () => {
        expect(getAdverbSuffix('헛')).toBe('i');
        expect(getAdverbSuffix('있')).toBe('i');
      });

      it('받침 ㄴ + 2음절 이상 → -히', () => {
        expect(getAdverbSuffix('분명')).toBe('hi');
      });

      it('받침 ㄴ + 1음절 → -이', () => {
        expect(getAdverbSuffix('안')).toBe('i');
      });

      it('받침 ㅁ + 2음절 이상 → -히', () => {
        expect(getAdverbSuffix('꼼꼼')).toBe('hi');
      });

      it('받침 ㅁ + 1음절 → -이', () => {
        expect(getAdverbSuffix('좀')).toBe('i');
      });

      it('받침 ㄹ → -이', () => {
        expect(getAdverbSuffix('멀')).toBe('i');
        expect(getAdverbSuffix('빨')).toBe('i');
      });

      it('기타 받침 → -이 기본값', () => {
        // 기타 받침은 기본 -이
        expect(getAdverbSuffix('끝')).toBe('i');
      });
    });

    describe('createAdverb ㄹ받침 처리', () => {
      it('ㄹ받침 어간 + 이 → 멀리, 빨리', () => {
        expect(createAdverb('멀')).toBe('멀이');
        expect(createAdverb('빨')).toBe('빨이');
        expect(createAdverb('달')).toBe('달이');
      });
    });

    describe('extractStemFromAdverb -리 처리', () => {
      it('-리로 끝나는 부사 어간 추출', () => {
        expect(extractStemFromAdverb('빨리')).toBe('빨');
        expect(extractStemFromAdverb('멀리')).toBe('멀');
        expect(extractStemFromAdverb('달리')).toBe('달');
      });
    });
  });
});
