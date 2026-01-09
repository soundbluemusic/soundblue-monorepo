---
name: ssg-check
description: SSG 호환성 검증 - 브라우저 API 사용 및 이중 구현 확인
---

# /ssg-check 스킬

프로젝트의 SSG(Static Site Generation) 호환성을 검증합니다.

## 사용법

```
/ssg-check [경로 또는 패키지명]
```

## 예시

```
/ssg-check                          # 전체 프로젝트 검사
/ssg-check packages/core/           # core 레이어만 검사
/ssg-check packages/platform/storage # 특정 패키지 검사
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

### 3. apps/ 레이어 (SSG 설정 확인)
```
✅ react-router.config.ts: ssr: false
✅ prerender() 함수 존재 및 모든 라우트 포함
❌ API 라우트, 서버 컴포넌트 사용
```

## 실행 규칙

1. Task tool 호출
2. `subagent_type: "Explore"` 지정
3. 검사 대상 파일들을 탐색
4. 위반 사항 목록 반환

## 결과 형식

```markdown
## SSG 호환성 검사 결과

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

## 프로젝트 규칙 참조

- 100% SSG Only (CLAUDE.md 참조)
- Dual Implementation Pattern (ARCHITECTURE.md 참조)
