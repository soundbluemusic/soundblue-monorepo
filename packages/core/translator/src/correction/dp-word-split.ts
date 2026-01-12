// ========================================
// DP 기반 띄어쓰기 복구 (붙어쓴 문장 분리)
// 예: "나는일찍일어나서일을했어" → "나는 일찍 일어나서 일을 했어"
// ========================================

import { isHangul } from '@soundblue/hangul';
import { koToEnWords } from '../dictionary/entries/words';

/**
 * 한국어 단어 사전 Set (O(1) 조회용)
 * words.ts에서 키만 추출
 */
export const KOREAN_WORD_SET: Set<string> = new Set(Object.keys(koToEnWords));

/**
 * 조사 목록 (분리 대상 아님 - 명사에 붙음)
 */
export const KOREAN_PARTICLES = new Set([
  '이',
  '가',
  '을',
  '를',
  '은',
  '는',
  '의',
  '에',
  '에서',
  '로',
  '으로',
  '와',
  '과',
  '랑',
  '이랑',
  '에게',
  '한테',
  '께',
  '도',
  '만',
  '까지',
  '부터',
  '마저',
  '조차',
  '밖에',
  '요',
]);

/**
 * 어미 목록 (동사에 붙음 - 분리점 판단용)
 */
export const KOREAN_ENDINGS = new Set([
  // 종결 어미
  '다',
  '요',
  '습니다',
  '니다',
  '어',
  '아',
  '아요',
  '어요',
  '았어',
  '었어',
  '았어요',
  '었어요',
  '았다',
  '었다',
  '겠어',
  '겠어요',
  '네',
  '네요',
  '지',
  '지요',
  '죠',
  // 연결 어미
  '고',
  '서',
  '면',
  '니까',
  '지만',
  '으면',
  '아서',
  '어서',
  '으니까',
  '니',
  '며',
  '면서',
  '자',
  '자마자',
  '라서',
  '라도',
  '든지',
  '거나',
  '는데',
  '은데',
]);

/**
 * 빈번한 동사 어간 (불규칙 포함)
 * 길이 순으로 정렬하여 긴 것부터 매칭
 */
export const COMMON_VERB_STEMS = new Set([
  // 복합 동사 (긴 것 먼저)
  '일어나',
  '일어났',
  '돌아오',
  '돌아왔',
  '들어가',
  '들어갔',
  '나가',
  '나갔',
  '내리',
  '내렸',
  '올라가',
  '올라갔',
  '내려가',
  '내려갔',
  '만들',
  '만들었',
  // 기본 동사
  '하',
  '했',
  '해',
  '가',
  '갔',
  '오',
  '왔',
  '먹',
  '먹었',
  '마시',
  '마셨',
  '보',
  '봤',
  '듣',
  '들었',
  '읽',
  '읽었',
  '쓰',
  '썼',
  '자',
  '잤',
  '줬',
  '줘',
  '됐',
  '돼',
  '알',
  '알았',
  '몰랐',
  '있',
  '있었',
  '없',
  '없었',
  '살',
  '살았',
  '좋',
  '좋았',
  '싫',
  '싫었',
  '나',
  '났',
  '주',
  '줬',
  '받',
  '받았',
  '사',
  '샀',
  '팔',
  '팔았',
  '놀',
  '놀았',
  '말',
  '말했',
  '배우',
  '배웠',
  '가르치',
  '가르쳤',
]);

/**
 * DP 비용 상수
 */
export const DP_COSTS = {
  DICTIONARY_WORD: 0, // 사전에 있는 단어
  PARTICLE_ATTACHED: 0, // 조사가 붙은 명사
  VERB_WITH_ENDING: 0, // 동사+어미 (분리하면 안됨, Maximal Munch로 선택)
  UNKNOWN_CHAR: 2, // 미등록 문자
  UNKNOWN_WORD_PER_CHAR: 1.5, // 미등록 단어 (글자당)
  SPLIT_BONUS: -0.1, // 적절한 분리점에서 보너스
};

/**
 * 정렬된 어미 목록 (캐시, 긴 것부터)
 */
export const SORTED_ENDINGS = [...KOREAN_ENDINGS].sort((a, b) => b.length - a.length);

/**
 * 정렬된 조사 목록 (캐시, 긴 것부터)
 */
export const SORTED_PARTICLES = [...KOREAN_PARTICLES].sort((a, b) => b.length - a.length);

/**
 * 최대 단어 길이 (탐색 범위 제한)
 */
export const MAX_WORD_LENGTH = 10;

/**
 * 동사 어간 체크 (다양한 방식)
 */
export function isVerbStem(stem: string): boolean {
  // 1. 빈번한 동사 어간 목록에 있음
  if (COMMON_VERB_STEMS.has(stem)) return true;

  // 2. 사전에 어간이 있음
  if (KOREAN_WORD_SET.has(stem)) return true;

  // 3. 어간+다 형태가 사전에 있음 (기본형)
  if (KOREAN_WORD_SET.has(`${stem}다`)) return true;

  // 4. 어간+하다 형태가 사전에 있음 (하다 동사)
  if (KOREAN_WORD_SET.has(`${stem}하다`)) return true;

  return false;
}

/**
 * 단어 인식 점수 계산
 * @param word 단어
 * @returns 비용 (낮을수록 좋음)
 */
export function getWordCost(word: string): number {
  // 1. 사전에 있는 단어 (완전 일치)
  if (KOREAN_WORD_SET.has(word)) {
    return DP_COSTS.DICTIONARY_WORD;
  }

  // 2. 명사+조사 패턴 (긴 조사부터)
  for (const particle of SORTED_PARTICLES) {
    if (word.endsWith(particle) && word.length > particle.length) {
      const stem = word.slice(0, -particle.length);
      if (KOREAN_WORD_SET.has(stem)) {
        return DP_COSTS.PARTICLE_ATTACHED;
      }
    }
  }

  // 3. 동사+어미 패턴 (긴 어미부터)
  for (const ending of SORTED_ENDINGS) {
    if (word.endsWith(ending) && word.length > ending.length) {
      const stem = word.slice(0, -ending.length);
      if (isVerbStem(stem)) {
        return DP_COSTS.VERB_WITH_ENDING;
      }
    }
  }

  // 4. 복합 형태: 동사어간+어미+조사 (예: 일어나서, 먹어서)
  // "일어나서" = "일어나" + "서" (연결어미)
  for (const ending of SORTED_ENDINGS) {
    if (word.endsWith(ending) && word.length > ending.length + 1) {
      const beforeEnding = word.slice(0, -ending.length);
      // beforeEnding이 동사 어간인지 직접 체크
      if (COMMON_VERB_STEMS.has(beforeEnding)) {
        return DP_COSTS.VERB_WITH_ENDING;
      }
    }
  }

  // 5. 한 글자 대명사/조사/부사
  if (word.length === 1) {
    const singleCharWords = new Set([
      '나',
      '너',
      '저',
      '그',
      '이',
      '에',
      '도',
      '만',
      '못',
      '안',
      '잘',
      '더',
      '또',
      '왜',
      '일', // "일" (work)도 단독 사용
    ]);
    if (singleCharWords.has(word)) {
      return DP_COSTS.DICTIONARY_WORD;
    }
  }

  // 6. 두 글자 빈번 단어
  if (word.length === 2) {
    const twoCharWords = new Set([
      '일찍',
      '일을',
      '나는',
      '너는',
      '오늘',
      '내일',
      '어제',
      '지금',
      '그냥',
      '아주',
      '매우',
      '정말',
      '진짜',
      '아직',
      '벌써',
    ]);
    if (twoCharWords.has(word)) {
      return DP_COSTS.DICTIONARY_WORD;
    }
  }

  // 7. 미등록 단어 - 길이에 따른 패널티
  return DP_COSTS.UNKNOWN_WORD_PER_CHAR * word.length;
}

/**
 * DP 분리 결과
 */
export interface DpSplitResult {
  /** 분리된 토큰 배열 */
  tokens: string[];
  /** 총 비용 */
  cost: number;
  /** 확신도 (0-1) */
  confidence: number;
}

/**
 * DP 기반 단어 분리
 * 최소 비용으로 문자열을 단어들로 분리
 *
 * @param text 붙어쓴 텍스트 (띄어쓰기 없음)
 * @returns 분리 결과
 */
export function dpWordSplit(text: string): DpSplitResult {
  const n = text.length;
  if (n === 0) {
    return { tokens: [], cost: 0, confidence: 1 };
  }

  // dp[i] = text[0...i-1]까지의 최소 비용
  const dp: number[] = new Array(n + 1).fill(Infinity);
  // backtrack[i] = dp[i]를 달성한 마지막 분리점
  const backtrack: number[] = new Array(n + 1).fill(-1);

  dp[0] = 0;

  for (let i = 1; i <= n; i++) {
    // 모든 가능한 마지막 단어 길이를 시도 (긴 것부터 - Maximal Munch)
    for (let len = Math.min(i, MAX_WORD_LENGTH); len >= 1; len--) {
      const start = i - len;
      const word = text.slice(start, i);

      // 한글이 아닌 문자가 포함되면 스킵 (숫자, 영어 등)
      let hasNonHangul = false;
      for (const ch of word) {
        if (!isHangul(ch)) {
          hasNonHangul = true;
          break;
        }
      }

      if (hasNonHangul) {
        // 비한글 문자는 단독으로 처리
        if (len === 1) {
          const cost = dp[start] + 0; // 비한글 문자는 비용 없음
          if (cost < dp[i]) {
            dp[i] = cost;
            backtrack[i] = start;
          }
        }
        continue;
      }

      const wordCost = getWordCost(word);
      const newCost = dp[start] + wordCost;

      if (newCost < dp[i]) {
        dp[i] = newCost;
        backtrack[i] = start;
      }
    }
  }

  // 역추적하여 토큰 추출
  const tokens: string[] = [];
  let pos = n;
  while (pos > 0) {
    const prevPos = backtrack[pos];
    if (prevPos === -1) {
      // 도달 불가능 (이론상 없어야 함)
      tokens.unshift(text.slice(0, pos));
      break;
    }
    tokens.unshift(text.slice(prevPos, pos));
    pos = prevPos;
  }

  // 확신도 계산: 평균 단어 비용 기반
  const avgCost = dp[n] / Math.max(1, tokens.length);
  // avgCost가 0이면 confidence=1, avgCost가 2이면 confidence≈0.5
  const confidence = Math.max(0, 1 - avgCost / 4);

  return { tokens, cost: dp[n], confidence };
}
