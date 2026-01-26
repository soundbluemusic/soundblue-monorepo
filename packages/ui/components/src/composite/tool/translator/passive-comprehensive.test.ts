import { describe, expect, it } from 'vitest';
import { translate } from './index';

describe('피동문 패턴 종합 테스트', () => {
  describe('-받다 패턴 (batda)', () => {
    const batdaCases = [
      // 현재 시제
      { input: '그녀는 사랑받는다', expected: 'She is loved' },
      { input: '그는 존경받는다', expected: 'He is respected' },
      { input: '나는 인정받는다', expected: 'I am recognized' },
      { input: '우리는 칭찬받는다', expected: 'We are praised' },
      { input: '그들은 사랑받는다', expected: 'They are loved' },
      // 과거 시제
      { input: '그녀는 사랑받았다', expected: 'She was loved' },
      { input: '그는 존경받았다', expected: 'He was respected' },
      { input: '나는 인정받았다', expected: 'I was recognized' },
    ];

    for (const { input, expected } of batdaCases) {
      it(`"${input}" → "${expected}"`, () => {
        const result = translate(input, 'ko-en');
        console.log(`[받다] "${input}" → "${result}" (expected: "${expected}")`);
        expect(result).toBe(expected);
      });
    }
  });

  describe('-당하다 패턴 (danghada)', () => {
    const danghadaCases = [
      // 과거 시제
      { input: '그는 비난당했다', expected: 'He was criticized' },
      { input: '그녀는 거부당했다', expected: 'She was rejected' },
      { input: '우리는 공격당했다', expected: 'We were attacked' },
      // 현재 시제 (당한다)
      { input: '그는 비난당한다', expected: 'He is criticized' },
    ];

    for (const { input, expected } of danghadaCases) {
      it(`"${input}" → "${expected}"`, () => {
        const result = translate(input, 'ko-en');
        console.log(`[당하다] "${input}" → "${result}" (expected: "${expected}")`);
        expect(result).toBe(expected);
      });
    }
  });

  describe('짧은 문장 테스트', () => {
    const shortCases = [
      { input: '사랑받는다', expected: 'is loved' },
      { input: '존경받았다', expected: 'was respected' },
    ];

    for (const { input, expected } of shortCases) {
      it(`"${input}" → 포함: "${expected}"`, () => {
        const result = translate(input, 'ko-en');
        console.log(`[짧은] "${input}" → "${result}"`);
        expect(result.toLowerCase()).toContain(expected.toLowerCase());
      });
    }
  });

  describe('다양한 주어 테스트', () => {
    const subjectCases = [
      { input: '나는 사랑받는다', expectedSubject: 'I' },
      { input: '너는 사랑받는다', expectedSubject: 'You' },
      { input: '그는 사랑받는다', expectedSubject: 'He' },
      { input: '그녀는 사랑받는다', expectedSubject: 'She' },
      { input: '우리는 사랑받는다', expectedSubject: 'We' },
      { input: '그들은 사랑받는다', expectedSubject: 'They' },
    ];

    for (const { input, expectedSubject } of subjectCases) {
      it(`"${input}" → 주어: "${expectedSubject}"`, () => {
        const result = translate(input, 'ko-en');
        console.log(`[주어] "${input}" → "${result}"`);
        expect(result.startsWith(expectedSubject)).toBe(true);
      });
    }
  });
});
