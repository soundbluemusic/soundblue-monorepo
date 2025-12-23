import { describe, test } from 'vitest';
import { translate } from './translator-service';

describe('간단한 문장 테스트', () => {
  test('한국어 → 영어: 간단한 문장', () => {
    const tests = [
      { input: '나는 밥을 먹었다', expected: 'I ate rice' },
      { input: '그는 학교에 갔다', expected: 'He went to school' },
      { input: '오늘 날씨가 좋다', expected: 'Today weather is good' },
    ];

    for (const t of tests) {
      const result = translate(t.input, 'ko-en');
      console.log(`[한→영] "${t.input}" → "${result}" (예상: "${t.expected}")`);
    }
  });

  test('영어 → 한국어: 간단한 문장', () => {
    const tests = [
      { input: 'I ate breakfast', expected: '나는 아침을 먹었다' },
      { input: 'She went home', expected: '그녀는 집에 갔다' },
      { input: 'The weather is nice', expected: '날씨가 좋다' },
    ];

    for (const t of tests) {
      const result = translate(t.input, 'en-ko');
      console.log(`[영→한] "${t.input}" → "${result}" (예상: "${t.expected}")`);
    }
  });
});
