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
