// ========================================
// WSD - 문맥 점수 계산 (Context Scorer)
// 문맥 윈도우 기반 의미 선택
// ========================================

import { polysemyMap, type Sense } from './polysemy-dict';

/**
 * 문맥 윈도우
 */
export interface ContextWindow {
  /** 대상 단어 앞의 토큰들 */
  before: string[];
  /** 대상 단어 뒤의 토큰들 */
  after: string[];
  /** 전체 문장 */
  full: string;
}

/**
 * WSD 결과
 */
export interface WsdResult {
  /** 원본 단어 */
  word: string;
  /** 선택된 의미 */
  sense: Sense;
  /** 점수 */
  score: number;
  /** 확신도 (0-1, 1위와 2위 점수 차이 기반) */
  confidence: number;
}

/**
 * 문맥 윈도우 추출
 * @param tokens 토큰 배열
 * @param targetIndex 대상 단어 인덱스
 * @param windowSize 윈도우 크기 (기본: 3)
 */
export function extractContext(
  tokens: string[],
  targetIndex: number,
  windowSize = 3
): ContextWindow {
  return {
    before: tokens.slice(Math.max(0, targetIndex - windowSize), targetIndex),
    after: tokens.slice(targetIndex + 1, targetIndex + 1 + windowSize),
    full: tokens.join(' '),
  };
}

/**
 * 어간 추출 (간단 버전 - 조사/어미 제거)
 */
function extractStem(word: string): string {
  // 조사 제거
  const particles = [
    '을',
    '를',
    '이',
    '가',
    '은',
    '는',
    '에',
    '에서',
    '로',
    '으로',
    '와',
    '과',
    '도',
    '만',
    '의',
    '에게',
  ];
  for (const p of particles) {
    if (word.endsWith(p) && word.length > p.length) {
      return word.slice(0, -p.length);
    }
  }

  // 어미 제거 (복합 어미부터, 긴 것부터 체크)
  const endings = [
    // 복합 어미 (긴 것부터)
    '았습니다',
    '었습니다',
    '였습니다',
    '으셨다',
    '습니다',
    '입니다',
    '셨어요',
    '았어요',
    '었어요',
    '였어요',
    '았었다',
    '었었다',
    '았다',
    '었다',
    '였다',
    '으며',
    '면서',
    '세요',
    '어요',
    '아요',
    '는다',
    'ㄴ다',
    '니다',
    '려고',
    '니까',
    '으니',
    '아서',
    '어서',
    '면',
    '요',
    '다',
    '았',
    '었',
    '겠',
    // 단일 연결어미 (짧은 것 마지막에)
    '서',
    '며',
    '고',
    '니',
    '게',
    '지',
  ];
  for (const e of endings) {
    if (word.endsWith(e) && word.length > e.length) {
      return word.slice(0, -e.length);
    }
  }

  return word;
}

/**
 * 원본 단어와 어간 모두에서 트리거 매칭
 */
function matchesTrigger(word: string, stem: string, trigger: string): boolean {
  // 어간에서 트리거를 포함하는지 체크
  if (stem.includes(trigger)) {
    return true;
  }
  // 원본 단어에서도 트리거를 포함하는지 체크
  if (word.includes(trigger)) {
    return true;
  }
  return false;
}

/**
 * 트리거 매칭 점수 계산
 * @param triggers 트리거 단어 목록
 * @param beforeWords 대상 단어 앞의 문맥 (가까운 것이 앞)
 * @param afterWords 대상 단어 뒤의 문맥 (가까운 것이 앞)
 * @param fullText 전체 문장
 */
function calculateTriggerScore(
  triggers: string[],
  beforeWords: string[],
  afterWords: string[],
  fullText: string
): number {
  let score = 0;

  // 각 위치에서 한 번만 점수 부여 (중복 방지)
  let firstAfterMatched = false;
  let lastBeforeMatched = false;
  const otherMatchedPositions = new Set<number>();
  let fullTextMatched = false;

  // 원본 단어와 어간 미리 추출
  const firstAfter = afterWords[0] || '';
  const lastBefore = beforeWords[beforeWords.length - 1] || '';
  const firstAfterStem = firstAfter ? extractStem(firstAfter) : '';
  const lastBeforeStem = lastBefore ? extractStem(lastBefore) : '';
  const otherContext = [...beforeWords.slice(0, -1), ...afterWords.slice(1)];
  const otherStems = otherContext.map((w) => extractStem(w));

  for (const trigger of triggers) {
    // 바로 뒤 단어 체크 (목적어-동사 관계에서 가장 중요, 가중치: 4.0)
    // 한 번만 점수 부여
    // 원본 단어와 어간 모두에서 트리거 매칭
    if (!firstAfterMatched && firstAfter) {
      if (matchesTrigger(firstAfter, firstAfterStem, trigger)) {
        score += 4.0;
        firstAfterMatched = true;
        continue;
      }
    }

    // 바로 앞 단어 체크 (형용사-명사 관계, 가중치: 3.0)
    if (!lastBeforeMatched && lastBefore) {
      if (matchesTrigger(lastBefore, lastBeforeStem, trigger)) {
        score += 3.0;
        lastBeforeMatched = true;
        continue;
      }
    }

    // 나머지 문맥 단어에서 매칭 (가중치: 1.5, 각 위치당 한 번)
    let foundInOther = false;
    for (let i = 0; i < otherContext.length; i++) {
      if (otherMatchedPositions.has(i)) continue;
      const otherWord = otherContext[i] || '';
      const otherStem = otherStems[i] || '';
      if (matchesTrigger(otherWord, otherStem, trigger)) {
        score += 1.5;
        otherMatchedPositions.add(i);
        foundInOther = true;
        break;
      }
    }
    if (foundInOther) continue;

    // 전체 문장에서 매칭 (가중치: 0.3, 한 번만)
    if (!fullTextMatched && fullText.includes(trigger)) {
      score += 0.3;
      fullTextMatched = true;
    }
  }

  return score;
}

/**
 * 의미별 점수 계산
 * @param sense 의미 정보
 * @param context 문맥 윈도우
 * @param domainBonus 도메인 일치 시 추가 점수
 */
export function scoreSense(sense: Sense, context: ContextWindow, domainBonus = 0): number {
  // 기본 빈도 점수
  let score = sense.weight;

  // 트리거 매칭 점수 (위치 기반 가중치 적용)
  score += calculateTriggerScore(sense.triggers, context.before, context.after, context.full);

  // 도메인 보너스
  score += domainBonus;

  return score;
}

/**
 * 최적 의미 선택 (WSD 메인 함수)
 * @param word 대상 단어
 * @param context 문맥 윈도우
 * @param topDomain 문장의 주요 도메인 (옵션)
 */
export function disambiguate(
  word: string,
  context: ContextWindow,
  topDomain?: string | null
): WsdResult | null {
  const polysemy = polysemyMap.get(word);
  if (!polysemy) return null;

  const scores: { sense: Sense; score: number }[] = [];

  for (const sense of polysemy.senses) {
    // 도메인 일치 보너스
    const domainBonus = topDomain && sense.domain === topDomain ? 1.5 : 0;
    const score = scoreSense(sense, context, domainBonus);
    scores.push({ sense, score });
  }

  // 점수순 정렬
  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  if (!best) return null;

  const second = scores[1];

  // 확신도 계산 (1위와 2위 점수 차이 기반)
  let confidence = 1;
  if (second) {
    const diff = best.score - second.score;
    // 차이가 클수록 확신도가 높음
    confidence = Math.min(1, diff / (best.score + 0.001));
  }

  return {
    word,
    sense: best.sense,
    score: best.score,
    confidence,
  };
}

/**
 * 문장 내 모든 다의어 해소
 * @param tokens 토큰 배열
 * @param topDomain 문장의 주요 도메인 (옵션)
 */
export function disambiguateAll(
  tokens: string[],
  topDomain?: string | null
): Map<number, WsdResult> {
  const results = new Map<number, WsdResult>();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    // 어간 추출하여 다의어 사전 조회
    const stem = extractStem(token);

    if (polysemyMap.has(stem)) {
      const context = extractContext(tokens, i);
      const result = disambiguate(stem, context, topDomain);
      if (result) {
        results.set(i, result);
      }
    }
  }

  return results;
}

/**
 * 단일 단어 WSD (간편 함수)
 * @param word 대상 단어
 * @param sentence 전체 문장
 */
export function getWordSense(word: string, sentence: string): string | null {
  const tokens = sentence.split(/\s+/);
  const wordIndex = tokens.findIndex((t) => {
    const stem = extractStem(t);
    return stem === word || t === word;
  });

  if (wordIndex === -1) {
    // 문장에 단어가 없으면 문장 전체를 문맥으로 사용
    const context: ContextWindow = {
      before: tokens.slice(0, Math.min(3, tokens.length)),
      after: tokens.slice(Math.max(0, tokens.length - 3)),
      full: sentence,
    };
    const result = disambiguate(word, context);
    return result?.sense.en || null;
  }

  const context = extractContext(tokens, wordIndex);
  const result = disambiguate(word, context);
  return result?.sense.en || null;
}
