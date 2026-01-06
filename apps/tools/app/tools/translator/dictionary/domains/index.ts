// ========================================
// Domain Dictionaries - 도메인별 사전 통합 export
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 하위 호환성을 위한 빈 객체 export
// 성능 최적화: 외부 사전은 lazy loading (920KB)
// ========================================

import {
  getExternalEnToKoWords,
  getExternalKoToEnWords,
  lookupExternalEnToKo,
  lookupExternalKoToEn,
} from '../external';

// 개별 도메인 export (하위 호환성 - 빈 객체)
export { ARTS_EN_KO, ARTS_KO_EN } from './arts';
export * from './body';
export { BODY_MOVEMENTS_EN_KO, BODY_MOVEMENTS_KO_EN } from './body-movements';
export { BOOKS_EN_KO, BOOKS_KO_EN } from './books';
export { EDUCATION_EN_KO, EDUCATION_KO_EN } from './education';
export { EMOTIONS_EN_KO, EMOTIONS_KO_EN } from './emotions';
export { FITNESS_EN_KO, FITNESS_KO_EN } from './fitness';
export { FOOD_EN_KO, FOOD_KO_EN } from './food';
export { HOME_EN_KO, HOME_KO_EN } from './home';
export { HOSPITAL_EN_KO, HOSPITAL_KO_EN } from './hospital';
export { LEGAL_EN_KO, LEGAL_KO_EN } from './legal';
export { MEDICAL_EN_KO, MEDICAL_KO_EN } from './medical';
export { SHOPPING_EN_KO, SHOPPING_KO_EN } from './shopping';
export { SPORTS_EN_KO, SPORTS_KO_EN } from './sports';
export * from './technology';

/**
 * 모든 도메인 사전 통합 (한→영) - Proxy로 lazy loading
 * 실제 데이터는 external에서 통합됨 (lazy loading)
 *
 * 사용법:
 * import { ALL_DOMAINS_KO_EN } from './domains';
 *
 * 또는 개별 import:
 * import { SPORTS_KO_EN, FITNESS_KO_EN } from './domains';
 */
export const ALL_DOMAINS_KO_EN: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    return lookupExternalKoToEn(prop) ?? undefined;
  },
  has(_target, prop: string) {
    return lookupExternalKoToEn(prop) !== null;
  },
  ownKeys() {
    return Object.keys(getExternalKoToEnWords());
  },
  getOwnPropertyDescriptor(_target, prop: string) {
    const value = lookupExternalKoToEn(prop);
    if (value !== null) {
      return { enumerable: true, configurable: true, value };
    }
    return undefined;
  },
});

/**
 * 모든 도메인 사전 통합 (영→한) - Proxy로 lazy loading
 * 실제 데이터는 external에서 통합됨 (lazy loading)
 */
export const ALL_DOMAINS_EN_KO: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    return lookupExternalEnToKo(prop) ?? undefined;
  },
  has(_target, prop: string) {
    return lookupExternalEnToKo(prop) !== null;
  },
  ownKeys() {
    return Object.keys(getExternalEnToKoWords());
  },
  getOwnPropertyDescriptor(_target, prop: string) {
    const value = lookupExternalEnToKo(prop);
    if (value !== null) {
      return { enumerable: true, configurable: true, value };
    }
    return undefined;
  },
});

/**
 * 도메인 사전 통계
 * 실제 데이터는 external에서 통합되므로 전체 통계만 제공
 */
export const DOMAIN_STATS = {
  sports: 0,
  fitness: 0,
  medical: 0,
  education: 0,
  legal: 0,
  arts: 0,
  shopping: 0,
  emotions: 0,
  bodyMovements: 0,
  body: { total: 0 },
  technology: 0,
  books: 0,
  food: 0,
  home: 0,
  hospital: 0,
  get total() {
    return Object.keys(getExternalKoToEnWords()).length;
  },
};
