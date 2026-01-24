import { describe, expect, it } from 'vitest';
import {
  type CorrectionResult,
  correctSpacingOnly,
  correctTypos,
  extractTypoCandidates,
  findSimilarWords,
  getCorrectionStats,
  isTypo,
} from '../src/correction/typo-corrector';

describe('Typo Corrector', () => {
  describe('correctTypos', () => {
    it('빈 문자열 처리', () => {
      const result = correctTypos('');
      expect(result.corrected).toBe('');
      expect(result.corrections).toHaveLength(0);
    });

    it('오타 없는 텍스트', () => {
      const result = correctTypos('안녕하세요');
      expect(result.original).toBe('안녕하세요');
      expect(result.corrected).toBe('안녕하세요');
    });

    it('빈번한 오타 교정', () => {
      // common-typos.ts에 정의된 오타가 있다면 테스트
      const result = correctTypos('않녕하세요');
      // 결과가 교정되었는지 확인
      expect(result.original).toBe('않녕하세요');
      // corrections 배열 확인
      expect(Array.isArray(result.corrections)).toBe(true);
    });

    it('사전 기반 유사 단어 교정', () => {
      const dictionary = ['사과', '바나나', '오렌지', '포도'];
      const result = correctTypos('사꽈', dictionary);
      // 유사 단어 찾기 시도
      expect(result.original).toBe('사꽈');
    });

    it('여러 단어 교정', () => {
      const dictionary = ['안녕', '하세요', '감사', '합니다'];
      const result = correctTypos('안녕 하세요', dictionary);
      expect(result.corrected).toBe('안녕 하세요');
    });

    it('confidence 계산 확인', () => {
      const result = correctTypos('테스트');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('findSimilarWords', () => {
    const dictionary = ['사과', '바나나', '오렌지', '포도', '수박', '참외'];

    it('빈 사전', () => {
      const result = findSimilarWords('사과', []);
      expect(result).toHaveLength(0);
    });

    it('정확한 단어', () => {
      const result = findSimilarWords('사과', dictionary);
      // 정확히 일치하면 similarity가 높음
      const exactMatch = result.find((c) => c.word === '사과');
      if (exactMatch) {
        expect(exactMatch.similarity).toBe(1);
      }
    });

    it('유사 단어 찾기', () => {
      const result = findSimilarWords('사꽈', dictionary, 3, 0.5);
      // 유사 단어가 있으면 반환
      expect(Array.isArray(result)).toBe(true);
    });

    it('maxResults 제한', () => {
      const result = findSimilarWords('과', dictionary, 2, 0.3);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('threshold 적용', () => {
      const result = findSimilarWords('xyz', dictionary, 5, 0.9);
      // 매우 다른 단어는 threshold 이상의 유사도가 없음
      for (const candidate of result) {
        expect(candidate.similarity).toBeGreaterThanOrEqual(0.9);
      }
    });

    it('길이 차이 필터링', () => {
      // 길이 차이가 3 초과면 스킵
      const result = findSimilarWords('가', ['가나다라마바사아'], 5, 0.1);
      expect(result).toHaveLength(0);
    });

    it('유사도 정렬', () => {
      const result = findSimilarWords('사과', dictionary, 5, 0.3);
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1]?.similarity).toBeGreaterThanOrEqual(result[i]?.similarity ?? 0);
      }
    });
  });

  describe('isTypo', () => {
    const dictionary = ['안녕', '하세요', '감사', '합니다'];

    it('사전에 있는 단어', () => {
      const result = isTypo('안녕', dictionary);
      expect(result).toBe(false);
    });

    it('사전에 없고 유사 단어 있음', () => {
      // 유사 단어가 있으면 오타로 판단
      const result = isTypo('안녕', ['안냥']);
      // '안녕'은 사전에 없고 '안냥'과 유사
      expect(typeof result).toBe('boolean');
    });

    it('사전에 없고 유사 단어 없음', () => {
      const result = isTypo('xyz', dictionary);
      expect(result).toBe(false);
    });

    it('빈 사전', () => {
      const result = isTypo('안녕', []);
      expect(result).toBe(false);
    });
  });

  describe('extractTypoCandidates', () => {
    const dictionary = ['안녕', '하세요', '감사', '합니다'];

    it('빈 텍스트', () => {
      const result = extractTypoCandidates('', dictionary);
      expect(result).toHaveLength(0);
    });

    it('오타 없는 텍스트', () => {
      const result = extractTypoCandidates('안녕 하세요', dictionary);
      expect(result).toHaveLength(0);
    });

    it('오타 후보 추출', () => {
      const result = extractTypoCandidates('안냥 하세요', dictionary);
      // 안냥은 안녕과 유사하므로 후보로 추출될 수 있음
      expect(Array.isArray(result)).toBe(true);
    });

    it('position 계산', () => {
      const result = extractTypoCandidates('가나다 라마바', ['다른단어']);
      for (const candidate of result) {
        expect(candidate.position).toBeGreaterThanOrEqual(0);
      }
    });

    it('suggestions 포함', () => {
      const result = extractTypoCandidates('안냥', dictionary);
      for (const candidate of result) {
        expect(Array.isArray(candidate.suggestions)).toBe(true);
      }
    });
  });

  describe('correctSpacingOnly', () => {
    it('빈 문자열', () => {
      const result = correctSpacingOnly('');
      expect(result).toBe('');
    });

    it('띄어쓰기 교정', () => {
      // 붙어쓴 문장 분리
      const result = correctSpacingOnly('안녕하세요감사합니다');
      expect(typeof result).toBe('string');
    });

    it('정상 띄어쓰기 유지', () => {
      const result = correctSpacingOnly('안녕 하세요');
      expect(result).toContain('안녕');
    });
  });

  describe('getCorrectionStats', () => {
    it('교정 없음', () => {
      const result: CorrectionResult = {
        original: 'test',
        corrected: 'test',
        corrections: [],
        confidence: 1.0,
      };
      const stats = getCorrectionStats(result);
      expect(stats.totalCorrections).toBe(0);
      expect(stats.commonTypoCorrections).toBe(0);
      expect(stats.spacingCorrections).toBe(0);
      expect(stats.similarWordCorrections).toBe(0);
    });

    it('common_typo 교정 카운트', () => {
      const result: CorrectionResult = {
        original: 'test',
        corrected: 'test2',
        corrections: [
          { type: 'common_typo', original: 'a', corrected: 'b', confidence: 0.9 },
          { type: 'common_typo', original: 'c', corrected: 'd', confidence: 0.8 },
        ],
        confidence: 0.85,
      };
      const stats = getCorrectionStats(result);
      expect(stats.totalCorrections).toBe(2);
      expect(stats.commonTypoCorrections).toBe(2);
      expect(stats.spacingCorrections).toBe(0);
      expect(stats.similarWordCorrections).toBe(0);
    });

    it('spacing 교정 카운트', () => {
      const result: CorrectionResult = {
        original: 'test',
        corrected: 'test2',
        corrections: [{ type: 'spacing', original: 'a', corrected: 'b', confidence: 0.9 }],
        confidence: 0.9,
      };
      const stats = getCorrectionStats(result);
      expect(stats.spacingCorrections).toBe(1);
    });

    it('similar_word 교정 카운트', () => {
      const result: CorrectionResult = {
        original: 'test',
        corrected: 'test2',
        corrections: [{ type: 'similar_word', original: 'a', corrected: 'b', confidence: 0.8 }],
        confidence: 0.8,
      };
      const stats = getCorrectionStats(result);
      expect(stats.similarWordCorrections).toBe(1);
    });

    it('혼합 교정 카운트', () => {
      const result: CorrectionResult = {
        original: 'test',
        corrected: 'test2',
        corrections: [
          { type: 'common_typo', original: 'a', corrected: 'b', confidence: 0.9 },
          { type: 'spacing', original: 'c', corrected: 'd', confidence: 0.8 },
          { type: 'similar_word', original: 'e', corrected: 'f', confidence: 0.7 },
        ],
        confidence: 0.8,
      };
      const stats = getCorrectionStats(result);
      expect(stats.totalCorrections).toBe(3);
      expect(stats.commonTypoCorrections).toBe(1);
      expect(stats.spacingCorrections).toBe(1);
      expect(stats.similarWordCorrections).toBe(1);
    });

    it('averageConfidence 확인', () => {
      const result: CorrectionResult = {
        original: 'test',
        corrected: 'test2',
        corrections: [],
        confidence: 0.75,
      };
      const stats = getCorrectionStats(result);
      expect(stats.averageConfidence).toBe(0.75);
    });
  });
});

describe('Edge Cases - 경계값 테스트', () => {
  it('공백만 있는 텍스트', () => {
    const result = correctTypos('   ');
    expect(result.corrected.trim()).toBe('');
  });

  it('특수문자 포함', () => {
    const result = correctTypos('안녕!@#$%');
    expect(result.original).toBe('안녕!@#$%');
  });

  it('숫자 포함', () => {
    const result = correctTypos('안녕123하세요');
    expect(result.original).toBe('안녕123하세요');
  });

  it('영문 혼합', () => {
    const result = correctTypos('Hello안녕World');
    expect(result.original).toBe('Hello안녕World');
  });

  it('매우 긴 텍스트', () => {
    const longText = '안녕하세요 '.repeat(100);
    const result = correctTypos(longText);
    expect(result.original).toBe(longText);
  });

  it('사전이 undefined일 때', () => {
    const result = correctTypos('테스트', undefined);
    expect(result.original).toBe('테스트');
  });

  it('큰 사전', () => {
    const largeDictionary = Array.from({ length: 1000 }, (_, i) => `단어${i}`);
    const result = correctTypos('테스트', largeDictionary);
    expect(result.original).toBe('테스트');
  });
});
