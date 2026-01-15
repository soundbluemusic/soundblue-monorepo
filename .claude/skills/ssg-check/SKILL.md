---
name: ssg-check
description: SSG 호환성 검증 - 브라우저 API 사용 및 이중 구현 확인, SPA 감지 시 자동 수정
---

# /ssg-check 스킬

프로젝트의 SSG(Static Site Generation) 호환성을 검증하고, **SPA 모드 발견 시 자동으로 SSG로 수정**합니다.

## 사용법

```
/ssg-check [경로 또는 패키지명]
/ssg-check --fix                    # SPA 발견 시 자동 수정
```

## 예시

```
/ssg-check                          # 전체 프로젝트 검사
/ssg-check packages/core/           # core 레이어만 검사
/ssg-check packages/platform/storage # 특정 패키지 검사
/ssg-check --fix                    # SPA 발견 시 자동 수정 실행
```

## 검사 항목

### 1. core/ 레이어 (브라우저 API 금지)

```
❌ window, document, navigator, localStorage, sessionStorage
❌ Web Audio API, IndexedDB, fetch (브라우저 전용)
✅ 순수 TypeScript 로직만 허용
```

### 2. platform/ 레이어 (이중 구현 필수)

```
✅ *.browser.ts + *.noop.ts 쌍 존재 확인
✅ package.json exports 설정 확인
   - "browser": "./src/index.browser.ts"
   - "default": "./src/index.noop.ts"
```

### 3. apps/ 레이어 (SSG 설정 확인) - 🚨 SPA 감지 + 자동 수정

```
✅ react-router.config.ts: ssr: false
✅ prerender() 함수 존재 및 모든 라우트 포함
❌ API 라우트, 서버 컴포넌트 사용
```

## 🚨 SPA 감지 및 자동 수정 (CRITICAL)

### SPA 감지 조건

다음 중 하나라도 해당되면 SPA로 판정:

1. `react-router.config.ts`에 `prerender()` 함수 없음
2. `ssr: true` 설정됨
3. `prerender()` 함수가 빈 배열 반환

### 자동 수정 절차 (--fix 옵션 또는 감지 시)

**SPA가 감지되면 에이전트를 사용하여 자동으로 SSG 설정으로 수정합니다:**

1. **routes.ts 분석**: 앱의 모든 라우트 수집
2. **prerender() 함수 생성**: 수집된 라우트를 반환하는 함수 작성
3. **react-router.config.ts 수정**:
   - `ssr: false` 설정
   - `prerender()` 함수 추가
4. **검증**: 수정 후 다시 검사하여 SSG 준수 확인

### 자동 수정 코드 템플릿

```typescript
// react-router.config.ts
import type { Config } from '@react-router/dev/config';

// 로케일 목록 (있는 경우)
const LOCALES = ['en', 'ko'];

// 기본 라우트 목록
const BASE_PATHS = [
  '/',
  '/about',
  // ... routes.ts에서 추출한 모든 경로
];

function generateLocalizedPaths(): string[] {
  const paths: string[] = [];
  for (const basePath of BASE_PATHS) {
    paths.push(basePath); // 기본 경로 (en)
    for (const locale of LOCALES.filter((l) => l !== 'en')) {
      paths.push(`/${locale}${basePath === '/' ? '' : basePath}`);
    }
  }
  return paths;
}

export default {
  ssr: false, // 🚨 SSG 필수 - SEO를 위해 절대 true로 변경 금지
  async prerender() {
    return generateLocalizedPaths();
  },
} satisfies Config;
```

## 실행 규칙

1. Task tool 호출
2. `subagent_type: "Explore"` 지정 (검사용)
3. SPA 감지 시 `subagent_type: "general-purpose"` 지정 (수정용)
4. 검사 대상 파일들을 탐색
5. 위반 사항 목록 반환 또는 자동 수정 실행

## 결과 형식

```markdown
## SSG 호환성 검사 결과

### 🚨 SPA 감지됨 (자동 수정 완료)
| 앱 | 이전 상태 | 수정 내용 |
|-----|----------|----------|
| apps/tools | prerender 없음 | prerender() 함수 추가, 25개 라우트 등록 |

### 위반 사항
| 파일 | 라인 | 위반 내용 |
|------|------|----------|
| ... | ... | ... |

### 권장 수정
1. ...
2. ...

### 통과 항목
- [x] core/ 브라우저 API 미사용
- [x] platform/ 이중 구현 완료
- [x] apps/ SSG 설정 올바름
```

## SPA 금지 이유 (SEO 치명적 영향)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚨 SPA 금지 - SEO 치명적 영향 🚨                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  • 초기 HTML이 비어있어 크롤러가 콘텐츠를 인식 못함                               ║
║  • Google도 JS 렌더링 큐를 별도로 거쳐 색인이 지연됨                             ║
║  • Bing, Naver 등은 JS 렌더링 지원이 제한적/불가                                ║
║  • 메타태그가 크롤링 시점에 없어 SNS 공유 미리보기 실패                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 프로젝트 규칙 참조

- 100% SSG Only (CLAUDE.md 참조)
- Dual Implementation Pattern (ARCHITECTURE.md 참조)
- SPA 금지 정책 (docs/ARCHITECTURE.md 참조)
