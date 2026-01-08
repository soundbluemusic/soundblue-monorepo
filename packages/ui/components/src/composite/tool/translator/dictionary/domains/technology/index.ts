// ========================================
// Technology Domain - 기술/IT 도메인 (통합 export)
// 데이터: external/words.ts에서 통합 (Context 앱에서 동기화)
// 로직: 하위 호환성을 위한 빈 객체 export
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

/**
 * 모든 기술/IT 용어 (한국어 → 영어)
 * 실제 데이터는 external에서 통합됨
 */
export const TECHNOLOGY_KO_EN: Record<string, string> = {};

/**
 * 모든 기술/IT 용어 (영어 → 한국어)
 * 실제 데이터는 external에서 통합됨
 */
export const TECHNOLOGY_EN_KO: Record<string, string> = {};
