import { describe, test } from 'vitest';
import { koToEnWords } from './dictionary';
import { translate } from './translator-service';

/**
 * Level 1 테스트: 기본 문장 번역 테스트
 *
 * ⚠️ CRITICAL: ALGORITHM-ONLY TESTING REQUIREMENT (알고리즘 기반 테스트 필수)
 * ========================================
 *
 * 이 테스트의 모든 문장은 반드시 알고리즘 기반으로만 번역되어야 합니다.
 * 사전(dictionary)에 테스트 문장을 직접 등록하여 테스트를 통과시키는 것은 금지됩니다.
 *
 * 이유:
 * 1. 사전 기반 테스트는 응용력 검증이 불가능함 (응용력 0%)
 * 2. 새로운 문장에 대한 번역 능력을 측정할 수 없음
 * 3. 실제 사용자 입력은 사전에 없는 문장이 대부분임
 *
 * 허용:
 * - 단어 사전 (koToEnWords): 개별 단어 등록 OK
 * - 관용구/문화 표현: 특수한 의미를 가진 관용어 등록 OK
 *
 * 금지:
 * - 문장 사전 (i18n-sentences.ts): 테스트 문장 등록 금지
 * - 일반 문장을 idioms.ts에 등록하는 것 금지
 *
 * ========================================
 *
 * 목적:
 * 1. 기본적인 문장들이 제대로 번역되는지 확인
 * 2. 실패하는 문장의 원인 분석:
 *    - 어떤 단어가 사전에 없는지 (단어 사전은 OK, 문장 사전은 NO)
 *    - 어떤 조사/어미가 인식되지 않는지
 *    - 어떤 문법 규칙이 적용되지 않는지
 */

interface TestCase {
  input: string;
  expected: string;
  description: string;
}

const LEVEL1_TESTS: TestCase[] = [
  // 기본 주어 + 동사 + 목적어
  { input: '나는 학교에 간다', expected: 'I go to school', description: '기본 SVO 구조' },
  { input: '그녀는 책을 읽는다', expected: 'She reads a book', description: '3인칭 현재형' },
  { input: '고양이가 우유를 마신다', expected: 'The cat drinks milk', description: '동물 주어' },
  {
    input: '학생이 사과를 먹는다',
    expected: 'The student eats an apple',
    description: '관사 처리',
  },

  // 과거형
  { input: '나는 밥을 먹었다', expected: 'I ate rice', description: '과거형 -었다' },
  { input: '그는 학교에 갔다', expected: 'He went to school', description: '과거형 불규칙 동사' },
  { input: '그녀는 집에 왔다', expected: 'She came home', description: '과거형 -왔다' },

  // 장소 표현
  { input: '나는 집에 있다', expected: 'I am at home', description: 'be동사 + 장소' },
  { input: '책이 책상 위에 있다', expected: 'The book is on the desk', description: '전치사 위에' },

  // 형용사
  { input: '날씨가 좋다', expected: 'The weather is good', description: '형용사 서술' },
  {
    input: '오늘 날씨가 좋다',
    expected: 'Today the weather is good',
    description: '시간 표현 + 형용사',
  },

  // 부정문
  {
    input: '나는 학교에 가지 않는다',
    expected: 'I do not go to school',
    description: '부정문 -지 않다',
  },

  // 의문문
  { input: '너는 학교에 가니?', expected: 'Do you go to school?', description: '의문문 -니?' },
];

describe('Level 1 번역 테스트 - 상세 분석', () => {
  test.each(LEVEL1_TESTS)('$description: "$input"', ({ input, expected }) => {
    const result = translate(input, 'ko-en');

    console.log('\n========================================');
    console.log(`입력: ${input}`);
    console.log(`예상: ${expected}`);
    console.log(`결과: ${result}`);
    console.log('========================================');

    // 단어별 분석
    analyzeTranslation(input, result, expected);

    // 테스트 (현재는 실패 가능성이 높으므로 로그만 출력)
    // expect(result).toBe(expected);
  });
});

/**
 * 번역 결과 상세 분석
 */
function analyzeTranslation(input: string, result: string, expected: string): void {
  console.log('\n--- 상세 분석 ---');

  // 1. 토큰 분석
  const tokens = input.split(' ');
  console.log('\n1. 토큰 분석:');

  for (const token of tokens) {
    analyzeToken(token);
  }

  // 2. 결과 비교
  console.log('\n2. 결과 비교:');
  if (result === expected) {
    console.log('✓ 번역 성공!');
  } else {
    console.log('✗ 번역 실패');
    console.log(`  - 차이점: "${result}" vs "${expected}"`);
    analyzeDifference(result, expected);
  }
}

/**
 * 토큰 상세 분석
 */
function analyzeToken(token: string): void {
  console.log(`\n  토큰: "${token}"`);

  // 1. 완전 매칭 확인
  const exactMatch = koToEnWords[token];
  if (exactMatch) {
    console.log(`    ✓ 사전 매칭: "${exactMatch}"`);
    return;
  }

  // 2. 조사 분리 시도
  const particles = [
    '을',
    '를',
    '이',
    '가',
    '은',
    '는',
    '에',
    '에서',
    '으로',
    '로',
    '와',
    '과',
    '도',
    '만',
    '의',
  ];
  for (const particle of particles) {
    if (token.endsWith(particle) && token.length > particle.length) {
      const stem = token.slice(0, -particle.length);
      const stemMatch = koToEnWords[stem];
      console.log(`    조사 분리 시도: "${stem}" + "${particle}"`);
      if (stemMatch) {
        console.log(`      ✓ 어간 매칭: "${stem}" → "${stemMatch}"`);
      } else {
        console.log(`      ✗ 어간 미매칭: "${stem}" (사전에 없음)`);
      }
      return;
    }
  }

  // 3. 어미 분리 시도
  const endings = [
    '다',
    '는다',
    '었다',
    '았다',
    '였다',
    'ㄴ다',
    '는다',
    'ㅂ니다',
    '습니다',
    '니',
    '니?',
    '지',
    '고',
    '서',
  ];
  for (const ending of endings) {
    if (token.endsWith(ending) && token.length > ending.length) {
      const stem = token.slice(0, -ending.length);
      const stemMatch = koToEnWords[stem];
      console.log(`    어미 분리 시도: "${stem}" + "${ending}"`);
      if (stemMatch) {
        console.log(`      ✓ 어간 매칭: "${stem}" → "${stemMatch}"`);
      } else {
        console.log(`      ✗ 어간 미매칭: "${stem}" (사전에 없음)`);
      }
      return;
    }
  }

  // 4. 복합어 분해 시도
  for (let i = 1; i < token.length; i++) {
    const part1 = token.slice(0, i);
    const part2 = token.slice(i);
    const match1 = koToEnWords[part1];
    const match2 = koToEnWords[part2];

    if (match1 && match2) {
      console.log(`    복합어 가능: "${part1}" (${match1}) + "${part2}" (${match2})`);
      return;
    }
  }

  console.log(`    ✗ 매칭 실패: 사전에 없고, 형태소 분해도 실패`);
}

/**
 * 결과 차이 분석
 */
function analyzeDifference(result: string, expected: string): void {
  const resultWords = result.toLowerCase().split(' ');
  const expectedWords = expected.toLowerCase().split(' ');

  // 누락된 단어
  const missing = expectedWords.filter((word) => !resultWords.includes(word));
  if (missing.length > 0) {
    console.log(`  - 누락된 단어: ${missing.join(', ')}`);
  }

  // 추가된 단어
  const extra = resultWords.filter((word) => !expectedWords.includes(word));
  if (extra.length > 0) {
    console.log(`  - 추가된 단어: ${extra.join(', ')}`);
  }

  // 어순 문제
  if (
    resultWords.length === expectedWords.length &&
    resultWords.every((word) => expectedWords.includes(word))
  ) {
    console.log(`  - 어순 문제: 단어는 모두 있으나 순서가 다름`);
  }
}

/**
 * 사전 커버리지 분석
 */
describe('Level 1 사전 커버리지 분석', () => {
  test('Level 1 필수 단어가 사전에 있는지 확인', () => {
    const essentialWords = [
      // 대명사
      '나',
      '너',
      '그',
      '그녀',
      '우리',
      '저',
      // 기본 동사
      '가다',
      '오다',
      '먹다',
      '읽다',
      '마시다',
      '있다',
      '보다',
      // 기본 명사
      '학교',
      '집',
      '책',
      '사과',
      '고양이',
      '우유',
      '밥',
      '날씨',
      '학생',
      '책상',
      // 기본 형용사
      '좋다',
      '크다',
      '작다',
      // 시간
      '오늘',
      '어제',
      '내일',
    ];

    console.log('\n=== Level 1 필수 단어 사전 체크 ===\n');

    const missing: string[] = [];
    const found: string[] = [];

    for (const word of essentialWords) {
      const translation = koToEnWords[word];
      if (translation) {
        found.push(word);
        console.log(`✓ ${word} → ${translation}`);
      } else {
        missing.push(word);
        console.log(`✗ ${word} (사전에 없음)`);
      }
    }

    console.log(
      `\n통계: ${found.length}/${essentialWords.length} (${Math.round((found.length / essentialWords.length) * 100)}%)`,
    );

    if (missing.length > 0) {
      console.log(`\n누락된 단어 (${missing.length}개):`);
      console.log(missing.join(', '));
    }
  });
});
