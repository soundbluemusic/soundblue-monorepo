# SoundBlue Monorepo Architecture

> SSG Edition - Domain-Based Package Structure
> (SSG 에디션 - 도메인 기반 패키지 구조)

---

## Overview (개요)

This document describes the architectural redesign of the SoundBlue monorepo, transitioning from a monolithic shared package to a domain-based multi-package structure optimized for Static Site Generation (SSG).

이 문서는 SoundBlue 모노레포의 아키텍처 재설계를 설명합니다. 모놀리식 공유 패키지에서 정적 사이트 생성(SSG)에 최적화된 도메인 기반 멀티 패키지 구조로 전환했습니다.

---

## Architecture Principles (아키텍처 원칙)

### 1. 100% SSG Compatibility (100% SSG 호환성)

All packages must support Static Site Generation build without errors.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚨 SPA 금지 - SEO 치명적 영향 🚨                             ║
║                    🚨 NO SPA - CRITICAL SEO IMPACT 🚨                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  SPA(Single Page Application) 모드는 SEO에 치명적입니다:                       ║
║  SPA mode is critically harmful to SEO:                                      ║
║                                                                              ║
║  📉 SEO 문제점 (SEO Problems):                                               ║
║  • 초기 HTML이 비어있어 크롤러가 콘텐츠를 인식 못함                               ║
║    (Empty initial HTML - crawlers can't see content)                         ║
║  • Google도 JS 렌더링 큐를 별도로 거쳐 색인이 지연됨                             ║
║    (Google delays indexing through separate JS rendering queue)              ║
║  • Bing, Naver 등은 JS 렌더링 지원이 제한적/불가                                ║
║    (Bing, Naver have limited/no JS rendering support)                        ║
║  • 메타태그가 크롤링 시점에 없어 SNS 공유 미리보기 실패                           ║
║    (Meta tags missing at crawl time - SNS preview fails)                     ║
║                                                                              ║
║  ❌ 절대 금지 (NEVER):                                                        ║
║  • SPA 모드 활성화 (SPA mode - removing prerender)                           ║
║  • SSR 모드 활성화 (SSR mode - ssr: true)                                    ║
║  • 서버 사이드 로직 (Server-side logic / API routes)                          ║
║  • 서버 컴포넌트 (Server components)                                          ║
║                                                                              ║
║  ✅ 필수 설정 (REQUIRED):                                                     ║
║  • ssr: false (항상 / always)                                                ║
║  • prerender() 함수에 모든 라우트 명시 (all routes listed)                    ║
║  • 브라우저 API는 이중 구현 사용 (dual implementation)                         ║
║                                                                              ║
║  🔍 SPA 발견 시 즉시 수정 (Fix immediately if SPA detected):                  ║
║  1. react-router.config.ts에서 prerender() 함수 확인                          ║
║  2. 없으면 모든 라우트를 반환하는 prerender() 추가                               ║
║  3. ssr: false 확인                                                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

```
빌드 시 (Build Time)     →  .noop.ts (빈 구현)
브라우저 런타임 (Runtime) →  .browser.ts (실제 구현)
```

### 2. Layer Dependency Rule (레이어 의존성 규칙)

```
┌─────────────────────────────────────────┐
│              apps/                      │  ← Can import from all layers below
├─────────────────────────────────────────┤
│   ui/   │  i18n/  │  seo/  │  pwa/     │  ← Can import from platform/, core/
├─────────────────────────────────────────┤
│              platform/                  │  ← Can import from core/ only
├─────────────────────────────────────────┤
│               core/                     │  ← Cannot import from any layer
└─────────────────────────────────────────┘
```

**Rules:**
- `core/` packages have ZERO external dependencies on browser APIs
- `platform/` packages abstract browser APIs with dual implementation
- `ui/` packages can use React but must not directly call browser APIs
- `apps/` can import from any package

### 3. Dual Implementation Pattern (이중 구현 패턴)

All `platform/` packages MUST provide two implementations:

| File Pattern | Purpose | When Used |
|--------------|---------|-----------|
| `*.browser.ts` | Real browser API implementation | Browser runtime |
| `*.noop.ts` | Empty stub that throws or returns defaults | SSG build time |

```typescript
// package.json exports configuration
{
  "exports": {
    ".": {
      "types": "./src/types.ts",
      "browser": "./src/index.browser.ts",
      "default": "./src/index.noop.ts"
    }
  }
}
```

### 4. Quality Principles (품질 원칙)

> **품질/성능 우선, 테스트 통과 우선 아님**
> **(Quality/Performance First, NOT Test Passing First)**

모든 패키지와 앱에 적용되는 핵심 개발 원칙입니다.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║         품질/성능 우선, 테스트 통과 우선 아님                                       ║
║         (Quality/Performance First, NOT Test Passing First)                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 금지되는 접근 방식 (Anti-Patterns):                                        ║
║  ├── 하드코딩 (Hardcoding) - 특정 케이스만 통과하는 고정값                        ║
║  ├── 과적합 (Overfitting) - 테스트 데이터에만 최적화                             ║
║  ├── 임시 해결 (Quick Fix) - 근본 원인 무시                                     ║
║  ├── 삭제/교체 (Delete/Replace) - 기존 기능 제거                                ║
║  └── 에러 숨기기 (Error Hiding) - catch 후 무시                                ║
║                                                                              ║
║  🟢 올바른 접근 방식 (Correct Approaches):                                      ║
║  ├── 일반화 (Generalization) - 모든 유사 케이스 처리                            ║
║  ├── 확장 (Extension) - 기존 유지하며 추가                                      ║
║  ├── 구조적 해결 (Structural Fix) - 근본 원인 수정                              ║
║  └── 명시적 처리 (Explicit Handling) - 모든 경우 명시                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

#### Anti-Pattern Examples (안티패턴 예시)

| Anti-Pattern | Example | Why Wrong |
|--------------|---------|-----------|
| Hardcoding | `if (text === 'test') return 'expected'` | Only one case passes |
| Overfitting | Regex for specific test sentence | Other similar sentences fail |
| Quick Fix | Add exception without understanding | Root cause remains |
| Delete/Replace | Remove `wonderful` to add `amazing` | Loses existing functionality |
| Error Hiding | `catch (e) { /* ignore */ }` | Bugs hidden, debugging impossible |

#### Correct Approach Examples (올바른 접근 예시)

| Approach | Example | Why Correct |
|----------|---------|-------------|
| Generalization | `-었/았 → past tense` pattern | All past tense verbs handled |
| Extension | Add `amazing` alongside `wonderful` | Both available for context selection |
| Structural Fix | Fix algorithm, not output | All similar cases fixed |
| Explicit Handling | Switch case with default | All branches visible |

#### Package-Specific Application (패키지별 적용)

| Package | Apply To |
|---------|----------|
| `@soundblue/translator` | Dictionary entries, grammar patterns, generation rules |
| `@soundblue/hangul` | Character mappings, decomposition rules |
| `@soundblue/nlu` | Intent patterns, entity extractors |
| `@soundblue/audio-engine` | Timing algorithms, pattern logic |
| All `platform/` packages | API abstractions, fallback behaviors |
| All `ui/` components | Prop handling, state management |

### 5. No Downgrade Policy (다운그레이드 금지 정책)

> **Always move forward, never backward**
> **(언제나 미래를 향해, 절대 후퇴하지 않는다)**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚫 다운그레이드 금지 - Forward Only 🚫                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ NEVER (절대 금지):                                                        ║
║  ├── Package version downgrade (패키지 버전 다운그레이드)                       ║
║  ├── Feature removal to avoid problems (기능 제거로 문제 회피)                 ║
║  ├── Dependency rollback (의존성 롤백)                                        ║
║  └── "Let's try the old version first" (일단 이전 버전으로)                    ║
║                                                                              ║
║  ✅ ALWAYS (항상 해야 할 것):                                                  ║
║  ├── Root cause analysis (근본 원인 분석)                                     ║
║  ├── New solution implementation (새로운 해결책 구현)                          ║
║  ├── Compatibility layer addition (호환성 레이어 추가)                         ║
║  └── Migration code writing (마이그레이션 코드 작성)                           ║
║                                                                              ║
║  ⚠️ Exception - Only deterministic cases like mathematical proofs:           ║
║     (예외 - 수학적 증명처럼 확정적인 경우만)                                     ║
║  ├── Confirmed security vulnerability (확인된 보안 취약점)                     ║
║  ├── Official deprecation requirement (공식 deprecation 필수 변경)            ║
║  └── Legal license issues (라이선스 법적 문제)                                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Rationale (근거):**
- Problems are opportunities to improve, not excuses to regress
- Downgrading hides problems instead of solving them
- Each fix should make the system stronger, not weaker

---

## Package Structure (패키지 구조)

### Before (이전 구조)

```
packages/
└── shared-react/           # Monolithic: everything mixed
    ├── components/
    ├── hooks/
    ├── storage/
    ├── i18n/
    └── ...
```

**Problems:**
- Mixed concerns (UI, storage, i18n in one package)
- SSG build failures due to browser API calls
- Circular dependencies
- Hard to test individual domains

### After (현재 구조)

```
packages/
├── core/                   # Pure logic (순수 로직)
│   ├── hangul/            # Korean text processing
│   ├── translator/        # Translation engine
│   ├── nlu/               # Natural language understanding
│   └── audio-engine/      # Audio timing & sequencing
│
├── platform/              # Browser API adapters (브라우저 API 어댑터)
│   ├── web-audio/         # Web Audio API
│   ├── storage/           # IndexedDB & localStorage
│   └── worker/            # Web Worker RPC
│
├── ui/                    # React components (리액트 컴포넌트)
│   ├── primitives/        # Base components
│   ├── patterns/          # Composite patterns
│   └── icons/             # Icon components
│
├── i18n/                  # Internationalization (국제화)
├── seo/                   # SEO utilities (SEO 유틸리티)
├── pwa/                   # PWA configuration (PWA 설정)
└── config/                # Shared configs (공유 설정)
```

---

## Package Details (패키지 상세)

### Core Layer

#### @soundblue/hangul

Korean text processing with Jamo decomposition/composition.

```typescript
import { decompose, compose, isKoreanText, jamoEditDistance } from '@soundblue/hangul';

decompose('한글');        // → ['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ']
compose(['ㅎ', 'ㅏ', 'ㄴ']); // → '한'
isKoreanText('안녕');     // → true
jamoEditDistance('한글', '한국'); // → 2
```

#### @soundblue/translator

Bidirectional Korean-English translation engine.

```typescript
import { translate } from '@soundblue/translator';

translate('안녕하세요', 'ko-en'); // → 'Hello'
translate('Hello', 'en-ko');      // → '안녕하세요'
```

> **Dictionary Policy:** See [Language Tools Dictionary Policy](#language-tools-dictionary-policy) below.
> **External Dictionary:** See [External Dictionary Sync](#external-dictionary-sync) below.

#### @soundblue/nlu

Natural Language Understanding for intent/entity extraction.

```typescript
import { parseIntent, extractEntities } from '@soundblue/nlu';

parseIntent('Play some jazz music');
// → { intent: 'play_music', confidence: 0.95 }

extractEntities('Set alarm for 7am tomorrow');
// → [{ type: 'time', value: '7am' }, { type: 'date', value: 'tomorrow' }]
```

#### @soundblue/audio-engine

Pure audio timing and sequencing logic (no Web Audio API).

```typescript
import { Clock, Pattern } from '@soundblue/audio-engine';

const clock = new Clock({ bpm: 120 });
const pattern = new Pattern([1, 0, 1, 0, 1, 0, 1, 0]); // 8-step pattern
```

---

### Platform Layer

#### @soundblue/web-audio

Web Audio API wrapper with Tone.js integration.

```typescript
// Browser runtime
import { toneEngine, DrumMachine } from '@soundblue/web-audio';

await toneEngine.initialize();
const drums = new DrumMachine();
drums.play();
```

**Dual Implementation:**
- `index.browser.ts`: Real Tone.js + Web Audio API
- `index.noop.ts`: Throws "Not available during SSR"

#### @soundblue/storage

IndexedDB and localStorage abstraction.

```typescript
import { db, createStore } from '@soundblue/storage';

// IndexedDB
await db.conversations.add({ id: '1', messages: [] });

// localStorage with Zustand
const useSettings = createStore('settings', { theme: 'dark' });
```

#### @soundblue/worker

Web Worker RPC with timeout and cleanup.

```typescript
import { createWorkerRPC } from '@soundblue/worker';

const rpc = createWorkerRPC(new Worker('./worker.js'));
const result = await rpc.call('translate', { text: '안녕' }, 5000);
```

---

### UI Layer

#### @soundblue/ui-primitives

Base React components with Tailwind styling.

```typescript
import { Button, Input, ThemeProvider, useTheme, cn } from '@soundblue/ui-primitives';

function App() {
  return (
    <ThemeProvider>
      <Button variant="primary">Click me</Button>
      <Input placeholder="Type here..." />
    </ThemeProvider>
  );
}
```

**Exports:**
- Components: `Button`, `Input`, `Modal`, `Toast`
- Providers: `ThemeProvider`, `ToastProvider`
- Hooks: `useTheme`, `useToast`
- Utils: `cn` (classname merger)
- Types: `Message`, `MessageRole`

#### @soundblue/ui-patterns

Composite UI patterns for specific use cases.

```typescript
import { ChatContainer, ChatMessage, ToolSidebar } from '@soundblue/ui-patterns';

function ChatPage() {
  return (
    <ChatContainer>
      <ChatMessage role="user" content="Hello" />
      <ChatMessage role="assistant" content="Hi there!" />
    </ChatContainer>
  );
}
```

#### @soundblue/icons

SVG icon components.

```typescript
import { PlayIcon, PauseIcon, VolumeIcon } from '@soundblue/icons';

<PlayIcon className="w-6 h-6" />
```

---

### Cross-Cutting Layer

#### @soundblue/i18n

Internationalization with locale detection.

```typescript
import { LocaleProvider, useLocale, getLocaleFromPath } from '@soundblue/i18n';

function App() {
  return (
    <LocaleProvider defaultLocale="en">
      <MyComponent />
    </LocaleProvider>
  );
}

function MyComponent() {
  const { locale, setLocale } = useLocale();
  return <p>Current: {locale}</p>;
}
```

#### @soundblue/seo

SEO utilities and structured data.

```typescript
import { StructuredData, createMeta } from '@soundblue/seo';

// In route loader
export function meta() {
  return createMeta({
    title: 'My Page',
    description: 'Page description',
    ogImage: '/og-image.png',
  });
}

// In component
<StructuredData
  type="WebSite"
  data={{ name: 'SoundBlue', url: 'https://soundbluemusic.com' }}
/>
```

#### @soundblue/pwa

PWA configuration and hooks.

```typescript
import { usePWA, pwaConfig } from '@soundblue/pwa';

function InstallButton() {
  const { canInstall, install, isInstalled } = usePWA();

  if (isInstalled) return <p>Already installed!</p>;
  if (!canInstall) return null;

  return <button onClick={install}>Install App</button>;
}
```

---

## SSG Hydration Workaround (자체 해결책)

> **React Router v7 + React 19 SSG 환경의 hydration 버그 해결책**
> **(공식 수정 미제공 - 자체 구현)**

### Problem (문제)

| 증상 | 원인 |
|------|------|
| SSG 빌드 후 버튼 클릭이 작동하지 않음 | Hydration 실패 시 React가 새 DOM을 생성하지만 기존 서버 HTML을 삭제하지 않아 DOM 중복 발생 |

### Solution (해결책)

모든 앱의 `entry.client.tsx`에 orphan DOM 제거 코드 추가:

```typescript
// apps/*/app/entry.client.tsx - DO NOT DELETE!
// React Router v7 SSG hydration bug workaround
// Related: https://github.com/remix-run/react-router/issues/12893
//          https://github.com/remix-run/react-router/issues/12360

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Workaround: Remove orphan DOM created by hydration failure
setTimeout(() => {
  const divs = [...document.body.children].filter(el => el.tagName === 'DIV');
  if (divs.length >= 2 && !Object.keys(divs[0]).some(k => k.startsWith('__react'))) {
    divs[0].remove();
  }
}, 100);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
```

### Files (파일 위치)

| App | Path |
|-----|------|
| Sound Blue | `apps/sound-blue/app/entry.client.tsx` |
| Tools | `apps/tools/app/entry.client.tsx` |
| Dialogue | `apps/dialogue/app/entry.client.tsx` |

### Warning (주의)

```
⚠️ 이 workaround는 공식 수정이 나올 때까지 삭제 금지!
⚠️ DO NOT DELETE until official fix is released!
```

---

## Language Tools Dictionary Policy (언어 도구 사전 정책)

> **This policy applies to ALL language-related packages in this monorepo.**
> **이 정책은 모노레포의 모든 언어 관련 패키지에 적용됩니다.**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║            삭제 금지, 추가만 허용, 문맥 기반 선택                                  ║
║            (Never Delete, Only Add, Context-Based Selection)                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 절대 금지 (NEVER):                                                        ║
║     • 기존 단어 매핑 삭제 (Deleting existing word mappings)                    ║
║     • 기존 의미 덮어쓰기 (Overwriting existing meanings)                       ║
║     • 테스트 통과를 위한 의미 변경 (Changing meanings for test passing)         ║
║                                                                              ║
║  🟢 허용 (ALLOWED):                                                          ║
║     • 동의어/대체 표현 추가 (Adding synonyms/alternatives)                     ║
║     • 문맥별 변형 추가 (Adding context-specific variants)                      ║
║     • 새로운 단어 쌍 추가 (Adding new word pairs)                              ║
║                                                                              ║
║  🔵 선택 로직 (Selection Logic):                                             ║
║     문맥 분석기가 문장 분위기, 주변 단어, 화자 유형을 고려하여 적절한 의미 선택      ║
║     Context analyzer selects appropriate meaning based on:                   ║
║     - Sentence tone/mood                                                     ║
║     - Surrounding words (collocations)                                       ║
║     - Speaker type (formal/casual)                                           ║
║                                                                              ║
║  ⚠️ 핵심 원칙: 도구 성능 우선, 테스트 통과 우선 아님                               ║
║     (Tool performance first, NOT test passing first)                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Affected Packages (적용 대상 패키지)

| Package | Description |
|---------|-------------|
| `@soundblue/translator` | Translation engine (번역 엔진) |
| `@soundblue/hangul` | Korean text processing (한글 처리) |
| `@soundblue/nlu` | Natural language understanding (자연어 이해) |
| `apps/tools/translator` | Translator app (번역기 앱) |
| Future language tools | 향후 추가될 모든 언어 도구 |

### Example (예시)

```typescript
// ❌ WRONG: Deleting/replacing existing mapping
// 기존 매핑 삭제/교체 (잘못됨)
대단하다: 'amazing'  // 'wonderful' 삭제됨

// ✅ CORRECT: Adding synonyms while keeping existing
// 기존 유지하면서 동의어 추가 (올바름)
대단하다: ['wonderful', 'amazing', 'remarkable', 'incredible']

// ✅ CORRECT: Context-based variants
// 문맥별 변형 (올바름)
대단하다: {
  default: 'wonderful',
  casual: 'amazing',
  formal: 'remarkable',
  exclamation: 'incredible'
}
```

---

## SSG Build Safety Checklist (SSG 빌드 안전 체크리스트)

Before deploying, verify:

- [ ] All `core/` packages have zero browser API imports
- [ ] All `platform/` packages have `.noop.ts` implementations
- [ ] `package.json` exports use `browser` + `default` conditions
- [ ] No `window`, `document`, `navigator` in non-platform code
- [ ] `react-router.config.ts` has `ssr: false` **(NEVER change to true!)**
- [ ] All routes are listed in `prerender()` **(NEVER remove this function!)**
- [ ] **NO SPA mode enabled** (prerender must exist and return routes)
- [ ] **NO SSR mode enabled** (ssr must be false)
- [ ] **NO API routes or server-side logic**

---

## External Dictionary Sync (외부 사전 동기화)

> **Build-time vocabulary synchronization from public-monorepo**
> **빌드 시 public-monorepo에서 어휘 자동 동기화**

The translator integrates an external vocabulary system that syncs from [public-monorepo](https://github.com/soundbluemusic/public-monorepo) at build time.

### Architecture (아키텍처)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Source: github.com/soundbluemusic/public-monorepo/data/context             │
│  ├── meta.json          → Dynamic file list (no hardcoding)                 │
│  ├── entries/*.json     → Word data (1,185+ ko→en, 1,177+ en→ko)           │
│  └── conversations.json → Dialogue examples (211+ sentence pairs)           │
└─────────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼ pnpm build:all (prebuild hook)
                          ▼ pnpm sync:context-dict (manual)
┌─────────────────────────────────────────────────────────────────────────────┐
│  Output: apps/tools/app/tools/translator/dictionary/external/               │
│  ├── words.ts           → Word dictionary (auto-generated)                  │
│  ├── sentences.ts       → Sentence dictionary (auto-generated)              │
│  └── index.ts           → Unified exports (auto-generated)                  │
└─────────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼ Translation Pipeline
┌─────────────────────────────────────────────────────────────────────────────┐
│  Priority:                                                                  │
│  1. Sentence Dict (exact match) → Return immediately                        │
│  2. Algorithm Translation (v2.1 pipeline)                                   │
│  3. Word Combination (external = lowest priority)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Files (주요 파일)

| File | Description | Auto-Generated |
|------|-------------|:--------------:|
| `scripts/sync-context-dictionary.ts` | Sync script (동기화 스크립트) | ❌ |
| `dictionary/external/words.ts` | Word dictionary (단어 사전) | ✅ |
| `dictionary/external/sentences.ts` | Sentence dictionary (문장 사전) | ✅ |
| `dictionary/external/index.ts` | Exports | ✅ |

### Commands (명령어)

```bash
# Manual sync (수동 동기화)
pnpm sync:context-dict

# Auto sync + build (자동 동기화 + 빌드)
pnpm build:all
```

### Design Principles (설계 원칙)

1. **Lowest Priority**: External dictionary never conflicts with manual dictionary
2. **Dynamic Loading**: Uses `meta.json` for file list (no hardcoding)
3. **Auto-Regeneration**: `external/` folder is auto-generated on every build
4. **Sentence Priority**: Exact sentence matches override algorithm translation

### Warning (주의)

```
⚠️ external/ 폴더의 파일은 자동 생성됩니다. 직접 수정하지 마세요!
⚠️ Files in external/ folder are auto-generated. DO NOT edit directly!
```

---

## Data/Logic Separation Architecture (데이터/로직 분리 아키텍처)

> **핵심 원칙: 로직은 soundblue-monorepo에, 순수 어휘 데이터는 Context 앱(public-monorepo)에**
> **Core Principle: Logic stays in soundblue-monorepo, Pure vocabulary data goes to Context app (public-monorepo)**

### Overview (개요)

번역기 및 언어 관련 도구는 **데이터(어휘)** 와 **로직(알고리즘)** 을 명확히 분리합니다.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    Data/Logic Separation Architecture                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────┐       ┌─────────────────────────────┐      ║
║  │  soundblue-monorepo (여기)   │       │  public-monorepo (Context)  │      ║
║  ├─────────────────────────────┤       ├─────────────────────────────┤      ║
║  │                             │       │                             │      ║
║  │  ✅ LOGIC (로직)             │       │  ✅ DATA (데이터)            │      ║
║  │  ─────────────────          │       │  ─────────────────          │      ║
║  │  • Architecture             │       │  • Word pairs (단어 쌍)     │      ║
║  │  • Algorithms               │       │  • Stems (어간)             │      ║
║  │  • Grammar patterns         │       │  • Idioms (관용어)          │      ║
║  │  • Translation pipeline     │       │  • Particles (조사)         │      ║
║  │  • Morpheme rules           │       │  • Endings (어미)           │      ║
║  │  • Code structure           │       │  • Domain terms (도메인)    │      ║
║  │  • Context analyzer         │       │  • Colors, Countries        │      ║
║  │  • Sentence parser          │       │  • Onomatopoeia             │      ║
║  │                             │       │                             │      ║
║  └─────────────────────────────┘       └─────────────────────────────┘      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Data Flow (데이터 흐름)

```
                    ┌─────────────────────────────────────────┐
                    │     public-monorepo/data/context/       │
                    │     (Context 앱 - 어휘 데이터 관리)        │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼ pnpm sync:context-dict
                                         │
┌────────────────────────────────────────┼────────────────────────────────────────┐
│                              soundblue-monorepo                                 │
│                                        │                                        │
│  ┌─────────────────────────────────────┼─────────────────────────────────────┐  │
│  │                                     ▼                                     │  │
│  │           data/dictionaries/*.json                                        │  │
│  │           (Single Source of Truth - 로컬 JSON)                            │  │
│  │                                                                           │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │  │
│  │  │ words/      │ │ idioms/     │ │ domains/    │ │ expressions/│         │  │
│  │  │ ko-to-en    │ │ idioms.json │ │ all-domains │ │ cultural    │         │  │
│  │  │ en-to-ko    │ │             │ │             │ │ phrasal-v   │         │  │
│  │  │ stems       │ │             │ │             │ │ onomatopoeia│         │  │
│  │  │ colors      │ │             │ │             │ │             │         │  │
│  │  │ countries   │ │             │ │             │ │             │         │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │  │
│  │                                     │                                     │  │
│  └─────────────────────────────────────┼─────────────────────────────────────┘  │
│                                        │                                        │
│                                        ▼ pnpm prebuild                          │
│                                        │                                        │
│  ┌─────────────────────────────────────┼─────────────────────────────────────┐  │
│  │                                     ▼                                     │  │
│  │           dictionary/generated/*.ts                                       │  │
│  │           (자동 생성 - JSON에서 TypeScript로 변환)                          │  │
│  │                                                                           │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │  │
│  │  │ ko-to-en.ts │ │ en-to-ko.ts │ │ stems.ts    │ │ idioms.ts   │         │  │
│  │  │ (1,616개)   │ │ (588개)     │ │ (955개)     │ │ (212개)     │         │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │  │
│  │                                     │                                     │  │
│  └─────────────────────────────────────┼─────────────────────────────────────┘  │
│                                        │                                        │
│                                        ▼ import                                 │
│                                        │                                        │
│  ┌─────────────────────────────────────┼─────────────────────────────────────┐  │
│  │                                     ▼                                     │  │
│  │           dictionary/*.ts                                                 │  │
│  │           (로직만 유지 - 데이터는 generated에서 import)                     │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  words.ts     │ stems.ts    │ idioms.ts    │ 기타 로직 파일들        │  │  │
│  │  │  (174줄)      │ (77줄)      │ (269줄)      │                        │  │  │
│  │  │               │             │              │                        │  │  │
│  │  │  • lookup()   │ • isVerb()  │ • match()    │ • 형태소 분석기        │  │  │
│  │  │  • merge()    │ • isAdj()   │ • lookup()   │ • 문장 파서           │  │  │
│  │  │  • context()  │ • reverse() │ • category() │ • 영어 생성기         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### File Structure (파일 구조)

```
soundblue-monorepo/
│
├── data/dictionaries/                    ← JSON 데이터 (Single Source of Truth)
│   ├── words/
│   │   ├── ko-to-en.json                # 한→영 단어 (1,616개)
│   │   ├── en-to-ko.json                # 영→한 단어 (588개)
│   │   ├── stems.json                   # 어간 (955개: 동사/형용사/명사)
│   │   ├── colors.json                  # 색상 (470개)
│   │   └── countries.json               # 국가명 (236개)
│   ├── idioms/
│   │   └── idioms.json                  # 관용어/숙어 (212개)
│   ├── domains/
│   │   └── all-domains.json             # 도메인별 어휘 (10,508개)
│   ├── expressions/
│   │   ├── compound-words.json          # 복합어 (218개)
│   │   ├── phrasal-verbs.json           # 구동사 (194개)
│   │   ├── onomatopoeia.json            # 의성어/의태어 (89개)
│   │   └── cultural.json                # 문화 표현 (86개)
│   ├── polysemy/
│   │   └── polysemy.json                # 다의어 (10개)
│   └── schemas/                         # JSON 스키마 (검증용)
│       ├── words.schema.json
│       ├── stems.schema.json
│       ├── idioms.schema.json
│       └── domains.schema.json
│
├── apps/tools/app/tools/translator/
│   └── dictionary/
│       ├── generated/                    ← 자동 생성 (pnpm prebuild)
│       │   ├── ko-to-en.ts              # JSON에서 생성
│       │   ├── en-to-ko.ts
│       │   ├── stems.ts
│       │   ├── idioms.ts
│       │   └── index.ts
│       │
│       ├── words.ts                      ← 로직만 (174줄, 데이터 제거됨)
│       ├── stems.ts                      ← 로직만 (77줄, 데이터 제거됨)
│       ├── idioms.ts                     ← 로직만 (269줄, 데이터 제거됨)
│       │
│       └── external/                     ← Context 앱에서 동기화
│           ├── words.ts                 # 외부 단어 사전
│           ├── sentences.ts             # 외부 문장 사전
│           └── index.ts
│
└── scripts/
    ├── prebuild.ts                       # JSON → TypeScript 생성
    └── sync-context-dictionary.ts        # Context 앱에서 어휘 동기화
```

### Separation Criteria Table (분리 기준표)

| soundblue-monorepo (여기) | public-monorepo (Context 앱) |
|---------------------------|------------------------------|
| Architecture (아키텍처) | Word pairs (단어 쌍) |
| Algorithms (알고리즘) | Stems (어간) |
| Grammar patterns (문법 패턴) | Idioms (관용어) |
| Translation pipeline (번역 파이프라인) | Particles (조사 목록) |
| Morpheme rules (형태소 규칙) | Endings (어미 목록) |
| Code structure (코드 설계) | Domain terms (도메인 어휘) |
| Context analyzer (문맥 분석기) | Colors (색상) |
| Sentence parser (문장 파서) | Countries (국가명) |
| English generator (영어 생성기) | Onomatopoeia (의성어/의태어) |

### Commands (명령어)

| Command | Description | Output |
|---------|-------------|--------|
| `pnpm prebuild` | JSON → TypeScript 생성 | `dictionary/generated/*.ts` |
| `pnpm sync:context-dict` | Context 앱에서 어휘 동기화 | `dictionary/external/*.ts` |
| `pnpm build:all` | prebuild + sync + 빌드 전체 | 모든 앱 빌드 |

### Rules (규칙)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ⚠️ 데이터/로직 분리 규칙 - 절대 준수 ⚠️                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 절대 금지 (NEVER):                                                        ║
║  • dictionary/*.ts 파일에 순수 어휘 데이터 직접 작성                             ║
║    (로직 파일에 단어 목록 하드코딩 금지)                                         ║
║  • generated/ 폴더 파일 직접 수정                                              ║
║    (자동 생성 파일 - prebuild가 덮어씀)                                        ║
║  • external/ 폴더 파일 직접 수정                                               ║
║    (Context 앱에서 동기화 - sync가 덮어씀)                                     ║
║  • 로직 파일에서 하드코딩된 단어 배열 유지                                        ║
║                                                                              ║
║  ✅ 필수 (REQUIRED):                                                         ║
║  • 새 어휘 추가 시 → data/dictionaries/*.json에 추가                           ║
║  • 로직 변경 시 → dictionary/*.ts 파일 수정                                    ║
║  • 빌드 전 → pnpm prebuild 실행하여 generated/ 갱신                            ║
║  • Context 앱 변경 시 → pnpm sync:context-dict 실행                           ║
║                                                                              ║
║  📍 Single Source of Truth:                                                  ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │  어휘 데이터: data/dictionaries/*.json                                │    ║
║  │  로직/알고리즘: dictionary/*.ts                                       │    ║
║  │  외부 데이터: dictionary/external/ (Context 앱에서 동기화)             │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Migration Summary (마이그레이션 요약)

| 파일 | Before (이전) | After (이후) | 변경 내용 |
|------|---------------|--------------|----------|
| words.ts | 2,654줄 | 174줄 | 순수 데이터 제거, generated import |
| stems.ts | 1,063줄 | 77줄 | VERB/ADJ/NOUN_STEMS 제거, generated import |
| idioms.ts | 856줄 | 269줄 | idioms 배열 제거, generated import |

---

## Changelog (변경 이력)

### v2.2.0 - Data/Logic Separation (2026-01)

**Breaking Changes:**
- Pure vocabulary data extracted from TypeScript to JSON
- Dictionary files now import from `generated/` folder
- `words.ts`, `stems.ts`, `idioms.ts` now contain logic only

**New Files:**
- `data/dictionaries/*.json` - Single Source of Truth for vocabulary
- `dictionary/generated/*.ts` - Auto-generated TypeScript from JSON
- `scripts/prebuild.ts` - JSON → TypeScript generation

**Migration:**
- words.ts: 2,654 → 174 lines (removed hardcoded word pairs)
- stems.ts: 1,063 → 77 lines (removed VERB/ADJ/NOUN_STEMS)
- idioms.ts: 856 → 269 lines (removed idioms array)

### v2.1.0 - External Dictionary (2025-01)

**New Features:**
- External dictionary sync from public-monorepo
- Sentence dictionary with exact match priority
- Prebuild hook for automatic sync (`pnpm build:all`)

### v2.0.0 - SSG Edition (2024-12)

**Breaking Changes:**
- Removed `@soundblue/shared-react` package (completely deleted)
- All browser APIs now behind dual implementation

**New Packages:**
- `@soundblue/storage` - IndexedDB & localStorage abstraction
- `@soundblue/worker` - Web Worker RPC
- `@soundblue/audio-engine` - Pure audio timing logic
- `@soundblue/ui-patterns` - Composite UI patterns
- `@soundblue/icons` - Icon components
- `@soundblue/i18n` - Internationalization
- `@soundblue/seo` - SEO utilities
- `@soundblue/pwa` - PWA configuration
- `@soundblue/config` - Shared configs

**Refactored Packages:**
- `@soundblue/web-audio` - Added dual implementation
- `@soundblue/ui-primitives` - Added Message type, cn utility
