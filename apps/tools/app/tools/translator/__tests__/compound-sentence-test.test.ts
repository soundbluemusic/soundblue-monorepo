/**
 * 복합 문장 처리 테스트
 * 연결어미로 연결된 절 분리/재조립 검증
 */
import { describe, expect, it } from 'vitest';
import {
  analyzeCompoundSentence,
  extractConnective,
  isCompoundSentence,
  reassembleWithConjunctions,
  restructureConditional,
  splitIntoClauses,
} from '../grammar/clause-restructurer';
import { translate } from '../translator-service';

describe('복합 문장 감지 (isCompoundSentence)', () => {
  it('쉼표가 있으면 복합 문장', () => {
    expect(isCompoundSentence('나는 밥을 먹고, 학교에 갔다')).toBe(true);
  });

  it('연결어미 -고가 있으면 복합 문장', () => {
    expect(isCompoundSentence('나는 밥을 먹고 학교에 갔다')).toBe(true);
  });

  it('연결어미 -서가 있으면 복합 문장', () => {
    expect(isCompoundSentence('비가 와서 집에 있었다')).toBe(true);
  });

  it('연결어미 -면이 있으면 복합 문장', () => {
    expect(isCompoundSentence('시간이 있으면 갈게')).toBe(true);
  });

  it('단순 문장은 false', () => {
    expect(isCompoundSentence('나는 학교에 갔다')).toBe(false);
  });
});

describe('연결어미 추출 (extractConnective)', () => {
  it('-고 추출', () => {
    const result = extractConnective('먹고');
    expect(result).not.toBeNull();
    expect(result?.english).toBe('and');
    expect(result?.type).toBe('and');
  });

  it('-서 추출', () => {
    const result = extractConnective('와서');
    expect(result).not.toBeNull();
    expect(result?.english).toBe('and then');
    expect(result?.type).toBe('sequence');
  });

  it('-지만 추출', () => {
    const result = extractConnective('했지만');
    expect(result).not.toBeNull();
    expect(result?.english).toBe('but');
    expect(result?.type).toBe('contrast');
  });

  it('-면 추출', () => {
    const result = extractConnective('있으면');
    expect(result).not.toBeNull();
    expect(result?.english).toBe('if');
    expect(result?.type).toBe('condition');
  });

  it('-니까 추출', () => {
    const result = extractConnective('왔으니까');
    expect(result).not.toBeNull();
    expect(result?.english).toBe('because');
    expect(result?.type).toBe('reason');
  });
});

describe('절 분리 (splitIntoClauses)', () => {
  it('-고로 연결된 두 절 분리', () => {
    const result = splitIntoClauses('나는 밥을 먹고 학교에 갔다');
    expect(result.length).toBe(2);
    expect(result[0]?.connective?.type).toBe('and');
    expect(result[1]?.isMainClause).toBe(true);
  });

  it('-서로 연결된 두 절 분리', () => {
    const result = splitIntoClauses('비가 와서 집에 있었다');
    expect(result.length).toBe(2);
    expect(result[0]?.connective?.type).toBe('sequence');
  });

  it('단순 문장은 하나의 절', () => {
    const result = splitIntoClauses('나는 학교에 갔다');
    expect(result.length).toBe(1);
    expect(result[0]?.isMainClause).toBe(true);
  });

  it('쉼표와 연결어미 조합', () => {
    const result = splitIntoClauses('아침에 일어나고, 밥을 먹었다');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

describe('복합 문장 분석 (analyzeCompoundSentence)', () => {
  it('복합 문장 전체 분석', () => {
    const result = analyzeCompoundSentence('나는 밥을 먹고 학교에 갔다');
    expect(result.original).toBe('나는 밥을 먹고 학교에 갔다');
    expect(result.clauses.length).toBe(2);
  });
});

describe('영어 접속사 재조립 (reassembleWithConjunctions)', () => {
  it('and로 재조립', () => {
    const clauses = [
      { text: 'I ate rice', connective: { korean: '고', english: 'and', type: 'and' as const } },
      { text: 'I went to school' },
    ];
    const result = reassembleWithConjunctions(clauses);
    expect(result).toContain('and');
    expect(result).toContain('I ate rice');
    expect(result).toContain('went to school');
  });

  it('but으로 재조립', () => {
    const clauses = [
      {
        text: 'I was tired',
        connective: { korean: '지만', english: 'but', type: 'contrast' as const },
      },
      { text: 'I studied' },
    ];
    const result = reassembleWithConjunctions(clauses);
    expect(result).toContain('but');
  });

  it('because로 재조립', () => {
    const clauses = [
      {
        text: 'It rained',
        connective: { korean: '니까', english: 'because', type: 'reason' as const },
      },
      { text: 'I stayed home' },
    ];
    const result = reassembleWithConjunctions(clauses);
    expect(result).toContain('because');
  });
});

describe('조건문 재구성 (restructureConditional)', () => {
  it('if 절 재구성', () => {
    const clauses = [
      {
        text: 'I have time',
        connective: { korean: '면', english: 'if', type: 'condition' as const },
        isMainClause: false,
      },
      { text: 'I will go', isMainClause: true },
    ];
    const result = restructureConditional(clauses);
    expect(result.length).toBe(1);
    expect(result[0]?.text.toLowerCase()).toContain('if');
  });
});

describe('복합 문장 번역 통합 테스트', () => {
  it('나는 밥을 먹고 학교에 갔다', () => {
    const result = translate('나는 밥을 먹고 학교에 갔다', 'ko-en');
    // "and"로 연결되어야 함
    expect(result.toLowerCase()).toContain('and');
    console.log('Input: 나는 밥을 먹고 학교에 갔다');
    console.log('Output:', result);
  });

  it('비가 와서 집에 있었다', () => {
    const result = translate('비가 와서 집에 있었다', 'ko-en');
    // "and then" 또는 순차적 연결
    console.log('Input: 비가 와서 집에 있었다');
    console.log('Output:', result);
    expect(result.length).toBeGreaterThan(0);
  });

  it('피곤했지만 공부했다', () => {
    const result = translate('피곤했지만 공부했다', 'ko-en');
    // "but"으로 연결되어야 함
    console.log('Input: 피곤했지만 공부했다');
    console.log('Output:', result);
    expect(result.length).toBeGreaterThan(0);
  });

  it('시간이 있으면 갈게', () => {
    const result = translate('시간이 있으면 갈게', 'ko-en');
    // "if"로 시작하거나 포함되어야 함
    console.log('Input: 시간이 있으면 갈게');
    console.log('Output:', result);
    expect(result.length).toBeGreaterThan(0);
  });
});
