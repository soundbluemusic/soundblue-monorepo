// ========================================
// 잘못 띄어쓴 텍스트 합치기
// 예: "안 녕 하 세 요" → "안녕하세요"
// ========================================

import { isHangul } from '@soundblue/hangul';
import {
  getWordCost,
  isVerbStem,
  KOREAN_WORD_SET,
  MAX_WORD_LENGTH,
  SORTED_ENDINGS,
  SORTED_PARTICLES,
} from './dp-word-split';

/**
 * 연속된 1글자 한글 토큰들을 합쳐서 단어로 만들기
 * DP를 사용해 최적의 합치기 방법 결정
 *
 * @param tokens 토큰 배열 (1글자 포함)
 * @returns 합쳐진 토큰 배열
 */
function mergeShortTokens(tokens: string[]): string[] {
  if (tokens.length === 0) return [];

  const result: string[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // 1글자 한글 토큰이면 연속된 1글자들을 모아서 합치기 시도
    if (token.length === 1 && isHangul(token)) {
      // 연속된 1글자 토큰들 수집
      const singleChars: string[] = [token];
      let j = i + 1;

      while (j < tokens.length && tokens[j].length === 1 && isHangul(tokens[j])) {
        singleChars.push(tokens[j]);
        j++;
      }

      // 2글자 이상 연속이면 합치기 시도
      if (singleChars.length >= 2) {
        const merged = tryMergeSingleChars(singleChars);
        result.push(...merged);
        i = j;
      } else {
        // 1글자만 있으면 그대로 추가
        result.push(token);
        i++;
      }
    } else {
      result.push(token);
      i++;
    }
  }

  return result;
}

/**
 * 연속된 1글자 한글들을 단어로 합치기
 * DP를 사용해 사전에 있는 단어 조합 찾기
 *
 * @param chars 1글자 배열 ['안', '녕', '하', '세', '요']
 * @returns 합쳐진 단어 배열 ['안녕하세요'] 또는 ['안녕', '하세요']
 */
function tryMergeSingleChars(chars: string[]): string[] {
  const combined = chars.join('');
  const n = combined.length;

  // 전체가 사전에 있으면 바로 반환
  if (KOREAN_WORD_SET.has(combined)) {
    return [combined];
  }

  // 전체가 명사+조사 패턴이면 바로 반환
  for (const particle of SORTED_PARTICLES) {
    if (combined.endsWith(particle) && combined.length > particle.length) {
      const stem = combined.slice(0, -particle.length);
      if (KOREAN_WORD_SET.has(stem)) {
        return [combined];
      }
    }
  }

  // 전체가 동사+어미 패턴이면 바로 반환
  for (const ending of SORTED_ENDINGS) {
    if (combined.endsWith(ending) && combined.length > ending.length) {
      const stem = combined.slice(0, -ending.length);
      if (isVerbStem(stem)) {
        return [combined];
      }
    }
  }

  // DP로 최적 분할 찾기
  // dp[i] = combined[0..i-1]까지의 최소 비용
  const dp: number[] = new Array(n + 1).fill(Infinity);
  const backtrack: number[] = new Array(n + 1).fill(-1);
  dp[0] = 0;

  for (let i = 1; i <= n; i++) {
    // 모든 가능한 마지막 단어 길이 시도
    for (let len = 1; len <= Math.min(i, MAX_WORD_LENGTH); len++) {
      const start = i - len;
      const word = combined.slice(start, i);
      const wordCost = getWordCost(word);
      const newCost = dp[start] + wordCost;

      if (newCost < dp[i]) {
        dp[i] = newCost;
        backtrack[i] = start;
      }
    }
  }

  // 역추적
  const words: string[] = [];
  let pos = n;
  while (pos > 0) {
    const prevPos = backtrack[pos];
    if (prevPos === -1) {
      words.unshift(combined.slice(0, pos));
      break;
    }
    words.unshift(combined.slice(prevPos, pos));
    pos = prevPos;
  }

  // 분할 결과가 원본 글자 수와 같으면 (분할 실패) 전체를 하나로 반환
  if (words.length === chars.length) {
    return [combined];
  }

  return words;
}

/**
 * 잘못 띄어쓴 텍스트 교정 (글자별 분리된 텍스트 합치기)
 * "안 녕 하 세 요" → "안녕하세요"
 *
 * @param text 입력 텍스트
 * @returns 합쳐진 텍스트
 */
export function mergeWrongSpacing(text: string): {
  merged: string;
  confidence: number;
} {
  // 공백으로 분리
  const tokens = text.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return { merged: text, confidence: 1 };
  }

  // 1글자 토큰들 합치기
  const mergedTokens = mergeShortTokens(tokens);

  // 변경 여부 확인
  const merged = mergedTokens.join(' ');
  const changed = merged !== tokens.join(' ');

  return {
    merged,
    confidence: changed ? 0.85 : 1,
  };
}
