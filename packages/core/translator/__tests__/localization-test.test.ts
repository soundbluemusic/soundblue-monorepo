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
 * ║  - 의역/문화적 표현 변환 알고리즘 개선                                          ║
 * ║                                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                 Localization Tests - 의역/문화적 번역 테스트                     ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  의역 원칙:                                                                   ║
 * ║  1. 문화적 맥락: 직역 대신 목표 언어의 자연스러운 표현으로 변환                   ║
 * ║  2. 속담/관용구: 원어 뜻을 살리면서 목표 언어 문화에 맞는 표현 사용               ║
 * ║  3. 상황 인식: 회식, 눈치, 세배 등 문화 특수 개념을 설명적으로 번역               ║
 * ║  4. 압축: 자막 등에서 의미를 유지하면서 간결하게 표현                             ║
 * ║  5. 창의적 의역: 말장난, 뉘앙스 등을 목표 언어에 맞게 재창조                      ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { describe, expect, test } from 'vitest';
import { translate } from '../translator-service';

// ========================================
// Level 1: 속담/관용구 (Idioms)
// ========================================

describe('Level 1 - 속담/관용구 (Idioms)', () => {
  describe('1-1. 한국어 속담 → 영어 (Korean Proverbs)', () => {
    test('Ko→En: 티끌 모아 태산이야', () => {
      const input = '티끌 모아 태산이야';
      const expected = 'Every little bit counts';
      const result = translate(input, 'ko-en');
      console.log('1-1a Ko→En (티끌 모아 태산):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('Ko→En: 이번만 눈 감아줄게', () => {
      const input = '이번만 눈 감아줄게';
      const expected = "I'll let it slide this time";
      const result = translate(input, 'ko-en');
      console.log('1-1b Ko→En (눈 감아주다):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('Ko→En: 이제 발 뻗고 잘 수 있겠다', () => {
      const input = '이제 발 뻗고 잘 수 있겠다';
      const expected = 'Now I can finally sleep in peace';
      const result = translate(input, 'ko-en');
      console.log('1-1c Ko→En (발 뻗고 자다):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('1-2. 영어 관용구 → 한국어 (English Idioms)', () => {
    test('En→Ko: Raining cats and dogs', () => {
      const input = "It's raining cats and dogs outside";
      const expected = '밖에 비가 억수같이 쏟아지네';
      const result = translate(input, 'en-ko');
      console.log('1-2a En→Ko (cats and dogs):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Break a leg', () => {
      const input = 'Break a leg at your audition!';
      const expected = '오디션 대박 나라!';
      const result = translate(input, 'en-ko');
      console.log('1-2b En→Ko (break a leg):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Piece of cake', () => {
      const input = "Don't worry, it'll be a piece of cake";
      const expected = '걱정 마, 누워서 떡 먹기야';
      const result = translate(input, 'en-ko');
      console.log('1-2c En→Ko (piece of cake):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 2: 문화적 표현 (Cultural Expressions)
// ========================================

describe('Level 2 - 문화적 표현 (Cultural Expressions)', () => {
  describe('2-1. 한국 문화 → 영어 (Korean Culture)', () => {
    test('Ko→En: 회식/1차 (Work dinner)', () => {
      const input = '오늘 회식인데 1차만 하고 빠져도 돼?';
      const expected = 'We have a work dinner tonight. Can I leave after the first round?';
      const result = translate(input, 'ko-en');
      console.log('2-1a Ko→En (회식):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('Ko→En: 눈치 (Reading the room)', () => {
      const input = '걔는 눈치가 빠른 편이야';
      const expected = "She's good at reading the room";
      const result = translate(input, 'ko-en');
      console.log('2-1b Ko→En (눈치):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('Ko→En: 세배/세뱃돈 (Sebae)', () => {
      const input = '설날에 세배하고 세뱃돈 받았어';
      const expected = 'I bowed to my elders on New Year and got gift money';
      const result = translate(input, 'ko-en');
      console.log('2-1c Ko→En (세배):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('2-2. 영미 문화 → 한국어 (Western Culture)', () => {
    test('En→Ko: Thanksgiving', () => {
      const input = "Let's do Thanksgiving at my place this year";
      const expected = '올해 추수감사절은 우리 집에서 하자';
      const result = translate(input, 'en-ko');
      console.log('2-2a En→Ko (Thanksgiving):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Housewarming', () => {
      const input = 'I brought some housewarming gifts for you';
      const expected = '집들이 선물 가져왔어';
      const result = translate(input, 'en-ko');
      console.log('2-2b En→Ko (housewarming):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Baby shower', () => {
      const input = 'She threw a baby shower for her sister';
      const expected = '언니 출산 축하 파티 열었어';
      const result = translate(input, 'en-ko');
      console.log('2-2c En→Ko (baby shower):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 3: 복잡한 문화적 맥락 (Complex Cultural Context)
// ========================================

describe('Level 3 - 복잡한 문화적 맥락 (Complex Cultural Context)', () => {
  describe('3-1. 한국 사회 개념 → 영어 (Korean Social Concepts)', () => {
    test('Ko→En: 군대/말년 (Military service)', () => {
      const input = '저 선배 군대 말년에 맨날 짬 타더니 지금도 똑같네';
      const expected =
        'That senior was always slacking off near the end of his service, and nothing has changed';
      const result = translate(input, 'ko-en');
      console.log('3-1a Ko→En (군대):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('Ko→En: 수저 계급론 (Spoon class theory)', () => {
      const input = '요즘 수저 계급론 때문에 다들 포기가 빠르더라';
      const expected =
        'These days people give up quickly because they think wealth determines everything';
      const result = translate(input, 'ko-en');
      console.log('3-1b Ko→En (수저 계급론):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('Ko→En: 워라밸 (Work-life balance)', () => {
      const input = '워라밸 좋은 회사 찾는다고? 그건 좀 판타지지';
      const expected =
        'Looking for a company with good work-life balance? That sounds like a fantasy';
      const result = translate(input, 'ko-en');
      console.log('3-1c Ko→En (워라밸):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('3-2. 영미 사회 개념 → 한국어 (Western Social Concepts)', () => {
    test('En→Ko: Trust fund baby', () => {
      const input = "He's a real trust fund baby who never had to work a day";
      const expected = '금수저라 평생 일 안 해도 되는 애야';
      const result = translate(input, 'en-ko');
      console.log('3-2a En→Ko (trust fund baby):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Keeping up with the Joneses', () => {
      const input = "That's just keeping up with the Joneses mentality";
      const expected = '그건 그냥 남들 따라가려는 허세야';
      const result = translate(input, 'en-ko');
      console.log('3-2b En→Ko (keeping up with the Joneses):', { input, expected, result });
      expect(result).toBe(expected);
    });

    test('En→Ko: Pulled himself up by bootstraps', () => {
      const input = 'He pulled himself up by his bootstraps from nothing';
      const expected = '맨땅에서 헤딩으로 성공한 사람이야';
      const result = translate(input, 'en-ko');
      console.log('3-2c En→Ko (bootstraps):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});

// ========================================
// Level 4: 자막 압축 + 창의 의역 (Subtitle Compression + Creative)
// ========================================

describe('Level 4 - 자막 압축 + 창의 의역 (Subtitle Compression + Creative)', () => {
  describe('4-1. 자막 압축 (Subtitle Compression)', () => {
    test('Ko→En: 긴 문장 압축', () => {
      const input =
        '내가 솔직히 지금 일 그만두고 여행 다니고 싶은데, 그렇다고 현실을 무시할 수도 없고, 그냥 답답해 죽겠어';
      const expected =
        'I want to quit and travel, but reality keeps holding me back. I feel so stuck';
      const result = translate(input, 'ko-en');
      console.log('4-1a Ko→En (압축):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });

  describe('4-2. 창의적 압축 (Creative Compression)', () => {
    test('En→Ko: Escalated quickly 압축', () => {
      const input =
        'Well, that escalated quickly. I mean, that really got out of hand fast. Everyone was just fine, and then boom, total chaos';
      const expected = '순식간에 개판됐네. 멀쩡하다가 한순간에 난장판';
      const result = translate(input, 'en-ko');
      console.log('4-2a En→Ko (escalated quickly):', { input, expected, result });
      expect(result).toBe(expected);
    });
  });
});
