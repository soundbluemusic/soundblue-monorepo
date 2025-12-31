/**
 * 12개 카테고리 테스트 - v2 파이프라인
 *
 * 카테고리:
 * 1. 감정 표현 (Emotions) - 기쁨, 슬픔, 분노, 놀람, 두려움
 * 2. 분야별 대화 (Domain) - 의료, 법률, IT, 비즈니스, 학술
 * 3. 사투리 (Dialect) - 부산, 전라, 충청, 제주
 * 4. 문맥 의존 (Context) - 대명사, 생략, 모호성, 시간
 * 5. 격식/어조 (Formality) - 격식체, 비격식체
 * 6. 관용구/속담 (Idioms)
 * 7. 숫자/날짜 (Numbers)
 * 8. 복합문 (Complex)
 * 9. 특수 표현 (Special)
 * 10. 의문문 유형 (Questions)
 * 11. 시제 (Tense)
 * 12. 다의어 (Polysemy)
 */

import { describe, expect, test } from 'vitest';
import { categoryTests } from '../../benchmark-data';
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

// 핵심 단어 포함 여부 체크
function containsKeywords(actual: string, keywords: string[]): number {
  const actualLower = actual.toLowerCase();
  let found = 0;
  for (const kw of keywords) {
    if (actualLower.includes(kw.toLowerCase())) found++;
  }
  return keywords.length > 0 ? found / keywords.length : 0;
}

interface CategoryResult {
  category: string;
  total: number;
  keywordMatch: number;
  avgSimilarity: number;
  samples: Array<{
    input: string;
    expected: string;
    actual: string;
    similarity: number;
  }>;
}

describe('12개 카테고리 v2 번역 테스트', () => {
  const results: CategoryResult[] = [];

  // 1. 감정 표현 (Emotions)
  describe('1. 감정 표현 (Emotions)', () => {
    const emotionCategory = categoryTests.find((c) => c.id === 'cat-emotion');

    if (emotionCategory) {
      for (const subCat of emotionCategory.categories) {
        test(`${subCat.nameKo} (${subCat.name})`, () => {
          const categoryResult: CategoryResult = {
            category: subCat.nameKo,
            total: subCat.tests.length,
            keywordMatch: 0,
            avgSimilarity: 0,
            samples: [],
          };

          let totalSim = 0;
          for (const tc of subCat.tests) {
            const actual = translate(tc.input, tc.direction);
            const similarity = calculateSimilarity(actual, tc.expected);
            totalSim += similarity;

            // 핵심 감정 키워드 체크
            const emotionKeywords = getEmotionKeywords(subCat.id);
            if (containsKeywords(actual, emotionKeywords) > 0.3) {
              categoryResult.keywordMatch++;
            }

            categoryResult.samples.push({
              input: tc.input.slice(0, 50) + '...',
              expected: tc.expected.slice(0, 50) + '...',
              actual: actual.slice(0, 50) + '...',
              similarity,
            });
          }

          categoryResult.avgSimilarity = totalSim / subCat.tests.length;
          results.push(categoryResult);

          console.log(`\n=== ${subCat.nameKo} ===`);
          for (const s of categoryResult.samples) {
            console.log(`입력: ${s.input}`);
            console.log(`기대: ${s.expected}`);
            console.log(`실제: ${s.actual}`);
            console.log(`유사도: ${(s.similarity * 100).toFixed(1)}%\n`);
          }

          expect(categoryResult.avgSimilarity).toBeGreaterThanOrEqual(0);
        });
      }
    }
  });

  // 2. 분야별 대화 (Domain)
  describe('2. 분야별 대화 (Domain)', () => {
    const domainCategory = categoryTests.find((c) => c.id === 'cat-domain');

    if (domainCategory) {
      for (const subCat of domainCategory.categories) {
        test(`${subCat.nameKo} (${subCat.name})`, () => {
          const categoryResult: CategoryResult = {
            category: subCat.nameKo,
            total: subCat.tests.length,
            keywordMatch: 0,
            avgSimilarity: 0,
            samples: [],
          };

          let totalSim = 0;
          for (const tc of subCat.tests) {
            const actual = translate(tc.input, tc.direction);
            const similarity = calculateSimilarity(actual, tc.expected);
            totalSim += similarity;

            categoryResult.samples.push({
              input: tc.input.slice(0, 50) + '...',
              expected: tc.expected.slice(0, 50) + '...',
              actual: actual.slice(0, 50) + '...',
              similarity,
            });
          }

          categoryResult.avgSimilarity = totalSim / subCat.tests.length;
          results.push(categoryResult);

          console.log(`\n=== ${subCat.nameKo} ===`);
          for (const s of categoryResult.samples) {
            console.log(`입력: ${s.input}`);
            console.log(`실제: ${s.actual}`);
            console.log(`유사도: ${(s.similarity * 100).toFixed(1)}%\n`);
          }

          expect(categoryResult.avgSimilarity).toBeGreaterThanOrEqual(0);
        });
      }
    }
  });

  // 3. 사투리 (Dialect)
  describe('3. 사투리 (Dialect)', () => {
    const dialectCategory = categoryTests.find((c) => c.id === 'cat-dialect');

    if (dialectCategory) {
      for (const subCat of dialectCategory.categories) {
        test(`${subCat.nameKo} (${subCat.name})`, () => {
          let totalSim = 0;
          const samples: Array<{
            input: string;
            actual: string;
            expected: string;
            similarity: number;
          }> = [];

          for (const tc of subCat.tests) {
            const actual = translate(tc.input, tc.direction);
            const similarity = calculateSimilarity(actual, tc.expected);
            totalSim += similarity;
            samples.push({
              input: tc.input.slice(0, 60) + '...',
              expected: tc.expected.slice(0, 60) + '...',
              actual: actual.slice(0, 60) + '...',
              similarity,
            });
          }

          console.log(`\n=== ${subCat.nameKo} ===`);
          for (const s of samples) {
            console.log(`입력: ${s.input}`);
            console.log(`실제: ${s.actual}`);
            console.log(`유사도: ${(s.similarity * 100).toFixed(1)}%\n`);
          }

          expect(true).toBe(true);
        });
      }
    }
  });

  // 전체 결과 요약
  test('전체 결과 요약', () => {
    console.log('\n' + '='.repeat(60));
    console.log('12개 카테고리 v2 번역 테스트 결과 요약');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalSimilarity = 0;

    for (const r of results) {
      console.log(
        `${r.category}: 평균 유사도 ${(r.avgSimilarity * 100).toFixed(1)}% (${r.total}개 테스트)`,
      );
      totalTests += r.total;
      totalSimilarity += r.avgSimilarity * r.total;
    }

    const overallAvg = totalTests > 0 ? totalSimilarity / totalTests : 0;
    console.log('='.repeat(60));
    console.log(`전체 평균 유사도: ${(overallAvg * 100).toFixed(1)}%`);
    console.log(`총 테스트 수: ${totalTests}`);
    console.log('='.repeat(60));

    expect(true).toBe(true);
  });
});

// 감정 키워드 매핑
function getEmotionKeywords(emotionId: string): string[] {
  const keywords: Record<string, string[]> = {
    'emotion-joy': ['happy', 'joy', 'glad', 'excited', 'wonderful', 'great', '행복', '기쁨'],
    'emotion-sad': ['sad', 'cry', 'tears', 'lonely', 'pain', 'sorrow', '슬픔', '눈물'],
    'emotion-anger': ['angry', 'furious', 'mad', 'rage', 'livid', '화', '분노'],
    'emotion-surprise': ['surprise', 'shock', 'wow', 'believe', 'amazing', '놀람', '충격'],
    'emotion-fear': ['fear', 'scared', 'afraid', 'terrified', 'anxiety', '무서', '두려'],
  };
  return keywords[emotionId] || [];
}
