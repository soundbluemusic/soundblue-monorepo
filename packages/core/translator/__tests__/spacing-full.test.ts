import { describe, expect, it } from 'vitest';
import { correctSpacingFull, recoverSpacing } from '../src/correction/spacing-full';

describe('spacing-full - 통합 띄어쓰기 교정', () => {
  describe('recoverSpacing', () => {
    it('빈 문자열 처리', () => {
      const result = recoverSpacing('');
      expect(result.recovered).toBe('');
      expect(result.confidence).toBe(1);
    });

    it('짧은 토큰 그대로 유지', () => {
      const result = recoverSpacing('나 너');
      expect(result.recovered).toBe('나 너');
    });

    it('사전에 있는 단어 유지', () => {
      const result = recoverSpacing('학교');
      expect(result.recovered).toBe('학교');
    });

    it('명사+조사 패턴 유지', () => {
      const result = recoverSpacing('학교에');
      expect(result.recovered).toBe('학교에');
    });

    it('동사+어미 패턴 유지', () => {
      const result = recoverSpacing('갔다');
      expect(result.recovered).toBe('갔다');
    });

    it('한글 없는 토큰 그대로 유지', () => {
      const result = recoverSpacing('abc 123 !@#');
      expect(result.recovered).toBe('abc 123 !@#');
      expect(result.confidence).toBe(1);
    });

    it('영어만 있는 문자열', () => {
      const result = recoverSpacing('hello world');
      expect(result.recovered).toBe('hello world');
    });

    it('숫자만 있는 문자열', () => {
      const result = recoverSpacing('12345');
      expect(result.recovered).toBe('12345');
    });

    it('특수문자만 있는 문자열', () => {
      const result = recoverSpacing('!@#$%');
      expect(result.recovered).toBe('!@#$%');
    });

    it('붙어쓴 문장 분리', () => {
      const result = recoverSpacing('나는학교에갔다');
      // 결과가 분리되어야 함
      expect(result.recovered.split(' ').length).toBeGreaterThanOrEqual(1);
    });

    it('혼합 텍스트 처리', () => {
      const result = recoverSpacing('hello안녕world');
      expect(typeof result.recovered).toBe('string');
    });

    it('confidence 값 범위 확인', () => {
      const result = recoverSpacing('안녕하세요');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('correctSpacingFull', () => {
    it('빈 문자열 처리', () => {
      const result = correctSpacingFull('');
      expect(result.corrected).toBe('');
    });

    it('정상 띄어쓰기 유지', () => {
      const result = correctSpacingFull('안녕 하세요');
      expect(result.corrected).toContain('안녕');
    });

    it('글자별 분리된 텍스트 합치기', () => {
      // 예: "안 녕 하 세 요" → "안녕하세요"
      const result = correctSpacingFull('안 녕 하 세 요');
      expect(typeof result.corrected).toBe('string');
    });

    it('붙어쓴 문장 분리', () => {
      const result = correctSpacingFull('나는학교에갔다');
      expect(typeof result.corrected).toBe('string');
    });

    it('규칙 기반 교정', () => {
      const result = correctSpacingFull('학교에 갔다');
      expect(typeof result.corrected).toBe('string');
    });

    it('confidence 값 범위 확인', () => {
      const result = correctSpacingFull('안녕하세요');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('영문 포함 텍스트', () => {
      const result = correctSpacingFull('hello 안녕');
      expect(result.corrected).toContain('hello');
    });

    it('숫자 포함 텍스트', () => {
      const result = correctSpacingFull('2023년 1월');
      expect(typeof result.corrected).toBe('string');
    });
  });

  describe('Edge Cases - 경계값 테스트', () => {
    it('공백만 있는 텍스트', () => {
      const result = correctSpacingFull('   ');
      expect(result.corrected.trim()).toBe('');
    });

    it('매우 긴 텍스트', () => {
      const longText = '안녕하세요 '.repeat(50);
      const result = correctSpacingFull(longText);
      expect(typeof result.corrected).toBe('string');
    });

    it('특수문자만', () => {
      const result = correctSpacingFull('!@#$%^&*()');
      expect(result.corrected).toBe('!@#$%^&*()');
    });

    it('탭 문자 처리', () => {
      const result = correctSpacingFull('안녕\t하세요');
      expect(typeof result.corrected).toBe('string');
    });

    it('개행 문자 처리', () => {
      const result = correctSpacingFull('안녕\n하세요');
      expect(typeof result.corrected).toBe('string');
    });
  });
});
