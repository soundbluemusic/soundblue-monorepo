// ========================================
// Body Domain Dictionaries - 인체 해부학 도메인 사전 통합 export
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 하위 호환성을 위한 빈 객체 export
// ========================================

// 개별 도메인 export (하위 호환성 - 빈 객체)
export { ARTICULAR_EN_KO, ARTICULAR_KO_EN } from './articular';
export { BODY_REGIONS_EN_KO, BODY_REGIONS_KO_EN } from './body-regions';
export { CARDIOVASCULAR_EN_KO, CARDIOVASCULAR_KO_EN } from './cardiovascular';
export { DIGESTIVE_EN_KO, DIGESTIVE_KO_EN } from './digestive';
export { ENDOCRINE_EN_KO, ENDOCRINE_KO_EN } from './endocrine';
export { INTEGUMENTARY_EN_KO, INTEGUMENTARY_KO_EN } from './integumentary';
export { LYMPHATIC_EN_KO, LYMPHATIC_KO_EN } from './lymphatic';
export { MUSCULAR_EN_KO, MUSCULAR_KO_EN } from './muscular';
export { NERVOUS_EN_KO, NERVOUS_KO_EN } from './nervous';
export { REPRODUCTIVE_EN_KO, REPRODUCTIVE_KO_EN } from './reproductive';
export { RESPIRATORY_EN_KO, RESPIRATORY_KO_EN } from './respiratory';
export { SENSORY_EN_KO, SENSORY_KO_EN } from './sensory';
export { SKELETAL_EN_KO, SKELETAL_KO_EN } from './skeletal';
export { TISSUES_EN_KO, TISSUES_KO_EN } from './tissues';
export { URINARY_EN_KO, URINARY_KO_EN } from './urinary';

/**
 * 모든 인체 해부학 사전 통합 (한→영)
 * 실제 데이터는 external에서 통합됨
 */
export const ALL_BODY_KO_EN: Record<string, string> = {};

/**
 * 모든 인체 해부학 사전 통합 (영→한)
 * 실제 데이터는 external에서 통합됨
 */
export const ALL_BODY_EN_KO: Record<string, string> = {};

/**
 * 인체 해부학 사전 통계
 * 실제 데이터는 external에서 통합되므로 0 반환
 */
export const BODY_STATS = {
  integumentary: 0,
  skeletal: 0,
  articular: 0,
  muscular: 0,
  cardiovascular: 0,
  lymphatic: 0,
  respiratory: 0,
  digestive: 0,
  urinary: 0,
  reproductive: 0,
  endocrine: 0,
  nervous: 0,
  sensory: 0,
  bodyRegions: 0,
  tissues: 0,
  get total() {
    return 0;
  },
};
