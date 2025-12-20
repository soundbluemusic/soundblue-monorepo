// ========================================
// WSD - 가중치 최적화 (Weight Optimizer)
// 유전 알고리즘 스타일 가중치 튜닝
// 빌드 시점에 실행하여 최적 가중치 탐색
// ========================================

import { disambiguate, extractContext, SIGNAL_WEIGHTS } from './context-scorer';
import { polysemyMap } from './polysemy-dict';

/**
 * WSD 테스트 케이스
 */
export interface WsdTestCase {
  /** 테스트 ID */
  id: string;
  /** 입력 문장 */
  sentence: string;
  /** 대상 단어 (어간) */
  targetWord: string;
  /** 원본 단어 (조사 포함) */
  originalWord: string;
  /** 예상 의미 ID */
  expectedSenseId: string;
  /** 난이도 가중치 (1-3) */
  weight?: number;
}

/**
 * 가중치 설정
 */
export interface WeightConfig {
  immediateAfter: number;
  immediateBefore: number;
  nearContext: number;
  farContext: number;
  fullSentence: number;
  domainMatch: number;
  painPattern: number;
  ridePattern: number;
  eatPattern: number;
}

/**
 * 최적화 결과
 */
export interface OptimizationResult {
  /** 최적 가중치 */
  bestWeights: WeightConfig;
  /** 최종 점수 (0-1) */
  bestScore: number;
  /** 세대 수 */
  generations: number;
  /** 테스트 결과 상세 */
  testResults: {
    testId: string;
    passed: boolean;
    actualSenseId: string;
    expectedSenseId: string;
  }[];
}

/**
 * WSD 테스트 케이스 (기본 제공)
 * 동음이의어/다의어 문장 기반
 */
export const WSD_TEST_CASES: WsdTestCase[] = [
  // 배 (stomach/boat/pear/times)
  {
    id: 'bae-1',
    sentence: '배가 아파서 병원에 갔다',
    targetWord: '배',
    originalWord: '배가',
    expectedSenseId: 'belly',
    weight: 2,
  },
  {
    id: 'bae-2',
    sentence: '배를 타고 섬에 갔다',
    targetWord: '배',
    originalWord: '배를',
    expectedSenseId: 'boat',
    weight: 2,
  },
  {
    id: 'bae-3',
    sentence: '달콤한 배를 먹었다',
    targetWord: '배',
    originalWord: '배를',
    expectedSenseId: 'pear',
    weight: 2,
  },
  {
    id: 'bae-4',
    sentence: '세 배로 증가했다',
    targetWord: '배',
    originalWord: '배로',
    expectedSenseId: 'times',
    weight: 1,
  },
  {
    id: 'bae-5',
    sentence: '배가 고파서 밥을 먹었다',
    targetWord: '배',
    originalWord: '배가',
    expectedSenseId: 'belly',
    weight: 2,
  },

  // 눈 (eye/snow)
  {
    id: 'nun-1',
    sentence: '눈이 내려서 길이 미끄럽다',
    targetWord: '눈',
    originalWord: '눈이',
    expectedSenseId: 'snow',
    weight: 2,
  },
  {
    id: 'nun-2',
    sentence: '눈을 감고 생각했다',
    targetWord: '눈',
    originalWord: '눈을',
    expectedSenseId: 'eye',
    weight: 2,
  },
  {
    id: 'nun-3',
    sentence: '눈이 크고 예쁘다',
    targetWord: '눈',
    originalWord: '눈이',
    expectedSenseId: 'eye',
    weight: 2,
  },
  {
    id: 'nun-4',
    sentence: '하얀 눈이 쌓였다',
    targetWord: '눈',
    originalWord: '눈이',
    expectedSenseId: 'snow',
    weight: 2,
  },

  // 밤 (night/chestnut)
  {
    id: 'bam-1',
    sentence: '밤에 잠을 잤다',
    targetWord: '밤',
    originalWord: '밤에',
    expectedSenseId: 'night',
    weight: 1,
  },
  {
    id: 'bam-2',
    sentence: '군밤을 먹었다',
    targetWord: '밤',
    originalWord: '군밤을',
    expectedSenseId: 'chestnut',
    weight: 2,
  },
  {
    id: 'bam-3',
    sentence: '밤새 공부했다',
    targetWord: '밤',
    originalWord: '밤새',
    expectedSenseId: 'night',
    weight: 1,
  },

  // 차 (car/tea/difference)
  {
    id: 'cha-1',
    sentence: '차를 타고 회사에 갔다',
    targetWord: '차',
    originalWord: '차를',
    expectedSenseId: 'car',
    weight: 2,
  },
  {
    id: 'cha-2',
    sentence: '따뜻한 차를 마셨다',
    targetWord: '차',
    originalWord: '차를',
    expectedSenseId: 'tea',
    weight: 2,
  },
  {
    id: 'cha-3',
    sentence: '점수 차가 크다',
    targetWord: '차',
    originalWord: '차가',
    expectedSenseId: 'difference',
    weight: 1,
  },

  // 다리 (leg/bridge)
  {
    id: 'dari-1',
    sentence: '다리가 아파서 쉬었다',
    targetWord: '다리',
    originalWord: '다리가',
    expectedSenseId: 'leg',
    weight: 2,
  },
  {
    id: 'dari-2',
    sentence: '다리를 건너서 갔다',
    targetWord: '다리',
    originalWord: '다리를',
    expectedSenseId: 'bridge',
    weight: 2,
  },
  {
    id: 'dari-3',
    sentence: '강 위에 다리가 있다',
    targetWord: '다리',
    originalWord: '다리가',
    expectedSenseId: 'bridge',
    weight: 2,
  },

  // 말 (word/horse/end)
  {
    id: 'mal-1',
    sentence: '좋은 말을 했다',
    targetWord: '말',
    originalWord: '말을',
    expectedSenseId: 'word',
    weight: 1,
  },
  {
    id: 'mal-2',
    sentence: '말을 타고 달렸다',
    targetWord: '말',
    originalWord: '말을',
    expectedSenseId: 'horse',
    weight: 2,
  },
  {
    id: 'mal-3',
    sentence: '이번 달 말에 마감이다',
    targetWord: '말',
    originalWord: '말에',
    expectedSenseId: 'end',
    weight: 1,
  },

  // 사과 (apple/apology)
  {
    id: 'sagwa-1',
    sentence: '빨간 사과를 먹었다',
    targetWord: '사과',
    originalWord: '사과를',
    expectedSenseId: 'apple',
    weight: 2,
  },
  {
    id: 'sagwa-2',
    sentence: '진심으로 사과했다',
    targetWord: '사과',
    originalWord: '사과했다',
    expectedSenseId: 'apology',
    weight: 2,
  },

  // 비 (rain/ratio)
  {
    id: 'bi-1',
    sentence: '비가 내려서 우산을 썼다',
    targetWord: '비',
    originalWord: '비가',
    expectedSenseId: 'rain',
    weight: 2,
  },
  {
    id: 'bi-2',
    sentence: '황금비로 계산했다',
    targetWord: '비',
    originalWord: '황금비로',
    expectedSenseId: 'ratio',
    weight: 1,
  },

  // 새 (bird/new)
  {
    id: 'sae-1',
    sentence: '새가 날아갔다',
    targetWord: '새',
    originalWord: '새가',
    expectedSenseId: 'bird',
    weight: 2,
  },
  {
    id: 'sae-2',
    sentence: '새 옷을 샀다',
    targetWord: '새',
    originalWord: '새',
    expectedSenseId: 'new',
    weight: 1,
  },

  // 창 (window/spear)
  {
    id: 'chang-1',
    sentence: '창을 열었다',
    targetWord: '창',
    originalWord: '창을',
    expectedSenseId: 'window',
    weight: 2,
  },
  {
    id: 'chang-2',
    sentence: '창과 방패로 싸웠다',
    targetWord: '창',
    originalWord: '창과',
    expectedSenseId: 'spear',
    weight: 2,
  },
];

/**
 * 단일 테스트 케이스 평가
 */
function evaluateTestCase(testCase: WsdTestCase, _weights: WeightConfig): boolean {
  const tokens = testCase.sentence.split(/\s+/);
  const targetIndex = tokens.findIndex((t) => t.includes(testCase.targetWord));

  if (targetIndex === -1) {
    // 복합어인 경우 (군밤, 월말 등) 어간으로 다시 찾기
    const polysemy = polysemyMap.get(testCase.targetWord);
    if (!polysemy) return false;

    // 문장 전체를 문맥으로 사용
    const context = {
      before: tokens.slice(0, Math.min(3, tokens.length)),
      after: tokens.slice(Math.max(0, tokens.length - 3)),
      full: testCase.sentence,
    };

    const result = disambiguate(testCase.targetWord, context, null, testCase.originalWord);
    return result?.sense.id === testCase.expectedSenseId;
  }

  const context = extractContext(tokens, targetIndex, 7);
  const result = disambiguate(testCase.targetWord, context, null, testCase.originalWord);

  return result?.sense.id === testCase.expectedSenseId;
}

/**
 * 전체 테스트 점수 계산
 */
function calculateScore(testCases: WsdTestCase[], weights: WeightConfig): number {
  let totalWeight = 0;
  let passedWeight = 0;

  // 임시로 가중치 적용
  const originalWeights = { ...SIGNAL_WEIGHTS };
  Object.assign(SIGNAL_WEIGHTS, weights);

  for (const testCase of testCases) {
    const weight = testCase.weight || 1;
    totalWeight += weight;

    if (evaluateTestCase(testCase, weights)) {
      passedWeight += weight;
    }
  }

  // 원래 가중치 복원
  Object.assign(SIGNAL_WEIGHTS, originalWeights);

  return passedWeight / totalWeight;
}

/**
 * 가중치 변이 (mutation)
 */
function mutateWeights(weights: WeightConfig, mutationRate = 0.2): WeightConfig {
  const mutated = { ...weights };
  const keys = Object.keys(mutated) as (keyof WeightConfig)[];

  for (const key of keys) {
    if (Math.random() < mutationRate) {
      // ±30% 범위 내에서 변이
      const delta = (Math.random() - 0.5) * 0.6 * mutated[key];
      mutated[key] = Math.max(0.1, mutated[key] + delta);
    }
  }

  return mutated;
}

/**
 * 교차 (crossover)
 */
function crossover(parent1: WeightConfig, parent2: WeightConfig): WeightConfig {
  const child: WeightConfig = {} as WeightConfig;
  const keys = Object.keys(parent1) as (keyof WeightConfig)[];

  for (const key of keys) {
    // 랜덤하게 부모 중 하나 선택 또는 평균
    const choice = Math.random();
    if (choice < 0.4) {
      child[key] = parent1[key];
    } else if (choice < 0.8) {
      child[key] = parent2[key];
    } else {
      // 평균
      child[key] = (parent1[key] + parent2[key]) / 2;
    }
  }

  return child;
}

/**
 * 초기 가중치 생성
 */
function getInitialWeights(): WeightConfig {
  return {
    immediateAfter: SIGNAL_WEIGHTS.immediateAfter,
    immediateBefore: SIGNAL_WEIGHTS.immediateBefore,
    nearContext: SIGNAL_WEIGHTS.nearContext,
    farContext: SIGNAL_WEIGHTS.farContext,
    fullSentence: SIGNAL_WEIGHTS.fullSentence,
    domainMatch: SIGNAL_WEIGHTS.domainMatch,
    painPattern: SIGNAL_WEIGHTS.painPattern,
    ridePattern: SIGNAL_WEIGHTS.ridePattern,
    eatPattern: SIGNAL_WEIGHTS.eatPattern,
  };
}

/**
 * 랜덤 가중치 생성
 */
function randomWeights(): WeightConfig {
  const base = getInitialWeights();
  const keys = Object.keys(base) as (keyof WeightConfig)[];

  for (const key of keys) {
    // 기본값의 0.5~2배 범위
    base[key] = base[key] * (0.5 + Math.random() * 1.5);
  }

  return base;
}

/**
 * 유전 알고리즘 기반 가중치 최적화
 */
export function optimizeWeights(
  testCases: WsdTestCase[] = WSD_TEST_CASES,
  options: {
    populationSize?: number;
    generations?: number;
    eliteCount?: number;
    mutationRate?: number;
  } = {},
): OptimizationResult {
  const { populationSize = 20, generations = 50, eliteCount = 4, mutationRate = 0.2 } = options;

  // 초기 개체군 생성
  let population: { weights: WeightConfig; score: number }[] = [];

  // 현재 가중치를 첫 번째로 추가
  population.push({
    weights: getInitialWeights(),
    score: calculateScore(testCases, getInitialWeights()),
  });

  // 나머지는 랜덤 생성
  for (let i = 1; i < populationSize; i++) {
    const weights = randomWeights();
    population.push({
      weights,
      score: calculateScore(testCases, weights),
    });
  }

  let bestOverall: { weights: WeightConfig; score: number } = population[0] || {
    weights: getInitialWeights(),
    score: 0,
  };

  // 세대 반복
  for (let gen = 0; gen < generations; gen++) {
    // 점수순 정렬
    population.sort((a, b) => b.score - a.score);

    // 최고 기록 갱신
    const top = population[0];
    if (top && top.score > bestOverall.score) {
      bestOverall = { ...top };
    }

    // 조기 종료 (100% 달성)
    if (bestOverall.score >= 1.0) {
      break;
    }

    // 엘리트 선택
    const newPopulation = population.slice(0, eliteCount);

    // 나머지는 교차 + 변이로 생성
    while (newPopulation.length < populationSize) {
      // 토너먼트 선택
      const parent1 = tournamentSelect(population);
      const parent2 = tournamentSelect(population);

      // 교차
      let child = crossover(parent1.weights, parent2.weights);

      // 변이
      child = mutateWeights(child, mutationRate);

      // 점수 계산
      const score = calculateScore(testCases, child);
      newPopulation.push({ weights: child, score });
    }

    population = newPopulation;
  }

  // 최종 결과 상세 정보 생성
  const originalWeights = { ...SIGNAL_WEIGHTS };
  Object.assign(SIGNAL_WEIGHTS, bestOverall.weights);

  const testResults = testCases.map((testCase) => {
    const tokens = testCase.sentence.split(/\s+/);
    const targetIndex = tokens.findIndex((t) => t.includes(testCase.targetWord));

    let actualSenseId = 'unknown';

    if (targetIndex !== -1) {
      const context = extractContext(tokens, targetIndex, 7);
      const result = disambiguate(testCase.targetWord, context, null, testCase.originalWord);
      actualSenseId = result?.sense.id || 'unknown';
    } else {
      // 복합어 처리
      const context = {
        before: tokens.slice(0, Math.min(3, tokens.length)),
        after: tokens.slice(Math.max(0, tokens.length - 3)),
        full: testCase.sentence,
      };
      const result = disambiguate(testCase.targetWord, context, null, testCase.originalWord);
      actualSenseId = result?.sense.id || 'unknown';
    }

    return {
      testId: testCase.id,
      passed: actualSenseId === testCase.expectedSenseId,
      actualSenseId,
      expectedSenseId: testCase.expectedSenseId,
    };
  });

  // 원래 가중치 복원
  Object.assign(SIGNAL_WEIGHTS, originalWeights);

  return {
    bestWeights: bestOverall.weights,
    bestScore: bestOverall.score,
    generations,
    testResults,
  };
}

/**
 * 토너먼트 선택
 */
function tournamentSelect(
  population: { weights: WeightConfig; score: number }[],
  tournamentSize = 3,
): { weights: WeightConfig; score: number } {
  let best = population[Math.floor(Math.random() * population.length)];

  for (let i = 1; i < tournamentSize; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (candidate && candidate.score > (best?.score || 0)) {
      best = candidate;
    }
  }

  return best || population[0] || { weights: getInitialWeights(), score: 0 };
}

/**
 * 현재 가중치로 테스트 실행
 */
export function runWsdTests(testCases: WsdTestCase[] = WSD_TEST_CASES): {
  passed: number;
  total: number;
  score: number;
  details: { testId: string; passed: boolean; actualSenseId: string; expectedSenseId: string }[];
} {
  let passed = 0;
  const details: {
    testId: string;
    passed: boolean;
    actualSenseId: string;
    expectedSenseId: string;
  }[] = [];

  for (const testCase of testCases) {
    const tokens = testCase.sentence.split(/\s+/);
    const targetIndex = tokens.findIndex((t) => t.includes(testCase.targetWord));

    let actualSenseId = 'unknown';
    let isPassed = false;

    if (targetIndex !== -1) {
      const context = extractContext(tokens, targetIndex, 7);
      const result = disambiguate(testCase.targetWord, context, null, testCase.originalWord);
      actualSenseId = result?.sense.id || 'unknown';
      isPassed = actualSenseId === testCase.expectedSenseId;
    } else {
      // 복합어 처리
      const context = {
        before: tokens.slice(0, Math.min(3, tokens.length)),
        after: tokens.slice(Math.max(0, tokens.length - 3)),
        full: testCase.sentence,
      };
      const result = disambiguate(testCase.targetWord, context, null, testCase.originalWord);
      actualSenseId = result?.sense.id || 'unknown';
      isPassed = actualSenseId === testCase.expectedSenseId;
    }

    if (isPassed) passed++;
    details.push({
      testId: testCase.id,
      passed: isPassed,
      actualSenseId,
      expectedSenseId: testCase.expectedSenseId,
    });
  }

  return {
    passed,
    total: testCases.length,
    score: passed / testCases.length,
    details,
  };
}

/**
 * 가중치 설정 내보내기 (코드 생성용)
 */
export function exportWeightsAsCode(weights: WeightConfig): string {
  return `export const OPTIMIZED_SIGNAL_WEIGHTS = {
  // 위치 기반 가중치
  immediateAfter: ${weights.immediateAfter.toFixed(2)},
  immediateBefore: ${weights.immediateBefore.toFixed(2)},
  nearContext: ${weights.nearContext.toFixed(2)},
  farContext: ${weights.farContext.toFixed(2)},
  fullSentence: ${weights.fullSentence.toFixed(2)},

  // 도메인/주제 가중치
  domainMatch: ${weights.domainMatch.toFixed(2)},

  // 패턴 가중치
  painPattern: ${weights.painPattern.toFixed(2)},
  ridePattern: ${weights.ridePattern.toFixed(2)},
  eatPattern: ${weights.eatPattern.toFixed(2)},
};`;
}
