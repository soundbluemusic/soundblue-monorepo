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
| **SEO 렌더링 검증** | `/rendering-check` | SPA 감지 시 경고, SSG/SSR 확인 |
| 레이어 의존성 검증 | `/layer-check` | import 규칙 준수 확인 |
| **기술 스택 최신 정보** | `/latest-check` | WebSearch로 outdated 정보 방지 |
| **엣지 케이스 테스트** | `/edge-test` | 파일 분석 후 테스트 코드 생성 |

### 모델 선택 기준
| 모델 | 용도 |
|------|------|
| Haiku | 단순 검색, 파일 찾기, 빠른 응답 필요 시 |
| Sonnet | 일반 개발 작업, 코드 수정, 테스트 |
| Opus | 복잡한 아키텍처 설계, 심층 분석 |

## 상세 규칙 (필요시 참조)

- **SEO 렌더링**: `.claude/rules/seo-rendering.md` ⚠️ SPA 금지
- 번역기: `.claude/rules/translator.md`
- 품질: `.claude/rules/quality.md`
- 도구 개발: `.claude/rules/tools.md`

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

### 1. SPA 금지 - SSG/SSR 사용

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚨 SPA 금지 - SEO 치명적 영향 🚨                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  SPA(Single Page Application) 모드는 SEO에 치명적:                            ║
║  • 초기 HTML이 비어있어 크롤러가 콘텐츠를 인식 못함                               ║
║  • Google도 JS 렌더링 큐를 별도로 거쳐 색인이 지연됨                             ║
║  • Bing, Naver 등은 JS 렌더링 지원이 제한적/불가                                ║
║                                                                              ║
║  ✅ 허용:                                                                     ║
║  • SSG (정적 생성) - 빌드 시 HTML 생성                                         ║
║  • SSR (서버 렌더링) - 요청 시 HTML 생성                                       ║
║                                                                              ║
║  ❌ 금지:                                                                     ║
║  • SPA (클라이언트 렌더링) - 빈 HTML + JS로 렌더링                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 2. 기타 절대 규칙
- 오픈소스 Only
- 웹 표준 API Only
- 로컬 스토리지 Only (localStorage, IndexedDB)

### 3. Tools 앱 - ToolGuide 필수 (CRITICAL)
```
❌ 사용 안내 없는 도구 배포
✅ 모든 도구는 반드시 ToolGuide 컴포넌트 포함
```
- 위치: `apps/tools/src/lib/toolGuides.ts`
- 구조: 이 도구는 / 사용 방법 / 버튼 설명 (ko/en)
- 상세: `.claude/rules/tools.md` 참조

### 4. 다운그레이드 금지 (Forward Only)
```
❌ 패키지 버전 다운그레이드
❌ 기능 제거로 문제 회피
❌ 의존성 롤백
❌ "일단 이전 버전으로" 접근

✅ 근본 원인 분석 후 수정
✅ 새로운 해결책 구현
✅ 호환성 레이어 추가
✅ 마이그레이션 코드 작성
```
**예외** (수학적 증명처럼 확정적인 경우만):
- 보안 취약점이 확인된 특정 버전
- 공식 deprecation으로 인한 필수 변경
- 라이선스 문제로 인한 법적 요구

### 5. SEO 인증 파일/메타태그 삭제 금지 (Double Check)
```
❌ 중복이라는 이유로 인증 파일 삭제
❌ 중복이라는 이유로 메타태그 삭제
❌ "하나만 있으면 된다"는 판단으로 제거

✅ 파일 + 메타태그 양쪽 유지 (더블 체크 목적)
✅ 새로운 인증 방식 추가 시 기존 방식 유지
```
**적용 대상**:
- Google Search Console 인증 (`google*.html`, 메타태그)
- Bing Webmaster 인증 (`BingSiteAuth.xml`, 메타태그)
- 기타 검색엔진/서비스 인증 파일

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

### 한글 답변 필수 (CRITICAL)
| 규칙 | 설명 |
|------|------|
| **모든 응답은 한글로** | 설명, 대답, 계획표(Plan), 요약 등 모든 문서는 반드시 한글로 작성 |
| **코드 주석은 예외** | 코드 내 주석, 변수명, 커밋 메시지는 영어 허용 |

### 기타 규칙
- 확인 전에 단정하지 않는다
- 추측은 추측이라고 표시한다
- 출처를 명시한다
- **환경 맥락 파악 필수** - 기능/도구 추천 전 현재 개발 환경(로컬/클라우드, CI/CD, 호스팅 등) 확인 후 해당 환경에 맞는 답변 제공

## 불확실할 때 질문
- 코드 제거
- 핵심 로직 변경
- 브레이킹 체인지
- 하드코딩 추가

---

## 🔍 최신 정보 확인 필수 (WebSearch + 날짜 검증)

> ⚠️ **내 지식 컷오프(2025년 5월) 이후 변경 가능성이 높은 주제**.
> 아래 주제 답변 전 **반드시 WebSearch 실행** + **Today's date 기준 검증**.

| 주제 | 검색 키워드 | 확인 포인트 |
|------|------------|-------------|
| Cloudflare Pages/Workers | "Cloudflare Pages Workers {현재연도}" | 기능 통합, Git 연동, Preview URL |
| Cloudflare D1 | "Cloudflare D1 pricing limits {현재연도}" | GA 전환, 가격, 제한 변경 |
| TanStack Start | "TanStack Start changelog {현재연도}" | API 변경, 새 기능, SSR |
| Tailwind CSS v4 | "Tailwind CSS v4 breaking changes {현재연도}" | 문법 변경, 마이그레이션 |
| TypeScript | "TypeScript 5 new features {현재연도}" | 새 버전 기능 |

**규칙**:
1. 위 주제 관련 질문 시 → **WebSearch로 현재 연도 포함 검색**
2. **Today's date** (env 컨텍스트) 기준으로 날짜 검증
3. 릴리즈 날짜 > Today's date → ❌ 오류, 재확인 필수
4. 릴리즈 연도 < 현재 연도 → ⚠️ 최신 버전 누락 가능
5. 출처 URL 명시

**스킬**: `/latest-check` - 프로젝트 기술 스택 최신 정보 일괄 검색

---

## 참고 문서 (필요시)

| Tech | Docs |
|------|------|
| Tailwind v4 | [tailwindcss.com](https://tailwindcss.com/docs/installation/vite) |
| TanStack Start | [tanstack.com](https://tanstack.com/start/latest/docs/framework/react/overview) |
| TypeScript | [typescriptlang.org](https://www.typescriptlang.org/docs/) |

**참조 우선순위**: 공식 문서 → GitHub Issues → Stack Overflow → 블로그
