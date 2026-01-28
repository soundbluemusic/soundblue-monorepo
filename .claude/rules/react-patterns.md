# React 패턴 규칙 (React Pattern Rules)

> **useEffect 무한 루프 방지 필수**
> **SSR Hydration 불일치 방지 필수**

---

## SSR Hydration 불일치 방지 (CRITICAL)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║            ⚠️ SSR Hydration 불일치 방지 - 절대 규칙 ⚠️                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  React error #419: "Hydration failed because the server rendered HTML       ║
║  didn't match the client."                                                   ║
║                                                                              ║
║  ❌ 절대 금지 (hydration 불일치 발생):                                         ║
║  • new Date() fallback 사용 (서버/클라이언트 시간 다름)                         ║
║  • window.innerWidth 기반 조건부 렌더링 (서버에 window 없음)                    ║
║  • Math.random() 또는 동적 계산 결과를 URL/className에 사용                     ║
║  • 화면 크기 기반 prop으로 다른 URL 생성                                        ║
║                                                                              ║
║  ✅ 필수 패턴:                                                                ║
║  • 시간 관련: useState(null) → useEffect에서 setNow(new Date())               ║
║  • 조건부 렌더링: {isClient && <동적컴포넌트 />}                               ║
║  • 반응형: CSS 미디어쿼리 사용, JS 기반 크기 감지 지양                           ║
║  • URL/src: 고정값 사용, CSS로 크기 조절                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### ❌ 금지 패턴 (Hydration 불일치)

```typescript
// 패턴 1: new Date() fallback (서버/클라이언트 시간 다름)
const currentDate = useMemo(() => ({
  year: now?.getFullYear() ?? new Date().getFullYear(), // ❌ 서버와 클라이언트 시간 다름!
}), [now]);

// 패턴 2: 동적 크기로 URL 생성 (isCompact는 화면 크기에 따라 다름)
const getFlagUrl = (code: string, size: number) =>
  `https://cdn.com/${size}x${Math.round(size * 0.75)}/${code}.png`;
<img src={getFlagUrl(code, isCompact ? 20 : 24)} /> // ❌ 서버와 클라이언트 URL 다름!

// 패턴 3: window 기반 초기값
const [width, setWidth] = useState(window.innerWidth); // ❌ 서버에 window 없음!
```

### ✅ 올바른 패턴

```typescript
// 패턴 1: 시간은 클라이언트에서만 초기화
const [now, setNow] = useState<Date | null>(null);
useEffect(() => {
  setNow(new Date());
}, []);

// 시간 의존 컴포넌트는 조건부 렌더링
{now && <Calendar currentDate={now} />}

// 패턴 2: URL은 고정, CSS로 크기 조절
const getFlagUrl = (code: string) =>
  `https://cdn.com/24x18/${code}.png`; // ✅ 고정 URL
<img
  src={getFlagUrl(code)}
  className={isCompact ? 'w-5 h-4' : 'w-6 h-5'} // ✅ CSS로 크기 조절
/>

// 패턴 3: 화면 크기는 false로 시작
const [isMobile, setIsMobile] = useState(false); // ✅ 서버와 동일한 초기값
useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);
```

### 체크리스트

- [ ] `new Date()`가 fallback 값으로 사용되는가? → hydration 불일치 위험
- [ ] URL/src에 동적 계산 값이 포함되는가? → 고정 URL + CSS 크기 조절로 변경
- [ ] `window`/`document` 기반 초기값이 있는가? → `null`/`false`로 시작 후 useEffect에서 설정
- [ ] 화면 크기 기반 조건부 렌더링이 있는가? → CSS 미디어쿼리 또는 조건부 렌더링 사용

### 실제 사례

#### WorldClockWidget 버그 (2026-01-28 수정)

**문제:**
```typescript
// new Date() fallback - 서버 빌드 시간과 클라이언트 시간 다름
const currentDate = useMemo(() => ({
  year: now?.getFullYear() ?? new Date().getFullYear(), // ❌
}), [now]);

// 동적 URL - isCompact가 서버/클라이언트에서 다름
<img src={getFlagUrl(code, isCompact ? 20 : 24)} /> // ❌
```

**해결:**
```typescript
// 시간 의존 부분은 조건부 렌더링
const currentDate = useMemo(() => {
  if (!now) return { year: 0, month: 0, day: 0, weekday: 0 };
  return { year: now.getFullYear(), ... };
}, [now]);

{now && <Calendar />} // ✅ hydration 후에만 렌더링

// 고정 URL + CSS 크기 조절
const getFlagUrl = (code: string) => `https://flagcdn.com/24x18/${code}.png`;
<img src={getFlagUrl(code)} className={isCompact ? 'w-5' : 'w-6'} /> // ✅
```

### Hydration 관련 에러

| 에러 | 의미 |
|------|------|
| React error #419 | Hydration failed (서버/클라이언트 HTML 불일치) |
| React error #418 | Hydrated content doesn't match server-rendered |
| Text content mismatch | 텍스트 내용 불일치 (시간, 랜덤값 등) |

---

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

## 무한루프 위험 패턴 감지

### ❌ 무한루프 금지 패턴

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

### ✅ 무한루프 올바른 패턴

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

## 무한루프 체크리스트

코드 작성/리뷰 시 확인:

- [ ] useEffect가 2개 이상 있고 서로 상태를 변경하는가? → 무한 루프 위험
- [ ] 의존성 배열에 setState 결과가 포함되어 있는가? → 무한 루프 위험
- [ ] URL ↔ state 양방향 동기화가 있는가? → ref로 제어 필수
- [ ] `searchParams`가 의존성에 있고 `setSearchParams`도 호출하는가? → 무한 루프 위험

## 무한루프 실제 사례

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

## 무한루프 관련 에러

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
