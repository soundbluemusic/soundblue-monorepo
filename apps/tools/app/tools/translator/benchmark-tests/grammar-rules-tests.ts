// ========================================
// 문법 규칙 테스트 (Grammar Rules Tests)
// grammar-rules-v5-complete.md 기반 400개 규칙
// 30개 카테고리
// ========================================

import type { TestLevel } from '../types';

export const grammarRulesTests: TestLevel[] = [
  // ========================================
  // 1. 시제 변환 (Tense) - 12개 규칙
  // ========================================
  {
    id: 'grammar-1-tense',
    name: '1. Tense Conversion (시제 변환)',
    nameKo: '1. 시제 변환',
    categories: [
      {
        id: 'tense-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g1-1', input: '먹는다', expected: 'eat/eats', direction: 'ko-en' },
          { id: 'g1-2', input: '먹었다', expected: 'ate', direction: 'ko-en' },
          { id: 'g1-3', input: '먹을 것이다', expected: 'will eat', direction: 'ko-en' },
          { id: 'g1-4', input: '먹고 있다', expected: 'is eating', direction: 'ko-en' },
          { id: 'g1-5', input: '먹고 있었다', expected: 'was eating', direction: 'ko-en' },
          { id: 'g1-6', input: '먹어 본 적 있다', expected: 'have eaten', direction: 'ko-en' },
        ],
      },
      {
        id: 'tense-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g1-7',
            input: 'I eat breakfast',
            expected: '나는 아침을 먹는다',
            direction: 'en-ko',
          },
          {
            id: 'g1-8',
            input: 'I ate breakfast',
            expected: '나는 아침을 먹었다',
            direction: 'en-ko',
          },
          {
            id: 'g1-9',
            input: 'I will eat breakfast',
            expected: '나는 아침을 먹을 것이다',
            direction: 'en-ko',
          },
          { id: 'g1-10', input: 'I am eating', expected: '나는 먹고 있다', direction: 'en-ko' },
          { id: 'g1-11', input: 'I was eating', expected: '나는 먹고 있었다', direction: 'en-ko' },
          {
            id: 'g1-12',
            input: 'I have eaten',
            expected: '나는 먹어 본 적 있다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 2. 문장 유형 변환 (Sentence Type) - 8개 규칙
  // ========================================
  {
    id: 'grammar-2-sentence-type',
    name: '2. Sentence Type Conversion (문장 유형 변환)',
    nameKo: '2. 문장 유형 변환',
    categories: [
      {
        id: 'sentence-type-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g2-1',
            input: '그가 책을 읽는다',
            expected: 'He reads a book',
            direction: 'ko-en',
          },
          { id: 'g2-2', input: '책을 읽니?', expected: 'Do you read a book?', direction: 'ko-en' },
          {
            id: 'g2-3',
            input: '누가 책을 읽니?',
            expected: 'Who reads the book?',
            direction: 'ko-en',
          },
          { id: 'g2-4', input: '책을 읽어라!', expected: 'Read the book!', direction: 'ko-en' },
          { id: 'g2-5', input: '책을 읽자', expected: "Let's read the book", direction: 'ko-en' },
          { id: 'g2-6', input: '정말 아름답구나!', expected: 'How beautiful!', direction: 'ko-en' },
          { id: 'g2-7', input: '그렇지 않니?', expected: "Isn't it?", direction: 'ko-en' },
          {
            id: 'g2-8',
            input: '올지 궁금하다',
            expected: 'I wonder if they will come',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'sentence-type-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g2-9',
            input: 'She sings a song',
            expected: '그녀가 노래를 부른다',
            direction: 'en-ko',
          },
          {
            id: 'g2-10',
            input: 'Do you like coffee?',
            expected: '커피를 좋아하니?',
            direction: 'en-ko',
          },
          {
            id: 'g2-11',
            input: 'Where do you live?',
            expected: '어디에 사니?',
            direction: 'en-ko',
          },
          { id: 'g2-12', input: 'Close the door!', expected: '문을 닫아라!', direction: 'en-ko' },
          { id: 'g2-13', input: "Let's go home", expected: '집에 가자', direction: 'en-ko' },
          {
            id: 'g2-14',
            input: 'What a wonderful day!',
            expected: '정말 멋진 날이구나!',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 3. 부정 변환 (Negation) - 10개 규칙
  // ========================================
  {
    id: 'grammar-3-negation',
    name: '3. Negation Conversion (부정 변환)',
    nameKo: '3. 부정 변환',
    categories: [
      {
        id: 'negation-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g3-1', input: '안 먹는다', expected: "don't eat", direction: 'ko-en' },
          { id: 'g3-2', input: '먹지 않는다', expected: "don't eat", direction: 'ko-en' },
          { id: 'g3-3', input: '안 먹었다', expected: "didn't eat", direction: 'ko-en' },
          { id: 'g3-4', input: '먹지 않을 것이다', expected: "won't eat", direction: 'ko-en' },
          { id: 'g3-5', input: '못 먹는다', expected: "can't eat", direction: 'ko-en' },
          { id: 'g3-6', input: '먹지 못한다', expected: "can't eat", direction: 'ko-en' },
          { id: 'g3-7', input: '먹지 마!', expected: "Don't eat!", direction: 'ko-en' },
          {
            id: 'g3-8',
            input: '모두 좋지는 않다',
            expected: 'Not all are good',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'negation-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g3-9', input: "I don't go", expected: '나는 안 간다', direction: 'en-ko' },
          { id: 'g3-10', input: "He doesn't eat", expected: '그는 안 먹는다', direction: 'en-ko' },
          { id: 'g3-11', input: "I didn't sleep", expected: '나는 안 잤다', direction: 'en-ko' },
          { id: 'g3-12', input: "I won't go", expected: '나는 안 갈 것이다', direction: 'en-ko' },
          {
            id: 'g3-13',
            input: "I can't swim",
            expected: '나는 수영을 못 한다',
            direction: 'en-ko',
          },
          { id: 'g3-14', input: "Don't run!", expected: '뛰지 마!', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 4. 태 변환 (Voice) - 10개 규칙
  // ========================================
  {
    id: 'grammar-4-voice',
    name: '4. Voice Conversion (태 변환)',
    nameKo: '4. 태 변환',
    categories: [
      {
        id: 'voice-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g4-1',
            input: '그가 문을 열었다',
            expected: 'He opened the door',
            direction: 'ko-en',
          },
          { id: 'g4-2', input: '문이 열렸다', expected: 'The door was opened', direction: 'ko-en' },
          {
            id: 'g4-3',
            input: '소리가 들린다',
            expected: 'The sound is heard',
            direction: 'ko-en',
          },
          {
            id: 'g4-4',
            input: '문제가 해결되었다',
            expected: 'The problem was solved',
            direction: 'ko-en',
          },
          { id: 'g4-5', input: '그녀는 사랑받는다', expected: 'She is loved', direction: 'ko-en' },
          {
            id: 'g4-6',
            input: '그는 비난당했다',
            expected: 'He was criticized',
            direction: 'ko-en',
          },
          {
            id: 'g4-7',
            input: '아이에게 밥을 먹였다',
            expected: 'I fed the child',
            direction: 'ko-en',
          },
          { id: 'g4-8', input: '그를 가게 했다', expected: 'I made him go', direction: 'ko-en' },
        ],
      },
      {
        id: 'voice-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g4-9',
            input: 'The book was written by him',
            expected: '그 책은 그에 의해 쓰여졌다',
            direction: 'en-ko',
          },
          {
            id: 'g4-10',
            input: 'The window was broken',
            expected: '창문이 깨졌다',
            direction: 'en-ko',
          },
          {
            id: 'g4-11',
            input: 'She was respected by everyone',
            expected: '그녀는 모두에게 존경받았다',
            direction: 'en-ko',
          },
          {
            id: 'g4-12',
            input: 'I made him study',
            expected: '나는 그를 공부하게 했다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 5. 조동사 변환 (Modals) - 14개 규칙
  // ========================================
  {
    id: 'grammar-5-modals',
    name: '5. Modal Conversion (조동사 변환)',
    nameKo: '5. 조동사 변환',
    categories: [
      {
        id: 'modals-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g5-1', input: '할 수 있다', expected: 'can do', direction: 'ko-en' },
          { id: 'g5-2', input: '해도 된다', expected: 'may do', direction: 'ko-en' },
          { id: 'g5-3', input: '할지도 모른다', expected: 'may/might do', direction: 'ko-en' },
          { id: 'g5-4', input: '해야 한다', expected: 'must do', direction: 'ko-en' },
          { id: 'g5-5', input: '틀림없이 그렇다', expected: 'must be', direction: 'ko-en' },
          { id: 'g5-6', input: '하는 게 좋다', expected: 'should do', direction: 'ko-en' },
          { id: 'g5-7', input: '하겠다', expected: 'will do', direction: 'ko-en' },
          { id: 'g5-8', input: '하곤 했다', expected: 'would do', direction: 'ko-en' },
          { id: 'g5-9', input: '해 주시겠어요?', expected: 'Would you do?', direction: 'ko-en' },
          { id: 'g5-10', input: '할 수 있었다', expected: 'could do', direction: 'ko-en' },
          { id: 'g5-11', input: '해야 했다', expected: 'had to do', direction: 'ko-en' },
        ],
      },
      {
        id: 'modals-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g5-12', input: 'I can swim', expected: '나는 수영할 수 있다', direction: 'en-ko' },
          { id: 'g5-13', input: 'You may go', expected: '가도 된다', direction: 'en-ko' },
          {
            id: 'g5-14',
            input: 'He might come',
            expected: '그가 올지도 모른다',
            direction: 'en-ko',
          },
          { id: 'g5-15', input: 'You must study', expected: '공부해야 한다', direction: 'en-ko' },
          { id: 'g5-16', input: 'You should rest', expected: '쉬는 게 좋다', direction: 'en-ko' },
          { id: 'g5-17', input: 'I will help', expected: '도와줄게', direction: 'en-ko' },
          {
            id: 'g5-18',
            input: 'I would play games',
            expected: '게임을 하곤 했다',
            direction: 'en-ko',
          },
          {
            id: 'g5-19',
            input: 'Would you help me?',
            expected: '도와주시겠어요?',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 6. 조건문 변환 (Conditionals) - 8개 규칙
  // ========================================
  {
    id: 'grammar-6-conditionals',
    name: '6. Conditional Conversion (조건문 변환)',
    nameKo: '6. 조건문 변환',
    categories: [
      {
        id: 'conditionals-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g6-1',
            input: '비가 오면 땅이 젖는다',
            expected: 'If it rains, the ground gets wet',
            direction: 'ko-en',
          },
          {
            id: 'g6-2',
            input: '비가 오면 집에 있을 것이다',
            expected: 'If it rains, I will stay home',
            direction: 'ko-en',
          },
          {
            id: 'g6-3',
            input: '부자라면 여행할 텐데',
            expected: 'If I were rich, I would travel',
            direction: 'ko-en',
          },
          {
            id: 'g6-4',
            input: '공부했더라면 합격했을 텐데',
            expected: 'If I had studied, I would have passed',
            direction: 'ko-en',
          },
          { id: 'g6-5', input: '오지 않으면', expected: 'Unless you come', direction: 'ko-en' },
          { id: 'g6-6', input: '비가 오더라도', expected: 'Even if it rains', direction: 'ko-en' },
        ],
      },
      {
        id: 'conditionals-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g6-7',
            input: 'If you study, you learn',
            expected: '공부하면 배운다',
            direction: 'en-ko',
          },
          {
            id: 'g6-8',
            input: 'If it snows, I will stay home',
            expected: '눈이 오면 집에 있을 것이다',
            direction: 'en-ko',
          },
          {
            id: 'g6-9',
            input: 'If I were you, I would go',
            expected: '내가 너라면 갈 텐데',
            direction: 'en-ko',
          },
          {
            id: 'g6-10',
            input: 'If I had known, I would have helped',
            expected: '알았더라면 도왔을 텐데',
            direction: 'en-ko',
          },
          {
            id: 'g6-11',
            input: 'Unless you hurry',
            expected: '서두르지 않으면',
            direction: 'en-ko',
          },
          { id: 'g6-12', input: 'Even if it is hard', expected: '어렵더라도', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 7. 비교 변환 (Comparison) - 8개 규칙
  // ========================================
  {
    id: 'grammar-7-comparison',
    name: '7. Comparison Conversion (비교 변환)',
    nameKo: '7. 비교 변환',
    categories: [
      {
        id: 'comparison-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g7-1', input: '그만큼 크다', expected: 'as big as', direction: 'ko-en' },
          { id: 'g7-2', input: '그만큼 크지 않다', expected: 'not as big as', direction: 'ko-en' },
          { id: 'g7-3', input: '더 크다', expected: 'bigger/more', direction: 'ko-en' },
          { id: 'g7-4', input: '가장 크다', expected: 'the biggest/most', direction: 'ko-en' },
          { id: 'g7-5', input: '덜 중요하다', expected: 'less important', direction: 'ko-en' },
          { id: 'g7-6', input: '두 배 크다', expected: 'twice as big', direction: 'ko-en' },
          { id: 'g7-7', input: '훨씬 더 크다', expected: 'much bigger', direction: 'ko-en' },
          {
            id: 'g7-8',
            input: '단연 가장 크다',
            expected: 'by far the biggest',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'comparison-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g7-9', input: 'as tall as me', expected: '나만큼 키가 크다', direction: 'en-ko' },
          {
            id: 'g7-10',
            input: 'taller than me',
            expected: '나보다 더 키가 크다',
            direction: 'en-ko',
          },
          {
            id: 'g7-11',
            input: 'the tallest in class',
            expected: '반에서 가장 키가 크다',
            direction: 'en-ko',
          },
          { id: 'g7-12', input: 'less expensive', expected: '덜 비싸다', direction: 'en-ko' },
          {
            id: 'g7-13',
            input: 'three times as fast',
            expected: '세 배 빠르다',
            direction: 'en-ko',
          },
          { id: 'g7-14', input: 'much better', expected: '훨씬 더 좋다', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 8. 명사절 변환 (Noun Clauses) - 10개 규칙
  // ========================================
  {
    id: 'grammar-8-noun-clauses',
    name: '8. Noun Clause Conversion (명사절 변환)',
    nameKo: '8. 명사절 변환',
    categories: [
      {
        id: 'noun-clause-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g8-1',
            input: '그가 왔다는 것이 중요하다',
            expected: 'That he came is important',
            direction: 'ko-en',
          },
          {
            id: 'g8-2',
            input: '그가 왔다는 것을 안다',
            expected: 'I know that he came',
            direction: 'ko-en',
          },
          {
            id: 'g8-3',
            input: '그가 올지 궁금하다',
            expected: 'I wonder if he will come',
            direction: 'ko-en',
          },
          {
            id: 'g8-4',
            input: '그가 어디 갔는지 모른다',
            expected: "I don't know where he went",
            direction: 'ko-en',
          },
          {
            id: 'g8-5',
            input: '그가 간다고 했다',
            expected: 'He said that he would go',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'noun-clause-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g8-6',
            input: 'That she is honest is clear',
            expected: '그녀가 정직하다는 것은 분명하다',
            direction: 'en-ko',
          },
          {
            id: 'g8-7',
            input: 'I believe that he is right',
            expected: '그가 옳다고 믿는다',
            direction: 'en-ko',
          },
          {
            id: 'g8-8',
            input: 'I wonder whether it is true',
            expected: '그것이 사실인지 궁금하다',
            direction: 'en-ko',
          },
          {
            id: 'g8-9',
            input: 'I know what you mean',
            expected: '네가 무슨 말을 하는지 안다',
            direction: 'en-ko',
          },
          {
            id: 'g8-10',
            input: 'She said that she was busy',
            expected: '그녀는 바쁘다고 말했다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 9. 관계절 변환 (Relative Clauses) - 10개 규칙
  // ========================================
  {
    id: 'grammar-9-relative-clauses',
    name: '9. Relative Clause Conversion (관계절 변환)',
    nameKo: '9. 관계절 변환',
    categories: [
      {
        id: 'relative-clause-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g9-1', input: '뛰는 소년', expected: 'the boy who runs', direction: 'ko-en' },
          {
            id: 'g9-2',
            input: '내가 산 책',
            expected: 'the book that I bought',
            direction: 'ko-en',
          },
          {
            id: 'g9-3',
            input: '그가 사는 곳',
            expected: 'the place where he lives',
            direction: 'ko-en',
          },
          {
            id: 'g9-4',
            input: '우리가 만난 날',
            expected: 'the day when we met',
            direction: 'ko-en',
          },
          {
            id: 'g9-5',
            input: '그가 떠난 이유',
            expected: 'the reason why he left',
            direction: 'ko-en',
          },
          {
            id: 'g9-6',
            input: '문제를 푸는 방법',
            expected: 'the way how to solve the problem',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'relative-clause-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g9-7',
            input: 'the girl who sings',
            expected: '노래하는 소녀',
            direction: 'en-ko',
          },
          {
            id: 'g9-8',
            input: 'the car that he bought',
            expected: '그가 산 차',
            direction: 'en-ko',
          },
          {
            id: 'g9-9',
            input: 'the city where I was born',
            expected: '내가 태어난 도시',
            direction: 'en-ko',
          },
          {
            id: 'g9-10',
            input: 'the moment when it happened',
            expected: '그것이 일어난 순간',
            direction: 'en-ko',
          },
          {
            id: 'g9-11',
            input: 'the reason why she cried',
            expected: '그녀가 운 이유',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 10. 부사절 변환 (Adverbial Clauses) - 16개 규칙
  // ========================================
  {
    id: 'grammar-10-adverbial-clauses',
    name: '10. Adverbial Clause Conversion (부사절 변환)',
    nameKo: '10. 부사절 변환',
    categories: [
      {
        id: 'adverbial-clause-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g10-1', input: '도착할 때', expected: 'when I arrive', direction: 'ko-en' },
          { id: 'g10-2', input: '일하는 동안', expected: 'while working', direction: 'ko-en' },
          { id: 'g10-3', input: '떠나기 전에', expected: 'before leaving', direction: 'ko-en' },
          { id: 'g10-4', input: '도착한 후에', expected: 'after arriving', direction: 'ko-en' },
          { id: 'g10-5', input: '시작한 이후로', expected: 'since starting', direction: 'ko-en' },
          { id: 'g10-6', input: '끝날 때까지', expected: 'until it ends', direction: 'ko-en' },
          {
            id: 'g10-7',
            input: '비가 오기 때문에',
            expected: 'because it rains',
            direction: 'ko-en',
          },
          { id: 'g10-8', input: '비가 오지만', expected: 'although it rains', direction: 'ko-en' },
          {
            id: 'g10-9',
            input: '볼 수 있도록',
            expected: 'so that you can see',
            direction: 'ko-en',
          },
          {
            id: 'g10-10',
            input: '너무 피곤해서 잤다',
            expected: 'so tired that I slept',
            direction: 'ko-en',
          },
          { id: 'g10-11', input: '아는 것처럼', expected: 'as if I know', direction: 'ko-en' },
          {
            id: 'g10-12',
            input: '도착하자마자',
            expected: 'as soon as I arrived',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'adverbial-clause-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g10-13', input: 'when the sun sets', expected: '해가 질 때', direction: 'en-ko' },
          {
            id: 'g10-14',
            input: 'while I was sleeping',
            expected: '내가 자는 동안',
            direction: 'en-ko',
          },
          { id: 'g10-15', input: 'before you go', expected: '네가 가기 전에', direction: 'en-ko' },
          {
            id: 'g10-16',
            input: 'after she left',
            expected: '그녀가 떠난 후에',
            direction: 'en-ko',
          },
          {
            id: 'g10-17',
            input: 'because I was tired',
            expected: '피곤했기 때문에',
            direction: 'en-ko',
          },
          {
            id: 'g10-18',
            input: 'although he tried',
            expected: '그가 노력했지만',
            direction: 'en-ko',
          },
          {
            id: 'g10-19',
            input: 'as soon as possible',
            expected: '가능한 빨리',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 11. 준동사 변환 (Verbals) - 10개 규칙
  // ========================================
  {
    id: 'grammar-11-verbals',
    name: '11. Verbal Conversion (준동사 변환)',
    nameKo: '11. 준동사 변환',
    categories: [
      {
        id: 'verbals-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g11-1',
            input: '읽는 것을 좋아한다',
            expected: 'like to read / like reading',
            direction: 'ko-en',
          },
          { id: 'g11-2', input: '읽을 책', expected: 'a book to read', direction: 'ko-en' },
          { id: 'g11-3', input: '배우려고 간다', expected: 'go to learn', direction: 'ko-en' },
          {
            id: 'g11-4',
            input: '결국 실패하게 되다',
            expected: 'only to fail',
            direction: 'ko-en',
          },
          { id: 'g11-5', input: '만나서 기뻐요', expected: 'glad to meet you', direction: 'ko-en' },
          {
            id: 'g11-6',
            input: '수영하는 것은 좋다',
            expected: 'Swimming is good',
            direction: 'ko-en',
          },
          { id: 'g11-7', input: '뛰는 소녀', expected: 'the running girl', direction: 'ko-en' },
          { id: 'g11-8', input: '깨진 창문', expected: 'the broken window', direction: 'ko-en' },
        ],
      },
      {
        id: 'verbals-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g11-9', input: 'I want to sleep', expected: '자고 싶다', direction: 'en-ko' },
          { id: 'g11-10', input: 'something to eat', expected: '먹을 것', direction: 'en-ko' },
          { id: 'g11-11', input: 'I came to help', expected: '돕기 위해 왔다', direction: 'en-ko' },
          {
            id: 'g11-12',
            input: 'I enjoy swimming',
            expected: '수영하는 것을 즐긴다',
            direction: 'en-ko',
          },
          {
            id: 'g11-13',
            input: 'by working hard',
            expected: '열심히 일함으로써',
            direction: 'en-ko',
          },
          { id: 'g11-14', input: 'the sleeping baby', expected: '자는 아기', direction: 'en-ko' },
          { id: 'g11-15', input: 'the written letter', expected: '쓴 편지', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 12. 경어법 규칙 (Honorifics) - 14개 규칙
  // ========================================
  {
    id: 'grammar-12-honorifics',
    name: '12. Honorific Rules (경어법 규칙)',
    nameKo: '12. 경어법 규칙',
    categories: [
      {
        id: 'honorifics-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g12-1', input: '갑니다', expected: 'go (formal)', direction: 'ko-en' },
          { id: 'g12-2', input: '가요', expected: 'go (polite)', direction: 'ko-en' },
          { id: 'g12-3', input: '간다', expected: 'go (plain)', direction: 'ko-en' },
          { id: 'g12-4', input: '가', expected: 'go (informal)', direction: 'ko-en' },
          { id: 'g12-5', input: '가시다', expected: 'go (honorific)', direction: 'ko-en' },
          { id: 'g12-6', input: '진지 드셨어요?', expected: 'Have you eaten?', direction: 'ko-en' },
          {
            id: 'g12-7',
            input: '말씀하셨습니다',
            expected: 'He/She said (honorific)',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'honorifics-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g12-8', input: 'Hello (formal)', expected: '안녕하십니까', direction: 'en-ko' },
          { id: 'g12-9', input: 'Hello (polite)', expected: '안녕하세요', direction: 'en-ko' },
          { id: 'g12-10', input: 'Hello (casual)', expected: '안녕', direction: 'en-ko' },
          { id: 'g12-11', input: 'Thank you (formal)', expected: '감사합니다', direction: 'en-ko' },
          { id: 'g12-12', input: 'Thank you (casual)', expected: '고마워', direction: 'en-ko' },
          { id: 'g12-13', input: 'Mr. Kim', expected: '김 씨 / 김 선생님', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 13. 조사 규칙 (Particles) - 24개 규칙
  // ========================================
  {
    id: 'grammar-13-particles',
    name: '13. Particle Rules (조사 규칙)',
    nameKo: '13. 조사 규칙',
    categories: [
      {
        id: 'particles-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g13-1', input: '나는', expected: 'I (topic)', direction: 'ko-en' },
          { id: 'g13-2', input: '내가', expected: 'I (subject)', direction: 'ko-en' },
          { id: 'g13-3', input: '책을', expected: 'book (object)', direction: 'ko-en' },
          { id: 'g13-4', input: '친구의', expected: "friend's", direction: 'ko-en' },
          { id: 'g13-5', input: '학교에', expected: 'at/to school', direction: 'ko-en' },
          { id: 'g13-6', input: '학교에서', expected: 'at school (action)', direction: 'ko-en' },
          { id: 'g13-7', input: '친구에게', expected: 'to friend', direction: 'ko-en' },
          { id: 'g13-8', input: '버스로', expected: 'by bus', direction: 'ko-en' },
          { id: 'g13-9', input: '의사로서', expected: 'as a doctor', direction: 'ko-en' },
          { id: 'g13-10', input: '친구도', expected: 'friend also', direction: 'ko-en' },
          { id: 'g13-11', input: '친구만', expected: 'only friend', direction: 'ko-en' },
          {
            id: 'g13-12',
            input: '서울까지',
            expected: 'to Seoul / until Seoul',
            direction: 'ko-en',
          },
          { id: 'g13-13', input: '아침부터', expected: 'from morning', direction: 'ko-en' },
          { id: 'g13-14', input: '날마다', expected: 'every day', direction: 'ko-en' },
          { id: 'g13-15', input: '나보다', expected: 'than me', direction: 'ko-en' },
          { id: 'g13-16', input: '새처럼', expected: 'like a bird', direction: 'ko-en' },
          { id: 'g13-17', input: '친구와', expected: 'with friend', direction: 'ko-en' },
          { id: 'g13-18', input: '커피나', expected: 'coffee or', direction: 'ko-en' },
        ],
      },
      {
        id: 'particles-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g13-19', input: 'I (subject)', expected: '내가', direction: 'en-ko' },
          { id: 'g13-20', input: 'to school', expected: '학교에', direction: 'en-ko' },
          { id: 'g13-21', input: 'from Seoul', expected: '서울에서', direction: 'en-ko' },
          { id: 'g13-22', input: 'by train', expected: '기차로', direction: 'en-ko' },
          { id: 'g13-23', input: 'with friends', expected: '친구들과', direction: 'en-ko' },
          { id: 'g13-24', input: 'only you', expected: '너만', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 14. 연결어미 규칙 (Connective Endings) - 32개 규칙
  // ========================================
  {
    id: 'grammar-14-connective-endings',
    name: '14. Connective Ending Rules (연결어미 규칙)',
    nameKo: '14. 연결어미 규칙',
    categories: [
      {
        id: 'connective-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g14-1', input: '먹고 마신다', expected: 'eat and drink', direction: 'ko-en' },
          { id: 'g14-2', input: '춥지만 간다', expected: "it's cold but I go", direction: 'ko-en' },
          {
            id: 'g14-3',
            input: '비가 오는데',
            expected: "it's raining and/but",
            direction: 'ko-en',
          },
          { id: 'g14-4', input: '먹거나 마시거나', expected: 'eat or drink', direction: 'ko-en' },
          {
            id: 'g14-5',
            input: '피곤해서 잤다',
            expected: 'I was tired so I slept',
            direction: 'ko-en',
          },
          { id: 'g14-6', input: '비가 오니까', expected: 'because it rains', direction: 'ko-en' },
          {
            id: 'g14-7',
            input: '공부하느라고',
            expected: 'because of studying',
            direction: 'ko-en',
          },
          { id: 'g14-8', input: '가면 본다', expected: 'if I go I see', direction: 'ko-en' },
          { id: 'g14-9', input: '가더라도', expected: 'even if I go', direction: 'ko-en' },
          {
            id: 'g14-10',
            input: '먹으면서 본다',
            expected: 'watch while eating',
            direction: 'ko-en',
          },
          {
            id: 'g14-11',
            input: '가다가 멈췄다',
            expected: 'stopped while going',
            direction: 'ko-en',
          },
          { id: 'g14-12', input: '배우려고 간다', expected: 'go to learn', direction: 'ko-en' },
        ],
      },
      {
        id: 'connective-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g14-13', input: 'eat and sleep', expected: '먹고 자다', direction: 'en-ko' },
          { id: 'g14-14', input: 'hot but nice', expected: '덥지만 좋다', direction: 'en-ko' },
          { id: 'g14-15', input: 'study or play', expected: '공부하거나 놀다', direction: 'en-ko' },
          { id: 'g14-16', input: 'because I love', expected: '사랑하니까', direction: 'en-ko' },
          { id: 'g14-17', input: 'if you study', expected: '공부하면', direction: 'en-ko' },
          { id: 'g14-18', input: 'even if it hurts', expected: '아프더라도', direction: 'en-ko' },
          { id: 'g14-19', input: 'while watching', expected: '보면서', direction: 'en-ko' },
          { id: 'g14-20', input: 'in order to buy', expected: '사려고', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 15. 종결어미 규칙 (Final Endings) - 50개 규칙
  // ========================================
  {
    id: 'grammar-15-final-endings',
    name: '15. Final Ending Rules (종결어미 규칙)',
    nameKo: '15. 종결어미 규칙',
    categories: [
      {
        id: 'final-endings-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g15-1', input: '갑니다', expected: 'I go (formal polite)', direction: 'ko-en' },
          { id: 'g15-2', input: '가요', expected: 'I go (polite)', direction: 'ko-en' },
          { id: 'g15-3', input: '간다', expected: 'I go (plain)', direction: 'ko-en' },
          { id: 'g15-4', input: '가', expected: 'I go (informal)', direction: 'ko-en' },
          { id: 'g15-5', input: '갑니까?', expected: 'Do you go? (formal)', direction: 'ko-en' },
          { id: 'g15-6', input: '가세요', expected: 'Please go', direction: 'ko-en' },
          { id: 'g15-7', input: '가라', expected: 'Go! (command)', direction: 'ko-en' },
          { id: 'g15-8', input: '갑시다', expected: "Let's go (formal)", direction: 'ko-en' },
          { id: 'g15-9', input: '가자', expected: "Let's go (casual)", direction: 'ko-en' },
          { id: 'g15-10', input: '가는구나', expected: 'Oh, you are going', direction: 'ko-en' },
          { id: 'g15-11', input: '가지', expected: "I go, don't I?", direction: 'ko-en' },
          { id: 'g15-12', input: '가잖아', expected: 'You know I go', direction: 'ko-en' },
          { id: 'g15-13', input: '갈게', expected: 'I will go (promise)', direction: 'ko-en' },
          { id: 'g15-14', input: '갈래?', expected: 'Want to go?', direction: 'ko-en' },
          { id: 'g15-15', input: '갈까?', expected: 'Shall we go?', direction: 'ko-en' },
          { id: 'g15-16', input: '가더라', expected: 'I saw that they go', direction: 'ko-en' },
        ],
      },
      {
        id: 'final-endings-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g15-17', input: 'I eat (formal)', expected: '먹습니다', direction: 'en-ko' },
          { id: 'g15-18', input: 'I eat (polite)', expected: '먹어요', direction: 'en-ko' },
          { id: 'g15-19', input: 'I eat (casual)', expected: '먹어', direction: 'en-ko' },
          {
            id: 'g15-20',
            input: 'Do you eat? (formal)',
            expected: '드십니까?',
            direction: 'en-ko',
          },
          { id: 'g15-21', input: 'Please eat', expected: '드세요', direction: 'en-ko' },
          { id: 'g15-22', input: 'Eat! (command)', expected: '먹어라', direction: 'en-ko' },
          { id: 'g15-23', input: "Let's eat", expected: '먹자', direction: 'en-ko' },
          { id: 'g15-24', input: 'Want to eat?', expected: '먹을래?', direction: 'en-ko' },
          { id: 'g15-25', input: 'Shall we eat?', expected: '먹을까?', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 16. 관형형 어미 규칙 (Adnominal Endings) - 8개 규칙
  // ========================================
  {
    id: 'grammar-16-adnominal-endings',
    name: '16. Adnominal Ending Rules (관형형 어미 규칙)',
    nameKo: '16. 관형형 어미 규칙',
    categories: [
      {
        id: 'adnominal-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g16-1', input: '가는 사람', expected: 'a person who goes', direction: 'ko-en' },
          { id: 'g16-2', input: '간 사람', expected: 'a person who went', direction: 'ko-en' },
          { id: 'g16-3', input: '갈 사람', expected: 'a person who will go', direction: 'ko-en' },
          {
            id: 'g16-4',
            input: '가던 사람',
            expected: 'a person who used to go',
            direction: 'ko-en',
          },
          { id: 'g16-5', input: '예쁜 꽃', expected: 'a beautiful flower', direction: 'ko-en' },
          { id: 'g16-6', input: '읽을 책', expected: 'a book to read', direction: 'ko-en' },
          {
            id: 'g16-7',
            input: '간다는 말',
            expected: 'the word that (someone) goes',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'adnominal-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g16-8', input: 'a person who runs', expected: '뛰는 사람', direction: 'en-ko' },
          { id: 'g16-9', input: 'food that I ate', expected: '먹은 음식', direction: 'en-ko' },
          { id: 'g16-10', input: 'work to do', expected: '할 일', direction: 'en-ko' },
          { id: 'g16-11', input: 'a tall building', expected: '높은 건물', direction: 'en-ko' },
          {
            id: 'g16-12',
            input: 'the song I used to sing',
            expected: '부르던 노래',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 17. 명사형 어미 규칙 (Nominalizing Endings) - 6개 규칙
  // ========================================
  {
    id: 'grammar-17-nominalizing-endings',
    name: '17. Nominalizing Ending Rules (명사형 어미 규칙)',
    nameKo: '17. 명사형 어미 규칙',
    categories: [
      {
        id: 'nominalizing-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g17-1',
            input: '읽기가 어렵다',
            expected: 'Reading is difficult',
            direction: 'ko-en',
          },
          {
            id: 'g17-2',
            input: '그가 왔음을 알았다',
            expected: 'I knew that he came',
            direction: 'ko-en',
          },
          { id: 'g17-3', input: '가는 것이 좋다', expected: 'Going is good', direction: 'ko-en' },
          {
            id: 'g17-4',
            input: '한 것을 후회했다',
            expected: 'I regretted what I did',
            direction: 'ko-en',
          },
          { id: 'g17-5', input: '가기로 했다', expected: 'I decided to go', direction: 'ko-en' },
        ],
      },
      {
        id: 'nominalizing-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g17-6',
            input: 'Swimming is fun',
            expected: '수영하기는 재밌다',
            direction: 'en-ko',
          },
          {
            id: 'g17-7',
            input: 'I know that he left',
            expected: '그가 떠났음을 안다',
            direction: 'en-ko',
          },
          {
            id: 'g17-8',
            input: 'What I want is peace',
            expected: '내가 원하는 것은 평화다',
            direction: 'en-ko',
          },
          {
            id: 'g17-9',
            input: 'I decided to study',
            expected: '공부하기로 했다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 18. 선어말어미 규칙 (Pre-final Endings) - 6개 규칙
  // ========================================
  {
    id: 'grammar-18-pre-final-endings',
    name: '18. Pre-final Ending Rules (선어말어미 규칙)',
    nameKo: '18. 선어말어미 규칙',
    categories: [
      {
        id: 'pre-final-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g18-1', input: '가시다', expected: 'go (honorific)', direction: 'ko-en' },
          { id: 'g18-2', input: '갔다', expected: 'went', direction: 'ko-en' },
          { id: 'g18-3', input: '가겠다', expected: 'will go / would go', direction: 'ko-en' },
          {
            id: 'g18-4',
            input: '가더라',
            expected: 'I saw that (someone) went',
            direction: 'ko-en',
          },
          { id: 'g18-5', input: '갔었다', expected: 'had gone', direction: 'ko-en' },
          { id: 'g18-6', input: '가셨다', expected: 'went (honorific)', direction: 'ko-en' },
        ],
      },
      {
        id: 'pre-final-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g18-7', input: 'He goes (honorific)', expected: '가십니다', direction: 'en-ko' },
          { id: 'g18-8', input: 'I went', expected: '갔다', direction: 'en-ko' },
          { id: 'g18-9', input: 'I would eat', expected: '먹겠다', direction: 'en-ko' },
          { id: 'g18-10', input: 'She had eaten', expected: '먹었었다', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 19. 불규칙 활용 규칙 (Irregular Conjugation) - 11개 규칙
  // ========================================
  {
    id: 'grammar-19-irregular-conjugation',
    name: '19. Irregular Conjugation Rules (불규칙 활용 규칙)',
    nameKo: '19. 불규칙 활용 규칙',
    categories: [
      {
        id: 'irregular-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g19-1', input: '들어요', expected: 'hear/listen', direction: 'ko-en' },
          { id: 'g19-2', input: '추워요', expected: "it's cold", direction: 'ko-en' },
          { id: 'g19-3', input: '지어요', expected: 'build', direction: 'ko-en' },
          { id: 'g19-4', input: '빨개요', expected: "it's red", direction: 'ko-en' },
          { id: 'g19-5', input: '몰라요', expected: "don't know", direction: 'ko-en' },
          { id: 'g19-6', input: '사는', expected: 'who lives', direction: 'ko-en' },
          { id: 'g19-7', input: '써요', expected: 'write/use', direction: 'ko-en' },
          { id: 'g19-8', input: '해요', expected: 'do', direction: 'ko-en' },
        ],
      },
      {
        id: 'irregular-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g19-9', input: 'I listen', expected: '들어요', direction: 'en-ko' },
          { id: 'g19-10', input: "It's cold", expected: '추워요', direction: 'en-ko' },
          { id: 'g19-11', input: 'I build', expected: '지어요', direction: 'en-ko' },
          { id: 'g19-12', input: "It's white", expected: '하얘요', direction: 'en-ko' },
          { id: 'g19-13', input: 'I call', expected: '불러요', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 20. 음운 규칙 (Phonological Rules) - 12개 규칙
  // ========================================
  {
    id: 'grammar-20-phonological-rules',
    name: '20. Phonological Rules (음운 규칙)',
    nameKo: '20. 음운 규칙',
    categories: [
      {
        id: 'phonological-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g20-1',
            input: '가아 → 가',
            expected: 'ga (vowel contraction)',
            direction: 'ko-en',
          },
          {
            id: 'g20-2',
            input: '오아 → 와',
            expected: 'wa (vowel contraction)',
            direction: 'ko-en',
          },
          {
            id: 'g20-3',
            input: '주어 → 줘',
            expected: 'jwo (vowel contraction)',
            direction: 'ko-en',
          },
          { id: 'g20-4', input: '기다려', expected: 'wait', direction: 'ko-en' },
          { id: 'g20-5', input: '써', expected: 'write', direction: 'ko-en' },
          {
            id: 'g20-6',
            input: '같이 [가치]',
            expected: 'together (palatalization)',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'phonological-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g20-7', input: 'I go (가+아)', expected: '가 (contracted)', direction: 'en-ko' },
          { id: 'g20-8', input: 'give (주+어)', expected: '줘', direction: 'en-ko' },
          { id: 'g20-9', input: 'wait (기다리+어)', expected: '기다려', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 21. 어순 변환 (Word Order) - 8개 규칙
  // ========================================
  {
    id: 'grammar-21-word-order',
    name: '21. Word Order Conversion (어순 변환)',
    nameKo: '21. 어순 변환',
    categories: [
      {
        id: 'word-order-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g21-1',
            input: '나는 밥을 먹는다 (SOV)',
            expected: 'I eat rice (SVO)',
            direction: 'ko-en',
          },
          { id: 'g21-2', input: '예쁜 꽃', expected: 'beautiful flower', direction: 'ko-en' },
          { id: 'g21-3', input: '한국에서', expected: 'in Korea', direction: 'ko-en' },
          { id: 'g21-4', input: '뛰는 소년', expected: 'the boy who runs', direction: 'ko-en' },
          {
            id: 'g21-5',
            input: '코끼리는 코가 길다',
            expected: "The elephant's trunk is long",
            direction: 'ko-en',
          },
          { id: 'g21-6', input: '안 먹는다', expected: "don't eat", direction: 'ko-en' },
          {
            id: 'g21-7',
            input: '어디 가니?',
            expected: 'Where are you going?',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'word-order-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g21-8',
            input: 'She reads books (SVO)',
            expected: '그녀는 책을 읽는다 (SOV)',
            direction: 'en-ko',
          },
          { id: 'g21-9', input: 'in the park', expected: '공원에서', direction: 'en-ko' },
          {
            id: 'g21-10',
            input: 'the woman who sings',
            expected: '노래하는 여자',
            direction: 'en-ko',
          },
          { id: 'g21-11', input: "don't run", expected: '안 뛴다', direction: 'en-ko' },
          { id: 'g21-12', input: 'What did you eat?', expected: '뭐 먹었어?', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 22. 보조용언 규칙 (Auxiliary Predicates) - 26개 규칙
  // ========================================
  {
    id: 'grammar-22-auxiliary-predicates',
    name: '22. Auxiliary Predicate Rules (보조용언 규칙)',
    nameKo: '22. 보조용언 규칙',
    categories: [
      {
        id: 'auxiliary-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g22-1', input: '가고 싶다', expected: 'want to go', direction: 'ko-en' },
          { id: 'g22-2', input: '가 보다', expected: 'try going', direction: 'ko-en' },
          {
            id: 'g22-3',
            input: '먹어 버리다',
            expected: 'eat up (completely)',
            direction: 'ko-en',
          },
          { id: 'g22-4', input: '해 내다', expected: 'accomplish', direction: 'ko-en' },
          {
            id: 'g22-5',
            input: '써 놓다',
            expected: 'have written (and left)',
            direction: 'ko-en',
          },
          { id: 'g22-6', input: '해 주다', expected: 'do for (someone)', direction: 'ko-en' },
          { id: 'g22-7', input: '해 드리다', expected: 'do for (honorific)', direction: 'ko-en' },
          { id: 'g22-8', input: '하면 안 되다', expected: 'must not do', direction: 'ko-en' },
          { id: 'g22-9', input: '해도 되다', expected: 'may do', direction: 'ko-en' },
          { id: 'g22-10', input: '하는 것 같다', expected: 'seem to do', direction: 'ko-en' },
          { id: 'g22-11', input: '하기 시작하다', expected: 'start to do', direction: 'ko-en' },
          { id: 'g22-12', input: '할 줄 알다', expected: 'know how to do', direction: 'ko-en' },
          { id: 'g22-13', input: '하는 편이다', expected: 'tend to do', direction: 'ko-en' },
        ],
      },
      {
        id: 'auxiliary-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g22-14', input: 'want to eat', expected: '먹고 싶다', direction: 'en-ko' },
          { id: 'g22-15', input: 'try doing', expected: '해 보다', direction: 'en-ko' },
          { id: 'g22-16', input: 'finish eating', expected: '다 먹어 버리다', direction: 'en-ko' },
          { id: 'g22-17', input: 'do for you', expected: '해 줄게', direction: 'en-ko' },
          { id: 'g22-18', input: 'must not go', expected: '가면 안 돼', direction: 'en-ko' },
          { id: 'g22-19', input: 'may leave', expected: '가도 돼', direction: 'en-ko' },
          {
            id: 'g22-20',
            input: 'know how to swim',
            expected: '수영할 줄 알다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 23. 추측/추정 표현 (Conjecture) - 10개 규칙
  // ========================================
  {
    id: 'grammar-23-conjecture',
    name: '23. Conjecture Expressions (추측/추정 표현)',
    nameKo: '23. 추측/추정 표현',
    categories: [
      {
        id: 'conjecture-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g23-1', input: '갈 것 같다', expected: 'probably will go', direction: 'ko-en' },
          { id: 'g23-2', input: '아픈가 보다', expected: 'seems to be sick', direction: 'ko-en' },
          {
            id: 'g23-3',
            input: '바쁜 모양이다',
            expected: 'appears to be busy',
            direction: 'ko-en',
          },
          { id: 'g23-4', input: '올 듯하다', expected: 'seems like coming', direction: 'ko-en' },
          {
            id: 'g23-5',
            input: '맞나 싶다',
            expected: 'I guess it might be right',
            direction: 'ko-en',
          },
          { id: 'g23-6', input: '틀림없이 그렇다', expected: 'must be so', direction: 'ko-en' },
          {
            id: 'g23-7',
            input: '왔을지도 모른다',
            expected: 'might have come',
            direction: 'ko-en',
          },
          {
            id: 'g23-8',
            input: '갔다고 하다',
            expected: 'I heard that (someone) went',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'conjecture-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g23-9',
            input: 'probably true',
            expected: '아마 맞을 것 같다',
            direction: 'en-ko',
          },
          { id: 'g23-10', input: 'seems tired', expected: '피곤한가 보다', direction: 'en-ko' },
          { id: 'g23-11', input: 'appears happy', expected: '행복한 모양이다', direction: 'en-ko' },
          { id: 'g23-12', input: 'must be correct', expected: '틀림없이 맞다', direction: 'en-ko' },
          {
            id: 'g23-13',
            input: 'might have left',
            expected: '떠났을지도 모른다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 24. 인용 표현 (Quotation) - 14개 규칙
  // ========================================
  {
    id: 'grammar-24-quotation',
    name: '24. Quotation Expressions (인용 표현)',
    nameKo: '24. 인용 표현',
    categories: [
      {
        id: 'quotation-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g24-1',
            input: '간다고 했다',
            expected: 'said that (someone) goes',
            direction: 'ko-en',
          },
          {
            id: 'g24-2',
            input: '가냐고 물었다',
            expected: 'asked if (someone) goes',
            direction: 'ko-en',
          },
          {
            id: 'g24-3',
            input: '가라고 했다',
            expected: 'told (someone) to go',
            direction: 'ko-en',
          },
          { id: 'g24-4', input: '가자고 했다', expected: 'suggested going', direction: 'ko-en' },
          {
            id: 'g24-5',
            input: '간대',
            expected: 'he/she says (someone) goes',
            direction: 'ko-en',
          },
          {
            id: 'g24-6',
            input: '가냬',
            expected: 'he/she asks if (someone) goes',
            direction: 'ko-en',
          },
          { id: 'g24-7', input: '가래', expected: 'he/she says to go', direction: 'ko-en' },
        ],
      },
      {
        id: 'quotation-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          {
            id: 'g24-8',
            input: 'He said he would come',
            expected: '온다고 했다',
            direction: 'en-ko',
          },
          {
            id: 'g24-9',
            input: 'She asked if I was busy',
            expected: '바쁘냐고 물었다',
            direction: 'en-ko',
          },
          {
            id: 'g24-10',
            input: 'He told me to study',
            expected: '공부하라고 했다',
            direction: 'en-ko',
          },
          {
            id: 'g24-11',
            input: 'She suggested eating',
            expected: '먹자고 했다',
            direction: 'en-ko',
          },
          {
            id: 'g24-12',
            input: 'I heard that he left',
            expected: '떠났다고 들었다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 25. 시간 표현 (Time Expressions) - 10개 규칙
  // ========================================
  {
    id: 'grammar-25-time-expressions',
    name: '25. Time Expressions (시간 표현)',
    nameKo: '25. 시간 표현',
    categories: [
      {
        id: 'time-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g25-1',
            input: '온 지 3년 됐다',
            expected: "It's been 3 years since I came",
            direction: 'ko-en',
          },
          { id: 'g25-2', input: '먹은 후에', expected: 'after eating', direction: 'ko-en' },
          { id: 'g25-3', input: '가기 전에', expected: 'before going', direction: 'ko-en' },
          {
            id: 'g25-4',
            input: '올 때까지',
            expected: 'until (someone) comes',
            direction: 'ko-en',
          },
          { id: 'g25-5', input: '볼 때마다', expected: 'whenever I see', direction: 'ko-en' },
          {
            id: 'g25-6',
            input: '도착하자마자',
            expected: 'as soon as I arrived',
            direction: 'ko-en',
          },
          { id: 'g25-7', input: '일하는 동안', expected: 'while working', direction: 'ko-en' },
        ],
      },
      {
        id: 'time-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g25-8', input: 'since last year', expected: '작년 이후로', direction: 'en-ko' },
          { id: 'g25-9', input: 'after finishing', expected: '끝난 후에', direction: 'en-ko' },
          { id: 'g25-10', input: 'before leaving', expected: '떠나기 전에', direction: 'en-ko' },
          { id: 'g25-11', input: 'until tomorrow', expected: '내일까지', direction: 'en-ko' },
          { id: 'g25-12', input: 'every time I meet', expected: '만날 때마다', direction: 'en-ko' },
          {
            id: 'g25-13',
            input: 'as soon as possible',
            expected: '가능한 빨리',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 26. 의존명사 구문 (Bound Noun Constructions) - 16개 규칙
  // ========================================
  {
    id: 'grammar-26-bound-nouns',
    name: '26. Bound Noun Constructions (의존명사 구문)',
    nameKo: '26. 의존명사 구문',
    categories: [
      {
        id: 'bound-nouns-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g26-1', input: '할 수 있다', expected: 'can do', direction: 'ko-en' },
          { id: 'g26-2', input: '할 줄 알다', expected: 'know how to do', direction: 'ko-en' },
          { id: 'g26-3', input: '갈 뿐이다', expected: 'only go', direction: 'ko-en' },
          { id: 'g26-4', input: '간 적 있다', expected: 'have been', direction: 'ko-en' },
          { id: 'g26-5', input: '할 생각이다', expected: 'intend to do', direction: 'ko-en' },
          { id: 'g26-6', input: '갈 예정이다', expected: 'plan to go', direction: 'ko-en' },
          { id: 'g26-7', input: '볼 만하다', expected: 'worth seeing', direction: 'ko-en' },
          { id: 'g26-8', input: '할 필요가 있다', expected: 'need to do', direction: 'ko-en' },
          { id: 'g26-9', input: '갈 이유', expected: 'reason to go', direction: 'ko-en' },
          {
            id: 'g26-10',
            input: '할 줄 모르다',
            expected: "don't know how to do",
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'bound-nouns-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g26-11', input: 'able to swim', expected: '수영할 수 있다', direction: 'en-ko' },
          {
            id: 'g26-12',
            input: 'know how to cook',
            expected: '요리할 줄 알다',
            direction: 'en-ko',
          },
          {
            id: 'g26-13',
            input: 'have been to Korea',
            expected: '한국에 간 적 있다',
            direction: 'en-ko',
          },
          {
            id: 'g26-14',
            input: 'plan to travel',
            expected: '여행할 예정이다',
            direction: 'en-ko',
          },
          { id: 'g26-15', input: 'worth reading', expected: '읽을 만하다', direction: 'en-ko' },
          { id: 'g26-16', input: 'need to rest', expected: '쉴 필요가 있다', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 27. 접속사/접속부사 대응 (Conjunctions) - 14개 규칙
  // ========================================
  {
    id: 'grammar-27-conjunctions',
    name: '27. Conjunction Correspondence (접속사 대응)',
    nameKo: '27. 접속사 대응',
    categories: [
      {
        id: 'conjunctions-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g27-1', input: '그리고', expected: 'and', direction: 'ko-en' },
          { id: 'g27-2', input: '그러나', expected: 'but/however', direction: 'ko-en' },
          { id: 'g27-3', input: '그래서', expected: 'so', direction: 'ko-en' },
          { id: 'g27-4', input: '왜냐하면', expected: 'because', direction: 'ko-en' },
          { id: 'g27-5', input: '또는', expected: 'or', direction: 'ko-en' },
          { id: 'g27-6', input: '만약', expected: 'if', direction: 'ko-en' },
          { id: 'g27-7', input: '따라서', expected: 'therefore', direction: 'ko-en' },
          { id: 'g27-8', input: '게다가', expected: 'moreover', direction: 'ko-en' },
          { id: 'g27-9', input: '그렇지 않으면', expected: 'otherwise', direction: 'ko-en' },
          { id: 'g27-10', input: '한편', expected: 'meanwhile', direction: 'ko-en' },
          { id: 'g27-11', input: '대신에', expected: 'instead', direction: 'ko-en' },
        ],
      },
      {
        id: 'conjunctions-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g27-12', input: 'and', expected: '그리고', direction: 'en-ko' },
          { id: 'g27-13', input: 'but', expected: '그러나/하지만', direction: 'en-ko' },
          { id: 'g27-14', input: 'so', expected: '그래서', direction: 'en-ko' },
          { id: 'g27-15', input: 'because', expected: '왜냐하면', direction: 'en-ko' },
          { id: 'g27-16', input: 'or', expected: '또는', direction: 'en-ko' },
          { id: 'g27-17', input: 'if', expected: '만약', direction: 'en-ko' },
          { id: 'g27-18', input: 'therefore', expected: '따라서', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 28. 수량 표현 (Quantifiers) - 10개 규칙
  // ========================================
  {
    id: 'grammar-28-quantifiers',
    name: '28. Quantifier Expressions (수량 표현)',
    nameKo: '28. 수량 표현',
    categories: [
      {
        id: 'quantifiers-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g28-1', input: '사과 세 개', expected: 'three apples', direction: 'ko-en' },
          { id: 'g28-2', input: '몇몇 사람', expected: 'some people', direction: 'ko-en' },
          { id: 'g28-3', input: '조금의 물', expected: 'some water', direction: 'ko-en' },
          { id: 'g28-4', input: '많은 책', expected: 'many books', direction: 'ko-en' },
          { id: 'g28-5', input: '거의 없는', expected: 'few/little', direction: 'ko-en' },
          { id: 'g28-6', input: '몇 개의', expected: 'a few', direction: 'ko-en' },
          {
            id: 'g28-7',
            input: '모든 사람',
            expected: 'all people / everyone',
            direction: 'ko-en',
          },
          { id: 'g28-8', input: '각 학생', expected: 'each student', direction: 'ko-en' },
        ],
      },
      {
        id: 'quantifiers-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g28-9', input: 'five cats', expected: '고양이 다섯 마리', direction: 'en-ko' },
          { id: 'g28-10', input: 'some food', expected: '약간의 음식', direction: 'en-ko' },
          { id: 'g28-11', input: 'many students', expected: '많은 학생', direction: 'en-ko' },
          { id: 'g28-12', input: 'a few days', expected: '며칠', direction: 'en-ko' },
          { id: 'g28-13', input: 'every morning', expected: '매일 아침', direction: 'en-ko' },
          { id: 'g28-14', input: 'each time', expected: '매번', direction: 'en-ko' },
        ],
      },
    ],
  },

  // ========================================
  // 29. 기타 구문 규칙 (Other Constructions) - 10개 규칙
  // ========================================
  {
    id: 'grammar-29-other-constructions',
    name: '29. Other Constructions (기타 구문 규칙)',
    nameKo: '29. 기타 구문 규칙',
    categories: [
      {
        id: 'other-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          { id: 'g29-1', input: '책이 있다', expected: 'There is a book', direction: 'ko-en' },
          {
            id: 'g29-2',
            input: '탁자 위에 책이 있다',
            expected: 'There is a book on the table',
            direction: 'ko-en',
          },
          {
            id: 'g29-3',
            input: '배우기가 어렵다',
            expected: 'It is difficult to learn',
            direction: 'ko-en',
          },
          {
            id: 'g29-4',
            input: '그녀에게 책을 주었다',
            expected: 'I gave her a book',
            direction: 'ko-en',
          },
          { id: 'g29-5', input: '나로서는', expected: 'as for me', direction: 'ko-en' },
          {
            id: 'g29-6',
            input: '간 것은 그였다',
            expected: 'It was he who went',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'other-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g29-7', input: 'There is a cat', expected: '고양이가 있다', direction: 'en-ko' },
          { id: 'g29-8', input: 'It is easy to read', expected: '읽기가 쉽다', direction: 'en-ko' },
          {
            id: 'g29-9',
            input: 'I gave him money',
            expected: '그에게 돈을 주었다',
            direction: 'en-ko',
          },
          { id: 'g29-10', input: 'As for this', expected: '이것은', direction: 'en-ko' },
          {
            id: 'g29-11',
            input: 'It was she who called',
            expected: '전화한 것은 그녀였다',
            direction: 'en-ko',
          },
        ],
      },
    ],
  },

  // ========================================
  // 30. 영어 불규칙 동사 (English Irregular Verbs) - 3개 규칙
  // ========================================
  {
    id: 'grammar-30-english-irregular-verbs',
    name: '30. English Irregular Verbs (영어 불규칙 동사)',
    nameKo: '30. 영어 불규칙 동사',
    categories: [
      {
        id: 'irregular-verbs-ko-en',
        name: 'Korean → English',
        nameKo: '한국어 → 영어',
        tests: [
          {
            id: 'g30-1',
            input: '갔다 (go-went-gone)',
            expected: 'went/gone (ABC type)',
            direction: 'ko-en',
          },
          {
            id: 'g30-2',
            input: '샀다 (buy-bought-bought)',
            expected: 'bought (ABB type)',
            direction: 'ko-en',
          },
          {
            id: 'g30-3',
            input: '자르다 (cut-cut-cut)',
            expected: 'cut (AAA type)',
            direction: 'ko-en',
          },
        ],
      },
      {
        id: 'irregular-verbs-en-ko',
        name: 'English → Korean',
        nameKo: '영어 → 한국어',
        tests: [
          { id: 'g30-4', input: 'go-went-gone', expected: '가다-갔다-간', direction: 'en-ko' },
          { id: 'g30-5', input: 'see-saw-seen', expected: '보다-봤다-본', direction: 'en-ko' },
          { id: 'g30-6', input: 'buy-bought-bought', expected: '사다-샀다-산', direction: 'en-ko' },
          {
            id: 'g30-7',
            input: 'make-made-made',
            expected: '만들다-만들었다-만든',
            direction: 'en-ko',
          },
          { id: 'g30-8', input: 'put-put-put', expected: '놓다-놓았다-놓은', direction: 'en-ko' },
        ],
      },
    ],
  },
];
