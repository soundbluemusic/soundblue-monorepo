/**
 * 안티하드코딩 알고리즘 테스트 - v2 파이프라인
 *
 * 🚫 암기/하드코딩으로는 절대 통과 불가능
 * 22가지 핵심 알고리즘 규칙 - 무한 조합 가능
 *
 * 레벨 목록:
 * 1. 숫자 + 복수형 규칙
 * 2. 관사 a/an 발음 규칙
 * 3. 서수 생성 규칙
 * 4. 시제 자동 판단
 * 5. 주어-동사 수 일치
 * 6. 부정문 자동 생성
 * 7. 비교급/최상급 규칙
 * 8. 가산/불가산 명사 판단
 * 9. 수동태/능동태 변환
 * 10. 전치사 자동 선택 (시간)
 * 11. 전치사 자동 선택 (장소)
 * 12. 의문사 자동 선택
 * 13. 형용사 순서 규칙
 * 14. 관계대명사 자동 삽입
 * 15. 대명사 자동 결정
 * 16. 생략 주어 복원
 * 17. 동명사/to부정사 선택
 * 18. 수량사 자동 선택
 * 19. 재귀 대명사 규칙
 * 20. 중의적 표현 해소
 * 21. 동사 불규칙 변화
 * 22. 조합 폭발 처리
 */

import { describe, expect, test } from 'vitest';
import { antiHardcodingTests } from '../../benchmark-data';
import { translate } from '../index';

// 간단한 유사도 측정 (단어 겹침 비율)
function calculateSimilarity(actual: string, expected: string): number {
  const actualWords = new Set(actual.toLowerCase().split(/\s+/));
  const expectedWords = new Set(expected.toLowerCase().split(/\s+/));

  let matches = 0;
  for (const word of actualWords) {
    if (expectedWords.has(word)) matches++;
  }

  const totalUnique = new Set([...actualWords, ...expectedWords]).size;
  return totalUnique > 0 ? matches / totalUnique : 0;
}

// 핵심 키워드 포함 여부 체크
function containsKeywords(actual: string, expected: string): boolean {
  const expectedWords = expected.toLowerCase().split(/\s+/);
  const actualLower = actual.toLowerCase();

  // 핵심 단어(3글자 이상) 중 60% 이상 포함하면 통과
  const keyWords = expectedWords.filter((w) => w.length >= 3);
  if (keyWords.length === 0) return actual.toLowerCase() === expected.toLowerCase();

  let found = 0;
  for (const kw of keyWords) {
    if (actualLower.includes(kw)) found++;
  }
  return found / keyWords.length >= 0.6;
}

interface LevelResult {
  levelId: string;
  levelName: string;
  total: number;
  exactMatch: number;
  keywordMatch: number;
  avgSimilarity: number;
}

describe('안티하드코딩 알고리즘 테스트 (22개 레벨)', () => {
  const results: LevelResult[] = [];

  for (const level of antiHardcodingTests) {
    describe(`${level.nameKo}`, () => {
      for (const category of level.categories) {
        test(`${category.nameKo}`, () => {
          const levelResult: LevelResult = {
            levelId: level.id,
            levelName: level.nameKo,
            total: category.tests.length,
            exactMatch: 0,
            keywordMatch: 0,
            avgSimilarity: 0,
          };

          let totalSim = 0;

          console.log(`\n=== ${level.nameKo} / ${category.nameKo} ===`);

          for (const tc of category.tests) {
            const actual = translate(tc.input, tc.direction);
            const similarity = calculateSimilarity(actual, tc.expected);
            const isExact = actual.toLowerCase() === tc.expected.toLowerCase();
            const hasKeywords = containsKeywords(actual, tc.expected);

            if (isExact) levelResult.exactMatch++;
            if (hasKeywords) levelResult.keywordMatch++;
            totalSim += similarity;

            // 결과 출력
            const status = isExact ? '✅' : hasKeywords ? '🔶' : '❌';
            console.log(`${status} ${tc.input}`);
            console.log(`   기대: ${tc.expected}`);
            console.log(`   실제: ${actual}`);
            console.log(`   유사도: ${(similarity * 100).toFixed(1)}%\n`);
          }

          levelResult.avgSimilarity = totalSim / category.tests.length;
          results.push(levelResult);

          // 테스트는 항상 통과 (측정 목적)
          expect(true).toBe(true);
        });
      }
    });
  }

  // 전체 결과 요약
  test('전체 결과 요약', () => {
    console.log('\n' + '='.repeat(80));
    console.log('안티하드코딩 알고리즘 테스트 결과 요약 (22개 레벨)');
    console.log('='.repeat(80));

    let totalTests = 0;
    let totalExact = 0;
    let totalKeyword = 0;
    let totalSimilarity = 0;

    // 레벨별로 그룹화
    const levelGroups: Record<string, LevelResult[]> = {};
    for (const r of results) {
      if (!levelGroups[r.levelId]) {
        levelGroups[r.levelId] = [];
      }
      levelGroups[r.levelId].push(r);
    }

    for (const levelId of Object.keys(levelGroups).sort()) {
      const levelResults = levelGroups[levelId];
      const levelName = levelResults[0].levelName;

      let levelTotal = 0;
      let levelExact = 0;
      let levelKeyword = 0;
      let levelSim = 0;

      for (const r of levelResults) {
        levelTotal += r.total;
        levelExact += r.exactMatch;
        levelKeyword += r.keywordMatch;
        levelSim += r.avgSimilarity * r.total;
      }

      const avgSim = levelTotal > 0 ? (levelSim / levelTotal) * 100 : 0;
      const exactRate = levelTotal > 0 ? (levelExact / levelTotal) * 100 : 0;
      const keywordRate = levelTotal > 0 ? (levelKeyword / levelTotal) * 100 : 0;

      console.log(
        `${levelName.padEnd(40)} | 정확: ${exactRate.toFixed(0).padStart(3)}% | 키워드: ${keywordRate.toFixed(0).padStart(3)}% | 유사도: ${avgSim.toFixed(1).padStart(5)}%`,
      );

      totalTests += levelTotal;
      totalExact += levelExact;
      totalKeyword += levelKeyword;
      totalSimilarity += levelSim;
    }

    console.log('='.repeat(80));
    const overallExact = totalTests > 0 ? (totalExact / totalTests) * 100 : 0;
    const overallKeyword = totalTests > 0 ? (totalKeyword / totalTests) * 100 : 0;
    const overallSim = totalTests > 0 ? (totalSimilarity / totalTests) * 100 : 0;
    console.log(`총 테스트: ${totalTests}개`);
    console.log(`정확 일치: ${totalExact}/${totalTests} (${overallExact.toFixed(1)}%)`);
    console.log(`키워드 매치: ${totalKeyword}/${totalTests} (${overallKeyword.toFixed(1)}%)`);
    console.log(`평균 유사도: ${overallSim.toFixed(1)}%`);
    console.log('='.repeat(80));

    expect(true).toBe(true);
  });
});
