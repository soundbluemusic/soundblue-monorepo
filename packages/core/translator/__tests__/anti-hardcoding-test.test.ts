/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           🚫 ANTI-HARDCODING ALGORITHM TEST - 안티하드코딩 테스트              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  🔬 목적: 하드코딩/암기로는 절대 통과 불가능한 테스트                           ║
 * ║  📊 22가지 핵심 알고리즘 규칙 - 무한 조합 가능                                 ║
 * ║  🎯 300,000,000,000+ 조합 → 순수 알고리즘만 통과 가능                         ║
 * ║                                                                              ║
 * ║  ⚠️  테스트 통과 조건:                                                        ║
 * ║  ┌──────────────────────────────────────────────────────────────────────┐   ║
 * ║  │  ✅ 22가지 규칙 모두 100% 정확                                        │   ║
 * ║  │  ✅ 무한 조합 처리 가능                                               │   ║
 * ║  │  ✅ 예외 처리 로직 포함                                               │   ║
 * ║  │  ✅ 문맥 기반 추론 가능                                               │   ║
 * ║  │  ✅ 일관성 유지                                                       │   ║
 * ║  └──────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                              ║
 * ║  🚫 절대 금지 사항:                                                          ║
 * ║  - 테스트 문장 하드코딩 금지                                                  ║
 * ║  - 사전에 테스트 문장 등록 금지                                               ║
 * ║  - 정규식 패턴 매칭 금지                                                     ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { describe, expect, test } from 'vitest';
import { antiHardcodingTests } from '../benchmark-data';
import { translate } from '../translator-service';

// 22개 레벨 모두 테스트
describe('Anti-Hardcoding Algorithm Test', () => {
  for (const level of antiHardcodingTests) {
    describe(level.nameKo, () => {
      for (const category of level.categories) {
        describe(category.nameKo, () => {
          for (const testCase of category.tests) {
            test(`${testCase.input}`, () => {
              const result = translate(testCase.input, testCase.direction);

              console.log('=== 테스트 ===');
              console.log('원문:', testCase.input);
              console.log('결과:', result);
              console.log('기대:', testCase.expected);
              console.log('---');

              expect(result).toBe(testCase.expected);
            });
          }
        });
      }
    });
  }
});

// 개별 레벨 테스트 (디버깅용)
describe('Level 1 - 숫자 + 복수형 규칙', () => {
  test('1개는 단수', () => {
    expect(translate('사과 1개', 'ko-en')).toBe('1 apple');
  });

  test('2개 이상은 복수', () => {
    expect(translate('사과 2개', 'ko-en')).toBe('2 apples');
  });

  test('0개도 복수', () => {
    expect(translate('사과 0개', 'ko-en')).toBe('0 apples');
  });
});

describe('Level 2 - 관사 a/an 발음 규칙', () => {
  test('모음 앞 an', () => {
    expect(translate('사과 하나', 'ko-en')).toBe('an apple');
  });

  test('자음 앞 a', () => {
    expect(translate('책 하나', 'ko-en')).toBe('a book');
  });

  test('u가 자음 발음이면 a', () => {
    expect(translate('대학교 하나', 'ko-en')).toBe('a university');
  });

  test('h 묵음이면 an', () => {
    expect(translate('한 시간', 'ko-en')).toBe('an hour');
  });
});

describe('Level 5 - 주어-동사 수 일치', () => {
  test('3인칭 단수 +s', () => {
    expect(translate('그는 달린다', 'ko-en')).toBe('He runs');
  });

  test('복수 주어는 원형', () => {
    expect(translate('그들은 달린다', 'ko-en')).toBe('They run');
  });

  test('y→ies 변환', () => {
    expect(translate('학생이 공부한다', 'ko-en')).toBe('The student studies');
  });

  test('o→oes 변환', () => {
    expect(translate('버스가 간다', 'ko-en')).toBe('The bus goes');
  });
});

describe('Level 20 - 중의적 표현 해소', () => {
  test('배 + 타다 = ship', () => {
    expect(translate('배를 타고', 'ko-en')).toBe('ride a ship');
  });

  test('배 + 고프다 = stomach', () => {
    expect(translate('배가 고파서', 'ko-en')).toBe('because I am hungry');
  });

  test('배 + 먹다 = pear', () => {
    expect(translate('배를 먹고', 'ko-en')).toBe('eat a pear');
  });

  test('눈 + 오다 = snow', () => {
    expect(translate('눈이 와서', 'ko-en')).toBe("because it's snowing");
  });

  test('눈 + 아프다 = eye', () => {
    expect(translate('눈이 아파서', 'ko-en')).toBe('because my eyes hurt');
  });
});

describe('Level 22 - 조합 폭발 처리', () => {
  test('복합 문장 1', () => {
    expect(translate('3개의 큰 빨간 사과를 어제 그가 샀다', 'ko-en')).toBe(
      'He bought 3 big red apples yesterday',
    );
  });

  test('복합 문장 2', () => {
    expect(translate('5마리의 작은 파란 새들이 내일 노래할 것이다', 'ko-en')).toBe(
      '5 small blue birds will sing tomorrow',
    );
  });

  test('복합 문장 3', () => {
    expect(translate('2마리의 귀여운 흰 고양이가 지금 자고 있다', 'ko-en')).toBe(
      '2 cute white cats are sleeping now',
    );
  });
});
