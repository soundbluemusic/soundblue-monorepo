import { describe, it } from 'vitest';
import { koToEnWords } from './dictionary';
import { translate } from './translator-service';
import { parseKoreanClauses } from './v2.1/clause-parser';
import { generateEnglish } from './v2.1/generator';
import { parseKorean } from './v2.1/tokenizer';

describe('번역 문제 추적', () => {
  it('하구 vs 하고 사전 확인', () => {
    console.log('\n=== 사전 확인 ===');
    console.log('하구 in dictionary:', koToEnWords['하구']);
    console.log('하고 in dictionary:', koToEnWords['하고']);
    console.log('운동 in dictionary:', koToEnWords['운동']);
    console.log('저 in dictionary:', koToEnWords['저']);
    console.log('나 in dictionary:', koToEnWords['나']);
  });

  it('절 분리 테스트', () => {
    const sentence = '저는 운동을 하고 있습니다';
    console.log('\n=== 절 분리 테스트 ===');
    console.log('입력:', sentence);
    const clauses = parseKoreanClauses(sentence);
    console.log('절 분리 결과:', JSON.stringify(clauses, null, 2));
  });

  it('보조용언 패턴 테스트', () => {
    const sentence = '저는 운동을 하고 있습니다';
    console.log('\n=== 보조용언 패턴 테스트 ===');
    console.log('입력:', sentence);
    const parsed = parseKorean(sentence);
    console.log('auxiliaryPattern:', parsed.auxiliaryPattern);
    console.log(
      '토큰:',
      parsed.tokens.map((t) => ({
        text: t.text,
        stem: t.stem,
        role: t.role,
        translated: t.translated,
        meta: t.meta,
      })),
    );
  });

  it('생성 테스트', () => {
    const sentence = '저는 운동을 하고 있습니다';
    console.log('\n=== 생성 테스트 ===');
    console.log('입력:', sentence);
    const parsed = parseKorean(sentence);
    console.log('파싱 결과:', JSON.stringify(parsed, null, 2));
    const result = generateEnglish(parsed);
    console.log('생성 결과:', result);
  });

  it('전체 번역 테스트', () => {
    console.log('\n=== 전체 번역 테스트 ===');
    const result = translate('저는 운동을 하고 있습니다', 'ko-en');
    console.log('최종 결과:', result);
  });
});
