// ========================================
// Technology Domain - 기술/IT 도메인 (통합 export)
// ========================================

// 아키텍처 및 디자인 패턴
export { TECH_ARCHITECTURE_EN_KO, TECH_ARCHITECTURE_KO_EN } from './architecture';
// 협업 및 프로젝트 관리
export { TECH_COLLABORATION_EN_KO, TECH_COLLABORATION_KO_EN } from './collaboration';
// 자료구조 및 알고리즘
export { TECH_DATA_STRUCTURES_EN_KO, TECH_DATA_STRUCTURES_KO_EN } from './data-structures';

// 데이터베이스
export { TECH_DATABASE_EN_KO, TECH_DATABASE_KO_EN } from './database';
// DevOps 및 클라우드
export { TECH_DEVOPS_CLOUD_EN_KO, TECH_DEVOPS_CLOUD_KO_EN } from './devops-cloud';
// 개발 분야 및 역할
export { TECH_FIELDS_ROLES_EN_KO, TECH_FIELDS_ROLES_KO_EN } from './fields-roles';
// 프레임워크 및 라이브러리
export { TECH_FRAMEWORKS_EN_KO, TECH_FRAMEWORKS_KO_EN } from './frameworks';
// 프로그래밍 언어
export { TECH_LANGUAGES_EN_KO, TECH_LANGUAGES_KO_EN } from './languages';
// 기타 용어
export { TECH_MISC_EN_KO, TECH_MISC_KO_EN } from './misc';
// 모니터링 및 로깅
export { TECH_MONITORING_EN_KO, TECH_MONITORING_KO_EN } from './monitoring';
// 네트워크 및 웹
export { TECH_NETWORK_WEB_EN_KO, TECH_NETWORK_WEB_KO_EN } from './network-web';
// 프로그래밍 개념
export {
  TECH_PROGRAMMING_CONCEPTS_EN_KO,
  TECH_PROGRAMMING_CONCEPTS_KO_EN,
} from './programming-concepts';
// 보안 및 테스팅
export { TECH_SECURITY_TESTING_EN_KO, TECH_SECURITY_TESTING_KO_EN } from './security-testing';
// 개발 도구
export { TECH_TOOLS_EN_KO, TECH_TOOLS_KO_EN } from './tools';

// UI/UX 및 디자인
export { TECH_UI_UX_EN_KO, TECH_UI_UX_KO_EN } from './ui-ux';
// 버전 관리
export { TECH_VERSION_CONTROL_EN_KO, TECH_VERSION_CONTROL_KO_EN } from './version-control';
// 웹 개발
export { TECH_WEB_DEVELOPMENT_EN_KO, TECH_WEB_DEVELOPMENT_KO_EN } from './web-development';

// ========================================
// 통합 사전 (Merged Dictionaries)
// ========================================

import { TECH_ARCHITECTURE_EN_KO, TECH_ARCHITECTURE_KO_EN } from './architecture';
import { TECH_COLLABORATION_EN_KO, TECH_COLLABORATION_KO_EN } from './collaboration';
import { TECH_DATA_STRUCTURES_EN_KO, TECH_DATA_STRUCTURES_KO_EN } from './data-structures';
import { TECH_DATABASE_EN_KO, TECH_DATABASE_KO_EN } from './database';
import { TECH_DEVOPS_CLOUD_EN_KO, TECH_DEVOPS_CLOUD_KO_EN } from './devops-cloud';
import { TECH_FIELDS_ROLES_EN_KO, TECH_FIELDS_ROLES_KO_EN } from './fields-roles';
import { TECH_FRAMEWORKS_EN_KO, TECH_FRAMEWORKS_KO_EN } from './frameworks';
import { TECH_LANGUAGES_EN_KO, TECH_LANGUAGES_KO_EN } from './languages';
import { TECH_MISC_EN_KO, TECH_MISC_KO_EN } from './misc';
import { TECH_MONITORING_EN_KO, TECH_MONITORING_KO_EN } from './monitoring';
import { TECH_NETWORK_WEB_EN_KO, TECH_NETWORK_WEB_KO_EN } from './network-web';
import {
  TECH_PROGRAMMING_CONCEPTS_EN_KO,
  TECH_PROGRAMMING_CONCEPTS_KO_EN,
} from './programming-concepts';
import { TECH_SECURITY_TESTING_EN_KO, TECH_SECURITY_TESTING_KO_EN } from './security-testing';
import { TECH_TOOLS_EN_KO, TECH_TOOLS_KO_EN } from './tools';
import { TECH_UI_UX_EN_KO, TECH_UI_UX_KO_EN } from './ui-ux';
import { TECH_VERSION_CONTROL_EN_KO, TECH_VERSION_CONTROL_KO_EN } from './version-control';
import { TECH_WEB_DEVELOPMENT_EN_KO, TECH_WEB_DEVELOPMENT_KO_EN } from './web-development';

/**
 * 모든 기술/IT 용어 (한국어 → 영어)
 * 총 ~2000+ 항목
 */
export const TECHNOLOGY_KO_EN: Record<string, string> = {
  ...TECH_FIELDS_ROLES_KO_EN,
  ...TECH_LANGUAGES_KO_EN,
  ...TECH_FRAMEWORKS_KO_EN,
  ...TECH_DATABASE_KO_EN,
  ...TECH_VERSION_CONTROL_KO_EN,
  ...TECH_DEVOPS_CLOUD_KO_EN,
  ...TECH_NETWORK_WEB_KO_EN,
  ...TECH_SECURITY_TESTING_KO_EN,
  ...TECH_ARCHITECTURE_KO_EN,
  ...TECH_PROGRAMMING_CONCEPTS_KO_EN,
  ...TECH_DATA_STRUCTURES_KO_EN,
  ...TECH_TOOLS_KO_EN,
  ...TECH_MONITORING_KO_EN,
  ...TECH_COLLABORATION_KO_EN,
  ...TECH_UI_UX_KO_EN,
  ...TECH_WEB_DEVELOPMENT_KO_EN,
  ...TECH_MISC_KO_EN,
};

/**
 * 모든 기술/IT 용어 (영어 → 한국어)
 * 총 ~2000+ 항목
 */
export const TECHNOLOGY_EN_KO: Record<string, string> = {
  ...TECH_FIELDS_ROLES_EN_KO,
  ...TECH_LANGUAGES_EN_KO,
  ...TECH_FRAMEWORKS_EN_KO,
  ...TECH_DATABASE_EN_KO,
  ...TECH_VERSION_CONTROL_EN_KO,
  ...TECH_DEVOPS_CLOUD_EN_KO,
  ...TECH_NETWORK_WEB_EN_KO,
  ...TECH_SECURITY_TESTING_EN_KO,
  ...TECH_ARCHITECTURE_EN_KO,
  ...TECH_PROGRAMMING_CONCEPTS_EN_KO,
  ...TECH_DATA_STRUCTURES_EN_KO,
  ...TECH_TOOLS_EN_KO,
  ...TECH_MONITORING_EN_KO,
  ...TECH_COLLABORATION_EN_KO,
  ...TECH_UI_UX_EN_KO,
  ...TECH_WEB_DEVELOPMENT_EN_KO,
  ...TECH_MISC_EN_KO,
};
