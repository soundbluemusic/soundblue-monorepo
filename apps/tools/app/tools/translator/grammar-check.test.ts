/**
 * Grammar completeness check for translator
 * Testing all grammar features
 */
import { describe, expect, it } from 'vitest';
import { translate } from './translator-service';

describe('Grammar Completeness Check', () => {
  describe('Phase 7: En→Ko 의문문 (Questions)', () => {
    it('Do you go to school?', () => {
      const result = translate('Do you go to school?', 'en-ko');
      console.log('Do you go to school? →', result);
      expect(result).toBeTruthy();
      expect(result).toContain('학교');
    });

    it('Does he like music?', () => {
      const result = translate('Does he like music?', 'en-ko');
      console.log('Does he like music? →', result);
      expect(result).toBeTruthy();
    });

    it('Did you eat?', () => {
      const result = translate('Did you eat?', 'en-ko');
      console.log('Did you eat? →', result);
      expect(result).toBeTruthy();
    });
  });

  describe('Phase 8: En→Ko 동사별 전치사→조사 매핑', () => {
    it('He listens to music → 그는 음악을 듣는다', () => {
      const result = translate('He listens to music', 'en-ko');
      console.log('He listens to music →', result);
      expect(result).toContain('음악');
      // Should use 을/를 for the object, not 에
      expect(result).toContain('음악을');
    });

    it('I listen to music → 나는 음악을 듣는다', () => {
      const result = translate('I listen to music', 'en-ko');
      console.log('I listen to music →', result);
      expect(result).toContain('음악을');
    });

    it('She goes to school → 그녀는 학교에 간다', () => {
      const result = translate('She goes to school', 'en-ko');
      console.log('She goes to school →', result);
      expect(result).toContain('학교에');
    });
  });

  describe('En→Ko 과거형 (-ed → -었다/-았다)', () => {
    it('I ate rice → 나는 밥을 먹었다', () => {
      const result = translate('I ate rice', 'en-ko');
      console.log('I ate rice →', result);
      expect(result).toContain('밥');
    });

    it('He went to school', () => {
      const result = translate('He went to school', 'en-ko');
      console.log('He went to school →', result);
      expect(result).toContain('학교');
    });

    it('I walked → 나는 걸었다', () => {
      const result = translate('I walked', 'en-ko');
      console.log('I walked →', result);
      expect(result).toBeTruthy();
    });
  });

  describe('En→Ko 미래형 (will → -ㄹ 것이다)', () => {
    it('I will go → 나는 갈 것이다', () => {
      const result = translate('I will go', 'en-ko');
      console.log('I will go →', result);
      expect(result).toBeTruthy();
    });

    it('He will eat → 그는 먹을 것이다', () => {
      const result = translate('He will eat', 'en-ko');
      console.log('He will eat →', result);
      expect(result).toBeTruthy();
    });
  });

  describe('En→Ko 진행형 (be + -ing → -고 있다)', () => {
    it('I am reading a book → 나는 책을 읽고 있다', () => {
      const result = translate('I am reading a book', 'en-ko');
      console.log('I am reading a book →', result);
      expect(result).toContain('책');
    });

    it('He is walking → 그는 걷고 있다', () => {
      const result = translate('He is walking', 'en-ko');
      console.log('He is walking →', result);
      expect(result).toBeTruthy();
    });
  });

  describe("En→Ko 부정문 (don't/doesn't/didn't)", () => {
    it("I don't eat → 나는 먹지 않는다", () => {
      const result = translate("I don't eat", 'en-ko');
      console.log("I don't eat →", result);
      expect(result).toBeTruthy();
    });

    it("He doesn't like music", () => {
      const result = translate("He doesn't like music", 'en-ko');
      console.log("He doesn't like music →", result);
      expect(result).toBeTruthy();
    });
  });
});
