import { describe, expect, it } from 'vitest';
import { analyzeSyllables, countSyllables, findSyllableBoundaries } from '../src/syllable/analyzer';
import { applyLiaison, choToJong, combineSyllables } from '../src/syllable/combiner';

describe('Syllable Analyzer', () => {
  describe('analyzeSyllables', () => {
    it('한글 문자열을 음절 단위로 분석', () => {
      const result = analyzeSyllables('안녕');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        char: '안',
        index: 0,
        jamo: { cho: 'ㅇ', jung: 'ㅏ', jong: 'ㄴ' },
      });
      expect(result[1]).toMatchObject({
        char: '녕',
        index: 1,
        jamo: { cho: 'ㄴ', jung: 'ㅕ', jong: 'ㅇ' },
      });
    });

    it('받침 없는 글자 분석', () => {
      const result = analyzeSyllables('하나');
      expect(result).toHaveLength(2);
      expect(result[0]?.jamo.jong).toBe('');
      expect(result[1]?.jamo.jong).toBe('');
    });

    it('빈 문자열 처리', () => {
      const result = analyzeSyllables('');
      expect(result).toHaveLength(0);
    });

    it('영문/숫자 혼합 문자열에서 한글만 분석', () => {
      const result = analyzeSyllables('a가b나1');
      expect(result).toHaveLength(2);
      expect(result[0]?.char).toBe('가');
      expect(result[1]?.char).toBe('나');
    });

    it('겹받침 분석', () => {
      const result = analyzeSyllables('닭');
      expect(result).toHaveLength(1);
      expect(result[0]?.jamo.jong).toBe('ㄺ');
    });
  });

  describe('countSyllables', () => {
    it('한글 음절 수 계산', () => {
      expect(countSyllables('안녕하세요')).toBe(5);
      expect(countSyllables('가나다라')).toBe(4);
      expect(countSyllables('')).toBe(0);
    });

    it('혼합 문자열에서 한글만 계산', () => {
      expect(countSyllables('Hello안녕World')).toBe(2);
      expect(countSyllables('123가나456')).toBe(2);
    });

    it('공백 포함 문자열', () => {
      expect(countSyllables('안녕 하세요')).toBe(5);
    });
  });

  describe('findSyllableBoundaries', () => {
    it('음절 경계 인덱스 반환', () => {
      const boundaries = findSyllableBoundaries('안녕하세요');
      expect(boundaries).toEqual([0, 1, 2, 3, 4]);
    });

    it('혼합 문자열의 한글 위치만 반환', () => {
      const boundaries = findSyllableBoundaries('a가b나c다');
      expect(boundaries).toEqual([1, 3, 5]);
    });

    it('빈 문자열', () => {
      expect(findSyllableBoundaries('')).toEqual([]);
    });

    it('한글 없는 문자열', () => {
      expect(findSyllableBoundaries('abc123')).toEqual([]);
    });
  });
});

describe('Syllable Combiner', () => {
  describe('choToJong', () => {
    it('초성을 종성으로 변환', () => {
      expect(choToJong('ㄱ')).toBe('ㄱ');
      expect(choToJong('ㄴ')).toBe('ㄴ');
      expect(choToJong('ㅁ')).toBe('ㅁ');
      expect(choToJong('ㅎ')).toBe('ㅎ');
    });

    it('쌍자음 변환', () => {
      expect(choToJong('ㄲ')).toBe('ㄲ');
      expect(choToJong('ㅆ')).toBe('ㅆ');
    });

    it('매핑되지 않는 문자는 빈 문자열', () => {
      expect(choToJong('ㅃ')).toBe('');
      expect(choToJong('ㅉ')).toBe('');
    });
  });

  describe('applyLiaison', () => {
    it('연음 적용 - 기본', () => {
      // '음악' → 연음 시 '으막' (ㅁ 받침이 다음 초성으로)
      const result = applyLiaison('음악');
      expect(result).toBe('으막');
    });

    it('연음 적용 - ㅇ 초성 다음 글자', () => {
      // '먹어' → '머거' (실제 발음)
      const result = applyLiaison('먹어');
      expect(result).toBe('머거');
    });

    it('연음 적용 - 겹받침', () => {
      // '닭이' → '달기' (ㄺ → ㄹ + ㄱ)
      const result = applyLiaison('닭이');
      expect(result).toBe('달기');
    });

    it('연음 미적용 - 받침 없는 경우', () => {
      const result = applyLiaison('하이');
      expect(result).toBe('하이');
    });

    it('연음 미적용 - 다음 초성이 ㅇ이 아닌 경우', () => {
      const result = applyLiaison('한글');
      expect(result).toBe('한글');
    });

    it('빈 문자열', () => {
      expect(applyLiaison('')).toBe('');
    });

    it('단일 글자', () => {
      expect(applyLiaison('안')).toBe('안');
    });
  });

  describe('combineSyllables', () => {
    it('모음 축약 - ㅏ+ㅏ', () => {
      // '가' + '아' → '가' (ㅏ+ㅏ 축약)
      const result = combineSyllables('가', '아');
      expect(result).toBe('가');
    });

    it('모음 축약 - ㅗ+ㅏ', () => {
      // '오' + '아' → '와'
      const result = combineSyllables('오', '아');
      expect(result).toBe('와');
    });

    it('모음 축약 - ㅜ+ㅓ', () => {
      // '두' + '어' → '둬'
      const result = combineSyllables('두', '어');
      expect(result).toBe('둬');
    });

    it('축약 불가 - 받침 있는 경우', () => {
      const result = combineSyllables('먹', '어');
      expect(result).toBe('먹어');
    });

    it('축약 불가 - 다음 초성이 ㅇ이 아닌 경우', () => {
      const result = combineSyllables('가', '나');
      expect(result).toBe('가나');
    });

    it('빈 문자열 처리', () => {
      expect(combineSyllables('', '아')).toBe('아');
      expect(combineSyllables('가', '')).toBe('가');
      expect(combineSyllables('', '')).toBe('');
    });

    it('긴 문자열 - 마지막 글자만 처리', () => {
      const result = combineSyllables('하나', '아');
      expect(result).toBe('하나');
    });
  });
});

describe('Edge Cases - 경계값 테스트', () => {
  describe('특수 한글 처리', () => {
    it('옛한글/확장 한글은 분석 제외', () => {
      // 일반 한글 범위 외의 문자
      const result = analyzeSyllables('ㄱㄴㄷ');
      expect(result).toHaveLength(0);
    });

    it('자모만 있는 문자열', () => {
      expect(countSyllables('ㄱㄴㄷㄹ')).toBe(0);
    });
  });

  describe('연속 처리', () => {
    it('긴 문장 연음', () => {
      const result = applyLiaison('학교에서 음악을 들었어요');
      // 연음 규칙이 적용되는 부분만 변환
      expect(result).toContain('으막');
    });

    it('복합 축약', () => {
      // 여러 축약이 연속으로 일어나는 경우
      const result = combineSyllables('가', '아');
      expect(result).toBe('가');
    });
  });
});
