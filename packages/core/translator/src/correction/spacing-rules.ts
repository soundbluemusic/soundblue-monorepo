// ========================================
// Spacing Rules - 띄어쓰기 규칙
// 의존명사, 보조용언, 조사 규칙 기반 교정
// 명사-동사 경계 분리 포함
// DP 기반 단어 분리 (붙어쓴 문장 복구)
// ========================================

import { isHangul } from '@soundblue/hangul';
import { koToEnWords } from '../dictionary/entries/words';

/**
 * 의존명사 정보
 */
interface DependencyNounInfo {
  patterns: RegExp[]; // 앞에 오는 패턴들
  examples: string[];
}

/**
 * 의존명사 목록 (반드시 앞 단어와 띄어쓰기)
 */
export const dependencyNouns: Record<string, DependencyNounInfo> = {
  // 것/거/게 류
  수: {
    patterns: [/[ㄹ을]$/, /할$/, /갈$/, /볼$/, /올$/, /줄$/],
    examples: ['할 수', '갈 수', '볼 수'],
  },
  것: {
    patterns: [/[ㄹ은는]$/, /하는$/, /먹는$/, /가는$/, /할$/, /먹을$/],
    examples: ['하는 것', '할 것', '먹을 것'],
  },
  거: {
    patterns: [/[ㄹ을]$/, /할$/, /갈$/, /먹을$/],
    examples: ['할 거', '갈 거야'],
  },
  게: {
    patterns: [/[ㄹ을]$/, /할$/, /먹을$/],
    examples: ['할 게', '먹을 게'],
  },

  // 때/적 류
  때: {
    patterns: [/[ㄹ을는]$/, /할$/, /갈$/, /했을$/, /왔을$/],
    examples: ['할 때', '갈 때', '먹을 때'],
  },
  적: {
    patterns: [/[ㄴ은]$/, /한$/, /본$/, /간$/],
    examples: ['한 적', '본 적', '간 적'],
  },

  // 줄/리 류
  줄: {
    patterns: [/[ㄹ을는]$/, /할$/, /알$/, /모를$/],
    examples: ['할 줄', '알 줄', '모를 줄'],
  },
  리: {
    patterns: [/[ㄹ을]$/, /할$/, /갈$/],
    examples: ['할 리가', '갈 리가'],
  },

  // 뿐/만큼/대로 류
  뿐: {
    patterns: [/[ㄹ을ㄴ은]$/, /할$/, /한$/],
    examples: ['할 뿐', '한 뿐'],
  },
  만큼: {
    patterns: [/[ㄴ은ㄹ을]$/, /한$/, /할$/],
    examples: ['한 만큼', '할 만큼'],
  },
  대로: {
    patterns: [/[ㄴ는]$/, /하는$/, /가는$/],
    examples: ['하는 대로', '가는 대로'],
  },

  // 데/바/지 류
  데: {
    patterns: [/[ㄴ는]$/, /가는$/, /하는$/, /있는$/],
    examples: ['가는 데', '하는 데'],
  },
  바: {
    patterns: [/[ㄴ은]$/, /아는$/, /한$/],
    examples: ['아는 바', '한 바'],
  },
  지: {
    patterns: [/[ㄴ은]$/, /온$/, /간$/, /한$/],
    examples: ['온 지', '간 지', '한 지'],
  },
};

/**
 * 보조용언 패턴 (본용언 + 보조용언)
 */
export const auxiliaryVerbPatterns: {
  pattern: RegExp;
  replacement: string;
}[] = [
  // -고 있다
  { pattern: /고있다/g, replacement: '고 있다' },
  { pattern: /고있는/g, replacement: '고 있는' },
  { pattern: /고있어/g, replacement: '고 있어' },
  { pattern: /고있었/g, replacement: '고 있었' },
  { pattern: /고있으면/g, replacement: '고 있으면' },

  // -고 싶다
  { pattern: /고싶다/g, replacement: '고 싶다' },
  { pattern: /고싶어/g, replacement: '고 싶어' },
  { pattern: /고싶은/g, replacement: '고 싶은' },
  { pattern: /고싶었/g, replacement: '고 싶었' },
  { pattern: /고싶으면/g, replacement: '고 싶으면' },

  // -지 않다/못하다
  { pattern: /지않다/g, replacement: '지 않다' },
  { pattern: /지않는/g, replacement: '지 않는' },
  { pattern: /지않아/g, replacement: '지 않아' },
  { pattern: /지않았/g, replacement: '지 않았' },
  { pattern: /지않으면/g, replacement: '지 않으면' },
  { pattern: /지못하/g, replacement: '지 못하' },
  { pattern: /지못해/g, replacement: '지 못해' },
  { pattern: /지못했/g, replacement: '지 못했' },

  // -아/어 보다
  { pattern: /([아어])보다/g, replacement: '$1 보다' },
  { pattern: /([아어])봐/g, replacement: '$1 봐' },
  { pattern: /([아어])봤/g, replacement: '$1 봤' },

  // -아/어 주다
  { pattern: /([아어])주다/g, replacement: '$1 주다' },
  { pattern: /([아어])줘/g, replacement: '$1 줘' },
  { pattern: /([아어])줬/g, replacement: '$1 줬' },

  // -아/어 버리다
  { pattern: /([아어])버리/g, replacement: '$1 버리' },
  { pattern: /([아어])버렸/g, replacement: '$1 버렸' },

  // -야 하다/되다
  { pattern: /([아어]야)하다/g, replacement: '$1 하다' },
  { pattern: /([아어]야)한다/g, replacement: '$1 한다' },
  { pattern: /([아어]야)해/g, replacement: '$1 해' },
  { pattern: /([아어]야)했/g, replacement: '$1 했' },
  { pattern: /([아어]야)되/g, replacement: '$1 되' },
  { pattern: /([아어]야)돼/g, replacement: '$1 돼' },
];

/**
 * 조사 목록 (반드시 앞 단어에 붙여쓰기)
 */
export const particles = [
  // 격조사
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
  '에게서',
  '한테서',
  // 보조사
  '도',
  '만',
  '까지',
  '부터',
  '마저',
  '조차',
  '밖에',
  '요',
  '든지',
  '든가',
  '나',
  '이나',
  '처럼',
  '같이',
  '보다',
  '마다',
];

/**
 * 의존명사가 아닌 경우 (제외 패턴)
 * 수록 = ~할수록 (연결어미, 의존명사 아님)
 * 지경 = 할 지경이다 (의존명사지만 특수 처리)
 */
const DEPENDENCY_NOUN_EXCEPTIONS: Record<string, string[]> = {
  수: ['록'], // 수록 (급할수록 → 분리 안함)
  지: ['경'], // 지경이 아닌 경우만 분리
};

/**
 * 의존명사 띄어쓰기 교정
 * "할수" → "할 수"
 */
export function correctDependencyNounSpacing(text: string): string {
  let result = text;

  for (const [noun, info] of Object.entries(dependencyNouns)) {
    const exceptions = DEPENDENCY_NOUN_EXCEPTIONS[noun] || [];

    // 각 패턴에 대해 검사
    for (const pattern of info.patterns) {
      // 붙어있는 패턴 생성: "할수" 형태
      const source = pattern.source.replace('$', '');

      // 제외 패턴이 뒤따르지 않는 경우만 매칭
      // 예: "수" 뒤에 "록"이 오면 분리하지 않음
      let negativeLookahead = '';
      if (exceptions.length > 0) {
        negativeLookahead = `(?![${exceptions.join('')}])`;
      }

      const attachedRegex = new RegExp(`(${source})${noun}${negativeLookahead}`, 'g');

      result = result.replace(attachedRegex, `$1 ${noun}`);
    }
  }

  return result;
}

/**
 * 보조용언 띄어쓰기 교정
 * "하고있다" → "하고 있다"
 */
export function correctAuxiliaryVerbSpacing(text: string): string {
  let result = text;

  for (const { pattern, replacement } of auxiliaryVerbPatterns) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * 조사 띄어쓰기 교정 (잘못 띄어진 조사를 붙임)
 * "학교 에" → "학교에"
 */
export function correctParticleSpacing(text: string): string {
  let result = text;

  // 긴 조사부터 처리 (에게서 before 에게 before 에)
  const sortedParticles = [...particles].sort((a, b) => b.length - a.length);

  for (const particle of sortedParticles) {
    // "단어 조사" 패턴을 "단어조사"로
    // 단, 조사 뒤에 공백이나 문장 끝이 와야 함
    const spacedPattern = new RegExp(`(\\S) (${particle})(?=\\s|$|[.!?])`, 'g');
    result = result.replace(spacedPattern, `$1$2`);
  }

  return result;
}

/**
 * 명사-동사 경계 분리 패턴
 * 음식/장소 명사 + 동사 어간 조합
 */
const nounVerbPatterns: { pattern: RegExp; replacement: string }[] = [
  // 음식 + 먹/마시
  {
    pattern: /(김밥|라면|밥|빵|떡|과자|국|찌개|고기|생선|음식|커피|술|맥주|물)(먹|마시)/g,
    replacement: '$1 $2',
  },
  // 장소 + 가/오
  {
    pattern: /(학교|집|회사|병원|시장|공원|역|호텔|도서관|영화관)(가|오|갔|왔|간|온)/g,
    replacement: '$1 $2',
  },
  // 일반 동작
  { pattern: /(공부|운동|일|청소|빨래|요리|쇼핑)(하|했|해)/g, replacement: '$1 $2' },
  // 감정/상태 + 되다/하다
  // 주의: 피곤해, 배고파, 졸려 등 형용사 활용형은 띄어쓰기 없이 사용
  { pattern: /(좋|싫|행복|슬프|기쁘|화나)(하|해|했)/g, replacement: '$1 $2' },
];

/**
 * 명사-동사 경계 띄어쓰기
 * "김밥먹" → "김밥 먹"
 */
export function correctNounVerbSpacing(text: string): string {
  let result = text;
  for (const { pattern, replacement } of nounVerbPatterns) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * 통합 띄어쓰기 교정
 */
export function correctSpacing(text: string): {
  corrected: string;
  confidence: number;
} {
  let result = text;
  let corrections = 0;

  // 0. 명사-동사 경계 분리 (띄어쓰기 없는 문장 처리)
  const afterNounVerb = correctNounVerbSpacing(result);
  if (afterNounVerb !== result) corrections++;
  result = afterNounVerb;

  // 1. 의존명사 규칙 적용
  const afterDep = correctDependencyNounSpacing(result);
  if (afterDep !== result) corrections++;
  result = afterDep;

  // 2. 보조용언 규칙 적용
  const afterAux = correctAuxiliaryVerbSpacing(result);
  if (afterAux !== result) corrections++;
  result = afterAux;

  // 3. 조사 붙여쓰기 규칙 적용
  const afterParticle = correctParticleSpacing(result);
  if (afterParticle !== result) corrections++;
  result = afterParticle;

  // 확신도 계산 (규칙 기반이므로 높음)
  const confidence = corrections > 0 ? 0.9 : 1.0;

  return { corrected: result, confidence };
}

// ========================================
// DP 기반 띄어쓰기 복구 (붙어쓴 문장 분리)
// 예: "나는일찍일어나서일을했어" → "나는 일찍 일어나서 일을 했어"
// ========================================

/**
 * 한국어 단어 사전 Set (O(1) 조회용)
 * words.ts에서 키만 추출
 */
const KOREAN_WORD_SET: Set<string> = new Set(Object.keys(koToEnWords));

/**
 * 조사 목록 (분리 대상 아님 - 명사에 붙음)
 */
const KOREAN_PARTICLES = new Set([
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
const KOREAN_ENDINGS = new Set([
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
const COMMON_VERB_STEMS = new Set([
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
const DP_COSTS = {
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
const SORTED_ENDINGS = [...KOREAN_ENDINGS].sort((a, b) => b.length - a.length);

/**
 * 정렬된 조사 목록 (캐시, 긴 것부터)
 */
const SORTED_PARTICLES = [...KOREAN_PARTICLES].sort((a, b) => b.length - a.length);

/**
 * 동사 어간 체크 (다양한 방식)
 */
function isVerbStem(stem: string): boolean {
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
function getWordCost(word: string): number {
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
 * 최대 단어 길이 (탐색 범위 제한)
 */
const MAX_WORD_LENGTH = 10;

/**
 * DP 분리 결과
 */
interface DpSplitResult {
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

/**
 * 붙어쓴 한글 텍스트를 분리
 * 기존 띄어쓰기가 있으면 각 부분을 개별 처리
 *
 * @param text 입력 텍스트
 * @returns 분리된 텍스트
 */
export function recoverSpacing(text: string): {
  recovered: string;
  confidence: number;
} {
  // 이미 띄어쓰기가 있으면 각 토큰을 개별 처리
  const existingTokens = text.split(/\s+/);

  const results: string[] = [];
  let totalConfidence = 0;
  let tokenCount = 0;

  for (const token of existingTokens) {
    if (!token) continue;

    // 토큰이 이미 사전에 있거나 짧으면 그대로 사용
    if (token.length <= 2 || KOREAN_WORD_SET.has(token)) {
      results.push(token);
      totalConfidence += 1;
      tokenCount++;
      continue;
    }

    // 명사+조사 패턴이면 그대로 유지 (예: 학교에, 나는, 커피를)
    let isNounWithParticle = false;
    for (const particle of SORTED_PARTICLES) {
      if (token.endsWith(particle) && token.length > particle.length) {
        const stem = token.slice(0, -particle.length);
        if (KOREAN_WORD_SET.has(stem)) {
          isNounWithParticle = true;
          break;
        }
      }
    }
    if (isNounWithParticle) {
      results.push(token);
      totalConfidence += 1;
      tokenCount++;
      continue;
    }

    // 동사+어미 패턴이면 그대로 유지 (예: 갔다, 먹었어)
    let isVerbWithEnding = false;
    for (const ending of SORTED_ENDINGS) {
      if (token.endsWith(ending) && token.length > ending.length) {
        const stem = token.slice(0, -ending.length);
        if (isVerbStem(stem)) {
          isVerbWithEnding = true;
          break;
        }
      }
    }
    if (isVerbWithEnding) {
      results.push(token);
      totalConfidence += 1;
      tokenCount++;
      continue;
    }

    // 한글이 아닌 토큰은 그대로
    let hasHangul = false;
    for (const ch of token) {
      if (isHangul(ch)) {
        hasHangul = true;
        break;
      }
    }
    if (!hasHangul) {
      results.push(token);
      totalConfidence += 1;
      tokenCount++;
      continue;
    }

    // DP 분리 시도
    const { tokens: splitTokens, confidence } = dpWordSplit(token);

    // 분리 결과가 1개면 원본 유지 (분리 불필요)
    if (splitTokens.length <= 1) {
      results.push(token);
      totalConfidence += confidence;
      tokenCount++;
    } else {
      results.push(...splitTokens);
      totalConfidence += confidence;
      tokenCount++;
    }
  }

  const avgConfidence = tokenCount > 0 ? totalConfidence / tokenCount : 1;

  return {
    recovered: results.join(' '),
    confidence: avgConfidence,
  };
}

/**
 * 통합 띄어쓰기 교정 (DP 포함)
 * 1. 붙어쓴 문장 분리 (DP)
 * 2. 규칙 기반 교정 (의존명사, 보조용언, 조사)
 */
export function correctSpacingFull(text: string): {
  corrected: string;
  confidence: number;
} {
  // 1. 붙어쓴 텍스트 분리
  const { recovered, confidence: dpConfidence } = recoverSpacing(text);

  // 2. 규칙 기반 교정
  const { corrected, confidence: ruleConfidence } = correctSpacing(recovered);

  // 확신도는 두 단계의 평균
  const avgConfidence = (dpConfidence + ruleConfidence) / 2;

  return { corrected, confidence: avgConfidence };
}
