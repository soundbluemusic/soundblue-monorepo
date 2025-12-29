import { describe, expect, test } from 'vitest';
import { parseSentence } from '../grammar';
import { translate } from '../translator-service';

describe('Debug: Speculation Pattern', () => {
  test('단일 추측 의문문 파싱', () => {
    const input = '그는 정말 대학을 졸업했을까?';
    const parsed = parseSentence(input);

    console.log('=== 파싱 결과 ===');
    console.log('isSpeculative:', parsed.isSpeculative);
    console.log('isConditional:', parsed.isConditional);
    console.log('isHypothetical:', parsed.isHypothetical);
    console.log('isQuestion:', parsed.isQuestion);
    console.log('tense:', parsed.tense);
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({
        original: t.original,
        stem: t.stem,
        isSpeculative: t.isSpeculative,
      })),
    );

    expect(parsed.isQuestion).toBe(true);
  });

  test('단일 추측 의문문 번역', () => {
    const input = '그는 정말 대학을 졸업했을까?';
    const result = translate(input, 'ko-en');

    console.log('Input:', input);
    console.log('Result:', result);
    console.log('Expected: Did he really graduate from university?');

    // 최소한 "Did he"로 시작해야 함
    expect(result.toLowerCase()).toContain('did he');
  });

  test('단일 조건문 파싱', () => {
    const input = '만약 그가 포기했다면 어땠을까?';
    const parsed = parseSentence(input);

    console.log('=== 조건문 파싱 결과 ===');
    console.log('isConditional:', parsed.isConditional);
    console.log('isHypothetical:', parsed.isHypothetical);
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({
        original: t.original,
        stem: t.stem,
        isConditional: t.isConditional,
      })),
    );

    expect(parsed.isConditional).toBe(true);
  });

  test('Level 2 개별 문장 번역 테스트', () => {
    const testCases = [
      { input: '취업 준비를 제대로 했을까?', expected: 'prepare properly for employment' },
      { input: '아마 여러 회사에 지원했겠지?', expected: 'probably applied to several companies' },
      { input: '하지만 왜 계속 떨어졌을까?', expected: 'But why did he keep failing' },
      { input: '혹시 면접 준비가 부족했던 건 아닐까?', expected: 'Could it be' },
      { input: '결국 합격했다고 하던데, 정말일까?', expected: 'finally passed' },
    ];

    for (const { input, expected } of testCases) {
      const result = translate(input, 'ko-en');
      console.log(`Input: ${input}`);
      console.log(`Result: ${result}`);
      console.log(`Expected contains: ${expected}`);
      console.log('---');
    }
  });

  test('취업 준비 문장 파싱 분석', () => {
    const input = '취업 준비를 제대로 했을까?';
    const parsed = parseSentence(input);

    console.log('=== 취업 준비 파싱 결과 ===');
    console.log(
      'object:',
      parsed.object?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log(
      'adverbials:',
      parsed.adverbials.map((a) => a.tokens.map((t) => ({ original: t.original, stem: t.stem }))),
    );
    console.log(
      'modifiers:',
      parsed.modifiers.map((m) => m.tokens.map((t) => ({ original: t.original, stem: t.stem }))),
    );
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log('subjectOmitted:', parsed.subjectOmitted);
    console.log('isSpeculative:', parsed.isSpeculative);
    console.log('isNegative:', parsed.isNegative);
  });

  test('여러 회사 지원 문장 파싱 분석', () => {
    const input = '아마 여러 회사에 지원했겠지?';
    const parsed = parseSentence(input);

    console.log('=== 여러 회사 지원 파싱 결과 ===');
    console.log(
      'tokens:',
      parsed.tokens.map((t) => ({ original: t.original, stem: t.stem, role: t.role })),
    );
    console.log(
      'modifiers:',
      parsed.modifiers.map((m) => m.tokens.map((t) => ({ original: t.original, stem: t.stem }))),
    );
    console.log(
      'object:',
      parsed.object?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log(
      'adverbials:',
      parsed.adverbials.map((a) => a.tokens.map((t) => ({ original: t.original, stem: t.stem }))),
    );
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
  });

  test('왜 계속 떨어졌을까 문장 파싱', () => {
    const input = '하지만 왜 계속 떨어졌을까?';
    const parsed = parseSentence(input);

    console.log('=== 왜 계속 떨어졌을까 파싱 결과 ===');
    console.log(
      'tokens:',
      parsed.tokens.map((t) => ({ original: t.original, stem: t.stem, role: t.role })),
    );
    console.log(
      'modifiers:',
      parsed.modifiers.map((m) => m.tokens.map((t) => ({ original: t.original, stem: t.stem }))),
    );
    console.log(
      'adverbials:',
      parsed.adverbials.map((a) => a.tokens.map((t) => ({ original: t.original, stem: t.stem }))),
    );
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log('isSpeculative:', parsed.isSpeculative);
  });

  test('면접 준비가 부족했던 건 아닐까 파싱', () => {
    const input = '혹시 면접 준비가 부족했던 건 아닐까?';
    const parsed = parseSentence(input);

    console.log('=== 면접 준비가 부족했던 건 아닐까 파싱 결과 ===');
    console.log(
      'tokens:',
      parsed.tokens.map((t) => ({ original: t.original, stem: t.stem, role: t.role })),
    );
    console.log(
      'subject:',
      parsed.subject?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log('isNegative:', parsed.isNegative);
    console.log('isSpeculative:', parsed.isSpeculative);
  });

  test('결국 합격했다고 하던데 정말일까 파싱', () => {
    const input = '결국 합격했다고 하던데, 정말일까?';
    const parsed = parseSentence(input);

    console.log('=== 결국 합격했다고 하던데 정말일까 파싱 결과 ===');
    console.log(
      'tokens:',
      parsed.tokens.map((t) => ({ original: t.original, stem: t.stem, role: t.role })),
    );
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log('isSpeculative:', parsed.isSpeculative);
  });

  test('복수 문장 주어 문맥 추적', () => {
    // 첫 문장에서 "그는" (he)이 명시되면, 이후 주어 생략 문장에서도 "he" 사용
    const input = '그는 정말 대학을 졸업했을까? 취업 준비를 제대로 했을까?';
    const result = translate(input, 'ko-en');

    console.log('=== 복수 문장 주어 문맥 추적 ===');
    console.log('Input:', input);
    console.log('Result:', result);

    // 두 번째 문장도 "Did he" 로 시작해야 함
    expect(result.toLowerCase()).toContain('did he');

    // 두 문장 모두 "he"를 주어로 사용
    const sentences = result.split(/[.?!]\s*/);
    console.log('Sentences:', sentences);

    // 첫 문장: "Did he really graduate..."
    expect(sentences[0]?.toLowerCase()).toContain('he');

    // 두 번째 문장: "Did he properly prepare..."
    if (sentences[1]) {
      expect(sentences[1].toLowerCase()).toContain('he');
    }
  });
});
