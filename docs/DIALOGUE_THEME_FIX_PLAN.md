# Dialogue 앱 테마 깜빡임 및 버벅임 수정 계획서

> **상태**: 분석 완료, 수정 대기
> **작성일**: 2025-12-17

---

## 1. 문제 요약

### 문제 1: 테마 깜빡임 (Light → Dark 전환)
사용자가 페이지 로드 시 **라이트 모드로 잠깐 보였다가 다크 모드로 변경**되는 현상

### 문제 2: 심한 버벅임 (성능 저하)
페이지 로드 및 인터랙션 시 **렉/지연**이 발생

---

## 2. 원인 분석

### 2.1 테마 깜빡임 원인

```
[SSR/초기 HTML]          [Hydration]              [onMount 완료]
     |                        |                        |
     v                        v                        v
  <html lang="ko">    →  React hydration   →   data-theme="dark" 적용
  (data-theme 없음)       (여전히 없음)          (IndexedDB 로드 후)
     |                        |                        |
  :root CSS 적용        :root CSS 유지           [data-theme] CSS 적용
  = Light Mode          = Light Mode             = Dark Mode
                                                      |
                                              ⚠️ 깜빡임 발생!
```

**핵심 원인**:
1. `entry-server.tsx`의 `<html>` 태그에 `data-theme` 속성 없음
2. `global.css`의 `:root`가 **Light Mode** 변수를 정의
3. `data-theme="dark"` 선택자만 Dark Mode 활성화
4. ThemeProvider의 `applyTheme()`이 **onMount 이후**에만 실행
5. IndexedDB 비동기 로드로 추가 지연 발생

**파일 위치**:
- `apps/dialogue/src/entry-server.tsx:7` - `<html lang="ko">` (data-theme 없음)
- `apps/dialogue/src/styles/global.css:11` - dark mode 선택자
- `apps/dialogue/src/theme/context.tsx:26` - `ssrDefault="dark"` 설정됨 (하지만 HTML에 미적용)

---

### 2.2 버벅임 원인

**1) IndexedDB 중복 연결**

| 모듈 | 데이터베이스 | dbInstance 변수 |
|------|-------------|-----------------|
| `packages/shared/ThemeProvider` | `soundblue-shared-db` | shared 모듈 내 |
| `apps/dialogue/i18n/context.tsx` | `dialogue-db` | i18n 모듈 내 |
| `apps/dialogue/stores/chat-store.ts` | `dialogue-db` | chat-store 모듈 내 |

⚠️ **문제**: i18n과 chat-store가 **같은 DB를 각각 열려고 함** (dbInstance가 모듈별로 분리)

**2) 동시 비동기 작업**

```
onMount 시점에 동시 발생:
├── ThemeProvider
│   ├── migrateFromLocalStorage() → IndexedDB 접근
│   └── getPreference() → IndexedDB 접근
├── I18nProvider
│   ├── migrateFromLocalStorage() → IndexedDB 접근
│   └── getSetting() → IndexedDB 접근
└── chat-store (hydrate 시)
    └── getAllConversations() → IndexedDB 접근
```

**3) createEffect 과다 실행**

```typescript
// i18n/context.tsx - location.pathname 변경마다 실행
createEffect(() => {
  const pathLocale = getLocaleFromPath(location.pathname);
  setLocaleState(pathLocale);  // ← 상태 변경 → 리렌더링
});
```

---

## 3. 수정 계획

### Phase 1: 테마 깜빡임 수정 (우선순위: 높음)

#### Task 1.1: entry-server.tsx에 기본 테마 적용
**파일**: `apps/dialogue/src/entry-server.tsx`

```tsx
// Before
<html lang="ko">

// After
<html lang="ko" data-theme="dark" class="dark" style="color-scheme: dark;">
```

#### Task 1.2: 인라인 스크립트로 빠른 테마 로드 (선택사항)
IndexedDB에서 테마를 빠르게 로드하는 인라인 스크립트 추가:

```tsx
<head>
  {/* Theme preload script - IndexedDB에서 테마 로드 */}
  <script>{`
    (function() {
      try {
        var req = indexedDB.open('soundblue-shared-db', 1);
        req.onsuccess = function(e) {
          var db = e.target.result;
          var tx = db.transaction('preferences', 'readonly');
          var store = tx.objectStore('preferences');
          var get = store.get('dialogue-theme');
          get.onsuccess = function() {
            var theme = get.result?.value || 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
          };
        };
      } catch(e) {}
    })();
  `}</script>
  {assets}
</head>
```

---

### Phase 2: 버벅임 수정 (우선순위: 높음)

#### Task 2.1: DB 인스턴스 공유
**파일**: `apps/dialogue/src/stores/db.ts` (신규)

dialogue 앱 전체에서 사용하는 공유 DB 모듈 생성:

```typescript
// apps/dialogue/src/stores/db.ts
const DB_NAME = "dialogue-db";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export async function getDialogueDb(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    // ... 초기화 로직
  });

  dbInstance = await dbPromise;
  return dbInstance;
}
```

#### Task 2.2: i18n/context.tsx 수정
공유 DB 모듈 사용:

```typescript
// Before
import { ... } // 자체 openDB 함수

// After
import { getDialogueDb } from "~/stores/db";
```

#### Task 2.3: chat-store.ts 수정
공유 DB 모듈 사용:

```typescript
// Before
async function openDB(): Promise<IDBDatabase> { ... }

// After
import { getDialogueDb } from "./db";
const openDB = getDialogueDb;
```

#### Task 2.4: createEffect 최적화 (i18n/context.tsx)

```typescript
// Before - 불필요한 중복 실행
createEffect(() => {
  const pathLocale = getLocaleFromPath(location.pathname);
  setLocaleState(pathLocale);
});

onMount(async () => {
  await migrateFromLocalStorage();
  const pathLocale = getLocaleFromPath(window.location.pathname);
  setLocaleState(pathLocale);  // ← 중복!
});

// After - 한 번만 실행
onMount(async () => {
  await migrateFromLocalStorage();
});

// createEffect는 URL 기반 locale 동기화만 담당 (정상)
createEffect(() => {
  const pathLocale = getLocaleFromPath(location.pathname);
  setLocaleState(pathLocale);
});
```

---

### Phase 3: ThemeProvider DB 통합 (선택사항)

dialogue 앱이 `soundblue-shared-db` 대신 `dialogue-db`를 사용하도록 변경:

**옵션 A**: dialogue용 ThemeProvider에서 dialogue-db 사용
**옵션 B**: 현재 구조 유지 (두 DB 분리)

→ **권장**: 옵션 B (현재 구조 유지) - shared 패키지의 일관성 유지

---

## 4. 수정 체크리스트

### Phase 1: 테마 깜빡임
- [ ] `entry-server.tsx`에 `data-theme="dark"` 추가
- [ ] `class="dark"` 및 `style="color-scheme: dark"` 추가
- [ ] (선택) 인라인 스크립트로 IndexedDB 테마 프리로드

### Phase 2: 버벅임
- [ ] `stores/db.ts` 공유 모듈 생성
- [ ] `i18n/context.tsx`에서 공유 DB 사용
- [ ] `chat-store.ts`에서 공유 DB 사용
- [ ] `i18n/context.tsx`의 onMount 중복 제거

### Phase 3: 테스트
- [ ] 테마 깜빡임 없이 로드되는지 확인
- [ ] 페이지 전환 시 버벅임 없는지 확인
- [ ] DevTools에서 IndexedDB 연결 횟수 확인

---

## 5. 예상 효과

| 문제 | 수정 전 | 수정 후 |
|------|---------|---------|
| 테마 깜빡임 | Light → Dark 전환 보임 | 즉시 Dark로 렌더링 |
| IndexedDB 연결 | 3회 (별도) | 1회 (공유) |
| 초기 로드 | 비동기 작업 경쟁 | 순차적 로드 |
| 리렌더링 | onMount + createEffect 중복 | 최소화 |

---

*작성일: 2025-12-17*
*작성자: Claude (AI Assistant)*
