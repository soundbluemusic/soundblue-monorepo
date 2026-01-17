---
description: 프로젝트 기술 스택 최신 정보 검색 - WebSearch로 outdated 정보 방지
user-invocable: true
---

# /latest-check 스킬

프로젝트에서 사용하는 핵심 기술 스택의 최신 변경사항을 검색합니다.

## 1단계: GitHub API로 정확한 버전/날짜 확인 (권장)

**WebFetch** 도구로 아래 GitHub API URL을 **병렬로** 호출합니다.

| 패키지 | GitHub API URL |
|--------|----------------|
| React Router | `https://api.github.com/repos/remix-run/react-router/releases/latest` |
| Tailwind CSS | `https://api.github.com/repos/tailwindlabs/tailwindcss/releases/latest` |
| TypeScript | `https://api.github.com/repos/microsoft/TypeScript/releases/latest` |

**추출 항목**: `tag_name` (버전), `published_at` (릴리즈 날짜)

## 2단계: WebSearch로 상세 정보 검색

**WebSearch** 도구로 아래 5개 주제를 **병렬로** 검색합니다.

| 주제 | 검색 키워드 | 확인 포인트 |
|------|------------|-------------|
| Cloudflare Pages/Workers | "Cloudflare Pages Workers {현재연도}" | 기능 통합, Git 연동, Preview URL |
| Cloudflare D1 | "Cloudflare D1 pricing limits {현재연도}" | GA 전환, 가격, 제한 변경 |
| React Router v7 | "React Router v7 changelog {현재연도}" | API 변경, 새 기능, SSG/SSR |
| Tailwind CSS v4 | "Tailwind CSS v4 breaking changes {현재연도}" | 문법 변경, 설정 방식, 새 유틸리티 |
| TypeScript | "TypeScript 5 new features {현재연도}" | 새 버전 기능, 호환성 |

## 실행 방법

1. **오늘 날짜 확인**: env 컨텍스트의 `Today's date: YYYY-MM-DD` 참조
2. **WebFetch**로 GitHub API 병렬 호출 (정확한 버전/날짜)
3. **WebSearch**로 상세 정보 병렬 검색 (검색어에 **현재 연도** 포함)
4. **날짜 교차 검증** 수행 (GitHub API 날짜 기준)

## 날짜 검증 규칙

| 조건 | 판단 | 조치 |
|------|------|------|
| GitHub API 날짜 ≤ Today's date | ✅ 정상 | 해당 버전 사용 |
| GitHub API 날짜 > Today's date | ❌ 오류 | API 응답 오류, 재확인 |
| WebSearch 날짜 ≠ GitHub API | ⚠️ 불일치 | GitHub API 우선 |

## 출력 형식

```markdown
## 최신 정보 요약 (검색일: YYYY-MM-DD)

### 버전 정보 (GitHub API)
| 패키지 | 버전 | 릴리즈 날짜 |
|--------|------|------------|
| React Router | vX.X.X | YYYY-MM-DD |
| Tailwind CSS | vX.X.X | YYYY-MM-DD |
| TypeScript | vX.X.X | YYYY-MM-DD |

### 1. Cloudflare Pages/Workers
- 주요 변경: ...
- 출처: [URL]
- 프로젝트 영향: 있음/없음

### 2. Cloudflare D1
...

### 3. React Router v7
...

### 4. Tailwind CSS v4
...

### 5. TypeScript
...
```

## 사용 시점

- 새 세션 시작 시 (선택적)
- 배포/호스팅 관련 질문 전
- 프레임워크 설정 변경 전
- 기술 비교 질문 답변 전

## 주의사항

- **현재 날짜**: env 컨텍스트의 `Today's date` 값 사용 (하드코딩 금지)
- **GitHub API 우선**: 버전/날짜는 GitHub API 결과가 가장 정확
- 검색어에 반드시 **현재 연도** 포함 (Today's date에서 추출)
- 공식 문서/블로그 > GitHub Issues > Stack Overflow > 일반 블로그 순 신뢰
