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
 * ║                    알고리즘 검증 테스트 (Algorithm Verification)                 ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  목적:                                                                        ║
 * ║  규칙 기반 일반화가 제대로 동작하는지 검증                                          ║
 * ║  → 테스트 문장이 아닌, 동일 수준의 **다른 문장**으로 테스트                          ║
 * ║                                                                              ║
 * ║  검증 방법:                                                                    ║
 * ║  1. level-test.test.ts에 없는 새로운 문장 사용                                  ║
 * ║  2. 동일한 문법 패턴 (의문문, 부정문, 감탄문 등)                                   ║
 * ║  3. 알고리즘이 일반화되어 있다면 이 테스트도 통과해야 함                             ║
 * ║                                                                              ║
 * ║  예시:                                                                        ║
 * ║  - level-test: "Did you go to the museum yesterday?"                         ║
 * ║  - 이 테스트: "Did you go to the library yesterday?" (다른 단어, 같은 패턴)      ║
 * ║  → 둘 다 통과해야 진정한 규칙 기반 일반화                                         ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, expect, it } from 'vitest';
import { translate } from '../translator-service';

describe('알고리즘 검증 - Level 1 수준 다른 문장', () => {
  describe('영→한 의문문', () => {
    it('Did you go to the library yesterday?', () => {
      const result = translate('Did you go to the library yesterday?', 'en-ko');
      console.log('Result:', result);
      // 기대: 너는 어제 도서관에 갔니? (또는 유사한 형태)
      expect(result).toContain('도서관');
      expect(result).toContain('어제');
    });

    it('Was it good?', () => {
      const result = translate('Was it good?', 'en-ko');
      console.log('Result:', result);
      // 기대: 좋았어? (또는 유사한 형태)
      expect(result).toContain('좋');
    });

    it('What food did you eat?', () => {
      const result = translate('What food did you eat?', 'en-ko');
      console.log('Result:', result);
      // 기대: 어떤 음식을 먹었어?
      expect(result).toContain('음식');
      expect(result).toContain('먹');
    });
  });

  describe('영→한 부정문', () => {
    it("I didn't go to school yesterday.", () => {
      const result = translate("I didn't go to school yesterday.", 'en-ko');
      console.log('Result:', result);
      // 기대: 나는 어제 학교에 가지 않았어
      expect(result).toContain('학교');
      expect(result).toContain('않');
    });

    it("I couldn't sleep well.", () => {
      const result = translate("I couldn't sleep well.", 'en-ko');
      console.log('Result:', result);
      // 기대: 잘 자지 못했어 (또는 유사)
      expect(result).toContain('자');
    });
  });

  describe('영→한 감탄문', () => {
    it('Wow! The weather is beautiful!', () => {
      const result = translate('Wow! The weather is beautiful!', 'en-ko');
      console.log('Result:', result);
      // 기대: 와! 날씨가 아름다워!
      expect(result).toContain('날씨');
    });

    it('Amazing! You did it!', () => {
      const result = translate('Amazing! You did it!', 'en-ko');
      console.log('Result:', result);
      // 기대: 놀라워! 너 해냈어!
      expect(result).toMatch(/놀|대단|멋/);
    });
  });

  describe('한→영 의문문', () => {
    it('너는 어제 도서관에 갔니?', () => {
      const result = translate('너는 어제 도서관에 갔니?', 'ko-en');
      console.log('Result:', result);
      // 기대: Did you go to the library yesterday?
      expect(result.toLowerCase()).toContain('library');
      expect(result.toLowerCase()).toContain('yesterday');
    });

    it('뭘 먹었어?', () => {
      const result = translate('뭘 먹었어?', 'ko-en');
      console.log('Result:', result);
      // 기대: What did you eat?
      expect(result.toLowerCase()).toContain('what');
      expect(result.toLowerCase()).toContain('eat');
    });
  });

  describe('한→영 부정문', () => {
    it('나는 어제 학교에 가지 않았어.', () => {
      const result = translate('나는 어제 학교에 가지 않았어.', 'ko-en');
      console.log('Result:', result);
      // 기대: I didn't go to school yesterday
      expect(result.toLowerCase()).toContain('school');
      expect(result.toLowerCase()).toMatch(/didn't|did not/);
    });

    it('운동을 하지 않았어.', () => {
      const result = translate('운동을 하지 않았어.', 'ko-en');
      console.log('Result:', result);
      // 기대: I didn't exercise
      expect(result.toLowerCase()).toMatch(/didn't|did not/);
    });
  });

  describe('한→영 감탄문', () => {
    it('와! 정말 맛있어!', () => {
      const result = translate('와! 정말 맛있어!', 'ko-en');
      console.log('Result:', result);
      // 기대: Wow! It's really delicious!
      expect(result.toLowerCase()).toContain('wow');
      expect(result.toLowerCase()).toMatch(/delicious|tasty/);
    });
  });
});
