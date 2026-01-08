/**
 * 안티하드코딩 테스트 데이터 (Anti-Hardcoding Tests)
 * 22개 레벨 알고리즘 테스트 - 하드코딩 방지
 */

import type { TestLevel } from '../types';

export const antiHardcodingTests: TestLevel[] = [
  {
    id: 'anti-level-1',
    name: 'Level 1: Number + Plural Rules (숫자+복수형)',
    nameKo: 'Level 1: 숫자 + 복수형 규칙',
    categories: [
      {
        id: 'anti-l1-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l1-1',
            input: '사과 1개',
            expected: '1 apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-2',
            input: '사과 2개',
            expected: '2 apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-3',
            input: '사과 0개',
            expected: '0 apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-4',
            input: '고양이 1마리',
            expected: '1 cat',
            direction: 'ko-en',
          },
          {
            id: 'anti-l1-5',
            input: '고양이 5마리',
            expected: '5 cats',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l1-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l1-6',
            input: '1 apple',
            expected: '사과 1개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-7',
            input: '2 apples',
            expected: '사과 2개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-8',
            input: '0 apples',
            expected: '사과 0개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-9',
            input: '1 cat',
            expected: '고양이 1마리',
            direction: 'en-ko',
          },
          {
            id: 'anti-l1-10',
            input: '5 cats',
            expected: '고양이 5마리',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-2',
    name: 'Level 2: Article a/an Rules (관사 a/an)',
    nameKo: 'Level 2: 관사 a/an 발음 규칙',
    categories: [
      {
        id: 'anti-l2-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l2-1',
            input: '사과 하나',
            expected: 'an apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-2',
            input: '책 하나',
            expected: 'a book',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-3',
            input: '대학교 하나',
            expected: 'a university',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-4',
            input: '한 시간',
            expected: 'an hour',
            direction: 'ko-en',
          },
          {
            id: 'anti-l2-5',
            input: '정직한 사람',
            expected: 'an honest person',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l2-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l2-6',
            input: 'an apple',
            expected: '사과 하나',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-7',
            input: 'a book',
            expected: '책 하나',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-8',
            input: 'a university',
            expected: '대학교 하나',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-9',
            input: 'an hour',
            expected: '한 시간',
            direction: 'en-ko',
          },
          {
            id: 'anti-l2-10',
            input: 'an honest person',
            expected: '정직한 사람',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-3',
    name: 'Level 3: Ordinal Numbers (서수)',
    nameKo: 'Level 3: 서수 생성 규칙',
    categories: [
      {
        id: 'anti-l3-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l3-1',
            input: '1번째',
            expected: '1st',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-2',
            input: '2번째',
            expected: '2nd',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-3',
            input: '3번째',
            expected: '3rd',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-4',
            input: '11번째',
            expected: '11th',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-5',
            input: '21번째',
            expected: '21st',
            direction: 'ko-en',
          },
          {
            id: 'anti-l3-6',
            input: '112번째',
            expected: '112th',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l3-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l3-7',
            input: '1st',
            expected: '1번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-8',
            input: '2nd',
            expected: '2번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-9',
            input: '3rd',
            expected: '3번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-10',
            input: '11th',
            expected: '11번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-11',
            input: '21st',
            expected: '21번째',
            direction: 'en-ko',
          },
          {
            id: 'anti-l3-12',
            input: '112th',
            expected: '112번째',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-4',
    name: 'Level 4: Tense Detection (시제 자동 판단)',
    nameKo: 'Level 4: 시제 자동 판단',
    categories: [
      {
        id: 'anti-l4-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l4-1',
            input: '어제 먹었다',
            expected: 'ate yesterday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-2',
            input: '내일 먹을 거야',
            expected: 'will eat tomorrow',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-3',
            input: '매일 먹는다',
            expected: 'eat every day',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-4',
            input: '지금 먹고 있다',
            expected: 'am eating now',
            direction: 'ko-en',
          },
          {
            id: 'anti-l4-5',
            input: '이미 먹었다',
            expected: 'have already eaten',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l4-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l4-6',
            input: 'ate yesterday',
            expected: '어제 먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-7',
            input: 'will eat tomorrow',
            expected: '내일 먹을 거야',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-8',
            input: 'eat every day',
            expected: '매일 먹는다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-9',
            input: 'am eating now',
            expected: '지금 먹고 있다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l4-10',
            input: 'have already eaten',
            expected: '이미 먹었다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-5',
    name: 'Level 5: Subject-Verb Agreement (주어-동사 수 일치)',
    nameKo: 'Level 5: 주어-동사 수 일치',
    categories: [
      {
        id: 'anti-l5-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l5-1',
            input: '그는 달린다',
            expected: 'He runs',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-2',
            input: '그들은 달린다',
            expected: 'They run',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-3',
            input: '고양이가 잔다',
            expected: 'The cat sleeps',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-4',
            input: '고양이들이 잔다',
            expected: 'The cats sleep',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-5',
            input: '학생이 공부한다',
            expected: 'The student studies',
            direction: 'ko-en',
          },
          {
            id: 'anti-l5-6',
            input: '버스가 간다',
            expected: 'The bus goes',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l5-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l5-7',
            input: 'He runs',
            expected: '그는 달린다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-8',
            input: 'They run',
            expected: '그들은 달린다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-9',
            input: 'The cat sleeps',
            expected: '고양이가 잔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-10',
            input: 'The cats sleep',
            expected: '고양이들이 잔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-11',
            input: 'The student studies',
            expected: '학생이 공부한다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l5-12',
            input: 'The bus goes',
            expected: '버스가 간다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-6',
    name: 'Level 6: Negation (부정문 자동 생성)',
    nameKo: 'Level 6: 부정문 자동 생성',
    categories: [
      {
        id: 'anti-l6-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l6-1',
            input: '안 먹는다',
            expected: "don't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-2',
            input: '그는 안 먹는다',
            expected: "He doesn't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-3',
            input: '안 먹었다',
            expected: "didn't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-4',
            input: '안 먹을 거야',
            expected: "won't eat",
            direction: 'ko-en',
          },
          {
            id: 'anti-l6-5',
            input: '안 먹고 있다',
            expected: 'am not eating',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l6-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l6-6',
            input: "don't eat",
            expected: '안 먹는다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-7',
            input: "He doesn't eat",
            expected: '그는 안 먹는다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-8',
            input: "didn't eat",
            expected: '안 먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-9',
            input: "won't eat",
            expected: '안 먹을 거야',
            direction: 'en-ko',
          },
          {
            id: 'anti-l6-10',
            input: 'am not eating',
            expected: '안 먹고 있다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-7',
    name: 'Level 7: Comparative/Superlative (비교급/최상급)',
    nameKo: 'Level 7: 비교급/최상급 규칙',
    categories: [
      {
        id: 'anti-l7-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l7-1',
            input: '더 크다',
            expected: 'bigger',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-2',
            input: '가장 크다',
            expected: 'biggest',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-3',
            input: '더 행복하다',
            expected: 'happier',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-4',
            input: '더 아름답다',
            expected: 'more beautiful',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-5',
            input: '더 좋다',
            expected: 'better',
            direction: 'ko-en',
          },
          {
            id: 'anti-l7-6',
            input: '가장 나쁘다',
            expected: 'worst',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l7-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l7-7',
            input: 'bigger',
            expected: '더 크다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-8',
            input: 'biggest',
            expected: '가장 크다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-9',
            input: 'happier',
            expected: '더 행복하다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-10',
            input: 'more beautiful',
            expected: '더 아름답다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-11',
            input: 'better',
            expected: '더 좋다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l7-12',
            input: 'worst',
            expected: '가장 나쁘다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-8',
    name: 'Level 8: Countable/Uncountable (가산/불가산)',
    nameKo: 'Level 8: 가산/불가산 명사 판단',
    categories: [
      {
        id: 'anti-l8-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l8-1',
            input: '사과 3개',
            expected: '3 apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-2',
            input: '물 3잔',
            expected: '3 glasses of water',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-3',
            input: '커피 2잔',
            expected: '2 cups of coffee',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-4',
            input: '정보가 많다',
            expected: 'much information',
            direction: 'ko-en',
          },
          {
            id: 'anti-l8-5',
            input: '사람이 많다',
            expected: 'many people',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l8-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l8-6',
            input: '3 apples',
            expected: '사과 3개',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-7',
            input: '3 glasses of water',
            expected: '물 3잔',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-8',
            input: '2 cups of coffee',
            expected: '커피 2잔',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-9',
            input: 'much information',
            expected: '정보가 많다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l8-10',
            input: 'many people',
            expected: '사람이 많다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-9',
    name: 'Level 9: Passive/Active Voice (수동태/능동태)',
    nameKo: 'Level 9: 수동태/능동태 변환',
    categories: [
      {
        id: 'anti-l9-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l9-1',
            input: '나는 사과를 먹었다',
            expected: 'I ate an apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l9-2',
            input: '사과가 먹혔다',
            expected: 'The apple was eaten',
            direction: 'ko-en',
          },
          {
            id: 'anti-l9-3',
            input: '그는 문을 닫았다',
            expected: 'He closed the door',
            direction: 'ko-en',
          },
          {
            id: 'anti-l9-4',
            input: '문이 닫혔다',
            expected: 'The door was closed',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l9-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l9-5',
            input: 'I ate an apple',
            expected: '나는 사과를 먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l9-6',
            input: 'The apple was eaten',
            expected: '사과가 먹혔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l9-7',
            input: 'He closed the door',
            expected: '그는 문을 닫았다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l9-8',
            input: 'The door was closed',
            expected: '문이 닫혔다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-10',
    name: 'Level 10: Time Prepositions (시간 전치사)',
    nameKo: 'Level 10: 전치사 자동 선택 (시간)',
    categories: [
      {
        id: 'anti-l10-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l10-1',
            input: '3시에',
            expected: "at 3 o'clock",
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-2',
            input: '월요일에',
            expected: 'on Monday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-3',
            input: '3월에',
            expected: 'in March',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-4',
            input: '2024년에',
            expected: 'in 2024',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-5',
            input: '아침에',
            expected: 'in the morning',
            direction: 'ko-en',
          },
          {
            id: 'anti-l10-6',
            input: '정오에',
            expected: 'at noon',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l10-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l10-7',
            input: "at 3 o'clock",
            expected: '3시에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-8',
            input: 'on Monday',
            expected: '월요일에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-9',
            input: 'in March',
            expected: '3월에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-10',
            input: 'in 2024',
            expected: '2024년에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-11',
            input: 'in the morning',
            expected: '아침에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l10-12',
            input: 'at noon',
            expected: '정오에',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-11',
    name: 'Level 11: Place Prepositions (장소 전치사)',
    nameKo: 'Level 11: 전치사 자동 선택 (장소)',
    categories: [
      {
        id: 'anti-l11-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l11-1',
            input: '집에',
            expected: 'at home',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-2',
            input: '서울에',
            expected: 'in Seoul',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-3',
            input: '책상 위에',
            expected: 'on the desk',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-4',
            input: '상자 안에',
            expected: 'in the box',
            direction: 'ko-en',
          },
          {
            id: 'anti-l11-5',
            input: '학교에서',
            expected: 'at school',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l11-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l11-6',
            input: 'at home',
            expected: '집에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-7',
            input: 'in Seoul',
            expected: '서울에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-8',
            input: 'on the desk',
            expected: '책상 위에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-9',
            input: 'in the box',
            expected: '상자 안에',
            direction: 'en-ko',
          },
          {
            id: 'anti-l11-10',
            input: 'at school',
            expected: '학교에서',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-12',
    name: 'Level 12: Question Words (의문사)',
    nameKo: 'Level 12: 의문사 자동 선택',
    categories: [
      {
        id: 'anti-l12-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l12-1',
            input: '누구?',
            expected: 'Who?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-2',
            input: '뭐?',
            expected: 'What?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-3',
            input: '언제?',
            expected: 'When?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-4',
            input: '어디?',
            expected: 'Where?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-5',
            input: '왜?',
            expected: 'Why?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l12-6',
            input: '어떻게?',
            expected: 'How?',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l12-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l12-7',
            input: 'Who?',
            expected: '누구?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-8',
            input: 'What?',
            expected: '뭐?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-9',
            input: 'When?',
            expected: '언제?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-10',
            input: 'Where?',
            expected: '어디?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-11',
            input: 'Why?',
            expected: '왜?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l12-12',
            input: 'How?',
            expected: '어떻게?',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-13',
    name: 'Level 13: Adjective Order (형용사 순서)',
    nameKo: 'Level 13: 형용사 순서 규칙',
    categories: [
      {
        id: 'anti-l13-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l13-1',
            input: '큰 빨간 사과',
            expected: 'a big red apple',
            direction: 'ko-en',
          },
          {
            id: 'anti-l13-2',
            input: '낡은 나무 탁자',
            expected: 'an old wooden table',
            direction: 'ko-en',
          },
          {
            id: 'anti-l13-3',
            input: '예쁜 작은 파란 집',
            expected: 'a beautiful small blue house',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l13-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l13-4',
            input: 'a big red apple',
            expected: '큰 빨간 사과',
            direction: 'en-ko',
          },
          {
            id: 'anti-l13-5',
            input: 'an old wooden table',
            expected: '낡은 나무 탁자',
            direction: 'en-ko',
          },
          {
            id: 'anti-l13-6',
            input: 'a beautiful small blue house',
            expected: '예쁜 작은 파란 집',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-14',
    name: 'Level 14: Relative Pronouns (관계대명사)',
    nameKo: 'Level 14: 관계대명사 자동 삽입',
    categories: [
      {
        id: 'anti-l14-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l14-1',
            input: '내가 산 책',
            expected: 'the book that I bought',
            direction: 'ko-en',
          },
          {
            id: 'anti-l14-2',
            input: '나를 도운 사람',
            expected: 'the person who helped me',
            direction: 'ko-en',
          },
          {
            id: 'anti-l14-3',
            input: '그가 사는 집',
            expected: 'the home where he lives',
            direction: 'ko-en',
          },
          {
            id: 'anti-l14-4',
            input: '우리가 만난 날',
            expected: 'the day when we met',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l14-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l14-5',
            input: 'the book that I bought',
            expected: '내가 산 책',
            direction: 'en-ko',
          },
          {
            id: 'anti-l14-6',
            input: 'the person who helped me',
            expected: '나를 도운 사람',
            direction: 'en-ko',
          },
          {
            id: 'anti-l14-7',
            input: 'the home where he lives',
            expected: '그가 사는 집',
            direction: 'en-ko',
          },
          {
            id: 'anti-l14-8',
            input: 'the day when we met',
            expected: '우리가 만난 날',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-15',
    name: 'Level 15: Pronoun Resolution (대명사 결정)',
    nameKo: 'Level 15: 대명사 자동 결정',
    categories: [
      {
        id: 'anti-l15-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l15-1',
            input: '철수는 사과를 샀다. 그것은 빨갛다.',
            expected: 'Chulsoo bought an apple. It is red.',
            direction: 'ko-en',
          },
          {
            id: 'anti-l15-2',
            input: '영희는 학교에 갔다. 그녀는 학생이다.',
            expected: 'Younghee went to school. She is a student.',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l15-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l15-3',
            input: 'Chulsoo bought an apple. It is red.',
            expected: '철수는 사과를 샀다. 그것은 빨갛다.',
            direction: 'en-ko',
          },
          {
            id: 'anti-l15-4',
            input: 'Younghee went to school. She is a student.',
            expected: '영희는 학교에 갔다. 그녀는 학생이다.',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-16',
    name: 'Level 16: Subject Recovery (생략 주어 복원)',
    nameKo: 'Level 16: 생략 주어 복원',
    categories: [
      {
        id: 'anti-l16-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l16-1',
            input: '어제 영화 봤어',
            expected: 'I watched a movie yesterday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l16-2',
            input: '밥 먹었어?',
            expected: 'Did you eat?',
            direction: 'ko-en',
          },
          {
            id: 'anti-l16-3',
            input: '피곤해',
            expected: "I'm tired",
            direction: 'ko-en',
          },
          {
            id: 'anti-l16-4',
            input: '어디 가?',
            expected: 'Where are you going?',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l16-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l16-5',
            input: 'I watched a movie yesterday',
            expected: '어제 영화 봤어',
            direction: 'en-ko',
          },
          {
            id: 'anti-l16-6',
            input: 'Did you eat?',
            expected: '밥 먹었어?',
            direction: 'en-ko',
          },
          {
            id: 'anti-l16-7',
            input: "I'm tired",
            expected: '피곤해',
            direction: 'en-ko',
          },
          {
            id: 'anti-l16-8',
            input: 'Where are you going?',
            expected: '어디 가?',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-17',
    name: 'Level 17: Gerund/Infinitive (동명사/to부정사)',
    nameKo: 'Level 17: 동명사/to부정사 선택',
    categories: [
      {
        id: 'anti-l17-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l17-1',
            input: '수영하는 것을 즐긴다',
            expected: 'enjoy swimming',
            direction: 'ko-en',
          },
          {
            id: 'anti-l17-2',
            input: '수영하고 싶다',
            expected: 'want to swim',
            direction: 'ko-en',
          },
          {
            id: 'anti-l17-3',
            input: '수영하는 것을 멈췄다',
            expected: 'stopped swimming',
            direction: 'ko-en',
          },
          {
            id: 'anti-l17-4',
            input: '수영하기 위해',
            expected: 'to swim',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l17-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l17-5',
            input: 'enjoy swimming',
            expected: '수영하는 것을 즐긴다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l17-6',
            input: 'want to swim',
            expected: '수영하고 싶다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l17-7',
            input: 'stopped swimming',
            expected: '수영하는 것을 멈췄다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l17-8',
            input: 'to swim',
            expected: '수영하기 위해',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-18',
    name: 'Level 18: Quantifiers (수량사)',
    nameKo: 'Level 18: 수량사 자동 선택',
    categories: [
      {
        id: 'anti-l18-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l18-1',
            input: '많은 사과',
            expected: 'many apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l18-2',
            input: '많은 물',
            expected: 'much water',
            direction: 'ko-en',
          },
          {
            id: 'anti-l18-3',
            input: '약간의 사과',
            expected: 'a few apples',
            direction: 'ko-en',
          },
          {
            id: 'anti-l18-4',
            input: '약간의 물',
            expected: 'a little water',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l18-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l18-5',
            input: 'many apples',
            expected: '사과가 많다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l18-6',
            input: 'much water',
            expected: '물이 많다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l18-7',
            input: 'a few apples',
            expected: '약간의 사과',
            direction: 'en-ko',
          },
          {
            id: 'anti-l18-8',
            input: 'a little water',
            expected: '약간의 물',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-19',
    name: 'Level 19: Reflexive Pronouns (재귀 대명사)',
    nameKo: 'Level 19: 재귀 대명사 규칙',
    categories: [
      {
        id: 'anti-l19-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l19-1',
            input: '나 자신을',
            expected: 'myself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-2',
            input: '너 자신을',
            expected: 'yourself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-3',
            input: '그 자신을',
            expected: 'himself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-4',
            input: '그녀 자신을',
            expected: 'herself',
            direction: 'ko-en',
          },
          {
            id: 'anti-l19-5',
            input: '우리 자신을',
            expected: 'ourselves',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l19-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l19-6',
            input: 'myself',
            expected: '나 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-7',
            input: 'yourself',
            expected: '너 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-8',
            input: 'himself',
            expected: '그 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-9',
            input: 'herself',
            expected: '그녀 자신을',
            direction: 'en-ko',
          },
          {
            id: 'anti-l19-10',
            input: 'ourselves',
            expected: '우리 자신을',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-20',
    name: 'Level 20: Homonym Disambiguation (중의적 표현 해소)',
    nameKo: 'Level 20: 중의적 표현 해소',
    categories: [
      {
        id: 'anti-l20-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l20-1',
            input: '배를 타고',
            expected: 'ride a ship',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-2',
            input: '배가 고파서',
            expected: 'because I am hungry',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-3',
            input: '배를 먹고',
            expected: 'eat a pear',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-4',
            input: '눈이 와서',
            expected: "because it's snowing",
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-5',
            input: '눈이 아파서',
            expected: 'because my eyes hurt',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-6',
            input: '말을 타고',
            expected: 'ride a horse',
            direction: 'ko-en',
          },
          {
            id: 'anti-l20-7',
            input: '말을 했는데',
            expected: 'I spoke but',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l20-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l20-8',
            input: 'ride a ship',
            expected: '배를 타고',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-9',
            input: 'because I am hungry',
            expected: '배가 고파서',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-10',
            input: 'eat a pear',
            expected: '배를 먹고',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-11',
            input: "because it's snowing",
            expected: '눈이 와서',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-12',
            input: 'because my eyes hurt',
            expected: '눈이 아파서',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-13',
            input: 'ride a horse',
            expected: '말을 타고',
            direction: 'en-ko',
          },
          {
            id: 'anti-l20-14',
            input: 'I spoke but',
            expected: '말을 했는데',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-21',
    name: 'Level 21: Irregular Verbs (불규칙 동사)',
    nameKo: 'Level 21: 동사 불규칙 변화',
    categories: [
      {
        id: 'anti-l21-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l21-1',
            input: '갔다',
            expected: 'went',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-2',
            input: '먹었다',
            expected: 'ate',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-3',
            input: '봤다',
            expected: 'saw',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-4',
            input: '샀다',
            expected: 'bought',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-5',
            input: '생각했다',
            expected: 'thought',
            direction: 'ko-en',
          },
          {
            id: 'anti-l21-6',
            input: '썼다',
            expected: 'wrote',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l21-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l21-7',
            input: 'went',
            expected: '갔다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-8',
            input: 'ate',
            expected: '먹었다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-9',
            input: 'saw',
            expected: '봤다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-10',
            input: 'bought',
            expected: '샀다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-11',
            input: 'thought',
            expected: '생각했다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l21-12',
            input: 'wrote',
            expected: '썼다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
  {
    id: 'anti-level-22',
    name: 'Level 22: Combination Explosion (조합 폭발)',
    nameKo: 'Level 22: 조합 폭발 처리',
    categories: [
      {
        id: 'anti-l22-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'anti-l22-1',
            input: '3개의 큰 빨간 사과를 어제 그가 샀다',
            expected: 'He bought 3 big red apples yesterday',
            direction: 'ko-en',
          },
          {
            id: 'anti-l22-2',
            input: '5마리의 작은 파란 새들이 내일 노래할 것이다',
            expected: '5 small blue birds will sing tomorrow',
            direction: 'ko-en',
          },
          {
            id: 'anti-l22-3',
            input: '2마리의 귀여운 흰 고양이가 지금 자고 있다',
            expected: '2 cute white cats are sleeping now',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'anti-l22-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'anti-l22-4',
            input: 'He bought 3 big red apples yesterday',
            expected: '3개의 큰 빨간 사과를 어제 그가 샀다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l22-5',
            input: '5 small blue birds will sing tomorrow',
            expected: '5마리의 작은 파란 새들이 내일 노래할 것이다',
            direction: 'en-ko',
          },
          {
            id: 'anti-l22-6',
            input: '2 cute white cats are sleeping now',
            expected: '2마리의 귀여운 흰 고양이가 지금 자고 있다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },
];

// ========================================
// 비유 표현 테스트 (Figurative Expression Tests)
// 13번째 테스트 그룹: 직유, 은유, 의인법, 과장법, 관용적 비유, 역설, 환유, 제유, 문화 특수 비유
// ========================================
