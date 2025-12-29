import { describe, expect, it } from 'vitest';
import {
  compose,
  decompose,
  decomposeAll,
  extractCho,
  getBatchim,
  hasBatchim,
  hasLastBatchim,
  isConsonant,
  isHangul,
  isJamo,
  isVowel,
  removeBatchim,
  splitDoubleJong,
} from '../src';

describe('jamo', () => {
  describe('decompose', () => {
    it('should decompose 한 to ㅎㅏㄴ', () => {
      expect(decompose('한')).toEqual({ cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' });
    });

    it('should decompose 가 to ㄱㅏ (no jong)', () => {
      expect(decompose('가')).toEqual({ cho: 'ㄱ', jung: 'ㅏ', jong: '' });
    });

    it('should decompose 글 to ㄱㅡㄹ', () => {
      expect(decompose('글')).toEqual({ cho: 'ㄱ', jung: 'ㅡ', jong: 'ㄹ' });
    });

    it('should return null for non-hangul', () => {
      expect(decompose('a')).toBeNull();
      expect(decompose('1')).toBeNull();
      expect(decompose(' ')).toBeNull();
    });
  });

  describe('compose', () => {
    it('should compose ㅎㅏㄴ to 한', () => {
      expect(compose({ cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' })).toBe('한');
    });

    it('should compose ㄱㅏ to 가', () => {
      expect(compose({ cho: 'ㄱ', jung: 'ㅏ', jong: '' })).toBe('가');
    });

    it('should compose ㄱㅡㄹ to 글', () => {
      expect(compose({ cho: 'ㄱ', jung: 'ㅡ', jong: 'ㄹ' })).toBe('글');
    });
  });

  describe('decomposeAll', () => {
    it('should decompose 한글 to individual jamos', () => {
      expect(decomposeAll('한글')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ']);
    });

    it('should preserve non-hangul characters', () => {
      expect(decomposeAll('한A글')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'A', 'ㄱ', 'ㅡ', 'ㄹ']);
    });
  });

  describe('isHangul', () => {
    it('should return true for hangul syllables', () => {
      expect(isHangul('가')).toBe(true);
      expect(isHangul('한')).toBe(true);
      expect(isHangul('힣')).toBe(true);
    });

    it('should return false for non-hangul', () => {
      expect(isHangul('a')).toBe(false);
      expect(isHangul('1')).toBe(false);
      expect(isHangul('ㄱ')).toBe(false); // jamo, not syllable
    });
  });

  describe('isJamo', () => {
    it('should return true for jamo characters', () => {
      expect(isJamo('ㄱ')).toBe(true);
      expect(isJamo('ㅏ')).toBe(true);
      expect(isJamo('ㅎ')).toBe(true);
    });

    it('should return false for non-jamo', () => {
      expect(isJamo('가')).toBe(false);
      expect(isJamo('a')).toBe(false);
    });
  });

  describe('isVowel', () => {
    it('should return true for vowels', () => {
      expect(isVowel('ㅏ')).toBe(true);
      expect(isVowel('ㅣ')).toBe(true);
      expect(isVowel('ㅘ')).toBe(true);
    });

    it('should return false for consonants', () => {
      expect(isVowel('ㄱ')).toBe(false);
      expect(isVowel('ㅎ')).toBe(false);
    });
  });

  describe('isConsonant', () => {
    it('should return true for consonants', () => {
      expect(isConsonant('ㄱ')).toBe(true);
      expect(isConsonant('ㅎ')).toBe(true);
      expect(isConsonant('ㄲ')).toBe(true);
    });

    it('should return false for vowels', () => {
      expect(isConsonant('ㅏ')).toBe(false);
      expect(isConsonant('ㅣ')).toBe(false);
    });
  });

  describe('hasBatchim', () => {
    it('should return true for syllables with batchim', () => {
      expect(hasBatchim('한')).toBe(true);
      expect(hasBatchim('글')).toBe(true);
      expect(hasBatchim('닭')).toBe(true);
    });

    it('should return false for syllables without batchim', () => {
      expect(hasBatchim('하')).toBe(false);
      expect(hasBatchim('가')).toBe(false);
    });
  });

  describe('getBatchim', () => {
    it('should return the batchim of a syllable', () => {
      expect(getBatchim('한')).toBe('ㄴ');
      expect(getBatchim('글')).toBe('ㄹ');
      expect(getBatchim('닭')).toBe('ㄺ');
    });

    it('should return empty string for syllables without batchim', () => {
      expect(getBatchim('하')).toBe('');
      expect(getBatchim('가')).toBe('');
    });
  });

  describe('hasLastBatchim', () => {
    it('should check the last character of a string', () => {
      expect(hasLastBatchim('안녕')).toBe(true);
      expect(hasLastBatchim('하세요')).toBe(false);
      expect(hasLastBatchim('감사합니다')).toBe(false);
    });
  });

  describe('removeBatchim', () => {
    it('should remove batchim from a syllable', () => {
      expect(removeBatchim('한')).toBe('하');
      expect(removeBatchim('글')).toBe('그');
    });
  });

  describe('splitDoubleJong', () => {
    it('should split double consonants', () => {
      expect(splitDoubleJong('ㄳ')).toEqual(['ㄱ', 'ㅅ']);
      expect(splitDoubleJong('ㄺ')).toEqual(['ㄹ', 'ㄱ']);
      expect(splitDoubleJong('ㅄ')).toEqual(['ㅂ', 'ㅅ']);
    });

    it('should return null for single consonants', () => {
      expect(splitDoubleJong('ㄱ')).toBeNull();
      expect(splitDoubleJong('ㄴ')).toBeNull();
    });
  });

  describe('extractCho', () => {
    it('should extract initial consonants from text', () => {
      expect(extractCho('한글')).toBe('ㅎㄱ');
      expect(extractCho('대한민국')).toBe('ㄷㅎㅁㄱ');
    });
  });
});
