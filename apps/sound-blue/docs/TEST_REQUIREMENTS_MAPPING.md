# Test Requirements Coverage Mapping

This document maps functional requirements to their corresponding test coverage.

## Coverage Legend

- ✅ Fully covered (unit + integration/E2E)
- ⚠️ Partially covered
- ❌ Not covered

---

## 1. Core Features

### 1.1 Navigation System

| Requirement | Unit Test | E2E Test | Status |
|-------------|-----------|----------|--------|
| Sidebar renders correctly | `Sidebar.test.tsx` | `navigation.spec.ts` | ✅ |
| Bottom nav for mobile | `BottomNav.test.tsx` | `navigation.spec.ts` | ✅ |
| Active state highlighting | `Sidebar.test.tsx:187` | - | ✅ |
| External links open in new tab | `Sidebar.test.tsx:165-176` | - | ✅ |
| Keyboard navigation | `KeyboardShortcutsProvider.test.tsx` | `accessibility.spec.ts` | ✅ |

### 1.2 Theme System

| Requirement | Unit Test | E2E Test | Status |
|-------------|-----------|----------|--------|
| Light/Dark toggle | `ThemeProvider.test.tsx` | - | ✅ |
| Persist theme to localStorage | `ThemeProvider.test.tsx:62-77` | - | ✅ |
| System preference detection | `ThemeProvider.test.tsx` | - | ⚠️ |
| Theme icon display | `ThemeIcon.test.tsx` | - | ✅ |

### 1.3 Internationalization (i18n)

| Requirement | Unit Test | E2E Test | Status |
|-------------|-----------|----------|--------|
| URL-based language detection | `I18nProvider.test.tsx` | `i18n.spec.ts` | ✅ |
| Korean route re-exports | `ko-routes.test.ts` | `i18n.spec.ts` | ✅ |
| Translation key access | `I18nProvider.test.tsx` | - | ✅ |
| Localized path generation | `I18nProvider.test.tsx` | - | ✅ |

### 1.4 Chat System

| Requirement | Unit Test | E2E Test | Status |
|-------------|-----------|----------|--------|
| Message input | `ChatInput.test.tsx` | - | ✅ |
| Message display | `ChatMessage.test.tsx` | - | ✅ |
| Topic detection (NLP) | `ChatContainer.test.tsx` | - | ⚠️ |
| Info panel display | `InfoPanel.test.tsx` | - | ✅ |
| Korean auto-redirect | `ChatContainer.test.tsx` | - | ⚠️ |

---

## 2. Pages

### 2.1 Main Pages

| Page | Unit Test | E2E Test | Status |
|------|-----------|----------|--------|
| Home (/) | `routes.test.tsx` | `pages.spec.ts` | ✅ |
| About (/about) | - | `pages.spec.ts` | ⚠️ |
| News (/news) | `routes.test.tsx` | `pages.spec.ts` | ✅ |
| Blog (/blog) | `routes.test.tsx` | `pages.spec.ts` | ✅ |
| Chat (/chat) | - | - | ⚠️ |

### 2.2 Legal Pages

| Page | Unit Test | E2E Test | Status |
|------|-----------|----------|--------|
| Privacy (/privacy) | `routes.test.tsx` | `pages.spec.ts` | ✅ |
| Terms (/terms) | `routes.test.tsx` | `pages.spec.ts` | ✅ |
| License (/license) | `routes.test.tsx` | `pages.spec.ts` | ✅ |

### 2.3 Utility Pages

| Page | Unit Test | E2E Test | Status |
|------|-----------|----------|--------|
| 404 Not Found | `routes.test.tsx` | - | ✅ |
| Offline (PWA) | `routes.test.tsx` | `pwa.spec.ts` | ✅ |
| Sitemap | - | - | ❌ |

---

## 3. Components

### 3.1 Layout Components

| Component | Unit Test | Assertions | Status |
|-----------|-----------|------------|--------|
| Header | `Header.test.tsx` | 9 | ✅ |
| Footer | `Footer.test.tsx` | 8 | ✅ |
| NavigationLayout | `NavigationLayout.test.tsx` | 18 | ✅ |
| ErrorBoundary | `ErrorBoundary.test.tsx` | 10 | ✅ |

### 3.2 UI Components

| Component | Unit Test | Assertions | Status |
|-----------|-----------|------------|--------|
| Button | `Button.test.tsx` | 29 | ✅ |
| SearchBox | `SearchBox.test.tsx` | 24 | ✅ |
| BottomSheet | `BottomSheet.test.tsx` | 22 | ✅ |
| OptimizedImage | `OptimizedImage.test.tsx` | 26 | ✅ |

---

## 4. Utilities

### 4.1 Storage Utilities

| Function | Test File | Boundary Tests | Status |
|----------|-----------|----------------|--------|
| getStorageItem | `storage.test.ts` | ✅ | ✅ |
| setStorageItem | `storage.test.ts` | ✅ | ✅ |
| removeStorageItem | `storage.test.ts` | ✅ | ✅ |
| getRawStorageItem | `storage.test.ts` | ✅ | ✅ |
| setRawStorageItem | `storage.test.ts` | ✅ | ✅ |

### 4.2 Class Name Utility

| Function | Test File | Boundary Tests | Status |
|----------|-----------|----------------|--------|
| cn() | `utils.test.ts` | ✅ | ✅ |

---

## 5. Non-Functional Requirements

### 5.1 Accessibility (a11y)

| Requirement | Test | Status |
|-------------|------|--------|
| Skip to content link | `accessibility.spec.ts` | ✅ |
| Heading hierarchy | `accessibility.spec.ts` | ✅ |
| ARIA landmarks | `accessibility.spec.ts` | ✅ |
| Keyboard navigation | `accessibility.spec.ts` | ✅ |
| Focus indicators | `accessibility.spec.ts` | ✅ |

### 5.2 SEO

| Requirement | Test | Status |
|-------------|------|--------|
| Meta tags | `PageSeo.test.tsx`, `seo.spec.ts` | ✅ |
| Open Graph tags | `PageSeo.test.tsx` | ✅ |
| Twitter cards | `PageSeo.test.tsx` | ✅ |
| Canonical URLs | `PageSeo.test.tsx` | ✅ |
| hreflang alternates | `PageSeo.test.tsx` | ✅ |

### 5.3 PWA

| Requirement | Test | Status |
|-------------|------|--------|
| Manifest present | `pwa.spec.ts` | ✅ |
| Service worker | `pwa.spec.ts` | ✅ |
| Offline fallback | `pwa.spec.ts` | ✅ |

---

## 6. Test Quality Metrics

### Current State

| Metric | Value |
|--------|-------|
| Total Unit Tests | 604+ |
| Total E2E Tests | 352+ |
| Code Coverage (Statements) | 82%+ |
| Code Coverage (Lines) | 84%+ |
| Boundary Value Tests | 50+ |
| Behavioral Assertions | 30+ |

### Mutation Testing

| Metric | Target |
|--------|--------|
| Mutation Score | 80%+ |
| Survived Mutants | <20% |

---

## 7. Gap Analysis

### High Priority (Missing Coverage)

1. **Sitemap page** - No unit tests
2. **About page** - No unit tests (E2E only)
3. **Chat page** - No unit tests

### Medium Priority (Partial Coverage)

1. **Topic detection** - Limited NLP keyword tests
2. **Korean auto-redirect** - Edge cases not covered
3. **System theme preference** - Detection not fully tested

### Low Priority

1. **Build entry files** - SSR files hard to test
2. **Index barrel files** - Re-exports only

---

## 8. Recommendations

1. **Add unit tests for Sitemap page**
2. **Expand chat NLP topic detection tests**
3. **Run mutation testing regularly** (`pnpm test:mutation`)
4. **Add visual regression tests** (consider Playwright screenshots)
5. **Monitor coverage on PRs** (enforce 80% minimum)

---

*Last updated: 2025-12-15*
*Generated by: Claude Code*
