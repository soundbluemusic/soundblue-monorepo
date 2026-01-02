import { describe, expect, it } from 'vitest';
import { translate } from './translator-service';

describe('배고프다 번역 테스트', () => {
  it('배고프다 문장들 번역', () => {
    const testCases = [
      { input: '배가고프다', expected: "I'm hungry" },
      { input: '배가 고프다', expected: "I'm hungry" },
      { input: '배고파', expected: "I'm hungry" },
      { input: '배가 고픕니다', expected: "I'm hungry" },
      { input: '배가고파요', expected: "I'm hungry" },
    ];

    for (const { input, expected } of testCases) {
      const result = translate(input, 'ko-en');
      console.log(input, '→', result);
      expect(result).toBe(expected);
    }
  });
});
