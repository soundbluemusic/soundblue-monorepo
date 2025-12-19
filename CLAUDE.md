# Project Overview

프로젝트 개요, 기술 스택, 구조, 명령어: @README.md

## 절대 규칙 (CRITICAL RULES)

> **이 규칙들은 절대 위반하지 말 것. CMS, 외부 DB, 서버 로직 제안 금지.**

1. **100% SSG Only** - 모든 앱은 정적 사이트 생성만 사용. SSR/서버 로직 절대 금지.
   ```typescript
   // app.config.ts 필수 설정
   export default defineConfig({
     ssr: false,                    // SSR 비활성화
     server: { preset: 'static' }, // 정적 빌드
   });
   ```
2. **오픈소스 Only** - 모든 라이브러리/도구는 오픈소스만 사용.
3. **웹 표준 API Only** - 브라우저 표준 API만 사용. 벤더 종속 API 금지.
4. **로컬 스토리지 Only** - DB는 localStorage, IndexedDB만 사용. 외부 DB/CMS 절대 금지.

## Code Quality Rules (코드 품질 규칙)

### Absolute Prohibitions (절대 금지)
- Never delete/comment out code to hide errors (에러 숨기려고 코드 삭제/주석 처리 금지)
- Never hardcode values or mock data to pass tests (테스트 통과용 하드코딩/목 데이터 금지)
- Never disable tests, validation, or security checks (테스트/검증/보안 체크 비활성화 금지)
- Never use `// ... existing code ...` - always provide complete code (항상 완전한 코드 제공)

### Required Process (필수 프로세스)
Before any fix (수정 전 반드시):
1. Identify root cause (WHY, not just WHAT) - 근본 원인 파악
2. Explain why naive fixes (delete/hardcode/disable) are wrong - 단순 수정이 왜 잘못인지 설명
3. Verify existing functionality is preserved - 기존 기능 유지 확인

### Quality Standards (품질 기준)
- Structural solutions over superficial patches (표면적 패치보다 구조적 해결)
- Handle edge cases explicitly (엣지 케이스 명시적 처리)
- Follow project conventions (프로젝트 컨벤션 준수)
- Add comments explaining WHY (WHY를 설명하는 주석)

### When Uncertain (불확실할 때)
Ask before: removing code, changing core logic, breaking changes.
(다음 작업 전 질문: 코드 제거, 핵심 로직 변경, 브레이킹 체인지)

## Response Rules (응답 규칙)

- 확인 전에 단정하지 않는다 (Don't assert before verifying)
- 추측은 추측이라고 표시한다 (Mark assumptions as assumptions)
- 출처를 명시한다 (Cite sources)

## The Perfect Dodecagon (12 Quality Metrics / 12가지 품질 지표)

> All code must satisfy the 12 metrics below. (모든 코드는 아래 12가지 지표를 만족해야 한다.)

### I. Stability & Maintainability (안정성 & 유지보수성)
| # | Metric (지표) | Tools (도구) | When (검증 시점) |
|---|---------------|--------------|------------------|
| 1 | Test Coverage (테스트 커버리지) | Vitest + coverage-v8 (≥80%) | CI |
| 2 | Visual Coverage (시각적 커버리지) | Playwright + pixelmatch | CI |
| 3 | Code Health (코드 건강) | size-limit, TypeScript strict | CI |
| 4 | Monorepo Integrity (모노레포 무결성) | madge (circular deps / 순환 의존성), syncpack (version sync / 버전 통일) | CI |

### II. Performance & Reach (성능 & 도달)
| # | Metric (지표) | Tools (도구) | When (검증 시점) |
|---|---------------|--------------|------------------|
| 5 | Lighthouse Score (라이트하우스 점수) | @lhci/cli (≥90, target 98 / 목표 98) | CI |
| 6 | SEO Health (SEO 건강) | Build script (meta tag validation / 메타태그 검증) | Build |
| 7 | Static Integrity (정적 무결성) | broken-link-checker | Post-build (빌드 후) |

### III. User Experience & Adaptation (사용자 경험 & 적응)
| # | Metric (지표) | Tools (도구) | When (검증 시점) |
|---|---------------|--------------|------------------|
| 8 | PWA Readiness (PWA 준비) | vite-plugin-pwa | Build |
| 9 | Mobile Optimality (모바일 최적화) | Playwright (touch target ≥44px / 터치 타겟 ≥44px) | CI |
| 10 | Responsive (반응형) | Playwright (320px~4K screenshots / 스크린샷) | CI |
| 11 | Accessibility (접근성) | axe-core + Playwright | CI |

### IV. Security & Privacy (보안 & 개인정보)
| # | Metric (지표) | Tools (도구) | When (검증 시점) |
|---|---------------|--------------|------------------|
| 12 | Client Security (클라이언트 보안) | CSP headers (Cloudflare) + dotenv-linter | Build + Deploy (배포) |

### Validation Separation (검증 분리)
- **pre-commit**: Biome (lint, format) + tsc --noEmit
- **CI**: Everything else in parallel (나머지 전부 병렬 실행)

### Action Rule (행동 규칙)
When writing code, if any of the 12 metrics is compromised (코드 작성 시 12가지 지표 중 하나라도 저해되면):
1. Warn immediately (즉시 경고)
2. Suggest alternatives (대안 제시)
3. Do not proceed without user confirmation (사용자 확인 없이 진행 금지)
