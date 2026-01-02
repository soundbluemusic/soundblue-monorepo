import { describe, it } from 'vitest';
import { translate } from './translator-service';

describe('심각한 번역 문제 디버깅', () => {
  it('기본 문장 번역 테스트', () => {
    const testCases = [
      { input: '안녕하세요', expected: 'Hello' },
      { input: '운동', expected: 'exercise' },
      { input: '운동을', expected: 'exercise' },
      { input: '저는 운동을 합니다', expected: 'I exercise' },
      { input: '저는 운동을 하고 있습니다', expected: "I'm exercising" },
      { input: '안녕하세요 저는 운동을 하고 있습니다', expected: "Hello I'm exercising" },
      { input: '나는 밥을 먹는다', expected: 'I eat rice' },
      { input: '그는 학교에 간다', expected: 'He goes to school' },
    ];

    console.log('\n=== 번역 결과 ===');
    for (const { input, expected } of testCases) {
      const result = translate(input, 'ko-en');
      console.log(`${input} → ${result} (expected: ${expected})`);
    }
  });
});
