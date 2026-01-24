import { describe, expect, it } from 'vitest';
import {
  calculateKeyboardSimilarity,
  isKoreanText,
  levenshteinDistance,
  similarity,
} from '../src/distance/similarity';

describe('similarity - 유사도 계산', () => {
  describe('similarity', () => {
    it('동일한 문자열 유사도 1', () => {
      expect(similarity('안녕', '안녕')).toBe(1);
    });

    it('유사한 문자열 높은 유사도', () => {
      const result = similarity('안녕', '안녕하세요');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it('완전히 다른 문자열 낮은 유사도', () => {
      const result = similarity('가나다', '마바사');
      expect(result).toBeLessThan(1); // 동일하지 않음
      expect(result).toBeGreaterThan(0); // 완전히 다르지도 않음 (자모 구조 유사)
    });

    it('빈 문자열 유사도 0', () => {
      expect(similarity('', '안녕')).toBe(0);
      expect(similarity('안녕', '')).toBe(0);
      expect(similarity('', '')).toBe(0);
    });

    it('영어 문자열도 처리', () => {
      const result = similarity('hello', 'hello');
      expect(result).toBe(1);
    });

    it('혼합 문자열 처리', () => {
      const result = similarity('안녕hello', '안녕hello');
      expect(result).toBe(1);
    });
  });

  describe('calculateKeyboardSimilarity', () => {
    it('similarity와 동일한 결과', () => {
      expect(calculateKeyboardSimilarity('안녕', '안녕')).toBe(similarity('안녕', '안녕'));
    });

    it('유사한 단어 높은 점수', () => {
      const result = calculateKeyboardSimilarity('학교', '학생');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('isKoreanText', () => {
    it('한글만 있는 텍스트', () => {
      expect(isKoreanText('안녕하세요')).toBe(true);
    });

    it('영어만 있는 텍스트', () => {
      expect(isKoreanText('hello')).toBe(false);
    });

    it('한글+영어 혼합', () => {
      expect(isKoreanText('hello안녕')).toBe(true);
    });

    it('숫자만', () => {
      expect(isKoreanText('12345')).toBe(false);
    });

    it('특수문자만', () => {
      expect(isKoreanText('!@#$%')).toBe(false);
    });

    it('빈 문자열', () => {
      expect(isKoreanText('')).toBe(false);
    });

    it('공백만', () => {
      expect(isKoreanText('   ')).toBe(false);
    });

    it('한글+숫자+특수문자', () => {
      expect(isKoreanText('안녕123!')).toBe(true);
    });
  });

  describe('levenshteinDistance', () => {
    it('동일한 문자열 거리 0', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('한 글자 차이', () => {
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
    });

    it('삽입 연산', () => {
      expect(levenshteinDistance('hell', 'hello')).toBe(1);
    });

    it('삭제 연산', () => {
      expect(levenshteinDistance('hello', 'hell')).toBe(1);
    });

    it('치환 연산', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
    });

    it('완전히 다른 문자열', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    it('빈 문자열과 비교', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5);
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('긴 문자열', () => {
      const result = levenshteinDistance('kitten', 'sitting');
      expect(result).toBe(3);
    });

    it('대소문자 구분', () => {
      expect(levenshteinDistance('Hello', 'hello')).toBe(1);
    });

    it('한글 문자열', () => {
      expect(levenshteinDistance('안녕', '안녕하세요')).toBe(3);
    });

    it('혼합 문자열', () => {
      expect(levenshteinDistance('hello안녕', 'hello안녕')).toBe(0);
      expect(levenshteinDistance('hello안녕', 'hello안녕!')).toBe(1);
    });

    it('두 문자열 모두 짧을 때', () => {
      expect(levenshteinDistance('a', 'b')).toBe(1);
      expect(levenshteinDistance('a', 'a')).toBe(0);
    });

    it('한 문자열만 짧을 때', () => {
      expect(levenshteinDistance('a', 'abc')).toBe(2);
      expect(levenshteinDistance('abc', 'a')).toBe(2);
    });

    it('연속 삽입/삭제 연산', () => {
      expect(levenshteinDistance('abc', 'abcdef')).toBe(3);
      expect(levenshteinDistance('abcdef', 'abc')).toBe(3);
    });

    it('연속 치환 연산', () => {
      expect(levenshteinDistance('abc', 'def')).toBe(3);
    });
  });

  describe('similarity - 캐시 동작', () => {
    it('동일 문자열 반복 호출 시 캐시 활용', () => {
      // 첫 번째 호출
      const result1 = similarity('테스트문자열', '테스트');
      // 두 번째 호출 (캐시 히트)
      const result2 = similarity('테스트문자열', '테스트');
      expect(result1).toBe(result2);
    });

    it('다양한 문자열로 캐시 축적', () => {
      const results: number[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(similarity(`테스트${i}`, `테스트${i + 1}`));
      }
      expect(results.every((r) => r >= 0 && r <= 1)).toBe(true);
    });
  });

  describe('similarity - edge cases', () => {
    it('한 글자 문자열', () => {
      expect(similarity('가', '가')).toBe(1);
      expect(similarity('가', '나')).toBeLessThan(1);
    });

    it('자모만 있는 문자열', () => {
      const result = similarity('ㄱㄴㄷ', 'ㄱㄴㅁ');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it('매우 긴 문자열', () => {
      const longStr1 = '가나다라마바사아자차카타파하'.repeat(10);
      const longStr2 = '가나다라마바사아자차카타파하'.repeat(10) + '!';
      const result = similarity(longStr1, longStr2);
      expect(result).toBeGreaterThan(0.9);
    });
  });
});
