# Project Overview

프로젝트 개요: @README.md | 아키텍처: @docs/ARCHITECTURE.md

## 토큰 절약

### 기본 규칙
- 20턴마다 `/compact` | 파일 직접 지정 `@src/file.ts` | 작업 후 새 세션

### 작업 유형별 스킬
| 작업 | 스킬 | 효과 |
|------|------|------|
| 코드 탐색/구조 파악 | `/explore` | 서브에이전트 처리, 토큰 ~70% 절약 |
| 단순 검색/위치 찾기 | `/search` | Haiku 모델, 비용 ~90% 절약 |
| 심층 분석/리뷰 | `/analyze` | 별도 컨텍스트, 토큰 ~60% 절약 |
| SSG 호환성 검증 | `/ssg-check` | 브라우저 API, 이중 구현 확인 |
| 레이어 의존성 검증 | `/layer-check` | import 규칙 준수 확인 |

### 모델 선택 기준
| 모델 | 용도 |
|------|------|
| Haiku | 단순 검색, 파일 찾기, 빠른 응답 필요 시 |
| Sonnet | 일반 개발 작업, 코드 수정, 테스트 |
| Opus | 복잡한 아키텍처 설계, 심층 분석 |

## 상세 규칙 (필요시 참조)
- 번역기: `.claude/rules/translator.md`
- 품질: `.claude/rules/quality.md`

---

## Package Architecture

```
apps/           ← 모든 하위 레이어 import 가능
ui/             ← platform/, core/ import 가능
platform/       ← core/만 import 가능
core/           ← 외부 import 금지
```

| Layer | Packages | Rules |
|-------|----------|-------|
| `core/` | hangul, translator, nlu, audio-engine, locale | 브라우저 API 금지 |
| `platform/` | web-audio, storage, worker, i18n, seo, pwa | 이중 구현 (.browser.ts + .noop.ts) |
| `ui/` | components (base, composite, icons) | React 컴포넌트 |

### Dual Implementation (platform/)
```typescript
// package.json exports
{ "browser": "./src/index.browser.ts", "default": "./src/index.noop.ts" }
```

---

## 절대 규칙 (CRITICAL)

### 1. 100% SSG Only
```
❌ SSR/SPA 모드, 서버 로직, API 라우트
✅ ssr: false, prerender() 함수에 모든 라우트 명시
```

### 2. 기타 절대 규칙
- 오픈소스 Only
- 웹 표준 API Only
- 로컬 스토리지 Only (localStorage, IndexedDB)

### 3. SSG Hydration Workaround
위치: `apps/*/app/entry.client.tsx` - 삭제 금지!
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

## 코드 품질 핵심

### 금지 (Anti-Patterns)
| 유형 | 설명 |
|------|------|
| 하드코딩 | 특정 케이스만 통과하는 조건문 |
| 에러 숨기기 | 빈 catch, @ts-ignore, any 남용 |
| 삭제/교체 | 기존 기능 무단 제거 |

### 필수 (Best Practices)
| 유형 | 설명 |
|------|------|
| 일반화 | 모든 유사 케이스에 적용 |
| 확장 | 기존 유지 + 새로운 것 추가 |
| 근본 해결 | WHY 파악 후 수정 |

### 수정 전 체크
1. 비슷한 다른 케이스에서도 작동?
2. 기존 기능 삭제 없이 확장?
3. vitest + UI 양쪽 통과?

---

## 응답 규칙
- 확인 전에 단정하지 않는다
- 추측은 추측이라고 표시한다
- 출처를 명시한다
- 플랜이나 표를 작성할 때는 반드시 한글로 작성한다

## 불확실할 때 질문
- 코드 제거
- 핵심 로직 변경
- 브레이킹 체인지
- 하드코딩 추가

---

## 참고 문서 (필요시)

| Tech | Docs |
|------|------|
| Tailwind v4 | [tailwindcss.com](https://tailwindcss.com/docs/installation/framework-guides/react-router) |
| React Router v7 | [reactrouter.com](https://reactrouter.com/start/framework/deploying) |
| TypeScript | [typescriptlang.org](https://www.typescriptlang.org/docs/) |

**참조 우선순위**: 공식 문서 → GitHub Issues → Stack Overflow → 블로그
