# GEMINI.md

# Project Overview

프로젝트 개요: @README.md | 아키텍처: @docs/ARCHITECTURE.md

## Context Management (컨텍스트 관리)
- Gemini는 긴 컨텍스트 윈도우를 가지지만, 논리적 오류 방지를 위해 작업 주제가 크게 바뀔 때는 **새 세션**을 시작하는 것을 권장합니다.
- 불필요하게 방대한 파일 전체를 읽기보다는 필요한 파일과 섹션을 명확히 타겟팅하여 참조합니다.

## 상세 규칙 (Referenced Rules)

- **SEO 렌더링 규칙**: `.claude/rules/seo-rendering.md` ⚠️ SPA 금지
- 번역기 규칙: `.claude/rules/translator.md` (공용 참조)
- 품질 규칙: `.claude/rules/quality.md` (공용 참조)

---

## Package Architecture (CRITICAL)

```
apps/           ← 모든 하위 레이어 import 가능
ui/             ← platform/, core/ import 가능
platform/       ← core/만 import 가능
core/           ← 외부 import 금지
```

| Layer | Packages | Rules |
|-------|----------|-------|
| `core/` | hangul, translator, nlu, audio-engine, locale | **SSG 빌드 안전성 필수**<br>Node/Browser 공통 표준만 사용 (`window` 직접 접근 금지) |
| `platform/` | web-audio, storage, worker, i18n, seo, pwa | **이중 구현 (Dual Implementation)**<br>하트/저장 등 브라우저 기능은 여기서 구현 (.browser.ts + .noop.ts) |
| `ui/` | components (base, composite, icons) | React 컴포넌트 |

### Dual Implementation (platform/)
```typescript
// package.json exports
{ "browser": "./src/index.browser.ts", "default": "./src/index.noop.ts" }
// 하트/저장 기능 예시:
// - index.browser.ts: localStorage 등 실제 브라우저 API 사용
// - index.noop.ts: 빈 함수나 기본값 반환 (SSG 빌드 에러 방지)
```

---

## 절대 규칙 (CRITICAL)

### 1. SPA 금지 - SSG/SSR 사용

```text
❌ SPA 모드 (클라이언트 렌더링) - SEO 치명적
✅ SSG (정적 생성) 또는 SSR (서버 렌더링)
```

상세: `.claude/rules/seo-rendering.md` 참조

### 2. 기타 절대 규칙
- **오픈소스 Only**: 라이선스 문제 없는 라이브러리만 사용.
- **웹 표준 API Only**: 특정 브라우저 종속 API 지양 (가능하면 표준 API 사용).
- **로컬 스토리지 Only**: 서버 DB 대신 localStorage, IndexedDB 사용 (사용자 데이터 저장용).

### 3. SSG Hydration Workaround
위치: `apps/*/app/entry.client.tsx` - **삭제 금지!**
```typescript
// React Router v7 SSG hydration 버그 workaround
setTimeout(() => {
  const divs = [...document.body.children].filter(el => el.tagName === 'DIV');
  if (divs.length >= 2 && !Object.keys(divs[0]).some(k => k.startsWith('__react'))) {
    divs[0].remove();
  }
}, 100);
```

---

## 코드 품질 핵심 (Code Quality)

### 금지 (Anti-Patterns)
| 유형 | 설명 |
|------|------|
| 하드코딩 | 특정 케이스만 통과하는 조건문 작성 금지 |
| 에러 숨기기 | 빈 catch, @ts-ignore, any 남용 금지 |
| 삭제/교체 | 기존 기능을 사용자 동의 없이 무단 제거 금지 |

### 필수 (Best Practices)
| 유형 | 설명 |
|------|------|
| 일반화 | 모든 유사 케이스에 적용 가능한 로직 작성 |
| 확장 | 기존 기능을 유지하면서 새로운 기능 추가 |
| 근본 해결 | 현상만 덮지 말고 원인(WHY)을 파악 후 수정 |

### 수정 전 체크리스트
1. 비슷한 다른 케이스에서도 작동하는가?
2. 기존 기능 삭제 없이 확장되었는가?
3. `vitest` 및 UI 테스트를 통과하는가?

---

## 응답 규칙 (Response Guidelines)
- **확인 전에 단정하지 않는다.** (항상 검증)
- **추측은 추측이라고 명시한다.**
- **출처를 명시한다.**
- **플랜이나 표를 작성할 때는 반드시 한글로 작성한다.**

## 불확실할 때 질문 (Ask when uncertain)
다음의 경우 반드시 사용자에게 먼저 질문하거나 확인을 받습니다:
- 코드 제거 (Code Deletion)
- 핵심 로직 변경 (Core Logic Changes)
- 브레이킹 체인지 (Breaking Changes)
- 하드코딩 추가 (Adding Hardcoded values)

---

## 참고 문서 (References)

| Tech | Docs |
|------|------|
| Tailwind v4 | [tailwindcss.com](https://tailwindcss.com/docs/installation/framework-guides/react-router) |
| React Router v7 | [reactrouter.com](https://reactrouter.com/start/framework/deploying) |
| TypeScript | [typescriptlang.org](https://www.typescriptlang.org/docs/) |

**참조 우선순위**: 공식 문서 → GitHub Issues → Stack Overflow → 블로그
