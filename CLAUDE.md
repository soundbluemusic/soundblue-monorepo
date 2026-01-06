# Project Overview

프로젝트 개요, 기술 스택, 구조, 명령어: @README.md
상세 아키텍처 문서: @docs/ARCHITECTURE.md

## Package Architecture (패키지 아키텍처)

### Layer Rules (레이어 규칙)

```
┌─────────────────────────────────────────┐
│              apps/                      │  ← 모든 하위 레이어 import 가능
├─────────────────────────────────────────┤
│               ui/                       │  ← platform/, core/ import 가능
├─────────────────────────────────────────┤
│            platform/                    │  ← core/만 import 가능
├─────────────────────────────────────────┤
│              core/                      │  ← 외부 import 금지
└─────────────────────────────────────────┘
```

### Package Categories (패키지 분류)

| Layer | Packages | Rules |
|-------|----------|-------|
| `core/` | hangul, translator, nlu, audio-engine, locale | 브라우저 API 금지, 순수 TypeScript |
| `platform/` | web-audio, storage, worker, i18n, seo, pwa | 이중 구현 필수 (.browser.ts + .noop.ts) |
| `ui/` | components (base, composite, icons) | React 컴포넌트 |
| `tooling/` | tsconfig, tailwind, biome | 공유 설정 (패키지 외부) |

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
import { decompose } from '@soundblue/hangul';              // core
import { getLocaleFromPath } from '@soundblue/locale';      // core
import { toneEngine } from '@soundblue/web-audio';          // platform
import { useLocale } from '@soundblue/i18n';                // platform
import { Button, cn } from '@soundblue/ui-components/base'; // ui

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

### 참조 우선순위 (Reference Priority)

> **정보를 찾을 때 반드시 이 순서를 따를 것**

```
1️⃣ 공식 문서 (Official Docs)     ← 항상 최우선
2️⃣ GitHub Issues/Discussions    ← 최신 이슈 및 해결책
3️⃣ Stack Overflow               ← 검증된 답변만
4️⃣ 블로그/튜토리얼               ← 최후의 수단
```

**필수 확인 사항:**
- Breaking changes → 반드시 공식 마이그레이션 가이드 참조
- 버전 호환성 → package.json 버전과 문서 버전 일치 확인
- 새 API 사용 시 → 공식 예제 먼저 확인

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

## SSG Hydration Workaround (자체 해결책)

> **React Router v7 + React 19 SSG 환경의 hydration 버그 해결책 (공식 미제공)**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ⚠️ SSG HYDRATION WORKAROUND - 삭제 금지 ⚠️                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📍 위치: apps/*/app/entry.client.tsx                                        ║
║                                                                              ║
║  🐛 문제:                                                                    ║
║  • SSG 빌드 후 버튼 클릭(북마크, 다운로드 등)이 작동하지 않음                     ║
║  • Hydration 실패 시 React가 새 DOM을 생성하지만 기존 서버 HTML을               ║
║    삭제하지 않아 DOM 중복 발생                                                 ║
║  • 공식 팀 상태: "버그 수정 중..." (2024년부터 계속)                            ║
║                                                                              ║
║  ✅ 해결책: entry.client.tsx에서 orphan DOM 제거                              ║
║                                                                              ║
║  // apps/*/app/entry.client.tsx - 삭제 금지!                                  ║
║  // React Router v7 SSG hydration 버그 workaround                            ║
║  setTimeout(() => {                                                          ║
║    const divs = [...document.body.children].filter(                          ║
║      el => el.tagName === 'DIV'                                              ║
║    );                                                                        ║
║    if (divs.length >= 2 &&                                                   ║
║        !Object.keys(divs[0]).some(k => k.startsWith('__react'))) {           ║
║      divs[0].remove();  // React가 관리 안하는 orphan DOM 제거                 ║
║    }                                                                         ║
║  }, 100);                                                                    ║
║                                                                              ║
║  🔗 관련 이슈:                                                               ║
║  • https://github.com/remix-run/react-router/issues/12893                    ║
║  • https://github.com/remix-run/react-router/issues/12360                    ║
║                                                                              ║
║  ⚠️ 공식 수정이 나올 때까지 이 workaround 유지 필수                             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 절대 규칙 (CRITICAL RULES)

> **이 규칙들은 절대 위반하지 말 것. CMS, 외부 DB, 서버 로직 제안 금지.**

### 규칙 간 우선순위 (Rule Priority)

> **규칙이 충돌할 때 이 순서를 따를 것**

```
1️⃣ 절대 규칙 (CRITICAL RULES)     ← 최우선, 예외 없음
2️⃣ 코드 품질 규칙 (절대 금지)      ← 에러 숨기기/하드코딩 금지 등
3️⃣ 레이어/아키텍처 규칙           ← import 방향, 이중 구현 등
4️⃣ 품질 지표 (12 Metrics)        ← 커버리지, 접근성 등
```

**충돌 해결 예시:**

| 충돌 상황 | 해결 방법 |
|----------|----------|
| 커버리지 80% 달성 vs 코드 삭제 금지 | 코드 삭제 금지 우선 → 새 테스트 추가로 커버리지 해결 |
| 빌드 에러 vs 하드코딩 금지 | 하드코딩 금지 우선 → 근본 원인 수정 |
| 성능 최적화 vs SSG Only | SSG Only 우선 → SSG 호환 방식으로 최적화 |
| 번들 크기 vs 기능 유지 | 기능 유지 우선 → lazy loading으로 번들 분리 |

1. **100% SSG Only** - 모든 앱은 정적 사이트 생성만 사용. SSR/서버 로직 절대 금지.

   ```
   ╔══════════════════════════════════════════════════════════════════════════════╗
   ║                    ⚠️ SSG ONLY - 절대 규칙 ⚠️                                  ║
   ╠══════════════════════════════════════════════════════════════════════════════╣
   ║                                                                              ║
   ║  이 프로젝트는 100% SSG (Static Site Generation) 모드만 사용합니다.            ║
   ║  다른 모드는 절대 활성화하지 마세요.                                            ║
   ║                                                                              ║
   ║  ❌ 절대 금지 (NEVER):                                                        ║
   ║  • SPA 모드 활성화 (ssr: true 또는 prerender 제거)                            ║
   ║  • SSR 모드 활성화                                                           ║
   ║  • 서버 사이드 로직 추가                                                      ║
   ║  • API 라우트 추가                                                           ║
   ║  • 서버 컴포넌트 사용                                                         ║
   ║  • prerender() 함수 제거 또는 빈 배열 반환                                    ║
   ║                                                                              ║
   ║  ✅ 필수 설정 (REQUIRED):                                                     ║
   ║  • ssr: false (항상)                                                         ║
   ║  • prerender() 함수에 모든 라우트 명시                                        ║
   ║  • 브라우저 API는 platform/ 레이어의 이중 구현 사용                            ║
   ║                                                                              ║
   ╚══════════════════════════════════════════════════════════════════════════════╝
   ```

   ```typescript
   // react-router.config.ts 필수 설정
   import type { Config } from '@react-router/dev/config';

   export default {
     ssr: false,  // SSR 비활성화 - 절대 true로 변경 금지!
     async prerender() {
       return [/* routes */];  // 사전 렌더링할 라우트 목록 - 절대 제거 금지!
     },
   } satisfies Config;
   ```
2. **오픈소스 Only** - 모든 라이브러리/도구는 오픈소스만 사용.
3. **웹 표준 API Only** - 브라우저 표준 API만 사용. 벤더 종속 API 금지.
4. **로컬 스토리지 Only** - DB는 localStorage, IndexedDB만 사용. 외부 DB/CMS 절대 금지.

## 🎯 Project-Wide Quality Principles (프로젝트 전체 품질 원칙)

> **이 원칙은 모든 앱과 패키지에 적용됩니다.**
> **This principle applies to ALL apps and packages.**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║         품질/성능 우선, 테스트 통과 우선 아님                                       ║
║         (Quality/Performance First, NOT Test Passing First)                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🎯 핵심 원칙:                                                                ║
║  "테스트를 통과시키는 것"이 아니라 "제품을 더 좋게 만드는 것"이 목표              ║
║  The goal is "making the product better", NOT "making tests pass"           ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 금지되는 접근 방식 (Anti-Patterns):                                        ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ 1. 하드코딩 (Hardcoding)                                              │    ║
║  │    • 특정 케이스만 통과하는 조건문                                       │    ║
║  │    • 테스트 데이터를 직접 코드에 삽입                                    │    ║
║  │                                                                      │    ║
║  │ 2. 과적합 (Overfitting)                                               │    ║
║  │    • 테스트 데이터에만 맞춘 로직                                        │    ║
║  │    • 유사한 다른 케이스에서 실패하는 해결책                               │    ║
║  │                                                                      │    ║
║  │ 3. 임시 해결 (Quick Fix)                                              │    ║
║  │    • 근본 원인 무시하고 증상만 수정                                      │    ║
║  │    • "일단 동작하게" 하는 패치                                          │    ║
║  │                                                                      │    ║
║  │ 4. 삭제/교체 (Delete/Replace)                                         │    ║
║  │    • 기존 작동하는 코드/데이터 무단 삭제                                  │    ║
║  │    • 테스트 통과를 위해 기존 값 교체                                     │    ║
║  │                                                                      │    ║
║  │ 5. 에러 숨기기 (Error Hiding)                                         │    ║
║  │    • try-catch로 에러 무시                                            │    ║
║  │    • 빈 fallback 값으로 문제 은폐                                      │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  🟢 올바른 접근 방식 (Correct Approaches):                                    ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ 1. 일반화 (Generalization)                                            │    ║
║  │    • 모든 유사 케이스에 적용되는 패턴/알고리즘                             │    ║
║  │    • 규칙 기반 로직                                                    │    ║
║  │                                                                      │    ║
║  │ 2. 확장 (Extension)                                                   │    ║
║  │    • 기존 유지 + 새로운 것 추가                                         │    ║
║  │    • 동의어/대안 추가 후 문맥 기반 선택                                   │    ║
║  │                                                                      │    ║
║  │ 3. 구조적 해결 (Structural Fix)                                        │    ║
║  │    • 근본 원인 파악 후 수정                                             │    ║
║  │    • 아키텍처 개선                                                     │    ║
║  │                                                                      │    ║
║  │ 4. 명시적 처리 (Explicit Handling)                                     │    ║
║  │    • 에러 원인 수정                                                    │    ║
║  │    • 엣지 케이스 명시적 처리                                            │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📌 적용 범위 (Scope):                                                       ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ apps/                                                                │    ║
║  │ ├── sound-blue/   ← 적용                                             │    ║
║  │ ├── tools/        ← 적용 (번역기 등 모든 도구)                          │    ║
║  │ └── dialogue/     ← 적용                                             │    ║
║  │                                                                      │    ║
║  │ packages/                                                            │    ║
║  │ ├── core/         ← 적용 (hangul, translator, nlu, audio-engine)     │    ║
║  │ ├── platform/     ← 적용 (web-audio, storage, worker, i18n, seo, pwa)│    ║
║  │ └── ui/           ← 적용 (components)                                │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 패키지별 적용 예시 (Examples by Package)

| 패키지 | ❌ 잘못된 예 | ✅ 올바른 예 |
|--------|-------------|-------------|
| **translator** | 테스트 문장을 사전에 직접 추가 | 문법 패턴 알고리즘 개선 |
| **hangul** | 특정 글자만 처리하는 if문 | 유니코드 범위 기반 일반화 |
| **nlu** | 특정 intent만 매칭하는 정규식 | 의도 분류 모델/패턴 개선 |
| **ui** | 특정 컴포넌트만 수정하는 CSS hack | 디자인 시스템 토큰 활용 |
| **sound-blue** | 특정 페이지만 작동하는 fix | 공통 레이아웃/컴포넌트 수정 |
| **dialogue** | 특정 질문만 답변하는 조건문 | Q&A 매칭 알고리즘 개선 |
| **web-audio** | 특정 브라우저만 작동하는 코드 | 기능 감지 + 폴백 패턴 |
| **storage** | 특정 데이터 구조만 처리 | 범용 직렬화/역직렬화 |

### 자가 검증 질문 (Self-Check Questions)

코드 작성/수정 전 다음 질문에 답하세요:

| # | 질문 | ✅ 진행 | ⚠️ 재검토 필요 |
|---|------|--------|---------------|
| 1 | 이 변경이 비슷한 다른 케이스에서도 작동하는가? | Yes | No |
| 2 | 기존 기능을 삭제/교체하지 않고 확장하는가? | Yes | No |
| 3 | 테스트 통과가 아닌 제품 개선이 목적인가? | Yes | No |
| 4 | 근본 원인을 해결하는가, 증상만 숨기는가? | 근본 원인 | 증상 |
| 5 | 6개월 후에도 이 코드가 유지보수 가능한가? | Yes | No |

---

## Code Quality Rules (코드 품질 규칙)

### Absolute Prohibitions (절대 금지) ⛔

> **이 규칙들을 위반하면 즉시 중단하고 근본 원인을 파악할 것**

#### 1. 하드코딩 규칙 (HARDCODING RULES)

> **기본 원칙: 하드코딩은 금지. 단, 우수한 설계 목적일 경우에만 예외 허용.**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    하드코딩 허용/금지 기준 (전체 프로젝트 적용)                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 절대 금지 (NEVER ALLOWED):                                               ║
║                                                                              ║
║  • 테스트 통과를 위한 하드코딩된 값                                             ║
║  • 빌드 에러 회피를 위한 임시 상수                                              ║
║  • "일단 동작하게" 하려는 매직 넘버                                             ║
║  • 특정 환경에서만 작동하는 고정값                                              ║
║  • 에러 메시지를 숨기기 위한 기본값                                             ║
║  • 특정 테스트 케이스만 통과하는 조건문                                          ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ✅ 허용되는 하드코딩 (ALLOWED - 우수한 설계 목적):                              ║
║                                                                              ║
║  • 명확한 이름의 상수 정의 (LIMITS.ID_LENGTH = 100)                            ║
║  • 타입 안전성을 위한 enum/literal 값                                          ║
║  • 수학/물리 상수 (Math.PI, Euler's number)                                   ║
║  • CSS 변수로 노출된 디자인 토큰 (--header-height: 56px)                       ║
║  • 프로토콜/표준 명세 기반 값 (HTTP status codes)                               ║
║  • 일반화된 패턴 (모든 유사 케이스에 적용 가능)                                   ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ⚠️ 허용 조건 (Required for Allowed Hardcoding):                              ║
║                                                                              ║
║  1. 명확하고 서술적인 이름 사용                                                 ║
║  2. 왜 이 값인지 주석으로 설명                                                  ║
║  3. 단일 출처(Single Source of Truth)에서 정의                                 ║
║  4. @soundblue/core에서 export하여 재사용                                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**하드코딩 검토 질문 (코드 작성 전 자가 검증):**

| # | 질문 | ✅ 허용 | ❌ 금지 |
|---|------|--------|--------|
| 1 | 이것이 우수한 설계의 일부인가, 아니면 지름길인가? | 설계 | 지름길 |
| 2 | 이 값이 변경되면 한 곳에서만 수정하면 되는가? | Yes | No |
| 3 | 이 값의 의미가 이름과 주석으로 명확한가? | Yes | No |
| 4 | 비슷한 다른 케이스도 이 로직으로 처리되는가? | Yes | No |

#### 2. 에러 숨기기 절대 금지 (NO ERROR HIDING)

```
❌ 금지 행위:
• 에러 숨기려고 코드 삭제/주석 처리
• 빈 catch 블록 사용
• 설명 없이 @ts-ignore 사용
• 타입 체크 우회용 any 타입 사용
• console.error만 하고 에러 무시
• try-catch로 감싸고 아무것도 안 함
```

#### 3. 테스트/검증 비활성화 절대 금지 (NO DISABLING)

```
❌ 금지 행위:
• 테스트/검증/보안 체크 비활성화
• pre-commit hooks 스킵
• --no-verify 플래그 사용
• eslint-disable 남용 (정당한 사유 없이)
• vitest.skip 남용
```

#### 4. 불완전한 코드 절대 금지 (NO INCOMPLETE CODE)

```
❌ 금지 행위:
• `// ... existing code ...` 사용 - 항상 완전한 코드 제공
• 추적 이슈 없이 TODO 주석 남기기
• 플레이스홀더 구현 커밋
• 임시 해결책 커밋 (나중에 고칠게요)
```

### Required Process (필수 프로세스)

Before any fix (수정 전 반드시):

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Identify root cause (WHY, not just WHAT)                   │
│     → 근본 원인 파악 (무엇이 아니라 왜)                            │
├─────────────────────────────────────────────────────────────────┤
│  2. Explain why naive fixes are wrong                          │
│     → 단순 수정(삭제/하드코딩/비활성화)이 왜 잘못인지 설명           │
├─────────────────────────────────────────────────────────────────┤
│  3. Verify existing functionality is preserved                 │
│     → 기존 기능 유지 확인                                        │
├─────────────────────────────────────────────────────────────────┤
│  4. Check for hardcoded values                                 │
│     → 하드코딩된 값이 있는지 확인 (검토 질문 4개 적용)              │
└─────────────────────────────────────────────────────────────────┘
```

### Quality Standards (품질 기준)

- **Single Source of Truth** - 모든 데이터는 하나의 출처에서만 정의
- Structural solutions over superficial patches (표면적 패치보다 구조적 해결)
- Handle edge cases explicitly (엣지 케이스 명시적 처리)
- Follow project conventions (프로젝트 컨벤션 준수)
- Add comments explaining WHY (WHY를 설명하는 주석)

#### 5. UI-vitest 동기화 필수 (UI-vitest Synchronization Required)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              UI와 vitest는 반드시 100% 동일해야 한다                              ║
║              (UI and vitest MUST be 100% identical)                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 절대 금지 (ABSOLUTELY PROHIBITED):                                        ║
║  • vitest에서만 통과하고 UI에서 실패하는 변경                                    ║
║  • UI에서만 통과하고 vitest에서 실패하는 변경                                    ║
║  • "코드상으로는 통과" 같은 애매한 표현                                          ║
║  • "엄격한 테스트" vs "관대한 테스트" 구분                                       ║
║  • vitest와 UI의 정규화/비교 함수가 다른 것                                     ║
║                                                                              ║
║  ✅ 필수 (REQUIRED):                                                         ║
║  • 테스트 파일과 UI 컴포넌트가 완전히 동일한 로직 사용                             ║
║  • 변경 후 반드시 양쪽에서 테스트 실행                                           ║
║  • 결과 보고 시 vitest와 UI 모두 확인 후 보고                                   ║
║                                                                              ║
║  ⚠️ 위반 시: "해결되었습니다" 같은 보고는 무효                                    ║
║     vitest + UI 양쪽 모두 통과 확인 후에만 "해결됨" 선언 가능                     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### When Uncertain (불확실할 때)

Ask before (다음 작업 전 질문):
- Removing code (코드 제거)
- Changing core logic (핵심 로직 변경)
- Breaking changes (브레이킹 체인지)
- **Adding hardcoded values (하드코딩 추가)**

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

### CI 구현 현황 (Implementation Status)

> **마지막 업데이트: 2026-01-01**

| # | 지표 | CI 구현 | 명령어 |
|---|------|:-------:|--------|
| 1 | Test Coverage | ⬜ | `pnpm test:coverage` |
| 2 | Visual Coverage | ⬜ | Playwright + pixelmatch |
| 3 | Code Health | ⬜ | `pnpm check:size`, `pnpm typecheck` |
| 4 | Monorepo Integrity | ⬜ | `pnpm check:circular`, `pnpm check:versions` |
| 5 | Lighthouse Score | ⬜ | `pnpm lhci autorun` |
| 6 | SEO Health | ⬜ | `pnpm verify:ssg` |
| 7 | Static Integrity | ⬜ | `pnpm check:links` |
| 8 | PWA Readiness | ⬜ | vite-plugin-pwa |
| 9 | Mobile Optimality | ⬜ | Playwright (touch targets) |
| 10 | Responsive | ⬜ | Playwright (screenshots) |
| 11 | Accessibility | ⬜ | axe-core + Playwright |
| 12 | Client Security | ⬜ | CSP headers check |

> ⬜ = 미구현, ✅ = 구현 완료

### Validation Separation (검증 분리)

```
pre-commit:
  └── Biome (lint, format) + tsc --noEmit

CI (병렬 실행):
  ├── Job 1: Vitest, skott, syncpack
  ├── Job 2: Playwright (visual, a11y, mobile, responsive)
  ├── Job 3: Lighthouse CI
  └── Job 4: broken-link-checker, size-limit
```

### Action Rule (행동 규칙)
When writing code, if any of the 12 metrics is compromised (코드 작성 시 12가지 지표 중 하나라도 저해되면):
1. Warn immediately (즉시 경고)
2. Suggest alternatives (대안 제시)
3. Do not proceed without user confirmation (사용자 확인 없이 진행 금지)

---

## Translator Development Rules (번역기 개발 규칙)

> **Location**: `apps/tools/app/tools/translator/`
> **Full docs**: `apps/tools/app/tools/translator/CLAUDE.md`

### 🎯 하드코딩 정책 (Hardcoding Policy) - 번역기 전용

> 위의 일반 하드코딩 규칙에 추가로, 번역기에는 더 엄격한 규칙이 적용됩니다.

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

### 🔒 사전/어휘 수정 정책 (Dictionary/Vocabulary Modification Policy)

> **이 정책은 번역기뿐만 아니라, 향후 추가될 모든 언어 관련 도구에 적용됩니다.**
> **This policy applies to the translator AND all future language-related tools.**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║            삭제 금지, 추가만 허용, 문맥 기반 선택                                  ║
║            (Never Delete, Only Add, Context-Based Selection)                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 절대 금지 (NEVER):                                                        ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ • 기존 단어 매핑 삭제                                                   │    ║
║  │   예: 대단하다: 'wonderful' → 대단하다: 'amazing' (삭제 후 교체 ❌)       │    ║
║  │                                                                      │    ║
║  │ • 기존 의미 덮어쓰기                                                    │    ║
║  │   예: wonderful을 삭제하고 amazing으로 변경 ❌                           │    ║
║  │                                                                      │    ║
║  │ • 테스트 통과를 위한 의미 변경                                           │    ║
║  │   예: 테스트가 'amazing' 기대 → 기존 'wonderful' 삭제 ❌                 │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  🟢 허용 (ALLOWED):                                                          ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ • 동의어/대체 표현 추가                                                 │    ║
║  │   예: 대단하다: ['wonderful', 'amazing', 'remarkable', 'incredible']   │    ║
║  │                                                                      │    ║
║  │ • 문맥별 변형 추가                                                      │    ║
║  │   예: { default: 'wonderful', casual: 'amazing', formal: 'remarkable' }│    ║
║  │                                                                      │    ║
║  │ • 새로운 단어 쌍 추가                                                   │    ║
║  │   예: 새로운 단어 '멋지다' 추가                                          │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  🔵 선택 로직 (Selection Logic):                                             ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ 문맥 분석기가 다음 요소를 고려하여 적절한 의미 선택:                        │    ║
║  │ • 문장 전체 분위기 (어조)                                               │    ║
║  │ • 주변 단어 (연어 관계)                                                 │    ║
║  │ • 화자 유형 (격식/비격식)                                               │    ║
║  │ • 감정 상태                                                            │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  📌 적용 범위 (Scope) - 현재 및 미래 모든 언어 도구:                            ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ 현재 (Current):                                                      │    ║
║  │ • apps/tools/app/tools/translator/ - 번역기 전체                       │    ║
║  │ • packages/core/translator/ - 번역 엔진 코어                           │    ║
║  │ • packages/core/hangul/ - 한글 처리                                    │    ║
║  │ • packages/core/nlu/ - 자연어 이해                                     │    ║
║  │                                                                      │    ║
║  │ 미래 (Future - 추가 시 자동 적용):                                      │    ║
║  │ • 모든 한국어-영어 관련 도구                                            │    ║
║  │ • 모든 언어 처리 관련 패키지                                            │    ║
║  │ • 모든 사전/어휘 데이터 파일                                            │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  ⚠️ 핵심 원칙: 도구 성능이 우선, 테스트 통과가 우선 아님                         ║
║     (Tool performance first, NOT test passing first)                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

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
입력 문장 → 외부 문장 사전 조회 (정확 일치 시 바로 반환)
         → 문맥 분석 (analyzeContext) → 화자/감정/상황 파악
         → 기본 번역 (words.ts 기반, 외부 단어 사전 포함)
         → 문맥 적용 (CONTEXT_VOCABULARY로 어휘 치환)
         → 최종 출력
```

### 📡 외부 사전 동기화 (External Dictionary Sync)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              빌드 시 자동 어휘 동기화 시스템                                      ║
║              (Build-time Auto Vocabulary Sync)                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📦 소스: github.com/soundbluemusic/public-monorepo/data/context             ║
║  📁 출력: translator/dictionary/external/ (자동 생성)                         ║
║  🔄 시점: pnpm build:all (prebuild hook) 또는 pnpm sync:context-dict         ║
║                                                                              ║
║  우선순위 (Priority):                                                         ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ 1. 문장 사전 (정확 일치 시)                                            │    ║
║  │ 2. 알고리즘 번역 (v2.1 파이프라인)                                      │    ║
║  │ 3. 단어 조합 (외부 사전 = 최저 우선순위)                                 │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  ✅ 기존 사전과 충돌 없음 (외부 = 최저 우선순위)                                ║
║  ✅ context 앱 업데이트 → 빌드 시 자동 반영                                    ║
║  ❌ external/ 폴더 직접 수정 금지 (자동 생성 파일)                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
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

### 📊 벤치마크 단일 소스 정책 (Benchmark Single Source Policy)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ⚠️ 벤치마크 단일 소스 - 절대 규칙 ⚠️                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   📁 단일 소스: benchmarkTestGroups (14개 그룹, 1,105개 테스트)                 ║
║   📍 위치: apps/tools/app/tools/translator/benchmark-data.ts                 ║
║                                                                              ║
║   🔗 3가지가 완벽히 동기화되어야 함:                                             ║
║   ┌──────────────────────────────────────────────────────────────────────┐   ║
║   │ 1. benchmark-data.ts     → benchmarkTestGroups 정의                  │   ║
║   │ 2. benchmark-data.test.ts → benchmarkTestGroups 사용 (vitest)        │   ║
║   │ 3. benchmark.tsx          → benchmarkTestGroups 사용 (UI)            │   ║
║   └──────────────────────────────────────────────────────────────────────┘   ║
║                                                                              ║
║   ✅ 통과 기준 완전 동일:                                                      ║
║   ┌──────────────────────────────────────────────────────────────────────┐   ║
║   │ • ko-en: normalizeEnglish(actual) === normalizeEnglish(expected)     │   ║
║   │ • en-ko: normalizeKorean(actual) === normalizeKorean(expected)       │   ║
║   │                                                                      │   ║
║   │ normalizeEnglish: 소문자 + 관사(a/an/the) 제거 + 공백 정규화           │   ║
║   │ normalizeKorean: 조사(은/는/이/가→가, 을/를→를) 통일 + 공백 정규화      │   ║
║   └──────────────────────────────────────────────────────────────────────┘   ║
║                                                                              ║
║   ❌ 절대 금지:                                                               ║
║   • vitest와 UI의 통과 기준이 다른 것                                          ║
║   • benchmarkTestGroups 외의 별도 테스트 데이터 사용                           ║
║   • 부분 일치(includes) 등 관대한 매칭 로직                                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**14개 테스트 그룹 (benchmarkTestGroups):**

| # | 그룹명 | 설명 |
|---|--------|------|
| 1 | Grammar Rules | 문법 규칙 (424개) |
| 2 | Level Tests | 레벨별 기본 번역 |
| 3 | Category Tests | 카테고리별 테스트 |
| 4 | Context Tests | 문맥 기반 번역 |
| 5 | Typo Tests | 오타 처리 |
| 6 | Unique Tests | 고유 표현 |
| 7 | Polysemy Tests | 다의어 처리 |
| 8 | Word Order Tests | SVO↔SOV 어순 변환 |
| 9 | Spacing Tests | 띄어쓰기 오류 처리 |
| 10 | Final Tests | 종합 테스트 |
| 11 | Professional Tests | 전문 번역 품질 |
| 12 | Localization Tests | 현지화 |
| 13 | Anti-Hardcoding Tests | 하드코딩 방지 (212개) |
| 14 | Figurative Tests | 비유 표현 |

> **vitest 결과 = UI 벤치마크 결과** (완벽히 일치해야 함)

---

## 📦 Data/Logic Separation Architecture (데이터/로직 분리 아키텍처)

> **핵심 원칙: 로직은 soundblue-monorepo에, 데이터는 Context 앱(public-monorepo)에**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║           데이터/로직 분리 아키텍처 (Data/Logic Separation)                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🏠 soundblue-monorepo (여기)              🌐 public-monorepo (Context 앱)    ║
║  ┌────────────────────────────────┐       ┌────────────────────────────────┐ ║
║  │ ✅ 아키텍처 (Architecture)      │       │ ✅ 어휘 (Vocabulary)            │ ║
║  │ ✅ 알고리즘 (Algorithms)        │       │    • 단어 쌍 (ko↔en)            │ ║
║  │ ✅ 패턴 (Grammar Patterns)      │       │    • 어간 (Stems)               │ ║
║  │ ✅ 로직 (Translation Pipeline)  │       │    • 관용어 (Idioms)            │ ║
║  │ ✅ 규칙 (Morpheme Rules)        │       │    • 숙어 (Proverbs)            │ ║
║  │ ✅ 설계 (Code Structure)        │       │                                │ ║
║  │                                │       │ ✅ 조사/어미 (Particles/Endings) │ ║
║  │ 예시:                          │       │    • 조사 목록 (은/는/이/가...)   │ ║
║  │ • SVO↔SOV 변환 알고리즘         │       │    • 어미 목록 (-았/었/겠...)    │ ║
║  │ • 형태소 분석기                 │       │    • 연결어미 (-고, -면서...)    │ ║
║  │ • 문맥 분석기                   │       │                                │ ║
║  │ • 시제/높임법 처리              │       │ ✅ 도메인 어휘 (Domain Terms)    │ ║
║  │                                │       │    • 색상 (Colors)              │ ║
║  │                                │       │    • 국가명 (Countries)         │ ║
║  │                                │       │    • 전문 용어                  │ ║
║  └────────────────────────────────┘       └────────────────────────────────┘ ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔄 데이터 흐름 (Data Flow):                                                  ║
║                                                                              ║
║  public-monorepo/data/context/                                               ║
║          │                                                                   ║
║          ▼ pnpm sync:context-dict (또는 pnpm build:all)                      ║
║          │                                                                   ║
║  soundblue-monorepo/                                                         ║
║  ├── data/dictionaries/*.json        ← 로컬 JSON (Single Source of Truth)   ║
║  │         │                                                                 ║
║  │         ▼ pnpm prebuild                                                   ║
║  │         │                                                                 ║
║  ├── dictionary/generated/*.ts       ← 자동 생성 (TypeScript)                ║
║  │         │                                                                 ║
║  │         ▼ import                                                          ║
║  │         │                                                                 ║
║  └── dictionary/*.ts                 ← 로직만 유지 (Logic Only)              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 분리 기준표 (Separation Criteria)

| 여기 (soundblue-monorepo) | Context 앱 (public-monorepo) |
|---------------------------|------------------------------|
| 아키텍처 (Architecture) | 어휘 - 단어 쌍 (Word Pairs) |
| 알고리즘 (Algorithms) | 어휘 - 어간 (Stems) |
| 패턴 (Grammar Patterns) | 어휘 - 관용어 (Idioms) |
| 로직 (Translation Pipeline) | 조사 목록 (Particles) |
| 규칙 (Morpheme Analysis Rules) | 어미 목록 (Endings) |
| 설계 (Code Structure) | 도메인 어휘 (Domain Terms) |
| 문맥 분석기 (Context Analyzer) | 색상, 국가명 (Colors, Countries) |
| 형태소 분석기 (Morpheme Analyzer) | 의성어/의태어 (Onomatopoeia) |

### 파일 구조 (File Structure)

```
soundblue-monorepo/
├── data/dictionaries/           ← JSON 데이터 (Single Source of Truth)
│   ├── words/
│   │   ├── ko-to-en.json       # 한→영 단어
│   │   ├── en-to-ko.json       # 영→한 단어
│   │   ├── stems.json          # 어간 (동사/형용사/명사)
│   │   ├── colors.json         # 색상
│   │   └── countries.json      # 국가명
│   ├── idioms/
│   │   └── idioms.json         # 관용어/숙어
│   ├── domains/
│   │   └── all-domains.json    # 도메인별 어휘
│   └── schemas/                # JSON 스키마 (검증용)
│
├── apps/tools/app/tools/translator/
│   └── dictionary/
│       ├── generated/           ← 자동 생성 (prebuild)
│       │   ├── ko-to-en.ts     # JSON에서 생성
│       │   ├── en-to-ko.ts
│       │   ├── stems.ts
│       │   ├── idioms.ts
│       │   └── index.ts
│       │
│       ├── words.ts             ← 로직만 (데이터는 generated에서 import)
│       ├── stems.ts             ← 로직만
│       ├── idioms.ts            ← 로직만
│       └── external/            ← Context 앱에서 동기화
│
└── scripts/
    ├── prebuild.ts              # JSON → TypeScript 생성
    └── sync-context-dictionary.ts  # Context 앱에서 동기화
```

### 명령어 (Commands)

| 명령어 | 설명 |
|--------|------|
| `pnpm prebuild` | JSON → TypeScript 생성 (generated/) |
| `pnpm sync:context-dict` | Context 앱에서 어휘 동기화 (external/) |
| `pnpm build:all` | prebuild + sync + 빌드 (전체) |

### 규칙 (Rules)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ⚠️ 데이터/로직 분리 규칙 ⚠️                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 금지 (NEVER):                                                            ║
║  • dictionary/*.ts 파일에 순수 어휘 데이터 직접 작성                             ║
║  • generated/ 폴더 파일 직접 수정                                              ║
║  • external/ 폴더 파일 직접 수정                                               ║
║  • 로직 파일에서 하드코딩된 단어 목록 유지                                        ║
║                                                                              ║
║  ✅ 필수 (REQUIRED):                                                         ║
║  • 새 어휘 추가 → data/dictionaries/*.json에 추가                              ║
║  • 로직 변경 → dictionary/*.ts 파일 수정                                       ║
║  • 빌드 전 → pnpm prebuild 실행하여 generated/ 갱신                            ║
║  • Context 앱 변경 시 → pnpm sync:context-dict 실행                           ║
║                                                                              ║
║  📍 Single Source of Truth:                                                  ║
║  • 어휘 데이터: data/dictionaries/*.json                                      ║
║  • 로직/알고리즘: dictionary/*.ts                                             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
