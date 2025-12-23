// ========================================
// English Morpheme Tests - 영어 형태소 분해 테스트
// ========================================

import { describe, expect, test } from 'vitest';
import {
  composeEnglish,
  decomposeEnglish,
  extractStem,
  getAllDecompositions,
  getPrefixKorean,
  getSuffixKorean,
  isLikelyEnglishWord,
  translateEnglishMorpheme,
} from './english-morpheme';

describe('decomposeEnglish - 기본 분해', () => {
  test('unhappiness → un + happy + ness', () => {
    const result = decomposeEnglish('unhappiness');
    expect(result.prefix).toBe('un');
    expect(result.stem).toBe('happy');
    expect(result.suffix).toBe('ness');
  });

  test('rewriting → re + write + ing', () => {
    const result = decomposeEnglish('rewriting');
    expect(result.prefix).toBe('re');
    expect(result.stem).toBe('write');
    expect(result.suffix).toBe('ing');
  });

  test('stopped → stop + ped (자음 중복)', () => {
    const result = decomposeEnglish('stopped');
    expect(result.stem).toBe('stop');
    expect(result.suffix).toBe('pped');
  });

  test('studied → study + ied (y→i)', () => {
    const result = decomposeEnglish('studied');
    expect(result.stem).toBe('study');
    expect(result.suffix).toBe('ied');
  });

  test('loved → love + d (e 복원)', () => {
    const result = decomposeEnglish('loved');
    expect(result.stem).toBe('love');
    expect(result.suffix).toBe('d');
  });
});

describe('decomposeEnglish - 복합 접사', () => {
  test('uncomfortable → un + comfort + able', () => {
    const result = decomposeEnglish('uncomfortable');
    expect(result.prefix).toBe('un');
    expect(result.stem).toBe('comfort');
    expect(result.suffix).toBe('able');
  });

  test('preprocessing → pre + process + ing', () => {
    const result = decomposeEnglish('preprocessing');
    expect(result.prefix).toBe('pre');
    expect(result.stem).toBe('process');
    expect(result.suffix).toBe('ing');
  });

  test('multinational → multi + nation + al', () => {
    const result = decomposeEnglish('multinational');
    expect(result.prefix).toBe('multi');
    expect(result.stem).toBe('nation');
    expect(result.suffix).toBe('al');
  });
});

describe('composeEnglish - 조합', () => {
  test('un + happy + ness → unhappiness', () => {
    const result = composeEnglish({
      prefix: 'un',
      stem: 'happy',
      suffix: 'ness',
      original: 'unhappiness',
    });
    expect(result).toBe('unhappiness');
  });

  test('re + write + ing → rewriting', () => {
    const result = composeEnglish({
      prefix: 're',
      stem: 'write',
      suffix: 'ing',
      original: 'rewriting',
    });
    expect(result).toBe('rewriting');
  });
});

describe('translateEnglishMorpheme - 한국어 변환', () => {
  test('un + happy + ness → 불 + 행복하 + 함', () => {
    const morpheme = decomposeEnglish('unhappiness');
    const result = translateEnglishMorpheme(morpheme, '행복하');
    expect(result).toBe('불행복하함');
  });

  test('re + write + ing → 재 + 작성 + 는', () => {
    const morpheme = decomposeEnglish('rewriting');
    const result = translateEnglishMorpheme(morpheme, '작성');
    expect(result).toBe('재작성는');
  });
});

describe('extractStem - 어간 추출', () => {
  test('unhappiness → happy', () => {
    expect(extractStem('unhappiness')).toBe('happy');
  });

  test('rewriting → write', () => {
    expect(extractStem('rewriting')).toBe('write');
  });

  test('stopped → stop', () => {
    expect(extractStem('stopped')).toBe('stop');
  });
});

describe('getPrefixKorean / getSuffixKorean', () => {
  test('un → 불', () => {
    expect(getPrefixKorean('un')).toBe('불');
  });

  test('re → 재', () => {
    expect(getPrefixKorean('re')).toBe('재');
  });

  test('ness → 함', () => {
    expect(getSuffixKorean('ness')).toBe('함');
  });

  test('ing → 는', () => {
    expect(getSuffixKorean('ing')).toBe('는');
  });
});

describe('isLikelyEnglishWord', () => {
  test('영어 단어', () => {
    expect(isLikelyEnglishWord('hello')).toBe(true);
    expect(isLikelyEnglishWord('world')).toBe(true);
  });

  test('한글 포함', () => {
    expect(isLikelyEnglishWord('안녕hello')).toBe(false);
  });

  test('모음 없음', () => {
    expect(isLikelyEnglishWord('xyz')).toBe(false);
  });

  test('너무 짧음', () => {
    expect(isLikelyEnglishWord('a')).toBe(false);
  });
});

describe('getAllDecompositions - 모든 분해 결과', () => {
  test('reading → 여러 가능성', () => {
    const results = getAllDecompositions('reading');
    expect(results.length).toBeGreaterThan(1);

    // 최소한 하나는 suffix 'ing'를 가져야 함
    const hasIng = results.some((r) => r.suffix === 'ing');
    expect(hasIng).toBe(true);
  });
});
