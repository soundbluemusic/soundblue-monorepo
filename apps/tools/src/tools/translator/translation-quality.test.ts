/**
 * 번역 품질 종합 테스트
 * Translation Quality Comprehensive Test Suite
 * Korean ↔ English
 */

import { describe, it } from 'vitest';
import { translate } from './translator-service';

// 점수 기록용 변수들
const scores: {
  category: string;
  subcategory: string;
  input: string;
  expected: string;
  actual: string;
  score: number;
}[] = [];

function recordScore(
  category: string,
  subcategory: string,
  input: string,
  expected: string,
  actual: string,
  score: number
) {
  scores.push({ category, subcategory, input, expected, actual, score });
}

// 점수 평가 함수 (1-5점)
function evaluateScore(actual: string, expected: string): number {
  const actualLower = actual.toLowerCase().trim();
  const expectedLower = expected.toLowerCase().trim();

  // 완벽히 일치
  if (actualLower === expectedLower) return 5;

  // 핵심 단어들 포함 확인
  const expectedWords = expectedLower.split(/\s+/).filter((w) => w.length > 2);
  const matchedWords = expectedWords.filter((w) => actualLower.includes(w));
  const matchRatio = matchedWords.length / expectedWords.length;

  if (matchRatio >= 0.8) return 4;
  if (matchRatio >= 0.5) return 3;
  if (matchRatio >= 0.2) return 2;
  return 1;
}

// ===========================================
// PHASE 1: 한국어 → 영어
// ===========================================

describe('PHASE 1: 한국어 → 영어', () => {
  // 1.1.1 동음이의어 (Homonyms)
  describe('1.1.1 동음이의어 (Homonyms)', () => {
    const tests = [
      { ko: '배가 고파서 배를 먹으며 배를 탔다', en: 'I was hungry, ate a pear, and rode a boat' },
      { ko: '눈이 내려서 눈을 감았다', en: 'It was snowing, so I closed my eyes' },
      {
        ko: '밤에 밤을 줍다가 밤새 걸렸다',
        en: 'At night, I picked chestnuts and it took all night',
      },
      {
        ko: '차에서 차를 마시며 차이를 느꼈다',
        en: 'Drinking tea in the car, I felt the difference',
      },
      {
        ko: '말을 타고 가면서 말을 했는데 말이 안 통했다',
        en: "While riding a horse, I spoke, but the words didn't get through",
      },
      { ko: '사과를 먹으며 사과했다', en: 'I apologized while eating an apple' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.1 단어 수준', '1.1.1 동음이의어', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.1.2 다의어 (Polysemy)
  describe('1.1.2 다의어 (Polysemy)', () => {
    const tests = [
      { ko: '물고기를 잡다', en: 'catch fish' },
      { ko: '택시를 잡다', en: 'hail a taxi' },
      { ko: '밥을 먹다', en: 'eat rice' },
      { ko: '나이를 먹다', en: 'get older' },
      { ko: '버스를 타다', en: 'ride a bus' },
      { ko: '피아노를 타다', en: 'play piano' },
      { ko: '물에 빠지다', en: 'fall into water' },
      { ko: '사랑에 빠지다', en: 'fall in love' },
      { ko: '줄을 끊다', en: 'cut a rope' },
      { ko: '담배를 끊다', en: 'quit smoking' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.1 단어 수준', '1.1.2 다의어', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.1.3 의성어/의태어
  describe('1.1.3 의성어/의태어', () => {
    const tests = [
      { ko: '찌개가 보글보글 끓는다', en: 'The stew is bubbling' },
      { ko: '유리가 쨍그랑 깨졌다', en: 'The glass shattered' },
      { ko: '아기가 아장아장 걷는다', en: 'The baby toddles' },
      { ko: '그녀는 싱글벙글 웃고 있다', en: 'She is grinning broadly' },
      { ko: '심장이 두근두근 뛴다', en: 'My heart is pounding' },
      { ko: '별이 반짝반짝 빛난다', en: 'Stars twinkle brightly' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.1 단어 수준', '1.1.3 의성어/의태어', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.1.4 신조어 및 외래어
  describe('1.1.4 신조어 및 외래어', () => {
    const tests = [
      { ko: '그의 행동은 완전 내로남불이다', en: 'His behavior is total hypocrisy' },
      { ko: '오늘 점심은 혼밥했어요', en: 'I had lunch alone today' },
      { ko: '그 말 한마디에 갑분싸가 됐다', en: 'That one comment killed the mood' },
      { ko: '이 영화 진짜 꿀잼이야', en: 'This movie is so much fun' },
      { ko: '그녀는 완전 핵인싸야', en: 'She is super popular' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.1 단어 수준', '1.1.4 신조어', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.2.1 존칭 체계
  describe('1.2.1 존칭 체계', () => {
    const tests = [
      { ko: '회의에 참석해 주시기 바랍니다', en: 'We kindly request your attendance' },
      { ko: '회의에 참석해 주세요', en: 'Please attend the meeting' },
      { ko: '회의에 참석해라', en: 'Attend the meeting' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.2 문장 수준', '1.2.1 존칭 체계', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.2.2 주어 생략
  describe('1.2.2 주어 생략', () => {
    const tests = [
      { ko: '밥 먹었어?', en: 'Have you eaten?' },
      { ko: '어디 가?', en: 'Where are you going?' },
      { ko: '비가 와서 못 갔어', en: "I couldn't go because it was raining" },
      { ko: '맛있겠다', en: 'That looks delicious' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.2 문장 수준', '1.2.2 주어 생략', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.2.3 어순 차이 (SOV → SVO)
  describe('1.2.3 어순 차이 (SOV → SVO)', () => {
    const tests = [
      { ko: '나는 어제 도서관에서 친구를 만났다', en: 'I met my friend at the library yesterday' },
      { ko: '엄마가 나에게 선물을 주셨다', en: 'Mom gave me a gift' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.2 문장 수준', '1.2.3 어순 차이', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.2.4 시제 및 상
  describe('1.2.4 시제 및 상', () => {
    const tests = [
      { ko: '밥을 먹고 있어요', en: 'I am eating' },
      { ko: '밥을 먹었어요', en: 'I ate' },
      { ko: '내일 밥을 먹을 거예요', en: 'I will eat tomorrow' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.2 문장 수준', '1.2.4 시제', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 1.3.1 관용구 및 속담
  describe('1.3.1 관용구 및 속담', () => {
    const tests = [
      { ko: '소 잃고 외양간 고친다', en: 'Locking the barn door after the horse has bolted' },
      { ko: '눈 코 뜰 새 없다', en: 'To be swamped' },
      { ko: '식은 죽 먹기', en: 'A piece of cake' },
      { ko: '뛰는 놈 위에 나는 놈 있다', en: "There's always a bigger fish" },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('1.3 문맥 수준', '1.3.1 관용구/속담', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });
});

// ===========================================
// PHASE 2: 영어 → 한국어
// ===========================================

describe('PHASE 2: 영어 → 한국어', () => {
  // 2.1.1 영어 다의어
  describe('2.1.1 영어 다의어', () => {
    const tests = [
      { en: 'I run every morning', ko: '나는 매일 아침 달린다' },
      { en: 'I run a business', ko: '나는 사업을 운영한다' },
      { en: 'I got a gift', ko: '나는 선물을 받았다' },
      { en: 'I got angry', ko: '나는 화가 났다' },
    ];

    for (const test of tests) {
      it(`${test.en}`, () => {
        const result = translate(test.en, 'en-ko');
        const score = evaluateScore(result, test.ko);
        recordScore('2.1 단어 수준', '2.1.1 영어 다의어', test.en, test.ko, result, score);
        console.log(`[EN] ${test.en}`);
        console.log(`[Expected] ${test.ko}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 2.1.2 구동사
  describe('2.1.2 구동사 (Phrasal Verbs)', () => {
    const tests = [
      { en: 'Look up the word in the dictionary', ko: '그 단어를 사전에서 찾아봐' },
      { en: "Don't put off the meeting", ko: '회의를 미루지 마' },
      { en: 'She turned down the job offer', ko: '그녀는 취업 제안을 거절했다' },
      { en: 'Never give up on your dreams', ko: '꿈을 절대 포기하지 마' },
    ];

    for (const test of tests) {
      it(`${test.en}`, () => {
        const result = translate(test.en, 'en-ko');
        const score = evaluateScore(result, test.ko);
        recordScore('2.1 단어 수준', '2.1.2 구동사', test.en, test.ko, result, score);
        console.log(`[EN] ${test.en}`);
        console.log(`[Expected] ${test.ko}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 2.1.3 영어 관용구
  describe('2.1.3 영어 관용구', () => {
    const tests = [
      { en: "It's raining cats and dogs", ko: '비가 억수같이 쏟아진다' },
      { en: 'Break a leg', ko: '행운을 빌어' },
      { en: 'Piece of cake', ko: '식은 죽 먹기' },
      { en: 'Under the weather', ko: '몸이 좀 안 좋아' },
    ];

    for (const test of tests) {
      it(`${test.en}`, () => {
        const result = translate(test.en, 'en-ko');
        const score = evaluateScore(result, test.ko);
        recordScore('2.1 단어 수준', '2.1.3 영어 관용구', test.en, test.ko, result, score);
        console.log(`[EN] ${test.en}`);
        console.log(`[Expected] ${test.ko}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 2.2.1 관계대명사
  describe('2.2.1 관계대명사', () => {
    const tests = [
      { en: 'The man who is standing there is my father', ko: '저기 서 있는 남자가 우리 아버지야' },
      { en: 'The book that I bought yesterday was expensive', ko: '어제 내가 산 책은 비쌌어' },
    ];

    for (const test of tests) {
      it(`${test.en}`, () => {
        const result = translate(test.en, 'en-ko');
        const score = evaluateScore(result, test.ko);
        recordScore('2.2 문장 수준', '2.2.1 관계대명사', test.en, test.ko, result, score);
        console.log(`[EN] ${test.en}`);
        console.log(`[Expected] ${test.ko}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 2.2.2 가정법
  describe('2.2.2 가정법', () => {
    const tests = [
      { en: 'If I were you, I would accept the offer', ko: '내가 너라면 그 제안을 받아들일 거야' },
      { en: 'I wish I could speak Korean fluently', ko: '한국어를 유창하게 할 수 있으면 좋겠어' },
    ];

    for (const test of tests) {
      it(`${test.en}`, () => {
        const result = translate(test.en, 'en-ko');
        const score = evaluateScore(result, test.ko);
        recordScore('2.2 문장 수준', '2.2.2 가정법', test.en, test.ko, result, score);
        console.log(`[EN] ${test.en}`);
        console.log(`[Expected] ${test.ko}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });

  // 2.2.3 수동태
  describe('2.2.3 수동태', () => {
    const tests = [
      { en: 'The window was broken by the kids', ko: '아이들이 창문을 깼다' },
      { en: 'The meeting has been postponed', ko: '회의가 연기되었다' },
    ];

    for (const test of tests) {
      it(`${test.en}`, () => {
        const result = translate(test.en, 'en-ko');
        const score = evaluateScore(result, test.ko);
        recordScore('2.2 문장 수준', '2.2.3 수동태', test.en, test.ko, result, score);
        console.log(`[EN] ${test.en}`);
        console.log(`[Expected] ${test.ko}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });
});

// ===========================================
// PHASE 3: 특수 케이스
// ===========================================

describe('PHASE 3: 특수 케이스', () => {
  // 3.2 문화 특수 표현
  describe('3.2 문화 특수 표현', () => {
    const tests = [
      { ko: '수고하셨습니다', en: 'Thank you for your hard work' },
      { ko: '잘 먹겠습니다', en: 'Thank you for the meal' },
    ];

    for (const test of tests) {
      it(`${test.ko}`, () => {
        const result = translate(test.ko, 'ko-en');
        const score = evaluateScore(result, test.en);
        recordScore('3. 특수 케이스', '3.2 문화 특수 표현', test.ko, test.en, result, score);
        console.log(`[KO] ${test.ko}`);
        console.log(`[Expected] ${test.en}`);
        console.log(`[Actual] ${result}`);
        console.log(`[Score] ${score}/5`);
      });
    }
  });
});

// 테스트 종료 후 점수 요약 출력
describe('점수 요약 (Score Summary)', () => {
  it('모든 테스트 결과 출력', () => {
    console.log('\n========================================');
    console.log('📊 번역 품질 테스트 결과');
    console.log('========================================\n');

    // 카테고리별 점수 집계
    const categoryScores: Record<string, number[]> = {};

    for (const score of scores) {
      if (!categoryScores[score.category]) {
        categoryScores[score.category] = [];
      }
      categoryScores[score.category]?.push(score.score);
    }

    let totalScore = 0;
    let totalCount = 0;

    for (const [category, categoryScoreList] of Object.entries(categoryScores)) {
      const avg = categoryScoreList.reduce((a, b) => a + b, 0) / categoryScoreList.length;
      totalScore += categoryScoreList.reduce((a, b) => a + b, 0);
      totalCount += categoryScoreList.length;
      console.log(`${category}: ${avg.toFixed(2)}/5 (${categoryScoreList.length}개 테스트)`);
    }

    const overallAvg = totalScore / totalCount;
    console.log('\n----------------------------------------');
    console.log(`총점: ${overallAvg.toFixed(2)}/5 (${totalCount}개 테스트)`);
    console.log('----------------------------------------\n');

    // 등급 판정
    let grade = '';
    if (overallAvg >= 4.5) grade = '완벽 (Perfect)';
    else if (overallAvg >= 3.5) grade = '우수 (Good)';
    else if (overallAvg >= 2.5) grade = '보통 (Acceptable)';
    else if (overallAvg >= 1.5) grade = '미흡 (Poor)';
    else grade = '불량 (Unacceptable)';

    console.log(`📌 최종 등급: ${grade}`);
    console.log('\n========================================\n');

    // 점수가 낮은 항목들 (2점 이하)
    const lowScores = scores.filter((s) => s.score <= 2);
    if (lowScores.length > 0) {
      console.log('⚠️  개선 필요 항목 (2점 이하):');
      for (const s of lowScores) {
        console.log(`  - [${s.subcategory}] ${s.input}`);
        console.log(`    예상: ${s.expected}`);
        console.log(`    실제: ${s.actual}`);
      }
    }
  });
});
