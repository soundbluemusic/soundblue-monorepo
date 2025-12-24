/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              🧪 TEST SET - 최종 성능 평가용 데이터 (Final Evaluation)            ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  ⚠️  ML 데이터 분할 원칙 (Data Split Principle)                                ║
 * ║  ┌──────────────────────────────────────────────────────────────────────┐   ║
 * ║  │  1. Training Set (학습 세트) - 70%     → 알고리즘 개발용               │   ║
 * ║  │  2. Validation Set (검증 세트) - 15%  → 튜닝/디버깅용                 │   ║
 * ║  │  3. Test Set (테스트 세트) - 15%      → 최종 성능 평가 (이 파일)       │   ║
 * ║  └──────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                              ║
 * ║  🚫 절대 금지 사항:                                                           ║
 * ║  - 이 테스트 문장들을 사전(dictionary)에 직접 추가 금지                         ║
 * ║  - 이 테스트 문장만 통과하는 하드코딩 패턴 금지                                  ║
 * ║  - 테스트 결과를 보고 알고리즘을 "이 문장에 맞게" 조정 금지                       ║
 * ║                                                                              ║
 * ║  ✅ 올바른 개선 방법:                                                         ║
 * ║  - 일반화된 문법 규칙 개선 (모든 유사 문장에 적용)                               ║
 * ║  - 형태소 분석기 로직 개선                                                    ║
 * ║  - 어순 변환 알고리즘 개선                                                    ║
 * ║                                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                     Typo Handling Tests - 오타 처리 테스트                       ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  오타 처리 원칙:                                                               ║
 * ║  1. 문맥 우선: 오타가 있어도 전체 문맥에서 의미 파악                             ║
 * ║  2. 패턴 인식: 흔한 오타 패턴 (ㅆ/ㅅ, their/they're 등) 학습                   ║
 * ║  3. 의도 파악: 급한 메시지나 감정적 표현의 의도 이해                             ║
 * ║  4. 자연스러운 교정: 오타를 지적하지 않고 올바른 의미로 번역                      ║
 * ║  5. 문화적 이해: 인터넷 언어, 이모티콘 등 현대적 표현 이해                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { describe, expect, test } from 'vitest';
import { translate } from '../translator-service';

// ========================================
// Level 1: 기본 오타 (Basic Typos)
// ========================================

describe('Level 1 - 기본 오타 (Basic Typos)', () => {
  describe('1-1. 철자 오류 (Spelling Errors)', () => {
    test('Ko→En: 오뉘 낭씨가 정말 조아요', () => {
      const input = '오뉘 낭씨가 정말 조아요. 공원에서 산채하기 딱 조은 날씨에요.';
      const expected =
        "The weather is really nice today. It's perfect weather for a walk in the park.";
      const result = translate(input, 'ko-en');
      console.log('1-1 Ko→En (철자 오류):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: I realy liek this moive', () => {
      const input = 'I realy liek this moive. It was awsome and the actors were grate.';
      const expected = '나는 이 영화가 정말 좋아요. 훌륭했고 배우들이 대단했어요.';
      const result = translate(input, 'en-ko');
      console.log('1-1 En→Ko (철자 오류):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-2. 띄어쓰기 오류 (Spacing Errors)', () => {
    test('Ko→En: 나는어제친구를만나서영화를봤어요', () => {
      const input = '나는어제친구를만나서영화를봤어요. 정말재미있었어요.';
      const expected = 'I met my friend yesterday and watched a movie. It was really fun.';
      const result = translate(input, 'ko-en');
      console.log('1-2 Ko→En (띄어쓰기):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Iwentto thestoreyesterday', () => {
      const input = 'Iwentto thestoreyesterday andbot somegroceries.';
      const expected = '나는 어제 가게에 갔고 식료품을 샀어요.';
      const result = translate(input, 'en-ko');
      console.log('1-2 En→Ko (띄어쓰기):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-3. 중복 문자 (Duplicate Characters)', () => {
    test('Ko→En: 오늘늘 정말말 행복해요요', () => {
      const input = '오늘늘 정말말 행복해요요. 친구들과 재미있게 놀았어어요.';
      const expected = "I'm really happy today. I had fun playing with my friends.";
      const result = translate(input, 'ko-en');
      console.log('1-3 Ko→En (중복 문자):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: I amm soo happpy todayy', () => {
      const input = 'I amm soo happpy todayy. Wee had a greatt timee.';
      const expected = '나는 오늘 너무 행복해요. 우리는 좋은 시간을 보냈어요.';
      const result = translate(input, 'en-ko');
      console.log('1-3 En→Ko (중복 문자):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-4. 키보드 인접 키 오타 (Adjacent Key Typos)', () => {
    test('Ko→En: 안녕하세오. 만나서 반갑습bida', () => {
      const input = '안녕하세오. 만나서 반갑습bida. 오늘 좋s 하루 되세요.';
      const expected = 'Hello. Nice to meet you. Have a good day today.';
      const result = translate(input, 'ko-en');
      console.log('1-4 Ko→En (인접 키):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Hwllo! Hoe are yoi today', () => {
      const input = 'Hwllo! Hoe are yoi today? I hope ypu are doing wrll.';
      const expected = '안녕하세요! 오늘 어떻게 지내세요? 잘 지내시길 바래요.';
      const result = translate(input, 'en-ko');
      console.log('1-4 En→Ko (인접 키):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 2: 중급 오타 (Intermediate Typos)
// ========================================

describe('Level 2 - 중급 오타 (Intermediate Typos)', () => {
  describe('2-1. 동음이의어 혼동 (Homophone Confusion)', () => {
    test('Ko→En: 기분이 좋앗다 (ㅆ 받침 누락)', () => {
      const input = '그는 회사에 출근하는 길에 커피를 마셨다. 그래서 기분이 좋앗다.';
      const expected = 'He drank coffee on his way to work. So he felt good.';
      const result = translate(input, 'ko-en');
      console.log('2-1 Ko→En (동음이의어):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Their/too/meet confusion', () => {
      const input =
        'Their going too the store too buy some meet for dinner. Its going to be delicious.';
      const expected = '그들은 저녁을 위해 고기를 사러 가게에 가고 있어요. 맛있을 거예요.';
      const result = translate(input, 'en-ko');
      console.log('2-1 En→Ko (동음이의어):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-2. 조사 오류 (Particle Errors)', () => {
    test('Ko→En: 나을/우리을/영화은 (조사 혼동)', () => {
      const input = '나을 친구가 만났다. 우리을 영화를 봤다. 영화은 재미있었다.';
      const expected = 'I met my friend. We watched a movie. The movie was fun.';
      const result = translate(input, 'ko-en');
      console.log('2-2 Ko→En (조사 오류):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Subject-verb disagreement', () => {
      const input = 'I goes to school everyday. She like ice cream. They was playing soccer.';
      const expected =
        '나는 매일 학교에 가요. 그녀는 아이스크림을 좋아해요. 그들은 축구를 하고 있었어요.';
      const result = translate(input, 'en-ko');
      console.log('2-2 En→Ko (주어-동사 불일치):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-3. 복합 오타 (Combined Typos)', () => {
    test('Ko→En: 띄어쓰기 + 맞춤법', () => {
      const input = '어제친구를만나서 맛잇는 음식을먹었어요. 정말즐거웟어요.';
      const expected = 'I met my friend yesterday and ate delicious food. It was really enjoyable.';
      const result = translate(input, 'ko-en');
      console.log('2-3 Ko→En (복합 오타):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Multiple typos combined', () => {
      const input = 'Yeserday I whent too thee movies wiht my frend. Wee had an amzing tiem.';
      const expected = '어제 나는 친구와 영화를 보러 갔어요. 우리는 놀라운 시간을 보냈어요.';
      const result = translate(input, 'en-ko');
      console.log('2-3 En→Ko (복합 오타):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-4. 문장 부호 오류 (Punctuation Errors)', () => {
    test('Ko→En: 마침표/물음표 오류', () => {
      const input = '안녕하세요.오늘 날씨가 정말 좋네요.산책 가실래요.';
      const expected = 'Hello. The weather is really nice today. Would you like to go for a walk?';
      const result = translate(input, 'ko-en');
      console.log('2-4 Ko→En (문장 부호):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Punctuation issues', () => {
      const input = 'Hello,how are you.Im doing great,thank you.What about you,';
      const expected = '안녕하세요, 어떻게 지내세요? 잘 지내요, 감사합니다. 당신은요?';
      const result = translate(input, 'en-ko');
      console.log('2-4 En→Ko (문장 부호):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 3: 고급 오타 (Advanced Typos)
// ========================================

describe('Level 3 - 고급 오타 (Advanced Typos)', () => {
  describe('3-1. 문법+오타 복합 (Severe Grammar + Typo)', () => {
    test('Ko→En: 조사 오류 + 어순 문제 + 맞춤법', () => {
      const input =
        '나 어제를 친구을 만나서 였다 영화 봤다. 정말 재밋었서요 그리고 맛있는것 먹었어.';
      const expected =
        'I met my friend yesterday and watched a movie. It was really fun and I ate something delicious.';
      const result = translate(input, 'ko-en');
      console.log('3-1 Ko→En (문법+오타):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Tense errors + word order', () => {
      const input =
        'I yesterday go to store and buyed some thing. It very expensive was but I really need it so I bought.';
      const expected =
        '나는 어제 가게에 갔고 무언가를 샀다. 그것은 매우 비쌌지만 정말 필요했기 때문에 샀다.';
      const result = translate(input, 'en-ko');
      console.log('3-1 En→Ko (시제+어순):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-2. 의미 파악 어려운 오타 (Difficult-to-Parse)', () => {
    test('Ko→En: ㅆ/ㅅ 혼동 다수', () => {
      const input = '그 사람이 나한대 말햇든게 그냥 거짖말이엇어. 난 정말 화가 낫었는대 참앗어.';
      const expected =
        'What that person told me was just a lie. I was really angry but I held it in.';
      const result = translate(input, 'ko-en');
      console.log('3-2 Ko→En (ㅆ/ㅅ 혼동):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Multiple severe typos', () => {
      const input =
        'Wen I was yung, I use to beleive in fairy tails. Now I no that there not reel, but I stil enjoy reeding them.';
      const expected =
        '내가 어렸을 때, 나는 동화를 믿곤 했다. 이제 나는 그것들이 진짜가 아니라는 것을 알지만, 여전히 읽는 것을 즐긴다.';
      const result = translate(input, 'en-ko');
      console.log('3-2 En→Ko (심각한 오타):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-3. 극단적 오타 - 띄어쓰기 전무 (Extreme)', () => {
    test('Ko→En: 모든 띄어쓰기 누락 + 맞춤법', () => {
      const input = '오늘낭씨조아서 나친구랑공원갓는대사람만타서 별로엿어요그래서우린카페로갓어요';
      const expected =
        "The weather was nice today so I went to the park with my friend, but there were too many people so it wasn't great, so we went to a cafe.";
      const result = translate(input, 'ko-en');
      console.log('3-3 Ko→En (극단적):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: No spaces at all', () => {
      const input =
        'IwenttothebeachyesterdaybutitwasveryhotsoididntstaylongandwenthomeearlybecauseIwasfeelingtired';
      const expected =
        '나는 어제 해변에 갔지만 매우 더워서 오래 머물지 않았고 피곤함을 느껴서 일찍 집에 갔다.';
      const result = translate(input, 'en-ko');
      console.log('3-3 En→Ko (띄어쓰기 전무):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-4. 인터넷 줄임말 (Internet Abbreviations)', () => {
    test('Ko→En: 축약형 문체', () => {
      const input = '나 엊그제 친구 만남. 우리 밥 먹음. 맛있음. 또 가고싶음. 다음주에 갈꺼임.';
      const expected =
        "I met my friend the day before yesterday. We ate. It was delicious. I want to go again. I'm going next week.";
      const result = translate(input, 'ko-en');
      console.log('3-4 Ko→En (축약형):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Internet slang', () => {
      const input =
        'tmrw gonna meet frnd. we r going 2 the mall. gonna buy stuff. prob gonna eat 2. cant w8!';
      const expected =
        '내일 친구를 만날 거야. 우리는 쇼핑몰에 갈 거야. 물건을 살 거야. 아마 먹기도 할 거야. 기다릴 수 없어!';
      const result = translate(input, 'en-ko');
      console.log('3-4 En→Ko (인터넷 줄임말):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-5. 자동완성 오류 (Autocorrect Errors)', () => {
    test('Ko→En: 외래어 표기 오류', () => {
      const input =
        '오늘 친구하고 만나서 점심 먹고 영화 봤어. 영화 제목은 "어벤저스"였는데 정말 재밌었어. 다음에 또 보고 싶어.';
      const expected =
        'I met my friend today, had lunch, and watched a movie. The movie was called "Avengers" and it was really fun. I want to watch it again next time.';
      const result = translate(input, 'ko-en');
      console.log('3-5 Ko→En (외래어):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Autocorrect homophone errors', () => {
      const input =
        "I'm duck and tired of this situation. I need to piece of mind. This has been bugging me four weeks now.";
      const expected =
        '나는 이 상황이 지겹고 피곤하다. 마음의 평화가 필요하다. 이것이 몇 주 동안 나를 괴롭혀왔다.';
      const result = translate(input, 'en-ko');
      console.log('3-5 En→Ko (자동완성 오류):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 3-Extra: 실전 오타 시뮬레이션
// ========================================

describe('Level 3-Extra - 실전 오타 (Real-World)', () => {
  describe('3E-1. 급하게 쓴 메시지 (Rushed Messages)', () => {
    test('Ko→En: 이모티콘 + 띄어쓰기 + 느낌표', () => {
      const input = '미안 늦었어ㅠㅠ 지하철놓쳐서ㅜㅜ 10분안에도착할게!! 커피사갈까??';
      const expected =
        "Sorry I'm late. I missed the subway. I'll arrive in 10 minutes!! Should I buy coffee?";
      const result = translate(input, 'ko-en');
      console.log('3E-1 Ko→En (급한 메시지):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Rushed text speak', () => {
      const input = 'omg running late!!! traffic is crazyyy!!! b there in 5 mins!!! srry!!!';
      const expected = '세상에, 늦고 있어! 교통이 미쳤어! 5분 안에 갈게! 미안!';
      const result = translate(input, 'en-ko');
      console.log('3E-1 En→Ko (급한 메시지):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3E-2. 감정적인 메시지 (Emotional Messages)', () => {
    test('Ko→En: 강조 표현', () => {
      const input =
        '진짜진짜 화나!!!!!! 도대체 왜이러는거야!!!???? 이해할수가없어!!!!! 아ㅏㅏㅏㅏ악!!!';
      const expected = "I'm really angry! Why are you doing this!? I can't understand! Ugh!";
      const result = translate(input, 'ko-en');
      console.log('3E-2 Ko→En (감정적):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Excessive emphasis', () => {
      const input = 'NOOOOO WAYYYYY!!!!!!! THIS IS AMAZINGGGGG!!!!! BEST DAY EVERRRRRR!!!!!!!';
      const expected = '말도 안 돼! 이거 놀라워! 최고의 날이야!';
      const result = translate(input, 'en-ko');
      console.log('3E-2 En→Ko (과도한 강조):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3E-3. 다국어 혼용 (Mixed Language)', () => {
    test('Ko→En: 영어 단어 혼용', () => {
      const input = '오늘 meeting이 cancel됐어. 그래서 나 free해. 같이 dinner 할래?';
      const expected = "Today's meeting was cancelled. So I'm free. Want to have dinner together?";
      const result = translate(input, 'ko-en');
      console.log('3E-3 Ko→En (영어 혼용):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: 한국어 단어 혼용', () => {
      const input = "I'm so 피곤해 today. Had way too much 일 at the office. Need some 휴식 asap!";
      const expected = '오늘 너무 피곤해. 사무실에서 일이 너무 많았어. 빨리 좀 쉬어야 해!';
      const result = translate(input, 'en-ko');
      console.log('3E-3 En→Ko (한국어 혼용):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});
