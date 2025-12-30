// ========================================
// @soundblue/seo - Structured Data
// Public API
// ========================================

// React component API
export {
  BreadcrumbStructuredData,
  MusicGroupStructuredData,
  OrganizationStructuredData,
  SoftwareApplicationStructuredData,
  WebSiteStructuredData,
} from './components';
// Function-based API
export {
  combineJsonLd,
  createBreadcrumbJsonLd,
  createOrganizationJsonLd,
  createSoftwareApplicationJsonLd,
  createWebSiteJsonLd,
  generateJsonLdScript,
} from './json-ld';
