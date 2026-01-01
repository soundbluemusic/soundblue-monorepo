// ========================================
// Domain Dictionaries - 도메인별 사전 통합 export
// ========================================

import { ARTS_EN_KO, ARTS_KO_EN } from './arts';
import { BODY_MOVEMENTS_EN_KO, BODY_MOVEMENTS_KO_EN } from './body-movements';
import { EDUCATION_EN_KO, EDUCATION_KO_EN } from './education';
import { EMOTIONS_EN_KO, EMOTIONS_KO_EN } from './emotions';
import { FITNESS_EN_KO, FITNESS_KO_EN } from './fitness';
import { LEGAL_EN_KO, LEGAL_KO_EN } from './legal';
import { MEDICAL_EN_KO, MEDICAL_KO_EN } from './medical';
import { SHOPPING_EN_KO, SHOPPING_KO_EN } from './shopping';
import { SPORTS_EN_KO, SPORTS_KO_EN } from './sports';

// 개별 도메인 export
export { ARTS_EN_KO, ARTS_KO_EN } from './arts';
export { BODY_MOVEMENTS_EN_KO, BODY_MOVEMENTS_KO_EN } from './body-movements';
export { EDUCATION_EN_KO, EDUCATION_KO_EN } from './education';
export { EMOTIONS_EN_KO, EMOTIONS_KO_EN } from './emotions';
export { FITNESS_EN_KO, FITNESS_KO_EN } from './fitness';
export { LEGAL_EN_KO, LEGAL_KO_EN } from './legal';
export { MEDICAL_EN_KO, MEDICAL_KO_EN } from './medical';
export { SHOPPING_EN_KO, SHOPPING_KO_EN } from './shopping';
export { SPORTS_EN_KO, SPORTS_KO_EN } from './sports';

/**
 * 모든 도메인 사전 통합 (한→영)
 *
 * 사용법:
 * import { ALL_DOMAINS_KO_EN } from './domains';
 *
 * 또는 개별 import:
 * import { SPORTS_KO_EN, FITNESS_KO_EN } from './domains';
 */
export const ALL_DOMAINS_KO_EN: Record<string, string> = {
  ...SPORTS_KO_EN,
  ...FITNESS_KO_EN,
  ...MEDICAL_KO_EN,
  ...EDUCATION_KO_EN,
  ...LEGAL_KO_EN,
  ...ARTS_KO_EN,
  ...SHOPPING_KO_EN,
  ...EMOTIONS_KO_EN,
  ...BODY_MOVEMENTS_KO_EN,
};

/**
 * 모든 도메인 사전 통합 (영→한)
 */
export const ALL_DOMAINS_EN_KO: Record<string, string> = {
  ...SPORTS_EN_KO,
  ...FITNESS_EN_KO,
  ...MEDICAL_EN_KO,
  ...EDUCATION_EN_KO,
  ...LEGAL_EN_KO,
  ...ARTS_EN_KO,
  ...SHOPPING_EN_KO,
  ...EMOTIONS_EN_KO,
  ...BODY_MOVEMENTS_EN_KO,
};

/**
 * 도메인 사전 통계
 */
export const DOMAIN_STATS = {
  sports: Object.keys(SPORTS_KO_EN).length,
  fitness: Object.keys(FITNESS_KO_EN).length,
  medical: Object.keys(MEDICAL_KO_EN).length,
  education: Object.keys(EDUCATION_KO_EN).length,
  legal: Object.keys(LEGAL_KO_EN).length,
  arts: Object.keys(ARTS_KO_EN).length,
  shopping: Object.keys(SHOPPING_KO_EN).length,
  emotions: Object.keys(EMOTIONS_KO_EN).length,
  bodyMovements: Object.keys(BODY_MOVEMENTS_KO_EN).length,
  get total() {
    return Object.keys(ALL_DOMAINS_KO_EN).length;
  },
};
