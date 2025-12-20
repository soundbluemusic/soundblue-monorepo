import { describe, expect, it } from 'vitest';
import {
  changeBatchim,
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
} from './jamo';

describe('jamo', () => {
  describe('isHangul', () => {
    it('한글 음절 확인', () => {
      expect(isHangul('가')).toBe(true);
      expect(isHangul('힣')).toBe(true);
      expect(isHangul('한')).toBe(true);
    });

    it('비한글 문자 확인', () => {
      expect(isHangul('a')).toBe(false);
      expect(isHangul('1')).toBe(false);
      expect(isHangul('ㄱ')).toBe(false); // 자모는 한글 음절이 아님
    });
  });

  describe('isJamo', () => {
    it('자모 확인', () => {
      expect(isJamo('ㄱ')).toBe(true);
      expect(isJamo('ㅏ')).toBe(true);
      expect(isJamo('ㅎ')).toBe(true);
    });

    it('비자모 확인', () => {
      expect(isJamo('가')).toBe(false);
      expect(isJamo('a')).toBe(false);
    });
  });

  describe('isVowel / isConsonant', () => {
    it('모음 확인', () => {
      expect(isVowel('ㅏ')).toBe(true);
      expect(isVowel('ㅣ')).toBe(true);
      expect(isVowel('ㄱ')).toBe(false);
    });

    it('자음 확인', () => {
      expect(isConsonant('ㄱ')).toBe(true);
      expect(isConsonant('ㅎ')).toBe(true);
      expect(isConsonant('ㅏ')).toBe(false);
    });
  });

  describe('decompose', () => {
    it('받침 있는 글자 분해', () => {
      const result = decompose('한');
      expect(result).toEqual({ cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' });
    });

    it('받침 없는 글자 분해', () => {
      const result = decompose('가');
      expect(result).toEqual({ cho: 'ㄱ', jung: 'ㅏ', jong: '' });
    });

    it('겹받침 글자 분해', () => {
      const result = decompose('읽');
      expect(result).toEqual({ cho: 'ㅇ', jung: 'ㅣ', jong: 'ㄺ' });
    });

    it('비한글 문자는 null 반환', () => {
      expect(decompose('a')).toBe(null);
      expect(decompose('1')).toBe(null);
    });
  });

  describe('compose', () => {
    it('받침 있는 글자 조합', () => {
      const result = compose({ cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' });
      expect(result).toBe('한');
    });

    it('받침 없는 글자 조합', () => {
      const result = compose({ cho: 'ㄱ', jung: 'ㅏ', jong: '' });
      expect(result).toBe('가');
    });

    it('잘못된 자모는 null 반환', () => {
      const result = compose({ cho: 'x', jung: 'ㅏ', jong: '' });
      expect(result).toBe(null);
    });
  });

  describe('hasBatchim / getBatchim', () => {
    it('받침 유무 확인', () => {
      expect(hasBatchim('한')).toBe(true);
      expect(hasBatchim('가')).toBe(false);
      expect(hasBatchim('집')).toBe(true);
      expect(hasBatchim('나')).toBe(false);
    });

    it('받침 가져오기', () => {
      expect(getBatchim('한')).toBe('ㄴ');
      expect(getBatchim('집')).toBe('ㅂ');
      expect(getBatchim('가')).toBe('');
    });
  });

  describe('hasLastBatchim', () => {
    it('문자열 마지막 글자 받침 확인', () => {
      expect(hasLastBatchim('사람')).toBe(true);
      expect(hasLastBatchim('나무')).toBe(false);
      expect(hasLastBatchim('학교')).toBe(false);
      expect(hasLastBatchim('음식')).toBe(true);
    });
  });

  describe('changeBatchim / removeBatchim', () => {
    it('받침 변경', () => {
      expect(changeBatchim('한', 'ㄹ')).toBe('할');
      expect(changeBatchim('듣', 'ㄹ')).toBe('들');
    });

    it('받침 제거', () => {
      expect(removeBatchim('한')).toBe('하');
      expect(removeBatchim('집')).toBe('지');
    });
  });

  describe('splitDoubleJong', () => {
    it('겹받침 분리', () => {
      expect(splitDoubleJong('ㄳ')).toEqual(['ㄱ', 'ㅅ']);
      expect(splitDoubleJong('ㄺ')).toEqual(['ㄹ', 'ㄱ']);
      expect(splitDoubleJong('ㅄ')).toEqual(['ㅂ', 'ㅅ']);
    });

    it('단일 받침은 null', () => {
      expect(splitDoubleJong('ㄱ')).toBe(null);
      expect(splitDoubleJong('ㄴ')).toBe(null);
    });
  });

  describe('decomposeAll', () => {
    it('문자열 완전 분해', () => {
      expect(decomposeAll('한글')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ']);
      expect(decomposeAll('가나')).toEqual(['ㄱ', 'ㅏ', 'ㄴ', 'ㅏ']);
    });

    it('비한글 문자 포함', () => {
      expect(decomposeAll('a한')).toEqual(['a', 'ㅎ', 'ㅏ', 'ㄴ']);
    });
  });

  describe('extractCho', () => {
    it('초성 추출', () => {
      expect(extractCho('한글')).toBe('ㅎㄱ');
      expect(extractCho('대한민국')).toBe('ㄷㅎㅁㄱ');
      expect(extractCho('안녕하세요')).toBe('ㅇㄴㅎㅅㅇ');
    });
  });
});
