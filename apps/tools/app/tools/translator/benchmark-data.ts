/**
 * 번역기 벤치마크 데이터 (v2)
 */

export interface TestCase {
  id: string;
  input: string;
  expected: string;
  direction: 'ko-en' | 'en-ko';
}

export interface TestLevel {
  id: string;
  name: string;
  description: string;
  categories: TestCategory[];
}

export interface TestCategory {
  id: string;
  name: string;
  tests: TestCase[];
}

// 기본 단어 테스트
export const levelTests: TestLevel[] = [
  {
    id: 'level1',
    name: '기본 단어',
    description: '단일 단어 번역',
    categories: [
      {
        id: 'words',
        name: '기본 단어',
        tests: [
          { id: 'w1', input: '사과', expected: 'apple', direction: 'ko-en' },
          { id: 'w2', input: '고양이', expected: 'cat', direction: 'ko-en' },
          { id: 'w3', input: 'apple', expected: '사과', direction: 'en-ko' },
        ],
      },
    ],
  },
];

// 숫자+분류사 테스트
export const countTests: TestLevel[] = [
  {
    id: 'count',
    name: '숫자+분류사',
    description: '숫자와 분류사 조합',
    categories: [
      {
        id: 'counters',
        name: '분류사',
        tests: [
          { id: 'c1', input: '사과 1개', expected: '1 apple', direction: 'ko-en' },
          { id: 'c2', input: '사과 2개', expected: '2 apples', direction: 'ko-en' },
          { id: 'c3', input: '고양이 5마리', expected: '5 cats', direction: 'ko-en' },
        ],
      },
    ],
  },
];

// 관용구 테스트
export const categoryTests: TestLevel[] = [
  {
    id: 'idioms',
    name: '관용구',
    description: '관용구 번역',
    categories: [
      {
        id: 'idioms',
        name: '관용구',
        tests: [
          {
            id: 'i1',
            input: '티끌 모아 태산',
            expected: 'Every little bit counts',
            direction: 'ko-en',
          },
        ],
      },
    ],
  },
];

// Empty test arrays for compatibility
export const contextTests: TestLevel[] = [];
export const typoTests: TestLevel[] = [];
export const polysemyTests: TestLevel[] = [];
export const localizationTests: TestLevel[] = [];
export const spacingErrorTests: TestLevel[] = [];
export const wordOrderTests: TestLevel[] = [];
export const antiHardcodingTests: TestLevel[] = [];
export const uniqueTests: TestLevel[] = [];
export const professionalTranslatorTests: TestLevel[] = [];
export const finalTests: TestLevel[] = [];
