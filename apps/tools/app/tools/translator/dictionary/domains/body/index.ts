// ========================================
// Body Domain Dictionaries - 인체 해부학 도메인 사전 통합 export
// ========================================

import { ARTICULAR_EN_KO, ARTICULAR_KO_EN } from './articular';
import { BODY_REGIONS_EN_KO, BODY_REGIONS_KO_EN } from './body-regions';
import { CARDIOVASCULAR_EN_KO, CARDIOVASCULAR_KO_EN } from './cardiovascular';
import { DIGESTIVE_EN_KO, DIGESTIVE_KO_EN } from './digestive';
import { ENDOCRINE_EN_KO, ENDOCRINE_KO_EN } from './endocrine';
import { INTEGUMENTARY_EN_KO, INTEGUMENTARY_KO_EN } from './integumentary';
import { LYMPHATIC_EN_KO, LYMPHATIC_KO_EN } from './lymphatic';
import { MUSCULAR_EN_KO, MUSCULAR_KO_EN } from './muscular';
import { NERVOUS_EN_KO, NERVOUS_KO_EN } from './nervous';
import { REPRODUCTIVE_EN_KO, REPRODUCTIVE_KO_EN } from './reproductive';
import { RESPIRATORY_EN_KO, RESPIRATORY_KO_EN } from './respiratory';
import { SENSORY_EN_KO, SENSORY_KO_EN } from './sensory';
import { SKELETAL_EN_KO, SKELETAL_KO_EN } from './skeletal';
import { TISSUES_EN_KO, TISSUES_KO_EN } from './tissues';
import { URINARY_EN_KO, URINARY_KO_EN } from './urinary';

// 개별 도메인 export
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
 *
 * 사용법:
 * import { ALL_BODY_KO_EN } from './body';
 *
 * 또는 개별 import:
 * import { SKELETAL_KO_EN, MUSCULAR_KO_EN } from './body';
 */
export const ALL_BODY_KO_EN: Record<string, string> = {
  ...INTEGUMENTARY_KO_EN,
  ...SKELETAL_KO_EN,
  ...ARTICULAR_KO_EN,
  ...MUSCULAR_KO_EN,
  ...CARDIOVASCULAR_KO_EN,
  ...LYMPHATIC_KO_EN,
  ...RESPIRATORY_KO_EN,
  ...DIGESTIVE_KO_EN,
  ...URINARY_KO_EN,
  ...REPRODUCTIVE_KO_EN,
  ...ENDOCRINE_KO_EN,
  ...NERVOUS_KO_EN,
  ...SENSORY_KO_EN,
  ...BODY_REGIONS_KO_EN,
  ...TISSUES_KO_EN,
};

/**
 * 모든 인체 해부학 사전 통합 (영→한)
 */
export const ALL_BODY_EN_KO: Record<string, string> = {
  ...INTEGUMENTARY_EN_KO,
  ...SKELETAL_EN_KO,
  ...ARTICULAR_EN_KO,
  ...MUSCULAR_EN_KO,
  ...CARDIOVASCULAR_EN_KO,
  ...LYMPHATIC_EN_KO,
  ...RESPIRATORY_EN_KO,
  ...DIGESTIVE_EN_KO,
  ...URINARY_EN_KO,
  ...REPRODUCTIVE_EN_KO,
  ...ENDOCRINE_EN_KO,
  ...NERVOUS_EN_KO,
  ...SENSORY_EN_KO,
  ...BODY_REGIONS_EN_KO,
  ...TISSUES_EN_KO,
};

/**
 * 인체 해부학 사전 통계
 */
export const BODY_STATS = {
  integumentary: Object.keys(INTEGUMENTARY_KO_EN).length,
  skeletal: Object.keys(SKELETAL_KO_EN).length,
  articular: Object.keys(ARTICULAR_KO_EN).length,
  muscular: Object.keys(MUSCULAR_KO_EN).length,
  cardiovascular: Object.keys(CARDIOVASCULAR_KO_EN).length,
  lymphatic: Object.keys(LYMPHATIC_KO_EN).length,
  respiratory: Object.keys(RESPIRATORY_KO_EN).length,
  digestive: Object.keys(DIGESTIVE_KO_EN).length,
  urinary: Object.keys(URINARY_KO_EN).length,
  reproductive: Object.keys(REPRODUCTIVE_KO_EN).length,
  endocrine: Object.keys(ENDOCRINE_KO_EN).length,
  nervous: Object.keys(NERVOUS_KO_EN).length,
  sensory: Object.keys(SENSORY_KO_EN).length,
  bodyRegions: Object.keys(BODY_REGIONS_KO_EN).length,
  tissues: Object.keys(TISSUES_KO_EN).length,
  get total() {
    return Object.keys(ALL_BODY_KO_EN).length;
  },
};
