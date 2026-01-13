# Code Quality Rules (코드 품질 규칙)

> 품질/성능 우선, 테스트 통과 우선 아님

## 핵심 원칙

**"테스트 통과"가 아니라 "제품 개선"이 목표**

| 🔴 금지 (Anti-Patterns) | 🟢 권장 (Best Practices) |
|------------------------|-------------------------|
| 하드코딩 | 일반화 |
| 과적합 | 확장 |
| 임시 해결 | 구조적 해결 |
| 삭제/교체 | 명시적 처리 |
| 에러 숨기기 | 근본 원인 수정 |

## 절대 금지 ⛔

### 1. 하드코딩
```
❌ 테스트 통과용 하드코딩
❌ 빌드 에러 회피용 임시 상수
❌ 특정 케이스만 통과하는 조건문

✅ 명확한 이름의 상수 (LIMITS.ID_LENGTH)
✅ 타입 안전 enum/literal
✅ 일반화된 패턴
```

### 2. 에러 숨기기
```
❌ 빈 catch 블록
❌ 설명 없이 @ts-ignore
❌ any 타입 남용
❌ console.error만 하고 무시
```

### 3. 테스트 비활성화
```
❌ pre-commit hooks 스킵
❌ --no-verify 사용
❌ eslint-disable 남용
❌ vitest.skip 남용
```

### 4. 불완전한 코드
```
❌ // ... existing code ...
❌ TODO 주석 (이슈 없이)
❌ 플레이스홀더 커밋
```

### 5. 다운그레이드 (Forward Only)
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
- 확인된 보안 취약점
- 공식 deprecation 필수 변경
- 라이선스 법적 문제

## 수정 전 필수 프로세스

1. 근본 원인 파악 (WHY, not WHAT)
2. 단순 수정이 왜 잘못인지 설명
3. 기존 기능 유지 확인
4. 하드코딩 여부 검토

## 자가 검증 질문

| 질문 | ✅ 진행 | ⚠️ 재검토 |
|------|--------|----------|
| 비슷한 다른 케이스에서도 작동? | Yes | No |
| 기존 기능 삭제 없이 확장? | Yes | No |
| 테스트 통과 아닌 제품 개선 목적? | Yes | No |
| 근본 원인 해결? | Yes | No |

## UI-vitest 동기화

- vitest에서만 통과하고 UI에서 실패 ❌
- UI에서만 통과하고 vitest에서 실패 ❌
- 양쪽 모두 통과 확인 후 "해결됨" 선언 ✅

## 불확실할 때 질문

- 코드 제거
- 핵심 로직 변경
- 브레이킹 체인지
- 하드코딩 추가

## 12가지 품질 지표

| 카테고리 | 지표 |
|---------|------|
| 안정성 | Test Coverage (≥80%), Visual Coverage, Code Health, Monorepo Integrity |
| 성능 | Lighthouse (≥90), SEO Health, Static Integrity |
| UX | PWA, Mobile (≥44px), Responsive, Accessibility |
| 보안 | CSP headers, dotenv-linter |
