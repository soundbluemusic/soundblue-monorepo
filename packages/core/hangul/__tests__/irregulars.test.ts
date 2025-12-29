import { describe, expect, it } from 'vitest';
import { applyIrregular, getIrregularType, irregularStems } from '../src';

describe('irregulars', () => {
  describe('irregularStems', () => {
    it('should contain known irregular stems', () => {
      expect(irregularStems['ㄷ']).toContain('듣');
      expect(irregularStems['ㅂ']).toContain('돕');
      expect(irregularStems['ㅎ']).toContain('파랗');
      expect(irregularStems['ㅅ']).toContain('짓');
      expect(irregularStems['르']).toContain('빠르');
    });
  });

  describe('getIrregularType', () => {
    it('should return the correct irregular type', () => {
      expect(getIrregularType('듣')).toBe('ㄷ');
      expect(getIrregularType('돕')).toBe('ㅂ');
      expect(getIrregularType('파랗')).toBe('ㅎ');
      expect(getIrregularType('짓')).toBe('ㅅ');
      expect(getIrregularType('빠르')).toBe('르');
      expect(getIrregularType('쓰')).toBe('으');
    });

    it('should return null for regular stems', () => {
      expect(getIrregularType('먹')).toBeNull();
      expect(getIrregularType('가')).toBeNull();
    });
  });

  describe('applyIrregular', () => {
    it('should apply ㄷ irregular: 듣 + 어요 → 들어요', () => {
      expect(applyIrregular('듣', '어요')).toBe('들어요');
    });

    it('should apply ㅂ irregular: 돕 + 아요 → 도와요', () => {
      expect(applyIrregular('돕', '아요')).toBe('도와요');
    });

    it('should apply ㅂ irregular: 춥 + 어요 → 추워요', () => {
      expect(applyIrregular('춥', '어요')).toBe('추워요');
    });

    it('should apply ㅅ irregular: 짓 + 어요 → 지어요', () => {
      expect(applyIrregular('짓', '어요')).toBe('지어요');
    });

    it('should not apply irregular for consonant-starting endings', () => {
      expect(applyIrregular('듣', '고')).toBe('듣고');
      expect(applyIrregular('돕', '니까')).toBe('돕니까');
    });

    it('should return stem + ending for regular verbs', () => {
      expect(applyIrregular('먹', '어요')).toBe('먹어요');
      expect(applyIrregular('가', '아요')).toBe('가아요');
    });
  });
});
