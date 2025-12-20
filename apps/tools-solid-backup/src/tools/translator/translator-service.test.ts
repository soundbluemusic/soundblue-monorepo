import { describe, expect, it } from 'vitest';
import { attachParticle, conjugate, selectParticle, translate } from './translator-service';

describe('translator-service', () => {
  describe('기본 문장 번역 테스트', () => {
    it('나는 한국사람 입니다', () => {
      const result = translate('나는 한국사람 입니다', 'ko-en');
      console.log('[KO] 나는 한국사람 입니다');
      console.log('[EN]', result);
    });

    it('나는 학생입니다', () => {
      const result = translate('나는 학생입니다', 'ko-en');
      console.log('[KO] 나는 학생입니다');
      console.log('[EN]', result);
    });

    it('오늘 날씨가 좋아요', () => {
      const result = translate('오늘 날씨가 좋아요', 'ko-en');
      console.log('[KO] 오늘 날씨가 좋아요');
      console.log('[EN]', result);
    });

    it('학교에 가요', () => {
      const result = translate('학교에 가요', 'ko-en');
      console.log('[KO] 학교에 가요');
      console.log('[EN]', result);
    });

    it('밥을 먹었어요', () => {
      const result = translate('밥을 먹었어요', 'ko-en');
      console.log('[KO] 밥을 먹었어요');
      console.log('[EN]', result);
    });

    it('친구를 만났어요', () => {
      const result = translate('친구를 만났어요', 'ko-en');
      console.log('[KO] 친구를 만났어요');
      console.log('[EN]', result);
    });

    it('안녕하세요 저는 사운드블루 입니다 → Hello. I am SoundBlue', () => {
      const result = translate('안녕하세요 저는 사운드블루 입니다', 'ko-en');
      console.log('[KO] 안녕하세요 저는 사운드블루 입니다');
      console.log('[EN]', result);
      expect(result.toLowerCase()).toContain('hello');
      expect(result.toLowerCase()).toContain('i am');
      expect(result.toLowerCase()).toContain('soundblue');
    });
  });

  describe('조사 자동 선택', () => {
    it('받침 있는 단어 + 이/가', () => {
      expect(selectParticle('사람', 'subject')).toBe('이');
      expect(selectParticle('학생', 'subject')).toBe('이');
    });

    it('받침 없는 단어 + 이/가', () => {
      expect(selectParticle('나', 'subject')).toBe('가');
      expect(selectParticle('너', 'subject')).toBe('가');
    });

    it('attachParticle', () => {
      expect(attachParticle('사람', 'subject')).toBe('사람이');
      expect(attachParticle('나', 'topic')).toBe('나는');
    });
  });

  describe('동사 활용', () => {
    it('정규 활용', () => {
      expect(conjugate('먹', '어요')).toBe('먹어요');
    });

    it('ㄷ불규칙', () => {
      const result = conjugate('듣', '어요');
      console.log('듣 + 어요 =', result);
    });

    it('ㅂ불규칙', () => {
      const result = conjugate('돕', '아요');
      console.log('돕 + 아요 =', result);
    });
  });

  describe('관용어/숙어 번역', () => {
    // 신체 관용어
    it('식은 죽 먹기 → a piece of cake', () => {
      const result = translate('식은 죽 먹기', 'ko-en');
      expect(result).toBe('a piece of cake');
    });

    it('눈이 높다 → have high standards', () => {
      const result = translate('눈이 높다', 'ko-en');
      expect(result).toBe('have high standards');
    });

    it('손이 크다 → be generous', () => {
      const result = translate('손이 크다', 'ko-en');
      expect(result).toBe('be generous');
    });

    it('발이 넓다 → know many people', () => {
      const result = translate('발이 넓다', 'ko-en');
      expect(result).toBe('know many people');
    });

    // 속담
    it('일석이조 → kill two birds with one stone', () => {
      const result = translate('일석이조', 'ko-en');
      expect(result).toBe('kill two birds with one stone');
    });

    it('급할수록 돌아가라 → haste makes waste', () => {
      const result = translate('급할수록 돌아가라', 'ko-en');
      expect(result).toBe('haste makes waste');
    });

    // 영→한 관용어
    it('a piece of cake → 식은 죽 먹기', () => {
      const result = translate('a piece of cake', 'en-ko');
      expect(result).toBe('식은 죽 먹기');
    });

    it('kill two birds with one stone → 일석이조', () => {
      const result = translate('kill two birds with one stone', 'en-ko');
      expect(result).toBe('일석이조');
    });

    it('speak of the devil → 호랑이도 제 말 하면 온다', () => {
      const result = translate('speak of the devil', 'en-ko');
      expect(result).toBe('호랑이도 제 말 하면 온다');
    });

    // 사자성어
    it('설상가상 → to make matters worse', () => {
      const result = translate('설상가상', 'ko-en');
      expect(result).toBe('to make matters worse');
    });

    it('금상첨화 → icing on the cake', () => {
      const result = translate('금상첨화', 'ko-en');
      expect(result).toBe('icing on the cake');
    });

    // 신조어
    it('멘붕 → mental breakdown', () => {
      const result = translate('멘붕', 'ko-en');
      expect(result).toBe('mental breakdown');
    });
  });
});
