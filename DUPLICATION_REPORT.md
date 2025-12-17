# 코드 중복 분석 보고서

> 분석 일시: 2025-12-17
> 분석 대상: soundblue-monorepo 전체

---

## 요약

| 항목 | 수치 |
|------|------|
| 발견된 중복 패턴 | 15개 |
| 중복 코드 추정 라인 수 | **~3,700줄 이상** |
| 영향받는 앱 | dialogue, tools, sound-blue |
| 심각도 CRITICAL | 1건 |
| 심각도 HIGH | 2건 |
| 심각도 MEDIUM | 9건 |
| 심각도 LOW | 3건 |

---

## 🔴 CRITICAL: 저장소 유틸리티 (3개 구현체)

**문제**: IndexedDB 기반 저장소 래퍼가 3곳에서 거의 동일하게 구현됨

| 파일 | 라인 수 |
|------|---------|
| `packages/shared/src/utils/storage.ts` | 244줄 |
| `apps/tools/src/engine/storage.ts` | 386줄 |
| `apps/sound-blue/src/utils/storage.ts` | 357줄 |

**중복된 함수들**:
```typescript
getStorageItem()
setStorageItem()
getValidatedStorageItem()
getRawStorageItem()
setRawStorageItem()
removeStorageItem()
```

**왜 바보같은 중복인가**:
- 3개 파일 모두 Dexie.js 기반으로 완전히 동일한 로직
- 유일한 차이점: 검증 라이브러리 (Zod vs Valibot vs none)
- 총 **~987줄**이 사실상 같은 일을 함

**해결 방안**: `packages/shared/src/utils/storage.ts`에 통합, 검증 전략을 옵셔널 파라미터로 처리

---

## 🟠 HIGH: I18n Provider (3개 구현체)

**문제**: 언어 감지 및 번역 Provider가 3곳에서 각각 구현됨

| 파일 | 라인 수 |
|------|---------|
| `apps/tools/src/i18n/context.tsx` | 125줄 |
| `apps/sound-blue/src/components/providers/I18nProvider.tsx` | 434줄 |
| `apps/dialogue/src/i18n/context.tsx` | 68줄 |

**완전히 동일한 로직**:
```typescript
// dialogue/context.tsx
function getLocaleFromPath(pathname: string): Locale {
  const path = pathname.split("/")[1];
  if (path === "ko") return "ko";
  if (path === "ja") return "ja";
  return "en";
}

// sound-blue/I18nProvider.tsx (같은 로직, 다른 구현)
function getLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/ko/') || pathname === '/ko') {
    return 'ko';
  }
  return 'en';
}
```

**왜 바보같은 중복인가**:
- URL에서 locale 추출하는 로직이 3번 구현됨
- `locale()`, `setLocale()`, `toggleLocale()` 전부 중복
- IndexedDB 저장 로직도 중복
- 총 **~627줄** 중복

**해결 방안**: `packages/shared/src/providers/I18nProvider.tsx` 통합

---

## 🟠 HIGH: 레이아웃 컴포넌트 (3개 구현체)

**문제**: 반응형 사이드바 로직이 3곳에서 반복됨

| 파일 | 라인 수 |
|------|---------|
| `apps/dialogue/src/components/layout/MainLayout.tsx` | 230줄 |
| `apps/tools/src/components/layout/MainLayout.tsx` | 96줄 |
| `apps/sound-blue/src/components/NavigationLayout.tsx` | 39줄 |

**복붙된 코드**:
```typescript
// 3곳 모두에서 발견:
const BREAKPOINTS = {
  mobile: 768,
} as const;

const [isMobile, setIsMobile] = createSignal(false);
const checkScreenSize = () => {
  if (isServer) return;
  setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
};

createEffect(() => {
  if (isMobile()) {
    setSidebarOpen(false);
  }
});

const showMobileOverlay = () => isMobile() && store.sidebarOpen;
```

**왜 바보같은 중복인가**:
- 모바일 감지 로직이 완전히 동일
- 사이드바 오버레이 로직이 완전히 동일
- 총 **~365줄** 중복

---

## 🟡 MEDIUM: Theme Provider 래퍼 (3개)

| 파일 | 라인 수 |
|------|---------|
| `apps/tools/src/components/providers/theme-provider.tsx` | 35줄 |
| `apps/sound-blue/src/components/providers/ThemeProvider.tsx` | 51줄 |
| `apps/dialogue/src/theme/context.tsx` | 43줄 |

**왜 바보같은 중복인가**:
- 이미 shared 패키지에 ThemeProvider가 있는데 각 앱에서 다시 래핑
- 유일한 차이: storage key (`'theme'`, `'sb-theme'`, `'dialogue-theme'`)
- 이건 그냥 파라미터로 처리하면 됨

---

## 🟡 MEDIUM: Header 컴포넌트 (3개)

| 파일 | 라인 수 |
|------|---------|
| `apps/tools/src/components/layout/Header.tsx` | 136줄 |
| `apps/sound-blue/src/components/Header.tsx` | 123줄 |
| `apps/dialogue/src/components/Header.tsx` | 153줄 |

**반복되는 패턴**:
- 테마 토글 (Sun/Moon 아이콘)
- 언어 토글 (Globe 아이콘)
- 모바일 메뉴 (Hamburger 아이콘)
- 아이콘 컴포넌트 (SunIcon, MoonIcon, GlobeIcon)

---

## 🟡 MEDIUM: Footer 컴포넌트 (3개)

| 파일 | 라인 수 |
|------|---------|
| `apps/tools/src/components/layout/Footer.tsx` | 25줄 |
| `apps/sound-blue/src/components/Footer.tsx` | 54줄 |
| `apps/dialogue/src/components/layout/Footer.tsx` | 24줄 |

---

## 🟡 MEDIUM: 스키마 정의 (2개)

| 파일 | 라인 수 | 라이브러리 |
|------|---------|------------|
| `apps/tools/src/lib/schemas.ts` | 207줄 | Valibot |
| `apps/sound-blue/src/lib/schemas.ts` | 207줄 | Zod |

**중복 스키마**:
- `ThemeSchema`
- `LanguageSchema`
- `MessageSchema`
- `parseTheme()`, `parseLanguage()`, `parseMessages()`

**왜 바보같은 중복인가**: 완전히 동일한 검증 로직을 다른 라이브러리로 2번 구현

---

## 🟡 MEDIUM: Message 타입 정의 (4곳)

```typescript
// apps/dialogue/src/components/ChatMessage.tsx
export interface Message {
  id: string;
  role: "user" | "assistant";  // ← role 사용
  content: string;
  timestamp: number;
}

// apps/sound-blue/src/components/chat/ChatMessage.tsx
export interface Message {
  id: string;
  type: 'user' | 'bot';  // ← type 사용 (이름만 다름)
  content: string;
  timestamp: number;
}
```

**왜 바보같은 중복인가**: 같은 타입인데 필드명만 다르게 4곳에서 정의

---

## 🟡 MEDIUM: ChatInput 컴포넌트 (2개)

| 파일 | 라인 수 |
|------|---------|
| `apps/dialogue/src/components/ChatInput.tsx` | 60줄 |
| `apps/sound-blue/src/components/chat/ChatInput.tsx` | 63줄 |

**동일한 코드**:
```typescript
const [input, setInput] = createSignal("");

const handleSubmit = (e: Event) => {
  e.preventDefault();
  const message = input().trim();
  if (message && !props.disabled) {
    props.onSend(message);
    setInput("");
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit(e);
  }
};
```

---

## 🟡 MEDIUM: Error Boundary (2개)

| 파일 | 라인 수 |
|------|---------|
| `apps/sound-blue/src/components/ErrorBoundary.tsx` | 45줄 |
| `apps/tools/src/components/error-boundary.tsx` | 204줄 |

---

## 🟡 MEDIUM: 로컬라이제이션 유틸리티

**여러 곳에서 중복 구현된 함수들**:
- `getLocaleFromPath()` / `getLanguageFromPath()`
- `getBasePath()` / `getPathWithoutLocale()`
- `localizedPath()` / `getLocalizedPath()` / `createLocalizedPath()`
- `buildLocalizedPath()`

**영향 파일**:
- `apps/dialogue/src/i18n/context.tsx`
- `apps/sound-blue/src/components/providers/I18nProvider.tsx`
- `apps/sound-blue/src/lib/routes.ts`
- `apps/tools/src/i18n/request.ts`

---

## 🟢 LOW: 기타 중복

### Breakpoint 상수
```typescript
// 2곳에서 동일:
const BREAKPOINTS = {
  mobile: 768,
} as const;
```

### ChatMessage 컴포넌트 (2개, ~90줄)
### 리사이즈 핸들러 로직

---

## 통합 우선순위 로드맵

### Phase 1: CRITICAL (즉시 처리)
```
packages/shared/src/utils/storage.ts
├── 3개 구현체 → 1개로 통합
├── Dexie.js + 커스텀 백엔드 지원
└── 검증 전략 옵셔널 파라미터화
```

### Phase 2: HIGH (높은 가치)
```
packages/shared/src/providers/I18nProvider.tsx
├── 통합 언어 감지
├── 설정 가능한 지원 locale
└── 저장소 전략 추상화

packages/shared/src/components/Layout.tsx
├── 반응형 breakpoint 관리
├── 모바일 사이드바 로직
└── 설정 가능한 레이아웃 영역
```

### Phase 3: MEDIUM (높은 영향)
```
packages/shared/src/components/
├── Footer.tsx
├── Header.tsx
├── ErrorBoundary.tsx
├── ChatInput.tsx
└── ChatMessage.tsx

packages/shared/src/types/index.ts
└── Message 타입 통합

packages/shared/src/utils/i18n-paths.ts
└── 로컬라이제이션 유틸리티 통합
```

### Phase 4: LOW (정리)
```
packages/shared/src/constants/breakpoints.ts
packages/shared/src/hooks/useResizable.ts
```

---

## 예상 효과

| 항목 | Before | After | 절감 |
|------|--------|-------|------|
| Storage 관련 코드 | ~987줄 | ~400줄 | **-587줄** |
| I18n 관련 코드 | ~627줄 | ~250줄 | **-377줄** |
| Layout 관련 코드 | ~365줄 | ~150줄 | **-215줄** |
| UI 컴포넌트 | ~560줄 | ~250줄 | **-310줄** |
| 타입/스키마 | ~430줄 | ~150줄 | **-280줄** |
| **총합** | **~3,700줄** | **~1,200줄** | **~2,500줄 절감** |

---

## 결론

현재 코드베이스에서 **약 3,700줄 이상의 중복 코드**가 발견되었습니다.

가장 심각한 문제는:
1. **저장소 유틸리티** - 거의 동일한 코드가 3곳에 존재
2. **I18n Provider** - 언어 감지 로직이 3번 구현됨
3. **레이아웃 컴포넌트** - 모바일 반응형 로직 복붙

이 중복들을 `packages/shared`로 통합하면 약 **2,500줄의 코드를 절감**할 수 있으며, 유지보수성과 일관성이 크게 향상됩니다.
