# Project Overview

프로젝트 개요, 기술 스택, 구조, 명령어: @README.md
상세 아키텍처 문서: @docs/ARCHITECTURE.md

## Package Architecture (패키지 아키텍처)

### Layer Rules (레이어 규칙)

```
┌─────────────────────────────────────────┐
│              apps/                      │  ← 모든 하위 레이어 import 가능
├─────────────────────────────────────────┤
│   ui/   │  i18n/  │  seo/  │  pwa/     │  ← platform/, core/ import 가능
├─────────────────────────────────────────┤
│              platform/                  │  ← core/만 import 가능
├─────────────────────────────────────────┤
│               core/                     │  ← 외부 import 금지
└─────────────────────────────────────────┘
```

### Package Categories (패키지 분류)

| Layer | Packages | Rules |
|-------|----------|-------|
| `core/` | hangul, translator, nlu, audio-engine | 브라우저 API 금지, 순수 TypeScript |
| `platform/` | web-audio, storage, worker | 이중 구현 필수 (.browser.ts + .noop.ts) |
| `ui/` | primitives, patterns, icons | React 컴포넌트 |
| Cross-cutting | i18n, seo, pwa, config | 공통 관심사 |

### Dual Implementation Pattern (이중 구현 패턴)

`platform/` 패키지는 SSG 호환을 위해 반드시 이중 구현 필요:

```typescript
// package.json exports
{
  "exports": {
    ".": {
      "browser": "./src/index.browser.ts",  // 브라우저 런타임
      "default": "./src/index.noop.ts"      // SSG 빌드 시
    }
  }
}
```

| File | Purpose | Environment |
|------|---------|-------------|
| `*.browser.ts` | 실제 구현 | 브라우저 런타임 |
| `*.noop.ts` | 빈 구현 (throw 또는 기본값 반환) | SSG 빌드 시 |

### Import Rules (Import 규칙)

```typescript
// ✅ 올바른 import
import { decompose } from '@soundblue/hangul';           // core
import { toneEngine } from '@soundblue/web-audio';       // platform
import { Button, cn } from '@soundblue/ui-primitives';   // ui
import { useLocale } from '@soundblue/i18n';             // cross-cutting

// ❌ 금지된 import (레이어 역방향)
// core/에서 platform/ import 금지
// platform/에서 ui/ import 금지
```

## 📚 Official References (공식 참고 문서)

> **항상 최신 공식 문서를 참고하여 코드 품질을 유지하고 향상시킬 것.**

| Technology | Official Docs | GitHub Repository |
|------------|---------------|-------------------|
| **Tailwind CSS v4** | [React Router Guide](https://tailwindcss.com/docs/installation/framework-guides/react-router) | [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) |
| **React Router v7** | [Official Docs](https://reactrouter.com/start/framework/deploying) | [remix-run/react-router](https://github.com/remix-run/react-router) |
| **TypeScript** | [Official Docs](https://www.typescriptlang.org/docs/) | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) |

### 참고 시점 (When to Reference)
- 새로운 기능 구현 시 최신 API 확인
- 빌드/설정 문제 해결 시 공식 가이드 참조
- 버전 업그레이드 시 마이그레이션 가이드 확인
- 베스트 프랙티스 적용 시 공식 예제 참고

### Tailwind CSS v4 + React Router v7 공식 설정

```typescript
// vite.config.ts - 공식 방식
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),  // @tailwindcss/vite 플러그인
    reactRouter(),
  ],
});
```

```css
/* app.css - 공식 방식 */
@import "tailwindcss";
```

**Note**: Tailwind v4는 `tailwind.config.js`, `postcss.config.js` 불필요 (Zero-config)

## 절대 규칙 (CRITICAL RULES)

> **이 규칙들은 절대 위반하지 말 것. CMS, 외부 DB, 서버 로직 제안 금지.**

1. **100% SSG Only** - 모든 앱은 정적 사이트 생성만 사용. SSR/서버 로직 절대 금지.
   ```typescript
   // react-router.config.ts 필수 설정
   import type { Config } from '@react-router/dev/config';

   export default {
     ssr: false,  // SSR 비활성화
     async prerender() {
       return [/* routes */];  // 사전 렌더링할 라우트 목록
     },
   } satisfies Config;
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

## Translator Development Rules (번역기 개발 규칙)

> **Location**: `apps/tools/app/tools/translator/`
> **Full docs**: `apps/tools/app/tools/translator/README.md`

### 🎯 하드코딩 정책 (Hardcoding Policy)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              하드코딩은 좋은 로직 설계일 경우에만 허용                             ║
║              (Hardcoding allowed ONLY with excellent logic design)            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ✅ 허용되는 하드코딩 (ALLOWED - Good Logic Design):                           ║
║                                                                              ║
║  • 일반화된 문법 패턴 (Generalized Grammar Patterns)                           ║
║    예: "Did + S + V + O?" → 모든 의문문 처리                                   ║
║    예: "-지 않았어" 패턴 → 모든 부정문 처리                                      ║
║                                                                              ║
║  • 언어학적 규칙 (Linguistic Rules)                                           ║
║    예: 받침 유무에 따른 조사 선택 (을/를, 은/는)                                 ║
║    예: 모음조화 규칙 (양성모음 → 아, 음성모음 → 어)                               ║
║                                                                              ║
║  • 재사용 가능한 구조 패턴 (Reusable Structure Patterns)                        ║
║    예: SVO → SOV 어순 변환 알고리즘                                            ║
║    예: 시제 변환 규칙 (과거 -ed → -었/았)                                       ║
║                                                                              ║
║  핵심: 동일 패턴의 모든 문장이 같은 로직으로 처리되어야 함                          ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 금지되는 하드코딩 (FORBIDDEN - Bad Logic Design):                          ║
║                                                                              ║
║  • 특정 테스트 문장만 매칭하는 정규식                                            ║
║    예: /^Did you go to the museum yesterday/                                 ║
║                                                                              ║
║  • 테스트 문장을 사전에 직접 추가                                               ║
║    예: sentences['I visited the museum'] = '나는 박물관을 방문했다'             ║
║                                                                              ║
║  • 특정 문장만 처리하는 마커(MARKER) 패턴                                       ║
║    예: if (text.includes('SPECIFIC_SENTENCE')) return '...';                 ║
║                                                                              ║
║  • 테스트 통과만을 위한 조건문                                                  ║
║    예: if (text === 'test sentence') return 'expected output';               ║
║                                                                              ║
║  핵심: 해당 문장만 통과하고, 비슷한 다른 문장은 실패하면 나쁜 로직                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 좋은 로직 vs 나쁜 로직 판단 기준

| 질문 | ✅ 좋은 로직 | ❌ 나쁜 로직 |
|------|-------------|-------------|
| 비슷한 다른 문장도 통과하는가? | Yes | No |
| 일반화된 패턴인가? | Yes | No |
| 언어학적 규칙 기반인가? | Yes | No |
| 재사용 가능한가? | Yes | No |

### Core Principle (핵심 원칙)
**100% Algorithm-Based Generalization** - 알고리즘 기반 일반화
- Level = 난이도 수준 (특정 테스트 문장이 아님)
- 해당 난이도의 **어떤 문장이든** 번역 가능해야 함
- 테스트 문장 = 샘플일 뿐, 하드코딩 대상 아님

### Prohibited (절대 금지)
| File | Prohibition |
|------|-------------|
| `dictionary/i18n-sentences.ts` | Adding test sentences (테스트 문장 추가) |
| `dictionary/idioms.ts` | Adding regular sentences (일반 문장 추가) |
| `dictionary/cultural-expressions.ts` | Adding test sentences (테스트 문장 추가) |
| `translator-service.ts` | 특정 문장 정규식 매칭 패턴 |
| `core/en-to-ko.ts` | 특정 문장 마커/하드코딩 |
| `core/ko-to-en.ts` | 특정 문장 마커/하드코딩 |

### Allowed (허용)
| File | Allowed Actions |
|------|-----------------|
| `dictionary/words.ts` | Individual word pairs only (개별 단어 쌍만) |
| `grammar/morpheme-analyzer.ts` | 일반화된 형태소 패턴, 동사 규칙 |
| `grammar/sentence-parser.ts` | 일반화된 문장 구조 파싱 로직 |
| `grammar/english-generator.ts` | 일반화된 영어 생성 규칙 |
| `core/en-to-ko.ts`, `core/ko-to-en.ts` | 일반화된 번역 알고리즘 |
| `context/context-analyzer.ts` | 문맥별 어휘 매핑 (CONTEXT_VOCABULARY) |

### 📚 문맥 기반 어휘 사전 정책 (Context-Based Vocabulary Policy)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║         기존 단어는 삭제하지 않고, 문맥별 변형을 추가한다                          ║
║         (Never delete existing words, ADD context-specific variants)         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📖 words.ts - 기본 단어 사전 (Base Dictionary)                               ║
║     • 기존 단어 쌍 유지 (Keep existing word pairs)                            ║
║     • 새로운 단어만 추가 (Only add new words)                                  ║
║     • 절대 삭제 금지 (Never delete)                                           ║
║                                                                              ║
║  🎭 context/context-analyzer.ts - 문맥별 어휘 (Context Vocabulary)            ║
║     • 화자 유형별 변형 추가 (Add speaker-type variants)                        ║
║       - teen: 10대 표현 (OMG, literally, cringe)                             ║
║       - elderly: 노인 표현 (dear, sweetie)                                   ║
║       - formal: 격식체 (remarkable, truly)                                   ║
║       - angry: 화남 표현 (what the hell)                                     ║
║       - villain: 악당 표현                                                   ║
║       - loving: 애정 표현 (alright sweetie)                                  ║
║       - romance: 연애 표현                                                   ║
║       - sarcastic: 비꼬는 표현 (that's rich)                                 ║
║                                                                              ║
║  ✅ 올바른 추가 방식:                                                         ║
║     CONTEXT_VOCABULARY['대박'] = {                                           ║
║       default: 'awesome',    // 기본값 (유지)                                 ║
║       teen: 'OMG',           // 10대 문맥 (추가)                              ║
║       formal: 'remarkable',  // 격식 문맥 (추가)                              ║
║     };                                                                       ║
║                                                                              ║
║  ❌ 잘못된 방식:                                                              ║
║     • 기존 default 값 변경/삭제                                               ║
║     • 문맥 없이 words.ts에서 단어 의미 변경                                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 번역 흐름 (Translation Flow)
```
입력 문장 → 문맥 분석 (analyzeContext) → 화자/감정/상황 파악
         → 기본 번역 (words.ts 기반)
         → 문맥 적용 (CONTEXT_VOCABULARY로 어휘 치환)
         → 최종 출력
```

### When Test Fails (테스트 실패 시)
1. **DO NOT** add the sentence to dictionary files (사전에 문장 추가 금지)
2. **DO NOT** add regex patterns for specific sentences (특정 문장 정규식 금지)
3. **DO NOT** add MARKER patterns for specific phrases (마커 패턴 금지)
4. **DO NOT** delete existing word mappings from dictionaries (기존 단어 매핑 삭제 금지)
5. **DO** analyze which GENERAL algorithm component needs improvement (일반화 알고리즘 개선)
6. **DO** make structural changes that work for ALL similar sentences (모든 유사 문장에 적용)
7. **DO** ADD new context variants to CONTEXT_VOCABULARY (문맥별 변형 추가)
8. **DO** ADD new words to words.ts (keep existing, add new) (기존 유지, 새 단어 추가)

## The Perfect Dodecagon (12 Quality Metrics / 12가지 품질 지표)

> All code must satisfy the 12 metrics below. (모든 코드는 아래 12가지 지표를 만족해야 한다.)

### I. Stability & Maintainability (안정성 & 유지보수성)
| # | Metric (지표) | Tools (도구) | When (검증 시점) |
|---|---------------|--------------|------------------|
| 1 | Test Coverage (테스트 커버리지) | Vitest + coverage-v8 (≥80%) | CI |
| 2 | Visual Coverage (시각적 커버리지) | Playwright + pixelmatch | CI |
| 3 | Code Health (코드 건강) | size-limit, TypeScript strict | CI |
| 4 | Monorepo Integrity (모노레포 무결성) | skott (circular deps / 순환 의존성), syncpack (version sync / 버전 통일) | CI |

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
