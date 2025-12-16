# 비효율적인 코드 분석 보고서

> 분석일: 2025-12-15
> 분석 대상: SoundBlueMusic Web Tools Platform

---

## 요약

| 심각도 | 개수 | 설명 |
|--------|------|------|
| 🔴 HIGH | 6 | 즉시 수정 필요 |
| 🟠 MEDIUM | 8 | 성능/유지보수에 영향 |
| 🟡 LOW | 5 | 개선 권장 |

---

## 🔴 HIGH - 즉시 수정 필요

### 1. 프로덕션 콘솔 로그 (총 20개 이상)

**문제**: `console.log/warn/error`가 프로덕션 코드에 그대로 남아있음

| 파일 | 라인 | 코드 |
|------|------|------|
| `src/stores/audio-store.ts` | 107 | `console.error('Failed to initialize audio engine:', error)` |
| `src/tools/qr-generator/index.tsx` | 59, 89 | `console.error('QR generation error:', err)` |
| `src/tools/registry.ts` | 21 | `console.warn('Tool "${definition.meta.id}" is already registered...')` |
| `src/hooks/use-service-worker.ts` | 44, 130 | `console.error('Failed to check for updates:', error)` |
| `src/engine/storage.ts` | 200, 235, 318 | `console.error('Failed to save/load file:', error)` |
| `src/engine/midi.ts` | 67, 85 | `console.warn/error('WebMIDI...')` |
| `src/lib/schemas.ts` | 181 | `console.error('Failed to save ${key} to storage:', error)` |

**왜 문제인가?**
- 프로덕션에서 사용자 콘솔을 오염
- 민감한 정보 노출 가능성
- 성능 저하 (특히 반복적인 경우)

**해결 방안**:
```typescript
// 환경 체크 래퍼 사용
if (import.meta.env.DEV) {
  console.error('...');
}

// 또는 logger 유틸리티 생성
import { logger } from '@/lib/logger';
logger.error('...'); // DEV에서만 출력
```

---

### 2. O(n) 반복 룩업 - `toolCategories.ts:92-104`

```typescript
// 매번 전체 배열을 순회 - O(n)
export const getToolInfo = (id: ToolType): ToolInfo | undefined => {
  return ALL_TOOLS.find((tool) => tool.id === id);  // ❌
};

export const getToolBySlug = (slug: string): ToolInfo | undefined => {
  return ALL_TOOLS.find((tool) => tool.slug === slug);  // ❌
};

export const getToolName = (id: ToolType, locale: 'ko' | 'en' = 'ko'): string => {
  const tool = getToolInfo(id);  // getToolInfo 내부에서 또 find() ❌
  return tool?.name[locale] ?? id;
};
```

**왜 문제인가?**
- `ToolSidebar`, `ToolContainer`, `ChatContainer` 등에서 반복 호출됨
- 도구가 4개일 때는 큰 문제 없지만, 확장 시 성능 저하
- `getToolName`은 내부에서 `getToolInfo`를 호출하여 이중 순회

**해결 방안**:
```typescript
// Map 캐시 사용 - O(1)
const toolById = new Map(ALL_TOOLS.map(t => [t.id, t]));
const toolBySlug = new Map(ALL_TOOLS.map(t => [t.slug, t]));

export const getToolInfo = (id: ToolType) => toolById.get(id);
export const getToolBySlug = (slug: string) => toolBySlug.get(slug);
```

---

### 3. 더미 변수 패턴 - `ChatContainer.tsx:23-28`

```typescript
createEffect(() => {
  const _ = chatStore.messages.length;  // ❌ 더미 변수로 의존성 추적
  if (messagesEndRef) {
    messagesEndRef.scrollIntoView({ behavior: 'smooth' });
  }
});
```

**왜 문제인가?**
- SolidJS의 반응성 시스템을 우회하는 안티패턴
- 코드 의도가 불명확
- 린터가 unused variable 경고 발생 가능

**해결 방안**:
```typescript
createEffect(() => {
  // 명시적으로 messages 배열 접근
  if (chatStore.messages.length > 0 && messagesEndRef) {
    messagesEndRef.scrollIntoView({ behavior: 'smooth' });
  }
});

// 또는 on() 헬퍼 사용
createEffect(on(
  () => chatStore.messages.length,
  () => messagesEndRef?.scrollIntoView({ behavior: 'smooth' })
));
```

---

### 4. 매 초 Date 객체 생성 + 반복 포맷팅 - `WorldClockWidget.tsx`

```typescript
// 1초마다 새 Date 객체 생성
const [now, setNow] = createSignal(new Date());

onMount(() => {
  const interval = setInterval(() => {
    setNow(new Date());  // ❌ 매초 새 객체
  }, 1000);
});

// 렌더링마다 toLocaleTimeString 3번 호출 (3개 도시)
const getHour = (timezone: string) => {
  return now().toLocaleTimeString('en-US', {  // ❌ 비용 높은 Intl API
    timeZone: timezone,
    hour: '2-digit',
    hour12: false,
  });
};

// 캘린더 데이터도 매초 재계산
const calendarDays = () => {  // ❌ 날짜 변경 없어도 매초 실행
  const { year, month } = currentDate();
  // ... 배열 생성 로직
};
```

**왜 문제인가?**
- `toLocaleTimeString`/`toLocaleDateString`은 비용이 높음 (Intl API)
- 3개 도시 × 2개 함수 = 매초 6번 Intl 호출
- 캘린더는 날짜가 바뀔 때만 업데이트하면 됨 (1일 1회)

**해결 방안**:
```typescript
// 1. Intl.DateTimeFormat 캐싱
const hourFormatters = new Map<string, Intl.DateTimeFormat>();
const getHourFormatter = (tz: string) => {
  if (!hourFormatters.has(tz)) {
    hourFormatters.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', hour12: false
    }));
  }
  return hourFormatters.get(tz)!;
};

// 2. calendarDays를 날짜 기반 메모이제이션
const calendarDays = createMemo(() => {
  const date = now();
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  // key가 변경될 때만 재계산
});
```

---

### 5. 불필요한 이벤트 리스너 등록/해제 - `MainLayout.tsx:94-106`

```typescript
createEffect(() => {
  if (isServer || typeof window === 'undefined') return;

  if (isResizing()) {
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  }

  onCleanup(() => {
    // ❌ isResizing()가 false일 때도 cleanup 실행
    // 등록 안 한 리스너를 제거하려고 시도
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  });
});
```

**왜 문제인가?**
- `isResizing()`이 `false`일 때 리스너를 등록하지 않지만, cleanup은 항상 실행
- 불필요한 `removeEventListener` 호출

**해결 방안**:
```typescript
createEffect(() => {
  if (isServer || !isResizing()) return;  // 조건 통합

  window.addEventListener('mousemove', handleResizeMove);
  window.addEventListener('mouseup', handleResizeEnd);

  onCleanup(() => {
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  });
});
```

---

### 6. 사용하지 않는 상태 - `MainLayout.tsx:33`

```typescript
const [isMobile, setIsMobile] = createSignal(false);
const [isTablet, setIsTablet] = createSignal(false);  // ❌ 선언만 하고 미사용
```

**분석**:
- `isTablet`은 `checkScreenSize()`에서 업데이트되지만
- JSX에서 실제로 참조하는 곳이 없음
- `isMobile()`만 조건부 렌더링에 사용

**해결 방안**: `isTablet` 시그널 제거 또는 사용처 추가

---

## 🟠 MEDIUM - 성능/유지보수에 영향

### 7. 불필요한 createMemo - `ToolContainer.tsx:182-185`

```typescript
const toolInfo = createMemo(() => {
  const tool = currentTool();
  return tool ? getToolInfo(tool) : null;  // getToolInfo는 단순 find()
});
```

**문제**:
- `getToolInfo`는 단순 동기 연산
- memoization 오버헤드가 이득보다 클 수 있음
- `currentTool()`이 바뀔 때만 실행되므로 memo 불필요

---

### 8. 중복 cn() 호출 - `MainLayout.tsx`, `ToolSidebar.tsx`

```typescript
// 동일한 기본 스타일이 여러 번 cn() 처리됨
class={cn(
  'flex-1 py-3 text-sm font-medium transition-colors text-center',
  activeTab() === 'chat' ? 'border-b-2...' : 'text-muted-foreground'
)}
// ... 바로 아래 또 동일 패턴
class={cn(
  'flex-1 py-3 text-sm font-medium transition-colors text-center',
  activeTab() === 'tool' ? 'border-b-2...' : 'text-muted-foreground'
)}
```

**해결 방안**: 공통 스타일을 변수로 추출
```typescript
const tabBaseClass = 'flex-1 py-3 text-sm font-medium transition-colors text-center';
```

---

### 9. 매직 넘버 - `MainLayout.tsx:79`

```typescript
const sidebarWidth = toolStore.sidebarCollapsed ? 56 : 208; // w-14 or w-52
```

**문제**: Tailwind 클래스(`w-14`, `w-52`)와 하드코딩된 픽셀 값이 따로 존재

**해결 방안**:
```typescript
const SIDEBAR_WIDTH = {
  collapsed: 56,   // matches w-14
  expanded: 208,   // matches w-52
} as const;
```

---

### 10. messages 객체 재생성 - `context.tsx:93-96`

```typescript
const messages = {
  ko: koMessages,
  en: enMessages,
} as const;  // ❌ 매 렌더링마다 새 객체
```

**해결 방안**: 컴포넌트 외부로 이동 (이미 `defaultMessages`가 있음)

---

### 11. registry.ts의 반복 호출 패턴

```typescript
export function searchTools(query: string): ToolDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllTools().filter((tool) => {  // getAllTools()가 매번 Array.from() 실행
    // ...
  });
}

export function getToolsByCategory(category: ToolMeta['category']): ToolDefinition[] {
  return getAllTools().filter(...);  // 또 Array.from()
}
```

**해결 방안**: `getAllTools()` 결과 캐싱 또는 Map 직접 사용

---

### 12. 불필요한 빈 onMount - `ChatContainer.tsx:84-87`

```typescript
onMount(() => {
  // This component doesn't need special mount logic
  // Tool opening from sidebar is handled in ToolSidebar
});
```

**문제**: 아무것도 하지 않는 코드가 남아있음 - 제거 필요

---

### 13. 테스트 파일의 console.log (60개 이상)

```typescript
// translation-quality.test.ts, grammar.test.ts, nlp.test.ts 등
console.log('[KO] 나는 한국사람 입니다');
console.log('[EN]', result);
```

**문제**: 테스트 실행 시 콘솔 출력이 너무 많음
**해결 방안**: `vitest`의 `--silent` 옵션 사용 또는 조건부 로깅

---

### 14. 이중 조건 체크 - 여러 파일

```typescript
// ThemeProvider.tsx
if (isServer || typeof window === 'undefined') return;

// MainLayout.tsx
if (isServer || typeof window === 'undefined') return;
```

**문제**: `isServer`가 `true`이면 `typeof window === 'undefined'`도 대부분 `true`
**해결 방안**: 하나의 조건으로 통일

---

## 🟡 LOW - 개선 권장

### 15. 선택자 함수 오버헤드 - `audio-store.ts:177-182`

```typescript
export const useTransport = (): TransportState => audioStore.transport;
export const useMasterMeter = (): MeterState => audioStore.masterMeter;
export const useIsPlaying = (): boolean => audioStore.transport.isPlaying;
```

**관찰**: 단순 속성 접근의 wrapper 함수. 추가적인 반응성 이점 없음.

---

### 16. spectrum.tsx 배열 크기 불일치

```typescript
const peaks: number[] = new Array(props.barCount ?? 32).fill(0);
// props.barCount가 변경되어도 peaks 배열 크기는 그대로
```

---

### 17. URL_PARAMS 타입 안전성 - `ToolContainer.tsx:56-61`

```typescript
const URL_PARAMS = {
  metronome: ['bpm', 'beatsPerMeasure', 'volume'] as const,
  // ...
};
```

**관찰**: 각 도구의 Settings 타입과 동기화되지 않음

---

### 18. copy 폴백 로직 - `ToolContainer.tsx:170-175`

```typescript
// Fallback for older browsers
const textArea = document.createElement('textarea');
textArea.value = window.location.href;
document.body.appendChild(textArea);
textArea.select();
document.execCommand('copy');  // ❌ deprecated API
document.body.removeChild(textArea);
```

**관찰**: `execCommand('copy')`는 deprecated. 모던 브라우저에서는 불필요.

---

### 19. 반복되는 호버 스타일 클래스

```typescript
// ToolSidebar.tsx에서 4번 반복
'hover:bg-black/[0.08] dark:hover:bg-white/[0.12]',
'hover:text-foreground',
'active:scale-95 active:bg-black/[0.12] dark:active:bg-white/[0.18]',
```

**해결 방안**: CVA variants 또는 공통 클래스 추출

---

## 권장 수정 순서

1. **[즉시]** 프로덕션 console.* 제거 또는 DEV 가드 추가
2. **[즉시]** `toolCategories.ts` Map 캐시 적용
3. **[단기]** `WorldClockWidget` Intl 캐싱 + 캘린더 메모이제이션
4. **[단기]** `MainLayout` 이벤트 리스너 패턴 수정, isTablet 제거
5. **[중기]** 중복 스타일 추출, 매직 넘버 상수화
6. **[장기]** 테스트 파일 로깅 정리

---

## 영향도 예측

| 수정 항목 | 예상 개선 |
|-----------|----------|
| 콘솔 로그 제거 | 프로덕션 로그 정리, 보안 향상 |
| Map 캐시 적용 | 도구 조회 O(n) → O(1) |
| WorldClock 최적화 | 초당 CPU 연산 ~70% 감소 |
| 이벤트 리스너 수정 | 불필요한 DOM 연산 제거 |

---

*이 보고서는 코드 품질 개선을 위한 분석 결과입니다.*
