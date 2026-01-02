import { describe, expect, it } from 'vitest';
import { translate } from './v2.1/index';

/**
 * Morphology 모듈 통합 검증 테스트
 *
 * 리팩토링 목표:
 * - contractedForms (korean-contracted.ts): 해, 가, 와 등 비격식 동사
 * - copulas (korean-copulas.ts): 야, 이야, 입니다 등 서술격 조사
 *
 * 핵심 변경:
 * - morphology 체크를 dictionary 체크보다 먼저 실행
 * - role='verb'로 정확히 인식하여 validator 롤백 방지
 */
describe('Morphology 통합 테스트 - 비격식 패턴', () => {
  describe('축약형 동사 (contractedForms)', () => {
    it('해 → do', () => {
      const result = translate('뭐 해?', 'ko-en');
      expect(result.toLowerCase()).toContain('do');
    });

    it('가 → go', () => {
      const result = translate('어디 가?', 'ko-en');
      expect(result.toLowerCase()).toContain('go');
    });

    it('와 → come', () => {
      const result = translate('빨리 와', 'ko-en');
      expect(result.toLowerCase()).toContain('come');
    });

    it('먹어 → eat', () => {
      const result = translate('밥 먹어', 'ko-en');
      expect(result.toLowerCase()).toContain('eat');
    });

    it('알아 → know', () => {
      const result = translate('알아?', 'ko-en');
      expect(result.toLowerCase()).toContain('know');
    });
  });

  describe('서술격 조사 (copulas)', () => {
    it('누구야 → who', () => {
      const result = translate('누구야?', 'ko-en');
      expect(result.toLowerCase()).toContain('who');
    });

    it('뭐야 → what', () => {
      const result = translate('이거 뭐야?', 'ko-en');
      expect(result.toLowerCase()).toContain('what');
    });
  });

  describe('복합 동사', () => {
    it('밥 먹었어? → Did you eat?', () => {
      const result = translate('밥 먹었어?', 'ko-en');
      expect(result.toLowerCase()).toContain('eat');
    });

    it('공부해 → study', () => {
      const result = translate('공부해', 'ko-en');
      expect(result.toLowerCase()).toContain('stud');
    });
  });
});
