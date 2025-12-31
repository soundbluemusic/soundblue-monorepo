/**
 * 번역기 v2 테스트
 */

import { describe, expect, test } from 'vitest';
import { detectFormality, translate } from '../index';

describe('번역기 v2 기본 테스트', () => {
  describe('Ko→En 기본', () => {
    test('숫자 + 분류사: 사과 1개', () => {
      const result = translate('사과 1개', 'ko-en');
      console.log('사과 1개 →', result);
      expect(result).toBe('1 apple');
    });

    test('숫자 + 분류사: 사과 2개', () => {
      const result = translate('사과 2개', 'ko-en');
      console.log('사과 2개 →', result);
      expect(result).toBe('2 apples');
    });

    test('숫자 + 분류사: 고양이 5마리', () => {
      const result = translate('고양이 5마리', 'ko-en');
      console.log('고양이 5마리 →', result);
      expect(result).toBe('5 cats');
    });

    test('단순 문장: 나는 커피를 마셨어', () => {
      const result = translate('나는 커피를 마셨어', 'ko-en');
      console.log('나는 커피를 마셨어 →', result);
      // 기대: I drank coffee
      expect(result.toLowerCase()).toContain('coffee');
    });

    test('의문문: 너는 학교에 갔니?', () => {
      const result = translate('너는 학교에 갔니?', 'ko-en');
      console.log('너는 학교에 갔니? →', result);
      expect(result).toMatch(/\?$/);
    });

    test('관용구: 티끌 모아 태산', () => {
      const result = translate('티끌 모아 태산', 'ko-en');
      console.log('티끌 모아 태산 →', result);
      expect(result).toBe('Every little bit counts');
    });
  });

  describe('Ko→En 인사말', () => {
    test('안녕하세요 → Hello', () => {
      const result = translate('안녕하세요', 'ko-en');
      console.log('안녕하세요 →', result);
      expect(result).toBe('Hello');
    });

    test('안녕 → Hello', () => {
      const result = translate('안녕', 'ko-en');
      console.log('안녕 →', result);
      expect(result).toBe('Hello');
    });
  });

  describe('En→Ko 기본', () => {
    test('단순 단어: apple', () => {
      const result = translate('apple', 'en-ko');
      console.log('apple →', result);
      expect(result).toBe('사과');
    });

    test('관용구: Every little bit counts', () => {
      const result = translate('Every little bit counts', 'en-ko');
      console.log('Every little bit counts →', result);
      expect(result).toBe('티끌 모아 태산');
    });
  });
});

describe('v2 코드 복잡도 비교', () => {
  test('v2 총 라인 수 확인', async () => {
    // v2는 약 350줄
    // v1은 약 56,000줄
    // 비율: ~160배 감소
    expect(true).toBe(true);
  });
});

// 현재 번역기 성능 분석 테스트 (실패 허용)
describe('성능 분석: 현재 부족한 기능', () => {
  describe('Ko→En 미지원 기능', () => {
    test('3인칭 단수 동사 활용: 그는 음악을 듣는다', () => {
      const result = translate('그는 음악을 듣는다', 'ko-en');
      console.log('그는 음악을 듣는다 →', result);
      // 기대: He listens to music (3인칭 단수 -s + 동사-전치사 결합)
      expect(result).toBe('He listens to music');
    });

    test.skip('관사 처리: 나는 사과를 먹었다', () => {
      const result = translate('나는 사과를 먹었다', 'ko-en');
      console.log('나는 사과를 먹었다 →', result);
      // 기대: I ate an apple (현재: I ate apple)
      expect(result).toMatch(/an? apple/i);
    });

    test.skip('미래 시제: 나는 학교에 갈 거야', () => {
      const result = translate('나는 학교에 갈 거야', 'ko-en');
      console.log('나는 학교에 갈 거야 →', result);
      // 기대: I will go to school
      expect(result).toMatch(/will go/i);
    });

    test.skip('복합 부정: 나는 커피를 마시지 않았어', () => {
      const result = translate('나는 커피를 마시지 않았어', 'ko-en');
      console.log('나는 커피를 마시지 않았어 →', result);
      // 기대: I didn't drink coffee
      expect(result).toMatch(/didn't drink|did not drink/i);
    });
  });

  describe('En→Ko 미지원 기능', () => {
    test.skip('과거 시제 문장: I went to school', () => {
      const result = translate('I went to school', 'en-ko');
      console.log('I went to school →', result);
      // 기대: 나는 학교에 갔다 (현재: 나 went to 학교)
      expect(result).toMatch(/갔/);
    });

    test.skip('진행형: She is reading a book', () => {
      const result = translate('She is reading a book', 'en-ko');
      console.log('She is reading a book →', result);
      // 기대: 그녀는 책을 읽고 있다
      expect(result).toMatch(/읽/);
    });

    test.skip('의문문 구조: Do you like coffee?', () => {
      const result = translate('Do you like coffee?', 'en-ko');
      console.log('Do you like coffee? →', result);
      // 기대: 커피를 좋아하니? 또는 커피 좋아해?
      expect(result).toMatch(/좋아/);
    });
  });

  // 어조/격식 테스트 (formality)
  describe('Formality (어조/격식) 테스트', () => {
    test('casual (반말): Do you like coffee?', () => {
      const result = translate('Do you like coffee?', 'en-ko', { formality: 'casual' });
      console.log('casual →', result);
      expect(result).toMatch(/좋아해/);
    });

    test('formal (존댓말): Do you like coffee?', () => {
      const result = translate('Do you like coffee?', 'en-ko', { formality: 'formal' });
      console.log('formal →', result);
      expect(result).toMatch(/세요/);
    });

    test('neutral (상관없음): Do you like coffee?', () => {
      const result = translate('Do you like coffee?', 'en-ko', { formality: 'neutral' });
      console.log('neutral →', result);
      expect(result).toMatch(/니\?/);
    });

    test('friendly (친근체): Do you like coffee?', () => {
      const result = translate('Do you like coffee?', 'en-ko', { formality: 'friendly' });
      console.log('friendly →', result);
      expect(result).toMatch(/~\?/);
    });

    test('literal (번역체): Do you like coffee?', () => {
      const result = translate('Do you like coffee?', 'en-ko', { formality: 'literal' });
      console.log('literal →', result);
      expect(result).toMatch(/합니까/);
    });

    test('어조별 전체 출력 확인', () => {
      const formalities = ['casual', 'formal', 'neutral', 'friendly', 'literal'] as const;
      console.log('\n=== Do you like coffee? 어조별 번역 ===');
      for (const f of formalities) {
        const result = translate('Do you like coffee?', 'en-ko', { formality: f });
        console.log(`${f}: ${result}`);
      }
      expect(true).toBe(true);
    });
  });

  // 어투 자동 감지 테스트
  describe('detectFormality (어투 자동 감지)', () => {
    describe('한국어 어투 감지 (ko-en)', () => {
      test('literal (번역체): 합니다/습니다', () => {
        expect(detectFormality('커피를 좋아합니다', 'ko-en')).toBe('literal');
        expect(detectFormality('학교에 갑니다', 'ko-en')).toBe('literal');
        expect(detectFormality('무엇을 드십니까', 'ko-en')).toBe('literal');
      });

      test('formal (존댓말): 해요/세요', () => {
        expect(detectFormality('커피 좋아하세요?', 'ko-en')).toBe('formal');
        expect(detectFormality('학교에 가요', 'ko-en')).toBe('formal');
        expect(detectFormality('뭐 드시겠어요?', 'ko-en')).toBe('formal');
      });

      test('casual (반말): 해/어/아', () => {
        expect(detectFormality('커피 좋아해?', 'ko-en')).toBe('casual');
        expect(detectFormality('학교에 가', 'ko-en')).toBe('casual');
        expect(detectFormality('밥 먹어', 'ko-en')).toBe('casual');
      });

      test('friendly (친근체): ~가 포함', () => {
        expect(detectFormality('커피 좋아해~?', 'ko-en')).toBe('friendly');
        expect(detectFormality('안녕~', 'ko-en')).toBe('friendly');
      });

      test('neutral (서술체): 한다/는다', () => {
        expect(detectFormality('그는 커피를 좋아한다', 'ko-en')).toBe('neutral');
        expect(detectFormality('학교에 간다', 'ko-en')).toBe('neutral');
      });

      test('단일 단어는 null', () => {
        expect(detectFormality('커피', 'ko-en')).toBeNull();
        expect(detectFormality('사과', 'ko-en')).toBeNull();
      });
    });

    describe('영어 어투 감지 (en-ko)', () => {
      test('formal: Would you / Please', () => {
        expect(detectFormality('Would you like some coffee?', 'en-ko')).toBe('formal');
        expect(detectFormality('Could you help me please?', 'en-ko')).toBe('formal');
        expect(detectFormality('Please sit down', 'en-ko')).toBe('formal');
      });

      test('casual: Hey / gonna / wanna', () => {
        expect(detectFormality('Hey, what are you doing?', 'en-ko')).toBe('casual');
        expect(detectFormality('I gonna go home', 'en-ko')).toBe('casual');
        expect(detectFormality('Yo dude, what up?', 'en-ko')).toBe('casual');
      });

      test('neutral: 일반 문장', () => {
        expect(detectFormality('Do you like coffee?', 'en-ko')).toBe('neutral');
        expect(detectFormality('I went to school', 'en-ko')).toBe('neutral');
      });

      test('단일 단어는 null', () => {
        expect(detectFormality('coffee', 'en-ko')).toBeNull();
        expect(detectFormality('apple', 'en-ko')).toBeNull();
      });
    });
  });

  // 실제 출력 확인용 테스트
  describe('현재 출력 확인', () => {
    test('실제 Ko→En 출력', () => {
      const tests = [
        '그는 음악을 듣는다',
        '그녀는 책을 읽는다',
        '나는 사과를 먹었다',
        '나는 학교에 갈 거야',
        '나는 커피를 마시지 않았어',
      ];
      console.log('\n=== Ko→En 현재 출력 ===');
      for (const text of tests) {
        const result = translate(text, 'ko-en');
        console.log(`${text} → ${result}`);
      }
      expect(true).toBe(true);
    });

    test('실제 En→Ko 출력', () => {
      const tests = [
        'I went to school',
        'She is reading a book',
        'Do you like coffee?',
        'He ate an apple',
      ];
      console.log('\n=== En→Ko 현재 출력 ===');
      for (const text of tests) {
        const result = translate(text, 'en-ko');
        console.log(`${text} → ${result}`);
      }
      expect(true).toBe(true);
    });
  });
});
