import { describe, expect, it } from 'vitest';
import { applyIrregular, getIrregularType, irregularStems, restoreIrregular } from '../src';

describe('irregulars', () => {
  describe('irregularStems', () => {
    it('should contain known irregular stems', () => {
      expect(irregularStems['ㄷ']).toContain('듣');
      expect(irregularStems['ㅂ']).toContain('돕');
      expect(irregularStems['ㅎ']).toContain('파랗');
      expect(irregularStems['ㅅ']).toContain('짓');
      expect(irregularStems['르']).toContain('빠르');
    });

    it('should contain 러불규칙 stems', () => {
      expect(irregularStems['러']).toContain('푸르');
    });

    it('should contain 우불규칙 stems', () => {
      expect(irregularStems['우']).toContain('푸');
    });

    it('should contain 으불규칙 stems', () => {
      expect(irregularStems['으']).toContain('쓰');
      expect(irregularStems['으']).toContain('크');
    });
  });

  describe('getIrregularType', () => {
    it('should return the correct irregular type', () => {
      expect(getIrregularType('듣')).toBe('ㄷ');
      expect(getIrregularType('돕')).toBe('ㅂ');
      expect(getIrregularType('파랗')).toBe('ㅎ');
      expect(getIrregularType('짓')).toBe('ㅅ');
      expect(getIrregularType('빠르')).toBe('르');
      expect(getIrregularType('쓰')).toBe('으');
    });

    it('should return 러 for 러불규칙 stems', () => {
      // 푸르 is only in 러 list (이르 is in both 르 and 러)
      expect(getIrregularType('푸르')).toBe('러');
    });

    it('should return 우 for 우불규칙 stems', () => {
      expect(getIrregularType('푸')).toBe('우');
    });

    it('should return null for regular stems', () => {
      expect(getIrregularType('먹')).toBeNull();
      expect(getIrregularType('가')).toBeNull();
    });
  });

  describe('applyIrregular', () => {
    // ㄷ불규칙
    it('should apply ㄷ irregular: 듣 + 어요 → 들어요', () => {
      expect(applyIrregular('듣', '어요')).toBe('들어요');
    });

    it('should apply ㄷ irregular: 걷 + 어요 → 걸어요', () => {
      expect(applyIrregular('걷', '어요')).toBe('걸어요');
    });

    // ㅂ불규칙
    it('should apply ㅂ irregular: 돕 + 아요 → 도와요', () => {
      expect(applyIrregular('돕', '아요')).toBe('도와요');
    });

    it('should apply ㅂ irregular: 춥 + 어요 → 추워요', () => {
      expect(applyIrregular('춥', '어요')).toBe('추워요');
    });

    it('should apply ㅂ irregular: 덥 + 어요 → 더워요', () => {
      expect(applyIrregular('덥', '어요')).toBe('더워요');
    });

    // ㅅ불규칙
    it('should apply ㅅ irregular: 짓 + 어요 → 지어요', () => {
      expect(applyIrregular('짓', '어요')).toBe('지어요');
    });

    it('should apply ㅅ irregular: 낫 + 아요 → 나아요', () => {
      expect(applyIrregular('낫', '아요')).toBe('나아요');
    });

    // ㅎ불규칙
    it('should apply ㅎ irregular: 파랗 + 아요 → 파래요', () => {
      expect(applyIrregular('파랗', '아요')).toBe('파래요');
    });

    it('should apply ㅎ irregular: 노랗 + 아요 → 노래요', () => {
      expect(applyIrregular('노랗', '아요')).toBe('노래요');
    });

    it('should apply ㅎ irregular: 까맣 + 어요 → 까메요', () => {
      // ㅎ탈락 + ㅓ→ㅔ 변환
      expect(applyIrregular('까맣', '어요')).toBe('까메요');
    });

    it('should apply ㅎ irregular: 하얗 + 어요 → 하에요', () => {
      // ㅎ탈락 + ㅓ→ㅔ 변환
      expect(applyIrregular('하얗', '어요')).toBe('하에요');
    });

    // 르불규칙
    it('should apply 르 irregular: 빠르 + 아요 → 빨라요', () => {
      expect(applyIrregular('빠르', '아요')).toBe('빨라요');
    });

    it('should apply 르 irregular: 다르 + 아요 → 달라요', () => {
      expect(applyIrregular('다르', '아요')).toBe('달라요');
    });

    it('should apply 르 irregular: 모르 + 아요 → 몰라요', () => {
      expect(applyIrregular('모르', '아요')).toBe('몰라요');
    });

    it('should apply 르 irregular: 부르 + 어요 → 불러요', () => {
      expect(applyIrregular('부르', '어요')).toBe('불러요');
    });

    // 러불규칙 - 푸르 사용 (이르는 르불규칙 우선 매칭)
    it('should apply 러 irregular: 푸르 + 어 → 푸르러', () => {
      expect(applyIrregular('푸르', '어')).toBe('푸르러');
    });

    it('should apply 러 irregular: 푸르 + 어요 → 푸르러요', () => {
      expect(applyIrregular('푸르', '어요')).toBe('푸르러요');
    });

    // 이르는 르불규칙으로 처리됨 (Object.entries 순서상 르가 먼저)
    it('should apply 르 irregular to 이르: 이르 + 어 → 일러', () => {
      expect(applyIrregular('이르', '어')).toBe('일러');
    });

    // 우불규칙
    it('should apply 우 irregular: 푸 + 어요 → 퍼요', () => {
      expect(applyIrregular('푸', '어요')).toBe('퍼요');
    });

    it('should apply 우 irregular: 푸 + 어 → 퍼', () => {
      expect(applyIrregular('푸', '어')).toBe('퍼');
    });

    // 으불규칙
    it('should apply 으 irregular: 쓰 + 어요 → 써요', () => {
      expect(applyIrregular('쓰', '어요')).toBe('써요');
    });

    it('should apply 으 irregular: 크 + 어요 → 커요', () => {
      expect(applyIrregular('크', '어요')).toBe('커요');
    });

    it('should apply 으 irregular: 끄 + 어요 → 꺼요', () => {
      expect(applyIrregular('끄', '어요')).toBe('꺼요');
    });

    it('should apply 으 irregular: 뜨 + 어요 → 떠요', () => {
      expect(applyIrregular('뜨', '어요')).toBe('떠요');
    });

    // 자음 어미 - 불규칙 미적용
    it('should not apply irregular for consonant-starting endings', () => {
      expect(applyIrregular('듣', '고')).toBe('듣고');
      expect(applyIrregular('돕', '니까')).toBe('돕니까');
      expect(applyIrregular('파랗', '지')).toBe('파랗지');
      expect(applyIrregular('빠르', '면')).toBe('빠르면');
    });

    // 규칙 동사
    it('should return stem + ending for regular verbs', () => {
      expect(applyIrregular('먹', '어요')).toBe('먹어요');
      expect(applyIrregular('가', '아요')).toBe('가아요');
    });

    // 엣지 케이스
    it('should handle empty stem or ending', () => {
      expect(applyIrregular('', '어요')).toBe('어요');
      expect(applyIrregular('듣', '')).toBe('듣');
      expect(applyIrregular('', '')).toBe('');
    });
  });

  describe('restoreIrregular', () => {
    it('should return null (TODO: not yet implemented)', () => {
      expect(restoreIrregular('들', 'ㄷ')).toBeNull();
      expect(restoreIrregular('도와', 'ㅂ')).toBeNull();
    });
  });

  describe('Edge Cases - 경계값 테스트', () => {
    it('should handle ㅎ irregular with consonant-starting ending', () => {
      // ㅎ불규칙에서 자음으로 시작하는 어미 - 불규칙 미적용
      expect(applyIrregular('파랗', '고')).toBe('파랗고');
      expect(applyIrregular('까맣', '지만')).toBe('까맣지만');
    });

    it('should handle 르 irregular with short stem', () => {
      // '르'만 있는 경우 (앞 글자 없음)
      expect(applyIrregular('르', '아요')).toBe('르아요');
    });

    it('should handle 우 irregular with non-어 vowel', () => {
      // 푸 + 아요 (ㅓ가 아닌 다른 모음)
      expect(applyIrregular('푸', '아요')).toBe('푸아요');
    });
  });
});
