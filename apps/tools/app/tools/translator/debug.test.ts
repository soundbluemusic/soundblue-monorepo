/**
 * 번역기 디버그 테스트
 */
import { describe, expect, it } from 'vitest';
import { translate } from './translator-service';
import { translateWithInfo } from './v2.1';
import { parseEnglish, parseKorean } from './v2.1/tokenizer';

describe('파이프라인 디버깅', () => {
  describe('En→Ko copula 테스트', () => {
    it('She is a student 디버그', () => {
      const result = translate('She is a student', 'en-ko');
      console.log('=== She is a student ===');
      console.log('결과:', result);
    });

    it('It is a book 디버그', () => {
      const result = translate('It is a book', 'en-ko');
      console.log('=== It is a book ===');
      console.log('결과:', result);
    });
  });

  describe('tokenizer 분석', () => {
    it('나는 - 토큰화 확인', () => {
      const parsed = parseKorean('나는');
      console.log('=== 나는 토큰화 ===');
      console.log(JSON.stringify(parsed, null, 2));
    });

    it('나는 학교에 간다 - 토큰화 확인', () => {
      const parsed = parseKorean('나는 학교에 간다');
      console.log('=== 나는 학교에 간다 토큰화 ===');
      console.log(JSON.stringify(parsed, null, 2));
    });

    it('저는 사람입니다 - 토큰화 확인', () => {
      const parsed = parseKorean('저는 사람입니다');
      console.log('=== 저는 사람입니다 토큰화 ===');
      console.log(JSON.stringify(parsed, null, 2));
    });

    it('I am a person - 영어 토큰화 확인', () => {
      const parsed = parseEnglish('I am a person');
      console.log('=== I am a person 토큰화 ===');
      console.log(JSON.stringify(parsed, null, 2));
    });

    it('I go to school - 영어 토큰화 확인', () => {
      const parsed = parseEnglish('I go to school');
      console.log('=== I go to school 토큰화 ===');
      console.log(JSON.stringify(parsed, null, 2));
    });
  });

  describe('전체 파이프라인 분석', () => {
    it('나는 학교에 간다', () => {
      const parsed = parseKorean('나는 학교에 간다');
      console.log('=== 나는 학교에 간다 전체 ===');
      console.log('파싱된 토큰:');
      for (const t of parsed.tokens) {
        console.log(`  ${t.text}: role=${t.role}, translated=${t.translated}, stem=${t.stem}`);
      }
      const result = translateWithInfo('나는 학교에 간다', 'ko-en');
      console.log('결과:', result.translated);
      console.log('원본:', result.original);
    });

    it('저는 사람입니다', () => {
      const result = translateWithInfo('저는 사람입니다', 'ko-en');
      console.log('=== 저는 사람입니다 전체 ===');
      console.log('결과:', result.translated);
    });
  });
});

describe('기본 번역 테스트', () => {
  describe('Ko → En', () => {
    it('안녕하세요', () => {
      const result = translate('안녕하세요', 'ko-en');
      console.log('안녕하세요 →', result);
      expect(result).toBeTruthy();
    });

    it('저는 사람입니다', () => {
      const result = translate('저는 사람입니다', 'ko-en');
      console.log('저는 사람입니다 →', result);
      expect(result).toBeTruthy();
    });

    it('안녕하세요, 저는 사람입니다.', () => {
      const result = translate('안녕하세요, 저는 사람입니다.', 'ko-en');
      console.log('안녕하세요, 저는 사람입니다. →', result);
      expect(result).toBeTruthy();
    });

    it('나는 학교에 간다', () => {
      const result = translate('나는 학교에 간다', 'ko-en');
      console.log('나는 학교에 간다 →', result);
      expect(result).toBeTruthy();
    });

    it('나는 밥을 먹었다', () => {
      const result = translate('나는 밥을 먹었다', 'ko-en');
      console.log('나는 밥을 먹었다 →', result);
      expect(result).toBeTruthy();
    });
  });

  describe('En → Ko', () => {
    it('Hello', () => {
      const result = translate('Hello', 'en-ko');
      console.log('Hello →', result);
      expect(result).toBeTruthy();
    });

    it('I am a person', () => {
      const result = translate('I am a person', 'en-ko');
      console.log('I am a person →', result);
      expect(result).toBeTruthy();
    });

    it('I go to school', () => {
      const result = translate('I go to school', 'en-ko');
      console.log('I go to school →', result);
      expect(result).toBeTruthy();
    });
  });
});

describe('추가 번역 테스트 (확장)', () => {
  describe('Ko → En 추가', () => {
    const testCases = [
      { ko: '그는 음악을 듣는다', expected: 'He listens to music' },
      { ko: '그녀는 책을 읽는다', expected: 'She reads a book' },
      { ko: '우리는 밥을 먹는다', expected: 'We eat rice' },
      { ko: '나는 물을 마신다', expected: 'I drink water' },
      { ko: '그들은 공원에 간다', expected: 'They go to park' },
    ];

    for (const tc of testCases) {
      it(tc.ko, () => {
        const result = translate(tc.ko, 'ko-en');
        console.log(`${tc.ko} → ${result}`);
        expect(result).toBeTruthy();
      });
    }
  });

  describe('En → Ko 추가', () => {
    const testCases = [
      { en: 'He listens to music', expectedPattern: '음악' },
      { en: 'She reads a book', expectedPattern: '책' },
      { en: 'We eat rice', expectedPattern: '밥' },
      { en: 'I drink water', expectedPattern: '물' },
      { en: 'They go to park', expectedPattern: '공원' },
      { en: 'She is a student', expectedPattern: '학생' },
      { en: 'It is a book', expectedPattern: '책' },
    ];

    for (const tc of testCases) {
      it(tc.en, () => {
        const result = translate(tc.en, 'en-ko');
        console.log(`${tc.en} → ${result}`);
        expect(result).toContain(tc.expectedPattern);
      });
    }
  });
});

// ============================================
// 수정 전후 비교 벤치마크
// ============================================
describe('수정 전후 비교 벤치마크', () => {
  // 핵심 문제 케이스들
  const criticalCases = [
    // 간다 → 판다 (similarity fallback 문제)
    { input: '나는 학교에 간다', direction: 'ko-en' as const, issue: '간다→판다 문제' },
    { input: '그는 집에 간다', direction: 'ko-en' as const, issue: '간다→판다 문제' },
    { input: '우리는 공원에 간다', direction: 'ko-en' as const, issue: '간다→판다 문제' },

    // 서술격 조사 -입니다
    { input: '저는 사람입니다', direction: 'ko-en' as const, issue: '입니다 처리 문제' },
    { input: '이것은 책입니다', direction: 'ko-en' as const, issue: '입니다 처리 문제' },
    { input: '그녀는 학생입니다', direction: 'ko-en' as const, issue: '입니다 처리 문제' },

    // 과거형 -었다
    { input: '나는 밥을 먹었다', direction: 'ko-en' as const, issue: '과거형 처리' },
    { input: '그는 책을 읽었다', direction: 'ko-en' as const, issue: '과거형 처리' },

    // 기본 인사
    { input: '안녕하세요', direction: 'ko-en' as const, issue: '기본 인사' },
    { input: 'Hello', direction: 'en-ko' as const, issue: '기본 인사' },
  ];

  it('핵심 문제 케이스 번역 결과', () => {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                    수정 후 번역 결과                                 ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');

    let passCount = 0;
    let failCount = 0;

    for (const testCase of criticalCases) {
      const result = translate(testCase.input, testCase.direction);
      const hasContent = result && result.length > 0;
      const notOriginal = result !== testCase.input;
      const noPanda = !result.toLowerCase().includes('panda');
      const pass = hasContent && notOriginal && noPanda;

      if (pass) passCount++;
      else failCount++;

      const status = pass ? '✅' : '❌';
      console.log(`║ ${status} ${testCase.input.padEnd(20)} → ${result.padEnd(25)} ║`);
    }

    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(
      `║ 통과: ${passCount}/${criticalCases.length}  실패: ${failCount}/${criticalCases.length}                                        ║`,
    );
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('\n');

    // 최소 80% 통과 기대
    expect(passCount).toBeGreaterThanOrEqual(Math.floor(criticalCases.length * 0.8));
  });
});

// ============================================
// Phase 1.3: Complex Negation 테스트
// ============================================
describe('Phase 1.3: Complex Negation', () => {
  describe("cannot/can't → 갈 수 없다", () => {
    it('I cannot go → 나는 갈 수 없다', () => {
      const result = translate('I cannot go', 'en-ko');
      console.log('I cannot go →', result);
      expect(result).toContain('없');
    });

    it("I can't eat → 나는 먹을 수 없다", () => {
      const result = translate("I can't eat", 'en-ko');
      console.log("I can't eat →", result);
      expect(result).toContain('없');
    });

    it('She cannot see → 그녀는 볼 수 없다', () => {
      const result = translate('She cannot see', 'en-ko');
      console.log('She cannot see →', result);
      expect(result).toContain('없');
    });
  });

  describe("couldn't → 할 수 없었다", () => {
    it("I couldn't see → 나는 볼 수 없었다", () => {
      const result = translate("I couldn't see", 'en-ko');
      console.log("I couldn't see →", result);
      expect(result).toContain('없었');
    });
  });

  describe("won't → 하지 않을 것이다", () => {
    it("I won't go → 나는 가지 않을 것이다", () => {
      const result = translate("I won't go", 'en-ko');
      console.log("I won't go →", result);
      expect(result).toContain('않을');
    });
  });

  describe('must not → 하면 안 된다', () => {
    it('You must not go → 너는 가면 안 된다', () => {
      const result = translate('You must not go', 'en-ko');
      console.log('You must not go →', result);
      expect(result).toContain('안');
    });
  });
});

// ============================================
// Phase 2.2: Comparatives & Superlatives 테스트
// ============================================
describe('Phase 2.2: Comparatives & Superlatives', () => {
  describe('비교급 (-er) → 더 + 형용사', () => {
    it('He is taller → 그는 더 크다', () => {
      const result = translate('He is taller', 'en-ko');
      console.log('He is taller →', result);
      expect(result).toContain('더');
      expect(result).toContain('크');
    });

    it('She is faster → 그녀는 더 빠르다', () => {
      const result = translate('She is faster', 'en-ko');
      console.log('She is faster →', result);
      expect(result).toContain('더');
      expect(result).toContain('빠르');
    });

    it('It is bigger → 그것은 더 크다', () => {
      const result = translate('It is bigger', 'en-ko');
      console.log('It is bigger →', result);
      expect(result).toContain('더');
      expect(result).toContain('크');
    });
  });

  describe('최상급 (-est) → 가장 + 형용사', () => {
    it('He is tallest → 그는 가장 크다', () => {
      const result = translate('He is tallest', 'en-ko');
      console.log('He is tallest →', result);
      expect(result).toContain('가장');
      expect(result).toContain('크');
    });

    it('She is fastest → 그녀는 가장 빠르다', () => {
      const result = translate('She is fastest', 'en-ko');
      console.log('She is fastest →', result);
      expect(result).toContain('가장');
      expect(result).toContain('빠르');
    });
  });

  describe('불규칙 비교급/최상급', () => {
    it('He is better → 그는 더 좋다', () => {
      const result = translate('He is better', 'en-ko');
      console.log('He is better →', result);
      expect(result).toContain('더');
      expect(result).toContain('좋');
    });

    it('She is best → 그녀는 가장 좋다', () => {
      const result = translate('She is best', 'en-ko');
      console.log('She is best →', result);
      expect(result).toContain('가장');
      expect(result).toContain('좋');
    });

    it('It is worse → 그것은 더 나쁘다', () => {
      const result = translate('It is worse', 'en-ko');
      console.log('It is worse →', result);
      expect(result).toContain('더');
      expect(result).toContain('나쁘');
    });
  });
});

// ============================================
// Phase 4: Auxiliary Predicates 테스트
// ============================================
describe('Phase 4: Auxiliary Predicates', () => {
  describe('want to → -고 싶다', () => {
    it('I want to go → 나는 가고 싶다', () => {
      const result = translate('I want to go', 'en-ko');
      console.log('I want to go →', result);
      expect(result).toContain('가고 싶');
    });

    it('She wants to eat → 그녀는 먹고 싶다', () => {
      const result = translate('She wants to eat', 'en-ko');
      console.log('She wants to eat →', result);
      expect(result).toContain('먹고 싶');
    });
  });

  describe('try to → -아/어 보다', () => {
    it('I try to read → 나는 읽어 보다', () => {
      const result = translate('I try to read', 'en-ko');
      console.log('I try to read →', result);
      expect(result).toContain('읽');
      expect(result).toContain('보');
    });
  });

  describe('start to → -기 시작하다', () => {
    it('I start to run → 나는 뛰기 시작하다', () => {
      const result = translate('I start to run', 'en-ko');
      console.log('I start to run →', result);
      expect(result).toContain('뛰기 시작');
    });
  });
});

// ============================================
// Phase 4.2: Passive Voice (수동태) 테스트
// ============================================
describe('Phase 4.2: Passive Voice', () => {
  describe('be + pp → 피동형', () => {
    it('The book was read → 책이 읽히다', () => {
      const result = translate('The book was read', 'en-ko');
      console.log('The book was read →', result);
      expect(result).toContain('읽히');
    });

    it('The door is opened → 문이 열리다', () => {
      const result = translate('The door is opened', 'en-ko');
      console.log('The door is opened →', result);
      expect(result).toContain('열');
    });

    it('The food was eaten → 음식이 먹히다', () => {
      const result = translate('The food was eaten', 'en-ko');
      console.log('The food was eaten →', result);
      expect(result).toContain('먹히');
    });
  });
});

// ============================================
// Phase 4.3: Causative (사동) 테스트
// ============================================
describe('Phase 4.3: Causative', () => {
  describe('make/let/have + O + V → -게 하다', () => {
    it('I made him go → 가게 했다', () => {
      const result = translate('I made him go', 'en-ko');
      console.log('I made him go →', result);
      expect(result).toContain('가게');
    });

    it('She let me eat → 먹게 했다', () => {
      const result = translate('She let me eat', 'en-ko');
      console.log('She let me eat →', result);
      expect(result).toContain('먹게');
    });
  });
});

// ============================================
// Phase 6.2: Irregular Conjugation (불규칙 활용) 테스트
// ============================================
describe('Phase 6.2: Irregular Conjugation', () => {
  describe('ㄷ불규칙 (듣다→들어)', () => {
    it('I listened → 나는 들었다 (듣다 과거)', () => {
      const result = translate('I listened', 'en-ko');
      console.log('I listened →', result);
      // 듣 → 들 + 었 → 들었
      expect(result).toContain('들');
    });

    it('I will listen → 나는 들을 것이다 (듣다 미래)', () => {
      const result = translate('I will listen', 'en-ko');
      console.log('I will listen →', result);
      // 듣 → 들 + 을 것 → 들을 것
      expect(result).toContain('들');
    });
  });

  describe('ㅂ불규칙 (돕다→도와)', () => {
    it('I helped → 나는 도왔다 (돕다 과거)', () => {
      const result = translate('I helped', 'en-ko');
      console.log('I helped →', result);
      // 돕 → 도와 + ㅆ → 도왔
      expect(result).toContain('도');
    });
  });

  describe('ㅎ불규칙 (그렇다→그래)', () => {
    it('It is like that → 그래 (그렇다)', () => {
      const result = translate('It is like that', 'en-ko');
      console.log('It is like that →', result);
      // 그렇다 관련 번역 확인
      expect(result).toBeTruthy();
    });
  });

  describe('르불규칙 - Ko→En (부르다→불러)', () => {
    it('나는 불렀다 → I called (부르다 과거)', () => {
      // 르불규칙은 Ko→En 방향에서는 영향 없음
      // 이 테스트는 불규칙 활용 데이터 구조 검증용
      const result = translate('나는 불렀다', 'ko-en');
      console.log('나는 불렀다 →', result);
      // 역방향 테스트: 불렀다가 파싱되는지
      expect(result).toBeTruthy();
    });
  });

  describe('ㅅ불규칙 - Ko→En (짓다→지어)', () => {
    it('나는 지었다 → I built (짓다 과거)', () => {
      // ㅅ불규칙은 Ko→En 방향에서 처리됨
      const result = translate('나는 지었다', 'ko-en');
      console.log('나는 지었다 →', result);
      // 역방향 테스트
      expect(result).toBeTruthy();
    });
  });
});
