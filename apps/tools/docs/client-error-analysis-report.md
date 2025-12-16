# 클라이언트 예외 오류 분석 보고서

## 1. 오류 개요

### 1.1 오류 메시지
```
TypeError: e is not a function
    at theme-provider-DMmv4VWv.js:1:11164
    at j (theme-provider-DMmv4VWv.js:1:3291)
    at be (theme-provider-DMmv4VWv.js:1:11158)
    at default (client-23QvZCwj.js:2:8879)
    at theme-provider-DMmv4VWv.js:1:13625
    ...
```

### 1.2 오류 발생 조건
- 일부 페이지에서 발생
- 프로덕션 빌드(minified)에서 발생
- `theme-provider` 관련 코드에서 발생

---

## 2. 근본 원인 분석

### 2.1 스택 트레이스 분석

| 파일 | 위치 | 추정 원인 |
|------|------|-----------|
| `theme-provider-DMmv4VWv.js` | 11164 | ThemeProvider 또는 useTheme |
| `client-23QvZCwj.js` | 8879 | 클라이언트 하이드레이션 |

"e is not a function" 오류는 일반적으로 다음 상황에서 발생:
1. `undefined` 또는 `null` 값을 함수로 호출하려 할 때
2. Signal을 함수 호출 없이 사용할 때 (SolidJS 특성)
3. Context가 undefined일 때 메서드 호출 시도

### 2.2 의심 코드 분석

#### 2.2.1 ThemeProvider (`src/components/providers/theme-provider.tsx`)

```typescript
// 문제점 1: onMount에서 이벤트 리스너 cleanup 누락
onMount(() => {
  const stored = localStorage.getItem('theme') as Theme | null;
  const initial = stored || 'system';
  setThemeState(initial);
  applyTheme(initial);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    if (theme() === 'system') {
      applyTheme('system');
    }
  };
  mediaQuery.addEventListener('change', handleChange);
  // ❌ 누락: onCleanup(() => mediaQuery.removeEventListener('change', handleChange));
});
```

**문제점:**
- 컴포넌트 언마운트 시 이벤트 리스너가 제거되지 않음
- 빠른 네비게이션 시 여러 리스너가 쌓임
- 메모리 누수 및 예기치 않은 동작 발생 가능

#### 2.2.2 Context 접근 패턴

```typescript
// Header.tsx에서의 사용
const { resolvedTheme, setTheme } = useTheme();

// useTheme 구현
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultThemeContext; // 기본값 반환
  }
  return context;
}
```

**잠재적 문제:**
- SSR에서 Context가 없을 때 기본값 반환
- 하이드레이션 중 불일치 발생 가능

### 2.3 SSR/하이드레이션 불일치

```
서버 렌더링                      클라이언트 하이드레이션
┌─────────────────────┐         ┌─────────────────────┐
│ ThemeProvider       │         │ ThemeProvider       │
│ - theme: 'system'   │    ≠    │ - theme: localStorage│
│ - resolved: 'dark'  │         │ - resolved: 실제값   │
└─────────────────────┘         └─────────────────────┘
              ↓
        불일치 발생 → 하이드레이션 오류
```

---

## 3. 주요 원인

### 3.1 가장 유력한 원인: 이벤트 리스너 미정리 (Cleanup 누락)

```typescript
// 현재 코드 (문제)
onMount(() => {
  // ...
  mediaQuery.addEventListener('change', handleChange);
  // cleanup 없음!
});

// 필요한 코드
onMount(() => {
  // ...
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => { /* ... */ };
  mediaQuery.addEventListener('change', handleChange);

  onCleanup(() => {
    mediaQuery.removeEventListener('change', handleChange);
  });
});
```

### 3.2 두 번째 원인: SSR 하이드레이션 불일치

서버에서 렌더링된 HTML과 클라이언트 하이드레이션 결과가 다르면:
- SolidJS의 반응성 시스템이 손상될 수 있음
- Signal 함수가 예상대로 동작하지 않을 수 있음

### 3.3 세 번째 원인: 타이밍 이슈

```
페이지 로드 시퀀스:
1. SSR HTML 로드
2. 클라이언트 JS 로드
3. 하이드레이션 시작 ← 여기서 theme 접근 시 오류 발생 가능
4. ThemeProvider onMount
5. localStorage에서 테마 로드
```

---

## 4. 해결 방안

### 4.1 즉시 수정 (High Priority)

#### 수정 1: 이벤트 리스너 정리 추가

```typescript
// src/components/providers/theme-provider.tsx
import { onCleanup, onMount } from 'solid-js';

onMount(() => {
  const stored = localStorage.getItem('theme') as Theme | null;
  const initial = stored || 'system';
  setThemeState(initial);
  applyTheme(initial);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    if (theme() === 'system') {
      applyTheme('system');
    }
  };
  mediaQuery.addEventListener('change', handleChange);

  // ✅ 추가: cleanup 함수
  onCleanup(() => {
    mediaQuery.removeEventListener('change', handleChange);
  });
});
```

#### 수정 2: createEffect 순서 조정

```typescript
// createEffect는 onMount 이후에 실행되도록 보장
// 현재 코드에서 createEffect가 theme()를 사용하는데,
// 초기화 전에 호출될 수 있음

// 변경 전
createEffect(() => {
  applyTheme(theme());
});

// 변경 후: 마운트 후에만 실행
let mounted = false;
onMount(() => {
  // ... 초기화 코드 ...
  mounted = true;
});

createEffect(() => {
  if (mounted) {
    applyTheme(theme());
  }
});
```

### 4.2 중기 수정 (Medium Priority)

#### 수정 3: 하이드레이션 안전 패턴 적용

```typescript
// 서버와 클라이언트 초기값 일치시키기
const ThemeProvider: ParentComponent = (props) => {
  // 서버와 클라이언트 모두 동일한 초기값
  const [theme, setThemeState] = createSignal<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = createSignal<'light' | 'dark'>('dark');
  const [isHydrated, setIsHydrated] = createSignal(false);

  onMount(() => {
    setIsHydrated(true);
    // 클라이언트에서만 localStorage 접근
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
    applyTheme(theme());
  });

  // ...
};
```

### 4.3 장기 개선 (Low Priority)

#### 개선 1: 테마 스크립트 인라인화

```html
<!-- app.html 또는 entry-server.tsx -->
<script>
  // 페이지 로드 시 즉시 실행되어 FOUC 방지
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  })();
</script>
```

---

## 5. 테스트 계획

### 5.1 단위 테스트

```typescript
// theme-provider.test.tsx
describe('ThemeProvider', () => {
  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(MediaQueryList.prototype, 'removeEventListener');
    const { unmount } = render(() => (
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    ));
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('should not throw when context is undefined', () => {
    expect(() => {
      const { theme } = useTheme();
      theme();
    }).not.toThrow();
  });
});
```

### 5.2 E2E 테스트

```typescript
// e2e/theme.spec.ts
test('rapid navigation should not cause errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  // 빠른 네비게이션 시뮬레이션
  for (let i = 0; i < 10; i++) {
    await page.goto('/');
    await page.goto('/built-with');
  }

  expect(errors).toHaveLength(0);
});
```

---

## 6. 실행 계획

| 단계 | 작업 | 우선순위 | 예상 시간 |
|------|------|----------|-----------|
| 1 | onCleanup 추가 | 🔴 High | 10분 |
| 2 | createEffect 순서 조정 | 🟡 Medium | 20분 |
| 3 | 하이드레이션 패턴 적용 | 🟡 Medium | 30분 |
| 4 | 테스트 작성 | 🟢 Low | 1시간 |
| 5 | E2E 검증 | 🟢 Low | 30분 |

---

## 7. 결론

### 7.1 핵심 문제
1. **이벤트 리스너 미정리**: 가장 유력한 원인
2. **SSR 하이드레이션 불일치**: 부가적 원인
3. **타이밍 이슈**: createEffect 실행 순서

### 7.2 권장 조치
1. **즉시**: `onCleanup`으로 이벤트 리스너 정리
2. **단기**: 하이드레이션 안전 패턴 적용
3. **중기**: 테마 초기화 스크립트 인라인화

### 7.3 예방책
- 모든 `onMount`에서 `onCleanup` 사용 여부 확인
- SSR 환경에서 `isServer` 체크 철저히
- 프로덕션 빌드 전 하이드레이션 테스트 수행

---

*보고서 작성일: 2025-12-15*
*분석 대상: SoundBlueMusic Web Tools Platform*
