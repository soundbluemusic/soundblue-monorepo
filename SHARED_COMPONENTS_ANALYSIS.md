# 🔍 모노레포 중복 컴포넌트 분석 보고서

**분석일:** 2025-12-16
**분석 대상:** soundblue-monorepo (3개 앱)

---

## 📊 요약

| 항목 | 값 |
|------|-----|
| **총 분석 파일** | 20+ 컴포넌트 파일 |
| **총 코드 라인** | ~5,669 lines |
| **중복/거의 동일한 코드** | ~500+ lines (9%) |
| **공유 패턴 후보** | ~1,500+ lines (26%) |

---

## 🏗️ 모노레포 구조

```
soundblue-monorepo/
├── apps/
│   ├── tools/         # Web DAW & 창작 도구
│   ├── sound-blue/    # 아티스트 공식 웹사이트
│   └── dialogue/      # 대화형 학습 도구 (오프라인)
├── pnpm-workspace.yaml
└── package.json
```

**공통 기술 스택:** SolidJS + TypeScript + Tailwind CSS + Vinxi

---

## 🚨 즉시 통합 권장 (High Priority)

### 1. `cn()` 유틸리티 함수 - **100% 동일**

| 앱 | 파일 경로 | 라인 수 |
|----|----------|--------|
| tools | `apps/tools/src/lib/utils.ts` | 6 |
| sound-blue | `apps/sound-blue/src/lib/utils.ts` | 9 |

```typescript
// 완전히 동일한 코드
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**권장 조치:** `@soundblue/shared` 패키지로 추출

---

### 2. `ChatMessage` 컴포넌트 - **95%+ 동일**

| 앱 | 파일 경로 | 라인 수 |
|----|----------|--------|
| tools | `apps/tools/src/components/chat/ChatMessage.tsx` | 40 |
| sound-blue | `apps/sound-blue/src/components/chat/ChatMessage.tsx` | 32 |

**동일한 부분:**
- `Message` 인터페이스 (`id`, `type`, `content`, `timestamp`)
- `isBot()` 로직
- 레이아웃 구조 (flex, justify-start/end)
- 말풍선 스타일 (rounded-2xl, max-width)

**차이점:**
- sound-blue: `<li>` 래퍼 사용
- tools: `<div>` 래퍼 + `getContent()` 함수

**권장 조치:** 공유 컴포넌트로 추출, variant prop으로 차이점 처리

---

### 3. `ThemeProvider` - **85% 유사**

| 앱 | 파일 경로 | 라인 수 |
|----|----------|--------|
| sound-blue | `apps/sound-blue/src/components/providers/ThemeProvider.tsx` | 341 |
| dialogue | `apps/dialogue/src/theme/context.tsx` | 73 |
| tools | `apps/tools/src/components/providers/theme-provider.tsx` | 102 |

**동일한 패턴:**
```typescript
createSignal → onMount (초기값) → createEffect (DOM 적용) → toggle/setTheme
```

**차이점:**
| 기능 | sound-blue | dialogue | tools |
|------|-----------|----------|-------|
| 테마 값 | light/dark | light/dark | light/dark/system |
| 저장소 키 | 'sb-theme' | 'dialogue-theme' | 'theme' |
| SSR 안전성 | mounted 패턴 | 직접 확인 | isServer 확인 |

**권장 조치:** sound-blue의 구현을 기반으로 통합, `system` 옵션 추가

---

### 4. `I18nProvider` - **75% 유사**

| 앱 | 파일 경로 | 라인 수 |
|----|----------|--------|
| sound-blue | `apps/sound-blue/src/components/providers/I18nProvider.tsx` | 433 |
| dialogue | `apps/dialogue/src/i18n/context.tsx` | 68 |
| tools | `apps/tools/src/i18n/` | @solid-primitives/i18n 직접 사용 |

**동일한 패턴:**
- URL 기반 언어 감지 (`/ko/*` → 한국어)
- createContext 패턴
- localStorage 폴백

**권장 조치:** sound-blue의 완성도 높은 구현을 공유 패키지로 추출

---

## ⚠️ 통합 고려 (Medium Priority)

### 5. `ChatInput` 컴포넌트 - **70-75% 유사**

| 앱 | 파일 경로 | 라인 수 | 입력 방식 |
|----|----------|--------|----------|
| dialogue | `apps/dialogue/src/components/ChatInput.tsx` | 59 | `<textarea>` |
| sound-blue | `apps/sound-blue/src/components/chat/ChatInput.tsx` | 62 | `<input>` |
| tools | `apps/tools/src/components/chat/ChatInput.tsx` | 77 | `<input>` |

**권장 조치:** variant prop (`mode: 'textarea' | 'input'`)으로 유연한 공유 컴포넌트 생성

---

### 6. `Button` 컴포넌트 - **75-80% 유사**

| 앱 | 파일 경로 | 라인 수 | Variants |
|----|----------|--------|----------|
| sound-blue | `apps/sound-blue/src/components/ui/Button.tsx` | 68 | 4개 |
| tools | `apps/tools/src/components/ui/button.tsx` | 110 | 7개 |

**공통점:**
- CVA (class-variance-authority) 사용
- splitProps 패턴
- variant/size props

**권장 조치:** variants와 sizes를 병합한 공유 Button 컴포넌트

---

### 7. Storage 유틸리티 - **sound-blue만 존재**

| 앱 | 파일 경로 | 라인 수 |
|----|----------|--------|
| sound-blue | `apps/sound-blue/src/utils/storage.ts` | 268 |

**기능:**
- `getValidatedStorageItem()` - Zod 스키마 검증
- `getStorageItem()` / `setStorageItem()` - JSON 파싱
- `getRawStorageItem()` / `setRawStorageItem()` - 원시 문자열
- SSR 안전성, 에러 핸들링, 용량 초과 처리

**권장 조치:** 다른 앱에서도 재사용할 수 있도록 공유 패키지로 추출

---

### 8. Type 유틸리티 - **sound-blue만 존재**

| 앱 | 파일 경로 | 라인 수 |
|----|----------|--------|
| sound-blue | `apps/sound-blue/src/lib/types.ts` | 267 |

**기능:**
```typescript
// Branded Types
type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

// Result 타입 (Rust-like)
type Result<T, E> = Success<T> | Failure<E>;
ok<T>(data: T): Success<T>
err<E>(error: E): Failure<E>

// Type Guards
isDefined<T>(value): value is T
isNonEmptyString(value): value is string
isNonEmptyArray<T>(value): value is [T, ...T[]]

// Assertions
assert(condition, message): asserts condition
assertDefined<T>(value, message): asserts value is T
```

**권장 조치:** 공유 패키지로 추출하여 타입 안전성 향상

---

## ✅ 분리 유지 권장 (Low Priority)

### ChatContainer - **40-50% 유사**
- 비즈니스 로직이 근본적으로 다름
- dialogue: 단순 Q&A
- sound-blue: NLP 토픽 감지
- tools: 명령어 파싱 (OPEN_TOOL, CLOSE_TOOL)

### Sidebar 컴포넌트들 - **30-40% 유사**
- dialogue: 설정 사이드바
- sound-blue: 네비게이션 사이드바
- tools: 도구 카테고리 사이드바
- 목적이 완전히 다름

---

## 📦 권장 공유 패키지 구조

```
packages/
└── shared/                    # @soundblue/shared
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── Button.tsx
    │   │   │   └── index.ts
    │   │   ├── chat/
    │   │   │   ├── ChatMessage.tsx
    │   │   │   ├── ChatInput.tsx
    │   │   │   └── index.ts
    │   │   └── providers/
    │   │       ├── ThemeProvider.tsx
    │   │       ├── I18nProvider.tsx
    │   │       └── index.ts
    │   ├── utils/
    │   │   ├── cn.ts
    │   │   ├── storage.ts
    │   │   └── index.ts
    │   ├── types/
    │   │   ├── result.ts
    │   │   ├── guards.ts
    │   │   ├── branded.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

---

## 📈 예상 효과

| 지표 | Before | After (예상) |
|------|--------|-------------|
| 중복 코드 | ~500 lines | ~50 lines |
| 유지보수 포인트 | 3곳 | 1곳 |
| 테스트 커버리지 | 분산 | 집중 |
| 버그 수정 | 3회 반복 | 1회 |

---

## 🎯 구현 우선순위

### Phase 1: 유틸리티 추출 (Low Risk)
1. `cn()` 함수
2. Storage 유틸리티
3. Type 유틸리티

### Phase 2: Provider 통합 (Medium Risk)
1. ThemeProvider
2. I18nProvider

### Phase 3: UI 컴포넌트 통합 (Higher Risk)
1. ChatMessage
2. ChatInput
3. Button

---

## 📋 다음 단계

1. `packages/shared` 디렉토리 생성
2. pnpm-workspace.yaml에 packages 추가
3. Phase 1 유틸리티 이전
4. 각 앱에서 공유 패키지 import로 교체
5. 중복 코드 제거
6. 테스트 통합

---

*이 보고서는 코드 분석 기반으로 자동 생성되었습니다.*
