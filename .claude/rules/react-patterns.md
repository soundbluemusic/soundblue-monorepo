# React 패턴 규칙 (React Pattern Rules)

> **useEffect 무한 루프 방지 필수**

## useEffect 양방향 동기화 금지 (CRITICAL)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║            ⚠️ useEffect 무한 루프 방지 - 절대 규칙 ⚠️                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 절대 금지 (무한 루프 발생):                                                ║
║  • useEffect A: state → URL 동기화                                           ║
║  • useEffect B: URL → state 동기화                                           ║
║  → A가 URL 변경 → B 실행 → state 변경 → A 실행 → 무한 반복                    ║
║                                                                              ║
║  ✅ 필수 패턴:                                                                ║
║  • 초기화 ref 사용: isInitializedRef.current 체크                             ║
║  • 이전 값 비교: prevValueRef로 실제 변경 여부 확인                            ║
║  • 의존성 최소화: 순환 참조 유발 의존성 제거                                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 위험 패턴 감지

### ❌ 금지 패턴

```typescript
// 패턴 1: 양방향 동기화 (무한 루프)
useEffect(() => {
  updateState(urlParams);
}, [urlParams]); // URL → state

useEffect(() => {
  setUrlParams(state);
}, [state]); // state → URL ← 무한 루프!

// 패턴 2: 의존성에 setState 결과가 다시 포함
useEffect(() => {
  const newValue = compute(someState);
  setSomeState(newValue); // someState가 의존성에 있으면 무한 루프
}, [someState]);
```

### ✅ 올바른 패턴

```typescript
// 패턴 1: 초기화 ref로 한 번만 실행
const isInitializedRef = useRef(false);

useEffect(() => {
  if (isInitializedRef.current) return;
  isInitializedRef.current = true;

  // 초기화 로직 (한 번만 실행)
  updateState(urlParams);
}, []); // 빈 의존성

// 패턴 2: 이전 값 비교로 불필요한 업데이트 방지
const prevValueRef = useRef(null);

useEffect(() => {
  if (prevValueRef.current === currentValue) return;
  prevValueRef.current = currentValue;

  // 실제 변경 시에만 실행
  syncToUrl(currentValue);
}, [currentValue]);

// 패턴 3: 단방향 흐름 유지
// URL → state (초기화 시 한 번만)
// state → URL (사용자 액션 시에만, useEffect 아닌 이벤트 핸들러에서)
```

## 체크리스트

코드 작성/리뷰 시 확인:

- [ ] useEffect가 2개 이상 있고 서로 상태를 변경하는가? → 무한 루프 위험
- [ ] 의존성 배열에 setState 결과가 포함되어 있는가? → 무한 루프 위험
- [ ] URL ↔ state 양방향 동기화가 있는가? → ref로 제어 필수
- [ ] `searchParams`가 의존성에 있고 `setSearchParams`도 호출하는가? → 무한 루프 위험

## 실제 사례

### TranslatorLayout 버그 (2026-01-27 수정)

**문제:**
```typescript
// useEffect #1: URL → settings
useEffect(() => {
  updateToolSettings('translator', settings);
}, [searchParams]); // searchParams 변경 시 실행

// useEffect #2: settings → URL
useEffect(() => {
  setSearchParams(urlUpdate);
}, [toolSettings.translator, searchParams]); // settings 변경 시 URL 업데이트
// → searchParams가 의존성에 있어서 무한 루프!
```

**해결:**
```typescript
const isUrlSyncInitializedRef = useRef(false);
const prevSettingsRef = useRef(null);

// useEffect #1: 마운트 시 한 번만
useEffect(() => {
  if (isUrlSyncInitializedRef.current) return;
  isUrlSyncInitializedRef.current = true;
  // ...
}, []); // 빈 의존성

// useEffect #2: 변경 감지 후에만
useEffect(() => {
  if (!hasActualChange(prevSettingsRef.current, settings)) return;
  prevSettingsRef.current = settings;
  // ...
}, [toolSettings.translator, setSearchParams]); // searchParams 제거
```

## 관련 에러

| 에러 | 의미 |
|------|------|
| React error #185 | Maximum update depth exceeded (무한 루프) |
| Too many re-renders | 렌더링 중 setState 호출 (무한 루프) |

---

## 새 버그 발견 시 패턴 추가 방법

**파일:** `scripts/react-patterns/patterns.ts`

```typescript
// 새 패턴 추가
{
  id: 'unique-pattern-id',
  name: 'Pattern Name',
  description: '무엇이 문제인지',
  regex: /감지할_정규식_패턴/,
  severity: 'error',  // 또는 'warning'
  solution: `
해결 방법 설명
1. 첫 번째 단계
2. 두 번째 단계
`,
  discoveredAt: '2026-01-27',
  relatedIssue: 'GitHub issue URL (선택)',
}
```

**실행:** `pnpm check:react-patterns`

**효과:**
- 해당 패턴의 버그가 **영구적으로** 방지됨
- CI에서 자동 검사
- 같은 실수 반복 불가
