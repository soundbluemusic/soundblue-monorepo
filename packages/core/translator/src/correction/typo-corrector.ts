// ========================================
// Typo Corrector - 오타 교정기
// 모든 교정 모듈 통합
// ========================================

import { correctAllCommonTypos, isCommonTypo } from './common-typos';
import { calculateKeyboardSimilarity, jamoEditDistance } from './jamo-edit-distance';
import { correctSpacing, correctSpacingFull } from './spacing-rules';

/**
 * 교정 결과 인터페이스
 */
export interface CorrectionResult {
  original: string;
  corrected: string;
  corrections: CorrectionDetail[];
  confidence: number;
}

/**
 * 개별 교정 상세
 */
export interface CorrectionDetail {
  type: 'common_typo' | 'spacing' | 'similar_word';
  original: string;
  corrected: string;
  confidence: number;
}

/**
 * 후보 단어 인터페이스
 */
export interface CandidateWord {
  word: string;
  distance: number;
  similarity: number;
}

/**
 * 메인 오타 교정 함수
 * 1. 빈번한 오타 사전 매칭
 * 2. 띄어쓰기 규칙 적용
 * 3. 자모 편집거리 기반 유사 단어 제안
 */
export function correctTypos(text: string, dictionary?: string[]): CorrectionResult {
  const corrections: CorrectionDetail[] = [];
  let result = text;
  let totalConfidence = 1.0;

  // 1단계: 빈번한 오타 사전 매칭 (가장 높은 우선순위)
  const commonResult = correctAllCommonTypos(result);
  if (commonResult.corrections.length > 0) {
    result = commonResult.corrected;
    for (const c of commonResult.corrections) {
      corrections.push({
        type: 'common_typo',
        original: c.original,
        corrected: c.corrected,
        confidence: 0.95, // 사전 매칭은 높은 확신도
      });
    }
  }

  // 2단계: 띄어쓰기 규칙 적용
  const spacingResult = correctSpacing(result);
  if (spacingResult.corrected !== result) {
    const originalWords = result.split(/\s+/);
    const correctedWords = spacingResult.corrected.split(/\s+/);

    // 변경된 부분 찾기
    if (originalWords.join(' ') !== correctedWords.join(' ')) {
      corrections.push({
        type: 'spacing',
        original: result,
        corrected: spacingResult.corrected,
        confidence: spacingResult.confidence,
      });
    }

    result = spacingResult.corrected;
    totalConfidence = Math.min(totalConfidence, spacingResult.confidence);
  }

  // 3단계: 사전이 제공된 경우 유사 단어 검색
  if (dictionary && dictionary.length > 0) {
    const words = result.split(/\s+/);
    const correctedWords: string[] = [];
    // 성능: Array.includes() O(n) → Set.has() O(1)
    const dictSet = new Set(dictionary);

    for (const word of words) {
      // 이미 사전에 있는 단어는 그대로
      if (dictSet.has(word)) {
        correctedWords.push(word);
        continue;
      }

      // 유사 단어 찾기
      const candidates = findSimilarWords(word, dictionary, 3);
      const best = candidates[0];
      if (best && best.similarity > 0.7) {
        corrections.push({
          type: 'similar_word',
          original: word,
          corrected: best.word,
          confidence: best.similarity,
        });
        correctedWords.push(best.word);
        totalConfidence = Math.min(totalConfidence, best.similarity);
      } else {
        correctedWords.push(word);
      }
    }

    result = correctedWords.join(' ');
  }

  // 최종 확신도 계산
  if (corrections.length > 0) {
    const avgConfidence =
      corrections.reduce((sum, c) => sum + c.confidence, 0) / corrections.length;
    totalConfidence = avgConfidence;
  }

  return {
    original: text,
    corrected: result,
    corrections,
    confidence: totalConfidence,
  };
}

/**
 * 유사 단어 찾기 (자모 편집거리 기반)
 */
export function findSimilarWords(
  word: string,
  dictionary: string[],
  maxResults: number = 5,
  threshold: number = 0.5,
): CandidateWord[] {
  const candidates: CandidateWord[] = [];

  for (const dictWord of dictionary) {
    // 길이 차이가 너무 크면 스킵
    if (Math.abs(word.length - dictWord.length) > 3) continue;

    const similarity = calculateKeyboardSimilarity(word, dictWord);
    if (similarity >= threshold) {
      const distance = jamoEditDistance(word, dictWord);
      candidates.push({
        word: dictWord,
        distance,
        similarity,
      });
    }
  }

  // 유사도 높은 순 정렬
  candidates.sort((a, b) => b.similarity - a.similarity);

  return candidates.slice(0, maxResults);
}

/**
 * 빠른 오타 체크 (사전 기반)
 * 성능: Set으로 O(1) 검색
 */
export function isTypo(word: string, dictionary: string[]): boolean {
  // 빈번한 오타인지 확인
  if (isCommonTypo(word)) return true;

  // 성능: Array.includes() O(n) → Set.has() O(1)
  const dictSet = new Set(dictionary);

  // 사전에 없는 단어인지 확인
  if (!dictSet.has(word)) {
    // 유사 단어가 있는지 확인
    const similar = findSimilarWords(word, dictionary, 1, 0.7);
    return similar.length > 0;
  }

  return false;
}

/**
 * 텍스트에서 오타 후보 추출
 * 성능: Set으로 O(1) 검색
 */
export function extractTypoCandidates(
  text: string,
  dictionary: string[],
): { word: string; position: number; suggestions: CandidateWord[] }[] {
  const candidates: {
    word: string;
    position: number;
    suggestions: CandidateWord[];
  }[] = [];

  const words = text.split(/\s+/);
  let position = 0;
  // 성능: Array.includes() O(n) → Set.has() O(1)
  const dictSet = new Set(dictionary);

  for (const word of words) {
    if (word.length > 0) {
      // 사전에 없고 빈번한 오타도 아닌 경우
      if (!dictSet.has(word) && !isCommonTypo(word)) {
        const suggestions = findSimilarWords(word, dictionary, 3, 0.5);
        if (suggestions.length > 0) {
          candidates.push({ word, position, suggestions });
        }
      }
    }
    position += word.length + 1; // +1 for space
  }

  return candidates;
}

/**
 * 띄어쓰기만 교정 (DP + 규칙 기반)
 * 붙어쓴 문장도 분리 가능
 */
export function correctSpacingOnly(text: string): string {
  // DP 기반 분리 + 규칙 기반 교정 통합
  const { corrected } = correctSpacingFull(text);
  return corrected;
}

/**
 * 오타 교정 통계
 */
export interface CorrectionStats {
  totalCorrections: number;
  commonTypoCorrections: number;
  spacingCorrections: number;
  similarWordCorrections: number;
  averageConfidence: number;
}

/**
 * 교정 통계 계산
 */
export function getCorrectionStats(result: CorrectionResult): CorrectionStats {
  const stats: CorrectionStats = {
    totalCorrections: result.corrections.length,
    commonTypoCorrections: 0,
    spacingCorrections: 0,
    similarWordCorrections: 0,
    averageConfidence: result.confidence,
  };

  for (const c of result.corrections) {
    switch (c.type) {
      case 'common_typo':
        stats.commonTypoCorrections++;
        break;
      case 'spacing':
        stats.spacingCorrections++;
        break;
      case 'similar_word':
        stats.similarWordCorrections++;
        break;
    }
  }

  return stats;
}
