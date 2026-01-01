/**
 * 문법 완성도 테스트 - 현재 지원/미지원 기능 확인
 */
import { describe, expect, it } from 'vitest';
import { translate } from './translator-service';

describe('문법 완성도 테스트', () => {
  describe('✅ 지원되는 문법', () => {
    it('현재 시제', () => {
      expect(translate('I go to school', 'en-ko')).toContain('간다');
      expect(translate('나는 학교에 간다', 'ko-en')).toContain('go');
    });

    it('과거 시제', () => {
      expect(translate('I ate rice', 'en-ko')).toContain('먹었다');
      expect(translate('나는 밥을 먹었다', 'ko-en')).toContain('ate');
    });

    it('미래 시제 (En→Ko)', () => {
      const result = translate('I will go', 'en-ko');
      console.log('I will go →', result);
      expect(result).toContain('갈 것이다');
    });

    it('진행형 (En→Ko)', () => {
      const result = translate('I am reading a book', 'en-ko');
      console.log('I am reading a book →', result);
      expect(result).toContain('읽고 있다');
    });

    it('부정문', () => {
      expect(translate("I don't eat", 'en-ko')).toContain('먹지 않');
      expect(translate('나는 먹지 않는다', 'ko-en')).toBeTruthy();
    });

    it('의문문 (En→Ko)', () => {
      const result = translate('Do you go to school?', 'en-ko');
      console.log('Do you go to school? →', result);
      expect(result).toContain('가니');
    });

    it('계사 (be동사/이다)', () => {
      expect(translate('I am a student', 'en-ko')).toContain('학생');
      expect(translate('나는 학생이다', 'ko-en')).toContain('student');
    });
  });

  describe('⚠️ 제한적 지원 (테스트로 확인)', () => {
    it('현재완료 (have + pp)', () => {
      const result = translate('I have eaten', 'en-ko');
      console.log('I have eaten →', result);
      // 현재완료가 제대로 처리되는지 확인
    });

    it('과거완료 (had + pp)', () => {
      const result = translate('I had eaten', 'en-ko');
      console.log('I had eaten →', result);
    });

    it('수동태', () => {
      const result = translate('The book was read', 'en-ko');
      console.log('The book was read →', result);
    });

    it('과거진행형', () => {
      const result = translate('I was reading', 'en-ko');
      console.log('I was reading →', result);
    });

    it('Ko→En 미래형', () => {
      const result = translate('나는 갈 것이다', 'ko-en');
      console.log('나는 갈 것이다 →', result);
    });

    it('Ko→En 진행형', () => {
      const result = translate('나는 읽고 있다', 'ko-en');
      console.log('나는 읽고 있다 →', result);
    });

    it('Ko→En 의문문', () => {
      const result = translate('너는 가니?', 'ko-en');
      console.log('너는 가니? →', result);
    });

    it('조건문 (if)', () => {
      const result = translate('If I go', 'en-ko');
      console.log('If I go →', result);
    });

    it('가정법 (would)', () => {
      const result = translate('I would go', 'en-ko');
      console.log('I would go →', result);
    });

    it('비교급', () => {
      const result = translate('He is taller', 'en-ko');
      console.log('He is taller →', result);
    });

    it('복문 (that절)', () => {
      const result = translate('I think that he goes', 'en-ko');
      console.log('I think that he goes →', result);
    });

    it('관계대명사', () => {
      const result = translate('The man who runs', 'en-ko');
      console.log('The man who runs →', result);
    });
  });
});
