/**
 * DP 기반 띄어쓰기 복구 알고리즘 테스트
 */
import { describe, expect, it } from 'vitest';
import { correctSpacingFull, dpWordSplit, recoverSpacing } from '../typo/spacing-rules';

describe('DP 단어 분리 (dpWordSplit)', () => {
  it('짧은 문장 분리', () => {
    const result = dpWordSplit('나는학교에갔다');
    expect(result.tokens.length).toBeGreaterThan(1);
    expect(result.tokens.join(' ')).toContain('나');
    expect(result.tokens.join(' ')).toContain('학교');
  });

  it('동사+조사 패턴 인식', () => {
    const result = dpWordSplit('커피를마셨어');
    expect(result.tokens.length).toBeGreaterThan(1);
  });

  it('일찍 일어나다 분리', () => {
    const result = dpWordSplit('일찍일어났어');
    // '일찍'과 '일어났어'로 분리되어야 함
    expect(result.tokens).toContain('일찍');
  });

  it('빈 문자열 처리', () => {
    const result = dpWordSplit('');
    expect(result.tokens).toEqual([]);
    expect(result.confidence).toBe(1);
  });
});

describe('띄어쓰기 복구 (recoverSpacing)', () => {
  it('이미 띄어쓰기가 있는 문장은 유지', () => {
    // 명사+조사 형태는 분리하지 않고 유지
    const { recovered } = recoverSpacing('나는 학교에 갔다');
    // '학교에'가 '학교 에'로 분리되지 않아야 함
    expect(recovered).not.toContain('학교 에');
  });

  it('붙어쓴 문장 분리', () => {
    const { recovered, confidence } = recoverSpacing('나는학교에갔다');
    expect(recovered.split(' ').length).toBeGreaterThan(1);
    expect(confidence).toBeGreaterThan(0);
  });

  it('짧은 토큰은 그대로 유지', () => {
    const { recovered } = recoverSpacing('나 너');
    expect(recovered).toBe('나 너');
  });
});

describe('통합 띄어쓰기 교정 (correctSpacingFull)', () => {
  it('Level 1 테스트 문장', () => {
    // "나는일찍일어나서일을했어" → "나는 일찍 일어나서 일을 했어"
    const { corrected } = correctSpacingFull('나는일찍일어나서일을했어');
    // 최소한 여러 단어로 분리되어야 함
    const words = corrected.split(' ');
    expect(words.length).toBeGreaterThanOrEqual(3);
    console.log('Input:', '나는일찍일어나서일을했어');
    console.log('Output:', corrected);
  });

  it('오늘 날씨가 좋아요', () => {
    const { corrected } = correctSpacingFull('오늘날씨가좋아요');
    const words = corrected.split(' ');
    expect(words.length).toBeGreaterThanOrEqual(2);
    console.log('Input:', '오늘날씨가좋아요');
    console.log('Output:', corrected);
  });

  it('커피를 마셨어', () => {
    const { corrected } = correctSpacingFull('커피를마셨어');
    expect(corrected).toContain('커피');
    console.log('Input:', '커피를마셨어');
    console.log('Output:', corrected);
  });

  it('학교에 갔어', () => {
    const { corrected } = correctSpacingFull('학교에갔어');
    expect(corrected).toContain('학교');
    console.log('Input:', '학교에갔어');
    console.log('Output:', corrected);
  });
});

describe('확신도 (Confidence)', () => {
  it('사전에 있는 단어만 있으면 확신도 높음', () => {
    const { confidence } = correctSpacingFull('나는커피를마셨어');
    expect(confidence).toBeGreaterThan(0.5);
  });

  it('비한글 문자열은 그대로 유지', () => {
    const { corrected } = correctSpacingFull('xyz123abc');
    // 비한글 문자열은 분리 없이 그대로 유지
    expect(corrected).toBe('xyz123abc');
  });
});
