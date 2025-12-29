import { describe, expect, it } from 'vitest';
import {
  calculateKeyboardSimilarity,
  decomposeToJamos,
  isAdjacentKey,
  isDoubleConsonantMistake,
  jamoEditDistance,
  keyboardDistance,
  similarity,
} from '../src';

describe('distance', () => {
  describe('decomposeToJamos', () => {
    it('should decompose Korean text into jamos', () => {
      expect(decomposeToJamos('가')).toEqual(['ㄱ', 'ㅏ']);
      expect(decomposeToJamos('강')).toEqual(['ㄱ', 'ㅏ', 'ㅇ']);
      expect(decomposeToJamos('한글')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ']);
    });

    it('should preserve non-Korean characters', () => {
      expect(decomposeToJamos('ABC')).toEqual(['A', 'B', 'C']);
      expect(decomposeToJamos('한A글')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'A', 'ㄱ', 'ㅡ', 'ㄹ']);
    });
  });

  describe('isDoubleConsonantMistake', () => {
    it('should detect double consonant pairs', () => {
      expect(isDoubleConsonantMistake('ㄱ', 'ㄲ')).toBe(true);
      expect(isDoubleConsonantMistake('ㄲ', 'ㄱ')).toBe(true);
      expect(isDoubleConsonantMistake('ㅅ', 'ㅆ')).toBe(true);
      expect(isDoubleConsonantMistake('ㅂ', 'ㅃ')).toBe(true);
    });

    it('should return false for non-pairs', () => {
      expect(isDoubleConsonantMistake('ㄱ', 'ㄴ')).toBe(false);
      expect(isDoubleConsonantMistake('ㅅ', 'ㅈ')).toBe(false);
    });
  });

  describe('isAdjacentKey', () => {
    it('should detect adjacent keys', () => {
      expect(isAdjacentKey('ㄱ', 'ㅅ')).toBe(true);
      expect(isAdjacentKey('ㄱ', 'ㄷ')).toBe(true);
      expect(isAdjacentKey('ㅏ', 'ㅣ')).toBe(true);
    });

    it('should return false for non-adjacent keys', () => {
      expect(isAdjacentKey('ㄱ', 'ㅁ')).toBe(false);
      expect(isAdjacentKey('ㅂ', 'ㅎ')).toBe(false);
    });
  });

  describe('keyboardDistance', () => {
    it('should return 0 for same position (shift variants)', () => {
      expect(keyboardDistance('ㄱ', 'ㄲ')).toBe(0);
      expect(keyboardDistance('ㅅ', 'ㅆ')).toBe(0);
    });

    it('should return small distance for adjacent keys', () => {
      const dist = keyboardDistance('ㄱ', 'ㅅ');
      expect(dist).toBeLessThanOrEqual(1.5);
    });
  });

  describe('jamoEditDistance', () => {
    it('should return 0 for identical words', () => {
      expect(jamoEditDistance('안녕', '안녕')).toBe(0);
      expect(jamoEditDistance('한글', '한글')).toBe(0);
    });

    it('should return low cost for double consonant mistakes', () => {
      const dist = jamoEditDistance('사과', '싸과');
      expect(dist).toBeLessThan(1);
    });

    it('should return higher cost for different words', () => {
      const dist = jamoEditDistance('사과', '바나나');
      expect(dist).toBeGreaterThan(3);
    });
  });

  describe('similarity', () => {
    it('should return 1 for identical words', () => {
      expect(similarity('안녕', '안녕')).toBe(1);
    });

    it('should return high similarity for similar words', () => {
      expect(similarity('사과', '싸과')).toBeGreaterThan(0.8);
    });

    it('should return low similarity for different words', () => {
      expect(similarity('사과', '바나나')).toBeLessThan(0.5);
    });

    it('should return 0 for empty strings', () => {
      expect(similarity('', '안녕')).toBe(0);
      expect(similarity('안녕', '')).toBe(0);
    });
  });

  describe('calculateKeyboardSimilarity', () => {
    it('should be an alias for similarity', () => {
      expect(calculateKeyboardSimilarity('안녕', '안녕')).toBe(similarity('안녕', '안녕'));
      expect(calculateKeyboardSimilarity('사과', '싸과')).toBe(similarity('사과', '싸과'));
    });
  });
});
