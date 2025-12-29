import { describe, expect, it } from 'vitest';
import { applyFinalConsonantRule, selectAOrEo, toPronunciation } from '../src';

describe('phonetics', () => {
  describe('selectAOrEo (모음조화)', () => {
    it('should return 아 for 양성모음 (positive vowels)', () => {
      expect(selectAOrEo('가')).toBe('ㅏ');
      expect(selectAOrEo('오')).toBe('ㅏ');
      expect(selectAOrEo('사')).toBe('ㅏ');
    });

    it('should return 어 for 음성모음 (negative vowels)', () => {
      expect(selectAOrEo('서')).toBe('ㅓ');
      expect(selectAOrEo('먹')).toBe('ㅓ');
      expect(selectAOrEo('주')).toBe('ㅓ');
    });

    it('should return 어 as default', () => {
      expect(selectAOrEo('')).toBe('ㅓ');
    });
  });

  describe('applyFinalConsonantRule (받침 대표음)', () => {
    it('should convert to representative final consonants', () => {
      // ㄱ 계열
      expect(applyFinalConsonantRule('ㄱ')).toBe('ㄱ');
      expect(applyFinalConsonantRule('ㄲ')).toBe('ㄱ');
      expect(applyFinalConsonantRule('ㅋ')).toBe('ㄱ');

      // ㄴ 계열
      expect(applyFinalConsonantRule('ㄴ')).toBe('ㄴ');
      expect(applyFinalConsonantRule('ㄵ')).toBe('ㄴ');

      // ㄷ 계열
      expect(applyFinalConsonantRule('ㄷ')).toBe('ㄷ');
      expect(applyFinalConsonantRule('ㅅ')).toBe('ㄷ');
      expect(applyFinalConsonantRule('ㅆ')).toBe('ㄷ');
      expect(applyFinalConsonantRule('ㅈ')).toBe('ㄷ');

      // ㄹ 계열
      expect(applyFinalConsonantRule('ㄹ')).toBe('ㄹ');
      expect(applyFinalConsonantRule('ㄼ')).toBe('ㄹ');

      // ㅁ 계열
      expect(applyFinalConsonantRule('ㅁ')).toBe('ㅁ');
      expect(applyFinalConsonantRule('ㄻ')).toBe('ㅁ');

      // ㅂ 계열
      expect(applyFinalConsonantRule('ㅂ')).toBe('ㅂ');
      expect(applyFinalConsonantRule('ㅍ')).toBe('ㅂ');
    });
  });

  describe('toPronunciation', () => {
    it('should apply phonetic rules to text', () => {
      // Basic test - the function should return a string
      const result = toPronunciation('한글');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
