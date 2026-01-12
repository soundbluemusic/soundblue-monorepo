// ========================================
// 통합 띄어쓰기 교정
// 1. 잘못 띄어쓴 텍스트 합치기 (글자별 분리 → 단어)
// 2. 붙어쓴 문장 분리 (DP)
// 3. 규칙 기반 교정 (의존명사, 보조용언, 조사)
// ========================================

import { isHangul } from '@soundblue/hangul';
import {
  dpWordSplit,
  isVerbStem,
  KOREAN_WORD_SET,
  SORTED_ENDINGS,
  SORTED_PARTICLES,
} from './dp-word-split';
import { mergeWrongSpacing } from './merge-spacing';
import { correctSpacing } from './spacing-rules';

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
 * 1. 잘못 띄어쓴 텍스트 합치기 (글자별 분리 → 단어)
 * 2. 붙어쓴 문장 분리 (DP)
 * 3. 규칙 기반 교정 (의존명사, 보조용언, 조사)
 */
export function correctSpacingFull(text: string): {
  corrected: string;
  confidence: number;
} {
  // 1. 잘못 띄어쓴 텍스트 합치기 (예: "안 녕 하 세 요" → "안녕하세요")
  const { merged, confidence: mergeConfidence } = mergeWrongSpacing(text);

  // 2. 붙어쓴 텍스트 분리 (예: "나는학교에갔다" → "나는 학교에 갔다")
  const { recovered, confidence: dpConfidence } = recoverSpacing(merged);

  // 3. 규칙 기반 교정 (의존명사, 보조용언, 조사)
  const { corrected, confidence: ruleConfidence } = correctSpacing(recovered);

  // 확신도는 세 단계의 평균
  const avgConfidence = (mergeConfidence + dpConfidence + ruleConfidence) / 3;

  return { corrected, confidence: avgConfidence };
}
