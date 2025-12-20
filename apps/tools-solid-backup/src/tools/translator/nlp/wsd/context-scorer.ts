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
 * @param windowSize 윈도우 크기 (기본: 7, 확장됨)
 */
export function extractContext(
  tokens: string[],
  targetIndex: number,
  windowSize = 7,
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

// ========================================
// 신호 가중치 (튜닝 가능)
// ========================================
export const SIGNAL_WEIGHTS = {
  // 위치 기반 가중치
  immediateAfter: 4.0, // 바로 뒤 단어 (목적어-동사)
  immediateBefore: 3.0, // 바로 앞 단어 (형용사-명사)
  nearContext: 2.0, // 가까운 문맥 (±2 토큰)
  farContext: 1.0, // 먼 문맥 (±3~7 토큰)
  fullSentence: 0.3, // 문장 어딘가에 포함

  // 도메인/주제 가중치
  domainMatch: 1.5, // 주제와 sense.domain 일치

  // 문법 역할 가중치
  subjectBodyPart: 2.5, // 주어 + 신체 도메인 (배가 아프다)
  objectWithVerb: 2.0, // 목적어 + 동사 연어 (배를 타다)

  // 패턴 가중치
  painPattern: 3.0, // "X가 아프다" 패턴
  ridePattern: 3.0, // "X를 타다" 패턴
  eatPattern: 2.5, // "X를 먹다" 패턴
};

/**
 * 거리 기반 가중치 계산
 * 가까울수록 높은 점수
 */
function getDistanceWeight(distance: number): number {
  if (distance <= 1) return SIGNAL_WEIGHTS.immediateAfter;
  if (distance <= 2) return SIGNAL_WEIGHTS.nearContext;
  if (distance <= 4) return SIGNAL_WEIGHTS.farContext;
  return SIGNAL_WEIGHTS.fullSentence;
}

/**
 * 트리거 매칭 점수 계산 (확장된 버전)
 * @param triggers 트리거 단어 목록
 * @param beforeWords 대상 단어 앞의 문맥 (가까운 것이 뒤)
 * @param afterWords 대상 단어 뒤의 문맥 (가까운 것이 앞)
 * @param fullText 전체 문장
 */
function calculateTriggerScore(
  triggers: string[],
  beforeWords: string[],
  afterWords: string[],
  fullText: string,
): number {
  let score = 0;

  // 각 위치에서 한 번만 점수 부여 (중복 방지)
  const matchedPositions = new Set<string>();
  let fullTextMatched = false;

  // 원본 단어와 어간 미리 추출
  const beforeStems = beforeWords.map((w) => extractStem(w));
  const afterStems = afterWords.map((w) => extractStem(w));

  for (const trigger of triggers) {
    // 뒤 문맥 검사 (거리 기반 가중치)
    for (let i = 0; i < afterWords.length; i++) {
      const posKey = `after_${i}`;
      if (matchedPositions.has(posKey)) continue;

      const word = afterWords[i] || '';
      const stem = afterStems[i] || '';
      if (matchesTrigger(word, stem, trigger)) {
        const distance = i + 1; // 1-indexed 거리
        score += getDistanceWeight(distance);
        matchedPositions.add(posKey);
        break; // 이 트리거는 처리됨
      }
    }

    // 앞 문맥 검사 (거리 기반 가중치, 역순)
    for (let i = beforeWords.length - 1; i >= 0; i--) {
      const posKey = `before_${i}`;
      if (matchedPositions.has(posKey)) continue;

      const word = beforeWords[i] || '';
      const stem = beforeStems[i] || '';
      if (matchesTrigger(word, stem, trigger)) {
        const distance = beforeWords.length - i; // 1-indexed 거리
        score += getDistanceWeight(distance);
        matchedPositions.add(posKey);
        break; // 이 트리거는 처리됨
      }
    }

    // 전체 문장에서 매칭 (한 번만)
    if (!fullTextMatched && fullText.includes(trigger)) {
      score += SIGNAL_WEIGHTS.fullSentence;
      fullTextMatched = true;
    }
  }

  return score;
}

// ========================================
// 문법 패턴 정의
// ========================================
interface GrammarPattern {
  /** 패턴 이름 */
  name: string;
  /** 대상 단어의 조사 */
  particle: string;
  /** 뒤따르는 동사/형용사 어간 */
  followingStems: string[];
  /** 해당 도메인에 보너스 */
  targetDomain: string;
  /** 가중치 */
  weight: number;
}

const GRAMMAR_PATTERNS: GrammarPattern[] = [
  // "X가 아프다" → 신체 부위
  {
    name: 'pain',
    particle: '가',
    followingStems: ['아프', '아파', '쑤시', '저리', '뻐근'],
    targetDomain: 'body',
    weight: SIGNAL_WEIGHTS.painPattern,
  },
  // "X를 타다" → 교통수단
  {
    name: 'ride',
    particle: '를',
    followingStems: ['타', '탔', '타고'],
    targetDomain: 'transport',
    weight: SIGNAL_WEIGHTS.ridePattern,
  },
  // "X를 먹다" → 음식
  {
    name: 'eat',
    particle: '를',
    followingStems: ['먹', '먹었', '먹고', '깎', '씹'],
    targetDomain: 'food',
    weight: SIGNAL_WEIGHTS.eatPattern,
  },
  // "X가 오다/내리다" → 날씨 (눈, 비)
  {
    name: 'weather_fall',
    particle: '가',
    followingStems: ['오', '와', '내리', '내려', '쏟아지'],
    targetDomain: 'weather',
    weight: 3.0,
  },
  // "X를 마시다" → 음료
  {
    name: 'drink',
    particle: '를',
    followingStems: ['마시', '마셔', '마셨'],
    targetDomain: 'food',
    weight: 2.5,
  },
  // "X가 뜨다/감다" → 눈(eye)
  {
    name: 'eye_action',
    particle: '가',
    followingStems: ['뜨', '떠', '감', '감았', '깜빡'],
    targetDomain: 'body',
    weight: 3.0,
  },
  // "X를 건너다" → 다리(bridge)
  {
    name: 'cross',
    particle: '를',
    followingStems: ['건너', '건넜'],
    targetDomain: 'structure',
    weight: 3.0,
  },
];

/**
 * 문법 패턴 점수 계산
 * @param word 원본 단어 (조사 포함)
 * @param sense 의미 정보
 * @param afterWords 뒤따르는 단어들
 */
function calculatePatternScore(word: string, sense: Sense, afterWords: string[]): number {
  let score = 0;

  for (const pattern of GRAMMAR_PATTERNS) {
    // 조사 확인
    if (!word.endsWith(pattern.particle)) continue;

    // 도메인 일치 확인
    if (sense.domain !== pattern.targetDomain) continue;

    // 뒤따르는 동사/형용사 확인
    for (const afterWord of afterWords) {
      const afterStem = extractStem(afterWord);
      for (const stem of pattern.followingStems) {
        if (afterStem.includes(stem) || afterWord.includes(stem)) {
          score += pattern.weight;
          break;
        }
      }
      if (score > 0) break; // 첫 매칭만
    }
  }

  return score;
}

/**
 * 의미별 점수 계산 (확장된 버전)
 * @param sense 의미 정보
 * @param context 문맥 윈도우
 * @param domainBonus 도메인 일치 시 추가 점수
 * @param originalWord 원본 단어 (조사 포함, 패턴 분석용)
 */
export function scoreSense(
  sense: Sense,
  context: ContextWindow,
  domainBonus = 0,
  originalWord?: string,
): number {
  // 기본 빈도 점수
  let score = sense.weight;

  // 트리거 매칭 점수 (위치 기반 가중치 적용)
  score += calculateTriggerScore(sense.triggers, context.before, context.after, context.full);

  // 도메인 보너스
  score += domainBonus;

  // 문법 패턴 보너스 (원본 단어가 있을 때만)
  if (originalWord) {
    score += calculatePatternScore(originalWord, sense, context.after);
  }

  return score;
}

/**
 * 최적 의미 선택 (WSD 메인 함수)
 * @param word 대상 단어 (어간)
 * @param context 문맥 윈도우
 * @param topDomain 문장의 주요 도메인 (옵션)
 * @param originalWord 원본 단어 (조사 포함, 패턴 분석용)
 */
export function disambiguate(
  word: string,
  context: ContextWindow,
  topDomain?: string | null,
  originalWord?: string,
): WsdResult | null {
  const polysemy = polysemyMap.get(word);
  if (!polysemy) return null;

  const scores: { sense: Sense; score: number }[] = [];

  for (const sense of polysemy.senses) {
    // 도메인 일치 보너스
    const domainBonus = topDomain && sense.domain === topDomain ? SIGNAL_WEIGHTS.domainMatch : 0;
    const score = scoreSense(sense, context, domainBonus, originalWord);
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
  topDomain?: string | null,
): Map<number, WsdResult> {
  const results = new Map<number, WsdResult>();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    // 어간 추출하여 다의어 사전 조회
    const stem = extractStem(token);

    if (polysemyMap.has(stem)) {
      const context = extractContext(tokens, i);
      // 원본 토큰을 패턴 분석용으로 전달
      const result = disambiguate(stem, context, topDomain, token);
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
