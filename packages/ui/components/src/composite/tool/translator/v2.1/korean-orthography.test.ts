/**
 * 한글 맞춤법 규칙 테스트
 * 국립국어원 한글 맞춤법 기준
 */

import { describe, expect, it } from 'vitest';
import {
  applyInitialLaw,
  classifyAmbiguousForm,
  correctSpacing,
  formatLargeNumber,
  formatNameWithHonorific,
  isDependentNoun,
  isParticle,
  isUnitNoun,
  postProcessKoreanSpacing,
  validateSpacing,
} from './korean-orthography';

describe('한글 맞춤법 제5장 띄어쓰기', () => {
  describe('제41항: 조사는 그 앞말에 붙여 쓴다', () => {
    it('주격 조사 검증', () => {
      expect(isParticle('이')).toBe(true);
      expect(isParticle('가')).toBe(true);
      expect(isParticle('은')).toBe(true);
      expect(isParticle('는')).toBe(true);
    });

    it('목적격 조사 검증', () => {
      expect(isParticle('을')).toBe(true);
      expect(isParticle('를')).toBe(true);
    });

    it('복합 조사 검증', () => {
      expect(isParticle('에서부터')).toBe(true);
      expect(isParticle('으로서는')).toBe(true);
      expect(isParticle('에게는')).toBe(true);
    });

    it('조사 띄어쓰기 교정', () => {
      // "단어 조사" → "단어조사"
      expect(correctSpacing('사과 를 먹다')).toBe('사과를 먹다');
      expect(correctSpacing('학교 에 가다')).toBe('학교에 가다');
      expect(correctSpacing('친구 와 만나다')).toBe('친구와 만나다');
    });
  });

  describe('제42항: 의존 명사는 띄어 쓴다', () => {
    it('의존명사 검증', () => {
      expect(isDependentNoun('것')).toBe(true);
      expect(isDependentNoun('수')).toBe(true);
      expect(isDependentNoun('줄')).toBe(true);
      expect(isDependentNoun('뿐')).toBe(true);
      expect(isDependentNoun('바')).toBe(true);
      expect(isDependentNoun('리')).toBe(true);
    });

    it('의존명사 띄어쓰기 교정', () => {
      // 관형사형 + 의존명사는 띄어쓰기
      expect(correctSpacing('할수 있다')).toBe('할 수 있다');
      expect(correctSpacing('먹을것')).toBe('먹을 것');
    });

    it('의존명사 vs 조사 구분: 뿐', () => {
      // 체언 뒤 = 조사 (붙여쓰기)
      expect(classifyAmbiguousForm('뿐', '남자')).toBe('particle');
      // 관형사형 뒤 = 의존명사 (띄어쓰기)
      expect(classifyAmbiguousForm('뿐', '웃을')).toBe('dependent_noun');
    });

    it('의존명사 vs 조사 구분: 대로', () => {
      // 체언 뒤 = 조사
      expect(classifyAmbiguousForm('대로', '법')).toBe('particle');
      // 관형사형 뒤 = 의존명사
      expect(classifyAmbiguousForm('대로', '아는')).toBe('dependent_noun');
    });

    it('의존명사 vs 조사 구분: 만큼', () => {
      // 체언 뒤 = 조사
      expect(classifyAmbiguousForm('만큼', '학생')).toBe('particle');
      // 관형사형 뒤 = 의존명사
      expect(classifyAmbiguousForm('만큼', '볼')).toBe('dependent_noun');
    });
  });

  describe('제43항: 단위를 나타내는 명사는 띄어 쓴다', () => {
    it('단위명사 검증', () => {
      expect(isUnitNoun('개')).toBe(true);
      expect(isUnitNoun('명')).toBe(true);
      expect(isUnitNoun('마리')).toBe(true);
      expect(isUnitNoun('미터')).toBe(true);
      expect(isUnitNoun('원')).toBe(true);
    });

    it('순서 단위 검증', () => {
      expect(isUnitNoun('번')).toBe(true);
      expect(isUnitNoun('번째')).toBe(true);
      expect(isUnitNoun('호')).toBe(true);
    });
  });

  describe('제44항: 수를 적을 때에는 만 단위로 띄어 쓴다', () => {
    it('만 단위 띄어쓰기', () => {
      expect(formatLargeNumber(12345678)).toBe('1234만 5678');
      expect(formatLargeNumber(123456789012)).toBe('1234억 5678만 9012');
    });

    it('작은 수는 그대로', () => {
      expect(formatLargeNumber(1234)).toBe('1234');
      expect(formatLargeNumber(9999)).toBe('9999');
    });
  });

  describe('제48항: 성과 이름은 붙여 쓰고, 호칭어는 띄어 쓴다', () => {
    it('이름 + 호칭 띄어쓰기', () => {
      expect(formatNameWithHonorific('김철수', '씨')).toBe('김철수 씨');
      expect(formatNameWithHonorific('박영희', '선생님')).toBe('박영희 선생님');
      expect(formatNameWithHonorific('이민수', '교수님')).toBe('이민수 교수님');
    });

    it('호칭어 띄어쓰기 교정', () => {
      expect(correctSpacing('김철수씨')).toBe('김철수 씨');
      expect(correctSpacing('박영희님')).toBe('박영희 님');
    });
  });

  describe('띄어쓰기 검증', () => {
    it('올바른 띄어쓰기 검증', () => {
      const result = validateSpacing('사과를 먹다');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('조사 띄어쓰기 오류 검출', () => {
      const result = validateSpacing('사과 를 먹다');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].rule).toBe('제41항');
    });
  });
});

describe('형태에 관한 규칙', () => {
  describe('두음법칙 (제10항~제12항)', () => {
    it('ㄴ → ㅇ 변환', () => {
      expect(applyInitialLaw('녀자')).toBe('여자');
      expect(applyInitialLaw('뇨소')).toBe('요소');
    });

    it('ㄹ → ㄴ/ㅇ 변환', () => {
      expect(applyInitialLaw('리유')).toBe('이유');
      expect(applyInitialLaw('량식')).toBe('양식');
    });

    it('두음법칙 미적용 단어', () => {
      expect(applyInitialLaw('사과')).toBe('사과');
      expect(applyInitialLaw('학교')).toBe('학교');
    });
  });
});

describe('번역기 통합 테스트', () => {
  it('한국어 후처리: 조사 붙여쓰기', () => {
    expect(postProcessKoreanSpacing('사과 를 먹었다')).toBe('사과를 먹었다');
    expect(postProcessKoreanSpacing('학교 에 갔다')).toBe('학교에 갔다');
    expect(postProcessKoreanSpacing('친구 와 놀았다')).toBe('친구와 놀았다');
  });

  it('복합 문장 처리', () => {
    const input = '철수 는 학교 에 갔다';
    const expected = '철수는 학교에 갔다';
    expect(postProcessKoreanSpacing(input)).toBe(expected);
  });
});
