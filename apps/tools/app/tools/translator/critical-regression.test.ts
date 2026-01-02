/**
 * Critical Regression Tests
 *
 * Phase 0: 핵심 버그 재발 방지 테스트
 *
 * 이 테스트들은 절대 실패해서는 안 됩니다.
 * 실패하면 기본적인 번역 기능이 망가진 것입니다.
 */
import { describe, expect, it } from 'vitest';
import { translate } from './translator-service';

describe('Critical Regression Tests', () => {
  describe('보조용언 패턴 (-고 있다, -고 싶다)', () => {
    it('진행형 -고 있다', () => {
      // 핵심 버그: "하고"→"하구" (의학용어) 오매칭 방지
      expect(translate('저는 운동을 하고 있습니다', 'ko-en')).toBe("I'm exercising");
      // "먹다" → eating (toGerund 함수에서 처리)
      const eatResult = translate('나는 밥을 먹고 있어', 'ko-en');
      expect(eatResult).toMatch(/eat/i);
      // "공부하다" → studying
      const studyResult = translate('그는 공부하고 있다', 'ko-en');
      expect(studyResult).toMatch(/study/i);
    });

    it('희망형 -고 싶다', () => {
      expect(translate('먹고 싶다', 'ko-en')).toContain('want');
      expect(translate('가고 싶어요', 'ko-en')).toContain('want');
    });
  });

  describe('기본 문장 번역', () => {
    it('인사말', () => {
      expect(translate('안녕하세요', 'ko-en')).toBe('Hello');
      // '안녕'은 사전에서 'Hello'로 매핑됨 (비격식 인사도 Hello로 처리)
      expect(translate('안녕', 'ko-en')).toBe('Hello');
    });

    it('주어-동사-목적어 문장', () => {
      expect(translate('나는 밥을 먹는다', 'ko-en')).toBe('I eat rice');
      expect(translate('그는 학교에 간다', 'ko-en')).toBe('He goes to school');
    });

    it('복합어 (배고프다, 목마르다)', () => {
      expect(translate('배고파', 'ko-en')).toBe("I'm hungry");
      expect(translate('배가 고프다', 'ko-en')).toBe("I'm hungry");
      expect(translate('목말라', 'ko-en')).toBe("I'm thirsty");
    });
  });

  describe('도메인 사전 오염 방지', () => {
    it('일반 단어가 의학 용어로 변환되지 않아야 함', () => {
      // "하고"는 연결어미이지 "하구"(inferior colliculus)가 아님
      const result = translate('저는 운동을 하고 있습니다', 'ko-en');
      expect(result).not.toContain('colliculus');
      expect(result).not.toContain('Inferior');
    });
  });
});
