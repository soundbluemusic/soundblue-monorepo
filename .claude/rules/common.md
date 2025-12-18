# 공통 개발 규칙 (Common Development Rules)

## 패키지 매니저 (Package Manager)
- pnpm만 사용 (pnpm only)
- npm, yarn 사용 금지 (npm, yarn prohibited)
- npx 대신 pnpm dlx 사용 (Use pnpm dlx instead of npx)

## 언어 (Language)
- TypeScript 필수 (TypeScript required)
- .js, .jsx, .mjs 파일 생성 금지 (No .js, .jsx, .mjs files)
- 타입 명시적으로 정의 (Define types explicitly)
- any 타입 최소화 (Minimize any type usage)
- import type 사용 (Use import type for types)

## 프레임워크 (Framework)
- SolidJS 1.9 + SolidStart 1.2 + Vinxi
- className 대신 class 사용 (Use class instead of className)
- createSignal, createEffect, createMemo 사용 (Use SolidJS primitives)
- Show, For 컴포넌트 사용 (Use Show, For components)

## 스타일링 (Styling)
- Tailwind CSS 4 사용 (Use Tailwind CSS)
- 인라인 style은 동적 값에만 (Inline style only for dynamic values)
- cn() 유틸리티로 조건부 클래스 (Use cn() for conditional classes)

## 코드 품질 (Code Quality)
- 절대 경로 import 사용 (@/ 또는 ~/) (Use absolute path imports)
- 미사용 import/변수 제거 (Remove unused imports/variables)
- console.log 디버깅 후 제거 (Remove console.log after debugging)
- 에러 처리 필수 try-catch (Error handling required)
- 접근성 고려 alt, aria-label (Consider accessibility)
- 커밋 전 pnpm check:fix 실행 (Run pnpm check:fix before commit)

## 린터/포맷터 (Linter/Formatter)
- Biome 사용 (Use Biome)
- 2 spaces 들여쓰기 (2 spaces indentation)
- Single quotes 사용 (Use single quotes)
- Trailing commas 사용 (Use trailing commas)
- Semicolons 사용 (Use semicolons)

## 문서 동기화 규칙 (Documentation Sync Rules)
- 코드 수정 시 관련 README.md 섹션도 함께 업데이트
  (Update related README.md sections when modifying code)
- 새 기능/컴포넌트 추가 시 README.md에 반영
  (Reflect new features/components in README.md)
- 기능 삭제 시 README.md에서도 제거
  (Remove from README.md when deleting features)
- package.json 수정 후 pnpm install 실행하고 pnpm-lock.yaml도 함께 커밋
  (Run pnpm install after modifying package.json and commit pnpm-lock.yaml together)

## 타입 검증 프로세스 (Type Validation Process)

타입 에러나 코드 품질 문제를 찾을 때 아래 프로세스를 따르세요.
(Follow this process when finding type errors or code quality issues.)

| 단계 | 실행 내용 | 병렬 가능 |
|------|----------|----------|
| 1 | `tsc --noEmit` (모든 앱) | Yes |
| 2 | `tsc --noEmit --strict` (모든 앱) | Yes |
| 3 | `grep ": any"` | Yes |
| 4 | `grep "as any"` | Yes |
| 5 | `grep "as never"` | Yes |
| 6 | `grep "as unknown"` | Yes |
| 7 | `grep "@ts-ignore"` | Yes |
| 8 | `grep "@ts-expect-error"` | Yes |
| 9 | 모든 결과 수집 후 한번에 수정 (Collect all results and fix at once) | - |
| 10 | `tsc --noEmit --strict` 검증 (Verify) | - |
| 11 | 커밋 (Commit) | - |

**중요 (Important):**
- 1~8단계는 병렬 실행 가능 (Steps 1-8 can run in parallel)
- 9~11단계는 순차 실행 (Steps 9-11 must run sequentially)
- 수정 전 모든 문제를 먼저 파악 (Identify all issues before fixing)

## 테스트 (Testing)
- Vitest - 유닛 테스트 (Unit tests)
- Playwright - E2E 테스트 (E2E tests)
- 테스트 파일: *.test.ts, *.spec.ts (Test files)

## 배포 (Deployment)
- Cloudflare Pages - 정적 호스팅 (Static hosting)
- 100% Static Site - SSG (Static Site Generation)

## SolidJS vs React 주의사항 (SolidJS vs React)
| React | SolidJS |
|-------|---------|
| useState | createSignal |
| useEffect | createEffect |
| useMemo | createMemo |
| className | class |
| {condition && <C/>} | <Show when={condition}><C/></Show> |
| {arr.map(x => ...)} | <For each={arr}>{(x) => ...}</For> |

## 코드 분석 규칙 (Code Analysis Rules)

코드 분석, 리뷰, 개선 제안 시 `.claude/rules/analysis.md`를 따르세요.
(Follow `.claude/rules/analysis.md` when analyzing code, reviewing, or suggesting improvements.)

**핵심 원칙 (Core Principles):**
- 근거 없는 심각도(HIGH/MEDIUM/LOW) 부여 금지
- 검증 없는 개선 제안 금지 (사용처, 테스트, 의도 확인 필수)
- 에이전트 결과 무검증 전달 금지
- 불확실하면 단정 짓지 말고 질문
