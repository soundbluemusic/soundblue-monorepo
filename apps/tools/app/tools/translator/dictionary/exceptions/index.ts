// ========================================
// Exception Dictionaries - Export
// 예외 사전 통합 (Phase 4)
// ========================================

// 불규칙 활용 (500개)
export * from './irregulars';

// 동음이의어 (2,000개)
export * from './polysemy';

// 관용구/숙어 (5,000개)
export * from './idioms';

// 고유명사 (5,000개)
export * from './proper-nouns';

// 외래어 (2,000개)
export * from './loanwords';

// 기타 예외 (3,000개)
export * from './miscellaneous';

/**
 * Phase 4 통계
 *
 * 총 17,500개 예외 사전
 * - 불규칙 활용: 500개 (완료)
 * - 동음이의어: 2,000개 (구조 완성, 샘플 100+개)
 * - 관용구: 5,000개 (구조 완성, 샘플 100+개)
 * - 고유명사: 5,000개 (구조 완성, 샘플 100+개)
 * - 외래어: 2,000개 (구조 완성, 샘플 100+개)
 * - 기타 예외: 3,000개 (구조 완성, 샘플 100+개)
 *
 * 나머지 데이터는 빌드 스크립트로 생성:
 * - scripts/generate-exceptions.ts
 * - 데이터 소스: 우리말샘, WordNet, ConceptNet, 위키백과
 */
