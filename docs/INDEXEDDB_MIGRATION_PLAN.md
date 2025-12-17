# localStorage → IndexedDB 마이그레이션 계획서

## 1. 프로젝트 개요

### 1.1 목표
모든 앱의 클라이언트 측 스토리지를 localStorage에서 IndexedDB로 마이그레이션하여:
- 더 큰 저장 용량 확보 (localStorage: ~5MB, IndexedDB: 수백 MB~GB)
- 비동기 API로 UI 블로킹 방지
- 구조화된 데이터 저장 지원
- 일관된 스토리지 아키텍처 구축

### 1.2 프로젝트 구조
```
soundblue-monorepo/
├── apps/
│   ├── dialogue/          # 대화 앱 (이미 IndexedDB 완료)
│   ├── sound-blue/        # 주요 앱 (마이그레이션 필요)
│   └── tools/             # 도구 앱 (부분 완료)
└── packages/
    └── shared/            # 공유 패키지 (마이그레이션 필요)
```

---

## 2. 현황 분석

### 2.1 localStorage 사용 현황

| 앱/패키지 | 파일 | 사용 내용 | 현재 상태 |
|-----------|------|-----------|-----------|
| `apps/dialogue` | `stores/chat-store.ts` | 대화 기록 저장 | ✅ IndexedDB 완료 |
| `apps/dialogue` | `i18n/context.tsx` | 언어 설정 (`dialogue-locale`) | ❌ localStorage |
| `apps/tools` | `engine/storage.ts` | 프로젝트/오디오/설정 | ✅ IndexedDB (Dexie) |
| `apps/tools` | `lib/schemas.ts` | 스키마 유틸리티 | ❌ localStorage |
| `apps/sound-blue` | `utils/storage.ts` | 스토리지 유틸리티 | ❌ localStorage |
| `packages/shared` | `utils/storage.ts` | 공유 스토리지 유틸리티 | ❌ localStorage |
| `packages/shared` | `providers/ThemeProvider.tsx` | 테마 저장 | ❌ localStorage |

### 2.2 스토리지 키 현황

#### dialogue 앱
- `dialogue-locale` - 언어 설정 (i18n/context.tsx)
- `dialogue-db` - IndexedDB 데이터베이스 (chat-store.ts) ✅

#### sound-blue 앱
- `sb-theme` - 테마 설정
- `sb-language` - 언어 설정
- `sb-chat-state` - 임시 채팅 상태
- `sb-chat-history` - 채팅 기록

#### tools 앱
- `tools-db` - IndexedDB 데이터베이스 (engine/storage.ts) ✅
- 기타 스키마 기반 설정 (lib/schemas.ts)

#### shared 패키지
- `theme` - 테마 설정 (ThemeProvider.tsx)

---

## 3. 마이그레이션 전략

### 3.1 라이브러리 선택: Dexie.js
이미 `apps/tools`에서 사용 중인 [Dexie.js](https://dexie.org/)를 표준으로 채택:
- Promise 기반 API
- TypeScript 완벽 지원
- 간결한 코드
- 마이그레이션/버전 관리 내장
- SSR 안전성 보장 용이

### 3.2 아키텍처 설계

```
packages/shared/
└── src/
    └── storage/
        ├── index.ts           # 공통 export
        ├── database.ts        # SharedDatabase 클래스 (Dexie 기반)
        ├── preferences.ts     # 사용자 설정 (테마, 언어 등)
        └── types.ts           # 타입 정의
```

### 3.3 데이터베이스 스키마

```typescript
// packages/shared/src/storage/database.ts
import Dexie, { type EntityTable } from 'dexie';

interface Preference {
  key: string;
  value: string;
  updatedAt: number;
}

class SharedDatabase extends Dexie {
  preferences!: EntityTable<Preference, 'key'>;

  constructor(dbName: string = 'shared-db') {
    super(dbName);

    this.version(1).stores({
      preferences: 'key',
    });
  }
}
```

---

## 4. 구현 계획

### Phase 1: 공유 패키지 마이그레이션 (우선순위: 높음)

#### 4.1 Task 1: packages/shared 스토리지 모듈 생성
**파일:** `packages/shared/src/storage/database.ts`

```typescript
import Dexie, { type EntityTable } from 'dexie';

interface Preference {
  key: string;
  value: string;
  updatedAt: number;
}

class SharedDatabase extends Dexie {
  preferences!: EntityTable<Preference, 'key'>;

  constructor(dbName: string = 'shared-db') {
    super(dbName);
    this.version(1).stores({
      preferences: 'key',
    });
  }
}

// Lazy initialization for SSR compatibility
let dbInstance: SharedDatabase | null = null;

export function getDb(dbName?: string): SharedDatabase {
  if (typeof window === 'undefined') {
    throw new Error('Database is not available during SSR');
  }
  if (!dbInstance) {
    dbInstance = new SharedDatabase(dbName);
  }
  return dbInstance;
}

export async function getPreference(key: string): Promise<string | null> {
  try {
    const pref = await getDb().preferences.get(key);
    return pref?.value ?? null;
  } catch {
    return null;
  }
}

export async function setPreference(key: string, value: string): Promise<void> {
  try {
    await getDb().preferences.put({ key, value, updatedAt: Date.now() });
  } catch {
    // Storage unavailable
  }
}

export async function removePreference(key: string): Promise<void> {
  try {
    await getDb().preferences.delete(key);
  } catch {
    // Storage unavailable
  }
}
```

#### 4.2 Task 2: ThemeProvider IndexedDB 마이그레이션
**파일:** `packages/shared/src/providers/ThemeProvider.tsx`

변경 사항:
- `localStorage.getItem/setItem` → `getPreference/setPreference`
- 비동기 API로 전환
- 마이그레이션 로직 추가 (기존 localStorage 데이터 → IndexedDB)

#### 4.3 Task 3: 기존 storage.ts를 IndexedDB 기반으로 교체
**파일:** `packages/shared/src/utils/storage.ts`

변경 사항:
- 기존 localStorage 유틸리티를 IndexedDB 기반으로 재작성
- 동일한 API 시그니처 유지 (하위 호환성)
- Promise 반환으로 변경

---

### Phase 2: sound-blue 앱 마이그레이션 (우선순위: 높음)

#### 4.4 Task 4: sound-blue storage.ts 업데이트
**파일:** `apps/sound-blue/src/utils/storage.ts`

변경 사항:
- 공유 패키지의 IndexedDB 모듈 import
- 또는 앱별 IndexedDB 인스턴스 생성 (`soundblue-db`)

#### 4.5 Task 5: sound-blue 컴포넌트 업데이트
영향받는 파일들:
- `src/components/chat/ChatContainer.tsx`
- `src/components/providers/ThemeProvider.test.tsx`

---

### Phase 3: dialogue 앱 완료 (우선순위: 중간)

#### 4.6 Task 6: dialogue i18n 마이그레이션
**파일:** `apps/dialogue/src/i18n/context.tsx`

변경 사항:
```typescript
// Before
localStorage.setItem(STORAGE_KEY, newLocale);

// After
import { setPreference } from '~/storage';
await setPreference(STORAGE_KEY, newLocale);
```

---

### Phase 4: tools 앱 완료 (우선순위: 중간)

#### 4.7 Task 7: tools schemas.ts 업데이트
**파일:** `apps/tools/src/lib/schemas.ts`

변경 사항:
- `loadFromStorage` / `saveToStorage` 함수를 IndexedDB 기반으로 수정
- 기존 `engine/storage.ts`의 `getPreference/setPreference` 활용

---

### Phase 5: 마이그레이션 및 문서화 (우선순위: 낮음)

#### 4.8 Task 8: 데이터 마이그레이션 헬퍼
기존 localStorage 데이터를 IndexedDB로 자동 마이그레이션:

```typescript
export async function migrateFromLocalStorage(keys: string[]): Promise<void> {
  if (typeof window === 'undefined') return;

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      await setPreference(key, value);
      localStorage.removeItem(key); // 마이그레이션 완료 후 삭제
    }
  }
}
```

#### 4.9 Task 9: 테스트 업데이트
- `apps/sound-blue/src/utils/storage.test.ts` 업데이트
- IndexedDB 모킹 추가 (fake-indexeddb 사용)

#### 4.10 Task 10: 문서화
- `INDEXEDDB_MIGRATION_GUIDE.md` 작성
- API 문서 업데이트
- JSDoc 주석 추가

---

## 5. 마이그레이션 체크리스트

### 공유 패키지 (packages/shared)
- [ ] `src/storage/database.ts` 생성
- [ ] `src/storage/preferences.ts` 생성
- [ ] `src/storage/types.ts` 생성
- [ ] `src/storage/index.ts` export
- [ ] `src/utils/storage.ts` IndexedDB 기반으로 교체
- [ ] `src/providers/ThemeProvider.tsx` 업데이트
- [ ] Dexie 의존성 추가 (`pnpm add dexie`)

### sound-blue 앱
- [ ] `src/utils/storage.ts` IndexedDB 기반으로 교체
- [ ] 관련 컴포넌트 업데이트
- [ ] 테스트 업데이트

### dialogue 앱
- [ ] `src/i18n/context.tsx` 업데이트

### tools 앱
- [ ] `src/lib/schemas.ts` 업데이트

### 공통
- [ ] localStorage → IndexedDB 마이그레이션 헬퍼 추가
- [ ] 단위 테스트 업데이트
- [ ] E2E 테스트 확인
- [ ] 문서화 완료

---

## 6. 주의사항

### 6.1 SSR 호환성
모든 IndexedDB 접근은 클라이언트에서만 수행:
```typescript
if (typeof window === 'undefined') return defaultValue;
```

### 6.2 비동기 API
IndexedDB는 비동기이므로 `await` 필수:
```typescript
// Before (sync)
const theme = localStorage.getItem('theme');

// After (async)
const theme = await getPreference('theme');
```

### 6.3 에러 처리
모든 IndexedDB 작업은 try-catch로 감싸서 실패 시 기본값 반환:
```typescript
try {
  return await getPreference(key);
} catch {
  return defaultValue;
}
```

### 6.4 마이그레이션 순서
1. 공유 패키지 먼저 완료 (다른 앱들이 의존)
2. 각 앱별로 순차 마이그레이션
3. 테스트 후 localStorage 데이터 정리

---

## 7. 예상 작업량

| Phase | 작업 | 예상 복잡도 |
|-------|------|-------------|
| Phase 1 | 공유 패키지 | 중간 |
| Phase 2 | sound-blue 앱 | 높음 |
| Phase 3 | dialogue 앱 | 낮음 |
| Phase 4 | tools 앱 | 낮음 |
| Phase 5 | 마이그레이션/문서화 | 중간 |

---

## 8. 결론

이 마이그레이션을 통해:
1. **일관된 스토리지 아키텍처** - 모든 앱에서 동일한 패턴 사용
2. **향상된 성능** - 비동기 API로 UI 블로킹 방지
3. **확장성** - 더 큰 데이터 저장 가능
4. **유지보수성** - Dexie 라이브러리로 코드 간소화

---

*문서 작성일: 2025-12-17*
*작성자: Claude (AI Assistant)*
