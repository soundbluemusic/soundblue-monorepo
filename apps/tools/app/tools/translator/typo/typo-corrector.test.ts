// ========================================
// Typo Corrector Tests - 오타 교정 테스트
// ========================================

import { describe, expect, it } from 'vitest';
import { correctAllCommonTypos, isCommonTypo } from './common-typos';
import {
  calculateKeyboardSimilarity,
  decomposeToJamos,
  isAdjacentKey,
  isDoubleConsonantMistake,
  jamoEditDistance,
} from './jamo-edit-distance';
import {
  correctAuxiliaryVerbSpacing,
  correctDependencyNounSpacing,
  correctParticleSpacing,
  correctSpacing,
} from './spacing-rules';
import {
  correctSpacingOnly,
  correctTypos,
  findSimilarWords,
  getCorrectionStats,
} from './typo-corrector';

describe('Common Typos - 빈번한 오타 사전', () => {
  it('should detect common typos', () => {
    expect(isCommonTypo('할수있다')).toBe(true);
    expect(isCommonTypo('하고있다')).toBe(true);
    expect(isCommonTypo('되요')).toBe(true);
  });

  it('should correct 할수있다 → 할 수 있다', () => {
    const result = correctAllCommonTypos('할수있다');
    expect(result.corrected).toBe('할 수 있다');
    expect(result.corrections.length).toBe(1);
  });

  it('should correct multiple typos in text', () => {
    const result = correctAllCommonTypos('오늘 할수있다고 하고있다');
    expect(result.corrected).toBe('오늘 할 수 있다고 하고 있다');
    expect(result.corrections.length).toBe(2);
  });

  it('should correct 되요 → 돼요', () => {
    const result = correctAllCommonTypos('안되요');
    expect(result.corrected).toBe('안돼요');
  });

  it('should correct 됬다 → 됐다', () => {
    const result = correctAllCommonTypos('됬다');
    expect(result.corrected).toBe('됐다');
  });

  it('should correct spacing errors for 것/거', () => {
    const result = correctAllCommonTypos('하는것이 좋아');
    expect(result.corrected).toBe('하는 것이 좋아');
  });

  it('should correct 해야한다 → 해야 한다', () => {
    const result = correctAllCommonTypos('해야한다');
    expect(result.corrected).toBe('해야 한다');
  });
});

describe('Spacing Rules - 띄어쓰기 규칙', () => {
  describe('Dependency Noun Spacing - 의존명사 띄어쓰기', () => {
    it('should add space before 수', () => {
      expect(correctDependencyNounSpacing('할수')).toBe('할 수');
      expect(correctDependencyNounSpacing('갈수')).toBe('갈 수');
    });

    it('should add space before 것', () => {
      expect(correctDependencyNounSpacing('하는것')).toBe('하는 것');
      expect(correctDependencyNounSpacing('먹는것')).toBe('먹는 것');
    });

    it('should add space before 때', () => {
      expect(correctDependencyNounSpacing('할때')).toBe('할 때');
      expect(correctDependencyNounSpacing('먹을때')).toBe('먹을 때');
    });

    it('should add space before 줄', () => {
      expect(correctDependencyNounSpacing('할줄')).toBe('할 줄');
      expect(correctDependencyNounSpacing('알줄')).toBe('알 줄');
    });
  });

  describe('Auxiliary Verb Spacing - 보조용언 띄어쓰기', () => {
    it('should add space for -고 있다', () => {
      expect(correctAuxiliaryVerbSpacing('고있다')).toBe('고 있다');
      expect(correctAuxiliaryVerbSpacing('고있는')).toBe('고 있는');
      expect(correctAuxiliaryVerbSpacing('고있어')).toBe('고 있어');
    });

    it('should add space for -고 싶다', () => {
      expect(correctAuxiliaryVerbSpacing('고싶다')).toBe('고 싶다');
      expect(correctAuxiliaryVerbSpacing('고싶어')).toBe('고 싶어');
    });

    it('should add space for -지 않다', () => {
      expect(correctAuxiliaryVerbSpacing('지않다')).toBe('지 않다');
      expect(correctAuxiliaryVerbSpacing('지않아')).toBe('지 않아');
    });

    it('should add space for -아/어 보다', () => {
      expect(correctAuxiliaryVerbSpacing('어보다')).toBe('어 보다');
      expect(correctAuxiliaryVerbSpacing('아봐')).toBe('아 봐');
    });
  });

  describe('Particle Spacing - 조사 붙여쓰기', () => {
    it('should attach particles to words', () => {
      expect(correctParticleSpacing('학교 에')).toBe('학교에');
      expect(correctParticleSpacing('책 을')).toBe('책을');
      expect(correctParticleSpacing('나 는')).toBe('나는');
    });
  });

  describe('Combined Spacing - 통합 띄어쓰기', () => {
    it('should apply all spacing rules', () => {
      const result = correctSpacing('할수있는것');
      expect(result.corrected).toBe('할 수있는 것');
    });

    it('should have confidence score', () => {
      const result = correctSpacing('할수있다');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('Jamo Edit Distance - 자모 편집거리', () => {
  describe('Jamo Decomposition - 자모 분해', () => {
    it('should decompose single character', () => {
      const jamos = decomposeToJamos('가');
      expect(jamos).toEqual(['ㄱ', 'ㅏ']);
    });

    it('should decompose character with jongseong', () => {
      const jamos = decomposeToJamos('한');
      expect(jamos).toEqual(['ㅎ', 'ㅏ', 'ㄴ']);
    });

    it('should decompose word', () => {
      const jamos = decomposeToJamos('분석');
      expect(jamos).toEqual(['ㅂ', 'ㅜ', 'ㄴ', 'ㅅ', 'ㅓ', 'ㄱ']);
    });

    it('should handle non-hangul characters', () => {
      const jamos = decomposeToJamos('a가');
      expect(jamos).toEqual(['a', 'ㄱ', 'ㅏ']);
    });
  });

  describe('Adjacent Key Detection - 인접 키 감지', () => {
    it('should detect adjacent consonants', () => {
      expect(isAdjacentKey('ㄱ', 'ㅅ')).toBe(true);
      expect(isAdjacentKey('ㅂ', 'ㅈ')).toBe(true);
      expect(isAdjacentKey('ㄴ', 'ㅇ')).toBe(true);
    });

    it('should detect adjacent vowels', () => {
      expect(isAdjacentKey('ㅏ', 'ㅓ')).toBe(true);
      expect(isAdjacentKey('ㅗ', 'ㅜ')).toBe(true);
    });

    it('should return false for non-adjacent keys', () => {
      expect(isAdjacentKey('ㄱ', 'ㅎ')).toBe(false);
      expect(isAdjacentKey('ㅏ', 'ㅠ')).toBe(false);
    });
  });

  describe('Double Consonant Detection - 쌍자음 감지', () => {
    it('should detect double consonant pairs', () => {
      expect(isDoubleConsonantMistake('ㄱ', 'ㄲ')).toBe(true);
      expect(isDoubleConsonantMistake('ㅅ', 'ㅆ')).toBe(true);
      expect(isDoubleConsonantMistake('ㅂ', 'ㅃ')).toBe(true);
    });

    it('should return false for non-double consonants', () => {
      expect(isDoubleConsonantMistake('ㄱ', 'ㄴ')).toBe(false);
      expect(isDoubleConsonantMistake('ㅅ', 'ㅎ')).toBe(false);
    });
  });

  describe('Edit Distance Calculation - 편집거리 계산', () => {
    it('should return 0 for identical words', () => {
      expect(jamoEditDistance('안녕', '안녕')).toBe(0);
      expect(jamoEditDistance('분석', '분석')).toBe(0);
    });

    it('should calculate distance for single jamo difference', () => {
      // 분석 vs 분셕 (ㅓ vs ㅓ+ㄱ)
      const dist = jamoEditDistance('분석', '분셕');
      expect(dist).toBeGreaterThan(0);
      expect(dist).toBeLessThan(2);
    });

    it('should give lower distance for adjacent key typos', () => {
      // Adjacent keys should have lower cost
      const distAdjacent = jamoEditDistance('가', '사'); // ㄱ and ㅅ are adjacent
      const distNonAdjacent = jamoEditDistance('가', '하'); // ㄱ and ㅎ are not adjacent
      expect(distAdjacent).toBeLessThanOrEqual(distNonAdjacent);
    });

    it('should give lower distance for double consonant mistakes', () => {
      // ㄱ vs ㄲ should be cheap
      const dist = jamoEditDistance('가', '까');
      expect(dist).toBeLessThan(1);
    });
  });

  describe('Keyboard Similarity - 키보드 유사도', () => {
    it('should return 1 for identical words', () => {
      expect(calculateKeyboardSimilarity('안녕', '안녕')).toBe(1);
    });

    it('should return high similarity for similar words', () => {
      const similarity = calculateKeyboardSimilarity('분석', '분셕');
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should return low similarity for different words', () => {
      const similarity = calculateKeyboardSimilarity('사과', '바나나');
      expect(similarity).toBeLessThan(0.5);
    });
  });
});

describe('Typo Corrector Integration - 오타 교정 통합', () => {
  it('should correct common typos', () => {
    const result = correctTypos('할수있다');
    expect(result.corrected).toBe('할 수 있다');
    expect(result.corrections.length).toBeGreaterThan(0);
    expect(result.corrections[0]?.type).toBe('common_typo');
  });

  it('should correct spacing errors', () => {
    const result = correctTypos('학교 에 가요');
    expect(result.corrected).toBe('학교에 가요');
  });

  it('should combine multiple corrections', () => {
    const result = correctTypos('할수있다고 하고있다');
    expect(result.corrected).toContain('할 수 있다');
    expect(result.corrected).toContain('하고 있다');
  });

  it('should have confidence score', () => {
    const result = correctTypos('할수있다');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should preserve original text in result', () => {
    const original = '할수있다';
    const result = correctTypos(original);
    expect(result.original).toBe(original);
  });
});

describe('Find Similar Words - 유사 단어 찾기', () => {
  const dictionary = ['분석', '분류', '분리', '분배', '분산', '분실', '분야'];

  it('should find similar words', () => {
    const candidates = findSimilarWords('분셕', dictionary);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]?.word).toBe('분석');
  });

  it('should rank by similarity', () => {
    const candidates = findSimilarWords('분셕', dictionary, 3);
    // Candidates should be sorted by similarity (descending)
    for (let i = 1; i < candidates.length; i++) {
      const prev = candidates[i - 1];
      const curr = candidates[i];
      if (prev && curr) {
        expect(prev.similarity).toBeGreaterThanOrEqual(curr.similarity);
      }
    }
  });

  it('should filter by threshold', () => {
    const candidates = findSimilarWords('완전다른단어', dictionary, 5, 0.9);
    expect(candidates.length).toBe(0);
  });
});

describe('Correction Stats - 교정 통계', () => {
  it('should calculate stats correctly', () => {
    const result = correctTypos('할수있다고 하고있다');
    const stats = getCorrectionStats(result);

    expect(stats.totalCorrections).toBeGreaterThan(0);
    expect(stats.averageConfidence).toBeGreaterThan(0);
  });

  it('should categorize correction types', () => {
    const result = correctTypos('할수있다');
    const stats = getCorrectionStats(result);

    expect(stats.commonTypoCorrections).toBeGreaterThan(0);
  });
});

describe('Spacing Only Mode - 띄어쓰기만 교정', () => {
  it('should only correct spacing', () => {
    const result = correctSpacingOnly('할수있다');
    expect(result).toBe('할 수있다');
  });

  it('should not change non-spacing typos', () => {
    const result = correctSpacingOnly('되요');
    expect(result).toBe('되요'); // 되요→돼요 is not spacing error
  });
});
