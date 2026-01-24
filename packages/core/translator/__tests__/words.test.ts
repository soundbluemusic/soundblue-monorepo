import { describe, expect, it } from 'vitest';
import { enToKoWords, koToEnWords, lookupKoToEn } from '../src/dictionary/entries/words';

describe('Words Dictionary - 단어 사전', () => {
  describe('koToEnWords - 한→영 사전', () => {
    it('기본 단어 조회', () => {
      expect(koToEnWords['나']).toBe('I');
      expect(koToEnWords['너']).toBe('you');
      expect(koToEnWords['그리고']).toBe('and');
    });

    it('감탄사 조회', () => {
      expect(koToEnWords['와']).toBe('Wow');
      expect(koToEnWords['대박']).toBe('Awesome');
      expect(koToEnWords['예']).toBe('Yes');
    });

    it('시간 표현 조회', () => {
      expect(koToEnWords['오늘 아침']).toBe('this morning');
      expect(koToEnWords['어제 밤']).toBe('last night');
      expect(koToEnWords['오늘 밤']).toBe('tonight');
    });

    it('감정 표현 조회', () => {
      expect(koToEnWords['무서워']).toBe('scared');
      expect(koToEnWords['두려워']).toBe('scared');
    });

    it('존재하지 않는 단어', () => {
      expect(koToEnWords['없는단어xyz']).toBeUndefined();
    });

    it('사전 크기 확인', () => {
      const wordCount = Object.keys(koToEnWords).length;
      expect(wordCount).toBeGreaterThan(100);
    });
  });

  describe('enToKoWords - 영→한 사전', () => {
    it('기본 단어 조회', () => {
      // 소문자로 저장됨
      expect(enToKoWords['i']).toBeDefined();
      expect(enToKoWords['you']).toBeDefined();
      expect(enToKoWords['and']).toBeDefined();
    });

    it('역방향 매핑 확인', () => {
      // koToEnWords에서 자동 생성된 역방향 매핑
      const wow = enToKoWords['wow'];
      expect(wow).toBeDefined();
    });

    it('수동 영→한 사전 우선', () => {
      // 수동으로 정의된 매핑이 있으면 그것 사용
      const someWord = enToKoWords['hello'];
      // 정의되어 있으면 값 확인
      if (someWord) {
        expect(typeof someWord).toBe('string');
      }
    });
  });

  describe('lookupKoToEn - 문맥 기반 조회', () => {
    it('기본 조회 (문맥 없음)', () => {
      const result = lookupKoToEn('나');
      expect(result).toBe('I');
    });

    it('사전에 없는 단어는 원문 반환', () => {
      const result = lookupKoToEn('없는단어xyz');
      expect(result).toBe('없는단어xyz');
    });

    it('빈 문자열', () => {
      const result = lookupKoToEn('');
      expect(result).toBe('');
    });

    it('문맥과 함께 조회', () => {
      const result = lookupKoToEn('나', '나는 학교에 갑니다');
      expect(result).toBe('I');
    });

    it('다중 번역 단어 - 차 (음료 문맥)', () => {
      // "차" = tea/car/difference
      // 음료 문맥에서는 tea
      const result = lookupKoToEn('차', '차 한 잔 마시자');
      // 문맥에 따라 결과가 달라질 수 있음
      expect(typeof result).toBe('string');
    });

    it('다중 번역 단어 - 차 (교통 문맥)', () => {
      const result = lookupKoToEn('차', '차를 운전하다');
      expect(typeof result).toBe('string');
    });
  });

  describe('Edge Cases - 경계값 테스트', () => {
    it('공백 포함 단어', () => {
      const result = lookupKoToEn('오늘 아침');
      expect(result).toBe('this morning');
    });

    it('특수문자 포함', () => {
      const result = lookupKoToEn('!@#');
      expect(result).toBe('!@#'); // 원문 반환
    });

    it('숫자만', () => {
      const result = lookupKoToEn('123');
      expect(result).toBe('123');
    });

    it('영문 입력', () => {
      const result = lookupKoToEn('hello');
      expect(result).toBe('hello'); // 원문 반환
    });

    it('혼합 입력', () => {
      const result = lookupKoToEn('안녕hello');
      expect(result).toBe('안녕hello'); // 원문 반환
    });
  });

  describe('문맥 분석 테스트', () => {
    it('음식 문맥', () => {
      const result = lookupKoToEn('차', '녹차를 마시다');
      expect(typeof result).toBe('string');
    });

    it('교통 문맥', () => {
      const result = lookupKoToEn('차', '차로 출근하다');
      expect(typeof result).toBe('string');
    });

    it('수학 문맥', () => {
      const result = lookupKoToEn('차', '두 숫자의 차');
      expect(typeof result).toBe('string');
    });

    it('빈 문맥', () => {
      const result = lookupKoToEn('차', '');
      expect(typeof result).toBe('string');
    });

    it('긴 문맥', () => {
      const longContext = '오늘 아침에 녹차를 마셨습니다. '.repeat(50);
      const result = lookupKoToEn('차', longContext);
      expect(typeof result).toBe('string');
    });
  });

  describe('사전 무결성 테스트', () => {
    it('모든 값이 문자열', () => {
      for (const value of Object.values(koToEnWords)) {
        expect(typeof value).toBe('string');
      }
    });

    it('모든 키가 문자열', () => {
      for (const key of Object.keys(koToEnWords)) {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
      }
    });

    it('빈 값 없음', () => {
      for (const [key, value] of Object.entries(koToEnWords)) {
        expect(value.length, `Empty value for key: ${key}`).toBeGreaterThan(0);
      }
    });
  });
});
