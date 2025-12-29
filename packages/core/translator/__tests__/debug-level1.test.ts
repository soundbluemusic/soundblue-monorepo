import { describe, test } from 'vitest';
import { generateEnglish } from '../grammar/english-generator';
import { analyzeMorpheme } from '../grammar/morpheme-analyzer';
import { parseSentence } from '../grammar/sentence-parser';
import { translate } from '../translator-service';

describe('Debug Level 1', () => {
  test('10대 여고생 - 파싱 분석', () => {
    const input = '야 진짜 대박! 쟤 완전 내 이상형이야!';

    // 문장 분리
    const sentences = input.split(/[!！]+/).filter((s) => s.trim());
    console.log('분리된 문장:', sentences);

    for (const sentence of sentences) {
      const parsed = parseSentence(sentence.trim());
      console.log('=== 파싱 결과 ===');
      console.log('sentence:', sentence.trim());
      console.log(
        'subject:',
        parsed.subject?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
      );
      console.log(
        'predicate:',
        parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
      );
      console.log(
        'object:',
        parsed.object?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
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
        'tokens:',
        parsed.tokens.map((t) => ({ original: t.original, stem: t.stem, role: t.role })),
      );
    }
  });

  test('10대 여고생 - 생성 분석', () => {
    const input = '쟤 완전 내 이상형이야';
    const parsed = parseSentence(input);

    console.log('=== 생성 전 파싱 ===');
    console.log(
      'subject:',
      parsed.subject?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );

    const result = generateEnglish(parsed);
    console.log('=== 생성 결과 ===');
    console.log('translation:', result.translation);
  });

  test('전체 번역 테스트', () => {
    const testCases = [
      '야 진짜 대박!',
      '쟤 완전 내 이상형이야!',
      '야 진짜 대박! 쟤 완전 내 이상형이야!',
    ];

    for (const input of testCases) {
      const result = translate(input, 'ko-en');
      console.log(`Input: ${input}`);
      console.log(`Result: ${result}`);
      console.log('---');
    }
  });

  test('단어 번역 확인', () => {
    const words = ['야', '진짜', '대박', '쟤', '완전', '내', '이상형', '이상형이야'];

    for (const word of words) {
      const result = translate(word, 'ko-en');
      console.log(`${word} -> ${result}`);
    }
  });

  test('이상형이야 형태소 분석', () => {
    const morpheme = analyzeMorpheme('이상형이야');
    console.log('=== 이상형이야 형태소 분석 ===');
    console.log('result:', morpheme);
  });

  test('주어 인식 - 쟤', () => {
    const input = '쟤는 내 친구야';
    const parsed = parseSentence(input);
    console.log('=== 쟤는 내 친구야 파싱 ===');
    console.log(
      'subject:',
      parsed.subject?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log(
      'predicate:',
      parsed.predicate?.tokens.map((t) => ({ original: t.original, stem: t.stem })),
    );
    console.log(
      'modifiers:',
      parsed.modifiers.map((m) => m.tokens.map((t) => ({ original: t.original, stem: t.stem }))),
    );
  });
});
