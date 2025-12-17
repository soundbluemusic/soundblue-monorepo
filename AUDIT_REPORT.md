# 🔍 SoundBlue Monorepo 코드 감사 보고서
# Code Audit Report

**분석 날짜 (Date)**: 2025-12-17
**분석 범위 (Scope)**: 전체 모노레포 (apps + packages)

---

## 📊 요약 (Executive Summary)

| 카테고리 | 상태 | 발견 항목 |
|---------|------|----------|
| 중복 코드 (Duplicate Code) | 🟡 개선 필요 | 14개 패턴 |
| 미사용 코드 (Unused Code) | 🟢 양호 | 19개 항목 |
| 모던 기능 활용 (Modern Features) | 🟢 우수 | 15개 개선 기회 |
| 코드 품질 (Code Quality) | 🟡 개선 필요 | 8개 주요 이슈 |

**전체 평가**: 코드베이스가 전반적으로 잘 구성되어 있으나, 몇 가지 중요한 개선 기회가 있습니다.

---

## 🔴 긴급 수정 필요 (High Priority Fixes)

### 1. 에러 핸들링 문제 (Silent Error Handling)

**위치**: `apps/dialogue/src/entry-client.tsx:9`
```typescript
// ❌ 현재: 서비스 워커 에러가 무시됨
navigator.serviceWorker.register('/sw.js').catch(() => { });

// ✅ 수정: 에러 로깅 추가
navigator.serviceWorker.register('/sw.js').catch((error) => {
  console.error('Service Worker registration failed:', error);
  // 오프라인 기능 불가 알림
});
```

**영향**: PWA 오프라인 기능 실패 시 사용자에게 알림 없음

### 2. 데이터 저장 에러 무시 (Data Loss Risk)

**위치**: `apps/dialogue/src/stores/chat-store.ts:72, 88`
```typescript
// ❌ 현재: 빈 catch 블록
} catch (error) { }

// ✅ 수정: 에러 처리 추가
} catch (error) {
  console.error('Conversation save failed:', error);
  throw error; // 또는 사용자에게 알림
}
```

### 3. workbox-window 미사용 의존성

**위치**: `apps/sound-blue/package.json:66`
- 설치되어 있지만 어디서도 import 되지 않음
- 제거하거나 사용 코드 추가 필요

---

## 🟡 중복 코드 개선 기회 (Duplicate Code)

### 1. i18n 설정 중복 (HIGH)

| 앱 | 파일 | 코드 라인 |
|----|------|----------|
| sound-blue | `src/components/providers/I18nProvider.tsx` | 434줄 |
| tools | `src/i18n/context.tsx` | 125줄 |
| dialogue | `src/i18n/context.tsx` | 72줄 |

**문제**: Sound Blue가 shared 유틸리티를 사용하지 않음
**해결**: `packages/shared/src/utils/i18n.ts`의 함수들을 Sound Blue에서도 활용

### 2. 테스트 설정 중복 (MEDIUM)

3개 앱 모두 비슷한 mock 설정:
- `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `localStorage`

**해결**: `packages/shared/src/test/setup.ts` 생성하여 공용 mock 통합

### 3. 스토리지 유틸리티 중복 (MEDIUM)

| 위치 | 라인 | 중복률 |
|------|------|--------|
| `packages/shared/src/utils/storage.ts` | 245줄 | 원본 |
| `apps/sound-blue/src/utils/storage.ts` | 357줄 | ~90% |

**해결**: Sound Blue의 Dexie 설정을 shared로 이동, 앱별 키 타입만 분리

### 4. Footer 컴포넌트 중복 (MEDIUM)

- `packages/shared/src/components/Footer.tsx` - 범용 구현 존재
- `apps/sound-blue/src/components/Footer.tsx` - 별도 구현

**해결**: Sound Blue에서 shared Footer 활용

### 5. 설정 파일 중복 (LOW)

| 파일 | 공통 설정 |
|------|----------|
| `tsconfig.json` (x3) | target, jsx, module 등 |
| `vitest.config.ts` (x3) | environment, globals, coverage |

**해결**: 루트에 base 설정 생성, 앱별로 extends

---

## 🟢 미사용 코드 (Unused Code)

### 미사용 exports - packages/shared

```typescript
// packages/shared/src/utils/i18n.ts
export function getOppositeLocale() { ... }    // ❌ 미사용
export function hasLocalePrefix() { ... }      // ❌ 미사용
export function createLocalizedPathBuilder() { ... } // ❌ 미사용
```

### 미사용 스키마 - apps/tools

```typescript
// apps/tools/src/lib/schemas.ts
export const ProjectDataSchema = ...      // ❌ 미사용
export const ToolUrlParamsSchema = ...    // ❌ 미사용
export const UserPreferencesSchema = ...  // ❌ 미사용
export function parseSchema() { ... }     // ❌ 미사용
export function safeParseSchema() { ... } // ❌ 미사용
export function loadFromStorage() { ... } // ❌ 미사용
export function saveToStorage() { ... }   // ❌ 미사용
```

**권장**: 향후 사용 계획이 없으면 제거

---

## ✨ 모던 기능 활용 현황 (Modern Features)

### 잘 활용하고 있는 것 ✅

| 기능 | 상태 | 위치 |
|------|------|------|
| SolidJS ErrorBoundary | ✅ 사용 | `apps/sound-blue/src/components/ErrorBoundary.tsx` |
| SolidJS Suspense | ✅ 사용 | `app.tsx` |
| SolidJS Portal | ✅ 사용 | KeyboardShortcutsProvider, BottomSheet |
| TypeScript satisfies | ✅ 사용 | navigation.tsx |
| View Transitions API | ✅ 우수 | `useViewTransitionNavigate.ts` |
| PWA Service Worker | ✅ 우수 | tools app |
| Tailwind CSS 4 Theme | ✅ 우수 | CSS variables 시스템 |
| 접근성 | ✅ 우수 | aria-label, skip links, keyboard nav |

### 활용하지 않는 기능 (개선 기회)

#### 1. SolidJS createResource / createAsync
```typescript
// ❌ 현재: 직접 Promise 처리
onMount(async () => {
  const data = await fetchData();
  setData(data);
});

// ✅ 개선: createResource 활용
const [data] = createResource(fetchData);
```

#### 2. 코드 분할 (Code Splitting)
```typescript
// apps/tools/app.config.ts에 추가 권장
rollupOptions: {
  output: {
    manualChunks: {
      'solid-vendor': ['solid-js', '@solidjs/router'],
      'ui-vendor': ['@kobalte/core'],
    }
  }
}
```

#### 3. Container Queries
```css
/* ❌ 현재: 미사용 */
/* ✅ 추가 가능: 반응형 컴포넌트에 활용 */
@container (min-width: 400px) {
  .tool-card { grid-template-columns: 1fr 1fr; }
}
```

#### 4. batch() 함수
```typescript
// 여러 signal 동시 업데이트 시 렌더링 최적화
import { batch } from 'solid-js';

batch(() => {
  setMessages([...]);
  setLoading(false);
  setError(null);
});
```

---

## 🔧 코드 품질 개선 (Code Quality)

### 1. 긴 함수 분리 필요

| 파일 | 함수 | 라인 | 권장 |
|------|------|------|------|
| `ToolContainer.tsx` | ToolContainer | 357줄 | 3-4개 컴포넌트로 분리 |
| `ChatContainer.tsx` | ChatContainer | 240줄 | 파싱 로직 분리 |
| `keyboard-shortcuts-provider.tsx` | - | 212줄 | switch문 리팩토링 |

### 2. 매직 넘버 상수화

```typescript
// ❌ 현재
const TYPING_DELAY = 300;  // 하드코딩
await sleep(100);          // 매직 넘버

// ✅ 개선: constants/timing.ts 생성
export const TIMING = {
  BOT_TYPING_DELAY_MS: 300,
  PENDING_MESSAGE_DELAY_MS: 100,
  DEBOUNCE_MS: 150,
} as const;

export const AUDIO = {
  SAMPLE_RATE: 48000,
  BUFFER_SIZE: 128,
  DEFAULT_BPM: 120,
} as const;
```

### 3. Query Parser 추상화

```typescript
// ❌ 현재: ChatContainer.tsx에 분산된 로직
function isTimeQuery() { ... }
function isDateQuery() { ... }
function getKoreanRatio() { ... }

// ✅ 개선: lib/query-parser.ts로 통합
interface QueryMatch {
  type: 'time' | 'date' | 'greeting' | 'topic' | 'unknown';
  topic?: TopicKey;
}

export class QueryParser {
  parse(message: string, language: Language): QueryMatch { ... }
}
```

### 4. IndexedDB 헬퍼 추상화

```typescript
// ❌ 현재: 각 파일에서 유사한 패턴 반복
const tx = db.transaction('store', 'readwrite');
const request = tx.objectStore('store').put(data);
request.onsuccess = () => resolve(request.result);
request.onerror = () => reject(request.error);

// ✅ 개선: lib/idb-helpers.ts 생성
export async function idbPut<T>(db: IDBDatabase, store: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const request = tx.objectStore(store).put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`IDB Error: ${request.error?.message}`));
  });
}
```

---

## 📋 권장 작업 우선순위 (Action Items)

### 🔴 긴급 (이번 주)
1. [ ] `dialogue/entry-client.tsx` - SW 에러 핸들링 수정
2. [ ] `dialogue/chat-store.ts` - 빈 catch 블록 수정
3. [ ] `sound-blue/package.json` - workbox-window 제거 또는 사용

### 🟡 중요 (2주 내)
4. [ ] Sound Blue i18n을 shared 유틸리티 활용하도록 리팩토링
5. [ ] 테스트 설정 통합 (`packages/shared/src/test/setup.ts`)
6. [ ] `ToolContainer.tsx` 컴포넌트 분리 (357줄 → ~100줄씩 3-4개)
7. [ ] Query parsing 로직 추상화

### 🟢 개선 (1달 내)
8. [ ] 매직 넘버 상수화 (timing, audio 설정)
9. [ ] Vite 코드 분할 설정 추가
10. [ ] tsconfig/vitest base 설정 생성
11. [ ] 미사용 exports 제거 (i18n 유틸, schemas)
12. [ ] createResource 활용 검토

---

## 📈 예상 효과 (Expected Benefits)

| 개선 영역 | 효과 |
|----------|------|
| 에러 핸들링 수정 | 사용자 경험 개선, 디버깅 용이 |
| 중복 코드 제거 | 유지보수성 향상, ~500줄 감소 |
| 코드 분할 | 초기 로딩 시간 단축 |
| 상수화 | 코드 가독성 및 일관성 향상 |
| 추상화 | 테스트 용이성, 재사용성 증가 |

---

## 🎉 잘하고 있는 것 (What's Working Well)

1. **TypeScript 활용** - strict mode, import type, satisfies 연산자 잘 사용
2. **SolidJS 패턴** - Show, For, createSignal 등 올바르게 사용
3. **접근성** - aria-label, skip links, keyboard navigation 우수
4. **PWA 구현** - 오프라인 지원, 캐싱 전략 잘 구성
5. **View Transitions** - 페이지 전환 애니메이션 훌륭
6. **Tailwind CSS 4** - 테마 시스템 잘 구축
7. **의존성 관리** - 모든 패키지 최신 버전 유지

---

*이 보고서는 자동 생성되었습니다. 질문이 있으시면 알려주세요.*
