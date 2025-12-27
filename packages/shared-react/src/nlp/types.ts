// ========================================
// NLP Types - 공유 NLP 타입 정의
// ========================================

/**
 * 자모 구조
 */
export interface Jamo {
  cho: string; // 초성
  jung: string; // 중성
  jong: string; // 종성 (없으면 빈 문자열)
}

/**
 * 퍼지 매칭 결과
 */
export interface FuzzyMatchResult {
  text: string;
  distance: number; // 자모 편집 거리
  similarity: number; // 0-1 정규화된 유사도
  isMatch: boolean; // distance <= threshold
}

/**
 * 퍼지 매칭 옵션
 */
export interface FuzzyMatchOptions {
  maxDistance?: number; // 기본: 2
  caseSensitive?: boolean; // 기본: false
  locale?: 'ko' | 'en'; // 기본: 자동 감지
}

/**
 * 오타 교정 결과
 */
export interface TypoCorrectionResult {
  original: string;
  corrected: string;
  corrections: Array<{
    type: 'common_typo' | 'spacing' | 'similar_word';
    original: string;
    corrected: string;
    confidence: number;
  }>;
  confidence: number;
}
